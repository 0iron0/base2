// timestamp: Sat, 21 Jul 2007 12:52:56

new function(_) { ////////////////////  BEGIN: CLOSURE  ////////////////////

// =========================================================================
// Parsers/namespace.js
// =========================================================================
var Parsers = new base2.Namespace(this, {
	name:    "Parsers",
	version: "0.3",
	exports: "GWParser,GWInlineParser,RXURI,URIMATCH,URIMATCH_NAMES"
});

eval(this.imports);
// =========================================================================
// Parsers/../langcontrib.js
// =========================================================================
function $(id) {
  var res=document.getElementById(id);
  if(res==null) console.log("Element with id '%s' is not found",id);
  return res;
}
function htmlEncode(s) {
  return String(s).replace(/(&|<|>|")/g,function($,ch) {
    switch(ch) {
      case "&": return "&amp;";
      case "<": return "&lt;";
      case ">": return "&gt;";
      case '"': return "&quot;";
      default : /*should never happen*/ return ch; 
    }
  });
}
//Don't know how to inherit from Error, so use as:
//  throw newError("Error number %1.",1)
function newError(msg/*, format1, ..., format9*/) {
  return new Error(format.apply(null,arguments));
}
function padRight(str,n,ch) { return (str+new Array(n+1).join(ch||" ")).slice(0,n); }
function padLeft(str,n,ch) { return (new Array(n+1).join(ch||" ")+str).slice(-n); }
function toDutchDate(dt,format,bRelative,bCapital,sFirstWord)
//--#Converteerd een datum-type naar een nederlandse datumstring
//--@format;type=string@date,datetime,datetimeS,time,timeS
//--@bRelative;type=boolean;optional;default=false@Use vandaag,gisteren,morgen
//--@bCapital;type=boolean;optional;default=false@Of het eerste teken een hoofdletter moet zijn.
//--@sFirstWord;type=string;optional@Het woord waar de datum mee begint (ivm bCapital)
{
  var date=fix(dt.getDate())+'-'+fix(dt.getMonth()+1)+'-'+dt.getFullYear();
  var time=dt.getHours()+':'+fix(dt.getMinutes());
  var seconds=':'+fix(dt.getSeconds());
  if(bRelative) {
    var nDaysFromNow=Date_valueInDays(dt) - Date_valueInDays(new Date());
    var objRelative={'-1':'gisteren','0':'vandaag','1':'morgen'};
    if(objRelative[nDaysFromNow]) {
      date=objRelative[nDaysFromNow];
      time='om '+time;
    }
    else {
      if(sFirstWord) {
        date=sFirstWord+' '+date;
      }
      time='om '+time;
    }
    if(bCapital) {
      date=date.substr(0,1).toUpperCase()+date.substr(1);
    }
  }
  else {
    if(time.length==4) time="0"+time;
  }
  switch(format) {
    case 'datetime': return date+' '+time;
    case 'datetimeS': return date+' '+time+seconds;
    case 'date': return date;
    case 'time': return time;
    case 'timeS': return time+seconds;
    default: return dt.toString();
  }
}
function Date_valueInDays(dt)
//--#Results in #days since 1970; handy to compares dates without time
{	
	return parseInt( new Date(dt.getFullYear(), dt.getMonth(), dt.getDate() ).valueOf() / (24*60*60*1000), 10);
}

function fix(n)
{
  if((''+n).length==1) return '0'+n;
  else return ''+n;
}
function parseDate(s) {
  var iso=/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\.(\d{3})\d+Z$/;
  var a=iso.exec(s);
  if(a) return new Date(a[1],a[2],a[3],/*T*/a[4],a[5],a[6],a[7]);
  return new Date(s);
}
/*
if(console===undefined) {
  //IE, non-firebug Firefox
  var console={log:[]}
  console.log=function(s) { 
    if(console.log.length==0&&window.attachEvent) {
      top.defaultStatus+=" [press Ctrl+\\ for logging]";
    }
    console.log.push(s); 
  }
  if(window.attachEvent) { //IE
    window.attachEvent("onload",function() {
      document.body.attachEvent('onkeypress',function() {
        if(event.keyCode==28) { //control-backslash
          if(confirm(console.log.join("\n")+"\n\nEmpy log?"))
            console.log=[];
        }
      });
    });
  }
}
*/
// =========================================================================
// Parsers/uri.js
// =========================================================================
//--| according to: http://gbiv.com/protocols/uri/rfc/rfc3986.html
//
//not implemented:
//  IP-literal    = "[" ( IPv6address / IPvFuture  ) "]"
//  path-empty    = 0<pchar>      #otherwise every word ending on : is becomming a link ;-)
//
//  file-protocol isn't matched. This is because it doesn't fit in this RFC.
//  A file-URI starts with "file://", implying an <authority> follows, but
//  it's actually an <path-absolute>. Although in Google Wiki, a file-uri
//  is recognized as link; I decided not to supported it.
//
// TODO: may optimise a bit more for Webpages (fixed protocol set, no <IPv4adress>
//       because that is matched by <reg_name> also)

//Sets of characters,
var charSets={};
charSets._UNRESERVED= "-_.~a-zA-Z0-9";
charSets._SUBDELIMS=  "!$&'()*+,;=";
charSets._OCHAR=      charSets._UNRESERVED+charSets._SUBDELIMS;
charSets._PCHAR=      charSets._OCHAR+":@";
//character set macro. 
var csMacro=function(s) { 
	return s.replace(/\{([^}]+)\}/g, function($,name) {
		return uriParts[name]; // "{NAME}" -> uriParts.NAME
	}).replace(/([OP])CHAR<([^>]*)>/g,function($,ch,args) {
		// "OCHAR<xyz>" -> charSets._OCHAR + "xyz" + pct-encoded
		return "(?:["+charSets["_"+ch+"CHAR"]+args+"]|%[0-9a-zA-Z]{2,2})";
	});
};
//All identifyable parts of an uri we might want to know (items starting with _ have no submatches)
//TODO: think of semantics vs grammar (the ip-address "400.10.0.1" will get matched as reg_name
//      instead of IPv4address, since 400 is not a byte/octet0).
//      Optimize?
var uriParts={};
uriParts.SCHEME=         "([a-zA-Z][-+.a-zA-Z0-9]*):";
uriParts.USERINFO=       csMacro("(?:(OCHAR<:>*)@)?");
uriParts._dec_octet=     "(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])";
uriParts._IPv4address=   csMacro("{_dec_octet}\\.{_dec_octet}\\.{_dec_octet}\\.{_dec_octet}");
uriParts._reg_name=      csMacro("OCHAR<>+");
uriParts.HOST=           csMacro("({_IPv4address}|{_reg_name})");
uriParts.PORT=           "(?::(\\d{1,5}))?"; //spec says zero digits, browser says at least one
uriParts._PATH_ABEMPTY=  csMacro("(?:/PCHAR<>*)*");
uriParts.PATH1=          csMacro("({_PATH_ABEMPTY})");
uriParts._PATH_ABSOLUTE= csMacro("/(?:PCHAR<>+(?:/PCHAR<>*)*)?");
//uriParts._PATH_NOSCHEME= csMacro("OCHAR<@>+(?:/PCHAR<>*)*");
uriParts._PATH_ROOTLESS= csMacro("PCHAR<>+(?:/PCHAR<>*)*");
//uriParts._PATH_EMPTY=    "";
uriParts.PATH2=          csMacro("({_PATH_ABSOLUTE}|{_PATH_ROOTLESS})"); //|{_PATH_EMPTY}
uriParts.QUERY=          csMacro("(?:\\?(PCHAR</?>+))?");
uriParts.FRAGMENT=       csMacro("(?:#(PCHAR</?>+))?");
//--| Now glueing it all together
uriParts._AUTHORITY=	 csMacro("{USERINFO}{HOST}{PORT}");
uriParts._HIER_PART=     csMacro("(?://{_AUTHORITY}{PATH1}|{PATH2})");
var URIRX=               csMacro("{SCHEME}{_HIER_PART}{QUERY}{FRAGMENT}");
var RXURI=               new RegExp(URIRX);
//indices of submatches
var $i=1;
var URIMATCH={SCHEME:$i++,USERINFO:$i++,HOST:$i++,PORT:$i++,PATH1:$i++,PATH2:$i++,QUERY:$i++,FRAGMENT:$i++};
var URIMATCH_NAMES="Scheme,Userinfo,Host,Port,Path1,Path2,Query,Fragment".split(","); 

/*** Collected ABNF for URI (http://gbiv.com/protocols/uri/rfc/rfc3986.html) **********************

 URI           = scheme ":" hier-part [ "?" query ] [ "#" fragment ]

 hier-part     = "//" authority path-abempty
               / path-absolute
               / path-rootless
               / path-empty

 URI-reference = URI / relative-ref

 absolute-URI  = scheme ":" hier-part [ "?" query ]

 relative-ref  = relative-part [ "?" query ] [ "#" fragment ]

 relative-part = "//" authority path-abempty
               / path-absolute
               / path-noscheme
               / path-empty

 scheme        = ALPHA *( ALPHA / DIGIT / "+" / "-" / "." )

 authority     = [ userinfo "@" ] host [ ":" port ]
 userinfo      = *( unreserved / pct-encoded / sub-delims / ":" )
 host          = IP-literal / IPv4address / reg-name
 port          = *DIGIT

 IP-literal    = "[" ( IPv6address / IPvFuture  ) "]"

 IPvFuture     = "v" 1*HEXDIG "." 1*( unreserved / sub-delims / ":" )

 IPv6address   =                            6( h16 ":" ) ls32
               /                       "::" 5( h16 ":" ) ls32
               / [               h16 ] "::" 4( h16 ":" ) ls32
               / [ *1( h16 ":" ) h16 ] "::" 3( h16 ":" ) ls32
               / [ *2( h16 ":" ) h16 ] "::" 2( h16 ":" ) ls32
               / [ *3( h16 ":" ) h16 ] "::"    h16 ":"   ls32
               / [ *4( h16 ":" ) h16 ] "::"              ls32
               / [ *5( h16 ":" ) h16 ] "::"              h16
               / [ *6( h16 ":" ) h16 ] "::"

 h16           = 1*4HEXDIG
 ls32          = ( h16 ":" h16 ) / IPv4address

 IPv4address   = dec-octet "." dec-octet "." dec-octet "." dec-octet

 dec-octet     = DIGIT                 ; 0-9
               / %x31-39 DIGIT         ; 10-99
               / "1" 2DIGIT            ; 100-199
               / "2" %x30-34 DIGIT     ; 200-249
               / "25" %x30-35          ; 250-255

 reg-name      = *( unreserved / pct-encoded / sub-delims )

 path          = path-abempty    ; begins with "/" or is empty
               / path-absolute   ; begins with "/" but not "//"
               / path-noscheme   ; begins with a non-colon segment
               / path-rootless   ; begins with a segment
               / path-empty      ; zero characters

 path-abempty  = *( "/" segment )
 path-absolute = "/" [ segment-nz *( "/" segment ) ]
 path-noscheme = segment-nz-nc *( "/" segment )
 path-rootless = segment-nz *( "/" segment )
 path-empty    = 0<pchar>

 segment       = *pchar
 segment-nz    = 1*pchar
 segment-nz-nc = 1*( unreserved / pct-encoded / sub-delims / "@" )
               ; non-zero-length segment without any colon ":"

 pchar         = unreserved / pct-encoded / sub-delims / ":" / "@"

 query         = *( pchar / "/" / "?" )

 fragment      = *( pchar / "/" / "?" )

 pct-encoded   = "%" HEXDIG HEXDIG

 unreserved    = ALPHA / DIGIT / "-" / "." / "_" / "~"
 reserved      = gen-delims / sub-delims
 gen-delims    = ":" / "/" / "?" / "#" / "[" / "]" / "@"
 sub-delims    = "!" / "$" / "&" / "'" / "(" / ")"
               / "*" / "+" / "," / ";" / "="
*/

// =========================================================================
// Parsers/GWInlineParser.js
// =========================================================================
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

// =========================================================================
// Parsers/State.js
// =========================================================================
var State=Base.extend({
  constructor: function(name,entryAction,exitAction,context) {
    this.name=name;
    this.entryAction=entryAction;
    this.exitAction=exitAction;
    this.context=context;
    this.isAcceptState=false;
    this.stateExits=new Array2;
  },
  perform: function(action) {
    if(typeof action=="string") return action;
    if(typeof action=="function") return action.call(this.context);
    if(action===undefined||action===null) return "";
    throw newError("Type type %1 is not supported as action.", typeof action);
  },
  performEntryAction: function() { return this.perform(this.entryAction); },
  performExitAction: function() { return this.perform(this.exitAction); },
  addTransition: function(transition) {
    if(!instanceOf(transition, StateTransition)) {
      var replacement=arguments[1]; 
      transition=new StateTransition(
        arguments[0], //pattern
        replacement, //replacement
        arguments[2], //nextState
        this, //current state
        this.context);    
    }
    this.stateExits.push(transition);
  },
  setAcceptState: function() {
    this.isAcceptState=true;
  }
});
// =========================================================================
// Parsers/StateTransition.js
// =========================================================================
var StateTransition=Base.extend({
  constructor: function(pattern, replacement, nextState, currentState, context) {
    this.pattern=instanceOf(pattern,RegExp)?pattern:new RegExp(pattern,"");
    this.replacement=typeof replacement=="function" ? bind(replacement, context) : replacement;
    this.nextState=nextState; //undefined (no transition), null (transition to currentState) or State-object
    this.currentState=currentState;
  },
  getNextStateName: function() {
    return this.doesTranside()?this.nextState.name:this.currentState.name;
  },
  doesTranside: function() {
    return this.nextState!==undefined&&this.nextState!==null;
  },
  performActions: function() { /*this is a question, not a verb*/
    return this.nextState===null ||
           (this.nextState!==undefined&&this.currentState.name!=this.nextState.name);
  }
});
// =========================================================================
// Parsers/FsmParser.js
// =========================================================================
//#requires Base2
//#uses StateTransition, State

// (Deterministic) Finite State Machine Parser
// http://en.wikipedia.org/wiki/Deterministic_finite_automaton
// A regular expression is the condition
// The replacement (function) of the matched input is the transition action
// Only acceptingStates (end states) allow end-of-strings, otherwise
// an exception is thrown.
var FsmParser=Base.extend({
  constructor: function(acceptRightTrim) {
    this.states=new Hash;
    this.acceptRightTrim=acceptRightTrim||false;
  },
  startState: null,
  currentState: null, //the current accepting state
  states: null, //Hash all states (key), containing an array of StateTransition's (value) 
  addState: function(stateName, entryAction, exitAction, context) {
    var state=this.states.store(stateName, new State(stateName,entryAction, exitAction, context));
    if(this.startState===null) this.setStartState(state); //first added state, is automatic start state
    return state;
  },
  setStartState: function(state) { //call after adding transitions
    if(arguments.length==1) this.startState=state;
    this.transideTo(this.startState);
    if(this.currentState===undefined) throw newError("State %1 does not exist",state.name);
  },
  addAcceptState: function(state1/*, ..., stateN*/) {
    forEach(arguments, function(stateName) {
      var state=this.states.fetch(stateName);
      if(state===undefined) throw newError("State %1 does not exist",stateName);
      state.setAcceptState();
    }, this);
  },
  setAllAsAcceptState: function() {
    this.states.forEach(function(state){state.setAcceptState();});
  },
	addTransitions: function(pattern, replacement, transitions) {
	  forEach(transitions, function(transition) {
	    transition[0].addTransition(pattern, replacement, transition[1]);
	  });
	},
  getState: function(stateName) {
    if(this.states.exists(stateName)) {
      return this.states.fetch(stateName);
    }
    throw newError("State %1 does not exist",stateName);
  },
  transideTo: function(state/*Name*/) {
    this.currentState=typeof state=="string"?this.getState(state):state;  
  },
  parse: function(text) {
    var result=[]; //string builder
    this.setStartState();
    result.push(this.currentState.performEntryAction());
    parsing:while(true) {
      if(text.length==0) {
        if(this.currentState.isAcceptState) {
          result.push(this.currentState.performExitAction());
          break parsing;
        }
        else throw newError("End of string encountered in state %1",this.currentState.name);
      }
      //find a matching pattern
      var weHaveTransition=this.currentState.stateExits.some(function(transition,i,list) {
        var match=transition.pattern.exec(text);
        if(match&&match.index==0) {
          if(transition.performActions()) {
            result.push(this.currentState.performExitAction());
            if(transition.doesTranside()) this.transideTo(transition.nextState.name);
            result.push(this.currentState.performEntryAction());
          }
          result.push(match[0].replace(transition.pattern,transition.replacement));
          text=text.slice(match[0].length);
          return true;
        }
      }, this);
      if(!weHaveTransition) {
        if(/^\s+$/.test(text)) text="";
        else throw newError("In state %1, but no pattern matches. Remaining text: '%2'",
          this.currentState.name, text.replace(/ /g,'.').replace(/\r|\n/,'^'));
      }
    }
    return result.join("");
  },
  toDotString: function(name) {
    var graph=["/* Visit http://www.graphviz.org/ to create a chart of this text */",format("digraph %1 {",name)];
    var drawn=new Hash;
    //Visualize start state
    graph.push(format('\t%1[style=filled,color="#B7D5F6"];',this.startState.name));
    this.states.forEach(function(state, stateName) {
      state.stateExits.forEach(function(transition) {
        //visualize accepting state
        var nextStateName=transition.getNextStateName();
        if(this.states.fetch(nextStateName).isAcceptState&&!drawn.exists(nextStateName)) {
          graph.push(format("\t%1[style=bold]",nextStateName));
          drawn.store(nextStateName);
        }
        //add transition
        graph.push(format("\t%1 -> %2;", stateName, nextStateName));
      }, this);
    }, this);
    graph.push("}");
    return graph.join("\n");
  }
  
});

// =========================================================================
// Parsers/GWParser.js
// =========================================================================
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
		this.addTransitions(G.RX_INCODE,     this.htmlEncode,[[code],[code2],[code3]]);
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
	htmlEncode: function($,match) {
	  return htmlEncode(match);
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
	  return this.inlineParser.exec(htmlEncode(text||this.inlineBuffer.join("\n")));
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
			res+=format("<%1>\n", this.listTypes.item(-1));
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
eval(this.exports);

}; ////////////////////  END: CLOSURE  /////////////////////////////////////