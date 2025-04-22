import TimeSeriesChart from "../components/TimeSeriesChart";

export default function TimeSeriesPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Trends in Musical Attributes</h1>
      <TimeSeriesChart />
    </main>
  );
}