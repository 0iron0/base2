<?php

class Minifier {
  public function minify($script) {
    $script .= "\n";
    $script = preg_replace('/\\\\\\r?\\n/', '', $script);
    $script = self::$comments->exec($script);
    $script = self::$clean->exec($script);
    $script = self::$whitespace->exec($script);
    $concatenated = self::$concat->exec($script);
    while ($concatenated != $script) {
      $script = $concatenated;
      $concatenated = self::$concat->exec($script);
    }
    return $script;
  }
  
  public static $clean = array(
    '\\(\\s*([^;)]*)\\s*;\\s*([^;)]*)\\s*;\\s*([^;)]*)\\)' => '($1;$2;$3)', // for (;;) loops
    'throw[^};]+[};]' => RegGrp::IGNORE, // a safari 1.3 bug
    ';+\\s*([};])' => '$1'
  );

  public static $comments = array(
    ';;;[^\\n]*\\n' => '',
    '(COMMENT1)(\\n\\s*)(REGEXP)?' => '$3$4',
    '(COMMENT2)\\s*(REGEXP)?' => array(__CLASS__, '_commentParser')
  );

  public static function _commentParser($match, $comment = '', $dummy = '', $regexp = '') {
    if (preg_match('/^\\/\\*@/', $comment) && preg_match('/@\\*\\/$/', $comment)) {
      $comment = self::$conditionalComments->exec($comment);
    } else {
      $comment = '';
    }
    return $comment.' '.$regexp;
  }
  
  public static $conditionalComments;

  public static $concat = array(
    '(STRING1)\\+(STRING1)' => array(__CLASS__, '_concatenater'),
    '(STRING2)\\+(STRING2)' => array(__CLASS__, '_concatenater')
  );

  public static function _concatenater($match, $string1, $plus, $string2) {
    return substr($string1, 0, -1).substr($string2, 1);
  }

  public static $whitespace = array(
    '\\/\\/@[^\\n]*\\n' => RegGrp::IGNORE,
    '@\\s+\\b' => '@ ', // protect conditional comments
    '\\b\\s+@' => ' @',
    '(\\d)\\s+(\\.\\s*[a-z\\$_\\[(])' => '$1 $2', // http://dean.edwards.name/weblog/2007/04/packer3/#comment84066
    '([+-])\\s+([+-])' => '$1 $2', // c = a++ +b;
    '(\\w)\\s+(\\pL)' => '$1 $2', // http://code.google.com/p/base2/issues/detail?id=78
    '\\b\\s+\\$\\s+\\b' => ' $ ', // var $ in
    '\\$\\s+\\b' => '$ ', // object$ in
    '\\b\\s+\\$' => ' $', // return $object
//  '\\b\\s+#' => ' #',   // CSS
    '\\b\\s+\\b' => ' ',
    '\\s+' => ''
  );
}

// initialise static object properties

//eval("var e=this.encode62=" + this.ENCODE62);
Minifier::$clean = Packer::$data->union(new Parser(Minifier::$clean));
Minifier::$concat = new Parser(Minifier::$concat);
Minifier::$concat->merge(Packer::$data);
Minifier::$comments = Packer::$data->union(new Parser(Minifier::$comments));
Minifier::$conditionalComments = Minifier::$comments->copy();
Minifier::$conditionalComments->putAt(-1, ' $3');
Minifier::$whitespace = Packer::$data->union(new Parser(Minifier::$whitespace));
Minifier::$whitespace->removeAt(2); // conditional comments
Minifier::$comments->removeAt(2);

?>
