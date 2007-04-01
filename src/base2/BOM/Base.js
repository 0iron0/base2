
var _extend = Base.prototype.extend;
Base.prototype.extend = function(source, value) {
	if (typeof source == "string" && source.charAt(0) == "@") {
		return BOM.detect(source.slice(1)) ? _extend.call(this, value) : this;
	}
	return _extend.apply(this, arguments);
};
