
var _EVENT              = /^on([a-z|DOM\w+]+)$/,
    _EVENT_BUTTON       = /^mouse(up|down)|click$/,
    _EVENT_CLICK        = /click$/,
    _EVENT_MOUSE        = /^mouse|click$/,
    _EVENT_OVER_OUT     = /^mouse(over|out)$/,
    _EVENT_PSEUDO       = /^(attach|detach|(content|document)ready)$/,
    _EVENT_TEXT         = /^(key|text)/,
    _EVENT_USE_CAPTURE  = /^(focus|blur)$/;

var _CANNOT_DELEGATE    = /^(abort|error|load|scroll|(readystate|property|filter)change)$/,
    _HTML_BODY          = /^(HTML|BODY)$/,
    _MOUSE_BUTTON_LEFT  = /^[^12]$/,
    _OWNER_DOCUMENT     = detect("(element.ownerDocument)") ? "ownerDocument" : "document",
    _PREFIX             = detect("MSIE")   ? "Ms" :
                          detect("Gecko")  ? "Moz" :
                          detect("Webkit") ? "Webkit" :
                          detect("Opera")  ? "O" :
                          "";

var _allAttachments       = {},
    _hasExpandoProperties = detect("(element.getAttribute('expando'))");
