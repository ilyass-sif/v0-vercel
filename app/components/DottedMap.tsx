"use client";

import { useMemo, memo, useState } from "react";
import { ComposableMap, Geographies } from "react-simple-maps";
import { motion } from "framer-motion";
import { geoMercator } from "d3-geo";
import dottedMapData from "../data/dotted-map-data.json";
import { topCountries, countryRequests } from "../data/country-data";
import { CityMarker } from "./CityMarker";
import { CityTooltip } from "./CityTooltip";
import type { CityMarket } from "../types/market";
import { PLACEHOLDER_MARKETS } from "../types/market";

const countryColors: Record<string, string> = {
  US: "#1e40af",
  DE: "#FFCE00",
  GB: "#2563eb",
  IN: "#f59e0b",
  BR: "#FF0000",
  SG: "#f59e0b",
  JP: "#dc143c",
  FR: "#1d4ed8",
  CA: "#b91c1c",
  SE: "#2563eb",
  AU: "#3b82f6",
  KR: "#3b82f6",
  NL: "#ea580c",
  CN: "#991b1b",
  RU: "#FF0000",
  MX: "#15803d",
  ES: "#b91c1c",
  IT: "#15803d",
  PL: "#dc2626",
  TR: "#b91c1c",
  ID: "#1e40af",
  TH: "#15803d",
  VN: "#991b1b",
  PH: "#15803d",
  EG: "#1e40af",
  NG: "#2563eb",
  PK: "#FFCE00",
  BD: "#991b1b",
  AR: "#f59e0b",
  CO: "#FF0000",
  ZA: "#15803d",
  SA: "#FFCE00",
  MY: "#991b1b",
  CL: "#991b1b",
  PE: "#1e40af",
  AE: "#f59e0b",
};

const getCountryColor = (iso2: string): string => {
  return countryColors[iso2] || "#666666";
};

const top10Countries = new Set(topCountries.slice(0, 10).map((c) => c.code));

const getDotsToShow = (iso2: string): number => {
  const data = countryRequests[iso2];
  if (!data) return 2;

  const rate = (data.value / 260000) * 1000;

  if (rate < 400) return 2;
  if (rate < 1000) return 4;
  if (rate < 5000) return 8;
  if (rate < 10000) return 15;
  if (rate < 50000) return 25;
  return 35;
};

const StaticPixel = memo(({ x, y }: { x: number; y: number }) => (
  <rect
    x={x}
    y={y}
    width={3}
    height={3}
    className="fill-[var(--ds-gray-400)]"
    fillOpacity={0.5}
  />
));
StaticPixel.displayName = "StaticPixel";

const AnimatedPixel = memo(
  ({
    x,
    y,
    color,
    canPulse,
    cityDistanceRank,
  }: {
    x: number;
    y: number;
    color: string;
    canPulse: boolean;
    cityDistanceRank: number;
  }) => {
    const delay = useMemo(() => cityDistanceRank * 0.1, [cityDistanceRank]);

    const animate = canPulse
      ? {
          scale: [1, 1.8, 1],
          opacity: [0.8, 1, 0.8],
        }
      : { scale: 1, opacity: 1 };

    const transition = canPulse
      ? {
          opacity: {
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut" as const,
            delay,
            repeatDelay: delay,
          },
          scale: {
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut" as const,
            delay,
            repeatDelay: delay,
          },
        }
      : { type: "spring" as const, stiffness: 260, damping: 20 };

    return (
      <motion.rect
        x={x}
        y={y}
        width={3}
        height={3}
        fill={color}
        initial={{ scale: 1, opacity: canPulse ? 0.8 : 1 }}
        animate={animate}
        transition={transition}
        style={{
          willChange:
            canPulse && cityDistanceRank < 10 ? "transform, opacity" : undefined,
        }}
      />
    );
  }
);
AnimatedPixel.displayName = "AnimatedPixel";

interface DottedMapProps {
  width?: number;
  height?: number;
  markets?: CityMarket[];
  selectedCity?: CityMarket | null;
  onCityHover?: (city: CityMarket | null) => void;
  onCityClick?: (city: CityMarket) => void;
}

export default function DottedMap({
  width = 1000,
  height = 560,
  markets = PLACEHOLDER_MARKETS,
  selectedCity = null,
  onCityHover,
  onCityClick,
}: DottedMapProps) {
  const [hoveredCity, setHoveredCity] = useState<CityMarket | null>(null);

  const handleCityHover = (city: CityMarket | null) => {
    setHoveredCity(city);
    onCityHover?.(city);
  };

  const handleCityClick = (city: CityMarket) => {
    onCityClick?.(city);
  };

  const projection = useMemo(
    () =>
      geoMercator()
        .scale(140)
        .center([15, 25])
        .rotate([0, 0, 0])
        .translate([width / 2, height / 2]),
    [width, height]
  );

  const { staticPixels, animatedPixels } = useMemo(() => {
    const staticArr: Array<{ key: string; x: number; y: number }> = [];
    const animatedArr: Array<{
      key: string;
      x: number;
      y: number;
      color: string;
      canPulse: boolean;
      cityDistanceRank: number;
    }> = [];

    Object.entries(
      dottedMapData as Record<
        string,
        Array<{ lon: number; lat: number; cityDistanceRank: number }>
      >
    ).forEach(([countryCode, cities]) => {
      const dotsToShow = getDotsToShow(countryCode);
      const color = getCountryColor(countryCode);
      const isTop10 = top10Countries.has(countryCode);

      cities.forEach((city) => {
        const coords = projection([city.lon, city.lat]);
        if (!coords) return;

        const [x, y] = coords;
        if (x < 0 || x > width || y < 0 || y > height) return;

        const key = `${countryCode}-${city.cityDistanceRank}`;
        const isAnimated = city.cityDistanceRank < dotsToShow;

        if (isAnimated) {
          animatedArr.push({
            key,
            x,
            y,
            color,
            canPulse: isTop10 && city.cityDistanceRank < 5,
            cityDistanceRank: city.cityDistanceRank,
          });
        } else {
          staticArr.push({ key, x, y });
        }
      });
    });

    return { staticPixels: staticArr, animatedPixels: animatedArr };
  }, [projection, width, height]);

  const markerDelays = useMemo(
    () => markets.map((_, i) => (i * 0.05) % 1),
    [markets]
  );

  return (
    <div className="relative w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto bg-[var(--ds-background-100)]"
      >
        <g>
          {staticPixels.map((p) => (
            <StaticPixel key={p.key} x={p.x} y={p.y} />
          ))}
        </g>

        <g>
          {animatedPixels.map((p) => (
            <AnimatedPixel
              key={p.key}
              x={p.x}
              y={p.y}
              color={p.color}
              canPulse={p.canPulse}
              cityDistanceRank={p.cityDistanceRank}
            />
          ))}
        </g>
      </svg>

      <div className="absolute inset-0 pointer-events-none">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: 140,
            center: [15, 25],
            rotate: [0, 0, 0],
          }}
          width={width}
          height={height}
          style={{ width: "100%", height: "auto" }}
        >
          <Geographies geography="https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json">
            {() => null}
          </Geographies>
          {markets.map((city, index) => (
            <CityMarker
              key={city.id}
              city={city}
              delay={markerDelays[index]}
              isSelected={selectedCity?.id === city.id}
              onHover={handleCityHover}
              onClick={handleCityClick}
            />
          ))}
        </ComposableMap>
      </div>

      {/* City Tooltip */}
      {hoveredCity &&
        (() => {
          const coords = projection(hoveredCity.coordinates);
          if (!coords) return null;
          return (
            <CityTooltip
              key={hoveredCity.id}
              city={hoveredCity}
              x={coords[0]}
              y={coords[1]}
              width={width}
              height={height}
            />
          );
        })()}
    </div>
  );
}
