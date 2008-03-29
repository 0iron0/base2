
base2.DOM.bind(document);

var packer = new Packer;

new base2.JSB.RuleList({
  "#form": {
    ondocumentready: function() {
      $form.classList.remove("disabled");
      $output.value = "";
      $form.ready();
    },
    
    ready: function() {
      $message.write("ready");
      $input.focus();
    }
  },
  "#input,#output": {
    disabled: false,
    spellcheck: false // for mozilla
  },
  "#clear-all": {
    disabled: false,
    
    onclick: function() {
      $input.value = "";
      $output.value = "";
      $form.ready();
    }
  },
  "#pack-script": {
    disabled: false,
    
    onclick: function() {
      try {
        $output.value = "";
        if ($input.value) {
          var value = packer.pack($input.value, $base62.checked, $shrink.checked, $privates.checked);
          $output.value = value;
          $message.update();
        }
      } catch (error) {
        $message.error("error packing script", error);
      } finally {
        $decodeScript.disabled = !$output.value || !$base62.checked;
      }
    }
  },
  "#decode-script": {    
    onclick: function() {
      try {
        if ($output.value) {
          var start = new Date;
          eval("var value=String" + $output.value.slice(4));
          var stop = new Date;
          $output.value = value;
          $message.update("unpacked in " + (stop - start) + " milliseconds");
        }
      } catch (error) {
        $message.error("error decoding script", error);
      } finally {
        $decodeScript.blur();
        $decodeScript.disabled = true;
      }
    }
  },
  "#base62,#shrink,#privates,#dictionary": {
    disabled: false
  },
  "#message": {
    error: function($message, text, error) {
      $message.write(text + ": " + error.message, "error");
    },
    
    update: function($message, message) {
      var length = $input.value.length;
      if (!/\r/.test($input.value)) { // mozilla trims carriage returns
        length += match($input.value, /\n/g).length;
      }
      var calc = $output.value.length + "/" + length;
      var ratio = ($output.value.length / length).toFixed(3);
      $message.write((message ? message + ", " : "") + format("compression ratio: %1=%2", calc, ratio));
    },
    
    write: function($message, text, className) {
      $message.innerHTML = text;
      $message.className = className || "";
    } 
  }
});
