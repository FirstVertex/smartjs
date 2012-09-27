@echo off
set curBuild=web
if not (%1)==() set curBuild=%1
set scriptName=build.%curBuild%
if not (%2)==() set scriptName=%scriptName%.prod
@echo on
node r.js -o %scriptName%.js
pause
xcopy %curBuild%\main.min.js ..\..\client\app\ /F /R /-Y
pause