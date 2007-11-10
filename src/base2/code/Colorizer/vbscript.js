
with (base2.code.Colorizer) addScheme("vbscript", {
  comment: /(rem|')[^\r\n]*/,
  string: patterns.string2
  keyword: "\\b(call|class|end|const|dim|do|loop|erase|execute|executeglobal|exit|for|each|in|next|function|end\\sfunction|if|then|else|" +
    "on\\serror|resume\\snext|goto\\s0|goto\\s1|option\\sexplicit|private|property\\sget|property\\slet|property\\sset|end\\sproperty|public|" +
    "randomize|redim|select|end\\sselect|case|set|sub|end\\ssub|while|wend|with|" +
    "null|nothing|me|true|false|and|or|not|xor)\b/,
  global:  "\\b(Abs|Array|Asc|Atn|CBool|CByte|CCur|CDate|CDbl|Chr|CInt|CLng|CStr|Cos|CreateObject|CSng|" +
    "Date|DateAdd|DateDiff|DatePart|DateSerial|DateValue|Day|Eval|Exp|Filter|FormatCurrency|FormatDateTime|FormatNumber|FormatPercent|" +
    "GetLocale|GetObject|GetRef|Hex|Hour|InputBox|InStr|InStrRev|Int,|Fixs|IsArray|IsDate|IsEmpty|IsNull|IsNumeric|IsObject|Join|" +
    "LBound|LCase|Left|Len|LoadPicture|Log|LTrim|RTrim|Trim|Maths|Mid|Minute|Month|MonthName|MsgBox|Now|Oct|Replace|RGB|Right|Rnd|Round|" +
    "ScriptEngine|ScriptEngineBuildVersion|ScriptEngineMajorVersion|ScriptEngineMinorVersion|Second|SetLocale|Sgn|Sin|Space|Split|Sqr|StrComp|String|" +
    "Tan|Time|Timer|TimeSerial|TimeValue|TypeName|UBound|UCase|VarType|Weekday|WeekdayName|Year|" +
    "vb[a-zA-Z]+|" +
    "Class_Initialize|Class_Terminate|" +
    "Clear|Execute|Raise|Replace|Test|" +
    "Err|RegExp|escape|unescape)\\b/
});
