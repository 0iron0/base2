
var Tree = TreeNode.extend({
  constructor: function() {
    this.base("_RegExp2_"); //sentinel
    this.type = "regex";
    this.stack = new Array2;
    this.stack.push(this);
  },
  
  top: function(n) {
    return this.stack.item(typeof n=="number" ? -n : -1);
  },
  
  topToken: function(n) {
    return this.top(n).ch;
  },
  
  lastChild: function(n) {
    return this.top().children.item(-1);
  },
  
  append: function(item) {
    this.top().add(item);
  },
  
  addNewTopNode: function(node) {
    this.append(node);
    this.stack.push(node);
  },
  
  closeTopNode: function(n) {
    if (arguments.length == 0) n = 1;
    while(n--) this.stack.pop();
  },
  
  stuffLastItem: function(node) {
    var lastItem = this.top().children.pop();
    this.addNewTopNode(node);
    this.append(lastItem);
  },
  
  stuffTopNode: function(node) {
    var top = this.top();
    //move top-children to node children
    node.children = top.children;
    top.children = new Array2;
    this.addNewTopNode(node);
  },
  
  toString: function() {
    var a = [];
    forEach (this.children, function(item) {
      a.push( item.toString(0) );
    });
    return a.join(indent.NEW_LINE);
  }/*,
  
  toHTML: function() {
    var a = [];
    forEach (this.children, function(item, i) {
      a.push(item.toHTML(i));
    });
    return a.join("");
  }*/
});
/*
TODO: 
\b, \B => token
\1, \2 => token
*/
