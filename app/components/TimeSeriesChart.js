"use client";

import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";

const TimeSeriesChart = () => {
  const ref = useRef();

  const [attribute, setAttribute] = useState("danceability");
  const [country, setCountry] = useState("");
  const [countries, setCountries] = useState([]);
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentFrameIndex, setCurrentFrameIndex] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(100); // ms

  // useEffect(() => {
  //   d3.csv("/data/processed_data.csv", d3.autoType).then((data) => {
  //     data.forEach((d) => {
  //       d.date = new Date(d.snapshot_date);
  //     });

  //     setRawData(data);
  //     setCountries(Array.from(new Set(data.map((d) => d.country_y))).sort());
  //     setCountry((prev) => prev || data[0]?.country_y || "");
  //     setLoading(false);
  //   });
  // }, []);

  // const csvUrl = process.env.NEXT_PUBLIC_DROPBOX_CSV_URL;

  // useEffect(() => {
  //   d3.csv(csvUrl, d3.autoType).then((data) => {
  //     data.forEach((d) => {
  //       d.date = new Date(d.snapshot_date);
  //     });

  //     setLoading(false);
  //   });
  // }, [csvUrl]);

  useEffect(() => {
    d3.csv("/api/csv", d3.autoType).then((data) => {
      data.forEach((d) => (d.date = new Date(d.snapshot_date)));
      setRawData(data);
      setRawData(data);
      setCountries(Array.from(new Set(data.map((d) => d.country_y))).sort());
      setCountry((prev) => prev || data[0]?.country_y || "");
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!isPlaying || !rawData.length || !country) return;

    const countryData = rawData.filter((d) => d.country_y === country);
    const grouped = Array.from(
      d3.group(countryData, (d) => d.snapshot_date),
      ([date, values]) => ({
        date: new Date(date),
        value: d3.mean(values, (v) => v[attribute]),
      })
    )
      .filter((d) => d.value !== null)
      .sort((a, b) => a.date - b.date);

    if (currentFrameIndex >= grouped.length) {
      setIsPlaying(false);
      return;
    }

    const timer = setTimeout(() => {
      setCurrentFrameIndex((prev) => prev + 1);
    }, speed);

    return () => clearTimeout(timer);
  }, [isPlaying, currentFrameIndex, rawData, country, attribute, speed]);

  useEffect(() => {
    if (!rawData.length || !country) return;

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 30, bottom: 30, left: 50 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const chartArea = svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    let tooltip = d3.select(".series_tooltip");
    if (tooltip.empty()) {
      tooltip = d3
        .select("body")
        .append("div")
        .attr("class", "series_tooltip")
        .style("position", "absolute")
        .style("background", "#1a1a1a")
        .style("color", "#eee")
        .style("padding", "6px 10px")
        .style("border", "1px solid #444")
        .style("border-radius", "6px")
        .style("font-size", "13px")
        .style("pointer-events", "none")
        .style("white-space", "nowrap")
        .style("z-index", "9999")
        .style("box-shadow", "0px 2px 10px rgba(0, 0, 0, 0.5)")
        .style("opacity", "0.95")
        .style("display", "none");
    }

    const countryData = rawData.filter((d) => d.country_y === country);
    const fullGrouped = Array.from(
      d3.group(countryData, (d) => d.snapshot_date),
      ([date, values]) => ({
        date: new Date(date),
        value: d3.mean(values, (v) => v[attribute]),
      })
    )
      .filter((d) => d.value !== null)
      .sort((a, b) => a.date - b.date);

    const grouped =
      currentFrameIndex !== null
        ? fullGrouped.slice(0, currentFrameIndex + 1)
        : fullGrouped;

    const yExtent = d3.extent(grouped, (d) => d.value);
    const yRange = yExtent[1] - yExtent[0];
    const padding = yRange * 0.25;

    const x = d3
      .scaleTime()
      .domain(d3.extent(fullGrouped, (d) => d.date))
      .range([0, width]);

    const y = d3
      .scaleLinear()
      .domain([yExtent[0] - padding, yExtent[1] + padding])
      .range([height, 0]);

    chartArea
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%b %Y")));

    chartArea.append("g").call(d3.axisLeft(y));

    const line = d3
      .line()
      .x((d) => x(d.date))
      .y((d) => y(d.value));

    chartArea
      .selectAll(".line-path")
      .data([grouped])
      .join(
        (enter) =>
          enter
            .append("path")
            .attr("class", "line-path")
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 2)
            .attr("d", line),
        (update) => update.transition().duration(600).attr("d", line),
        (exit) => exit.remove()
      );

    chartArea
      .selectAll(".data-circle")
      .data(grouped, (d) => d.date)
      .join(
        (enter) =>
          enter
            .append("circle")
            .attr("class", "data-circle")
            .attr("cx", (d) => x(d.date))
            .attr("cy", (d) => y(d.value))
            .attr("r", 0)
            .attr("fill", "red")
            .transition()
            .duration(300)
            .attr("r", 3),
        (update) =>
          update
            .transition()
            .duration(600)
            .attr("cx", (d) => x(d.date))
            .attr("cy", (d) => y(d.value)),
        (exit) => exit.transition().duration(300).attr("r", 0).remove()
      );

    if (isPlaying && grouped.length > 0) {
      const lastPoint = grouped[grouped.length - 1];

      chartArea
        .append("circle")
        .attr("class", "trail-dot")
        .attr("cx", x(lastPoint.date))
        .attr("cy", y(lastPoint.value))
        .attr("r", 5)
        .attr("fill", "gold")
        .attr("stroke", "#333")
        .attr("stroke-width", 1.5);

      tooltip
        .html(
          `📅 ${lastPoint.date.toISOString().slice(0, 10)}<br>` +
            `${attribute}: ${lastPoint.value.toFixed(3)}`
        )
        .style("left", `${x(lastPoint.date) + 100}px`)
        .style("top", `${y(lastPoint.value) + 150}px`)
        .style("display", "block");
    } else {
      tooltip.style("display", "none");
    }

    chartArea
      .selectAll(".data-circle")
      .on("mouseover", (event, d) => {
        tooltip
          .html(
            `Date: ${d.date
              .toISOString()
              .slice(0, 10)}<br>${attribute}: ${d.value.toFixed(3)}`
          )
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 28}px`)
          .style("display", "block");
      })
      .on("mouseout", () => tooltip.style("display", "none"));
  }, [rawData, attribute, country, currentFrameIndex, isPlaying]);

  return (
    <div>
      <h3 className="text-xl font-semibold mb-2">Time-Series Chart</h3>

      {loading ? (
        <p className="text-white">Loading data...</p>
      ) : (
        <>
          <label>Attribute: </label>
          <select
            onChange={(e) => setAttribute(e.target.value)}
            value={attribute}
          >
            <option value="danceability">Danceability</option>
            <option value="energy">Energy</option>
            <option value="valence">Valence</option>
          </select>

          <label style={{ marginLeft: "1rem" }}>Country: </label>
          <select
            onChange={(e) => {
              setCountry(e.target.value);
              setCurrentFrameIndex(null);
            }}
            value={country}
          >
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </>
      )}

      {!loading && (
        <div className="my-4 flex items-center gap-4">
          <button
            onClick={() => {
              if (isPlaying) {
                setIsPlaying(false);
              } else {
                if (currentFrameIndex === null) {
                  setCurrentFrameIndex(0);
                }
                setIsPlaying(true);
              }
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition font-semibold"
          >
            {isPlaying
              ? "⏸ Pause"
              : currentFrameIndex !== null
              ? "▶ Resume"
              : "▶ Play"}
          </button>

          <label className="text-white">
            Speed:
            <select
              className="ml-2 px-2 py-1 bg-gray-800 text-white border border-gray-600 rounded"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
            >
              <option value={300}>Slow</option>
              <option value={100}>Medium</option>
              <option value={30}>Fast</option>
            </select>
          </label>
        </div>
      )}

      <svg ref={ref}></svg>
    </div>
  );
};

export default TimeSeriesChart;
