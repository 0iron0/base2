var indent = function(n, s) {
  return new Array(n+1).join(indent.TAB) + s;
};
indent.TAB = "  ";
indent.NEW_LINE = "\n";

var TreeNode = Base.extend({
  constructor: function(token, pos) {
    this.token = token;
    this.ch = token.charAt(0);
    this.pos = pos;
    this.children = new Array2;
  },
  ch: null,
  token: null,
  children: null,
  
  add: function(item) {
    this.children.push(item);
  },
  
  getCount: function() {
    if (this.ch == "-") return 1;
    var count = /[$^.]/.test(this.ch) ? 1 : 0;
    forEach(this.children, function(item) {
      if (typeof item == "string") count++;
      else count += item.getCount();
    });
    return count;
  },
  
  toString: function(indentCount) {
    var a = [indent(indentCount, "["+this.token+"] "+this.type)];
    indentCount++;
    forEach(this.children, function(item) {
      if (typeof item == "string") {
        a.push(indent(indentCount, item));
      } else {
        a.push(item.toString(indentCount));
      }
    });
    return a.join(indent.NEW_LINE);
  },
  getBefore: function(i) {
    return "";
  },
  getAfter: function(i) {
    return "";
  },
  stringChildAround: function(s, i) {
    if(s.charAt(0) == "\\") return '<code class="backslash">'+s+'</code>';
    else if(s==".") return '<code class="special">'+s+'</code>';
    return s;
  },
  toHTML: function(n) {
    var a = ['<code class="' + this.type + '">' + this.getBefore(n)], inText = false;
    forEach (this.children, function(item, i) {
      if (typeof item == "string") {
        if (!inText) {
          a.push('<code class="text">');
          inText = true;
        }
        a.push(this.stringChildAround(item, i)); 
      } else {
        if (inText) {
          a.push("</code>");
          inText=false;
        }
        a.push(item.toHTML(i));
      }
    }, this);
    if (inText) a.push("</code>");
    a.push(this.getAfter(n)+"</code>");
    return a.join("");
  }
});