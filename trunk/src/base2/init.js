
base2 = global.base2 = new Package(this, base2);
var exports = this.exports;

lang = new Package(this, lang);
exports += this.exports;

JavaScript = new Package(this, JavaScript);
eval(exports + this.exports);

lang.base = base;
lang.extend = extend;
