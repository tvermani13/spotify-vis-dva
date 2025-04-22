"use client";

import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import Legend from "./Legend";

export default function ChoroplethMap({ aggregatedData, selectedAttr }) {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const [legendData, setLegendData] = useState(null);

  // track container width for true responsiveness
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const w = Math.min(entry.contentRect.width, 800); // cap at 800px
        const h = (w * 500) / 800; // preserve aspect
        setDimensions({ width: w, height: h });
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!aggregatedData || dimensions.width === 0) return;

    const { width, height } = dimensions;

    // define responsive svg
    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .style("background-color", "white");

    svg.selectAll("*").remove();

    d3.json("/countries.geojson")
      .then((geoData) => {
        // projection fit to current dimensions
        const projection = d3.geoNaturalEarth1();
        projection.fitSize([width, height], geoData);
        const pathGenerator = d3.geoPath().projection(projection);

        const attrValues = Object.values(aggregatedData).map(
          (d) => d[selectedAttr]
        );
        const [minVal, maxVal] = d3.extent(attrValues);

        const colorScale = d3
          .scaleSequential()
          .domain([minVal, maxVal])
          .interpolator(d3.interpolateBlues);

        setLegendData({ minVal, maxVal, colorScale });

        svg
          .selectAll("path")
          .data(geoData.features)
          .join("path")
          .attr("d", (feature) => pathGenerator(feature) || "")
          .attr("fill", (feature) => {
            const isoCode = feature.properties.ISO_A2;
            const val = aggregatedData[isoCode]?.[selectedAttr];
            return val != null ? colorScale(val) : "#ccc";
          })
          .attr("stroke", "#fff")
          .attr("stroke-width", 0.5)
          .on("mouseover", function (event, d) {
            const isoCode = d.properties.ISO_A2;
            const country = d.properties.NAME || isoCode;
            const val = aggregatedData[isoCode]?.[selectedAttr];
            d3.select("#tooltip")
              .style("visibility", "visible")
              .html(
                `<div style="font-weight:bold;">${country}</div>` +
                  `<div>${
                    selectedAttr.charAt(0).toUpperCase() + selectedAttr.slice(1)
                  }: ${val != null ? d3.format(".2f")(val) : "N/A"}</div>`
              );
            d3.select(this)
              .transition()
              .duration(100)
              .attr("stroke", "black")
              .attr("stroke-width", 1.5);
          })
          .on("mousemove", (event) => {
            d3.select("#tooltip")
              .style("top", event.pageY + 10 + "px")
              .style("left", event.pageX + 10 + "px");
          })
          .on("mouseout", function () {
            d3.select("#tooltip").style("visibility", "hidden");
            d3.select(this)
              .transition()
              .duration(100)
              .attr("stroke", "#fff")
              .attr("stroke-width", 0.5);
          });
      })
      .catch((err) => console.error("Error loading GeoJSON:", err));
  }, [aggregatedData, selectedAttr, dimensions]);

  return (
    <div
      ref={containerRef}
      style={{ position: "relative", width: "100%", maxWidth: 800 }}
    >
      <svg
        ref={svgRef}
        style={{ display: "block", width: "100%", height: "auto" }}
      />
      <div
        id="tooltip"
        style={{
          position: "absolute",
          visibility: "hidden",
          backgroundColor: "black",
          color: "white",
          padding: "6px",
          border: "1px solid #ccc",
          borderRadius: "4px",
          pointerEvents: "none",
          fontSize: "12px",
        }}
      />

      {legendData && (
        // center the legend
        <div
          style={{
            position: "absolute",
            bottom: -30,
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          <Legend
            minVal={legendData.minVal}
            maxVal={legendData.maxVal}
            colorScale={legendData.colorScale}
            selectedAttr={selectedAttr}
          />
        </div>
      )}
    </div>
  );
}
