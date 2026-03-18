/**
 * Simplified Trading Store
 * Uses localStorage instead of backend API
 * Simple order placement and position tracking
 */

import { create } from "zustand";
import {
  getOrders,
  addOrder,
  updateOrder,
  deleteOrder,
  getPositions,
  addPosition,
  updatePosition,
  removePosition,
  updatePositionPrices,
  getWallet,
  updateWallet,
  resetWallet,
} from "../services/simpleStorage";
import { calculatePnL } from "../utils/simplePnL";
import toast from "react-hot-toast";

const useTradingStore = create((set, get) => ({
  // Wallet
  wallet: null,

  // Orders
  orders: [],
  openOrders: [],

  // Positions
  positions: [],

  // Loading states
  loading: {
    wallet: false,
    orders: false,
    positions: false,
    placeOrder: false,
  },

  // Error state
  error: null,

  // ===========================================================================
  // WALLET ACTIONS
  // ===========================================================================

  fetchWallet: async () => {
    try {
      const wallet = getWallet();
      set({ wallet, error: null });
    } catch (error) {
      console.error("Failed to fetch wallet:", error);
      set({ error: "Failed to fetch wallet" });
    }
  },

  resetWallet: async () => {
    try {
      const wallet = resetWallet();
      // Also clear all positions and orders
      localStorage.removeItem('trading_positions');
      localStorage.removeItem('trading_orders');
      
      set({ 
        wallet, 
        positions: [], 
        orders: [], 
        openOrders: [],
        error: null 
      });
      
      toast.success("Wallet reset to $100,000 USDT");
      return { success: true };
    } catch (error) {
      console.error("Failed to reset wallet:", error);
      toast.error("Failed to reset wallet");
      return { success: false };
    }
  },

  // ===========================================================================
  // ORDER ACTIONS
  // ===========================================================================

  fetchOrders: async (params = {}, { silent = false } = {}) => {
    if (!silent) {
      set((state) => ({ loading: { ...state.loading, orders: true } }));
    }
    
    try {
      const orders = getOrders();
      const openOrders = orders.filter(
        (o) => o.status === "Open" && o.type === "Limit"
      );

      set({ orders, openOrders, error: null });
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      if (!silent) {
        set({ error: "Failed to fetch orders" });
      }
    } finally {
      if (!silent) {
        set((state) => ({ loading: { ...state.loading, orders: false } }));
      }
    }
  },

  placeOrder: async (orderData) => {
    set((state) => ({ loading: { ...state.loading, placeOrder: true } }));
    
    try {
      // Get current wallet
      const wallet = getWallet();
      const currentBalance = wallet.balance;

      // Calculate required margin for the position
      const price = orderData.price || orderData.currentPrice || 0;
      const qty = orderData.qty;
      const leverage = orderData.leverage || 1;
      const positionValue = price * qty;
      const requiredMargin = positionValue / leverage;

      // Check if sufficient balance
      if (currentBalance < requiredMargin) {
        toast.error(`Insufficient balance. Required: $${requiredMargin.toFixed(2)}, Available: $${currentBalance.toFixed(2)}`);
        return { success: false, error: 'Insufficient balance' };
      }

      // Create order
      const order = addOrder({
        symbol: orderData.symbol,
        category: orderData.category || 'linear',
        side: orderData.side,
        order_type: orderData.order_type || 'Market',
        price: price,
        qty: orderData.qty,
        leverage: leverage,
        status: orderData.order_type === 'Limit' ? 'Open' : 'Filled',
      });

      if (!order) {
        throw new Error('Failed to create order');
      }

      // If market order or auto-fill, create position immediately
      if (order.status === 'Filled') {
        // Deduct margin from balance
        const newBalance = currentBalance - requiredMargin;
        updateWallet({ balance: newBalance });

        const position = addPosition({
          symbol: order.symbol,
          category: order.category,
          side: order.side,
          entryPrice: order.price,
          qty: order.qty,
          leverage: order.leverage,
          marginUsed: requiredMargin,
        });

        if (position) {
          toast.success(`${order.side} order filled at ${position.entryPrice}`);
        }
      } else {
        toast.success(`${order.side} limit order placed at ${order.price}`);
      }

      // Refresh data
      await Promise.all([
        get().fetchOrders({}, { silent: true }),
        get().fetchPositions({}, { silent: true }),
        get().fetchWallet(),
      ]);

      return { success: true, order };
    } catch (error) {
      const message = error.message || "Failed to place order";
      toast.error(message);
      return { success: false, error: message };
    } finally {
      set((state) => ({ loading: { ...state.loading, placeOrder: false } }));
    }
  },

  cancelOrder: async (orderId) => {
    try {
      updateOrder(orderId, { status: 'Cancelled' });
      toast.success("Order cancelled");
      await get().fetchOrders({}, { silent: true });
    } catch (error) {
      toast.error("Failed to cancel order");
    }
  },

  executeLimitOrder: async (orderId, marketPrice) => {
    try {
      const orders = getOrders();
      const order = orders.find(o => o.id === orderId);
      
      if (!order) {
        return { success: false, error: 'Order not found' };
      }

      // Get current wallet
      const wallet = getWallet();
      const currentBalance = wallet.balance;

      // Calculate required margin for the position
      const price = order.price;
      const qty = order.qty;
      const leverage = order.leverage || 1;
      const positionValue = price * qty;
      const requiredMargin = positionValue / leverage;

      // Check if sufficient balance
      if (currentBalance < requiredMargin) {
        toast.error(`Insufficient balance to fill limit order. Required: $${requiredMargin.toFixed(2)}`);
        return { success: false, error: 'Insufficient balance' };
      }

      // Deduct margin from balance
      const newBalance = currentBalance - requiredMargin;
      updateWallet({ balance: newBalance });

      // Update order to filled
      updateOrder(orderId, { 
        status: 'Filled',
        avg_price: order.price,
      });

      // Create position
      const position = addPosition({
        symbol: order.symbol,
        category: order.category,
        side: order.side,
        entryPrice: order.price,
        qty: order.qty,
        leverage: order.leverage || 1,
        marginUsed: requiredMargin,
      });

      // Refresh data
      await Promise.all([
        get().fetchOrders({}, { silent: true }),
        get().fetchPositions({}, { silent: true }),
        get().fetchWallet(),
      ]);

      return { success: true, order, position };
    } catch (error) {
      console.error("Failed to execute limit order:", error);
      return {
        success: false,
        error: "Failed to execute limit order",
      };
    }
  },

  // ===========================================================================
  // POSITION ACTIONS
  // ===========================================================================

  fetchPositions: async (params = {}, { silent = false } = {}) => {
    if (!silent) {
      set((state) => ({ loading: { ...state.loading, positions: true } }));
    }
    
    try {
      const positions = getPositions();
      set({ positions, error: null });
    } catch (error) {
      console.error("Failed to fetch positions:", error);
      if (!silent) {
        set({ error: "Failed to fetch positions" });
      }
    } finally {
      if (!silent) {
        set((state) => ({ loading: { ...state.loading, positions: false } }));
      }
    }
  },

  closePosition: async (positionId, data = {}) => {
    try {
      // Get the position before closing
      const positions = getPositions();
      const position = positions.find(p => p.id === positionId);
      
      if (!position) {
        throw new Error('Position not found');
      }

      // Calculate realized PnL
      const entryPrice = parseFloat(position.entryPrice || position.entry_price);
      const closePrice = data.price || entryPrice; // Use provided price or entry price
      const size = parseFloat(position.qty || position.size);
      const isLong = position.side === "Buy";

      let realizedPnL = 0;
      if (isLong) {
        realizedPnL = (closePrice - entryPrice) * size;
      } else {
        realizedPnL = (entryPrice - closePrice) * size;
      }

      // Get margin used for this position
      const marginUsed = parseFloat(position.marginUsed || 0);

      // Update wallet balance: return margin + realized PnL
      const wallet = getWallet();
      const newBalance = wallet.balance + marginUsed + realizedPnL;
      updateWallet({ balance: newBalance });

      // Create a closed order record for history
      addOrder({
        symbol: position.symbol,
        category: position.category || 'linear',
        side: isLong ? 'Sell' : 'Buy', // Opposite side to close
        order_type: 'Market',
        price: closePrice,
        qty: size,
        status: 'Filled',
        realizedPnL: realizedPnL,
        closedPosition: true,
      });

      // Optimistic update - remove position immediately
      set((state) => ({
        positions: state.positions.filter((p) => p.id !== positionId),
      }));

      // Remove from storage
      removePosition(positionId);
      
      // Show success message with PnL
      const pnlText = realizedPnL >= 0 
        ? `+$${Math.abs(realizedPnL).toFixed(2)}` 
        : `-$${Math.abs(realizedPnL).toFixed(2)}`;
      toast.success(`Position closed. PnL: ${pnlText}`);

      // Refresh wallet to show updated balance
      await get().fetchWallet();

      return { success: true, realizedPnL };
    } catch (error) {
      // Revert optimistic update on failure
      get().fetchPositions();
      toast.error("Failed to close position");
      throw error;
    }
  },

  modifyPositionTPSL: async (positionId, data) => {
    try {
      // Optimistic update
      set((state) => ({
        positions: state.positions.map((p) =>
          p.id === positionId
            ? {
                ...p,
                take_profit: data.take_profit ?? p.take_profit,
                stop_loss: data.stop_loss ?? p.stop_loss,
              }
            : p,
        ),
      }));

      // Update in storage
      updatePosition(positionId, {
        take_profit: data.take_profit,
        stop_loss: data.stop_loss,
      });

      toast.success("TP/SL updated");
    } catch (error) {
      // Revert optimistic update on failure
      get().fetchPositions({}, { silent: true });
      toast.error("Failed to update TP/SL");
    }
  },

  // ===========================================================================
  // REAL-TIME UPDATES (for WebSocket)
  // ===========================================================================

  updatePositionPrices: (priceUpdates) => {
    try {
      // Update positions in storage with new prices
      const updatedPositions = updatePositionPrices(priceUpdates);
      
      // Update Zustand state for UI reactivity
      set({ positions: updatedPositions });
    } catch (error) {
      console.error('Failed to update position prices:', error);
    }
  },

  updateOrderStatus: (orderId, update) => {
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId ? { ...o, ...update } : o,
      ),
      openOrders: state.openOrders
        .map((o) =>
          o.id === orderId ? { ...o, ...update } : o,
        )
        .filter((o) => o.status === "Open"),
    }));
  },

  updatePosition: (positionId, update) => {
    set((state) => ({
      positions: state.positions.map((p) =>
        p.id === positionId ? { ...p, ...update } : p,
      ),
    }));
  },

  // ===========================================================================
  // SELECTORS
  // ===========================================================================

  getPositionBySymbol: (symbol) => {
    return get().positions.find((p) => p.symbol === symbol);
  },

  getOpenOrdersBySymbol: (symbol) => {
    return get().openOrders.filter((o) => o.symbol === symbol);
  },

  getTotalUnrealizedPnL: () => {
    const { positions } = get();
    return positions.reduce(
      (sum, p) => sum + parseFloat(p.pnl || 0),
      0,
    );
  },
}));

export default useTradingStore;
