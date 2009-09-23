
html5.canvas = jsb.behavior.extend({
	onattach: function(element) {
    G_vmlCanvasManager.initElement(element);
	},
	
	getContext: function(element) {
		return element.getContext();
	}
});
