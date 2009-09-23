
// http://www.whatwg.org/specs/web-apps/current-work/#domtokenlist0

// I'm not supporting length/index(). What's the point?

var ClassList = Module.extend({
  add: function(element, token) {
    if (!ClassList.contains(element, token)) {
      element.className += (element.className ? " " : "") + token;
    }
  },

  contains: function(element, token) {
    var regexp = new RegExp("(^|\\s)" + token + "(\\s|$)");
    return regexp.test(element.className || "");
  },

  remove: function(element, token) {
    var regexp = new RegExp("(^|\\s)" + token + "(\\s|$)", "g");
    element.className = trim(element.className.replace(regexp, "$2"));
  },

  toggle: function(element, token) {
    ClassList[ClassList.has(element, token) ? "remove" : "add"](element, token);
  }
});

// a constructor that binds ClassList objects to elements
var _ElementClassList = new Function("e", Array2.reduce(String2.csv("add,contains,remove,toggle"), function(body, method) {
  return body += "this." + method + "=function(t){return base2.dom.ClassList."+ method + "(e,t)};"
}, ""));

ClassList.has = ClassList.contains;
