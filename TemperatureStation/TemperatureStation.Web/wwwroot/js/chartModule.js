﻿var frontPageChart = function () {
    var margin = { top: 20, right: 20, bottom: 30, left: 50 };
    //var margin = { top: 0, right: 0, bottom: 0, left: 0 };
    //var width = $('.col-md-6').width() - margin.left - margin.right;
    var width = $('#chartContainer').width() - margin.left - margin.right;

    // var height = ($('.col-md-6').width() / 2) - margin.top - margin.bottom;
    //var height = $('.col-md-6').width() / 2 - margin.top - margin.bottom;
    var height = $('#chartContainer').width() / 1.5 - margin.top - margin.bottom;
    //var height = $('#chartContainer').width() / 1.5 - margin.top - margin.bottom;
    // parse the date / time
    var parseTime = d3.timeParse("%Y-%m-%dT%H:%M:%S.%L");

    //d3.select(window).on('resize.updatesvg', updateWindow);

    // set the ranges
    var x = d3.scaleTime().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);
    $('#chartLegend').empty('li');
    var valuelines = [];

    // find data with biggest number of attributes
    var dataIndex = 0;
    var dataAttrs = data[0].length;
    for (var i = 1; i < data.length; i++) {
        if (data[i].length > dataAttrs)
        {
            dataIndex = i;
            dataAttrs = data[i].length;
        }
    }

    for (var i = 0; i < data[dataIndex].length; i++) {
        
        var valueline = d3.line()
            .x(function (d) { return x(d.date); })
            .y(function (d) { return y(d['value' + i]); });

        var legendItem = "<span style='background-color:" + (strokes[i] || 'black') + "'>";
        legendItem += '</span> ' + data[dataIndex][i].Source;
        $('#chartLegend').append('<li>' + legendItem + '</li>');
        valuelines.push(valueline);
    }
 
    d3.select('#chartContainer').select('div').remove();

    var svg = d3.select('#chartContainer')
        .append("div")
        .classed("svg-container", true)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform","translate(" + margin.left + "," + margin.top + ")");

    data.forEach(function (d) {
        var date = new Date();
        date.setTime(Date.parse(d[0].ReadingTime) - 60 * 60 * 1000 * offset);
        d.date = date;

        for (var i = 0; i < d.length; i++) {
            d['value' + i] = +d[i].Value;
        }
        // fill missing values with nulls
        for (var i = d.length; i < dataAttrs; i++)
        {
            d['value' + i] = null;
        }
    });

    x.domain(d3.extent(data, function (d) { return d.date; }));
    //y.domain(d3.extent(data, function (d) { return d.value; }));
    y.domain([
        d3.min(data, function (d) {
            var values = [];
            for (var i = 0; i < valuelines.length; i++) {
                values.push(d['value' + i] - 1);
            }

            return Math.min.apply(null, values);
        }),
        d3.max(data, function (d) {
            var values = [];
            for (var i = 0; i < valuelines.length; i++) {
                values.push(d['value' + i] + 1);
            }
            return Math.max.apply(null, values);
        })]);

    for (i = 0; i < valuelines.length; i++) {
        svg.append("path")
            .data([data])
            .attr("class", "line")
            .style("stroke", strokes[i] || 'black')
            .attr("d", valuelines[i]);
    }

    // Add the X Axis
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    // Add the Y Axis
    svg.append("g")
        .call(d3.axisLeft(y));

    var lastDate = null;
    var isFirstDate = true;
    var dates = [];

    for (var i = 0; i < data.length; i++) {
        var date = new Date(data[i][0].ReadingTime);
        date = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        if (!dates.containsDate(date)) {
            dates.push(date);
        }
    }

    for (var i = 0; i < dates.length; i++)
    {
        // first date is usually not shown on chart and line is drawn threrfore left from Y-axis
        if (i == 0) {
            continue;
        }

        var date = dates[i];
        svg.append("line")
            .attr("x1", x(date))  //<<== change your code here
            .attr("y1", 0)
            .attr("x2", x(date))  //<<== and here
            .attr("y2", height + margin.top - margin.bottom + 10)
            .style("stroke-width", 1)
            .style("stroke", "green")
            .style("fill", "none");
    }
};