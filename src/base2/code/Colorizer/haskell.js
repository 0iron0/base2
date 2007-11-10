/*
  Syntax highlighting for Haskell.
  Originally written by Chris Smith <cdsmith@twu.net>.
  Adapted by Dean Edwards (all comments are from Chris).
*/

/*
 * TODO: only highlight 'as', 'qualified', and 'hiding' when they are used in
 * their keyword ways; e.g., don't highlight them when used as variable names.
 * See Haskell Report section 5.3
 *
 * TODO: Don't highlight Prelude names if they are qualified.  It's actually rather
 * debatable whether they ought to be highlighted at all.
 *
 * TODO: Properly handle Unicode characters in all places, such as upper- and
 * lower-case letters, symbols, whitespace, etc.
 *
 * TODO: Properly handle "gaps" in string literals, as described by 2.6
 * of the Haskell Report.
 *
 * TODO: Handle nesting of block comments.
 */

base2.code.Colorizer.addScheme("haskell", {
  comment: /\-\-[^\n]*\n|\{\-([^\-]|\-[^\}])*\-\}/,
  /* Keywords from reservedid production of grammar in section 9.2 of Haskell Report. */
  keyword: /\b(as|case|class|data|default|deriving|do|else|hiding|if|import|in|infix|infixl|infixr|instance|let|module|newtype|of|qualified|then|type|where|_)\b/,
  /* Symbols that have predefined meaning in the Prelude.  Taken from export list of
  Prelude in Chapter 8 of the Haskell Report.  Note that there are submodules
  only for organizational purposes, so the contents of the submodules, but not
  their names, are included in this list. */
  prelude: "\\b(Bool|True|False|Maybe|Nothing|Just|Either|Left|Right|Ordering|LT|GT|EQ|Char|String|Int|Integer|Float|Double|Rational|IO|Eq|Ord|compare|max|min|"
  + "Enum|succ|pred|toEnum|fromEnum|enumFrom|enumFromThen|enumFromTo|enumFromThenTo|Bounded|minBound|maxBound|Num|negate|abs|signum|fromInteger|Real|"
  + "toRational|Integral|quot|rem|div|mod|quotRem|divMod|toInteger|Fractional|recip|fromRational|Floating|pi|exp|log|sqrt|logBase|sin|cos|tan|asin|"
  + "acos|atan|sinh|cosh|tanh|asinh|acosh|atanh|RealFrac|properFraction|truncate|round|ceiling|floor|RealFloat|floatRadix|floatDigits|floatRange|"
  + "decodeFloat|encodeFloat|exponent|significand|scaleFloat|isNaN|isInfinite|isDenormalized|isIEEE|isNegativeZero|atan2|Monad|return|fail|Functor|fmap|"
  + "mapM|mapM_|sequence|sequence_|maybe|either|not|otherwise|subtract|even|odd|gcd|lcm|fromIntegral|realToFrac|fst|snd|curry|uncurry|id|const|flip|"
  + "until|asTypeOf|error|undefined|seq|map|filter|concat|concatMap|head|last|tail|init|null|length|foldl|foldl1|scanl|scanl1|foldr|foldr1|scanr|scanr1|"
  + "iterate|repeat|replicate|cycle|take|drop|splitAt|takeWhile|dropWhile|span|break|lines|words|unlines|unwords|reverse|and|or|any|all|elem|notElem|lookup|"
  + "sum|product|maximum|minimum|zip|zip3|zipWith|zipWith3|unzip|unzip3|ReadS|ShowS|Read|readsPrec|readList|Show|showsPrec|show|showList|reads|shows|"
  + "read|lex|showChar|showString|readParen|showParen|FilePath|IOError|ioError|userError|catch|putChar|putStr|putStrLn|print|getChar|getLine|getContents|"
  + "interact|readFile|writeFile|appendFile|readIO|readLn)\\b",
  /* Type, class, or module names.  These begin with an upper-case letter. */
  type:    /[A-Z][\w\']*/,
  /* Variable or type variable names.  These begin with a lower-case letter. */
  "var":   /[a-z_]\w*/,
  /* Converted from grammar rules integer, float, exponent, decimal, octal, and hexadecimal in chapter 8 of Haskell Report. */
  "int":   /([0-9]+)|(0o[0-7]+)|(0O[0-7]+)|(0x[0-9a-fA-F]+)|(0X[0-9a-fA-F]+)/,
  "float": /[0-9]+(\.([0-9]+)((e|E)[][+-]?([0-9]+))?|((e|E)([+-])?([0-9]+)))/,
  /* Converted from grammar rules char, string, escape, charesc, ascii, and cntrl in Haskell Report chapter 8. */
  string:  /\"([^\\\t\n\v\"]|(\\(a|b|f|n|r|t|v|\\|\"|\'|\&|NUL|SOH|STX|ETX|EOT|ENQ|ACK|BEL|BS|HT|LF|VT|FF|CR|SO|SI|DLE|DC1|DC2|DC3|DC4|NAK|SYN|ETB|CAN|EM|SUB|ESC|FS|GS|RS|US|SP|DEL|\^(\@|\[|\\|\]|\^|_))))*\"/,
  "char":  /\'([^\\\t\n\v\"]|(\\(a|b|f|n|r|t|v|\\|\"|\'|NUL|SOH|STX|ETX|EOT|ENQ|ACK|BEL|BS|HT|LF|VT|FF|CR|SO|SI|DLE|DC1|DC2|DC3|DC4|NAK|SYN|ETB|CAN|EM|SUB|ESC|FS|GS|RS|US|SP|DEL|\^(\@|\[|\\|\]|\^|_))))\'/,
  /* Operators: Built-in language syntax and reserved symbols are handled with SPECIAL. Other operators belong to SYMBOL, regardless of whether they are constructors or* identifiers. */
  special: /\(|\)|\,|\;|\[|\]|\`|\{|\}/,
  symbol:  /(\:|\!|\#|\$|\%|\*|\+|\.|\/|\<|\=|\>|\?|\@|\\|\^|\||\-|\~)+/,
  "reserved-symbol": /([^\:\!\#\$\%\*\+\.\/\<\=\>\?\@\\\^\|\-\~])(\.\.|\:|\:\:|\=|\\|\||\<\-|\-\>|\@|\~|\=\>)([^\:\!\#\$\%\*\+\.\/\<\=\>\?\@\\\^\|\-\~])/
}, {
  "reserved-symbol": "$1@2$3"
}, {
  tabStop: 8,
  urls: false
});
