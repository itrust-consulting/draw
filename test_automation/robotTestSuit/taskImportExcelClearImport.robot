*** Settings *** 
Documentation    Validate the Import excel in a row after clearning the white board
Library          RPA.Browser.Selenium
Library          RPA.FileSystem
Library          Telnet
Library          OperatingSystem
Library          Process
Library          Collections
Library          RPA.Desktop
Test Setup       Open draw browser
Test Template    Validate Import Excel Clear Import and Save EXCEL file
Test Teardown    Close Browser
Resource         ../resources/common.robot  

*** Test Cases ***    load_file       export_file       save_file
Test13                  tc13.xlsx     graph13.xlsx      graph13_1.json

*** Variables *** 


*** Keywords *** 
Validate Import Excel Clear Import and Save EXCEL file
    [Arguments]                    ${load_file}    ${export_excel}    ${save_file}
    open an excel file             ${TESTCASES_PATH}/${load_file}
    export the excel file  
    move log file                  ${DOWNLOAD_DIR}/AssetDsinExcel.xlsx      ${TESTLOGGING_DIR}/${import_directory}/${export_excel}
    clear the whiteboard
    import an excel file             ${TESTLOGGING_DIR}/${import_directory}/${export_excel}
    save the graph generated        
    move log file                  ${DOWNLOAD_DIR}/graph.json      ${TESTLOGGING_DIR}/${import_directory}/${save_file}
    compare files                  ${TESTLOGGING_DIR}/${import_directory}/${save_file}    ${TESTCASES_PATH}/${save_file}   
    

