/**
 * OrderBook Component
 * Displays real-time order book with bids and asks
 */

import { useMemo } from "react";
import useMarketStore from "../../stores/marketStore";
import clsx from "clsx";
import numeral from "numeral";

export default function OrderBook({
  onPriceClick,
  className,
  compact = false,
}) {
  const { orderbook, currentSymbol } = useMarketStore();
  const spread = useMarketStore((state) => state.getSpread());

  // Process orderbook data - show fewer rows in compact mode
  const { asks, bids, maxQty } = useMemo(() => {
    const rowCount = compact ? 10 : 15;
    const askEntries = (orderbook.asks || []).slice(0, rowCount);
    const bidEntries = (orderbook.bids || []).slice(0, rowCount);

    // Calculate max quantity for depth visualization
    const allQtys = [...askEntries, ...bidEntries].map(([_, qty]) =>
      parseFloat(qty),
    );
    const maxQty = Math.max(...allQtys, 0);

    return {
      asks: askEntries.reverse(), // Reverse so lowest ask is at bottom
      bids: bidEntries,
      maxQty,
    };
  }, [orderbook, compact]);

  const formatPrice = (price) => {
    const p = parseFloat(price);
    if (p >= 1000) return numeral(p).format("0,0.00");
    if (p >= 1) return numeral(p).format("0,0.0000");
    return numeral(p).format("0.00000000");
  };

  const formatQty = (qty) => {
    const q = parseFloat(qty);
    if (compact) return numeral(q).format("0.00");
    if (q >= 1000) return numeral(q).format("0,0.00");
    return numeral(q).format("0.0000");
  };

  return (
    <div
      className={clsx("flex flex-col bg-[#0b0e11] overflow-hidden", className)}
    >
      {/* Header */}
      <div
        className={clsx(
          "px-3 border-b border-gray-800",
          compact ? "py-1.5" : "py-2",
        )}
      >
        <h3
          className={clsx(
            "font-medium text-white",
            compact ? "text-xs" : "text-sm",
          )}
        >
          Order Book
        </h3>
      </div>

      {/* Column headers */}
      <div
        className={clsx(
          "grid text-gray-500 px-2 py-1 border-b border-gray-800",
          compact ? "grid-cols-2 text-[10px]" : "grid-cols-3 text-xs px-3",
        )}
      >
        <span>Price</span>
        <span className="text-right">Size</span>
        {!compact && <span className="text-right">Total</span>}
      </div>

      {/* Asks (sells) - red */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-px">
          {asks.map(([price, qty], index) => {
            const cumulative = asks
              .slice(index)
              .reduce((sum, [_, q]) => sum + parseFloat(q), 0);
            const depthPercent = (parseFloat(qty) / maxQty) * 100;

            return (
              <OrderBookRow
                key={`ask-${price}`}
                price={price}
                qty={qty}
                cumulative={cumulative}
                depthPercent={depthPercent}
                side="ask"
                onClick={() => onPriceClick?.(price)}
                formatPrice={formatPrice}
                formatQty={formatQty}
                compact={compact}
              />
            );
          })}
        </div>

        {/* Spread / Current Price - Bybit style */}
        <div
          className={clsx(
            "border-y border-gray-800 bg-[#181a20]",
            compact ? "px-2 py-1" : "px-3 py-2",
          )}
        >
          <div className="flex items-center justify-between">
            {/* Current price with direction indicator */}
            <div className="flex items-center gap-1">
              {(() => {
                const lastAsk =
                  asks.length > 0 ? parseFloat(asks[asks.length - 1]?.[0]) : 0;
                const lastBid = bids.length > 0 ? parseFloat(bids[0]?.[0]) : 0;
                const midPrice =
                  lastAsk && lastBid ? (lastAsk + lastBid) / 2 : 0;
                const isUp = spread?.absolute >= 0;
                return (
                  <>
                    <span
                      className={clsx(
                        "font-bold",
                        compact ? "text-sm" : "text-lg",
                        isUp ? "text-green-400" : "text-red-400",
                      )}
                    >
                      {midPrice ? formatPrice(midPrice) : "--"}
                    </span>
                    {!compact && (
                      <span
                        className={clsx(
                          "text-xs px-1.5 py-0.5 rounded",
                          isUp
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400",
                        )}
                      >
                        {isUp ? "▲" : "▼"}
                      </span>
                    )}
                  </>
                );
              })()}
            </div>
            {/* Spread */}
            {!compact && (
              <span className="text-xs text-gray-500 font-mono">
                {spread ? `${spread.percentage.toFixed(3)}%` : "--"}
              </span>
            )}
          </div>
        </div>

        {/* Bids (buys) - green */}
        <div className="space-y-px">
          {bids.map(([price, qty], index) => {
            const cumulative = bids
              .slice(0, index + 1)
              .reduce((sum, [_, q]) => sum + parseFloat(q), 0);
            const depthPercent = (parseFloat(qty) / maxQty) * 100;

            return (
              <OrderBookRow
                key={`bid-${price}`}
                price={price}
                qty={qty}
                cumulative={cumulative}
                depthPercent={depthPercent}
                side="bid"
                onClick={() => onPriceClick?.(price)}
                formatPrice={formatPrice}
                formatQty={formatQty}
                compact={compact}
              />
            );
          })}
        </div>
      </div>

      {/* Empty state */}
      {asks.length === 0 && bids.length === 0 && (
        <div className="flex-1 flex items-center justify-center py-8">
          <p className="text-gray-500 text-sm">Waiting for orderbook data...</p>
        </div>
      )}
    </div>
  );
}

function OrderBookRow({
  price,
  qty,
  cumulative,
  depthPercent,
  side,
  onClick,
  formatPrice,
  formatQty,
  compact = false,
}) {
  const isAsk = side === "ask";

  return (
    <div
      className={clsx(
        "relative grid cursor-pointer hover:bg-gray-700/30 transition-colors",
        compact
          ? "grid-cols-2 px-2 text-[13px] py-0.5"
          : "grid-cols-3 px-3 text-xs py-0.5",
      )}
      onClick={onClick}
    >
      {/* Depth visualization bar */}
      <div
        className={clsx(
          "absolute top-0 bottom-0 right-0 opacity-20",
          isAsk ? "bg-red-500" : "bg-green-500",
        )}
        style={{ width: `${Math.min(depthPercent, 100)}%` }}
      />

      {/* Price */}
      <span
        className={clsx(
          "relative font-mono truncate",
          isAsk ? "text-red-400" : "text-green-400",
        )}
      >
        {formatPrice(price)}
      </span>

      {/* Size */}
      <span className="relative text-right font-mono text-gray-300 truncate">
        {formatQty(qty)}
      </span>

      {/* Cumulative total - hidden in compact mode */}
      {!compact && (
        <span className="relative text-right font-mono text-gray-500 truncate">
          {formatQty(cumulative)}
        </span>
      )}
    </div>
  );
}

/**
 * Mini OrderBook for compact display
 */
export function MiniOrderBook({ onPriceClick }) {
  const { orderbook } = useMarketStore();

  const bestBid = orderbook.bids[0];
  const bestAsk = orderbook.asks[0];

  return (
    <div className="bg-[#181a20] rounded p-3">
      <div className="text-xs text-gray-500 mb-2">Best Prices</div>
      <div className="space-y-1">
        <div
          className="flex justify-between cursor-pointer hover:bg-gray-700/30 p-1 rounded"
          onClick={() => bestAsk && onPriceClick?.(bestAsk[0])}
        >
          <span className="text-gray-400 text-xs">Ask</span>
          <span className="font-mono text-red-400 text-sm">
            {bestAsk ? numeral(bestAsk[0]).format("0,0.00") : "--"}
          </span>
        </div>
        <div
          className="flex justify-between cursor-pointer hover:bg-gray-700/50 p-1 rounded"
          onClick={() => bestBid && onPriceClick?.(bestBid[0])}
        >
          <span className="text-gray-400 text-xs">Bid</span>
          <span className="font-mono text-green-400 text-sm">
            {bestBid ? numeral(bestBid[0]).format("0,0.00") : "--"}
          </span>
        </div>
      </div>
    </div>
  );
}
