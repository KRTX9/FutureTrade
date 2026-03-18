/**
 * TradingViewChart Component
 * Uses TradingView's Advanced Chart Widget for professional charting
 */

import { useEffect, useRef, memo } from "react";
import useMarketStore from "../../stores/marketStore";
import { Maximize2, Minimize2 } from "lucide-react";
import clsx from "clsx";

// Map our interval format to TradingView format
const intervalMap = {
  1: "1",
  5: "5",
  15: "15",
  60: "60",
  240: "240",
  D: "D",
  W: "W",
};

const INTERVALS = [
  { label: "1m", value: "1" },
  { label: "5m", value: "5" },
  { label: "15m", value: "15" },
  { label: "1H", value: "60" },
  { label: "4H", value: "240" },
  { label: "1D", value: "D" },
  { label: "1W", value: "W" },
];

function TradingViewChart({ className }) {
  const containerRef = useRef(null);
  const fullscreenContainerRef = useRef(null);
  const widgetRef = useRef(null);
  const fullscreenWidgetRef = useRef(null);

  const {
    currentSymbol,
    klineInterval,
    setKlineInterval,
    isChartFullscreen,
    setChartFullscreen,
  } = useMarketStore();

  // Format symbol for TradingView (e.g., BTCUSDT -> BYBIT:BTCUSDT.P for perpetual)
  const getTradingViewSymbol = (symbol) => {
    if (!symbol) return "BYBIT:BTCUSDT.P";
    // For perpetual futures on Bybit
    return `BYBIT:${symbol}.P`;
  };

  // Handle interval change
  const handleIntervalChange = (interval) => {
    setKlineInterval(interval);
  };

  // Create TradingView widget
  const createWidget = (container, isFullscreen = false) => {
    if (!container || typeof window === "undefined") return null;

    // Clear container
    container.innerHTML = "";

    const widgetOptions = {
      autosize: true,
      symbol: getTradingViewSymbol(currentSymbol),
      interval: intervalMap[klineInterval] || "15",
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1", // Candlestick
      locale: "en",
      toolbar_bg: "#0b0e11",
      enable_publishing: false,
      hide_top_toolbar: true, // Hide TradingView's internal toolbar
      hide_legend: true, // Hide legend
      save_image: false,
      container_id: container.id,
      backgroundColor: "#0b0e11",
      gridColor: "#1e222d",
      hide_side_toolbar: false, // Show drawing tools sidebar on left
      allow_symbol_change: false,
      details: false,
      hotlist: false,
      calendar: false,
      studies: [
        {
          id: "MAExp@tv-basicstudies",
          inputs: {
            length: 200,
          },
          styles: {
            plot_0: {
              color: "rgb(255, 235, 59)",
              linestyle: 0,
              linewidth: 2,
              plottype: 2,
              trackPrice: false,
              transparency: 0,
            },
          },
        },
      ],
      disabled_features: [
        "use_localstorage_for_settings",
        "header_symbol_search",
        "symbol_info",
        "header_widget_dom_node",
        "legend_context_menu",
        "header_widget",
        "timeframes_toolbar",
      ],
      enabled_features: [
        "hide_last_na_study_output",
        "study_templates",
      ],
      overrides: {
        "paneProperties.background": "#0b0e11",
        "paneProperties.backgroundType": "solid",
        "paneProperties.legendProperties.showLegend": false,
        "scalesProperties.backgroundColor": "#0b0e11",
        "mainSeriesProperties.candleStyle.upColor": "#26a69a",
        "mainSeriesProperties.candleStyle.downColor": "#ef5350",
        "mainSeriesProperties.candleStyle.wickUpColor": "#26a69a",
        "mainSeriesProperties.candleStyle.wickDownColor": "#ef5350",
        "mainSeriesProperties.candleStyle.borderUpColor": "#26a69a",
        "mainSeriesProperties.candleStyle.borderDownColor": "#ef5350",
        // EMA color overrides
        "studies.MAExp@tv-basicstudies.plot.color": "#FFEB3B",
      },
    };

    // Create widget using TradingView's widget script
    if (window.TradingView) {
      try {
        const widget = new window.TradingView.widget(widgetOptions);
        return widget;
      } catch (error) {
        console.error('Failed to create TradingView widget:', error);
        return null;
      }
    }
    return null;
  };

  // Load TradingView script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = () => {
      if (containerRef.current && !widgetRef.current) {
        containerRef.current.id = "tradingview_main";
        widgetRef.current = createWidget(containerRef.current, false);
      }
    };
    
    // Check if script already exists
    const existingScript = document.querySelector('script[src="https://s3.tradingview.com/tv.js"]');
    if (!existingScript) {
      document.head.appendChild(script);
    } else if (window.TradingView && containerRef.current && !widgetRef.current) {
      containerRef.current.id = "tradingview_main";
      widgetRef.current = createWidget(containerRef.current, false);
    }

    return () => {
      // Cleanup
      if (widgetRef.current) {
        try {
          widgetRef.current.remove?.();
          widgetRef.current = null;
        } catch (e) {
          // Widget may already be removed
        }
      }
    };
  }, []);

  // Update widget when symbol or interval changes
  useEffect(() => {
    if (window.TradingView && containerRef.current) {
      // Remove old widget
      if (widgetRef.current) {
        try {
          widgetRef.current.remove?.();
          widgetRef.current = null;
        } catch (e) {
          // Ignore
        }
      }
      
      // Create new widget
      containerRef.current.id = "tradingview_main";
      widgetRef.current = createWidget(containerRef.current, false);
    }
  }, [currentSymbol, klineInterval]);

  // Handle fullscreen widget
  useEffect(() => {
    if (
      isChartFullscreen &&
      fullscreenContainerRef.current &&
      window.TradingView
    ) {
      fullscreenContainerRef.current.id = "tradingview_fullscreen";
      fullscreenWidgetRef.current = createWidget(
        fullscreenContainerRef.current,
        true,
      );
    }

    return () => {
      if (fullscreenWidgetRef.current) {
        try {
          fullscreenWidgetRef.current.remove?.();
          fullscreenWidgetRef.current = null;
        } catch (e) {
          // Widget may already be removed
        }
      }
    };
  }, [isChartFullscreen, currentSymbol, klineInterval]);

  return (
    <>
      <div className={clsx("flex flex-col bg-[#0b0e11]", className)}>
        {/* Custom Header with Timeframe Selector */}
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-800 bg-[#0b0e11]">
          <div className="flex items-center gap-1">
            {/* Symbol */}
            <span className="text-white font-medium text-sm mr-3">
              {currentSymbol || "BTCUSDT"}
            </span>

            {/* Interval buttons */}
            {INTERVALS.map((int) => (
              <button
                key={int.value}
                onClick={() => handleIntervalChange(int.value)}
                className={clsx(
                  "px-2 py-1 text-xs rounded transition-colors",
                  klineInterval === int.value
                    ? "bg-yellow-500/20 text-yellow-500"
                    : "text-gray-400 hover:text-white hover:bg-gray-700",
                )}
              >
                {int.label}
              </button>
            ))}
          </div>

          {/* Chart controls */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-500">TradingView</span>
            <button
              onClick={() => setChartFullscreen(!isChartFullscreen)}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
              title="Fullscreen"
            >
              <Maximize2 size={14} />
            </button>
          </div>
        </div>

        {/* Chart Container - TradingView shows its own toolbar inside */}
        <div className="flex-1 min-h-0 bg-[#0b0e11]" style={{ position: 'relative', overflow: 'hidden', backgroundColor: '#0b0e11' }}>
          <div ref={containerRef} className="w-full h-full bg-[#0b0e11]" style={{ backgroundColor: '#0b0e11' }} />
        </div>
      </div>

      {/* Fullscreen Modal */}
      {isChartFullscreen && (
        <div className="fixed inset-0 z-50 bg-[#0b0e11]">
          {/* Fullscreen Header */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800 bg-[#0b0e11]">
            <div className="flex items-center gap-2">
              <span className="text-white font-medium">
                {currentSymbol || "BTCUSDT"}
              </span>

              {/* Interval buttons */}
              <div className="flex items-center gap-1 ml-4">
                {INTERVALS.map((int) => (
                  <button
                    key={int.value}
                    onClick={() => handleIntervalChange(int.value)}
                    className={clsx(
                      "px-3 py-1 text-sm rounded transition-colors",
                      klineInterval === int.value
                        ? "bg-yellow-500/20 text-yellow-500"
                        : "text-gray-400 hover:text-white hover:bg-gray-700",
                    )}
                  >
                    {int.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setChartFullscreen(false)}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
              title="Exit Fullscreen"
            >
              <Minimize2 size={18} />
            </button>
          </div>

          {/* Fullscreen Chart */}
          <div className="h-[calc(100vh-48px)] bg-[#0b0e11]" style={{ backgroundColor: '#0b0e11' }}>
            <div ref={fullscreenContainerRef} className="w-full h-full bg-[#0b0e11]" style={{ backgroundColor: '#0b0e11' }} />
          </div>
        </div>
      )}
    </>
  );
}

export default memo(TradingViewChart);
