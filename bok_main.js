//set this variable true if the cached Bok-xml should be used if the service is not available. Set false if just an error shoudl be displayed
var USE_CACHED_XML = true;

//last retrieval of the chached version of bok xml (located under bok_local/gistbok1hierarchy.xml)
var CACHE_RETRIEVAL_DATE = "Dec 30th, 2014";


var margin = 0, diameter = 600;

var color = d3.scale.linear().domain([-1, 5]).range(["hsl(152,80%,80%)", "hsl(228,30%,40%)"]).interpolate(d3.interpolateHcl);

var pack = d3.layout.pack().padding(2).size([diameter - margin, diameter - margin]).value(function(d) {
	return d.size;
});

var svg = d3.select("#bubble").append("svg").attr("width", diameter).attr("height", diameter).append("g").attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");

d3.xml("http://gin2k.bigknowledge.net/gistbok/services/gistbok1hierarchy", "application/xml", function(bokXML) {

	if (bokXML == null) {//if service is not available either use cached version or just display error:
		if (USE_CACHED_XML) {
			
			d3.xml("bok_local/gistbok1hierarchy.xml", "application/xml", function(bokXML) {
				var bokData = parseBOKData(bokXML);
				return displayBOK(bokData);
			});
				document.getElementById("infobox").innerHTML += "<br><div class='box error'>BOK service is not available. A cached version of the Body of Knowledge is displayed. (Retrieved: "
							+CACHE_RETRIEVAL_DATE+"\)<div>";
		} else {
			// if you don't want to use cached BOK and only display error message
			d3.selectAll("#infobox").attr("class", "box error");
			document.getElementById("headline").innerHTML = "Error";
			document.getElementById("description").innerHTML = "The BoK service is not available";

			return;
		}
	} else {
		var bokData = parseBOKData(bokXML);  //--> refer to bok_datamodel.js
		return displayBOK(bokData); //--> refer to bok_visualization.js
	};
});

d3.select(self.frameElement).style("height", diameter + "px");


