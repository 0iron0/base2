
var Animation = Base.extend({
  constructor: function(object, params, styleElement, autostart) {
    var transitions = {}, defaultTransition;
    
    var createTransition = function(transition, propertyName) {// recurse after we've broken down shorthand properties
      // If the transition is a string then it defines the end point
      // of the transition only.
      if (typeof transition != "object") {
        transition = {end: String(transition)};
      }
      // The first transition in the list defines the default
      // values for duration and delay in subsequent transitions.
      if (!defaultTransition) defaultTransition = transition;
      transition = copy(transition);
      transition.styleElement = styleElement;
      if (transition.delay == null && defaultTransition.delay != null) {
        transition.delay = defaultTransition.delay;
      }
      if (transition.duration == null && defaultTransition.duration != null) {
        transition.duration = defaultTransition.duration;
      }

      // Break shorthand properties into the longhand version.
      // This only parses property names. Values are parsed in Transition.js.
      // Some shorthand properties cannot be parsed.
      // (I may fix backgroundPosition eventually).
      if (/^(font|background(Position)?)$/.test(propertyName)) {
        throw "Cannot animate shorthand property '" + propertyName + "'.";
      } else if (/^border(Top|Right|Bottom|Left)?$/.test(propertyName)) { // shorthand border properties
        var property = propertyName,
            start = _split(transition.start),
            end = _split(transition.end),
            names = ["Width", "Style", "Color"];
        // recurse after we've broken down shorthand properties
        forEach (end, function(end, i) {
          var params = copy(transition);
          params.start = start[i];
          params.end = end;
          createTransition(params, property + names[i]);
        });
      } else if (/^(margin|padding|border(Width|Color|Style))$/.test(propertyName)) { // shorthand rect properties (T,R,B,L)
        var property = propertyName.replace(/Width|Color|Style/, ""),
            name = propertyName.replace(property, "");
        start = _split(transition.start, true);
        end = _split(transition.end, true);
        forEach.csv ("Top,Right,Bottom,Left", function(side, i) {
          var params = copy(transition);
          params.start = start[i];
          params.end = end[i];
          //addTransition(property + side + name, params);
          transitions[property + side + name] = params;
        });
      } else {
        //addTransition(propertyName, transition);
        transitions[propertyName] = transition;
      }
    };
    
    forEach (params, createTransition);

    function addTransition(propertyName, params) {
      return _state.transitions.add(object, propertyName, params);
    };

    var started = false;
    this.start = function() {
      forEach (transitions, function(params, propertyName) {
        var transition = addTransition(propertyName, params);
        if (!started) {
          params.start = transition.start;
          params.duration = transition.duration;
        }
      });
      started = true;
    };

    this.reverse = function(duration) {
      forEach (transitions, function(transition, propertyName) {
        addTransition(propertyName, {
          end: transition.start,
          duration: duration || transition.duration,
          styleElement: styleElement
        });
      });
    };

    this.accelerate = function(rate) {
      forEach (transitions, function(transition, propertyName) {
        transition = _state.transitions.get(transition);
        if (transition) transition.accelerate(rate);
      });
    };

    /*this.pause = function() {
      forEach (transitions, function(transition, propertyName) {
        transition = _state.transitions.get(transition);
        if (transition) transition.pause();
      });
    };*/
    
    if (autostart) this.start();
  },
  
  transitions: null,

  // defined in the constructor function
  accelerate: Undefined,
  reverse:    Undefined,
  start:      Undefined/*,
  stop:       Undefined,
  pause:      Undefined*/
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
  }
});
