
// http://www.whatwg.org/specs/web-apps/current-work/#domtokenlist0

// I'm not supporting length/index(). What's the point?

var ClassList = Module.extend({
  add: function(element, token) {
    if (!this.has(element, token)) {
      element.className += (element.className ? " " : "") + token;
    }
  },

  has: function(element, token) {
    var regexp = new RegExp("(^|\\s)" + token + "(\\s|$)");
    return regexp.test(element.className);
  },

  remove: function(element, token) {
    var regexp = new RegExp("(^|\\s)" + token + "(\\s|$)", "g");
    element.className = trim(element.className.replace(regexp, "$2"));
  },

  toggle: function(element, token) {
    this[this.has(element, token) ? "remove" : "add"](element, token);
  }
});

function _ElementClassList(element) {
  this.add = function(token) {
    ClassList.add(element, token);
  };
  this.has = function(token) {
    return ClassList.has(element, token);
  };
  this.remove = function(token) {
    ClassList.remove(element, token);
  };
};

_ElementClassList.prototype.toggle = function(token) {
  this[this.has(token) ? "remove" : "add"](token);
};
