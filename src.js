function loadJSON(fileName, callback) {   

	var xobj = new XMLHttpRequest();
	    xobj.overrideMimeType("application/json");
	xobj.open('GET', fileName, true); // Replace 'my_data' with the path to your file
	xobj.onreadystatechange = function () {
	      if (xobj.readyState == 4 && xobj.status == "200") {
	        // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
	        callback(xobj.responseText);
	      }
	};
	xobj.send(null);  
}

var allParameters = {}
var allSimulations = {}

function setContents(id, html)
{
	document.getElementById(id).innerHTML = html;
}

function addContent(id, html)
{
	document.getElementById(id).innerHTML += html;
}

function generateMenu(simulations)
{
	for(var i in simulations) {
		var simulation = simulations[i]
		allSimulations[simulation.folder] = simulation

		var parameters = simulation.parameters
		for(var parameter in parameters) {
			var value = parameters[parameter]
			if(allParameters[parameter] === undefined) {
				allParameters[parameter] = {}
			}
			console.log(parameter, ": ", value)
			allParameters[parameter][value] = 1
		}
	}

	var htmlObject = ""
	for(parameter in allParameters) {
		htmlObject += parameter+":<br> <select id=\""+parameter+`" class="menu"><option value="all">all</option>`
		for(value in allParameters[parameter]) {
			htmlObject+="<option value=\""+value+"\">"+value+"</option>"
		}
		htmlObject+="</select><br>"
	}
	setContents("nav", htmlObject)
}

function addSimulation(simulation)
{

}

function update()
{
	setContents("main", "")
	for(var simulation in allSimulations) {
		addContent("main", simulation+"<br>")
	}
}

function start()
{
	loadJSON("GePPITSimulationEnsembleInfo.json", function(responseText) {
		var simulations = JSON.parse(responseText)
		generateMenu(simulations)
		update()
	})
}