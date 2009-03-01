
var _MSIE = detect("MSIE");

var _currentBehavior, _handler, _eventArgs;

// The dispatch mechanism.
if (_MSIE) {
  var _fire = document.createElement("meta");
  _fire.jsbEvents = 0;
  _fire.attachEvent("onpropertychange", function(event) {
    if (event.propertyName == "jsbEvents") {
      _handler.apply(_currentBehavior, _eventArgs);
    }
  });
  document.getElementsByTagName("head")[0].appendChild(_fire);
} else {
  document.addEventListener("jsbEvents", function(event) {
    _handler.apply(_currentBehavior, _eventArgs);
  }, false);
}

function _dispatchEvent(behavior, element, event) {
  var type = event.type;
  _handler = behavior["on" + type];
  
  if (!_handler) return;
  
  _currentBehavior = behavior;
  _eventArgs = [element, event];
  
  // Build the event signature.
  if (_EVENT_MOUSE.test(type)) {
    if (type == "mousewheel") {
      _eventArgs.push(event.wheelDelta);
    } else {
      if (_EVENT_BUTTON.test(type)) {
        if (behavior.extendedMouse) {
          _eventArgs.push(event.button);
        } else {
          if (!_MOUSE_BUTTON_LEFT.test(event.button || 0)) return;
        }
      }
      if (!_EVENT_OVER_OUT.test(type)) {
        if (element == event.target) {
          var x = event.offsetX,
              y = event.offsetY;
        } else {
          var offset = ElementView.getOffsetXY(element, event.clientX, event.clientY);
          x = offset.x;
          y = offset.y;
        }
        _eventArgs.push(x, y, event.screenX, event.screenY);
      }
    }
  } else if (_EVENT_TEXT.test(type)) {
    _eventArgs.push(event.keyCode, event.shiftKey, event.ctrlKey, event.altKey, event.metaKey);
  }
  
  // Trigger the underlying event.
  // Use the host's underlying event dispatch mechanism so that we get a real
  // execution context.
  if (event.bubbles) {
    if (_MSIE) {
      _fire.jsbEvents++;
    } else {
      var fire = document.createEvent("Events");
      fire.initEvent("jsbEvents", false, false);
      document.dispatchEvent(fire);
    }
  } else {
    _handler.apply(behavior, _eventArgs);
  }
};

var _jsbEvent = Document.createEvent(document, "Events");
_jsbEvent.initEvent("dummy", false, false);
_jsbEvent = Event.cloneEvent(_jsbEvent);

function _dispatchJSBEvent(behavior, element, type) {
  _jsbEvent.target = element;
  _jsbEvent.type = type;
  _dispatchEvent(behavior, element, _jsbEvent);
};
