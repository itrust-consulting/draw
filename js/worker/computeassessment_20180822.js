var enabled = false;
var defaultProbability = 0.5;

self.addEventListener("message", function(event) {
	switch (event.data.command) {
		case "start":
			if (!enabled) {
				enabled = true;
				compute(event.data.graph, event.data.assessments);
			}
			break;
		case "stop":
			enabled = false;
			break;
	}
});

function compute(graph, assessments) {
	self.postMessage({ status: "Preparing ...", progress: 0 });

	var numIterations = 10000;
	var maxTime = 30e3;

	var timeStart = new Date();
	var timeLastMessage = timeStart;

	// Prepare matrix that counts/computes the indirect probabilties
	var countMatrix = {};
	var countMatrix_rev = {};
	for (var nodeId in graph.nodes) {
		countMatrix[nodeId] = {};
		countMatrix_rev[nodeId] = {};
	}

	// Prepare edge matrix for graph
	graph.edgematrix = {};
	graph.edgematrix_rev = {};
	for (var nodeId in graph.nodes) {
		graph.edgematrix[nodeId] = {};
		graph.edgematrix_rev[nodeId] = {};
	}
	for (var i = 0; i < graph.edges.length; i++) {
		var p = graph.edges[i].p || defaultProbability;
		graph.edgematrix[graph.edges[i].source][graph.edges[i].target] = p;
		graph.edgematrix_rev[graph.edges[i].target][graph.edges[i].source] = p;
	}

	// Match nodes to trickId
	var nodes_by_trickid = {};
	for (var nodeId in graph.nodes)
		if (graph.nodes[nodeId].data.trickId)
			nodes_by_trickid[graph.nodes[nodeId].data.trickId] = nodeId;

	// Find root nodes
	var is_root_node = {};
	var is_root_node_rev = {};
	for (var nodeId in graph.nodes) {
		is_root_node[nodeId] = true;
		is_root_node_rev[nodeId] = true;
	}
	for (var i = 0; i < graph.edges.length; i++) {
		is_root_node[graph.edges[i].target] = false;
		is_root_node_rev[graph.edges[i].source] = false;
	}

	// Group assessments by asset/scenario
	var assessments_grouped = {};
	for (var i = 0; i < assessments.length; i++) {
		var a = assessments[i];
		if (!(a.asset.id in assessments_grouped))
			assessments_grouped[a.asset.id] = {};
		assessments_grouped[a.asset.id][a.scenario.id] = a;
	}

	self.postMessage({ status: "Computing dependencies ..." });

	// Launch `numIterations` simulation rounds
	var numIterationsDone;
	for (numIterationsDone = 0; numIterationsDone < numIterations && enabled; numIterationsDone++) {
		var now = new Date();

		// Time limit
		if (now - timeStart > maxTime)
			break;

		// Periodically send progress
		if (now - timeLastMessage > 1e3) {
			self.postMessage({ progress: .95 * Math.max((now - timeStart) / maxTime, numIterationsDone / numIterations) });
			timeLastMessage = now;
		}

		// Do the simulation
		var reachable;
		for (var nodeId in graph.nodes) {
			// Compute accumulated weights for dependency graph
			reachable = findReachableNodes(graph.edgematrix, nodeId);
			for (var i = 0; i < reachable.length; i++)
				countMatrix[nodeId][reachable[i]] = (countMatrix[nodeId][reachable[i]] || 0) + 1;

			// Compute accumulated weights for dependency graph with all edges reversed
			reachable = findReachableNodes(graph.edgematrix_rev, nodeId);
			for (var i = 0; i < reachable.length; i++)
				countMatrix_rev[nodeId][reachable[i]] = (countMatrix_rev[nodeId][reachable[i]] || 0) + 1;
		}
	}

	self.postMessage({ status: "Deriving assessments ...", progress: .95 });

	// Compute new estimations
	for (var i = 0; i < assessments.length; i++) {
		var assessment = assessments[i];
		var nodeId = nodes_by_trickid[assessment.asset.id];

		// Handle case where the asset does not have a matching node in the graph
		if (nodeId === undefined) {
			assessment.likelihood_new = assessment.likelihood;
			assessment.impacts_new = assessment.impacts;
			continue;
		}

		// Likelihoods
		assessment.likelihood_new = is_root_node[nodeId] ? assessment.likelihood : 0;
		for (var rootNode in countMatrix) {
			var rootAssetId = graph.nodes[rootNode].data.trickId;
			if (rootAssetId !== undefined) {
				var rootLikelihood = (assessments_grouped[rootAssetId][assessment.scenario.id] || {}).likelihood || 0;
				assessment.likelihood_new += rootLikelihood * (countMatrix[rootNode][nodeId] || 0) / numIterationsDone;
			}
		}

		// Impacts
		assessment.impacts_new = {};
		for (var impactId in assessment.impacts) {
			assessment.impacts_new[impactId] = is_root_node_rev[nodeId] ? assessment.impacts[impactId] : 0;
			for (var rootNode in countMatrix) {
				var rootAssetId = graph.nodes[rootNode].data.trickId;
				if (rootAssetId !== undefined) {
					var rootImpact = (assessments_grouped[rootAssetId][assessment.scenario.id] || {impacts:{}}).impacts[impactId] || 0;
					assessment.impacts_new[impactId] += rootImpact * (countMatrix_rev[rootNode][nodeId] || 0) / numIterationsDone;
				}
			}
		}
	}

	// Send result
	self.postMessage({ status: "Done.", progress: 1, result: assessments });
}

function findReachableNodes(edgematrix, startNode) {
	var visited = {};
	var queue = [];
	queue.push(startNode);
	while (queue.length > 0)
	{
		var sourceNode = queue.shift();
		for (var targetNode in edgematrix[sourceNode])
		{
			if (visited[targetNode]) continue;
			if (Math.random() > edgematrix[sourceNode][targetNode]) continue;

			visited[targetNode] = true;
			queue.push(targetNode);
		}
	}
	return Object.keys(visited);
}
