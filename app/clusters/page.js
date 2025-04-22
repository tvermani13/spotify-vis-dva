// grab the html that displays the different clusters
export default function ClustersPage() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">Clusters Visualizations</h1>

      <section className="mb-8">
        <h2 className="text-xl mb-2">Nation Features</h2>
        <iframe
          src="/clusters/scatterplot_nation_features.html"
          width="100%"
          height="600"
          title="Scatterplot of Clusters and Nation Features"
        />
      </section>

      <section>
        <h2 className="text-xl mb-2">Musical Features</h2>
        <iframe
          src="/clusters/scatterplot_musical_features.html"
          width="100%"
          height="600"
          title="Scatterplot of Clusters and Musical Features"
        />
      </section>
    </main>
  );
}
