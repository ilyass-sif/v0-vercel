"use client";

import { motion } from "framer-motion";
import type { MarketData, CityMarket, PredictionBracket } from "../types/market";
import { PLACEHOLDER_MARKET_DETAIL } from "../types/market";
import type { OrchestratorState } from "../lib/useOrchestratorSSE";

interface MarketDetailViewProps {
  city: CityMarket;
  marketData?: MarketData;
  onClose: () => void;
  onStopBot?: () => void;
  rawState?: OrchestratorState | null;
}

function formatNumber(num: number): string {
  return num.toLocaleString("en-US");
}

function formatCompactNumber(num: number): string {
  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(0)}B`;
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(0)}K`;
  }
  return num.toString();
}

export function MarketDetailView({
  city,
  onClose,
  onStopBot,
  rawState,
}: MarketDetailViewProps) {
  const isUS = city.iso2 === "US";

  // Read market data directly from SSE state (same as frontend-v2)
  const marketId = city.marketId ?? city.id;
  const market = rawState?.markets?.[marketId];

  // Build brackets from polymarket[] cross-referenced with prediction.brackets[]
  const brackets: PredictionBracket[] = [];
  if (market?.polymarket && market.polymarket.length > 0) {
    const predBrackets = market.prediction?.brackets || [];

    // Sort by extracted temp number
    const sortedPM = [...market.polymarket].sort((a, b) => {
      const numA = parseInt(a.title.match(/(-?\d+)/)?.[1] ?? "0", 10);
      const numB = parseInt(b.title.match(/(-?\d+)/)?.[1] ?? "0", 10);
      return numA - numB;
    });

    for (const pm of sortedPM) {
      if (!pm.title) continue;
      const matchNum = parseInt(pm.title.match(/(-?\d+)/)?.[1] ?? "0", 10);
      const titleLower = pm.title.toLowerCase();

      let modelProb = 0;
      if (titleLower.includes("higher") || titleLower.includes("above") || titleLower.includes("more")) {
        modelProb = predBrackets
          .filter((b: { temp: number }) => b.temp >= matchNum)
          .reduce((sum: number, b: { probability: number }) => sum + (b.probability || 0), 0) * 100;
      } else if (titleLower.includes("lower") || titleLower.includes("below") || titleLower.includes("less")) {
        modelProb = predBrackets
          .filter((b: { temp: number }) => b.temp <= matchNum)
          .reduce((sum: number, b: { probability: number }) => sum + (b.probability || 0), 0) * 100;
      } else {
        const found = predBrackets.find((b: { temp: number }) => b.temp === matchNum);
        modelProb = (found?.probability || 0) * 100;
      }
      modelProb = Math.max(0, Math.min(100, isNaN(modelProb) ? 0 : modelProb));

      brackets.push({
        range: `${matchNum}${isUS ? "°F" : "°C"}`,
        title: pm.title,
        price: pm.yes_ask ?? 0,
        modelProbability: Math.round(modelProb * 10) / 10,
        color: modelProb < 30 ? "#3b82f6" : modelProb < 60 ? "#f59e0b" : "#22c55e",
      });
    }
  }

  let currentTemp = city.currentTemp;
  if (market?.weather) {
    if (market.weather.temp_c !== null && market.weather.temp_c !== undefined) {
      currentTemp = market.weather.temp_c;
    } else if (market.weather.temp_f !== null && market.weather.temp_f !== undefined) {
      currentTemp = Math.round(((market.weather.temp_f - 32) * 5) / 9 * 10) / 10;
    }
  }

  const mostLikelyRenderBracket = brackets.length > 0 
    ? brackets.reduce((prev, curr) => (prev.modelProbability > curr.modelProbability) ? prev : curr) 
    : null;

  const predBrackets = market?.prediction?.brackets || [];
  const mostLikelyBracket = predBrackets.length > 0
    ? predBrackets.reduce((prev: any, curr: any) => (prev.probability > curr.probability) ? prev : curr)
    : null;

  const quantiles = (market?.prediction as any)?.quantiles || {};
  const predictedPeak = quantiles.P50 !== undefined ? quantiles.P50 : (mostLikelyBracket ? mostLikelyBracket.temp : null);

  let volatility: "LOW" | "MEDIUM" | "HIGH" = "MEDIUM";
  if (quantiles.P10 !== undefined && quantiles.P90 !== undefined) {
    const spread = quantiles.P90 - quantiles.P10;
    if (spread > 6) volatility = "HIGH";
    else if (spread > 3) volatility = "MEDIUM";
    else volatility = "LOW";
  }

  const data: MarketData = {
    ...PLACEHOLDER_MARKET_DETAIL,
    id: marketId,
    cityName: city.city,
    currentTemperature: currentTemp,
    predictionBrackets: brackets,
    lastUpdate: market?.last_update ?? "—",
    activeMarkets: brackets.length,
    totalVolume: market?.volume ?? city.volume ?? 0,
    marketProbability: {
      temperature: predictedPeak !== null ? predictedPeak : (currentTemp ?? 0),
      label: mostLikelyBracket ? "Model Prediction" : "Current",
    },
    modelConfidence: mostLikelyBracket ? Math.round(mostLikelyBracket.probability * 100) : 0,
    predictedPeak: predictedPeak !== null ? predictedPeak : 0,
    volatility: volatility,
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 bg-[var(--ds-background-100)]"
    >
      <div className="w-full h-full overflow-auto">
        <div className="max-w-[1600px] mx-auto px-6 py-8">
          {/* Header */}
          <header className="mb-8">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-mono font-medium text-[var(--ds-gray-1000)] tracking-tight uppercase mb-2">
                  Weather Market Detail: {data.cityName}
                </h1>
                <div className="flex flex-col gap-1 text-sm font-mono text-[var(--ds-gray-500)]">
                  <span>Market ID: {data.id}</span>
                  <span>Expires: {data.expiresAt}</span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-[var(--ds-gray-500)] hover:text-[var(--ds-gray-1000)] hover:bg-[var(--ds-gray-alpha-100)] rounded transition-colors"
                aria-label="Close market detail"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </header>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Left Side - Temperature & Brackets */}
            <div className="space-y-8">
              {/* Current Temperature */}
              <section>
                <h2 className="text-xs font-mono text-[var(--ds-gray-500)] uppercase tracking-wide mb-2">
                  Current Temperature
                </h2>
                <div className="text-6xl md:text-7xl font-mono font-medium text-[var(--ds-gray-1000)] tabular-nums">
                  {data.currentTemperature !== null
                    ? isUS
                      ? `${Math.round((data.currentTemperature * 9) / 5 + 32)}°F`
                      : `${data.currentTemperature.toFixed(1)}°C`
                    : "--"}
                </div>
                {data.recordHigh && (
                  <div className="text-sm font-mono text-[var(--ds-gray-500)] mt-2">
                    Record High: {data.recordHigh.value}{isUS ? "°F" : "°C"} ({data.recordHigh.date})
                  </div>
                )}
              </section>

              {/* Prediction Brackets */}
              <section>
                <h2 className="text-xs font-mono text-[var(--ds-gray-500)] uppercase tracking-wide mb-4">
                  Prediction Brackets
                </h2>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className="w-2 h-2 rounded-sm"
                      style={{ backgroundColor: "#3b82f6" }}
                    />
                    <span className="text-sm font-mono text-[var(--ds-gray-1000)] uppercase">
                      Bracket Ranges
                    </span>
                  </div>
                  <div className="space-y-2">
                    {data.predictionBrackets.map((bracket, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 font-mono text-sm"
                      >
                        <span
                          className="w-2 h-2 rounded-sm shrink-0"
                          style={{ backgroundColor: bracket.color }}
                        />
                        <span className="text-[var(--ds-gray-1000)] flex-1 min-w-0 truncate" title={bracket.title ?? bracket.range}>
                          {bracket.title ?? bracket.range}
                        </span>
                        <span className="text-[var(--ds-gray-500)] shrink-0">
                          Ask:{" "}
                          <span className="text-[var(--ds-gray-1000)] tabular-nums">
                            {bracket.price.toFixed(2)}
                          </span>
                        </span>
                        <span className="text-[var(--ds-gray-500)] shrink-0">
                          Model:{" "}
                          <span className="text-[var(--ds-gray-1000)] tabular-nums">
                            {bracket.modelProbability}%
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>

            {/* Right Side - Map Placeholder */}
            {(() => {
              const stationId = city.id.toUpperCase().split("_").pop() || "";
              const supportedImages = ["NZWN", "KSEA", "LTAC", "KLGA", "RJTT", "LFPG"];
              const hasImage = supportedImages.includes(stationId);

              return (
                <div className="relative aspect-video bg-[var(--ds-background-200)] rounded-lg border border-[var(--ds-gray-200)] overflow-hidden flex items-center justify-center">
                  {hasImage ? (
                    <img 
                      src={`/media/${stationId}.jpg`} 
                      alt={`${city.city} Map`} 
                      className="absolute inset-0 w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="text-center">
                      <div
                        className="w-4 h-4 rounded-full mx-auto mb-3"
                        style={{ backgroundColor: city.color }}
                      />
                      <span className="text-[var(--ds-gray-500)] font-mono text-sm">
                        Regional Map View
                      </span>
                      <div className="text-[var(--ds-gray-400)] font-mono text-xs mt-1">
                        {city.coordinates[1].toFixed(2)}°N, {Math.abs(city.coordinates[0]).toFixed(2)}°
                        {city.coordinates[0] < 0 ? "W" : "E"}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Stats Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total Volume Card */}
            <div className="bg-[var(--ds-gray-alpha-100)] rounded-lg p-6">
              <h3 className="text-xs font-mono text-[var(--ds-gray-500)] uppercase tracking-wide mb-3">
                Total Volume
              </h3>
              <div className="text-3xl font-mono font-medium text-[var(--ds-gray-1000)] tabular-nums mb-2">
                {formatNumber(data.totalVolume)}{" "}
                <span className="text-lg">USDC</span>
              </div>
              <div className="text-sm font-mono text-[var(--ds-gray-500)]">
                Liquidity:{" "}
                <span className="text-[var(--ds-gray-900)]">
                  {formatNumber(data.liquidity)} USDC
                </span>
              </div>
            </div>

            {/* Market Probability Card */}
            <div className="bg-[var(--ds-gray-alpha-100)] rounded-lg p-6">
              <h3 className="text-xs font-mono text-[var(--ds-gray-500)] uppercase tracking-wide mb-3">
                Model Prediction
              </h3>
              <div className="text-2xl md:text-3xl font-mono font-medium text-[var(--ds-gray-1000)] mb-4">
                {mostLikelyRenderBracket ? (
                  mostLikelyRenderBracket.title || mostLikelyRenderBracket.range
                ) : (
                  <span>
                    {data.currentTemperature !== null
                      ? isUS
                        ? `${Math.round((data.currentTemperature * 9) / 5 + 32)}°F`
                        : `${data.currentTemperature.toFixed(1)}°C`
                      : "--"}
                  </span>
                )}
                {mostLikelyRenderBracket && (
                  <span className="text-sm font-normal text-[var(--ds-gray-500)] ml-2 block mt-1">
                    ({data.marketProbability.label})
                  </span>
                )}
              </div>
              <div className="space-y-2 text-sm font-mono">
                <div className="flex justify-between">
                  <span className="text-[var(--ds-gray-500)] uppercase">
                    Model Confidence:
                  </span>
                  <span className="text-[var(--ds-gray-1000)] tabular-nums">
                    {data.modelConfidence}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--ds-gray-500)] uppercase">
                    Predicted Peak:
                  </span>
                  <span className="text-[var(--ds-gray-1000)] tabular-nums">
                    {mostLikelyRenderBracket ? (mostLikelyRenderBracket.range || mostLikelyRenderBracket.title) : "--"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--ds-gray-500)] uppercase">
                    Volatility:
                  </span>
                  <span
                    className={`tabular-nums ${
                      data.volatility === "HIGH"
                        ? "text-red-500"
                        : data.volatility === "MEDIUM"
                        ? "text-yellow-500"
                        : "text-green-500"
                    }`}
                  >
                    {data.volatility}
                  </span>
                </div>
              </div>
            </div>

            {/* Outcome Shares Card */}
            <div className="bg-[var(--ds-gray-alpha-100)] rounded-lg p-6">
              <h3 className="text-xs font-mono text-[var(--ds-gray-500)] uppercase tracking-wide mb-3">
                Outcome Shares
              </h3>
              <div className="space-y-2 text-sm font-mono mb-4">
                <div className="flex justify-between">
                  <span className="text-[var(--ds-gray-500)]">YES SHARES:</span>
                  <span className="text-[var(--ds-gray-1000)] tabular-nums">
                    {formatNumber(data.outcomeShares.yes)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--ds-gray-500)]">NO SHARES:</span>
                  <span className="text-[var(--ds-gray-1000)] tabular-nums">
                    {formatNumber(data.outcomeShares.no)}
                  </span>
                </div>
                {data.outcomeShares.myPosition && (
                  <div className="flex justify-between">
                    <span className="text-[var(--ds-gray-500)]">
                      MY POSITION:
                    </span>
                    <span className="text-[var(--ds-gray-1000)] tabular-nums">
                      {formatNumber(data.outcomeShares.myPosition.amount)}{" "}
                      {data.outcomeShares.myPosition.side}
                    </span>
                  </div>
                )}
              </div>
              <div className="border-t border-[var(--ds-gray-200)] pt-3 space-y-2 text-sm font-mono">
                <div className="flex justify-between">
                  <span className="text-[var(--ds-gray-500)]">DATA REFRESH:</span>
                  <span className="text-[var(--ds-gray-1000)] tabular-nums text-xs">
                    {formatCompactNumber(data.dataRefresh)} ms
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--ds-gray-500)]">API LATENCY:</span>
                  <span className="text-[var(--ds-gray-1000)] tabular-nums">
                    {data.apiLatency}ms
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Status Bar */}
          <div className="mt-6 flex items-center justify-between text-sm font-mono text-[var(--ds-gray-500)]">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span>Active: {data.activeMarkets}</span>
              </div>
              <span>Last Update: {data.lastUpdate}</span>
            </div>
            <div className="flex items-center gap-4">
              {onStopBot && (
                <button
                  onClick={onStopBot}
                  className="px-4 py-1.5 border border-red-500/40 text-red-400 text-xs font-mono uppercase hover:bg-red-500/10 hover:border-red-500 transition-colors"
                >
                  ■ STOP BOT
                </button>
              )}
              <button
                onClick={onClose}
                className="text-[var(--ds-gray-900)] hover:text-[var(--ds-gray-1000)] transition-colors"
              >
                Back to Map
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
