*** Settings *** 
Documentation   To Validate the open excel feature
Library             RPA.Browser.Selenium
Library             RPA.FileSystem
Library    Telnet
Library    OperatingSystem
Library    Process
Library    Collections
Library    RPA.Desktop.Windows
Library    String
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
${filename}=        ILR_TestingILR_0.1.json
${save_file_sync}=       graph20_sync.json

*** Test Cases ***    
Validate merge TS and Graph assets    
    import an excel file             ${TESTCASES_PATH}/${load_file}
    save the graph generated       
    move log file                  ${DOWNLOAD_DIR}/graph.json      ${TESTLOGGING_DIR}/${save_file}
    compare files                  ${TESTLOGGING_DIR}/${save_file}    ${TESTCASES_PATH}/${compare_file} 
    sync with TS 
    Add the merging nodes in Sync Form
    synchronize and save file

*** Keywords *** 
sync with TS     
    Click Button    //button[@id='btn-sync']
    Wait Until Element Is Visible       //div[@data-role='apipicker']
    Click Button    //div[@data-role='apipicker']//button[normalize-space()=${ts_platform_quoted}]
    authenticate platform        ${ts_platform}    
    Switch Window    ${draw_title}     
    Sleep    3s
    enter customer details    ${customer}
    Sleep    3s
    enter risk details    ${riskAnalysis}
    Sleep    3s
    enter version details    ${version}
    Sleep    3s
    Capture Page Screenshot
    Wait Until Element Is Visible    //div[@data-role="form-sync-x"]
    
Add the merging nodes in Sync Form  
    create dict from csv           /home/ritika/workspaces/draw_again/draw_github/draw/test_automation/testSuit1/merge_data.csv     
    
    #${elt}=    Get WebElement    //div[@data-role="form-sync-x"]//ul[@name="difflist"]//li[1]//div
    #Log    ${elt.text}    
    #${count}=    Set Variable    1
    #Select From List By Label     //div[@data-role="form-sync-x"]//ul[@name="difflist"]//li[${count}]//select   Air Conditioning 
    #Click Element    //div[@data-role="form-sync-x"]//ul[@name="difflist"]//li[${count}]//input[@value="merge-tg"]
    #Click Element    //div[@data-role="form-sync-x"]//ul[@name="difflist"]//li[1]//label[normalize-space()="Merge with graph node"]
    #Click Element    //div[@data-role="form-sync-x"]//ul[@name="difflist"]//li[1]//label[4]

    ${listElements}=    Get WebElements    //div[@data-role="form-sync-x"]//ul[@name="difflist"]//li
    ${count}=    Set Variable    1
    FOR    ${element}    IN    @{listElements}
        ${elt1}=    Get WebElement    //div[@data-role="form-sync-x"]//ul[@name="difflist"]//li[${count}]//div   
        ${found}=    check if ts asset in dict      ${elt1.text}   
        Log    ${found}  
        IF    '${found}' == 'True'
            Log    ${elt1.text} 
            ${graph_asset}=    get graph asset from ts asset     ${elt1.text}
            ${graph_asset}=    Strip String    ${graph_asset}
            Click Element    //div[@data-role="form-sync-x"]//ul[@name="difflist"]//li[${count}]//label[4]
            ${selector_name}=    Catenate     SEPARATOR=_      SelectorType     ${count}
            Assign ID to Element    //div[@data-role="form-sync-x"]//ul[@name="difflist"]//li[${count}]//input[@value="merge-tg"]    ${selector_name}
            Select From List By Label     //div[@data-role="form-sync-x"]//ul[@name="difflist"]//li[${count}]//select   ${graph_asset}      
            Click Element    //div[@data-role="form-sync-x"]//ul[@name="difflist"]//li[${count}]//label[4]
            Execute Javascript    document.getElementById("${selector_name}").click();
            Sleep    1s            
        END
        ${count}=    Evaluate    ${count} + 1
    END
    Capture Page Screenshot
    
    
Signin to ts    
    [Arguments]    ${username}    ${password}

authenticate platform
    [Arguments]    ${api_name}
    Execute Javascript    window.open(${ts_link_with_pass}, '_blank')
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

synchronize and save file
    Click Button    //div[@data-role="form-sync-x"]//button[@type="submit"]
    Wait Until Element Is Not Visible    //div[@data-role="form-sync-x"]
    save the graph generated with filename    ${filename}
    move log file       ${DOWNLOAD_DIR}/${filename}      ${TESTLOGGING_DIR}/${save_file_sync}
    compare files       ${TESTLOGGING_DIR}/${save_file_sync}    ${TESTCASES_PATH}/${save_file_sync}    

#https://demo.trickservice.com/Api/data/customers
#https://trickservice.itrust.lu/Api/data/customers
