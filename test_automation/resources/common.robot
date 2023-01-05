Documentation    A resource file with reusable keywords and variables.

*** Settings ***
Library             RPA.Browser.Selenium
Library             RPA.FileSystem
Library             Process
Library             Telnet
Library             OperatingSystem
Library             Collections
Library             RPA.Salesforce
Library             RPA.Tables


*** Variables ***
${OPEN_MENU}             css:.fa-folder-open
${DOWNLOAD_DIR}=         ${EXECDIR}/downloads
${result}=               The gold and Log files match
${script_file}=          ${EXECDIR}/tests/graphdiff.py    
${TESTCASES_PATH}=       ${EXECDIR}/tests      
${TESTLOGGING_DIR}=      ${EXECDIR}/testlogging
${default_json_file}=    graph.json 
${import_directory}=     import
${ILRTESTCASES_PATH}=    ${EXECDIR}/ILRDependency
${draw_url}=              %{URL}
${draw_title}=            DRAW v2.0.5 – Dependencies for a Risk Analysis on a Whiteboard
${import_directory}=      import
${ts_platform_quoted}=     'demo.trickservice.com'
${ts_platform}=             demo.trickservice.com
# Link to demo with password needed for authentication
${ts_demo_link_with_pass}=    'https://drawtesting:DrawTesting123@demo.trickservice.com/Api/data/customers'

*** Keywords ***
Open draw browser       
    open the draw home page    
    load the previous history graph    

open the draw home page
    Set Download Directory           ${DOWNLOAD_DIR}
    Open Available Browser           ${draw_url}    alias=DrawBrowser
    setup the log directory

setup the log directory
    OperatingSystem.Create Directory    ${TESTLOGGING_DIR}/${import_directory} 
     
load the previous history graph
    Handle Alert     ACCEPT

open an excel file    
    [Arguments]                      ${load_file}
    Click Element                    ${OPEN_MENU}
    Wait Until Element Is Visible    id:open_file
    Choose File   accept_file        ${load_file}

save the graph generated    
    Click Button                     Save
    Wait For Download To Complete    graph.json

save the graph generated with filename
    [Arguments]                      ${filename}
    Click Button                     Save
    Wait For Download To Complete    ${filename}

move log file
    [Arguments]    ${arg1}    ${arg2}
    RPA.FileSystem.Move File          ${arg1}    ${arg2}
    Sleep          1s
    
Wait For Download To Complete
    [Arguments]    ${file}
    Wait Until Keyword Succeeds    5sec    5sec  File Should Exist  ${DOWNLOAD_DIR}/${file}

compare files
    [arguments]    ${log_file}    ${gold_file}
    ${result}=     Run Process    python3    ${script_file}    --log_file    ${log_file}    --gold_file    ${gold_file}
    Should Be Equal    ${result.stdout}   The gold and Log files match

export the excel file    
    Click Element    dropdown-save
    Click Element    //button[normalize-space()='Export as excel (XSLS)']
    Wait For Download To Complete    AssetDsinExcel.xlsx

export as picture on TS
    Click Element    dropdown-save
    Click Element    //button[normalize-space()='Export as picture on TS']
    Sleep    2s
     
export as snapshot on TS
    Click Element    dropdown-save
    Click Element    //button[normalize-space()='Export as snapshot on TS']
    Sleep    2s

clear the whiteboard
    Click Element    dropdown-open
    Click Element    //button[normalize-space()='Clear working area']
    Handle clear alert

load dependency graph from TS
    Click Button        dropdown-open
    Click Element       //button[normalize-space()="Load dependency graph from TS"]

update dependency graph on TS
    Click Element    dropdown-save
    Click Element    //button[normalize-space()='Update dependency graph on TS']
    Sleep    2s

Handle clear alert
    Handle Alert     ACCEPT

load snapshot from TS
    Click Button        dropdown-open
    Click Element       //button[normalize-space()="Load snapshot from TS"]
    
import an excel file
    [Arguments]        ${load_file}
    Click Button        dropdown-open
    Click Element        //label[@class="dropdown-item"]
    Choose File           accept_import_file        ${load_file}

Create assets
    [Arguments]    ${name}    ${type}
    Click Element    //button[normalize-space()='Add asset']
    Wait Until Element Is Visible    css:Form[aria-label='Add asset']
    Input Text    fld_asset_name     ${name}    
    Select From List By Label    form_select_id    ${type}    
    Sleep    2s
    Click Button    //form[@aria-label="Add asset"]//button[@type='submit']
    Wait Until Element Is Not Visible    //form[@aria-label="Add asset"]

# Creates a dcitionary from CSV file used for merging assets
create dict from csv 
    [Arguments]    ${file}
    &{ts_graph_merging_asset_dict} =    Create Dictionary
    Set Suite Variable    ${ts_graph_merging_asset_dict}

    ${table}=    Read table from CSV    ${file}
    ${rows}  ${columns}=    Get table dimensions    ${table}

    FOR    ${index}    IN RANGE    ${rows}
        ${row}=    Get table row    ${table}    ${index}    as_list=True
        Set To Dictionary    ${ts_graph_merging_asset_dict}    ${row}[0]    ${row}[1]  
        Log    ${row}
    END


check if ts asset in dict 
    [Arguments]    ${ts_asset_name}
    ${dict_cont}=	Run Keyword And Ignore Error    Get From Dictionary	${ts_graph_merging_asset_dict}    ${ts_asset_name}	       
    ${status_value}=    Convert To List    ${dict_cont}
    Log    ${status_value}

    IF    '${status_value}[0]' == 'PASS'
        Return From Keyword    True
    ELSE
        Return From Keyword    False
    END

get graph asset from ts asset    
    [Arguments]    ${ts_asset_name}
    ${dict_cont}=    Get From Dictionary	${ts_graph_merging_asset_dict}    ${ts_asset_name}	
    Return From Keyword     ${dict_cont}

# Provide sleep between loading trickservice app and appearing of customer form,
# Risk Analysis, version
sleep between ts forms 
    Sleep     10s

sync with TS
    [Arguments]    ${customer}    ${riskAnalysis}    ${version}
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