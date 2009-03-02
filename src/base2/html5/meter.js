
var meter = element.extend({
  value: 0,
  min: 0,
  max: 1,

  onattach: _meter_layout,
  onvaluechange: _meter_layout,
  onminchange: _meter_layout,
  onmaxchange: _meter_layout
});

function _meter_layout(element) {
  var min = this.get(element, "min"),
      max = this.get(element, "max"),
      value = this.get(element, "value"),
      relativeValue = (value - min) / (max - min);
  element.style.borderLeftWidth = (relativeValue * element.offsetWidth) + "px";
};
