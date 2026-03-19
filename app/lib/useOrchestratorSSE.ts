"use client";

import { useEffect, useState, useRef } from "react";
import type { CityMarket } from "../types/market";
import { PLACEHOLDER_MARKETS } from "../types/market";

const ORCHESTRATOR_URL =
  process.env.NEXT_PUBLIC_ORCHESTRATOR_URL || "http://localhost:9000";

// Shape of a single market as broadcast by the orchestrator SSE stream
export interface OrchestratorMarketState {
  market_name: string;
  station_id: string;
  is_active: boolean;
  last_update: string | null;
  timezone: string;
  volume?: number;
  weather: {
    temp_c: number | null;
    temp_f: number | null;
    max_temp_today: number | null;
    raw_metar: string;
    timestamp_utc: string;
  } | null;
  prediction: {
    brackets: { temp: number; probability: number }[];
    architecture: string;
  } | null;
  polymarket: { title: string; yes_ask: number | null; no_ask: number | null }[];
  active_positions: {
    bracket_title: string;
    buy_price: number;
    shares: number;
    timestamp_buy: string;
    model_prob_at_buy?: number;
  }[];
}

export interface OrchestratorState {
  markets: Record<string, OrchestratorMarketState>;
  server_time: string;
  portfolio_balance: number;
  portfolio_history: { timestamp: string; balance: number; pnl: number }[];
  config: {
    min_edge: number;
    budget_per_bracket: number;
    excluded_markets: string[];
    enabled: boolean;
  };
}

// Coordinate + metadata lookup
const MARKET_META: Record<
  string,
  { city: string; country: string; iso2: string; coordinates: [number, number]; color: string }
> = {
  NZWN:        { city: "Wellington", country: "New Zealand",   iso2: "NZ", coordinates: [174.7787, -41.2924], color: "#22c55e" },
  NYC_KLGA:    { city: "New York",   country: "United States", iso2: "US", coordinates: [-73.8726,  40.7772], color: "#3b82f6" },
  SEA_KSEA:    { city: "Seattle",    country: "United States", iso2: "US", coordinates: [-122.3088, 47.4502], color: "#3b82f6" },
  TOKYO_RJTT:  { city: "Tokyo",      country: "Japan",         iso2: "JP", coordinates: [139.7798,  35.5494], color: "#dc143c" },
  LLBG:        { city: "Tel Aviv",   country: "Israel",        iso2: "IL", coordinates: [34.8854,   32.0114], color: "#f59e0b" },
  ANKARA_LTAC: { city: "Ankara",     country: "Turkey",        iso2: "TR", coordinates: [32.994,    40.128],  color: "#b91c1c" },
  LFPG:        { city: "Paris",      country: "France",        iso2: "FR", coordinates: [2.5479,    49.0097], color: "#1d4ed8" },
};

/**
 * Merge live orchestrator state into the default station list.
 * Stations not in the SSE stream stay greyed; stations present get live data overlaid.
 */
function mergeMarketsWithLiveState(state: OrchestratorState): CityMarket[] {
  // Start from default stations
  const merged = PLACEHOLDER_MARKETS.map((station) => {
    const marketId = station.marketId;
    if (!marketId) return station;

    const ms = state.markets[marketId];
    if (!ms) return station; // No live data → stay greyed

    let temp: number | null = null;
    if (ms.weather) {
      if (ms.weather.temp_c !== null && ms.weather.temp_c !== undefined) {
        temp = ms.weather.temp_c;
      } else if (ms.weather.temp_f !== null && ms.weather.temp_f !== undefined) {
        temp = Math.round(((ms.weather.temp_f - 32) * 5) / 9 * 10) / 10;
      }
    }

    return {
      ...station,
      hasActiveMarket: ms.is_active,
      currentTemp: temp,
      volume: ms.volume ?? 0,
    };
  });

  // Add any markets from SSE that aren't in our default list
  for (const [name, ms] of Object.entries(state.markets)) {
    if (merged.some((m) => m.marketId === name)) continue;
    const meta = MARKET_META[name] ?? {
      city: name, country: "", iso2: "XX",
      coordinates: [0, 0] as [number, number], color: "#666666",
    };
    let temp: number | null = null;
    if (ms.weather) {
      if (ms.weather.temp_c !== null) temp = ms.weather.temp_c;
      else if (ms.weather.temp_f !== null)
        temp = Math.round(((ms.weather.temp_f - 32) * 5) / 9 * 10) / 10;
    }
    merged.push({
      id: name.toLowerCase(),
      city: meta.city,
      country: meta.country,
      iso2: meta.iso2,
      coordinates: meta.coordinates,
      color: meta.color,
      hasActiveMarket: ms.is_active,
      currentTemp: temp,
      marketId: name,
      volume: ms.volume ?? 0,
    });
  }

  return merged;
}

interface UseOrchestratorSSEResult {
  markets: CityMarket[];
  rawState: OrchestratorState | null;
  isConnected: boolean;
  portfolioBalance: number;
}

/**
 * useOrchestratorSSE
 * ──────────────────
 * Connects to the orchestrator SSE stream at localhost:9000/events.
 * Always returns all stations (greyed if offline, live if connected).
 * Auto-reconnects on disconnect.
 */
export function useOrchestratorSSE(): UseOrchestratorSSEResult {
  const [markets, setMarkets] = useState<CityMarket[]>(PLACEHOLDER_MARKETS);
  const [rawState, setRawState] = useState<OrchestratorState | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [portfolioBalance, setPortfolioBalance] = useState(20.0);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    let cancelled = false;

    function connect() {
      if (cancelled) return;

      const es = new EventSource(`${ORCHESTRATOR_URL}/events`);
      esRef.current = es;

      es.onopen = () => {
        if (!cancelled) setIsConnected(true);
      };

      es.onmessage = (event) => {
        if (cancelled) return;
        try {
          const data: OrchestratorState = JSON.parse(event.data);
          setRawState(data);
          setMarkets(mergeMarketsWithLiveState(data));
          setPortfolioBalance(data.portfolio_balance ?? 20.0);
        } catch {
          // Ignore malformed frames
        }
      };

      es.onerror = () => {
        es.close();
        esRef.current = null;
        if (!cancelled) {
          setIsConnected(false);
          // Reconnect after 3 seconds
          reconnectTimer.current = setTimeout(connect, 3000);
        }
      };
    }

    connect();

    return () => {
      cancelled = true;
      esRef.current?.close();
      esRef.current = null;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    };
  }, []);

  return { markets, rawState, isConnected, portfolioBalance };
}
