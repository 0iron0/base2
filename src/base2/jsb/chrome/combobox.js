
var combobox = dropdown.extend({
  // properties

  appearance: "combobox",
  list: "",
  
  // methods

  get: function(element, propertyName) {
    var value = this.base(element, propertyName);
    if (propertyName == "list" && typeof value == "string") {
      return this.querySelector("#" + value);
    }
    return null;
  },

  Popup: MenuList
});
