
function _registerElement(tagName, definition) {
  var element = document.createElement(tagName);
  if (definition) {
    if (typeof definition == "string") {
      definition = {display: definition};
    } else {
      definition = extend({}, definition);
    }
    if (element[definition.detect] === undefined) {
      var style = definition.style,
          behavior = definition.behavior;
      if (definition.display) {
        if (!style) style = {};
        style.display = definition.display;
        if (style.display.indexOf("block") == 0 && !style.margin) {
          style.margin = "1em 0"; // default margin for block elements
        }
      }
      if (style) {
        if (_styleSheet[tagName]) {
          extend(_styleSheet[tagName], style);
        } else {
          _styleSheet[tagName] = style;
        }
      }
      if (definition.extraStyles) {
        extend(_styleSheet, definition.extraStyles);
      }
      if (behavior) {
        if (typeof behavior == "string") {
          behavior = _HOST + behavior;
        } else {
          if (!jsb.behavior.ancestorOf(behavior)) {
            behavior = jsb.behavior.extend(behavior);
          }
          html5[tagName] = behavior;
        }
        _rules[tagName] = behavior;
      }
      if (definition.extraRules) {
        extend(_rules, definition.extraRules);
      }
    } else {
      var placeholder = html5[tagName] = jsb.behavior.extend();
      if (definition.methods) forEach.csv (definition.methods, function(name) {
        placeholder[name] = function(element) {
          return element[name].apply(element, Array2.slice(arguments, 1));
        };
      });
    }
  }
};
