var LOGID = 'log';

var log = function(text, result) {
  var li = document.createElement("LI");
  li.className = result;
  li.appendChild(document.createTextNode(text));
  var logger = document.getElementById(LOGID);
  if (!logger) {
    logger = document.createElement("UL");
    logger.id = LOGID;
    logger = document.body.appendChild(logger);
  }
  logger.appendChild(li);
}

var clearLog = function() {
  document.getElementById(LOGID).innerHTML='';
}

var runTests = function(tests) {
  // run in alphabetical order
  var stats=[0,0];
  for(var name in tests) {
    var testCase = tests[name];
    try {
      testCase();
      log(base2.format("[%1] OK", name), "ok");
      stats[0]++;
    } catch(ex) {
      log(base2.format("[%1]: %2", name, ex), "error");
      stats[1]++;
    }
  }
  log(base2.format("Test run completed, %1 OK, %2 error%3", stats[0], stats[1], stats[1]!=1?"s.":"."), "info");
}

var assertEqual = function(a, b, message) {
  base2.assert(a==b, a+"=="+b+": "+message);
}
