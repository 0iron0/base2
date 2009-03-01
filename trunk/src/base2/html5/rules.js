
if (!detect("Opera")) html5.rules = new RuleList({
  "button[type=add]": add,
  "button.html5-add": add,
  "button[type=remove]": remove,
  "button.html5-remove": remove,
  "button[type=move-up]": moveup,
  "button.html5-move-up": moveup,
  "button[type=move-down]": movedown,
  "button.html5-move-down": movedown
});
