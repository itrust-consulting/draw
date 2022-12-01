@echo off

REM The executable that shall be run in order to display "index.html".
REM Note that this must point to a Chrome binary, or any program that can be invoked with the same parameters.
REM If the executable is not in the system path, the full path needs to be specified here.
SET BROWSER=chrome

REM Don't modify beyond this point
REM ----------------------------------------------------------

CD /d %~dp0
START %BROWSER% --allow-file-access-from-files  --app=file:///%cd%/index.html --user-data-dir=%cd%/.browserdata --no-first-run
