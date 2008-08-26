<?php

// A collection of regular expressions and their associated replacement values.
// A Base class for creating parsers.

class RegGrp extends Collection {
  const IGNORE = '$0';

  private static $BACK_REF        = '/\\\\(\\d+)/';
  private static $ESCAPE_CHARS    = '/\\\\./';
  private static $ESCAPE_BRACKETS = '/\\(\\?[:=!]|\\[[^\\]]+\\]/';
  private static $BRACKETS        = '/\\(/';

  public static function count($expression) {
    // Count the number of sub-expressions in a RegExp/RegGrp.Item.
    $expression = preg_replace(self::$ESCAPE_CHARS, '', (string)$expression);
    $expression = preg_replace(self::$ESCAPE_BRACKETS, '', $expression);
    return preg_match_all(self::$BRACKETS, $expression, $dummy);
  }
  
  public $ignoreCase = false;
  
  private $offset = 0;

  public function __construct($values = null, $ignoreCase = false) {
    parent::__construct($values);
    $this->ignoreCase = !!$ignoreCase;
  }

  public function __toString() {
    $this->offset = 1;
    return '('.implode($this->map($this->_item_toString), ')|(').')';
  }

  public function exec($string, $override = NULL) {
    if ($this->size() == 0) return (string)$string;
    if (isset($override)) $this->_override = $override;
    $result = preg_replace_callback('/'.$this.'/', array(&$this, '_replacer'), $string);
    unset($this->_override);
    return $result;
  }

  public function test($string) {
    // not implemented
  }

  private function _item_toString($item) {
    // Fix back references.
    $expression = preg_replace_callback($this->BACK_REF, $this->_fixBackReference, (string)$item);
    $this->offset += $item->length + 1;
    return $expression;
  }

  private function _fixBackReference($match, $index) {
    return '\\'.($this->offset + (int)$index);
  }

  private function _replacer($arguments) {
		if (empty($arguments)) return '';
		
    $offset = 1; $i = 0;
    // Loop through the RegGrp items.
    foreach ($this as $item) {
      $next = $offset + $item->length + 1;
      if (!empty($arguments[$offset])) { // do we have a result?
        $replacement = isset($this->_override) ? $this->_override : $item->replacement;
        if (is_callable($replacement)) {
          return call_user_func_array($replacement, array_slice($arguments, $offset, $item->length + 1));
        } else if (is_int($replacement)) {
          return $arguments[$offset + $replacement];
        } else {
          return $replacement;
        }
      }
      $offset = $next;
    }
    return $arguments[0];
  }

  public function put($key, $item = NULL) {
    if (!($item instanceof RegGrpItem)) {
      $item = new RegGrpItem($key, $item);
    }
    parent::put($key, $item);
  }
}

class RegGrpItem {
  private static $LOOKUP          = '/\\$(\\d+)/';
  private static $LOOKUP_SIMPLE   = '/^\\$\\d+$/';
  
  private static $FUNCTION_PARSER = array(
    '/\\\\/' => '\\\\',
    '/"/'    => '\\x22',
    '/\\n/'  => '\\n',
    '/\\r/'  => '\\r',
    '/\\$(\\d+)/' => '\'.$a[$1].\''
  );

  private $expression  = '';
  public  $replacement = '';

  public function __construct($expression, $replacement = RegGrp::IGNORE) {
    if ($replacement instanceof RegGrpItem) $replacement = $replacement->replacement;
    
    // does the pattern use sub-expressions?
    if (!is_callable($replacement) && preg_match(self::$LOOKUP, $replacement)) {
      // a simple lookup? (e.g. "$2")
      if (preg_match(self::$LOOKUP_SIMPLE, $replacement)) {
        // store the index (used for fast retrieval of matched strings)
        $replacement = (int)substr($replacement, 1);
      } else { // a complicated lookup (e.g. "Hello $2 $1")
        // build a function to do the lookup
        // Improved version by Alexei Gorkov:
        $replacement = preg_replace(array_keys(self::$FUNCTION_PARSER), array_values(self::$FUNCTION_PARSER), $replacement);
        $replacement = preg_replace('/([\'"])\\1\\.(.*)\\.\\1\\1$/', '$1', $replacement);
        $replacement = create_function('', '$a=func_get_args();return \''.$replacement.'\';');
      }
    }

    $this->expression = $expression;
    $this->replacement = $replacement;
  }

  public function __get($key) {
    $value = NULL;
    if ($key == 'length') {
      $value = RegGrp::count($this->expression);
    }
    return $value;
  }

  public function __toString() {
    return $this->expression;
  }
}

?>
