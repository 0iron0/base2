
// all other libraries allow this handy shortcut so base2 will too :-)

base2.addName("$", function(selector, context) {
	return DocumentSelector.matchSingle(context || document, selector);
});

base2.addName("$$", function(selector, context) {
	return DocumentSelector.matchAll(context || document, selector);
});

if (format("%1", "$$") == "$") { // Safari bug
	with (base2) namespace = namespace.slice(0, -14) + "var $$=base2.$$;";
}
