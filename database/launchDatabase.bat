@echo off
title DB SERVER
mode con:lines=8
color 3E
@echo DB SERVER
@echo HIT CTRL-C TO QUIT
.\bin\mongod.exe -f .\dbOptions.conf
pause