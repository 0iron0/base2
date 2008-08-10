<?php

class Parser extends RegGrp {
  public static $dictionary = array(
    'OPERATOR'    => 'return|typeof|[\\[(\\^=,{}:;&|!*?]',
    'CONDITIONAL' => '\\/\\*@\\w*|\\w*@\\*\\/|\\/\\/@\\w*|@\\w+',
    'COMMENT1'    => '\\/\\/[^\\n]*',
    'COMMENT2'    => '\\/\\*[^*]*\\*+([^\\/][^*]*\\*+)*\\/',
    'REGEXP'      => '\\/(\\\\[\\/\\\\]|[^*\\/])(\\\\.|[^\\/\\n\\\\])*\\/[gim]*',
    'STRING1'     => '\'(\\\\.|[^\'\\\\])*\'',
    'STRING2'     => '"(\\\\.|[^"\\\\])*"'
  );
  
  public function put($expression, $replacement) {
    parent::put(Parser::$dictionary->exec($expression), $replacement);
  }
}

Parser::$dictionary = new RegGrp(Parser::$dictionary);

?>
