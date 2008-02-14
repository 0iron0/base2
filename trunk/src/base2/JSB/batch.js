
var batch = [];
;;; var total=0;
;;; var ss = new Date;
batch.forEach = function(elements, bind, i) {
  if (arguments.length < 3) {
    var args = Array2.slice(arguments);
    args[2] = 0;
    this.push(args);
    if (this.timer) return;
  }
  if (!i) i = 0;
  var length = elements.length;
  var start = new Date;
  var now = start;
  ;;; var j = i;
  while (i < length && (now - start) < 200) {
    bind(elements[i++]);
    if (i < 5 || i % 50 == 0) now = new Date;
  }
  ;;; total +=(i-j);
  ;;; console2.log("processed: "+(i-j)+" of " + length + " in "+(now-start)+"ms (total=" + total+")");
  if (i == length) {
    i = 0;
    this.shift();
    if (!this.length) {
      if (this.timer) {
        clearInterval(this.timer);
        delete this.timer;
      }
      _fireReady();
      return;
    }
  }
  this[0][2] = i;
  if (i < elements.length && !this.timer) {
    this.timer = setInterval(function() {
      var args = batch[0];
      batch.forEach(args[0], args[1], args[2]);
    }, 100);
  }
  document.body.scrollTop = 1;
};
