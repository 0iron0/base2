
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
