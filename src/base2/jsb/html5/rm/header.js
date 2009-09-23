
var _REPETITION_NONE     = 0,
    _REPETITION_TEMPLATE = 1,
    _REPETITION_BLOCK    = 2;

var _FIX_MSIE_BROKEN_TAG = /(<\/?):/g,
    _IGNORE_NAME         = /[\[\u02d1\u00b7\]]/,
    _MAX_VALUE           = Math.pow(2, 32) - 1,
    _SAFE_NAME           = /([\/(){}|*+-.,^$?\\])/g;

function _dispatchTemplateEvent(templateElement, type, affectedElement) {
  return template.dispatchEvent(templateElement, type, {element: affectedElement});
};

function _dispatchBlocksModifiedEvent(template) {
  var event = DocumentEvent.createEvent(document, "Events");
  event.initEvent("BlocksModified", false, false);
  this.dispatchEvent(template.parentNode, event);
};

