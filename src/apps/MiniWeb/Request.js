
// We are basically mimicking the XMLHttpRequest object

var Request = Base.extend({
  constructor: function(method, url, data, headers) {
    this.headers = {};
    // allow quick open+send from the constructor if arguments are supplied
    if (arguments.length > 0) {
      this.open(method, url);
      for (var i in headers) {
        this.setRequestHeader(i, headers[i]);
      }
      this.send(data);
    }
  },
  
  headers: null,
  readyState: 0,
  status: 0,
//-  statusText: "",  // don't bother with this one
  method: "",
  responseText: "",
  url: "",
  
  open: function(method, url) {
    assert(this.readyState == 0, "Invalid state.");
    this.readyState = 1;
    this.method = method;
    this.url = url;
  },
  
  send: function(data) {
    assert(this.readyState == 1, "Invalid state.");
    this.readyState = 2;
    MiniWeb.send(this, data);
  },
  
  // there is no distinction between request/response headers at the moment
  
  getResponseHeader: function(header) {
    assert(this.readyState >= 3, "Invalid state.");
    return this.headers[header];
  },
  
  setRequestHeader: function(header, value) {
    assert(this.readyState == 1, "Invalid state.");
    this.headers[header] = value;
  }
});
