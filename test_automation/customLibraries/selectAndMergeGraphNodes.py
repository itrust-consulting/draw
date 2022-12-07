
from robot.api.deco import library, keyword
from robot.libraries.BuiltIn import Builtin
from RPA.Browser.Selenium import Selenium

@library
class selectAndMergeGraphNodes:
    def __init__(self):
        self.builtin = Builtin()
        self.selib = self.builtin.get_library_instance("Selenium")

    @keyword     
    def merge_graph_with_ts_assets(self):
        print(self.selib.get_title())



   
