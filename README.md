# KRTX9 - Crypto Futures Trading Platform

A modern, paper trading platform for cryptocurrency futures with real-time market data and advanced trading features.

## 🚀 Features

### Trading
- **Real-time Market Data** - Live price updates via WebSocket connection 
- **Futures Trading** - Long and Short positions with customizable leverage (1x-125x)
- **Market Orders** - Instant order execution at current market price
- **Position Management** - Open, monitor, and close positions with real-time P&L tracking
- **Take Profit / Stop Loss** - Set TP/SL with interactive ROI-based sliders
- **Advanced Charting** - TradingView integration with EMA200 indicator and drawing tools

### Portfolio Management
- **Paper Trading** - Practice trading with $100,000 virtual USDT
- **Balance Tracking** - Real-time balance updates with margin calculations
- **Position Analytics** - View leverage, margin used, liquidation price, and P&L percentage
- **Order History** - Complete trading history (15 orders per page)
- **Portfolio Overview** - Dashboard with total equity, unrealized P&L, and open positions

### User Experience
- **Responsive Design** - Works seamlessly on desktop 
- **Dark Theme** - Easy on the eyes for extended trading sessions
- **Simple Authentication** - Username-only login (no password required for paper trading)
- **Reset Functionality** - Clear all positions and reset balance to default

## 🛠️ Tech Stack

- **Frontend Framework** - React 18 with Vite
- **State Management** - Zustand
- **Styling** - Tailwind CSS
- **Charts** - TradingView Advanced Charts
- **Real-time Data** - WebSocket
- **Routing** - React Router DOM

## 📦 Installation

1. Clone the repository:
```bash
cd krtx9trade/client
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`


## 📖 Usage

1. **Login** - Enter any username to start paper trading
2. **Select Symbol** - Choose from available crypto pairs (BTC, ETH, XRP, etc.)
3. **Place Order** - Set leverage, quantity, and choose Long or Short
4. **Monitor Position** - Track real-time P&L, liquidation price, and ROI
5. **Set TP/SL** - Use the interactive modal to set take profit and stop loss levels
6. **Close Position** - Exit your position at any time to realize profits or losses
7. **View History** - Check your complete trading history in the History page

## 🎯 Key Features Explained

### Leverage Trading
- Choose leverage from 1x to 125x
- Higher leverage = higher potential profit/loss
- Margin is automatically calculated based on position size and leverage

### Liquidation Price
- Automatically calculated for each position
- Long positions liquidate when price drops below liquidation price
- Short positions liquidate when price rises above liquidation price

### P&L Calculation
- **Dollar P&L** - Actual profit/loss in USDT
- **Percentage P&L** - ROI based on price movement from entry
- Updates in real-time with market price changes

### TP/SL System
- Set targets using price or ROI percentage
- Interactive sliders for easy adjustment
- Visual feedback with estimated P&L

## ⚠️ Disclaimer

This is a **paper trading platform** for educational and practice purposes only. No real money or cryptocurrency is involved. All trades are simulated using real market data.

- Not financial advice
- Practice trading only
- No real funds at risk
- For educational purposes
