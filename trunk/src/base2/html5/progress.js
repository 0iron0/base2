
var progress = element.extend({
  max: 1,
  value: 0,

  appearance: "progressbar",

  onattach: _progress_layout,
  onmaxchange: _progress_layout,
  onvaluechange: _progress_layout
});

function _progress_layout(element) {
  var max = this.get(element, "max"),
      value = this.get(element, "value"),
      relativeValue = value / (max - min);
  element.style.borderLeftWidth = (relativeValue * element.offsetWidth) + "px";
};
