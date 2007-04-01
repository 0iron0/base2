
var Words = Collection.extend({
	constructor: function(script) {
		this.base();
		forEach (script.match(WORDS), this.add, this);
		this.encode();	
	},
	
	add: function(word) {
		if (!this.exists(word)) this.base(word);
		var word = this.fetch(word);
		word.count++;
		return word;
	},
	
	encode: function() {
		var a = 62;
		eval("var e=" + Packer.ENCODE62);
		
		// sort by frequency
		this.sort(function(word1, word2) {
			return word2.count - word1.count;
		});
		
		// a dictionary of base62 -> base10
		var encoded = new Collection;
		var length = this.count();
		for (var i = 0; i < length; i++) {
			encoded.store(e(i), i);
		}
		
		var empty = function() {return ""};
		var index = 0;
		forEach (this, function(word) {
			if (encoded.exists(word)) {
				word.index = encoded.fetch(word);
				word.toString = empty;
			} else {
				while (this.exists(e(index))) index++;
				word.index = index++;
			}
			word.encoded = e(word.index);
		}, this);
		
		// sort by encoding
		this.sort(function(word1, word2) {
			return word1.index - word2.index;
		});
	},
	
	toString: function() {
		return this.values().join("|");
	}
}, {
	Item: {
		constructor: function(word) {
			this.toString = function() {return word};
		},
		
		count: 0,
		encoded: "",
		index: -1
	}
});
