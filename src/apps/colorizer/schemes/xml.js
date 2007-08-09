
Colorizer.xml = new Colorizer({
  attribute: /(\w+)=("[^"]*"|'[^']*')/,
  cdata:     /<!\[CDATA\[([^\]]|\][^\]]|\]\][^>])*\]\]>/,
  comment:   /<!\s*(--([^-]|[\r\n]|-[^-])*--\s*)>/,
  entity:    /&#?\w+;/,
  "processing-instruction": /<\?[\w-]+[^>]+>/,
  tag:       /(<\/?)([\w:-]+)/,
  text:      /[>;][^<>&]*/
}, {
  cdata:     IGNORE,
  tag:       "$1@2",
  attribute: '@1=<span class="attribute value">$2</span>',
  text:      IGNORE
}, {
  tabStop:   1
});
