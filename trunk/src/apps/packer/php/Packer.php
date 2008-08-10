<?php

class Packer {
  public static $data = array(
    'STRING1' => RegGrp::IGNORE,
    'STRING2' => RegGrp::IGNORE,
    'CONDITIONAL' => RegGrp::IGNORE, // conditional comments
    '(OPERATOR)\\s*(REGEXP)' => '$1$2'
  );

  public static function encode52($n) {
    $left = $n < 52 ? '' : self::encode52((int)($n / 52));
    $n = $n % 52;
    $right = $n > 25 ? chr($n + 39) : chr($n + 97);
    $encoded = $left.$right;
    if (preg_match('/^(do|if|in)$/', $encoded)) {
      $encoded = substr($encoded, 1).'0';
    }
    return $encoded;
  }

  private $minifier;
  private $shrinker;
  private $privates;
  private $base62;

  public function __construct() {
    $this->minifier = new Minifier;
    //$this->privates = new Privates;
    $this->shrinker = new Shrinker;
    //$this->base62 = new Base62;
  }

  public function pack($script = '', $base62 = false, $shrink = true, $privates = false) {
    $script = $this->minifier->minify($script);
    if ($shrink) $script = $this->shrinker->shrink($script, $base62);
    //if ($privates) $script = $this->privates->encode($script);
    //if ($base62) $script = $this->base62->encode($script, $shrink);
    return $script;
  }
}

// initialise static object properties

Packer::$data = new Parser(Packer::$data);

?>
