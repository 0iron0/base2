<?php

class Words extends RegGrp {
  public static function sorter($word1, $word2) {
    $diff = $word2->count - $word1->count;
    return $diff == 0 ? strcmp($word1, $word2) : $diff;
  }

  public function __construct($script = '', $pattern = '') {
    parent::__construct();
    preg_match_all($pattern, $script, $matches, PREG_PATTERN_ORDER);
    foreach ($matches[0] as $word) {
      $this->add($word);
    }
  }

  public function add($word) {
    if (!$this->has($word)) parent::add($word);
    $word = $this->get($word);
    $word->count++;
    return $word;
  }

  public function put($key, $item = NULL) {
    if (!($item instanceof Word)) {
      $item = new Word($key, $item);
    }
    parent::put($key, $item);
  }

  public function encode($encoder) {
    $this->sort();
    $index = 0;
    foreach ($this as $word) {
      $word->replacement = call_user_func($encoder, $index++);
    }
    return $this;
  }

  public function sort($sorter = NULL) {
    if (!isset($sorter)) {
      $sorter = array(&$this, 'sorter');
    }
    return parent::sort($sorter);
  }
}

class Word extends RegGrpItem {
  public $count = 0;
}

?>
