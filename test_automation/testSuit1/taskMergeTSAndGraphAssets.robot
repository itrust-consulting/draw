*** Settings *** 
Documentation   To Validate the open excel feature
Library             RPA.Browser.Selenium
Library             RPA.FileSystem
Library    Telnet
Library    OperatingSystem
Library    Process
Library    Collections
Library    RPA.Desktop.Windows
#Library    ../customLibraries/selectAndMergeGraphNodes.py
Test Setup        Open draw browser
Test Teardown        Close Browser
Resource            ../resources/common.robot    

*** Variables *** 
${load_file}=    tc20.xlsx
${save_file}=    graph20_merge.json
${compare_file}=    graph20.json
${customer}=        ILR
${riskAnalysis}=    TestingILR
${version}=         0.1
${ts_platform_quoted}=     'trickservice.itrust.lu'
${ts_platform}=             trickservice.itrust.lu

*** Test Cases ***    
Validate merge TS and Graph assets    
    import an excel file             ${TESTCASES_PATH}/${load_file}
    ${title}=    Get Title
    Log    ${title}
    #Merge Graph With Ts Assets
    save the graph generated       
    move log file                  ${DOWNLOAD_DIR}/graph.json      ${TESTLOGGING_DIR}/${save_file}
    compare files                  ${TESTLOGGING_DIR}/${save_file}    ${TESTCASES_PATH}/${compare_file} 
    sync with TS 

*** Keywords *** 
sync with TS     
    Click Button    //button[@id='btn-sync']
    Wait Until Element Is Visible       //div[@data-role='apipicker']
    Click Button    //div[@data-role='apipicker']//button[normalize-space()=${ts_platform_quoted}]
    authenticate platform        ${ts_platform}    
    Switch Window    ${draw_title}     
    Sleep    2s
    enter customer details    ${customer}
    Sleep    2s
    enter risk details    ${riskAnalysis}
    Sleep    2s
    enter version details    ${version}
    Sleep    2s
    Capture Page Screenshot
    #Merge Graph With Ts Assets

     
Signin to ts    
    [Arguments]    ${username}    ${password}

authenticate platform
    [Arguments]    ${api_name}
    Execute Javascript    window.open(${ts_link_with_pass}, '_blank')

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

#https://demo.trickservice.com/Api/data/customers
#https://trickservice.itrust.lu/Api/data/customers