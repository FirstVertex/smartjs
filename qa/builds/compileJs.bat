@echo off
rem default build is web
set curBuild=web
rem pass a parameter of web or android to trigger that build platform
if not (%1)==() set curBuild=%1
set scriptName=build.%curBuild%
rem pass p or anything as the 2nd parameter to use the prod build script
if not (%2)==() set scriptName=%scriptName%.prod
@echo on
node r.js -o %scriptName%.js
rem pause
rem xcopy %curBuild%\main.min.js ..\..\client\app\ /F /R /-Y
pause