
var combobox = dropdown.extend({
  // properties

  appearance: "combobox",
  list: "",
  
  // methods

  get: function(element, propertyName) {
    var value = this.base(element, propertyName);
    if (value && propertyName == "list" && typeof value == "string") {
      return this.querySelector("#" + value);
    }
    return null;
  },

  "@Opera[91]": {
    isNativeControl: function(element) {
      return element.nodeName == "INPUT" && element.list;
    }
  },

  Popup: MenuList
});
