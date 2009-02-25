
;;; console2.log("START");
;;; console2.update();
;;; var begin = Date2.now();

var state = new Base({
  active: false,
  busy:   false,
  loaded: false,
  ready:  false,
  activeElement: null,

  contentReadyQueue: [],
  documentReadyQueue: [],
  rules: new Array2,

  onDOMContentLoaded: function() {
    state.loaded = true;
    ;;; console2.log("DOMContentLoaded");
    ;;; console2.log("Document load time: " + (Date2.now() - begin));
    if (!state.ready && !state.rules.length) setTimeout(state.fireReady, _TICK);
  },

  onkeydown: function() {
    state.active = state.busy = true;
  },

  onkeyup: function() {
    state.active = state.busy = false;
  },

  onmousedown: function(event) {
    state.activeElement = event.target;
    state.active = state.busy = true;
    /*
    // If the user has clicked on a scrollbar then carry on processing.
    state.active = state.busy = (
      event.offsetX < event.target.offsetWidth &&
      event.offsetY < event.target.offsetHeight
    );
    */
  },

  onmousemove: function() {
    if (!state.busy) state.setBusyState(true)
  },

  onmouseup: function() {
    state.activeElement = null;
    state.active = state.busy = false;
  },

  addRule: function(selector, behavior) {
    assert(!state.loaded, "Cannot add JSB rules after the DOM has loaded."); // for now...
    assert(!/:/.test(selector), format("Pseudo class selectors are not allowed in JSB rules (selector='%2').", selector)); // also for now...
    var query = Selector.parse(selector);
    state.rules.push({query: query, behavior: behavior});
    if (state.rules.length == 1) state.recalc(); // start the timer
  },

  fireReady: function() {
    if (!state.ready) {
      ;;; console2.log("documentready");
      ;;; console2.log("Document ready time: " + (Date2.now()  - begin));
    }
    state.ready = true;
    var documentReadyQueue = state.documentReadyQueue;
    var now = Date2.now(), start = now, k = 0;
    while (documentReadyQueue.length && (now - start < _MAX_PROCESSING_TIME)) {
      var item = documentReadyQueue.shift();
      item.behavior.ondocumentready(item.element);
      if (k++ < 5 || k % 50 == 0) now = Date2.now();
    }
    if (documentReadyQueue.length) {
      setTimeout(arguments.callee, _TICK);
    }
  },

  isContentReady: function(element) {
    if (_HTML_BODY.test(element.nodeName)) return false;
    if (state.loaded || !element.hasChildNodes()) return true;
    while (element && !element.nextSibling) {
      element = element.parentNode;
    }
    return !!element;
  },

  recalc: function(i, j, elements) {
    //;;; console2.log("TICK: busy=" + state.busy);
    var rules = state.rules;
    if (!state.busy) {
      // Process the contentready queue.
      var contentReadyQueue = state.contentReadyQueue;
      var now = Date2.now(), start = now, k = 0;
      while (contentReadyQueue.length && (now - start < _MAX_PROCESSING_TIME)) {
        var item = contentReadyQueue.shift();
        if (state.isContentReady(item.element)) {
          item.behavior.oncontentready(item.element);
        } else {
          contentReadypush(item); // add it to the end
        }
        if (k++ < 5 || k % 50 == 0) now = Date2.now();
      }

      // Process attachments.
      var count = rules.length;
      while (count && rules.length && (now - start < _MAX_PROCESSING_TIME)) {
        if (i == null) i = j = 0;
        var rule = rules[i];
        var behavior = rule.behavior;

        // Execute a DOM query.
        var queryComplete = false;
        if (!elements) {
          var query = rule.query;
          var queryState = query.state || [];
          queryState.unshift(document, behavior.constructor == External ? 2 : _MAX_ELEMENTS);
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
          while (j < length && (now - start < _MAX_PROCESSING_TIME)) {
            behavior.attach(elements[j++]);
            if (k++ < 5 || k % 50 == 0) now = Date2.now();
          }

          // Maintain the loop.
          if (j == length) { // no more elements
            j = 0;
            elements = null;
            if (state.loaded && queryComplete) { // stop processing after DOMContentLoaded
              rules.removeAt(i);
            } else i++;
          }
        }
        if (i >= rules.length) i = 0; // at end, loop to first rule
        count--;
      }
    }
    if (rules.length) {
      setTimeout(function() {
        state.recalc(i, j, elements);
      }, _TICK);
    } else {
      if (!state.ready) state.fireReady(document);
    }
  },

  setBusyState: function(state) {
    state.busy = state.active || !!state;
    if (state.busy) setTimeout(arguments.callee, 250);
  }
});

for (var i in state) if (_EVENT.test(i)) {
  EventTarget.addEventListener(document, i.slice(2), state[i], i != "onDOMContentLoaded");
}
