/**
 * The main object that manages the user interface around a dependency graph.
 * It serves as view model, passing on user commands (e.g. buttons, key shortcuts) to the underlying classes.
 * @param {HTMLElement} dom_container - The DOM element where the graph is drawn onto.
 * @param {AssetDialogFactory} asset_dialog_factory - A factory for creating asset dialogs.
 * @param {EdgeDialogFactory} edge_dialog_factory - A factory for creating edge dialogs.
 * @param {TrickSyncDialogFactory} trick_sync_dialog_factory - A factory for creating 'TRICK Sync' dialogs (for synchronising with TRICK Service).
 * @param {TrickCompareDialogFactory} trick_compare_dialog_factory - A factory for creating 'TRICK Compare' dialogs (for comparing with assessments from TRICK Service).
 * @param {TrickSaveLoadDialogFactory} trick_save_load_dialog_factory - A factory for creating 'TRICK Save/Load' dialoag (for saving or loading graph from TRICK Service).
 * @param {ErrorDialogFactory} error_dialog_factory - A factory for creating Error dialog
 */
function UserInterface(dom_container, asset_dialog_factory, edge_dialog_factory, trick_sync_dialog_factory, trick_compare_dialog_factory, trick_save_load_dialog_factory, error_dialog_factory) {
	this.dom_container = dom_container;
	this.dependency_graph = new DependencyGraph(dom_container);
	this.asset_dialog_factory = asset_dialog_factory;
	this.edge_dialog_factory = edge_dialog_factory;
	this.trick_sync_dialog_factory = trick_sync_dialog_factory;
	this.trick_compare_dialog_factory = trick_compare_dialog_factory;
	this.trick_save_load_dialog_factory = trick_save_load_dialog_factory;
	this.error_dialog_factory = error_dialog_factory;
	this.history = new History(1000);
};

const defaultDiagram = "FIG_DRAW-Illustration-PU_v1.0.json";

/**
 * Initialises the dependency graph UI and sets up event handlers.
 * Also calls DependencyGraph#init() on the underlying dependency graph.
 */
UserInterface.prototype.init = function () {
	let self = this;

	// Inititialise underlying graph
	this.dependency_graph.init(function () {
		// Once the UI is ready, load the last edited graph
		if (self.dependency_graph.hasMemory() && confirm("Would you like to resume your work from last time?")) {
			self.history.disable();
			self.dependency_graph.loadMemory();
			self.dependency_graph.cy.fit();
			self.history.enable();
		}
		else // Added 12/05/2022 by RSA
		{
			fetch(defaultDiagram)
				.then(response => response.text())
				.then(data => self.dependency_graph.loadString(data))
				.then(function () {
					self.dependency_graph.cy.fit();
					self.history.enable();
					self.history.add(self.dependency_graph.saveString());
				});

			alert("Loading default model.");
		}

		// Add the current graph to the history
		self.history.add(self.dependency_graph.saveString());
	});

	// Whenever edges or nodes are changed, save a temporary copy in memory, and add it to the history.
	// Be careful to only invoke the event handler for non-temporary nodes (which have an [id] starting with 'U').
	// Indeed, the cy-edgehandles library creates temporary nodes when the user is interacting with the graph.
	this.dependency_graph.cy.on("add remove data free", "[id ^= 'U'], [id ^= 'U'] -> [id ^= 'U']", function (e) {
		self.dependency_graph.saveMemory();
		self.history.add(self.dependency_graph.saveString());
	});

	// Set up UI events and key bindings
	this.dependency_graph.cy.on("mousedown", "node", function (e) {
		if (e.originalEvent.detail >= 2) // double click
			self.asset_dialog_factory.create().show(e.target.data());
	});
	this.dependency_graph.cy.on("mousedown", "edge", function (e) {
		if (e.originalEvent.detail >= 2) // double click
			self.edge_dialog_factory.create().show(e.target.data(), e.target.source().data("name"), e.target.target().data("name"));
	});
	this.dom_container.addEventListener("keydown", function (e) {
		switch (e.keyCode) {
			case 8: // backspace
			case 46: // delete
				self.dependency_graph.deleteSelected();
				e.preventDefault();
				break;
			case 37: // arrow left
				self.dependency_graph.moveX(-(e.shiftKey ? 5 : 1));
				e.preventDefault();
				break;
			case 38: // arrow up
				self.dependency_graph.moveY(-(e.shiftKey ? 5 : 1));
				e.preventDefault();
				break;
			case 39: // arrow right
				self.dependency_graph.moveX(+(e.shiftKey ? 5 : 1));
				e.preventDefault();
				break;
			case 40: // arrow down
				self.dependency_graph.moveY(+(e.shiftKey ? 5 : 1));
				e.preventDefault();
				break;
		}
		if (e.keyCode == 65 /* A */ && e.ctrlKey) {
			self.dependency_graph.selectAll();
			e.preventDefault();
		}
		if (e.keyCode == 90 /* Z */ && e.ctrlKey && !e.shiftKey) {
			self.undo();
			e.preventDefault();
		}
		if (e.keyCode == 89 /* Y */ && e.ctrlKey || e.keyCode == 90 /* Z */ && e.ctrlKey && e.shiftKey) {
			self.redo();
			e.preventDefault();
		}
		if (e.keyCode == 83 /* S */ && e.ctrlKey) {
			self.save();
			e.preventDefault();
		}
		if (e.keyCode == 79 /* O */ && e.ctrlKey) {
			self.open();
			e.preventDefault();
		}
	});
};

UserInterface.prototype.save = function () {
	this.dependency_graph.saveFile();
};

UserInterface.prototype.savePng = function () {
	this.dependency_graph.exportPng();
};

UserInterface.prototype.saveExcel = function () {
	this.dependency_graph.saveToExcel();
}

UserInterface.prototype.savePngOnTS = function () {
	let self = this;
	const callback = async (trick_api, graph, analysisId, dialoagCallback) => {
		graph.exportPngBlob().then((blog) => {
			let form = new FormData();
			form.append("file", blog, "draw.png");
			trick_api.savePicture(analysisId, form)
				.fail(() => {
					self.error_dialog_factory.create().show({ "msg": "TRICK Service server return an error while saving data!", "title": "Saving PNG" })
				})
				.always(() => dialoagCallback());
		});
	};
	this.trick_save_load_dialog_factory.create(this.dependency_graph, callback).show();
}

UserInterface.prototype.saveSnapshotOnTS = function () {
	let self = this;
	const callback = async (trick_api, graph, analysisId, dialoagCallback) => {
		let blob = graph.saveJsonBlob();
		let form = new FormData();
		form.append("file", blob, "draw.json");
		trick_api.saveSnapshot(analysisId, form)
			.fail(() => {
				self.error_dialog_factory.create().show({ "msg": "TRICK Service server return an error while saving data!", "title": "Saving Snapshot" })
			})
			.always(() => dialoagCallback());
	};
	this.trick_save_load_dialog_factory.create(this.dependency_graph, callback).show();
}

UserInterface.prototype.loadSnapshotFromTS = function () {
	let self = this;
	const callback = async (trick_api, graph, analysisId, dialoagCallback) => {
		trick_api.getSnapshot(analysisId).done((data) => {
			graph.load(data);
			graph.cy.fit();
			self.history.enable();
			self.history.add(graph.saveString());
		})
			.fail(() => {
				self.error_dialog_factory.create().show({ "msg": "TRICK Service server return an error while loading data!", "title": "Loading TS Snapshot" })
			})
			.always(() => dialoagCallback());
	};
    this.trick_save_load_dialog_factory.create(this.dependency_graph, callback).show();
}

UserInterface.prototype.loadDepGraphFromTS = function () {
	let self = this;
	const callback = async (trick_api, graph, analysisId, dialoagCallback) => {
		trick_api.getAssetDependencies(analysisId).done((data) => {
			graph.load(data);
			graph.cy.fit();
			self.history.enable();
			self.history.add(graph.saveString());
		})
			.fail(() => {
				self.error_dialog_factory.create().show({ "msg": "TRICK Service server return an error while loading data!", "title": "Loading dependency graph" })
			})
			.always(() => dialoagCallback());
	};
    this.trick_save_load_dialog_factory.create(this.dependency_graph, callback).show();
}


/* Save dependency graph on Trick Service
 * By default the asset dependency graph in Trick Service risk analysis comprises of all the assets as unconnected nodes. 
 * While saviing if a connected asset node is found in DRAW which has not been synchronized with Trick Service earlier 
 * Implies that asset is not present in Trick Service already this will result in an error.
 */
UserInterface.prototype.saveDepGraphOnTS = function () {
	let self = this;
	const callback = async (trick_api, graph, analysisId, dialoagCallback) => {
		let assets = await new Promise((resolve, reject) => {
			trick_api.getAssets(analysisId).done(resolve).fail(() => reject([]));
		});

		let assetIDs = new Set(assets.map(e => e.id));
		let data = graph.save();
		let hasError = false;

		for (let edge of Object.values(data.edges)) {
			let source = data.nodes[edge.source]
			let target = data.nodes[edge.target]			
			if(!assetIDs.has(source.data.trickId) || !assetIDs.has(target.data.trickId)){
				hasError = true;
				break;
			}			
		}

		if (hasError) {
			self.error_dialog_factory.create().show({ "msg": "Please synchronise with TRICK Service and try again!", "title": "Saving dependency graph" });
			dialoagCallback();
		} else {
			trick_api.saveAssetDependencies(analysisId, JSON.stringify(data))
				.fail(() => {
					self.error_dialog_factory.create().show({ "msg": "TRICK Service server return an error while saving data!", "title": "Saving dependency graph" })
				})
				.always(() => dialoagCallback());
		}
	};
	this.trick_save_load_dialog_factory.create(this.dependency_graph, callback).show();
}

UserInterface.prototype.load = function (file) {
	let self = this;
	this.history.disable();
	let file_name = file.name;
	// Check the file type and before Loading
	let file_ext = file_name.split('.').pop();
	if (file_ext == "json") {
		this.dependency_graph.loadFile(file, function () {
			self.dependency_graph.cy.fit();
			self.history.enable();
			self.history.add(self.dependency_graph.saveString());
		});
	} else if (file_ext == "xlsx" || file_ext == "xls" || file_ext == "xlsm") {
		self.dependency_graph.clear();
		this.importExcelFile(file);
	} else {
		alert("Unsupported file type");
	}
};

/* Check if Asset is a Valid Asset Type. This is a case insensitive comparison
 */
function _checkHasValidAssetTypes(inputAssetType) {
	return mapOfSupportedAssetsLC.get(inputAssetType.toLowerCase()) !== undefined
}

/**
 * This function transforms the internally loaded json data into internal DS map of maps (mapJsonIndexToArrayAssetKey)
 *  The format of the excel sheet from which the data is loaded is expected to be as:
 *  _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ Any Data Ignored by parser  _ _ _ _ _
 *  _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ Any Data  Ignored by parser _ _ _ _ _
 * AssetList |  AssetType    |  Asset1         | Asset2 | Asset3 | Asset4 ... 
 * Asset1     | ValassetType  |  p(1/0/Bet(0/1)  | P     | P      | P
 * Asset2     |  ValassetType | p                | p     | p      | p
 * 
 * In terms of JSON this data is represented as below:
 * 0  : ......
 * 1  : ......
 * 2  : {A(AssetList), B(AssetType), C(Asset1), D(Asset2), E(Asset3), F(Asset4)
 * 3  : {A(Asset1), B(ValassetType), C(1/0/p), D...}
 * 4  : {A(Asset2), ....}
 * Where P is the probability of edge between two assets it can be 0/1/between 0 and 1/undefined.
 * Undefined probability is treated as 0
 * For list of valid assets look at function _compatConvertAssetType in dependencygraph.js
 * In this function the AssetList gets converted to Graph Nodes and the 1/0/p entries are converted to edges between node 
 * on A Colum to Row in C, D, E...
 * 
 * @param {*} jsonData 
 * @returns : errorStatus: True if error occured
 * 			  mapJsonIndexToArrayAssetKey: The internal DS created
 * 
 */
function _readJSONDataToInternalDS(jsonData) {
	
	let mapJsonIndexToArrayAssetKey = new Object();
	let assetIndex = -1;
	let errorStatus = false;
	try {	
			let foundAssetIndex = false;
			let length = jsonData.length;
			for (let i = 0; i < length; i++) {
				if (!foundAssetIndex) {
					if (jsonData[i]['A'] == CONST_ASSET_IT) {
						if (jsonData[i]['B'] == CONST_ASSET_TYPE) {
							foundAssetIndex = true;
							assetIndex = i;
						}
					} 
				} else {
					mapJsonIndexToArrayAssetKey[jsonData[i]['A']] = [];
					mapJsonIndexToArrayAssetKey[jsonData[i]['A']][CONST_ASSET_TYPE] = jsonData[i]['B'];
				}
			}

			if (!foundAssetIndex) {
				let msg = 'The imported excel file with worksheet \"Dependency\" does not have ' + CONST_ASSET_IT + ' in first Column or ' + CONST_ASSET_TYPE + ' in second column';
				throw new Error(msg);
			}

			// Created Map of Maps:
			for (let key in mapJsonIndexToArrayAssetKey) {
				for (let subkey in mapJsonIndexToArrayAssetKey) {
					mapJsonIndexToArrayAssetKey[key][subkey] = 0;
				}
			}

			// Example:
			//jsonData[i]['A'] -> Key of mapJsonIndexToArrayAssetKey 
			//jsonData[i]['C'] -> Value 
			//jsonData[assetIndex]['C'] -> Column header of 2nd entry in the map

			for (let i = assetIndex + 1; i < length; i++) {
				for (let keys in jsonData[i]) {
					if (keys != 'A' && keys != 'B') {						
						if (jsonData[i][keys] != undefined) {
							mapJsonIndexToArrayAssetKey[jsonData[i]['A']][jsonData[assetIndex][keys]] = jsonData[i][keys];
						} else {
							mapJsonIndexToArrayAssetKey[jsonData[i]['A']][jsonData[assetIndex][keys]] = 0;
						}
					}
				}
			}
	} catch (error) {
		errorStatus = true;
		_addImportExcelErrorMsg(error);
	}

	return {errorStatus, mapJsonIndexToArrayAssetKey};
}

/**
 * This function does a sanity of Probability values of Source and Target assets in the excel sheet
 * @param {*} sourceID : 
 * @param {*} mapJsonIndexToArrayAssetKey 
 * @returns errrorStatus : True| False
 */
function _sanityProbability(sourceID, mapJsonIndexToArrayAssetKey) {

	let errorStatus = false;
	try {	
		for (let targetID in mapJsonIndexToArrayAssetKey[sourceID]) {
			if (targetID != CONST_ASSET_TYPE && mapJsonIndexToArrayAssetKey[sourceID][targetID] != 0) {
				// check if  mapJsonIndexToArrayAssetKey[sourceID][targetID]  is a number should be  0, 1 or between 0 and 1
				if (mapJsonIndexToArrayAssetKey[sourceID][targetID] != undefined &&
					typeof (mapJsonIndexToArrayAssetKey[sourceID][targetID]) != "number") {
					let msg = 'The excel file with worksheet \"Dependency\" has an asset value ( ' + mapJsonIndexToArrayAssetKey[sourceID][targetID] + ' ) which is not a number. Either do not specify anything or specify a number(probability) between 0 and 1';
					throw new Error(msg);
				} else if (mapJsonIndexToArrayAssetKey[sourceID][targetID] != undefined) {
					let numVal = mapJsonIndexToArrayAssetKey[sourceID][targetID];
					if (numVal < 0 || numVal > 1) {
						let msg = 'The excel file with worksheet \"Dependency\" has an asset value ( ' + numVal + ' ) which is not a number between 0 and 1. Specify a valid probability.';
						throw new Error(msg);
					}
				}
			}
		}
	}
	catch (error) {
		_addImportExcelErrorMsg(error);
		errorStatus = true;
	}
	return errorStatus;
}

/**
 * Check consistency of the generated Data with respect to the expectation; If not throw an error
 * Consistency expected:
 *  - assetList should not be empty
 *  - assetType must be one of the supported list of assets
 * 	- Probability must be either undefined or a number between 1 and 0 
 * NOTE: No edge is acceptable which means we create a node with only edges 
 * The data in map is expected to be as :
 * Asset1[assetType] , Asset1[Asset1] , Asset1[Asset2], Asset1[Asset3]
 * Asset2[assetType], Asset2[Asset1],   Asset1[Asset2], Asset2[Asset3]
 * @param {*} mapJsonIndexToArrayAssetKey : Internal DS
 * @returns 
 */
function _sanityInternalDS(mapJsonIndexToArrayAssetKey) {
	let errorStatus = false;
	try {	
		for (let key in mapJsonIndexToArrayAssetKey) {
			if (key == "") {
				let msg = 'The excel file with worksheet \"Dependency\" has an asset with empty label in ' + CONST_ASSET_IT + ' Column.';
				throw new Error(msg);
			}
			if (mapJsonIndexToArrayAssetKey[key][CONST_ASSET_TYPE] == "" || !_checkHasValidAssetTypes(mapJsonIndexToArrayAssetKey[key][CONST_ASSET_TYPE])) {
				let msg = 'The excel file with worksheet \"Dependency\" has an assetType (' + mapJsonIndexToArrayAssetKey[key][CONST_ASSET_TYPE] + ') which is not in list of supported list. (' + listOfSupportedAssets + ').';
				throw new Error(msg);
			}		 		
		
			if (_sanityProbability(key, mapJsonIndexToArrayAssetKey)) {
				errorStatus = true;
				return errorStatus; 
			}
		}
	} catch (error) {
		_addImportExcelErrorMsg(error);
		errorStatus = true;
	}
	return errorStatus;
}

/**
 * This function adds a Node or edge to the graph.
 * Node is added if it doesnt exist already
 * Edge :
 * Is updated if the existing edge doesnt have same probability as the matrix
 * Is removed if probability is 0 / not specified
 * Is added if it doesn't already exist 
 * @param {*} mapJsonIndexToArrayAssetKey 
 */
function _createGraphNodesFromInternalDS(mapJsonIndexToArrayAssetKey) 
{
	let mapOfIDsOfNodes = new Object();
	try {		
		// add nodes to the dependency_graph with null id (So an ID is created) or pick up an Id already 
		// existing in the graph with matching name and type
		for (let key in mapJsonIndexToArrayAssetKey) {
			let id = window.editor.dependency_graph.addNodeFromImportedFile("", key, mapJsonIndexToArrayAssetKey[key][CONST_ASSET_TYPE], false);
			mapOfIDsOfNodes[key] = id;
		}

		for (let key in mapJsonIndexToArrayAssetKey) {
			let idOfSource = mapOfIDsOfNodes[key];
			for (let subkey in mapJsonIndexToArrayAssetKey[key]) {
				if (subkey != CONST_ASSET_TYPE) {
					let idOfSink = mapOfIDsOfNodes[subkey];
					window.editor.dependency_graph.updateEdge(idOfSource, idOfSink, mapJsonIndexToArrayAssetKey[key][subkey]);
				}
			}
		}
	} catch (error) {
		_addImportExcelErrorMsg(error);
	}
}

/**
 * This function does :
 * - Reads JSON data to internal DS (_readJSONDataToInternalDS)
 * - Does sanity on the internal DS (_sanityInternalDS)
 * - Updated the Graph based on internal DS (_createGraphNodesFromInternalDS)
 * @param {*} jsonData 
 */
function _processJsonData(jsonData) {
	let length = 0;
	try {
		length = jsonData.length;
		if (length > 0) {			
			let returnValue = _readJSONDataToInternalDS(jsonData);
			
			if (!returnValue.errorStatus) {
				let mapJsonIndexToArrayAssetKey = returnValue.mapJsonIndexToArrayAssetKey;
				let sanityError = _sanityInternalDS(mapJsonIndexToArrayAssetKey);
				
				if (!sanityError) 
					_createGraphNodesFromInternalDS(mapJsonIndexToArrayAssetKey);
			}
			
		} else {
			let msg = 'The excel file with worksheet \"Dependency\" has no data';
			throw new Error(msg);
		}
		
	} catch (error) {
		_addImportExcelErrorMsg(error);
	}
}

/**
 * This function is an interface for dynamically displaying error messages
 * These error messages are so far limited to the data validation of imported excel sheet
 * But the error_dialog_factory can be reused for other purpose in future
 * @param {*} file : 
 */
function _addImportExcelErrorMsg(err) {
	let title = "Error Occured while loading excel Sheet";
	window.editor.error_dialog_factory.create(title).show({ msg: err });
}

UserInterface.prototype.closeModal = function () {
	$('#modalError').modal('hide');
}

/**
 * This function is the entry function to import an Excel file
 * It calls the XLSX library read function to convert the EXCEL file to JSON data
 * Further calls _processJsonData for further processing of the JSON data
 * @param {*} file 
 */
UserInterface.prototype.importExcelFile = function (file) {
	try {
		let reader = new FileReader();
		reader.readAsBinaryString(file);
		reader.onload = function (e) {
			let data = e.target.result;
			try {
				let workbook = XLSX.read(data, {
					type: 'binary'
				});
				/* reading data of sheet named Depdendency */
				let jsonData = XLSX.utils.sheet_to_json(workbook.Sheets["Dependency"],
					{
						defval: '',
						header: 'A'      
						/* Providing header='A' for flexibility as by default the first row is treated as the key names in JSON data     
						 * This will help keeping JSON data keyed on default column names of Excel 'A', 'B', 'C' ... making data manipulation easy    
						 * range: 'A3:E16' /// This doesnt help because we need to provide the endRange of excel sheet. Starting range can computed but end 
						 * range cannot be floating.
						 */
					}
				);
				if (jsonData == "") {
					let msg = 'The excel File "' + file.name + '" does not have a sheet with name "Dependency" or the sheet is empty. Try with a different file.';
					throw new Error(msg);
				}
				JSON.stringify(jsonData);
				_processJsonData(jsonData);
			} catch (e) {
				_addImportExcelErrorMsg(e);
			}
		}
	} catch (error) {
		_addImportExcelErrorMsg(error);
	}
};

UserInterface.prototype.clear = function () {
	let self = this;
	setTimeout(function () {
		if (confirm("Do you really want to clear the working area? All non-saved work will be lost."))
			self.dependency_graph.clear();
	}, 100);
};

UserInterface.prototype.arrangeHAlignLeft = function () {
	this.dependency_graph.arrangeHAlignLeft();
	this.history.add(this.dependency_graph.saveString());
};

UserInterface.prototype.arrangeHAlignCenter = function () {
	this.dependency_graph.arrangeHAlignCenter();
	this.history.add(this.dependency_graph.saveString());
};

UserInterface.prototype.arrangeHAlignRight = function () {
	this.dependency_graph.arrangeHAlignRight();
	this.history.add(this.dependency_graph.saveString());
};

UserInterface.prototype.arrangeVAlignBottom = function () {
	this.dependency_graph.arrangeVAlignBottom();
	this.history.add(this.dependency_graph.saveString());
};

UserInterface.prototype.arrangeVAlignCenter = function () {
	this.dependency_graph.arrangeVAlignCenter();
	this.history.add(this.dependency_graph.saveString());
};

UserInterface.prototype.arrangeVAlignTop = function () {
	this.dependency_graph.arrangeVAlignTop();
	this.history.add(this.dependency_graph.saveString());
};

UserInterface.prototype.arrangeHDistribute = function () {
	this.dependency_graph.arrangeHDistribute();
	this.history.add(this.dependency_graph.saveString());
};

UserInterface.prototype.arrangeVDistribute = function () {
	this.dependency_graph.arrangeVDistribute();
	this.history.add(this.dependency_graph.saveString());
};

UserInterface.prototype.colorEdges = function () {
	this.dependency_graph.colorEdges();
};

UserInterface.prototype.undo = function () {
	let state = this.history.undo();
	this.history.disable();
	if (state !== undefined)
		this.dependency_graph.loadString(state);
	this.history.enable();
};

UserInterface.prototype.redo = function () {
	let state = this.history.redo();
	this.history.disable();
	if (state !== undefined)
		this.dependency_graph.loadString(state);
	this.history.enable();
};

UserInterface.prototype.sync = function () {
	this.trick_sync_dialog_factory.create(this.dependency_graph).show();
};

UserInterface.prototype.compare = function () {
	this.trick_compare_dialog_factory.create(this.dependency_graph).show();
};

UserInterface.prototype.createNewAsset = function () {
	this.asset_dialog_factory.create().show({ name: "", type: "Info" });
};

UserInterface.prototype.saveAsset = function (form_selector) {
	let $form_selector = $(form_selector);
	let id = $form_selector.find("[name=id]").val();
	let name = $form_selector.find("[name=name]").val();
	let comment = $form_selector.find("[name=comment]").val();
	let type = $form_selector.find("[name=type]").val();
	let disabled = $form_selector.find("[name=disabled]").is(":checked");
	this.dependency_graph.addNode(id, name, type, comment, disabled);
};

UserInterface.prototype.saveEdge = function (form_selector) {
	let $form_selector = $(form_selector);
	let id = $form_selector.find("[name=id]").val();
	let p = parseFloat($form_selector.find("[name=p]").val());
	if (p != 1) {
		/* For backward compatibility a probability 1 is implicit and need not be saved explicitly */
		this.dependency_graph.setEdgeData(id, isNaN(p) ? undefined : Math.min(1, Math.max(0, p)));
	}
};