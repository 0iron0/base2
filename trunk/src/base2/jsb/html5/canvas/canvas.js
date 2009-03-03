//MooCanvas, My Object Oriented Canvas Element. Copyright (c) 2008 Olmo Maldonado, <http://ibolmo.com/>, MIT Style License.
/*
Script: Canvas.js
	Contains the Canvas class.

Dependencies:
	MooTools, <http://mootools.net/>
		Element, and its dependencies

Author:
	Olmo Maldonado, <http://ibolmo.com/>

Credits:
	Lightly based from Ralph Sommerer's work: <http://blogs.msdn.com/sompost/archive/2006/02/22/536967.aspx>
	Moderately based from excanvas: <http://excanvas.sourceforge.net/>
	Great thanks to Inviz, <http://inviz.ru/>, for his optimizing help.

License:
	MIT License, <http://en.wikipedia.org/wiki/MIT_License>
*/

/*
Class: Canvas
	Creates the element <canvas> and extends the element with getContext if not defined.

Syntax:
	>var myCanvas = new Canvas([el,][ props]);

Arguments:
	el    - (element, optional) An unextended canvas Element to extend if necessary.
	props - (object, optional) All the particular properties for an Element. 

Returns:
	(element) A new Canvas Element extended with getContext if necessary.

Example:
	[javascript]
		var cv = new Canvas();
		var ctx = cv.getContext('2d');
		$(document.body).adopt(cv);
	[/javascript]
*/

new base2.Package(this);
eval(this.imports);

function rgbToHex(value) {
  var rgb = map(value.match(/\d+/g), Number);
  return Enumerable.reduce(rgb, function(value, channel) {
    return value += (channel < 16 ? "0" : "") + channel.toString(16);
  }, "#");
};

jsb.createStyleSheet(
	'canvas {text-align:left;display:inline-block;}' +
	'canvas div, canvas div * {position:absolute;overflow:hidden}' +
	'canvas div * {width:10px;height:10px;}' +
	'v\\:*, o\\:* {behavior:url(#default#VML)}'
);

var _contexts = {};

html5.canvas = jsb.behavior.extend({
	onattach: function(element) {
    console2.log("CANVAS!");
    var dummy = document.createElement("div");
    this.setStyle(dummy, {
      width: element.clientWidth + "px",
      height: element.clientHeight + "px"
    });
    element.appendChild(dummy);
	},

	/*onpropertychange: function(element, event) {
		var property = event.propertyName;
		if (property == 'width' || property == 'height') {
			element.style[property] = element[property];
			this.getContext(element).clearRect();
		}
	},

	onresize: function(element) {
		with (DOM.Traversal.getFirstElementChild(element).style) {
			width = element.width;
			height = element.height;
		}
	},*/
	
	getContext: function(element) {
    var uniqueID = element.uniqueID;
		return _contexts[uniqueID] || (_contexts[uniqueID] || new CanvasRenderingContext2D(DOM.Traversal.getFirstElementChild(element)));
	}
});
