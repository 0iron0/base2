
with (base2.code.Colorizer) addScheme("javascript", {
  conditional: /\/\*@if\s*\([^\)]*\)|\/\*@[\s\w]*|@\*\/|\/\/@\w+|@else[\s\w]*/, // conditional comments
  global:      /\b(clearInterval|clearTimeout|constructor|document|escape|hasOwnProperty|Infinity|isNaN|NaN|parseFloat|parseInt|prototype|setInterval|setTimeout|toString|unescape|valueOf|window)\b/,
  keyword:     /\b(&&|\|\||arguments|break|case|continue|default|delete|do|else|false|for|function|if|in|instanceof|new|null|return|switch|this|true|typeof|var|void|while|with|undefined)\b/,
  regexp:      /([\[(\^=,{}:;&|!*?]\s*)(\/(\\\/|[^\/*])(\\.|[^\/\n\\])*\/[mgi]*)/, /* -- */
  special:     /\b(assert\w*|alert|catch|confirm|console|debug|debugger|eval|finally|prompt|throw|try)\b/
}, {
  comment:     DEFAULT,
  string:      DEFAULT,
  regexp:      "$1@2",
  number:      DEFAULT
});
