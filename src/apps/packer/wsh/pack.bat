@echo off
set pack=%windir%\system32\CScript //nologo %~d0%~p0pack.wsf
if "%1"=="" %pack% & goto END
%pack% %1 %2 > %~n1-p%~x1
:END
set pack=