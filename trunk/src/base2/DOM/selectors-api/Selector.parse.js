
// Selector.parse() - converts CSS selectors to DOM queries.

// Respect due to:
//
//   Alex Russell and Jack Slocum for inspiration
//   John Resig and Sizzle for stolen code
//   Diego Perini and NWMatcher for test suites and more stolen code
//

Selector.parse = function(selectorText, type) {
  if (!type) type = "exec";
  var cache = _cache[type];
  
  if (!cache[selectorText]) {
    var fn = "",
        isMatch = type == "test",
        isSelect = !isMatch,
        args = ["e0,c"],
        states = [],
        vars = (isSelect ? "_query.complete=false;" : "") + "_indexed++;" +
          "var r=[],l,d=e0.nodeType==9?e0:e0.ownerDocument||Traversal.getDocument(e0),t=d.getElementById?'toUpperCase':'toString',u,v={},k=0,p0;",
        tags = [],
        caches = [],
        selectors = _parser.format(selectorText).split(","),
        isCommaSeparated = selectors.length > 1,
        group = 0;
        
    var parseSelector = function(selector, type) {
      var block = "",
          combinators = _combinators[type],
          combinator,
          isMatch = type == "test",
          isSelect = !isMatch,
          uniqueIDAssigned,
          cache = 0;
      if (isMatch) selector = selector.replace(_CSS_CONTEXT, "");
      var tokens = match(selector, _TOKENIZER), token;
      
      if (isMatch) tokens.reverse(); // process backwards when matching
      
      for (var j = 0; token = tokens[j]; j++) {
        var parsed = "";
        uniqueIDAssigned = false;
        if (_COMBINATOR.test(token)) {
          combinator = token;
          parsed += combinators[combinator];
          if (combinator == " " || combinator == ">") {
            if (!isMatch && combinator == " " && tokens[j + 1].indexOf("*") == 0) { // read ahead to fix an IE5 bug
              parsed = parsed.replace(/\bT\b/, "'*'");
            }
            group++;
            cache++;
            if (isSelect) {
              states.push(group);
            }
          }
        } else {
          var parts = match(token, _PARSE_SIMPLE_SELECTOR),
              tagName = parts[1] || "*",
              simpleSelector = parts[2] || "",
              isWildCard = tagName == "*";
          if (!isWildCard) {
            tags.push(tagName);
          }
          if (isMatch) {
            if (!isWildCard) {
              parsed += "if(e.nodeName==t){";
            }
          } else {
            if (isWildCard) {
              if (!_SUPPORTS_TRAVERSAL_API && combinator == "~") {
                parsed += "if(" + _IS_ELEMENT + "){";
              }
              /*@if (@_jscript)
                if (combinator == " " || combinator == ">") {
                  parsed += "if(e.nodeName!='" + (@_jscript_version < 5.6 ? "!" : "#comment") + "'){";
                }
              @else @*/
                if (!_SUPPORTS_CHILDREN && combinator == ">") {
                  parsed += "if(e.nodeType==1){";
                }
              /*@end @*/
            } else if (combinator != " ") {
              parsed += "if(e.nodeName==t){";
            }
            if ((cache > 1 && combinator == " ") || combinator == "~") {
              parsed += _BREAK_ON_DUPLICATES;
              caches.push(group);
              uniqueIDAssigned = true;
            }
          }
          parsed += _parser.exec(simpleSelector);
        }

        block += parsed.replace(_VARIABLES, function(match, chr, string) {
          if (string) return string;
          return chr == "T" ? "t" + tags.length : chr == "t" ? chr + (tags.length - 1) : chr == "E" ? "e" + (group - 1) : chr + group;
        });
      }
      if (isCommaSeparated) {
        var testDuplicates = "";
        if (!uniqueIDAssigned) {
          testDuplicates = _ASSIGN_ID;
        }
        if (!_IS_INDEXED) {
          if (i == 0) {
            testDuplicates += "v[u]=1;";
          } else {
            testDuplicates += "if(!v[u]){v[u]=1;";
          }
        }
        block += format(testDuplicates, group);
      }
      return block;
    };
    
    // Process the end of a selector.
    var closeBlock = function(block) {
      if (isMatch) {
        block += "return true;"
      } else {
        var store = "if(c==1)return e%1;";
        if (isCommaSeparated && _IS_INDEXED) {
          // Store elements in the array using sourceIndex, this avoids having to sort later.
          store += "r[u]=e%1;k++;";
        } else {
          store += "r[k++]=e%1;";
        }
        store += "if(k===c){_query.state=[%state%];return r;";
        block += format(store, group);
      }
      block += Array(match(block, /\)\{/g).length + 1).join("}");
      if (isCommaSeparated && isSelect && !_IS_INDEXED) {
        // Only mark the results as unsorted if this block has added to the results.
        block += "if(l&&r.length>l)r.unsorted=1;l=r.length;";
      }
      return block;
    };
    
    _reg = []; // store for RegExp objects
    
    // Loop through comma-separated selectors.
    for (var i = 0; i < selectors.length; i++) {
      var selector = selectors[i];
      if (i > 0) fn +=  "e" + group + "=e0;";
      var indexOfID = selector.lastIndexOf("#");
      if (isMatch || indexOfID == -1) {
        fn += closeBlock(parseSelector(selector, type));
      } else {
        // Query with an ID selector
        var matchBy = selector.slice(0, indexOfID),
            parts = match(selector.slice(indexOfID), _PARSE_ID_SELECTOR),
            id = parts[1] || "",
            selectBy = parts[2] || "";
        // Use a standard query for XML documents, disconnected elements and platforms
        // with broken getElementById().
        var block = parseSelector(selector, type);
        fn += "if(!_byId||!d.getElementById||(e0!=d&&Node.compareDocumentPosition(e0,d)&1)){" + closeBlock(block) + "}";
        // Now build an optimised query to get the element by ID.
        fn += format("else{var e%1=_byId(d,'%2');if(e%1&&(e0==d||Traversal.contains(e0,e%1))){", ++group, id);
        // Build an inner query to validate the left hand side of the ID selector
        var query = "";
        if (matchBy.replace(_CSS_CONTEXT, "")) {
          var currentGroup = group; // preserve group index while we build an inner query
          query = "var q" + group + "=function(e0){";
          group = 0;
          query += parseSelector(matchBy, "test") + "return true";
          query += Array(match(query, /\)\{/g).length + 1).join("}") + ";";
          group = currentGroup;
        }
        block = query ? "if(q" + group + "(e" + group + ")){" : "";
        // Build the remainder of the query (after the ID part).
        block += parseSelector(selectBy, "exec");
        fn += query + closeBlock(block) + "}}";
      }
    }
    /*@if (@_jscript_version < 5.6)
      fn = fn.replace(/getElementsByTagName\('\*'\)/g, "all");
    /*@end @*/
    vars += "var reg=[" + _reg.join(",") + "];";
    vars += Array2.map(tags, function(tagName, i) {
      return "var t" + i + "='" + tagName + "'" + (tagName == tagName.toUpperCase() ? ";" : "[t]();");
    }).join("");
    vars += Array2.map(caches, function(group) {
      return "var s" + group + "={};";
    }).join("");
    forEach (states, function(group, i) {
      states[i] = "i" + group;
      args.push("a" + group);
    });
    fn = _parser.unescape(vars + fn);
    fn += isMatch ? ";return false" : "_query.state=[%state%];_query.complete=true;return c==1?null:r";
    fn = fn.replace(/%state%/g, states.join(","));
    eval("var _query=function(" + args.join(",") + "){" + fn + "}");
    cache[selectorText] = _query;
  }
  return cache[selectorText];
};
