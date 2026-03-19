"use client";

import { useState } from "react";
import Link from "next/link";
import { PositionsTable } from "@/app/components/PositionsTable";
import { ConfigOptions } from "@/app/components/ConfigOptions";
import { LogTerminal } from "@/app/components/LogTerminal";
import { BotStatsDisplay } from "@/app/components/BotStatsDisplay";
import { useOrchestratorSSE } from "@/app/lib/useOrchestratorSSE";
import {
  PLACEHOLDER_BOT_STATS,
  PLACEHOLDER_LOGS,
  type BotConfig,
} from "@/app/types/bot";

const ORCHESTRATOR_URL =
  process.env.NEXT_PUBLIC_ORCHESTRATOR_URL || "http://localhost:9000";

function BotStatusBadge({ status }: { status: boolean }) {
  return (
    <span className={`font-mono text-5xl md:text-6xl font-bold tracking-tight ${status ? "text-cyan-400" : "text-gray-500"}`}>
      {status ? "ACTIVE" : "DISABLED"}
    </span>
  );
}

export default function BotConfigPage() {
  const { rawState, isConnected } = useOrchestratorSSE();

  const [botStats] = useState(PLACEHOLDER_BOT_STATS);
  const [logs] = useState(PLACEHOLDER_LOGS);

  // 1. Flatten Active Positions across all markets
  const activePositions = Object.entries(rawState?.markets || {}).flatMap(([marketName, m]) =>
    (m.active_positions || []).map((p) => {
      // Cross-reference current prices
      const currentPrice = m.polymarket?.find((pm) => pm.title === p.bracket_title)?.yes_ask ?? p.buy_price;
      const curPnL = (currentPrice - p.buy_price) * p.shares;

      // Smart Model Probability calculation like v2
      let currentModelProb = 0;
      if (m.prediction?.brackets) {
        const brackets = m.prediction.brackets;
        const match = p.bracket_title.match(/(-?\d+)/);
        if (match) {
          const threshold = parseFloat(match[1]);
          const titleLower = p.bracket_title.toLowerCase();

          if (titleLower.includes("higher") || titleLower.includes("above") || titleLower.includes("more")) {
            currentModelProb = brackets.filter((b) => b.temp >= threshold).reduce((s, b) => s + b.probability, 0);
          } else if (titleLower.includes("lower") || titleLower.includes("below") || titleLower.includes("less")) {
            currentModelProb = brackets.filter((b) => b.temp <= threshold).reduce((s, b) => s + b.probability, 0);
          } else {
            currentModelProb = brackets.find((b) => b.temp === threshold)?.probability ?? 0;
          }
        }
      }

      return {
        market: marketName,
        bracket_title: p.bracket_title,
        buy_price: p.buy_price,
        shares: p.shares,
        timestamp_buy: p.timestamp_buy,
        currentPrice,
        currentModelProb,
        pnl: curPnL,
      };
    })
  );

  // 2. Realized PnL from portfolio history
  const totalPnL = (rawState?.portfolio_history || []).reduce((sum, h) => sum + (h.pnl || 0), 0) + 
                   activePositions.reduce((sum, p) => sum + p.pnl, 0);

  // 3. Setup Config Update Handler
  const handleConfigChange = async (newConfig: BotConfig) => {
    try {
      const res = await fetch(`${ORCHESTRATOR_URL}/api/virtual_bot/config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newConfig),
      });
      if (res.ok) {
        console.log("Config saved successfully");
      }
    } catch (e) {
      console.error("Failed to save config:", e);
    }
  };

  const handleReset = async () => {
    if (!window.confirm("Are you sure you want to reset the Portfolio?")) return;
    try {
      await fetch(`${ORCHESTRATOR_URL}/api/virtual_bot/reset`, { method: "POST" });
    } catch (e) {
      console.error("Failed to reset:", e);
    }
  };

  const marketsList = Object.keys(rawState?.markets || []);

  const config: BotConfig = {
    min_edge: rawState?.config?.min_edge ?? 0.1,
    budget_per_bracket: rawState?.config?.budget_per_bracket ?? 1.0,
    excluded_markets: rawState?.config?.excluded_markets ?? [],
    enabled: rawState?.config?.enabled ?? false,
  };

  return (
    <div className="min-h-screen bg-[var(--ds-background-100)] text-[var(--ds-gray-1000)]">
      <div className="max-w-[1600px] mx-auto">
        {/* Header Section */}
        <header className="border-b border-[var(--ds-gray-200)] px-4 md:px-6 lg:px-8 py-6 md:py-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
            <div>
              <Link
                href="/"
                className="inline-flex items-center gap-2 font-mono text-xs text-[var(--ds-gray-700)] hover:text-cyan-400 transition-colors mb-3"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                BACK TO MAP
              </Link>
              <h1 className="font-mono text-xl md:text-2xl text-[var(--ds-gray-1000)] tracking-tight mb-1">
                BOT CONFIGURATION
              </h1>
              <p className="font-mono text-sm text-[var(--ds-gray-700)]">
                [GLOBAL TEMPERATURE MARKETS]
              </p>
            </div>
            
            {/* Status Section */}
            <div className="text-left md:text-right">
              <div className="font-mono text-xs text-[var(--ds-gray-700)] tracking-wider mb-2 flex items-center gap-2 justify-end">
                <span>BOT STATUS</span>
                <button onClick={handleReset} className="text-red-400 text-[10px] uppercase hover:underline">Reset Profile</button>
              </div>
              <BotStatusBadge status={config.enabled} />
              <div className="font-mono text-sm text-[var(--ds-gray-900)] mt-3 space-y-1">
                <div>STRATEGY: POLYAUGMENT</div>
                <div>VERSION: XLR8</div>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="border border-[var(--ds-gray-200)] rounded p-3 bg-[var(--ds-background-200)] hover:border-[var(--ds-gray-300)] transition-colors">
              <p className="font-mono text-xs text-[var(--ds-gray-700)] mb-1">Active Positions</p>
              <p className="font-mono text-lg font-bold text-cyan-400">{activePositions.length}</p>
            </div>
            <div className="border border-[var(--ds-gray-200)] rounded p-3 bg-[var(--ds-background-200)] hover:border-[var(--ds-gray-300)] transition-colors">
              <p className="font-mono text-xs text-[var(--ds-gray-700)] mb-1">Total P&L</p>
              <p className={`font-mono text-lg font-bold ${totalPnL >= 0 ? "text-green-400" : "text-red-400"}`}>
                {totalPnL >= 0 ? "+" : ""}${totalPnL.toFixed(2)}
              </p>
            </div>
            <div className="border border-[var(--ds-gray-200)] rounded p-3 bg-[var(--ds-background-200)] hover:border-[var(--ds-gray-300)] transition-colors">
              <p className="font-mono text-xs text-[var(--ds-gray-700)] mb-1">Cash Balance</p>
              <p className="font-mono text-lg font-bold text-cyan-400">${(rawState?.portfolio_balance || 0).toFixed(2)}</p>
            </div>
            <div className="border border-[var(--ds-gray-200)] rounded p-3 bg-[var(--ds-background-200)] hover:border-[var(--ds-gray-300)] transition-colors">
              <p className="font-mono text-xs text-[var(--ds-gray-700)] mb-1">Network Stream</p>
              <p className={`font-mono text-lg font-bold ${isConnected ? "text-green-400" : "text-red-400"}`}>
                {isConnected ? "CONNECTED" : "OFFLINE"}
              </p>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="px-4 md:px-6 lg:px-8 py-6 md:py-8">
          {/* Positions Table */}
          <section className="mb-8">
            <PositionsTable positions={activePositions} />
          </section>

          {/* Config and Logs Grid */}
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Configuration Section */}
            <section>
              <ConfigOptions config={config} markets={marketsList} onConfigChange={handleConfigChange} />
            </section>

            {/* Log Terminal Section */}
            <section>
              <LogTerminal logs={logs} maxHeight="400px" />
            </section>
          </div>

          {/* Bot Stats Section */}
          <section>
            <BotStatsDisplay stats={botStats} />
          </section>
        </div>

        {/* Footer Status Bar */}
        <footer className="border-t border-[var(--ds-gray-200)] px-4 md:px-6 lg:px-8 py-3 flex items-center justify-between font-mono text-xs text-[var(--ds-gray-700)]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400" />
              {activePositions.length} Active
            </span>
            <span className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-cyan-400" : "bg-red-400"}`} />
              {isConnected ? "Live Stream Syncing" : "Offline"}
            </span>
          </div>
          <span>Server Time: {rawState?.server_time || "—"}</span>
        </footer>
      </div>
    </div>
  );
}
