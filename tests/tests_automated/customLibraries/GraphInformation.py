
from robot.api.deco import library, keyword
# Add this import : from robot.libraries.BuiltIn import BuiltIn


import json

@library
class GraphInformation:

    #self.sel_lib = BuiltIn.get_library_instance("SeleniumLibrary")
    #self.sel_lib.get_title()
    #def __init__(self):
    #    pass        

    @keyword
    def get_graph_nodes(self, json_file):
        _file = open(json_file)
        # Opening JSON file
        data = json.load(_file)

        node_count = 0
        for node in data['nodes']:
            node_count = node_count + 1

        return node_count        

    @keyword
    def get_graph_edges(self, json_file):
        _file = open(json_file)
        # Opening JSON file
        data = json.load(_file)

        edge_count = 0
        for edge in data['edges']:
            edge_count = edge_count + 1

        return edge_count     
