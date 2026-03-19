"use client";

import dynamic from "next/dynamic";
import type { CityMarket } from "../types/market";

const DottedMap = dynamic(() => import("./DottedMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[560px] bg-[var(--ds-background-100)] animate-pulse rounded-md" />
  ),
});

interface MapContainerProps {
  selectedCity?: CityMarket | null;
  onCityClick?: (city: CityMarket) => void;
  onCityHover?: (city: CityMarket | null) => void;
  markets?: CityMarket[];
}

export default function MapContainer({
  selectedCity,
  onCityClick,
  onCityHover,
  markets,
}: MapContainerProps) {
  return (
    <DottedMap
      selectedCity={selectedCity}
      onCityClick={onCityClick}
      onCityHover={onCityHover}
      markets={markets}
    />
  );
}
