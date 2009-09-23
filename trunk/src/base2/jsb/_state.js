
;;; console2.update();
;;; console2.log(base2.userAgent);
;;; console2.log("START");
;;; var begin = Date2.now();
;;; var tick = 0;

var _state = new Base({
//active: false,
//busy:   false,
//loaded: false,
//ready:  false,
//started: false,
  timestamp: Date2.now(),

  contentReadyQueue: [],
  documentReadyQueue: [],
  liveRules: [],
  rules: [],
  transitions: new Transitions,

  onDOMContentLoaded: function() {
    _state.loaded = true;
    ;;; console2.log("DOMContentLoaded");
    ;;; console2.log("Document load time: " + (Date2.now() - begin));
    if (!_state.ready && !_state.rules.length) {
      setTimeout(_state.fireReady, _state.getInterval());
    }
    _state.isContentReady = True;
  },

  onblur: function() {
    _state._lastFocusElement = _state._focusElement;
    _state._focusElement = null;
  },

  onfocus: function(event) {
    _state._focusElement = event.target;
  },

  onmousedown: function(event) {
    _state.active = _state.busy = true;
    //console2.log("BUSY");
  },

  onmouseup: function() {
    _state.active = _state.busy = false;
    //console2.log("IDLE");
  },

  /*onkeydown: function() {
    _state.active = _state.busy = true;
    //console2.log("BUSY");
  },

  onkeyup: function() {
    _state.active = _state.busy = false;
    //console2.log("IDLE");
  },

  onmousemove: function() {
    if (!_state.busy) _state.setBusyState(true)
  },

  onmousewheel: function() {
    if (!_state.busy) _state.setBusyState(true)
  },*/

  addRule: function(selector, behavior) {
    var rule = {
      query: selector.toDOMQuery(),
      behavior: behavior,
      specificity: selector.getSpecificity()
    };
    ;;; rule.toString = selector.toString;
    _state.liveRules.push(rule);
    if (!_state.loaded) {
      _state.rules.push(rule);
      _state.rules.unsorted = true;
    }
    if (!_state.started) {
      _state.started = true;
      _state.tick(); // start the timer
    }
  },

  getInterval: function() {
    return _state.busy ? jsb.INTERVAL * 10 : jsb.INTERVAL;
  },

  fireReady: function() {
    if (!_state.ready) {
      _state.ready = true;
      ;;; console2.log("documentready");
      ;;; console2.log("Document ready time: " + (Date2.now()  - begin));
      Array2.batch(_state.documentReadyQueue, function(item) {
        _dispatchJSBEvent(item.behavior, item.element, "documentready");
      }, jsb.TIMEOUT, _state.parseComplete);
      _state.documentReadyQueue = [];
    }
  },

  isContentReady: function(element) {
    if (_HTML_BODY.test(element.nodeName)) return _state.loaded;
    while (element && !element.nextSibling) {
      element = element.parentNode;
    }
    return !!element;
  },

  parseComplete: function() {
    _state.rules = Array2.filter(_state.liveRules, function(rule) {
      return !!rule.behavior.attach;
    });
    _state.rules.sort(_by_specificity);
    _state.tick();
  },

  tick: function(i, j, elements) {
    //;;; console2.log("TICK: busy=" + _state.busy + "(" + (tick++) + ")");
    
    var timestamp = Date2.now(),
        rules = _state.rules,
        count = rules.length;

    if (!_state.busy && _state.timestamp - timestamp <= jsb.INTERVAL) {
      _state.timestamp = timestamp;
      
      // Process the contentready queue.
      var contentReadyQueue = _state.contentReadyQueue;
      var now = Date2.now(), start = now, k = 0;
      while (contentReadyQueue.length && (now - start < jsb.TIMEOUT)) {
        var item = contentReadyQueue.shift();
        if (_state.isContentReady(item.element)) {
          _dispatchJSBEvent(item.behavior, item.element, "contentready");
        } else {
          contentReadyQueue.push(item); // add it to the end
        }
        if (k++ < 5 || k % 50 == 0) now = Date2.now();
      }

      // Process attachments.
      while (count && rules.length && (now - start < jsb.TIMEOUT)) {
        if (i == null) i = j = 0;
        var rule = rules[i],
            behavior = rule.behavior;

        if (behavior.attach) {
          // Execute a DOM query.
          var queryComplete = false;
          if (!elements) {
            var query = rule.query;
            var queryState = query.state || [];
            queryState.unshift(document, behavior.constructor == External ? 2 : jsb.QUERY_SIZE);
            elements = query.apply(null, queryState);
            queryComplete = !!query.complete;
          }

          now = Date2.now(); // update the clock

          var length = elements.length, k = 0;

          if (length && behavior.constructor == External) {
            // Load the external behavior.
            rule.behavior = behavior.load() || behavior;
            delete query.state;
            elements = null;
            i++;
          } else {
            // Attach behaviors.
            while (j < length && (now - start < jsb.TIMEOUT)) {
              behavior.attach(elements[j++], rule);
              if (k++ < 5 || k % 50 == 0) now = Date2.now();
            }

            // Maintain the loop.
            if (j == length) { // no more elements
              j = 0;
              elements = null;
              if (_state.loaded && queryComplete) { // stop processing after DOMContentLoaded
                rules.splice(i, 1); // rules.removeAt(i);
                delete query.state;
              } else i++;
            }
          }
        } else {
          rules.splice(i, 1); // rules.removeAt(i);
        }
        if (i >= rules.length) {
          i = 0; // at end, loop to first rule
          if (rules.unsorted) {
            rules.sort(_by_specificity);
            rules.unsorted = false;
          }
        }
        count--;
      }
    }
    if (rules.length) {
      var callback = function(){_state.tick(i, j, elements)};
    } else {
      if (_state.ready) {
        callback = _state.parseComplete;
      } else {
        callback = _state.fireReady;
      }
    }
    setTimeout(callback, _state.getInterval());
  }/*,

  setBusyState: function(busy) {
    _state.busy = _state.active || !!busy;
    if (_state.busy) setTimeout(_state.setBusyState, 250);
    //console2.log(_state.busy?"BUSY":"IDLE");
  }*/
});

for (var i in _state) if (_EVENT.test(i)) {
  EventTarget.addEventListener(document, i.slice(2), _state[i], i != "onDOMContentLoaded");
}
