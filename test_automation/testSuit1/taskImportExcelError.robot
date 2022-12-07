*** Settings *** 
Documentation   To Validate the open excel feature
Library             RPA.Browser.Selenium
Library             RPA.FileSystem
Library    Telnet
Library    OperatingSystem
Library    Process
Library    Collections
Test Setup        Open draw browser
Test Template        Validate Import Excel Error
Test Teardown        Close Browser
Resource            resources/common.robot    

*** Test Cases ***    load_file    save_file
Test5        tc5.xlsx      Error: The excel File "tc5.xlsx" does not have a sheet with name "Dependency" or the sheet is empty. Try with a different file.      
Test6        tc6.xlsx      Error: The imported excel file with worksheet "Dependency" does not have AssetList in first Column or AssetType in second column 
Test7        tc7.xlsx      Error: The imported excel file with worksheet "Dependency" does not have AssetList in first Column or AssetType in second column
Test8        tc8.xlsx      Error: The excel file with worksheet "Dependency" has an asset with empty label in AssetList Column.
Test9        tc9.xlsx      Error: The excel file with worksheet "Dependency" has an assetType (ComplianceNA) which is not in list of supported list. (Business process,Compliance,Financial,Information,Immaterial Value,Outsourced service,Site,Software,Hardware,Network,Service,Personnel,System).
Test10       tc10.xlsx     Error: The excel file with worksheet "Dependency" has an asset value ( ABCD ) which is not a number. Either do not specify anything or specify a number(probability) between 0 and 1 
Test11       tc11.xlsx     Error: The excel file with worksheet "Dependency" has an asset value ( 12 ) which is not a number between 0 and 1. Specify a valid probability.              

*** Variables *** 

*** Keywords *** 
Validate Import Excel Error 
    [Arguments]                    ${load_file}    ${error_string}
    import an excel file             ${TESTCASES_PATH}/${load_file}
    Wait Until Element Is Visible    //div[@id='modalError']
    ${error_text}=    Get Text       //div[@id='modalError']//small[@class='text-muted']
    Log    ${error_text}
    Should Match    ${error_text}    ${error_string}
    
