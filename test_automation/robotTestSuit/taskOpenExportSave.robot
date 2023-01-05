*** Settings *** 
Documentation       Validate the open excel, export excel and save json 
Library             RPA.Browser.Selenium
Library             RPA.FileSystem
Library             RPA.Excel.Files
Library             Telnet
Library             OperatingSystem
Library             Process
Library             Collections
Test Setup          Open draw browser
Test Template       Validate Load Export excel Open and Save Json file 
Test Teardown       Close Browser
Resource             ../resources/common.robot    

*** Test Cases ***    load_file       export_file       save_file
Test13                  tc13.xlsx     graph13.xlsx      graph13.json
Test14                  tc14.xlsx     graph14.xlsx      graph14.json

*** Variables *** 


*** Keywords *** 
Validate Load Export excel Open and Save Json file 
    [Arguments]                    ${load_file}    ${export_excel}    ${save_file}
    open an excel file             ${TESTCASES_PATH}/${load_file}
    export the excel file          
    Wait For Download To Complete    AssetDsinExcel.xlsx
    move log file                  ${DOWNLOAD_DIR}/AssetDsinExcel.xlsx      ${TESTLOGGING_DIR}/${export_excel}
    open an excel file             ${TESTLOGGING_DIR}/${export_excel}
    save the graph generated       
    move log file                  ${DOWNLOAD_DIR}/graph.json      ${TESTLOGGING_DIR}/${save_file}
    compare files                  ${TESTLOGGING_DIR}/${save_file}    ${TESTCASES_PATH}/${save_file}   
    
