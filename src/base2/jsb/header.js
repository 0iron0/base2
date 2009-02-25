
var _TICK =  1, // milliseconds

// Max time for hogging the processor.
    _MAX_PROCESSING_TIME = 200,
    
// Restrict the number of elements returned by a DOM query.
// This ensures that the recalc() function does not run for too long.
// It also ensures that elements are returned in batches appropriate
// for consistent rendering.
    _MAX_ELEMENTS = 200;

var _EVENT              = /^on([a-z|DOM\w+]+)$/,
    _EVENT_BUTTON       = /^mouse(up|down)|click$/,
    _EVENT_CLICK        = /click$/,
    _EVENT_MOUSE        = /^mouse|click$/,
    _EVENT_OVER_OUT     = /^mouse(over|out)$/,
    _EVENT_PSEUDO       = /^(attach|detach|(content|document)ready)/,
    _EVENT_TEXT         = /^(key|text)/,
    _EVENT_USE_CAPTURE  = /^(focus|blur)$/;

var _CANNOT_DELEGATE    = /^(abort|error|load|scroll|(readystate|property|filter)change)$/,
    _HTML_BODY          = /^(HTML|BODY)$/,
    _MOUSE_BUTTON_LEFT  = /^[^12]$/,
    _OWNER_DOCUMENT     = detect("(element.ownerDocument)") ? "ownerDocument" : "document";
