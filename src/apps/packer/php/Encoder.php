<?php

class Encoder {
  protected $words;
  private $parser;
  private $encoder;
  
  public function __construct($pattern = NULL, $encoder = NULL, $ignore = NULL) {
    $this->parser = new Parser($ignore);
    if (isset($pattern)) $this->parser->put($pattern, '');
    $this->encoder = $encoder;
  }

  public function search($script) {
    $this->words = new Words;
    $this->parser->putAt(-1, array(&$this, '_addWord'));
    $this->parser->exec($script);
  }

  public function encode($script) {
    $this->search($script);
    $this->words->sort();
    $index = 0;
    foreach ($this->words as $word) {
      $word->encoded = call_user_func($this->encoder, $index++);
    }
    $this->parser->putAt(-1, array(&$this, '_replacer'));
    $script = $this->parser->exec($script);
    unset($this->words);
    return $script;
  }

  public function _replacer($word) {
    return $this->words->get($word)->encoded;
  }

  public function _addWord($word) {
    $this->words->add($word);
    return $word;
  }
}

?>
