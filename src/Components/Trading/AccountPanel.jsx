/**
 * AccountPanel Component
 * Displays account balance and margin info
 */

import { useEffect } from "react";
import useTradingStore from "../../stores/tradingStore";
import useMarketStore from "../../stores/marketStore";
import clsx from "clsx";
import numeral from "numeral";
import { Wallet } from "lucide-react";

export default function AccountPanel({ className }) {
  const { wallet, positions, fetchWallet } = useTradingStore();
  const tickers = useMarketStore((state) => state.tickers);

  // Fetch wallet on mount
  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  // Calculate unrealized PnL from positions using LIVE ticker prices
  const unrealizedPnl = positions.reduce((total, pos) => {
    const entryPrice = parseFloat(pos.entryPrice || pos.entry_price);
    const size = parseFloat(pos.qty || pos.size);
    // Use mark_price first (same as PositionsPanel), then fallback to last_price
    const livePrice =
      parseFloat(tickers[pos.symbol]?.mark_price) || 
      parseFloat(tickers[pos.symbol]?.last_price) ||
      parseFloat(pos.currentPrice) ||
      parseFloat(pos.mark_price) ||
      entryPrice;
    const isLong = pos.side === "Buy";

    let pnl = 0;
    if (isLong) {
      pnl = (livePrice - entryPrice) * size;
    } else {
      pnl = (entryPrice - livePrice) * size;
    }
    return total + pnl;
  }, 0);

  // Calculate used margin from positions
  const usedMargin = positions.reduce((total, pos) => {
    return total + parseFloat(pos.marginUsed || 0);
  }, 0);

  const balance = parseFloat(wallet?.balance || 0);
  const marginBalance = balance + unrealizedPnl;
  const totalEquity = balance + unrealizedPnl;
  const available = balance; // Available is the current balance (already has margin deducted)

  const formatValue = (value) => {
    return numeral(value).format("0,0.00");
  };

  return (
    <div
      className={clsx(
        "bg-[#181a20] border-t border-gray-800 flex-1 flex flex-col",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-800 shrink-0">
        <Wallet className="w-4 h-4 text-gray-400" />
        <span className="text-white text-sm font-medium">Account</span>
        <span className="px-1.5 py-0.5 text-[10px] bg-yellow-500/20 text-yellow-500 rounded">
          Paper Trading
        </span>
      </div>

      {/* Account Details - Expanded to fill space */}
      <div className="px-4 py-4 space-y-3 flex-1">
        <AccountRow label="Balance" value={formatValue(balance)} />
        <AccountRow
          label="Unrealized PnL"
          value={`${unrealizedPnl >= 0 ? "+" : ""}${formatValue(unrealizedPnl)}`}
          valueColor={unrealizedPnl >= 0 ? "text-green-400" : "text-red-400"}
        />
        <AccountRow label="Total Equity" value={formatValue(totalEquity)} />
        <AccountRow label="Used Margin" value={formatValue(usedMargin)} />
        <AccountRow
          label="Available"
          value={formatValue(available)}
          highlight
        />
      </div>
    </div>
  );
}

function AccountRow({ label, value, valueColor, highlight }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-gray-400">{label}</span>
      <span
        className={clsx(
          "text-base font-medium",
          valueColor || "text-white",
          highlight && "text-yellow-500",
        )}
      >
        {value} USDT
      </span>
    </div>
  );
}
