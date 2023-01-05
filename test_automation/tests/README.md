#  README (Testing)

## Introduction
This directory provides a collection of files which can be used during manual testing of the tool. Note an automated testing of the tool is not available as of now and hence manual testing is relied upon. 

## Details
Following is a summary of tests that can be performed and their expected outcomes.
Before detailing the tests the Test case validation step is covered which is used in
majority of the testcases for verification purpose.

### Test case validation step
This validation step verifies that the saved JSON file (log.json) corresponding to a dependency graph created by the tool is similar as an expected JSON file (graph.json). Similarity of two dependency graph json files implies that the two files are matched based on corresponding asset name and asset types. This comparison compares graphs after mapping corresponding IDs of graph nodes and graph edges comparison.
Before validation ensure that
- Ensure that graphdiff.py is present in the directory where tests are performed.
- Ensure python3 is installed in the system where testing is performed and is added to PATH env variable.

#### Steps
- Save the graph as JSON
- Rename this JSON file as log.json and move this file to the test log directory
- Run the following verification command by changing the path/name of graph.json and log.json file appropriately.

   `$ python3 graphdiff.py –gold_file graph.json –log_file log.json`

    `The gold and Log files match. ` 

    The above output signifies that the log.json and graph.json are similar. 
    If the file paths are incorrect correct the paths. If the following output is returned it signifies the files do not match and the test fails as a result.

   `The gold and Log files do not match.`

#### Testcases

|TestcaseID | Test Step(s)             | Validation Step            | ExpectedResult  |
|:--------- | :------------------------|:---------------------------|:----------------|
|TC_01      |  Open-> tc1.xlsx Save: log1.json   | graphdiff log1.json graph1.json        | files must match     |
|TC_02      | Open->tc2.xlsx Save: log2.json | graphdiff log2.json graph2.json | files must match
|TC_03      | Open:tc3_step1.xlsx Open:Import Excel -> tc3.xlsx Save: log3.json | graphdiff log3.json graph3.json | files must match |
|TC_04      | Open->tc4_step1.xlsx Open-> tc4.xlsx Save: log4.json | graphdiff log4.json graph4.json | files must match 
|TC_05      | Open->tc5.xlsx or Import Excel -> tc5.xlsx | **Error** The excel File "test3.xlsx" does not have a sheet with name "Dependency" or the sheet is empty. Try with a different file. | Error expected
|TC_06      | Open->tc6.xlsx or Import Excel -> tc6.xlsx | **Error** The imported excel file with worksheet "Dependency" does not have AssetList in first Column or AssetType in second column | Error expected
|TC_07      | Open->tc7.xlsx or  Import Excel -> tc7.xlsx | **Error** Both the Open and Import Excel operations should generate error as the excel sheet does not have a AssetType keyword in the second column.| Error expected
|TC_08      | Open->tc8.xlsx or Import Excel -> tc8.xlsx | **Error** The excel file with worksheet "Dependency" has an asset with empty label in AssetList Column. | Error expected
|TC_09      | Open->tc9.xlsx or  Import Excel -> tc9.xlsx | **Error**  The excel file with worksheet "Dependency" has an assetType (ComplianceNA) which is not in list of supported list. (Business process, Compliance, Financial, Information, Immaterial Value, Outsourced service, Site, Software, Hardware, Network, Service,Personnel, System). | Error expected
|TC_10      | Open->tc10.xlsx or Import Excel -> tc10.xlsx | **Error** The excel file with worksheet "Dependency" has an asset value ( ABCD ) which is not a number. Either do not specify anything or specify a number(probability) between 0 and 1 | Error expected
|TC_11      | Open->tc11.xlsx or Import Excel -> tc11.xlsx |  **Error** The excel file with worksheet "Dependency" has an asset value ( 12 ) which is not a number between 0 and 1. Specify a valid probability. | Error expected
|TC_12      | Open->tc12.xlsx Save : log12.json or Clear working area Import Excel -> tc12.xlsx Save: log12.json | graphdiff log12.json graph12.json | files must match 
|TC_13      | Step1: Import Excel->tc13.xlsx Export as excel (log13.xlsx) or Open -> tc13.xlsx Export as excel (log13.xlsx) <br> Step2: Clear working area Import Excel -> log13.xlsx Save the graph as : log13.json or Open Excel -> log13.xls Save-> log13.json | Step1: Creates a graph from excel file <br> Step2: graphdiff log13.json graph13.json | files must match 
|TC_14      | Import Excel->tc14.xlsx Export as excel -> log14.json or Open -> tc14.xlsx Export as excel -> log14.json | graphdiff log14.json graph14.json | files must match 
|TC_15      | Import Excel->tc15.xlsx or Open -> tc15.xlsx Click the tool with arrows on all sides. “Color edges based on their probability”  (Before the help menu) Save : log15.json | The graph has colored edges and graphdiff log15.json graph15.json | files must match 
|TC_16      | Step1: Import Excel->tc16_step1.xlsx <br> Step2: Add asset (name: Asset1, type: Information) <br> Step3: Import Excel tc16.xlsx Save: log16.json | Step1: Creates a graph with 2 Nodes Asset1 and Asset2. <br> Step2: At this point there are 2 assets with name Asset1 and type Information <br> Step3: The tool should not throw any error and the asset3 should be connected with any of the assets Asset1 already present in graph. There are 5 assets and 2 edges in graph after import. | The graph should have 5 nodes and 2 edges. One edge connects Asset1 with asset3 and other asset3 with asset4.|
|TC_17      | Import Excel->tc17.xlsx  Save : log17.json Or Open -> tc17.xlsx Save: log17.json | Graph must be created without error and Asset1 with type compliance must get created. graphdiff log17.json graph17.json | files must match 
|TC_18      | Import Excel:tc18.xlsx Save : log18.json Or Open:tc18.xlsx Save : log18.json | Graph must be created without error and Asset1 with type compliance must get created and connected with other nodes. Asset1 financial must be ignored. graphdiff log18.json graph18.json | files must match 
|TC_19      | Import Excel:tc19.xlsx Save :log19.json Or Open:tc19.xlsx Save :log19.json | Graph must be created without error for asset types, Also there must be two nodes asset1 and Asset1. graphdiff log19.json graph19.json | files must match 
|TC_20      | Step1: Import Excel->tc20.xlsx Save: log20.json Or Open -> tc20.xlsx Save: log20.json<br>Step2: Sync with Trick Service (trickservice.itrust.lu) Choose Customer: ILR Risk analysis: TestingILR Version: 0.1 Step3: Select Merge with Graph Nodes for following assets and IGNORE the rest:<br> TS Asset -> Merge with graph node <br> ILR_GAS_Air conditioning -> Air Conditioning <br> Bad data detection system - electricity -> Bad data detection system <br> Allocation management - gas  -> Allocation management <br> Connection facilities Transport - gas -> Connection facilities Transport <br> Connection Point – gas   -> Connection Point <br> Grid Development & Services - electricity -> Grid Development & Services <br> Customer Management - electricity  -> Customer Management <br> Balancing offer and demand - electricity -> Balancing offer and demand <br> Click : Synchronize Save: log20_sync.json  | graphdiff log20.json graph20.json and graphdiff log20_sync.json graph20_sync.json | files must match
|TC_21      | Step1: Import Excel->tc21.xlsx Or Open -> tc21.xlsx <br> Step2: Sync with Trick Service (trickservice.itrust.lu) <br> Choose Customer: ILR RiskAnalysis: TestingILR <br> Version: 0.1 <br> Step3: Select Merge with Graph Nodes for an asset in Trick Service with another in graph | Try to select and deselect various combination of assets | Being able to select a graph asset after de selecting it from another trick service asset selection. 
|TC_22      | Import Excel->tc22.xlsm Save: log22_xlsm.json Or Open -> tc22.xlsm Save: log22_xls.json | graphdiff log22_xlsm.json graph18.json and graphdiff log22_xls.json graph18.json | files must match
|TC_23      | Step1: Import Excel->tc23.xlsx Or Open -> tc23.xlsx Save: log23.json Export as picture on TS: Connect: demo.trickservice.lu select Demo UG. Version 0.3 <br> Step2: Login to demo: demo.trickservice.com <br> Select Analysis: Demo UG. <br> Goto: Open: <br> Goto: Settings: Export -> Word report <br> Choose the default: Internal Template: <br> Click Export button. <br> Rename the saved exported File as   DemoTestingTemplate.docx<br> Step3:Open DemoTestingTemplate.docx Enable editing. Add any section in the Template.docx. Insert a BookMark named TS_DependencyGraph (TS_DependencyGraph) in any section in the document. Save the file. <br> Step4: Goto TrickService again. Export Word Report again. Specify External template this time. In this input box specify the path of DemoTestingTemplate.docx. Save and verify the exported docx file. <br> Exported file now contains the section where the bookmark was inserted with dependency graph picture that matches the graph created in step1. | Dependency graph picture in exported report document from Trick Service must match graph created in step1. | No error in any step and exported report document contains dependency graph
|TC_24      | Step1: Import Excel->tests /tc24.xlsx Or Open -> tests/ tests / tc24.xlsx <br> Step2: Import Excel->tests /tc24.xlsx Or Open -> tests/ tests / tc24.xlsx <br> Step3: Import Excel->tests /tc24.xlsx Or Open -> tests/ tests / tc24.xlsx | Step1: Graph gets created<br> Step2:No error <br> Step3: graphdiff log24.json graph24.json | files must match
|TC_25      | Step1: Load dependency graph from TS Select: demo.trickservice.com Select: Demo UG -> Demo UG -> 0.3 <br> Step2: Import excel -> tc25.xlsx <br> Step3: Update dependency graph on TrickService <br> Step4: Clear working area Load dependency graph from TrickService: Select: demo.trickservice.com Select: Demo UG -> Demo UG -> 0.3 Save: log25.json <br> Step5: Clear working area Load dependency graph from TrickService: Select: demo.trickservice.com Select: Demo UG -> Demo UG -> 0.3 <br>Save: log25.json | graphdiff log25.json graph25.json | files must match
|TC_26      | Step1: Open: ../ILRDependency/ILR-Elec-Dependencies.xlsx Save: log26_elect.json <br>Step2: Open: ../ILRDependency/ILR-Gas-Dependencies.xlsx Save: log26_gas.json|Step1: graphdiff ../ILRDependency/ILR-Elec-Dependencies.json log26_elect.json <br> Step2: graphdiff ../ILRDependency/ILR-Gas-Dependencies.json log26_gas.json |  files must match
|TC_27      | ImportExcel -> tc27_1.xlsx Save: log27_1.json ImportExcel -> tc27_2.xlsx Save: log27_2.json ImportExcel -> tc27_2.xlsx Save: log27_3.json | graphdiff log27_1.json graph27_1.json and graphdiff log27_2.json graph27_2.json after both imports | files must match
|TC_28      | Step1: ImportExcel -> tc28.xlsx Save: log28.json <br> Step2: Sync with Trick Service (trickservice.itrust) Customer:ILR Analysis:TestingILR Version: 0.2 <br>Step3: Compare estimations and Click Export | Step1: graphdiff log28.json graph28.json <br> Step2: This must show: “Everything synchronised” <br> Step3: Save reports to log28.html, log28.csv and compare with report28.html and report28.csv | Reports and logs must match at end of step3.

#### Test Procedure

In order to carry out effective testing the tests can be divided into following groups:

|No  | Description          | Test IDs covered       | Steps in Tests covered
|:-- |:-------------------- | :----------------------|:-------------------------|
|1   | Open excel           | TC_01<br> TC_02<br> TC_04<br> TC_12<br> TC_13<br> TC_14<br> TC_15<br> TC_17<br> TC_18<br> TC_19<br> TC_20<br> TC_22<br> TC_23 |  1 <br> 1 <br> 1 <br> 1 <br> 1 <br> 1 <br> 1 <br> 1 <br> 1 and 2 <br> 1 and 2 <br> 1 and 2 <br> 1 and 2 <br> 1 and 2 |
|2   | Import excel         | TC_12<br> TC_13<br> TC_14<br> TC_16<br> TC_17<br> TC_18<br> TC_19<br> TC_20<br> TC_22<br> TC_27 | 2 <br> 1 and 2<br> 1 and 2<br> 1 2 and 3 <br> 1 <br>1 <br>1 <br>1 <br> 1 and 2 <br> 1 2 and 3 |
|3   | load/export excel error | TC_05<br> TC_06<br> TC_07<br> TC_08<br> TC_09<br> TC_10<br> TC_11 | 1 and 2 <br> 1 and 2 <br> 1 and 2 <br> 1 and 2 <br> 1 and 2 <br> 1 and 2 <br> 1 and 2 
|4   |Merge TS and graph assets | TC_20<br> TC_21 |  1 2 3 and 4 <br> 1 2 3 4 and 5 |
|5   |Load from TS and export to TS | TC_23<br> TC_24<br> TC_25 | 1 2 3 and 4 <br> 1 2 and 3 <br> 1 2 3 4 and 5
|6   |Import ILR Dependency matrix | TC_26 | 1 and 2 |
|7   |Compare Estimations with TS      | TC_28 | 1 2 and 3 |

## Directory test_graphdiff
This directory covers testing for a validation script `graphdiff.py`.
These tests needs to be run in case there are any changes made in `graphdiff.py`.

To run these tests:
- `cd test_graphdiff`
- `source run_all`

This will run all the scenarios. In order for the test(s) to pass
 `The gold and Log files match` messages must be output on the terminal. 
 If there is a message `The gold file does not exists in the path` then it means a failure of tests.
 



 




                                           








