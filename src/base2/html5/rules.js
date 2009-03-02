
html5.rules = new RuleList({
  "meter": meter
});

if (!detect("Opera")) html5.rules.merge({
  "button[type=add],button.html5-add": jsb.host + "rm.php#jsb.rm.add",
  "button[type=remove],button.html5-remove": jsb.host + "rm.php#jsb.rm.remove",
  "button[type=move-up],button.html5-move-up": jsb.host + "rm.php#jsb.rm.moveup",
  "button[type=move-down],button.html5-move-down": jsb.host + "rm.php#jsb.rm.movedown"
});

if (!detect("Opera")) html5.rules.merge({
  "input": jsb.host + "wf2.php#html5.input",
  "input[type=number],input.jsb-spinner": jsb.host + "chrome.php#chrome.spinner",
});
