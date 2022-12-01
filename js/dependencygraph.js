/**
 * The DependencyGraph object models an asset graph with dependencies among them (depicted as directed graph edges).
 * Internally, it manages a Cytoscape object and provides methods to manipulate the latter.
 * @param {HTMLElement} dom_container - The DOM element where the graph is drawn onto.
 * @constructor
 */
function DependencyGraph(dom_container) {
    this.dom_container = dom_container;
    this.default_filename = null;
    this.callbacks_default_filename_changed = [];
};

/**
 * The number of pixels that a node shall move when the arrow keys are pressed.
 * Used in the DependencyGraph.prototype.move() functions.
 */
let MOVE_OFFSET = 10;

/**
 * Whether nodes should stick to the grid of size MOVE_OFFSET when arrow keys are pressed.
 * If set to false, the MOVE_OFFSET is just added to the node position.
 * If set to true, the node is moved by MOVE_OFFSET, but the position is then rounded to the closest integer multiple of MOVE_OFFSET.
 * Used in the DependencyGraph.prototype.move() functions.
 */
let MOVE_STICK_TO_GRID = true;

let COLOR_NODE = "#DDDDDD";
let COLOR_EDGE = "#999999";
let COLOR_RED = "#FF0000";
let COLOR_GREEN = "#00FF00";
let COLOR_BLUE = "#0000FF";
let COLOR_SELECTED = "#187FD9";
let COLOR_NEW_EDGE = "#D94032";

/**
 * Initialises the dependency graph and renders it to the DOM.
 * @param {function} [ready_callback] - (Optional) A function which is called once the graph has been loaded.
 */
DependencyGraph.prototype.init = function (ready_callback) {
    // Init graph
    this.cy = cytoscape({
        container: this.dom_container,
        layout: { name: "grid", rows: 1, cols: 1 },
        minZoom: .1,
        maxZoom: 10,
        wheelSensitivity: .2,
        boxSelectionEnabled: true,
        panningEnabled: true,
        style: [
            {
                selector: "node", css: {
                    "width": 50,
                    "height": 50,
                    "background-color": COLOR_NODE,
                    "background-width": "70%",
                    "background-height": "70%",
                    "background-clip": "none",
                    "content": "data(name)",
                    "text-wrap": "wrap",
                    "text-valign": "bottom",
                    "text-max-width": 150,
                }
            },
            {
                selector: "edge", css: {
                    "line-color": COLOR_EDGE,
                    "target-arrow-color": COLOR_EDGE,
                    "curve-style": "bezier",
                    "target-arrow-shape": "triangle"
                }
            },
            {
                selector: "edge.red", css: {
                    "line-color": COLOR_RED,
                    "target-arrow-color": COLOR_RED,
                    "curve-style": "bezier",
                    "target-arrow-shape": "triangle"
                }
            },
            {
                selector: "edge.green", css: {
                    "line-color": COLOR_GREEN,
                    "target-arrow-color": COLOR_GREEN,
                    "curve-style": "bezier",
                    "target-arrow-shape": "triangle"
                }
            },
            {
                selector: "edge.blue", css: {
                    "line-color": COLOR_BLUE,
                    "target-arrow-color": COLOR_BLUE,
                    "curve-style": "bezier",
                    "target-arrow-shape": "triangle"
                }
            },
            {
                selector: "node:selected", css: {
                    "background-color": COLOR_SELECTED,
                }
            },
            {
                selector: "node.reachable", css: {
                    "border-width": 4,
                    "border-color": COLOR_SELECTED,
                }
            },
            {
                selector: "edge:selected,edge.reachable", css: {
                    "line-color": COLOR_SELECTED,
                    "target-arrow-color": COLOR_SELECTED,
                }
            },
            {
                selector: "node.disabled", css: {
                    "opacity": 0.4,
                }
            },
            { selector: ".edgehandles-hover", css: { "background-color": COLOR_NEW_EDGE } },
            { selector: ".edgehandles-source", css: { "border-width": 2, "border-color": COLOR_NEW_EDGE } },
            { selector: ".edgehandles-target", css: { "border-width": 2, "border-color": COLOR_NEW_EDGE } },
            { selector: ".edgehandles-preview, .edgehandles-ghost-edge", css: { "line-color": COLOR_NEW_EDGE, "target-arrow-color": COLOR_NEW_EDGE, "source-arrow-color": COLOR_NEW_EDGE } },
            { selector: "node[type='Busi']", css: { "background-image": DependencyGraphIcons.Busi } },
            { selector: "node[type='Compl']", css: { "background-image": DependencyGraphIcons.Compl } },
            { selector: "node[type='Fin']", css: { "background-image": DependencyGraphIcons.Fin } },
            { selector: "node[type='Info']", css: { "background-image": DependencyGraphIcons.Info } },
            { selector: "node[type='IV']", css: { "background-image": DependencyGraphIcons.IV } },
            { selector: "node[type='Out']", css: { "background-image": DependencyGraphIcons.Out } },
            { selector: "node[type='Site']", css: { "background-image": DependencyGraphIcons.Site } },
            { selector: "node[type='SW']", css: { "background-image": DependencyGraphIcons.SW } },   
            { selector: "node[type='HW']", css: { "background-image": DependencyGraphIcons.HW } },
            { selector: "node[type='Net']", css: { "background-image": DependencyGraphIcons.Net } },
            { selector: "node[type='Serv']", css: { "background-image": DependencyGraphIcons.Serv } },
            { selector: "node[type='Staff']", css: { "background-image": DependencyGraphIcons.Staff } },         
            { selector: "node[type='Sys']", css: { "background-image": DependencyGraphIcons.Sys } }
        ],
        elements: { nodes: [], edges: [] },
    });
    this.cy.on("select", "node", function (e) {
        e.target.neighborhood().addClass("reachable");
    });
    this.cy.on("unselect", function (e) {
        e.cy.$("").removeClass("reachable");
    });

    // Init edgehandlers library
    let imgPlus = new Image();
    imgPlus.src = "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPHN2ZyB3aWR0aD0iMTc5MiIgaGVpZ2h0PSIxNzkyIiB2aWV3Qm94PSIwIDAgMTc5MiAxNzkyIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0xNjAwIDczNnYxOTJxMCA0MC0yOCA2OHQtNjggMjhoLTQxNnY0MTZxMCA0MC0yOCA2OHQtNjggMjhoLTE5MnEtNDAgMC02OC0yOHQtMjgtNjh2LTQxNmgtNDE2cS00MCAwLTY4LTI4dC0yOC02OHYtMTkycTAtNDAgMjgtNjh0NjgtMjhoNDE2di00MTZxMC00MCAyOC02OHQ2OC0yOGgxOTJxNDAgMCA2OCAyOHQyOCA2OHY0MTZoNDE2cTQwIDAgNjggMjh0MjggNjh6IiBmaWxsPSIjZmZmIi8+PC9zdmc+";
    imgPlus.width = imgPlus.height = 12;
    this.cy.edgehandles({
        preview: false,
        hoverDelay: 0,
        toggleOffOnLeave: true,
        handleNodes: "node",
        handleIcon: imgPlus,
        handleSize: 16,
        handleColor: COLOR_NEW_EDGE,
        handlePosition: "middle top",
        edgeType: function () { return "flat"; },
    });
    this.cy.edgehandles("drawoff");

    // Make sure that DOM container is focussed when clicked
    this.dom_container.addEventListener("click", function (e) { this.focus(); }); // only works if DOM element has tabindex="" set

    // Call ready callback
    ready_callback && this.cy.ready(ready_callback);
};

/**
 * Sets the default file name used for saving, except if a default file name
 * @param {string} default_filename The default file name to be used when saving the file. The user can still change it in the save dialog.
 */
DependencyGraph.prototype.suggestDefaultFileName = function (default_filename) {
    if (!this.default_filename && default_filename)
        this._setDefaultFileName(default_filename);
};

/**
 * Sets the default file name used for saving, overriding the previous value.
 * This is an internal function; consider using suggestDefaultFileName() instead.
 * @param {string} default_filename The default file name to be used when saving the file. The user can still change it in the save dialog.
 */
DependencyGraph.prototype._setDefaultFileName = function (default_filename) {
    this.default_filename = default_filename;
    for (let i of this.callbacks_default_filename_changed)
        i(default_filename);
};

/**
 * Registers a callback that shall be called when the default file name is changed.
 * @param {function} callback The function that shall be called when the default file name changes. The file name is passed to the function as first argument.
 */
DependencyGraph.prototype.onDefaultFilenameChanged = function (callback) {
    this.callbacks_default_filename_changed.push(callback);
};

/**
 * Exports the current dependency graph as a PNG picture.
 * @param {string} [default_filename] - (Optional) The default file name to be used when saving the file. The user can still change it in the save dialog.
 */
DependencyGraph.prototype.exportPng = function (default_filename) {
    // Export as PNG
    let url = this.dom_container.querySelector("canvas:nth-child(3)").toDataURL("image/png", 1.0);
    // Create link
    let a = document.createElement('a');
    document.body.appendChild(a);
    a.href = url;
    a.download = default_filename || "graph.png";
    a.click();
    setTimeout(function () {
        document.body.removeChild(a);
    }, 100);
};

/* Exports a PNG Blob */
DependencyGraph.prototype.exportPngBlob = function () {
    let self = this;
    return new Promise((resolve) => {
        self.dom_container.querySelector("canvas:nth-child(3)").toBlob((blob) => { resolve(blob); }, "image/png", 1.0);
    });
};

/**
 * Serializes the graph into a Javascript object (e.g. for saving).
 * Caution! The serialized object contains references to the real node; changing them will also change the graph!
 * @returns {object} Returns a plain Javascript object of the form { nodes: {}, edges: [] }.
 */
DependencyGraph.prototype.save = function () {
    let data = { nodes: {}, edges: [] };
    let nodes = this.cy.nodes(/*"[id ^= 'U']"*/); /// @RPA: Why commented the filtering ? It leads to issues while load and save
    let edges = this.cy.edges(/*"[id ^= 'U'] -> [id ^= 'U']"*/);

    for (let i = 0; i < nodes.length; i++) {
        data.nodes[nodes[i].id()] = { data: nodes[i].data(), position: nodes[i].position() };
    }

    for (let i = 0; i < edges.length; i++) {
        let edgedata = $.extend({}, edges[i].data()); // clone so that we don't modify the original object
        delete edgedata.id;
        data.edges.push(edgedata);
    }

    return data;
};

/**
 * Convert the asset table based on UIds instead of asset names
 * @param {*} assetTable 
 * @param {*} mapUidsToNodeNames 
 * @returns 
 */
function _convertAssetTableUsingUids(assetTable, mapUidsToNodeNames)  {
    for (let i of assetTable) {
        for (let key in i) {
            if (key != CONST_ASSET_TYPE) {
                if (key == CONST_ASSET_IT) {
                    i[CONST_ASSET_IT] = mapUidsToNodeNames[i[CONST_ASSET_IT]];
                } else {
                    let old_key = key;
                    let new_key = mapUidsToNodeNames[old_key];
                    i[new_key] = i[old_key];
                    delete i[old_key];
                }
            }
        }
    }

    return assetTable;
}

/* This function saved the dependency graph to excel format
 */
DependencyGraph.prototype.saveToExcel = function () {
    let data = this.save();
    /* Convert this data to an assetTable of following form 
     *  assetTable = [{assetList: "asset1", assetType:"Business Process", asset1: "0", "asset2": 1, "asset3": 1}, 
     *               {assetList: "asset2", assetType:"Financial", asset1: "1", "asset2": 0, "asset3": 1},
     *               {assetList: "asset3", assetType:"Compliance", asset1: "1", "asset2": 0, "asset3": 0}                 
     *               ];
     */
    let assetTable = [];
    let mapUidsToNodeNames = new Object();
    for (let key in data.nodes) {
        mapUidsToNodeNames[key] = data.nodes[key].data.name;
    }

    /* This map contains a map of sets [mapping from Source to all destinations] */
    let mapOfEdges = new Object();
    /* create set of assets for which there is atleast one incoming edge
     * if there is no incoming edge then these assets need not be present in the exported table
     */
    let setOfAtleastOneIncomingEdge = new Set();
    for (let edge of data.edges) {
        if (!mapOfEdges[edge.source]) {
            mapOfEdges[edge.source] = new Object();
        }
        if (edge.p) {
            mapOfEdges[edge.source][edge.target] = edge.p;
        } else {
            mapOfEdges[edge.source][edge.target] = 1;
        }
        setOfAtleastOneIncomingEdge.add(edge.target);
    }

    /* First Populate Map using UIDs */
    for (let key in data.nodes) {
        let rowEntry = new Object();
        rowEntry[CONST_ASSET_IT] = key;
        rowEntry[CONST_ASSET_TYPE] = mapOfSupportedAssetsAbbr.get(data.nodes[key].data.type);

        for (let subKey of setOfAtleastOneIncomingEdge) {
            rowEntry[subKey] = undefined;
        }
        assetTable.push(rowEntry);
    }

    for (let i of assetTable) {
        let sourceNode = i[CONST_ASSET_IT];

        for (let key in i) {
            if (key != CONST_ASSET_IT && key != CONST_ASSET_TYPE) {
                /* These are all the entries of the source to edge mapping which need to be 
                 * populated from mapOfEdges
                 */
                if (mapOfEdges[sourceNode] && mapOfEdges[sourceNode][key]) {
                    i[key] = mapOfEdges[sourceNode][key];
                }
            }
        }
    }

    /* Finally convert assetTable from UIds using assetNames by utilizing mapUidsToNodeNames */
    assetTable = _convertAssetTableUsingUids(assetTable, mapUidsToNodeNames);

    let binaryWS1 = XLSX.utils.json_to_sheet(assetTable);
    let wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, binaryWS1, 'Dependency');

    let validAssets = [];
    for (let i of listOfSupportedAssets) {
        validAssets.push({ "Valid Asset Type": i });
    }
    let binaryWS2 = XLSX.utils.json_to_sheet(validAssets);
    XLSX.utils.book_append_sheet(wb, binaryWS2, 'Parameters');

    XLSX.writeFile(wb, 'AssetDsinExcel.xlsx');
};

/**
 * Serializes the graph into a string (e.g. for saving).
 * @returns {string} Returns a JSON formatted string.
 */
DependencyGraph.prototype.saveString = function () {
    return JSON.stringify(this.save());
}

DependencyGraph.prototype.saveJsonBlob = function () {
    return new Blob([JSON.stringify(this.save(), null, "\t")], { 'type': 'application/json' });
}

/**
 * Saves the current dependency graph to a file.
 * @param {string} [default_filename] - (Optional) The default file name to be used when saving the file. The user can change it at any time.
 */
DependencyGraph.prototype.saveFile = function (default_filename) {
    let blob = this.saveJsonBlob();
    let url = window.URL.createObjectURL(blob);
    let a = document.createElement('a');
    document.body.appendChild(a);
    a.href = url;
    a.download = default_filename || this.default_filename || "graph.json";
    a.click();
    setTimeout(function () {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(a.href);
    }, 100);
};

/**
 * Saves the current dependency graph to the local browser storage.
 */
DependencyGraph.prototype.saveMemory = function () {
    try {
        if (window.localStorage)
            window.localStorage.last_graph = JSON.stringify(this.save());
    }
    catch (e) {
        // Can fail when access is denied
    }
};

/**
 * Reads a dependency graph from the given descriptor object, and loads it.
 * Note: the graph managed by this class will be replaced by the loaded one.
 * @param {object} data - a plain Javascript object of the form { nodes: {}, edges: [] }, which was generated by the #save() method.
 */
DependencyGraph.prototype.load = function (data) {
    this.cy.startBatch();
    this.cy.nodes().remove();
    for (let id in data.nodes) {
        data.nodes[id].group = "nodes";
        if (data.nodes[id].data.type != undefined) {
            data.nodes[id].data.type = _compatConvertAssetType(data.nodes[id].data.type);
        } else {
            data.nodes[id].data.type = undefined;
        }
        data.nodes[id].classes = data.nodes[id].data.disabled ? "disabled" : "";
        this.cy.add(data.nodes[id]);
    }
    for (let i of data.edges) {
        this.cy.add({ group: "edges", data: i });
    }
    this.cy.nodes().selectify();
    this.cy.endBatch();
};

/**
 *  This function 
 *  - Adds an edge if it doesn't exist already
 *  - Delete an edge if probability is 0 or unspecified
 *  - Update probability if it is not the same as of existing edge
 *  - The function also assumes that there should be only one edge from source to sink.
 *  - NOTE: Multiple edges between source and sink for risk analysis are not relevant
 * @param {*} idSource 
 * @param {*} idSink 
 * @param {*} probability 
 */
DependencyGraph.prototype.updateEdge = function (idSource, idSink, probability) {    

    if (probability == 0 || probability == undefined) {
        this.cy.remove(this.cy.edges(`[source='${idSource}'][target='${idSink}']`));
    } else {
        if (this.cy.edges(`[source='${idSource}'][target='${idSink}']`).length > 0) {
            let edgeMatch = this.cy.edges(`[source='${idSource}'][target='${idSink}']`)[0];
            if (edgeMatch.data('p') != probability) {    
                this.cy.edges(`[source='${idSource}'][target='${idSink}']`)[0].data({ p: probability });
            }
        } else {
            this.addEdge(idSource, idSink, probability);
        }
    }
}

/**
 * This function adds an Edge to the existing graph. If the probability is anything
 * between 0 and 1 it gets added as well. 
 * @param {*} idSource : ID of source asset Node
 * @param {*} idSink : ID of the sink asset Node
 * @param {*} probability : Probability label added to edges
 */
DependencyGraph.prototype.addEdge = function (idSource, idSink, probability) {

    if (probability == 1) {
        this.cy.add({ group: "edges", data: { source: idSource, target: idSink } });
    } else {
        this.cy.add({ group: "edges", data: { source: idSource, target: idSink, p: probability } });
    }
}

/**
 * Reads a dependency graph from the given descriptor object, and loads it.
 * @param {string} data - A JSON-encoded string containing graph data.
 */
DependencyGraph.prototype.loadString = function (data) {
    return this.load(JSON.parse(data));
}

/**
 * Loads a dependency graph from a file.
 * @param {File} file - The file object (from the HTML5 File API) that encodes a local file.
 */
DependencyGraph.prototype.loadFile = function (file, done_callback) {
    let self = this;
    let reader = new FileReader();
    reader.onload = function (e) {
        self._setDefaultFileName(file.name);
        self.load(JSON.parse(e.target.result));
        done_callback && done_callback();
    };
    reader.readAsText(file);
};

/**
 * Checks if there is a dependency graph stored in the local browser storage.
 * @returns {bool} Returns true iff there is a dependency graph (possibly empty).
 */
DependencyGraph.prototype.hasMemory = function () {
    try {
        return !!(window.localStorage && window.localStorage.last_graph);
    }
    catch (e) {
        // Can fail when access is denied
        return false;
    }
};

/**
 * Loads a dependency graph from the local browser storage.
 */
DependencyGraph.prototype.loadMemory = function () {
    try {
        if (window.localStorage && window.localStorage.last_graph) {
            this.load(JSON.parse(window.localStorage.last_graph));
        }
    }
    catch (e) {
        // Can fail when access is denied
    }
};

/**
 * Adds a new asset node to the dependency graph, or updates an existent one.
 * @param {(string|null)} id - A unique identifier for the node in the dependency graph. If NULL, a new ID is generated.
 * @param {string} name - The name of the asset. This will also serve visually as label for the node.
 * @param {string} type - The type of the asset (must be one of the constants used by TRICK Service). This will also be used to pick an icon for the node.
 * @param {boolean} disabled - Whether the asset should be marked as inactive/disabled. This is only visual right now.
 * @param {string} [trickId] - (Optional) The database identifier of the analogous asset in the TRICK Service database.
 */
DependencyGraph.prototype.addNode = function (id, name, type, disabled, trickId) {
    let bbox = this.cy.nodes().boundingBox();
    let node = {
        group: "nodes",
        data: {
            id: id || ("U" + Math.random()),
            name: name || "New asset",
            type: type,
            disabled: disabled,
            trickId: trickId || (id ? this.cy.getElementById(id).data("trickId") : /* determined when sync'ing: */ null),
        },
        position: {
            x: bbox.x1,
            y: bbox.y1,
        },
        classes: disabled ? "disabled" : "",
    };
    if (id) {
        this.cy.getElementById(id).data(node.data).toggleClass("disabled", node.data.disabled);
    }
    else {
        this.cy.add(node);
        this.cy.fit();
    }
    return node.data.id;
};

/**
 * This function checks if an asset with same label and type already exists in the system
 * if it does than the same asset ID is used. If not a new nodeID is created and added to the graph
 * @param {*} id : Id of the node to be added
 * @param {*} nameInput : Name of the asset
 * @param {*} type  : Type of asset
 * @param {*} disabled : If asset is disabled this value is true
 * @returns 
 */
DependencyGraph.prototype.addNodeFromImportedFile = function (id, nameInput, type, disabled) {

    let convertedType = _compatConvertAssetType(type);

    if (this.cy.nodes(`[name='${nameInput}']`).length > 0) {
        let all = this.cy.nodes(`[name='${nameInput}']`);
        all.forEach(function (element, i) {
            if (element.data('type') == convertedType) {
                id = element.data('id');
                //break; @RPA: For review: Can we break if first asset found ?
                // @RPA: Is there a better way of doing it ? In case of a big graph this may not be efficient way of handling
            }
        });
    }

    return this.addNode(id, nameInput, convertedType, disabled);
}

/**
 * Updates the edge data of an existing edge in the dependency graph.
 * @param {string} id - The unique identifier for the edge in the dependency graph.
 * @param {Number|undefined} p - The probability that a problem in the edge source creates a problem in the edge target. Must be between 0.0 and 1.0, or undefined if the value shall not be set.
 */
DependencyGraph.prototype.setEdgeData = function (id, probability) {
    this.cy.getElementById(id).data({ p: probability });
};

/**
 * Deletes all selected nodes and edges from the graph.
 */
DependencyGraph.prototype.deleteSelected = function () {
    this.cy.remove(this.cy.$(":selected"));
};

/**
 * Selects all nodes.
 */
DependencyGraph.prototype.selectAll = function () {
    this.cy.nodes().select();
};

/**
 * Clears the dependency graph by removing all nodes and edges.
 */
DependencyGraph.prototype.clear = function () {
    this._setDefaultFileName(null);
    this.cy.nodes().remove();
};

/** Moves the selected nodes by the given offset in horizontal direction. */
DependencyGraph.prototype.moveX = function (offset) {
    let all = this.cy.$("node:selected");
    all.forEach(function (element, i) {
        let x = element.position("x") / MOVE_OFFSET + offset;
        if (MOVE_STICK_TO_GRID)
            x = Math.round(x);
        element.position("x", x * MOVE_OFFSET);
    });
};

/** Moves the selected nodes by the given offset in vertical direction. */
DependencyGraph.prototype.moveY = function (offset) {
    let all = this.cy.$("node:selected");
    all.forEach(function (element, i) {
        let y = element.position("y") / MOVE_OFFSET + offset;
        if (MOVE_STICK_TO_GRID)
            y = Math.round(y);
        element.position("y", y * MOVE_OFFSET);
    });
};

/** Horizontally right-aligns the selected nodes. */
DependencyGraph.prototype.arrangeHAlignRight = function () {
    let all = this.cy.$("node:selected");
    let bbox = _nodeBoundingBox(all);
    all.forEach(function (element, i) { element.position("x", bbox.x1 + bbox.w - element.width() / 2); });
};

/** Horizontally center-aligns the selected nodes. */
DependencyGraph.prototype.arrangeHAlignCenter = function () {
    let all = this.cy.$("node:selected");
    let bbox = _nodeBoundingBox(all);
    all.forEach(function (element, i) { element.position("x", bbox.x1 + bbox.w / 2); });
};

/** Horizontally left-aligns the selected nodes. */
DependencyGraph.prototype.arrangeHAlignLeft = function () {
    let all = this.cy.$("node:selected");
    let bbox = _nodeBoundingBox(all);
    all.forEach(function (element, i) { element.position("x", bbox.x1 + element.width() / 2); });
};

/** Vertically bottom-aligns the selected nodes. */
DependencyGraph.prototype.arrangeVAlignBottom = function () {
    let all = this.cy.$("node:selected");
    let bbox = _nodeBoundingBox(all);
    all.forEach(function (element, i) { element.position("y", bbox.y1 + bbox.h - element.height() / 2); });
};

/** Vertically center-aligns the selected nodes. */
DependencyGraph.prototype.arrangeVAlignCenter = function () {
    let all = this.cy.$("node:selected");
    let bbox = _nodeBoundingBox(all);
    all.forEach(function (element, i) { element.position("y", bbox.y1 + bbox.h / 2); });
};

/** Vertically top-aligns the selected nodes. */
DependencyGraph.prototype.arrangeVAlignTop = function () {
    let all = this.cy.$("node:selected");
    let bbox = _nodeBoundingBox(all);
    all.forEach(function (element, i) { element.position("y", bbox.y1 + element.height() / 2); });
};

/** Distributes the selected nodes horizontally in an equidistant fashion. */
DependencyGraph.prototype.arrangeHDistribute = function () {
    let all = this.cy.$("node:selected").sort(function (a, b) { return a.position("x") - b.position("x"); });
    if (all.length < 2) return;
    let bbox = _nodeBoundingBox(all);
    let off0 = all.first().width() / 2;
    let off1 = all.last().width() / 2;
    let intv = (bbox.w - off0 - off1) / (all.length - 1);
    all.forEach(function (element, i) { element.position("x", bbox.x1 + off0 + i * intv); });
};

/** Distributes the selected nodes vertically in an equidistant fashion. */
DependencyGraph.prototype.arrangeVDistribute = function () {
    let all = this.cy.$("node:selected").sort(function (a, b) { return a.position("y") - b.position("y"); });
    if (all.length < 2) return;
    let bbox = _nodeBoundingBox(all);
    let off0 = all.first().height() / 2;
    let off1 = all.last().height() / 2;
    let intv = (bbox.h - off0 - off1) / (all.length - 1);
    all.forEach(function (element, i) { element.position("y", bbox.y1 + off0 + i * intv); });
};

/** Colors edges based on their probabilities */
DependencyGraph.prototype.colorEdges = function () {
    this.cy.filter('edge[p >0][p <= 0.25]').addClass('red');
    this.cy.filter('edge[p >0.25][p <= 0.50]').addClass('green');
    this.cy.filter('edge[p >0.50][p <= 0.75]').addClass('blue');
}

/**
 * Helper function.
 * Computes the bounding box of the given Cytoscape elements.
 * @param {*} elements - A collection of Cytoscape elements, as retrieved for instance by cy.$().
 * @returns {object} Returns a plain Javascript object of the form {x1,y1,x2,y2,w,h}.
 */
function _nodeBoundingBox(elements) {
    let bbox = elements.boundingBox({ includeEdges: false, includeLabels: false, includeOverlays: false });
    // TODO: figure out why the bounding box has an extra 1px on every side
    bbox.x1 += 1;
    bbox.x2 -= 1;
    bbox.y1 += 1;
    bbox.y2 -= 1;
    bbox.w -= 2;
    bbox.h -= 2;
    return bbox;
}

/**
 * Helper function.
 * Converts an asset type used by legacy versions of this tool, to an asset type that is compatible with TRICK Service.
 * If the asset type is not one of the legacy types, this function acts as the identity function and just outputs the provided input.
 * @param {string} legacyType - An asset type string.
 * @returns {string} Returns the modern equivalent of the given asset type string.
 */
function _compatConvertAssetType(legacyType) {

    let LcLegacyType = legacyType.toLowerCase(); // @RPA: Review: Providing a little more flexibility but don't know if its relevant

    if (mapOfSupportedAssetsLC.get(LcLegacyType) != undefined)
        return mapOfSupportedAssetsLC.get(LcLegacyType);

    return legacyType;
}


