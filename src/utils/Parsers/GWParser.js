var GWParser=FsmParser.extend({
	constructor: function() {
		this.base(true);
		var G=GWParser;
		var start=    this.addState("start",     undefined,      undefined,           this);
		var paragraph=this.addState("paragraph", this.pInitBuff, this.pParaFlush,     this);
		var quote=    this.addState("quote",     this.pInitBuff, this.pQuoteFlush,    this);
		var code=     this.addState("code",      "",             "",                  this);
		var code2=    this.addState("code2",     "",             "",                  this);
		var code3=    this.addState("code3",     "",             "",                  this);
		var list=     this.addState("list",      this.pInitList, this.pCloseAllLists, this);
		var table=    this.addState("table",     "<table>\n",    "</table>\n",        this);
		//TODO: var quoted_table
		
		this.addTransitions(G.RX_HEADING,    this.pHeading,  [[start],[list,start],[quote],[paragraph,start]]);
		this.addTransitions(G.RX_CODE_START, "<pre>",        [[start,code],[list,code],[quote,code],[paragraph,code]]);
		this.addTransitions(G.RX_CODE_START, "$1",           [[code,code2],[code2,code3]]);
		this.addTransitions(G.RX_LIST,       this.pList,     [[list],[start,list],[quote,list],[paragraph,list]]);
		this.addTransitions(G.RX_QUOTE,      this.pCollect,  [[quote],[start,quote],[list,quote],[paragraph,quote]]);
		this.addTransitions(G.RX_TABLE_ROW,  this.pTableRow, [[table],[start,table],[paragraph,table],[quote,table],[list,table]]);
		this.addTransitions(G.RX_PARAGRAPH,  this.pCollect,  [[paragraph],[start,paragraph],[list,paragraph],[quote,paragraph]]);
		this.addTransitions(G.RX_EMPTY_LINE, "",             [[start],[list,start],[quote,start],[paragraph,start],[table,start]]);
		this.addTransitions(G.RX_CODE_END,   "</pre>\n",     [[code,start]]);
		this.addTransitions(G.RX_CODE_END,   "$1",           [[code2,code],[code3,code2]]);
		this.addTransitions(G.RX_INCODE,     "$1",           [[code],[code2],[code3]]);
    //for graceful closing of incorrect/unclosed markup.
		this.setAllAsAcceptState();
		//
		this.inlineParser=new GWInlineParser();
	},
	overrideWikiWordHandling: function(wikiLinkResolve,wikiLinkExists) {
	  if(wikiLinkResolve) this.inlineParser.wikiLinkResolve=wikiLinkResolve;
	  if(wikiLinkExists) this.inlineParser.wikiLinkExists=wikiLinkExists;
	},
	parse: function(s) {
		//remove meta-data, normalize linebreaks and add a newline
		return this.base(s.replace(/^(#.*\n+)*/,'').replace(/\r\n|\r|\n/g,"\n")+"\n");
	},
	//state for lists
	listLevel: [], //an array of nesting levels, each entry stating the length of the indentation
	listTypes: [],
	inlineBuffer: [],
	inlineParser: null,
	//process (replacement) methods
	pProcessInline: function(text) {
	  //return text;
	  //TODO: speedup: without the inline parser, the google syntax page takes
	  //      300ms, and with it 1150ms (including rendering) on my (now stolen)
	  //      iBook G4 1200MHz 1GB.
	  return this.inlineParser.exec(text||this.inlineBuffer.join("\n"));
	},
	pCollect: function($,text) {
	  this.inlineBuffer.push(text);
	  return "";
	},
	pInitBuff: function() {
	  this.inlineBuffer=[];
	  return "";
	},
	pParaFlush: function() {
	  return "<p>"+this.pProcessInline()+"</p>\n";
	},
	pQuoteFlush: function() {
	  return "<blockquote>"+this.pProcessInline()+"</blockquote>\n";
	},
	pTableRow: function($,cols) {
	  var res="<tr>";
	  var colspan=1;
	  forEach(cols.split("||"), function(td) {
	    if(td=="") colspan++;
	    else {
	      res+=format('<td%1>%2</td>', colspan>1?' colspan="'+colspan+'"':'', this.pProcessInline(td));
	      colspan=1;
      }
	  }, this);
	  return res+"</tr>\n";
	},
	pHeading: function($,level,text) {
		return format("<h%1>%2</h%1>\n", Math.min(level.length,6), text);
	},
	pInitList: function() {
		this.listLevel=new Array2;
		this.listTypes=new Array2;
	},
	pList: function($,indent,bullet,text) {
		var res="";
		//determine if a new list must be started
		if(this.listLevel.length==0||indent.length>this.listLevel.item(-1)) {
			this.listTypes.push(bullet=="*"?"ul":"ol");
			this.listLevel.push(indent.length);
			res+=format("<%1>\n", this.listTypes.item(-1))
		}
		else if(indent.length<this.listLevel.item(-1)) { //collapse
			res+=this.pCloseLists(indent, 1);
		}
		res+=format("<%1>%2</%1>\n","li",this.pProcessInline(text));
		return res;
	},
	pCloseAllLists: function() {
		return this.pCloseLists("", 0);
	},
	pCloseLists: function(indent, maxCollapseLevel) {
		var res="";
		do {
			res+=format("</%1>\n",this.listTypes.pop());
			this.listLevel.pop();
		} 
		while(this.listLevel.length>maxCollapseLevel&&this.listLevel.item(-1)>indent.length);
		return res;
	},
	copy: function($,text) {
		return text;
	}
},{
	//Regular expressions
	RX_HEADING:    /^(=+)([^=]+)=+\n/,
	RX_CODE_START: /^(\{\{\{\n)/,
  RX_CODE_END:   /^(\}\}\}\n)/,
	RX_LIST:       /^([ \t]+)([*#])\s*(.+)\n/,
	RX_QUOTE:      /^[ \t]+([^ \t].+)\n/,
	RX_PARAGRAPH:  /^(.+)\n/,
	RX_INCODE:     /^(.*\n+)/,
	RX_EMPTY_LINE: /^\n+/,
	RX_TABLE_ROW:  /^\|\|(.*)\|\|(?:\n|$)/
});