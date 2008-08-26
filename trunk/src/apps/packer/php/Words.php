<?php

class Words extends Collection {
  public static function sorter($word1, $word2) {
    $diff = $word2->count - $word1->count;
    return $diff == 0 ? $word1->index - $word2->index : $diff;
  }

  public function add($word) {
    if (!$this->has($word)) parent::add($word);
    $word = $this->get($word);
    if ($word->index == 0) {
      $word->index = $this->size();
    }
    $word->count++;
    return $word;
  }

  public function put($key, $item = NULL) {
    if (!($item instanceof Word)) {
      $item = new Word($key);
    }
    parent::put($key, $item);
  }

  public function sort($sorter = NULL) {
    if (!isset($sorter)) {
      $sorter = array('Words', 'sorter');
    }
    return parent::sort($sorter);
  }
}

class Word {
  public $count = 0;
  public $encoded = '';
  public $index = 0;
  private $text = '';

  public function __construct($text) {
    $this->text = $text;
  }

  public function __toString() {
    return $this->text;
  }

  public function clear() {
    $this->text = '';
  }
}

?>
