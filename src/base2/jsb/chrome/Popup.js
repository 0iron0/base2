
var Popup = Base.extend({
  constructor: function(owner) {
    this.owner = owner;
    var body = this.body = this.createBody();
    body.className = "chrome-popup";
    var appearance = this.appearance;
    if (appearance && appearance != "popup") {
      body.className += " chrome-" + appearance;
    }
    var popup = this;
    for (var i in this) {
      if (_EVENT.test(i)) {
        EventTarget.addEventListener(body, i.slice(2), function(event) {
          switch (event.type) {
            case "mousedown":
              popup.active = true;
              //event.preventDefault();
              //event.stopPropagation();
              break;
            case "mouseup":
              popup.active = false;
              //event.preventDefault();
              //event.stopPropagation();
              break;
            case "mouseover":
            case "mouseout":
              if (event.target == this) return;
          }
          popup["on" + event.type](event);
        }, false);
      }
    }
  },

  // properties

  appearance: "popup",
  width: "auto",
  height: "auto",
  
  // events

  onkeydown: function(event) {
    if (event.keyCode == 27) { // escape
      this.hide();
    }
  },

  onmousedown: Undefined,
  onmouseup: Undefined,
  
  // methods

  createBody: function() {
    return document.createElement("div");
  },

  hide: function() {
    //console2.log("HIDE");
    var parent = this.body.parentNode;
    if (parent) parent.removeChild(this.body);
    delete this.element;
    delete control._popup;
  },

  isActive: function() {
    return true;
  },

  isOpen: function() {
    return !!this.body.parentNode;
  },

  movesize: function() {
    var element = this.element,
        document = element.ownerDocument,
        style = this.body.style,
        offset = behavior.getOffsetFromBody(element);
    style.left = offset.left + PX;
    style.top = (offset.top + element.offsetHeight) + PX;
    switch (this.width) {
      case "auto":
        style.minWidth = (element.offsetWidth - 2) + PX;
        style.maxWidth = (document.documentElement.clientWidth - offset.left - 2) + PX;
        break;
      case "base":
        style.width = (element.offsetWidth - 2) + PX;
        break;
      default:
        style.width = this.width + PX;
    }
    document.body.appendChild(this.body);
  },

  render: function(html) {
    this.body.innerHTML = html || "";
  },

  show: function(element) {
    //console2.log("SHOW");
    this.element = element;
    this.render();
    this.style();
    this.movesize();
    this.body.style.visibility = "visible";
    control._popup = this;
  },

  style: function() {
    var style = this.body.style;
    style.cssText = "";
    var computedStyle = behavior.getComputedStyle(this.element);
    forEach.csv("backgroundColor,color,fontFamily,fontSize,fontWeight,fontStyle", function(propertyName) {
      style[propertyName] = computedStyle[propertyName];
    });
    if (style.backgroundColor == "transparent") {
      style.backgroundColor = "white";
    }
  },

  // Inserting content into the document body whilst it is loading will result
  // in an "operation aborted" error. So we use a popup object instead. (MSIE)
  "@(typeof createPopup=='object')": {
    createBody: function() {
      var popup = this.popup = createPopup(),
          document = popup.document,
          body = document.body;
  		document.createStyleSheet().cssText = "body{margin:0}body *{cursor:default}" + _theme.cssText;
  		assignID(document);
      popup.show(); // init
      popup.hide();
      return body;
    },
    
    hide: function() {
      //console2.log("HIDE");
      this.popup.hide();
      delete this.element;
      delete control._popup;
    },

    isOpen: function() {
		  return this.popup.isOpen;
    },

    movesize: function() {
  		var popup = this.popup,
          body = this.body,
          element = this.element;

  		// size and position the popup window relative to the associated element
  		var left = 0, top = element.offsetHeight - 1,
          width = this.width, height = this.height; // TODO: Is there enough room below? Otherwise check above

  		if (width == "base") {
  			width = element.offsetWidth;
  		} else if (width == "auto") {
  			width = 2;
  		}
  		if (height == "auto") {
  			height = 2;
  		}

  		// resize
  		if (width == 2 || height == 2) {
        body.onload = function() {
    			setTimeout(function() {
            var rect = element.getBoundingClientRect();
      			if (width == 2) {
      				width = Math.max(Math.min(body.scrollWidth + 2, document.documentElement.clientWidth - rect.left - 2), element.offsetWidth);
      			}
      			if (height == 2) {
      				height = Math.min(body.scrollHeight + 2, 100);
      			}
  		      popup.show(0, top, width, height, element);
          }, 1);
        };
  		}
  		popup.show(0, top, width, height, element);
    }
  }
});
