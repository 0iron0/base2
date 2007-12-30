load("lib/writeFile.js");
load("../base2.js");
load("../Packer.js");
load("../Words.js");

importPackage(java.lang);

// arguments
var base62   = false;
var shrink   = false;
var inFile;
var outFile;

forEach(arguments, function(arg) {
  if (/^-(es|e|s)$/.test(arg)) {
    base62 = arg.indexOf('e') != -1;
    shrink = arg.indexOf('s') != -1;
  }
  else if (/^-(\?|h(elp)?)$/.test(arg)) {
    help(System.out);
    quit();
  }
  else if (inFile && !outFile) outFile = arg;
  else if (!outFile) inFile = arg;
  else die(format("Parameter '%1' is not recognized.", arg));
});
if (arguments.length == 0) {
  help(System.out);
} else {
  if (!inFile) die("No input file supplied");
  if (!outFile) outFile = inFile.replace(/\.(.+)$/, "-p.$1");

  var script = readFile(inFile);
  if (!script) die(format("File '%1' is empty, or does not exist", inFile));
  var packer = new Packer;
  var packedScript = packer.pack(script, base62, shrink);

  writeFile(outFile, packedScript);
}

function help(out) {
  out.println();
	out.println('Compress a JavaScript source file using Dean Edwards\' "Packer".');
	out.println('  Version : 3.0');
	out.println('  Syntax  : program sourcefile -es');
	out.println('  Options :');
	out.println('    e: base62 encode');
	out.println('    s: shrink variables');
}

function die(msg) {
  System.err.println();
  System.err.println(msg);
  help(System.err);
  quit();
}