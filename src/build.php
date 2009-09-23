<?php

# PHP5 required

header('Content-Type: application/x-javascript');
header('Expires: ' . gmdate('D, d M Y H:i:s') . ' GMT');
header('Cache-Control: no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');

$REG_XML = '/\\w+\\.xml$/';
$PACKAGE = $_GET["package"];
$PBASE = dirname($PACKAGE);
$HBASE = dirname(realpath("build.php"));

if (!file_exists($PACKAGE)) {
	print("Package '".$PACKAGE."' does not exist, or is not even supplied. Add following the querystring:\n");
	print("   build.php?package=path\\to\\package.xml\n");
	print("\n");
	print("Path is relative to build.php. Paths within the package.xml file are relative to package.xml.");
	print("To make a path relative to the build.php file, user ~/ syntax.\n");
	print("\n");
	print("To include base2 itself, add the 'full' querystring parameter:\n");
	print("   build.php?package=path\\to\\package.xml&full\n");
	exit;
}

$dom = new DomDocument;
$p = path_resolve($PACKAGE, $HBASE);
$dom->load($p);
$package =  $dom->documentElement;
$loaded = Array();

$header = $package->getAttribute('header');
if ($header == '') {
  include("header.txt");
} else {
	readfile(path_resolve($header, $PBASE));
}

print("\r\n// timestamp: ".gmdate('D, d M Y H:i:s')."\r\n");

if (preg_match('/(^|\&)full($|\=|\&)/i',$_SERVER['QUERY_STRING'])) {
	readfile(path_resolve('~/base2.js', $PBASE));
	
	if ($package->getAttribute('name') != 'base2') {
		load_package(path_resolve('~/base2/package.xml',$PBASE));
	}
	$requires = explode(',', $package->getAttribute('requires'));
	foreach ($requires as $name) {
		if ($name) load_package(path_resolve('~/base2/'.$name.'/package.xml',$PBASE));
	}
}
print_package($package, $PBASE);

// Paths are resolved relative to the current package.xml,
// bootstrapped with path of build.php
// Home directory notation (~/) is relative to build.php
// Absolute path's are relative to the root
function path_resolve($path, $package) {
	global $HBASE;
	if (substr($path, 0, 2) == '~/') return $HBASE.substr($path, 1);
	if (substr($path, 0, 1) != '/') return $package."/".$path;
	return $path;
}

function load_package($path) {
	global $REG_XML, $loaded;
	
	if ($loaded[$path]) return;
	$loaded[$path] = true;
	
	$dom = new DomDocument;
	$dom->load($path);
	print_package($dom->documentElement, dirname($path));
}

function print_package($package, $pbase) {
	global $REG_XML, $BASE;

	$before = $package->getAttribute('before');
	if ($before) readfile(path_resolve($before, $pbase));
	
	$name = $package->getAttribute('name');
	$publish = $package->getAttribute('publish') != 'false';
	$closure = $package->getAttribute('closure') != 'false';
	
	if ($closure) {
    $shrink = ($package->getAttribute('shrink') == 'true') ? '' : '_no_shrink_';
    print("\r\nnew function($shrink) { ///////////////  BEGIN: CLOSURE  ///////////////\r\n");
  }
	$includes = $package->getElementsByTagName('include');
	foreach ($includes as $include) {
		$src = path_resolve($include->getAttribute('src'), $pbase);
		$var = $include->getAttribute('var');

		if (preg_match($REG_XML, $src)) {
			load_package($src);
		} else {
      if ($include->getAttribute('header') != 'false') {
  			print("\r\n// =========================================================================\r\n");
  			print('// '.preg_replace('/^\//', '', preg_replace('/[\w\-]+\/\.\./', '', $name.'/'.$include->getAttribute('src'))));
  			print("\r\n// =========================================================================\r\n");
      }
			if ($var) {
				print("var ".$var."=".json_encode(file_get_contents($src)).";\r\n");
			} else if (!readfile($src)) {
				print("alert('BOO! The file \"".$src."\" from your package was not found.');");
			}
		}
	}	
	if ($publish) print("\r\neval(this.exports);\r\n");
	if ($closure) print("\r\n}; ////////////////////  END: CLOSURE  /////////////////////////////////////\r\n");

	$after = $package->getAttribute('after');
	if ($after) readfile(path_resolve($after, $pbase));
}
?>
