// The map and list containing mapping from asset full name to abbreviation
// ATTENTION : If an asset is modified it needs to be changed in all 3 map + list
// Additionally at following places:
//     dependencygraph.js : DependencyGraph.prototype.init : To add the icon file mapping for each asset
//     dependencygraphicons.js : TO provide an icon image (Note these icons are base-64 images)

const mapOfSupportedAssets = new Map([
    ["Business process"    , "Busi" ],
    ["Compliance"          , "Compl"],
    ["Financial"           , "Fin"],
    ["Information"         , "Info"],
    ["Immaterial Value"    , "IV"],
    ["Outsourced service"  , "Out"],
    ["Site"                , "Site"],
    ["Software"            , "SW"],
    ["Hardware"            , "HW"],
    ["Network"             , "Net"],
    ["Service"             , "Serv"],
    ["Personnel"          , "Staff"],
    ["System"              , "Sys"]
]);
  

const mapOfSupportedAssetsAbbr = new Map([
  ["Busi" ,      "Business process"   ],
  ["Compl",      "Compliance"         ],
  ["Fin"  ,      "Financial"          ],
  ["Info" ,      "Information"        ],
  ["IV"   ,      "Immaterial Value"   ],
  ["Out"  ,      "Outsourced service" ],
  ["Site" ,      "Site"               ],
  ["SW"   ,      "Software"           ],
  ["HW"   ,      "Hardware"           ],
  ["Net"  ,      "Network"            ],
  ["Serv" ,      "Service"            ],
  ["Staff",      "Personnel"         ],
  ["Sys"  ,      "System"             ]
]);

  const mapOfSupportedAssetsLC = new Map([ 
    ["business process"    , "Busi" ],
    ["compliance"          , "Compl"],
    ["financial"           , "Fin"],
    ["information"         , "Info"],
    ["immaterial value"    , "IV"],
    ["outsourced service"  , "Out"],
    ["site"                , "Site"],
    ["software"            , "SW"],
    ["hardware"            , "HW"],
    ["network"             , "Net"],
    ["service"             , "Serv"],
    ["personnel"          , "Staff"],
    ["system"              , "Sys"]
  ]);

  const listOfSupportedAssets = ["Business process",
                                 "Compliance",
                                 "Financial",
                                 "Information",
                                 "Immaterial Value",   
                                 "Outsourced service",
                                 "Site",
                                 "Software",            
                                 "Hardware",            
                                 "Network",
                                 "Service",
                                 "Personnel",
                                 "System"];

// The constant names used to load and export assetLists and Types
// to and from the excel sheet in importing or exporting excel sheet
const CONST_ASSET_IT = 'AssetList';
const CONST_ASSET_TYPE = 'AssetType';
const CONST_ASSET_COMMENT = 'AssetComment';

// Defines the layout of the Excel file for the initial columns
const ExcelLayout = [CONST_ASSET_IT, CONST_ASSET_TYPE, CONST_ASSET_COMMENT];