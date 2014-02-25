@echo off
set PATH=%PATH%;C:\Program Files (x86)\Git\cmd;C:\Program Files (x86)\Git\bin;C:\Program Files\Debugging Tools for Windows (x64);C:\Python27;C:\Program Files\nodejs\;C:\Users\SeanK\AppData\Roaming\npm;%~dp0
set NODE_PATH=C:\Users\SeanK\AppData\Roaming\npm\node_modules
if exist "C:\Program Files (x86)\Microsoft Visual Studio 9.0\VC\bin\vcvars32.bat" call "C:\Program Files (x86)\Microsoft Visual Studio 9.0\VC\bin\vcvars32.bat"
alias -f "C:\Program Files (x86)\Scripts\cmds.lst"
start keys.ahk
pushd "%~dp0"
