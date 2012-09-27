node r.js -o build.%1.js
pause
xcopy %1\main.min.js ..\..\client\app\ /F /R /-Y
pause