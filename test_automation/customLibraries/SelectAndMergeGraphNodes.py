
from robot.api.deco import library, keyword
from robot.libraries.BuiltIn import BuiltIn
from RPA.Browser.Selenium import Selenium

@library
class SelectAndMergeGraphNodes:

    def __init__(self):
        self.sellibs = BuiltIn().get_library_instance('Selenium', all=True)         
        print(self.sellibs)

    @keyword     
    def merge_graph_with_ts_assets(self):
        print("Title of current browser window")
        #print(self.selib.get_title())



   
