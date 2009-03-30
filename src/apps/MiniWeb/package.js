/*
  MiniWeb - copyright 2007-2008, Dean Edwards
  http://www.opensource.org/licenses/mit-license.php
*/

// An active document thing

var MiniWeb = new base2.Package(this, {
  name:    "MiniWeb",
  exports: "Client,Server,JSONFileSystem,JSONDirectory,FileSystem,Command,Interpreter,Terminal,Request,History",
  imports: "Enumerable,io",
  version: "0.7.1",
  
  $$: {data: {}},
  
  DOCTYPE: '<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN">',
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
