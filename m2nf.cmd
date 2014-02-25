@echo off
goto start

With this script properly installed you can right click a group of files and select Send To | A New Folder and 
much like Send To | Compressed (zipped) folder, it it will create a folder with the name of the first selected
item and then move all the items selected into that new folder.

To set up:

- Open this folder in explorer, use "start ." from a command console.
- Open the SendTo folder in explorer, Win-R "shell:sendto"
- right click drag this script to the SendTo folder
- select "Create Shortcut here"
- Rename short cut to what you want to see in the menu (ex. "A New Folder")

:start
set dir=%~dp1%~n1
md "%dir%"
:loop
if "%~1" neq "" (
  move "%~1" "%dir%\"
  shift
  goto :loop
)