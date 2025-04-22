"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  const navItems = [
    ["/", "Home"],
    ["/predict", "Popularity Prediction"],
    ["/histogram", "Histogram"],
    ["/choropleth", "Choropleth"],
    ["/timeseries", "Time Series"],
    ["/chordmap", "Chord Map"],
    ["/clusters", "Clusters"],
  ];

  return (
    <header className="border-b border-gray-800 bg-gray-900">
      <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between">
        <h1 className="text-2xl font-bold text-white">
          Spotify Data Visualization
        </h1>
        <nav className="mt-4 md:mt-0 space-x-4">
          {navItems.map(([href, label]) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`transition ${
                  isActive
                    ? "text-white hover:text-accent"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
