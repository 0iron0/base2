function ahref(url,innerHtml,cls) { 
  return format('<a href="%1" class="%2">%3</a>',url,cls,innerHtml); 
}
function image(url) { 
  return format('<img src="%1">',url); 
}
function isImagePath(a,offset) {
  if(arguments.length==1) offset=0;
  return /(gif|jpe?g|png)$/i.test(a[URIMATCH.PATH1+offset]||a[URIMATCH.PATH2+offset]);  
}

var GWInlineParser=RegGrp.extend({
  constructor: function() {
    this.base();
    this.context=this;
    //--| code/unformatted
    this.add("`([^`]+)`", this.handleCode );
    this.add(/\{\{\{(.+)\}\}\}/, this.handleCode );
    //--| wiki links
    this.add("\\[\\[","["); //escape [[ to [
    this.add("\\]\\]","]"); //escape ]] to ]
    this.add("\\[([^\\]]+)\\]", this.blockSyntax); //[Word] syntax
    this.add("!([A-Z][a-z]+(?:[A-Z][a-z]+)+)\\b", "$1"); //escape !WikiWord to WikiWord
    this.add("([A-Z][a-z]+(?:[A-Z][a-z]+)+)\\b", this.wikiLink ); //WikiWord
    //--| URL's (can't end with \b, because of forward slashes)
    this.add("\\b("+URIRX+")(\\s|$)", this.urlLink); // http://server/path
    //--| formatting
    this.add(/(\*)/,this.handleToken );
    this.add(/(_)/, this.handleToken );
    this.add(/(\^)/,this.handleToken );
    this.add(/(,,)/,this.handleToken );
    this.add(/(~~)/,this.handleToken );
  },
  tokenStack: null, //new Array2
  exec: function(text) {
    this.tokenStack=new Array2;
    var result=this.base.apply(this,arguments);
    var closed=this.closeTokens();
    return result+closed;
  },
  handleCode: function($,code) {
    return "<code>"+htmlEncode(code)+"</code>";
  },
  handleToken: function(token) {
    switch(token) {
      case '*': token="strong"; break;
      case '_': token="em"; break;
      case '^': token="sup"; break;
      case ',,': token="sub"; break;
      case '~~': token="strike"; break;
      default: /*should never hapen*/ token="span"; break;
    }
    var pos=this.tokenStack.indexOf(token), result="";
    if(pos==-1) {
      this.tokenStack.push(token);
      result="<"+token+">";
    }
    else {
      result=this.closeTokens(pos);
    }
    return result;
  },
  closeTokens: function(n) {
    var result="";
    if(n===undefined) n=0;
    while(this.tokenStack.length>n) {
      result+="</"+this.tokenStack.pop()+">";
    }
    return result;
  },
  wikiLinkResolve: function(word) { 
    return "#"+word; 
  },  
  wikiLinkExists: function(word) {
    return true;
  },
  wikiLink: function(word,title) {
    var link=this.wikiLinkResolve(word);
    var text=title||word;
    if(this.wikiLinkExists(word)) {
  	  return ahref(link, text, GWInlineParser.CLS_WIKI);
  	}
  	else {
  	  return text+ahref(link, "?", GWInlineParser.CLS_WIKI);
	  }
  },
  //matches an URL and converts to an ahref or an image
  urlLink: function($,url) {
  	if(isImagePath(arguments,1)) return image(url)+" ";
  	return ahref(url,url,GWInlineParser.CLS_EXTERN)+" ";
  },
  //[inner]
  blockSyntax: function($,inner) {
  	var i=inner.indexOf(" "), left, right;
  	if(i==-1) left=right=inner;
  	else {
  		left=inner.slice(0,i);
  		right=inner.slice(i+1);
  	}
  	//[left right]
  	var a=RXURI.exec(left);
  	if(a) { //link or image
  		if(isImagePath(a)) { //left is image
  			if(left==right) return image(left);
  			return ahref(left, right, GWInlineParser.CLS_EXTERN);
  		}
  		else { //left is link
  			a=RXURI.exec(right);
  			if(a&&isImagePath(a)) return ahref(left, image(right), GWInlineParser.CLS_EXTERN);
  			return ahref(left, right, GWInlineParser.CLS_EXTERN);
  		}
  	}
  	else { //wiki word
  		return this.wikiLink(left, right);
  	}
  }
}, { //static classnames for links (a[href])
  CLS_WIKI:"wiki",
  CLS_EXTERN:"extern"
});
