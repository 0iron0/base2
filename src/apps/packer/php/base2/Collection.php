<?php

class Collection extends Map {
  public function __toString() {
    return '('.implode(',', $this->getKeys()).')';
  }

  public function add($key, $item = NULL) {
    // Duplicates not allowed using add().
    // But you can still overwrite entries using put().
    assert(!$this->has($key));

    $this->put($key, $item);
  }

  public function getAt($index) {
    return $this->get($this->getKey($index));
  }

  public function indexOf($key) {
    return array_search($key, $this->getKeys());
  }

  public function insertAt($index, $key, $item) {
    assert($this->isValidIndex($index));
    assert(!$this->has($key));
    
    array_splice($this->values, $index, 1, NULL); // placeholder
    $this->put($key, $item);
  }

  public function item($key) {
    if (is_int($key)) {
      $key = $this->getKey($key);
    }
    return $this->get($key);
  }

  public function putAt($index, $item) {
    assert($this->isValidIndex($index));
    
    $this->put($this->getKey($index), $item);
  }

  public function removeAt($index) {
    $this->remove($this->getKey($index));
  }

  public function reverse() {
    array_reverse($this->values, TRUE);
    return $this;
  }

  public function sort($sorter = NULL) {
    if (isset($sorter)) {
      uasort($this->values, $sorter);
    } else {
      asort($this->values);
    }
    return $this;
  }
  
  public function slice($start = 0, $end = NULL) {
    $values = $this->values;
    $length = $end;
    if (isset($end) && $end > 0) {
      $length = $end - $this->size();
    }
    $this->values = array_slice($values, $start, $length, TRUE);
    $sliced = $this->copy();
    $this->values = $values;
    return $sliced;
  }
  
  private function getKey($index) {
    $size = $this->size();
    if ($index < 0) $index += $size;
    $keys = $this->getKeys();
    return $keys[$index];
  }
  
  private function isValidIndex($index) {
    $size = $this->size();
    if ($index < 0) $index += $size;
    return ($index >= 0) && ($index < $size);
  }
}

?>
