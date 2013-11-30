﻿/*
 Copyright (c) 2003-2009, CKSource - Frederico Knabben. All rights reserved.
 For licensing, see LICENSE.html or http://ckeditor.com/license
 */

(function () {
    function a() {
        var k = this;
        try {
            var h = k.getSelection();
            if (!h)return;
            var i = h.getStartElement(), j = new CKEDITOR.dom.elementPath(i);
            if (!j.compare(k._.selectionPreviousPath)) {
                k._.selectionPreviousPath = j;
                k.fire('selectionChange', {selection:h, path:j, element:i});
            }
        } catch (l) {
        }
    }

    ;
    var b, c;

    function d() {
        c = true;
        if (b)return;
        e.call(this);
        b = CKEDITOR.tools.setTimeout(e, 200, this);
    }

    ;
    function e() {
        b = null;
        if (c) {
            CKEDITOR.tools.setTimeout(a, 0, this);
            c = false;
        }
    }

    ;
    var f = {exec:function (h) {
        switch (h.mode) {
            case 'wysiwyg':
                h.document.$.execCommand('SelectAll', false, null);
                break;
            case 'source':
        }
    }, canUndo:false};
    CKEDITOR.plugins.add('selection', {init:function (h) {
        h.on('contentDom', function () {
            var i = h.document;
            if (CKEDITOR.env.ie) {
                var j, k;
                i.on('focusin', function () {
                    if (j) {
                        try {
                            j.select();
                        } catch (n) {
                        }
                        j = null;
                    }
                });
                h.window.on('focus', function () {
                    k = true;
                    m();
                });
                h.document.on('beforedeactivate', function () {
                    k = false;
                    h.document.$.execCommand('Unselect');
                });
                i.on('mousedown', l);
                i.on('mouseup', function () {
                    k = true;
                    setTimeout(function () {
                        m(true);
                    }, 0);
                });
                i.on('keydown', l);
                i.on('keyup', function () {
                    k = true;
                    m();
                });
                i.on('selectionchange', m);
                function l() {
                    k = false;
                }

                ;
                function m(n) {
                    if (k) {
                        var o = h.document, p = o && o.$.selection;
                        if (n && p && p.type == 'None')if (!o.$.queryCommandEnabled('InsertImage')) {
                            CKEDITOR.tools.setTimeout(m, 50, this, true);
                            return;
                        }
                        j = p && p.createRange();
                        d.call(h);
                    }
                }

                ;
            } else {
                i.on('mouseup', d, h);
                i.on('keyup', d, h);
            }
        });
        h.addCommand('selectAll', f);
        h.ui.addButton('SelectAll', {label:h.lang.selectAll, command:'selectAll'});
        h.selectionChange = d;
    }});
    CKEDITOR.editor.prototype.getSelection = function () {
        return this.document && this.document.getSelection();
    };
    CKEDITOR.editor.prototype.forceNextSelectionCheck = function () {
        delete this._.selectionPreviousPath;
    };
    CKEDITOR.dom.document.prototype.getSelection = function () {
        var h = new CKEDITOR.dom.selection(this);
        return!h || h.isInvalid ? null : h;
    };
    CKEDITOR.SELECTION_NONE = 1;
    CKEDITOR.SELECTION_TEXT = 2;
    CKEDITOR.SELECTION_ELEMENT = 3;
    CKEDITOR.dom.selection = function (h) {
        var k = this;
        var i = h.getCustomData('cke_locked_selection');
        if (i)return i;
        k.document = h;
        k.isLocked = false;
        k._ = {cache:{}};
        if (CKEDITOR.env.ie) {
            var j = k.getNative().createRange();
            if (!j || j.item && j.item(0).ownerDocument != k.document.$ || j.parentElement && j.parentElement().ownerDocument != k.document.$)k.isInvalid = true;
        }
        return k;
    };
    var g = {img:1, hr:1, li:1, table:1, tr:1, td:1, embed:1, object:1, ol:1, ul:1, a:1, input:1, form:1, select:1, textarea:1, button:1, fieldset:1, th:1, thead:1, tfoot:1};
    CKEDITOR.dom.selection.prototype = {getNative:CKEDITOR.env.ie ? function () {
        return this._.cache.nativeSel || (this._.cache.nativeSel = this.document.$.selection);
    } : function () {
        return this._.cache.nativeSel || (this._.cache.nativeSel = this.document.getWindow().$.getSelection());
    }, getType:CKEDITOR.env.ie ? function () {
        var h = this._.cache;
        if (h.type)return h.type;
        var i = CKEDITOR.SELECTION_NONE;
        try {
            var j = this.getNative(), k = j.type;
            if (k == 'Text')i = CKEDITOR.SELECTION_TEXT;
            if (k == 'Control')i = CKEDITOR.SELECTION_ELEMENT;
            if (j.createRange().parentElement)i = CKEDITOR.SELECTION_TEXT;
        } catch (l) {
        }
        return h.type = i;
    } : function () {
        var h = this._.cache;
        if (h.type)return h.type;
        var i = CKEDITOR.SELECTION_TEXT, j = this.getNative();
        if (!j)i = CKEDITOR.SELECTION_NONE; else if (j.rangeCount == 1) {
            var k = j.getRangeAt(0), l = k.startContainer;
            if (l == k.endContainer && l.nodeType == 1 && k.endOffset - k.startOffset == 1 && g[l.childNodes[k.startOffset].nodeName.toLowerCase()])i = CKEDITOR.SELECTION_ELEMENT;
        }
        return h.type = i;
    }, getRanges:CKEDITOR.env.ie ? (function () {
        var h = function (i, j) {
            i = i.duplicate();
            i.collapse(j);
            var k = i.parentElement(), l = k.childNodes, m;
            for (var n = 0; n < l.length; n++) {
                var o = l[n];
                if (o.nodeType == 1) {
                    m = i.duplicate();
                    m.moveToElementText(o);
                    m.collapse();
                    var p = m.compareEndPoints('StartToStart', i);
                    if (p > 0)break; else if (p === 0)return{container:k, offset:n};
                    m = null;
                }
            }
            if (!m) {
                m = i.duplicate();
                m.moveToElementText(k);
                m.collapse(false);
            }
            m.setEndPoint('StartToStart', i);
            var q = m.text.replace(/(\r\n|\r)/g, '\n').length;
            while (q > 0)q -= l[--n].nodeValue.length;
            if (q === 0)return{container:k, offset:n}; else return{container:l[n], offset:-q};
        };
        return function () {
            var t = this;
            var i = t._.cache;
            if (i.ranges)return i.ranges;
            var j = t.getNative(), k = j && j.createRange(), l = t.getType(), m;
            if (!j)return[];
            if (l == CKEDITOR.SELECTION_TEXT) {
                m = new CKEDITOR.dom.range(t.document);
                var n = h(k, true);
                m.setStart(new CKEDITOR.dom.node(n.container), n.offset);
                n = h(k);
                m.setEnd(new CKEDITOR.dom.node(n.container), n.offset);
                return i.ranges = [m];
            } else if (l == CKEDITOR.SELECTION_ELEMENT) {
                var o = t._.cache.ranges = [];
                for (var p = 0; p < k.length; p++) {
                    var q = k.item(p), r = q.parentNode, s = 0;
                    m = new CKEDITOR.dom.range(t.document);
                    for (; s < r.childNodes.length && r.childNodes[s] != q; s++) {
                    }
                    m.setStart(new CKEDITOR.dom.node(r), s);
                    m.setEnd(new CKEDITOR.dom.node(r), s + 1);
                    o.push(m);
                }
                return o;
            }
            return i.ranges = [];
        };
    })() : function () {
        var h = this._.cache;
        if (h.ranges)return h.ranges;
        var i = [], j = this.getNative();
        if (!j)return[];
        for (var k = 0; k < j.rangeCount; k++) {
            var l = j.getRangeAt(k), m = new CKEDITOR.dom.range(this.document);
            m.setStart(new CKEDITOR.dom.node(l.startContainer), l.startOffset);
            m.setEnd(new CKEDITOR.dom.node(l.endContainer), l.endOffset);
            i.push(m);
        }
        return h.ranges = i;
    }, getStartElement:function () {
        var o = this;
        var h = o._.cache;
        if (h.startElement !== undefined)return h.startElement;
        var i, j = o.getNative();
        switch (o.getType()) {
            case CKEDITOR.SELECTION_ELEMENT:
                return o.getSelectedElement();
            case CKEDITOR.SELECTION_TEXT:
                var k = o.getRanges()[0];
                if (k)if (!k.collapsed) {
                    k.optimize();
                    for (; ;) {
                        var l = k.startContainer, m = k.startOffset;
                        if (m == (l.getChildCount ? l.getChildCount() : l.getLength()))k.setStartAfter(l); else break;
                    }
                    i = k.startContainer;
                    if (i.type != CKEDITOR.NODE_ELEMENT)return i.getParent();
                    i = i.getChild(k.startOffset);
                    if (!i || i.type != CKEDITOR.NODE_ELEMENT)return k.startContainer;
                    var n = i.getFirst();
                    while (n && n.type == CKEDITOR.NODE_ELEMENT) {
                        i = n;
                        n = n.getFirst();
                    }
                    return i;
                }
                if (CKEDITOR.env.ie) {
                    k = j.createRange();
                    k.collapse(true);
                    i = k.parentElement();
                } else {
                    i = j.anchorNode;
                    if (i && i.nodeType != 1)i = i.parentNode;
                }
        }
        return h.startElement = i ? new CKEDITOR.dom.element(i) : null;
    }, getSelectedElement:function () {
        var h = this._.cache;
        if (h.selectedElement !== undefined)return h.selectedElement;
        var i;
        if (this.getType() == CKEDITOR.SELECTION_ELEMENT) {
            var j = this.getNative();
            if (CKEDITOR.env.ie)try {
                i = j.createRange().item(0);
            } catch (l) {
            } else {
                var k = j.getRangeAt(0);
                i = k.startContainer.childNodes[k.startOffset];
            }
        }
        return h.selectedElement = i ? new CKEDITOR.dom.element(i) : null;
    }, lock:function () {
        var h = this;
        h.getRanges();
        h.getStartElement();
        h.getSelectedElement();
        h._.cache.nativeSel = {};
        h.isLocked = true;
        h.document.setCustomData('cke_locked_selection', h);
    }, unlock:function (h) {
        var m = this;
        var i = m.document, j = i.getCustomData('cke_locked_selection');
        if (j) {
            i.setCustomData('cke_locked_selection', null);
            if (h) {
                var k = j.getSelectedElement(), l = !k && j.getRanges();
                m.isLocked = false;
                m.reset();
                i.getBody().focus();
                if (k)m.selectElement(k); else m.selectRanges(l);
            }
        }
        if (!j || !h) {
            m.isLocked = false;
            m.reset();
        }
    }, reset:function () {
        this._.cache = {};
    }, selectElement:function (h) {
        var k = this;
        if (k.isLocked) {
            var i = new CKEDITOR.dom.range(k.document);
            i.setStartBefore(h);
            i.setEndAfter(h);
            k._.cache.selectedElement = h;
            k._.cache.startElement = h;
            k._.cache.ranges = [i];
            k._.cache.type = CKEDITOR.SELECTION_ELEMENT;
            return;
        }
        if (CKEDITOR.env.ie) {
            k.getNative().empty();
            try {
                i = k.document.$.body.createControlRange();
                i.addElement(h.$);
                i.select();
            } catch (l) {
                i = k.document.$.body.createTextRange();
                i.moveToElementText(h.$);
                i.select();
            }
            k.reset();
        } else {
            i = k.document.$.createRange();
            i.selectNode(h.$);
            var j = k.getNative();
            j.removeAllRanges();
            j.addRange(i);
            k.reset();
        }
    }, selectRanges:function (h) {
        var n = this;
        if (n.isLocked) {
            n._.cache.selectedElement = null;
            n._.cache.startElement = h[0].getTouchedStartNode();
            n._.cache.ranges = h;
            n._.cache.type = CKEDITOR.SELECTION_TEXT;
            return;
        }
        if (CKEDITOR.env.ie) {
            if (h[0])h[0].select();
            n.reset();
        } else {
            var i = n.getNative();
            i.removeAllRanges();
            for (var j = 0; j < h.length; j++) {
                var k = h[j], l = n.document.$.createRange(), m = k.startContainer;
                if (k.collapsed && CKEDITOR.env.gecko && CKEDITOR.env.version < 10900 && m.type == CKEDITOR.NODE_ELEMENT && !m.getChildCount())m.appendText('');
                l.setStart(m.$, k.startOffset);
                l.setEnd(k.endContainer.$, k.endOffset);
                i.addRange(l);
            }
            n.reset();
        }
    }, createBookmarks:function (h) {
        var i = [], j = this.getRanges(), k = j.length, l;
        for (var m = 0; m < k; m++) {
            i.push(l = j[m].createBookmark(h, true));
            h = l.serializable;
            var n = h ? this.document.getById(l.startNode) : l.startNode, o = h ? this.document.getById(l.endNode) : l.endNode;
            for (var p = m + 1; p < k; p++) {
                var q = j[p], r = q.startContainer, s = q.endContainer;
                r.equals(n.getParent()) && q.startOffset++;
                r.equals(o.getParent()) && q.startOffset++;
                s.equals(n.getParent()) && q.endOffset++;
                s.equals(o.getParent()) && q.endOffset++;
            }
        }
        return i;
    }, createBookmarks2:function (h) {
        var i = [], j = this.getRanges();
        for (var k = 0; k < j.length; k++)i.push(j[k].createBookmark2(h));
        return i;
    }, selectBookmarks:function (h) {
        var i = [];
        for (var j = 0; j < h.length; j++) {
            var k = new CKEDITOR.dom.range(this.document);
            k.moveToBookmark(h[j]);
            i.push(k);
        }
        this.selectRanges(i);
        return this;
    }};
})();
CKEDITOR.dom.range.prototype.select = CKEDITOR.env.ie ? function (a) {
    var j = this;
    var b = j.collapsed, c, d, e = j.createBookmark(), f = e.startNode, g;
    if (!b)g = e.endNode;
    var h = j.document.$.body.createTextRange();
    h.moveToElementText(f.$);
    h.moveStart('character', 1);
    if (g) {
        var i = j.document.$.body.createTextRange();
        i.moveToElementText(g.$);
        h.setEndPoint('EndToEnd', i);
        h.moveEnd('character', -1);
    } else {
        c = a || !f.hasPrevious() || f.getPrevious().is && f.getPrevious().is('br');
        d = j.document.createElement('span');
        d.setHtml('&#65279;');
        d.insertBefore(f);
        if (c)j.document.createText('﻿').insertBefore(f);
    }
    j.setStartBefore(f);
    f.remove();
    if (b) {
        if (c) {
            h.moveStart('character', -1);
            h.select();
            j.document.$.selection.clear();
        } else h.select();
        d.remove();
    } else {
        j.setEndBefore(g);
        g.remove();
        h.select();
    }
} : function () {
    var d = this;
    var a = d.startContainer;
    if (d.collapsed && a.type == CKEDITOR.NODE_ELEMENT && !a.getChildCount())a.append(new CKEDITOR.dom.text(''));
    var b = d.document.$.createRange();
    b.setStart(a.$, d.startOffset);
    try {
        b.setEnd(d.endContainer.$, d.endOffset);
    } catch (e) {
        if (e.toString().indexOf('NS_ERROR_ILLEGAL_VALUE') >= 0) {
            d.collapse(true);
            b.setEnd(d.endContainer.$, d.endOffset);
        } else throw e;
    }
    var c = d.document.getSelection().getNative();
    c.removeAllRanges();
    c.addRange(b);
};