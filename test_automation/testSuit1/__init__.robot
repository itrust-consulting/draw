*** Settings *** 
Documentation       To Validate the Import excel feature
Library             RPA.Browser.Selenium
Library             OperatingSystem
Library             Process
Test Setup          Clean the testing and download directory
  
*** Variables ***

*** Keywords *** 
Clean the testing and download directory
    Log     "Hello in suit"
    Run Process    rm     -rf    /home/ritika/testing/*    /home/ritika/Downloads/*
