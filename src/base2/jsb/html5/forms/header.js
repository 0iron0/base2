
var noValidation = {
  formNoValidate: false,
  
  get: function(element, propertyName) {
    if (propertyName == "willValidate") return false;
    return this.base(element, propertyName);
  },

  checkValidity: True,
  setCustomValidity: html5.NOT_SUPPORTED
};

var _TYPE_DATE   = /^(date|month|time|week)$/,
    _TYPE_NUMBER = /^(number|range|date|month|time|week)$/;

var _register = detect("(hasFeature('WebForms','2.0'))") ? Undefined : function(tagName, _interface, ancestor) {
  html5[tagName] = (ancestor || behavior).extend(_interface);
};

function _getChromeValue(element, TYPE, defaultValue) {
  var type = Element.get(element, "type");
  if (TYPE.test(type)) {
    var control = chrome.getBehavior(element);
    if (control) {
      if (TYPE == _TYPE_DATE) {
        return control.getValueAsDate(element, true);
      } else {
        return control.getValueAsNumber(element, true);
      }
    }
  }
  return defaultValue;
};
