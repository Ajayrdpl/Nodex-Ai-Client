import React, { useState, useEffect, useMemo, useRef } from "react";
import moment from "moment";
import {
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Activity,
  Maximize2,
  Minimize2,
  BarChart2,
  Sliders,
  Sparkles,
  Zap,
} from "lucide-react";

// ─── ULTRA-HIGH-PRECISION INSTITUTIONAL CANDLESTICK & NEON CHART ───────────
export const LiveDynamicTradingChart = ({ selectedCoin, tickDirection }) => {
  const [candles, setCandles] = useState([]);
  const [hoverData, setHoverData] = useState(null);
  const [chartMode, setChartMode] = useState("candle"); // "candle" | "area" | "line"
  const [timeframe, setTimeframe] = useState("1m");
  const [showMAs, setShowMAs] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mousePos, setMousePos] = useState({ x: null, y: null, price: null });

  const containerRef = useRef(null);

  // Generate 26 initial candles for optimal density across all screen sizes
  useEffect(() => {
    if (!selectedCoin) return;
    const base = selectedCoin.price;
    const count = 26;
    const initial = [];
    let current = base * 0.982;

    for (let i = 0; i < count; i++) {
      const delta = (Math.random() - 0.485) * (base * 0.007);
      const open = current;
      const close = Number((current + delta).toFixed(base < 1 ? 6 : 2));
      const high = Number(
        (Math.max(open, close) + Math.random() * (base * 0.0035)).toFixed(
          base < 1 ? 6 : 2
        )
      );
      const low = Number(
        (Math.min(open, close) - Math.random() * (base * 0.0035)).toFixed(
          base < 1 ? 6 : 2
        )
      );
      const volume = Math.floor(Math.random() * 320) + 80;
      current = close;

      initial.push({
        id: i,
        open,
        high,
        low,
        close,
        volume,
        time: moment()
          .subtract(count - i, "minutes")
          .format("HH:mm"),
      });
    }

    initial[initial.length - 1].close = selectedCoin.price;
    setCandles(initial);
  }, [selectedCoin?.id, timeframe]);

  // High frequency sub-second ticking for live candle "breathing"
  useEffect(() => {
    if (!selectedCoin) return;
    const tickInterval = setInterval(() => {
      setCandles((prev) => {
        if (!prev.length) return prev;
        const lastIdx = prev.length - 1;
        const last = prev[lastIdx];
        const base = selectedCoin.price;
        const microDelta = (Math.random() - 0.49) * (base * 0.0012);
        const newClose = Number(
          (last.close + microDelta).toFixed(base < 1 ? 6 : 2)
        );
        const newHigh = Math.max(last.high, newClose);
        const newLow = Math.min(last.low, newClose);
        const newVol = last.volume + Math.floor(Math.random() * 3);

        const updated = [...prev];
        updated[lastIdx] = {
          ...last,
          high: newHigh,
          low: newLow,
          close: newClose,
          volume: newVol,
        };
        return updated;
      });
    }, 400);

    return () => clearInterval(tickInterval);
  }, [selectedCoin?.price]);

  // Compute Scales and Coordinates for SVG
  const {
    minPrice,
    maxPrice,
    priceRange,
    ma7Points,
    ma25Points,
    activeCandle,
    highestCandle,
    lowestCandle,
    svgPoints,
  } = useMemo(() => {
    if (!candles.length) {
      return {
        minPrice: 0,
        maxPrice: 1,
        priceRange: 1,
        ma7Points: "",
        ma25Points: "",
        activeCandle: null,
        highestCandle: null,
        lowestCandle: null,
        svgPoints: [],
      };
    }

    const lows = candles.map((c) => c.low);
    const highs = candles.map((c) => c.high);
    const rawMin = Math.min(...lows);
    const rawMax = Math.max(...highs);
    const pad = (rawMax - rawMin) * 0.12 || rawMax * 0.015;
    const minP = rawMin - pad;
    const maxP = rawMax + pad;
    const range = maxP - minP || 1;

    const W = 900;
    const H = 340;
    const topPadding = 25;
    const bottomPadding = 55;
    const plotHeight = H - topPadding - bottomPadding;

    const scaleY = (val) =>
      topPadding + plotHeight - ((val - minP) / range) * plotHeight;
    const scaleX = (idx) => 25 + (idx / (candles.length - 1)) * (W - 105);

    const points = candles.map((c, i) => ({
      x: scaleX(i),
      yOpen: scaleY(c.open),
      yClose: scaleY(c.close),
      yHigh: scaleY(c.high),
      yLow: scaleY(c.low),
      volume: c.volume,
      candle: c,
    }));

    // Find Highest and Lowest points for watermarks
    let highest = points[0];
    let lowest = points[0];
    points.forEach((pt) => {
      if (pt.candle.high > highest.candle.high) highest = pt;
      if (pt.candle.low < lowest.candle.low) lowest = pt;
    });

    const ma7 = [];
    for (let i = 0; i < candles.length; i++) {
      const slice = candles.slice(Math.max(0, i - 6), i + 1);
      const avg = slice.reduce((a, b) => a + b.close, 0) / slice.length;
      ma7.push(`${scaleX(i).toFixed(1)},${scaleY(avg).toFixed(1)}`);
    }

    const ma25 = [];
    for (let i = 0; i < candles.length; i++) {
      const slice = candles.slice(Math.max(0, i - 14), i + 1);
      const avg = slice.reduce((a, b) => a + b.close, 0) / slice.length;
      ma25.push(`${scaleX(i).toFixed(1)},${scaleY(avg).toFixed(1)}`);
    }

    return {
      minPrice: minP,
      maxPrice: maxP,
      priceRange: range,
      ma7Points: ma7.join(" "),
      ma25Points: ma25.join(" "),
      activeCandle: points[points.length - 1],
      highestCandle: highest,
      lowestCandle: lowest,
      svgPoints: points,
    };
  }, [candles]);

  // Area Mode Path
  const areaPath = useMemo(() => {
    if (!svgPoints.length) return "";
    const line = svgPoints
      .map((p) => `${p.x.toFixed(1)},${p.yClose.toFixed(1)}`)
      .join(" L ");
    const firstX = svgPoints[0].x.toFixed(1);
    const lastX = svgPoints[svgPoints.length - 1].x.toFixed(1);
    return `M ${firstX},310 L ${line} L ${lastX},310 Z`;
  }, [svgPoints]);

  const linePath = useMemo(() => {
    if (!svgPoints.length) return "";
    return (
      `M ` +
      svgPoints
        .map((p) => `${p.x.toFixed(1)},${p.yClose.toFixed(1)}`)
        .join(" L ")
    );
  }, [svgPoints]);

  const yGridLines = useMemo(() => {
    const lines = [];
    const steps = 5;
    for (let i = 0; i <= steps; i++) {
      const p = minPrice + (priceRange / steps) * (steps - i);
      const y = 25 + (i / steps) * 245;
      lines.push({ y, price: p });
    }
    return lines;
  }, [minPrice, priceRange]);

  const latestCandle = candles[candles.length - 1];
  const isUpTrend = latestCandle && latestCandle.close >= latestCandle.open;

  const handlePointerInteraction = (clientX, clientY) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = clientX - rect.left;
    const mouseY = clientY - rect.top;
    const svgX = (mouseX / rect.width) * 900;

    let nearest = svgPoints[0];
    let minDist = 9999;
    svgPoints.forEach((p) => {
      const dist = Math.abs(p.x - svgX);
      if (dist < minDist) {
        minDist = dist;
        nearest = p;
      }
    });

    if (nearest) {
      setMousePos({
        x: nearest.x,
        y: nearest.yClose,
        screenX: mouseX,
        screenY: mouseY,
        price: nearest.candle.close,
      });
      setHoverData(nearest.candle);
    }
  };

  const handleMouseMove = (e) => {
    handlePointerInteraction(e.clientX, e.clientY);
  };

  const handleTouchMove = (e) => {
    if (e.touches && e.touches[0]) {
      handlePointerInteraction(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handlePointerLeave = () => {
    setMousePos({ x: null, y: null, price: null });
    setHoverData(null);
  };

  if (!selectedCoin) return null;

  return (
    <div
      className={`bg-[#060D1A]/95 border-2 border-slate-800 hover:border-slate-700/80 rounded-3xl p-3 sm:p-5 shadow-2xl backdrop-blur-md space-y-3 transition-all duration-300 w-full max-w-full overflow-hidden ${
        isFullscreen ? "fixed inset-2 sm:inset-4 z-50 overflow-y-auto bg-slate-950 p-4 sm:p-6" : ""
      }`}
    >
      {/* ── 1. Header: Coin Pair + Live Price + 24h Performance HUD ── */}
      <div className="flex flex-col gap-2.5 border-b border-slate-800/90 pb-3">
        {/* Row 1: Coin Icon, Pair Title, Badge & Fullscreen */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative shrink-0">
              <img
                src={selectedCoin.icon}
                alt={selectedCoin.symbol}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl border border-cyan-500/40 bg-slate-950 p-1 shadow-md shadow-cyan-500/10 object-contain"
              />
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-950 ${
                  isUpTrend
                    ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]"
                    : "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.9)]"
                }`}
              />
            </div>

            <div className="min-w-0 flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-xl font-black text-white font-['Orbitron',monospace] tracking-wider truncate">
                {selectedCoin.pair}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shrink-0">
                PRO ENGINE
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-white border border-slate-800 transition shrink-0"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Chart"}
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>

        {/* Row 2: Live Price & 24h Performance Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <span
              className={`text-2xl sm:text-3xl font-black font-['Orbitron',monospace] tracking-tight transition-colors duration-200 ${
                tickDirection === "up"
                  ? "text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.6)]"
                  : "text-rose-400 drop-shadow-[0_0_12px_rgba(244,63,94,0.6)]"
              }`}
            >
              $
              {selectedCoin.price.toLocaleString(undefined, {
                minimumFractionDigits: selectedCoin.price < 1 ? 4 : 2,
                maximumFractionDigits: selectedCoin.price < 1 ? 6 : 2,
              })}
            </span>
            <span
              className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-bold flex items-center gap-0.5 shadow-md shrink-0 ${
                selectedCoin.change24h >= 0
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                  : "bg-rose-500/20 text-rose-400 border border-rose-500/40"
              }`}
            >
              {selectedCoin.change24h >= 0 ? (
                <ArrowUpRight size={12} />
              ) : (
                <ArrowDownRight size={12} />
              )}
              {selectedCoin.change24h >= 0 ? "+" : ""}
              {selectedCoin.change24h}%
            </span>
          </div>

          {/* 24h High / Low / Volume */}
          <div className="grid grid-cols-3 gap-2 bg-slate-950/90 px-3 py-1.5 rounded-xl border border-slate-800/80 font-mono text-xs shadow-inner w-full sm:w-auto text-center sm:text-left">
            <div className="min-w-0">
              <div className="text-[9px] text-slate-400 font-semibold uppercase truncate">
                24h High
              </div>
              <div className="font-extrabold text-emerald-400 text-xs truncate">
                ${selectedCoin.high24h || (selectedCoin.price * 1.03).toFixed(selectedCoin.price < 1 ? 4 : 2)}
              </div>
            </div>
            <div className="min-w-0">
              <div className="text-[9px] text-slate-400 font-semibold uppercase truncate">
                24h Low
              </div>
              <div className="font-extrabold text-rose-400 text-xs truncate">
                ${selectedCoin.low24h || (selectedCoin.price * 0.97).toFixed(selectedCoin.price < 1 ? 4 : 2)}
              </div>
            </div>
            <div className="min-w-0">
              <div className="text-[9px] text-slate-400 font-semibold uppercase truncate">
                24h Vol
              </div>
              <div className="font-extrabold text-cyan-400 text-xs truncate">
                {selectedCoin.volume}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Toolbar: Timeframes, Chart Mode, Indicators ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 text-xs">
        {/* Timeframe Buttons */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800/90 overflow-x-auto scrollbar-none w-full sm:w-auto">
          {["1s", "1m", "5m", "15m", "1h", "4h", "1D"].map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer text-xs shrink-0 ${
                timeframe === t
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-black shadow-md font-black"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* View Mode & Indicator Toggles */}
        <div className="flex items-center justify-between sm:justify-end gap-1.5 overflow-x-auto scrollbar-none w-full sm:w-auto">
          {/* Chart Types */}
          <div className="flex items-center bg-slate-950 p-0.5 rounded-xl border border-slate-800 shrink-0">
            <button
              onClick={() => setChartMode("candle")}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                chartMode === "candle"
                  ? "bg-cyan-500 text-black font-black shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              🕯️ Candles
            </button>
            <button
              onClick={() => setChartMode("area")}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                chartMode === "area"
                  ? "bg-cyan-500 text-black font-black shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              📈 Area
            </button>
            <button
              onClick={() => setChartMode("line")}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                chartMode === "line"
                  ? "bg-cyan-500 text-black font-black shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              ⚡ Line
            </button>
          </div>

          {/* MA Legend & Toggle */}
          <button
            onClick={() => setShowMAs(!showMAs)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-xl border text-xs font-mono transition shrink-0 ${
              showMAs
                ? "bg-slate-950 border-slate-700 text-white"
                : "bg-slate-950/50 border-slate-900 text-slate-500 opacity-60"
            }`}
          >
            <span className="flex items-center gap-1 text-amber-400 font-bold text-[11px]">
              <span className="w-1.5 h-0.5 bg-amber-400 rounded-full" /> MA7
            </span>
            <span className="flex items-center gap-1 text-cyan-400 font-bold text-[11px]">
              <span className="w-1.5 h-0.5 bg-cyan-400 rounded-full" /> MA25
            </span>
          </button>
        </div>
      </div>

      {/* ── 3. High-Definition Dynamic Hover Tooltip HUD ── */}
      <div className="min-h-7 flex items-center justify-between text-xs font-mono text-slate-400 px-2.5 py-1 bg-slate-950 rounded-xl border border-slate-900 overflow-x-auto scrollbar-none">
        {hoverData ? (
          <div className="flex items-center gap-2.5 sm:gap-4 font-semibold whitespace-nowrap text-[10px] sm:text-xs">
            <span className="text-cyan-300">
              TIME: <strong className="text-white">{hoverData.time}</strong>
            </span>
            <span>
              O: <strong className="text-slate-200">${hoverData.open}</strong>
            </span>
            <span>
              H: <strong className="text-emerald-400">${hoverData.high}</strong>
            </span>
            <span>
              L: <strong className="text-rose-400">${hoverData.low}</strong>
            </span>
            <span>
              C:{" "}
              <strong
                className={
                  hoverData.close >= hoverData.open
                    ? "text-emerald-400"
                    : "text-rose-400"
                }
              >
                ${hoverData.close}
              </strong>
            </span>
            <span>
              VOL: <strong className="text-purple-400">{hoverData.volume}k</strong>
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full whitespace-nowrap text-[10px] sm:text-xs">
            <span className="flex items-center gap-1.5 text-cyan-300 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              Live Market Candlestick Feed
            </span>
            <span className="text-slate-500 text-[10px] hidden sm:inline">
              Touch / hover chart for price data
            </span>
          </div>
        )}
      </div>

      {/* ── 4. EXPANSIVE HIGH-DEFINITION SVG TRADING GRAPH CANVAS ── */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handlePointerLeave}
        onTouchStart={handleTouchMove}
        onTouchMove={handleTouchMove}
        onTouchEnd={handlePointerLeave}
        className="relative h-56 sm:h-72 md:h-[340px] w-full bg-[#040A14] rounded-2xl p-1 sm:p-3 border border-slate-800/90 overflow-hidden select-none cursor-crosshair shadow-inner touch-none"
      >
        <svg
          viewBox="0 0 900 340"
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="neonGlowGrad2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00D2FF" stopOpacity="0.45" />
              <stop offset="50%" stopColor="#0066FF" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#0066FF" stopOpacity="0.0" />
            </linearGradient>

            <linearGradient id="bullBodyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00E676" />
              <stop offset="100%" stopColor="#00B050" />
            </linearGradient>

            <linearGradient id="bearBodyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF3366" />
              <stop offset="100%" stopColor="#D81B60" />
            </linearGradient>

            <filter id="bullGlow2" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            <filter id="bearGlow2" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            <filter id="laserGlow2" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Horizontal Grid Lines & Right Price Scale */}
          {yGridLines.map((grid, idx) => (
            <g key={idx}>
              <line
                x1="20"
                y1={grid.y}
                x2="800"
                y2={grid.y}
                stroke="#122034"
                strokeWidth="1"
                strokeDasharray="4,4"
              />
              <text
                x="810"
                y={grid.y + 3.5}
                fill="#4B6584"
                fontSize="9"
                fontFamily="monospace"
                fontWeight="bold"
              >
                ${grid.price < 1 ? grid.price.toFixed(4) : grid.price.toFixed(2)}
              </text>
            </g>
          ))}

          {/* Time Labels on X-Axis */}
          {svgPoints.filter((_, i) => i % 5 === 0).map((pt, idx) => (
            <text
              key={`time-${idx}`}
              x={pt.x}
              y="330"
              fill="#4B6584"
              fontSize="8.5"
              fontFamily="monospace"
              textAnchor="middle"
            >
              {pt.candle.time}
            </text>
          ))}

          {/* Area Mode: Neon Wave */}
          {chartMode === "area" && (
            <>
              <path d={areaPath} fill="url(#neonGlowGrad2)" />
              <path
                d={linePath}
                fill="none"
                stroke="#00D2FF"
                strokeWidth="2.8"
                filter="url(#laserGlow2)"
              />
            </>
          )}

          {/* Line Mode */}
          {chartMode === "line" && (
            <path
              d={linePath}
              fill="none"
              stroke="#00E5FF"
              strokeWidth="2.5"
              filter="url(#laserGlow2)"
            />
          )}

          {/* Moving Average Curves (MA7 & MA25) */}
          {showMAs && (
            <>
              <polyline
                points={ma7Points}
                fill="none"
                stroke="#F59E0B"
                strokeWidth="1.8"
                strokeOpacity="0.85"
              />
              <polyline
                points={ma25Points}
                fill="none"
                stroke="#00D2FF"
                strokeWidth="1.8"
                strokeOpacity="0.8"
              />
            </>
          )}

          {/* Candlesticks Mode */}
          {chartMode === "candle" &&
            svgPoints.map((pt, idx) => {
              const isBull = pt.candle.close >= pt.candle.open;
              const isLast = idx === svgPoints.length - 1;
              const bodyTop = Math.min(pt.yOpen, pt.yClose);
              const bodyHeight = Math.max(3.5, Math.abs(pt.yClose - pt.yOpen));
              const strokeColor = isBull ? "#00E676" : "#FF3366";
              const candleWidth = 17;

              return (
                <g key={idx} className="transition-all duration-300">
                  {/* High/Low Upper & Lower Wicks */}
                  <line
                    x1={pt.x}
                    y1={pt.yHigh}
                    x2={pt.x}
                    y2={pt.yLow}
                    stroke={strokeColor}
                    strokeWidth="1.8"
                    strokeOpacity="0.85"
                  />
                  {/* Candle Body */}
                  <rect
                    x={pt.x - candleWidth / 2}
                    y={bodyTop}
                    width={candleWidth}
                    height={bodyHeight}
                    rx="2"
                    fill={isBull ? "url(#bullBodyGrad)" : "url(#bearBodyGrad)"}
                    stroke={strokeColor}
                    strokeWidth="1"
                    filter={
                      isLast
                        ? isBull
                          ? "url(#bullGlow2)"
                          : "url(#bearGlow2)"
                        : undefined
                    }
                    className={isLast ? "animate-pulse" : ""}
                  />
                  {/* Live Ping on Current Candle */}
                  {isLast && (
                    <circle
                      cx={pt.x}
                      cy={pt.yClose}
                      r="6"
                      fill={strokeColor}
                      fillOpacity="0.35"
                      className="animate-ping"
                    />
                  )}
                </g>
              );
            })}

          {/* High / Low Watermark Flags */}
          {highestCandle && (
            <g transform={`translate(${highestCandle.x}, ${highestCandle.yHigh - 12})`}>
              <rect
                x="-30"
                y="-11"
                width="60"
                height="14"
                rx="4"
                fill="#065F46"
                stroke="#10B981"
                strokeWidth="0.8"
              />
              <text
                x="0"
                y="-2"
                fill="#6EE7B7"
                fontSize="7.5"
                fontWeight="bold"
                fontFamily="monospace"
                textAnchor="middle"
              >
                ▲ ${highestCandle.candle.high}
              </text>
            </g>
          )}

          {lowestCandle && (
            <g transform={`translate(${lowestCandle.x}, ${lowestCandle.yLow + 14})`}>
              <rect
                x="-30"
                y="-11"
                width="60"
                height="14"
                rx="4"
                fill="#881337"
                stroke="#F43F5E"
                strokeWidth="0.8"
              />
              <text
                x="0"
                y="-2"
                fill="#FDA4AF"
                fontSize="7.5"
                fontWeight="bold"
                fontFamily="monospace"
                textAnchor="middle"
              >
                ▼ ${lowestCandle.candle.low}
              </text>
            </g>
          )}

          {/* Volume Histogram Bars (Lower Third) */}
          {svgPoints.map((pt, idx) => {
            const isBull = pt.candle.close >= pt.candle.open;
            const barH = (pt.volume / 400) * 32;
            const barY = 315 - barH;
            return (
              <rect
                key={`vol-${idx}`}
                x={pt.x - 6}
                y={barY}
                width="12"
                height={barH}
                rx="1"
                fill={isBull ? "#00E676" : "#FF3366"}
                fillOpacity="0.3"
              />
            );
          })}

          {/* Real-time Dynamic Laser Price Ray */}
          {activeCandle && (
            <g>
              <line
                x1="20"
                y1={activeCandle.yClose}
                x2="800"
                y2={activeCandle.yClose}
                stroke={isUpTrend ? "#00E676" : "#FF3366"}
                strokeWidth="1.4"
                strokeDasharray="4,4"
                filter="url(#laserGlow2)"
              />
              <circle
                cx={activeCandle.x}
                cy={activeCandle.yClose}
                r="4.5"
                fill={isUpTrend ? "#00E676" : "#FF3366"}
                filter="url(#laserGlow2)"
              />
              {/* Right Axis Glowing Tag */}
              <g transform={`translate(800, ${activeCandle.yClose - 10})`}>
                <rect
                  x="0"
                  y="0"
                  width="88"
                  height="20"
                  rx="5"
                  fill={isUpTrend ? "#00E676" : "#FF3366"}
                  className="shadow-xl"
                />
                <text
                  x="44"
                  y="13.5"
                  fill="#000000"
                  fontSize="9"
                  fontWeight="900"
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  $
                  {selectedCoin.price < 1
                    ? selectedCoin.price.toFixed(4)
                    : selectedCoin.price.toFixed(2)}
                </text>
              </g>
            </g>
          )}

          {/* Interactive Precision Crosshair & Magnetic Tooltip */}
          {mousePos.x !== null && (
            <g>
              <line
                x1={mousePos.x}
                y1="25"
                x2={mousePos.x}
                y2="315"
                stroke="#00D2FF"
                strokeWidth="1"
                strokeDasharray="3,3"
                strokeOpacity="0.8"
              />
              <line
                x1="20"
                y1={mousePos.y}
                x2="800"
                y2={mousePos.y}
                stroke="#00D2FF"
                strokeWidth="1"
                strokeDasharray="3,3"
                strokeOpacity="0.8"
              />
              <circle
                cx={mousePos.x}
                cy={mousePos.y}
                r="4.5"
                fill="#00D2FF"
                stroke="#FFFFFF"
                strokeWidth="1.8"
              />
            </g>
          )}
        </svg>
      </div>

      {/* ── 5. Technical Indicators Quick HUD ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-800/80 text-xs font-mono">
        <div className="p-1.5 sm:p-2 rounded-xl bg-slate-950/80 border border-slate-900 flex justify-between items-center">
          <span className="text-slate-500 text-[9px] sm:text-[10px]">RSI(14)</span>
          <span className="text-cyan-400 font-bold text-[10px] sm:text-xs">64.2 (Neutral)</span>
        </div>
        <div className="p-1.5 sm:p-2 rounded-xl bg-slate-950/80 border border-slate-900 flex justify-between items-center">
          <span className="text-slate-500 text-[9px] sm:text-[10px]">MACD</span>
          <span className="text-emerald-400 font-bold text-[10px] sm:text-xs">+18.4 (Bullish)</span>
        </div>
        <div className="p-1.5 sm:p-2 rounded-xl bg-slate-950/80 border border-slate-900 flex justify-between items-center">
          <span className="text-slate-500 text-[9px] sm:text-[10px]">ATR Volatility</span>
          <span className="text-amber-400 font-bold text-[10px] sm:text-xs">0.82%</span>
        </div>
        <div className="p-1.5 sm:p-2 rounded-xl bg-slate-950/80 border border-slate-900 flex justify-between items-center">
          <span className="text-slate-500 text-[9px] sm:text-[10px]">Latency</span>
          <span className="text-emerald-400 font-bold text-[10px] sm:text-xs">0.42 ms</span>
        </div>
      </div>
    </div>
  );
};

export default LiveDynamicTradingChart;
