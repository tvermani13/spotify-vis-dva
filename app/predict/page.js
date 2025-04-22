"use client";

import React, { useState, useEffect } from "react";
import { csv } from "d3-fetch";
import { autoType } from "d3-dsv";

export default function PredictPage() {
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [countryChars, setCountryChars] = useState({});
  const [audio, setAudio] = useState({
    danceability: 0.5,
    energy: 0.5,
    key: 0,
    loudness: -10,
    mode: 1,
    speechiness: 0.05,
    acousticness: 0.5,
    instrumentalness: 0.0,
    liveness: 0.1,
    valence: 0.5,
    tempo: 100,
    duration: 180000,
  });
  const [prediction, setPrediction] = useState(null);

  useEffect(() => {
    csv("/country_level_stats.csv", autoType).then((rows) => {
      const seen = new Set();
      const unique = rows.filter((r) => {
        if (seen.has(r.Country)) return false;
        seen.add(r.Country);
        return true;
      });
      const cleaned = unique.map((r) => ({
        country_name: r["Country"],
        gdp_per_capita: r["GDP per capita (current US$)"],
        population: r["Population in thousands (2017)"],
        urban_population: r["Urban population (% of total population)"],
        internet_users:
          r["Individuals using the Internet (per 100 inhabitants)"],
        health_expenditure: r["Health: Total expenditure (% of GDP)"],
        education_expenditure: r["Education expenditure (% of GDP)"],
        women_parliament_seats:
          r["Seats held by women in national parliaments %"],
        mobile_subscriptions:
          r["Mobile-cellular subscriptions (per 100 inhabitants)"],
        co2_emissions:
          r["CO2 emission estimates (million tons/tons per capita)"],
        energy_production: r["Energy production, primary (Petajoules)"],
        freedom_index_2023: r["freedom"],
      }));
      setCountries(cleaned);
      setSelectedCountry(cleaned[0].country_name);
      setCountryChars(cleaned[0]);
    });
  }, []);

  useEffect(() => {
    const rec = countries.find((c) => c.country_name === selectedCountry);
    if (rec) setCountryChars(rec);
  }, [selectedCountry, countries]);

  const onAudioChange = (field, val) =>
    setAudio((a) => ({ ...a, [field]: val }));

  const handleSubmit = async () => {
    setPrediction(null);
    const payload = {
      ...audio,
      gdp_per_capita: countryChars.gdp_per_capita,
      population: countryChars.population,
      urban_population: countryChars.urban_population,
      internet_users: countryChars.internet_users,
      health_expenditure: countryChars.health_expenditure,
      education_expenditure: countryChars.education_expenditure,
      women_parliament_seats: countryChars.women_parliament_seats,
      mobile_subscriptions: countryChars.mobile_subscriptions,
      co2_emissions: countryChars.co2_emissions,
      energy_production: countryChars.energy_production,
      freedom_index_2023: countryChars.freedom_index_2023,
    };
    try {
      const res = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      console.log("prediction:", result);
      setPrediction(result.prediction);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container">
      <h1>Predict Song Popularity</h1>

      <section className="section">
        <label htmlFor="country-select">Country</label>
        <select
          id="country-select"
          value={selectedCountry}
          onChange={(e) => setSelectedCountry(e.target.value)}
        >
          {countries.map((c) => (
            <option key={c.country_name} value={c.country_name}>
              {c.country_name}
            </option>
          ))}
        </select>
      </section>

      <section className="section">
        <h2>Audio Features</h2>
        {Object.entries(audio).map(([k, v]) => (
          <div className="audio-feature" key={k}>
            <label htmlFor={k}>{k}</label>
            <input
              id={k}
              type={k === "key" || k === "mode" ? "number" : "range"}
              min={0}
              max={
                k === "key"
                  ? 11
                  : k === "mode"
                    ? 1
                    : k.includes("ness")
                      ? 1
                      : k === "loudness"
                        ? -60
                        : 1
              }
              step={k === "tempo" ? 0.1 : 0.01}
              value={v}
              onChange={(e) => onAudioChange(k, +e.target.value)}
            />
            <span>{v}</span>
          </div>
        ))}
      </section>

      <button className="submit-btn" onClick={handleSubmit}>
        Send POST
      </button>

      {prediction !== null && (
        <div className="prediction-box">
          Predicted Popularity Score: {prediction}
        </div>
      )}

      <style jsx>{`
        .container {
          max-width: 600px;
          margin: auto;
          padding: 2rem;
          color: #fff;
          font-family: sans-serif;
        }
        .section {
          margin-bottom: 2rem;
        }
        label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }
        select,
        input[type="range"],
        input[type="number"] {
          width: 100%;
        }
        .audio-feature {
          display: grid;
          grid-template-columns: 1fr auto auto;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        .audio-feature span {
          min-width: 3ch;
          text-align: right;
        }
        .submit-btn {
          padding: 0.75rem 1.5rem;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          background: #1db954;
          border: none;
          border-radius: 4px;
        }
        .submit-btn:hover {
          background: #17a44c;
        }
        .prediction-box {
          margin-top: 2rem;
          padding: 1rem;
          background: rgba(30, 215, 96, 0.1);
          border: 1px solid #1db954;
          border-radius: 4px;
          text-align: center;
          font-size: 1.25rem;
          font-weight: 500;
          color: #1db954;
        }
      `}</style>
    </div>
  );
}
