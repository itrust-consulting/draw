*** Settings *** 
Documentation       Validate the open excel and save graph 
Library             RPA.Browser.Selenium

#Library             SeleniumLibrary
Library             ../customLibraries/SelectAndMergeGraphNodes.py


*** Variables ***
${draw_url}=              http://172.17.223.103:8080

*** Test Cases *** 
Test1
    Use InheritSeleniumLibrary Open Browser Keyword

*** Keywords ***
Use InheritSeleniumLibrary Open Browser Keyword   
    open the draw home page    
    SelectAndMergeGraphNodes.Get Browser

open the draw home page
    RPA.Browser.Selenium.Open Available Browser           ${draw_url}    alias=DrawBrowser
    RPA.Browser.Selenium.Get Browser Capabilities

    ${CHROMEPREFS}             Create Dictionary  profile.default_content_setting_values.automatic_downloads=${2}
    Open Available Browser    ${URL}      ${BROWSER}      options=add_experimental_option("prefs", ${CHROMEPREFS})