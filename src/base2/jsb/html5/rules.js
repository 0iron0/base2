
var host = "";
var script = Array2.item(document.getElementsByTagName("script"), -1);
if (script) {
  host = script.src.replace(/[\?#].*$/, "").replace(/[^\/]*$/, "");
}

html5.rules = new RuleList({
  "meter": meter,
  "progress": progress,
  "input[type=color]": host + "chrome.php#chrome.colorpicker"
});

if (!detect("Opera")) { // TODO: check document.implementation
  html5.rules.merge({
    "input": host + "wf2.php#html5.input",
    "input[type=number]": host + "chrome.php#chrome.spinner",
    "input[type=range]": host + "chrome.php#chrome.slider",
    "input[list]": host + "chrome.php#chrome.combobox",
    "button[type=add],button.html5-add": host + "rm.php#jsb.rm.add",
    "button[type=remove],button.html5-remove": host + "rm.php#jsb.rm.remove",
    "button[type=move-up],button.html5-move-up": host + "rm.php#jsb.rm.moveup",
    "button[type=move-down],button.html5-move-down": host + "rm.php#jsb.rm.movedown"
  });
}
