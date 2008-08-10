<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en">
<head>
 <title>Packer: Test Page</title>
 <meta name="copyright" content="&copy; copyright 2004-2008, Dean Edwards"/>
 <meta name="description" content="A Javascript compressor."/>
 <meta name="keywords" content="packer,javascript,compressor,obfuscator"/>
 <link rel="stylesheet" href="../packer.css" type="text/css" media="screen, projection"/>
</head>
<body>
 <h1>Packer 3.1</h1>
 <form action="" method="post">
  <p><label class="paste">Paste:</label><br />
   <textarea id="input" name="input" rows="10" cols="80" spellcheck="false"><?php
    echo(htmlspecialchars($_POST['input']));
   ?></textarea></p>
  <p id="controls">
   <label for="shrink">Shrink variables
    <input type="checkbox" name="shrink" id="shrink"/></label><br />
   <label for="privates">Encode privates
    <input type="checkbox" name="privates" id="privates" value="1"/></label><br />
   <label for="base62">Base62 encode
	  <input type="checkbox" name="base62" id="base62"/></label></p>
  <p class="form-buttons" id="input-buttons">
   <button type="reset" name="clear" id="clear" onclick="document.forms[0].output=''">Clear</button>
   <button type="submit" name="pack" id="pack">Pack</button></p>
  <p><label class="copy">Copy:</label>
   <textarea id="output" name="output" rows="10" cols="80" spellcheck="false"><?php
    require('pack.php');
    $packer = new Packer;
    //$packer->pack($_POST['input']);
    echo(htmlspecialchars($packer->pack($_POST['input'])));
   ?></textarea></p>
  <p id="message">ready</p>
  <p class="form-buttons" id="output-buttons">
   <button type="button" id="decode" name="decode" disabled="disabled">Decode</button></p>
  <fieldset style="display:none">
   <input type="hidden" name="command" value=""/>
   <input type="hidden" name="filename" value=""/>
   <input type="hidden" name="filetype" value=""/>
  </fieldset>
 </form>
</body>
</html>
