<?php
  extract($_POST);
  if (isset($pack)) {
    require('classes.php');
    $packer = new Packer;
    $output = $packer->pack($input, isset($base62), isset($shrink), isset($privates));
  }
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en">
<head>
 <title>Packer: Test Page</title>
 <meta name="copyright" content="&copy; copyright 2004-2008, Dean Edwards"/>
 <meta name="description" content="A Javascript compressor."/>
 <meta name="keywords" content="packer,javascript,compressor,obfuscator"/>
 <link rel="stylesheet" href="../packer.css" type="text/css" media="screen, projection"/>
 <script type="text/javascript">
  var packer = {
    clear: function() {
      var form = document.forms[0];
      form.input.value = "";
      form.output.value = "";
      form.decode.disabled = true;
      form.input.focus();
      this.showMessage("ready");
    },

    decode: function() {
      var form = document.forms[0];
      try {
        if (form.output.value) {
          var start = new Date;
          eval("var value=String" + form.output.value.slice(4));
          var stop = new Date;
          form.output.value = value;
          var length = form.input.value.length;
          if (!/\r/.test(form.input.value)) { // mozilla trims carriage returns
            length += (form.input.value.match(/\n/g) || "").length;
          }
          var calc = value.length + "/" + length;
          var ratio = (value.length / length).toFixed(3);
          this.showMessage("unpacked in " + (stop - start) + " milliseconds, compression ratio: " + calc + "=" + ratio);
        }
      } catch (error) {
        this.showMessage("error decoding script: " + error.message, "error");
      } finally {
        form.decode.blur();
        form.decode.disabled = true;
      }
    },

    showMessage: function(text, className) {
      var message = document.getElementById("message");
      message.innerHTML = text;
      message.className = className || "";
    }
  };
 </script>
</head>
<body>
 <h1>Packer 3.1</h1>
 <form action="" method="post">
  <p><label class="paste">Paste:</label><br />
   <textarea id="input" name="input" rows="10" cols="80" spellcheck="false"><?php
    echo(htmlspecialchars($input));
   ?></textarea></p>
  <p id="controls">
   <label for="shrink">Shrink variables
    <input type="checkbox" name="shrink" id="shrink" value="1"<?php if (isset($shrink)) echo(' checked="checked"'); ?>/></label><br />
   <label for="privates">Encode privates
    <input type="checkbox" name="privates" id="privates" value="1"<?php if (isset($privates)) echo(' checked="checked"'); ?>/></label><br />
   <label for="base62">Base62 encode
   <input type="checkbox" name="base62" id="base62" value="1"<?php if (isset($base62)) echo(' checked="checked"'); ?>/></label></p>
  <p class="form-buttons" id="input-buttons">
   <button type="button" name="clear" id="clear" onclick="packer.clear()">Clear</button>
   <button type="submit" name="pack" id="pack">Pack</button></p>
  <p><label class="copy">Copy:</label>
   <textarea id="output" name="output" rows="10" cols="80" spellcheck="false"><?php
    echo(htmlspecialchars($output));
   ?></textarea></p>
  <p id="message"><?php
    if (isset($pack)) {
      $ratio = strlen($output) / strlen($input);
      echo('compression ratio: '.strlen($output).'/'.strlen($input).'='.sprintf("%01.3f", $ratio));
    } else {
      echo('ready');
    }
  ?></p>
  <p class="form-buttons" id="output-buttons">
   <button type="button" name="decode" id="decode" onclick="packer.decode()"<?php if (!isset($base62)) echo(' disabled="disabled"'); ?>>Decode</button></p>
 </form>
</body>
</html>
