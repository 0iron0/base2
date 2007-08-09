
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
