/**
 * Notification System Usage Guide for Agents
 *
 * The notification system allows agents to send real-time alerts to users about bot events.
 *
 * BASIC USAGE:
 * ```
 * import { useNotification } from "@/app/context/NotificationContext";
 *
 * function MyComponent() {
 *   const { addNotification } = useNotification();
 *
 *   const handleTrade = async () => {
 *     const result = await executeOrder();
 *
 *     if (result.success) {
 *       addNotification({
 *         type: "success",
 *         title: "ORDER EXECUTED",
 *         message: `Bought 10 ETH at $2,450.12`,
 *         duration: 5000,
 *       });
 *     }
 *   };
 * }
 * ```
 *
 * NOTIFICATION TYPES:
 * - "success" (green) - For successful operations, trades executed, markets activated
 * - "error" (red) - For failures, connection issues, trade rejections
 * - "warning" (yellow) - For alerts, slippage warnings, maintenance notices
 * - "info" (cyan) - For informational messages, updates, system status
 *
 * API REFERENCE:
 *
 * addNotification(options: {
 *   type: "success" | "error" | "warning" | "info";
 *   title: string;                    // Short headline
 *   message: string;                  // Detailed message
 *   duration?: number;                // Auto-dismiss after ms (0 = persistent)
 *   action?: {                        // Optional action button
 *     label: string;
 *     onClick: () => void;
 *   }
 * }): string                          // Returns notification ID
 *
 * removeNotification(id: string): void  // Manually dismiss notification
 *
 * EXAMPLES FOR BOT EVENTS:
 *
 * 1. Trade Executed:
 * addNotification({
 *   type: "success",
 *   title: "BOT TRADE EXECUTED",
 *   message: "Bought 5,000 USDC ETH/USDT 2,450.12. P&L: +$1,245",
 *   duration: 5000,
 * });
 *
 * 2. Market Activated:
 * addNotification({
 *   type: "info",
 *   title: "MARKET ACTIVATED",
 *   message: "US EAST COAST TEMP market online. 8,245 nodes active.",
 *   duration: 4000,
 * });
 *
 * 3. Trade Failed (with Retry):
 * addNotification({
 *   type: "error",
 *   title: "TRADE FAILED",
 *   message: "Unable to execute sell. Network timeout after 3 retries.",
 *   duration: 0,
 *   action: {
 *     label: "RETRY",
 *     onClick: () => retryOrder(),
 *   },
 * });
 *
 * 4. Configuration Warning:
 * addNotification({
 *   type: "warning",
 *   title: "SLIPPAGE WARNING",
 *   message: "Predicted slippage 0.85% exceeds tolerance 0.7%.",
 *   duration: 0,
 *   action: {
 *     label: "ADJUST",
 *     onClick: () => openSettings(),
 *   },
 * });
 *
 * 5. Bot Status Change:
 * addNotification({
 *   type: "info",
 *   title: "BOT PAUSED",
 *   message: "Trading paused due to scheduled maintenance. Resuming in 5 minutes.",
 *   duration: 6000,
 * });
 *
 * BEST PRACTICES:
 * - Keep titles short and UPPERCASE
 * - Use type-appropriate colors for user experience
 * - Set duration to 0 for important alerts that need action
 * - Include specific values (prices, amounts, percentages)
 * - Use action buttons for user interventions needed
 * - Avoid notification spam - group related events
 */

export const NOTIFICATION_EXAMPLES = {
  tradeBought: {
    type: "success" as const,
    title: "BOT TRADE EXECUTED",
    message: "Bought 10,000 USDC at ETH/USDT 2,450.12",
    duration: 5000,
  },

  tradeSold: {
    type: "success" as const,
    title: "POSITION CLOSED",
    message: "Sold position with +$1,245 profit",
    duration: 5000,
  },

  marketActive: {
    type: "info" as const,
    title: "MARKET ACTIVATED",
    message: "US EAST COAST TEMP market is now live",
    duration: 4000,
  },

  tradeFailed: {
    type: "error" as const,
    title: "TRADE FAILED",
    message: "Unable to execute order. Network timeout.",
    duration: 6000,
  },

  slippageWarning: {
    type: "warning" as const,
    title: "SLIPPAGE WARNING",
    message: "Predicted slippage exceeds tolerance",
    duration: 0,
  },

  botPaused: {
    type: "info" as const,
    title: "BOT PAUSED",
    message: "Trading paused. Resuming in 5 minutes.",
    duration: 6000,
  },

  configUpdated: {
    type: "success" as const,
    title: "CONFIG UPDATED",
    message: "Settings applied successfully",
    duration: 3000,
  },
};
