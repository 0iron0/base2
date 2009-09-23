
_register("form", {
  noValidate: false,
  
  // events

  onsubmit: function(form, event) {
    if (!this.get(form, "noValidate") && !_validateForm(form)) {
      event.preventDefault();
    }
  },

  // methods

  checkValidity: function(form) {
    var isValid = true,
        elements = form.elements,
        element;
    for (var i = 0; element = form.elements[i]; i++) {
      var behavior = html5.getBehavior(element);
      if (behavior.get(element, "willValidate")) {
        isValid &= behavior.checkValidity(element);
      }
    }
    return !!isValid;
  },
  
  dispatchFormChange: function(form) {
    this.dispatchEvent(form, "formchange");
  },

  dispatchFormInput: function(form) {
    this.dispatchEvent(form, "forminput");
  }
});


function _validateForm(form) {
  var elements = form.elements, element;
  for (var i = 0; element = form.elements[i]; i++) {
    var behavior = html5.getBehavior(element);
    if (behavior && behavior.get(element, "willValidate")) {
      if (!_validate(behavior, element, true)) return false;
    }
  }
  return true;
};
