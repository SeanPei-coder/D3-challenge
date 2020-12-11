
var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .classed("chart",true)
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

function xScale(givenData,chosenXAxis) {

    var xLinearScale = d3.scaleLinear()
                    .domain([d3.min(givenData,d => d[chosenXAxis]) * 0.8,
                        d3.max(givenData,d => d[chosenXAxis]) * 1.2])
                    .range([0,width]);
    return xLinearScale;

}


function yScale(givenData, chosenYAxis) {

    var yLinearScale = d3.scaleLinear()
                .domain([d3.min(givenData,d => d[chosenYAxis]) * 0.8,
                    d3.max(givenData,d => d[chosenYAxis]) * 1.2])
                .range([height,0]);

    return yLinearScale;

}


function renderXAxes(newXScale, xAxis) {

    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;

}


function renderYAxes(newYScale, yAxis) {

    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);

    return yAxis;

}


function renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {

    circlesGroup.transition()
                .duration(1000)
                .attr("cx", d => newXScale(d[chosenXAxis]))
                .attr("cy", d => newYScale(d[chosenYAxis]));

    return circlesGroup;

}

function renderText(textGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {

    textGroup.transition()
            .duration(1000)
            .attr("x", d => newXScale(d[chosenXAxis]))
            .attr("y", d => newYScale(d[chosenYAxis]))

    return textGroup;

}

function updateToolTip(chosenXAxis, chosenYAxis, textGroup, circlesGroup) {

    var xlabel;
    var ylabel;

    if (chosenXAxis === "poverty") {
        xlabel = "Poverty";
    }
    if (chosenXAxis === "age") {
        xlabel = "Age";
    }
    if (chosenXAxis === "income") {
        xlabel = "Household Income";
    }
    if (chosenYAxis === "healthcare") {
        ylabel = "Lacks Healthcare";
    }
    if (chosenYAxis === "smokes") {
        ylabel = "Smokes";
    }
    if (chosenYAxis === "obesity") {
        ylabel = "Obese";
    }



    var toolTip = d3.tip()
                .attr("class","d3-tip")
                .offset([80,-60])
                .html(function(d) {
                    return(`${d.state}<br>${xlabel}: ${d[chosenXAxis]}<br>${ylabel}: ${d[chosenYAxis]}`);
                });
    // var circle = d3.select("circle");

    textGroup.call(toolTip);

    textGroup.on("mouseover", function(givenData) {
        // circle.style("stroke","black"),
        toolTip.show(givenData);
    })
        .on("mouseout", function(givenData,indext) {
            // circle.style("stroke","none"),
            toolTip.hide(givenData);
        });
    
    circlesGroup.on("mouseover", function() {
        toolTip.style("stroke","black");
    })
        .on("mouseout", function() {
            toolTip.style("stroke","none");
        });

    return textGroup;

}

function updateToolTip2(circlesGroup,textGroup) {

    var toolTip2 = d3.tip()
                    .attr("class","d3-tip")
                    .attr("stroke","black");
                
    circlesGroup.call(toolTip2);

    textGroup.on("mouseover", function() {
        toolTip2.style("stroke","black");
    })
        .on("mouseout", function() {
            toolTip2.style("stroke","none");
        });
    
    return circlesGroup;
}

d3.csv("../D3_data_journalism/assets/data/data.csv").then(function(givenData, err){
    if (err) throw err;
    console.log(givenData);
    givenData.forEach(function(data) {
        data.poverty = +data.poverty;
        data.age = +data.age;
        data.income = +data.income;
        data.healthcare = +data.healthcare;
        data.obesity = +data.obesity;
        data.smokes = +data.smokes;
        
    });
    

    var xLinearScale = xScale(givenData, chosenXAxis);

    var yLinearScale = yScale(givenData, chosenYAxis);

    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);


    var xAxis = chartGroup.append("g")
                    .classed("x-axis",true)
                    .attr("transform", `translate(0,${height})`)
                    .call(bottomAxis);

    var yAxis = chartGroup.append("g")
                    .classed("y-axis",true)
                    .call(leftAxis);


    var g = chartGroup.selectAll("g")
                    .data(givenData);

    var elemEnter = g.enter()
                    .append("g");

    var circlesGroup = elemEnter.append("circle")
                                .classed("stateCircle",true)
                                .attr("cx", d => xLinearScale(d[chosenXAxis]))
                                .attr("cy", d => yLinearScale(d[chosenYAxis]))
                                .attr("r",10)
                                .attr("fill","lightblue")
                                .attr("opacity","1");
                               

    var textGroup =  elemEnter.append("text")
                        .classed("stateText",true)
                        .attr("x",d => xLinearScale(d[chosenXAxis]))
                        .attr("y", d => yLinearScale(d[chosenYAxis]))
                        .attr("font-size","8px")
                        .text(function(d) {return d.abbr});
                               

    var xlabelsGroup = elemEnter.append("g")
                        .attr("transform", `translate(${width / 2}, ${height+20})`);

    var povertyLabel = xlabelsGroup.append("text")
                        .attr("x",0)
                        .attr("y",20)
                        .attr("value", "poverty")
                        .classed("active", true)
                        .text("In Poverty (%)");

    var ageLabel = xlabelsGroup.append("text")
                        .attr("x",0)
                        .attr("y",40)
                        .attr("value","age")
                        .classed("inactive",true)
                        .text("Age (Median)");

    var incomeLabel = xlabelsGroup.append("text")
                        .attr("x",0)
                        .attr("y",60)
                        .attr("value","income")
                        .classed("inactive", true)
                        .text("Household Income (Median)");

    var ylabelsGroup = elemEnter.append("g")
                                .attr("transform", "rotate(-90)");
                        

    var healthcareLabel = ylabelsGroup.append("text")
                            .attr("y",-40)
                            .attr("x",0 - (height / 2))
                            .attr("value","healthcare")
                            .classed("active", true)
                            .text("Lacks Healthcare (%)");


    var smokesLabel = ylabelsGroup.append("text")
                            .attr("y",-60)
                            .attr("x",20 - (height / 2))
                            .attr("value", "smokes")
                            .classed("inactive", true)
                            .text("Smokes (%)");

    var obeseLabel = ylabelsGroup.append("text")
                            .attr("y",-80)
                            .attr("x",40 - (height / 2))
                            .attr("value", "obesity")
                            .classed("inactive", true)
                            .text("Obese (%)");


    var textGroup = updateToolTip(chosenXAxis, chosenYAxis, textGroup, circlesGroup);
    var circlesGroup = updateToolTip2(circlesGroup,textGroup);
    
    xlabelsGroup.selectAll("text")
        .on("click", function() {

            var xValue = d3.select(this).attr("value");
            if (xValue !== chosenXAxis) {
                chosenXAxis = xValue;

                xLinearScale = xScale(givenData,chosenXAxis);

                xAxis = renderXAxes(xLinearScale, xAxis);

                circlesGroup = updateToolTip2(circlesGroup,textGroup);

                circlesGroup = renderCircles(circlesGroup, xLinearScale,yLinearScale, chosenXAxis, chosenYAxis);

                // circlesGroup = updateToolTip2(circlesGroup,textGroup);

                textGroup = updateToolTip(chosenXAxis, chosenYAxis, textGroup, circlesGroup);

                textGroup = renderText(textGroup,xLinearScale,yLinearScale,chosenXAxis, chosenYAxis);


                if (chosenXAxis === "poverty") {
                    povertyLabel
                            .classed("active", true)
                            .classed("inactive", false);
                    ageLabel
                            .classed("active", false)
                            .classed("inactive", true);
                    incomeLabel
                            .classed("active",false)
                            .classed("inactive",true)
                    
                }

                if (chosenXAxis === "age") {
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive",true);
                    incomeLabel
                        .classed("active",false)
                        .classed("inactive",true)
                    
                }
                if (chosenXAxis === "income") {
                    incomeLabel
                        .classed("active",true)
                        .classed("inactive",false)
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive",true);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);

                }
            }

        });

    ylabelsGroup.selectAll("text")
    .on("click", function() {

        var yValue = d3.select(this).attr("value");
        if (yValue !== chosenYAxis) {
            chosenYAxis = yValue;

            yLinearScale = yScale(givenData,chosenYAxis);

            yAxis = renderYAxes(yLinearScale, yAxis);

            circlesGroup = updateToolTip2(circlesGroup,textGroup);

            circlesGroup = renderCircles(circlesGroup, xLinearScale,yLinearScale, chosenXAxis, chosenYAxis);

            // circlesGroup = updateToolTip2(circlesGroup,textGroup);

            textGroup = updateToolTip(chosenXAxis, chosenYAxis, textGroup, circlesGroup);

            textGroup = renderText(textGroup,xLinearScale,yLinearScale,chosenXAxis, chosenYAxis);

            if (chosenYAxis === "healthcare") {
                healthcareLabel
                        .classed("active", true)
                        .classed("inactive", false);
                smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                obeseLabel
                        .classed("active",false)
                        .classed("inactive",true)
                
                }

            if (chosenYAxis === "smokes") {
                smokesLabel
                    .classed("active", true)
                    .classed("inactive", false);
                healthcareLabel
                    .classed("active", false)
                    .classed("inactive",true);
                obeseLabel
                    .classed("active",false)
                    .classed("inactive",true)
                
            }
            if (chosenYAxis === "obesity") {
                obeseLabel
                    .classed("active",true)
                    .classed("inactive",false)
                healthcareLabel
                    .classed("active", false)
                    .classed("inactive",true);
                smokesLabel
                    .classed("active", false)
                    .classed("inactive", true);

            }
        }

    })
}).catch(function(error) {
    console.log(error);
});


