
chrome.rules = new RuleList({
  "input.jsb-colorpicker": colorpicker,
  "input.jsb-slider": slider,
  "input.jsb-progressbar": progressbar,
  "input.jsb-combobox": combobox,
  "input.jsb-spinner": spinner,
  "input.jsb-timepicker": timepicker,
  "input.jsb-datepicker": datepicker,
  "input.jsb-weekpicker": weekpicker,
  "input.jsb-monthpicker": monthpicker
});

if (jsb.clientWidth2) jsb.createStyleSheet("input[class*=jsb-]{behavior:url(dimensions.htc)}");
