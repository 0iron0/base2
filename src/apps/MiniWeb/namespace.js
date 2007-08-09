/*
  MiniWeb - copyright 2007, Dean Edwards
  http://www.opensource.org/licenses/mit-license
*/

// An active document thing

MiniWeb = new base2.Namespace(this, {
  name:    "MiniWeb",
  exports: "Client,Server,FileSystem,Command,Interpreter,Terminal,Request,History",
  imports: "IO",
  version: "0.6",
  
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
    var methods = "navigateTo,refresh,reload,submit".split(",");
    base2.forEach (methods, function(method) {
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
      MiniWeb.server = new Server;
      // get server options
      var request = new Request("OPTIONS");
      var allow = request.getResponseHeader("Allow");
      MiniWeb.readOnly = !/PUT/.test(allow);
      MiniWeb.terminal = new Terminal;
      MiniWeb.client = new Client;
    };
  },
  
  register: function(window) {
    this.client.register(window);
  },
  
  resolve: function(path, filename) {
    return IO.FileSystem.resolve(path, filename);
  },
  
  save: function(name) {
    if (this.readOnly) {
      alert(
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
    var revision = parseInt(io.read(REVISION));
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
    
    if (!name) LocalFile.backup(location.pathname);
    LocalFile.write(name || location.pathname, html);
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

eval(this.imports);

MiniWeb.toString = function() {
  return "MiniWeb version " + MiniWeb.version;
};
