
function updateFlag() {
	// update the "required" flag adjacent to an <input> or <textrea>
	this.nextSibling.style.color = this.value ? "#898E79" : "#A03333";
};

bindings.add("input.required,textarea.required", {
	ondocumentready: updateFlag,		
	ondocumentmouseup: updateFlag,		
	ondocumentkeyup: updateFlag
});
