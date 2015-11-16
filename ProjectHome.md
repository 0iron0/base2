Because this library is standards-based it means that you don’t have to learn a new API. It uses standard (DOM, ECMAScript) properties and methods throughout which also means that there is no need for a lot of accompanying documentation.

# base2 #

base2 is a lightweight library that irons out all the annoying differences in JavaScript implementations. It provides the additional functionality from JavaScript 1.6+ that only Mozilla browsers implement. It also adds some features from ES4. The library is only 6KB (gzipped).

# base2.DOM #

  * A fast implementation of the Selectors API
  * Fixes broken browser implementations of the DOM events module including `document.createEvent()`, `dispatchEvent()`, `addEventListener()`, etc
  * Supports DOMContentLoaded
  * Fixes `getAttribute()`/`setAttribute()`/`hasAttribute()` (Internet Explorer)
  * ~~Implements `getElementsByClassName()`~~
  * Implements a few other useful DOM methods like `getComputedStyle()` and `compareDocumentPosition()`
  * Supports a variety of browsers including ancient browsers like IE5.0 (Windows and Mac)

# Documentation #

http://base2.googlecode.com/svn/version/1.0.2/doc/base2.html

# Download #

http://base2.googlecode.com/svn/version/

You may link directly to the files above.

## Development build ##

http://base2.googlecode.com/svn/trunk/lib/

Documentation: http://base2.googlecode.com/svn/doc/base2.html

This is the most recent build of base2.
You may experience bugs with the development build so beware.

# Status #

Current version: 1.0.2