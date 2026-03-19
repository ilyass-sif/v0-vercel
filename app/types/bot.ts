// Bot configuration and position types

export interface ActivePosition {
  id: string;
  positionId: string;
  pair: string;
  entry: number;
  exitTarget: number;
  size: number;
  pnl24h: number;
  status: "OPEN" | "CLOSED" | "PENDING" | "LIQUIDATED";
}

export interface BotConfig {
  min_edge: number;
  budget_per_bracket: number;
  excluded_markets: string[];
  enabled: boolean;
}

export interface BotStatus {
  status: "ACTIVE" | "PAUSED" | "STOPPED" | "ERROR";
  strategy: string;
  version: string;
}

export interface BotStats {
  totalPredictions: number;
  dataProcessing: number;
  nodesActive: number;
  processRate: number;
  configuredPairs: number;
  maxDrawdown: number;
  executionsPerMin: number;
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: "INFO" | "WARN" | "ERROR" | "SUCCESS";
  message: string;
  details?: string;
}

// Placeholder data for UI scaffolding
export const PLACEHOLDER_POSITIONS: ActivePosition[] = [
  { id: "1", positionId: "AP-001", pair: "ETH/USDT", entry: 2450.12, exitTarget: 2450.50, size: 5000000, pnl24h: 15400, status: "OPEN" },
  { id: "2", positionId: "AP-002", pair: "BTC/USDT", entry: 42100.50, exitTarget: 42250.00, size: 10000000, pnl24h: 26500, status: "OPEN" },
  { id: "3", positionId: "AP-003", pair: "SOL/USDT", entry: 98.46, exitTarget: 99.20, size: 2500000, pnl24h: 18750, status: "OPEN" },
  { id: "4", positionId: "AP-004", pair: "BNB/USDT", entry: 315.80, exitTarget: 317.50, size: 3000000, pnl24h: 5100, status: "OPEN" },
  { id: "5", positionId: "AP-005", pair: "XRP/USDT", entry: 0.85, exitTarget: 0.86, size: 4000000, pnl24h: 47000, status: "OPEN" },
  { id: "6", positionId: "AP-006", pair: "ADA/USDT", entry: 0.52, exitTarget: 0.53, size: 3000000, pnl24h: 57600, status: "OPEN" },
  { id: "7", positionId: "AP-007", pair: "MATIC/USDT", entry: 1.10, exitTarget: 1.12, size: 2500000, pnl24h: 45500, status: "OPEN" },
  { id: "8", positionId: "AP-008", pair: "DOT/USDT", entry: 6.80, exitTarget: 6.90, size: 2000000, pnl24h: 29400, status: "OPEN" },
  { id: "9", positionId: "AP-009", pair: "LTC/USDT", entry: 150.20, exitTarget: 151.00, size: 1500000, pnl24h: 8000, status: "OPEN" },
  { id: "10", positionId: "AP-010", pair: "AVAX/USDT", entry: 22.50, exitTarget: 22.80, size: 2000000, pnl24h: 26600, status: "OPEN" },
  { id: "11", positionId: "AP-011", pair: "LINK/USDT", entry: 15.30, exitTarget: 15.50, size: 1000000, pnl24h: 13000, status: "OPEN" },
  { id: "12", positionId: "AP-012", pair: "UNI/USDT", entry: 6.20, exitTarget: 6.30, size: 1392104, pnl24h: 8352, status: "OPEN" },
];

export const PLACEHOLDER_BOT_STATUS: BotStatus = {
  status: "ACTIVE",
  strategy: "ARBITRAGE",
  version: "2.4.1",
};

export const PLACEHOLDER_BOT_CONFIG: BotConfig = {
  executionMode: "HIGH-FREQUENCY",
  slippageTolerance: 0.05,
  maxGasFee: 150,
  retryAttempts: 3,
  autoSettle: true,
  notifications: ["TELEGRAM", "EMAIL"],
};

export const PLACEHOLDER_BOT_STATS: BotStats = {
  totalPredictions: 6125831,
  dataProcessing: 42591304128,
  nodesActive: 8245,
  processRate: 1,
  configuredPairs: 12,
  maxDrawdown: 0.15,
  executionsPerMin: 1842,
};

export const PLACEHOLDER_LOGS: LogEntry[] = [
  { id: "1", timestamp: new Date(), level: "SUCCESS", message: "Position AP-012 opened successfully", details: "UNI/USDT @ 6.20" },
  { id: "2", timestamp: new Date(Date.now() - 5000), level: "INFO", message: "Market scan complete", details: "12 opportunities identified" },
  { id: "3", timestamp: new Date(Date.now() - 10000), level: "INFO", message: "Price feed updated", details: "All pairs synced" },
  { id: "4", timestamp: new Date(Date.now() - 15000), level: "WARN", message: "High volatility detected", details: "BTC/USDT spread widening" },
  { id: "5", timestamp: new Date(Date.now() - 20000), level: "SUCCESS", message: "Position AP-011 opened successfully", details: "LINK/USDT @ 15.30" },
  { id: "6", timestamp: new Date(Date.now() - 30000), level: "INFO", message: "Strategy recalibration complete" },
  { id: "7", timestamp: new Date(Date.now() - 45000), level: "INFO", message: "Connected to 8,245 nodes" },
  { id: "8", timestamp: new Date(Date.now() - 60000), level: "SUCCESS", message: "Bot initialized", details: "All systems operational" },
];
