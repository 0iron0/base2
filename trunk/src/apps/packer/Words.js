
var Words = RegGrp.extend({
  constructor: function(script) {
    this.base();    
    forEach (script.match(WORDS), this.add, this);
  },
  
  add: function(word) {
    if (!this.exists(word)) {
      this.base(word);
    }
    word = this.fetch(word);
    word.count++;
    return word;
  },
  
  encode: function() {
    // sort by frequency
    this.sort(function(word1, word2) {
      return word2.count - word1.count;
    });
    
    var encode = Packer.encode62;    
    var encoded = new Collection; // a dictionary of base62 -> base10
    var count = this.count();
    for (var i = 0; i < count; i++) {
      encoded.store(encode(i), i);
    }
    
    var empty = K("");
    var index = 0;
    forEach (this, function(word) {
      if (encoded.exists(word)) {
        word.index = encoded.fetch(word);
        word.toString = empty;
      } else {
        while (this.exists(encode(index))) index++;
        word.index = index++;
        if (word.count == 1) {
          word.toString = empty;
        }
      }
      word.replacement = encode(word.index);
    }, this);
    
    // sort by encoding
    this.sort(function(word1, word2) {
      return word1.index - word2.index;
    });
    
    return this;
  },
  
  exec: function(script) {
    if (!this.count()) return script;
    var self = this;
    return script.replace(this.valueOf(), function(word) {
      return self["#" + word].replacement;
    });
  },
  
  toString: function() {
    var words = this.map(String).join("|").replace(/\|{2,}/g, "|").replace(/^\|+|\|+$/g, "") || "\\x0";
    return "\\b(" + words + ")\\b";
  }
}, {
  Item: {
    count: 0,
    encoded: "",
    index: -1
  }
});
