
var colorpicker = dropdown.extend({
  // properties
  
  value: "#000000",

  Popup: {
    appearance: "colorpicker-popup",
  
    render: function() {
      var SLIDER = '%1: <input class="jsb-slider" min="0" max="255">';
      this.base([
        SLIDER.replace(/%1/, "R"),
        SLIDER.replace(/%1/, "G"),
        SLIDER.replace(/%1/, "B")
      ].join("<br>"));
      
      this.render = Undefined; // do once
    },

    getControls: function() {
      return this.querySelectorAll("input.jsb-slider");
    },

    hide: function() {
      this.getControls().forEach(slider.detach);
      this.base();
    },

    layout: function() {
      var rgb = map(this.element.value.slice(1).match(/(\w\w)/g), partial(parseInt, undefined, 16));
      this.getControls().forEach(function(input, i) {
        input.value = rgb[i];
        slider.attach(input);
      });
    },

    onchange: function() {
      var rgb = map(pluck(this.getControls(), "value"), Number);
      var value = reduce(rgb, function(value, channel) {
        return value += (channel < 16 ? "0" : "") + channel.toString(16);
      }, "#");
      this.owner.setValue(this.element, value);
    }/*,

    onmouseup: function(event) {
      this.element.focus();
    }*/
  },

  "@MSIE": _preventScroll,

  layout: function(element) {
    this.base(element);
    with (element) {
      style.color =
      style.backgroundColor = value;
    }
  },
  
  hitTest: True,

  setValue: function(element, value) {
    if (element.value != value) {
      element.value = value;
      this.layout(element);
      this.dispatchEvent(element, "change");
    }
  }
});
