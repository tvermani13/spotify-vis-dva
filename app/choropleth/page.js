"use client";

import React, { useState, useEffect } from "react";
import { csv } from "d3-fetch";
import { autoType } from "d3-dsv";
import { rollup, mean } from "d3-array";
import ChoroplethMap from "../components/choropleth/ChoroplethMap.js";
export default function Page() {
  const [aggregatedData, setAggregatedData] = useState(null);
  const [selectedAttr, setSelectedAttr] = useState("danceability");

  // get the csv and aggregate the data that we need (danceability, energy, loudness)
  useEffect(() => {
    async function fetchData() {
      try {
        const rawData = await csv("/averaged_dataset_combined.csv", autoType);
        const groupedMap = rollup(
          rawData,
          (v) => ({
            danceability: mean(v, (d) => d.danceability),
            energy: mean(v, (d) => d.energy),
            loudness: mean(v, (d) => d.loudness),
          }),
          (d) => d.country_x
        );
        const aggregatedObj = Object.fromEntries(groupedMap);
        setAggregatedData(aggregatedObj);
      } catch (error) {
        console.error("Error loading CSV:", error);
      }
    }
    fetchData();
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: "#181818",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <h1 style={{ color: "#fff", marginBottom: "20px" }}>
        Choropleth Map by Attribute
      </h1>

      <div style={{ marginBottom: "20px" }}>
        <label
          htmlFor="attribute"
          style={{ color: "#fff", marginRight: "10px" }}
        >
          Choose attribute:
        </label>
        <select
          id="attribute"
          value={selectedAttr}
          onChange={(e) => setSelectedAttr(e.target.value)}
          style={{ padding: "4px" }}
        >
          <option value="danceability">Danceability</option>
          <option value="energy">Energy</option>
          <option value="loudness">Loudness</option>
        </select>
      </div>

      <ChoroplethMap
        aggregatedData={aggregatedData}
        selectedAttr={selectedAttr}
      />
    </div>
  );
}
