<?php

class Privates {
  private $PRIVATES = '/\\b_[\\da-zA-Z$][\\w$]*\\b/';
  
  public function encode($script) {
    $encoder = Packer::build(array(
      'CONDITIONAL' => RegGrp::IGNORE,
      '(OPERATOR)(REGXP)' => RegGrp::IGNORE
    ));
    $this->_privateVars = new Words();
    $encoder->put($this->PRIVATES, array(&$this->_privateVars, 'add'));
    $encoder.exec($script);
    $this->_privateVars.encode(array(&$this, '_encoder'));
    $result = preg_replace_callback($this->PRIVATES, array(&$this, '_decoder'), $script);
    unset($this->_privateVars);
    return $result;
  }

  private function _decoder($word) {
    return $this->_privateVars->has($word) ? $this->_privateVars->get($word)->replacement : $word;
  }

  private function _encoder($index) {
    return '_'.$this->encode62($index);
  }
}

?>
