
var Function2 = _createObject2(
  Function,
  "",
  [{
    bind: bind,
    curry: curry,
    delegate: delegate,
    forEach: _Function_forEach,
    not: not,
    unbind: unbind
  }, {
    partial: function(fn) {
    //-  var partial = arguments.callee;
      return function() {
        if (arguments.length >= fn.length) {
          return fn.apply(this, arguments);
        } else if (arguments.length == 0) {
          return arguments.callee;
        } else {
          var supplied = slice(arguments);
          var remaining = [];
          for (var i = supplied.length; i < fn.length; i++) {
            remaining.push("_" + i);
          }
          eval("var f=function(" + 
            remaining.join(",") + 
          "){return fn.apply(this,supplied.concat(slice(arguments)))}");
          return f;
        }
      };
    },
    
    reverse: function(fn) {
      // call the supplied function with its *defined* arguments reversed
      return function() {
        return fn.apply(this, slice(arguments, 0, fn.length).reverse());
      };
    },
    
    shift: function(fn) {
      return function() {
        fn.apply(this, slice(arguments, 1));
      };
    },
    
    slice: function(fn) {
      return function() {
        fn.apply(this, slice.apply(arguments, slice(arguments, 1)));
      };
    },
    
    unshift: function(fn) {
      var args = slice(arguments, 1);
      return function() {
        fn.apply(this, args.concat(slice(arguments)));
      };
    }
  }]
);
