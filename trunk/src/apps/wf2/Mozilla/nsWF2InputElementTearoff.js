
Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");

const nsIDOMWF2Inner               = Components.interfaces.nsIDOMWF2Inner;
const nsIDOMWF2InputElementTearoff = Components.interfaces.nsIDOMWF2InputElementTearoff;

const ESCAPE_CHARS     = /\//g;
const SPACE_SEPARATED  = /[^\S]+/;
const BUTTON_TYPE      = /^(button|image|reset|submit)$/;
const DATE_TYPE        = /^(date|datetime|datetime\-local|month|time|week)$/;
const NUMBER_TYPE      = /^(date|datetime|datetime\-local|month|number|range|time|week)$/;
const TEXT_TYPE        = /^(text|password|email|url)$/;
const VALID_TYPE       = /^(button|checkbox|date|datetime|datetime\-local|email|file|hidden|image|month|number|password|radio|range|reset|submit|text|time|url|week)$/;
const VALID_EMAIL      = /^("[^"]*"|[^\s\.]\S*[^\s\.])@[^\s\.]+(\.[^\s\.]+)*$/; // Change this later.
const VALID_URL        = /^[a-zA-Z][a-zA-Z0-9+-.]*:[^\s]+$/;                    // And this.
const VALID_LIST       = /^(DATALIST|SELECT)$/;

const WF2DefaultValues = {
  "max":  {
    "file"           :  "1",
    "range"          :  "100"
  },
  
  "min": {
    "file"           :  "0",
    "range"          :  "0"
  },
  
  "step": {
    "date"           :  "1",
    "datetime"       :  "60",
    "datetime-local" :  "60",
    "month"          :  "1",
    "number"         :  "1",
    "range"          :  "1",
    "time"           :  "60",
    "week"           :  "1"
  }
};


// ==========================================================================
// WF2FormControl
// ==========================================================================


function WF2FormControl() {
  //
}; 

WF2FormControl.prototype = {

  /* public properties */
  
  // http://www.whatwg.org/specs/web-forms/current-work/#form
  get form() {
    return this.forms[0] || null;
  },
  
  // http://www.whatwg.org/specs/web-forms/current-work/#forms
  get forms(index) {
    if (this.outerElement.hasAttribute("form")) {
      var forms = [], i = 0; // create a NodeList (how?)
      var document = this.outerElement.ownerDocument;
      var formIds = this.outerElement.getAttribute("form");
      for each (var id in formIds.match(SPACE_SEPARATED)) {
        var element = document.getElementById(id);
        if (element && element.localName == "FORM") {
          forms[i++] = element;
        }
      }
    } else {
      forms = this._getAncestorsByTagName("FORM");
    }
    return (arguments.length == 0) ? forms : forms[index];
  },
  
  // http://www.whatwg.org/specs/web-forms/current-work/#labels
  get labels(index) {
    var labels = [], i = 0;
    if (element.hasAttribute("id")) {
      var allLabels = element.ownerDocument.getElementsByTagName("LABEL");
      for each (var label in allLabels) {
        if (label && label.control == this.outerElement) {
          labels[i++] = label;
        }
      }
    }
    return (arguments.length == 0) ? labels : labels[index];
  },
  
  // http://www.whatwg.org/specs/web-forms/current-work/#vailidtystate
  get validity() {
    if (!this._validity) {
      this._validity = new WF2ValidityState(this);
    }
    return this._validity;
  },
  
  // http://www.whatwg.org/specs/web-forms/current-work/#validationmessage
  get validationMessage() {
    if (this._isButton) {
      return "";
    }
    if (this._valueMissing) {
      return "valueMissing";
    }
    if (this._tooLong) {
      return "tooLong";
    }
    if (this._typeMismatch) {
      return "typeMismatch";
    }
    if (this._rangeUnderflow) {
      return "rangeUnderflow";
    }
    if (this._rangeOverflow) {
      return "rangeOverflow";
    }
    if (this._stepMismatch) {
      return "stepMismatch";
    }
    if (this._patternMismatch) {
      return "patternMismatch";
    }
    if (this._customError) {
      return this._customError;
    }
    return "";
  },

  get willValidate() {
    return false;
  },

  /* public methods */

  checkValidity: function() {
    return true;
  },

  // http://www.whatwg.org/specs/web-forms/current-work/#setcustomvalidity
  setCustomValidity: function(error) {
    this._customError = (error == null) ? "" : String(error);
  },

  /* private properties */

  // http://www.whatwg.org/specs/web-forms/current-work/#customerror
  _customError: "",

  get _isSuccessful() {
    return false;
  },

  get _isValid() {
    return !(
      this._customError ||
      this._valueMissing ||
      this._tooLong ||
      this._typeMismatch ||
      this._rangeUnderflow ||
      this._rangeOverflow ||
      this._stepMismatch ||
      this._patternMismatch
    );
  },
  
  get _patternMismatch()  { return false; },
  get _rangeOverflow()    { return false; },
  get _rangeUnderflow()   { return false; },
  get _stepMismatch()     { return false; },
  get _tooLong()          { return false; },
  get _typeMismatch()     { return false; },
  get _valueMissing()     { return false; },

  /* private methods */
  
  _dispatchEvent: function(type) {
    var event = this.outerElement.ownerDocument.createEvent("Events");
    event.initEvent(type, false, false);
    return this.outerElement.dispatchEvent(event);
  },

  _getAncestorsByTagName: function(tagName) {
    var ancestors = [], i = 0;
    var element = this.outerElement;
    while (element = element.parentNode) {
      if (element.localName == tagName) {
        ancestors[i++] = element;
      }
    }
    return ancestors;
  }
};


// ==========================================================================
// WF2InputElement
// ==========================================================================


function WF2InputElementInner() {
  //
};

WF2InputElementInner.prototype = extend(new WF2FormControl, {

  classID: Components.ID("{692657e4-a8c0-41ce-bd87-75deed9d91bd}"),
  contractID: "@mozilla.org/wf2/input-element-tearoff;1",
  classDescription: "WF2 Input Element Tearoff",

  init: function(outer) {
    this.outerElement = outer;
  },

  /* public properties */

//get autocomplete()      { return false; },
//set autocomplete()      { return false; },

//get htmlTemplate()      { return null; }, // repetition model (phase 2)

  // Do these later.
  get action()            { return ""; },
  set action(val)         { return ""; },
  get enctype()           { return ""; },
  set enctype(val)        { return ""; },
  get inputmode()         { return ""; },
  set inputmode(val)      { return ""; },
  get method()            { return ""; },
  set method(val)         { return ""; },
  get replace()           { return ""; },
  set replace(val)        { return ""; },
  get target()            { return ""; },
  set target(val)         { return ""; },

  // http://www.whatwg.org/specs/web-forms/current-work/#autofocus
  get autofocus() {
    return this.outerElement.hasAttribute("autofocus");
  },
  set autofocus(val) {
    if (val) {
      this.outerElement.setAttribute("autofocus", "");
    } else {
      this.outerElement.removeAttribute("autofocus");
    }
    return val;
  },

  // http://www.whatwg.org/specs/web-forms/current-work/#list
  get list() {
    if (this.outerElement.hasAttribute("list")) {
      var listId = this.outerElement.getAttribute("list");
      var list = this.outerElement.ownerDocument.getElementById(listId);
      if (list && VALID_LIST.test(list.localName)) {
        return list;
      }
    }
    return null;
  },

  // http://www.whatwg.org/specs/web-forms/current-work/#max
  get max() {
    if (this.outerElement.hasAttribute("max")) {
      var max = this.outerElement.getAttribute("max");
      return max; // TO DO: validate max value
    }
    return WF2DefaultValues["max"][this.type] || "";
  },
  set max(val) {
    this.outerElement.setAttribute("max", val);
    return val;
  },
  
  // http://www.whatwg.org/specs/web-forms/current-work/#min
  get min() {
    if (this.outerElement.hasAttribute("min")) {
      var min = this.outerElement.getAttribute("min");
      return min; // TO DO: validate min value
    }
    return WF2DefaultValues["min"][this.type] || "";
  },
  set min(val) {
    this.outerElement.setAttribute("min", val);
    return val;
  },

  // http://www.whatwg.org/specs/web-forms/current-work/#pattern
  get pattern() {
    if (this.outerElement.hasAttribute("pattern")) {
      return this.outerElement.getAttribute("pattern");
    }
    return "";
  },
  set pattern(val) {
    this.outerElement.setAttribute("pattern", val);
    return val;
  },

  // http://www.whatwg.org/specs/web-forms/current-work/#required
  get required() {
    return this.outerElement.hasAttribute("required");
  },
  set required(val) {
    if (val) {
      this.outerElement.setAttribute("required", "");
    } else {
      this.outerElement.removeAttribute("required");
    }
    return val;
  },

  // http://www.whatwg.org/specs/web-forms/current-work/#selectedoption
  get selectedOptions() {
    return null;
  },
  
  // http://www.whatwg.org/specs/web-forms/current-work/#step
  get step() {
    if (this.outerElement.hasAttribute("step")) {
      var step = this.outerElement.getAttribute("step");
      return step; // TO DO: validate step value
    }
    return WF2DefaultValues["step"][this.type] || "";
  },
  set step(val) {
    this.outerElement.setAttribute("step", val);
    return val;
  },
  
  get type() {
    if (this.outerElement.hasAttribute("type")) {
      var type = this.outerElement.getAttribute("type");
      if (VALID_TYPE.test(type)) {
        return type;
      }
    }
    return "text";
  },
  
  // http://www.whatwg.org/specs/web-forms/current-work/#valueasdate
  get valueAsDate() {
    switch (this.type) {
      case "date":
      case "datetime":
      case "time":
      case "week":
      case "month":
        break;
    }
    return Date(NaN);
  },
  set valueAsDate(val) {
    switch (this.type) {
      case "date":
      case "datetime":
      case "time":
      case "week":
      case "month":
        break;
    }
    return val;
  },

  // http://www.whatwg.org/specs/web-forms/current-work/#valueasnumber
  get valueAsNumber() {
    if (this._isTypeDate) {
      return this.valueAsDate.valueOf();
    }
    return Number(this.outerElement.value);
  },
  set valueAsNumber(val) {
    if (this._isTypeDate) {
      this.valueAsDate = Date(Number(val));
    } else {
      this.outerElement.value = val;
    }
    return val;
  },

  // http://www.whatwg.org/specs/web-forms/current-work/#willvalidate
  get willValidate() {
    if (this.type != "hidden"
    &&  this.type != "button"
    &&  this.type != "reset"
    &&  this.outerElement.name
    &&  this.form
    && !this._isDisabled
    && !this.outerElement.readOnly
    && !this._getAncestorsByTagName("DATALIST").length)) {
      return true;
    }
    return false;
  },

  /* public methods */

  //http://www.whatwg.org/specs/web-forms/current-work/#checkvalidity
  checkValidity: function() {
    if (this._isButton || this._isValid) {
      return true;
    }
    this._dispatchEvent("invalid");
    return false;
  },

  // http://www.whatwg.org/specs/web-forms/current-work/#dispatchchange
  dispatchChange: function() {
    this._dispatchEvent("change");
  },

  // http://www.whatwg.org/specs/web-forms/current-work/#dispatchformchange
  dispatchFormChange: function() {
    this._dispatchEvent("formchange");
  },

  // http://www.whatwg.org/specs/web-forms/current-work/#setcustomvalidity
  setCustomValidity: function(error) {
    if (this._isButton) {
      throw new SyntaxError("Not supported.");
    }
    this._customError = (error == null) ? "" : String(error);
  },

  // http://www.whatwg.org/specs/web-forms/current-work/#stepdown
  stepDown: function(n) {
  },

  // http://www.whatwg.org/specs/web-forms/current-work/#stepup
  setUp: function(n) {
  },

  /* private properties */
  
  // http://www.whatwg.org/specs/web-forms/current-work/#disabled
  get _isDisabled() {
    if (this.outerElement.disabled) {
      return true;
    }
    var fieldsets = this._getAncestorsByTagName("FIELDSET");
    for (var fieldset in fieldsets) {
      if (fieldset.disabled) {
        return true;
      }
    }
    return false;
  },
  
  // http://www.whatwg.org/specs/web-forms/current-work/#successful
  get _isSuccessful() {
    if (!this.outerElement.name || this._isDisabled) {
      return false;
    }
    
    switch (this.type) {
      case "button":
      case "reset":
        return false;
        
      case "radio":
      case "checkbox":
        return this.outerElement.checked;
        
      case "image":
      case "submit":
        return this.outerElement == this.outerElement.ownerDocument.activeElement;
        
      default:
        return true;
    }
  },
  
  // http://www.whatwg.org/specs/web-forms/current-work/#no-value
  get _noValueSelected() {
    switch (this.type) {
    
      case "button":
      case "reset":
        return false;
        
      case "checkbox":
      case "radio":
        var checked = this.outerElement.checked;
        if (!checked && element.name) {
          var form = this.form;
          if (form) {
            var controls = form.elements[this.outerElement.name];
            for each (var control in controls) {
              checked = control.checked && control.type == this.type;
              if (checked) break;
            }
          }
        }
        return !checked;
        
      default:
        return !this.outerElement.value;
    }
  },

  get _isTypeButton() {
    return BUTTON_TYPE.test(this.type);
  },

  get _isTypeDate() {
    return DATE_TYPE.test(this.type);
  },

  get _isTypeNumber() {
    return NUMBER_TYPE.test(this.type);
  },

  get _isTypeText() {
    return TEXT_TYPE.test(this.type);
  },

  get _maxAsNumber() {
    return Number(this.max);
  },

  get _minAsNumber() {
    return Number(this.min);
  },

  get _pattern() {
    var pattern = this.outerElement.getAttribute("pattern");
    return new RegExp("^(?:" + pattern.replace(ESCAPE_CHARS, "\\/") + ")$");
  },

  // http://www.whatwg.org/specs/web-forms/current-work/#patternmismatch
  get _patternMismatch() {
    if (this.outerElement.hasAttribute("pattern")
    &&  this._isTypeText
    && !this._noValueSelected
    && (this.type != "email" || PATTERN_EMAIL.test(this.outerElement.value))
    && (this.type != "url" || PATTERN_URL.test(this.outerElement.value))
    && !this._pattern.test(this.outerElement.value)) {
      return true;
    }
    return false;
  },

  // http://www.whatwg.org/specs/web-forms/current-work/#rangeoverflow
  get _rangeOverflow() {
    if (this.outerElement.hasAttribute("max")
    &&  this._isTypeNumber
    && !this._noValueSelected
    && !this._typeMismatch
    &&  this.valueAsNumber > this._maxAsNumber) {
      return true;
    }
    return false;
  },

  // http://www.whatwg.org/specs/web-forms/current-work/#rangeunderflow
  get _rangeUnderflow() {
    if (this.outerElement.hasAttribute("min")
    &&  this._isTypeNumber
    && !this._noValueSelected
    && !this._typeMismatch
    &&  this.valueAsNumber < this._minAsNumber) {
      return true;
    }
    return false;
  },

  get _stepAsNumber() {
    return Number(this.step);
  },

  // http://www.whatwg.org/specs/web-forms/current-work/#stepmismatch
  get _stepMismatch() {
    if (this.outerElement.hasAttribute("step"))
    &&  this.step != "any")
    &&  this._isTypeNumber)
    && !this._noValueSelected) {
    && !this._typeMismatch)
    && this.valueAsNumber % this._stepAsNumber != 0) {
      return true;
    }
    return false;
  },

  // http://www.whatwg.org/specs/web-forms/current-work/#toolong
  get _tooLong() {
    if (this.outerElement.hasAttribute("maxlength")
    &&  this._isTypeText
    &&  this.outerElement.value.length > this.outerElement.maxLength) {
      return true;
    }
    return false;
  },

  // http://www.whatwg.org/specs/web-forms/current-work/#typemismatch
  get _typeMismatch() {
    if (this._isTypeNumber
    && !this._noValueSelected
    && isNaN(this.valueAsNumber)) { // also works for date types
      return true;
    }
    return false;
  },

  // http://www.whatwg.org/specs/web-forms/current-work/#valuemissing
  get _valueMissing() {
    if (this.outerElement.hasAttribute("required")
    &&  this._noValueSelected) {
      return true;
    }
    return false;
  },

  /* XPCOM stuff */
    
  QueryInterface: function(iid) {
    if (iid.equals(nsIDOMWF2InputElementTearoff) || iid.equals(nsIDOMWF2Inner)) {
      return this;
    }
    throw Components.results.NS_ERROR_NO_INTERFACE;
  }

};


// ==========================================================================
// WF2OutputElement
// ==========================================================================


function WF2OutputElementInner() {
  //
};

WF2OutputElementInner.prototype = extend(new WF2FormControl, {

  classID: Components.ID("{f600e9aa-3a89-11dc-8a43-e20956d89593}"),
  contractID: "@mozilla.org/wf2/output-element-tearoff;1",
  classDescription: "WF2 Output Element Tearoff",

  /* public properties */

  get defaultValue() {
    if (this.hasAttribute("defaultValue")) {
      return this.outerElement.getAttribute("defaultValue");
    }
    return "";
  },
  set defaultValue(val) {
    this.outerElement.setAttribute("defaultValue", val);
    return val;
  },

  get validationMessage() {
    return "";
  },

  get value() {
    return this.outerElement.textContent || this.defaultValue;
  },
  set value(val) {
    return this.outerElement.textContent = val;
  },

  /* public methods */
  
  setCustomValidity: function() {
    throw new SyntaxError("Not supported.");
  },
  
  /* private properties */
  
  get _isValid() {
    return true;
  }

});


// ==========================================================================
// WF2ValidityState
// ==========================================================================


function WF2ValidityState(inner) {
  return {
    get customError()     { return inner._customError;     },
    get patternMismatch() { return inner._patternMismatch; },
    get rangeOverflow()   { return inner._rangeOverflow;   },
    get rangeUnderflow()  { return inner._rangeUnderflow;  },
    get stepMismatch()    { return inner._stepMismatch;    },
    get tooLong()         { return inner._tooLong;         },
    get typeMismatch()    { return inner._typeMismatch;    },
    get valid()           { return inner._valid;           },
    get valueMissing()    { return inner._valueMissing;    }
  };
};

WF2ValidityState.prototype = {    
  toString: function() {
    return "[object ValidityState]";
  }
};

function extend(target, source) {
  for (var i in source) {
    var _getter = source.__lookupGetter__(i); 
    var _setter = source.__lookupSetter__(i);
    
    if (_getter || _setter) {
      if (_getter) {
        target.__defineGetter__(i, _getter);
      }
      if (_setter) {
        target.__defineSetter__(i, _setter);
      }
    } else {
      target[i] = source[i];
    }
  }
  return target;
};

var NSGetModule = XPCOMUtils.generateNSGetModule([
  WF2InputElementInner,
  WF2OutputElementInner
]);
