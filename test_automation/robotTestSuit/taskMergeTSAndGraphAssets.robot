*** Settings *** 
Documentation       Validate merging of TS and graph assets 
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
${load_file}=        tc20.xlsx
${save_file}=        graph20_merge.json
${compare_file}=     graph20.json
${customer}=         Demo UG
${riskAnalysis}=     TestingILR
${version}=          0.1
${filename}=                Demo UG_TestingILR_0.1.json
${save_file_sync}=          graph20_sync.json
${graph_merge_csv}=         tc20.csv

*** Test Cases ***    
Validate merge TS and Graph assets    
    import an excel file           ${TESTCASES_PATH}/${load_file}
    save the graph generated       
    move log file                  ${DOWNLOAD_DIR}/graph.json      ${TESTLOGGING_DIR}/${save_file}
    compare files                  ${TESTLOGGING_DIR}/${save_file}    ${TESTCASES_PATH}/${compare_file} 
    sync with TS after selecting api    ${customer}    ${riskAnalysis}    ${version}
    Add the merging nodes in Sync Form
    synchronize and save file

*** Keywords *** 
sync with TS after selecting api  
    [Arguments]    ${customer}    ${riskAnalysis}    ${version}
    Click Button    //button[@id='btn-sync']       
    sync with TS     ${customer}    ${riskAnalysis}    ${version}
    Capture Page Screenshot
    Wait Until Element Is Visible    //div[@data-role="form-sync-x"]
    
Add the merging nodes in Sync Form  
    create dict from csv           ${TESTCASES_PATH}/${graph_merge_csv}     
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
    

synchronize and save file
    Click Button    //div[@data-role="form-sync-x"]//button[@type="submit"]
    Wait Until Element Is Not Visible    //div[@data-role="form-sync-x"]
    save the graph generated with filename    ${filename}
    move log file       ${DOWNLOAD_DIR}/${filename}      ${TESTLOGGING_DIR}/${save_file_sync}
    compare files       ${TESTLOGGING_DIR}/${save_file_sync}    ${TESTCASES_PATH}/${save_file_sync}    
