/**
 * Simple PnL Calculator
 * No fees, no margin, no complexity
 * Just basic profit/loss calculation
 */

/**
 * Calculate PnL for a position
 * @param {Object} position - Position object with side, entryPrice, qty
 * @param {number} currentPrice - Current market price
 * @returns {number} PnL in USDT
 */
export const calculatePnL = (position, currentPrice) => {
  if (!position || !currentPrice) return 0;

  const entryPrice = parseFloat(position.entryPrice);
  const qty = parseFloat(position.qty);
  const current = parseFloat(currentPrice);

  if (isNaN(entryPrice) || isNaN(qty) || isNaN(current)) return 0;

  // Simple PnL calculation
  if (position.side === 'Buy') {
    // Long position: profit when price goes up
    return (current - entryPrice) * qty;
  } else {
    // Short position: profit when price goes down
    return (entryPrice - current) * qty;
  }
};

/**
 * Calculate PnL percentage
 * @param {Object} position - Position object
 * @param {number} currentPrice - Current market price
 * @returns {number} PnL percentage
 */
export const calculatePnLPercentage = (position, currentPrice) => {
  if (!position || !currentPrice) return 0;

  const entryPrice = parseFloat(position.entryPrice);
  const current = parseFloat(currentPrice);

  if (isNaN(entryPrice) || isNaN(current) || entryPrice === 0) return 0;

  if (position.side === 'Buy') {
    return ((current - entryPrice) / entryPrice) * 100;
  } else {
    return ((entryPrice - current) / entryPrice) * 100;
  }
};

/**
 * Calculate total PnL for multiple positions
 * @param {Array} positions - Array of positions
 * @param {Object} currentPrices - Object with symbol: price mapping
 * @returns {number} Total PnL
 */
export const calculateTotalPnL = (positions, currentPrices) => {
  if (!positions || !Array.isArray(positions)) return 0;

  return positions.reduce((total, position) => {
    const currentPrice = currentPrices[position.symbol];
    if (currentPrice) {
      return total + calculatePnL(position, currentPrice);
    }
    return total;
  }, 0);
};

/**
 * Format PnL for display
 * @param {number} pnl - PnL value
 * @returns {string} Formatted PnL with + or - sign
 */
export const formatPnL = (pnl) => {
  if (isNaN(pnl)) return '$0.00';
  
  const formatted = Math.abs(pnl).toFixed(2);
  if (pnl > 0) {
    return `+$${formatted}`;
  } else if (pnl < 0) {
    return `-$${formatted}`;
  } else {
    return `$${formatted}`;
  }
};

/**
 * Get PnL color class for UI
 * @param {number} pnl - PnL value
 * @returns {string} CSS class name
 */
export const getPnLColorClass = (pnl) => {
  if (pnl > 0) return 'text-green-500';
  if (pnl < 0) return 'text-red-500';
  return 'text-gray-400';
};

// Default export
export default {
  calculatePnL,
  calculatePnLPercentage,
  calculateTotalPnL,
  formatPnL,
  getPnLColorClass,
};
