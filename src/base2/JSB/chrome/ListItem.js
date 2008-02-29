
var ListItem = Behavior.extend({
  onmouseover: function(element) {
    element.style.backgroundColor = "Highlight";
    element.style.color = "HighlightText";
  },

  onmouseout: function(element) {
    element.style.backgroundColor = "";
    element.style.color = "";
  },

  onclick: function(element) {
    this.dispatchEvent(element, "itemclick", {item: element});
  }
});
