eval(base2.namespace);

function createLibList(lst, name) {
  var a = [];
  forEach(lst, function(item, i) {
    a.push(format(
      '<div><input type="checkbox" name="%1" value="%2" id="%1_%3"%4><label for="%1_%3">%2</label></div>', 
      name, item[0], i, item[1] ? " checked" : ""));
  });
  return a.join('');
}

var libListName = "lib";

if (!(/^file:/).test(location.href)) {
  alert("You should load this page as a file, not by http (for now):");
}
else {
  new base2.JSB.RuleList({
    "#form": {
      ondocumentready: function() {

        //keep a list for now (is order important?)
        var lib_list = [ ['base2-legacy.js' ,false],
                         ['base2.js'        ,true],
                         ['base2-dom.js'    ,true],
                         ['base2-io.js'     ,true],
                         ['base2-jsb.js'    ,false],
                         ['base2-json.js'   ,false],
                         ['base2-jst.js'    ,false] ];
        document.getElementById('libs').innerHTML = createLibList(lib_list, libListName);
      }
    },
    "#lib_dir": {
      disabled: false
    },
    "#pack": {
      disabled: false,
      onclick: function(e) {
        var p = ! e.target.checked;
        base62.disabled = p;
        shrink.disabled = p;
        privates.disabled = p;
      }
    },
    "#base62,#shrink,#privates": {
      disabled: true,
      checked: false
    },
    "#output_file": {
      disabled: false
    },
    "#do_combine": {
      disabled: false,
      onclick: function() {
        var contents=[], warnings=[];
        var basepath = lib_dir.value;
        eval(IO.namespace);
        var fs = new LocalFileSystem;
        forEach(document.getElementsByName(libListName), function(item) {
          if (item.checked) {
            var fn = FileSystem.resolve(basepath, item.value);
            var f = new LocalFile(fn);
            f.open(LocalFile.READ);
            if (f.exists()) {
              contents.push("//--| Combine: "+fn);
              contents.push(f.read());
            } else {
              warnings.push(format("File %1 doesn't exist", fn));
            }
            f.close();
          }
        });
        if (pack.checked) {
          alert("Not implemented yet");
        }
        var fn = FileSystem.resolve(basepath, output_file.value);
        var f = new LocalFile(fn);
        f.write(contents.join("\n"));
        f.close();
      }
    }  
  });
}