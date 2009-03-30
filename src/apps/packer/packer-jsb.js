
eval (base2.lang.namespace);

var packer = new Packer;

new jsb.RuleList({
  "form": {
    oncontentready: function(form) {
      form.output.value = "";
      this.ready(form);
    },

    onclick: function(form, event) {
      var target = event.target;
      if (target.tagName == "BUTTON") {
        this[target.id](form);
      }
    },

    clear: function(form) {
      form.input.value = "";
      form.output.value = "";
      this.ready(form);
    },

    decode: function(form) {
      try {
        if (form.output.value) {
          var start = new Date;
          eval("var value=String" + form.output.value.slice(4));
          var stop = new Date;
          form.output.value = value;
          this.update(form, "unpacked in " + (stop - start) + " milliseconds");
        }
      } catch (error) {
        this.error("error decoding script", error);
      } finally {
        form.decode.blur();
        form.decode.disabled = true;
      }
    },

    error: function(text, error) {
      this.message(text + ": " + error.message, "error");
    },

    message: function(text, className) {
      var message = document.getElementById("message");
      message.innerHTML = text;
      message.className = className || "";
    },

    pack: function(form) {
      try {
        form.output.value = "";
        if (form.input.value) {
          var value = packer.pack(form.input.value, form.base62.checked, form.shrink.checked, form.privates.checked);
          form.output.value = value;
          this.update(form);
        }
      } catch (error) {
        this.error("error packing script", error);
      } finally {
        form.decode.disabled = !form.output.value || !form.base62.checked;
      }
    },

    ready: function(form) {
      this.message("ready");
      form.input.focus();
    },

    update: function(form, message) {
      var length = form.input.value.length;
      if (!/\r/.test(form.input.value)) { // mozilla trims carriage returns
        length += match(form.input.value, /\n/g).length;
      }
      var calc = form.output.value.length + "/" + length;
      var ratio = (form.output.value.length / length).toFixed(3);
      this.message((message ? message + ", " : "") + format("compression ratio: %1=%2", calc, ratio));
    }
  }
});
