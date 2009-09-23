
var combobox = dropdown.extend({
  // properties

  appearance: "combobox",
  list: "",
  
  // methods

  get: function(element, propertyName) {
    var value = this.base(element, propertyName);
    if (propertyName == "list" && value && typeof value == "string") {
      return this.querySelector("#" + value);
    }
    return value;
  },

  "@(hasFeature('WebForms','2.0'))": {
    isNativeControl: function(element) {
      return element.nodeName == "INPUT" && element.list;
    }
  },

  Popup: MenuList
});
