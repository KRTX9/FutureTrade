/**
 * Portfolio Page - Simplified
 * Shows positions overview
 */

import { useEffect } from "react";
import TradingLayout from "../Components/Layout/TradingLayout";
import useTradingStore from "../stores/tradingStore";
import useMarketStore from "../stores/marketStore";
import { TrendingUp, Wallet } from "lucide-react";
import clsx from "clsx";
import numeral from "numeral";

export default function Portfolio() {
  const { positions, wallet, fetchPositions, fetchWallet, resetWallet, loading } = useTradingStore();
  const tickers = useMarketStore((state) => state.tickers);

  useEffect(() => {
    fetchPositions();
    fetchWallet();
  }, [fetchPositions, fetchWallet]);

  const handleReset = async () => {
    if (window.confirm('Reset wallet to $100,000 USDT? This will close all positions.')) {
      await resetWallet();
      await fetchWallet();
      await fetchPositions();
    }
  };

  // Calculate total PnL
  let totalPnL = 0;
  let totalValue = 0;

  positions.forEach((pos) => {
    const entryPrice = parseFloat(pos.entryPrice || pos.entry_price);
    const currentPrice =
      parseFloat(tickers[pos.symbol]?.last_price) ||
      parseFloat(pos.currentPrice) ||
      entryPrice;
    const size = parseFloat(pos.qty || pos.size);
    const isLong = pos.side === "Buy";

    const posValue = size * entryPrice;
    totalValue += posValue;

    let pnl = 0;
    if (isLong) {
      pnl = (currentPrice - entryPrice) * size;
    } else {
      pnl = (entryPrice - currentPrice) * size;
    }
    totalPnL += pnl;
  });

  const balance = parseFloat(wallet?.balance || 0);
  const totalEquity = balance + totalPnL;

  return (
    <TradingLayout>
      <div className="min-h-screen bg-[#0b0e11] p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Portfolio</h1>
              <p className="text-gray-400">Track your trading positions</p>
            </div>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm font-medium"
            >
              Reset Wallet
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-[#1a1d21] border border-cyan-500/30 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <Wallet className="w-5 h-5 text-cyan-400" />
                <span className="text-gray-400 text-sm">Balance</span>
              </div>
              <div className="text-2xl font-bold text-white">
                ${numeral(balance).format("0,0.00")}
              </div>
            </div>

            <div className="bg-[#1a1d21] border border-cyan-500/30 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
                <span className="text-gray-400 text-sm">Unrealized PnL</span>
              </div>
              <div
                className={clsx(
                  "text-2xl font-bold",
                  totalPnL >= 0 ? "text-green-400" : "text-red-400",
                )}
              >
                {totalPnL >= 0 ? "+" : ""}${numeral(Math.abs(totalPnL)).format("0,0.00")}
              </div>
            </div>

            <div className="bg-[#1a1d21] border border-cyan-500/30 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <Wallet className="w-5 h-5 text-cyan-400" />
                <span className="text-gray-400 text-sm">Total Equity</span>
              </div>
              <div className="text-2xl font-bold text-white">
                ${numeral(totalEquity).format("0,0.00")}
              </div>
            </div>

            <div className="bg-[#1a1d21] border border-cyan-500/30 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
                <span className="text-gray-400 text-sm">Open Positions</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {positions.length}
              </div>
            </div>
          </div>

          {/* Positions Table */}
          <div className="bg-[#1a1d21] border border-cyan-500/30 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-white">
                Open Positions
              </h2>
            </div>

            {loading.positions ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500" />
              </div>
            ) : positions.length === 0 ? (
              <div className="py-12 text-center text-gray-400">
                No open positions
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm table-fixed">
                  <colgroup>
                    <col className="w-24" />
                    <col className="w-16" />
                    <col className="w-24" />
                    <col className="w-28" />
                    <col className="w-28" />
                    <col className="w-16" />
                    <col className="w-24" />
                    <col className="w-28" />
                    <col className="w-28" />
                  </colgroup>
                  <thead>
                    <tr className="text-gray-400 text-xs border-b border-gray-800">
                      <th className="text-left py-3 px-4 font-medium">
                        Symbol
                      </th>
                      <th className="text-left py-3 px-2 font-medium">Side</th>
                      <th className="text-right py-3 px-2 font-medium">Size</th>
                      <th className="text-right py-3 px-3 font-medium">
                        Entry Price
                      </th>
                      <th className="text-right py-3 px-3 font-medium">
                        Current Price
                      </th>
                      <th className="text-center py-3 px-2 font-medium">Lev</th>
                      <th className="text-right py-3 px-2 font-medium">Margin</th>
                      <th className="text-right py-3 px-2 font-medium">Liq. Price</th>
                      <th className="text-right py-3 px-2 font-medium">PnL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {positions.map((pos) => {
                      const entryPrice = parseFloat(
                        pos.entryPrice || pos.entry_price,
                      );
                      const currentPrice =
                        parseFloat(tickers[pos.symbol]?.last_price) ||
                        parseFloat(pos.currentPrice) ||
                        entryPrice;
                      const size = parseFloat(pos.qty || pos.size);
                      const isLong = pos.side === "Buy";
                      const leverage = pos.leverage || 1;
                      const marginUsed = parseFloat(pos.marginUsed || 0);

                      let pnl = 0;
                      if (isLong) {
                        pnl = (currentPrice - entryPrice) * size;
                      } else {
                        pnl = (entryPrice - currentPrice) * size;
                      }

                      // Calculate PnL percentage based on entry price
                      let pnlPercentage = 0;
                      if (entryPrice > 0) {
                        if (isLong) {
                          pnlPercentage = ((currentPrice - entryPrice) / entryPrice) * 100;
                        } else {
                          pnlPercentage = ((entryPrice - currentPrice) / entryPrice) * 100;
                        }
                      }

                      // Calculate liquidation price
                      let liqPrice = 0;
                      if (leverage > 0) {
                        const liqPercentage = (1 / leverage) * 0.9;
                        if (isLong) {
                          liqPrice = entryPrice * (1 - liqPercentage);
                        } else {
                          liqPrice = entryPrice * (1 + liqPercentage);
                        }
                      }

                      return (
                        <tr
                          key={pos.id}
                          className="border-b border-gray-800/50 hover:bg-gray-800/30"
                        >
                          <td className="py-3 px-4 text-white font-medium">
                            {pos.symbol}
                          </td>
                          <td className="py-3 px-2">
                            <span
                              className={clsx(
                                "text-xs font-semibold",
                                isLong ? "text-green-400" : "text-red-400",
                              )}
                            >
                              {isLong ? "LONG" : "SHORT"}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-right text-white tabular-nums">
                            {numeral(size).format("0,0.0000")}
                          </td>
                          <td className="py-3 px-3 text-right text-white tabular-nums">
                            ${numeral(entryPrice).format("0,0.00")}
                          </td>
                          <td className="py-3 px-3 text-right text-white tabular-nums">
                            ${numeral(currentPrice).format("0,0.00")}
                          </td>
                          <td className="py-3 px-2 text-center">
                            <span className="text-cyan-400 font-medium tabular-nums">{leverage}x</span>
                          </td>
                          <td className="py-3 px-2 text-right text-white tabular-nums">
                            ${numeral(marginUsed).format("0,0.00")}
                          </td>
                          <td className="py-3 px-2 text-right tabular-nums">
                            <span className="text-red-400 font-medium">
                              ${numeral(liqPrice).format("0,0.00")}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-right tabular-nums">
                            <div className="flex flex-col items-end">
                              <span
                                className={clsx(
                                  "font-medium",
                                  pnl >= 0 ? "text-green-400" : "text-red-400",
                                )}
                              >
                                {pnl >= 0 ? "+" : ""}$
                                {numeral(Math.abs(pnl)).format("0,0.00")}
                              </span>
                              <span
                                className={clsx(
                                  "text-xs",
                                  pnl >= 0 ? "text-green-400/70" : "text-red-400/70",
                                )}
                              >
                                {pnlPercentage >= 0 ? "+" : ""}{numeral(pnlPercentage).format("0,0.00")}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </TradingLayout>
  );
}
