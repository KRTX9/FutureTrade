/**
 * PositionsPanel Component - Simplified (Futures Only)
 * Displays open positions, orders, and trade history
 */

import { useEffect, useState } from "react";
import useTradingStore from "../../stores/tradingStore";
import useMarketStore from "../../stores/marketStore";
import { Spinner } from "../Common";
import { X } from "lucide-react";
import clsx from "clsx";
import numeral from "numeral";
import wsService from "../../services/websocket";

const formatPrice = (price) => {
  if (!price || isNaN(price)) return "$0.00";
  if (price >= 1000) return `${numeral(price).format("0,0.00")}`;
  if (price >= 1) return `${numeral(price).format("0,0.0000")}`;
  return `${numeral(price).format("0,0.000000")}`;
};

const TABS = [
  { id: "positions", label: "Positions" },
  { id: "orders", label: "Orders" },
];

export default function PositionsPanel({ className }) {
  const [activeTab, setActiveTab] = useState("positions");
  const { positions, openOrders, loading } = useTradingStore();

  const totalPositions = positions.length;

  return (
    <div className={clsx("bg-[#0b0e11] flex flex-col h-full", className)}>
      {/* Tabs */}
      <div className="flex border-b border-gray-800">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              "px-4 py-3 text-sm font-medium transition-colors relative",
              activeTab === tab.id
                ? "text-cyan-400"
                : "text-gray-400 hover:text-white",
            )}
          >
            {tab.label}
            {tab.id === "positions" && totalPositions > 0 && (
              <span className="ml-1 text-xs text-gray-500">
                ({totalPositions})
              </span>
            )}
            {tab.id === "orders" && openOrders.length > 0 && (
              <span className="ml-1 text-xs text-gray-500">
                ({openOrders.length})
              </span>
            )}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === "positions" && (
          <PositionsTable
            positions={positions}
            loading={loading.positions}
          />
        )}
        {activeTab === "orders" && (
          <OrdersTable orders={openOrders} loading={loading.orders} />
        )}
      </div>
    </div>
  );
}

function PositionsTable({ positions, loading }) {
  const { closePosition, modifyPositionTPSL } = useTradingStore();
  const tickers = useMarketStore((state) => state.tickers);
  const [tpslModal, setTpslModal] = useState(null);

  useEffect(() => {
    if (positions.length === 0) return;

    positions.forEach((position) => {
      if (wsService.isConnected()) {
        wsService.subscribeTicker(position.symbol);
      }
    });
  }, [positions]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
      </div>
    );
  }

  if (positions.length === 0) {
    return <div className="py-4 text-center text-gray-500 text-sm">No open positions</div>;
  }

  return (
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
          <col className="w-32" />
        </colgroup>
        <thead>
          <tr className="text-gray-400 text-xs border-b border-gray-800">
            <th className="text-left py-3 px-4 font-medium">Symbol</th>
            <th className="text-left py-3 px-2 font-medium">Side</th>
            <th className="text-right py-3 px-2 font-medium">Size</th>
            <th className="text-right py-3 px-3 font-medium">Entry</th>
            <th className="text-right py-3 px-3 font-medium">Mark</th>
            <th className="text-center py-3 px-2 font-medium">Lev</th>
            <th className="text-right py-3 px-2 font-medium">Margin</th>
            <th className="text-right py-3 px-2 font-medium">Liq. Price</th>
            <th className="text-right py-3 px-2 font-medium">PnL</th>
            <th className="text-center py-3 px-4 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {positions.map((position) => {
            const livePrice =
              parseFloat(tickers[position.symbol]?.mark_price) ||
              parseFloat(tickers[position.symbol]?.last_price) ||
              0;
            return (
              <PositionRow
                key={position.id}
                position={position}
                livePrice={livePrice}
                onClose={() =>
                  closePosition(position.id, {
                    price: livePrice > 0 ? livePrice : undefined,
                  })
                }
                onEditTPSL={() => setTpslModal(position)}
              />
            );
          })}
        </tbody>
      </table>

      {tpslModal && (
        <TPSLModal 
          position={tpslModal} 
          onClose={() => setTpslModal(null)}
          onSave={modifyPositionTPSL}
        />
      )}
    </div>
  );
}

function PositionRow({ position, livePrice, onClose, onEditTPSL }) {
  const isLong = position.side === "Buy";
  const entryPrice = parseFloat(position.entryPrice || position.entry_price);
  const markPrice = livePrice > 0 ? livePrice : parseFloat(position.currentPrice || position.mark_price);
  const size = parseFloat(position.qty || position.size);
  const leverage = position.leverage || 1;
  const marginUsed = parseFloat(position.marginUsed || 0);

  let pnl = 0;
  if (isLong) {
    pnl = (markPrice - entryPrice) * size;
  } else {
    pnl = (entryPrice - markPrice) * size;
  }

  // Calculate liquidation price
  // For LONG: liqPrice = entryPrice * (1 - 1/leverage * 0.9)
  // For SHORT: liqPrice = entryPrice * (1 + 1/leverage * 0.9)
  // Using 90% of margin to account for fees and maintenance margin
  let liqPrice = 0;
  if (leverage > 0) {
    const liqPercentage = (1 / leverage) * 0.9;
    if (isLong) {
      liqPrice = entryPrice * (1 - liqPercentage);
    } else {
      liqPrice = entryPrice * (1 + liqPercentage);
    }
  }

  // Calculate PnL percentage based on entry price (price change %)
  // This shows the actual price movement percentage
  let pnlPercentage = 0;
  if (entryPrice > 0) {
    if (isLong) {
      pnlPercentage = ((markPrice - entryPrice) / entryPrice) * 100;
    } else {
      pnlPercentage = ((entryPrice - markPrice) / entryPrice) * 100;
    }
  }

  const formatPrice = (price) => {
    if (!price || isNaN(price)) return "$0.00";
    if (price >= 1000) return `$${numeral(price).format("0,0.00")}`;
    if (price >= 1) return `$${numeral(price).format("0,0.0000")}`;
    return `$${numeral(price).format("0,0.000000")}`;
  };

  return (
    <tr className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
      <td className="py-3 px-4">
        <span className="text-white font-medium">{position.symbol}</span>
      </td>
      <td className="py-3 px-2">
        <span
          className={clsx(
            "font-semibold text-xs",
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
        {formatPrice(entryPrice)}
      </td>
      <td className="py-3 px-3 text-right text-white tabular-nums">
        {formatPrice(markPrice)}
      </td>
      <td className="py-3 px-2 text-center">
        <span className="text-cyan-400 font-medium tabular-nums">{leverage}x</span>
      </td>
      <td className="py-3 px-2 text-right text-white tabular-nums">
        ${numeral(marginUsed).format("0,0.00")}
      </td>
      <td className="py-3 px-2 text-right tabular-nums">
        <span className="text-red-400 font-medium">
          {formatPrice(liqPrice)}
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
            {pnl >= 0 ? "+" : ""}${numeral(Math.abs(pnl)).format("0,0.00")}
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
      <td className="py-3 px-4">
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1 text-xs font-medium bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 whitespace-nowrap"
          >
            Close
          </button>
          <button
            onClick={onEditTPSL}
            className="px-3 py-1 text-xs font-medium bg-gray-700 text-gray-300 rounded hover:bg-gray-600 whitespace-nowrap"
          >
            TP/SL
          </button>
        </div>
      </td>
    </tr>
  );
}

function TPSLModal({ position, onClose, onSave }) {
  const tickers = useMarketStore((state) => state.tickers);
  const entryPrice = parseFloat(position.entryPrice || position.entry_price);
  const size = parseFloat(position.qty || position.size);
  const isLong = position.side === "Buy";
  const currentPrice = parseFloat(tickers[position.symbol]?.last_price) || entryPrice;

  const [tpPrice, setTpPrice] = useState(position.take_profit || "");
  const [slPrice, setSlPrice] = useState(position.stop_loss || "");
  const [tpRoi, setTpRoi] = useState("");
  const [slRoi, setSlRoi] = useState("");
  const [loading, setLoading] = useState(false);

  // Calculate TP price from ROI
  const calculateTPFromROI = (roi) => {
    if (!roi || isNaN(roi)) return "";
    const roiDecimal = parseFloat(roi) / 100;
    if (isLong) {
      return (entryPrice * (1 + roiDecimal)).toFixed(2);
    } else {
      return (entryPrice * (1 - roiDecimal)).toFixed(2);
    }
  };

  // Calculate SL price from ROI
  const calculateSLFromROI = (roi) => {
    if (!roi || isNaN(roi)) return "";
    const roiDecimal = Math.abs(parseFloat(roi)) / 100;
    if (isLong) {
      return (entryPrice * (1 - roiDecimal)).toFixed(2);
    } else {
      return (entryPrice * (1 + roiDecimal)).toFixed(2);
    }
  };

  // Calculate ROI from price
  const calculateROI = (price, isTP) => {
    if (!price || isNaN(price)) return 0;
    const priceNum = parseFloat(price);
    if (isLong) {
      return ((priceNum - entryPrice) / entryPrice * 100);
    } else {
      return ((entryPrice - priceNum) / entryPrice * 100);
    }
  };

  // Calculate estimated PnL
  const calculatePnL = (price) => {
    if (!price || isNaN(price)) return 0;
    const priceNum = parseFloat(price);
    if (isLong) {
      return (priceNum - entryPrice) * size;
    } else {
      return (entryPrice - priceNum) * size;
    }
  };

  const tpPnL = calculatePnL(tpPrice);
  const slPnL = calculatePnL(slPrice);
  const tpRoiCalc = calculateROI(tpPrice, true);
  const slRoiCalc = calculateROI(slPrice, false);

  const handleTPRoiChange = (roi) => {
    setTpRoi(roi);
    const price = calculateTPFromROI(roi);
    setTpPrice(price);
  };

  const handleSLRoiChange = (roi) => {
    setSlRoi(roi);
    const price = calculateSLFromROI(roi);
    setSlPrice(price);
  };

  const handleSave = async () => {
    setLoading(true);
    await onSave(position.id, {
      take_profit: tpPrice ? parseFloat(tpPrice) : null,
      stop_loss: slPrice ? parseFloat(slPrice) : null,
    });
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1d21] rounded-lg w-full max-w-2xl border border-gray-700 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-700 sticky top-0 bg-[#1a1d21]">
          <h3 className="text-lg font-semibold text-white">Set TP/SL - {position.symbol}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Position Info */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-[#0b0e11] rounded-lg">
            <div>
              <p className="text-xs text-gray-500 mb-1">Entry Price</p>
              <p className="text-white font-medium">${numeral(entryPrice).format("0,0.00")}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Size</p>
              <p className="text-white font-medium">{numeral(size).format("0,0.0000")}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Side</p>
              <p className={clsx("font-medium", isLong ? "text-green-400" : "text-red-400")}>
                {isLong ? "LONG" : "SHORT"}
              </p>
            </div>
          </div>

          {/* Take Profit Section */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300">Take Profit (by ROI)</label>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="number"
                  step="any"
                  value={tpPrice}
                  onChange={(e) => setTpPrice(e.target.value)}
                  placeholder="TP Price"
                  className="w-full bg-[#0b0e11] border border-gray-700 rounded-lg px-4 py-3 text-white text-lg font-medium focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  value={tpRoi}
                  onChange={(e) => handleTPRoiChange(e.target.value)}
                  placeholder="ROI %"
                  className="flex-1 bg-[#0b0e11] border border-gray-700 rounded-lg px-4 py-3 text-white text-lg font-medium focus:border-cyan-500 focus:outline-none"
                />
                <span className="text-gray-400 text-lg">%</span>
              </div>
            </div>

            {/* TP Slider */}
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="150"
                step="0.1"
                value={tpRoiCalc > 0 ? Math.min(tpRoiCalc, 150) : 0}
                onChange={(e) => handleTPRoiChange(e.target.value)}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-tp"
                style={{
                  background: `linear-gradient(to right, #22c55e 0%, #22c55e ${Math.min((tpRoiCalc / 150) * 100, 100)}%, #374151 ${Math.min((tpRoiCalc / 150) * 100, 100)}%, #374151 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>0</span>
                <span>150%</span>
              </div>
            </div>

            {/* TP Info */}
            {tpPrice && (
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-xs text-gray-400">
                  When price reaches <span className="text-white font-medium">${numeral(parseFloat(tpPrice)).format("0,0.00")}</span>, 
                  Take Profit will trigger. Estimated P&L: 
                  <span className="text-green-400 font-medium"> +${numeral(Math.abs(tpPnL)).format("0,0.00")}</span>
                  <span className="text-green-400"> (ROI: {tpRoiCalc.toFixed(2)}%)</span>
                </p>
              </div>
            )}
          </div>

          {/* Stop Loss Section */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300">Stop Loss (by ROI)</label>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="number"
                  step="any"
                  value={slPrice}
                  onChange={(e) => setSlPrice(e.target.value)}
                  placeholder="SL Price"
                  className="w-full bg-[#0b0e11] border border-gray-700 rounded-lg px-4 py-3 text-white text-lg font-medium focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  value={slRoi}
                  onChange={(e) => handleSLRoiChange(e.target.value)}
                  placeholder="ROI %"
                  className="flex-1 bg-[#0b0e11] border border-gray-700 rounded-lg px-4 py-3 text-white text-lg font-medium focus:border-cyan-500 focus:outline-none"
                />
                <span className="text-gray-400 text-lg">%</span>
              </div>
            </div>

            {/* SL Slider */}
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="75"
                step="0.1"
                value={slRoiCalc < 0 ? Math.min(Math.abs(slRoiCalc), 75) : 0}
                onChange={(e) => handleSLRoiChange(-e.target.value)}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-sl"
                style={{
                  background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${Math.min((Math.abs(slRoiCalc) / 75) * 100, 100)}%, #374151 ${Math.min((Math.abs(slRoiCalc) / 75) * 100, 100)}%, #374151 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>0</span>
                <span>75%</span>
              </div>
            </div>

            {/* SL Info */}
            {slPrice && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-xs text-gray-400">
                  When price reaches <span className="text-white font-medium">${numeral(parseFloat(slPrice)).format("0,0.00")}</span>, 
                  Stop Loss will trigger. Estimated P&L: 
                  <span className="text-red-400 font-medium"> ${numeral(slPnL).format("0,0.00")}</span>
                  <span className="text-red-400"> (ROI: {slRoiCalc.toFixed(2)}%)</span>
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 flex gap-3 border-t border-gray-700 sticky bottom-0 bg-[#1a1d21]">
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 disabled:opacity-50 font-medium transition-colors"
          >
            {loading ? "Saving..." : "Confirm"}
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function OrdersTable({ orders, loading }) {
  const { cancelOrder } = useTradingStore();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="py-6 text-center">
        <p className="text-sm text-gray-500">No open orders</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm table-fixed">
        <colgroup>
          <col className="w-32" />
          <col className="w-24" />
          <col className="w-20" />
          <col className="w-32" />
          <col className="w-28" />
          <col className="w-28" />
        </colgroup>
        <thead>
          <tr className="text-gray-400 text-xs border-b border-gray-800">
            <th className="text-left py-3 px-4 font-medium">Symbol</th>
            <th className="text-left py-3 px-2 font-medium">Type</th>
            <th className="text-left py-3 px-2 font-medium">Side</th>
            <th className="text-right py-3 px-2 font-medium">Price</th>
            <th className="text-right py-3 px-2 font-medium">Qty</th>
            <th className="text-center py-3 px-4 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
              <td className="py-3 px-4 text-white font-medium">{order.symbol}</td>
              <td className="py-3 px-2 text-white">{order.order_type || order.type}</td>
              <td className="py-3 px-2">
                <span
                  className={clsx(
                    "text-xs font-semibold",
                    order.side === "Buy" ? "text-green-400" : "text-red-400",
                  )}
                >
                  {order.side === "Buy" ? "BUY" : "SELL"}
                </span>
              </td>
              <td className="py-3 px-2 text-right text-white tabular-nums">
                {formatPrice(parseFloat(order.price))}
              </td>
              <td className="py-3 px-2 text-right text-white tabular-nums">
                {numeral(order.qty).format("0,0.0000")}
              </td>
              <td className="py-3 px-4 text-center">
                <button
                  onClick={() => cancelOrder(order.id)}
                  className="px-3 py-1 text-xs bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 whitespace-nowrap"
                >
                  Cancel
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
