
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
