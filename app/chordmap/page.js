"use client";

import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

export default function ChordMap() {
  const containerRef = useRef(null);
  const svgRef = useRef(null);

  useEffect(() => {
    // Responsive dimensions
    const width = 900;
    const height = 800;
    const outerRadius = Math.min(width, height) / 2 - 40;
    const innerRadius = outerRadius - 30;

    // we want to limit the similarities that show up so its only relevant
    const SIM_THRESH = 0.5;
    const color = d3.scaleOrdinal(d3.schemeCategory10);
    const widthScale = d3.scaleLinear().domain([SIM_THRESH, 1]).range([1, 5]);

    // define the svg for the container with responsive viewBox
    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    // Clear any existing content
    svg.selectAll("*").remove();

    // Center group for chord map
    const g = svg
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    // don't want the tooltip to show up in different locations
    // use static location
    const tooltip = d3
      .select(containerRef.current)
      .append("div")
      .attr("id", "tooltip")
      .style("position", "absolute")
      .style("top", "20px")
      .style("right", "20px")
      .style("pointer-events", "none")
      .style("padding", "6px")
      .style("background", "#fff")
      .style("border-radius", "4px")
      .style("font-size", "12px")
      .style("color", "#000")
      .style("visibility", "hidden");

    // load the combined dataset and use danceability, energy, loudness
    d3.csv("/averaged_dataset_combined.csv").then((raw) => {
      const attrs = ["danceability", "energy", "loudness"];

      // map the data that we get to a vector so we can calculate the euclidean distance
      const data = raw.map((d) => ({
        code: d.country_x,
        vector: attrs.map((a) => +d[a]),
      }));

      // get the codes of the data for outside labels
      const codes = data.map((d) => d.code);

      // convert codes to full names for tooltip using Intl.DisplayNames
      const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
      const names = data.map((d) => regionNames.of(d.code) || d.code);

      // Euclidean distance function
      function euclid(a, b) {
        return Math.hypot(...a.map((v, i) => v - b[i]));
      }

      // build distance matrix then similarity matrix
      const distMat = data.map((d1) =>
        data.map((d2) => euclid(d1.vector, d2.vector))
      );
      const simMat = distMat.map((row, i) =>
        row.map((dist, j) => {
          if (i === j) return 0;
          const sim = 1 / (1 + dist);
          return sim >= SIM_THRESH ? sim : 0;
        })
      );

      // chord layout with padding
      const chords = d3.chord().padAngle(0.1).sortSubgroups(d3.descending)(
        simMat
      );

      const arc = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius);
      const ribbon = d3.ribbon().radius(innerRadius);

      // draw arcs
      g.append("g")
        .selectAll("path")
        .data(chords.groups)
        .join("path")
        .attr("d", arc)
        .attr("fill", (d) => color(d.index))
        .attr("stroke", (d) => d3.rgb(color(d.index)).darker());

      // filter and draw ribbons
      const strong = chords.filter((d) => d.source.value >= SIM_THRESH);
      g.append("g")
        .attr("fill-opacity", "0.7")
        .selectAll("path")
        .data(strong)
        .join("path")
        .attr("d", ribbon)
        .attr("fill", (d) => color(d.target.index))
        .attr("stroke", (d) => d3.rgb(color(d.target.index)).darker())
        .attr("stroke-width", (d) => widthScale(d.source.value))
        .on("mouseover", (event, d) => {
          d3.selectAll("path")
            .filter((x) => x.source)
            .attr("fill-opacity", "0.05")
            .attr("stroke-opacity", "0.05");
          d3.select(event.currentTarget)
            .attr("fill-opacity", "1")
            .attr("stroke-opacity", "1");

          // static tooltip content
          tooltip
            .html(
              `<strong>${names[d.source.index]}</strong> ↔ <strong>${names[d.target.index]
              }</strong><br/>Similarity: ${d3.format(".2f")(d.source.value)}`
            )
            .style("visibility", "visible");
        })
        .on("mouseout", () => {
          d3.selectAll("path")
            .filter((x) => x.source)
            .attr("fill-opacity", "0.7")
            .attr("stroke-opacity", "1");
          tooltip.style("visibility", "hidden");
        });

      // draw labels as abbreviations
      g.append("g")
        .selectAll("text")
        .data(chords.groups)
        .join("text")
        .each((d) => (d.angle = (d.startAngle + d.endAngle) / 2))
        .attr(
          "transform",
          (d) =>
            `rotate(${(d.angle * 180) / Math.PI - 90}) translate(${outerRadius + 15
            }) ${d.angle > Math.PI ? "rotate(180)" : ""}`
        )
        .attr("dy", "0.35em")
        .attr("fill", "#fff")
        .attr("text-anchor", (d) => (d.angle > Math.PI ? "end" : "start"))
        .text((d) => codes[d.index]);
    });

    // get rid of tooltip when we unmount
    return () => {
      d3.select(containerRef.current).select("#tooltip").remove();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "900px",
        margin: "50px auto 0",
        overflow: "visible",
      }}
    >
      <svg
        ref={svgRef}
        style={{
          width: "100%",
          height: "auto",
          backgroundColor: "#181818",
          overflow: "visible",
        }}
      />
    </div>
  );
}
