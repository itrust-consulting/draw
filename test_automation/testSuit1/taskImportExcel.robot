*** Settings *** 
Documentation   To Validate the Import excel feature
Library             RPA.Browser.Selenium
Library             RPA.FileSystem
Library    Telnet
Library    OperatingSystem
Library    Process
Library    Collections
Test Setup        Open draw browser
Test Template        Validate Import and Save EXCEL file
Test Teardown        Close Browser
Resource            resources/common.robot    
Resource        ../resources/common.robot

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
${import_directory}=    import
*** Keywords *** 
Validate Import and Save EXCEL file 
    [Arguments]                    ${load_file}    ${save_file}
    import an excel file             ${TESTCASES_PATH}/${load_file}
    OperatingSystem.Create Directory                ${TESTLOGGING_DIR}/${import_directory}
    save the graph generated       
    move log file                  ${DOWNLOAD_DIR}/graph.json      ${TESTLOGGING_DIR}/${import_directory}/${save_file}
    compare files                  ${TESTLOGGING_DIR}/${import_directory}/${save_file}    ${TESTCASES_PATH}/${save_file}   
    


