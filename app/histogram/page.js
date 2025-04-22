"use client";

import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { feature } from "topojson-client";

export default function WorldMapHistogram() {
  const [records, setRecords] = useState({});
  const [geoFeatures, setGeoFeatures] = useState([]);
  const [mode, setMode] = useState("country");
  const [isoSel, setIsoSel] = useState(null);
  const mapRef = useRef(null);
  const histRef = useRef(null);

  useEffect(() => {
    d3.csv("/averaged_dataset_combined.csv", d3.autoType)
      .then((rows) => {
        const lookup = {};
        rows.forEach((r) => {
          const iso2 = (r.country_x || "").toUpperCase();
          if (iso2) lookup[iso2] = r;
        });
        setRecords(lookup);
      })
      .catch((e) => console.error("CSV load error", e));
  }, []);

  useEffect(() => {
    d3.json("/countries.geojson")
      .then((geoData) => {
        setGeoFeatures(geoData.features);
      })
      .catch((e) => console.error("GeoJSON load error", e));
  }, []);

  const colour = React.useMemo(() => {
    const isoList = Object.keys(records).sort();
    return d3.scaleOrdinal(isoList, d3.schemeSet3);
  }, [records]);

  useEffect(() => {
    if (!geoFeatures.length || !Object.keys(records).length) return;
    const W = 700,
      H = 420;
    const projection = d3
      .geoNaturalEarth1()
      .fitSize([W, H], { type: "FeatureCollection", features: geoFeatures });
    const pathGen = d3.geoPath().projection(projection);
    const svg = d3.select(mapRef.current).attr("width", W).attr("height", H);
    svg.selectAll("*").remove();
    svg
      .selectAll("path")
      .data(geoFeatures)
      .join("path")
      .attr("d", pathGen)
      .attr("fill", (d) => {
        const iso2 = (d.properties.ISO_A2 || "").toUpperCase();
        return records[iso2] ? colour(iso2) : "#444";
      })
      .attr("stroke", "#222")
      .attr("stroke-width", 0.3)
      .style("cursor", (d) =>
        records[(d.properties.ISO_A2 || "").toUpperCase()]
          ? "pointer"
          : "default"
      )
      .on("click", (_, d) => {
        const iso2 = (d.properties.ISO_A2 || "").toUpperCase();
        if (records[iso2]) setIsoSel(iso2);
      });
  }, [geoFeatures, records, colour]);

  useEffect(() => {
    if (!isoSel) return;

    const songKeys = [
      "danceability",
      "energy",
      "speechiness",
      "acousticness",
      "instrumentalness",
      "liveness",
      "valence",
    ];

    const countryKeys = [
      "Unemployment (% of labour force)",
      "GDP growth rate (annual %, const. 2005 prices)",
      // 'Economy: Agriculture (% of GVA)',
      "Economy: Industry (% of GVA)",
      "Economy: Services and other activity (% of GVA)",
    ];

    const keys = mode === "song" ? songKeys : countryKeys;
    const rec = records[isoSel] || {};
    const data = keys.map((k) => ({
      key: k,
      value: rec[k] != null ? +rec[k] : 0,
    }));

    const m = { t: 40, r: 20, b: 80, l: 60 };
    const W = 500,
      H = 300;
    const svg = d3.select(histRef.current).attr("width", W).attr("height", H);
    svg.selectAll("*").remove();

    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.key))
      .range([m.l, W - m.r])
      .padding(0.2);

    const maxVal = d3.max(data, (d) => d.value) || 1;
    const y = d3
      .scaleLinear()
      .domain([0, maxVal])
      .nice()
      .range([H - m.b, m.t]);

    svg
      .append("g")
      .selectAll("rect")
      .data(data)
      .join("rect")
      .attr("x", (d) => x(d.key))
      .attr("y", (d) => y(d.value))
      .attr("width", x.bandwidth())
      .attr("height", (d) => H - m.b - y(d.value))
      .attr("fill", colour(isoSel));

    svg
      .append("g")
      .attr("transform", `translate(0,${H - m.b})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end")
      .style("fill", "#ddd")
      .style("font-size", "10px");

    svg
      .append("g")
      .attr("transform", `translate(${m.l},0)`)
      .call(d3.axisLeft(y).ticks(5))
      .selectAll("text")
      .style("fill", "#ddd");

    svg
      .append("text")
      .attr("x", W / 2)
      .attr("y", m.t / 2)
      .attr("text-anchor", "middle")
      .attr("fill", "#fff")
      .style("font-size", "16px")
      .text(
        `${isoSel} — ${
          mode === "song" ? "Song Features" : "Economic %"
        } Comparison`
      );

    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -H / 2)
      .attr("y", m.l / 2 - 10)
      .attr("text-anchor", "middle")
      .attr("fill", "#ddd")
      .style("font-size", "12px")
      .text(mode === "song" ? "Value (0–1)" : "Percentage (0–100)");
  }, [isoSel, mode, records, colour]);

  return (
    <div className="flex flex-col md:flex-row gap-4 w-full">
      <svg ref={mapRef} className="shadow rounded-md bg-black" />
      <div className="flex-1 flex flex-col items-center">
        <div className="flex justify-center mb-2">
          <label className="text-gray-300 mr-2">View:</label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="text-white p-1 rounded"
          >
            <option value="country">Economic % Characteristics</option>
            <option value="song">Song Feature Values</option>
          </select>
        </div>
        <svg ref={histRef} />
        {!isoSel && (
          <p className="text-gray-400 mt-4 text-sm">
            Click a coloured country to see its stats.
          </p>
        )}
      </div>
    </div>
  );
}
