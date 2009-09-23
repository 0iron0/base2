
// TO DO: localise error messages

var _customErrors = {};

var validation = {
  formNoValidate: false,

  get: function(element, propertyName) {
    if (propertyName == "willValidate") {
      return !!(element.name && element.form && !element.disabled);
    }
    return this.base(element, propertyName);
  },

  checkValidity: function(element) {
    var isValid = _validate(this, element, false);
    if (!isValid) this.dispatchEvent(element, "invalid");
    return isValid;
  },

  setCustomValidity: function(element, error) {
    _customErrors[element.uniqueID] = String(error);
  }
};

function _validate(behavior, element, showError) {
  if (!behavior.get(element, "formNoValidate")) {
    //==========================================================================
    // valueMissing
    //==========================================================================
    if (behavior.required !== undefined && behavior.get(element, "required")) {
      if (!_validateRequired(element, showError)) return false;
    }
    if (element.value) {
    //==========================================================================
    // typeMismatch
    //==========================================================================
      var type = Element.getAttribute(element, "type");
      if (type == "email") {
        if (!_validateEmail(element, showError)) return false;
      } else if (type == "url") {
        if (!_validateUrl(element, showError)) return false;
      } else if (type == "color") {
        if (!/^#[\da-f]{6}$/.test(element.value)) {
          if (showError) {
            _showErrorMessage(element, "Please select a valid color.");
          }
          return false;
        }
      } else if (_TYPE_NUMBER.test(type)) {
        if (!_validateNumeric(element, showError)) return false;
      }
    //==========================================================================
    // patternMismatch
    //==========================================================================
      if (behavior.pattern !== undefined) {
        var pattern = behavior.get(element, "pattern");
        if (pattern) {
          pattern = new RegExp("^(" + pattern + ")$");
          if (!pattern.test(element.value)) {
            if (showError) {
              _showErrorMessage(element, "The value entered does not match the specified pattern.");
            }
            return false;
          }
        }
      }
    //==========================================================================
    // tooLong
    //==========================================================================
      if (element.value.length > element.maxLength) {
        if (showError) {
          _showErrorMessage(element, "The value entered is too long.");
        }
        return false;
      }
    }
    //==========================================================================
    // customError
    //==========================================================================
    if (behavior.setCustomValidity != html5.NOT_SUPPORTED) {
      var errorMessage = _customErrors[element.uniqueID];
      if (errorMessage) {
        if (showError) {
          _showErrorMessage(element, errorMessage);
        }
        return false;
      }
    }
  }
  return true;
};

function _validateRequired(element, showError) {
  switch (Element.getAttribute(element, "type")) {
    case "checkbox":
      if (element.checked) return true;
      break;
    case "radio":
      if (element.checked) return true;
      if (element.name && element.form) {
        var radios = element.form.elements[element.name], radio;
        for (var i = 0; radio = radios[i]; i++) {
          if (radio.checked && radio.type == "radio") return true;
        }
      }
      break;
    default:
      if (element.value) return true;
  }
  if (showError) {
    _showErrorMessage(element, "This value is required.");
  }
  return false;
};

function _validateNumeric(element, showError) {
  var control = chrome.getBehavior(element),
      value = control.getValueAsNumber(element),
      errorMessage = "";
  //==========================================================================
  // typeMismatch
  //==========================================================================
  if (isNaN(value)) {
    errorMessage = "Please enter a valid " + control.type + ".";
    if (control.FORMAT) errorMessage += "<br>Format: " + control.FORMAT;
  } else {
    var properties = control.getProperties(element),
        min = properties.min,
        max = properties.max,
        baseValue = min || control.baseValue;
  //==========================================================================
  // rangeUnderflow/rangeOverflow
  //==========================================================================
    if ((value < min && !isNaN(max)) || (value > max && !isNaN(min))) {
      errorMessage = "Please enter a value between " + control.convertNumberToValue(min) +
        " and " + control.convertNumberToValue(max) + ".";
    } else if (value < min) {
      errorMessage = "Please enter a value starting from " + control.convertNumberToValue(min) + ".";
    } else if (value > max) {
      errorMessage = "Please enter a value up to " + control.convertNumberToValue(max) + ".";
  //==========================================================================
  // stepMismatch
  //==========================================================================
    } else if ((value - baseValue) % properties.scale != 0) {
      errorMessage = "Please enter a value in steps of " + properties.step;
      errorMessage += " starting from " + control.convertNumberToValue(baseValue);
      errorMessage += ".";
    }
  }
  if (showError && errorMessage) {
    _showErrorMessage(element, errorMessage);
    return false;
  }
  return !errorMessage;
};

function _showErrorMessage(element, errorMessage) {
  try {
    element.focus();
    if (element.select) element.select();
    control.showToolTip(element, errorMessage, 10);
  } catch (x) {
    // the control is probably hidden
  }
};

var _validateEmail = True, // do these later
    _validateUrl   = True;
