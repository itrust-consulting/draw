*** Settings *** 
Documentation   To Validate the open excel feature
Library             RPA.Browser.Selenium
Library             RPA.FileSystem
Library    Telnet
Library    OperatingSystem
Library    Process
Library    Collections
Test Setup        Open draw browser
Test Template        Validate Load and Save EXCEL file
Test Teardown        Close Browser
Resource            resources/common.robot    

*** Test Cases ***    load_file    save_file
Test1                  tc1.xlsx         graph1.json
Test2                  tc2.xlsx         graph2.json
Test12                 tc12.xlsx       graph12.json
Test17                 tc17.xlsx       graph17.json
Test18                 tc18.xlsx        graph18.json
Test19                 tc19.xlsx        graph19.json
Test20                 tc20.xlsx        graph20.json
Test23                 tc23.xlsx        graph23.json
Test22_xls             tc22.xls         graph22.json
Test22_xlsm            tc22.xlsm        graph22_1.json

*** Variables *** 

*** Keywords *** 
Validate Load and Save EXCEL file 
    [Arguments]                    ${load_file}    ${save_file}
    open an excel file             ${TESTCASES_PATH}/${load_file}
    save the graph generated       
    move log file                  ${DOWNLOAD_DIR}/graph.json      ${TESTLOGGING_DIR}/${save_file}
    compare files                  ${TESTLOGGING_DIR}/${save_file}    ${TESTCASES_PATH}/${save_file}   
    
