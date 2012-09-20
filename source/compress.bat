@echo off
title compress js

rem yuicompressor's absolute path
set yuicompressor="F:\yuicompressor-2.4.7.jar"

rem js list file
set jslist=js.txt

rem outfile name
set outfile="WT-all-min.js"

echo merge into "_bak"...
for /f %%i in (%jslist%) do type %%i>>_bak & echo.>>_bak

echo compress "_bak" to %outfile%..
java -jar %yuicompressor% --type js --charset utf-8 -o %outfile% _bak

echo delete "_bak"!
del _bak

echo ok!
pause