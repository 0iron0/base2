
// http://www.w3.org/TR/cssom-view/#the-elementview

var _ABSOLUTE   = /absolute|fixed|relative/,
    _FIX_BORDER = detect("KHTML") ? /^(TABLE|TD|TH)$/ : {test:False};

var ElementView = Interface.extend({
  getBoundingClientRect: function(element) {
    return element.getBoundingClientRect();
  },

  "@!(element.getBoundingClientRect)": {
    getBoundingClientRect: function(element) {
      var document = element.ownerDocument,
          view = document.defaultView;

      switch (element.nodeName) {
        case "HTML":
          var offset = _offsets.getViewport(document);
          break;
        case "BODY":
          offset = _offsets.getBody(document);
          break;
        default:
          offset = this.getOffsetFromBody(element);
          if (_ABSOLUTE.test(view.getComputedStyle(document.body, null).position)) {
            var bodyOffset = _offsets.getBody(document);
            offset.left += bodyOffset.left;
            offset.top += bodyOffset.top;
          }
      }

      offset.left -= view.pageXOffset;
      offset.top -= view.pageYOffset;

      return {
        left:   offset.left,
        top:    offset.top,
        right:  offset.left + element.clientWidth,
        bottom: offset.top + element.clientHeight
      };
    },
    
    "@(document.getBoxObjectFor)": {
      getBoundingClientRect: function(element) {
        var document = element.ownerDocument,
            view = document.defaultView,
            box = document.getBoxObjectFor(element),
            computedStyle = view.getComputedStyle(element, null),
            left = box.x - parseInt(computedStyle.borderLeftWidth) - view.pageXOffset,
            top = box.y - parseInt(computedStyle.borderTopWidth) - view.pageYOffset;
            
        if (element.nodeName != "HTML") {
          var rootStyle = view.getComputedStyle(document.documentElement, null);
          left += parseInt(rootStyle.marginLeft);
          top += parseInt(rootStyle.marginTop);
        }
        
        return {
          left: left,
          top: top,
          right: left + element.clientWidth,
          bottom: top + element.clientHeight
        };
      }
    }
  },

  "@MSIE": {
    getBoundingClientRect: function(element) {
      var clientRect = element.getBoundingClientRect(),
          document = element.document;

      if (element.nodeName == "HTML") {
        var viewportOffset = _offsets.getViewport(document),
            root = document.documentElement,
            left = viewportOffset.left - root.scrollLeft,
            top = viewportOffset.left - root.scrollTop;
        return {
          left: left,
          top: top,
          right: left + clientRect.right - clientRect.left,
          bottom: top + clientRect.bottom - clientRect.top
        };
      } else {
        adjust = document.documentMode > 7 ? 0 : -2;
        return {
          left: clientRect.left + adjust,
          top: clientRect.top + adjust,
          right: clientRect.right + adjust,
          bottom: clientRect.bottom + adjust
        };
      }
    }
  }
}, {
  getOffsetFromBody: function(element) {
    var left = 0, top = 0,
        document = Traversal.getOwnerDocument(element),
        view = document.defaultView;
        root = document.documentElement,
        body = document.body;
        
    if (element != body) {
      var clientRect = this.getBoundingClientRect(element);
      left = clientRect.left;
      top = clientRect.top;
      if (_ABSOLUTE.test(ViewCSS.getComputedPropertyValue(view, element, "position"))) {
        var offset = this.getBoundingClientRect(body);
        left -= offset.left;
        top -= offset.top;
      } else {
        left += view ? view.pageXOffset : root.scrollLeft;
        top += view ? view.pageYOffset : root.scrollTop;
      }
    }
    
    return {
      left: left,
      top: top
    };
  },

  "@!(element.getBoundingClientRect||document.getBoxObjectFor)": {
    getOffsetFromBody: function(element) {
      var left = 0, top = 0,
          body = element.ownerDocument.body;

      while (element && element != body) {
        left += element.offsetLeft;
        top += element.offsetTop;
        if (_FIX_BORDER.test(element.nodeName)) {
  				top  += (element.clientLeft || 0);
  				left += (element.clientTop || 0);
        }
        element = element.offsetParent;
      }
      
      return {
        left: left,
        top: top
      };
    },

    "@Webkit": {
      getOffsetFromBody: function(element) {
        var offset = this.base(element),
            document = element.ownerDocument,
            view = document.defaultView,
            body = document.body,
            position = view.getComputedStyle(element, null).position;
            
        if (position == "fixed") {
          var bodyOffset = _offsets.getBody(document);
          offset.left -= bodyOffset.left;
          offset.top  -= bodyOffset.top;
        } else if ((position != "absolute" || element.offsetParent != body) && !_ABSOLUTE.test(view.getComputedStyle(body, null).position)) {
          var viewportOffset = _offsets.getViewport(document);
          offset.left += viewportOffset.left;
          offset.top  += viewportOffset.top;
        }
        
        return offset;
      }
    },

    "@Opera": {
      getOffsetFromBody: function(element) {
        var offset = this.base(element),
            document = element.ownerDocument,
            view = document.defaultView,
            body = document.body;
            
        if (_ABSOLUTE.test(view.getComputedStyle(body, null).position)) {
          var bodyOffset = _offsets.getBody(document);
          offset.left -= bodyOffset.left;
          offset.top  -= bodyOffset.top;
        }
        
        return offset;
      }
    }
  },

  "@Gecko1\\.([^9]|9.0)": {
    getOffsetFromBody: function(element) {
      var offset = this.base(element),
          document = element.ownerDocument,
          view = document.defaultView;
          
      if (!_ABSOLUTE.test(view.getComputedStyle(document.body, null).position)) {
        var rootStyle = view.getComputedStyle(document.documentElement, null);
        offset.left -= parseInt(rootStyle.marginLeft);
        offset.top -= parseInt(rootStyle.marginTop);
      }
      
      return offset;
    }
  },
  
  // Manage offsetX/Y.

  getOffsetXY: function(element, clientX, clientY) {
    if (element.clientLeft == null) {
      var computedStyle = element.ownerDocument.defaultView.getComputedStyle(element, null);
      clientX -= parseInt(computedStyle.borderLeftWidth);
      clientY -= parseInt(computedStyle.borderTopWidth);
    } else {
      clientX -= element.clientLeft;
      clientY -= element.clientTop;
    }
    var clientRect = this.getBoundingClientRect(element);
    return {
      x: clientX - clientRect.left,
      y: clientY - clientRect.top
    }
  },

  "@(element.getBoundingClientRect&&element.clientLeft===0)": { // slightly faster if these properties are defined
    getOffsetXY: function(element, clientX, clientY) {
      var clientRect = element.getBoundingClientRect();
      return {
        x: clientX - clientRect.left - element.clientLeft,
        y: clientY - clientRect.top - element.clientTop
      }
    }
  }
});


var _offsets = new Base({
  getBody: function(document) {
    var left = 0, top = 0,
        view = document.defaultView,
        body = document.body,
        bodyStyle = view.getComputedStyle(body, null);
        
    if (_ABSOLUTE.test(bodyStyle.position)) {
      left += parseInt(bodyStyle.left) + parseInt(bodyStyle.marginLeft);
      top  += parseInt(bodyStyle.top) + parseInt(bodyStyle.marginTop);
      if (bodyStyle.position == "relative") {
        var rootStyle = view.getComputedStyle(document.documentElement, null);
        left += parseInt(rootStyle.paddingLeft) + parseInt(rootStyle.marginLeft);
        top  += parseInt(rootStyle.paddingTop) + parseInt(rootStyle.marginTop);
      }
    } else {
      var dummy = document.createElement("div");
      body.insertBefore(dummy, body.firstChild);
      left += dummy.offsetLeft - parseInt(bodyStyle.paddingLeft);
      top += dummy.offsetTop - parseInt(bodyStyle.paddingTop);
      body.removeChild(dummy);
    }
    
    return {
      left: left,
      top: top
    };
  },

  "@Webkit": {
    getBody: function(document) {
      var offset = this.base(document),
          view = document.defaultView,
          body = document.body;
          
      if (!_ABSOLUTE.test(view.getComputedStyle(body, null).position)) {
        var viewportOffset = this.getViewport(document);
        offset.left += viewportOffset.left;
        offset.top  += viewportOffset.top;
      }
      return offset;
    }
  },

  getViewport: function(document) {
    var view = document.defaultView,
        element = document.documentElement;
    return {
      left: parseInt(ViewCSS.getComputedPropertyValue(view, element, "margin-left")) || 0,
      top: parseInt(ViewCSS.getComputedPropertyValue(view, element, "margin-top")) || 0
    };
  },

  "@MSIE[56]": {
    getViewport: K({left: 0, top: 0})
  },

  "@(true)": {
    getBody: _memoise("body"),
    getViewport: _memoise("viewport")
  }
});

function _memoise(type) {
  return function(document) {
    var key = type + (document.base2ID || assignID(document));
    if (!_memoise[key]) _memoise[key] = this.base(document);
    return copy(_memoise[key]);
  };
};
