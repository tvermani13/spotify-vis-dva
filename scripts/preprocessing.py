import pandas as pd

input_csv  = "cleaned_spotify_data.csv"
output_csv = "averaged_dataset_combined.csv"

cols = [
    "country_x",
    "danceability",
    "energy",
    "speechiness",
    "acousticness",
    "instrumentalness",
    "liveness",
    "valence",
    "loudness",
    "Unemployment (% of labour force)",
    "GDP growth rate (annual %, const. 2005 prices)",
    "Economy: Agriculture (% of GVA)",
    "Economy: Industry (% of GVA)",
    "Economy: Services and other activity (% of GVA)",
]

# read in one pass to avoid mixed‑type chunks
df = pd.read_csv(
    input_csv,
    usecols=cols,
    low_memory=False
)

df.columns = df.columns.str.strip()

averaged = (
    df
    .groupby("country_x", as_index=False)
    .mean(numeric_only=True)
)

averaged.to_csv(output_csv, index=False)
