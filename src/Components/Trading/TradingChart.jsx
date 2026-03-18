/**
 * TradingChart Component
 * Price chart using lightweight-charts library
 */

import React, { useEffect, useRef, useState } from "react";
import { createChart, CrosshairMode } from "lightweight-charts";
import useMarketStore from "../../stores/marketStore";
import { Maximize2, Minimize2, X } from "lucide-react";
import clsx from "clsx";

const INTERVALS = [
  { label: "1m", value: "1" },
  { label: "5m", value: "5" },
  { label: "15m", value: "15" },
  { label: "1H", value: "60" },
  { label: "4H", value: "240" },
  { label: "1D", value: "D" },
  { label: "1W", value: "W" },
];

export default function TradingChart({ className }) {
  const chartContainerRef = useRef(null);
  const fullscreenChartRef = useRef(null);
  const chartRef = useRef(null);
  const fullscreenChartObjRef = useRef(null);
  const candlestickSeriesRef = useRef(null);
  const volumeSeriesRef = useRef(null);
  const fullscreenCandleSeriesRef = useRef(null);
  const fullscreenVolumeSeriesRef = useRef(null);
  const isInitialLoadRef = useRef(true);
  const prevKlinesLengthRef = useRef(0);

  const {
    currentSymbol,
    klines,
    klineInterval,
    setKlineInterval,
    fetchKlines,
    isChartFullscreen,
    setChartFullscreen,
  } = useMarketStore();
  const [chartType, setChartType] = useState("candle");

  // Handle interval change
  const handleIntervalChange = (interval) => {
    isInitialLoadRef.current = true;
    setKlineInterval(interval);
    fetchKlines(currentSymbol, interval);
  };

  // Process and sort klines data
  const processedKlines = React.useMemo(() => {
    if (!klines || klines.length === 0) return [];

    // Sort by time and deduplicate
    const uniqueMap = new Map();
    klines.forEach((k) => uniqueMap.set(k.time, k));
    return Array.from(uniqueMap.values()).sort((a, b) => a.time - b.time);
  }, [klines]);

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: "solid", color: "#0b0e11" },
        textColor: "#848e9c",
      },
      grid: {
        vertLines: { color: "#374151" },
        horzLines: { color: "#374151" },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: "#6b7280",
          width: 1,
          style: 2,
          labelBackgroundColor: "#374151",
        },
        horzLine: {
          color: "#6b7280",
          width: 1,
          style: 2,
          labelBackgroundColor: "#374151",
        },
      },
      rightPriceScale: {
        borderColor: "#374151",
        scaleMargins: {
          top: 0.1,
          bottom: 0.2,
        },
      },
      timeScale: {
        borderColor: "#374151",
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: {
        vertTouchDrag: false,
      },
    });

    // Create candlestick series
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderUpColor: "#22c55e",
      borderDownColor: "#ef4444",
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
    });

    // Create volume series
    const volumeSeries = chart.addHistogramSeries({
      color: "#6b7280",
      priceFormat: {
        type: "volume",
      },
      priceScaleId: "",
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });

    chartRef.current = chart;
    candlestickSeriesRef.current = candlestickSeries;
    volumeSeriesRef.current = volumeSeries;

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, []);

  // Update chart data when klines change
  useEffect(() => {
    if (!candlestickSeriesRef.current || !volumeSeriesRef.current) return;
    if (!processedKlines || processedKlines.length === 0) return;

    const candleData = processedKlines.map((k) => ({
      time: k.time,
      open: parseFloat(k.open),
      high: parseFloat(k.high),
      low: parseFloat(k.low),
      close: parseFloat(k.close),
    }));

    const volumeData = processedKlines.map((k) => ({
      time: k.time,
      value: parseFloat(k.volume),
      color:
        parseFloat(k.close) >= parseFloat(k.open) ? "#22c55e40" : "#ef444440",
    }));

    candlestickSeriesRef.current.setData(candleData);
    volumeSeriesRef.current.setData(volumeData);

    // Only fit content on initial load or when data significantly changes (new interval/symbol)
    if (
      isInitialLoadRef.current ||
      Math.abs(processedKlines.length - prevKlinesLengthRef.current) > 10
    ) {
      chartRef.current?.timeScale().fitContent();
      isInitialLoadRef.current = false;
    }
    prevKlinesLengthRef.current = processedKlines.length;
  }, [processedKlines]);

  // Update single kline (for real-time updates)
  useEffect(() => {
    if (
      !candlestickSeriesRef.current ||
      !processedKlines ||
      processedKlines.length === 0
    )
      return;

    const lastKline = processedKlines[processedKlines.length - 1];
    if (!lastKline) return;

    candlestickSeriesRef.current.update({
      time: lastKline.time,
      open: parseFloat(lastKline.open),
      high: parseFloat(lastKline.high),
      low: parseFloat(lastKline.low),
      close: parseFloat(lastKline.close),
    });

    volumeSeriesRef.current?.update({
      time: lastKline.time,
      value: parseFloat(lastKline.volume),
      color:
        parseFloat(lastKline.close) >= parseFloat(lastKline.open)
          ? "#22c55e40"
          : "#ef444440",
    });
  }, [processedKlines]);

  // Create fullscreen chart when opened
  useEffect(() => {
    if (!isChartFullscreen || !fullscreenChartRef.current) return;

    const chart = createChart(fullscreenChartRef.current, {
      layout: {
        background: { type: "solid", color: "#0b0e11" },
        textColor: "#848e9c",
      },
      grid: {
        vertLines: { color: "#1e2329" },
        horzLines: { color: "#1e2329" },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: "#6b7280",
          width: 1,
          style: 2,
          labelBackgroundColor: "#374151",
        },
        horzLine: {
          color: "#6b7280",
          width: 1,
          style: 2,
          labelBackgroundColor: "#374151",
        },
      },
      rightPriceScale: {
        borderColor: "#374151",
        scaleMargins: { top: 0.1, bottom: 0.2 },
      },
      timeScale: {
        borderColor: "#374151",
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderUpColor: "#22c55e",
      borderDownColor: "#ef4444",
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
    });

    const volumeSeries = chart.addHistogramSeries({
      color: "#6b7280",
      priceFormat: { type: "volume" },
      priceScaleId: "",
      scaleMargins: { top: 0.85, bottom: 0 },
    });

    fullscreenChartObjRef.current = chart;
    fullscreenCandleSeriesRef.current = candleSeries;
    fullscreenVolumeSeriesRef.current = volumeSeries;

    // Set data
    if (processedKlines && processedKlines.length > 0) {
      const candleData = processedKlines.map((k) => ({
        time: k.time,
        open: parseFloat(k.open),
        high: parseFloat(k.high),
        low: parseFloat(k.low),
        close: parseFloat(k.close),
      }));
      const volumeData = processedKlines.map((k) => ({
        time: k.time,
        value: parseFloat(k.volume),
        color:
          parseFloat(k.close) >= parseFloat(k.open) ? "#22c55e40" : "#ef444440",
      }));
      candleSeries.setData(candleData);
      volumeSeries.setData(volumeData);
      chart.timeScale().fitContent();
    }

    // Handle resize
    const handleResize = () => {
      if (fullscreenChartRef.current) {
        chart.applyOptions({
          width: fullscreenChartRef.current.clientWidth,
          height: fullscreenChartRef.current.clientHeight,
        });
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [isChartFullscreen, processedKlines]);

  // Close fullscreen on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setChartFullscreen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [setChartFullscreen]);

  return (
    <>
      <div
        className={clsx(
          "flex flex-col bg-[#0b0e11] overflow-hidden",
          className,
        )}
      >
        {/* Chart toolbar */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-800">
          {/* Symbol */}
          <div className="flex items-center gap-4">
            <span className="font-semibold text-white">{currentSymbol}</span>
          </div>

          {/* Interval selector */}
          <div className="flex items-center gap-1">
            {INTERVALS.map((interval) => (
              <button
                key={interval.value}
                onClick={() => handleIntervalChange(interval.value)}
                className={clsx(
                  "px-2 py-1 text-xs rounded transition-colors",
                  klineInterval === interval.value
                    ? "bg-yellow-500 text-gray-900 font-medium"
                    : "text-gray-400 hover:text-white hover:bg-gray-700",
                )}
              >
                {interval.label}
              </button>
            ))}
          </div>

          {/* Chart type toggle and maximize */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setChartType("candle")}
              className={clsx(
                "p-1.5 rounded text-xs",
                chartType === "candle"
                  ? "bg-gray-700 text-white"
                  : "text-gray-400 hover:text-white",
              )}
              title="Candlestick"
            >
              <CandleIcon />
            </button>
            <button
              onClick={() => setChartType("line")}
              className={clsx(
                "p-1.5 rounded text-xs",
                chartType === "line"
                  ? "bg-gray-700 text-white"
                  : "text-gray-400 hover:text-white",
              )}
              title="Line"
            >
              <LineIcon />
            </button>
            <div className="w-px h-4 bg-gray-700 mx-1" />
            <button
              onClick={() => setChartFullscreen(true)}
              className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
              title="Fullscreen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Chart container */}
        <div ref={chartContainerRef} className="flex-1 min-h-[300px]" />
      </div>

      {/* Fullscreen Modal */}
      {isChartFullscreen && (
        <div className="fixed inset-0 z-[100] bg-[#0b0e11] flex flex-col">
          {/* Fullscreen header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
            <div className="flex items-center gap-4">
              <span className="font-bold text-xl text-white">
                {currentSymbol}
              </span>
              <span className="text-gray-400 text-sm">USDT Perpetual</span>
            </div>

            {/* Interval selector */}
            <div className="flex items-center gap-1">
              {INTERVALS.map((interval) => (
                <button
                  key={interval.value}
                  onClick={() => handleIntervalChange(interval.value)}
                  className={clsx(
                    "px-3 py-1.5 text-sm rounded transition-colors",
                    klineInterval === interval.value
                      ? "bg-yellow-500 text-gray-900 font-medium"
                      : "text-gray-400 hover:text-white hover:bg-gray-700",
                  )}
                >
                  {interval.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setChartFullscreen(false)}
              className="p-2 rounded text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
              title="Exit Fullscreen (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Fullscreen chart */}
          <div ref={fullscreenChartRef} className="flex-1" />
        </div>
      )}
    </>
  );
}

// Simple candle icon
function CandleIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
      <rect x="3" y="2" width="2" height="12" rx="0.5" />
      <rect x="7" y="4" width="2" height="8" rx="0.5" />
      <rect x="11" y="3" width="2" height="10" rx="0.5" />
    </svg>
  );
}

// Simple line icon
function LineIcon() {
  return (
    <svg
      className="w-4 h-4"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M2 12 L5 8 L9 10 L14 4" />
    </svg>
  );
}
