
// browser specific code
base2.extend(BOM, {
	exports: "detect,Window",
	name: "BOM",
	version: "0.9"
});
BOM = new base2.Namespace(this, BOM);

eval(this.imports);

