var mtgCharts = (function() {
    var baseChart = {
        init: function(chartID, config) {
            this.margin = {
                top: (config.margin && config.margin.top)       || 10,
                right: (config.margin && config.margin.right)   || 36,
                bottom: (config.margin && config.margin.bottom) || 50,
                left: (config.margin && config.margin.left)     || 72
            };
            this.gridlines = (config.gridlines === true)        || false;
            this.outerChart = d3.select('#' + chartID);
            this.x = d3.time.scale();
            this.y = d3.scale.linear();
            this.setSizeAndScales();
            this.xAxis = d3.svg.axis()
                .scale(this.x)
                .orient('bottom')
                .tickFormat(d3.time.format('%b-%y'));

            this.yAxis = d3.svg.axis()
                .scale(this.y)
                .orient('left');

            this.yGrid = d3.svg.axis()
                .scale(this.y)
                .orient('left')
                .tickFormat("");

            this.chart = this.outerChart
                .append('g')
                .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');

            this.gXAxis = this.chart.append('g')
                .attr('class', 'x axis')
                .attr('transform', 'translate(0,' + this.height + ')');

            this.gYAxis = this.chart.append('g')
                .attr('class', 'y axis');

            if (this.gridlines) {
                this.gYTicks = this.chart.append('g')
                    .attr('class', 'grid');
            }
            d3.select(window).on('resize.' + chartID, this.resize.bind(this));
        },
        setSizeAndScales: function() {
            this.width = parseInt(this.outerChart.style('width'), 10) - this.margin.left - this.margin.right;
            this.height = parseInt(this.outerChart.style('height'), 10) - this.margin.top - this.margin.bottom;

            this.x.range([0, this.width]);
            this.y.range([this.height, 0]);
        },
        resize: function() {
            this.setSizeAndScales();
            this.gXAxis
                .call(this.xAxis)
                .selectAll('text')
                .style('text-anchor', 'end')
                .attr('dx', '-1em')
                .attr('dy', '-0.6em')
                .attr('transform', function(d) {return 'rotate(-90)'});

            this.gYAxis.call(this.yAxis);
            if (this.gridlines) {
                this.yGrid.tickSize(-this.width, 0, 0);
                this.gYTicks.call(this.yGrid);
            }
            this.customResize();
        },
        draw: function(data) {
            this.x.domain(d3.extent(data.map(function(d) { return d.paymentDate.toDate(); })));
            this.y.domain([0, d3.max(data, this.customYDomain)]);
            this.customDraw(data);
            this.resize();
        }
    };
    function pAndIChart(chartID) {
        var chart = Object.create(baseChart);
        chart.customResize = function() {
            var paymentMonths = this.chart.selectAll('.paymentMonth');
            paymentMonths
                .attr('transform', function(d) {return 'translate(' + chart.x(d.paymentDate.toDate()) + ',0)';});

            this.chart.selectAll('.bar')
                .attr('y', function(d) { return chart.y(d.yHigh); })
                .attr('height', function(d) { return chart.y(d.yLow) - chart.y(d.yHigh); })
                .attr('width', this.width/paymentMonths.size())
                .style('fill', function(d) {return d.color;});
        }
        chart.customDraw = function(amSched) {
            var paymentMonths = this.chart.selectAll('.paymentMonth').data(amSched);

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
        }
        chart.customYDomain = function(d) {return d.interest + d.principal;};
        chart.init(chartID, {});
        return chart;
    }

    function balanceChart(chartID) {
        var chart = Object.create(baseChart);
        chart.line = d3.svg.line()
            .x(function(d) {return chart.x(d.paymentDate.toDate());})
            .y(function(d) {return chart.y(d.endingBalance);});
        chart.customResize = function() {
            this.chart.select('#balanceLine').attr('d', chart.line);
        }
        chart.customDraw = function(amSched) {
            this.chart.select('#balanceLine').remove();
            this.chart.append('path')
                .datum(amSched)
                .attr('class', 'line')
                .attr('id', 'balanceLine');
        }
        chart.customYDomain = function(d) {return d.endingBalance;};
        chart.init(chartID, {gridlines: true});
        return chart;
    }
    return {
        pAndIChart: pAndIChart,
        balanceChart: balanceChart
    };
})();
