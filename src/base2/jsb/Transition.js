
// Special parsing of colours and "clip" are bulking this out. :-(

var Transition = Base.extend({
  constructor: function(object, propertyName, params) {
    extend(this, params);

    this.toString = K(Transition.getKey(object, propertyName, params));
    
    this.propertyName = propertyName;

    var styleElement = this.styleElement,
        startValue = this.start,
        ease = this.timing;
        
    if (styleElement) propertyName = CSSStyleDeclaration.getPropertyName(propertyName);
        
    if (startValue == null) {
      startValue = this.start = object[propertyName] ||
        (styleElement ? ViewCSS.getComputedPropertyValue(document.defaultView, styleElement, propertyName) : "") || "";
    }
    
    // Parse the start/end values and create the underlying timing function.
    if (/color$/i.test(propertyName)) {
      startValue = this.parseColor(startValue);
      var endValue = this.parseColor(this.end),
          delta = map(startValue, function(value, i) {
            return endValue[i] - value;
          }),
          calculateValue = function(t) {
            return "#" + map(startValue, function(value, i) {
              value = Math.round(ease(t, value, delta[i], duration));
              return (value < 16 ? "0" : "") + value.toString(16);
            }).join("");
          };
    } else if (styleElement && propertyName == "clip") {
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
    } else if (/^\-?\.?\d/.test(this.end)) { // Numeric.
      var unit = String(this.end).replace(/^[-.\d]+/, "").toLowerCase();  // strip number
      if (!parseFloat(startValue)) startValue = this.start = 0 + unit;
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
      calculateValue = function(t) { // flip only at the end
        return ease(t, 0, 1, duration) < 1 ? startValue : endValue;
      };
    }

    var timestamp = 0,
        reversed = false,
        started = 0,
        paused = 0,
        delay = ~~(this.delay * 1000),
        duration = ~~(this.duration * 1000),
        speed = 1,
        elapsedTime = 0;

    if (typeof ease != "function") {
      ease = Animation.timingFunctions[ease];
    }
    
    assertType(ease, "function", "Invalid timing function.");
    
    this.tick = function(now) {
      if (!timestamp) timestamp = now;
      if (!this.complete && !paused) {
        elapsedTime = now - timestamp;
        if (!started && elapsedTime >= delay) {
          started = now;
        }
        if (started) {
          elapsedTime = Math.round(Math.min((now - started) * speed, duration));
          
          var t = reversed ? duration - elapsedTime : elapsedTime;
          
          if (styleElement) {
            CSSStyleDeclaration.setProperty(object, propertyName, calculateValue(t));
          } else {
            object[propertyName] = calculateValue(t);
          }


          this.complete = elapsedTime >= duration;
          if (this.complete) {
            this.elapsedTime = now - timestamp;
          }
        }
      }
    };

    this.reverse = function() {
      var temp = this.start;
      this.start = this.end;
      this.end = temp;
      this.complete = false;
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
      speed = s;
      if (started) {
        started = Date2.now() - elapsedTime / speed;
      }
    };

    this.accelerate = function(rate) {
      this.setSpeed(speed * rate);
    };
  },

  complete: false,
  delay: 0,
  duration: 1, // seconds
  timing: "ease",
  start: null,
  end: null,

  compare: function(value, position) {
    if (/color$/i.test(this.propertyName)) {
      return this.parseColor(this[position]).join(",") == this.parseColor(value).join(",");
    } else if (this.propertyName == "clip") {
      // Stoopid incompatible clip rects:
      // http://www.ibloomstudios.com/articles/misunderstood_css_clip/
      var COMMAS = /,\s*/g;
      return this[position].replace(COMMAS, " ") == value.replace(COMMAS, " ");
    }
    return this[position] == value;
  },

  parseColor: function(color) { // return an array of rgb values
    color = color.toLowerCase();
    var colors = Transition.colors, // cache
        value = color,
        rgb = colors[color];
    if (typeof rgb == "string") {
      value = rgb;
      rgb = "";
    }
    if (!rgb) {
      if (/^rgb/.test(value)) {
        rgb = map(value.match(_RGB_VALUE), function(value) {
          return value.indexOf("%") == -1 ?
            value - 0 :
            Math.round(2.55 * value.slice(0, -1));
        });
      } else if (value.indexOf("#") == 0) {
        var hex = value.slice(1);
        if (hex.length == 3) hex = hex.replace(/([0-9a-f])/g, "$1$1");
        rgb = map(hex.match(/([0-9a-f]{2})/g), _parseInt16);
      } else {
        // If it's a named colour then use getComputedStyle to parse it.
        // Meh. It's ugly but it's less code than a table of colour names.
        var dummy = Transition._dummy;
        if (!dummy) {
          dummy = Transition._dummy = document.createElement("input");
          dummy.style.cssText = "position:absolute;left:0;top:-9999px;";
        }
        document.body.appendChild(dummy);
        try {
          dummy.style.color = value;
          var computedValue = ViewCSS.getComputedPropertyValue(document.defaultView, dummy, "color");
        } catch (x) {}
        document.body.removeChild(dummy);
        if (computedValue != value) {
          rgb = this.parseColor(computedValue || "#000");
        }
      }
      if (!rgb || rgb.length != 3 || Array2.contains(rgb, NaN)) {
        throw "Invalid color '" + color + "'.";
      }
      colors[color] = rgb;
    }
    return rgb;
  }
}, {
  colors: {}, // a cache for parsed colour values

  getKey: function(object, propertyName, params) {
    var target = params.styleElement || object,
        key = assignID(target);
    if (params.styleElement) key += ".style";
    return key + "." + propertyName;
  }
});
