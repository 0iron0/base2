
// This is because IE8 is incredibly slow to calculate clientWidth/Height.

// http://stackoverflow.com/questions/800693/clientwidth-performance-in-ie8

// The fix is pretty horrible.
// I use an HTC file (dimensions.htc) that grabs the clientWidth and
// clientHeight properties and caches them.

var _WIDTH = "clientWidth",
    _HEIGHT = "clientHeight";

if (8 == document.documentMode) {

  jsb.clientWidth2 = {};
  Object.defineProperty(global.Element.prototype, "clientWidth2", {
    get: function() {
      return jsb.clientWidth2[this.uniqueID] || this.clientWidth;
    }
  });

  jsb.clientHeight2 = {};
  Object.defineProperty(global.Element.prototype, "clientHeight2", {
    get: function() {
      return jsb.clientHeight2[this.uniqueID] || this.clientHeight;
    }
  });

  _WIDTH = "clientWidth2";
  _HEIGHT = "clientHeight2";
  
  //document.write('<script src="' + jsb.host + 'dimensions.htc"></script>');
}
