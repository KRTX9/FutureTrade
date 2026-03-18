/**
 * OrderForm Component
 * Form for placing futures/options orders
 *
 * Bybit API Reference: https://bybit-exchange.github.io/docs/v5/order/create-order
 * - category: linear (USDT perpetual), inverse, option
 * - orderType: Market, Limit
 * - qty: For Perps/Futures - always in base coin (e.g., BTC)
 * - price: Required for Limit orders, ignored for Market orders
 * - timeInForce: GTC (default), IOC, FOK, PostOnly
 */

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import useMarketStore from "../../stores/marketStore";
import useTradingStore from "../../stores/tradingStore";
import { Button, Input, Toggle } from "../Common";
import clsx from "clsx";
import numeral from "numeral";

const PERCENTAGE_BUTTONS = [25, 50, 75, 100];
const LEVERAGE_OPTIONS = [1, 2, 3, 5, 10, 25, 50, 75, 100, 125];

// Minimum order sizes for common pairs (in base coin)
const MIN_QTY = {
  BTCUSDT: 0.001,
  ETHUSDT: 0.01,
  default: 0.001,
};

export default function OrderForm({ className }) {
  const { currentSymbol, currentCategory } = useMarketStore();
  const ticker = useMarketStore((state) => state.getCurrentTicker());
  const { wallet, loading, placeOrder, calculateMargin } = useTradingStore();

  // Form state - now using USDT amount instead of quantity
  const [side, setSide] = useState("Buy");
  const [orderType, setOrderType] = useState("Market");
  const [price, setPrice] = useState("");
  const [usdtAmount, setUsdtAmount] = useState(""); // Amount in USDT (notional value)
  const [leverage, setLeverage] = useState(10);
  const [reduceOnly, setReduceOnly] = useState(false);
  const [takeProfit, setTakeProfit] = useState("");
  const [stopLoss, setStopLoss] = useState("");
  const [showTPSL, setShowTPSL] = useState(false);

  // Margin calculation state
  const [marginInfo, setMarginInfo] = useState(null);
  const hasUserInput = useRef(false);

  // Get current market price and bid/ask for accurate calculations
  const currentPrice = useMemo(() => {
    return parseFloat(ticker?.last_price) || 0;
  }, [ticker?.last_price]);

  // Get bid/ask prices for execution price calculation
  const bidPrice = useMemo(() => {
    return parseFloat(ticker?.bid1_price) || currentPrice;
  }, [ticker?.bid1_price, currentPrice]);

  const askPrice = useMemo(() => {
    return parseFloat(ticker?.ask1_price) || currentPrice;
  }, [ticker?.ask1_price, currentPrice]);

  // Available balance
  const availableBalance = useMemo(() => {
    if (!wallet) return 0;
    return parseFloat(wallet.balance || 0);
  }, [wallet]);

  // Get the effective price for calculations
  // For Market orders: Buy uses ASK, Sell uses BID (execution price)
  // For Limit orders: Use the limit price entered
  const effectivePrice = useMemo(() => {
    if (orderType === "Limit") {
      const p = parseFloat(price);
      return isNaN(p) || p <= 0 ? currentPrice : p;
    }
    // Market order: use execution price (ask for buy, bid for sell)
    return side === "Buy" ? askPrice : bidPrice;
  }, [orderType, price, currentPrice, side, askPrice, bidPrice]);

  // Parse USDT amount (notional value)
  const notionalValue = useMemo(() => {
    const amount = parseFloat(usdtAmount);
    return isNaN(amount) || amount <= 0 ? 0 : amount;
  }, [usdtAmount]);

  // Calculate quantity from USDT amount: qty = notional / price
  const qty = useMemo(() => {
    if (notionalValue <= 0 || effectivePrice <= 0) return 0;
    return notionalValue / effectivePrice;
  }, [notionalValue, effectivePrice]);

  // Calculate margin required: margin = notional / leverage
  const marginRequired = useMemo(() => {
    if (notionalValue <= 0 || leverage <= 0) return 0;
    return notionalValue / leverage;
  }, [notionalValue, leverage]);

  // Calculate estimated fee (0.055% taker fee - Bybit standard)
  const estimatedFee = useMemo(() => {
    if (notionalValue <= 0) return 0;
    return notionalValue * 0.00055;
  }, [notionalValue]);

  // Calculate max USDT amount (max notional = available * leverage * 99% for fees)
  const maxUsdtAmount = useMemo(() => {
    if (!availableBalance || leverage <= 0) return 0;
    return availableBalance * leverage * 0.99;
  }, [availableBalance, leverage]);

  // Validate quantity meets minimum
  const minQty = MIN_QTY[currentSymbol] || MIN_QTY.default;
  const isValidQuantity = qty >= minQty;

  // Validate margin doesn't exceed available balance
  const isMarginExceeded = marginRequired > availableBalance;
  const totalRequired = marginRequired + estimatedFee;
  const isBalanceInsufficient = totalRequired > availableBalance;

  // Track margin fetch trigger - only fetch when user changes these values
  const marginFetchTrigger = useRef(0);

  // Fetch margin info from API (only on user input changes, not ticker updates)
  useEffect(() => {
    if (!hasUserInput.current || qty <= 0 || !currentSymbol) {
      setMarginInfo(null);
      return;
    }

    // Use a stable price for API calls (current ticker price for Market)
    const apiPrice =
      orderType === "Limit" && parseFloat(price) > 0
        ? parseFloat(price)
        : currentPrice;

    if (apiPrice <= 0) return;

    marginFetchTrigger.current += 1;
    const currentTrigger = marginFetchTrigger.current;

    const fetchMargin = async () => {
      // Skip if another fetch was triggered
      if (marginFetchTrigger.current !== currentTrigger) return;

      try {
        const result = await calculateMargin({
          symbol: currentSymbol,
          side,
          qty: parseFloat(qty.toFixed(8)),
          price: parseFloat(apiPrice.toFixed(8)),
          leverage,
          margin_mode: "isolated",
        });
        if (result && marginFetchTrigger.current === currentTrigger) {
          setMarginInfo(result);
        }
      } catch (error) {
        // Silently handle errors
      }
    };

    const debounce = setTimeout(fetchMargin, 500);
    return () => clearTimeout(debounce);
    // Only depend on user-controllable values, NOT currentPrice or effectivePrice
  }, [
    notionalValue,
    price,
    leverage,
    side,
    currentSymbol,
    orderType,
    calculateMargin,
  ]);

  // Handle USDT amount change
  const handleUsdtChange = (e) => {
    hasUserInput.current = true;
    setUsdtAmount(e.target.value);
  };

  // Handle percentage button - now calculates percentage of max USDT amount
  const handlePercentageClick = (percent) => {
    if (maxUsdtAmount <= 0) return;
    hasUserInput.current = true;
    const newAmount = (maxUsdtAmount * percent) / 100;
    setUsdtAmount(newAmount.toFixed(2));
  };

  // Handle order submission
  const handleSubmit = async (e, forcedSide = null) => {
    e.preventDefault();

    // Use forcedSide if provided (from button click), otherwise use state
    const orderSide = forcedSide || side;

    if (!currentSymbol || qty <= 0 || !isValidQuantity) {
      return;
    }

    // Check margin doesn't exceed available balance
    if (isBalanceInsufficient) {
      return;
    }

    if (orderType === "Limit" && (!effectivePrice || effectivePrice <= 0)) {
      return;
    }

    const orderData = {
      symbol: currentSymbol,
      category: currentCategory || "linear",
      side: orderSide,
      order_type: orderType,
      qty: parseFloat(qty.toFixed(8)),
      leverage: parseInt(leverage),
      reduce_only: reduceOnly,
      time_in_force: orderType === "Market" ? "IOC" : "GTC",
      position_idx: 0,
    };

    if (orderType === "Limit") {
      // Use 8 decimal places for price precision (crypto standard)
      orderData.price = parseFloat(effectivePrice.toFixed(8));
    } else {
      // For Market orders, use execution price (bid/ask) not last price
      // Buy executes at ASK, Sell executes at BID
      const executionPrice = orderSide === "Buy" ? askPrice : bidPrice;
      orderData.price = parseFloat(executionPrice.toFixed(8));
    }

    if (takeProfit) {
      const tp = parseFloat(takeProfit);
      if (!isNaN(tp) && tp > 0) orderData.take_profit = tp;
    }
    if (stopLoss) {
      const sl = parseFloat(stopLoss);
      if (!isNaN(sl) && sl > 0) orderData.stop_loss = sl;
    }

    const result = await placeOrder(orderData);

    if (result.success) {
      setUsdtAmount("");
      setTakeProfit("");
      setStopLoss("");
      setMarginInfo(null);
      hasUserInput.current = false;
    }
  };

  const isBuy = side === "Buy";
  const baseCoin = currentSymbol?.replace("USDT", "") || "BTC";

  return (
    <div className={clsx("bg-[#0b0e11]", className)}>
      <form onSubmit={handleSubmit} className="p-4 space-y-3">
        {/* Order Type & Leverage Row */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">
              Order Type
            </label>
            <select
              value={orderType}
              onChange={(e) => setOrderType(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-2 text-base text-white focus:outline-none focus:border-yellow-500"
            >
              <option value="Market">Market</option>
              <option value="Limit">Limit</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Leverage</label>
            <select
              value={leverage}
              onChange={(e) => setLeverage(parseInt(e.target.value))}
              className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-2 text-base text-white focus:outline-none focus:border-yellow-500"
            >
              {LEVERAGE_OPTIONS.map((l) => (
                <option key={l} value={l}>
                  {l}x
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Price Input (for Limit orders) */}
        {orderType === "Limit" && (
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Price</label>
            <div className="relative">
              <input
                type="number"
                step="any"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder={currentPrice.toFixed(2)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                USDT
              </span>
            </div>
          </div>
        )}

        {/* Quantity Input - Now in USDT */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs text-gray-400">
              Quantity{" "}
              <span className="text-gray-500">
                (Max: {numeral(maxUsdtAmount).format("0,0.00")})
              </span>
            </label>
          </div>
          <div className="relative">
            <input
              type="number"
              step="any"
              value={usdtAmount}
              onChange={handleUsdtChange}
              placeholder="0"
              className={clsx(
                "w-full bg-gray-700 border rounded px-3 py-2 text-white text-sm focus:outline-none",
                isBalanceInsufficient && notionalValue > 0
                  ? "border-red-500 focus:border-red-500"
                  : "border-gray-600 focus:border-yellow-500",
              )}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
              USDT
            </span>
          </div>
          {/* Show calculated quantity */}
          {qty > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              ≈ {numeral(qty).format("0,0.0000")} {baseCoin}
            </p>
          )}
          {qty > 0 && !isValidQuantity && (
            <p className="text-xs text-red-400 mt-1">
              Min order: {minQty} {baseCoin} (≈ $
              {numeral(minQty * effectivePrice).format("0,0.00")})
            </p>
          )}
          {isBalanceInsufficient && notionalValue > 0 && (
            <p className="text-xs text-red-400 mt-1">
              Insufficient balance. Need $
              {numeral(totalRequired).format("0,0.00")} (margin + fee)
            </p>
          )}
        </div>

        {/* Percentage buttons */}
        <div className="flex gap-1">
          {PERCENTAGE_BUTTONS.map((percent) => (
            <button
              key={percent}
              type="button"
              className="flex-1 py-1 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors"
              onClick={() => handlePercentageClick(percent)}
            >
              {percent}%
            </button>
          ))}
        </div>

        {/* TP/SL Toggle */}
        {/* <div className="flex items-center justify-between">
          <Toggle checked={showTPSL} onChange={setShowTPSL} label="TP/SL" />
          <Toggle
            checked={reduceOnly}
            onChange={setReduceOnly}
            label="Reduce Only"
          />
        </div> */}

        {/* TP/SL Inputs */}
        {showTPSL && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">
                Take Profit
              </label>
              <input
                type="number"
                step="any"
                value={takeProfit}
                onChange={(e) => setTakeProfit(e.target.value)}
                placeholder="--"
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1.5 text-green-400 text-sm focus:outline-none focus:border-green-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">
                Stop Loss
              </label>
              <input
                type="number"
                step="any"
                value={stopLoss}
                onChange={(e) => setStopLoss(e.target.value)}
                placeholder="--"
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-1.5 text-red-400 text-sm focus:outline-none focus:border-red-500"
              />
            </div>
          </div>
        )}

        {/* Order Summary - Real-time calculations */}
        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-gray-700 rounded-lg p-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Notional:</span>
            <span className="text-cyan-400 font-medium">
              ${numeral(notionalValue).format("0,0.00")}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Margin:</span>
            <span className="text-cyan-400 font-medium">
              $
              {numeral(marginInfo?.initial_margin || marginRequired).format(
                "0,0.00",
              )}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Fee:</span>
            <span className="text-cyan-400 font-medium">
              $
              {numeral(marginInfo?.fee_estimate || estimatedFee).format(
                "0,0.0000",
              )}
            </span>
          </div>
          {marginInfo?.liquidation_price && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Liq. Price:</span>
              <span className="text-red-400 font-medium">
                ${numeral(marginInfo.liquidation_price).format("0,0.0000")}
              </span>
            </div>
          )}
        </div>

        {/* Available Balance */}
        <div className="flex justify-between text-xs text-gray-400 px-1">
          <span>Available:</span>
          <span className="text-white">
            {numeral(availableBalance).format("0,0.00")} USDT
          </span>
        </div>

        {/* Long/Short Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              handleSubmit(e, "Buy");
            }}
            variant="success"
            size="lg"
            className="w-full"
            loading={loading.placeOrder && side === "Buy"}
            disabled={!usdtAmount || !isValidQuantity || isBalanceInsufficient}
          >
            Long
          </Button>
          <Button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              handleSubmit(e, "Sell");
            }}
            variant="danger"
            size="lg"
            className="w-full"
            loading={loading.placeOrder && side === "Sell"}
            disabled={!usdtAmount || !isValidQuantity || isBalanceInsufficient}
          >
            Short
          </Button>
        </div>
      </form>
    </div>
  );
}

/**
 * Compact order form for mobile or sidebar
 */
export function CompactOrderForm({ className }) {
  const { currentSymbol } = useMarketStore();
  const { placeOrder, loading } = useTradingStore();

  const [side, setSide] = useState("Buy");
  const [quantity, setQuantity] = useState("");

  const handleQuickOrder = async () => {
    if (!quantity || parseFloat(quantity) <= 0) return;

    await placeOrder({
      symbol: currentSymbol,
      category: "linear",
      side,
      order_type: "Market",
      qty: parseFloat(quantity),
      leverage: 10,
    });

    setQuantity("");
  };

  return (
    <div className={clsx("bg-gray-800 rounded-lg p-3", className)}>
      <div className="grid grid-cols-2 gap-1 mb-3">
        <button
          className={clsx(
            "py-1.5 rounded text-sm font-medium",
            side === "Buy" ? "bg-green-600" : "bg-gray-700",
          )}
          onClick={() => setSide("Buy")}
        >
          Long
        </button>
        <button
          className={clsx(
            "py-1.5 rounded text-sm font-medium",
            side === "Sell" ? "bg-red-600" : "bg-gray-700",
          )}
          onClick={() => setSide("Sell")}
        >
          Short
        </button>
      </div>

      <div className="flex gap-2">
        <Input
          type="number"
          step="any"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="Qty"
          className="flex-1"
        />
        <Button
          variant={side === "Buy" ? "success" : "danger"}
          onClick={handleQuickOrder}
          loading={loading.placeOrder}
          disabled={!quantity}
        >
          {side === "Buy" ? "Buy" : "Sell"}
        </Button>
      </div>
    </div>
  );
}
