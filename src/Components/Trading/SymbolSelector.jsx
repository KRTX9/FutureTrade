/**
 * SymbolSelector Component
 * Dropdown to select trading pair with market data
 */

import { useState, useRef, useEffect } from "react";
import useMarketStore from "../../stores/marketStore";
import {
  ChevronDown,
  Search,
  Star,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import clsx from "clsx";
import numeral from "numeral";

// Smart price formatter based on price magnitude
const formatPrice = (price) => {
  if (!price || isNaN(price)) return "0.0000";
  const p = parseFloat(price);
  if (p >= 1000) return numeral(p).format("0,0.00");
  if (p >= 1) return numeral(p).format("0,0.0000");
  return numeral(p).format("0.000000");
};

const CATEGORIES = [
  { id: "linear", label: "USDT Perp" },
  { id: "inverse", label: "Inverse" },
];

export default function SymbolSelector({ className }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("linear");
  const dropdownRef = useRef(null);

  const {
    currentSymbol,
    currentCategory,
    tickers,
    setCurrentSymbol,
    setCurrentCategory,
  } = useMarketStore();

  const currentTicker = tickers[currentSymbol] || {};

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter tickers
  const filteredSymbols = Object.entries(tickers)
    .filter(([symbol, data]) => {
      if (search && !symbol.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      // In real app, filter by category
      return true;
    })
    .sort((a, b) => a[0].localeCompare(b[0]));

  const handleSelect = (symbol) => {
    setCurrentSymbol(symbol);
    setIsOpen(false);
    setSearch("");
  };

  const priceChange = parseFloat(currentTicker.price_24h_change_pct || 0);
  const isPositive = priceChange >= 0;

  return (
    <div className={clsx("relative", className)} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        className={clsx(
          "flex items-center gap-2 px-2 py-1 rounded",
          "hover:bg-gray-700/50 transition-colors",
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex flex-col items-start min-w-[80px]">
          <span className="font-bold text-white text-base leading-tight">
            {currentSymbol}
          </span>
          <span className="text-[10px] text-gray-500 leading-tight">
            {currentCategory === "linear" ? "USDT Perpetual" : "Inverse"}
          </span>
        </div>

        <div className="flex flex-col items-end min-w-[70px]">
          <span className="text-white font-medium text-sm leading-tight tabular-nums">
            {formatPrice(currentTicker.last_price)}
          </span>
          <span
            className={clsx(
              "text-[10px] flex items-center gap-0.5 leading-tight",
              isPositive ? "text-green-400" : "text-red-400",
            )}
          >
            {isPositive ? (
              <TrendingUp className="w-2.5 h-2.5" />
            ) : (
              <TrendingDown className="w-2.5 h-2.5" />
            )}
            {isPositive ? "+" : ""}
            {priceChange.toFixed(2)}%
          </span>
        </div>

        <ChevronDown
          className={clsx(
            "w-4 h-4 text-gray-400 transition-transform",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className={clsx(
            "absolute top-full left-0 mt-2 z-50",
            "w-96 bg-[#1e2026] rounded-lg border border-gray-700",
            "shadow-xl",
          )}
        >
          {/* Search */}
          <div className="p-3 border-b border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search symbol..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={clsx(
                  "w-full pl-10 pr-4 py-2 rounded-lg",
                  "bg-gray-900 border border-gray-700",
                  "text-white placeholder-gray-500",
                  "focus:border-yellow-500 focus:outline-none",
                )}
                autoFocus
              />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex border-b border-gray-700">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                className={clsx(
                  "flex-1 py-2 text-sm transition-colors",
                  category === cat.id
                    ? "text-yellow-500 border-b-2 border-yellow-500"
                    : "text-gray-400 hover:text-white",
                )}
                onClick={() => setCategory(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Symbols List */}
          <div className="max-h-80 overflow-y-auto">
            {/* Header */}
            <div className="grid grid-cols-4 gap-2 px-4 py-2 text-xs text-gray-500 border-b border-gray-700">
              <div>Symbol</div>
              <div className="text-right">Price</div>
              <div className="text-right">24h Change</div>
              <div className="text-right">Volume</div>
            </div>

            {/* Items */}
            {filteredSymbols.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                No symbols found
              </div>
            ) : (
              filteredSymbols.map(([symbol, data]) => {
                const change = parseFloat(data.price_24h_change_pct || 0);
                const isUp = change >= 0;

                return (
                  <button
                    key={symbol}
                    className={clsx(
                      "w-full grid grid-cols-4 gap-2 px-4 py-2 text-sm",
                      "hover:bg-gray-700/50 transition-colors",
                      symbol === currentSymbol && "bg-gray-700/30",
                    )}
                    onClick={() => handleSelect(symbol)}
                  >
                    <div className="text-left font-medium text-white">
                      {symbol}
                    </div>
                    <div className="text-right text-white tabular-nums">
                      {formatPrice(data.last_price)}
                    </div>
                    <div
                      className={clsx(
                        "text-right",
                        isUp ? "text-green-400" : "text-red-400",
                      )}
                    >
                      {isUp ? "+" : ""}
                      {change.toFixed(2)}%
                    </div>
                    <div className="text-right text-gray-400">
                      {numeral(data.volume_24h).format("0.0a")}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Compact Ticker Display - Bybit Style
 */
export function TickerBar({ className }) {
  const { currentSymbol, tickers } = useMarketStore();
  const ticker = tickers[currentSymbol] || {};
  const priceChange = parseFloat(ticker.price_24h_change_pct || 0);
  const isPositive = priceChange >= 0;

  const stats = [
    {
      label: "Mark Price",
      value: formatPrice(ticker.mark_price),
      highlight: true,
      width: "w-[110px]",
    },
    {
      label: "Index Price",
      value: formatPrice(ticker.index_price),
      width: "w-[110px]",
    },
    {
      label: "24h Change",
      value: `${isPositive ? "+" : ""}${priceChange.toFixed(2)}%`,
      color: isPositive ? "text-green-400" : "text-red-400",
      width: "w-[90px]",
    },
    {
      label: "24h High",
      value: formatPrice(ticker.high_24h),
      width: "w-[110px]",
    },
    {
      label: "24h Low",
      value: formatPrice(ticker.low_24h),
      width: "w-[110px]",
    },
    {
      label: "24h Volume",
      value: numeral(ticker.volume_24h).format("0.00a").toUpperCase(),
      width: "w-[90px]",
    },
    {
      label: "Open Interest",
      value: numeral(ticker.open_interest).format("0.00a").toUpperCase(),
      width: "w-[90px]",
    },
    {
      label: "Funding Rate",
      value: `${(parseFloat(ticker.funding_rate || 0) * 100).toFixed(4)}%`,
      color:
        parseFloat(ticker.funding_rate || 0) >= 0
          ? "text-green-400"
          : "text-red-400",
      width: "w-[90px]",
    },
  ];

  return (
    <div
      className={clsx(
        "flex items-center gap-5 px-2 overflow-x-auto scrollbar-none",
        className,
      )}
    >
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className={clsx(
            "flex flex-col",
            stat.width,
            index > 0 && "border-l border-gray-700 pl-5",
          )}
        >
          <span className="text-[11px] text-gray-400 whitespace-nowrap leading-tight">
            {stat.label}
          </span>
          <span
            className={clsx(
              "text-sm font-semibold whitespace-nowrap tabular-nums",
              stat.color || "text-white",
            )}
          >
            {stat.value}
          </span>
        </div>
      ))}
    </div>
  );
}
