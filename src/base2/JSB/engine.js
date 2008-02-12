
JSB.refresh = function(ready) {
  if (ready || !batch.timer) {
    console2.log("tick: " + (new Date().valueOf()));
    // This method is overridden once the document has loaded.
    var refreshed = {};
    for (var tagName in _rulesByTagName) {
      var rules = _rulesByTagName[tagName];
      var count = rules._nodeList.length;
      if (rules._count != count) {
        console2.log("Found '" + tagName + "': " + (count-rules._count));
        rules._count = count;
        var i = rules.length, rule;
        while (rule = rules[--i]) {
          if (!refreshed[rule.base2ID]) {
            refreshed[rule.base2ID] = true;
            rule.refresh();
          }
        }
      }
    }
  }
  if (ready) clearInterval(timer);
};

var _MSIE = detect("MSIE");

var _ready;
var _rulesAll = [];
var _rulesByAttribute = {};
var _rulesByTagName = {};

var _ruleMapper = new RegGrp({
  "(['\"])(\\\\.|[^\\1\\\\])*\\1": "",
  "(^|([\s+~>,])|[#.\\[])([\\w-]+)": ""
});

function _addRule(rule) {
  var tagName;
  _ruleMapper.putAt(1, function(match, token, combinator, value) {
    if (!token || combinator) {
      if (token == ",") _addRuleByTagName(tagName, rule);
      tagName = value;
    } else {
      if (!_rulesByAttribute[match]) {
        _rulesByAttribute[match] = [];
      }
      _rulesByAttribute[match].push(rule);
    }
  });
  _ruleMapper.exec(rule);
  _addRuleByTagName(tagName, rule);
  _rulesAll.push(rule);
  assignID(rule);
  rule.refresh();
};

function _addRuleByTagName(tagName, rule) {
  assert(tagName, "Wild card selectors not allowed in JSB (selector='" + rule + "').");
  var rules = _rulesByTagName[tagName];
  if (!rules) rules = _rulesByTagName[tagName] = [];
  rules._count = 0;
  rules._nodeList = document.getElementsByTagName(tagName);
  rules.push(rule);
};

function _fireReady() {
  if (_ready) {
    console2.log("ondocumentready");
    Behavior.dispatchEvent(document, "ready");
    console2.log("Total time: "+((new Date)-ss));
  }
};

var timer = setInterval(JSB.refresh, 100);
EventTarget.addEventListener(document, "mousemove", JSB.refresh, false);

EventTarget.addEventListener(document, "DOMContentLoaded", function() {
  EventTarget.removeEventListener(document, "mousemove", JSB.refresh, false);
  console2.log("DOMContentLoaded");
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
