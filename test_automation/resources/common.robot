Documentation    A resource file with reusable keywords and variables.
...
...               The system specific keywords created here form our own
...               domain specific language.

*** Settings ***
Library             RPA.Browser.Selenium
Library             RPA.FileSystem
Library             Process
Library             Telnet
Library             OperatingSystem
Library             Collections
#Library    RPA.Desktop

*** Variables ***
${OPEN_MENU}           css:.fa-folder-open
${DOWNLOAD_DIR}=       /home/ritika/Downloads/
${result}=             The gold and Log files match
${script_file}=        /home/ritika/scripts/graphdiff.py    
${TESTCASES_PATH}=     /home/ritika/workspaces/draw_again/draw_github/draw/tests/       
${TESTLOGGING_DIR}=    /home/ritika/testing
${default_json_file}=   graph.json 
${import_directory}=    import
${ILRTESTCASES_PATH}=    /home/ritika/workspaces/draw_again/draw_github/draw/ILRDependency
${draw_url}=             http://172.28.28.121:8080
${draw_title}=           DRAW v2.0.5 – Dependencies for a Risk Analysis on a Whiteboard
# Note modify it for a generic user name and password
${ts_link_with_pass}=    'https://rpande:Noida@1234@trickservice.itrust.lu/Api/data/customers'
*** Keywords ***
Open draw browser    
    open the draw home page
    load the previous history graph

open the draw home page
    Open Available Browser     ${draw_url}    alias=DrawBrowser
     
load the previous history graph
    Handle Alert     ACCEPT

open an excel file    
    [Arguments]                      ${load_file}
    Click Element                    ${OPEN_MENU}
    Wait Until Element Is Visible    id:open_file
    Choose File   accept_file        ${load_file}

save the graph generated
    Set Download Directory           ${DOWNLOAD_DIR}
    Click Button                     Save
    Wait For Download To Complete    graph.json

move log file
    [Arguments]    ${arg1}    ${arg2}
    RPA.FileSystem.Move File      ${arg1}    ${arg2}
    Sleep          5s
    
Wait For Download To Complete
    [Arguments]    ${file}
    Wait Until Keyword Succeeds    5sec    5sec  File Should Exist  ${DOWNLOAD_DIR}/${file}

compare files
    [arguments]    ${log_file}    ${gold_file}
    ${result}=    Run Process    python3    ${script_file}    --log_file    ${log_file}    --gold_file    ${gold_file}
    Should Be Equal    ${result.stdout}   The gold and Log files match

export the excel file    
    Click Element    dropdown-save
    Click Element    //button[normalize-space()='Export as excel (XSLS)']
    Wait For Download To Complete    AssetDsinExcel.xlsx

clear the whiteboard
    Click Element    dropdown-open
    Click Element    //button[normalize-space()='Clear working area']
    
import an excel file
    [Arguments]        ${load_file}
    Click Button        dropdown-open
    Click Element        //label[@class="dropdown-item"]
    Choose File   accept_import_file        ${load_file}

Create assets
    [Arguments]    ${name}    ${type}
    Click Element    //button[normalize-space()='Add asset']
    Wait Until Element Is Visible    css:Form[aria-label='Add asset']
    Input Text    fld_asset_name     ${name}    
    Select From List By Label    form_select_id    ${type}    
    Sleep    2s
    Click Button    //form[@aria-label="Add asset"]//button[@type='submit']
    Wait Until Element Is Not Visible    //form[@aria-label="Add asset"]