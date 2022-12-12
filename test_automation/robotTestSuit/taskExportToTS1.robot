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
${save_file1}=    graph23.json

${load_file2}=    tc24.xlsx
${save_file2}=    graph24.json

${customer}=        Demo UG
${riskAnalysis}=    Demo UG
${version}=         0.3

${ts_platform_quoted}=     'demo.trickservice.com'
${ts_platform}=             demo.trickservice.com

${filename}=        graph.json

** Test Cases ***    
Validate export picture to TS    
    import an excel file             ${TESTCASES_PATH}/${load_file1}
    export as picture on TS
    sync with TS
    save the graph generated with filename    ${filename}
    move log file       ${DOWNLOAD_DIR}/${filename}      ${TESTLOGGING_DIR}/${save_file1}
    compare files       ${TESTLOGGING_DIR}/${save_file1}    ${TESTCASES_PATH}/${save_file1}    

Validate export on TS and Load Snapshot from TS 
    import an excel file             ${TESTCASES_PATH}/${load_file2}
    export as snapshot on TS
    sync with TS
    clear the whiteboard
    load snapshot from TS
    sync with TS
    save the graph generated with filename    ${filename}
    move log file       ${DOWNLOAD_DIR}/${filename}      ${TESTLOGGING_DIR}/${save_file2}
    compare files       ${TESTLOGGING_DIR}/${save_file2}    ${TESTCASES_PATH}/${save_file2}    

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

