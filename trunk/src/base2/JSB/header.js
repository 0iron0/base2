
var _MSIE  = detect("MSIE");

// Max time for hogging the processor.
var _MAX_PROCESSING_TIME = 200; // milliseconds

// Restrict the number of elements returned by a DOM query
// This ensures that the recalc() function does not run for too long.
// It also ensures that elements are returned in batches
// appropriate for consistent rendering.
var _MAX_ELEMENTS = 200;

var _TICK =  0;

var _EVENT          = /^on(DOM\w+|[a-z]+)$/,
    _EVENT_BUTTON   = /^mouse(up|down)|click$/,
    _EVENT_CAPTURE  = /^(focus|blur)$/,
    _EVENT_CLICK    = /click$/,
    _EVENT_MOUSE    = /^mouse|click$/,
    _EVENT_TEXT     = /^(key|text)/;

var _MOUSE_BUTTON_LEFT = /^[^12]$/;
