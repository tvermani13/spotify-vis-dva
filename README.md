Getting Started

First, run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Welcome to Team Mark's "Exploring Global Music Trends" Project. We will build an interactive application showcasing Spotify and country related data to reveal global music trends. Using a dataset of top Spotify songs by country with features like danceability and popularity and datasets on economic and social factors, we will explore song popularity by country, determine correlations between song characteristics and country data, and cluster similar nations. We intend to create a novel three-tier geographic, and chord chart and heat map visuals. Additionally, we plan to globally display potential popularity (graded choropleth) based on user-selected song characteristics.

Create .env.local:

NEXT_PUBLIC_DROPBOX_CSV_URL="https://www.dropbox.com/scl/fi/8d4xlricu84nbus4qv39g/processed_data.csv?rlkey=lzbbbv62tx9zeqr1mxnn3tf2j&st=gpojv7jb&dl=1"
