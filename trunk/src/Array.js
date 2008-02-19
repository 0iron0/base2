
// NOT USED

// If someone ever notices that shift/unshift doesn't work on arguments objects
// then I'll include this file ;-)

extend(Array.prototype, {
  "@opera": {
    shift: function() {
      if (this.callee) {
        var i = 0;
        while (i < this.length) this[i++] = this[i];
        this.length--;
      } else this.base();
    },
    
    unshift: function() {
      if (this.callee) {
        var length = arguments.length;
        var i = this.length += length;
        while (i--) this[i] = i < length ? arguments[i] : this[i - length];
      } else base(this, arguments);
      return this.length;
    }
  }
});
