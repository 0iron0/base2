
Selector.pseudoClasses = { //-dean: lang()
  "checked":     "e%1.checked",
  "contains":    "e%1[Traversal.$TEXT].indexOf('%2')!=-1",
  "disabled":    "e%1.disabled",
  "empty":       "Traversal.isEmpty(e%1)",
  "enabled":     "e%1.disabled===false",
  "first-child": "!Traversal.getPreviousElementSibling(e%1)",
  "last-child":  "!Traversal.getNextElementSibling(e%1)",
  "only-child":  "!Traversal.getPreviousElementSibling(e%1)&&!Traversal.getNextElementSibling(e%1)",
  "root":        "e%1==Traversal.getDocument(e%1).documentElement"
/*  "lang": function(element, lang) {
    while (element && !element.getAttribute("lang")) {
      element = element.parentNode;
    }
    return element && lang.indexOf(element.getAttribute("lang")) == 0;
  }, */
};
