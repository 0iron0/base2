
var Transition = Base.extend({
  constructor: function(behavior, element, propertyName, params) {
    extend(this, params);
    
    this.toString = K(element.uniqueID + "." + propertyName);
    
    var style = element.style,
        startValue = this.start,
        ease = this.timing || "ease";
        
    if (startValue == null) {
      startValue = ViewCSS.getComputedPropertyValue(document.defaultView, element, propertyName);
    }

    if (propertyName == "clip") {
      startValue = map(startValue.match(/\d+/g), Number);
      var endValue = map(match(this.end, /\d+/g), Number),
          delta = map(startValue, function(value, i) {
            return endValue[i] - value;
          }),
          calculateValue = function(t) {
            return "rect(" + map(startValue, function(value, i) {
              return ease(t, value, delta[i], duration) + "px";
            }).join(", ") + ")";
          };
    } else if (/color$/i.test(propertyName)) {
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
    } else {
      var unit = String(startValue).replace(/^[-.\d]+/, "");     // strip number
      startValue = Number(String(startValue).replace(unit, "")); // strip unit
      var endValue = Number(String(this.end).replace(unit, "")), // strip unit
          delta = endValue - startValue,
          calculateValue = function(t) {
            return ease(t, startValue, delta, duration) + unit;
          };
    }

    var timestamp = Date2.now(),
        complete = false,
        started = 0,
        delay = this.delay * 1000,
        duration = this.duration * 1000;
        
    if (typeof ease != "function") {
      ease = Transition.FUNCTIONS[ease];
    }
    
    assertType(ease, "function", "Invalid easing function.");

    this.tick = function(now) {
      if (!complete) {
        var elapsedTime = now - timestamp;
        if (!started && elapsedTime >= delay) {
          started = now;
        }
        if (started) {
          elapsedTime = Math.min(now - started, duration);
          CSSStyleDeclaration.setProperty(style, propertyName, calculateValue(elapsedTime), "");
          //console2.log(assignID(this)+"/"+propertyName+": "+style[propertyName]);
          complete = elapsedTime >= duration;
          if (complete) {
            //style[propertyName] = endValue + unit;
            behavior.dispatchEvent(element, "transitionend", {propertyName: propertyName, elapsedTime: elapsedTime / 1000});
          }
        }
      }
      return !complete;
    };

    this.reverse = function() {
      endValue -= delta;
      startValue += delta;
      delta = -delta;
    };

    this.stop = function() {
      complete = true;
    };
  },
  
  parseColor: function(color) { // return an array of rgb values
    if (/^rgb/.test(color)) {
      return map(color.match(/\d+/g), Number);
    } else if (color.indexOf("#") == 0) {
      return map(color.slice(1).toLowerCase().match(/(\w\w)/g), partial(parseInt, undefined, 16));
    }
    return Transition.COLORS[color] || [0, 0, 0];
  },

  delay: 0,
  duration: 1,
  timing: "linear"
}, {
  COLORS: {
    red: [255,0,0],
    green: [0,255,0],
    blue: [0,0,255]
  },
  
  FUNCTIONS: {
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
  }/*,
  
  queue: [],
  ticking: false,
  
  tick: function() {
    this.ticking = !!this.queue.length;
    if (this.ticking) {
      var now = Date2.now();
      this.queue = filter(this.queue, function(instance) {
        return instance.tick(now);
      });
      this.ticking = !!this.queue.length;
      if (this.ticking) {
        setTimeout(bind(arguments.callee, this), 1);
      }
    }
  }*/
});
