/*
  Packer version 3.1 - copyright 2004-2008, Dean Edwards
  http://www.opensource.org/licenses/mit-license.php
*/

// timestamp: Sat, 26 Jul 2008 00:01:23

new function() { ///////////////  BEGIN: CLOSURE  ///////////////

new base2.Package(this, {
  imports: "Function2,Enumerable"
});

eval(this.imports);

var IGNORE = RegGrp.IGNORE;
var KEYS   = "~";
var REMOVE = "";
var SPACE  = " ";

// =========================================================================
// packer/Packer.js
// =========================================================================

global.Packer = Base.extend({
  minify: function(script) {
    // packing with no additional options
    script += "\n";
    script = script.replace(Packer.CONTINUE, "");
    script = Packer.comments.exec(script);
    script = Packer.clean.exec(script);
    script = Packer.whitespace.exec(script);
    script = Packer.concat.exec(script);
    return script;
  },
  
  pack: function(script, base62, shrink, privateVars) {
    script = this.minify(script);
    if (shrink) script = this._shrinkVariables(script, base62);
    if (privateVars) script = this._encodePrivateVariables(script);
    if (base62) script = this._base62Encode(script, shrink);
    delete this._data;
    return script;
  },

  decode: function(script) {
    // put strings and regular expressions back
    var data = this._data; // encoded strings and regular expressions
    return script.replace(Packer.ENCODED, function(match, index) {
      return data[index];
    });
  },

  encode: function(script) {
    // encode strings and regular expressions
    var data = this._data = []; // encoded strings and regular expressions
    return Packer.data.exec(script, function(match, operator, regexp) {
      var replacement = "\x01" + data.length + "\x01";
      if (regexp) {
        replacement = operator + replacement;
        match = regexp;
      }
      data.push(match);
      return replacement;
    });
  },

  _base62Encode: function(script, shrink) {
    var words = new Base62;
    var pattern = Packer.WORDS;
    if (shrink) pattern = new RegExp(Packer.SHRUNK.source + "|" + pattern.source , "g");
    
    /* build the packed script */
    
    var p = this._escape(words.exec(script, pattern));
    var a = "[]";
    var c = words.size() || 1;
    var k = words.getKeyWords();
    var e = Packer["ENCODE" + (c > 10 ? c > 36 ? 62 : 36 : 10)];
    var d = words.getDecoder();
    
    // the whole thing
    return format(Packer.UNPACK, p,a,c,k,e,d);
  },

/*_createDictionary: function(script) {
    var CLOSURE = "(function(%1){%2}).apply(null,'%3'.split('|'))";
    var DICTIONARY = /\.(__\w{2,}|[a-zA-Z$]\w{3,})/g;
    var dictionary = new Words(script, DICTIONARY);
    var filtered = dictionary.filter(function(word) {
      var string = word.toString();
      return word.count * string.length > word.count * 4 + string.length + 6;
    });
    dictionary.encode(function(index) {
      return "[@" + (total + index) + "]";
    });
    dictionary[KEYS].length = filtered.length;
    dictionary.toString = function() {
      return this.map(I).join("|").replace(/\./g, "");
    };
    var args = dictionary.pluck("replacement").join(",").replace(/[\[\].]/g, "");
    script = script.replace(DICTIONARY, function(word) {
      return dictionary.get(word).replacement;
    });
    return format(CLOSURE, args, script, dictionary);
  },*/

  _encodePrivateVariables: function(script) {
    var index = 0;
    var encoder = Packer.build({
      CONDITIONAL: IGNORE,
      "(OPERATOR)(REGXP)": IGNORE
    });
    var privateVars = new Words;
    encoder.put(Packer.PRIVATES, function(word) {
      privateVars.add(word);
    });
    encoder.exec(script);
    privateVars.encode(function(index) {
      return "_" + Packer.encode62(index);
    });
    return script.replace(Packer.PRIVATES, function(word) {
      return privateVars.has(word) ? privateVars.get(word).replacement : word;
    });
  },
  
  _escape: function(script) {
    // Single quotes wrap the final string so escape them.
    // Also, escape new lines (required by conditional comments).
    return script.replace(/([\\'])/g, "\\$1").replace(/[\r\n]+/g, "\\n");
  },
  
  _shrinkVariables: function(script, base62) {
    script = this.encode(script);
    
    // Windows Scripting Host cannot do regexp.test() on global regexps.
    function global(regexp) {
      // This function creates a global version of the passed regexp.
      return new RegExp(regexp.source, "g");
    };
        
    // identify blocks, particularly identify function blocks (which define scope)
    var BLOCK       = /((catch|do|if|while|with|function)\b[^~{};]*(\(\s*[^{};]*\s*\))\s*)?(\{[^{}]*\})/;
    var BLOCK_g     = global(BLOCK);
    var BRACKETS    = /\{[^{}]*\}|\[[^\[\]]*\]|\([^\(\)]*\)|~[^~]+~/;
    var BRACKETS_g  = global(BRACKETS);
    var ENCODED     = /~#?(\d+)~/;
    var IDENTIFIER  = /[a-zA-Z_$][\w\$]*/g;
    var SCOPED      = /~#(\d+)~/;
    var VAR_g       = /\bvar\b/g;
    var VARS        = /\bvar\s+[\w$]+[^;#]*|\bfunction\s+[\w$]+/g;
    var VAR_TIDY    = /\b(var|function)\b|\sin\s+[^;]+/g;
    var VAR_EQUAL   = /\s*=[^,;]*/g;
    
    var blocks = []; // store program blocks (anything between braces {})
    var total = 0;
    // encoder for program blocks
    function encode($, prefix, blockType, args, block) {
      if (!prefix) prefix = "";
      if (blockType == "function") {
        // decode the function block (THIS IS THE IMPORTANT BIT)
        // We are retrieving all sub-blocks and will re-parse them in light
        // of newly shrunk variables
        block = args + decode(block, SCOPED);
        prefix = prefix.replace(BRACKETS, "");
        
        // create the list of variable and argument names
        args = args.slice(1, -1);
        
        if (args != "_no_shrink_") {
          var vars = match(block, VARS).join(";").replace(VAR_g, ";var");
          while (BRACKETS.test(vars)) {
            vars = vars.replace(BRACKETS_g, "");
          }
          vars = vars.replace(VAR_TIDY, "").replace(VAR_EQUAL, "");
        }
        block = decode(block, ENCODED);
        
        var PREFIX = "@";
        
        // process each identifier
        if (args != "_no_shrink_") {
          var count = 0, shortId;
          var ids = match([args, vars], IDENTIFIER);
          var processed = {};
          for (var i = 0; i < ids.length; i++) {
            id = ids[i];
            if (!processed[id]) {
              processed[id] = true;
              id = rescape(id);
              // encode variable names
              while (new RegExp(PREFIX + count + "\\b").test(block)) count++;
              var reg = new RegExp("([^\\w$.])" + id + "([^\\w$:])");
              while (reg.test(block)) {
                block = block.replace(global(reg), "$1" + PREFIX + count + "$2");
              }
              var reg = new RegExp("([^{,\\w$.])" + id + ":", "g");
              block = block.replace(reg, "$1" + PREFIX + count + ":");
              count++;
            }
          }
          total = Math.max(total, count);
        }
        var replacement = prefix + "~" + blocks.length + "~";
        blocks.push(block);
      } else {
        var replacement = "~#" + blocks.length + "~";
        blocks.push(prefix + block);
      }
      return replacement;
    };

    // decoder for program blocks
    function decode(script, encoded) {
      while (encoded.test(script)) {
        script = script.replace(global(encoded), function(match, index) {
          return blocks[index];
        });
      }
      return script;
    };
    
    // encode blocks, as we encode we replace variable and argument names
    while (BLOCK.test(script)) {
      script = script.replace(BLOCK_g, encode);
    }
    
    // put the blocks back
    script = decode(script, ENCODED);
    
    if (!base62) {
      var shrunk = new Words(script, Packer.SHRUNK);
      var shortId, count = 0;;
      shrunk.encode(function() {
        // find the next free short name
        do shortId = Packer.encode52(count++);
        while (new RegExp("[^\\w$.]" + shortId + "[^\\w$:]").test(script));
        return shortId;
      });
      script = script.replace(Packer.SHRUNK, function(word) {
        return shrunk.get(word).replacement;
      });
    }
    
    return this.decode(script);
  }
}, {
  version: "3.1",
  
  CONTINUE: /\\\r?\n/g,
  ENCODED:  /\x01(\d+)\x01/g,
  PRIVATES: /\b_[\da-zA-Z$][\w$]*\b/g,
  SHRUNK:   /@\d+\b/g,
  WORDS:    /\b[\da-zA-Z]\b|\w{2,}/g,
  
  ENCODE10: "String",
  ENCODE36: "function(c){return c.toString(36)}",
  ENCODE62: "function(c){return(c<62?'':e(parseInt(c/62)))+((c=c%62)>35?String.fromCharCode(c+29):c.toString(36))}",
	
	UNPACK: "eval(function(p,a,c,k,e,r){e=%5;if('0'.replace(0,e)==0){while(c--)r[e(c)]=k[c];" +
	  "k=[function(e){return r[e]||e}];e=function(){return'%6'};c=1};while(c--)if(k[c])p=p." +
		"replace(new RegExp('\\\\b'+e(c)+'\\\\b','g'),k[c]);return p}('%1',%2,%3,'%4'.split('|'),0,{}))",
  
  init: function() {
    eval("var e=this.encode62=" + this.ENCODE62);
    this.data = this.build(this.data);
    this.concat = this.build(this.concat).merge(this.data);
    extend(this.concat, "exec", function(script) {
      var parsed = this.base(script);
      while (parsed != script) {
        script = parsed;
        parsed = this.base(script);
      }
      return parsed;
    });
    forEach.csv("comments,clean,whitespace", function(name) {
      this[name] = this.data.union(this.build(this[name]));
    }, this);
    this.conditionalComments = this.comments.copy();
    this.conditionalComments.putAt(-1, " $3");
    this.whitespace.removeAt(2); // conditional comments
    this.comments.removeAt(2);
  },
  
  build: function(group) {
    return reduce(group, function(data, replacement, expression) {
      data.put(this.javascript.exec(expression), replacement);
      return data;
    }, new RegGrp, this);
  },
  
  clean: {
    "\\(\\s*([^;)]*)\\s*;\\s*([^;)]*)\\s*;\\s*([^;)]*)\\)": "($1;$2;$3)", // for (;;) loops
    "throw[^};]+[};]": IGNORE, // a safari 1.3 bug
    ";+\\s*([};])": "$1"
  },

  comments: {
    ";;;[^\\n]*\\n": REMOVE,
    "(COMMENT1)\\n\\s*(REGEXP)?": "\n$3",
    "(COMMENT2)\\s*(REGEXP)?": function(match, comment, $2, regexp) {
      if (/^\/\*@/.test(comment) && /@\*\/$/.test(comment)) {
        comment = Packer.conditionalComments.exec(comment);
      } else {
        comment = "";
      }
      return comment + " " + (regexp || "");
    }
  },

  concat: {
    "(STRING1)\\+(STRING1)": function(match, a, $2, b) {
      return a.slice(0, -1) + b.slice(1);
    },
    "(STRING2)\\+(STRING2)": function(match, a, $2, b) {
      return a.slice(0, -1) + b.slice(1);
    }
  },
  
  data: {
    "STRING1": IGNORE,
    'STRING2': IGNORE,
    "CONDITIONAL": IGNORE, // conditional comments
    "(OPERATOR)\\s*(REGEXP)": "$1$2"
  },

  encode52: function(c) {
    // Base52 encoding (a-Z)
    function encode(c) {
      return (c < 52 ? '' : encode(parseInt(c / 52))) +
        ((c = c % 52) > 25 ? String.fromCharCode(c + 39) : String.fromCharCode(c + 97));
    };
    var encoded = encode(c);
    if (/^(do|if|in)$/.test(encoded)) encoded = encoded.slice(1) + 0;
    return encoded;
  },
  
  javascript: new RegGrp({
    OPERATOR:    /return|typeof|[\[(\^=,{}:;&|!*?]/.source,
    CONDITIONAL: /\/\*@\w*|\w*@\*\/|\/\/@\w*|@\w+/.source,
    COMMENT1:    /\/\/[^\n]*/.source,
    COMMENT2:    /\/\*[^*]*\*+([^\/][^*]*\*+)*\//.source,
    REGEXP:      /\/(\\[\/\\]|[^*\/])(\\.|[^\/\n\\])*\/[gim]*/.source,
    STRING1:     /'(\\.|[^'\\])*'/.source,
    STRING2:     /"(\\.|[^"\\])*"/.source
  }),
  
  whitespace: {
    "/\\/\\/@[^\\n]*\\n": IGNORE,
    "@\\s+\\b": "@ ", // protect conditional comments
    "\\b\\s+@": " @",
    "(\\d)\\s+(\\.\\s*[a-z\\$_\\[(])": "$1 $2", // http://dean.edwards.name/weblog/2007/04/packer3/#comment84066
    "([+-])\\s+([+-])": "$1 $2", // c = a++ +b;
    "\\b\\s+\\$\\s+\\b": " $ ", // var $ in
    "\\$\\s+\\b": "$ ", // object$ in
    "\\b\\s+\\$": " $", // return $object
//  "\\b\\s+#": " #",   // CSS
    "\\b\\s+\\b": SPACE,
    "\\s+": REMOVE
  }
});

// =========================================================================
// packer/Words.js
// =========================================================================

var Words = RegGrp.extend({
  constructor: function(script, pattern) {
    this.base();
    if (script) forEach (script.match(pattern), this.add, this);
  },

  add: function(word) {
    if (!this.has(word)) this.base(word);
    word = this.get(word);
    word.count++;
    return word;
  },

  encode: function(encoder) {
    this.sort();
    var index = 0;
    forEach (this, function(word) {
      word.replacement = encoder(index++);
    });
    return this;
  },

  sort: function(sorter) {
    return this.base(sorter || function(word1, word2) {
      // sort by frequency
      return (word2.count - word1.count) || (word2.length - word1.length) || (word1 < word2 ? -1 : 1);
    });
  }
}, {
  Item: {
    count: 0
  }
});

// =========================================================================
// packer/Base62.js
// =========================================================================

var Base62 = Words.extend({
  exec: function(script, pattern) {
    if (script) forEach (script.match(pattern), this.add, this);

    if (!this.size()) return script;

    this.sort();

    var encode = Packer.encode62;
    var encoded = new Collection; // a dictionary of base62 -> base10
    var size = this[KEYS].length;
    for (var i = 0; i < size; i++) {
      encoded.put(encode(i), i);
    }

    var self = this;
    function replacement(word) {
      return self["#" + word].replacement;
    };

    var empty = K("");
    var index = 0;
    var letter = 0, c;
    forEach (this, function(word) {
      if (index == 62) letter += 62 + size;
      if (word.toString().charAt(0) == "@") {
        do c = Packer.encode52(letter++);
        while (new RegExp("[^\\w$.]" + c + "[^\\w$:]").test(script));
        if (index < 62) {
          var w = this.add(c);
          w.count += word.count - 1;
        }
        word.count = 0;
        word.index = size + 1;
        word.toString = empty;
        word.replacement = c;
      }
      index++;
    }, this);

    script = script.replace(Packer.SHRUNK, replacement);

    this.sort();

    var index = 0;
    forEach (this, function(word) {
      if (word.index == Infinity) return;
      if (encoded.has(word)) {
        word.index = encoded.get(word);
        word.toString = empty;
      } else {
        while (this.has(encode(index))) index++;
        word.index = index++;
        if (word.count == 1) {
          word.toString = empty;
        }
      }
      word.replacement = encode(word.index);
      if (word.replacement.length == word.toString().length) {
        word.toString = empty;
      }
    }, this);

    // sort by encoding
    this.sort(function(word1, word2) {
      return word1.index - word2.index;
    });

    // trim unencoded words
    this[KEYS].length = this.getKeyWords().split("|").length;

    return script.replace(new RegExp(this, "g"), replacement);
  },

  getKeyWords: function() {
    return this.map(String).join("|").replace(/\|+$/, "");
  },

  getDecoder: function() {
    // returns a pattern used for fast decoding of the packed script
    var trim = new RegGrp({
      "(\\d)(\\|\\d)+\\|(\\d)": "$1-$3",
      "([a-z])(\\|[a-z])+\\|([a-z])": "$1-$3",
      "([A-Z])(\\|[A-Z])+\\|([A-Z])": "$1-$3",
      "\\|": ""
    });
    var pattern = trim.exec(this.map(function(word) {
      if (word.toString()) return word.replacement;
      return "";
    }).slice(0, 62).join("|"));

    if (!pattern) return "^$";

    pattern = "[" + pattern + "]";

    var size = this.size();
    if (size > 62) {
      pattern = "(" + pattern + "|";
      var c = Packer.encode62(size).charAt(0);
      if (c > "9") {
        pattern += "[\\\\d";
        if (c >= "a") {
          pattern += "a";
          if (c >= "z") {
            pattern += "-z";
            if (c >= "A") {
              pattern += "A";
              if (c > "A") pattern += "-" + c;
            }
          } else if (c == "b") {
            pattern += "-" + c;
          }
        }
        pattern += "]";
      } else if (c == 9) {
        pattern += "\\\\d";
      } else if (c == 2) {
        pattern += "[12]";
      } else if (c == 1) {
        pattern += "1";
      } else {
        pattern += "[1-" + c + "]";
      }

      pattern += "\\\\w)";
    }
    return pattern;
  },

  toString: function() {
    var words = this.map(String).join("|").replace(/\|{2,}/g, "|").replace(/^\|+|\|+$/g, "") || "\\x0";
    return "\\b(" + words + ")\\b";
  }
}, {
  Item: {
    encoded: "",
    index: -1
  }
});

}; ////////////////////  END: CLOSURE  /////////////////////////////////////
