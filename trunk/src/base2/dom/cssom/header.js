
// Quite a lot of browser sniffing here. It's not really possible to feature
// detect all of the various bugs. Newer browsers mostly get it right though.

var _TABLE_TH_TD  = /^(TABLE|TH|TD)$/,
    _QUIRKS_MODE  = detect("QuirksMode"),
    _MSIE6        = detect("MSIE6"),
    _FIX_BORDER   = detect("Webkit5") ? _TABLE_TH_TD :
                    detect("Opera8") ? {
                      test: function(nodeName) {
                        return !_TABLE_TH_TD.test(nodeName)
                      }
                    } : {
                      test: False
                    };
                  
var _offsets = new Base({
  getBodyClient: function(document) {
    var left = 0,
        top = 0,
        view = document.defaultView,
        body = document.body,
        bodyStyle = ViewCSS.getComputedStyle(view, body, null),
        position = bodyStyle.position,
        isAbsolute = position != "static";
        
    if (isAbsolute) {
      left += parseInt(bodyStyle.left) + parseInt(bodyStyle.marginLeft);
      top  += parseInt(bodyStyle.top) + parseInt(bodyStyle.marginTop);
      if (position == "relative") {
        var rootStyle = ViewCSS.getComputedStyle(view, document.documentElement, null);
        left += parseInt(rootStyle.paddingLeft) + parseInt(rootStyle.borderLeftWidth);
        top  += parseInt(rootStyle.paddingTop) + parseInt(rootStyle.borderTopWidth);
        // MSIE6 stores the margin but doesn't apply it.
        if (!_MSIE6) {
          left += parseInt(rootStyle.marginLeft);
          top += parseInt(rootStyle.marginTop);
        }
      }
    } else {
      var dummy = document.createElement("div");
      body.insertBefore(dummy, body.firstChild);
      left += dummy.offsetLeft - parseInt(bodyStyle.paddingLeft);
      top += dummy.offsetTop - parseInt(bodyStyle.paddingTop);
      body.removeChild(dummy);
    }

    return {
      position: position,
      isAbsolute: isAbsolute,
      left: left,
      top: top
    };
  },

  getBodyOffset: function(document) {
    var client = this.getBodyClient(document),
        view = document.defaultView,
        body = document.body;
    
    return {
      isAbsolute: client.isAbsolute,
      left: client.left + parseInt(ViewCSS.getComputedPropertyValue(view, body, "borderLeftWidth")),
      top: client.top + parseInt(ViewCSS.getComputedPropertyValue(view, body, "borderTopWidth"))
    };
  },

  getViewport: function(document) {
    var view = document.defaultView,
        documentElement = document.documentElement;
    return {
      left: parseInt(ViewCSS.getComputedPropertyValue(view, documentElement, "marginLeft")),
      top: parseInt(ViewCSS.getComputedPropertyValue(view, documentElement, "marginTop"))
    };
  },

  getGeckoRoot: function(document) {
    var rootStyle = document.defaultView.getComputedStyle(document.documentElement, null);
        
    return {
      x: parseInt(rootStyle.marginLeft) + parseInt(rootStyle.borderLeftWidth),
      y: parseInt(rootStyle.marginTop) + parseInt(rootStyle.borderTopWidth)
    };
  },

  "@MSIE.+QuirksMode": {
    getViewport: K({left: 0, top: 0})
  },

  "@(true)": {
    getBodyClient: _memoise(1),
    getBodyOffset: _memoise(2),
    getViewport: _memoise(3),
    getGeckoRoot: _memoise(4)
  }
});

function _memoise(type) {
  return function(document) {
    var key = type + (document.base2ID || assignID(document));
    if (!_memoise[key]) _memoise[key] = this.base(document);
    return _memoise[key];
  };
};
