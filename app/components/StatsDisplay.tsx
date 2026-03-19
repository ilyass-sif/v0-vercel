"use client";

import { useState, useEffect, useMemo, useRef } from "react";
// framer-motion removed to avoid animation warnings
import type { CityMarket } from "../types/market";

function useAnimatedNumber(baseValue: number, incrementRatePerSecond: number) {
  const [value, setValue] = useState(baseValue);
  const [displayRate, setDisplayRate] = useState(incrementRatePerSecond);

  useEffect(() => {
    const updatesPerSecond = 20;
    const baseIncrement = incrementRatePerSecond / updatesPerSecond;

    const interval = setInterval(() => {
      const variation = 0.7 + Math.random() * 0.6;
      const increment = Math.max(1, Math.floor(baseIncrement * variation));
      setValue((v) => v + increment);

      const rateVariation = 0.85 + Math.random() * 0.3;
      setDisplayRate(Math.floor(incrementRatePerSecond * rateVariation));
    }, 1000 / updatesPerSecond);

    return () => clearInterval(interval);
  }, [incrementRatePerSecond]);

  return { value, rate: displayRate };
}

function useTickingVolume(baseVolume: number) {
  const [value, setValue] = useState(baseVolume);

  useEffect(() => {
    setValue(baseVolume);
  }, [baseVolume]);

  useEffect(() => {
    if (!baseVolume) return;
    const timer = setInterval(() => {
      setValue((current) => {
        const drift = current - baseVolume;
        // Limit drift to +/- 20
        if (Math.abs(drift) > 20) {
          return baseVolume + (Math.random() * 10 - 5);
        }
        const step = (Math.random() * 4) - 2; // -2 to +2 step
        return current + step;
      });
    }, 500); // 500ms twitch for lively layout
    return () => clearInterval(timer);
  }, [baseVolume]);

  return value;
}

function InfoIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M8 7V11"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="8" cy="5" r="0.75" fill="currentColor" />
    </svg>
  );
}

function PixelGridTransition({
  firstContent,
  secondContent,
  isActive,
  gridSize = 30,
  animationStepDuration = 0.3,
  className,
}: {
  firstContent: React.ReactNode;
  secondContent: React.ReactNode;
  isActive: boolean;
  gridSize?: number;
  animationStepDuration?: number;
  className?: string;
}) {
  const [showPixels, setShowPixels] = useState(false);
  const [animState, setAnimState] = useState<"idle" | "growing" | "shrinking">(
    "idle"
  );
  const hasActivatedRef = useRef(false);

  const pixels = useMemo(() => {
    const total = gridSize * gridSize;
    const result = [];
    for (let n = 0; n < total; n++) {
      const row = Math.floor(n / gridSize);
      const col = n % gridSize;
      const color =
        Math.random() > 0.85
          ? "var(--ds-blue-800, #0070f3)"
          : "var(--ds-gray-200, #333)";
      result.push({ id: n, row, col, color });
    }
    return result;
  }, [gridSize]);

  const [shuffledOrder, setShuffledOrder] = useState<number[]>([]);

  useEffect(() => {
    if (!hasActivatedRef.current && !isActive) return;
    if (isActive) hasActivatedRef.current = true;

    const indices = pixels.map((_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    setShuffledOrder(indices);

    setShowPixels(true);
    setAnimState("growing");

    const shrinkTimer = setTimeout(
      () => setAnimState("shrinking"),
      animationStepDuration * 1000
    );
    const hideTimer = setTimeout(() => {
      setShowPixels(false);
      setAnimState("idle");
    }, animationStepDuration * 2000);

    return () => {
      clearTimeout(shrinkTimer);
      clearTimeout(hideTimer);
    };
  }, [isActive, animationStepDuration, pixels]);

  const delayPerPixel = useMemo(
    () => animationStepDuration / pixels.length,
    [animationStepDuration, pixels.length]
  );
  const orderMap = useMemo(() => {
    const map = new Map<number, number>();
    shuffledOrder.forEach((idx, order) => map.set(idx, order));
    return map;
  }, [shuffledOrder]);

  return (
    <div className={`w-full overflow-hidden max-w-full relative ${className || ""}`}>
      <div
        className="h-full"
        aria-hidden={isActive}
        style={{ opacity: isActive ? 0 : 1, transition: `opacity 0s ${animationStepDuration}s` }}
      >
        {firstContent}
      </div>

      <div
        className="absolute inset-0 w-full h-full z-[2] overflow-hidden"
        style={{ 
          opacity: isActive ? 1 : 0, 
          transition: `opacity 0s ${animationStepDuration}s`,
          pointerEvents: isActive ? "auto" : "none" 
        }}
        aria-hidden={!isActive}
      >
        {secondContent}
      </div>

      <div
        className="absolute inset-0 w-full h-full pointer-events-none z-[3]"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
        }}
      >
        {showPixels &&
          pixels.map((pixel) => {
            const order = orderMap.get(pixel.id) ?? 0;
            const isGrowing = animState === "growing";
            return (
              <div
                key={pixel.id}
                style={{
                  backgroundColor: pixel.color,
                  aspectRatio: "1 / 1",
                  gridArea: `${pixel.row + 1} / ${pixel.col + 1}`,
                  opacity: isGrowing ? 1 : 0,
                  transform: `scale(${isGrowing ? 1 : 0})`,
                  transition: `opacity 0.01s ${order * delayPerPixel}s, transform 0.01s ${order * delayPerPixel}s`,
                }}
              />
            );
          })}
      </div>
    </div>
  );
}

function StatCard({
  title,
  baseValue,
  incrementRate,
  children,
  infoContent,
  href,
  className,
}: {
  title: string;
  baseValue?: number;
  incrementRate?: number;
  children?: React.ReactNode;
  infoContent?: string;
  href?: string;
  className?: string;
}) {
  const [showInfo, setShowInfo] = useState(false);
  const { value } = useAnimatedNumber(baseValue || 0, incrementRate || 0);

  const statsContent = (
    <div className="bg-gray-alpha-100 p-4 md:p-6 w-full min-h-[120px] h-full">
      <div className="space-y-2">
        <h2 className="my-0 font-mono font-medium text-sm tracking-tight uppercase text-gray-1000 pr-6">
          {title}
        </h2>
        {baseValue !== undefined && (
          <div className="text-3xl md:text-4xl tracking-normal font-mono tabular-nums">
            {formatNumber(value)}
          </div>
        )}
        {children}
      </div>
    </div>
  );

  const infoContentView = (
    <div className="bg-gray-alpha-100 p-4 md:p-6 w-full h-full overflow-y-auto flex flex-col gap-y-2">
      {href ? (
        <a
          href={href}
          tabIndex={showInfo ? 0 : -1}
          className="my-0 font-mono font-medium text-sm tracking-tight uppercase text-gray-1000 hover:underline underline-offset-2 inline-flex gap-x-0.5 items-center w-fit shrink-0"
        >
          {title}
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M6.75011 4H6.00011V5.5H6.75011H9.43945L5.46978 9.46967L4.93945 10L6.00011 11.0607L6.53044 10.5303L10.499 6.56182V9.25V10H11.999V9.25V5C11.999 4.44772 11.5512 4 10.999 4H6.75011Z"
            />
          </svg>
        </a>
      ) : (
        <span className="my-0 font-mono font-medium text-sm tracking-tight uppercase text-gray-1000 shrink-0">
          {title}
        </span>
      )}
      <span className="tracking-tight text-sm text-gray-900 leading-relaxed line-clamp-6">
        {infoContent}
      </span>
    </div>
  );

  return (
    <div
      className={`relative group rounded-md overflow-hidden ${className || ""}`}
    >
      <PixelGridTransition
        firstContent={statsContent}
        secondContent={infoContentView}
        isActive={showInfo}
        gridSize={30}
        animationStepDuration={0.3}
        className="h-full"
      />
      {infoContent && (
        <div
          className={`absolute top-2 right-2 transition-opacity duration-150 z-[20] isolate ${
            showInfo
              ? "opacity-100"
              : "opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100"
          }`}
        >
          <button
            aria-label={`Learn more about ${title}`}
            type="button"
            onClick={() => setShowInfo(!showInfo)}
            className="p-1 m-0 bg-transparent text-gray-alpha-600 md:text-gray-900 border-none md:border md:border-solid border-gray-alpha-400 hover:text-gray-1000 hover:bg-gray-alpha-200 transition-colors duration-150 flex items-center justify-center outline-none focus-visible:ring cursor-pointer"
          >
            <InfoIcon />
          </button>
        </div>
      )}
    </div>
  );
}

function MetricRow({
  label,
  baseValue,
  incrementRate,
  showRate = false,
}: {
  label: string;
  baseValue: number;
  incrementRate: number;
  showRate?: boolean;
}) {
  const { value, rate } = useAnimatedNumber(baseValue, incrementRate);

  return (
    <li className="flex flex-wrap items-center justify-between gap-x-3">
      <h3 className="m-0 font-mono font-normal text-sm text-gray-900 uppercase">
        {label}
      </h3>
      <div className="flex items-center gap-3 md:gap-4 text-right">
        <div className="text-gray-1000 text-sm font-mono tabular-nums">
          {formatNumber(value)}
        </div>
        {showRate && (
          <div className="w-16 text-gray-900 text-right text-sm font-mono tabular-nums">
            <span>{formatNumber(rate)}</span>
            <span aria-label="per second">/s</span>
          </div>
        )}
      </div>
    </li>
  );
}

const formatNumber = (num: number): string => {
  return num.toLocaleString("en-US");
};

// Platform stats for weather prediction markets
const platformStats = {
  totalVolume: 245832282051,
  activeMarkets: 10,
  totalPredictions: 6120247,
  modelAccuracy: 94.2,
  avgLatency: 45,
  dataPoints: 78945678901,
};

export function GlobalStats({ 
  activeCount, 
  markets = [] 
}: { 
  activeCount?: number; 
  markets?: CityMarket[]; 
}) {
  const totalVolume = markets.reduce((sum, m) => sum + (m.volume || 0), 0);
  const displayVol = useTickingVolume(totalVolume);

  return (
    <div className="space-y-2">
      <h2 className="my-0 font-mono font-medium text-sm tracking-tight uppercase text-gray-900">
        Total Volume (USDC)
      </h2>
      <div className="text-4xl md:text-5xl tracking-normal font-mono tabular-nums">
        {formatNumber(Math.round(displayVol))}
      </div>
      <div className="text-sm text-gray-900 font-mono tabular-nums flex gap-4">
        {activeCount !== undefined && (
          <span className="text-green-400">{activeCount} LIVE</span>
        )}
      </div>
    </div>
  );
}

function MarketRow({
  market,
}: {
  market: CityMarket;
  incrementRate?: number;
}) {
  const displayVol = useTickingVolume(market.volume || 0);

  const isUS = market.iso2 === "US";
  const displayTemp = market.currentTemp !== null
    ? isUS
      ? `${Math.round((market.currentTemp * 9) / 5 + 32)}°F`
      : `${market.currentTemp.toFixed(1)}°C`
    : "--";

  return (
    <li className="flex items-center w-full md:w-fit justify-between md:justify-start">
      <span
        aria-hidden="true"
        className="inline-block translate-y-[-2px] translate-x-[2px]"
      >
        <span style={{ color: market.color ? market.color : "#3b82f6", opacity: 1 }}>■</span>
      </span>
      <div className="text-left">
        <h3
          className="inline-block my-0 font-medium text-[16px]"
          style={{ color: market.color ? market.color : "#3b82f6" }}
        >
          &nbsp;{market.city}
        </h3>
      </div>
      <div className="w-[14ch] text-right">
        <span className="inline-flex tabular-nums text-sm">
          {displayTemp}
        </span>
      </div>
      <div className="w-[12ch] ml-auto text-right text-gray-900">
        <span className="tabular-nums text-sm">{formatNumber(Math.round(displayVol))}</span>
        <span className="lowercase text-xs text-gray-500 ml-1">
          USDC
        </span>
      </div>
    </li>
  );
}

export function ActiveMarkets({ markets }: { markets: CityMarket[] }) {
  const incrementRates = [
    16000, 12000, 9000, 8000, 7000, 6000, 5000, 4000, 3000, 2000,
  ];
  const activeMarkets = markets.filter((m) => m.hasActiveMarket).slice(0, 7);

  return (
    <div className="space-y-2">
      <h2 className="my-0 font-mono font-medium text-sm tracking-tight uppercase text-gray-900">
        Active Markets by Volume
      </h2>
      <ul className="list-none pl-0 space-y-1">
        {activeMarkets.map((market, index) => (
          <MarketRow
            key={market.id}
            market={market}
            incrementRate={incrementRates[index] || 1000}
          />
        ))}
      </ul>
    </div>
  );
}

export function PlatformMetrics({ activeCount }: { activeCount?: number }) {
  const displayCount = activeCount ?? platformStats.activeMarkets;
  return (
    <div className="flex items-center w-full md:w-fit justify-between md:justify-start mt-2">
      <span
        aria-hidden="true"
        className="inline-block translate-y-[-2px] translate-x-[2px]"
      >
        <span className="text-[10px]">▲</span>
      </span>
      <div className="text-left">
        <span className="inline-block my-0 font-medium text-[16px]">
          &nbsp;{displayCount}
        </span>
        <span className="font-medium text-[16px] text-gray-900 tracking-tight">
          &nbsp;Active Markets
        </span>
      </div>
    </div>
  );
}

export function StatsGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1.5">
      <div className="flex flex-col gap-1.5">
        <StatCard
          title="Total Predictions"
          baseValue={platformStats.totalPredictions}
          incrementRate={24}
          infoContent="The number of prediction positions created across all weather markets."
          className="flex-1"
        />
        <StatCard
          title="Model Performance"
          infoContent="Our AI models analyze historical weather data, satellite imagery, and market signals to generate predictions."
          className="flex-1"
        >
          <ul className="space-y-1 list-none pl-0 mt-2">
            <MetricRow
              label="Accuracy Rate"
              baseValue={platformStats.modelAccuracy * 1000}
              incrementRate={1}
            />
          </ul>
        </StatCard>
      </div>

      <div className="flex flex-col gap-1.5">
        <StatCard
          title="Data Processing"
          baseValue={platformStats.dataPoints}
          incrementRate={29000}
          infoContent="Weather data points processed from global monitoring stations, satellites, and prediction models."
          className="flex-1"
        >
          <ul className="space-y-1 list-none pl-0 mt-4">
            <MetricRow
              label="Stations Active"
              baseValue={15420}
              incrementRate={2}
              showRate
            />
            <MetricRow
              label="Satellite Feeds"
              baseValue={847}
              incrementRate={0}
              showRate
            />
            <MetricRow
              label="Model Updates"
              baseValue={12847392}
              incrementRate={127}
              showRate
            />
          </ul>
        </StatCard>
      </div>

      <div className="flex flex-col gap-1.5">
        <StatCard
          title="Market Health"
          infoContent="Real-time market health metrics including liquidity depth and trading activity."
          className="flex-1"
        >
          <ul className="space-y-1 list-none pl-0 mt-2">
            <MetricRow
              label="Liquidity Pool"
              baseValue={125000000}
              incrementRate={1600}
            />
            <MetricRow
              label="Active Traders"
              baseValue={48293}
              incrementRate={12}
            />
          </ul>
        </StatCard>
        <StatCard
          title="API Performance"
          baseValue={platformStats.avgLatency}
          incrementRate={0}
          infoContent="Average API latency for market data and prediction updates."
          className="flex-1"
        >
          <p className="text-gray-900 text-sm font-mono mt-1">
            Avg Latency (ms)
          </p>
        </StatCard>
      </div>
    </div>
  );
}

// Legacy exports for backwards compatibility
export const TotalRequests = GlobalStats;
export const TopCountries = ActiveMarkets;
export const RegionCount = PlatformMetrics;
