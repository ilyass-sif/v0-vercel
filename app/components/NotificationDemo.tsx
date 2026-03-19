"use client";

import { useNotification } from "@/app/context/NotificationContext";

export function NotificationDemo() {
  const { addNotification } = useNotification();

  const triggerBotBought = () => {
    addNotification({
      type: "success",
      title: "BOT TRADE EXECUTED",
      message: "Bot bought 10,000 USDC at ETH/USDT 2,450.12. Entry confirmed.",
      duration: 5000,
    });
  };

  const triggerBotSold = () => {
    addNotification({
      type: "success",
      title: "BOT TRADE CLOSED",
      message: "Position closed with +$1,245 profit. Exit executed at market price.",
      duration: 5000,
    });
  };

  const triggerMarketActive = () => {
    addNotification({
      type: "info",
      title: "MARKET ACTIVATED",
      message: "US EAST COAST TEMP market is now active. 8,245 nodes processing data.",
      duration: 4000,
    });
  };

  const triggerError = () => {
    addNotification({
      type: "error",
      title: "TRADE FAILED",
      message: "Unable to execute sell order. Network timeout after 3 retries.",
      duration: 6000,
      action: {
        label: "RETRY",
        onClick: () => {
          addNotification({
            type: "info",
            title: "RETRYING",
            message: "Attempting to execute trade again...",
            duration: 3000,
          });
        },
      },
    });
  };

  const triggerWarning = () => {
    addNotification({
      type: "warning",
      title: "SLIPPAGE WARNING",
      message: "Predicted slippage: 0.85% exceeds tolerance of 0.7%. Adjust parameters?",
      duration: 0,
      action: {
        label: "ADJUST",
        onClick: () => {
          addNotification({
            type: "success",
            title: "SETTINGS UPDATED",
            message: "Slippage tolerance updated to 1.0%",
            duration: 3000,
          });
        },
      },
    });
  };

  return (
    <div className="flex flex-wrap gap-2 p-4 bg-gray-900 rounded border border-gray-700">
      <button
        onClick={triggerBotBought}
        className="px-3 py-2 text-xs font-mono bg-green-900 hover:bg-green-800 border border-green-700 text-green-400 rounded transition-colors"
      >
        Bot Bought
      </button>
      <button
        onClick={triggerBotSold}
        className="px-3 py-2 text-xs font-mono bg-green-900 hover:bg-green-800 border border-green-700 text-green-400 rounded transition-colors"
      >
        Bot Sold
      </button>
      <button
        onClick={triggerMarketActive}
        className="px-3 py-2 text-xs font-mono bg-cyan-900 hover:bg-cyan-800 border border-cyan-700 text-cyan-400 rounded transition-colors"
      >
        Market Active
      </button>
      <button
        onClick={triggerError}
        className="px-3 py-2 text-xs font-mono bg-red-900 hover:bg-red-800 border border-red-700 text-red-400 rounded transition-colors"
      >
        Error
      </button>
      <button
        onClick={triggerWarning}
        className="px-3 py-2 text-xs font-mono bg-yellow-900 hover:bg-yellow-800 border border-yellow-700 text-yellow-400 rounded transition-colors"
      >
        Warning
      </button>
    </div>
  );
}
