"use client";

interface PositionRow {
  market: string;
  bracket_title: string;
  buy_price: number;
  shares: number;
  timestamp_buy: string;
  currentPrice: number;
  currentModelProb: number;
  pnl: number;
}

interface PositionsTableProps {
  positions: PositionRow[];
  onPositionClick?: (position: PositionRow) => void;
}

export function PositionsTable({ positions, onPositionClick }: PositionsTableProps) {
  const formatPrice = (num: number) => {
    return num.toFixed(2);
  };

  const formatPnL = (num: number) => {
    const prefix = num >= 0 ? "+" : "";
    return prefix + num.toFixed(2);
  };

  return (
    <div className="border border-[var(--ds-gray-alpha-400)] bg-[var(--ds-background-100)]">
      <div className="px-4 py-3 border-b border-[var(--ds-gray-alpha-400)]">
        <span className="font-mono text-sm text-cyan-400 tracking-wider">ACTIVE HOLDINGS TABLE</span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full font-mono text-sm">
          <thead>
            <tr className="text-[var(--ds-gray-900)] border-b border-[var(--ds-gray-alpha-400)]">
              <th className="px-4 py-3 text-left font-normal w-8">#</th>
              <th className="px-4 py-3 text-left font-normal">MARKET</th>
              <th className="px-4 py-3 text-left font-normal">BRACKET</th>
              <th className="px-4 py-3 text-right font-normal">INITIAL</th>
              <th className="px-4 py-3 text-right font-normal">NOW</th>
              <th className="px-4 py-3 text-right font-normal">MODEL</th>
              <th className="px-4 py-3 text-right font-normal">PNL</th>
            </tr>
          </thead>
          <tbody>
            {positions.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-[var(--ds-gray-500)]">
                  Scanning for live opportunities...
                </td>
              </tr>
            ) : (
              positions.map((position, index) => {
                const pnlColor = position.pnl >= 0 ? "text-green-400" : "text-red-400";
                
                return (
                  <tr
                    key={index}
                    className="border-b border-[var(--ds-gray-alpha-200)] hover:bg-[var(--ds-gray-alpha-100)] cursor-pointer transition-colors"
                    onClick={() => onPositionClick?.(position)}
                  >
                    <td className="px-4 py-2 text-[var(--ds-gray-900)]">{index + 1}</td>
                    <td className="px-4 py-2 text-[var(--ds-gray-1000)] font-bold uppercase">{position.market}</td>
                    <td className="px-4 py-2 text-[var(--ds-gray-900)] text-xs truncate max-w-[200px]" title={position.bracket_title}>
                      {position.bracket_title}
                    </td>
                    <td className="px-4 py-2 text-right text-[var(--ds-gray-1000)]">${formatPrice(position.buy_price)}</td>
                    <td className="px-4 py-2 text-right text-[var(--ds-gray-1000)]">${formatPrice(position.currentPrice)}</td>
                    <td className="px-4 py-2 text-right text-cyan-400">{(position.currentModelProb * 100).toFixed(0)}%</td>
                    <td className={`px-4 py-2 text-right font-medium ${pnlColor}`}>
                      {formatPnL(position.pnl)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
