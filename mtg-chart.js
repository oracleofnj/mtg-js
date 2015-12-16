function mtgChart(chartID) {
    var margin = {top: 20, right: 48, bottom: 20, left: 72},
        width = 720,
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
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    var gXAxis = chart.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')');

    var gYAxis = chart.append('g')
        .attr('class', 'y axis');

    var draw = function(amSched) {
        x.domain(d3.extent(amSched.map(function(d) { return d.paymentDate.toDate(); })));
        y.domain([0, d3.max(amSched, function(d) { return d.interest + d.principal; })]);

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
                return [{color: 'IndianRed', yLow: 0, yHigh: d.principal},
                        {color: 'SteelBlue', yLow: d.principal, yHigh: d.interest + d.principal}];
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

function balanceChart(chartID) {
    var margin = {top: 0, right: 0, bottom: 0, left: 0}, //{top: 20, right: 48, bottom: 20, left: 72},
        width = 840;
        height = 460;

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
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    var gXAxis = chart.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')');

    var gYAxis = chart.append('g')
        .attr('class', 'y axis');

    var line = d3.svg.line()
        .x(function(d) {return x(d.paymentDate.toDate());})
        .y(function(d) {return y(d.endingBalance);});

    var draw = function(amSched) {
        x.domain(d3.extent(amSched.map(function(d) { return d.paymentDate.toDate(); })));
        y.domain([0, d3.max(amSched, function(d) { return d.endingBalance; })]);

        gXAxis
            .call(xAxis)
            .selectAll('text')
            .style('text-anchor', 'end')
            .attr('dx', '-1em')
            .attr('dy', '-0.6em')
            .attr('transform', function(d) {return 'rotate(-90)'});

        gYAxis.call(yAxis);

        chart.select('#balanceLine').remove();
        chart.append('path')
            .datum(amSched)
            .attr('class', 'line')
            .attr('id', 'balanceLine')
            .attr('d', line);
    }
    return {draw: draw};
}
