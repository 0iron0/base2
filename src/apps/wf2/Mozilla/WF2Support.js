
const nsISupports                   = Components.interfaces.nsISupports;
const DOM_OBJECT                    = Components.interfaces.nsIClassInfo.DOM_OBJECT
const JAVASCRIPT                    = Components.interfaces.nsIProgrammingLanguage.JAVASCRIPT
const nsIDOMWF2Inner                = Components.interfaces.nsIDOMWF2Inner;
const nsIDOMWF2InputElementTearoff  = Components.interfaces.nsIDOMWF2InputElementTearoff;
const nsIDOMWF2OutputElementTearoff = Components.interfaces.nsIDOMWF2OutputElementTearoff;
const nsIDOMWF2ValidityState        = Components.interfaces.nsIDOMWF2ValidityState;

function NOT_SUPPORTED_ERR() {};
NOT_SUPPORTED_ERR.prototype = new SyntaxError("NOT_SUPPORTED_ERR");
NOT_SUPPORTED_ERR.prototype.code = 9; // DOMException.NOT_SUPPORTED_ERR;

function INVALID_STATE_ERR() {};
INVALID_STATE_ERR.prototype = new SyntaxError("INVALID_STATE_ERR");
INVALID_STATE_ERR.prototype.code = 11; // DOMException.NOT_SUPPORTED_ERR;

const TYPE_VALID =
/^(button|checkbox|date|datetime|datetime\-local|email|file|hidden|image|month|\
number|password|radio|range|reset|submit|text|time|url|week)$/;

const TYPE_NO_VALIDATION           = /^(hidden|button|reset)$/
const TYPE_BOOLEAN                 = /^(checkbox|radio)$/;
const TYPE_BUTTON                  = /^(button|image|reset|submit)$/;
const TYPE_DATE                    = /^(date|datetime|datetime\-local|month|time|week)$/;
const TYPE_NUMBER                  = /^(number|range|date|datetime|datetime\-local|month|time|week)$/;
const TYPE_SUBMIT                  = /^(image|submit)$/;
const TYPE_TEXT                    = /^(text|password|email|url)$/i;

const ESCAPE_CHARS                 = /\\/g;
const SPACE_SEPARATED              = /[^\S]+/;

const VALID_EMAIL                  = /^("[^"]*"|[^\s\.]\S*[^\s\.])@[^\s\.]+(\.[^\s\.]+)*$/; // Change this later.
const VALID_URL                    = /^[a-zA-Z][a-zA-Z0-9+-.]*:[^\s]+$/;                    // And this.
const VALID_LIST                   = /^(DATALIST|SELECT)$/;

const XPATH_IS_DISABLED            = ".[@disabled] | ./ancestor::fieldset[@disabled]";             // TYPE_BOOLEAN
const XPATH_DATALIST_ANCESTOR      = ".[not(ancestor::datalist)]";                                 // TYPE_BOOLEAN
const XPATH_ANCESTOR_FORMS         = "./ancestor::form";                                           // TYPE_ORDERED_NODE_SNAPSHOT
const XPATH_FORMS_BY_ID            = "/descendant::form[contains(' %ID% ', concat(' ',@id,' '))]"; // TYPE_ORDERED_NODE_SNAPSHOT

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
    return this.outerElement.form;
    //return this.forms[0] || null;
  },

  // http://www.whatwg.org/specs/web-forms/current-work/#forms
  get forms() {
    if (this.outerElement.hasAttribute("form")) {
      // return new WF2NodeList();
      var forms = [], i = 0; // create a NodeList (how?)
      var document = this.outerElement.ownerDocument;
      var formIds = this.outerElement.getAttribute("form").match(SPACE_SEPARATED);
      for each (var id in formIds) {
        var form = document.getElementById(id);
        if (form && form.localName == "FORM") {
          forms[i++] = form;
        }
      }
    } else {
      forms = this._getAncestorsByTagName("FORM");
    }
    return (arguments.length == 0) ? forms : forms[index];
  },

  // http://www.whatwg.org/specs/web-forms/current-work/#labels
  get labels() {
    var element = this.outerElement;
    var labels = [], i = 0;
    if (element.hasAttribute("id")) {
      var allLabels = element.ownerDocument.getElementsByTagName("LABEL");
      for each (var label in allLabels) {
        if (label && label.control == element) {
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

  _evaluate: function(query, type) {
    // might use this later
    var result = this.outerElement.ownerDocument.evaluate(query, this.outerElement, null, type, null);
    return (type == XPathResult.TYPE_BOOLEAN) ? result.booleanValue : result;
  },

  _dispatchEvent: function(type) {
    var event = this.outerElement.ownerDocument.createEvent("Events");
    event.initEvent(type, false, false);
    return this.outerElement.dispatchEvent(event);
  },

  _getAncestorsByTagName: function(tagName) {
    var ancestors = [], i = 0;
    var element = this.outerElement;
		while (element && (element = element.parentNode)) {
      if (element.nodeType == element.ELEMENT_NODE && element.localName.toUpperCase() == tagName) {
        ancestors[i++] = element;
      }
		}
    return ancestors;
  }
};


// ==========================================================================
// WF2InputElement
// ==========================================================================


function WF2InputElement() {
  //
};

WF2InputElement.prototype = extend(new WF2FormControl, {

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
      if (TYPE_VALID.test(type)) {
        return type;
      }
    }
    return "text";
  },

  // http://www.whatwg.org/specs/web-forms/current-work/#valueasdate
  get valueAsDate() {
    if (this._isDateType) {
      return DateParser[this.type](this.outerElement.value);
    }
    return NaN;
  },
  set valueAsDate(val) {
    if (this._isDateType) {
      this.outerElement.value = DateFormatter[this.type](val);
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
    if (!TYPE_NO_VALIDATION.test(this.type)
    &&  this.outerElement.name
    &&  this.form
    && !this._isDisabled
    && !this.outerElement.readOnly
    && !this._getAncestorsByTagName("DATALIST").length) {
      return true;
    }
    return false;
  },

  /* public methods */

  //http://www.whatwg.org/specs/web-forms/current-work/#checkvalidity
  checkValidity: function() {
    if (this._isButton || !this.willValidate || this._isValid) {
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
      throw new NOT_SUPPORTED_ERR;
    }
    this._customError = (error == null) ? "" : String(error);
  },

  // http://www.whatwg.org/specs/web-forms/current-work/#stepdown
  stepDown: function(n) {
    if (this.step != "any"
    &&  this._isNumeric
    && !this._noValueSelected
    &&  this._isValid) {
      // INVALID_STATE_ERR
      // INVALID_MODIFICATION_ERR
      // INDEX_SIZE_ERR
    } else {
      throw new INVALID_STATE_ERR;
    }
  },

  // http://www.whatwg.org/specs/web-forms/current-work/#stepup
  setUp: function(n) {
    if (this.step != "any"
    &&  this._isNumeric
    && !this._noValueSelected
    &&  this._isValid) {
      // INVALID_STATE_ERR
      // INVALID_MODIFICATION_ERR
      // INDEX_SIZE_ERR
    } else {
      throw new INVALID_STATE_ERR;
    }
  },

  /* private properties */
  
  get _isActive() {
    return this.outerElement == this.outerElement.ownerDocument.activeElement;
  },

  // http://www.whatwg.org/specs/web-forms/current-work/#disabled
  get _isDisabled() {
    // return this._evaluate(XPATH_IS_DISABLED, XPathResult.BOOLEAN_VALUE);
    if (this.outerElement.disabled) {
      return true;
    }
    var fieldsets = this._getAncestorsByTagName("FIELDSET");
    for each (var fieldset in fieldsets) {
      if (fieldset.disabled) {
        return true;
      }
    }
    return false;
  },

  // http://www.whatwg.org/specs/web-forms/current-work/#successful
  get _isSuccessful() {
    var type = this.type;
    if (type != "button"
    &&  type != "reset"
    && (this.outerElement.name || type == "image")
    &&  this.form
    && !this._isDisabled
    && (!TYPE_BOOLEAN.test(type) || this.outerElement.checked)
    && (!TYPE_SUBMIT.test(type) || this._isActive)
    && !this._getAncestorsByTagName("DATALIST").length) {
      return true;
    }
    return false;
  },

  get _isTypeDate() {
    return TYPE_DATE.test(this.type);
  },

  get _isTypeNumber() {
    return TYPE_NUMBER.test(this.type);
  },

  get _isTypeText() {
    return TYPE_TEXT.test(this.type);
  },

  get _maxAsNumber() {
    return Number(this.max);
  },

  get _minAsNumber() {
    return Number(this.min);
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
        if (!checked && this.outerElement.name) {
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

  get _pattern() {
    var pattern = this.outerElement.getAttribute("pattern");
    return new RegExp("^(?:" + pattern.replace(ESCAPE_CHARS, "\\\\") + ")$");
  },

  // http://www.whatwg.org/specs/web-forms/current-work/#patternmismatch
  get _patternMismatch() {
    var type = this.type;
    if (type == "email" && !VALID_EMAIL.test(this.outerElement.value)) {
      return true;
    }
    if (this.type == "url" && !VALID_URL.test(this.outerElement.value)) {
      return true;
    }
    if (this.outerElement.hasAttribute("pattern")
    && TYPE_TEXT.test(type)
    && !this._noValueSelected
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
    if (this.outerElement.hasAttribute("step")
    &&  this.step != "any"
    &&  this._isTypeNumber
    && !this._noValueSelected
    && !this._typeMismatch
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

});


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

  init: function(outer) {
    this.outerElement = outer;
  },

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
    this.outerElement.textContent = val;
    return val;
  },

  /* public methods */

  setCustomValidity: function() {
    throw new NOT_SUPPORTED_ERR;
  },

  /* private properties */

  get _isValid() {
    return true;
  },

  /* XPCOM stuff */

  QueryInterface: function(iid) {
    if (iid.equals(nsIDOMWF2OutputElementTearoff) || iid.equals(nsIDOMWF2Inner)) {
      return this;
    }
    throw Components.results.NS_ERROR_NO_INTERFACE;
  }

});


// ==========================================================================
// WF2ValidityState
// ==========================================================================


function WF2ValidityState(tearoff) {
  //this.wrappedJSObject = this;
  this._tearoff = tearoff;
};

WF2ValidityState.prototype = {

  classID: Components.ID("{dab9e716-2b23-11dc-b418-5c5056d89593}"),
  contractID: "@mozilla.org/wf2/validity-state;1",
  classDescription: "WF2 Validity State",
  implementationLanguage: JAVASCRIPT,
  flags: DOM_OBJECT,

  get customError()     { return false; },
  get patternMismatch() { return false; },
  get rangeOverflow()   { return false; },
  get rangeUnderflow()  { return false; },
  get stepMismatch()    { return false; },
  get tooLong()         { return false; },
  get typeMismatch()    { return false; },
  get valid()           { return true;  },
  get valueMissing()    { return false; },

  toString: function() {
    return "[object ValidityState]";
  },

  /* XPCOM stuff */

  QueryInterface: function (iid) {
    if (iid.equals(nsIDOMWF2ValidityState) || iid.equals(nsISupports)) {
        return this;
    }
    throw Components.results.NS_ERROR_NO_INTERFACE;
  }
};


// ==========================================================================
// Support
// ==========================================================================


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


// ==========================================================================
// Date/Time Parsing
// ==========================================================================

const MILLISECONDS_IN_A_WEEK  = 604800000;
const PATTERN_WEEK            = /^\d{4}-W([0-4]\d|5[0-3])$/;

const DATE_ERROR_INVALID      = "'%1' is not a valid ISO date.";
const DATE_ERROR_OUT_OF_RANGE = " %2 out of range.";

// big, ugly, regular expression
const ISO_DATE_PATTERN = /^((-\d+|\d{4,})(-(\d{2})(-(\d{2}))?)?)?T((\d{2})(:(\d{2})(:(\d{2})(\.(\d{1,3})(\d)?\d*)?)?)?)?(([+-])(\d{2})(:(\d{2}))?|Z)?$/;
const ISO_DATE_PARTS = { // indexes to the sub-expressions of the RegExp above
	FullYear: 2,
	Month: 4,
	Date: 6,
	Hours: 8,
	Minutes: 10,
	Seconds: 12,
	Milliseconds: 14
};
const TZ_DATE_PARTS = { // idem, but without the getter/setter usage on Date object
	HectoMicroseconds: 15, // :-P
	TzUtc: 16,
	TzSign: 17,
	TzHours: 18,
	TzMinutes: 20
};

var DateParser = {
  parse: function(string, defaultDate) {
  	// parse ISO date
  	var match = String(string).match(ISO_DATE_PATTERN);
		assert(match, DATE_ERROR_INVALID, SyntaxError);
		match[ISO_DATE_PARTS.Month]--; // js months start at zero
		// round milliseconds on 3 digits
		if (match[TZ_DATE_PARTS.HectoMicroseconds] >= 5) match[ISO_DATE_PARTS.Milliseconds]++;
		var date = new Date(defaultDate || 0);
		var prefix = match[TZ_DATE_PARTS.TzUtc] || match[TZ_DATE_PARTS.TzHours] ? "UTC" : "";
		for (var part in ISO_DATE_PARTS) {
			var value = match[ISO_DATE_PARTS[part]];
			if (!value) continue; // empty value
			// set a date part
			date["set" + prefix + part](value);
			// make sure that this setting does not overflow
			assert(date["get" + prefix + part]() == match[ISO_DATE_PARTS[part]],
		  	format(DATE_ERROR_INVALID + DATE_ERROR_OUT_OF_RANGE, string, part), SyntaxError);
		}
		// timezone can be set, without time being available
		// also, without timezone, local timezone is respected
		if (match[TZ_DATE_PARTS.TzHours]) {
			var tzHours = Number(match[TZ_DATE_PARTS.TzSign] + match[TZ_DATE_PARTS.TzHours]);
			var tzMinutes = Number(match[TZ_DATE_PARTS.TzSign] + (match[TZ_DATE_PARTS.TzMinutes] || 0));
			date.setUTCMinutes(date.getUTCMinutes() + tzHours * 60 + tzMinutes);
		}
		return date;
  },
  "datetime": function(string) {
    return this.parse(string);
  },
  "date": function(string) {
    return this.parse(string + "T");
  },
  "time": function(string) {
    return this.parse("T" + string);
  },
  "month": function(string) {
    return this.parse(string + "-01T");
  },
  "week": function(string, firstDayOfWeek) {
    if (!PATTERN_WEEK.test(string)) return NaN;
    var parts = String(string).split("-W");
    var date = new Date(1970, 0, 1);
    date.setFullYear(parts[0]);
    while (date.getDay() != firstDayOfWeek) {
      date.setDate(date.getDate() + 1);
    }
    date = new Date(date.valueOf() + (parts[1] - 1) * MILLISECONDS_IN_A_WEEK);
    return (date.getFullYear() == parts[0]) ? date : NaN;
  }
};

var DateFormatter = {  
	toISOString: function(date) {
	  date = Date(date);
		var string = "####-##-##T##:##:##.###";
		for (var part in ISO_DATE_PARTS) {
			string = string.replace(/#+/, function(digits) {
				var value = date["getUTC" + part]();
				if (part == "Month") value++; // js month starts at zero
				return ("000" + value).slice(-digits.length); // pad
			});
		}
		// remove trailing zeroes, and remove UTC timezone, when time's absent
		return string.replace(/(((00)?:0+)?:0+)?\.0+$/, "").replace(/(T[0-9:.]+)$/, "$1Z");
	},
  "datetime": function(date) {
    return this.toISOString(date);
  },  
  "date": function(date) {
    return this.toISOString(date).split("T")[0];
  },  
  "time": function(date) {
    return this.toISOString(date).split("T")[1];
  },  
  "month": function(date) {
    return this.date(date).slice(-3);
  },  
  "week": function(date) {
    date = Date(date);
    var year = new Date(date.getFullYear(), 0, 1);
    var week = parseInt((date - year) / MILLISECONDS_IN_A_WEEK) + 1;
    return date.getFullYear() + "-W" + pad(week);
  }
};


// ==========================================================================
// Initialise XPCOM
// ==========================================================================


Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");

var NSGetModule = XPCOMUtils.generateNSGetModule([
  WF2InputElement,
  WF2ValidityState
]);
