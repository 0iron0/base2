
var Privates = Encoder.extend({
  constructor: function() {
    return this.base(Privates.PATTERN, function(index) {
      return "_" + Packer.encode62(index);
    }, Privates.IGNORE);
  }
}, {
  IGNORE: {
    CONDITIONAL: IGNORE,
    "(OPERATOR)(REGEXP)": IGNORE
  },
  
  PATTERN: /\b_[\da-zA-Z$][\w$]*\b/g
});
