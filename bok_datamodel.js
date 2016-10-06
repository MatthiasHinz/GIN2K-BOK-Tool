// used to declare the relation-type within for relation Objects (the string should be matching the css-class name as well as the parsed node-object attributes)
//At the moment, only "similarConcept" is a symmetric binary relation,
//postrequisites and prerequesites are asymmetric without a correspondend 'reverse' relationship,
//TODO: you may want to introduce additional relationships types here, e.g. "isPostrequisiteOf"
var Relationtype = {
	SIMILAR : "similarConcepts",
	PREREQUISITE : "prerequisites",
	POSTREQUISITE : "postrequisites"
};

// d3-compliant java object node with default values:
CostumD3Node = function() {
	this.name;
	//field required by D3
	this.nameShort = "";
	this.description = "";
	this.size = 100;
	//field required by D3, equals super-concept:
	this.parent = null;
	//field required by D3, equals subconcepts
	this.children = [];
	//other relations equal to 'relationtype'
	this.prerequisites = [];
	this.postrequisites = [];
	this.similarConcepts = [];

	this.demonstrableSkills = [];
	this.sourceDocuments = [];
};

// data structure that represent a relation between to concpets of a given type, e.g. similar concept, prerequisite concept...
Relation = function(sourceID, targetID, type) {
	this.source = sourceID;
	this.target = targetID;
	this.type = type;
	this.id = Math.random();
};
/**
 * Indicates if two relations are identical (have the same id)
 * Note that detecting dublicates would require comparism of each attribute rather than the id
 */
Relation.prototype.equals = function(relation) {
	return this.id == relation.id;
};

Relation.prototype.similar = function(relation) {
	return (this.source == relation.source && this.target == relation.target && this.type == relation.type) ||
	//for reflexive relationships:
	(this.type == Relationtype.SIMILAR && this.type == relation.type && this.target == relation.source && this.source == relation.target);

};

RelationCollection = function() {
	this.relations = [];
	this.sources = [];
	this.targets = [];
};

RelationCollection.prototype.getRelationsForSource = function(conceptID) {
	var output = [];
	for (var i = 0; i < this.sources.length; i++) {
		var j = this.sources.indexOf(conceptID, i);
		if (j == -1)
			break;
		else {
			output.push(this.relations[j]);
			i = j;
		}
	}

	//for 'similar' concepts
	for (var i = 0; i < this.targets.length; i++) {
		var j = this.targets.indexOf(conceptID, i);
		if (j == -1)
			break;
		else {
			i = j;
			var rel = this.relations[j];
			if (rel.type == Relationtype.SIMILAR) {
				//create new relation with source and target swapped
				output.push(new Relation(conceptID, rel.source, Relationtype.SIMILAR));
			} else
				continue;
		}
	}
	return output;
};

RelationCollection.prototype.getRelationsForTarget = function(conceptID) {
	var output = [];
	for (var i = 0; i < this.targets.length; i++) {
		var j = this.targets.indexOf(conceptID, i);
		if (j == -1)
			break;
		else {
			output.push(this.relations[j]);
			i = j;
		}
	}
	//for 'similar' concepts
	for (var i = 0; i < this.sources.length; i++) {
		var j = this.sources.indexOf(conceptID, i);
		if (j == -1)
			break;
		else {
			i = j;
			var rel = this.relations[j];
			if (rel.type == Relationtype.SIMILAR) {
				//create new relation with source and target swapped
				output.push(new Relation(target, conceptID, Relationtype.SIMILAR));
			} else
				continue;
		}
	}
	return output;
};

// you may want to implement other methods like remove or getRelationsForTarget if needed. Or replace this data structure with one more efficient
RelationCollection.prototype.add = function(relation) {
	//if a similar relationship exists, don't add
	for (var i = 0; i < this.relations.length; i++) {
		if (this.relations[i].similar(relation))
			return;
	};
	this.relations.push(relation);
	this.sources.push(relation.source);
	this.targets.push(relation.target);
};


parseBOKData = function(bokXML) {
	var relations = parseRelationships(bokXML);
	var d3hierarchy = parseConcepts(bokXML.documentElement, relations);

	return {
		nodes : d3hierarchy.concepts,
		relations : relations,
		namehash : d3hierarchy.namehash
	};

};

/**
 * Parses all relationships between the concepts from the XML
 * returns a relationCollection as defined above
 */
parseRelationships = function(bokXML, relations) {
	//TODO: Do something with the bokXML-DOM here in order to find relationships between the concepts. For now only fake-data is created
	var relations = new RelationCollection();
	var rel = new Relation("AM", "GC", Relationtype.PREREQUISITE);
	relations.add(rel);
	rel = new Relation("AM", "DM", Relationtype.POSTREQUISITE);
	relations.add(rel);
	rel = new Relation("AM", "GC", Relationtype.SIMILAR);
	relations.add(rel);
	rel = new Relation("CF6-4", "DM1", Relationtype.SIMILAR);
	relations.add(rel);
	rel = new Relation("GD5-2", "GC6-1", Relationtype.SIMILAR);
	relations.add(rel);
	rel = new Relation("CF4-1", "GD11-1", Relationtype.POSTREQUISITE);
	rel = new Relation("CF4-1", "GD11-1", Relationtype.PREREQUISITE);
	relations.add(rel);

	return relations;
};

/**
 * This is a recursive function which parses concepts
 */
parseConcepts = function(XMLnode, relations, namehash) {
	//the namehash is intended as a convenient way to go from conceptid to the full concept name:
	if (namehash == null)
		namehash = {};

	//XMLnode.attributes.getNamedItem("NameLong").nodeValue;//XMLnode.getAttribute("NameLong");
	var d3output = new CostumD3Node();

	//the short name should be sufficient as a unique id for each node. You might want to change this however...
	d3output.id = XMLnode.getAttribute("NameShort");
	// +"_"+Math.round(Math.random()*1000); //create unique ids

	d3output.name = XMLnode.getAttribute("NameLong");

	/*parse all other attributes in a generic way
	 TODO If you need to parse, rename or add special handling to certain attributes, this would be a good place to add modifications:
	 */
	var attrMap = XMLnode.attributes;
	for (var i = 0; i < attrMap.length; i++) {
		var attr = attrMap.item(i);
		//write attribute to object with first letter lowercase:
		var name = attr.name;

		if (name == "NameLong")
			continue;
		name = name.charAt(0).toLowerCase() + name.slice(1);
		d3output[name] = attr.value;
	}

	namehash[d3output.id] = d3output.name;

	//adds relationships to other concepts as attribute
	var relation_list = relations.getRelationsForSource(d3output.id);
	for (var i = 0; i < relation_list.length; i++) {
		var rel = relation_list[i];
		d3output[rel.type].push(rel.target);
	}

	//Adds childe nodes and objectives:
	for (var i = 0; i < XMLnode.childNodes.length; i++) {
		if (XMLnode.childNodes[i].nodeType == 1) {//node type 1 is an xml element, 2 is attribute, 3 is text...
			if (XMLnode.childNodes[i].nodeName == "Objective") {
				//Special handling of objectives so that they are NOT displayed in the graph but in the box
				if (d3output.objectives == null)
					d3output.objectives = [];
		
				var objectiveObject = {};
				var attrMap = XMLnode.childNodes[i].attributes;
				for (var j = 0; j < attrMap.length; j++) {
					var attr = attrMap.item(j);
					//write attribute to object with first letter lowercase:
					objectiveObject[attr.name.charAt(0).toLowerCase() + attr.name.slice(1)] = attr.value;
				}
				d3output.objectives.push(objectiveObject);

			} else {
				//RECURSION, add child elements:
				d3output.children.push(parseConcepts(XMLnode.childNodes[i], relations, namehash).concepts);
			}

		}
	}

	return {
		concepts : d3output,
		namehash : namehash
	};
}; 