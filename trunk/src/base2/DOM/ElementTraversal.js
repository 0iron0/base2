
// Based on this:
// http://www.w3.org/TR/2007/WD-ElementTraversal-20070727/

var ElementTraversal = Module.extend({
  childElementCount: function(element) {
    var count = 0;
    element = element.firstChild;
    while (element) {
      if (Traversal.isElement(element)) count++;
      element = element.nextSibling;
    }
    return count;
  },

  firstElementChild: function(element) {
    element = element.firstChild;
    return Traversal.isElement(element) ? element : this.getNextElementSibling(element);
  },

  getNextElementSibling: function(element) {
    while (element && (element = element.nextSibling) && !Traversal.isElement(element)) continue;
    return element;
  },

  getPreviousElementSibling: function(element) {
    while (element && (element = element.previousSibling) && !Traversal.isElement(element)) continue;
    return element;
  },
  
  lastElementChild: function(element) {
    element = element.lastChild;
    return Traversal.isElement(element) ? element : this.getPreviousElementSibling(element);
  }
});
