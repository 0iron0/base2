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