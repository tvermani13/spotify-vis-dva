"use client";

import { useEffect, useRef } from "react";

import * as d3 from "d3";

const mockData = [
  { name: "Artist 1", plays: 150 },
  { name: "Artist 2", plays: 120 },
  { name: "Artist 3", plays: 100 },
  { name: "Artist 4", plays: 80 },
  { name: "Artist 5", plays: 60 },
];

export default function TopArtistsChart() {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!svgRef.current) return;

    d3.select(svgRef.current).selectAll("*").remove();

    const margin = { top: 20, right: 20, bottom: 30, left: 60 };
    const width = svgRef.current.clientWidth - margin.left - margin.right;
    const height = svgRef.current.clientHeight - margin.top - margin.bottom;

    const x = d3
      .scaleBand()
      .domain(mockData.map((d) => d.name))
      .range([0, width])
      .padding(0.1);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(mockData, (d) => d.plays)])
      .range([height, 0]);

    const svg = d3
      .select(svgRef.current)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    svg
      .selectAll("rect")
      .data(mockData)
      .enter()
      .append("rect")
      .attr("x", (d) => x(d.name))
      .attr("y", (d) => y(d.plays))
      .attr("width", x.bandwidth())
      .attr("height", (d) => height - y(d.plays))
      .attr("fill", "var(--accent)")
      .attr("opacity", 0.8)
      .on("mouseover", function () {
        d3.select(this).attr("opacity", 1);
      })
      .on("mouseout", function () {
        d3.select(this).attr("opacity", 0.8);
      });

    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("fill", "var(--text-secondary)")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-45)");

    svg
      .append("g")
      .call(d3.axisLeft(y))
      .selectAll("text")
      .attr("fill", "var(--text-secondary)");

    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", -margin.top / 2)
      .attr("text-anchor", "middle")
      .attr("fill", "var(--foreground)")
      .text("Top Artists by Plays");
  }, []);

  return (
    <svg
      ref={svgRef}
      className="w-full h-full"
      style={{ minHeight: "300px" }}
    />
  );
}
