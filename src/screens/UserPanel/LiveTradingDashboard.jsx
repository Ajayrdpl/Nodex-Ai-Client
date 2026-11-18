import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Zap,
  Activity,
  DollarSign,
  Wallet,
  Shield,
  Search,
  ChevronRight,
  ChevronLeft,
  Clock,
  Sparkles,
  Bot,
  Layers,
  ArrowRight,
  CheckCircle2,
  X,
  SlidersHorizontal,
  BarChart3,
  Flame,
  Globe2,
  Lock,
  PieChart,
  User,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  Radio,
  Sliders,
  ShieldCheck,
  Award,
  Check,
  Target,
} from "lucide-react";
import { toast } from "react-toastify";
import moment from "moment";
import { AuthenticatedUserRouters } from "../../constants/routes";
import { NumberFormatCommas } from "../../utils/FormatText";
import { maskWalletAddress } from "../../utils/additionalFunc";
import LiveTradingHeroSlider, {
  TRADING_HERO_SLIDES,
  INITIAL_COINS_LIST,
} from "../../components/Screen/UserPanel/LiveTradingHeroSlider";
import LiveDynamicTradingChart from "../../components/Screen/UserPanel/LiveDynamicTradingChart";




// ─── INITIAL LIVE TRADES STREAM ─────────────────────────────────────────────
const INITIAL_TRADE_STREAM = [
  { id: 1, price: 83274.89, amount: 0.452, time: "10:34:12", side: "buy" },
  { id: 2, price: 83274.50, amount: 1.120, time: "10:34:11", side: "buy" },
  { id: 3, price: 83273.80, amount: 0.085, time: "10:34:10", side: "sell" },
  { id: 4, price: 83275.10, amount: 2.450, time: "10:34:09", side: "buy" },
  { id: 5, price: 83273.00, amount: 0.620, time: "10:34:08", side: "sell" },
  { id: 6, price: 83275.50, amount: 0.310, time: "10:34:07", side: "buy" },
  { id: 7, price: 83274.10, amount: 0.950, time: "10:34:06", side: "sell" },
];

// ─── INITIAL ACTIVE POSITIONS ───────────────────────────────────────────────
const INITIAL_POSITIONS = [
  {
    id: "pos-1",
    symbol: "BTC / USDT",
    side: "long",
    leverage: "20x",
    entryPrice: 82450.0,
    markPrice: 83274.89,
    margin: 500.0,
    size: 10000.0,
    pnl: 200.22,
    pnlPercent: 40.04,
    liqPrice: 78500.0,
  },
  {
    id: "pos-2",
    symbol: "ETH / USDT",
    side: "long",
    leverage: "15x",
    entryPrice: 2620.5,
    markPrice: 2674.03,
    margin: 300.0,
    size: 4500.0,
    pnl: 91.82,
    pnlPercent: 30.61,
    liqPrice: 2460.0,
  },
  {
    id: "pos-3",
    symbol: "VC / USDT",
    side: "long",
    leverage: "10x",
    entryPrice: 0.0575,
    markPrice: 0.060397,
    margin: 200.0,
    size: 2000.0,
    pnl: 100.77,
    pnlPercent: 50.38,
    liqPrice: 0.052,
  },
];





// ─── MAIN LIVE TRADING DASHBOARD ───────────────────────────────────────────
const LiveTradingDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [coins, setCoins] = useState(INITIAL_COINS_LIST);
  const [selectedCoin, setSelectedCoin] = useState(INITIAL_COINS_LIST[0]);
  const [tradeStream, setTradeStream] = useState(INITIAL_TRADE_STREAM);
  const [positions, setPositions] = useState(INITIAL_POSITIONS);

  const [orderSide, setOrderSide] = useState("buy");
  const [orderType, setOrderType] = useState("market");
  const [orderAmount, setOrderAmount] = useState("100");
  const [leverage, setLeverage] = useState("20x");
  const [searchQuery, setSearchQuery] = useState("");
  const [tickDirection, setTickDirection] = useState("up");

  // Real-time market tick and order generation
  useEffect(() => {
    const interval = setInterval(() => {
      setCoins((prev) =>
        prev.map((coin) => {
          const delta = (Math.random() - 0.49) * 0.003;
          const newPrice = Number((coin.price * (1 + delta)).toFixed(coin.price < 1 ? 6 : 2));
          const newChange = Number((coin.change24h + (Math.random() - 0.5) * 0.08).toFixed(2));
          const newSparkline = [...coin.sparkline.slice(1), newPrice];

          if (coin.id === selectedCoin.id) {
            setTickDirection(delta >= 0 ? "up" : "down");
          }

          return {
            ...coin,
            price: newPrice,
            change24h: newChange,
            sparkline: newSparkline,
          };
        })
      );

      const randomSide = Math.random() > 0.45 ? "buy" : "sell";
      const randomAmount = Number((Math.random() * 1.8 + 0.05).toFixed(3));
      const deltaPrice = (Math.random() - 0.5) * (selectedCoin.price * 0.002);
      const newTradePrice = Number((selectedCoin.price + deltaPrice).toFixed(selectedCoin.price < 1 ? 6 : 2));

      setTradeStream((prev) => [
        {
          id: Date.now(),
          price: newTradePrice,
          amount: randomAmount,
          time: moment().format("HH:mm:ss"),
          side: randomSide,
        },
        ...prev.slice(0, 7),
      ]);
    }, 1200);

    return () => clearInterval(interval);
  }, [selectedCoin]);

  const orderBookAsks = useMemo(() => {
    const base = selectedCoin.price;
    return [
      { price: Number((base * 1.0025).toFixed(base < 1 ? 6 : 2)), amount: 2.14, depth: 85 },
      { price: Number((base * 1.0020).toFixed(base < 1 ? 6 : 2)), amount: 1.45, depth: 65 },
      { price: Number((base * 1.0015).toFixed(base < 1 ? 6 : 2)), amount: 0.95, depth: 45 },
      { price: Number((base * 1.0010).toFixed(base < 1 ? 6 : 2)), amount: 3.82, depth: 95 },
      { price: Number((base * 1.0005).toFixed(base < 1 ? 6 : 2)), amount: 0.54, depth: 28 },
    ];
  }, [selectedCoin]);

  const orderBookBids = useMemo(() => {
    const base = selectedCoin.price;
    return [
      { price: Number((base * 0.9995).toFixed(base < 1 ? 6 : 2)), amount: 1.85, depth: 60 },
      { price: Number((base * 0.9990).toFixed(base < 1 ? 6 : 2)), amount: 4.12, depth: 98 },
      { price: Number((base * 0.9985).toFixed(base < 1 ? 6 : 2)), amount: 0.72, depth: 32 },
      { price: Number((base * 0.9980).toFixed(base < 1 ? 6 : 2)), amount: 2.65, depth: 75 },
      { price: Number((base * 0.9975).toFixed(base < 1 ? 6 : 2)), amount: 1.20, depth: 50 },
    ];
  }, [selectedCoin]);

  const filteredCoins = useMemo(() => {
    let list = [...coins];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q));
    }
    return list;
  }, [coins, searchQuery]);

  const handleExecuteTrade = () => {
    const amt = parseFloat(orderAmount);
    if (!amt || amt <= 0) {
      toast.warning("Please enter a valid trade amount in USDT");
      return;
    }

    const levNum = parseInt(leverage) || 10;
    const newPos = {
      id: `pos-${Date.now()}`,
      symbol: selectedCoin.pair,
      side: orderSide,
      leverage: leverage,
      entryPrice: selectedCoin.price,
      markPrice: selectedCoin.price,
      margin: amt,
      size: amt * levNum,
      pnl: 0.0,
      pnlPercent: 0.0,
      liqPrice: orderSide === "buy" ? selectedCoin.price * 0.92 : selectedCoin.price * 1.08,
    };

    setPositions([newPos, ...positions]);
    toast.success(`⚡ Live ${orderSide.toUpperCase()} ${leverage} order executed for ${selectedCoin.symbol} ($${amt})!`);
  };

  const handleClosePosition = (id) => {
    setPositions(positions.filter((p) => p.id !== id));
    toast.info("Position closed and PnL credited to available balance");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-24 text-white px-2 sm:px-4">
      {/* ─────────────────────────────────────────────────────────────
          1. TOP 4-IMAGE HERO TRADING SLIDER
      ───────────────────────────────────────────────────────────── */}
      <LiveTradingHeroSlider
        onDeployBot={() => {
          setSelectedCoin(coins[0]);
          setOrderType("ai");
          toast.info("AI Quant Strategy loaded for NODEXAI (VC)");
        }}
      />

      {/* ─────────────────────────────────────────────────────────────
          2. STREAMING TICKER MARQUEE BAR
      ───────────────────────────────────────────────────────────── */}
      <div className="bg-[#091122]/90 border border-slate-800 rounded-2xl p-2.5 sm:p-3 flex items-center gap-3 sm:gap-4 overflow-hidden backdrop-blur-md shadow-lg">
        <div className="flex items-center gap-2 text-[11px] sm:text-xs font-black text-cyan-400 shrink-0 font-['Orbitron',monospace]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="hidden sm:inline">LIVE 24/7 TICKER</span>
          <span className="sm:hidden">LIVE</span>
        </div>
        <div className="flex items-center gap-3 sm:gap-6 overflow-x-auto scrollbar-none py-1 text-xs">
          {coins.map((c) => (
            <div
              key={c.id}
              onClick={() => setSelectedCoin(c)}
              className={`flex items-center gap-2 shrink-0 cursor-pointer px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl transition border text-xs ${
                selectedCoin.id === c.id
                  ? "bg-cyan-500/20 border-cyan-500/50 shadow-md shadow-cyan-500/10"
                  : "bg-slate-900/60 border-slate-800 hover:bg-slate-800/80"
              }`}
            >
              <img src={c.icon} alt={c.symbol} className="w-4 h-4 rounded-full" />
              <span className="font-bold">{c.symbol}</span>
              <span className="font-mono text-slate-300 font-bold">${c.price.toLocaleString()}</span>
              <span className={`font-mono text-[10px] sm:text-[11px] font-bold ${c.change24h >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {c.change24h >= 0 ? "+" : ""}{c.change24h}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. MAIN INSTITUTIONAL TRADING TERMINAL (RESPONSIVE GRID)
      ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ── LEFT COLUMN: MARKET WATCH & PAIR LIST (12 on mobile, 4 on xl, 3 on lg) ── */}
        <div className="order-2 lg:order-1 lg:col-span-4 xl:col-span-3 bg-[#08101E]/95 border border-slate-800 rounded-3xl p-4 space-y-4 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-black uppercase tracking-wider text-cyan-400 font-['Orbitron',monospace] flex items-center gap-1.5">
              <Activity size={14} /> Market Watch
            </span>
            <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded-full text-slate-400 border border-slate-800">
              {coins.length} Pairs
            </span>
          </div>

          {/* Search Pair */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pair (e.g. BTC, VC)..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-8 pr-3 text-xs text-white placeholder-slate-500 focus:border-cyan-400 outline-none"
            />
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          </div>

          {/* Coin List */}
          <div className="space-y-1.5 max-h-[380px] lg:max-h-[460px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 pr-1">
            {filteredCoins.map((coin) => {
              const isSelected = selectedCoin.id === coin.id;
              return (
                <div
                  key={coin.id}
                  onClick={() => setSelectedCoin(coin)}
                  className={`p-2.5 rounded-2xl flex items-center justify-between cursor-pointer transition border ${
                    isSelected
                      ? "bg-gradient-to-r from-cyan-950/60 to-slate-900 border-cyan-500/50 shadow-lg shadow-cyan-500/10"
                      : "bg-slate-950/50 border-slate-900 hover:bg-slate-900/60 hover:border-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <img src={coin.icon} alt={coin.symbol} className="w-7 h-7 rounded-full border border-slate-700 bg-slate-900 shrink-0" />
                    <div>
                      <div className="font-bold text-xs text-white flex items-center gap-1">
                        {coin.symbol}
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[80px] sm:max-w-[100px]">{coin.name}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono text-xs font-bold text-white">${coin.price.toLocaleString()}</div>
                    <div className={`text-[10px] font-mono font-bold ${coin.change24h >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      {coin.change24h >= 0 ? "+" : ""}{coin.change24h}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* AI Sentiment Box */}
          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800/80 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-semibold">AI Market Sentiment</span>
              <span className="text-emerald-400 font-bold font-mono">78% BULLISH</span>
            </div>
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden flex">
              <div className="bg-emerald-400 h-full w-[78%] transition-all" />
              <div className="bg-rose-500 h-full w-[22%]" />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Greed Index</span>
              <span>Sub-second AI Signal</span>
            </div>
          </div>
        </div>

        {/* ── MIDDLE COLUMN: ULTRA-DYNAMIC LIVE CHART & TRADE CONSOLE (12 on mobile, 8 on lg, 6 on xl) ── */}
        <div className="order-1 lg:order-2 lg:col-span-8 xl:col-span-6 space-y-5">
          {/* Main Candlestick & Glow Reflection Chart */}
          <LiveDynamicTradingChart
            selectedCoin={selectedCoin}
            tickDirection={tickDirection}
          />

          {/* Order Placement Console */}
          <div className="bg-[#08101E]/95 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl backdrop-blur-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {[
                  { id: "market", label: "Market" },
                  { id: "limit", label: "Limit" },
                  { id: "ai", label: "🤖 AI Bot" },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setOrderType(t.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      orderType === t.id ? "bg-cyan-500 text-black shadow-md shadow-cyan-500/20 font-black" : "bg-slate-900 text-slate-400 hover:text-white"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Leverage Selector */}
              <div className="flex items-center gap-1 text-xs bg-slate-950 px-2 py-1 rounded-xl border border-slate-800 overflow-x-auto">
                <span className="text-slate-500 text-[10px] font-bold">LEV:</span>
                {["5x", "10x", "20x", "50x", "100x"].map((lev) => (
                  <button
                    key={lev}
                    onClick={() => setLeverage(lev)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      leverage === lev ? "bg-cyan-500 text-black font-black" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {lev}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount and Percentages */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                <div className="relative flex-1">
                  <input
                    type="number"
                    value={orderAmount}
                    onChange={(e) => setOrderAmount(e.target.value)}
                    placeholder="Enter USDT Amount"
                    className="w-full bg-slate-950 border border-slate-700 rounded-2xl py-3 pl-4 pr-16 text-sm font-bold text-white outline-none focus:border-cyan-400 font-mono"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">USDT</span>
                </div>

                <div className="grid grid-cols-4 sm:flex gap-1.5">
                  {["25%", "50%", "75%", "100%"].map((pct) => (
                    <button
                      key={pct}
                      onClick={() => setOrderAmount((parseInt(pct) * 2).toString())}
                      className="px-2.5 py-2.5 sm:py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 transition text-center cursor-pointer"
                    >
                      {pct}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dual Action Buttons */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <button
                  onClick={() => {
                    setOrderSide("buy");
                    handleExecuteTrade();
                  }}
                  className="py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-black text-xs sm:text-sm font-['Orbitron',monospace] shadow-lg shadow-emerald-500/25 active:scale-95 transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  🟢 BUY / LONG
                </button>
                <button
                  onClick={() => {
                    setOrderSide("sell");
                    handleExecuteTrade();
                  }}
                  className="py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white font-black text-xs sm:text-sm font-['Orbitron',monospace] shadow-lg shadow-rose-500/25 active:scale-95 transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  🔴 SELL / SHORT
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: LIVE ORDER BOOK & TRADE STREAM (12 on mobile/tablet, 3 on xl) ── */}
        <div className="order-3 lg:col-span-12 xl:col-span-3 bg-[#08101E]/95 border border-slate-800 rounded-3xl p-4 space-y-4 shadow-xl backdrop-blur-md">
          {/* Order Book Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-black uppercase tracking-wider text-cyan-400 font-['Orbitron',monospace] flex items-center gap-1.5">
              <Layers size={14} /> Order Book
            </span>
            <span className="text-[10px] text-slate-500 font-mono">0.01 Spread</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-4">
            {/* Order Book Bids/Asks */}
            <div className="space-y-2">
              {/* Asks (Sell Orders - Red) */}
              <div className="space-y-1 text-[11px] font-mono">
                {orderBookAsks.map((ask, idx) => (
                  <div key={idx} className="relative flex justify-between items-center py-0.5 px-2 rounded overflow-hidden">
                    <div
                      style={{ width: `${ask.depth}%` }}
                      className="absolute right-0 top-0 bottom-0 bg-rose-500/15 pointer-events-none rounded"
                    />
                    <span className="text-rose-400 font-bold z-10">${ask.price}</span>
                    <span className="text-slate-400 z-10">{ask.amount}</span>
                  </div>
                ))}
              </div>

              {/* Mid Spread Indicator */}
              <div className="py-2 px-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-cyan-400 font-bold font-mono text-xs sm:text-sm">${selectedCoin.price.toLocaleString()}</span>
                <span className="text-[10px] text-emerald-400 font-bold">● L3 SPREAD</span>
              </div>

              {/* Bids (Buy Orders - Green) */}
              <div className="space-y-1 text-[11px] font-mono">
                {orderBookBids.map((bid, idx) => (
                  <div key={idx} className="relative flex justify-between items-center py-0.5 px-2 rounded overflow-hidden">
                    <div
                      style={{ width: `${bid.depth}%` }}
                      className="absolute right-0 top-0 bottom-0 bg-emerald-500/15 pointer-events-none rounded"
                    />
                    <span className="text-emerald-400 font-bold z-10">${bid.price}</span>
                    <span className="text-slate-400 z-10">{bid.amount}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Recent Trade Feed */}
            <div className="pt-2 md:pt-0 xl:pt-2 border-t md:border-t-0 xl:border-t border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold uppercase">
                <span>Trade Stream</span>
                <span>Time</span>
              </div>
              <div className="space-y-1 text-[11px] font-mono max-h-44 overflow-hidden">
                {tradeStream.map((tr) => (
                  <div key={tr.id} className="flex justify-between items-center py-0.5">
                    <span className={tr.side === "buy" ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                      {tr.side === "buy" ? "▲" : "▼"} ${tr.price}
                    </span>
                    <span className="text-slate-300">{tr.amount}</span>
                    <span className="text-slate-500 text-[10px]">{tr.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. ACTIVE POSITIONS & BOT ORDERS TABLE (RESPONSIVE WRAPPER)
      ───────────────────────────────────────────────────────────── */}
      <div className="bg-[#08101E]/95 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 sm:pb-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <h3 className="text-sm sm:text-lg font-black text-white font-['Orbitron',monospace]">
              Active Positions & Open Orders
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              {positions.length} Live
            </span>
          </div>

          <button
            onClick={() => toast.success("All positions refreshed")}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition cursor-pointer"
          >
            <RefreshCw size={13} /> <span className="hidden sm:inline">Refresh PnL</span>
          </button>
        </div>

        {/* Responsive Table with horizontal scroll on mobile */}
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-800 pb-2">
          <table className="w-full text-left border-collapse text-xs min-w-[640px]">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                <th className="py-3 px-3">Position</th>
                <th className="py-3 px-3">Entry Price</th>
                <th className="py-3 px-3">Mark Price</th>
                <th className="py-3 px-3">Liq. Price</th>
                <th className="py-3 px-3">Margin</th>
                <th className="py-3 px-3">Unrealized PnL</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {positions.map((pos) => (
                <tr key={pos.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-3 font-bold font-sans">
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 sm:px-2 py-0.5 rounded text-[9px] sm:text-[10px] font-black ${
                        pos.side === "long" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40" : "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                      }`}>
                        {pos.side.toUpperCase()} {pos.leverage}
                      </span>
                      <span className="text-white text-xs">{pos.symbol}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-300">${pos.entryPrice}</td>
                  <td className="py-3 px-3 text-white font-bold">${pos.markPrice}</td>
                  <td className="py-3 px-3 text-rose-400">${pos.liqPrice}</td>
                  <td className="py-3 px-3 text-slate-300">${pos.margin.toFixed(2)}</td>
                  <td className="py-3 px-3 font-bold">
                    <span className={pos.pnl >= 0 ? "text-emerald-400" : "text-rose-400"}>
                      {pos.pnl >= 0 ? "+" : ""}${pos.pnl.toFixed(2)} ({pos.pnlPercent >= 0 ? "+" : ""}{pos.pnlPercent.toFixed(2)}%)
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-sans">
                    <button
                      onClick={() => handleClosePosition(pos.id)}
                      className="px-2.5 sm:px-3 py-1 rounded-xl bg-slate-800 hover:bg-rose-600/30 hover:border-rose-500 border border-slate-700 text-slate-300 hover:text-rose-300 text-[11px] sm:text-xs font-bold transition active:scale-95 cursor-pointer whitespace-nowrap"
                    >
                      Close
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LiveTradingDashboard;
