
var MenuList = PopupWindow.extend({
  constructor: function(owner) {
    this.base(owner);
    this.data = {};
  },

  // properties

  appearance: "menulist",

  // events

  onmouseup: function(event) {
    this.select(this.currentItem);
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
      case 36: // home
        this.highlight(Traversal.getFirstElementChild(this.body));
        break;
      case 35: // end
        this.highlight(Traversal.getLastElementChild(this.body));
        break;
      default:
        this.base(event);
    }
  },

  onmouseover: function(event) {
    this.highlight(event.target);
  },

  // methods

  getUnitHeight: function() {
    var item = Traversal.getFirstElementChild(this.body);
    return item ? item.offsetHeight : 1;
  },

  highlight: function(item) {
    if (item) {
      this.reset(this.currentItem);
      this.currentItem = item;
      with (item.style) {
        backgroundColor = _HIGHLIGHT;
        color = _HIGHLIGHT_TEXT;
      }
    }
  },

  layout: function() {
    this.currentItem = null;
    var data = this.data[this.element.uniqueID];
    if (data) this.highlight(this.body.childNodes[data.index]);
    else this.highlight(Traversal.getFirstElementChild(this.body));
  },

  render: function() {
    var list = this.owner.get(this.element, "list"),
        html = "";
    if (list) {
      //var attributes = 'role="listitem" unselectable="on" tabindex="-1"';
      var attributes = 'role="listitem" unselectable="on"';
      if (list.nodeType == 1) {
        if (list.nodeName != "SELECT") {
          list = NodeSelector.querySelector(list, "select");
        }
        if (list) {
          var options = list.innerHTML.split(/<\/option>/i).join("");
          html = trim(options).replace(/<option/gi, '</div><div ' + attributes).slice(6) + '</div>';
        }
      } else {
        if (Array2.like(list)) {
          html = wrap(list, "div", attributes);
        } else {
          html = reduce(list, function(html, text, value) {
            return html += '<div ' + attributes + ' value="' + value + '">' + text + '</div>';
          });
        }
      }
    }
    this.base(html);
    this.body.setAttribute("role", "list");
  },

  reset: function(item) {
    if (item) with (item.style) {
      backgroundColor = "";
      color = "";
    }
  },

  select: function(item) {
    var value = Element.getAttribute(item, "value") || trim(item[_TEXT_CONTENT]),
        element = this.element;
        
    this.data[element.uniqueID] = {
      index: Traversal.getNodeIndex(item),
      value: value
    };
    this.owner.setValue(element, value);
    element.focus();
    this.hide();
  }
});
