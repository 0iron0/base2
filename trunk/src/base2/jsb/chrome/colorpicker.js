
var colorpicker = dropdown.extend({
  appearance: "colorpicker",

  "@MSIE": _preventScroll,

  "@!theme=aqua": {
    onfocus: function(element) {
      if (element != control._active) {
        this.addClass(element, this.appearance + _FOCUS);
      }
      this.base(element);
    }
  },
  
  getState: function(element) {
    if (this.hasClass(element, this.appearance + _FOCUS)) {
      return this.states.hover;
    } else {
      return this.base(element);
    }
  },

  layout: function(element) {
    this.base(element);
    with (element) {
      style.color =
      style.backgroundColor = value;
    }
  },

  hitTest: True, // click wherever you want...

  Popup: {
    appearance: "colorpicker-popup", // popup style class

    onchange: function() {
      var rgb = map(pluck(this.controls, "value"), Number); // array of rgb values
      var value = reduce(rgb, function(value, channel) {    // convert to: #string
        return value += (channel < 16 ? "0" : "") + channel.toString(16);
      }, "#");
      this.owner.setValue(this.element, value);
    },

    layout: function() {
      var rgb = map(this.element.value.toLowerCase().slice(1).match(/(\w\w)/g), partial(parseInt, undefined, 16)); // array of rgb values
      this.controls.forEach(function(input, i) {
        input.value = rgb[i];
        slider.layout(input); // redraw
      });
    },

    render: function() {
      var SLIDER = '%1: <input class="jsb-slider" min="0" max="255">';
      this.base([
        SLIDER.replace(/%1/, "R"),
        SLIDER.replace(/%1/, "G"),
        SLIDER.replace(/%1/, "B")
      ].join("<br>"));

      this.controls = this.querySelectorAll("input.jsb-slider");

      this.controls.forEach(slider.attach); // 3 sliders

      this.render = Undefined; // render once
    }
  }
});
