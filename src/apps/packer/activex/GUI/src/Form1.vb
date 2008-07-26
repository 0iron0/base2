Imports System.IO
Public Class frmPacker3

	Private SaveFile As FileInfo
	Private Packer3 As Object = Nothing

	Private Sub frmPacker3_Load(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles MyBase.Load
		Try
			Packer3 = CreateObject("base2.Packer")	'Packer3.pack(script, base62Encode, shrinkVariables);
		Catch ex As Exception
			PackerNotRegistered()
		End Try
	End Sub

	Private Sub txtInput_TextChanged(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles txtInput.TextChanged
		If txtInput.Text.Length <= 0 Then
			btnInputPack.Enabled = False
			btnInputClear.Enabled = False
			chkInputBase62.Enabled = False
			chkInputShrink.Enabled = False
			txtOutput.Enabled = False
			lblOutputRatio.Text = ""
		Else
			btnInputPack.Enabled = True
			btnInputClear.Enabled = True
			chkInputBase62.Enabled = True
			chkInputShrink.Enabled = True
			txtOutput.Enabled = True
			lblOutputRatio.Text = ""
		End If
	End Sub
	Private Sub btnInputOpen_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles btnInputOpen.Click
		dlgInputOpen.ShowDialog()
	End Sub
	Private Sub dlgInputFile_FileOk(ByVal sender As System.Object, ByVal e As System.ComponentModel.CancelEventArgs) Handles dlgInputOpen.FileOk
		Dim FileStream As Stream = dlgInputOpen.OpenFile()
		Dim FileRead As New StreamReader(FileStream)
		txtInput.Text = FileRead.ReadToEnd()
		FileRead.Close()
		FileRead = Nothing
		SaveFile = Nothing
	End Sub
	Private Sub btnInputPack_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles btnInputPack.Click
		If Packer3 Is Nothing Then
			PackerNotRegistered()
		Else
			txtOutput.Text = Packer3.pack(txtInput.Text, chkInputBase62.Checked, chkInputShrink.Checked)
		End If
	End Sub
	Private Sub btnInputPaste_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles btnInputPaste.Click
		If Clipboard.GetDataObject().GetDataPresent(DataFormats.Text) Then
			txtInput.Text = Clipboard.GetDataObject().GetData(DataFormats.Text).ToString()
		End If
	End Sub
	Private Sub btnInputClear_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles btnInputClear.Click
		txtInput.Text = ""
	End Sub

	Private Sub txtOutput_TextChanged(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles txtOutput.TextChanged
		If txtOutput.Text.Length <= 0 Then
			btnOutputSave.Enabled = False
			btnOutputSaveAs.Enabled = False
			btnOutputClear.Enabled = False
			btnOutputCopy.Enabled = False
			lblOutputRatio.Text = "Ready"
		Else
			btnOutputSave.Enabled = True
			btnOutputSaveAs.Enabled = True
			btnOutputClear.Enabled = True
			btnOutputCopy.Enabled = True
			lblOutputRatio.Text = "Compression: " & txtInput.Text.Length & "/" & txtOutput.Text.Length & " (" & Math.Abs(Math.Round(txtOutput.Text.Length / txtInput.Text.Length * 100, 5) - 100) & "%)"
		End If
	End Sub
	Private Sub btnOutputSave_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles btnOutputSave.Click
		If SaveFile Is Nothing Then
			dlgOutputSave.ShowDialog()
		Else
			WriteFile()
		End If
	End Sub
	Private Sub btnOutputSaveAs_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles btnOutputSaveAs.Click
		dlgOutputSave.ShowDialog()
	End Sub
	Private Sub dlgOutputSave_FileOk(ByVal sender As System.Object, ByVal e As System.ComponentModel.CancelEventArgs) Handles dlgOutputSave.FileOk
		SaveFile = New FileInfo(dlgOutputSave.FileName)
		WriteFile()
	End Sub
	Private Sub WriteFile()
		Dim FileWrite As FileStream = SaveFile.Open(FileMode.Create, FileAccess.Write, FileShare.None)
		Dim StringContent As Byte() = System.Text.Encoding.ASCII.GetBytes(txtOutput.Text)
		If FileWrite.CanWrite Then
			FileWrite.Write(StringContent, 0, StringContent.Length)
		Else
			MsgBox("You've got Problems!" & vbCrLf & vbCrLf & "File access/permission problems!" & vbCrLf & "You need to fix that before you can save a file...")
		End If
		FileWrite.Close()
		FileWrite = Nothing
	End Sub
	Private Sub btnOutputCopy_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles btnOutputCopy.Click
		Clipboard.SetDataObject(txtOutput.Text, True)
	End Sub
	Private Sub btnOutputClear_Click(ByVal sender As System.Object, ByVal e As System.EventArgs) Handles btnOutputClear.Click
		txtOutput.Text = ""
	End Sub

	Private Sub PackerNotRegistered()
		MsgBox("You've got Problems!" & vbCrLf & vbCrLf & "You must have the Packer ActiveX control registered to use this application." & vbCrLf & "Get it at http://zeroreality.net/packer3/")
	End Sub

End Class