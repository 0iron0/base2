
var element = behavior.extend({
  "repeat-min":   0,
  "repeat-max":   _MAX_VALUE,
  "repeat-start": 1,
  
  indexes: {},

  addRepetitionBlock: function(template, refNode) {
    assertArity(arguments);

    if (!this.isTemplate(template)) return;

    // count the preceding repetition blocks
    var count = 0;
    var block = template;
    while (block = block.previousSibling) {
      if (this.getRepetitionTemplate(block) == template) {
        if (this.getRepetitionIndex(block) >= this.getRepetitionIndex(template)) {
          this.setRepetitionIndex(template, this.getRepetitionIndex(block) + 1);
        }
        count++;
      }
    }

    // quit if we have reached the maximum limit
    if (count >= this.get(template, "repeat-max")) {
      return null;
    }

    /*
    // if this method was called by addRepetitionBlockByIndex()
    // then use its index
    if (arguments.callee.caller == this.addRepetitionBlockByIndex) {
      var index = arguments[2];
      if (index > this.getRepetitionIndex(template)) {
        this.setRepetitionIndex(template, index);
      }
    }
    */

    // clone this template and initialise the new block
    var block = template.cloneNode(true);

    // replace [indexed] expressions
    // we have to do this for all attribute nodes
    // special characters used by the repetiton model:
    //    '[', '\u02d1', '\u00b7', ']'
    var name = _IGNORE_NAME.test(template.id) ? "" : template.id;
    if (name) {
      var attribute;
      var safeName = name.replace(_SAFE_NAME, "\\$1");
      var pattern = new RegExp("[\\[\\u02d1]" + safeName + "[\\u00b7\\]]", "g");
      var repetitionIndex = this.getRepetitionIndex(template);
      var dummy = document.createElement("div");
      if (template.nodeName == "TR") {
        var table = document.createElement("table");
        table.appendChild(block);
        dummy.appendChild(table);
      } else {
        dummy.appendChild(block);
      }
      dummy.innerHTML = dummy.innerHTML.replace(_FIX_MSIE_BROKEN_TAG, "$1html:").replace(pattern, repetitionIndex);
      //alert(dummy.innerHTML);
      block = dummy.getElementsByTagName(template.nodeName)[0];
      block.setAttribute("repeat-template", name);
      block.removeAttribute("id");
    }
    block.removeAttribute("repeat-start");
    block.removeAttribute("repeat-min");
    block.removeAttribute("repeat-max");
    block.setAttribute("repeat", this.getRepetitionIndex(template));

    // insert the node
    if (refNode == null) {
      refNode = template;
      while (refNode.previousSibling && !this.isBlock(refNode.previousSibling)) {
        refNode = refNode.previousSibling
      }
    } else {
      refNode = refNode.nextSibling;
    }
    block.style.display = "";
    ClassList.remove(block, "jsb-template");
    ClassList.remove(block, "html5-template");
    refNode.parentNode.insertBefore(block, refNode);

    // maintain the index
    this.setRepetitionIndex(template, this.getRepetitionIndex(template) + 1);

    // fire the "added" event
    _dispatchTemplateEvent(template, "added", block);

    // return the newly created block
    return block;
  },

  moveRepetitionBlock: function(block, distance) {
    assertArity(arguments);

    if (!distance || !this.isBlock(block)) return;

    var target = block;
    var template = this.getRepetitionTemplate(block);

    if (distance < 0) {
      while (distance < 0 && target.previousSibling && !this.isTemplate(target)) {
        target = target.previousSibling;
        if (this.isBlock(target)) {
          distance++;
        }
      }
    } else {
      while (distance > 0 && target.nextSibling && !this.isTemplate(target)) {
        target = target.nextSibling;
        if (this.isBlock(target)) {
          distance--;
        }
      }
      target = target.nextSibling;
    }

    // move the block
    block.parentNode.insertBefore(block, target);

    if (template) { // not an orphan
      _dispatchTemplateEvent(template, "moved", block);
    }
  },

  removeRepetitionBlock: function(block) {
    assertArity(arguments);
    
    var template = this.getRepetitionTemplate(block);

    block.parentNode.removeChild(block);

    if (template) { // not an orphan
      _dispatchTemplateEvent(template, "removed", block);

      // maintain the mimimum number of blocks
      var min = this.get(template, "repeat-min"),
          length = this.getRepetitionBlocks(template).length;
      while (length++ < min) {
        this.addRepetitionBlock(template, null);
      }
    }
  },

  isBlock: function(element) {
    return this.getRepetitionType(element) == _REPETITION_BLOCK;
  },

  isTemplate: function(element) {
    return this.getRepetitionType(element) == _REPETITION_TEMPLATE;
  },

  getRepetitionBlocks: function(template) {
    var blocks = {
      length : 0
    };
    var block = template.parentNode.firstChild;
    while (block) {
      if (this.getRepetitionTemplate(block) == template) {
        blocks[blocks.length++] = block;
      }
      block = block.nextSibling;
    }
    return blocks;
  },
  
  getRepetitionType: function(element) {
    if (element && element.nodeType == 1) {
      var repeat = this.get(element, "repeat");
      if (repeat == "template") {
        return _REPETITION_TEMPLATE;
      }
      if (repeat != "" && repeat != null && !isNaN(repeat) && repeat >= 0 && repeat < _MAX_VALUE) {
        return _REPETITION_BLOCK;
      }
    }
    return _REPETITION_NONE;
  },

  getRepetitionIndex: function(element) {
    switch (this.getRepetitionType(element)) {
      case _REPETITION_TEMPLATE:
        return this.indexes[element.uniqueID] || 0;
      case _REPETITION_BLOCK:
        return Number(this.get(element, "repeat"));
      default:
        return 0;
    }
  },

  setRepetitionIndex: function(element, index) {
    switch (this.getRepetitionType(element)) {
      case _REPETITION_TEMPLATE:
        this.indexes[element.uniqueID] = index;
        break;
      case _REPETITION_BLOCK:
        this.set(element, "repeat", index);
        break;
    }
    return index;
  },

  getRepetitionTemplate: function(element) {
    if (this.isBlock(element)) {
      if (this.hasAttribute(element, "repeat-template")) {
        var template = document.getElementById(this.get(element, "repeat-template"));
      } else {
        template = element;
        while ((template = template.nextSibling) && !this.isTemplate(template)) {
          continue;
        }
      }
      if (template && this.isTemplate(template)) {
        return template;
      }
    }
    return null;
  }
});
