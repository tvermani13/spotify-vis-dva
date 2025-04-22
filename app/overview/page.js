import TopArtistsChart from "../components/TopArtistsChart";
import GenreDistribution from "../components/GenreDistribution";

export default function Overview() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-6"></div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="vis-card">
            <h2 className="text-xl mb-4">Top Artists</h2>
            <TopArtistsChart />
          </div>

          <div className="vis-card">
            <h2 className="text-xl mb-4">Listening History</h2>
            <div className="h-64 flex items-center justify-center text-text-secondary">
              Coming soon...
            </div>
          </div>

          <div className="vis-card">
            <h2 className="text-xl mb-4">Genre Distribution</h2>
            <GenreDistribution />
          </div>

          <div className="vis-card">
            <h2 className="text-xl mb-4">Playlist Analysis</h2>
            <div className="h-64 flex items-center justify-center text-text-secondary">
              Coming soon...
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
