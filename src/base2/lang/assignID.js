
var $ID = 1;
var assignID = function(object) {
	// assign a unique id
	if (!object.base2ID) object.base2ID = "base2_" + $ID++;
	return object.base2ID;
};
