var margin = {top: 10, right: 10, bottom: 30, left: 30};
var width = 400 - margin.left - margin.right;
var height = 600 - margin.top - margin.bottom;

var svg = d3.select('.chart')
  .append('svg')
  	.attr('width', width + margin.left + margin.right)
  	.attr('height', height + margin.top + margin.bottom)
  	.call(responsivefy)
  .append('g')
  	.attr('transform', `translate(${margin.left}, ${margin.top})`);

d3.csv('petal.csv', function(error, data){

	var xScale = d3.scaleLinear()
		.domain(d3.extent(data, d => +d.SepalLength))
		.range([0, width])

	var xAxis = svg
	  .append('g')
	  	.attr('transform', `translate(0, ${height})`)
	  .call(d3.axisBottom(xScale));

	var yScale = d3.scaleLinear()
		.domain(d3.extent(data, d => +d.SepalWidth))
		.range([height, 0])

	var yAxis = svg
		.append('g')
		.call(d3.axisLeft(yScale))

	var circles = svg
		.selectAll('circle')
		.data(data)
		.enter()
		.append('circle')
		.attr('cx', d => xScale(d.SepalLength))
		.attr('cy', d => yScale(d.SepalWidth))
		.attr('r', 5)

	render(data, xScale, yScale, xAxis, yAxis);
})



function render(data, xScale, yScale, xAxis, yAxis, Species = 'setosa'){
	var t = d3.transition().duration(1000);

	var update = svg.selectAll('circle')
		.data(data.filter(d => d[Species]))

	xScale.domain(d3.extent(data, d => d[Species]))
	yScale.domain(d3.extent(data, d => d[Species]))

	// update.exit()
	// 	.transition(t)
	// 	.remove();

	// var enter = update
	// 	.enter()
	// 	.append('circle')

	// update.merge(enter)
	// 	.transition(t)
	// 	.delay(1000)
	// 	.attr('cx', d => xScale(d[Species]))
	// 	.attr('cy', d => yScale(d[Species]))
	// 	.attr('r', 5)
	
	yAxis
		.transition(t)
		.delay(1000)
		.call(d3.axisLeft(yScale))

	xAxis
		.transition(t)
		.delay(1000)
		.call(d3.axisLeft(xScale))
	
}

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
      svg.attr("width", targetWidth);
      svg.attr("height", Math.round(targetWidth / aspect));
  }
}

