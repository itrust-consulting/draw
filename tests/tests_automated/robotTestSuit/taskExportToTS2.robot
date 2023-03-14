*** Settings *** 
Documentation   To Validate the export and update dependency graph to TS 
Library             RPA.Browser.Selenium
Library             RPA.FileSystem
Library             Telnet
Library             OperatingSystem
Library             Process
Library             Collections
Library             RPA.Desktop.Windows
Library             String
Test Setup          Open draw browser
Test Teardown       Close Browser and reset dependency graph
Resource            ../resources/common.robot   

*** Variables *** 
${load_file3}=    tc25.xlsx
${save_file3}=    graph25.json
${load_file3_nodesonly}=    tc25_nodesonly.xlsx
${customer}=        Demo UG
${riskAnalysis}=    Demo UG
${version}=         0.3
${filename}=        graph.json

** Test Cases ***    
Validate load dependency graph from TS update and load the updated graph
    load dependency graph from TS
    sync with TS    ${customer}    ${riskAnalysis}    ${version}
    import an excel file    ${TESTCASES_PATH}/${load_file3}
    update dependency graph on TS
    sync with TS    ${customer}    ${riskAnalysis}    ${version}
    clear the whiteboard
    load dependency graph from TS
    sync with TS    ${customer}    ${riskAnalysis}    ${version}
    save the graph generated with filename    ${filename}
    move log file       ${DOWNLOAD_DIR}/${filename}      ${TESTLOGGING_DIR}/${save_file3}
    compare files       ${TESTLOGGING_DIR}/${save_file3}    ${TESTCASES_PATH}/${save_file3}    
    reset the dependency graph

*** Keywords *** 
reset the dependency graph
    open an excel file    ${TESTCASES_PATH}/${load_file3_nodesonly}
    update dependency graph on TS
    sync with TS    ${customer}    ${riskAnalysis}    ${version}

Close Browser and reset dependency graph
    reset the dependency graph
    Close Browser