
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
  },

  Popup: {
    appearance: "colorpicker-popup",
  
    render: function() {
      var SLIDER = '%1: <input class="jsb-slider" min="0" max="255">';
      this.base([
        SLIDER.replace(/%1/, "R"),
        SLIDER.replace(/%1/, "G"),
        SLIDER.replace(/%1/, "B")
      ].join("<br>"));
      
      this.controls = this.querySelectorAll("input.jsb-slider");
      
      this.controls.forEach(slider.attach);
      
      this.render = Undefined; // do once
    },

    layout: function() {
      var rgb = map(this.element.value.toLowerCase().slice(1).match(/(\w\w)/g), partial(parseInt, undefined, 16));
      this.controls.forEach(function(input, i) {
        input.value = rgb[i];
        slider.layout(input);
      });
    },

    onchange: function() {
      var rgb = map(pluck(this.controls, "value"), Number);
      var value = reduce(rgb, function(value, channel) {
        return value += (channel < 16 ? "0" : "") + channel.toString(16);
      }, "#");
      this.owner.setValue(this.element, value);
    }
  }
});
