
with (base2.code.Colorizer.javascript) {
  add("\\b(" + (base2.exports + ",base,base2,merge,union,implement").match(/[^\s,]+/g).join("|") + ")\\b", '<span class="base2">$0</span>');
  insertAt(0, /("@[^"]+"):/, '<span class="special">$1</span>:');
  tabStop = 2;
}
