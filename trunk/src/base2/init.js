
base2 = global.base2 = new Package(this, base2);
eval(this.exports);

lang = new Package(this, lang);
eval(this.exports);

lang.base = base;
lang.extend = extend;

JavaScript = new Package(this, JavaScript);
eval(this.exports);
