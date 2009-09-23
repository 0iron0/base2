
// text resize

new Rule("html", {
  ondocumentready: function() {
    var dummy = document.createElement("span"), height;
    dummy.style.cssText = "position:absolute;left:0;top:-9999px;";
    dummy.innerHTML = "&nbsp;";
    document.body.appendChild(dummy);
    setTimeout(function checkSize() {
      var resized = height != null && height != dummy.clientHeight;
      height = dummy.clientHeight;
      if (resized) {
        Array2.batch(document.getElementsByTagName("input"), function(element) {
          var behavior = _attachments[element.uniqueID];
          if (behavior) behavior.layout(element);
        }, 100, checkSize);
      } else {
        setTimeout(checkSize, 200);
      }
    }, 200);
  }
});

if (detect("MSIE6")) {
  document.execCommand("BackgroundImageCache", false, true);
}
