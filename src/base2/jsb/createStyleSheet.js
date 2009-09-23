
extend(jsb, "createStyleSheet", function(cssText) {
  if (typeof cssText != "string") {
    var rules = cssText;

    var styleSheet = {
      toString: function() {
        return map(this, function(properties, selector) {
          return selector + properties;
        }).join("\n").replace(/!([^\w])/g, "!important$1");
      }
    };

    var baseRule;
    
    var createRule = function(properties, selector) {
      if (/,/.test(selector)) {
        forEach (new Selector(selector).split(), partial(createRule, properties));
      } else {
        if (!baseRule) {
          baseRule = selector == "*" ? properties : {};
        }
        if (selector != "*") {
          var rule = styleSheet[selector];
          if (!rule) {
            rule = styleSheet[selector] = extend({toString: function() {
              return " {\n" +
                map(this, function(value, propertyName) {
                  if (typeof value == "function") value = "none";
                  return "  " + propertyName.replace(/[A-Z]/g, function(captialLetter) {
                    return "-" + captialLetter.toLowerCase();
                  }) + ": " + value;
                }).join(";\n") +
              "\n}";
            }}, baseRule);
          }
          forEach.detect (properties, function(value, propertyName) {
            if (_style[propertyName] == undefined) {
              propertyName = CSSStyleDeclaration.getPropertyName(propertyName);
            }
            if (_style[propertyName] != undefined) {
              if (value == "initial") {
                forEach (rule, function(initialPropertyValue, initialPropertyName) {
                  if (initialPropertyName.indexOf(propertyName) == 0) {
                    delete rule[initialPropertyName];
                  }
                });
                delete rule[propertyName];
              } else {
                /*@if (@_jscript_version < 5.6)
                if (propertyName == "cursor" && value == "pointer") value = "hand";
                /*@end @*/
                rule[propertyName] = value;
              }
            }
          });
        }
      }
    };
    
    forEach.detect (rules, createRule);

    cssText = styleSheet.toString();
  }

  // This shouldn't really be here.
  // JSB shouldn't really know about Chrome. Oh well.
  cssText = cssText.replace(/%theme%/g, "themes/" + jsb.theme);
  
  var URL = /(url\s*\(\s*['"]?)([\w\.]+[^:\)]*['"]?\))/gi;
  this.base(cssText.replace(URL, "$1" + _getCurrentHost() + "$2"));
  
  return cssText;
});
