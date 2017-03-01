function loadJSON(fileName, callback, simulation) {   
	jsonLoadPending++
	var xobj = new XMLHttpRequest();
	    xobj.overrideMimeType("application/json")
	xobj.open('GET', fileName, true) // Replace 'my_data' with the path to your file
	xobj.onreadystatechange = function () {
	      if (xobj.readyState == 4 && xobj.status == "200") {
	        // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
	        jsonLoadPending--
	        callback(xobj.responseText, simulation)
	      }
	};
	xobj.send(null);  
}
var jsonLoadPending = 0
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
		
		var parameters = simulation.parameters
		for(var parameter in parameters) {
			var value = parameters[parameter]
			if(allParameters[parameter] === undefined) {
				allParameters[parameter] = {}
			}
			allParameters[parameter][value] = 1
		}
	}

	var htmlObject = ""
	for(parameter in allParameters) {
		htmlObject += parameter+':<br> <select id="'+parameter+'" class="menu" onchange="update()"><option value="all">all</option>'
		for(value in allParameters[parameter]) {
			htmlObject+='<option value="'+value+'">'+value+'</option>'
		}
		htmlObject+="</select><br>"
	}
	setContents("nav", htmlObject)
}

function shouldAddSimulation(simulation)
{
	for(var parameter in simulation.parameters) {
		var htmlObject = document.getElementById(parameter);
		var value = htmlObject.options[htmlObject.selectedIndex].value;

		if(value!=="all" && value!=simulation.parameters[parameter]) {
			console.log("Nope because: ", value, "!=", simulation.parameters[parameter])
			return false
		}
	}
	return true
}

function update()
{
	console.log("Update")
	setContents("main", "")
	for(var i in allSimulations) {
		var simulation = allSimulations[i]
		if(shouldAddSimulation(simulation)) {
			addSimulation(simulation)
		}
	}
}

function start()
{
	loadJSON("GePPITSimulationEnsembleInfo.json", function(responseText) {
		var simulations = JSON.parse(responseText)
		for(var i in simulations) {
			var simulation = simulations[i]
			allSimulations[simulation.folder] = simulation
			var jsonFile = simulation.folder+"/analysis.json"
			console.log(simulation.folder," jsonFile: ", jsonFile)
			loadJSON(jsonFile, function(responseText, simulation) {
				var analysisObject = JSON.parse(responseText)
				simulation.analysis = analysisObject
				if(jsonLoadPending==0) {
					update()
				}
			}, simulation)
		}
		generateMenu(simulations)
	})
}