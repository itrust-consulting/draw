*** Settings *** 
Documentation       Validate the Import excel with merging feature
Library             RPA.Browser.Selenium
Library             RPA.FileSystem
Library             Telnet
Library             OperatingSystem
Library             Process
Library             Collections
Library             RPA.Desktop
Library             String
Library             ../customLibraries/GraphInformation.py
Test Setup          Open draw browser
Test Teardown       Close Browser
Resource            ../resources/common.robot  


*** Variables *** 
${import_directory}=    import
${first_file_name}=     tc16_step1.xlsx
${second_file_name}=    tc16.xlsx
${logfile_name}=    graph16.json

*** Test Cases ***    
Validate Import with merge        
    import an excel file    ${TESTCASES_PATH}/tc16_step1.xlsx
    Wait Until Element Is Not Visible    id:accept_file
    Create assets           Asset1        Information
    import an excel file    ${TESTCASES_PATH}/tc16.xlsx
    save the graph generated    
    move log file    ${DOWNLOAD_DIR}/${default_json_file}    ${TESTLOGGING_DIR}/${logfile_name}
    compare files with error    ${TESTLOGGING_DIR}/${logfile_name}   ${TESTCASES_PATH}/${logfile_name}
    Capture Page Screenshot
    check nodes and edges of graph    ${TESTLOGGING_DIR}/${logfile_name}    5     2
    

*** Keywords ***
compare files with error
    [arguments]    ${log_file}    ${gold_file}
    ${result}=    Run Process    python3    ${script_file}    --log_file    ${log_file}    --gold_file    ${gold_file}
    ${line_with_string}=    Get Lines Containing String    ${result.stdout}   information
    Should Be Equal    ${line_with_string}    The graph diff script cannot map the graphs with multiple nodes with same name and type information

check nodes and edges of graph    
    [Arguments]    ${json_file}    ${nodes_expected}    ${edges_expected}
    ${nodes}=    Get Graph Nodes    ${json_file}
    ${edges}=    Get Graph Edges    ${json_file}
    Should Be Equal As Integers    ${nodes_expected}    ${nodes}
    Should Be Equal As Integers    ${edges_expected}    ${edges}    
  

