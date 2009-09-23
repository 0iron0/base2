<?php

include('classes.php');

if ($argc > 1) {
  $options = $argc > 2 ? $argv[2] : 's';

  // options
  $base62   = preg_match('/e/', $options);
  $shrink   = preg_match('/s/', $options);
  $privates = preg_match('/p/', $options);

  $script = file_get_contents($argv[1]);
  $packer = new Packer;
  $output = $packer->pack($script, $base62, $shrink, $privates);

  fwrite(STDOUT, $output);
} else {
  fwrite(STDOUT, '
Compress a JavaScript source file using Dean Edwards\' Packer.
Version : 3.1
Syntax  : /path/to/php.exe pack.php -esp
Options :
    e: base62 encode
    s: shrink variables
    p: encode _private variables
');
}
?>
