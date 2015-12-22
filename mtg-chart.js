var mtgCharts = (function() {
    // Inspired by Rob Moore's examples here at
    // http://www.toptal.com/d3-js/towards-reusable-d3-js-charts
    // and http://bl.ocks.org/rcmoore38/9f2908455355c0589619


    function pAndIChart(chartID) {
        var margin = {top: 10, right: 36, bottom: 50, left: 72},
            width, height,
            x = d3.time.scale(),
            y = d3.scale.linear();

        function setSizeAndScales() {
            width = parseInt(d3.select('#'+chartID).style('width'), 10) - margin.left - margin.right;
            height = parseInt(d3.select('#'+chartID).style('height'), 10) - margin.top - margin.bottom;

            x.range([0, width]);
            y.range([height, 0]);
        }

        setSizeAndScales();

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

        var resize = function() {
            setSizeAndScales();
            gXAxis
                .call(xAxis)
                .selectAll('text')
                .style('text-anchor', 'end')
                .attr('dx', '-1em')
                .attr('dy', '-0.6em')
                .attr('transform', function(d) {return 'rotate(-90)'});

            gYAxis.call(yAxis);
            var paymentMonths = chart.selectAll('.paymentMonth');
            paymentMonths
                .attr('transform', function(d) {return 'translate(' + x(d.paymentDate.toDate()) + ',0)';});

            chart.selectAll('.bar')
                .attr('y', function(d) { return y(d.yHigh); })
                .attr('height', function(d) { return y(d.yLow) - y(d.yHigh); })
                .attr('width', width/paymentMonths.size())
                .style('fill', function(d) {return d.color;});
        };

        var draw = function(amSched) {
            x.domain(d3.extent(amSched.map(function(d) { return d.paymentDate.toDate(); })));
            y.domain([0, d3.max(amSched, function(d) { return d.interest + d.principal; })]);

            var paymentMonths = chart.selectAll('.paymentMonth').data(amSched);

            paymentMonths
                .enter().append('g')
                .attr('class', 'paymentMonth');

            paymentMonths.exit().remove();

            var bars = paymentMonths.selectAll('.bar')
                .data(function(d) {
                    return [{color: 'IndianRed', yLow: 0, yHigh: d.principal},
                            {color: 'SteelBlue', yLow: d.principal, yHigh: d.interest + d.principal}];
                });

            bars.enter().append('rect')
                .attr('class', 'bar')
            bars.exit().remove();

            resize();
        }
        d3.select(window).on('resize.' + chartID, resize);
        return {draw: draw};
    }

    function balanceChart(chartID) {
        var margin = {top: 10, right: 36, bottom: 50, left: 72},
            width, height,
            x = d3.time.scale(),
            y = d3.scale.linear();

        function setSizeAndScales() {
            width = parseInt(d3.select('#'+chartID).style('width'), 10) - margin.left - margin.right;
            height = parseInt(d3.select('#'+chartID).style('height'), 10) - margin.top - margin.bottom;

            x.range([0, width]);
            y.range([height, 0]);
        }

        setSizeAndScales();

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient('bottom')
            .tickFormat(d3.time.format('%b-%y'));

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient('left');

        var yGrid = d3.svg.axis()
            .scale(y)
            .orient('left')
            .tickFormat("");

        var chart = d3.select('#' + chartID)
            .append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        var gXAxis = chart.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + height + ')');

        var gYAxis = chart.append('g')
            .attr('class', 'y axis');

        var gYTicks = chart.append('g')
            .attr('class', 'grid');

        var line = d3.svg.line()
            .x(function(d) {return x(d.paymentDate.toDate());})
            .y(function(d) {return y(d.endingBalance);});

        var resize = function() {
            setSizeAndScales();
            gXAxis
                .call(xAxis)
                .selectAll('text')
                .style('text-anchor', 'end')
                .attr('dx', '-1em')
                .attr('dy', '-0.6em')
                .attr('transform', function(d) {return 'rotate(-90)'});

            gYAxis.call(yAxis);
            yGrid.tickSize(-width, 0, 0);
            gYTicks.call(yGrid);
            chart.select('#balanceLine').attr('d', line);
        };

        var draw = function(amSched) {
            x.domain(d3.extent(amSched.map(function(d) { return d.paymentDate.toDate(); })));
            y.domain([0, d3.max(amSched, function(d) { return d.endingBalance; })]);
            chart.select('#balanceLine').remove();
            chart.append('path')
                .datum(amSched)
                .attr('class', 'line')
                .attr('id', 'balanceLine');

            resize();
        };

        d3.select(window).on('resize.' + chartID, resize);
        return {
            draw: draw,
            resize: resize
        };
    }
    return {
        pAndIChart: pAndIChart,
        balanceChart: balanceChart
    };
})();
