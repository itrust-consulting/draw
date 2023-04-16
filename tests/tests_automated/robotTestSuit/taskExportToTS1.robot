*** Settings *** 
Documentation       Validate the export to TS feature for load and export picture and load and export snapshot
Library             RPA.Browser.Selenium
Library             RPA.FileSystem
Library             Telnet
Library             OperatingSystem
Library             Process
Library             Collections
Library             RPA.Desktop.Windows
Library             String
Test Setup          Open draw browser
Test Teardown       Close Browser
Resource            ../resources/common.robot   

*** Variables *** 
${load_file1}=    tc23.xlsx
${save_file1}=    graph27.json

${load_file2}=    tc24.xlsx
${save_file2}=    graph24.json

${customer}=        Demo UG
${riskAnalysis}=    Demo UG
${version}=         0.3

${filename}=        graph.json

** Test Cases ***    
Validate export picture to TS    
    import an excel file             ${TESTCASES_PATH}/${load_file1}
    export as picture on TS
    sync with TS    ${customer}    ${riskAnalysis}    ${version}
    save the graph generated with filename    ${filename}
    move log file       ${DOWNLOAD_DIR}/${filename}      ${TESTLOGGING_DIR}/${save_file1}
    compare files       ${TESTLOGGING_DIR}/${save_file1}    ${TESTCASES_PATH}/${save_file1}    

Validate export on TS and Load Snapshot from TS 
    import an excel file             ${TESTCASES_PATH}/${load_file2}
    export as snapshot on TS
    sync with TS    ${customer}    ${riskAnalysis}    ${version}
    clear the whiteboard
    load snapshot from TS
    sync with TS    ${customer}    ${riskAnalysis}    ${version}
    save the graph generated with filename    ${filename}
    move log file       ${DOWNLOAD_DIR}/${filename}      ${TESTLOGGING_DIR}/${save_file2}
    compare files       ${TESTLOGGING_DIR}/${save_file2}    ${TESTCASES_PATH}/${save_file2}    


