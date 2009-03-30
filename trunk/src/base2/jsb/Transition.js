
// Special parsing of colours and "clip" are bulking this out. :-(

var Transition = Base.extend({
  constructor: function(element, propertyName, params) {
    extend(this, params);
    
    this.toString = K(element.uniqueID + "." + propertyName);
    
    this.property = propertyName;

    var style = element.style,
        startValue = this.start,
        ease = this.timing;
        
    if (startValue == null) {
      startValue = this.start = style[propertyName] || ViewCSS.getComputedPropertyValue(document.defaultView, element, propertyName) || "";
    }
    
    // Parse the start/end values and create the underlying timing function.
    if (/color$/i.test(propertyName)) {
      startValue = this.parseColor(startValue);
      var endValue = this.parseColor(this.end),
          delta = map(startValue, function(value, i) {
            return endValue[i] - value;
          }),
          calculateValue = function(t) {
            return "rgb(" + map(startValue, function(value, i) {
              return Math.round(ease(t, value, delta[i], duration));
            }).join(", ") + ")";
          };
    } else if (propertyName == "clip") {
      startValue = map(match(startValue, _DIGITS), Number);
      endValue = map(match(this.end, _DIGITS), Number);
      delta = map(startValue, function(value, i) {
        return endValue[i] - value;
      });
      calculateValue = function(t) {
        return "rect(" + map(startValue, function(value, i) {
          return Math.round(ease(t, value, delta[i], duration));
        }).join("px, ") + "px)";
      };
    } else if (/\d/.test(this.end)) { // Numeric. I probably need a better test!
      var unit = String(this.end).replace(/^[-.\d]+/, "").toLowerCase();  // strip number
      if (parseInt(startValue) == 0) startValue = this.start = 0 + unit;
      startValue = Number(String(startValue).replace(unit, ""));          // strip unit
      endValue = Number(String(this.end).replace(unit, ""));              // strip unit
      delta = endValue - startValue;
      calculateValue = function(t) {
        var value = ease(t, startValue, delta, duration);
        if (unit == "px") value = Math.round(value);
        return value + unit;
      };
    } else {
      endValue = this.end || "";
      calculateValue = function(t) { // flip halfway
        return ease(t, 0, 1, duration) < 0.5 ? startValue : endValue;
      };
    }

    var timestamp = Date2.now(),
        complete = this.compare(this.start, "end"),
        reversed = false,
        started = 0,
        paused = 0,
        delay = this.delay * 1000,
        duration = this.duration * 1000,
        speed = 1,
        elapsedTime = 0;

    if (typeof ease != "function") {
      ease = Transition.timingFunctions[ease];
    }
    
    assertType(ease, "function", "Invalid timing function.");

    this.tick = function(now) {
      if (!complete && !paused) {
        elapsedTime = now - timestamp;
        if (!started && elapsedTime >= delay) {
          started = now;
        }
        if (started) {
          elapsedTime = Math.min((now - started) * speed, duration);
          complete = elapsedTime >= duration;
          var t = reversed ? duration - elapsedTime : elapsedTime;
          CSSStyleDeclaration.setProperty(style, propertyName, calculateValue(t), "");
          if (complete) {
            behavior.dispatchEvent(element, "transitionend", {propertyName: propertyName, elapsedTime: (now - timestamp) / 1000});
          }
        }
      }
      return !complete;
    };

    this.flip = function() {
      var temp = this.start;
      this.start = this.end;
      this.end = temp;
      reversed = !reversed;
      if (started) {
        started = Date2.now() - (duration - elapsedTime) / speed;
      }
    };

    /*this.stop = function() {
      speed = 1;
      paused = 0;
      complete = true;
    };

    this.pause = function() {
      paused = Date2.now();
    };

    this.resume = function() {
      started += Date2.now() - paused;
      paused = 0;
    };*/

    this.setSpeed = function(s) {
      if (started) {
        speed = s;
        started = Date2.now() - elapsedTime / speed;
      }
    };
  },

  delay: 0,
  duration: 1, // seconds
  timing: "ease",
  //start: null,
  //end: null,

  compare: function(value, position) {
    if (/color$/i.test(this.property)) {
      return this.parseColor(this[position]).join(",") == this.parseColor(value).join(",");
    } else if (this.property == "clip") {
      // Stoopid incompatible clip rects:
      // http://www.ibloomstudios.com/articles/misunderstood_css_clip/
      return this[position].replace(/,\s*/g, " ") == value.replace(/,\s*/g, " ");
    }
    return this[position] == value;
  },

  parseColor: function(color) { // return an array of rgb values
    var colors = Transition.colors; // cache
    if (!colors[color]) {
      if (/^rgb/.test(color)) {
        colors[color] = map(color.match(_DIGITS), Number);
      } else if (color.indexOf("#") == 0) {
        var hex = color.slice(1);
        if (hex.length == 3) hex = hex.replace(/([0-9a-f])/g, "$1$1");
        colors[color] = map(hex.match(/([0-9a-f]{2})/g), _parseInt16);
      } else {
        // If it's a named colour then use getComputedStyle to parse it.
        // Meh. It's ugly but it's less code than a table of colour names.
        var dummy = Transition._dummy;
        if (dummy) {
          document.body.appendChild(dummy);
        } else {
          dummy = Transition._dummy = _createDummyElement("input");
        }
        try {
          dummy.style.color = color;
          var computedValue = ViewCSS.getComputedPropertyValue(document.defaultView, dummy, "color");
        } catch (x) {}
        document.body.removeChild(dummy);
        if (computedValue != color) {
          colors[color] = this.parseColor(computedValue || "#000");
        }
      }
    }
    var rgb = colors[color];
    if (!rgb || rgb.length != 3 || Array2.contains(rgb, NaN)) {
      throw "Invalid color '" + color + "'.";
    }
    return rgb;
  }
}, {
  timingFunctions: {
    "ease": function(t, b, c, d) {
      if ((t/=d/2) < 1) {
        return c/2*t*t*t*t + b;
      }
      return -c/2 * ((t-=2)*t*t*t - 2) + b;
    },

    "linear": function(t, b, c, d) {
      return c*t/d + b;
    },

    "ease-in": function(t, b, c, d) {
      return c*(t/=d)*t + b;
    },

    "ease-out": function(t, b, c, d) {
      return -c *(t/=d)*(t-2) + b;
    },

    "ease-in-out": function(t, b, c, d) {
      if ((t/=d/2) < 1) {
        return c/2*t*t + b;
      }
      return -c/2 * ((--t)*(t-2) - 1) + b;
    }
  },
  
  colors: {} // a cache for parsed colour values
});
