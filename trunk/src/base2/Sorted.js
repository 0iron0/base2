
// NOT USED

var Sorted = Trait.extend({  
  merge: function() {
    this._frozen = true;
    base(this, arguments);
    delete this._frozen;
    this.sort();
    return this;
  },
  
  put:    _resort,
  remove: _resort
});

function _resort() {
  var value = base(this, arguments);
  if (!this._frozen) this.sort();
  return value;
};
