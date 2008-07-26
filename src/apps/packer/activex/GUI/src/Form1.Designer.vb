<Global.Microsoft.VisualBasic.CompilerServices.DesignerGenerated()> _
Partial Class frmPacker3
	Inherits System.Windows.Forms.Form

	'Form overrides dispose to clean up the component list.
	<System.Diagnostics.DebuggerNonUserCode()> _
	Protected Overrides Sub Dispose(ByVal disposing As Boolean)
		If disposing AndAlso components IsNot Nothing Then
			components.Dispose()
		End If
		MyBase.Dispose(disposing)
	End Sub

	'Required by the Windows Form Designer
	Private components As System.ComponentModel.IContainer

	'NOTE: The following procedure is required by the Windows Form Designer
	'It can be modified using the Windows Form Designer.  
	'Do not modify it using the code editor.
	<System.Diagnostics.DebuggerStepThrough()> _
	Private Sub InitializeComponent()
		Dim resources As System.ComponentModel.ComponentResourceManager = New System.ComponentModel.ComponentResourceManager(GetType(frmPacker3))
		Me.splPacker = New System.Windows.Forms.SplitContainer
		Me.grpInput = New System.Windows.Forms.GroupBox
		Me.btnInputPaste = New System.Windows.Forms.Button
		Me.btnInputClear = New System.Windows.Forms.Button
		Me.chkInputShrink = New System.Windows.Forms.CheckBox
		Me.chkInputBase62 = New System.Windows.Forms.CheckBox
		Me.btnInputPack = New System.Windows.Forms.Button
		Me.btnInputOpen = New System.Windows.Forms.Button
		Me.txtInput = New System.Windows.Forms.TextBox
		Me.grpOutput = New System.Windows.Forms.GroupBox
		Me.lblOutputRatio = New System.Windows.Forms.Label
		Me.btnOutputCopy = New System.Windows.Forms.Button
		Me.btnOutputSaveAs = New System.Windows.Forms.Button
		Me.btnOutputClear = New System.Windows.Forms.Button
		Me.btnOutputSave = New System.Windows.Forms.Button
		Me.txtOutput = New System.Windows.Forms.TextBox
		Me.dlgInputOpen = New System.Windows.Forms.OpenFileDialog
		Me.dlgOutputSave = New System.Windows.Forms.SaveFileDialog
		Me.splPacker.Panel1.SuspendLayout()
		Me.splPacker.Panel2.SuspendLayout()
		Me.splPacker.SuspendLayout()
		Me.grpInput.SuspendLayout()
		Me.grpOutput.SuspendLayout()
		Me.SuspendLayout()
		'
		'splPacker
		'
		Me.splPacker.CausesValidation = False
		Me.splPacker.Dock = System.Windows.Forms.DockStyle.Fill
		Me.splPacker.Location = New System.Drawing.Point(10, 10)
		Me.splPacker.Margin = New System.Windows.Forms.Padding(0)
		Me.splPacker.Name = "splPacker"
		Me.splPacker.Orientation = System.Windows.Forms.Orientation.Horizontal
		'
		'splPacker.Panel1
		'
		Me.splPacker.Panel1.Controls.Add(Me.grpInput)
		'
		'splPacker.Panel2
		'
		Me.splPacker.Panel2.Controls.Add(Me.grpOutput)
		Me.splPacker.Size = New System.Drawing.Size(672, 453)
		Me.splPacker.SplitterDistance = 242
		Me.splPacker.TabIndex = 0
		'
		'grpInput
		'
		Me.grpInput.Controls.Add(Me.btnInputPaste)
		Me.grpInput.Controls.Add(Me.btnInputClear)
		Me.grpInput.Controls.Add(Me.chkInputShrink)
		Me.grpInput.Controls.Add(Me.chkInputBase62)
		Me.grpInput.Controls.Add(Me.btnInputPack)
		Me.grpInput.Controls.Add(Me.btnInputOpen)
		Me.grpInput.Controls.Add(Me.txtInput)
		Me.grpInput.Dock = System.Windows.Forms.DockStyle.Fill
		Me.grpInput.Location = New System.Drawing.Point(0, 0)
		Me.grpInput.Margin = New System.Windows.Forms.Padding(0)
		Me.grpInput.Name = "grpInput"
		Me.grpInput.Padding = New System.Windows.Forms.Padding(10, 20, 10, 10)
		Me.grpInput.Size = New System.Drawing.Size(672, 242)
		Me.grpInput.TabIndex = 9
		Me.grpInput.TabStop = False
		Me.grpInput.Text = "Input"
		'
		'btnInputPaste
		'
		Me.btnInputPaste.Anchor = CType((System.Windows.Forms.AnchorStyles.Bottom Or System.Windows.Forms.AnchorStyles.Left), System.Windows.Forms.AnchorStyles)
		Me.btnInputPaste.Cursor = System.Windows.Forms.Cursors.Hand
		Me.btnInputPaste.Location = New System.Drawing.Point(172, 211)
		Me.btnInputPaste.Margin = New System.Windows.Forms.Padding(0)
		Me.btnInputPaste.Name = "btnInputPaste"
		Me.btnInputPaste.Size = New System.Drawing.Size(75, 21)
		Me.btnInputPaste.TabIndex = 4
		Me.btnInputPaste.Text = "Paste"
		Me.btnInputPaste.UseVisualStyleBackColor = True
		'
		'btnInputClear
		'
		Me.btnInputClear.Anchor = CType((System.Windows.Forms.AnchorStyles.Bottom Or System.Windows.Forms.AnchorStyles.Left), System.Windows.Forms.AnchorStyles)
		Me.btnInputClear.Cursor = System.Windows.Forms.Cursors.Hand
		Me.btnInputClear.Enabled = False
		Me.btnInputClear.Location = New System.Drawing.Point(253, 211)
		Me.btnInputClear.Margin = New System.Windows.Forms.Padding(0)
		Me.btnInputClear.Name = "btnInputClear"
		Me.btnInputClear.Size = New System.Drawing.Size(75, 21)
		Me.btnInputClear.TabIndex = 5
		Me.btnInputClear.Text = "Clear"
		Me.btnInputClear.UseVisualStyleBackColor = True
		'
		'chkInputShrink
		'
		Me.chkInputShrink.Anchor = CType((System.Windows.Forms.AnchorStyles.Bottom Or System.Windows.Forms.AnchorStyles.Right), System.Windows.Forms.AnchorStyles)
		Me.chkInputShrink.AutoSize = True
		Me.chkInputShrink.Cursor = System.Windows.Forms.Cursors.Hand
		Me.chkInputShrink.Enabled = False
		Me.chkInputShrink.Location = New System.Drawing.Point(529, 215)
		Me.chkInputShrink.Margin = New System.Windows.Forms.Padding(0)
		Me.chkInputShrink.Name = "chkInputShrink"
		Me.chkInputShrink.Size = New System.Drawing.Size(133, 17)
		Me.chkInputShrink.TabIndex = 7
		Me.chkInputShrink.Text = "Shrink Variable Names"
		Me.chkInputShrink.UseVisualStyleBackColor = True
		'
		'chkInputBase62
		'
		Me.chkInputBase62.Anchor = CType((System.Windows.Forms.AnchorStyles.Bottom Or System.Windows.Forms.AnchorStyles.Right), System.Windows.Forms.AnchorStyles)
		Me.chkInputBase62.AutoSize = True
		Me.chkInputBase62.Cursor = System.Windows.Forms.Cursors.Hand
		Me.chkInputBase62.Enabled = False
		Me.chkInputBase62.Location = New System.Drawing.Point(408, 215)
		Me.chkInputBase62.Margin = New System.Windows.Forms.Padding(0)
		Me.chkInputBase62.Name = "chkInputBase62"
		Me.chkInputBase62.Size = New System.Drawing.Size(110, 17)
		Me.chkInputBase62.TabIndex = 6
		Me.chkInputBase62.Text = "Base62 Encoding"
		Me.chkInputBase62.UseVisualStyleBackColor = True
		'
		'btnInputPack
		'
		Me.btnInputPack.Anchor = CType((System.Windows.Forms.AnchorStyles.Bottom Or System.Windows.Forms.AnchorStyles.Left), System.Windows.Forms.AnchorStyles)
		Me.btnInputPack.Cursor = System.Windows.Forms.Cursors.Hand
		Me.btnInputPack.Enabled = False
		Me.btnInputPack.Location = New System.Drawing.Point(91, 211)
		Me.btnInputPack.Margin = New System.Windows.Forms.Padding(0)
		Me.btnInputPack.Name = "btnInputPack"
		Me.btnInputPack.Size = New System.Drawing.Size(75, 21)
		Me.btnInputPack.TabIndex = 3
		Me.btnInputPack.Text = "Pack"
		Me.btnInputPack.UseVisualStyleBackColor = True
		'
		'btnInputOpen
		'
		Me.btnInputOpen.Anchor = CType((System.Windows.Forms.AnchorStyles.Bottom Or System.Windows.Forms.AnchorStyles.Left), System.Windows.Forms.AnchorStyles)
		Me.btnInputOpen.Cursor = System.Windows.Forms.Cursors.Hand
		Me.btnInputOpen.Location = New System.Drawing.Point(10, 211)
		Me.btnInputOpen.Margin = New System.Windows.Forms.Padding(0)
		Me.btnInputOpen.Name = "btnInputOpen"
		Me.btnInputOpen.Size = New System.Drawing.Size(75, 21)
		Me.btnInputOpen.TabIndex = 2
		Me.btnInputOpen.Text = "Open"
		Me.btnInputOpen.UseVisualStyleBackColor = True
		'
		'txtInput
		'
		Me.txtInput.AcceptsReturn = True
		Me.txtInput.AcceptsTab = True
		Me.txtInput.AllowDrop = True
		Me.txtInput.Anchor = CType((((System.Windows.Forms.AnchorStyles.Top Or System.Windows.Forms.AnchorStyles.Bottom) _
					Or System.Windows.Forms.AnchorStyles.Left) _
					Or System.Windows.Forms.AnchorStyles.Right), System.Windows.Forms.AnchorStyles)
		Me.txtInput.Font = New System.Drawing.Font("Courier New", 9.75!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
		Me.txtInput.Location = New System.Drawing.Point(10, 15)
		Me.txtInput.Margin = New System.Windows.Forms.Padding(0)
		Me.txtInput.MaxLength = 10000000
		Me.txtInput.Multiline = True
		Me.txtInput.Name = "txtInput"
		Me.txtInput.ScrollBars = System.Windows.Forms.ScrollBars.Both
		Me.txtInput.Size = New System.Drawing.Size(652, 187)
		Me.txtInput.TabIndex = 1
		Me.txtInput.WordWrap = False
		'
		'grpOutput
		'
		Me.grpOutput.Controls.Add(Me.lblOutputRatio)
		Me.grpOutput.Controls.Add(Me.btnOutputCopy)
		Me.grpOutput.Controls.Add(Me.btnOutputSaveAs)
		Me.grpOutput.Controls.Add(Me.btnOutputClear)
		Me.grpOutput.Controls.Add(Me.btnOutputSave)
		Me.grpOutput.Controls.Add(Me.txtOutput)
		Me.grpOutput.Dock = System.Windows.Forms.DockStyle.Fill
		Me.grpOutput.Location = New System.Drawing.Point(0, 0)
		Me.grpOutput.Margin = New System.Windows.Forms.Padding(0)
		Me.grpOutput.Name = "grpOutput"
		Me.grpOutput.Padding = New System.Windows.Forms.Padding(0)
		Me.grpOutput.Size = New System.Drawing.Size(672, 207)
		Me.grpOutput.TabIndex = 10
		Me.grpOutput.TabStop = False
		Me.grpOutput.Text = "Output"
		'
		'lblOutputRatio
		'
		Me.lblOutputRatio.Anchor = CType((System.Windows.Forms.AnchorStyles.Bottom Or System.Windows.Forms.AnchorStyles.Right), System.Windows.Forms.AnchorStyles)
		Me.lblOutputRatio.Location = New System.Drawing.Point(340, 179)
		Me.lblOutputRatio.Margin = New System.Windows.Forms.Padding(0)
		Me.lblOutputRatio.Name = "lblOutputRatio"
		Me.lblOutputRatio.Size = New System.Drawing.Size(322, 17)
		Me.lblOutputRatio.TabIndex = 0
		Me.lblOutputRatio.TextAlign = System.Drawing.ContentAlignment.MiddleRight
		'
		'btnOutputCopy
		'
		Me.btnOutputCopy.Anchor = CType((System.Windows.Forms.AnchorStyles.Bottom Or System.Windows.Forms.AnchorStyles.Left), System.Windows.Forms.AnchorStyles)
		Me.btnOutputCopy.Cursor = System.Windows.Forms.Cursors.Hand
		Me.btnOutputCopy.Enabled = False
		Me.btnOutputCopy.Location = New System.Drawing.Point(172, 177)
		Me.btnOutputCopy.Margin = New System.Windows.Forms.Padding(0)
		Me.btnOutputCopy.Name = "btnOutputCopy"
		Me.btnOutputCopy.Size = New System.Drawing.Size(75, 21)
		Me.btnOutputCopy.TabIndex = 11
		Me.btnOutputCopy.Text = "Copy"
		Me.btnOutputCopy.UseVisualStyleBackColor = True
		'
		'btnOutputSaveAs
		'
		Me.btnOutputSaveAs.Anchor = CType((System.Windows.Forms.AnchorStyles.Bottom Or System.Windows.Forms.AnchorStyles.Left), System.Windows.Forms.AnchorStyles)
		Me.btnOutputSaveAs.Cursor = System.Windows.Forms.Cursors.Hand
		Me.btnOutputSaveAs.Enabled = False
		Me.btnOutputSaveAs.Location = New System.Drawing.Point(91, 177)
		Me.btnOutputSaveAs.Margin = New System.Windows.Forms.Padding(0)
		Me.btnOutputSaveAs.Name = "btnOutputSaveAs"
		Me.btnOutputSaveAs.Size = New System.Drawing.Size(75, 21)
		Me.btnOutputSaveAs.TabIndex = 10
		Me.btnOutputSaveAs.Text = "Save As"
		Me.btnOutputSaveAs.UseVisualStyleBackColor = True
		'
		'btnOutputClear
		'
		Me.btnOutputClear.Anchor = CType((System.Windows.Forms.AnchorStyles.Bottom Or System.Windows.Forms.AnchorStyles.Left), System.Windows.Forms.AnchorStyles)
		Me.btnOutputClear.Cursor = System.Windows.Forms.Cursors.Hand
		Me.btnOutputClear.Enabled = False
		Me.btnOutputClear.Location = New System.Drawing.Point(253, 177)
		Me.btnOutputClear.Margin = New System.Windows.Forms.Padding(0)
		Me.btnOutputClear.Name = "btnOutputClear"
		Me.btnOutputClear.Size = New System.Drawing.Size(75, 21)
		Me.btnOutputClear.TabIndex = 12
		Me.btnOutputClear.Text = "Clear"
		Me.btnOutputClear.UseVisualStyleBackColor = True
		'
		'btnOutputSave
		'
		Me.btnOutputSave.Anchor = CType((System.Windows.Forms.AnchorStyles.Bottom Or System.Windows.Forms.AnchorStyles.Left), System.Windows.Forms.AnchorStyles)
		Me.btnOutputSave.Cursor = System.Windows.Forms.Cursors.Hand
		Me.btnOutputSave.Enabled = False
		Me.btnOutputSave.Location = New System.Drawing.Point(10, 177)
		Me.btnOutputSave.Margin = New System.Windows.Forms.Padding(0)
		Me.btnOutputSave.Name = "btnOutputSave"
		Me.btnOutputSave.Size = New System.Drawing.Size(75, 21)
		Me.btnOutputSave.TabIndex = 9
		Me.btnOutputSave.Text = "Save"
		Me.btnOutputSave.UseVisualStyleBackColor = True
		'
		'txtOutput
		'
		Me.txtOutput.AcceptsReturn = True
		Me.txtOutput.AcceptsTab = True
		Me.txtOutput.AllowDrop = True
		Me.txtOutput.Anchor = CType((((System.Windows.Forms.AnchorStyles.Top Or System.Windows.Forms.AnchorStyles.Bottom) _
					Or System.Windows.Forms.AnchorStyles.Left) _
					Or System.Windows.Forms.AnchorStyles.Right), System.Windows.Forms.AnchorStyles)
		Me.txtOutput.Enabled = False
		Me.txtOutput.Font = New System.Drawing.Font("Courier New", 9.75!, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, CType(0, Byte))
		Me.txtOutput.Location = New System.Drawing.Point(10, 15)
		Me.txtOutput.Margin = New System.Windows.Forms.Padding(0)
		Me.txtOutput.MaxLength = 10000000
		Me.txtOutput.Multiline = True
		Me.txtOutput.Name = "txtOutput"
		Me.txtOutput.ScrollBars = System.Windows.Forms.ScrollBars.Both
		Me.txtOutput.Size = New System.Drawing.Size(652, 154)
		Me.txtOutput.TabIndex = 8
		Me.txtOutput.WordWrap = False
		'
		'dlgInputOpen
		'
		Me.dlgInputOpen.Filter = "JavaScript Files (*.js)|*.js|All files (*.*)|*.*"
		Me.dlgInputOpen.Title = "Choose a JavaScript File"
		'
		'dlgOutputSave
		'
		Me.dlgOutputSave.Filter = "JavaScript Files (*.js)|*.js|All files (*.*)|*.*"
		Me.dlgOutputSave.Title = "Save your Packed JavaScript"
		'
		'frmPacker3
		'
		Me.AutoScaleDimensions = New System.Drawing.SizeF(6.0!, 13.0!)
		Me.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font
		Me.ClientSize = New System.Drawing.Size(692, 473)
		Me.Controls.Add(Me.splPacker)
		Me.Icon = CType(resources.GetObject("$this.Icon"), System.Drawing.Icon)
		Me.MinimumSize = New System.Drawing.Size(700, 500)
		Me.Name = "frmPacker3"
		Me.Padding = New System.Windows.Forms.Padding(10)
		Me.Text = "Packer v3"
		Me.splPacker.Panel1.ResumeLayout(False)
		Me.splPacker.Panel2.ResumeLayout(False)
		Me.splPacker.ResumeLayout(False)
		Me.grpInput.ResumeLayout(False)
		Me.grpInput.PerformLayout()
		Me.grpOutput.ResumeLayout(False)
		Me.grpOutput.PerformLayout()
		Me.ResumeLayout(False)

	End Sub
	Friend WithEvents splPacker As System.Windows.Forms.SplitContainer
	Friend WithEvents grpInput As System.Windows.Forms.GroupBox
	Friend WithEvents btnInputClear As System.Windows.Forms.Button
	Friend WithEvents chkInputShrink As System.Windows.Forms.CheckBox
	Friend WithEvents chkInputBase62 As System.Windows.Forms.CheckBox
	Friend WithEvents btnInputPack As System.Windows.Forms.Button
	Friend WithEvents btnInputOpen As System.Windows.Forms.Button
	Friend WithEvents txtInput As System.Windows.Forms.TextBox
	Friend WithEvents grpOutput As System.Windows.Forms.GroupBox
	Friend WithEvents btnOutputSaveAs As System.Windows.Forms.Button
	Friend WithEvents btnOutputClear As System.Windows.Forms.Button
	Friend WithEvents btnOutputSave As System.Windows.Forms.Button
	Friend WithEvents txtOutput As System.Windows.Forms.TextBox
	Friend WithEvents btnOutputCopy As System.Windows.Forms.Button
	Friend WithEvents dlgInputOpen As System.Windows.Forms.OpenFileDialog
	Friend WithEvents dlgOutputSave As System.Windows.Forms.SaveFileDialog
	Friend WithEvents btnInputPaste As System.Windows.Forms.Button
	Friend WithEvents lblOutputRatio As System.Windows.Forms.Label

End Class
