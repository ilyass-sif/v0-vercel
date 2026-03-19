"use client";

import { useState, useEffect } from "react";
import { BotConfig } from "@/app/types/bot";

interface ConfigOptionsProps {
  config: BotConfig;
  markets: string[];
  onConfigChange: (newConfig: BotConfig) => void;
}

export function ConfigOptions({ config, markets, onConfigChange }: ConfigOptionsProps) {
  const [minEdge, setMinEdge] = useState(config.min_edge);
  const [budget, setBudget] = useState(config.budget_per_bracket);
  const [excluded, setExcluded] = useState(config.excluded_markets);
  const [enabled, setEnabled] = useState(config.enabled);

  useEffect(() => {
    setMinEdge(config.min_edge);
    setBudget(config.budget_per_bracket);
    setExcluded(config.excluded_markets || []);
    setEnabled(config.enabled);
  }, [config]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfigChange({
      min_edge: parseFloat(minEdge.toString()),
      budget_per_bracket: parseFloat(budget.toString()),
      excluded_markets: excluded,
      enabled: enabled,
    });
  };

  const toggleExcluded = (market: string) => {
    setExcluded((prev) =>
      prev.includes(market) ? prev.filter((m) => m !== market) : [...prev, market]
    );
  };

  return (
    <div className="border border-[var(--ds-gray-alpha-400)] bg-[var(--ds-background-100)] flex flex-col h-full">
      <div className="px-4 py-3 border-b border-[var(--ds-gray-alpha-400)]">
        <span className="font-mono text-sm text-cyan-400 tracking-wider">CONFIGURATION OPTIONS</span>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4 font-mono text-sm flex-1 flex flex-col">
        <div className="space-y-4 flex-1">
          <div>
            <div className="flex justify-between text-xs text-[var(--ds-gray-900)] mb-1">
              <span>EDGE THRESHOLD</span>
              <span className="text-cyan-400 font-bold">{(minEdge * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.5"
              step="0.01"
              value={minEdge}
              onChange={(e) => setMinEdge(parseFloat(e.target.value))}
              className="w-full h-1 bg-[var(--ds-gray-200)] rounded appearance-none accent-cyan-400 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs uppercase font-bold text-[var(--ds-gray-900)] mb-1">Alloc Budget ($)</label>
            <input
              type="number"
              step="0.5"
              min="0.5"
              value={budget}
              onChange={(e) => setBudget(parseFloat(e.target.value))}
              className="w-full bg-[var(--ds-background-200)] border border-[var(--ds-gray-alpha-300)] rounded px-3 py-1 text-sm font-mono text-[var(--ds-gray-1000)] focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-xs uppercase font-bold text-[var(--ds-gray-900)] mb-1">Excluded Markets</label>
            <div className="flex flex-wrap gap-1.5 mt-1 max-h-32 overflow-y-auto p-1.5 border border-[var(--ds-gray-alpha-300)] rounded bg-[var(--ds-background-200)]">
              {markets.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => toggleExcluded(m)}
                  className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-colors ${
                    excluded.includes(m)
                      ? "bg-red-500/10 text-red-400 border-red-500/50"
                      : "bg-[var(--ds-background-100)] border-transparent text-[var(--ds-gray-900)] hover:text-[var(--ds-gray-1000)]"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[var(--ds-gray-alpha-200)]">
            <span className="text-xs uppercase font-bold text-[var(--ds-gray-900)]">Bot Enabled</span>
            <div
              onClick={() => setEnabled(!enabled)}
              className={`w-8 h-4.5 rounded-full p-0.5 transition-colors duration-200 cursor-pointer ${
                enabled ? "bg-cyan-400" : "bg-[var(--ds-gray-300)]"
              }`}
            >
              <div
                className={`bg-white w-3.5 h-3.5 rounded-full shadow-sm transform transition-transform duration-200 ${
                  enabled ? "translate-x-3.5" : "translate-x-0"
                }`}
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-cyan-400 hover:bg-cyan-500 text-[var(--ds-background-100)] font-bold py-2 rounded text-xs transition-colors shadow-lg shadow-cyan-400/10 mt-auto"
        >
          SAVE ADJUSTMENTS
        </button>
      </form>
    </div>
  );
}
