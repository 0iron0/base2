Dim packer, script, packedScript, inSize, outSize
Set packer = CreateObject("base2.Packer")
script="function $(id) " & _
"{ " & vbNewLine & _
"  //define a local variable (otherwise it's considered a global variable) " & vbNewLine & _
"  var element;" & vbNewLine & _
"  //get a reference to the DOM entry by using w3c standard methods" & vbNewLine & _
"  element=document.getElementById(id);" & vbNewLine & _
"  //and now return the found element" & vbNewLine & _
"  return element;" & vbNewLine & _
"}"
Function Title(s)
  Title="---[ " & s & " ]"
  Title=Title & String(80-Len(Title), "-")
End Function
packedScript = packer.pack(script,false,true)
WScript.Echo Title("input script")
WScript.Echo script
WScript.Echo Title("packed script")
WScript.Echo packedScript
WScript.Echo Title("done")
WScript.Echo "Script size: " & Len(script) & " bytes. Packed size: " & Len(packedScript) & _
	" bytes. That is " & (Len(packedScript)*100\Len(script)) & "% of the original size."
Set packer = Nothing