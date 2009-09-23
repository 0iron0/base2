
jsb.eventDispatcher = new Base({
  dispatch: function(behavior, element, event, isPseudoEvent) {
    var type = event.type;
    _jsbEvent.listener = behavior["on" + type];

    if (!_jsbEvent.listener || _jsbEvent.listener == Undefined) return;

    _jsbEvent.behavior = behavior;
    _jsbEvent.args = [element, event];

    // Build the event signature.
    if (_EVENT_MOUSE.test(type)) {
      if (type == "mousewheel") {
        _jsbEvent.args.push(event.wheelDelta);
      } else {
        if (_EVENT_BUTTON.test(type)) {
          if (behavior.jsbExtendedMouse) {
            _jsbEvent.args.push(event.button);
          } else {
            if (!_MOUSE_BUTTON_LEFT.test(event.button || 0)) return;
          }
        }
        if (element == event.target) {
          var x = event.offsetX,
              y = event.offsetY;
        } else {
          var offset = ElementView.getOffsetXY(element, event.clientX, event.clientY);
          x = offset.x;
          y = offset.y;
        }
        _jsbEvent.args.push(x, y, event.screenX, event.screenY);
      }
    } else if (_EVENT_TEXT.test(type)) {
      _jsbEvent.args.push(event.keyCode, event.shiftKey, event.ctrlKey, event.altKey, event.metaKey);
    } else if (type == "propertychange" || type == "propertyset" || type == "transitionend") {
      _jsbEvent.args.push(event.propertyName);
    }

    // Trigger the underlying event.
    // Use the host's event dispatch mechanism so that we get a real
    // execution context.
    if (behavior.jsbUseDispatch && (isPseudoEvent || event.bubbles || event.eventPhase == Event.CAPTURING_PHASE)) {
      if (_fire) {
        _fire.jsbEvents++;
      } else {
        var fire = document.createEvent(_GENERIC_EVENTS);
        fire.initEvent("jsbEvents", false, false);
        document.dispatchEvent(fire);
      }
    } else {
      _jsbEvent.listener.apply(behavior, _jsbEvent.args);
    }
  }
});

// The dispatch mechanism.
var _jsbEvent = _private.jsbEvent = {};
if (detect.MSIE && !detect("element.dispatchEvent")) {
  var _fire = document.createElement(/^CSS/.test(document.compatMode) ? "meta" : "marquee");

  _fire.jsbEvents = 0;
  _fire.attachEvent("onpropertychange", new Function("e", 'if(e.propertyName=="jsbEvents"){var d=base2.toString.jsbEvent;d.listener.apply(d.behavior,d.args)}'));

  document.getElementsByTagName("head")[0].appendChild(_fire);
} else {
  document.addEventListener("jsbEvents", function() {
    _jsbEvent.listener.apply(_jsbEvent.behavior, _jsbEvent.args);
  }, false);
}

var _jsbCustomEvent = DocumentEvent.createEvent(document, _GENERIC_EVENTS);
_jsbCustomEvent.initEvent("dummy", false, false);
_jsbCustomEvent = Event.cloneEvent(_jsbCustomEvent);

function _dispatchJSBEvent(behavior, element, type) {
  _jsbCustomEvent.target = element;
  _jsbCustomEvent.type = type;
  jsb.eventDispatcher.dispatch(behavior, element, _jsbCustomEvent, true);
};
