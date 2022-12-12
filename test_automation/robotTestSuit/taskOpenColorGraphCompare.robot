*** Settings *** 
Documentation       Validate the coloring of edges based on probability 
Library             RPA.Browser.Selenium
Library             RPA.FileSystem
Library             Telnet
Library             OperatingSystem
Library             String
Library             Process
Library             Collections
Library             RPA.Desktop
Test Setup          Open draw browser
Test Template       Validate Load Color Compare Save EXCEL file
Test Teardown       Close Browser
Resource            ../resources/common.robot    

*** Test Cases ***    load_file    save_file
Test1                  tc15.xlsx         graph15.json

*** Variables *** 
${IMAGE_COMPARATOR_COMMAND}   /usr/local/Cellar/imagemagick/7.0.7-3/bin/convert __REFERENCE__ __TEST__ -metric RMSE -compare -format  "%[distortion]" info:

*** Keywords *** 
Validate Load Color Compare Save EXCEL file 
    [Tags]                         INCOMPLETE
    [Arguments]                    ${load_file}    ${save_file}
    open an excel file             ${TESTCASES_PATH}/${load_file}
    color the graph edges
    save the graph generated       
    move log file                  ${DOWNLOAD_DIR}/graph.json      ${TESTLOGGING_DIR}/${save_file}
    compare files                  ${TESTLOGGING_DIR}/${save_file}    ${TESTCASES_PATH}/${save_file}   
    
Color the graph edges
    #Set Screenshot Directory        ${TESTLOGGING_DIR}/screenshots
    Click Button                    css:Button[title='Color the edges based on their probability']
    Capture Page Screenshot
    # Need imagemagic for comparison https://blog.codecentric.de/robot-framework-compare-images-screenshots
    #Compare Images    /home/ritika/selenium-screenshot-1.png    ${TESTLOGGING_DIR}/screenshots/selenium-screenshot-1.png        0.1

Compare Images
   [Arguments]      ${Reference_Image_Path}    ${Test_Image_Path}    ${Allowed_Threshold}
   ${TEMP}=         Replace String     ${IMAGE_COMPARATOR_COMMAND}    __REFERENCE__     ${Reference_Image_Path}
   ${COMMAND}=      Replace String     ${TEMP}    __TEST__     ${Test_Image_Path}
   Log              Executing: ${COMMAND}
   ${RC}            ${OUTPUT}=     Run And Return Rc And Output     ${COMMAND}
   Log              Return Code: ${RC}
   Log              Return Output: ${OUTPUT}
   ${RESULT}        Evaluate    ${OUTPUT} < ${Allowed_Threshold}
   Should be True   ${RESULT}