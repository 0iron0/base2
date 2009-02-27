
var MenuList = Popup.extend({
  constructor: function(owner) {
    this.base(owner);
    this.data = {};
  },

  // properties
  
  appearance: "menulist",
  lists: {},
  
  // events

  onclick: function(event) {
    this.select(event.target);
  },

  onkeydown: function(event) {
    switch (event.keyCode) {
      case 13: // return
        this.select(this.currentItem);
        event.preventDefault();
        break;
      case 38: // up
        if (this.currentItem) {
          this.highlight(Traversal.getPreviousElementSibling(this.currentItem));
        } else {
          this.highlight(Traversal.getFirstElementChild(this.body));
        }
        break;
      case 40: // down
        if (this.currentItem) {
          this.highlight(Traversal.getNextElementSibling(this.currentItem));
        } else {
          this.highlight(Traversal.getFirstElementChild(this.body));
        }
        break;
      default:
        this.base(event);
    }
  },

  onmouseover: function(event) {
    this.highlight(event.target);
  },

  // methods

  highlight: function(item) {
    if (item) {
      this.reset(this.currentItem);
      this.currentItem = item;
      with (item.style) {
        backgroundColor = MenuList.HIGHLIGHT;
        color = MenuList.HIGHLIGHT_TEXT;
      }
    }
  },

  render: function() {
    var id = this.owner.get(this.element, "list"),
        lists = this.lists;
    if (id && !lists[id]) {
      var list = behavior.querySelector("#" + id);
      if (list) {
        lists[id] = trim(list.innerHTML.replace(/(<\/?)\w+/g, "$1p").replace(/>\s+</g, "><"));
      }
    }
    this.base(lists[id] || "");
  },

  reset: function(item) {
    if (item) with (item.style) {
      backgroundColor = "";
      color = "";
    }
  },

  select: function(item) {
    var value = Element.getAttribute(item, "value") || item[Traversal.TEXT],
        element = this.element;
    this.data[element.uniqueID] = {
      index: Traversal.getNodeIndex(item),
      value: value
    };
    element.value = value;
    element.focus();
    this.hide();
  },

  show: function(element) {
    this.base(element);
    this.currentItem = null;
    var data = this.data[element.uniqueID];
    if (data) this.highlight(this.body.childNodes[data.index]);
    else this.highlight(Traversal.getFirstElementChild(this.body));
  }
}, {
  // constants
  
  HIGHLIGHT:      "Highlight",
  HIGHLIGHT_TEXT: "HighlightText",


  "@Webkit([1-4]|5[01]|52[^89])|theme=aqua": {
    HIGHLIGHT:      "#427cd9",
    HIGHLIGHT_TEXT: "white"
  }
});
