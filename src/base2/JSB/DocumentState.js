
;;; console2.log("START");
;;; console2.update();
;;; var start = Date2.now();

var DocumentState = Behavior.modify({
  EventDelegator: {
    handleEvent: function(event) {
      this.behavior["on" + event.type](event.target, event.offsetX, event.offsetY);
    }
  },

  active: false,
  busy:   false,
  loaded: false,
  ready:  false,

  readyQueue: [],
  rules: new Array2,
  
  onDOMContentLoaded: function() {
    this.loaded = true;
    ;;; console2.log("DOMContentLoaded");
    ;;; console2.log("Document load time: " + (Date2.now() - start));
  },

  onkeydown: function() {
    this.active = this.busy = true;
  },

  onkeyup: function() {
    this.active = this.busy = false;
  },

  onmousedown: function(element, x, y) {
    // If the user has clicked on a scrollbar then carry on processing.
    this.active = this.busy = (
      x >= 0 &&
      x < element.offsetWidth &&
      y >= 0 &&
      y < element.offsetHeight
    );
  },

  onmouseup: function() {
    this.active = this.busy = false;
  },

  onmousemove: function() {
    if (!this.busy) this.setBusyState(true)
  },
  
  init: function() {
    this.attach(document);
  },

  addRule: function(selector, behavior) {
    assert(!/:/.test(selector), format("Pseudo class selectors not allowed in JSB (selector='%2').", selector));
    var query = Selector.parse(selector);
    this.rules.push({query: query, behavior: behavior});
    if (this.rules.length == 1) this.recalc(); // start the timer
  },

  fireReady: function() {
    if (!this.ready) {
      this.ready = true;
      this.dispatchEvent(document, "documentready");
      ;;; console2.log("documentready");
      ;;; console2.log("Document ready time: " + (Date2.now()  - start));
    }
  },

  isContentReady: function(element) {
    if (this.loaded || !element.canHaveChildren) return true;
    while (element && !element.nextSibling) {
      element = element.parentNode;
    }
    return !!element;
  },

  recalc: function(i, j, elements) {
    //;;; console2.log("TICK: busy=" + this.busy);
    var rules = this.rules;
    if (!this.busy) {
      // Process the contentready queue.
      var readyQueue = this.readyQueue;
      var now = Date2.now(), start = now, k = 0;
      while (readyQueue.length && (now - start < _MAX_PROCESSING_TIME)) {
        var ready = readyQueue[0];
        if (this.isContentReady(ready.element)) {
          ready.behavior.oncontentready(ready.element);
          readyQueue.shift();
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
          var state = query.state || [];
          state.unshift(document, behavior instanceof External ? 2 : _MAX_ELEMENTS);
          elements = query.apply(null, state);
          queryComplete = query.complete;
        }

        now = Date2.now(); // update the clock

        var length = elements.length, k = 0;

        if (length && behavior instanceof External) {
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
            if (this.loaded && queryComplete) { // stop processing after DOMContentLoaded
              rules.removeAt(i);
            } else i++;
          }
        }
        //if (i > rules.length - 1) i = 0; // at end, loop to first rule
        if (i >= rules.length) i = 0; // at end, loop to first rule
        count--;
      }
    }
    if (rules.length) {
      this.setTimeout(this.recalc, _TICK, i, j, elements);
    } else {
      if (!this.ready) this.fireReady(document);
    }
  },
  
  setBusyState: function(state) {
    this.busy = this.active || !!state;
    if (this.busy) this.setTimeout(this.setBusyState, 250);
  }
});
