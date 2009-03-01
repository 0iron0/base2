
;;; console2.log("START");
;;; console2.update();
;;; var begin = Date2.now();

var _state = new Base({
//active: false,
//activeElement: null,
//busy:   false,
//loaded: false,
//ready:  false,
//started: false,
  timestamp: Date2.now(),

  contentReadyQueue: [],
  documentReadyQueue: [],
  liveRules: new Array2,
  rules: new Array2,

  onDOMContentLoaded: function() {
    _state.loaded = true;
    ;;; console2.log("DOMContentLoaded");
    ;;; console2.log("Document load time: " + (Date2.now() - begin));
    if (!_state.ready && !_state.rules.length) {
      setTimeout(_state.fireReady, _state.getInterval());
    }
  },

  onkeydown: function() {
    _state.active = _state.busy = true;
  },

  onkeyup: function() {
    _state.active = _state.busy = false;
  },

  onmousedown: function(event) {
    _state.activeElement = event.target;
    _state.active = _state.busy = true;
    /*
    // If the user has clicked on a scrollbar then carry on processing.
    _state.active = _state.busy = (
      event.offsetX < event.target.offsetWidth &&
      event.offsetY < event.target.offsetHeight
    );
    */
  },

  onmousemove: function() {
    if (!_state.busy) _state.setBusyState(true)
  },

  onmouseup: function() {
    _state.activeElement = null;
    _state.active = _state.busy = false;
  },

  addRule: function(selector, behavior) {
    if (selector.isPseudo()) {
      throw "Pseudo class selectors are not allowed in JSB rules (selector='" + selector + "').";
    }
    var rule = {
      selector: selector,
      query: Selector.parse(selector),
      behavior: behavior,
      specificity: selector.getSpecificity()
    };
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
    return _state.busy ? Math.sqrt(jsb.INTERVAL) * 50 : jsb.INTERVAL;
  },

  fireReady: function() {
    var documentReadyQueue = _state.documentReadyQueue,
        now = Date2.now(), start = now, k = 0;
    while (documentReadyQueue.length && (now - start < jsb.TIMEOUT)) {
      var item = documentReadyQueue.shift();
      _dispatchJSBEvent(item.behavior, item.element, "documentready");
      if (k++ < 5 || k % 50 == 0) now = Date2.now();
    }
    if (documentReadyQueue.length) {
      setTimeout(arguments.callee, _state.getInterval());
    } else {
      ;;; console2.log("documentready");
      ;;; console2.log("Document ready time: " + (Date2.now()  - begin));
      _state.ready = true;
      setTimeout(_state.parseComplete, _state.getInterval());
    }
  },

  isContentReady: function(element) {
    if (_HTML_BODY.test(element.nodeName)) return false;
    if (_state.loaded || !element.hasChildNodes()) return true;
    while (element && !element.nextSibling) {
      element = element.parentNode;
    }
    return !!element;
  },

  parseComplete: function() {
    _state.rules = _state.liveRules.copy();
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
          contentReadypush(item); // add it to the end
        }
        if (k++ < 5 || k % 50 == 0) now = Date2.now();
      }

      // Process attachments.
      while (count && rules.length && (now - start < jsb.TIMEOUT)) {
        if (i == null) i = j = 0;
        var rule = rules[i],
            behavior = rule.behavior;

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
          rule.behavior = behavior.getObject() || behavior;
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
              rules.removeAt(i);
              delete query.state;
            } else i++;
          }
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
  },

  setBusyState: function(_state) {
    _state.busy = _state.active || !!_state;
    if (_state.busy) setTimeout(arguments.callee, 250);
  }
});

for (var i in _state) if (_EVENT.test(i)) {
  EventTarget.addEventListener(document, i.slice(2), _state[i], i != "onDOMContentLoaded");
}

function _by_specificity(selector1, selector2) {
  return selector2.specificity - selector1.specificity;
};
