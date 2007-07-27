var assertEqual = function(a, b, message) {
  base2.assert(a==b, a+"=="+b+": "+message);
};

var TestRunner = base2.Base.extend({
  runTests: function(tests) {
    var stats=[0,0];
    for(var name in tests) {
      var testCase = tests[name];
      try {
        testCase();
        this.log(base2.format("[%1] OK", name), "ok");
        stats[0]++;
      } catch(ex) {
        this.log(base2.format("[%1]: %2", name, ex), "error");
        stats[1]++;
      }
    }
    this.log(base2.format("Test run completed, %1 OK, %2 error%3", 
      stats[0], stats[1], stats[1]!=1?"s.":"."), "info");
  },
  
  log: function(text, result) {
    var li = document.createElement("LI");
    li.className = result;
    li.innerHTML = text;
    this.getLogger().appendChild(li);
  },
  
  clearLog: function() {
    this.getLogger().innerHTML='';
  },
  
  getLogger: function() {
    if (!this.logger) {
      var logger = document.createElement("UL");
      logger.id = this.LOGID;
      this.logger = document.body.appendChild(logger);
    }
    return this.logger;
  },

  logger: null
},{
  LOGID: 'log'  
});