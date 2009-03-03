
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
      relativeValue = (value - min) / (max - min),
      style = element.style,
      width = element.clientWidth;
  style.borderLeftWidth = (relativeValue * width) + "px";
  if (!_SUPPORTS_BORDER_BOX) {
    style.width = (width - (relativeValue * width)) + "px";
  }
};
