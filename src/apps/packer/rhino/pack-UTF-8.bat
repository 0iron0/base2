REM Change "UTF-8" for another java supported encoding. See the following link for these encodings:
REM http://java.sun.com/j2se/1.5.0/docs/guide/intl/encoding.doc.html
java -Dfile.encoding=UTF-8 -cp lib/js.jar org.mozilla.javascript.tools.shell.Main pack.js example.js example-p.js
