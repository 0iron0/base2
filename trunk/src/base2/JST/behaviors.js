
eval(base2.namespace);
DOM.bind(document);

var parser = new JST.Parser;
var interpreter = new JST.Interpreter;

new JSB.RuleList({
  "#input": null,
  "#output": null,
  "#script": {
    parser: null,
    
    ondocumentready: function() {
      this.clear();
      this.removeClass("disabled");
    },
    
    clear: function(all) {
      if (all) {
        this.filetype.value = "";
        this.filename.value = "";
        input.value = "";
      }
      output.value = "";
      input.focus();
      message.ready();
    },
    
    parse: function() {
      try {
        if (input.value) {
          var start = new Date;
          var value = parser.parse(input.value);
          var time = (new Date) - start;
          output.value = value;
          message.time(time);
        }
      } catch (error) {
        message.error("error parsing script", error);
      }
    },
    
    interpret: function() {
      try {
        if (input.value) {
          var start = new Date;
          var value = interpreter.interpret(input.value);
          var time = (new Date) - start;
          output.value = value;
          message.time(time);
        }
      } catch (error) {
        message.error("error interpreting script", error);
      }
    }
  },
  "#clear-all": {
    disabled: false,
    
    onclick: function() {
      script.clear(true);
    }
  },
  "#parse-script": {
    disabled: false,
    
    onclick: function() {
      script.parse();
    }
  },
  "#interpret-script": {
    disabled: false,
    
    onclick: function() {
      script.interpret();
    }
  },
  "#message": {
    error: function(text, error) {
      this.write(text + ": " + error.message, "error");
    },
    
    time: function(ms) {
      this.write("parse time: " + ms/1000 + " seconds");
    },
    
    ready: function() {
      this.write("ready");
    },
    
    write: function(text, className) {
      this.firstChild.nodeValue = text;
      this.className = className || "";
    } 
  }
});
