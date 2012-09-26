@echo off
cmd /c start /MIN ..\database\launchDatabase.bat
sleep 1
cmd /c start /MAX ..\database\launchWebserver.bat
sleep 1
cmd /c start .\launcher.html