
from robot.api.deco import library, keyword

@library
class GraphDiff:

    def __init__(logfile, jsonfile):
        #intentionally
        pass
    
    @keyword
    def compare_graph_json_files(self):
        #Intentionally
        pass

    @keyword
    def hello_world(self):
        print("Hello")
