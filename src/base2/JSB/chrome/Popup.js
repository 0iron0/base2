
var _POPUP_METRICS = "left:%1px!important;top:%2px!important;width:%3px!important;";

var Popup = Base.extend({
  constructor: function(owner) {
    this.owner = owner;
    var popup = this.popup = document.createElement("div");
    popup.className = this.appearance;
    popup.innerHTML = this.html;
  },

  appearance: "popup",
  isOpen: false,

  inherit: String2.csv("backgroundColor,color,fontFamily,fontSize,fontWeight,fontStyle"),
  html: "<div>1 thousand</div><div>2 thousand</div><div>3 thousand</div><div>4 thousand</div><div>5 thousand</div>",

  onkeydown: Undefined,
  onkeyup: Undefined,
  
  hide: function() {
    this.popup.parentNode.removeChild(this.popup);
    //MenuList.detach(popup);
    this.isOpen = false;
  },

  movesize: function(element) {
    this.popup.style.cssText = format(_POPUP_METRICS, element.offsetLeft, element.offsetTop + element.offsetHeight, element.offsetWidth - 2);
    element.offsetParent.appendChild(this.popup);
  },

  show: function(element) {
    this.isOpen = true;
    //MenuList.attach(popup);
    this.movesize(element);
    var style = this.popup.style;
    var computedStyle = Behavior.getComputedStyle(element);
    forEach (this.inherit, function(propertyName) {
      style[propertyName] = computedStyle[propertyName];
    });
    if (style.backgroundColor == "transparent") {
      style.backgroundColor = "Window";
    }
    style.display = "block";
  },
  
  "@MSIE": {
    movesize: function(element) {
      var scrollParent = document.compatMode != "CSS1Compat" ? document.body: document.documentElement;
      var rect = element.getBoundingClientRect();
      this.popup.style.cssText = format(_POPUP_METRICS, scrollParent.scrollLeft + rect.left - 2, scrollParent.scrollTop + rect.bottom - 2, element.offsetWidth - 2);
      document.body.appendChild(this.popup);
    }
  }
});
