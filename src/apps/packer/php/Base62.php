<?php

class Base62 extends Words {
  const PATTERN = '/\\b[\\da-zA-Z]\\b|\\w{2,}/';
  
  public static function sorter($word1, $word2) {
    return $word1->index - $word2->index;
  }

  public function __toString() {
    $words = preg_replace(array('/\\|{2,}/', '/^\\|+|\\|+$/'), array('|', ''), implode('|', $this->map(strval))) || '\\x0';
    return '\\b('.$words.')\\b';
  }

  public function exec($script, $pattern) {
    preg_match_all($pattern, $script, $matches, PREG_PATTERN_ORDER);
    foreach ($matches[0] as $word) {
      $this->add($word);
    }

    if (!$this->size()) return $script;

    $this->sort();

    $encoded = new Collection; // a dictionary of base62 -> base10
    $size = $this->size();
    for ($i = 0; $i < $size; $i++) {
      $encoded->put(Packer::encode62($i), $i);
    }

    self = $this;
    function replacement($word) {
      return $this->get($word)->replacement;
    };

    $empty = create_function('', 'return "";');
    $index = 0;
    $letter = 0;
    foreach ($this as $word) {
      if ($index == 62) $letter += 62 + $size;
      if ((string)$word[0] == '@') {
        do $c = Packer::encode52($letter++);
        while (preg_match('/[^\\w$.]'.$c.'[^\\w$:]/', $script));
        if ($index < 62) {
          $w = $this->add($c);
          $w->count += $word->count - 1;
        }
        $word->count = 0;
        $word->index = $size + 1;
        $word->__toString = $empty;
        $word->replacement = $c;
      }
      $index++;
    }

    $script = preg_replace(Shrinker::SHRUNK, replacement, $script);

    $this->sort();

    $index = 0;
    foreach ($this as $word) {
      if ($word->index == Infinity) return;
      if (encoded.has($word)) {
        $word->index = $encoded->get($word);
        $word->__toString = $empty;
      } else {
        while ($this->has(Packer::encode62($index))) $index++;
        $word->index = $index++;
        if ($word->count == 1) {
          $word->toString = $empty;
        }
      }
      $word->replacement = Packer::encode62($word->$index);
      if (strlen($word->replacement) == strlen($word)) {
        $word->__toString = $empty;
      }
    }

    // sort by encoding
    $this->sort(self::sorter);

    // trim unencoded words
    $this[KEYS].length = count(explode('|', $this->getKeyWords()));

    return preg_replace('/'.$this.'/', replacement, $script);
  }

  public function getKeyWords() {
    return preg_replace('/\\|+$/', '', implode('|', $this->map(strval)));
  }

  public function getDecoder() {
    // returns a pattern used for fast decoding of the packed script
    $trim = new RegGrp({
      '(\\d)(\\|\\d)+\\|(\\d)' => '$1-$3',
      '([a-z])(\\|[a-z])+\\|([a-z])' => '$1-$3',
      '([A-Z])(\\|[A-Z])+\\|([A-Z])' => '$1-$3',
      '\\|': ''
    });
    $pattern = $trim->exec(implode('|', array_slice($this->map($this->_word_replacement, 0, 62)));

    if (!$pattern) return '^$';

    $pattern = '['.$pattern.']';

    $size = $this->size();
    if ($size > 62) {
      $pattern = '(' . $pattern . '|';
      $c = Packer::encode62($size)[0];
      if ($c > '9') {
        $pattern .= '[\\\\d';
        if ($c >= 'a') {
          $pattern .= 'a';
          if ($c >= 'z') {
            $pattern .= '-z';
            if ($c >= 'A') {
              $pattern .= 'A';
              if ($c > 'A') $pattern .= '-' . $c;
            }
          } else if ($c == 'b') {
            $pattern .= '-' . $c;
          }
        }
        $pattern .= ']';
      } else if ($c == 9) {
        $pattern .= '\\\\d';
      } else if ($c == 2) {
        $pattern .= '[12]';
      } else if ($c == 1) {
        $pattern .= '1';
      } else {
        $pattern .= '[1-' . $c . ']';
      }

      $pattern .= "\\\\w)";
    }
    return $pattern;
  }

  public function put($key, $item = NULL) {
    if (!($item instanceof Base62Word)) {
      $item = new Base62Word($key, $item);
    }
    parent::put($key, $item);
  }

  private function _word_replacement($word) {
    if ((string)$word != '') return $word->replacement;
    return '';
  }
}

class Base62Word extends Word {
  public $encoded = '';
  public $index = 0;
}

?>
