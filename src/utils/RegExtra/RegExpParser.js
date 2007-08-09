
var NotImplementedYet = new Error("Not implemented yet");
//TODO: rework to ErrorNode
var parseError = function(position, string) {
  if (instanceOf(string, Array)) string = format.apply(null, string);
  var error = new SyntaxError(string);
  error.position = position;
  error.type = "ParseError";
  return error;
};
//TODO: better mimic parse errors or RegExp
//TODO: include string-index of parse error
//TODO: getSource(count)
//TODO: constructor: function(extended)
//        http://www.regular-expressions.info/named.html
//        http://www.regular-expressions.info/freespacing.html
//        http://www.regular-expressions.info/comments.html
var RegExpParser=RegGrp.extend({
  constructor: function() {
    this.base();
    this.context=this;
    // http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Objects:RegExp#Special_characters_in_regular_expressions
    this.add("\\[\\^?", this.handleOpenSet);
    this.add("\\((?:\\?[:=!])?", this.handleOpenGroup);
    this.add("\\)", this.handleCloseGroup);
    this.add("\\]", this.handleCloseSet);
    this.add("\\|", this.handleChoice );
    this.add("[?*+]\\??", this.handleQuantifier);
    this.add("\\{[0-9]+(?:,[0-9]*)?\\}\\??", this.handleQuantifier);
    this.add("[$^]|\\\\[bB]", this.handleBoundaries);
    this.add("(.)-([^\\]])", this.handleSetRange);
    this.add("\\\\c[A-Z]", this.handleCh);
    this.add("\\\\x[0-9a-fA-F]{2}", this.handleCh);
    this.add("\\\\u[0-9a-fA-F]{4}", this.handleCh);
    this.add("\\\\[1-9][0-9]*", this.handleBackReference);
    this.add("\\\\[dDfnrsStvwW]", this.handleCh);
    this.add("\\\\0(?![0-9])", this.handleCh);
    this.add("\\\\.", this.handleCh); //dz: added
    this.add(".", this.handleCh);
  },
  tree: null,
  dbg: false,
  nrMatchingGroups: 0,

  exec: function(text) {
    this.tree = new Tree;
    this.nrMatchingGroups = 0;
    this.base(text);
    //TODO: check on unclosed nodes
    var tree = this.tree;
    var top = tree.top();
    var topToken = tree.topToken();
    if (/[_|]/.test(topToken)) return this.tree;
    if (/[[(]/.test(topToken)) {
      throw parseError(top.data, "The %1 at position %2 is not closed", top.token, top.data);
    }
    throw parseError(-1, "Token %1 is not closed", topToken);
  },
  
  // tokens: [, [^
  handleOpenSet: function(token, offset, s) {
    if (this.dbg) console.info("handleOpenSet: "+token);
    this.tree.addNewTopNode(new SetNode(token, offset));
  },
  
  // tokens: (, (?:, (?=, (?!
  handleOpenGroup: function(token, offset, s) {
    if (this.dbg) console.info("handleOpenGroup: "+token);
    this.tree.addNewTopNode(new GroupNode(token, offset));
    if(token == "(") this.nrMatchingGroups++;
  },
  
  // token: )
  handleCloseGroup: function(token, offset, s) {
    if (this.dbg) console.info("handleCloseGroup: "+token);
    var tree = this.tree;
    var topToken = tree.topToken();
    if (topToken == "[") this.handleCh(token);
    else if (topToken == "(") tree.closeTopNode();
    else {
      if (topToken != "_" && tree.topToken(2)) tree.closeTopNode(2);
      else throw parseError(offset, "unmatched ) in regular expression at position %1", offset);
    }
  },

  // tokens: \1, \2, .., \10, \11.. 
  handleBackReference: function(token, offset, s) {
    if (this.dbg) console.info("handleBackReference: "+token);
    if (slice(token,1) > this.nrMatchingGroups)
      throw parseError(offset, "Reference to non-existent subpattern/group at position %1", offset);
    this.tree.append(new GroupNode(token, offset));
  },
  
  // token: ]
  handleCloseSet: function(token, offset, s) {
    if (this.dbg) console.info("handleCloseSet: "+token);
    var tree = this.tree;
    if (tree.topToken() == "[") {
      tree.closeTopNode();
    }
    else this.handleCh(token);
  },
  
  // token: |
  handleChoice: function(token, offset, s) {
    if (this.dbg) console.info("handleChoice: "+token);
    var tree = this.tree;
    var topToken = tree.topToken();
    if (topToken == "[") this.handleCh(token);
    else {
      if (topToken != "|") tree.stuffTopNode(new ChoiceNode(token, offset)); //first item
      tree.closeTopNode();
      tree.addNewTopNode(new ChoiceNode(token, offset));
    }
  },
  
  // tokens: ?, ??, *, *?, +, +?, 
  //         {n}, {n}?, {n,}, {n,}?, {n,m}, {n,m}?
  handleQuantifier: function(token, offset, s) {
    if (this.dbg) console.info("handleQuantifier: "+token);
    var tree = this.tree;
    if (tree.topToken() == "[") this.handleCh(token);
    else {
      var lastChild = tree.lastChild();
      if (lastChild === undefined || 
          instanceOf(lastChild, TreeNode) && /[+*?{]/.test(lastChild.ch)) {
        //TODO: \b[+-]?(\d*\.?\d+|\d+\.?\d*)([eE][+-]?\d+)?\b
        throw parseError(offset, "invalid quantifier %1 at position %2", token, offset);
      } else {
        tree.stuffLastItem(new QuantifierNode(token, offset));
        tree.closeTopNode();
      }
    }
  },
  
  // token: .-.
  handleSetRange: function(token, chLeft, chRight, offset, s) {
    if (this.dbg) console.info("handleSetRange: "+token);
    var tree = this.tree;
    if (tree.topToken() == "[") {
      var node = new RangeNode("-", offset);
      node.add(chLeft);
      node.add(chRight);
      tree.append(node);      
    }
    else {
      this.handleCh(chLeft);
      this.handleCh("-");
      this.handleCh(chRight);
    }
  },
  
  // tokens: ^, $, \b, \B
  handleBoundaries: function(token, offset, s) {
    if (this.dbg) console.info("handleBoundaries: "+token);
    var tree = this.tree;
    if (tree.topToken() == "[") this.handleCh(token);
    else this.tree.append(new BoundaryNode(token, offset));
  },
  
  handleCh: function(ch, offset, s) {
    if (this.dbg) console.info("handleCh: "+ch);
    this.tree.append(ch);
  }
});
