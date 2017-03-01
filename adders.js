function addSimulation(simulation)
{
	var htmlObject = "<div class=\"simulation\">"
	htmlObject += "<h1>"+simulation.folder+"</h1>"
	htmlObject += "<div class\"parameter-view\"><h3>Parameters:</h3>"
	for(var parameter in simulation.parameters) {
		var value = simulation.parameters[parameter]
		if(value.length > 30) value = value.substr(0,30)+" ..."
		htmlObject += parameter+": "+value+"<br>"
	}
	htmlObject += "</div><h3>Analysis:</h3>"

	var analysisList = simulation.analysis
	for(var i in analysisList) {
		var analysis = analysisList[i]
		if(analysis.type==="figure") {
			htmlObject += addFigure(simulation.folder, analysis)
		}
	}

	htmlObject += "</div><br>"
	addContent("main", htmlObject)
}

function addFigure(simulationFolder, figure)
{
	var htmlObject = "<div class=\"simulation-analysis-figure\">"
	htmlObject += "<img src=\""+simulationFolder+"/"+figure.src+"\"><br>"
	htmlObject += "<p>"+figure.caption+"</p>"
	htmlObject += "</div>"
	return htmlObject
}