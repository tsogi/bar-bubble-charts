(function (){

	var margin = { top: 50, right: 20, bottom: 100, left: 100 };

	var chartType = "bar";

	// Width and height of the chart
	var width = 500, height = 400;

	// Horizontal scale
	var xScale = d3.scaleBand()
		.range([0, width])
		.paddingInner(0.2)
		.paddingOuter(0.2)

	// Vertical scale
	var yScale = d3.scaleLinear()
		.range([height, 0]);

	// Create svg element
	var svg = d3.select(".chart")
			.append("svg")
			.attr("width", width + margin.right + margin.left)
			.attr("height", height + margin.top + margin.bottom);

	// Create bars wrapper g element
	var rectsWrapperG = svg.append("g")
		.attr("id", "bars")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	// Create x axis
	var xAxisG = svg.append("g")
	.attr("transform", "translate(" + margin.left + ", " + (height + margin.top) + ")");

	// Create y axis
	var yAxisG = svg.append("g")
	.attr("transform", "translate(" +margin.left + ", "+margin.top+")");

	// Add x axis labels
	svg.append("g")
		.append("text")
		.attr("x", margin.left + width / 2)
		.attr("y", margin.top + height + margin.bottom / 2 + 10)
		.attr("text-anchor", "middle")
		.style("font-weight", "bold")
		.text("Cities")

	// Add y axis labels
	svg.append("g")
		.append("text")
		.attr("x", margin.left / 2)
		.attr("y", margin.top + height / 2)
		.attr("text-anchor", "middle")
		.attr("transform", "rotate(-90, "+margin.left / 2+", "+(margin.top + height / 2)+")")
		.style("font-weight", "bold")
		.text("Population (thousand)")

	// Add year label
	var yearLabel = svg.append("text")
		.attr("x", margin.left + width / 2)
		.attr("y", margin.top / 2)
		.attr("text-anchor", "middle");

	// Add chart type selector
	d3.select(".chartType").append("select")
		.attr("id", "chartType")
		.on("change", function(){
			var type = document.getElementById("chartType").value;
			if(type != "") { chartType = type; d3.select("#bars").selectAll("*").remove(); }
			drawChart(window.data[window.years[window.count]], window.years[window.count]);
			window.count == window.years.length - 1 ? window.count = 0 : window.count++;
		})
		.selectAll("option")
		.data([{ name: "Bar Chart", value: "bar" }, { name: "Scatter Plot", value: "plot" }])
		.enter()
		.append("option")
		.attr("value", function(d) { return d.value })
		.text(function(d){ return d.name })

	// The function for actually drawing the chart
	function drawChart(data, year){
		yearLabel
			.attr("y", 0)
			.text(year + " Year")
			.transition()
			.attr("y", margin.top / 2)


		xScale.domain(data.map(function(element){ return element.name; }));
		yScale.domain([0, d3.max(data.map(function(element){ return element.value; }))]);

		var xAxis = d3.axisBottom(xScale);
		var yAxis = d3.axisLeft(yScale);

		var rects = rectsWrapperG.selectAll(chartType == "bar" ? "rect" : "circle");

		var update = rects.data(data);

		if(chartType == "bar") {
			update.attr("class", "bar")
			.transition()
			.attr("x", function(d){ return xScale(d.name); })
			.attr("y", function(d){ return yScale(d.value); })
			.attr("width", xScale.bandwidth())
			.attr("height", function(d){ return yScale(0) - yScale(d.value); })
		} else {
			update.attr("class", "bar")
			.transition()
			.attr("cx", function(d){ return xScale(d.name) + xScale.bandwidth() / 2; })
			.attr("cy", function(d){ return yScale(d.value); })
			.attr("r", 10)
		}

		var enter = update.enter();
		if(chartType == "bar") {
			enter.append("rect")
			.transition()
			.attr("class", "bar")
			.attr("x", function(d){ return xScale(d.name); })
			.attr("y", function(d){ return yScale(d.value); })
			.attr("width", xScale.bandwidth())
			.attr("height", function(d){ return yScale(0) - yScale(d.value); })
		} else {
			enter.append("circle")
			.transition()
			.attr("class", "bar")
			.attr("cx", function(d){ return xScale(d.name) + xScale.bandwidth() / 2; })
			.attr("cy", function(d){ return yScale(d.value); })
			.attr("r", 10)
		}

		var exit = update.exit();
		exit.remove();

		xAxisG.call(xAxis).transition()
			.selectAll("text")
			.style("text-anchor", "end")
			.attr("transform", "rotate(-65)")
			.attr("dx", "-0.8em")
			.attr("dy", "-0.3em")

		yAxisG.transition().call(yAxis);
	}

	// Retrieve data from json file and draw chart
	d3.json("data.json").then(function(data){
			window.data = data;
			window.years = [];

			for(var key in data) { years.push(key); }

			drawChart(data[years[0]], years[0]);

			window.count = 1;

			d3.interval(function(){
				drawChart(data[years[count]], years[count]);
				count == years.length - 1 ? count = 0 : count++;
			}, 3000);
	});
})();