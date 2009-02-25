
// NOT USED

var Sorted = Trait.extend({  
  merge: function() {
    this._frozen = true;
    this.base.apply(this, arguments);
    delete this._frozen;
    this.sort();
    return this;
  },
  
  put:    _resort,
  remove: _resort
});

function _resort() {
  var value = this.base.apply(this, arguments);
  if (!this._frozen) this.sort();
  return value;
};
