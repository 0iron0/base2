
//console2.log("draggable.js");

eval(base2.JSB.namespace);

var Draggable = Behavior.modify({
  index: 100,
  
  onmousedown: function(element, event) {
    if (!this.dragElement) {
      this.dragElement = element;
      this.dragX = event.screenX - element.offsetLeft;
      this.dragY = event.screenY - element.offsetTop;
      this.setCapture(element);
      element.style.zIndex = Draggable.index++;
      this.dispatchEvent(element, "dragstart");
    }
    event.preventDefault();
  },

  onmouseup: function(element) {
    if (this.dragElement == element) {
      this.dragElement = null;
      this.releaseCapture(element);
      this.dispatchEvent(element, "dragstop");
    }
  },

  onmousemove: function(element, event) {
    if (this.dragElement == element) {
      this.move(element, event.screenX - this.dragX, event.screenY - this.dragY);
    }
  },

  move: function(element, left, top) {
    element.style.left = left + "px";
    element.style.top = top + "px";
  },

  "@MSIE5.+win": {
    onattach: function(element) {
      element.style.width = (parseInt(element.currentStyle.width) + 50) + "px";
      element.style.height = (parseInt(element.currentStyle.height) + 50) + "px";
    }
  }
});

Draggable.Dean = Behavior.modify({
  messages: [
    "This example demonstrates cross-browser JavaScript Behaviors (JSB).",
    "Drag these boxes around. The drag/drop mechanism is implemented entirely in a JavaScript Behavior.",
    "You can download this example "
  ].reverse(),

  message: "",
  messageIndex: 0,
  
  onattach: function(element) {
    this.setTimeout(this.displayMessage, 4000, element);
  },

  ondragstop: function(element) {
    var pointer = this.querySelector(element, "~#pointer");
    var bubble = this.querySelector(element, "~#bubble");

    // what side of the screen am i on?
    var position = (element.offsetLeft > (element.parentNode.clientWidth - element.offsetWidth) / 2) ? "right" : "left";
    // re-position the speech bubble
    if (position == "left") {
      pointer.style.left = (element.offsetLeft + element.offsetWidth + 2) + "px";
      bubble.style.left = (pointer.offsetLeft + pointer.offsetWidth) + "px";
    } else {
      pointer.style.left = (element.offsetLeft - pointer.offsetWidth - 2) + "px";
      bubble.style.left = (pointer.offsetLeft - bubble.offsetWidth) + "px";
    }
    pointer.style.top = (element.offsetTop + 75) + "px";
    bubble.style.top = (pointer.offsetTop - 10) + "px";
    // bring the bubble to the top
    pointer.style.zIndex = Draggable.index;
    bubble.style.zIndex = Draggable.index;
    element.style.zIndex = ++Draggable.index;
    // change the image so that I'm looking the right way
    element.style.backgroundImage = "url(me_" + position + ".jpg)";
  },

  changeMessage: function(element) {
    // load a new message
    if (this.messages.length) {
      this.message = this.messages.pop();
      this.messageIndex = 0;
      this.displayMessage(element);
    } else {
      // the last message is a pointer to the download area
      this.querySelector(element, "~#bubble").innerHTML += "<a href=\"/download/\">here</a>.";
    }
  },

  displayMessage: function(element) {
    // update the message display one letter at a time
    var bubble = this.querySelector(element, "~#bubble");
    if (this.messageIndex < this.message.length) {
      // get the next letter/character
      var letter = this.message.charAt(this.messageIndex++);
      // create a dom text node
      var textNode = document.createTextNode(letter);
      // update the message display
      bubble.appendChild(textNode);
      // pause before writing the next letter (extra pause for
      //  a new sentence)
      this.setTimeout(this.displayMessage, (letter == ".") ? 2000 : 80, element);
    } else {
      // clear the old message
      if (this.messages.length) bubble.innerHTML = "";
      // pause before loading the next message
      this.setTimeout(this.changeMessage, 2000, element);
    }
  }
});
