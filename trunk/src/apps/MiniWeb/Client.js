
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
    
    window.onunload = function() {
      try {
        client.view = null;
        if (client.window) {
          client.window.onunload();
          client.window = null;
        }
        clearInterval(client.history.timer);
      } catch (error) {
        // ignore
      }
    };
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
      base2.namespace + "JavaScript.bind(this);";
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
