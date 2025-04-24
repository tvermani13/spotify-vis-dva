import TopArtistsChart from "./components/TopArtistsChart";
import GenreDistribution from "./components/GenreDistribution";

export default function Choropleth() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-6"></div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="max-w-2xl text-center">
            <div className="text-text-secondary text-2xl">
              Welcome to Team Mark&apos;s &quot;Exploring Global Music
              Trends&quot; Project. We will build an interactive application
              showcasing Spotify and country related data to reveal global music
              trends. Using a dataset of top Spotify songs by country with
              features like danceability and popularity and datasets on economic
              and social factors, we will explore song popularity by country,
              determine correlations between song characteristics and country
              data, and cluster similar nations. We intend to create a novel
              three-tier geographic, and chord chart and heat map visuals.
              Additionally, we plan to globally display potential popularity
              (graded choropleth) based on user-selected song characteristics.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
