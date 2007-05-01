
// browser specific code
base2.extend(BOM, {
	name:    "BOM",
	version: "0.9",
	exports: "detect,Window"
});
BOM = new base2.Namespace(this, BOM);

eval(this.imports);
