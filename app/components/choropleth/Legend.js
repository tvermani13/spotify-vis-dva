"use client";

import React from "react";
import * as d3 from "d3";

export default function Legend({ minVal, maxVal, colorScale, selectedAttr }) {
  const legendWidth = 300;
  const legendHeight = 10;
  const legendMargins = { top: 0, right: 20, bottom: 30, left: 20 };

  React.useEffect(() => {
    d3.select("#legend").select("svg").remove();

    const legendSvg = d3
      .select("#legend")
      .append("svg")
      .attr("width", legendWidth + legendMargins.left + legendMargins.right)
      .attr("height", legendHeight + legendMargins.top + legendMargins.bottom);

    const legendG = legendSvg
      .append("g")
      .attr(
        "transform",
        `translate(${legendMargins.left},${legendMargins.top})`
      );

    const xScale = d3
      .scaleLinear()
      .domain([minVal, maxVal])
      .range([0, legendWidth]);

    const gradientId = "legend-gradient";
    const defs = legendG.append("defs");
    const linearGradient = defs
      .append("linearGradient")
      .attr("id", gradientId)
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "100%")
      .attr("y2", "0%");

    linearGradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", colorScale(minVal));
    linearGradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", colorScale(maxVal));

    legendG
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .style("fill", `url(#${gradientId})`);

    const xAxis = d3.axisBottom(xScale).ticks(5).tickFormat(d3.format(".2f"));

    legendG
      .append("g")
      .attr("transform", `translate(0, ${legendHeight})`)
      .call(xAxis)
      .selectAll("text")
      .style("fill", "black");

    legendG
      .append("text")
      .attr("x", legendWidth / 2)
      .attr("y", legendHeight + 25)
      .attr("text-anchor", "middle")
      .attr("fill", "black")
      .style("font-size", "12px")
      .text(selectedAttr.charAt(0).toUpperCase() + selectedAttr.slice(1));
  }, [minVal, maxVal, colorScale, selectedAttr]);

  return (
    <div
      id="legend"
      style={{
        marginTop: "20px",
        backgroundColor: "#fff",
        padding: "10px",
        borderRadius: "4px",
      }}
    />
  );
}
