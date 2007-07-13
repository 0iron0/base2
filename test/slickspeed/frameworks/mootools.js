//MooTools, My Object Oriented Javascript Tools. Copyright (c) 2006 Valerio Proietti, <http://mad4milk.net>, MIT Style License.

var MooTools = {
	version: '1.2dev'
};

function $defined(obj){
	return (obj != undefined);
};

function $type(obj){
	if (!$defined(obj)) return false;
	if (obj.htmlElement) return 'element';
	var type = typeof obj;
	if (type == 'object' && obj.nodeName){
		switch(obj.nodeType){
			case 1: return 'element';
			case 3: return (/\S/).test(obj.nodeValue) ? 'textnode' : 'whitespace';
		}
	}
	if (type == 'object' || type == 'function'){
		switch(obj.constructor){
			case Array: return 'array';
			case RegExp: return 'regexp';
			case Class: return 'class';
		}
		if (typeof obj.length == 'number'){
			if (obj.item) return 'collection';
			if (obj.callee) return 'arguments';
		}
	}
	return type;
};

function $merge(){
	var mix = {};
	for (var i = 0; i < arguments.length; i++){
		for (var property in arguments[i]){
			var ap = arguments[i][property];
			var mp = mix[property];
			if (mp && $type(ap) == 'object' && $type(mp) == 'object') mix[property] = $merge(mp, ap);
			else mix[property] = ap;
		}
	}
	return mix;
};

var $extend = function(){
	var args = arguments;
	if (!args[1]) args = [this, args[0]];
	for (var property in args[1]) args[0][property] = args[1][property];
	return args[0];
};

var $native = function(){
	for (var i = 0, l = arguments.length; i < l; i++){
		arguments[i].extend = function(props){
			for (var prop in props){
				if (!this.prototype[prop]) this.prototype[prop] = props[prop];
				if (!this[prop]) this[prop] = $native.generic(prop);
			}
		};
	}
};

$native.generic = function(prop){
	return function(bind){
		return this.prototype[prop].apply(bind, Array.prototype.slice.call(arguments, 1));
	};
};

$native(Function, Array, String, Number);

function $chk(obj){
	return !!(obj || obj === 0);
};

function $pick(obj, picked){
	return $defined(obj) ? obj : picked;
};

function $random(min, max){
	return Math.floor(Math.random() * (max - min + 1) + min);
};

function $time(){
	return new Date().getTime();
};

function $clear(timer){
	clearTimeout(timer);
	clearInterval(timer);
	return null;
};

function $splat(obj){
	var type = $type(obj);
	if (type && type != 'array') obj = [obj];
	return obj;
};

function $try(fn, bind, args){
	try {
		return fn.apply(bind || fn, $splat(args));
	} catch(e){
		return false;
	}
};

Function.empty = function(){};

var Abstract = function(obj){
	obj = obj || {};
	obj.extend = $extend;
	return obj;
};

var Window = new Abstract(window);
var Document = new Abstract(document);
document.head = document.getElementsByTagName('head')[0];

var Client = {'engine': {'name': 'unknown', 'version': ''}, 'platform': {}, 'features': {}};
Client.features.xhr = !!(window.XMLHttpRequest);
Client.features.xpath = !!(document.evaluate);
if (window.opera) Client.engine.name = 'opera';
else if (window.ActiveXObject) Client.engine = {'name': 'ie', 'version': (Client.features.xhr) ? 7 : 6};
else if (!navigator.taintEnabled) Client.engine = {'name': 'webkit', 'version': (Client.features.xpath) ? 420 : 419};
else if (document.getBoxObjectFor != null) Client.engine.name = 'gecko';
Client.engine[Client.engine.name] = Client.engine[Client.engine.name + Client.engine.version] = true;
Client.platform.name = navigator.platform.match(/(mac)|(win)|(linux)|(nix)/i) || ['Other'];
Client.platform.name = Client.platform.name[0].toLowerCase();
Client.platform[Client.platform.name] = true;

if (typeof HTMLElement == 'undefined'){
	var HTMLElement = Function.empty;
	if (Client.engine.webkit) document.createElement("iframe");
	HTMLElement.prototype = (Client.engine.webkit) ? window["[[DOMElement.prototype]]"] : {};
}
HTMLElement.prototype.htmlElement = Function.empty;

if (Client.engine.ie6) $try(document.execCommand, document, ["BackgroundImageCache", false, true]);

var Class = function(properties){
	var klass = function(){
		return (arguments[0] !== null && this.initialize && $type(this.initialize) == 'function') ? this.initialize.apply(this, arguments) : this;
	};
	$extend(klass, this);
	klass.prototype = properties;
	klass.constructor = Class;
	return klass;
};

Class.empty = Function.empty;

Class.prototype = {

	extend: function(properties){
		var proto = new this(null);
		for (var property in properties){
			var pp = proto[property];
			proto[property] = Class.Merge(pp, properties[property]);
		}
		return new Class(proto);
	},

	implement: function(){
		for (var i = 0, l = arguments.length; i < l; i++) $extend(this.prototype, arguments[i]);
	}

};

Class.Merge = function(previous, current){
	if (previous && previous != current){
		var type = $type(current);
		if (type != $type(previous)) return current;
		switch(type){
			case 'function':
				var merged = function(){
					this.parent = arguments.callee.parent;
					return current.apply(this, arguments);
				};
				merged.parent = previous;
				return merged;
			case 'object': return $merge(previous, current);
		}
	}
	return current;
};

Array.extend({

	forEach: function(fn, bind){
		for (var i = 0, j = this.length; i < j; i++) fn.call(bind, this[i], i, this);
	},

	filter: function(fn, bind){
		var results = [];
		for (var i = 0, j = this.length; i < j; i++){
			if (fn.call(bind, this[i], i, this)) results.push(this[i]);
		}
		return results;
	},

	map: function(fn, bind){
		var results = [];
		for (var i = 0, j = this.length; i < j; i++) results[i] = fn.call(bind, this[i], i, this);
		return results;
	},

	every: function(fn, bind){
		for (var i = 0, j = this.length; i < j; i++){
			if (!fn.call(bind, this[i], i, this)) return false;
		}
		return true;
	},

	some: function(fn, bind){
		for (var i = 0, j = this.length; i < j; i++){
			if (fn.call(bind, this[i], i, this)) return true;
		}
		return false;
	},

	indexOf: function(item, from){
		var len = this.length;
		for (var i = (from < 0) ? Math.max(0, len + from) : from || 0; i < len; i++){
			if (this[i] === item) return i;
		}
		return -1;
	},

	copy: function(start, length){
		start = start || 0;
		if (start < 0) start = this.length + start;
		length = length || (this.length - start);
		var newArray = [];
		for (var i = 0; i < length; i++) newArray[i] = this[start++];
		return newArray;
	},

	remove: function(item){
		var i = 0;
		var len = this.length;
		while (i < len){
			if (this[i] === item){
				this.splice(i, 1);
				len--;
			} else {
				i++;
			}
		}
		return this;
	},

	contains: function(item, from){
		return this.indexOf(item, from) != -1;
	},

	associate: function(keys){
		var obj = {}, length = Math.min(this.length, keys.length);
		for (var i = 0; i < length; i++) obj[keys[i]] = this[i];
		return obj;
	},

	extend: function(array){
		for (var i = 0, j = array.length; i < j; i++) this.push(array[i]);
		return this;
	},

	merge: function(array){
		for (var i = 0, l = array.length; i < l; i++) this.include(array[i]);
		return this;
	},

	include: function(item){
		if (!this.contains(item)) this.push(item);
		return this;
	},

	getRandom: function(){
		return (this.length) ? this[$random(0, this.length - 1)] : null;
	},

	getLast: function(){
		return (this.length) ? this[this.length - 1] : null;
	}

});

Array.prototype.each = Array.prototype.forEach;
Array.each = Array.forEach;

function $A(array){
	return Array.copy(array);
};

function $each(iterable, fn, bind){
	if (iterable && typeof iterable.length == 'number' && $type(iterable) != 'object'){
		Array.forEach(iterable, fn, bind);
	} else {
		 for (var name in iterable) fn.call(bind || iterable, iterable[name], name);
	}
};

String.extend({

	test: function(regex, params){
		return (($type(regex) == 'string') ? new RegExp(regex, params) : regex).test(this);
	},

	toInt: function(){
		return parseInt(this, 10);
	},

	toFloat: function(){
		return parseFloat(this);
	},

	camelCase: function(){
		return this.replace(/-\D/g, function(match){
			return match.charAt(1).toUpperCase();
		});
	},

	hyphenate: function(){
		return this.replace(/\w[A-Z]/g, function(match){
			return (match.charAt(0) + '-' + match.charAt(1).toLowerCase());
		});
	},

	capitalize: function(){
		return this.replace(/\b[a-z]/g, function(match){
			return match.toUpperCase();
		});
	},

	trim: function(){
		return this.replace(/^\s+|\s+$/g, '');
	},

	clean: function(){
		return this.replace(/\s{2,}/g, ' ').trim();
	},

	rgbToHex: function(array){
		var rgb = this.match(/\d{1,3}/g);
		return (rgb) ? rgb.rgbToHex(array) : false;
	},

	hexToRgb: function(array){
		var hex = this.match(/^#?(\w{1,2})(\w{1,2})(\w{1,2})$/);
		return (hex) ? hex.slice(1).hexToRgb(array) : false;
	},

	contains: function(string, s){
		return (s) ? (s + this + s).indexOf(s + string + s) > -1 : this.indexOf(string) > -1;
	},

	escapeRegExp: function(){
		return this.replace(/([.*+?^${}()|[\]\/\\])/g, '\\$1');
	}

});

Array.extend({

	rgbToHex: function(array){
		if (this.length < 3) return false;
		if (this.length == 4 && this[3] == 0 && !array) return 'transparent';
		var hex = [];
		for (var i = 0; i < 3; i++){
			var bit = (this[i] - 0).toString(16);
			hex.push((bit.length == 1) ? '0' + bit : bit);
		}
		return array ? hex : '#' + hex.join('');
	},

	hexToRgb: function(array){
		if (this.length != 3) return false;
		var rgb = [];
		for (var i = 0; i < 3; i++){
			rgb.push(parseInt((this[i].length == 1) ? this[i] + this[i] : this[i], 16));
		}
		return array ? rgb : 'rgb(' + rgb.join(',') + ')';
	}

});

Function.extend({

	create: function(options){
		var self = this;
		options = $merge({
			'bind': self,
			'arguments': null,
			'delay': false,
			'periodical': false,
			'attempt': false,
			'event': false
		}, options);
		return function(event){
			var args = $splat(options.arguments) || arguments;
			if (options.event) args = [event || window.event].extend(args);
			var returns = function(){
				return self.apply($pick(options.bind, self), args);
			};
			if (options.delay) return setTimeout(returns, options.delay);
			if (options.periodical) return setInterval(returns, options.periodical);
			if (options.attempt) try {return returns();} catch(err){return false;};
			return returns();
		};
	},

	pass: function(args, bind){
		return this.create({'arguments': args, 'bind': bind});
	},

	attempt: function(args, bind){
		return this.create({'arguments': args, 'bind': bind, 'attempt': true})();
	},

	bind: function(bind, args, evt){
		return this.create({'bind': bind, 'arguments': args, 'event': evt});
	},

	delay: function(delay, bind, args){
		return this.create({'delay': delay, 'bind': bind, 'arguments': args})();
	},

	periodical: function(interval, bind, args){
		return this.create({'periodical': interval, 'bind': bind, 'arguments': args})();
	}

});

Number.extend({

	toInt: function(){
		return parseInt(this);
	},

	toFloat: function(){
		return parseFloat(this);
	},

	limit: function(min, max){
		return Math.min(max, Math.max(min, this));
	},

	round: function(precision){
		precision = Math.pow(10, precision || 0);
		return Math.round(this * precision) / precision;
	},

	times: function(fn){
		for (var i = 0; i < this; i++) fn(i);
	}

});

var Element = new Class({

	initialize: function(el, props){
		if ($type(el) == 'string'){
			if (Client.engine.ie && props && (props.name || props.type)){
				var name = (props.name) ? ' name="' + props.name + '"' : '';
				var type = (props.type) ? ' type="' + props.type + '"' : '';
				delete props.name;
				delete props.type;
				el = '<' + el + name + type + '>';
			}
			el = document.createElement(el);
		}
		el = $(el);
		return (!props || !el) ? el : el.set(props);
	}

});

var Elements = new Class({

	initialize: function(elements){
		return (elements) ? $extend(elements, this) : this;
	}

});

Elements.extend = function(props){
	for (var prop in props){
		this.prototype[prop] = props[prop];
		this[prop] = $native.generic(prop);
	}
};

function $(el){
	if (!el) return null;
	if (el.htmlElement) return Garbage.collect(el);
	if ([window, document].contains(el)) return el;
	var type = $type(el);
	if (type == 'string'){
		el = document.getElementById(el);
		type = (el) ? 'element' : false;
	}
	if (type != 'element') return null;
	if (el.htmlElement) return Garbage.collect(el);
	if (['object', 'embed'].contains(el.tagName.toLowerCase())) return el;
	$extend(el, Element.prototype);
	el.htmlElement = Function.empty;
	return Garbage.collect(el);
};

document.getElementsBySelector = document.getElementsByTagName;

function $$(){
	var elements = [];
	for (var i = 0, j = arguments.length; i < j; i++){
		var selector = arguments[i];
		switch($type(selector)){
			case 'element': elements.push(selector);
			case 'boolean': break;
			case false: break;
			case 'string': selector = document.getElementsBySelector(selector, true);
			default: elements.extend(selector);
		}
	}
	return $$.unique(elements);
};

$$.unique = function(array){
	var elements = [];
	for (var i = 0, l = array.length; i < l; i++){
		if (array[i].$included) continue;
		var element = $(array[i]);
		if (element && !element.$included){
			element.$included = true;
			elements.push(element);
		}
	}
	for (var n = 0, d = elements.length; n < d; n++) elements[n].$included = null;
	return new Elements(elements);
};

Elements.Multi = function(property){
	return function(){
		var args = arguments;
		var items = [];
		var elements = true;
		for (var i = 0, j = this.length, returns; i < j; i++){
			returns = this[i][property].apply(this[i], args);
			if ($type(returns) != 'element') elements = false;
			items.push(returns);
		};
		return (elements) ? $$.unique(items) : items;
	};
};

Element.extend = function(properties){
	for (var property in properties){
		HTMLElement.prototype[property] = properties[property];
		Element.prototype[property] = properties[property];
		Element[property] = $native.generic(property);
		var elementsProperty = (Array.prototype[property]) ? property + 'Elements' : property;
		Elements.prototype[elementsProperty] = Elements.Multi(property);
	}
};

Element.extend({

	set: function(props){
		for (var prop in props){
			var val = props[prop];
			switch(prop){
				case 'styles': this.setStyles(val); break;
				case 'events': if (this.addEvents) this.addEvents(val); break;
				case 'properties': this.setProperties(val); break;
				default: this.setProperty(prop, val);
			}
		}
		return this;
	},

	inject: function(el, where){
		el = $(el);
		switch(where){
			case 'before': el.parentNode.insertBefore(this, el); break;
			case 'after':
				var next = el.getNext();
				if (!next) el.parentNode.appendChild(this);
				else el.parentNode.insertBefore(this, next);
				break;
			case 'top':
				var first = el.firstChild;
				if (first){
					el.insertBefore(this, first);
					break;
				}
			default: el.appendChild(this);
		}
		return this;
	},

	injectBefore: function(el){
		return this.inject(el, 'before');
	},

	injectAfter: function(el){
		return this.inject(el, 'after');
	},

	injectInside: function(el){
		return this.inject(el, 'bottom');
	},

	injectTop: function(el){
		return this.inject(el, 'top');
	},

	adopt: function(){
		var elements = [];
		$each(arguments, function(argument){
			elements = elements.concat(argument);
		});
		$$(elements).inject(this);
		return this;
	},

	remove: function(){
		return this.parentNode.removeChild(this);
	},

	clone: function(contents){
		var el = $(this.cloneNode(contents !== false));
		if (!el.$events) return el;
		el.$events = {};
		for (var type in this.$events) el.$events[type] = {
			'keys': $A(this.$events[type].keys),
			'values': $A(this.$events[type].values)
		};
		return el.removeEvents();
	},

	replaceWith: function(el){
		el = $(el);
		this.parentNode.replaceChild(el, this);
		return el;
	},

	appendText: function(text){
		this.appendChild(document.createTextNode(text));
		return this;
	},

	hasClass: function(className){
		return this.className.contains(className, ' ');
	},

	addClass: function(className){
		if (!this.hasClass(className)) this.className = (this.className + ' ' + className).clean();
		return this;
	},

	removeClass: function(className){
		this.className = this.className.replace(new RegExp('(^|\\s)' + className + '(?:\\s|$)'), '$1').clean();
		return this;
	},

	toggleClass: function(className){
		return this.hasClass(className) ? this.removeClass(className) : this.addClass(className);
	},

	setStyle: function(property, value){
		switch(property){
			case 'opacity': return this.setOpacity(parseFloat(value));
			case 'float': property = (Client.engine.ie) ? 'styleFloat' : 'cssFloat';
		}
		property = property.camelCase();
		switch($type(value)){
			case 'number': if (!['zIndex', 'zoom'].contains(property)) value += 'px'; break;
			case 'array': value = 'rgb(' + value.join(',') + ')';
		}
		this.style[property] = value;
		return this;
	},

	setStyles: function(source){
		switch($type(source)){
			case 'object': Element.$setMany(this, 'setStyle', source); break;
			case 'string': this.style.cssText = source;
		}
		return this;
	},

	setOpacity: function(opacity){
		if (opacity == 0){
			if (this.style.visibility != "hidden") this.style.visibility = "hidden";
		} else {
			if (this.style.visibility != "visible") this.style.visibility = "visible";
		}
		if (!this.currentStyle || !this.currentStyle.hasLayout) this.style.zoom = 1;
		if (Client.engine.ie) this.style.filter = (opacity == 1) ? '' : "alpha(opacity=" + opacity * 100 + ")";
		this.style.opacity = this.$tmp.opacity = opacity;
		return this;
	},

	getStyle: function(property){
		property = property.camelCase();
		var result = this.style[property];
		if (!$chk(result)){
			if (property == 'opacity') return this.$tmp.opacity;
			result = [];
			for (var style in Element.$styles){
				if (property == style){
					Element.$styles[style].each(function(s){
						var style = this.getStyle(s);
						result.push(parseInt(style) ? style : '0px');
					}, this);
					if (property == 'border'){
						var every = result.every(function(bit){
							return (bit == result[0]);
						});
						return (every) ? result[0] : false;
					}
					return result.join(' ');
				}
			}
			if (property.contains('border')){
				if (Element.$styles.border.contains(property)){
					return ['Width', 'Style', 'Color'].map(function(p){
						return this.getStyle(property + p);
					}, this).join(' ');
				} else if (Element.$borderShort.contains(property)){
					return ['Top', 'Right', 'Bottom', 'Left'].map(function(p){
						return this.getStyle('border' + p + property.replace('border', ''));
					}, this).join(' ');
				}
			}
			if (document.defaultView) result = document.defaultView.getComputedStyle(this, null).getPropertyValue(property.hyphenate());
			else if (this.currentStyle) result = this.currentStyle[property];
		}
		if (Client.engine.ie) result = Element.$fixStyle(property, result, this);
		if (result && property.test(/color/i) && result.contains('rgb')){
			return result.split('rgb').splice(1,4).map(function(color){
				return color.rgbToHex();
			}).join(' ');
		}
		return result;
	},

	getStyles: function(){
		return Element.$getMany(this, 'getStyle', arguments);
	},

	walk: function(brother, start){
		brother += 'Sibling';
		var el = (start) ? this[start] : this[brother];
		while (el && $type(el) != 'element') el = el[brother];
		return $(el);
	},

	getPrevious: function(){
		return this.walk('previous');
	},

	getNext: function(){
		return this.walk('next');
	},

	getFirst: function(){
		return this.walk('next', 'firstChild');
	},

	getLast: function(){
		return this.walk('previous', 'lastChild');
	},

	getParent: function(){
		return $(this.parentNode);
	},

	getChildren: function(){
		return $$(this.childNodes);
	},

	hasChild: function(el){
		return !!$A(this.getElementsByTagName('*')).contains(el);
	},

	getProperty: function(property){
		var index = Element.$properties[property];
		if (index) return this[index];
		var flag = Element.$propertiesIFlag[property] || 0;
		if (!Client.engine.ie || flag) return this.getAttribute(property, flag);
		var node = this.attributes[property];
		return (node) ? node.nodeValue : null;
	},

	removeProperty: function(property){
		var index = Element.$properties[property];
		if (index) this[index] = '';
		else this.removeAttribute(property);
		return this;
	},

	getProperties: function(){
		return Element.$getMany(this, 'getProperty', arguments);
	},

	setProperty: function(property, value){
		var index = Element.$properties[property];
		if (index) this[index] = value;
		else this.setAttribute(property, value);
		return this;
	},

	setProperties: function(source){
		return Element.$setMany(this, 'setProperty', source);
	},

	setHTML: function(){
		this.innerHTML = $A(arguments).join('');
		return this;
	},

	setText: function(text){
		var tag = this.getTag();
		if (['style', 'script'].contains(tag)){
			if (Client.engine.ie){
				if (tag == 'style') this.styleSheet.cssText = text;
				else if (tag ==  'script') this.setProperty('text', text);
				return this;
			} else {
				this.removeChild(this.firstChild);
				return this.appendText(text);
			}
		}
		this[$defined(this.innerText) ? 'innerText' : 'textContent'] = text;
		return this;
	},

	getText: function(){
		var tag = this.getTag();
		if (['style', 'script'].contains(tag)){
			if (Client.engine.ie){
				if (tag == 'style') return this.styleSheet.cssText;
				else if (tag ==  'script') return this.getProperty('text');
			} else {
				return this.innerHTML;
			}
		}
		return ($pick(this.innerText, this.textContent));
	},

	getTag: function(){
		return this.tagName.toLowerCase();
	},

	empty: function(){
		Garbage.trash(this.getElementsByTagName('*'));
		return this.setHTML('');
	}

});

Element.$fixStyle = function(property, result, element){
	if ($chk(parseInt(result))) return result;
	if (['height', 'width'].contains(property)){
		var values = (property == 'width') ? ['left', 'right'] : ['top', 'bottom'];
		var size = 0;
		values.each(function(value){
			size += element.getStyle('border-' + value + '-width').toInt() + element.getStyle('padding-' + value).toInt();
		});
		return element['offset' + property.capitalize()] - size + 'px';
	} else if (property.test(/border(.+)Width|margin|padding/)){
		return '0px';
	}
	return result;
};

Element.$styles = {'border': [], 'padding': [], 'margin': []};
['Top', 'Right', 'Bottom', 'Left'].each(function(direction){
	for (var style in Element.$styles) Element.$styles[style].push(style + direction);
});

Element.$borderShort = ['borderWidth', 'borderStyle', 'borderColor'];

Element.$getMany = function(el, method, keys){
	var result = {};
	$each(keys, function(key){
		result[key] = el[method](key);
	});
	return result;
};

Element.$setMany = function(el, method, pairs){
	for (var key in pairs) el[method](key, pairs[key]);
	return el;
};

Element.$properties = new Abstract({
	'class': 'className', 'for': 'htmlFor', 'colspan': 'colSpan', 'rowspan': 'rowSpan',
	'accesskey': 'accessKey', 'tabindex': 'tabIndex', 'maxlength': 'maxLength',
	'readonly': 'readOnly', 'frameborder': 'frameBorder', 'value': 'value', 'height': 'height', 'width': 'width',
	'disabled': 'disabled', 'checked': 'checked', 'multiple': 'multiple', 'selected': 'selected'
});

Element.$propertiesIFlag = {
	'href': 2, 'src': 2
};

Element.$listenerMethods = {

	addListener: function(type, fn){
		if (this.addEventListener) this.addEventListener(type, fn, false);
		else this.attachEvent('on' + type, fn);
		return this;
	},

	removeListener: function(type, fn){
		if (this.removeEventListener) this.removeEventListener(type, fn, false);
		else this.detachEvent('on' + type, fn);
		return this;
	}

};

window.extend(Element.$listenerMethods);
document.extend(Element.$listenerMethods);
Element.extend(Element.$listenerMethods);

var Garbage = {

	elements: [],

	collect: function(el){
		if (!el.$tmp){
			Garbage.elements.push(el);
			el.$tmp = {'opacity': 1};
		}
		return el;
	},

	trash: function(elements){
		for (var i = 0, j = elements.length, el; i < j; i++){
			if (!(el = elements[i]) || !el.$tmp) continue;
			if (el.$events) el.fireEvent('trash').removeEvents();
			for (var p in el.$tmp) el.$tmp[p] = null;
			for (var d in Element.prototype) el[d] = null;
			Garbage.elements[Garbage.elements.indexOf(el)] = null;
			el.htmlElement = el.$tmp = el = null;
		}
		Garbage.elements.remove(null);
	},

	empty: function(){
		Garbage.collect(window);
		Garbage.collect(document);
		Garbage.trash(Garbage.elements);
	}

};

window.addListener('beforeunload', function(){
	window.addListener('unload', Garbage.empty);
	if (Client.engine.ie) window.addListener('unload', CollectGarbage);
});

Elements.extend({

	filterByTag: function(tag, nocash){
		var elements = this.filter(function(el){
			return (Element.getTag(el) == tag);
		});
		return (nocash) ? elements : new Elements(elements);
	},

	filterByClass: function(className, nocash){
		var elements = this.filter(function(el){
			return (el.className && el.className.contains(className, ' '));
		});
		return (nocash) ? elements : new Elements(elements);
	},

	filterById: function(id, nocash){
		var elements = this.filter(function(el){
			return (el.id == id);
		});
		return (nocash) ? elements : new Elements(elements);
	},

	filterByAttribute: function(name, operator, value, nocash){
		var elements = this.filter(function(el){
			var current = Element.getProperty(el, name);
			if (!current) return false;
			if (!operator) return true;
			switch(operator){
				case '=': return (current == value);
				case '*=': return (current.contains(value));
				case '^=': return (current.substr(0, value.length) == value);
				case '$=': return (current.substr(current.length - value.length) == value);
				case '!=': return (current != value);
				case '~=': return current.contains(value, ' ');
			}
			return false;
		});
		return (nocash) ? elements : new Elements(elements);
	}

});

Element.$domMethods = {

	getElements: function(selector, nocash){
		var items = [];
		var separators = [];
		selector = selector.trim().replace(Selectors.sRegExp, function(match){
			if (match.charAt(2)) match = match.trim();
			separators.push(match.charAt(0));
			return '%' + match.charAt(1);
		}).split('%');
		for (var i = 0, j = selector.length; i < j; i++){
			var param = selector[i].match(Selectors.regExp);
			if (!param) throw new Error('bad selector');
			var temp = Selectors.Method.getParam(items, separators[i - 1] || false, this, param[1] || '*', param[2], param[3], param[4], param[5]);
			if (!temp) break;
			items = temp;
		}
		return Selectors.Method.getItems(items, this, nocash);
	},

	getElement: function(selector){
		return $(this.getElements(selector, true)[0]);
	},

	getElementsBySelector: function(selector, nocash){
		var elements = [];
		selector = selector.split(',');
		for (var i = 0, j = selector.length; i < j; i++) elements = elements.concat(this.getElements(selector[i], true));
		return (nocash) ? elements : $$.unique(elements);
	}

};

Element.extend({

	getElementById: function(id){
		var el = document.getElementById(id);
		if (!el) return null;
		for (var parent = el.parentNode; parent != this; parent = parent.parentNode){
			if (!parent) return null;
		}
		return el;
	}

});

document.extend(Element.$domMethods);
Element.extend(Element.$domMethods);

var $E = document.getElement;

var Selectors = {

	'regExp': /^(\w*|\*)(?:#([\w-]+))?(?:\.([\w-]+))?(?:\[(.*)\])?(?::(.*))?$/,

	'aRegExp': /^(\w+)(?:([!*^$~]?=)["']?([^"'\]]*)["']?)?$/,

	'sRegExp': /\s*([+>~\s])[a-zA-Z#.*\s]/g,

	'pRegExp': /^([\w-]+)(?:\((.*)\))?$/

};

Selectors.Pseudo = new Abstract();

Selectors.Pseudo.$parse = function(pseudo){
	pseudo = pseudo.match(Selectors.pRegExp);
	if (!pseudo) throw new Error('bad pseudo selector');
	var name = pseudo[1].split('-')[0];
	var argument = pseudo[2] || false;
	var xparser = Selectors.Pseudo[name];
	if (xparser && xparser.parser) return {'name': name, 'argument': (xparser.parser.apply) ? xparser.parser(argument) : xparser.parser};
	else return {'name': name, 'argument': argument};
};

Selectors.XPath = {

	getParam: function(items, separator, context, tag, id, className, attribute, pseudo){
		var temp = context.namespaceURI ? 'xhtml:' : '';
		switch(separator){
			case '~': case '+': temp += '/following-sibling::'; break;
			case '>': temp += '/'; break;
			case ' ': temp += '//';
		}
		temp += tag;
		if (separator == '+') temp += '[1]';
		if (pseudo){
			pseudo = Selectors.Pseudo.$parse(pseudo);
			var xparser = Selectors.Pseudo[pseudo.name];
			if (xparser && xparser.xpath) temp += xparser.xpath(pseudo.argument);
			else temp += ($chk(pseudo.argument)) ? '[@' + pseudo.name + '="' + pseudo.argument + '"]' : '[@' + pseudo.name + ']';
		}
		if (id) temp += '[@id="' + id + '"]';
		if (className) temp += '[contains(concat(" ", @class, " "), " ' + className + ' ")]';
		if (attribute){
			attribute = attribute.match(Selectors.aRegExp);
			if (!attribute) throw new Error('bad attribute selector');
			if (attribute[2] && attribute[3]){
				switch(attribute[2]){
					case '=': temp += '[@' + attribute[1] + '="' + attribute[3] + '"]'; break;
					case '*=': temp += '[contains(@' + attribute[1] + ', "' + attribute[3] + '")]'; break;
					case '^=': temp += '[starts-with(@' + attribute[1] + ', "' + attribute[3] + '")]'; break;
					case '$=': temp += '[substring(@' + attribute[1] + ', string-length(@' + attribute[1] + ') - ' + attribute[3].length + ' + 1) = "' + attribute[3] + '"]'; break;
					case '!=': temp += '[@' + attribute[1] + '!="' + attribute[3] + '"]'; break;
					case '~=': temp += '[contains(concat(" ", @' + attribute[1] + ', " "), " ' + attribute[3] + ' ")]';
				}
			} else {
				temp += '[@' + attribute[1] + ']';
			}
		}
		items.push(temp);
		return items;
	},

	getItems: function(items, context, nocash){
		var elements = [];
		var xpath = document.evaluate('.//' + items.join(''), context, Selectors.XPath.resolver, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
		for (var i = 0, j = xpath.snapshotLength; i < j; i++) elements.push(xpath.snapshotItem(i));
		return (nocash) ? elements : new Elements(elements.map($));
	},

	resolver: function(prefix){
		return (prefix == 'xhtml') ? 'http://www.w3.org/1999/xhtml' : false;
	}

};

Selectors.Filter = {

	getParam: function(items, separator, context, tag, id, className, attribute, pseudo){
		if (separator){
			switch(separator){
				case ' ': items = Selectors.Filter.getNestedByTag(items, tag); break;
				case '>': items = Selectors.Filter.getChildrenByTag(items, tag); break;
				case '+': items = Selectors.Filter.getFollowingByTag(items, tag); break;
				case '~': items = Selectors.Filter.getFollowingByTag(items, tag, true);
			}
			if (id) items = Elements.filterById(items, id, true);
		} else {
			if (id){
				var el = context.getElementById(id);
				if (!el || ((tag != '*') && (el.tagName.toLowerCase() != tag))) return false;
				items = [el];
			} else {
				items = $A(context.getElementsByTagName(tag));
			}
		}
		if (className) items = Elements.filterByClass(items, className, true);
		if (attribute){
			attribute = attribute.match(Selectors.aRegExp);
			if (!attribute) throw new Error('bad attribute selector');
			items = Elements.filterByAttribute(items, attribute[1], attribute[2], attribute[3], true);
		}
		if (pseudo){
			pseudo = Selectors.Pseudo.$parse(pseudo);
			var xparser = Selectors.Pseudo[pseudo.name];
			if (xparser && xparser.filter){
				var temp = {};
				items = items.filter(function(el, i, array){
					return xparser.filter(el, pseudo.argument, i, array, temp);
				});
				temp = null;
			} else {
				items = Elements.filterByAttribute(items, param.name, '=', param.arg, true);
			}
		}
		return items;
	},

	getItems: function(items, context, nocash){
		return (nocash) ? items : $$.unique(items);
	},

	hasTag: function(el, tag){
		return (el.nodeName && el.nodeType == 1 && (tag == '*' || el.tagName.toLowerCase() == tag));
	},

	getFollowingByTag: function(context, tag, all){
		var found = [];
		for (var i = 0, j = context.length; i < j; i++){
			var next = context[i].nextSibling;
			while (next){
				if (Selectors.Filter.hasTag(next, tag)){
					found.push(next);
					if (!all) break;
				}
				next = next.nextSibling;
			}
		}
		return found;
	},

	getChildrenByTag: function(context, tag){
		var found = [];
		for (var i = 0, j = context.length; i < j; i++){
			var children = context[i].childNodes;
			for (var k = 0, l = children.length; k < l; k++){
				if (Selectors.Filter.hasTag(children[k], tag)) found.push(children[k]);
			}
		}
		return found;
	},

	getNestedByTag: function(context, tag){
		var found = [];
		for (var i = 0, j = context.length; i < j; i++) found.extend(context[i].getElementsByTagName(tag));
		return found;
	}

};

Selectors.Method = (Client.features.xpath) ? Selectors.XPath : Selectors.Filter;

Selectors.Pseudo.enabled = {

	xpath: function(){
		return '[not(@disabled)]';
	},

	filter: function(el){
		return !(el.disabled);
	}
};

Selectors.Pseudo.empty = {

	xpath: function(){
		return '[not(node())]';
	},

	filter: function(el){
		return (Element.getText(el).length === 0);
	}

};

Selectors.Pseudo.contains = {

	xpath: function(argument){
		return '[contains(text(), "' + argument + '")]';
	},

	filter: function(el, argument){
		for (var i = 0, l = el.childNodes.length; i < l; i++){
			var child = el.childNodes[i];
			if (child.nodeName && child.nodeType == 3 && child.nodeValue.contains(argument)) return true;
		}
		return false;
	}

};

Selectors.Pseudo.nth = {

	parser: function(argument){
		argument = (argument) ? argument.match(/^([+-]?\d*)?([nodev]+)?([+-]?\d*)?$/) : [null, 1, 'n', 0];
		if (!argument) throw new Error('bad nth pseudo selector arguments');
		var inta = parseInt(argument[1]);
		var a = ($chk(inta)) ? inta : 1;
		var special = argument[2] || false;
		var b = parseInt(argument[3]) || 0;
		b = b - 1;
		while (b < 1) b += a;
		while (b >= a) b -= a;
		switch(special){
			case 'n': return {'a': a, 'b': b, 'special': 'n'};
			case 'odd': return {'a': 2, 'b': 0, 'special': 'n'};
			case 'even': return {'a': 2, 'b': 1, 'special': 'n'};
			case 'first': return {'a': 0, 'special': 'index'};
			case 'last': return {'special': 'last'};
			case 'only': return {'special': 'only'};
			default: return {'a': (a - 1), 'special': 'index'};
		}
	},

	xpath: function(argument){
		switch(argument.special){
			case 'n': return '[count(preceding-sibling::*) mod ' + argument.a + ' = ' + argument.b + ']';
			case 'last': return '[count(following-sibling::*) = 0]';
			case 'only': return '[not(preceding-sibling::* or following-sibling::*)]';
			default: return '[count(preceding-sibling::*) = ' + argument.a + ']';
		}
	},

	filter: function(el, argument, i, all, temp){
		if (i == 0) temp.parents = [];
		var parent = el.parentNode;
		if (!parent.$children){
			temp.parents.push(parent);
			parent.$children = parent.$children || Array.filter(parent.childNodes, function(child){
				return (child.nodeName && child.nodeType == 1);
			});
		}
		var include = false;
		switch(argument.special){
			case 'n': if (parent.$children.indexOf(el) % argument.a == argument.b) include = true; break;
			case 'last': if (parent.$children.getLast() == el) include = true; break;
			case 'only': if (parent.$children.length == 1) include = true; break;
			case 'index': if (parent.$children[argument.a] == el) include = true;
		}
		if (i == all.length - 1){
			for (var j = 0, l = temp.parents.length; j < l; j++) temp.parents[j].$children = null;
		}
		return include;
	}

};

Selectors.Pseudo.extend({

	'even': {
		'parser': {'a': 2, 'b': 1, 'special': 'n'},
		'xpath': Selectors.Pseudo.nth.xpath,
		'filter': Selectors.Pseudo.nth.filter
	},

	'odd': {
		'parser': {'a': 2, 'b': 0, 'special': 'n'},
		'xpath': Selectors.Pseudo.nth.xpath,
		'filter': Selectors.Pseudo.nth.filter
	},

	'first': {
		'parser': {'a': 0, 'special': 'index'},
		'xpath': Selectors.Pseudo.nth.xpath,
		'filter': Selectors.Pseudo.nth.filter
	},

	'last': {
		'parser': {'special': 'last'},
		'xpath': Selectors.Pseudo.nth.xpath,
		'filter': Selectors.Pseudo.nth.filter
	},

	'only': {
		'parser': {'special': 'only'},
		'xpath': Selectors.Pseudo.nth.xpath,
		'filter': Selectors.Pseudo.nth.filter
	}

});