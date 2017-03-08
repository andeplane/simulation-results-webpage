lammpsLogPlotters = {}

function LAMMPSLogPlotter(logfile, id)
{
	this.id = id
	this.logfile = logfile
	this.timesteps = []
	this.headers = []
	this.columns = {}
	this.currentXValues = []
	this.hasPlottedOnce = false
	this.parse()
	this.createColumns()
	this.createMenu()
	this.updateChart()
	this.get("loadbutton").hidden = true
};

LAMMPSLogPlotter.prototype.get = function(id) {
	return document.getElementById(this.getName(id))
}

LAMMPSLogPlotter.prototype.getName = function(id) {
	return this.id+"-"+id
}

LAMMPSLogPlotter.prototype.getRoot = function() {
	return document.getElementById(this.id)
}

LAMMPSLogPlotter.prototype.createColumns = function() {
	this.columns = []
	for(var i=0; i<this.headers.length; i++) {
		var values = []
		for(var j=0; j<this.timesteps.length; j++) {
			values.push(this.timesteps[j][i])
		}

		this.columns[this.headers[i]] = values
	}
}

LAMMPSLogPlotter.prototype.parse = function() {
	arrayOfLines = this.logfile.match(/[^\r\n]+/g)
	var nextLineIsHeader = false
	var nextLineIsData = false
	var currentLineIsLastDataLine = false
	var entryNumber = -1
	for(var i in arrayOfLines) {
		var line = arrayOfLines[i]
		if(line.search("Memory usage per processor =") > -1) {
			// Next line is a header line
			nextLineIsHeader = true
			continue
		}

		if(nextLineIsData && i < arrayOfLines.length-1) {
			var nextLine = arrayOfLines[parseInt(i)+1]
			if(nextLine.search("Loop time of ") > -1) {
				// Next line is a header line
				currentLineIsLastDataLine = true
			}
		}

		if(nextLineIsHeader) {
			// Parse word by word, compare to existing header and throw exception if headers have changed

			var words = line.trim().split(/[ ]+/)
			if(this.headers.length > 0) {
				for(var j in words) {
					var word = words[j]
					var oldWord = this.headers[j]
					if(word !== oldWord) {
						this.timesteps = []
					}

				}
			}
			this.headers = words
			nextLineIsHeader = false
			nextLineIsData = true
			continue
		}

		if(nextLineIsData) {
			entryNumber += 1
			var words = line.trim().split(/[ ]+/)
			var values = []
			if(words.length !== this.headers.length) {
				console.log("Skipping entry number ", entryNumber)
				continue
			}
			for(var j in words) {
				var value = parseFloat(words[j])
				values.push(value)
			}
			this.timesteps.push(values)
		}

		if(currentLineIsLastDataLine) {
			nextLineIsData = false
			currentLineIsLastDataLine = false
		}
	}
}

LAMMPSLogPlotter.prototype.updateChart = function() {
	// Save input text
	localStorage.setItem('input', this.get("input").value)
	var xaxis = this.get("xaxis")
	this.currentXValues = []
	var datasets = []
	var summaryHtml = ""

	if(xaxis.value==="linenumber") {
		for (var i = 0; i < this.columns[this.headers[0]].length; i++) {
		    this.currentXValues.push(i);
		}
	} else {
		this.currentXValues = this.columns[xaxis.value]
	}

	for(var header in this.columns) {
		if(this.columnEnabled(header)) {
			datasets.push({x: this.currentXValues, y: this.columns[header], name: header})
		}
	}
	this.updateSummary()

	var plotId = this.id+"-plot"
	Plotly.newPlot(plotId, datasets,
		{
			margin: { t: 0 },
			displayModeBar: false,
			modeBarButtonsToRemove: ['sendDataToCloud','hoverCompareCartesian']
		},
		{ 
			displayModeBar: false
		}
	)

	if(!this.hasPlottedOnce) {
		var self = this;
		this.get("plot").on('plotly_relayout',
	    function(eventdata){  
	    	var xmin = eventdata['xaxis.range[0]']
	    	var xmax = eventdata['xaxis.range[1]']
	    	self.updateSummary(xmin, xmax)
	    })
	}
	this.hasPlottedOnce = true
}

LAMMPSLogPlotter.prototype.columnEnabled = function(header) {
	var plotColumn = this.get(header).checked
	if(plotColumn) return true

	var input = this.get("input").value
	var inputWords = input.trim().split(/[ ]+/)
	for(var i in inputWords) {
		var word = inputWords[i]
		if(header.toLowerCase()===word.toLowerCase()) {
			return true
		}
	}

	return false
}

LAMMPSLogPlotter.prototype.updateSummary = function(xmin, xmax) {
	var summaryHtml = ""

	var input = this.get("input").value
	var inputWords = input.trim().split(/[ ]+/)
	for(var header in this.columns) {
		if(this.columnEnabled(header)) {
			var sum = 0
			var sumSquared = 0
			var count = 0
			for(var i=0; i<this.columns[header].length; i++) {
				if(xmin !== undefined) {
					if(this.currentXValues[i] < xmin) continue
				}
				if(xmax !== undefined) {
					if(xmax < this.currentXValues[i]) continue
				}

				count += 1
				sum += this.columns[header][i]
				sumSquared += this.columns[header][i]*this.columns[header][i]
			}

			var mean = sum / count
			var meanSquared = sumSquared / count
			var variance = meanSquared - mean*mean
			summaryHtml += "Mean("+header+") = "+mean.toFixed(3)
			summaryHtml += "   Stddev("+header+") = "+Math.sqrt(variance).toFixed(3)+"<br>"
		}
	}
	this.setContents("summary", summaryHtml)
}

LAMMPSLogPlotter.prototype.createMenu = function() {
	var htmlObject = ""
	var updateChartFunction = "lammpsLogPlotters['"+this.id+"'].updateChart()"
	htmlObject += 'Choose x-axis:<br> <select id="'+this.getName("xaxis")+'" class="menu" onchange="'+updateChartFunction+'"><option value="linenumber">Line number</option>'
	for(var i in this.headers) {
		htmlObject+='<option value="'+this.headers[i]+'">'+this.headers[i]+'</option>'
	}
	htmlObject+="</select><br>"

	for(var i in this.headers) {
		htmlObject+='<input id='+this.getName(this.headers[i])+' type="checkbox" onchange="'+updateChartFunction+'" value="'+this.headers[i]+'">'+this.headers[i]
	}
	htmlObject += '<button onclick="clearSelection()">Clear</button><br>'
	htmlObject += '<span title="Write the names of any property, space separated.">Properties:</span> <input id="'+this.getName("input")+'" type="text" onchange="'+updateChartFunction+'" />'
	this.setContents("menu", htmlObject)
	if (localStorage.getItem('input')) {
        this.get("input").value = localStorage.getItem('input');
    }
}

LAMMPSLogPlotter.prototype.clearSelection = function() {
	for(var header in this.columns) {
		this.get(header).checked = false
	}
	this.get("input").value = ""

	this.updateChart()
}

LAMMPSLogPlotter.prototype.setContents = function(id, html)
{
	this.get(id).innerHTML = html;
}

LAMMPSLogPlotter.prototype.addContent = function(id, html)
{
	this.get(id).innerHTML += html;
}
