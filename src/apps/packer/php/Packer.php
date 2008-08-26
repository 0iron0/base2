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

  public static function encode62($n) {
    $left = $n < 62 ? '' : self::encode62((int)($n / 62));
    $n = $n % 62;
    $right = $n > 35 ? chr($n + 29) : base_convert($n, 10, 36);
    return $left.$right;
  }

  private $minifier;
  private $shrinker;
  private $privates;
  private $base62;

  public function __construct() {
    $this->minifier = new Minifier;
    $this->shrinker = new Shrinker;
    $this->privates = new Privates;
    $this->base62   = new Base62;
  }

  public function pack($script = '', $base62 = false, $shrink = true, $privates = false) {
    $script = $this->minifier->minify($script);
    if ($shrink) $script = $this->shrinker->shrink($script);
    if ($privates) $script = $this->privates->encode($script);
    if ($base62) $script = $this->base62->encode($script);
    return $script;
  }
}

// initialise static object properties

Packer::$data = new Parser(Packer::$data);

?>
