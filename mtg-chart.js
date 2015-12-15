function mtgChart() {
    var margin = {top: 20, right: 30, bottom: 50, left: 40},
        width = 60 * Math.floor((800 - margin.left - margin.right)/60);
        height = 400 - margin.top - margin.bottom;

    var x = d3.time.scale()
        .range([0, width]);

    var y = d3.scale.linear()
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .ticks(width/12)
        .tickFormat(d3.time.format("%b-%y"));

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    var chart = d3.select(".chart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var gXAxis = chart.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")");

    var gYAxis = chart.append("g")
        .attr("class", "y axis");

    // this is the function that will be called each time we draw the chart
    var draw = function(amSched) {
        // the data may have changed so we need to update the domain of our scales
        x.domain(d3.extent(amSched.map(function(d) { return d.paymentDate.toDate(); })));
        y.domain([0, d3.max(amSched, function(d) { return d.principal; })]);

        // we update the axis to reflect the new scale domains
        gXAxis
            .call(xAxis)
            .selectAll('text')
            .style('text-anchor', 'end')
            .attr('dx', '-1em')
            .attr('dy', '-0.6em')
            .attr('transform', function(d) {return 'rotate(-90)'});

        gYAxis.call(yAxis);

        var bars = chart.selectAll(".bar").data(amSched);

        // if there are new bars since we last called draw (or if it's the first time),
        // we add them now
        bars
            .enter().append("rect")
            .attr("class", "bar");

        // we update the bars with new attributes based on the new data
        bars
            .attr("x", function(d) { return x(d.paymentDate.toDate()); })
            .attr("y", function(d) { return y(d.principal); })
            .attr("height", function(d) { return height - y(d.principal); })
            .attr("width", width/amSched.length);

        // maybe some bars are not present in the new data, let's remove them!
        bars.exit().remove();
    }
    return {draw: draw};
}
