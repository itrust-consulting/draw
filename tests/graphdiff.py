# This script is useful for comparing two JSON files representing dependency graphs.
# The script maps the IDs in two json files and then does the comparison 
# If the two graphs have multiple asset nodes with same name and type then this script 
# will fail and not be able to verify

import json

# createmap_of_nodes : returns True in case of Error
def create_map_of_nodes(_file, map_of_nodes):
    # Opening JSON file
    _file = open(_file)

    # Opening JSON file
    data = json.load(_file)

    for node in data['nodes']:
        node_name = data['nodes'][node]["data"]["name"]
        type_name = data['nodes'][node]["data"]["type"]
        key = node_name + "__" + type_name
        if (map_of_nodes.get(key) != None):
            print ("The graph diff script cannot map the graphs with multiple nodes with same name and type information")
            return True

        map_of_nodes[key] = {}
        map_of_nodes[key]["node"] = data['nodes'][node]
        map_of_nodes[key]["edges"] = {}
    
    for i in (data['edges']):
        source_id = i["source"]
        target_id = i["target"]        
        source_key = data['nodes'][source_id]["data"]["name"] + "__" + data['nodes'][source_id]["data"]["type"]
        target_key = data['nodes'][target_id]["data"]["name"] + "__" + data['nodes'][target_id]["data"]["type"]
        prob = 1
        if i.get("p") != None:
            prob = i["p"]
        map_of_nodes[source_key]["edges"][target_key] = {}
        map_of_nodes[source_key]["edges"][target_key]["probability"]= prob

    return False
           
def print_maps(map_of_nodes):
    for node in map_of_nodes:
        print(node)
        print(map_of_nodes[node]["node"]["data"]["id"])

def compare_nodes(node1, node2):
    _match = True
    if node1["node"]["data"]["disabled"] != node2["node"]["data"]["disabled"] or node1["node"]["data"]["trickId"] != node2["node"]["data"]["trickId"]:
        _match = False     
    return _match

def compare_nodes_of_gold_and_log(map_of_nodes_from_gold, map_of_nodes_from_log):
    returnval = True
    for key in map_of_nodes_from_gold:
        if map_of_nodes_from_log.get(key) == None or compare_nodes(map_of_nodes_from_gold[key], map_of_nodes_from_log[key]) == False:
            returnval = False
            break
    return returnval

def compare_edges_of_gold_and_log(map_of_nodes_from_gold, map_of_nodes_from_log):
    returnval = True
    for key in map_of_nodes_from_gold:
        if (len(map_of_nodes_from_gold[key]["edges"]) != len(map_of_nodes_from_log[key]["edges"])):
            returnval = False
            break
        else:
            for gold_edge in map_of_nodes_from_gold[key]["edges"]:
                if (map_of_nodes_from_log[key]["edges"].get(gold_edge) == None or 
                map_of_nodes_from_gold[key]["edges"][gold_edge]["probability"] != 
                map_of_nodes_from_log[key]["edges"][gold_edge]["probability"]):
                    returnval = False
                    break          
                
    return returnval

def main(gold_file, log_file):
    map_of_nodes_from_log = {}
    map_of_nodes_from_gold = {}
    if create_map_of_nodes(gold_file, map_of_nodes_from_gold) == False and create_map_of_nodes(log_file, map_of_nodes_from_log) == False:
        if compare_nodes_of_gold_and_log(map_of_nodes_from_gold, map_of_nodes_from_log) and compare_edges_of_gold_and_log(map_of_nodes_from_gold, map_of_nodes_from_log) :
            print("The gold and Log files match")
        else:
            print("The gold and Log files do not match")
    else:
        print("graphdiff : Limitation encountered")
    
import argparse
import os.path
from os import path

if __name__== "__main__":
    my_parser = argparse.ArgumentParser()
    my_parser.add_argument('--gold_file', action='store', type=str, required=True)
    my_parser.add_argument('--log_file', action='store', type=str)
    args = my_parser.parse_args()
    gold_file = args.gold_file
    log_file = args.log_file
    if (path.exists(gold_file) and path.exists(log_file)):
        main(gold_file, log_file)
    else:
        if (path.exists(gold_file) == False and path.exists(log_file) == False):
            print("The gold and log file do not exists in the path")
        else: 
            if (path.exists(gold_file) == False):
                print("The gold file does not exists in the path")
            else:
                print("The log file does not exists in the path")   


