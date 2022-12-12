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

${ts_platform_quoted}=     'demo.trickservice.com'
${ts_platform}=             demo.trickservice.com

${filename}=        graph.json

** Test Cases ***    
Validate load dependency graph from TS update and load the updated graph
   load dependency graph from TS
   sync with TS
    import an excel file    ${TESTCASES_PATH}/${load_file3}
    update dependency graph on TS
    sync with TS
    clear the whiteboard
    load dependency graph from TS
    sync with TS
    save the graph generated with filename    ${filename}
    move log file       ${DOWNLOAD_DIR}/${filename}      ${TESTLOGGING_DIR}/${save_file3}
    compare files       ${TESTLOGGING_DIR}/${save_file3}    ${TESTCASES_PATH}/${save_file3}    
    reset the dependency graph

*** Keywords *** 
sync with TS     
    Wait Until Element Is Visible       //div[@data-role='apipicker']
    Click Button    //div[@data-role='apipicker']//button[normalize-space()=${ts_platform_quoted}]
    authenticate platform        ${ts_platform}    
    Switch Window    ${draw_title}     
    sleep between ts forms
    enter customer details    ${customer}
    sleep between ts forms
    enter risk details    ${riskAnalysis}
    sleep between ts forms
    enter version details    ${version}
    sleep between ts forms

authenticate platform
    [Arguments]    ${api_name}
    Execute Javascript    window.open(${ts_demo_link_with_pass}, '_blank')
    Capture Page Screenshot

enter customer details   
    [Arguments]    ${customer}
    Wait Until Element Is Visible    //form[@aria-label="Customer"]
    Select From List By Label    //form[@aria-label="Customer"]//select[@name="customerId"]    ${customer}
    Click Button    //form[@aria-label="Customer"]//button[@type="submit"]
    
enter risk details  
    [Arguments]    ${riskAnalysis}
    Wait Until Element Is Visible    //form[@aria-label="Analysis"]
    Select From List By Label    //form[@aria-label="Analysis"]//select[@name="analysisId"]    ${riskAnalysis}
    Click Button    //form[@aria-label="Analysis"]//button[@type="submit"]

enter version details   
    [Arguments]     ${version}
     Wait Until Element Is Visible    //form[@aria-label="Version"]
    Select From List By Label    //form[@aria-label="Version"]//select[@name="versionId"]    ${version}
    Click Button    //form[@aria-label="Version"]//button[@type="submit"]

reset the dependency graph
    open an excel file    ${TESTCASES_PATH}/${load_file3_nodesonly}
    update dependency graph on TS
    sync with TS

Close Browser and reset dependency graph
    reset the dependency graph
    Close Browser