var mtgCharts = (function() {
    // Inspired by Rob Moore's examples here at
    // http://www.toptal.com/d3-js/towards-reusable-d3-js-charts
    // and http://bl.ocks.org/rcmoore38/9f2908455355c0589619

    function genericChart() {
        var margin = {top: 10, right: 36, bottom: 50, left: 72};
        var dimensions = {width: 0, height: 0};
        var scales = {x: d3.time.scale(), y: d3.scale.linear()};
        var axes = {
            x:      d3.svg.axis().scale(scales.x).orient('bottom').tickFormat(d3.time.format('%b-%y')),
            y:      d3.svg.axis().scale(scales.y).orient('left'),
            grid:   d3.svg.axis().scale(scales.y).orient('left').tickFormat('')
        };
        var gridlines = false;
        var domElements = {};
        function setSizeAndScales() {
            dimensions.width = parseInt(domElements.outerChart.style('width'), 10) - margin.left - margin.right;
            dimensions.height = parseInt(domElements.outerChart.style('height'), 10) - margin.top - margin.bottom;
            scales.x.range([0, dimensions.width]);
            scales.y.range([dimensions.height, 0]);
        }
        function drawAxes() {
            domElements.gXAxis
                .call(axes.x)
                .selectAll('text')
                .style('text-anchor', 'end')
                .attr('dx', '-1em')
                .attr('dy', '-0.6em')
                .attr('transform', function(d) {return 'rotate(-90)'});

            domElements.gYAxis.call(axes.y);
            if (gridlines) {
                axes.grid.tickSize(-dimensions.width, 0, 0);
                gYTicks.call(axes.grid);
            }
        }
        function chart(selection) {
            domElements.outerChart = selection;
            setSizeAndScales();
            domElements.chart = domElements.outerChart.append('g')
                                    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
            domElements.gXAxis = domElements.chart.append('g').attr('class', 'x axis')
                                    .attr('transform', 'translate(0,' + dimensions.height + ')');
            domElements.gYAxis = domElements.chart.append('g').attr('class', 'y axis');
            if (gridlines) {
                domElements.gYTicks = domElements.chart.append('g').attr('class', 'grid');
            }
        }
        chart.setSizeAndScales = setSizeAndScales;
        chart.drawAxes = drawAxes;
        chart.domElements = domElements;
        chart.scales = scales;
        chart.dimensions = dimensions;
        return chart;
    }

    function pAndIChart(chartID) {
        var chart = genericChart();
        d3.select('#' + chartID).call(chart);

        var resize = function() {
            chart.setSizeAndScales();
            chart.drawAxes();
            var paymentMonths = chart.domElements.chart.selectAll('.paymentMonth');
            paymentMonths
                .attr('transform', function(d) {return 'translate(' + chart.scales.x(d.paymentDate.toDate()) + ',0)';})
                .selectAll('.bar')
                .attr('y', function(d) { return chart.scales.y(d.yHigh); })
                .attr('height', function(d) { return chart.scales.y(d.yLow) - chart.scales.y(d.yHigh); })
                .attr('width', chart.dimensions.width/paymentMonths.size())
                .style('fill', function(d) {return d.color;});
        };

        var draw = function(amSched) {
            chart.scales.x.domain(d3.extent(amSched.map(function(d) { return d.paymentDate.toDate(); })));
            chart.scales.y.domain([0, d3.max(amSched, function(d) { return d.interest + d.principal; })]);

            var paymentMonths = chart.domElements.chart.selectAll('.paymentMonth').data(amSched);

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
        var chart = genericChart();
        d3.select('#' + chartID).call(chart);

        var line = d3.svg.line()
            .x(function(d) {return chart.scales.x(d.paymentDate.toDate());})
            .y(function(d) {return chart.scales.y(d.endingBalance);});

        var resize = function() {
            chart.setSizeAndScales();
            chart.drawAxes();
            chart.domElements.chart.select('#balanceLine').attr('d', line);
        };

        var draw = function(amSched) {
            chart.scales.x.domain(d3.extent(amSched.map(function(d) { return d.paymentDate.toDate(); })));
            chart.scales.y.domain([0, d3.max(amSched, function(d) { return d.endingBalance; })]);
            chart.domElements.chart.select('#balanceLine').remove();
            chart.domElements.chart.append('path')
                .datum(amSched)
                .attr('class', 'line')
                .attr('id', 'balanceLine');

            resize();
        };

        d3.select(window).on('resize.' + chartID, resize);
        return {draw: draw};
    }
    return {
        pAndIChart: pAndIChart,
        balanceChart: balanceChart
    };
})();
