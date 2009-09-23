
/* Web Forms 2.0 */

var _WF2_METHODS = "checkValidity,setCustomValidity";

var _FORMS_JS = _HOST + "forms.js",
    _RM_JS = _HOST + "rm.js";

;;; _FORMS_JS = _HOST + "forms.php";
;;; _RM_JS = _HOST + "rm.php";

var _input = document.createElement("input");

try {
  _input.type = "color";
} catch (x) {}
if (_input.type != "color") {
  html5.rules.put("input[type=color]", _FORMS_JS + "#chrome.colorpicker");
}

var _cssText = new RegGrp({
  "\\*?\\.jsb\\-progressbar": "progress"
}).exec(jsb.theme.cssText);

forEach ({
  form: "checkValidity,dispatchFormChange,dispatchFormInput",
  input: _WF2_METHODS + ",stepUp,stepDown",
  output: _WF2_METHODS,
  select: _WF2_METHODS,
  textarea: _WF2_METHODS
}, function(methods, tagName) {
  _registerElement(tagName, {detect: "checkValidity", methods: methods});
});

if (!detect("(hasFeature('WebForms','2.0'))")) {
  html5.rules.merge({
    "form": _FORMS_JS + "#html5.form",
    "button,input,textarea,select": _FORMS_JS + "#chrome",
    "input[type=number]": _FORMS_JS + "#chrome.spinner",
    "input[type=range]": _FORMS_JS + "#chrome.slider",
    "input[type=date]": _FORMS_JS + "#chrome.datepicker",
    "input[type=month]": _FORMS_JS + "#chrome.monthpicker",
    "input[type=week]": _FORMS_JS + "#chrome.weekpicker",
    "input[type=time]": _FORMS_JS + "#chrome.timepicker",
    "input[list]": _FORMS_JS + "#chrome.combobox",
    "button[type=add],button.html5-add": _RM_JS + "#jsb.rm.add",
    "button[type=remove],button.html5-remove": _RM_JS + "#jsb.rm.remove",
    "button[type=move-up],button.html5-move-up": _RM_JS + "#jsb.rm.moveup",
    "button[type=move-down],button.html5-move-down": _RM_JS + "#jsb.rm.movedown"
  });
  if (_input.autofocus === undefined) {
    html5.rules.put("button[autofocus],input[autofocus],textarea[autofocus],select[autofocus]", {
      onattach: function(element) {
        try {
          //if (this._element && this.compareDocumentPosition()) {
            element.focus();
            if (element.select) element.select();
          //  this._element = element;
          //}
        } catch (x) {
          // the control is probably hidden
        }
      }
    });
  }
  _styleSheet[".html5-template"] = {display:"none!"};
  _cssText = new RegGrp({
    "\\*?\\.jsb\\-combobox": "input[list]",
    "\\*?\\.jsb\\-spinner": "input[type=number]",
    "\\*?\\.jsb\\-(\\w+)picker([^-])": "input[type=$1]$2",
    "\\*?\\.jsb\\-slider": "input[type=range]",
    "\\*?\\.jsb\\-error": "input.jsb-error"
  }).exec(_cssText);
}

if (jsb.clientWidth2) {
  _cssText += "\ninput[type=number],input[type=range],input[type=date],"+
    "input[type=month],input[type=week],input[type=time],"+
    "input[type=color],input[list],progress,meter{behavior:url(dimensions.htc)}";
}

jsb.createStyleSheet(_cssText);
