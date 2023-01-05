*** Settings *** 
Documentation   To Validate the compare estimations feature
Library             RPA.Browser.Selenium
Library             RPA.FileSystem
Library             Telnet
Library             OperatingSystem
Library             Process
Library             Collections
Library             RPA.Desktop.Windows
Library             String
Test Setup          Open draw browser with multiple downloads
Test Teardown       Close Browser 
Resource            ../resources/common.robot   


*** Variables *** 
${load_file}=    tc28.xlsx
${save_file}=    graph28.json

${customer}=        Demo UG
${riskAnalysis}=    TestingILR
${version}=         0.2

${filename}=        graph.json
${report_html_file}=    report.html
${report_html_test_file}=    report28.html

** Test Cases ***    
Validate compare estimations    
    import an excel file             ${TESTCASES_PATH}/${load_file}
    Click Button    //button[@id='btn-sync']
    sync with TS     ${customer}    ${riskAnalysis}    ${version}
    Wait Until Element Is Visible    //div[@data-role="form-sync-x"]
    Element Text Should Be     //div[@data-role="form-sync-x"]//ul//li    Everything synchronised with TRICK Service!
    Click Button    //div[@data-role="form-sync-x"]//form//button[text()="Cancel"]
    Wait Until Element Is Not Visible    //div[@data-role="form-sync-x"]
    compare estimations
    sync with TS    ${customer}    ${riskAnalysis}    ${version}
    ${orig wait} =	Set Selenium Implicit Wait	10 seconds	 
    Element Should Be Visible    //form[@aria-label="Comparison"]
    Set Selenium Implicit Wait	${orig wait}	
    Wait Until Element Contains   //form[@aria-label="Comparison"]//p    Done.    timeout=15s
    Wait for download of reports
    move log file    ${DOWNLOAD_DIR}/${report_html_file}    ${TESTLOGGING_DIR}/${report_html_file}
    # TODO
    #Alert Should Be Present
    #Wait For Download To Complete    report.csv
*** Keywords *** 
Wait for download of reports
    Set Download Directory           ${DOWNLOAD_DIR}
    Click Element    //form[@aria-label="Comparison"]//button[@type="submit"]
    Wait For Download To Complete    ${report_html_file}
    #Wait For Download To Complete    report.csv
  
Open draw browser with multiple downloads
    #TODO How to enable download of multiple files. Existing solutions do not work    
    Set Download Directory           ${DOWNLOAD_DIR}  
    ${CHROMEPREFS}             Create Dictionary    profile.default_content_setting_values.automatic_downloads=${2}
    Open Available Browser   ${draw_url}     alias=DrawBrowser    options=add_experimental_option("prefs", ${CHROMEPREFS})
    load the previous history graph

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

compare estimations
    Click Element    //button[@id="btn-sync"]/parent::div//button[@data-toggle="dropdown"]
    Click Element    //button[normalize-space()="Compare estimations"]
    sleep between ts forms
    

