<?php

# PHP5 required

header('Content-Type: application/x-javascript');
header('Expires: ' . gmdate('D, d M Y H:i:s') . ' GMT');
header('Cache-Control: no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
print("// timestamp: ".gmdate('D, d M Y H:i:s')."\r\n");
$REG_XML = '/\\w+\\.xml$/';
$BASE = $_SERVER['DOCUMENT_ROOT'].'/base2/trunk/src';

$dom = new DomDocument;
$dom->load('package.xml');
$package =  $dom->documentElement;
$loaded = Array();

if (substr($_SERVER['QUERY_STRING'], 0, 4) == 'full') {
	readfile($BASE.'/base2.js');
	
	if ($package->getAttribute('name') != 'base2') {
		load_package($BASE.'/base2/package.xml');
	}
	$requires = explode(',', $package->getAttribute('requires'));
	foreach ($requires as $name) {
		if ($name) load_package($BASE.'/base2/'.$name.'/package.xml');
	}
}
print_package($package);

function load_package($path) {
	global $REG_XML, $loaded;
	
	if ($loaded[$path]) return;
	$loaded[$path] = true;
	
	$dom = new DomDocument;
	$dom->load($path);
	print_package($dom->documentElement, preg_replace($REG_XML, '', $path));
}

function print_package($package, $path = '') {
	global $REG_XML, $BASE;
	
	$name = $package->getAttribute('name');
	$publish = $package->getAttribute('publish') != 'false';
	$closure = $package->getAttribute('closure') != 'false';
	
	if ($closure) print("\r\nnew function(_) { ////////////////////  BEGIN: CLOSURE  ////////////////////\r\n");
	$includes = $package->getElementsByTagName('include');
	foreach ($includes as $include) {
		$src = $include->getAttribute('src');
		if (preg_match('/^\\//', $src)) {
			$src = $BASE.$src;
		} else {
			$src = $path.$src;
		}
		if (preg_match($REG_XML, $src)) {
			load_package($src);
		} else {
			print("\r\n// =========================================================================\r\n");
			print('// '.$name.'/'.$include->getAttribute('src'));
			print("\r\n// =========================================================================\r\n");
			readfile($src);
		}
	}	
	if ($publish) print("\r\neval(this.exports);\r\n");
	if ($closure) print("\r\n}; ////////////////////  END: CLOSURE  /////////////////////////////////////\r\n");
}
?>
