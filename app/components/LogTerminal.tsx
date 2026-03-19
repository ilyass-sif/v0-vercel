"use client";

import { useRef, useEffect } from "react";
import { LogEntry } from "@/app/types/bot";

interface LogTerminalProps {
  logs: LogEntry[];
  maxHeight?: string;
}

export function LogTerminal({ logs, maxHeight = "200px" }: LogTerminalProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [logs]);

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getLevelColor = (level: LogEntry["level"]) => {
    switch (level) {
      case "INFO":
        return "text-[var(--ds-gray-900)]";
      case "WARN":
        return "text-yellow-400";
      case "ERROR":
        return "text-red-400";
      case "SUCCESS":
        return "text-green-400";
      default:
        return "text-[var(--ds-gray-900)]";
    }
  };

  const getLevelPrefix = (level: LogEntry["level"]) => {
    switch (level) {
      case "INFO":
        return "[INFO]";
      case "WARN":
        return "[WARN]";
      case "ERROR":
        return "[ERR!]";
      case "SUCCESS":
        return "[OK]";
      default:
        return "[---]";
    }
  };

  return (
    <div className="border border-[var(--ds-gray-alpha-400)] bg-[var(--ds-background-100)]">
      <div className="px-4 py-3 border-b border-[var(--ds-gray-alpha-400)] flex items-center justify-between">
        <span className="font-mono text-sm text-[var(--ds-gray-900)] tracking-wider">SYSTEM LOG</span>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="font-mono text-xs text-[var(--ds-gray-900)]">LIVE</span>
        </div>
      </div>
      
      <div
        ref={scrollRef}
        className="overflow-y-auto font-mono text-xs"
        style={{ maxHeight }}
      >
        {logs.map((log) => (
          <div
            key={log.id}
            className="px-4 py-1.5 border-b border-[var(--ds-gray-alpha-100)] hover:bg-[var(--ds-gray-alpha-100)] transition-colors"
          >
            <div className="flex items-start gap-3">
              <span className="text-[var(--ds-gray-700)] shrink-0">
                {formatTimestamp(log.timestamp)}
              </span>
              <span className={`shrink-0 ${getLevelColor(log.level)}`}>
                {getLevelPrefix(log.level)}
              </span>
              <span className="text-[var(--ds-gray-1000)]">
                {log.message}
                {log.details && (
                  <span className="text-[var(--ds-gray-700)]"> - {log.details}</span>
                )}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
