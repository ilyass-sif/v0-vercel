export interface PredictionBracket {
  range: string;
  title?: string;
  price: number;
  modelProbability: number;
  color: string;
}

export interface MarketData {
  id: string;
  cityId: string;
  cityName: string;
  region: string;
  coordinates: [number, number];
  expiresAt: string;
  currentTemperature: number | null;
  recordHigh: { value: number; date: string } | null;
  predictionBrackets: PredictionBracket[];
  totalVolume: number;
  liquidity: number;
  marketProbability: { temperature: number; label: string };
  modelConfidence: number;
  predictedPeak: number;
  volatility: "LOW" | "MEDIUM" | "HIGH";
  outcomeShares: {
    yes: number;
    no: number;
    myPosition: { amount: number; side: "YES" | "NO" } | null;
  };
  dataRefresh: number;
  apiLatency: number;
  activeMarkets: number;
  lastUpdate: string;
}

export interface CityMarket {
  id: string;
  city: string;
  country: string;
  iso2: string;
  coordinates: [number, number];
  color: string;
  hasActiveMarket: boolean;
  currentTemp: number | null;
  marketId: string | null;
  volume?: number;
  timezone?: string;
  open_hour_local?: number;
  close_hour_local?: number;
}

// Default markets — real integrated stations (all start inactive/greyed)
export const PLACEHOLDER_MARKETS: CityMarket[] = [
  {
    id: "nzwn",
    city: "Wellington",
    country: "New Zealand",
    iso2: "NZ",
    coordinates: [174.7787, -41.2924],
    color: "#22c55e",
    hasActiveMarket: false,
    currentTemp: null,
    marketId: "NZWN",
  },
  {
    id: "nyc_klga",
    city: "New York",
    country: "United States",
    iso2: "US",
    coordinates: [-73.8726, 40.7772],
    color: "#3b82f6",
    hasActiveMarket: false,
    currentTemp: null,
    marketId: "NYC_KLGA",
  },
  {
    id: "sea_ksea",
    city: "Seattle",
    country: "United States",
    iso2: "US",
    coordinates: [-122.3088, 47.4502],
    color: "#3b82f6",
    hasActiveMarket: false,
    currentTemp: null,
    marketId: "SEA_KSEA",
  },
  {
    id: "tokyo_rjtt",
    city: "Tokyo",
    country: "Japan",
    iso2: "JP",
    coordinates: [139.7798, 35.5494],
    color: "#dc143c",
    hasActiveMarket: false,
    currentTemp: null,
    marketId: "TOKYO_RJTT",
  },
  {
    id: "llbg",
    city: "Tel Aviv",
    country: "Israel",
    iso2: "IL",
    coordinates: [34.8854, 32.0114],
    color: "#f59e0b",
    hasActiveMarket: false,
    currentTemp: null,
    marketId: "LLBG",
  },
  {
    id: "ankara_ltac",
    city: "Ankara",
    country: "Turkey",
    iso2: "TR",
    coordinates: [32.994, 40.128],
    color: "#b91c1c",
    hasActiveMarket: false,
    currentTemp: null,
    marketId: "ANKARA_LTAC",
  },
  {
    id: "lfpg",
    city: "Paris",
    country: "France",
    iso2: "FR",
    coordinates: [2.5479, 49.0097],
    color: "#1d4ed8",
    hasActiveMarket: false,
    currentTemp: null,
    marketId: "LFPG",
  },
  {
    id: "rksi",
    city: "Seoul",
    country: "South Korea",
    iso2: "KR",
    coordinates: [126.44, 37.46],
    color: "#3b82f6",
    hasActiveMarket: false,
    currentTemp: null,
    marketId: "SEOUL_RKSI",
  },
];

export const PLACEHOLDER_MARKET_DETAIL: MarketData = {
  id: "WXM-2024-08-15-EC",
  cityId: "nyc",
  cityName: "US East Coast",
  region: "TEMP",
  coordinates: [-73.9249, 40.6943],
  expiresAt: "12.01.25 23:59 UTC",
  currentTemperature: 98.6,
  recordHigh: { value: 104.2, date: "08.14.24" },
  predictionBrackets: [
    { range: "90-95°F", price: 0.12, modelProbability: 15, color: "#3b82f6" },
    { range: "95-100°F", price: 0.45, modelProbability: 55, color: "#f59e0b" },
    { range: "95-100°F", price: 0.28, modelProbability: 25, color: "#f59e0b" },
    { range: "100-105°F", price: 0.28, modelProbability: 25, color: "#ef4444" },
    { range: "105+°F", price: 0.15, modelProbability: 5, color: "#dc2626" },
  ],
  totalVolume: 45312876,
  liquidity: 12500000,
  marketProbability: { temperature: 98.6, label: "Current" },
  modelConfidence: 92.4,
  predictedPeak: 102.1,
  volatility: "HIGH",
  outcomeShares: {
    yes: 28500000,
    no: 16812876,
    myPosition: { amount: 150000, side: "YES" },
  },
  dataRefresh: 78946695594,
  apiLatency: 45,
  activeMarkets: 2,
  lastUpdate: "5m ago",
};
