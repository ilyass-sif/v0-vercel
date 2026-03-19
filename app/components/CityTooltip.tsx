"use client";

import type { CityMarket } from "../types/market";

interface CityTooltipProps {
  city: CityMarket;
  x: number;
  y: number;
  width: number;
  height: number;
}

function getCountdown(city: CityMarket) {
  if (!city.timezone || city.open_hour_local === undefined || city.close_hour_local === undefined) {
    return null;
  }
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: city.timezone,
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    });
    const parts = formatter.formatToParts(now);
    const hour = parseInt(parts.find((p) => p.type === "hour")?.value || "0", 10);
    const minute = parseInt(parts.find((p) => p.type === "minute")?.value || "0", 10);
    const localDecimalHour = hour + minute / 60;

    const isOpen = localDecimalHour >= city.open_hour_local && localDecimalHour <= city.close_hour_local;

    if (isOpen) {
      const remainingHours = city.close_hour_local - localDecimalHour;
      const h = Math.floor(remainingHours);
      const m = Math.round((remainingHours - h) * 60);
      return { text: `Closes in ${h}h ${m}m`, isOpen: true };
    } else {
      let remainingHours = 0;
      if (localDecimalHour < city.open_hour_local) {
        remainingHours = city.open_hour_local - localDecimalHour;
      } else {
        remainingHours = (24 - localDecimalHour) + city.open_hour_local;
      }
      const h = Math.floor(remainingHours);
      const m = Math.round((remainingHours - h) * 60);
      return { text: `Opens in ${h}h ${m}m`, isOpen: false };
    }
  } catch (e) {
    return null;
  }
}

export function CityTooltip({ city, x, y, width, height }: CityTooltipProps) {
  const countdown = getCountdown(city);
  return (
    <div
      className="absolute pointer-events-none z-20 bg-[var(--ds-background-200)] border border-[var(--ds-gray-200)] rounded px-3 py-2 text-xs font-mono shadow-lg min-w-[180px] animate-in fade-in slide-in-from-bottom-1 duration-150"
      style={{
        left: `${(x / width) * 100}%`,
        top: `${(y / height) * 100}%`,
        transform: "translate(-50%, -140%)",
      }}
    >
      <div className="flex flex-col gap-1.5">
        {/* City Header */}
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: city.hasActiveMarket ? city.color : "#555" }}
          />
          <span className="text-[var(--ds-gray-1000)] font-medium">
            {city.city}
          </span>
          <span className="text-[var(--ds-gray-500)]">{city.iso2}</span>
        </div>

        {/* Market Status */}
        {city.hasActiveMarket ? (
          <>
            <div className="flex items-center justify-between border-t border-[var(--ds-gray-200)] pt-1.5 mt-0.5">
              <span className="text-[var(--ds-gray-500)] uppercase text-[10px]">
                Current Temp
              </span>
              <span className="text-[var(--ds-gray-1000)] tabular-nums">
                {city.currentTemp !== null ? `${city.currentTemp}°C` : "--"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--ds-gray-500)] uppercase text-[10px]">
                Station
              </span>
              <span className="text-[var(--ds-gray-900)] text-[10px]">
                {city.marketId}
              </span>
            </div>
            {countdown && (
              <div className="flex items-center justify-between">
                <span className="text-[var(--ds-gray-500)] uppercase text-[10px]">
                  Schedule
                </span>
                <span className={`text-[10px] ${countdown.isOpen ? "text-green-500" : "text-amber-500"}`}>
                  {countdown.text}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-green-500 text-[10px] uppercase">
                Active — Click for details
              </span>
            </div>
          </>
        ) : (
          <div className="border-t border-[var(--ds-gray-200)] pt-1.5 mt-0.5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[var(--ds-gray-500)] uppercase text-[10px]">
                Station
              </span>
              <span className="text-[var(--ds-gray-900)] text-[10px]">
                {city.marketId}
              </span>
            </div>
            {countdown && (
              <div className="flex items-center justify-between mb-1">
                <span className="text-[var(--ds-gray-500)] uppercase text-[10px]">
                  Schedule
                </span>
                <span className={`text-[10px] ${countdown.isOpen ? "text-green-500" : "text-amber-500"}`}>
                  {countdown.text}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
              <span className="text-red-400 text-[10px] uppercase">
                Bot Offline — Click to Start
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
