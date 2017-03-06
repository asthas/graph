var margin = {top: 10, right: 10, bottom: 40, left: 100};
var width = 600 - margin.left - margin.right;
var height = 600 - margin.top - margin.bottom;

var svg = d3.select('.chart')
  .append('svg')
	.attr('width', width + margin.left + margin.right)
	.attr('height', height + margin.top + margin.bottom)
	.call(responsivefy)
  .append('g')
	.attr('transform', `translate(${margin.left}, ${margin.top})`);

var xAxisText = svg.append("text").attr("text-anchor", "middle");                
var yAxisText = svg.append("text").attr("text-anchor", "middle");

xAxisText.attr('transform', `translate(${-60}, ${height/2})`)
yAxisText.attr('transform', `translate(${width/2}, ${height+margin.bottom})`)

var x_key = 0;
var y_key = 0;

// d3.csv('petal.csv', function(error, data){

// 	var xScale = d3.scaleLinear()
// 		.domain(d3.extent(data, d => +d[keys[x_key]]))
// 		.range([0, width])

// 	var xAxis = svg
// 	  .append('g')
// 		.attr('transform', `translate(0, ${height})`)
// 	  .call(d3.axisBottom(xScale)
// 		.ticks(5))

// 	var yScale = d3.scaleLinear()
// 		.domain(d3.extent(data, d => +d[keys[y_key]]))
// 		.range([height, 0])

// 	var yAxis = svg
// 		.append('g')
// 		.call(d3.axisLeft(yScale)
// 			.ticks(5))

// 	var circles = svg
// 		.selectAll('circle')
// 		.data(data)
// 		.enter()
// 		.append('circle')
// 		.attr("class","data")
// 		.attr('cx', d => xScale(d[keys[x_key]]))
// 		.attr('cy', d => yScale(d[keys[y_key]]))
// 		.attr('r', 5)

// 	// render(data, xScale, yScale, xAxis, yAxis);
// })

function responsivefy(svg) {
  // get container + svg aspect ratio
  var container = d3.select(svg.node().parentNode),
	  width = parseInt(svg.style("width")),
	  height = parseInt(svg.style("height")),
	  aspect = width / height;

  // add viewBox and preserveAspectRatio properties,
  // and call resize so that svg resizes on inital page load
  svg.attr("viewBox", "0 0 " + width + " " + height)
	  .attr("preserveAspectRatio", "xMinYMid")
	  .call(resize);

  // to register multiple listeners for same event type,
  // you need to add namespace, i.e., 'click.foo'
  // necessary if you call invoke this function for multiple svgs
  // api docs: https://github.com/mbostock/d3/wiki/Selections#on
  d3.select(window).on("resize." + container.attr("id"), resize);

  // get width of container and resize svg to fit it
  function resize() {
	  var targetWidth = parseInt(container.style("width"));
	  svgWidth = targetWidth / 2
	  svg.attr("width",  svgWidth);
	  svg.attr("height", Math.round(svgWidth / (aspect)));
  }
}

$('input[name="correlation"]').change(function(e){
	var species = []
	$('input[name = "correlation"]:checked').each(function() { return species.push($(this).val()); });
	d3.csv('petal.csv', function(data){
		filteredData = data.filter(function(d) { return species.indexOf(d['Species']) != -1; });
		keys = d3.keys(filteredData[0])
		if (filteredData.length) 
			addFilteredData(filteredData);
		else                  
			resetGraph(filteredData);
	});
});

function addFilteredData(filteredData) {
	xAxisText.text(keys[x_key]);
	yAxisText.text(keys[y_key]);

	var xScale = d3.scaleLinear()
		.domain(d3.extent(filteredData, d => +d[keys[x_key]]))
		.range([0, width])

	var xAxis = svg
		.append('g')
		.attr('transform', `translate(0, ${height})`)
		.call(d3.axisBottom(xScale)
		.ticks(5))

	var yScale = d3.scaleLinear()
		.domain(d3.extent(filteredData, d => +d[keys[y_key]]))
		.range([height, 0])

	var yAxis = svg
		.append('g')
		.call(d3.axisLeft(yScale)
			.ticks(5))

	var data = svg.selectAll("circle.data")
		.data(filteredData, function(d) { return +d.Index; });

	data.exit().remove();

	var data_enter = data.enter()
		.append("circle")
		.attr("r", 5)
		.attr("class","data")

	data_enter.transition()
		.attr("cx", function(d) { return xScale(d[keys[x_key]]); })
		.attr("cy", function(d) { return yScale(d[keys[y_key]]); });

	data.transition()
		.attr("cx", function(d) { return xScale(d[keys[x_key]]); })
		.attr("cy", function(d) { return yScale(d[keys[y_key]]); });

	tableCalculations();
}

function extractColumn(arr, column) {
	return arr.reduce(function reduction(previousValue, currentValue){
		previousValue.push(currentValue[column])
		return previousValue
	}, [])
}

function tableCalculations() {
	var variables;
	for (var i = 0; i < keys.length - 1; i++) {
		for (var j = 0; j < keys.length - 1; j++) {
			var xdata = extractColumn(filteredData, keys[i]),
				ydata = extractColumn(filteredData, keys[j]),
				result = corr_coef_calc(xdata, ydata);
			if ((x_key == i) && (y_key == j)) 
				variables = result;
		  $("#table-corr tr").eq(i + 1).children().eq(j + 1)
			  .html(Math.round(result[0], 2))
		}
	}
}

function corr_coef_calc(xdata, ydata) {
  var n = xdata.length,
	  xmean = d3.mean(xdata),
	  ymean = d3.mean(ydata),
	  syy = 0,
	  sxx = 0,
	  sxy = 0;
  for (var i = 0; i < n; i++) {
	syy += Math.pow((ydata[i] - ymean), 2);
	sxx += Math.pow((xdata[i] - xmean), 2);
	sxy += (xdata[i] - xmean) * (ydata[i] - ymean);
  }
  var b1x = syy / sxy,
	  b0x = ymean - b1x * xmean,
	  b1y = sxy / sxx,
	  b0y = ymean - b1y * xmean,
	  p = sxy / (Math.sqrt(sxx) * Math.sqrt(syy));

  var sse = 0;
  for (var i = 0; i < n; i++) {
	sse += Math.pow((xdata[i] * b1y + b0y - ydata[i]), 2);
  }
  var tscore = b1y * Math.sqrt(sxx) * (n - 2) / sse,
	  pvalue = jStat.ttest(tscore, n, 2),
	  sig = pvalue < 0.05;

  return [p, b0x, b1x, xmean, b0y, b1y, ymean];
}

function resetGraph() {

	svg.selectAll("circle").remove();

	xAxis.ticks(0);
	yAxis.ticks(0);

	xaxisText.text("");
	yaxisText.text("");

	for (var i = 0; i < 4; i++) {
		for (var j = 0; j < 4; j++) {
			$("#table-corr tr").eq(i + 1).children().eq(j + 1)
				.html("")
		}
	}
}

$("#table-corr").on('click', function(e){
	var col = $(this).index(),
		row = $(this).parent().index(),
		cell = $("#table-corr tr").eq(row).children().eq(col)
	x_key = col - 1;
	y_key = row - 1;
	addFilteredData(x_key, y_key);
})

