
var STDOUT = 1;

var Command = Base.extend({
  constructor: function(command) {
    this[STDOUT] = [];    
    this.extend(command); // additional commands
  },
  
  echo: function(string) {
    this[STDOUT].push(string);
  },

  toString: function() {
    return this[STDOUT].join('');
  }
});
