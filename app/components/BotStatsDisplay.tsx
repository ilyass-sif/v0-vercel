"use client";

import { BotStats } from "@/app/types/bot";

interface BotStatsDisplayProps {
  stats: BotStats;
}

export function BotStatsDisplay({ stats }: BotStatsDisplayProps) {
  const formatLargeNumber = (num: number) => {
    return num.toLocaleString("en-US");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Total Predictions */}
      <div className="border border-[var(--ds-gray-alpha-400)] bg-[var(--ds-background-100)] p-6">
        <div className="font-mono text-xs text-[var(--ds-gray-900)] tracking-wider mb-2">
          TOTAL PREDICTIONS
        </div>
        <div className="font-mono text-3xl md:text-4xl text-[var(--ds-gray-1000)] tracking-tight">
          {formatLargeNumber(stats.totalPredictions)}
        </div>
      </div>

      {/* Data Processing */}
      <div className="border border-[var(--ds-gray-alpha-400)] bg-[var(--ds-background-100)] p-6">
        <div className="font-mono text-xs text-[var(--ds-gray-900)] tracking-wider mb-2">
          DATA PROCESSING
        </div>
        <div className="font-mono text-3xl md:text-4xl text-[var(--ds-gray-1000)] tracking-tight mb-3">
          {formatLargeNumber(stats.dataProcessing)}
        </div>
        <div className="flex items-center justify-between font-mono text-sm">
          <span className="text-[var(--ds-gray-900)]">NODES ACTIVE</span>
          <div className="flex items-center gap-4">
            <span className="text-[var(--ds-gray-1000)]">{formatLargeNumber(stats.nodesActive)}</span>
            <span className="text-[var(--ds-gray-700)]">{stats.processRate}/s</span>
          </div>
        </div>
      </div>

      {/* Bot Health */}
      <div className="border border-[var(--ds-gray-alpha-400)] bg-[var(--ds-background-100)] p-6">
        <div className="font-mono text-xs text-[var(--ds-gray-900)] tracking-wider mb-4">
          BOT HEALTH
        </div>
        <div className="space-y-2 font-mono text-sm">
          <div className="flex items-center justify-between">
            <span className="text-[var(--ds-gray-900)]">CONFIGURED PAIRS:</span>
            <span className="text-[var(--ds-gray-1000)]">{stats.configuredPairs}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[var(--ds-gray-900)]">MAX DRAWDOWN:</span>
            <span className="text-[var(--ds-gray-1000)]">{stats.maxDrawdown}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[var(--ds-gray-900)]">EXECUTIONS / MIN:</span>
            <span className="text-[var(--ds-gray-1000)]">{formatLargeNumber(stats.executionsPerMin)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
