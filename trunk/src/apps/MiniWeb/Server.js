
// The Server object responds to client requests

var Server = Base.extend({
  constructor: function() {
    this.io = new FileSystem;
  },
  
  io: null,
  
  interpret: function(request) {
    var interpreter = new Interpreter(request);
    try {
      return interpreter.interpret();
    } catch (error) {
      request.command = JSON.copy(interpreter);
      throw error;
    }
  },
  
  respond: function(request, data) {
    // repsond to a client request
    try {
      request.status = 202; // Accepted
      request.readyState = 3; // Receiving
      request.headers["Server"] = String(MiniWeb);
      request.post = {};
      if (typeof Server[request.method] == "function") {
        // use static methods to resolve the request method
        Server[request.method](this, request, data);
      } else {
        request.status = 405; // Method Not Allowed
      }
    } catch (error) {
      request.error = error;
      request.status = 500; // Internal Server Error
    } finally {
      if (request.method != "HEAD" && request.status > 299) { // return an error page
        request.responseText = this.interpret(request);
      }
      request.readyState = 4; // Loaded
    }
  }
}, {
  GET: function(server, request) {
    // get header info, really just makes sure the file exists
    this.HEAD(server, request);
    if (request.status == 200) { // file exists
      switch (request.headers["Content-Type"]) {
        case "text/plain":
          request.responseText = server.io.read(request.url);
          break;
        default:
          request.responseText = server.interpret(request);
      }
    }
  },
  
  HEAD: function(server, request) {
    var url = request.url.replace(/!.*$/, "");
    if (server.io.exists(url)) {
      var DIR = /\/$/;
      if (server.io.isDirectory(url) && !DIR.test(url)) {
        request.headers["Location"] = url + "/";
        request.status = 301; // Moved Permanently
      } else {
        request.status = 200; // OK
      }
    } else {
      request.status = 404; // Not Found
    }
  },
  
  OPTIONS: function(server, request) {
    request.headers["Allow"] = "OPTIONS,HEAD,GET,POST,PUT,DELETE";
    request.status = 200; // OK
  },
  
  PUT: function(server, request, data) {
    request.responseText = server.io.write(request.url, data);
    // not sure what to return here
    request.status = 200; // OK
  },
  
  DELETE: function(server, request) {
    this.HEAD(server, request);
    // not sure what to return here
    if (request.status == 200) {
      request.reponseText = server.io.remove(request.url);
    }
  },
  
  POST: function(server, request, data) {
    // build a simple object containing post data
    forEach (data.split("&"), function(data) {
      data = data.split("=");
      request.post[data[0]] = decodeURIComponent(data[1]);
    });
    // same as GET apart from post data
    this.GET(server, request);
  }
});
