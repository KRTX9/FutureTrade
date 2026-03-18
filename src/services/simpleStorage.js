/**
 * Simple Storage Service
 * Uses localStorage for all data persistence
 * No complexity, just simple get/set operations
 */

const STORAGE_KEYS = {
  USER: 'trading_user',
  ORDERS: 'trading_orders',
  POSITIONS: 'trading_positions',
  SETTINGS: 'trading_settings',
  WALLET: 'trading_wallet',
};

const DEFAULT_BALANCE = 100000; // $100,000 USDT starting balance

// ============================================================================
// USER OPERATIONS
// ============================================================================

export const getUser = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};

export const setUser = (username) => {
  try {
    const user = {
      username,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    return user;
  } catch (error) {
    console.error('Error setting user:', error);
    return null;
  }
};

export const clearUser = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.USER);
    return true;
  } catch (error) {
    console.error('Error clearing user:', error);
    return false;
  }
};

// ============================================================================
// ORDER OPERATIONS
// ============================================================================

export const getOrders = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting orders:', error);
    return [];
  }
};

export const addOrder = (order) => {
  try {
    const orders = getOrders();
    const newOrder = {
      id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...order,
      timestamp: new Date().toISOString(),
      status: order.status || 'Filled', // Default to Filled for simplicity
    };
    orders.push(newOrder);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    return newOrder;
  } catch (error) {
    console.error('Error adding order:', error);
    return null;
  }
};

export const updateOrder = (orderId, updates) => {
  try {
    const orders = getOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index !== -1) {
      orders[index] = { ...orders[index], ...updates };
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
      return orders[index];
    }
    return null;
  } catch (error) {
    console.error('Error updating order:', error);
    return null;
  }
};

export const deleteOrder = (orderId) => {
  try {
    const orders = getOrders();
    const filtered = orders.filter(o => o.id !== orderId);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error deleting order:', error);
    return false;
  }
};

// ============================================================================
// POSITION OPERATIONS
// ============================================================================

export const getPositions = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.POSITIONS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting positions:', error);
    return [];
  }
};

export const addPosition = (position) => {
  try {
    const positions = getPositions();
    const newPosition = {
      id: `pos_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...position,
      timestamp: new Date().toISOString(),
      currentPrice: position.entryPrice, // Initialize with entry price
      pnl: 0, // Initialize PnL to 0
    };
    positions.push(newPosition);
    localStorage.setItem(STORAGE_KEYS.POSITIONS, JSON.stringify(positions));
    return newPosition;
  } catch (error) {
    console.error('Error adding position:', error);
    return null;
  }
};

export const updatePosition = (positionId, updates) => {
  try {
    const positions = getPositions();
    const index = positions.findIndex(p => p.id === positionId);
    if (index !== -1) {
      positions[index] = { ...positions[index], ...updates };
      localStorage.setItem(STORAGE_KEYS.POSITIONS, JSON.stringify(positions));
      return positions[index];
    }
    return null;
  } catch (error) {
    console.error('Error updating position:', error);
    return null;
  }
};

export const removePosition = (positionId) => {
  try {
    const positions = getPositions();
    const filtered = positions.filter(p => p.id !== positionId);
    localStorage.setItem(STORAGE_KEYS.POSITIONS, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error removing position:', error);
    return false;
  }
};

export const updatePositionPrices = (priceUpdates) => {
  try {
    const positions = getPositions();
    let updated = false;
    
    positions.forEach(position => {
      const currentPrice = priceUpdates[position.symbol];
      if (currentPrice && currentPrice !== position.currentPrice) {
        position.currentPrice = currentPrice;
        // Calculate simple PnL
        if (position.side === 'Buy') {
          position.pnl = (currentPrice - position.entryPrice) * position.qty;
        } else {
          position.pnl = (position.entryPrice - currentPrice) * position.qty;
        }
        updated = true;
      }
    });
    
    if (updated) {
      localStorage.setItem(STORAGE_KEYS.POSITIONS, JSON.stringify(positions));
    }
    
    return positions;
  } catch (error) {
    console.error('Error updating position prices:', error);
    return [];
  }
};

// ============================================================================
// WALLET OPERATIONS
// ============================================================================

export const getWallet = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.WALLET);
    if (data) {
      return JSON.parse(data);
    }
    // Initialize with default balance if not exists
    const defaultWallet = {
      balance: DEFAULT_BALANCE,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.WALLET, JSON.stringify(defaultWallet));
    return defaultWallet;
  } catch (error) {
    console.error('Error getting wallet:', error);
    return { balance: DEFAULT_BALANCE };
  }
};

export const updateWallet = (updates) => {
  try {
    const wallet = getWallet();
    const updated = { ...wallet, ...updates };
    localStorage.setItem(STORAGE_KEYS.WALLET, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error('Error updating wallet:', error);
    return null;
  }
};

export const resetWallet = () => {
  try {
    const wallet = {
      balance: DEFAULT_BALANCE,
      resetAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.WALLET, JSON.stringify(wallet));
    return wallet;
  } catch (error) {
    console.error('Error resetting wallet:', error);
    return null;
  }
};

// ============================================================================
// SETTINGS OPERATIONS
// ============================================================================

export const getSettings = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error getting settings:', error);
    return {};
  }
};

export const updateSettings = (settings) => {
  try {
    const current = getSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error('Error updating settings:', error);
    return null;
  }
};

// ============================================================================
// UTILITY OPERATIONS
// ============================================================================

export const clearAllData = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
    localStorage.removeItem(STORAGE_KEYS.POSITIONS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.WALLET);
    return true;
  } catch (error) {
    console.error('Error clearing all data:', error);
    return false;
  }
};

export const exportData = () => {
  try {
    const data = {
      user: getUser(),
      orders: getOrders(),
      positions: getPositions(),
      wallet: getWallet(),
      settings: getSettings(),
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  } catch (error) {
    console.error('Error exporting data:', error);
    return null;
  }
};

export const importData = (jsonString) => {
  try {
    const data = JSON.parse(jsonString);
    
    if (data.user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
    }
    if (data.orders) {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(data.orders));
    }
    if (data.positions) {
      localStorage.setItem(STORAGE_KEYS.POSITIONS, JSON.stringify(data.positions));
    }
    if (data.wallet) {
      localStorage.setItem(STORAGE_KEYS.WALLET, JSON.stringify(data.wallet));
    }
    if (data.settings) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
    }
    
    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
};

export const getStorageStats = () => {
  try {
    const orders = getOrders();
    const positions = getPositions();
    const wallet = getWallet();
    
    return {
      ordersCount: orders.length,
      positionsCount: positions.length,
      hasUser: !!getUser(),
      balance: wallet.balance,
    };
  } catch (error) {
    console.error('Error getting storage stats:', error);
    return {
      ordersCount: 0,
      positionsCount: 0,
      hasUser: false,
      balance: 0,
    };
  }
};

// Default export with all functions
export default {
  // User
  getUser,
  setUser,
  clearUser,
  
  // Orders
  getOrders,
  addOrder,
  updateOrder,
  deleteOrder,
  
  // Positions
  getPositions,
  addPosition,
  updatePosition,
  removePosition,
  updatePositionPrices,
  
  // Wallet
  getWallet,
  updateWallet,
  resetWallet,
  
  // Settings
  getSettings,
  updateSettings,
  
  // Utility
  clearAllData,
  exportData,
  importData,
  getStorageStats,
};
