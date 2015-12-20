var mtgCharts = (function() {
    function genericChart(chartID, config) {
        var my = {};

        my.margin = {
            top: (config.margin && config.margin.top) || 10,
            right: (config.margin && config.margin.right) || 36,
            bottom: (config.margin && config.margin.bottom) || 50,
            left: (config.margin && config.margin.left) || 72
        };

        my.gridlines = {
            x: false,
            y: (config.gridlines && (config.gridlines.y === true)) || false
        }

        my.customFns = {
            resize: (config.customFns && config.customFns.resize) || function(){},
            draw: (config.customFns && config.customFns.draw) || function(){},
            yDomain: (config.customFns && config.customFns.yDomain) || function() {return 0;}
        };

        my.x = d3.time.scale();
        my.y = d3.scale.linear();

        my.chart = d3.select('#'+chartID);

        my.setSizeAndScales = function () {
            my.width = parseInt(my.chart.style('width'), 10) - my.margin.left - my.margin.right;
            my.height = parseInt(my.chart.style('height'), 10) - my.margin.top - my.margin.bottom;

            my.x.range([0, my.width]);
            my.y.range([my.height, 0]);
        }
        my.setSizeAndScales();

        my.xAxis = d3.svg.axis()
            .scale(my.x)
            .orient('bottom')
            .tickFormat(d3.time.format('%b-%y'));

        my.yAxis = d3.svg.axis()
            .scale(my.y)
            .orient('left');

        my.yGrid = d3.svg.axis()
            .scale(my.y)
            .orient('left')
            .tickFormat("");

        my.innerChart = my.chart
            .append('g')
            .attr('transform', 'translate(' + my.margin.left + ',' + my.margin.top + ')');

        my.gXAxis = my.innerChart.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + my.height + ')');

        my.gYAxis = my.innerChart.append('g')
            .attr('class', 'y axis');

        if (my.gridlines.y) {
            my.gYTicks = my.innerChart.append('g')
                .attr('class', 'grid');
        }

        my.resize = function () {
            my.setSizeAndScales();
            my.gXAxis
                .call(my.xAxis)
                .selectAll('text')
                .style('text-anchor', 'end')
                .attr('dx', '-1em')
                .attr('dy', '-0.6em')
                .attr('transform', function(d) {return 'rotate(-90)'});

            my.gYAxis.call(my.yAxis);
            my.yGrid.tickSize(-my.width, 0, 0);
            if (my.gridlines.y) {
                my.gYTicks.call(my.yGrid);
            }
            my.customFns.resize(my);
        }

        my.draw = function(amSched) {
            my.x.domain(d3.extent(amSched.map(function(d) { return d.paymentDate.toDate(); })));
            my.y.domain([0, d3.max(amSched, my.customFns.yDomain)]);

            my.customFns.draw(my, amSched);
            my.resize();
        }
        d3.select(window).on('resize.' + chartID, my.resize);
        return {draw: my.draw};
    }

    function pAndIChart(chartID) {
        var my = genericChart(chartID, {
            customFns: {
                draw: function(obj, data) {
                    var paymentMonths = obj.innerChart.selectAll('.paymentMonth').data(data);

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
                },
                resize: function(obj) {
                    var paymentMonths = obj.innerChart.selectAll('.paymentMonth');

                    paymentMonths
                        .attr('transform', function(d) {return 'translate(' + obj.x(d.paymentDate.toDate()) + ',0)';});

                    obj.innerChart.selectAll('.bar')
                        .attr('y', function(d) { return obj.y(d.yHigh); })
                        .attr('height', function(d) { return obj.y(d.yLow) - obj.y(d.yHigh); })
                        .attr('width', obj.width/paymentMonths.size())
                        .style('fill', function(d) {return d.color;});
                },
                yDomain: function(d) {
                    return d.interest + d.principal;
                }
            }
        });
        return my;
    };

    function balanceChart(chartID) {
        var my = genericChart(chartID, {
            customFns: {
                draw: function(obj, data) {
                    obj.innerChart.select('#balanceLine').remove();
                    obj.innerChart.append('path')
                        .datum(data)
                        .attr('class', 'line')
                        .attr('id', 'balanceLine');
                },
                resize: function(obj) {
                    var line = d3.svg.line()
                        .x(function(d) {return obj.x(d.paymentDate.toDate());})
                        .y(function(d) {return obj.y(d.endingBalance);});
                    obj.innerChart.select('#balanceLine').attr('d', line);
                },
                yDomain: function(d) {
                    return d.endingBalance;
                }
            }
        });
        return my;
    };
    return {
        pAndIChart : pAndIChart,
        balanceChart : balanceChart
    };
})();
