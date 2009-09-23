
// http://www.w3.org/TR/cssom-view/#the-elementview

var ElementView = Interface.extend({
  "@!(element.getBoundingClientRect)": {
    getBoundingClientRect: function(element) {
      var document = element.ownerDocument;

      switch (element.nodeName) {
        case "HTML":
          var offset = _offsets.getViewport(document);
          break;
        case "BODY":
          offset = _offsets.getBodyClient(document);
          break;
        default:
          var left = element.offsetLeft,
              top = element.offsetTop,
              view = document.defaultView,
              documentElement = document.documentElement,
              computedStyle = view.getComputedStyle(element, null);
              offsetParent = element.offsetParent;

          while (offsetParent && (offsetParent != documentElement || computedStyle.position == "static")) {
            left += offsetParent.offsetLeft - offsetParent.scrollLeft;
            top += offsetParent.offsetTop - offsetParent.scrollTop;

            computedStyle = view.getComputedStyle(offsetParent, null);
            
            if (_FIX_BORDER.test(offsetParent.nodeName)) {
              if (offsetParent.clientLeft === undefined) {
                left += parseInt(computedStyle.borderLeftWidth);
                top  += parseInt(computedStyle.borderTopWidth);
              } else {
                left += offsetParent.clientTop;
                top  += offsetParent.clientLeft;
              }
            }
            offsetParent = offsetParent.offsetParent;
          }
          offset = {
            left: left,
            top: top
          };
      }

      return {
        top:    offset.top,
        right:  offset.left + element.clientWidth,
        bottom: offset.top + element.clientHeight,
        left:   offset.left
      };
    },

    "@Webkit5": {
      getBoundingClientRect: function(element) {
        // Tweak the above result for Safari 3.x if the document body is absolutely positioned.

        var clientRect = this.base(element);

        if (element.nodeName != "HTML") {
          var document = element.ownerDocument,
              offset = _offsets.getBodyOffset(document);
          if (!offset.isAbsolute) {
            offset = _offsets.getViewport(document)
          }
          clientRect.left += offset.left;
          clientRect.top += offset.top;
        }

        return clientRect;
      }
    },

    "@(document.getBoxObjectFor)": {
      getBoundingClientRect: function(element) {
        var document = element.ownerDocument,
            view = document.defaultView,
            documentElement = document.documentElement,
            box = document.getBoxObjectFor(element),
            computedStyle = view.getComputedStyle(element, null),
            left = box.x - parseInt(computedStyle.borderLeftWidth),
            top = box.y - parseInt(computedStyle.borderTopWidth),
            parentNode = element.parentNode;

        if (element != documentElement) {
          while (parentNode && parentNode != documentElement) {
            left -= parentNode.scrollLeft;
            top -= parentNode.scrollTop;
            computedStyle = view.getComputedStyle(parentNode, null);
            if (computedStyle.position != "absolute") {
              left += parseInt(computedStyle.borderTopWidth);
              top  += parseInt(computedStyle.borderLeftWidth);
            }
            parentNode = parentNode.parentNode;
          }

          if (computedStyle.position != "fixed") {
            left -= view.pageXOffset;
            top -= view.pageYOffset;
          }

          var bodyPosition = view.getComputedStyle(document.body, null).position;
          if (bodyPosition == "relative") {
            var offset = document.getBoxObjectFor(documentElement);
          } else if (bodyPosition == "static") {
            offset = _offsets.getGeckoRoot(document);
          }
          if (offset) {
            left += offset.x;
            top += offset.y;
          }
        }
        
        return {
          top: top,
          right: left + element.clientWidth,
          bottom: top + element.clientHeight,
          left: left
        };
      }
    }
  },

  "@(jscript)": {
    getBoundingClientRect: function(element) {
      // MSIE doesn't bother to calculate client rects for the documentElement.

      var clientRect = this.base(element);

      if (element.nodeName == "HTML") {
        var document = Traversal.getDocument(element),
            viewport = _offsets.getViewport(document),
            documentElement = document.documentElement,
            left = viewport.left - documentElement.scrollLeft,
            top = viewport.left - documentElement.scrollTop;
        clientRect = {
          top: top,
          right: left + clientRect.right - clientRect.left,
          bottom: top + clientRect.bottom - clientRect.top,
          left: left
        };
      }
      
      return clientRect;
    }
  },

  "@Gecko1\\.9([^\\.]|\\.0)": { // bug in Gecko1.9.0 only
    getBoundingClientRect: function(element) {
      var clientRect = this.base(element);

      if (element.nodeName != "HTML" && _offsets.getBodyClient(element.ownerDocument).position == "absolute") {
        var offset = _offsets.getGeckoRoot(document);
        return {
          top:    clientRect.top - offset.y,
          right:  clientRect.right - offset.x,
          bottom: clientRect.bottom - offset.y,
          left:   clientRect.left - offset.x
        };
      }

      return clientRect;
    }
  }
}, {
  getOffsetFromBody: function(element) {
    var left = 0,
        top = 0;

    if (element.nodeName != "BODY") {
      var document = Traversal.getOwnerDocument(element),
          view = document.defaultView,
          documentElement = document.documentElement,
          body = document.body,
          clientRect = this.getBoundingClientRect(element);
          
      left = clientRect.left + Math.max(documentElement.scrollLeft, body.scrollLeft);
      top = clientRect.top + Math.max(documentElement.scrollTop, body.scrollTop);

      var bodyOffset = _offsets.getBodyOffset(document);

      /*@if (@_jscript)
        if (_MSIE6 && body.currentStyle.position != "relative") {
          left -= documentElement.clientLeft;
          top -= documentElement.clientTop;
        }
        if (@_jscript_version == 5.7 || document.documentMode == 7) {
          var rect = documentElement.getBoundingClientRect();
          left -= rect.left;
          top -= rect.top;
        }
        if (_QUIRKS_MODE) {
          left -= body.clientLeft;
          top -= body.clientTop;
          bodyOffset.isAbsolute = false;
        }
      /*@end @*/

      if (bodyOffset.isAbsolute) {
        left -= bodyOffset.left;
        top -= bodyOffset.top;
      }
    }
    
    return {
      left: left,
      top: top
    };
  },

  "@!(element.getBoundingClientRect)": {
    "@Webkit5": {
      getOffsetFromBody: function(element) {
        // Tweak the above result for Safari 3.x if the document body is absolutely positioned.

        var elementOffset = this.base(element);

        if (element.nodeName != "HTML") {
          var document = element.ownerDocument,
              offset = _offsets.getBodyOffset(document);
          if (!offset.isAbsolute) {
            offset = _offsets.getViewport(document)
          }
          elementOffset.left -= offset.left;
          elementOffset.top -= offset.top;
        }

        return elementOffset;
      }
    }
  },

  "@Gecko1\\.([^9]|9(\\.0|[^\\.]))": {
    getOffsetFromBody: function(element) {
      var offset = this.base(element);

      // slightly different rules when the body is absolutley positioned
      if (!_offsets.getBodyClient(element.ownerDocument).isAbsolute) {
        var rootOffset = _offsets.getGeckoRoot(document);
        offset.left -= rootOffset.x;
        offset.top -= rootOffset.y;
      }

      return offset;
    }
  },

  // Manage offsetX/Y.
  
  getOffsetXY: function(element, clientX, clientY) { // slightly faster if clientLeft/Top are defined
    var clientRect = this.getBoundingClientRect(element);
    return {
      x: clientX - clientRect.left - element.clientLeft,
      y: clientY - clientRect.top - element.clientTop
    }
  },

  "@!(element.clientLeft)": {
    getOffsetXY: function(element, clientX, clientY) {
      var clientRect = this.getBoundingClientRect(element),
          computedStyle = element.ownerDocument.defaultView.getComputedStyle(element, null);
      return {
        x: clientX - clientRect.left - parseInt(computedStyle.borderLeftWidth),
        y: clientY - clientRect.top - parseInt(computedStyle.borderTopWidth)
      }
    }
  }
});
