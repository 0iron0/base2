
Colorizer.xml = new Colorizer({
	comment:       DEFAULT,
	cdata:         IGNORE,
	pi:            DEFAULT,
	tag:           "$1@2",
	attribute:     '@1=<span class="attribute value">$2</span>',
	entity:        DEFAULT,
	text:          IGNORE
}, {
	attribute:     /(\w+)=("[^"]*"|'[^']*')/,
	cdata:         /<!\[CDATA\[([^\]]|\][^\]]|\]\][^>])*\]\]>/,
	comment:       /<!\s*(--([^-]|[\r\n]|-[^-])*--\s*)>/,
	entity:        /&#?\w+;/,
	pi:            /<\?[\w-]+[^>]+>/, // processing instruction
	tag:           /(<\/?)([\w:-]+)/,
	text:          /[>;][^<>&]*/
}, {
	tabStop:       1
});
