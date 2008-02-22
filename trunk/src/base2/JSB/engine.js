
JSB.refresh = function(ready) {
  if (ready || !batch.timer) {
    // This method is overridden once the document has loaded.
    ;;; console2.log("tick: " + (new Date().valueOf()));
    var refreshed = {};
    function refresh(rule) {
      if (!refreshed[rule.base2ID]) {
        refreshed[rule.base2ID] = true;
        rule.refresh();
      }
    };
    forEach (_rulesByID, function(rules, id) {
      if (!rules._found) {
        var element = NodeSelector.querySelector(document, "#" + id);
        if (element) {
          ;;; console2.log("Found #" + id);
          rules._found = true;
          forEach (rules, refresh);
        }
      }
    });
    forEach (_rulesByTagName, function(rules, tagName) {
      var count = rules._nodeList.length;
      if (rules._count != count) {
        ;;; console2.log("Found <" + tagName + ">: " + (count-rules._count));
        rules._count = count;
        forEach (rules, refresh);
      }
    });
  }
  if (ready) clearInterval(_tick);
};

var _NOT_ALLOWED = "%1 selectors not allowed in JSB (selector='%2').";

function _addRule(rule) {
  assert(!/:/.test(rule), format(_NOT_ALLOWED, "Pseudo class", rule));
  forEach(String2.csv(_parser.escape(rule)), function(selector) {
    var id, tagName;
    if (_ID.test(selector) && !_COMBINATOR.test(selector)) {
      id = selector.match(_ID)[1];
      _addRuleByAttribute(id, _rulesByID, rule);
    }
    selector.replace(_SIMPLE, function(match, token, combinator, value) {
      if (combinator || !token) {
        tagName = value;
      } else {
        _addRuleByAttribute(match, _rulesByAttribute, rule);
      }
    });
    if (!id) _addRuleByTagName(tagName, rule);
  });
  _rulesAll.push(rule);
  assignID(rule);
  rule.refresh();
};

function _addRuleByAttribute(attribute, rules, rule) {
  if (!rules[attribute]) rules[attribute] = [];
  rules[attribute].push(rule);
};

function _addRuleByTagName(tagName, rule) {
  assert(tagName != "*", format(_NOT_ALLOWED, "Wild card", rule));
  var rules = _rulesByTagName[tagName];
  if (!rules) rules = _rulesByTagName[tagName] = [];
  rules._count = 0;
  rules._nodeList = document.getElementsByTagName(tagName);
  rules.push(rule);
};

function _fireReady() {
  if (_ready) {
    ;;; console2.log("ondocumentready");
    Behavior.dispatchEvent(document, "documentready");
    ;;; console2.log("Total time: "+((new Date)-ss));
    ;;; console2.update();
  }
};

var _tick = setInterval(JSB.refresh, 100);
function _delayRefresh() {
  if (!_delayRefresh.id) {
    var self = this;
    _delayRefresh.id = setTimeout(function() {
      if (!_ready) JSB.refresh();
      delete _delayRefresh.id;
    }, 100);
  }
};
addEventListener(document, "mousemove", _delayRefresh, false);
addEventListener(document, "keypress", _delayRefresh, false);

addEventListener(document, "DOMContentLoaded", function() {
  removeEventListener(document, "mousemove", _delayRefresh, false);
  removeEventListener(document, "keypress", _delayRefresh, false);
  ;;; console2.log("DOMContentLoaded");
  ;;; console2.log("Document load time: "+((new Date)-ss));
  JSB.refresh(true);
  JSB.refresh = function() {
    invoke(arguments.length == 1 ? _rulesByAttribute[arguments[0]] : _rulesAll, "refresh");
  };
  _ready = true;
  if (!batch.timer) _fireReady();
}, false);

/* extend(ClassList, {
  add: function(element, token) {
    this.base(element, token);
    JSB.refresh("." + token);
  }
});

extend(HTMLElement, {
  setAttribue: function(element, name, value) {
    this.base(element, name, value);
    JSB.refresh("[" + name);
  }
});

extend(Traversal, {
  setText: function(element, value, isHTML) {
    this.base(element, name, value);
    JSB.refresh(value, isHTML);
  }
}); */
