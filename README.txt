Developer notes (2015-01-07, by Matthias Hinz)
-----------------------------------------------

This website is depends on the following libraries and frameworks, everything else is written in native javascript, HTML and CSS:

- YAML CSS framework (http://www.yaml.de/): used for frame layout, boxes, header, fonts
- D3 Javascript library (http://d3js.org/): 
	* Visualization of the BoK based on the D3 pack layout (https://github.com/mbostock/d3/wiki/Pack-Layout)
	* Based on the example of zoomable circle packing (http://bl.ocks.org/mbostock/7607535)
- jQuery UI and jQuery javascript libraries: Used for the 'accordion' layout component in the description-box (http://jqueryui.com/accordion/)


The file system is organized as the following:

- bok_local (folder): Contains cached from the BoK service. The XML-file "gistbok1hierarchy.xml" is used in case the service is unavailable.
- css (folder): css framework and "styles.css" file defining costum css properties of layout components and parts of the D3-visualisation
- d3; jquery-ui-1.11.2.custom; yaml412-130728_resources (folders): Unmodified resources from dependent libraries / frameworks

- index.html (file): HTML defining basic layout, placeholders for description and visualization, loads CSS and javascipt
- bok_main.js (file): Executes javascript incide the body-tag with all other scripts pre-loaded in the html-header, defines behevioural parameters
- bok_datamodel.js (file): Creates a d3-compliant data model of the BoK based on the given XML-DOM, starting from parseBOKData(bokXML)
- bok_visualization.js (file): 
	* Functionality to visualize the BoK with D3 (starting from displayBOK(bokData))
	* Implements behaviour of layout components (accordion, show more/less buttons)
	* Function displayConcept(d, namehash) displays all data about the concept that is currently on focus ('d') in the textbox beneath the graph

