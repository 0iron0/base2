eval(base2.namespace);

function createCheckboxItem(name, value, id, prechecked) {
  return format(
      '<input type="checkbox" name="%1" value="%2" id="%3"%4><label for="%3">%2</label>', 
      name, value, id, prechecked ? " checked" : "");
}
function createLibList(lst, name) {
  var a = [];
  forEach(lst, function(item, i) {
    a.push('<div>'+createCheckboxItem(name, item[0], name+i, item[1])+'</div>')
  });
  return a.join('');
}

var packer = new Packer;
var libListName = "lib";
var fileModus = /^file:/.test(location.href);

if (!fileModus) {
  alert("You should open this page as a file, not with http");
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
        var libs = document.getElementById('libs');
        libs.innerHTML = createLibList(lib_list, libListName);
        libs.lastId = lib_list.length;
      }
    },
    "#lib_dir": {
      disabled: false
    },
    "#libs_add": {
      disabled: false,
      onclick: function() {
        var lib = prompt("Provide a lib:");
        if (lib) {
          eval(IO.namespace);
          var basepath = lib_dir.value;
          if (!/\/$/.test(basepath)) basepath+='/';
          var fn = basepath + lib;
          var f = new LocalFile(fn);
          f.open(LocalFile.READ);
          if (f.exists()) {
            var libs = document.getElementById('libs');
            var div = document.createElement("DIV");
            div.innerHTML = createCheckboxItem(libListName, lib, libListName + (libs.lastId++), true);
            libs.appendChild(div);
          } else {
            alert("Yo, the file doesn't exist. Full path:\n"+fn);
          }
          f.close();
        }
      }
    },
    "#pack": {
      disabled: false,
      onclick: function(e) {
        var p = e.target.checked;
        base62.disabled = shrink.disabled = privates.disabled = !p;
        var rx = /-p\.js$/;
        if (p) {
          if (!rx.test(output_file.value)) output_file.value = output_file.value.replace(/\.js$/, "-p.js");
        }
        else output_file.value = output_file.value.replace(rx, ".js");
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
        if (!/\/$/.test(basepath)) basepath+='/';
        eval(IO.namespace);
        forEach(document.getElementsByName(libListName), function(item) {
          if (item.checked) {
            var fn = basepath + item.value;
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
        contents = contents.join("\n");
        if (pack.checked) {
          contents = packer.pack(contents, base62.checked, shrink.checked, privates.checked);
        }
        /*
        document.getElementById('output_contents').value = contents.join("\n");
        return;
        */
        var f = new LocalFile(basepath + output_file.value);
        f.open(LocalFile.WRITE);
        f.write(contents);
        f.close();
      }
    }
  });
}