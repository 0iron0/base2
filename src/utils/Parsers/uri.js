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
}
//All identifyable parts of an uri we might want to know (items starting with _ have no submatches)
//TODO: think of semantics vs grammar (the ip-address "400.10.0.1" will get matched as reg_name
//      instead of IPv4address, since 400 is not a byte/octet0).
//      Optimize?
var uriParts={};
uriParts.SCHEME=         "([a-zA-Z][-+.a-zA-Z0-9]*):";
uriParts.USERINFO=       csMacro("(?:(OCHAR<:>*)@)?");
uriParts._dec_octet=     "(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])";
uriParts._IPv4address=   csMacro("{_dec_octet}\\.{_dec_octet}\\.{_dec_octet}\\.{_dec_octet}");
uriParts._reg_name=      csMacro("OCHAR<>+")
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