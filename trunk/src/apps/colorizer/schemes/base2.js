
Colorizer.javascript.add("\\b(" + (base2.exports + ",base,base2,merge,union,implement").match(/[^\s,]+/g).join("|") + ")\\b", '<span class="base2">$0</span>');
Colorizer.javascript.add(/("@[^\"]+"):/, '<span class="special">$1</span>:');
Colorizer.javascript.tabStop = 2;
