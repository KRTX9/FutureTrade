/**
 * WebSocket Service for Real-Time Market Data
 * Connects to Bybit public WebSocket API for live data
 */

class WebSocketService {
  constructor() {
    this.ws = null;
    this.subscriptions = new Set();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    this.callbacks = {
      onTicker: null,
      onKline: null,
      onOrderbook: null,
      onTrade: null,
      onConnect: null,
      onDisconnect: null,
    };
    this.pingInterval = null;
    this.isConnecting = false;
  }

  /**
   * Connect to Bybit WebSocket
   * Using public linear (USDT perpetual) endpoint
   */
  connect() {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      return;
    }

    this.isConnecting = true;

    // Bybit public WebSocket endpoint for linear contracts
    const wsUrl = "wss://stream.bybit.com/v5/public/linear";

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.isConnecting = false;
        this.reconnectAttempts = 0;

        // Start ping to keep connection alive
        this.startPing();

        // On reconnection, resubscribe to previous subscriptions
        if (this.subscriptions.size > 0) {
          this.subscriptions.forEach((sub) => {
            this.send(JSON.parse(sub));
          });
        }

        // Notify listener after resubscription
        this.callbacks.onConnect?.();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      };

      this.ws.onclose = (event) => {
        this.isConnecting = false;
        this.stopPing();
        this.callbacks.onDisconnect?.();

        // Attempt reconnection
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          setTimeout(() => this.connect(), this.reconnectDelay);
        }
      };

      this.ws.onerror = (error) => {
        this.isConnecting = false;
      };
    } catch (error) {
      console.error("Failed to create WebSocket:", error);
      this.isConnecting = false;
    }
  }

  disconnect() {
    this.stopPing();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.subscriptions.clear();
  }

  startPing() {
    this.pingInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send({ op: "ping" });
      }
    }, 20000);
  }

  stopPing() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  send(data) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const message = typeof data === "string" ? data : JSON.stringify(data);
      this.ws.send(message);
    }
  }

  handleMessage(data) {
    // Handle pong response
    if (data.op === "pong" || data.ret_msg === "pong") {
      return;
    }

    // Handle subscription response
    if (data.op === "subscribe") {
      return;
    }

    // Handle topic data
    const topic = data.topic;
    if (!topic) return;

    if (topic.startsWith("tickers.")) {
      this.callbacks.onTicker?.(data.data);
    } else if (topic.startsWith("kline.")) {
      this.callbacks.onKline?.(data.data);
    } else if (topic.startsWith("orderbook.")) {
      this.callbacks.onOrderbook?.(data);
    } else if (topic.startsWith("publicTrade.")) {
      this.callbacks.onTrade?.(data.data);
    }
  }

  /**
   * Subscribe to ticker updates
   */
  subscribeTicker(symbol) {
    const sub = {
      op: "subscribe",
      args: [`tickers.${symbol}`],
    };
    this.subscriptions.add(JSON.stringify(sub));
    this.send(sub);
  }

  /**
   * Subscribe to kline/candlestick updates
   * @param {string} symbol - e.g., "BTCUSDT"
   * @param {string} interval - e.g., "1", "5", "15", "60", "240", "D", "W"
   */
  subscribeKline(symbol, interval) {
    const sub = {
      op: "subscribe",
      args: [`kline.${interval}.${symbol}`],
    };
    this.subscriptions.add(JSON.stringify(sub));
    this.send(sub);
  }

  /**
   * Subscribe to orderbook updates (depth 50)
   */
  subscribeOrderbook(symbol, depth = 50) {
    const sub = {
      op: "subscribe",
      args: [`orderbook.${depth}.${symbol}`],
    };
    this.subscriptions.add(JSON.stringify(sub));
    this.send(sub);
  }

  /**
   * Subscribe to recent trades
   */
  subscribeTrades(symbol) {
    const sub = {
      op: "subscribe",
      args: [`publicTrade.${symbol}`],
    };
    this.subscriptions.add(JSON.stringify(sub));
    this.send(sub);
  }

  /**
   * Unsubscribe from a topic
   */
  unsubscribe(topic) {
    const unsub = {
      op: "unsubscribe",
      args: [topic],
    };
    this.send(unsub);

    // Remove from subscriptions
    this.subscriptions.forEach((sub) => {
      if (sub.includes(topic)) {
        this.subscriptions.delete(sub);
      }
    });
  }

  /**
   * Set callback handlers
   */
  setCallbacks(callbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  /**
   * Check if connected
   */
  isConnected() {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

// Singleton instance
const wsService = new WebSocketService();

export default wsService;
