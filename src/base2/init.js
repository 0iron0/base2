
base2 = global.base2 = new Package(this, base2);
base2.toString = K("[base2]"); // hide private data here

var exports = this.exports;

lang = new Package(this, lang);
exports += this.exports;

js = new Package(this, js);
eval(exports + this.exports);

lang.extend = extend;

// legacy support
base2.JavaScript = pcopy(js);
base2.JavaScript.namespace += "var JavaScript=js;";
