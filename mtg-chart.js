function mtgChart(chartID) {
    var margin = {top: 20, right: 36, bottom: 20, left: 36},
        width = 720;
        height = 400;

    var x = d3.time.scale()
        .range([0, width]);

    var y = d3.scale.linear()
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient('bottom')
        .tickFormat(d3.time.format('%b-%y'));

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient('left');

    var chart = d3.select('#' + chartID)
//        .attr('width', width + margin.left + margin.right)
//        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    var gXAxis = chart.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')');

    var gYAxis = chart.append('g')
        .attr('class', 'y axis');

    // this is the function that will be called each time we draw the chart
    var draw = function(amSched) {
        // the data may have changed so we need to update the domain of our scales
        x.domain(d3.extent(amSched.map(function(d) { return d.paymentDate.toDate(); })));
        y.domain([0, d3.max(amSched, function(d) { return d.interest + d.principal; })]);
        console.log(amSched.length);
        // we update the axis to reflect the new scale domains
        gXAxis
            .call(xAxis)
            .selectAll('text')
            .style('text-anchor', 'end')
            .attr('dx', '-1em')
            .attr('dy', '-0.6em')
            .attr('transform', function(d) {return 'rotate(-90)'});

        gYAxis.call(yAxis);

        var paymentMonths = chart.selectAll('.paymentMonth').data(amSched);

        paymentMonths
            .enter().append('g')
            .attr('class', 'paymentMonth');

        paymentMonths
            .attr('transform', function(d) {return 'translate(' + x(d.paymentDate.toDate()) + ',0)';});

        paymentMonths.exit().remove();

        var bars = paymentMonths.selectAll('.bar')
            .data(function(d) {
                return [{color: '#FF0000', yLow: 0, yHigh: d.interest},
                        {color: '#0000FF', yLow: d.interest, yHigh: d.interest + d.principal}];
            });

        bars.enter().append('rect')
            .attr('class', 'bar')

        bars
            .attr('y', function(d) { return y(d.yHigh); })
            .attr('height', function(d) { return y(d.yLow) - y(d.yHigh); })
            .attr('width', width/amSched.length)
            .style('fill', function(d) {return d.color;});

        bars.exit().remove();
    }
    return {draw: draw};
}
