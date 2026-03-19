"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence } from "framer-motion";
import MapContainer from "./components/MapContainer";
import { MarketDetailView } from "./components/MarketDetailView";
import {
  GlobalStats,
  ActiveMarkets,
  PlatformMetrics,
  StatsGrid,
} from "./components/StatsDisplay";
import type { CityMarket } from "./types/market";
import { useOrchestratorSSE } from "./lib/useOrchestratorSSE";

export default function Home() {
  const [selectedCity, setSelectedCity] = useState<CityMarket | null>(null);
  const { markets, rawState, isConnected } = useOrchestratorSSE();

  const ORCHESTRATOR_URL =
    process.env.NEXT_PUBLIC_ORCHESTRATOR_URL || "http://localhost:9000";

  const handleCityClick = (city: CityMarket) => {
    if (city.hasActiveMarket) {
      // Active → open detail view
      setSelectedCity(city);
    } else {
      // Inactive → start the bot
      const marketId = city.marketId ?? city.id;
      fetch(`${ORCHESTRATOR_URL}/bot/${marketId}/start`, { method: "POST" })
        .catch(() => {});
    }
  };

  const handleStopBot = () => {
    if (!selectedCity) return;
    const marketId = selectedCity.marketId ?? selectedCity.id;
    fetch(`${ORCHESTRATOR_URL}/bot/${marketId}/stop`, { method: "POST" })
      .then(() => setSelectedCity(null))
      .catch(() => setSelectedCity(null));
  };

  const handleCloseDetail = () => {
    setSelectedCity(null);
  };

  return (
    <>
      <main className="font-mono min-h-screen max-w-[min(100vw,1600px)] mx-auto relative overflow-hidden md:rounded-md flex flex-col md:block px-6 pt-12 md:pt-16">
        <div className="w-full max-w-[1600px] space-y-1.5 mx-auto mt-1 mb-12">
          {/* Mobile Layout */}
          <div className="flex flex-col min-[961px]:hidden">
            <header className="flex flex-col items-start font-mono text-sm uppercase gap-2 mb-6">
              <p className="text-gray-1000 font-mono my-0 whitespace-nowrap">
                Weather Prediction Markets{" "}
                <span className="block font-mono text-gray-900">
                  [Global Temperature Markets]
                </span>
              </p>
              <div className="flex items-center gap-3">
                <Link
                  href="/bot"
                  className="mt-2 px-3 py-1.5 border border-[var(--ds-gray-alpha-400)] text-xs text-cyan-400 hover:bg-[var(--ds-gray-alpha-100)] transition-colors"
                >
                  BOT CONFIG
                </Link>
                <span className={`mt-2 inline-flex items-center gap-1.5 text-xs ${isConnected ? "text-green-400" : "text-red-400"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? "bg-green-400 animate-pulse" : "bg-red-400"}`} />
                  {isConnected ? "LIVE" : "OFFLINE"}
                </span>
              </div>
            </header>

            <section className="pb-6 w-full">
              <div className="flex flex-col gap-y-6">
                <GlobalStats 
                  activeCount={markets.filter(m => m.hasActiveMarket).length} 
                  markets={markets} 
                />
                <ActiveMarkets markets={markets} />
              </div>
              <PlatformMetrics activeCount={markets.filter(m => m.hasActiveMarket).length} />
            </section>

            <div className="w-full flex justify-center pointer-events-none">
              <MapContainer
                selectedCity={selectedCity}
                onCityClick={handleCityClick}
                markets={markets}
              />
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="relative hidden min-[961px]:flex flex-row max-lg:items-end lg:items-center lg:justify-between">
            <header className="flex flex-col items-start font-mono text-sm xl:text-base uppercase gap-2 max-lg:mb-8 mb-auto">
              <p className="text-gray-1000 font-mono my-0 whitespace-nowrap">
                Weather Prediction Markets{" "}
                <span className="block font-mono text-gray-900">
                  [Global Temperature Markets]
                </span>
              </p>
              <div className="flex items-center gap-3">
                <Link
                  href="/bot"
                  className="mt-2 px-3 py-1.5 border border-[var(--ds-gray-alpha-400)] text-xs text-cyan-400 hover:bg-[var(--ds-gray-alpha-100)] transition-colors"
                >
                  BOT CONFIG
                </Link>
                <span className={`mt-2 inline-flex items-center gap-1.5 text-xs ${isConnected ? "text-green-400" : "text-red-400"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? "bg-green-400 animate-pulse" : "bg-red-400"}`} />
                  {isConnected ? "LIVE" : "OFFLINE"}
                </span>
              </div>
            </header>

            <section className="lg:absolute lg:bottom-0 pb-6 w-fit z-10 relative">
              <div className="flex flex-col gap-y-8">
                <GlobalStats 
                  activeCount={markets.filter(m => m.hasActiveMarket).length} 
                  markets={markets} 
                />
                <ActiveMarkets markets={markets} />
              </div>
              <PlatformMetrics activeCount={markets.filter(m => m.hasActiveMarket).length} />
            </section>

            <div className="w-full h-full pointer-events-none max-lg:scale-[1.5] max-lg:-translate-y-16 max-lg:translate-x-[-20%]">
              <MapContainer
                selectedCity={selectedCity}
                onCityClick={handleCityClick}
                markets={markets}
              />
            </div>
          </div>

          <section className="mt-8">
            <StatsGrid />
          </section>
        </div>
      </main>

      {/* Market Detail Overlay */}
      <AnimatePresence>
        {selectedCity && (
          <MarketDetailView city={selectedCity} onClose={handleCloseDetail} onStopBot={handleStopBot} rawState={rawState} />
        )}
      </AnimatePresence>
    </>
  );
}
