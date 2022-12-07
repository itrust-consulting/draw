*** Settings *** 
Documentation   To Validate the Import excel feature
Library             RPA.Browser.Selenium
Library             RPA.FileSystem
Library    Telnet
Library    OperatingSystem
Library    Process
Library    Collections
Test Setup        Open draw browser
Test Template        Validate Open Excel ILR Dependency Sheets
Test Teardown        Close Browser 
Resource            ../resources/common.robot

*** Test Cases ***    load_file   compare_file    save_file
TestElec                  ILR-Elec-Dependencies.xlsx    ILR-Elec-Dependencies.json     graph26_elec.json
TestGas                   ILR-Gas-Dependencies.xlsx     ILR-Gas-Dependencies.json      graph26_gas.json    


*** Variables *** 

*** Keywords *** 
Validate Open Excel ILR Dependency Sheets 
    [Arguments]                    ${load_file}    ${compare_file}    ${save_file}
    open an excel file             ${ILRTESTCASES_PATH}/${load_file}
    save the graph generated       
    move log file                  ${DOWNLOAD_DIR}/graph.json      ${TESTLOGGING_DIR}/${save_file}
    compare files                  ${TESTLOGGING_DIR}/${save_file}    ${ILRTESTCASES_PATH}/${compare_file}   
    


