<?php

class Collection extends Map {
  public function add($key, $item = NULL) {
    // Duplicates not allowed using add().
    // But you can still overwrite entries using put().
    assert(!$this->has($key));
    
    $this->put($key, $item);
  }

  public function getAt($index) {
    return $this->get($this->_getKey($index));
  }

  public function indexOf($key) {
    return array_search($key, $this->getKeys());
  }

  public function insertAt($index, $key, $item) {
    assert(abs($index) < $this->size());
    assert(!$this->has($key));
    
    array_splice($this->values, $index, 1, NULL); // placeholder
    $this->put($key, $item);
  }

  public function item($key) {
    if (is_int($key)) {
      $key = $this->_getKey($key);
    }
    return $this->get($key);
  }

  public function putAt($index, $item) {
    assert(abs($index) < $this->size());
    
    $this->put($this->_getKey($index), $item);
  }

  public function removeAt($index) {
    $this->remove($this->_getKey($index));
  }

  public function reverse() {
    array_reverse($this->values);
    return $this;
  }

  public function sort($sorter = NULL) {
    if (isset($sorter)) {
      usort($this->values, $sorter);
    } else {
      sort($this->values);
    }
    return $this;
  }
  
  private function _getKey($index) {
    $keys = $this->getKeys();
    return $keys[$index];
  }
}

?>
