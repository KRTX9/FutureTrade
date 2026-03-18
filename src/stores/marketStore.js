/**
 * Market Data Store
 * Manages real-time market data including prices, orderbook, and trades
 */

import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

const CHART_PREFERENCES_KEY = 'krtx9_chart_preferences';

// Load saved preferences from localStorage
const loadChartPreferences = () => {
  try {
    const saved = localStorage.getItem(CHART_PREFERENCES_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Failed to load chart preferences:', error);
  }
  return { symbol: 'BTCUSDT', interval: '15' };
};

// Save preferences to localStorage
const saveChartPreferences = (symbol, interval) => {
  try {
    localStorage.setItem(CHART_PREFERENCES_KEY, JSON.stringify({ symbol, interval }));
  } catch (error) {
    console.error('Failed to save chart preferences:', error);
  }
};

const savedPrefs = loadChartPreferences();

const useMarketStore = create(
  subscribeWithSelector((set, get) => ({
    // Current selected symbol - load from cache
    currentSymbol: savedPrefs.symbol,
    currentCategory: "linear",

    // Ticker data for all symbols
    tickers: {},

    // Orderbook for current symbol
    orderbook: {
      bids: [],
      asks: [],
      lastUpdate: null,
    },

    // Recent trades
    recentTrades: [],

    // Kline/candlestick data
    klines: [],
    klineInterval: savedPrefs.interval, // Load from cache

    // Chart UI state
    isChartFullscreen: false,
    setChartFullscreen: (value) => set({ isChartFullscreen: value }),

    // Loading states
    loading: {
      ticker: false,
      orderbook: false,
      trades: false,
      klines: false,
    },

    // WebSocket connection status
    wsConnected: false,

    // Actions
    setCurrentSymbol: (symbol, category = "linear") => {
      // Save to localStorage
      const { klineInterval } = get();
      saveChartPreferences(symbol, klineInterval);
      
      set({
        currentSymbol: symbol,
        currentCategory: category,
        orderbook: { bids: [], asks: [], lastUpdate: null },
        recentTrades: [],
        klines: [],
      });
    },

    setTicker: (symbol, data) => {
      set((state) => ({
        tickers: {
          ...state.tickers,
          [symbol]: {
            ...state.tickers[symbol],
            ...data,
            lastUpdate: Date.now(),
          },
        },
      }));
    },

    setOrderbook: (data) => {
      set({
        orderbook: {
          bids: data.bids || [],
          asks: data.asks || [],
          lastUpdate: Date.now(),
        },
      });
    },

    updateOrderbook: (data) => {
      const { orderbook } = get();
      const { type, bids, asks } = data;

      // For delta updates, merge the changes
      if (type === "delta") {
        const newBids = mergeOrderbookSide(orderbook.bids, bids || [], "desc");
        const newAsks = mergeOrderbookSide(orderbook.asks, asks || [], "asc");

        set({
          orderbook: {
            bids: newBids,
            asks: newAsks,
            lastUpdate: Date.now(),
          },
        });
      } else {
        // Snapshot - replace entirely
        set({
          orderbook: {
            bids: bids || [],
            asks: asks || [],
            lastUpdate: Date.now(),
          },
        });
      }
    },

    addTrade: (trade) => {
      set((state) => ({
        recentTrades: [trade, ...state.recentTrades.slice(0, 99)],
      }));
    },

    setKlines: (klines) => {
      set({ klines });
    },

    addKline: (kline) => {
      set((state) => {
        const klines = [...state.klines];
        const lastKline = klines[klines.length - 1];

        // If same timestamp, update; otherwise add new
        if (lastKline && lastKline.time === kline.time) {
          klines[klines.length - 1] = kline;
        } else {
          klines.push(kline);
          // Keep only last 500 klines
          if (klines.length > 500) klines.shift();
        }

        return { klines };
      });
    },

    setKlineInterval: (interval) => {
      // Save to localStorage
      const { currentSymbol } = get();
      saveChartPreferences(currentSymbol, interval);
      
      set({ klineInterval: interval, klines: [] });
    },

    // Fetch real klines from Bybit API
    fetchKlines: async (symbol = "BTCUSDT", interval = "15") => {
      set((state) => ({ loading: { ...state.loading, klines: true } }));

      try {
        // Bybit interval mapping
        const bybitInterval =
          {
            1: "1",
            5: "5",
            15: "15",
            60: "60",
            240: "240",
            D: "D",
            W: "W",
          }[interval] || "15";

        const response = await fetch(
          `https://api.bybit.com/v5/market/kline?category=linear&symbol=${symbol}&interval=${bybitInterval}&limit=200`,
        );
        const data = await response.json();

        if (data.retCode === 0 && data.result?.list) {
          // Bybit returns: [startTime, open, high, low, close, volume, turnover]
          // Reverse to get chronological order (oldest first)
          const rawKlines = data.result.list.reverse().map((k) => ({
            time: Math.floor(parseInt(k[0]) / 1000), // Convert ms to seconds
            open: k[1],
            high: k[2],
            low: k[3],
            close: k[4],
            volume: k[5],
          }));

          // Sort by time ascending and deduplicate
          const uniqueMap = new Map();
          rawKlines.forEach((k) => uniqueMap.set(k.time, k));
          const klines = Array.from(uniqueMap.values()).sort(
            (a, b) => a.time - b.time,
          );

          set({ klines, klineInterval: interval });
        }
      } catch (error) {
        console.error("Failed to fetch klines:", error);
      } finally {
        set((state) => ({ loading: { ...state.loading, klines: false } }));
      }
    },

    // Fetch real orderbook from Bybit API
    fetchOrderbook: async (symbol = "BTCUSDT") => {
      set((state) => ({ loading: { ...state.loading, orderbook: true } }));

      try {
        const response = await fetch(
          `https://api.bybit.com/v5/market/orderbook?category=linear&symbol=${symbol}&limit=25`,
        );
        const data = await response.json();

        if (data.retCode === 0 && data.result) {
          const asks = data.result.a || []; // [[price, size], ...]
          const bids = data.result.b || [];

          set({
            orderbook: { asks, bids, lastUpdate: Date.now() },
          });
        }
      } catch (error) {
        console.error("Failed to fetch orderbook:", error);
      } finally {
        set((state) => ({ loading: { ...state.loading, orderbook: false } }));
      }
    },

    // Fetch ticker from Bybit API
    fetchTicker: async (symbol = "BTCUSDT") => {
      try {
        const response = await fetch(
          `https://api.bybit.com/v5/market/tickers?category=linear&symbol=${symbol}`,
        );
        const data = await response.json();

        if (data.retCode === 0 && data.result?.list?.[0]) {
          const ticker = data.result.list[0];
          set((state) => ({
            tickers: {
              ...state.tickers,
              [symbol]: {
                last_price: ticker.lastPrice,
                mark_price: ticker.markPrice,
                index_price: ticker.indexPrice,
                bid1_price: ticker.bid1Price,
                ask1_price: ticker.ask1Price,
                high_24h: ticker.highPrice24h,
                low_24h: ticker.lowPrice24h,
                volume_24h: ticker.volume24h,
                price_24h_change_pct: ticker.price24hPcnt,
                open_interest: ticker.openInterest,
                funding_rate: ticker.fundingRate,
                lastUpdate: Date.now(),
              },
            },
          }));
        }
      } catch (error) {
        console.error("Failed to fetch ticker:", error);
      }
    },

    setLoading: (key, value) => {
      set((state) => ({
        loading: { ...state.loading, [key]: value },
      }));
    },

    setWsConnected: (connected) => {
      set({ wsConnected: connected });
    },

    // Selectors
    getCurrentTicker: () => {
      const { currentSymbol, tickers } = get();
      return tickers[currentSymbol] || null;
    },

    getSpread: () => {
      const { orderbook } = get();
      if (orderbook.asks.length === 0 || orderbook.bids.length === 0)
        return null;

      const bestAsk = parseFloat(orderbook.asks[0]?.[0] || 0);
      const bestBid = parseFloat(orderbook.bids[0]?.[0] || 0);

      if (bestAsk === 0 || bestBid === 0) return null;

      return {
        absolute: bestAsk - bestBid,
        percentage: ((bestAsk - bestBid) / bestAsk) * 100,
      };
    },
  })),
);

// Helper function to merge orderbook updates
function mergeOrderbookSide(existing, updates, sortOrder) {
  const priceMap = new Map();

  // Add existing entries
  existing.forEach(([price, qty]) => {
    priceMap.set(price, qty);
  });

  // Apply updates (qty of 0 means removal)
  updates.forEach(([price, qty]) => {
    if (parseFloat(qty) === 0) {
      priceMap.delete(price);
    } else {
      priceMap.set(price, qty);
    }
  });

  // Convert back to array and sort
  const result = Array.from(priceMap.entries());

  if (sortOrder === "desc") {
    result.sort((a, b) => parseFloat(b[0]) - parseFloat(a[0]));
  } else {
    result.sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]));
  }

  return result.slice(0, 25); // Keep top 25 levels
}

export default useMarketStore;
