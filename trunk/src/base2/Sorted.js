
// NOT USED

var Sorted = Trait.extend({  
  merge: function() {
    this._frozen = true;
    base(this, arguments);
    delete this._frozen;
    this.sort();
    return this;
  },
  
  remove: _sorted,
  store:  _sorted
});

function _sorted() {
  var value = base(this, arguments);
  if (!this._frozen) this.sort();
  return value;
};
