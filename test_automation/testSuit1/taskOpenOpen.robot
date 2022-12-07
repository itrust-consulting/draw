*** Settings *** 
Documentation   To Validate the open excel feature
Library             RPA.Browser.Selenium
Library             RPA.FileSystem
Test Setup           Open draw browser
Test Template        Validate Load Reload Save file
Test Teardown        Close Browser
Resource             resources/common.robot    

*** Test Cases ***    load_file  load_file1  save_file
Test4                  tc4_step1.xlsx  tc4.xlsx      graph4.json

*** Keywords *** 
Validate Load Reload Save file 
    [Arguments]                    ${load_file}    ${load_file1}    ${save_file}
    open an excel file             ${TESTCASES_PATH}/${load_file}
    open an excel file             ${TESTCASES_PATH}/${load_file1}
    save the graph generated       
    move log file                  ${DOWNLOAD_DIR}/graph.json      ${TESTLOGGING_DIR}/${save_file}
    compare files                  ${TESTLOGGING_DIR}/${save_file}    ${TESTCASES_PATH}/${save_file}   
    
