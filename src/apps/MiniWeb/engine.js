/*
  base2 - copyright 2007-2009, Dean Edwards
  http://code.google.com/p/base2/
  http://www.opensource.org/licenses/mit-license.php

  Contributors:
    Doeke Zanstra
*/

// timestamp: Thu, 01 Oct 2009 14:36:39

new function(_no_shrink_) { ///////////////  BEGIN: CLOSURE  ///////////////

// =========================================================================
// MiniWeb/package.js
// =========================================================================
/*
  MiniWeb - copyright 2007-2008, Dean Edwards
  http://www.opensource.org/licenses/mit-license.php
*/

// An active document thing

var MiniWeb = new base2.Package(this, {
  name:    "MiniWeb",
  exports: "Client,Server,JSONFileSystem,JSONDirectory,FileSystem,Command,Interpreter,Terminal,Request,History",
  imports: "Enumerable,io",
  version: "0.7.2",
  
  $$: {data: {}},
  
  DOCTYPE: '<!doctype html>',
  SCRIPT:  '<script type="text/javascript">\r\n%1\r\n<\/script>',
  
  client: null,
  dirty: false,
  readOnly: true,
  server: null,
  terminal: null,
  
  init: function() {
    // create page style
    document.write("<style>html,body{margin:0;padding:0;height:100%;overflow:hidden}#window{width:100%;height:100%;}</style>");
    
    // delegate some methods to the client
    base2.lang.forEach.csv ("navigateTo,refresh,reload,submit", function(method) {
      this[method] = function() {
        var args = arguments;
        var client = MiniWeb.client;
        // use a timer to jump out of an event
        setTimeout(function() {
          client[method].apply(client, args);
        }, 0);
      };
    }, this);
    
    window.onload = function() {
      MiniWeb.readOnly = location.protocol != "file:" || LocalFile.prototype.open == NOT_SUPPORTED;
      MiniWeb.server = new Server;
      MiniWeb.terminal = new Terminal;
      MiniWeb.client = new Client;
    };
    
    window.MiniWeb = this;
  },
  
  register: function(window) {
    this.client.register(window);
  },
  
  resolve: function(path, filename) {
    return io.FileSystem.resolve(path, filename);
  },
  
  save: function(name) {
    if (this.readOnly) {
      alert(
        location.protocol == "file:"
        ?
          "Your browser does not support local file access.\n" +
          "Use Internet Explorer or Firefox instead."
        :
          "You cannot save your changes over HTTP.\n" +
          "Instead, save this page to your hard disk.\n" +
          "If you edit the local version you will then\n" +
          "be able to save your changes."
      );
      return false;
    }
    // save the state of the terminal
    if (!name) Terminal.save(this.terminal);

    // update the revision number of the document
    var REVISION = "/system/About/revision";
    var io = this.server.io;
    var revision = parseInt(io.read(REVISION), 10);
    io.write(REVISION, String(++revision));

    // collect external scripts
    var SCRIPT = '<script type="text/javascript" src="%1"><\/script>';
    var scripts = [];
    forEach (document.getElementsByTagName("script"), function(script) {
      if (script.src) {
        scripts.push(format(SCRIPT, Command.HTML_ESCAPE.exec(script.src)));
      }
    });

    forEach (this.$$, function(value, name) {
      if (name != "data") {
        var entry = "MiniWeb.$$." + name + "=" + JSON.toString(value).replace(/<\//g, "<\\/");
        scripts.push(format(this.SCRIPT, entry));
      }
    }, this);
    
    var data = [];
    forEach (this.$$.data, function(value, name) {
      var entry = "MiniWeb.$$.data." + name + "=" + JSON.toString(value).replace(/<\//g, "<\\/");
      data.push(format(this.SCRIPT, entry));
    }, this);
    
    
    // it's mostly script :-)
    var html = Array2.flatten([
      this.DOCTYPE,
      "<head>",
      "<title>MiniWeb: " + this.client.address + "<\/title>",
      scripts,
      "<body>",
      data,
      ""
    ]).join("\r\n");
    
    var fs = new LocalFileSystem;
    if (!name) fs.backup(location.pathname);
    fs.write(name || location.pathname, html);
    if (!name) location.reload();
    
    return true;
  },
  
  send: function(request, data) {
    if (this.client) {
      request.referer = this.client.address;
    }
    this.server.respond(request, data);
  }
});

MiniWeb.toString = function() {
  return "MiniWeb version " + MiniWeb.version;
};

eval(this.imports);

var _WILD_CARD      = /\*$/,
    _TRIM_PATH      = /[^\/]+$/,
    _SPACE          = /\s+/;

// =========================================================================
// MiniWeb/Client.js
// =========================================================================

// The client object wraps an <iframe> that contains the rendered page

var Client = Base.extend({
  constructor: function() {
    var client = this;

    this.history = new History(function() { // callback
      var address = location.hash.slice(1);
      client.send("GET", address);
      client.address = address;
      client.refresh();
    });
    
    // the url of the hosting page
    this.host = location.href.slice(0, -location.hash.length);
    
    this.view = document.createElement("iframe");
    this.view.style.display = "none";
    document.body.appendChild(this.view);
  },
  
  address: "",
  history: null,
  host: "",
  response: null,
  view: null,
  window: null,
  
  fixForm: function(form) {
    // intercept form submissions
    form.onsubmit = Client.onsubmit;
  },
  
  fixLink: function(link) {
    // stylise links - add classes for visited etc
    var href = link.getAttribute("href");
    // extract the hash portion and create a path
    href = String(href || "").replace(this.host, "");
    if (/^#[^\/]/.test(href)) {
      var hash = location.hash.replace(/^#(.*!)?/, "");
      href = "#" + hash.replace(/[^\/]+$/, "") + href.slice(1);
    }
    if (/^#/.test(href)) {
      link.setAttribute("href", href);
      if (this.history.visited[href]) {
        link.className += " mw-visited";
      }
      link.onclick = Client.onclick;
    }
    if (!/^javascript/i.test(href)) {
      link.target = "_parent";
    }
  },
  
  fixStyle: function(style) {
    style.innerHTML = style.innerHTML.replace(/:(visited)/g, ".mw-$1");
  },
  
  navigateTo: function(url) {
    // load a new page
    var hash = /^#/.test(url) ? url.slice(1) : url;
    if (this.address != hash) {
      var request = new Request("HEAD", hash);
      if (request.status == 301) {
        hash = request.getResponseHeader("Location");
      }
      this.history.add("#" + hash);
    }
  },
  
  refresh: function() {
    // refresh the current page from the last response
    
    // insert a script
    var script = "parent.MiniWeb.register(this);var base2=parent.base2;" + 
      base2.namespace + lang.namespace + "js.bind(this);";
    script = format(MiniWeb.SCRIPT, script);
    var html = this.response.replace(/(<head[^>]*>)/i, "$1\n" + script);
    
    // create an iframe to display the page
    var iframe = document.createElement(Client.$IFRAME);
    iframe.frameBorder = "0";
    iframe.id = "window";
    document.body.replaceChild(iframe, this.view);
    this.view = iframe;
    
    // write the html
    var doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open();
    doc.write(html);
    doc.close();
    
    // fix the page
    forEach (doc.links, this.fixLink, this);
    forEach (doc.getElementsByTagName("style"), this.fixStyle, this);
    forEach (doc.forms, this.fixForm, this);
    
    if (typeof doc.activeElement == "undefined") {
      doc.onclick = function(event) {
        this.activeElement = event.target;
      };
    }
    
    // keep the browser title in sync
    document.title = doc.title;
  },
  
  register: function(window) {
    window.MiniWeb = MiniWeb;
    window.onunload = function() { // destroy
      this.MiniWeb = null;
    };
    this.window = window;
  },
  
  reload: function() {
    // reload the current page
    this.send("GET", this.address);
    this.refresh();
  },
  
  send: function(method, url, data, headers) {
    // it's all synchronous ;-)
    this.response = new Request(method, url, data, headers).responseText;
  },
  
  submit: function(form) {
    // post form data
    this.send("POST", form.action || this.address, HTMLFormElement.serialize(form));
    this.refresh();
  },
  
  "@MSIE": {
    fixStyle: function(style) {
      style = style.styleSheet;
      style.cssText = style.cssText.replace(/:visited/g, ".mw-visited");
    },
    
    refresh: function() {
      // IE needs a kick up the butt
      //  this will cause the unload event to fire in the iframe
      this.view.contentWindow.document.write();
      this.base();
    }
  }
}, {
  $IFRAME: "iframe",
  
  onclick: function() {  
    var href = this.getAttribute("href", 2);
    if (href && !/^\w+:/.test(href) ) {
      if (!/current/.test(this.className)) {
        MiniWeb.navigateTo(href);
      }
      return false;
    }
    return true;
  },
  
  onsubmit: function() {
    MiniWeb.submit(this);
    return false;
  },
  
  "@MSIE": {
    $IFRAME: "<iframe scrolling=yes>"
  }
});

// =========================================================================
// MiniWeb/History.js
// =========================================================================

// Manage back/forward buttons

var History = Base.extend({
  constructor: function(callback) {
    this.visited = {};
  //-  var scrollTop = this.scrollTop = {};
    
    var hash;
    this.timer = setInterval(function() {
      if (hash != location.hash) {
        hash = location.hash;
        callback();
      //-  document.documentElement.scrollTop = scrollTop[hash];
      }
    }, 20);
    
  /*  // preserve scroll position
    window.onscroll = function() {
      if (hash == location.hash) {
        scrollTop[hash] = document.documentElement.scrollTop;
      }
    }; */
    
    this.add(location.hash || ("#" + (document.title.slice(9) || "/")));
  },
  
  timer: 0,
  visited: null,
  
  add: function(hash) {
    if (location.hash != hash) {
      location.hash = hash;
    }
  //-  this.scrollTop[hash] = 0;
    this.visited[hash] = true;
  },
  
  "@MSIE": {
    add: function(hash) {
      History.$write(hash);
      this.base(hash);
    }
  }
}, {    
  init: function() {
    // the hash portion of the location needs to be set for history to work properly
    // -- we need to do it before the page has loaded
    if (!location.hash) location.replace("#" + (document.title.slice(9) || "/"));
  },
  
  "@MSIE": {
    $write: function(hash) {
      if (hash != location.hash) {
        var document = frames[0].document;
        document.open();
        document.write("<script>parent.location.hash='" + hash + "'<\/script>");
        document.close();
      }
    },
    
    init: function() {
      this.base();
      document.write("<iframe style=display:none></iframe>");
      this.$write(location.hash.slice(1)); // make sure it's unique the first time
    }
  }
});

// =========================================================================
// MiniWeb/Server.js
// =========================================================================

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

// =========================================================================
// MiniWeb/Request.js
// =========================================================================

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

// =========================================================================
// MiniWeb/~/base2/IO/JSONFileSystem.js
// =========================================================================

var _FETCH = "#fetch";

var JSONFileSystem = FileSystem.extend({
  constructor: function(data) {
    this[_FETCH] = function(path) {
      // fetch data from the JSON object, regardless of type
      path = this.makepath(path);
      return reduce(path.split("/"), function(file, name) {
        if (file && name) file = (name in file) ? file[name] : undefined; // code looks silly but stops warnings being generated in Firebug
        return file;
      }, data);
    };
  },
  
  exists: function(path) {
    return this[_FETCH](path) !== undefined;
  },
  
  isFile: function(path) {
    return typeof this[_FETCH](path) == "string";
  },
  
  isDirectory: function(path) {
    return typeof this[_FETCH](path) == "object";
  },

  copy: function(path1, path2) {
    var data = this[_FETCH](path1);
    this.write(path2, JSON.copy(data));
  },
  
  mkdir: function(path) {
    // Create a directory.
    this.write(path, {});
  },
  
  move: function(path1, path2) {
    var data = this[_FETCH](path1);
    this.write(path2, data);
    this.remove(path1);
  },

  read: function(path) {    
    // Read text from the JSON object.
    var file = this[_FETCH](path);
    return typeof file == "object" ?
      new JSONDirectory(file) : file || ""; // make read safe
  },
  
  remove: function(path) {
    // Remove data from the JSON object.
    path = path.replace(/\/$/, "").split("/");
    var filename = path.splice(path.length - 1, 1);
    var directory = this[_FETCH](path.join("/"));
    if (directory) delete directory[filename];
  },

  write: function(path, data) {
    // Write data to the JSON object.
    path = path.split("/");
    var filename = path.splice(path.length - 1, 1);
    var directory = this[_FETCH](path.join("/"));
    assert(directory, "Directory not found."); 
    return directory[filename] = data || "";
  }
});

// =========================================================================
// MiniWeb/~/base2/IO/JSONDirectory.js
// =========================================================================

var JSONDirectory = Directory.extend(null, {

  create: function(name, item) {
    return new this.Item(name, typeof item == "object", typeof item == "string" ? item.length : 0);
  }
  
});

// =========================================================================
// MiniWeb/FileSystem.js
// =========================================================================

// This class wraps the various file retrieval systems.
// So far they are:
//   JSON (json:)
//   Local file system (file:)

var FileSystem = JSONFileSystem.extend({
  constructor: function() {
    this.base(MiniWeb.$$);
  },
  
  remove: function(path) {
    MiniWeb.dirty = true;
    return this.base(path);
  },
  
  write: function(path, data) {
    MiniWeb.dirty = true;
    return this.base(path, data);
  },
  
  protocol: "json:"
});

// =========================================================================
// MiniWeb/Command.js
// =========================================================================

// This is the base command object for the MiniWeb interpreter.
//  This object effectively defines the templating language.
//  It extends FileSystem so has inherent commands for IO.

var Command = FileSystem.extend({
  constructor: function() {
    this.base();
    var command = this;
    var interpreter = new jst.Interpreter(this);
    this[Command.INCLUDES] = {};
    this.exec = function(template, target) {
      var result = "";
      var dir = template.replace(_TRIM_PATH, "");
      if (command.isDirectory(dir)) {
        command.parent = command.self;
        if (!command.top) {
          command.top =
          command.parent = this.makepath(template);
        }
        var path = command.path;
        var restore = command.target;
        command.self = this.makepath(template);
        command.chdir(dir);
        command.target = target || "";
        result = interpreter.interpret(this.read(template));
        command.target = restore;
        command.path = path;
        command.self = command.parent;
      }
      return result;
    };
  },
  
  parent: "",
  self: "",
  target: "",
  top: "",
  
  args: function(names) {
    // define template arguments in the current scope
    var args = this.target.split(_SPACE);
    forEach.csv(names, function(name, index) {
      if (name) this[name] = args[index];
    }, this);
    return args;
  },
  
  escapeHTML: function(string) {
    return Command.HTML_ESCAPE.exec(string);
  },
  
  exec: Undefined, // defined in the constructor function
  
  include: function(template) {
    this.echo(this.exec(template, this.target));
  },
  
  include_once: function(template) {
    var path = this.makepath(template);
    if (!this[Command.INCLUDES][path]) {
      this[Command.INCLUDES][path] = true;
      this.include(template);
    }
  },
  
  process: function(template, target) {
    if (_WILD_CARD.test(target)) { // process everything in the current directory
      var path = target.replace(WILD_CARD, "") || this.path;
      var directory = this.read(path);
      forEach (directory, function(item, target) {
        if (!item.isDirectory) {
          this.process(template, target);
        }
      }, this);
    } else {
      this.echo(this.exec(template, target));
    }
    // process remaining arguments
    forEach (Array2.slice(arguments, 2), function(target) {
      this.process(template, target);
    }, this);
  }
}, {
  STDIN: 0,
  STDOUT: 1,
  STDERR: 2,
  INCLUDES: 3,
  
  HTML_ESCAPE: new RegGrp({
    '"': "&quot;",
    "&": "&amp;",
    "'": "&#39;",
    "<": "&lt;",
    ">": "&gt;"
  })
});

// =========================================================================
// MiniWeb/Interpreter.js
// =========================================================================

// This object gets between the server and the file system to manage the
//  returned content.
// The interpreter also provides access to to a copy of the request object 
//  and its post data.

var Interpreter = Command.extend({
  constructor: function(request) {
    this.base();
    this.request = pcopy(request);
  },
  
  query: "",
  request: null,

  include_script: function(template) {
    var path = this.makepath(template);
    if (!this[Command.INCLUDES][path] && !Interpreter.SYSTEM.test(this.top)) {
      this.echo("<script type='text/javascript'>\n");
      this.include_once(template);
      this.echo("\n<\/script>\n");
    }
  },

  include_style: function(template) {
    var path = this.makepath(template);
    if (!this[Command.INCLUDES][path] && !Interpreter.SYSTEM.test(this.top)) {
      this.echo("<style type='text/css'>\n");
      this.include_once(template);
      this.echo("\n<\/style>\n");
    }
  },
  
  interpret: function() {
    var url = this.request.url;
    var template = Interpreter.VIEW;
    var status = this.request.status;
    
    if (status > 299) { // return an error page
      target = Interpreter.ERROR + (Interpreter.ERROR_PAGES[status] || Interpreter.DEFAULT);
    } else {
      if (url.indexOf("!") != -1) { // it's a query
        var parts = url.split("!");
        url = parts[0];
        this.query = parts[1];
      }
      var target = url;
      // find a template
      var path = url.split("/");
      do {
        path.pop();
        template = path.join("/") + Interpreter.VIEW;
      } while (path.length && !this.exists(template));
      if (this.isDirectory(target) && this.exists(target + Interpreter.DEFAULT)) {
        target += Interpreter.DEFAULT;
      }
    }
    return this.exec(template, target);
  }
}, {
  DEFAULT:   "default",
  SYSTEM:    /^\/system\/(create|edit|view)$/,
  VIEW:      "/system/view",
  ERROR:     "/system/Error/",
  ERROR_PAGES: {
    "301": "Moved_Permanently",
    "404": "Not_Found",
    "405": "Method_Not_Allowed",
    "500": "Internal_Server_Error"
  }
});

// =========================================================================
// MiniWeb/Terminal.js
// =========================================================================

// It didn't start off that way but this is becoming more like the UNIX shell
//  (which I know very little about)

var Terminal = Command.extend({
  constructor: function() {
    this.base();
    Terminal.load(this);
    this.extend("exec", function() {
      try {
        return this.base.apply(this, arguments);
      } catch (error) {
        return String(error.message || error);
      }
    });
  }
}, {
  STATE: "#state",
  TMP:   "~terminal",
  
  load: function(terminal) {
    // the state of a terminal session is saved to disk whenever
    //  MiniWeb is saved from the terminal. Reload the saved
    //  state.
    var fs = new LocalFileSystem;
    if (!MiniWeb.readOnly && fs.exists(this.TMP)) {
      var state = JSON.parse(fs.read(this.TMP));
      fs.remove(this.TMP);
    } else {
      state = {
        commands: [],
        output:   "<pre>" + MiniWeb + "</pre><br>",
        path:     "/",
        position: 0,
        protocol: "json:"
      };
    }
    terminal.protocol = state.protocol;
    terminal.path = state.path;
    terminal[this.STATE] = state;
  },
  
  save: function(terminal) {
    // save the state of a terminal session to disk
    var state = terminal[this.STATE];
    state.protocol = terminal.protocol;
    state.path = terminal.path;
    if (!MiniWeb.readOnly) {
      var fs = new LocalFileSystem;
      fs.write(this.TMP, JSON.toString(state));
    }
  }
});

// =========================================================================
// MiniWeb/HTMLElement.js
// =========================================================================

// This is here in place of the real HTMLElement class.
// We only need the serialize method of the HTMLFormElement class
//  so we can ignore the rest.

var HTMLElement = Module.extend();

// =========================================================================
// MiniWeb/~/base2/DOM/html/HTMLFormElement.js
// =========================================================================

// Not used.

var HTMLFormElement = HTMLElement.extend({
  serialize: function(form) {
    return filter(form.elements, HTMLFormItem.isSuccessful).map(HTMLFormItem.serialize).join("&");
  }
}, {
  tags: "FORM"
});

// =========================================================================
// MiniWeb/~/base2/DOM/html/HTMLFormItem.js
// =========================================================================

// Not used.

var HTMLFormItem = HTMLElement.extend(null, {
  tags: "BUTTON,INPUT,SELECT,TEXTAREA",
  
  isSuccessful: function(item) {
    if (!item.name || item.disabled) return false;
    switch (item.type) {
      case "button":
      case "reset":
        return false;
      case "radio":
      case "checkbox":
        return item.checked;
      case "image":
      case "submit":
        return Element.matchesSelector(item, ":active");
      default:
        return true;
    }
  },
  
  serialize: function(item) {
    return item.name + "=" + encodeURIComponent(item.value);
  }
});

eval(this.exports);

}; ////////////////////  END: CLOSURE  /////////////////////////////////////
