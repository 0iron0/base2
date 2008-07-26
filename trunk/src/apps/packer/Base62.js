
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
