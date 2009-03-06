
function _layout(element) {
  this.layout(element);
};

NOT_SUPPORTED = function() {
  throw "Not supported.";
};

var _SUPPORTS_BORDER_BOX = detect("quirks") || !detect("MSIE[567]|Opera"),
    _SUPPORTS_WEB_FORMS2 = detect("(document.implementation.hasFeature('WebForms', '2.0'))");
    