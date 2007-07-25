// http://www.w3.org/html/wg/html5/#scrollintoview
// initial code: http://www.xs4all.nl/~zanstra/logs/jsLog.htm
// not fixing IE's horizontal scrolling issues at the moment.
// bug: doesn't work on overflow+fixed-height elements; change to something like:
//      while(element && element.offsetHeight > element.parentNode.offsetTop) {
//        element.offsetTop = element.parentNode.offsetTop;
//        element = element.offsetParent;
//      }

HTMLElement.implement({
  "@!(element.scrollIntoView)": {
    scrollIntoView: function(element, top) {
      var posY = getTop(element);
      if (!top) posY += element.offsetHeight - getWindowHeight();
      window.scrollTo(0, posY);
    },
    _isInView: function(element) {
      var top = getTop(element), scrollTop = getScrollTop();
      return !(top < scrollTop || top > scrollTop + getWindowHeight() - element.offsetHeight);
    }  
  }
});

function wdeb(w, deb, defaultValue) {
  return window[w] ||
    document.documentElement && document.documentElement[deb] ||
    document.body[deb] ||
    defaultValue;
}

// http://www.quirksmode.org/viewport/compatibility.html
function getWindowHeight() {
  return wdeb("innerHeight", "clientHeight", 0);
}

function getScrollTop() {
  return wdeb("pageYOffset", "scrollTop", 0);
}

// http://www.quirksmode.org/js/findpos.html
function getTop(element) {
  var pos = 0;
  do pos += element.offsetTop;
  while (element = element.offsetParent);
  return pos;
}