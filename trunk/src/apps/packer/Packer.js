/*
  Packer version 3.1 (alpha 3) - copyright 2004-2007, Dean Edwards
  http://www.opensource.org/licenses/mit-license.php
*/

eval(base2.namespace);

var IGNORE = RegGrp.IGNORE;
var REMOVE = "";
var SPACE = " ";
var WORDS = /\w+/g;

var Packer = Base.extend({
  minify: function(script) {
    // packing with no additional options
    script += "\n";
    script = script.replace(Packer.CONTINUE, "");
    script = Packer.comments.exec(script);
    script = Packer.clean.exec(script);
    script = Packer.whitespace.exec(script);
    return script;
  },
  
  pack: function(script, base62, shrink, privateVars) {
    script = this.minify(script);
    if (shrink) script = this._shrinkVariables(script);
    if (privateVars) script = this._encodePrivateVariables(script);
    if (base62) script = this._base62Encode(script);
    return script;
  },
  
  _base62Encode: function(script) {
    var words = new Words(script);
    words.encode();
    
    /* build the packed script */
    
    var p = this._escape(words.exec(script));    
    var a = "[]";    
    var c = words.size() || 1;    
    var k = words.map(String).join("|").replace(/\|+$/, "");
    var e = Packer["ENCODE" + (c > 10 ? c > 36 ? 62 : 36 : 10)];
    var r = c > 62 ? format("{1,%1}", Packer.encode62(c).length) : "";
    
    // the whole thing
    return format(Packer.UNPACK, p,a,c,k,e,r);
  },
  
  _encodePrivateVariables: function(script, words) {
    var index = 0;
    var encoded = {};
    Packer.privates.put(Packer.PRIVATE, function(id) {
      if (encoded[id] == null) encoded[id] = index++;
      return "_" + encoded[id];
    });
    return Packer.privates.exec(script);
  },
  
  _escape: function(script) {
    // Single quotes wrap the final string so escape them.
    // Also, escape new lines (required by conditional comments).
    return script.replace(/([\\'])/g, "\\$1").replace(/[\r\n]+/g, "\\n");
  },
  
  _shrinkVariables: function(script) {
    // Windows Scripting Host cannot do regexp.test() on global regexps.
    var global = function(regexp) {
      // This function creates a global version of the passed regexp.
      return new RegExp(regexp.source, "g");
    };
    
    var data = []; // encoded strings and regular expressions
    var REGEXP = /^[^'"]\//;
    var store = function(string) {
      var replacement = "\x01" + data.length + "\x01";
      if (REGEXP.test(string)) {
        replacement = string.charAt(0) + replacement;
        string = string.slice(1);
      }
      data.push(string);
      return replacement;
    };
    
    // Base52 encoding (a-Z)
    var encode52 = function(c) {
      return (c < 52 ? '' : arguments.callee(parseInt(c / 52))) +
        ((c = c % 52) > 25 ? String.fromCharCode(c + 39) : String.fromCharCode(c + 97));
    };
        
    // identify blocks, particularly identify function blocks (which define scope)
    var BLOCK =       /((catch|do|if|while|with|function)\b\s*[^~{;]*\s*(\(\s*[^{;]*\s*\))\s*)?(\{([^{}]*)\})/;
    var BLOCK_g =     global(BLOCK);
    var BRACKETS =    /\{[^{}]*\}|\[[^\[\]]*\]|\([^\(\)]*\)|~[^~]+~/;
    var BRACKETS_g =  global(BRACKETS);
    var ENCODED =     /~#?(\d+)~/;
    var SCOPED  =     /~#(\d+)~/;
    var VARS =        /\bvar\s+[\w$]+[^;#]*|\bfunction\s+[\w$]+/g;
    var VAR_TIDY =    /\b(var|function)\b|\sin\s+[^;]+/g;
    var VAR_EQUAL =   /\s*=[^,;]*/g;
    var LIST =        /[^\s,;]+/g;
    
    var blocks = []; // store program blocks (anything between braces {})
    // encoder for program blocks
    var encode = function($, prefix, blockType, args, block) {
      if (!prefix) prefix = "";
      switch (blockType) {
        case "function":
          // decode the function block (THIS IS THE IMPORTANT BIT)
          // We are retrieving all sub-blocks and will re-parse them in light
          // of newly shrunk variables
          block = args + decode(block, SCOPED);
          prefix = prefix.replace(BRACKETS, "");
          
          // create the list of variable and argument names
          args = args.slice(1, -1);
          var vars = match(block, VARS).join(";");
          while (BRACKETS.test(vars)) {
            vars = vars.replace(BRACKETS_g, "");
          }
          vars = vars.replace(VAR_TIDY, "").replace(VAR_EQUAL, "");
          
          block = decode(block, ENCODED);
          
          // process each identifier
          var count = 0, shortId;
          var ids = match([args, vars], LIST);
          var processed = {};
          for (var i = 0; i < ids.length; i++) {
            id = ids[i];
            if (!processed[id] && id.length > 1) { // > 1 char
              processed[id] = true;
              id = rescape(id);
              // find the next free short name (check everything in the current scope)
              do shortId = encode52(count++);
              while (new RegExp("[^\\w$.@]" + shortId + "[^\\w$:@]").test(block)) {}
              // replace the long name with the short name
              var reg = new RegExp("([^\\w$.@])" + id + "([^\\w$:@])");
              while (reg.test(block)) {
                block = block.replace(global(reg), "$1" + shortId + "$2");
              }
              var reg = new RegExp("([^{,\\w$.])" + id + ":", "g");
              block = block.replace(reg, "$1" + shortId + ":");
            }
          }
          break;
        default:
          // remove unnecessary braces
        //  if (/do|else|else\s+if|if|while|with/.test(blockType) && !/[;~]/.test(block)) {
        //    block = " " + block.slice(1, -1) + ";";
        //  }
      }
      blockType = (blockType == "function") ? "" : "#";
      var replacement = "~" + blockType + blocks.length + "~";
      blocks.push(prefix + block);
      return replacement;
    };
    
    // decoder for program blocks
    var decode = function(script, encoded) {
      while (encoded.test(script)) {
        script = script.replace(global(encoded), function(match, index) {
          return blocks[index];
        });
      }
      return script;
    };
    
    // encode strings and regular expressions
    var strings = Packer.data.copy();
    strings.putAt(0, store);
    strings.putAt(1, store);
    strings.putAt(3, store);
    script = strings.exec(script);

    // remove closures (this is for base2 namespaces only)
    script = script.replace(/new function\(_\)\s*\{/g, "{;#;");
    
    // encode blocks, as we encode we replace variable and argument names
    while (BLOCK.test(script)) {
      script = script.replace(BLOCK_g, encode);
    }
    
    // put the blocks back
    script = decode(script, ENCODED);
    
    // put back the closure (for base2 namespaces only)
    script = script.replace(/\{;#;/g, "new function(_){");
    
    // put strings and regular expressions back
    script = script.replace(/\x01(\d+)\x01/g, function(match, index) {
      return data[index];
    });
    
    return script;
  }
}, {
  version: "3.1 (alpha 2)",
  
  CONTINUE: /\\\r?\n/g,
  PRIVATE:  /\b_[A-Za-z\d$][\w$]*\b/,
  
  ENCODE10: "String",
  ENCODE36: "function(c){return c.toString(36)}",
  ENCODE62: "function(c){return(c<62?'':e(parseInt(c/62)))+((c=c%62)>35?String.fromCharCode(c+29):c.toString(36))}",
	
	UNPACK: "eval(function(p,a,c,k,e,r){e=%5;if(!''.replace(/^/,String)){while(c--)r[e(c)]=k[c];" +
	  "k=[function(e){return r[e]||e}];e=function(){return'\\\\w%6'};c=1};while(c--)if(k[c])p=p." +
		"replace(new RegExp('\\\\b'+e(c)+'\\\\b','g'),k[c]);return p}('%1',%2,%3,'%4'.split('|'),0,{}))",
  
  init: function() {
    this.data = this.build(this.data);
    forEach ("comments,clean,whitespace".split(","), function(name) {
      this[name] = this.data.union(this.build(this[name]));
    }, this);
    this.privates = new RegGrp(this.privates);
    eval("var e=this.encode62=" + this.ENCODE62);
  },
  
  build: function(group) {
    var javascript = this.javascript;
    return reduce(group, function(data, replacement, expression) {
      data.put(javascript.exec(expression), replacement);
      return data;
    }, new RegGrp);
  },
  
  clean: {
    "\\(\\s*([^;)]*)\\s*;\\s*([^;)]*)\\s*;\\s*([^;)]*)\\)": "($1;$2;$3)", // for (;;) loops
    "throw[^};]+[};]": IGNORE, // a safari 1.3 bug
    ";+\\s*([};])": "$1"
  },
  
  comments: {
    "(COMMENT1)\\n\\s*(REGEXP)?": "\n$3",
    "(COMMENT2)\\s*(REGEXP)?": " $3"
  },
  
  privates: {
    "STRING1": IGNORE,
    'STRING2': IGNORE,
    "@\\w+": IGNORE,
    "\\w+@": IGNORE,
    "(return|[\\[(\\^=,{}:;&|!*?])\\s*(REGEXP)": "$1$2"
  },
  
  data: {
    // strings
    "STRING1": IGNORE,
    'STRING2': IGNORE,
    "CONDITIONAL": IGNORE, // conditional comments
    "(return|[\\[(\\^=,{}:;&|!*?])\\s*(REGEXP)": "$1$2"
  },
  
  javascript: new RegGrp({
    CONDITIONAL: /\/\*@\w*|\w*@\*\/|\/\/@\w*[^\n]*\n/.source,
    COMMENT1:    /(\/\/|;;;)[^\n]*/.source,
    COMMENT2:    /\/\*[^*]*\*+([^\/][^*]*\*+)*\//.source,
    REGEXP:      /\/(\\[\/\\]|[^*\/])(\\.|[^\/\n\\])*\/[gim]*/.source,
    STRING1:     /'(\\.|[^'\\])*'/.source,
    STRING2:     /"(\\.|[^"\\])*"/.source
  }),
  
  whitespace: {
    "(\\d)\\s+(\\.\\s*[a-z\\$_\\[(])": "$1 $2", // http://dean.edwards.name/weblog/2007/04/packer3/#comment84066
    "([+-])\\s+([+-])": "$1 $2", // c = a++ +b;
    "\\b\\s+\\$\\s+\\b": " $ ", // var $ in
    "\\$\\s+\\b": "$ ", // object$ in
    "\\b\\s+\\$": " $", // return $object
    "\\b\\s+#": " #",
    "\\b\\s+\\b": SPACE,
    "\\s+": REMOVE
  }
});
