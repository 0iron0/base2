
var colorpicker = dropdown.extend({
  PATTERN: /^#[\da-f]{6}$/,
  
  type: "color", // web forms 2.0 type
  appearance: "colorpicker",

  // events

  "@MSIE(5.5|[^5])": _preventScroll,

  "@Opera": {
    onattach: function(element) {
      ClassList.add(element, "jsb-" + this.appearance);
      this.base(element);
    }
  },

  onkeydown: function(element, event, keyCode, shiftKey, ctrlKey, altKey, metaKey) {
    this.base(element, event, keyCode);
    
    if (keyCode < 33 || shiftKey || ctrlKey || altKey || metaKey) return;

    event.preventDefault();
  },

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
    var color = element.value;
    if (!this.PATTERN.test(color)) color = "black";
    element.style.color =
    element.style.backgroundColor = color;
  },

  hitTest: True, // click wherever you want...

  Popup: {
    appearance: "colorpicker-popup", // popup style class

    onchange: function(event) {
      var rgb = map(pluck(this.controls, "value"), Number); // array of rgb values
      var value = reduce(rgb, function(value, channel) {    // convert to: #string
        return value += pad(channel.toString(16));
      }, "#");
      this.owner.setValue(this.element, value);
      event.stopPropagation();
    },

    layout: function() {
      var rgb = map(this.element.value.slice(1).match(/(\w\w)/g), partial(parseInt, undefined, 16)); // array of rgb values
      this.controls.forEach(function(channel, i) {
        channel.value = rgb[i];
        slider.layout(channel); // redraw
      });
    },

    render: function() {
      var SLIDER = ': <input class="jsb-slider" min="0" max="255">';
      this.base(wrap([
        "R" + SLIDER,
        "G" + SLIDER,
        "B" + SLIDER
      ], "div", 'nowrap unselectable="on"'));
      
      this.controls.forEach(slider.attach); // 3 sliders

      this.render = Undefined; // render once
    }
  }
});
