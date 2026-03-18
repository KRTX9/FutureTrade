/**
 * Futures Trading Page
 * Main trading interface combining all trading components
 */

import { useEffect, useRef, useState } from "react";
import TradingLayout from "../Components/Layout/TradingLayout";
import SymbolSelector, {
  TickerBar,
} from "../Components/Trading/SymbolSelector";
import TradingViewChart from "../Components/Trading/TradingViewChart";
import OrderBook from "../Components/Trading/OrderBook";
import OrderForm from "../Components/Trading/OrderForm";
import AccountPanel from "../Components/Trading/AccountPanel";
import PositionsPanel from "../Components/Trading/PositionsPanel";
import useMarketStore from "../stores/marketStore";
import useTradingStore from "../stores/tradingStore";
import wsService from "../services/websocket";
import clsx from "clsx";

// Popular trading symbols to show in selector
const POPULAR_SYMBOLS = [
  "BTCUSDT",
  "ETHUSDT",
  "SOLUSDT",
  "XRPUSDT",
  "DOGEUSDT",
  "ADAUSDT",
  "AVAXUSDT",
  "DOTUSDT",
  "LINKUSDT",
  "MATICUSDT",
];

export default function FuturesTrading() {
  const {
    setTicker,
    currentSymbol,
    setCurrentSymbol,
    fetchKlines,
    fetchOrderbook,
    fetchTicker,
    setOrderbook,
    updateOrderbook,
    addKline,
    addTrade,
    setWsConnected,
    klineInterval,
    tickers,
  } = useMarketStore();
  const {
    fetchPositions,
    fetchOrders,
    positions,
    closePosition,
    openOrders,
    executeLimitOrder,
  } = useTradingStore();
  const prevSymbolRef = useRef(null);
  const tickerSubsRef = useRef(new Set());
  const tpslCheckRef = useRef(new Set()); // Track which positions had TP/SL/Liq triggered
  const limitOrderCheckRef = useRef(new Set()); // Track which limit orders have been triggered

  // Check Limit Order execution conditions when tickers update
  useEffect(() => {
    if (openOrders.length === 0) return;

    openOrders.forEach((order) => {
      // Skip if already triggered or not a limit order
      if (limitOrderCheckRef.current.has(order.id)) return;
      if (order.order_type !== "Limit") return;
      if (!["New", "PartiallyFilled"].includes(order.status)) return;

      const ticker = tickers[order.symbol];
      if (!ticker?.last_price) return;

      const currentPrice = parseFloat(ticker.last_price);
      const limitPrice = parseFloat(order.price);
      const isBuy = order.side === "Buy";
      let shouldExecute = false;

      if (isBuy && currentPrice <= limitPrice) {
        shouldExecute = true;
      } else if (!isBuy && currentPrice >= limitPrice) {
        shouldExecute = true;
      }

      if (shouldExecute) {
        limitOrderCheckRef.current.add(order.id);
        console.log(
          `Limit order triggered: ${order.side} ${order.symbol} @ ${limitPrice} (market: ${currentPrice})`,
        );

        // Show notification
        import("react-hot-toast").then(({ default: toast }) => {
          toast.success(
            `${order.side} Limit order filled! ${order.symbol} @ $${limitPrice.toFixed(2)}`,
          );
        });

        // Execute the limit order
        executeLimitOrder(order.id, currentPrice).then((result) => {
          if (!result.success) {
            // Remove from triggered set so it can retry
            limitOrderCheckRef.current.delete(order.id);
            import("react-hot-toast").then(({ default: toast }) => {
              toast.error(`Failed to fill limit order: ${result.error}`);
            });
          }
        });
      }
    });
  }, [openOrders, tickers, executeLimitOrder]);

  // Check TP/SL and Liquidation triggers when tickers update
  useEffect(() => {
    if (positions.length === 0) return;

    positions.forEach((position) => {
      // Skip if already triggered
      if (tpslCheckRef.current.has(position.id)) return;

      const ticker = tickers[position.symbol];
      if (!ticker?.last_price) return;

      const currentPrice = parseFloat(ticker.last_price);
      const tp = position.take_profit ? parseFloat(position.take_profit) : null;
      const sl = position.stop_loss ? parseFloat(position.stop_loss) : null;
      const liqPrice = position.liq_price
        ? parseFloat(position.liq_price)
        : null;
      const isLong = position.side === "Buy";

      let triggered = false;
      let triggerType = "";

      if (isLong) {
        // LONG: Liquidation when price <= liq_price (checked first - highest priority)
        if (liqPrice && liqPrice > 0 && currentPrice <= liqPrice) {
          triggered = true;
          triggerType = "Liquidation";
        }
        // LONG: TP triggers when price >= TP, SL triggers when price <= SL
        else if (tp && currentPrice >= tp) {
          triggered = true;
          triggerType = "Take Profit";
        } else if (sl && currentPrice <= sl) {
          triggered = true;
          triggerType = "Stop Loss";
        }
      } else {
        // SHORT: Liquidation when price >= liq_price (checked first - highest priority)
        if (liqPrice && liqPrice > 0 && currentPrice >= liqPrice) {
          triggered = true;
          triggerType = "Liquidation";
        }
        // SHORT: TP triggers when price <= TP, SL triggers when price >= SL
        else if (tp && currentPrice <= tp) {
          triggered = true;
          triggerType = "Take Profit";
        } else if (sl && currentPrice >= sl) {
          triggered = true;
          triggerType = "Stop Loss";
        }
      }

      if (triggered) {
        tpslCheckRef.current.add(position.id);
        console.log(
          `${triggerType} triggered for ${position.symbol} at ${currentPrice}`,
        );

        // Show notification - different style for liquidation
        import("react-hot-toast").then(({ default: toast }) => {
          if (triggerType === "Liquidation") {
            toast.error(
              `⚠️ LIQUIDATED! ${position.symbol} position closed at $${currentPrice.toFixed(2)}`,
              { duration: 5000 },
            );
          } else {
            toast.success(
              `${triggerType} hit! Closing ${position.symbol} position at $${currentPrice.toFixed(2)}`,
            );
          }
        });

        // Close the position - pass the current price to avoid backend API call
        closePosition(position.id, { price: currentPrice })
          .then(() => {
            // Remove from triggered set after position is closed
            setTimeout(() => {
              tpslCheckRef.current.delete(position.id);
            }, 5000);
          })
          .catch(() => {
            // On failure, keep the position in triggered set longer to prevent spam
            setTimeout(() => {
              tpslCheckRef.current.delete(position.id);
            }, 30000); // Wait 30 seconds before retrying
          });
      }
    });
  }, [positions, tickers]);

  // Initialize WebSocket connection
  useEffect(() => {
    const symbol = currentSymbol || "BTCUSDT";

    // Set up WebSocket callbacks
    wsService.setCallbacks({
      onConnect: () => {
        setWsConnected(true);
        // Subscribe to all popular tickers for selector display
        POPULAR_SYMBOLS.forEach((sym) => {
          if (!tickerSubsRef.current.has(sym)) {
            wsService.subscribeTicker(sym);
            tickerSubsRef.current.add(sym);
          }
        });
      },
      onDisconnect: () => {
        setWsConnected(false);
      },
      onTicker: (data) => {
        if (data) {
          // Only update fields that are present and not empty
          const tickerUpdate = {};
          if (data.lastPrice) tickerUpdate.last_price = data.lastPrice;
          if (data.markPrice) tickerUpdate.mark_price = data.markPrice;
          if (data.indexPrice) tickerUpdate.index_price = data.indexPrice;
          if (data.bid1Price) tickerUpdate.bid1_price = data.bid1Price;
          if (data.ask1Price) tickerUpdate.ask1_price = data.ask1Price;
          if (data.highPrice24h) tickerUpdate.high_24h = data.highPrice24h;
          if (data.lowPrice24h) tickerUpdate.low_24h = data.lowPrice24h;
          if (data.volume24h) tickerUpdate.volume_24h = data.volume24h;
          if (data.price24hPcnt)
            tickerUpdate.price_24h_change_pct = data.price24hPcnt;
          if (data.openInterest) tickerUpdate.open_interest = data.openInterest;
          if (data.fundingRate) tickerUpdate.funding_rate = data.fundingRate;

          if (Object.keys(tickerUpdate).length > 0) {
            setTicker(data.symbol, tickerUpdate);
          }
        }
      },
      onOrderbook: (data) => {
        if (data.type === "snapshot") {
          setOrderbook({
            bids: data.data?.b || [],
            asks: data.data?.a || [],
          });
        } else if (data.type === "delta") {
          updateOrderbook({
            type: "delta",
            bids: data.data?.b || [],
            asks: data.data?.a || [],
          });
        }
      },
      onKline: (data) => {
        if (data && data.length > 0) {
          const k = data[0];
          addKline({
            time: Math.floor(parseInt(k.start) / 1000),
            open: k.open,
            high: k.high,
            low: k.low,
            close: k.close,
            volume: k.volume,
          });
        }
      },
      onTrade: (data) => {
        if (data && data.length > 0) {
          data.forEach((t) => {
            addTrade({
              price: t.p,
              qty: t.v,
              side: t.S,
              time: t.T,
            });
          });
        }
      },
    });

    // Connect to WebSocket (singleton - stays connected across navigations)
    wsService.connect();

    // No cleanup - WebSocket should stay connected for the app lifetime
  }, []);

  // Handle symbol changes - subscribe/resubscribe to symbol data
  useEffect(() => {
    if (!currentSymbol) return;

    const subscribeToSymbol = () => {
      if (!wsService.isConnected()) return;

      // Unsubscribe from old symbol's orderbook and klines only
      // Keep ticker subscriptions active for all symbols (needed for positions)
      if (prevSymbolRef.current && prevSymbolRef.current !== currentSymbol) {
        wsService.unsubscribe(`orderbook.50.${prevSymbolRef.current}`);
        wsService.unsubscribe(
          `kline.${klineInterval}.${prevSymbolRef.current}`,
        );
      }

      // Subscribe to current symbol
      wsService.subscribeTicker(currentSymbol);
      wsService.subscribeOrderbook(currentSymbol, 50);
      wsService.subscribeKline(currentSymbol, klineInterval);
      prevSymbolRef.current = currentSymbol;
    };

    // Subscribe immediately if connected, otherwise wait for connection
    if (wsService.isConnected()) {
      subscribeToSymbol();
    } else {
      // Wait a bit for WebSocket to connect
      const checkInterval = setInterval(() => {
        if (wsService.isConnected()) {
          subscribeToSymbol();
          clearInterval(checkInterval);
        }
      }, 500);

      // Cleanup interval after 10 seconds
      setTimeout(() => clearInterval(checkInterval), 10000);
      return () => clearInterval(checkInterval);
    }
  }, [currentSymbol, klineInterval]);

  // Initialize data on mount
  useEffect(() => {
    // Fetch positions and orders
    fetchPositions();
    fetchOrders();

    // Fetch available trading pairs
    loadTradingPairs();

    // Load initial chart data (REST API for historical data)
    const symbol = currentSymbol || "BTCUSDT";
    fetchKlines(symbol, klineInterval);
    fetchOrderbook(symbol);

    // Fetch ticker data for all popular symbols
    POPULAR_SYMBOLS.forEach((sym) => {
      fetchTicker(sym);
    });
  }, []);

  // Subscribe to WebSocket ticker updates for all position symbols
  useEffect(() => {
    if (!wsService.isConnected() || positions.length === 0) return;

    // Subscribe to ticker for each position's symbol (if not already subscribed)
    positions.forEach((position) => {
      if (!tickerSubsRef.current.has(position.symbol)) {
        wsService.subscribeTicker(position.symbol);
        tickerSubsRef.current.add(position.symbol);
      }
    });
  }, [positions]);

  // Refetch when symbol changes
  useEffect(() => {
    if (currentSymbol) {
      fetchKlines(currentSymbol, klineInterval);
      fetchOrderbook(currentSymbol);
      fetchTicker(currentSymbol);
    }
  }, [currentSymbol]);

  async function loadTradingPairs() {
    try {
      // Since we're frontend-only, we don't fetch from backend
      // Just set default symbol if not set
      if (!currentSymbol) {
        setCurrentSymbol("BTCUSDT");
      }
    } catch (error) {
      console.error("Failed to load trading pairs:", error);
      // Set default symbol on error
      if (!currentSymbol) setCurrentSymbol("BTCUSDT");
    }
  }

  // Refresh positions periodically (only when not using WebSocket for real-time updates)
  // Reduced frequency since WebSocket provides real-time price updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchPositions({}, { silent: true });
    }, 60000); // Every 60 seconds (reduced from 30s)

    return () => clearInterval(interval);
  }, [fetchPositions]);

  return (
    <TradingLayout>
      <div className="flex flex-col h-full bg-[#0b0e11]">
        {/* Top Bar - Symbol Selector and Ticker */}
        <div className="flex items-center gap-4 px-3 py-1 border-b border-gray-800 bg-[#181a20] shrink-0">
          <SymbolSelector />
          <TickerBar className="flex-1" />
        </div>

        {/* Main Content - Bybit Layout with full page scroll */}
        <div className="flex-1 flex min-h-0">
          {/* Left + Middle: Chart + OrderBook on top, Positions on bottom - SCROLLABLE */}
          <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
            {/* Top Row: Chart + OrderBook - fixed height */}
            <div className="flex min-h-0 shrink-0" style={{ height: "570px" }}>
              {/* Chart */}
              <div className="flex-1 min-w-0">
                <TradingViewChart symbol={currentSymbol} className="h-full" />
              </div>
              {/* OrderBook - hidden on mobile */}
              <div className="hidden lg:flex flex-col w-[200px] xl:w-[220px] border-l border-gray-800">
                <OrderBook className="h-full" compact />
              </div>
            </div>

            {/* Positions Panel - spans under both Chart and OrderBook */}
            <PositionsPanel className="min-h-[200px] border-t border-gray-800 shrink-0" />
          </div>

          {/* Right Section - Order Form + Account (full height with internal scroll) */}
          <div className="hidden lg:flex flex-col w-[280px] xl:w-[300px] border-l border-gray-800 h-full">
            <div className="flex-1 overflow-y-auto">
              <OrderForm symbol={currentSymbol} />
              <AccountPanel />
            </div>
          </div>
        </div>

        {/* Mobile: Bottom tabs for OrderBook and OrderForm */}
        <div className="lg:hidden border-t border-gray-800">
          <MobileTradePanel symbol={currentSymbol} />
        </div>
      </div>
    </TradingLayout>
  );
}

/**
 * Mobile Trade Panel - Tabs for Order Book and Order Form
 */
function MobileTradePanel({ symbol }) {
  const [activeTab, setActiveTab] = useState("order");

  return (
    <div className="bg-[#0b0e11]">
      <div className="flex border-b border-gray-800">
        <button
          className={clsx(
            "flex-1 py-2 text-sm font-medium",
            activeTab === "order"
              ? "text-yellow-500 border-b-2 border-yellow-500"
              : "text-gray-400",
          )}
          onClick={() => setActiveTab("order")}
        >
          Trade
        </button>
        <button
          className={clsx(
            "flex-1 py-2 text-sm font-medium",
            activeTab === "orderbook"
              ? "text-yellow-500 border-b-2 border-yellow-500"
              : "text-gray-400",
          )}
          onClick={() => setActiveTab("orderbook")}
        >
          Order Book
        </button>
      </div>
      <div className="max-h-[300px] overflow-auto">
        {activeTab === "order" && <OrderForm symbol={symbol} />}
        {activeTab === "orderbook" && <OrderBook compact />}
      </div>
    </div>
  );
}

/**
 * Mobile-optimized Futures Trading
 * Shows components in tab-based layout for smaller screens
 */
export function MobileFuturesTrading() {
  // This could be a separate mobile-optimized version
  // For now, the main component is responsive
  return <FuturesTrading />;
}
