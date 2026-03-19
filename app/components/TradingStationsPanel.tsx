"use client";

import { useState, useMemo } from "react";

export interface TradingStation {
  id: string;
  name: string;
  timezone: string;
  isActive: boolean;
  progressPercent: number;
  hoursRemaining: number;
  lastUpdate?: string;
  color?: string;
}

interface TradingStationsPanelProps {
  stations: TradingStation[];
  loading?: boolean;
}

function ProgressBar({ 
  percent, 
  isActive, 
  color 
}: { 
  percent: number; 
  isActive: boolean;
  color?: string;
}) {
  const displayPercent = Math.min(100, Math.max(0, percent));
  const baseColor = color || "#06b6d4";
  
  return (
    <div className="flex-1 flex flex-col gap-1.5">
      <div className="relative w-full h-2 bg-gray-700 rounded-full overflow-hidden border border-gray-600">
        <div
          className="absolute top-0 left-0 h-full rounded-full transition-all duration-500"
          style={{
            width: `${displayPercent}%`,
            backgroundColor: isActive ? baseColor : "#6b7280",
            boxShadow: isActive ? `0 0 8px ${baseColor}80` : "none",
          }}
        />
      </div>
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="text-gray-400">{displayPercent.toFixed(0)}%</span>
        <span className={isActive ? "text-gray-300" : "text-gray-500"}>
          {displayPercent === 100 ? "Complete" : `${percent > 100 ? "00" : (100 - displayPercent).toFixed(0)}% left`}
        </span>
      </div>
    </div>
  );
}

function StationCard({
  station,
  index,
}: {
  station: TradingStation;
  index: number;
}) {
  const statusColor = station.isActive ? "#06b6d4" : "#6b7280";
  const statusGlow = station.isActive ? "0 0 12px rgba(6, 182, 212, 0.3)" : "none";

  return (
    <div
      key={station.id}
      className="group border border-gray-700 rounded-lg p-4 md:p-5 bg-gradient-to-br from-gray-800 to-gray-900 hover:border-gray-600 transition-all duration-300"
      style={{
        boxShadow: station.isActive ? `inset 0 0 1px rgba(6, 182, 212, 0.2)` : "none",
      }}
    >
      {/* Header Row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-2 h-2 rounded-full transition-all duration-300"
              style={{
                backgroundColor: statusColor,
                boxShadow: statusGlow,
              }}
            />
            <h3 className="font-mono text-sm md:text-base font-semibold text-white tracking-wide">
              {station.name}
            </h3>
          </div>
          <p className="font-mono text-xs text-gray-500 ml-4">
            {station.timezone}
          </p>
        </div>
        <div className="text-right">
          <span
            className={`font-mono text-xs font-bold uppercase tracking-wider px-2 py-1 rounded ${
              station.isActive
                ? "bg-cyan-500 bg-opacity-20 text-cyan-400 border border-cyan-500 border-opacity-30"
                : "bg-gray-700 bg-opacity-50 text-gray-400 border border-gray-600"
            }`}
          >
            {station.isActive ? "Trading" : "Closed"}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-mono text-xs text-gray-400 uppercase tracking-wider">
            Trading Window Progress
          </span>
        </div>
        <ProgressBar
          percent={station.progressPercent}
          isActive={station.isActive}
          color={station.color}
        />
      </div>

      {/* Info Row */}
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="text-gray-500">
          Hours Remaining: <span className={station.isActive ? "text-cyan-400" : "text-gray-400"}>{station.hoursRemaining}h</span>
        </span>
        {station.lastUpdate && (
          <span className="text-gray-600">Updated: {station.lastUpdate}</span>
        )}
      </div>
    </div>
  );
}

export function TradingStationsPanel({
  stations,
  loading = false,
}: TradingStationsPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const activeCount = useMemo(
    () => stations.filter((s) => s.isActive).length,
    [stations]
  );

  const avgProgress = useMemo(
    () =>
      stations.length > 0
        ? stations.reduce((sum, s) => sum + s.progressPercent, 0) / stations.length
        : 0,
    [stations]
  );

  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 bg-gray-800 rounded-lg border border-gray-700"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Panel */}
      <div className="border border-gray-700 rounded-lg p-4 md:p-6 bg-gradient-to-r from-gray-800 to-gray-900">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <h2 className="font-mono text-xs md:text-sm text-gray-400 uppercase tracking-wider mb-2">
              Active Stations
            </h2>
            <p className="font-mono text-2xl md:text-3xl font-bold text-cyan-400">
              {activeCount}/{stations.length}
            </p>
          </div>
          <div>
            <h2 className="font-mono text-xs md:text-sm text-gray-400 uppercase tracking-wider mb-2">
              Avg Progress
            </h2>
            <p className="font-mono text-2xl md:text-3xl font-bold text-white">
              {avgProgress.toFixed(0)}%
            </p>
          </div>
          <div>
            <h2 className="font-mono text-xs md:text-sm text-gray-400 uppercase tracking-wider mb-2">
              Total Stations
            </h2>
            <p className="font-mono text-2xl md:text-3xl font-bold text-gray-300">
              {stations.length}
            </p>
          </div>
        </div>
      </div>

      {/* Stations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {stations.map((station, index) => (
          <StationCard key={station.id} station={station} index={index} />
        ))}
      </div>

      {stations.length === 0 && (
        <div className="text-center py-12 border border-dashed border-gray-700 rounded-lg">
          <p className="font-mono text-gray-500">No trading stations configured</p>
        </div>
      )}
    </div>
  );
}
