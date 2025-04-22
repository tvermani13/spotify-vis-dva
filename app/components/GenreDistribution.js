"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";

const mockData = [
  { genre: "Pop", value: 30 },
  { genre: "Rock", value: 25 },
  { genre: "Hip Hop", value: 20 },
  { genre: "Electronic", value: 15 },
  { genre: "Jazz", value: 10 },
];

export default function GenreDistribution() {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!svgRef.current) return;

    d3.select(svgRef.current).selectAll("*").remove();

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    const radius = Math.min(width, height) / 2;

    const svg = d3
      .select(svgRef.current)
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    const pie = d3
      .pie()
      .value((d) => d.value)
      .sort(null);

    const arc = d3
      .arc()
      .innerRadius(radius * 0.5)
      .outerRadius(radius * 0.8);

    const color = d3
      .scaleOrdinal()
      .domain(mockData.map((d) => d.genre))
      .range(d3.schemeCategory10);

    const arcs = svg
      .selectAll("arc")
      .data(pie(mockData))
      .enter()
      .append("g")
      .attr("class", "arc");

    arcs
      .append("path")
      .attr("d", arc)
      .attr("fill", (d) => color(d.data.genre))
      .attr("opacity", 0.8)
      .on("mouseover", function () {
        d3.select(this).attr("opacity", 1).attr("transform", "scale(1.05)");
      })
      .on("mouseout", function () {
        d3.select(this).attr("opacity", 0.8).attr("transform", "scale(1)");
      });

    arcs
      .append("text")
      .attr("transform", (d) => `translate(${arc.centroid(d)})`)
      .attr("dy", ".35em")
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .text((d) => d.data.genre);
  }, []);

  return (
    <svg
      ref={svgRef}
      className="w-full h-full"
      style={{ minHeight: "300px" }}
    />
  );
}
