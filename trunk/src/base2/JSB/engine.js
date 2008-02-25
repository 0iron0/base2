
;;; console2.log("START");
;;; console2.update();

var _MAX_PROCESSING_TIME = 200;
var _MAX_ELEMENTS = 200;

var _COMPLETE = -1;
var _TICK     = 0;

var _DOMContentLoaded = false;
var _busy = false;
var _rules = new Array2;

JSB.refresh = function(i, j, elements) {
  // This method is overridden once the document has loaded.
  if (!_busy) {
    var now = Date2.now();
    var start = now;
    //;;; console2.log("TICK: " + _busy);
    var count = _rules.length;
    while (count && _rules.length && (now - start < _MAX_PROCESSING_TIME)) {
      if (i == null) i = j = 0;
      var rule = _rules[i];
      var attach = rule.behavior.attach;
      var queryComplete = false;
      if (!elements) {
        var query = rule.query;
        var state = query.state || [];
        state.unshift(document, _MAX_ELEMENTS);
        elements = query.apply(null, state);
        queryComplete = Array2.item(query.state, _COMPLETE);
      }
      now = Date2.now();
      var x = now;
      var k = 0;
      var length = elements.length;
      while (j < length && (now - start < _MAX_PROCESSING_TIME)) {
        attach(elements[j++]);
        if (k < 5 || k % 50 == 0) now = Date2.now();
        k++;
      }
      if(k)console2.log(k+"  --  "+((Date2.now() - x)/k));
      if (j == length) {
        j = 0;
        elements = null;
        if (_DOMContentLoaded && queryComplete) {
          _rules.removeAt(i);
        } else i++;
      }
      if (i > _rules.length - 1) i = 0;
      count--;
    }
  }
  if (!_rules.length) {
    Behavior.dispatchEvent(document, "documentready");
  } else {
    setTimeout(partial(JSB.refresh, i, j, elements), _TICK);
  }
};

function _addRule(selector, behavior) {
  assert(!/:/.test(selector), format("Pseudo class selectors not allowed in JSB (selector='%2').", selector));
  var query = Selector.parse(selector);
  _rules.push({query: query, behavior: behavior});
  if (_rules.length == 1) JSB.refresh();
};

addEventListener(document, "DOMContentLoaded", function() {
  _DOMContentLoaded = true;
  //;;; console2.log("DOMContentLoaded");
  //;;; console2.log("Document load time: "+((new Date)-ss));
}, false);
