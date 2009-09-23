<?php

class Privates extends Encoder {
  const PATTERN = '\\b_[\\da-zA-Z$][\\w$]*\\b';
  
  public function __construct() {
    return parent::__construct(Privates::PATTERN, array(&$this, '_encoder'), Privates::$IGNORE);
  }

  public function search($script) {
    parent::search($script);
    $private = $this->words->get('_private');
    if ($private) $private->count = 99999;
    return $words;
  }
  
  public static $IGNORE = array(
    'CONDITIONAL' => RegGrp::IGNORE,
    '(OPERATOR)(REGEXP)' => RegGrp::IGNORE
  );
  
  /* clallback functions (public because of php's crappy scoping) */

  public static function _encoder($index) {
    return '_'.Packer::encode62($index);
  }
}

?>
