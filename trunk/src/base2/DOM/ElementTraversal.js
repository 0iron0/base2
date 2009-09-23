
// NOT USED

// Based on this:
// http://www.w3.org/TR/2007/WD-ElementTraversal-20070727/

var ElementTraversal = Interface.extend({
  getChildElementCount: function(element) {
    var count = 0;
    element = element.firstChild;
    while (element) {
      if (this.isElement(element)) count++;
      element = element.nextSibling;
    }
    return count;
  },

  getFirstElementChild: function(element) {
    element = element.firstChild;
    return this.isElement(element) ? element : this.getNextElementSibling(element);
  },

  getLastElementChild: function(element) {
    element = element.lastChild;
    return this.isElement(element) ? element : this.getPreviousElementSibling(element);
  },

  getNextElementSibling: function(element) {
    // return the next element to the supplied element
    while (element && (element = element.nextSibling) && !this.isElement(element)) continue;
    return element;
  },

  getPreviousElementSibling: function(element) {
    // return the previous element to the supplied element
    while (element && (element = element.previousSibling) && !this.isElement(element)) continue;
    return element;
  },
}, {
  isElement: function(element) {
    return !!element && element.nodeType == 1;
  },

  "@(jscript<5.6)": {
    isElement: function(element) {
      return !!element && element.nodeType == 1 && element.nodeName != "!";
    }
  }
});
