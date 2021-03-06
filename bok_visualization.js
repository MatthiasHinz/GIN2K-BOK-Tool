/**
 * Defines functionality for the "show more / show less" buttons of the description field, which appear when the text exceeds the textfield's dimensions
 */
showMoreLess = function() {
	var conceptDescription = document.getElementById("currentDescription");
	var moreButtons = document.getElementsByClassName("moreButton");
	if (moreButtons[0].innerHTML == "show less...") {
		conceptDescription.className = "hideContent";
	} else
		conceptDescription.className = "showContent";

	for (var i = 0; i < moreButtons.length; i++) {
		var moreButton = moreButtons[i];

		if (moreButton.innerHTML != "show less...") {
			moreButton.innerHTML = "show less...";
		} else {
			moreButton.innerHTML = "show more...";
		};

	};
};

/**
 * This function builds up the whole d3-pack layout for the visualization 
 */
displayBOK = function(bokData) {
	if (bokData == null) {//This message should never occur if the code if the code is sustained properly...
		alert('An unexpected error occured. BOK cannot be displayed.');
		return;
	}

	var root = bokData.nodes;

	//Note that the pack.nodes-function changes the order of elements in the children-arrays (--> Subconcepts)
	var focus = root, nodes = pack.nodes(root), view;
	displayConcept(root, bokData.namehash);

	var circle = svg.selectAll("circle").data(nodes).enter().append("circle").attr("id", function(d) {
		return d.id;
	}).attr("r", function(d) {
		return d.r;
	}).attr("x", function(d) {
		return d.x;
	}).attr("y", function(d) {
		return d.y;
	}).attr("class", function(d) {
		return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root";
	}).style("fill", function(d) {
		return d.children ? color(d.depth) : null;
	}).on("click", function(d) {
		if (focus !== d)
			zoom(d), d3.event.stopPropagation();
	}).on("mouseover", function(d) {
		hoverConcepts(d);
	}).on("mouseleave", function(d) {
		unHoverConcepts(d);
	});

	createArrows(bokData.relations);
	var lines = d3.selectAll("line");

	createLabels(nodes, root);

	var node = svg.selectAll("circle,text");

	d3.select("#bubble")
	// uncomment this line if you wish a colored background of the bubble chart:
	//.style("background", color(-1))
	.on("click", function() {
		zoom(root);
	});

	zoomTo([root.x, root.y, root.r * 2 + margin]);

	function zoom(d) {
		displayConcept(d, bokData.namehash);
		var focus0 = focus;
		focus = d;

		var transition = d3.transition().duration(d3.event.altKey ? 7500 : 750).tween("zoom", function(d) {
			var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + margin]);
			return function(t) {
				zoomTo(i(t));
			};
		});

		transition.selectAll("text").filter(function(d) {
			if (d.name == "Spatial interaction") {

				var i;
			}
			return d.parent === focus || this.style.display === "inline" || (d === focus && (d.children == null || d.children == []));
		}).style("fill-opacity", function(d) {
			return d.parent === focus || (d === focus && (d.children == null || d.children == [])) ? 1 : 0;
		}).each("start", function(d) {
			if (d.parent === focus || (d === focus && (d.children == null || d.children == [])))
				this.style.display = "inline";
		}).each("end", function(d) {
			if (d.parent !== focus && (d !== focus && (d.children == null || d.children == [])))
				this.style.display = "none";
		});
	}

	function zoomTo(v) {
		var k = diameter / v[2];
		view = v;
		node.attr("transform", function(d) {
			return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")";
		});

		lines.attr("x1", function(d) {
			return (d.x01 - v[0]) * k;
		});
		lines.attr("y1", function(d) {
			return (d.y01 - v[1]) * k;
		});
		lines.attr("x2", function(d) {
			return (d.x02 - v[0]) * k;
		});
		lines.attr("y2", function(d) {
			return (d.y02 - v[1]) * k;
		});

		circle.attr("r", function(d) {
			return d.r * k;
		});
	}

};

//displays all available content for the currently focussed concept in the description box:
displayConcept = function(d, namehash) {
	//display Name and shortcode of concept:
	document.getElementById("headline").innerHTML = "[" + d.nameShort + "] " + d.name;

	//display description of concept.
	var description = document.getElementById("description");
	if (d.description != null) {
		var headline = "<h5>Description:</h5>";
		var currentTxt = "<div id='currentDescription' class='hideContent'>" + d.description + "</div>";
		description.innerHTML = headline + currentTxt;
		var current = document.getElementById("currentDescription");

		//insert 'more'-buttons:
		if (current.scrollHeight > current.clientHeight) {
			var moreButton1 = "<h5>Description (<a class='moreButton' href='#' onclick='showMoreLess()' style='text-align: right'>show more...</a>):</h5> ";
			var moreButton2 = "<div align='right'><a class='moreButton' href='#' onclick='showMoreLess()' style='text-align: right'>show more...</a></div>";
			description.innerHTML = moreButton1 + currentTxt + moreButton2;
		}
	} else
		description.innerHTML = "";

	domElement = document.getElementById("accordion");
	document.getElementById("accordion").innerHTML = "";
	var rndID = (Math.random() + "").replace(".", "");
	domElement.innerHTML = "<div id='" + rndID + "'></div>";
	domElement = document.getElementById(rndID);

	// Display hierarchy of parent concepts in a definition list:
	if (d.parent != null) {
		parents = [];
		//trace all parents upwards from the hierarchy
		for (var p = d.parent; p != null; p = p.parent) {
			parents.push(p);
		}
		var tab = "";
		var text = "<h5>Superconcepts (" + parents.length + ") :</h5><div><dl>";
		text += "<dt>" + parents.pop().name + "";
		tab += "</dt>";

		while (parents.length > 0) {
			text += "<dd><dl><dt>" + parents.pop().name + "</dt>";
			tab += "</dl></dd>";
		}
		text += tab + "</dl></div>";

		domElement.innerHTML = text;
	} else
		domElement.innerHTML = "";

	//display description of subconcepts (if any):
	displayUnorderedList(d.children, "name", "Subconcepts", domElement);

	//display description of prerequisites (if any):
	displayUnorderedList(d.prerequisites, null, "Prequisites", domElement, namehash);

	//display description of postrequisites (if any):
	displayUnorderedList(d.postrequisites, null, "Postrequisites", domElement, namehash);

	//display description of similar concepts (if any):
	displayUnorderedList(d.similarConcepts, null, "Similar concepts", domElement, namehash);

	//display description of demonstrable skills (if any):
	displayUnorderedList(d.demonstrableSkills, null, "Demonstrable skills", domElement);

	//display objectives of concept (only applies to 'Topics'):
	displayUnorderedList(d.objectives, "description", "Objectives", domElement);

	//display source documents of concept (if any):
	displayUnorderedList(d.sourceDocuments, null, "Source documents", domElement);

	$("#" + rndID).accordion({
		header : "h5",
		heightStyle : "content",
		collapsible : true
	});

};

//displays a list of textelements in HTML
displayUnorderedList = function(array, propertyname, headline, domElement, namehash) {
	if (array != null && array.length != 0) {
		var text = "";
		text += "";
		text += "<h5>" + headline + " (" + array.length + ") :</h5><div><ul>";
		for (var i = 0, j = array.length; i < j; i++) {
			var value;
			if (propertyname != null)
				value = array[i][propertyname];
			else
				value = array[i];
			if (namehash != null) {
				value = namehash[value];
			}

			text += "<li>" + value + "</li>";
		};
		text += "</ul></div>";
		domElement.innerHTML += text;
	} //else
	//	domElement.innerHTML = "";
};

createArrows = function(relations) {
	relations = relations.relations;

	for (var i = 0, j = relations.length; i < j; i++) {

		//retrieve x,y coordinates and radius for circles to be connected
		xs = parseFloat(d3.selectAll("circle[id=" + relations[i].source + "]").attr("x"));
		ys = parseFloat(d3.selectAll("circle[id=" + relations[i].source + "]").attr("y"));
		rs = parseFloat(d3.selectAll("circle[id=" + relations[i].source + "]").attr("r"));

		xt = parseFloat(d3.selectAll("circle[id=" + relations[i].target + "]").attr("x"));
		yt = parseFloat(d3.selectAll("circle[id=" + relations[i].target + "]").attr("y"));
		rt = parseFloat(d3.selectAll("circle[id=" + relations[i].target + "]").attr("r"));

		d_st = Math.sqrt(Math.pow(xs - xt, 2) + Math.pow(ys - yt, 2));

		relations[i].y01 = ys - (rs * (ys - yt)) / d_st;
		relations[i].x01 = (relations[i].y01 - ys) * (xt - xs) / (yt - ys) + xs;

		relations[i].y02 = yt - (rt * (yt - ys)) / d_st;
		relations[i].x02 = (relations[i].y02 - yt) * (xt - xs) / (yt - ys) + xt;
	};

	var padx = 0;
	var pady = 0;
	var lines = svg.selectAll("line").data(relations).enter().append("line").attr("class", function(d) {
		return d.type;
	}).attr("marker-end", function(d) {
		if (d.type == Relationtype.POSTREQUISITE)
			return "url(#post)";
		else
			return null;
	}).attr("marker-start", function(d) {
		if (d.type == Relationtype.PREREQUISITE)
			return "url(#pre)";
		else
			return null;
	});

	svg.append("svg:defs").selectAll("marker").data(["post"]).enter().append("svg:marker").attr("id", String).attr("viewBox", "0 -5 10 10").attr("refX", 10).attr("refY", 0).attr("markerWidth", 7).attr("markerHeight", 10).attr("orient", "auto").append("svg:path").attr("d", "M0,-3.5L10,0L0,3.5z");
	svg.append("svg:defs").selectAll("marker").data(["pre"]).enter().append("svg:marker").attr("id", String).attr("viewBox", "0 -5 10 10").attr("refX", 0).attr("refY", 0).attr("markerWidth", 7).attr("markerHeight", 10).attr("orient", "auto").append("svg:path").attr("d", "M10,-3.5L0,0L10,3.5z");

	return lines;
};

createLabels = function(nodes, root) {
	var text = svg.selectAll("text").data(nodes).enter().append("text").attr("class", "label").style("fill-opacity", function(d) {
		return d.parent === root || (d === root && d.children == null) ? 1 : 0;
	}).style("display", function(d) {
		return d.parent === root || (d === root && d.children == null) ? null : "none";
	}).each(function(d) {//This function inserts a label and adds linebreaks, avoiding lines > 13 characters
		var arr = d.name.split(" ");

		var arr2 = [];
		arr2[0] = arr[0];
		var maxLabelLength = 13;
		for (var i = 1, j = 0; i < arr.length; i++) {

			if (arr2[j].length + arr[i].length < maxLabelLength)
				arr2[j] += " " + arr[i];
			else {
				j++;
				arr2[j] = arr[i];
			}
		}

		for (var i = 0; i < arr2.length; i++) {
			d3.select(this).append("tspan").text(arr2[i]).attr("dy", i ? "1.2em" : (-0.5 * (j - 1)) + "em").attr("x", 0).attr("text-anchor", "middle").attr("class", "tspan" + i);
		}
	});
};

/**
 * TODO: you may add some visualization for hovered concepts here. This code in comments, however, does not work yet:
 */
hoverConcepts = function(concept) {
	/*for (var i = 0, j = concept.similarConcepts.length; i < j; i++) {
	 circle = svg.selectAll("circle").select("#" + concept.similarConcepts[i]);
	 circle.style({
	 "stroke" : "black",
	 'stroke-width' : 2
	 });
	 };*/
};

unHoverConcepts = function(concept) {

};
