
var _Unknown = function(){};
_Unknown.prototype = {
  get: function(element, propertyName) {
    return element[propertyName];
  },
  
  set: function(element, propertyName, value) {
    element[propertyName] = value;
  }
};

function _registerElement(tagName, definition) {
  var element = document.createElement(tagName);
  if (definition) {
    if (typeof definition == "string") definition = {display: definition};
    definition = extend({}, definition);
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
      if (definition.extraStyles) extend(_styleSheet, definition.extraStyles);
      if (behavior) {
        if (typeof behavior == "string") behavior = _HOST + behavior;
        html5.rules.put(tagName, behavior);
      }
      if (definition.extraRules) html5.rules.merge(definition.extraRules);
    } else {
      var stub = html5[tagName] = new _Unknown;
      if (definition.methods) forEach.csv (definition.methods, function(name) {
        stub[name] = function(element) {
          return element[name].apply(element, Array2.slice(arguments, 1));
        };
      });
    }
  }
};
