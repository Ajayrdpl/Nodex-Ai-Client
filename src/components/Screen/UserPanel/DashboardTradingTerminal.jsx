import React, { useState, useEffect, useMemo } from "react";
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
  ShieldCheck,
  Target,
  Cpu,
  Check,
} from "lucide-react";
import { toast } from "react-toastify";
import LiveDynamicTradingChart from "./LiveDynamicTradingChart";
import { INITIAL_COINS_LIST } from "./LiveTradingHeroSlider";

// ─── INITIAL LIVE TRADES STREAM ─────────────────────────────────────────────
const INITIAL_TRADE_STREAM = [
  { id: 1, price: 83274.89, amount: 0.452, time: "10:34:12", side: "buy" },
  { id: 2, price: 83274.50, amount: 1.12, time: "10:34:11", side: "buy" },
  { id: 3, price: 83273.80, amount: 0.085, time: "10:34:10", side: "sell" },
  { id: 4, price: 83275.10, amount: 2.45, time: "10:34:09", side: "buy" },
  { id: 5, price: 83273.00, amount: 0.62, time: "10:34:08", side: "sell" },
  { id: 6, price: 83275.50, amount: 0.31, time: "10:34:07", side: "buy" },
  { id: 7, price: 83274.10, amount: 0.95, time: "10:34:06", side: "sell" },
];

// ─── INITIAL ACTIVE POSITIONS ───────────────────────────────────────────────
const INITIAL_POSITIONS = [
  {
    id: "pos-1",
    symbol: "VC / USDT",
    type: "Market Order",
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
  {
    id: "pos-2",
    symbol: "BTC / USDT",
    type: "AI Grid Bot",
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
    id: "pos-3",
    symbol: "ETH / USDT",
    type: "Limit Order",
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
];

// ─── AI STRATEGIES DEFINITION ──────────────────────────────────────────────
const AI_STRATEGIES = [
  {
    id: "scalper",
    name: "⚡ Grid Scalper",
    badge: "LOW RISK",
    badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
    estYield: "1.2% - 2.0%/Day",
    desc: "Sub-second spread micro-arbitrage.",
    recomLeverage: "10x",
  },
  {
    id: "dca",
    name: "🛡️ Safe DCA Bot",
    badge: "STABLE",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    estYield: "1.5% - 2.5%/Day",
    desc: "Fibonacci auto-dip compounding.",
    recomLeverage: "20x",
  },
  {
    id: "momentum",
    name: "🚀 Trend Momentum",
    badge: "HIGH YIELD",
    badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    estYield: "2.0% - 3.5%/Day",
    desc: "MACD & RSI breakout wave engine.",
    recomLeverage: "50x",
  },
];

export const DashboardTradingTerminal = ({
  coinsList,
  selectedCoinState,
  onCoinChange,
}) => {
  const [coins, setCoins] = useState(coinsList || INITIAL_COINS_LIST);
  const [selectedCoin, setSelectedCoin] = useState(
    selectedCoinState || INITIAL_COINS_LIST[0]
  );
  const [tradeStream, setTradeStream] = useState(INITIAL_TRADE_STREAM);
  const [positions, setPositions] = useState(INITIAL_POSITIONS);

  const [orderSide, setOrderSide] = useState("buy");
  const [orderType, setOrderType] = useState("market"); // 'market' | 'limit' | 'ai'
  const [orderAmount, setOrderAmount] = useState("100");
  const [limitPrice, setLimitPrice] = useState("");
  const [leverage, setLeverage] = useState("20x");
  const [selectedAiStrategy, setSelectedAiStrategy] = useState("scalper");
  const [searchQuery, setSearchQuery] = useState("");
  const [tickDirection, setTickDirection] = useState("up");

  // Synchronize when external selection changes
  useEffect(() => {
    if (selectedCoinState) {
      setSelectedCoin(selectedCoinState);
      setLimitPrice(selectedCoinState.price.toString());
    }
  }, [selectedCoinState]);

  // Set default limit price when coin changes
  useEffect(() => {
    if (selectedCoin && !limitPrice) {
      setLimitPrice(selectedCoin.price.toString());
    }
  }, [selectedCoin]);

  // Real-time market tick and order stream generation
  useEffect(() => {
    const interval = setInterval(() => {
      const deltaPercent = (Math.random() - 0.48) * 0.15;
      const isUp = deltaPercent >= 0;
      setTickDirection(isUp ? "up" : "down");

      setSelectedCoin((prev) => {
        if (!prev) return prev;
        const newPrice = Number((prev.price * (1 + deltaPercent / 100)).toFixed(prev.price < 1 ? 4 : 2));
        return {
          ...prev,
          price: newPrice,
        };
      });

      const newTrade = {
        id: Date.now(),
        price: Number(
          (selectedCoin.price * (1 + (Math.random() - 0.5) * 0.002)).toFixed(
            selectedCoin.price < 1 ? 4 : 2
          )
        ),
        amount: Number((Math.random() * 2.5 + 0.05).toFixed(3)),
        time: new Date().toTimeString().split(" ")[0],
        side: isUp ? "buy" : "sell",
      };

      setTradeStream((prev) => [newTrade, ...prev.slice(0, 8)]);
    }, 1800);

    return () => clearInterval(interval);
  }, [selectedCoin]);

  const handleSelectCoin = (coin) => {
    setSelectedCoin(coin);
    setLimitPrice(coin.price.toString());
    if (onCoinChange) onCoinChange(coin);
  };

  const filteredCoins = useMemo(() => {
    if (!searchQuery.trim()) return coins;
    return coins.filter(
      (c) =>
        c.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [coins, searchQuery]);

  // Dynamic Compact Order Book Asks and Bids
  const orderBookAsks = useMemo(() => {
    const base = selectedCoin.price;
    return [
      { price: base * 1.004, amount: "1.450", depth: 85 },
      { price: base * 1.003, amount: "0.890", depth: 68 },
      { price: base * 1.002, amount: "2.120", depth: 95 },
      { price: base * 1.001, amount: "0.340", depth: 42 },
      { price: base * 1.0005, amount: "0.950", depth: 55 },
    ];
  }, [selectedCoin]);

  const orderBookBids = useMemo(() => {
    const base = selectedCoin.price;
    return [
      { price: base * 0.9995, amount: "1.820", depth: 90 },
      { price: base * 0.999, amount: "0.640", depth: 50 },
      { price: base * 0.998, amount: "3.100", depth: 100 },
      { price: base * 0.997, amount: "0.450", depth: 38 },
      { price: base * 0.996, amount: "1.250", depth: 72 },
    ];
  }, [selectedCoin]);

  const handleExecuteTrade = () => {
    const amt = parseFloat(orderAmount);
    if (!amt || amt <= 0) {
      toast.warning("Please enter a valid trade amount in USDT");
      return;
    }

    const levNum = parseInt(leverage) || 10;
    const activePrice =
      orderType === "limit" && parseFloat(limitPrice) > 0
        ? parseFloat(limitPrice)
        : selectedCoin.price;

    const orderTypeName =
      orderType === "ai"
        ? `AI Bot (${AI_STRATEGIES.find((s) => s.id === selectedAiStrategy)?.name.split(" ")[1] || "Bot"})`
        : orderType === "limit"
        ? "Limit Order"
        : "Market Order";

    const newPos = {
      id: `pos-${Date.now()}`,
      symbol: selectedCoin.pair,
      type: orderTypeName,
      side: orderSide,
      leverage: leverage,
      entryPrice: activePrice,
      markPrice: selectedCoin.price,
      margin: amt,
      size: amt * levNum,
      pnl: 0.0,
      pnlPercent: 0.0,
      liqPrice:
        orderSide === "buy"
          ? activePrice * 0.92
          : activePrice * 1.08,
    };

    setPositions([newPos, ...positions]);

    if (orderType === "ai") {
      toast.success(
        `🤖 AI Trading Bot Deployed for ${selectedCoin.symbol} with $${amt} Margin!`
      );
    } else {
      toast.success(
        `⚡ Live ${orderSide.toUpperCase()} ${leverage} ${orderTypeName} executed for ${
          selectedCoin.symbol
        } ($${amt})!`
      );
    }
  };

  const handleClosePosition = (id) => {
    setPositions(positions.filter((p) => p.id !== id));
    toast.info("Position closed and PnL credited to available balance");
  };

  const estSize = (parseFloat(orderAmount || 0) * (parseInt(leverage) || 10)).toFixed(2);
  const currentStrategy = AI_STRATEGIES.find((s) => s.id === selectedAiStrategy) || AI_STRATEGIES[0];

  return (
    <div className="space-y-4 max-w-full overflow-hidden">
      {/* ── Section Title Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2b313a] pb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#f0b90b]/15 border border-[#f0b90b]/30 flex items-center justify-center text-[#f0b90b] font-bold shadow-sm shrink-0">
            <Activity size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#0ecb81] animate-ping" />
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-[#f0b90b] font-mono">
                INSTITUTIONAL TRADING ENGINE
              </span>
            </div>
            <h2 className="text-base sm:text-lg md:text-xl font-black text-[#eaecef] font-['Orbitron',monospace]">
              Live Multi-Chain Market Terminal
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <div className="flex items-center gap-2 bg-[#1e2329] border border-[#2b313a] px-3 py-1 rounded-xl text-xs font-mono">
            <span className="text-[#848e9c]">Status:</span>
            <span className="text-[#0ecb81] font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0ecb81] animate-pulse" /> 100% Live Stream
            </span>
          </div>
        </div>
      </div>

      {/* ── ROW 1: EXPANSIVE TRADING CHART (TOP/RIGHT) & MARKET WATCH (LEFT) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
        {/* Market Watch & Pair List */}
        <div className="order-2 lg:order-1 lg:col-span-4 bg-[#181a20] border border-[#2b313a] rounded-2xl p-3 sm:p-3.5 space-y-2.5 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#2b313a] pb-2">
            <span className="text-xs font-black uppercase tracking-wider text-[#f0b90b] flex items-center gap-1.5">
              <Activity size={13} /> Market Pairs
            </span>
            <span className="text-[10px] bg-[#1e2329] px-2 py-0.5 rounded text-[#848e9c] font-mono border border-[#2b313a]">
              {coins.length} Pairs
            </span>
          </div>

          {/* Search Pair */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search (VC, BTC, ETH)..."
              className="w-full bg-[#1e2329] border border-[#2b313a] rounded-xl py-1.5 pl-8 pr-7 text-xs text-[#eaecef] placeholder-[#848e9c] focus:border-[#f0b90b] outline-none font-mono"
            />
            <Search
              size={12}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#848e9c]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#848e9c] hover:text-[#eaecef]"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Coin List */}
          <div className="space-y-1 max-h-[240px] sm:max-h-[290px] overflow-y-auto scrollbar-thin scrollbar-thumb-[#2b313a] pr-1">
            {filteredCoins.map((coin) => {
              const isSelected = selectedCoin.id === coin.id;
              const isPos = coin.change24h >= 0;
              return (
                <div
                  key={coin.id}
                  onClick={() => handleSelectCoin(coin)}
                  className={`p-2 rounded-xl flex items-center justify-between cursor-pointer transition border ${
                    isSelected
                      ? "bg-[#1e2329] border-[#f0b90b] shadow-sm"
                      : "bg-[#12161c] border-[#2b313a] hover:bg-[#1e2329] hover:border-[#363d45]"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <img
                      src={coin.icon}
                      alt={coin.symbol}
                      className="w-6 h-6 rounded-full border border-[#2b313a] bg-[#1e2329] shrink-0 object-cover"
                    />
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-[#eaecef] flex items-center gap-1 truncate">
                        {coin.symbol}
                        {isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#f0b90b] shrink-0" />
                        )}
                      </div>
                      <div className="text-[9.5px] text-[#848e9c] truncate">
                        {coin.name}
                      </div>
                    </div>
                  </div>

                  <div className="text-right font-mono shrink-0 ml-2">
                    <div className="text-xs font-bold text-[#eaecef]">
                      $
                      {coin.price.toLocaleString(undefined, {
                        minimumFractionDigits: coin.price < 1 ? 4 : 2,
                      })}
                    </div>
                    <div
                      className={`text-[9.5px] font-bold ${
                        isPos ? "text-[#0ecb81]" : "text-[#f6465d]"
                      }`}
                    >
                      {isPos ? "+" : ""}
                      {coin.change24h}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* AI Sentiment Box */}
          <div className="p-2 bg-[#12161c] rounded-xl border border-[#2b313a] space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#848e9c] text-[10px]">Market Sentiment</span>
              <span className="text-[#0ecb81] font-bold font-mono text-[10px]">82% BULLISH</span>
            </div>
            <div className="w-full bg-[#1e2329] h-1.5 rounded-full overflow-hidden flex">
              <div className="bg-[#0ecb81] h-full w-[82%] transition-all" />
              <div className="bg-[#f6465d] h-full w-[18%]" />
            </div>
            <div className="flex justify-between text-[8.5px] text-[#848e9c] font-mono">
              <span>Greed: 82</span>
              <span className="text-[#f0b90b]">AI Core Live</span>
            </div>
          </div>
        </div>

        {/* Expansive Candlestick Chart */}
        <div className="order-1 lg:order-2 lg:col-span-8 w-full min-w-0">
          <LiveDynamicTradingChart
            selectedCoin={selectedCoin}
            tickDirection={tickDirection}
          />
        </div>
      </div>

      {/* ── ROW 2: PRECISION TRADE & AI BOT CONSOLE (LEFT) + ORDER BOOK (RIGHT) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
        {/* Order Execution Engine */}
        <div className="lg:col-span-7 xl:col-span-8 bg-[#181a20] border border-[#2b313a] rounded-2xl p-3 sm:p-4 shadow-sm flex flex-col justify-between space-y-3">
          {/* Top Tabs: Market | Limit | AI Bot + Leverage Pills */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2b313a] pb-2.5">
            {/* Mode Switcher */}
            <div className="flex items-center gap-1 bg-[#12161c] p-0.5 rounded-xl border border-[#2b313a] overflow-x-auto scrollbar-none w-full sm:w-auto">
              {[
                { id: "market", label: "⚡ Market" },
                { id: "limit", label: "🎯 Limit" },
                { id: "ai", label: "🤖 AI Bot" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setOrderType(t.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 flex-1 sm:flex-initial text-center ${
                    orderType === t.id
                      ? "bg-[#f0b90b] text-[#181a20] font-black shadow-sm"
                      : "text-[#848e9c] hover:text-[#eaecef]"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Leverage Selector */}
            <div className="flex items-center gap-1 bg-[#12161c] px-2 py-0.5 rounded-xl border border-[#2b313a] text-xs overflow-x-auto scrollbar-none self-start sm:self-auto">
              <span className="text-[9.5px] text-[#848e9c] font-bold uppercase mr-0.5">Lev:</span>
              {["5x", "10x", "20x", "50x", "100x"].map((lev) => (
                <button
                  key={lev}
                  onClick={() => setLeverage(lev)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition cursor-pointer shrink-0 ${
                    leverage === lev
                      ? "bg-[#f0b90b] text-[#181a20] font-black"
                      : "text-[#848e9c] hover:text-[#eaecef]"
                  }`}
                >
                  {lev}
                </button>
              ))}
            </div>
          </div>

          {/* ── TAB CONTENT 1: MARKET ORDER ── */}
          {orderType === "market" && (
            <div className="space-y-3">
              {/* Buy Long / Sell Short Toggle */}
              <div className="grid grid-cols-2 gap-2 bg-[#12161c] p-1 rounded-xl border border-[#2b313a]">
                <button
                  onClick={() => setOrderSide("buy")}
                  className={`py-2 rounded-lg font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    orderSide === "buy"
                      ? "bg-[#0ecb81] text-white shadow-sm"
                      : "text-[#848e9c] hover:text-white"
                  }`}
                >
                  <TrendingUp size={13} /> Buy / Long
                </button>
                <button
                  onClick={() => setOrderSide("sell")}
                  className={`py-2 rounded-lg font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    orderSide === "sell"
                      ? "bg-[#f6465d] text-white shadow-sm"
                      : "text-[#848e9c] hover:text-white"
                  }`}
                >
                  <TrendingDown size={13} /> Sell / Short
                </button>
              </div>

              {/* Amount Input & Fast Presets */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center">
                <div className="md:col-span-7 space-y-1">
                  <div className="flex justify-between text-[11px] text-[#848e9c]">
                    <span>Margin (USDT)</span>
                    <span className="font-mono text-[#f0b90b] font-bold">
                      Est. Size: ${estSize}
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      value={orderAmount}
                      onChange={(e) => setOrderAmount(e.target.value)}
                      placeholder="100"
                      className="w-full bg-[#1e2329] border border-[#2b313a] rounded-xl py-2 pl-7 pr-12 text-xs font-mono font-bold text-[#eaecef] focus:border-[#f0b90b] outline-none"
                    />
                    <DollarSign
                      size={13}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#f0b90b]"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-[#848e9c]">
                      USDT
                    </span>
                  </div>
                </div>

                {/* Preset Chips */}
                <div className="md:col-span-5 space-y-1">
                  <span className="text-[11px] text-[#848e9c] block">Presets</span>
                  <div className="grid grid-cols-4 gap-1">
                    {["50", "100", "250", "500"].map((preset) => (
                      <button
                        key={preset}
                        onClick={() => setOrderAmount(preset)}
                        className={`py-1.5 rounded-lg border text-[10.5px] font-mono transition cursor-pointer font-bold text-center ${
                          orderAmount === preset
                            ? "bg-[#f0b90b]/20 border-[#f0b90b] text-[#f0b90b]"
                            : "bg-[#1e2329] border-[#2b313a] text-[#848e9c] hover:border-[#363d45]"
                        }`}
                      >
                        ${preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB CONTENT 2: LIMIT ORDER ── */}
          {orderType === "limit" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 bg-[#12161c] p-1 rounded-xl border border-[#2b313a]">
                <button
                  onClick={() => setOrderSide("buy")}
                  className={`py-2 rounded-lg font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    orderSide === "buy"
                      ? "bg-[#0ecb81] text-white shadow-sm"
                      : "text-[#848e9c] hover:text-white"
                  }`}
                >
                  <TrendingUp size={13} /> Limit Buy
                </button>
                <button
                  onClick={() => setOrderSide("sell")}
                  className={`py-2 rounded-lg font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    orderSide === "sell"
                      ? "bg-[#f6465d] text-white shadow-sm"
                      : "text-[#848e9c] hover:text-white"
                  }`}
                >
                  <TrendingDown size={13} /> Limit Sell
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-[#848e9c]">
                    <span>Target Price</span>
                    <button
                      onClick={() => setLimitPrice(selectedCoin.price.toString())}
                      className="text-[#f0b90b] text-[10px] underline hover:text-[#fcd535] cursor-pointer"
                    >
                      Use ${selectedCoin.price}
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      value={limitPrice}
                      onChange={(e) => setLimitPrice(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-[#1e2329] border border-[#2b313a] rounded-xl py-2 pl-7 pr-12 text-xs font-mono font-bold text-[#eaecef] focus:border-[#f0b90b] outline-none"
                    />
                    <Target
                      size={13}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#f0b90b]"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-[#848e9c]">
                      USDT
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-[#848e9c]">
                    <span>Margin</span>
                    <span className="font-mono text-[#f0b90b]">Size: ${estSize}</span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      value={orderAmount}
                      onChange={(e) => setOrderAmount(e.target.value)}
                      placeholder="100"
                      className="w-full bg-[#1e2329] border border-[#2b313a] rounded-xl py-2 pl-7 pr-12 text-xs font-mono font-bold text-[#eaecef] focus:border-[#f0b90b] outline-none"
                    />
                    <DollarSign
                      size={13}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#f0b90b]"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-[#848e9c]">
                      USDT
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB CONTENT 3: AI BOT ── */}
          {orderType === "ai" && (
            <div className="space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {AI_STRATEGIES.map((strat) => {
                  const isSelected = selectedAiStrategy === strat.id;
                  return (
                    <div
                      key={strat.id}
                      onClick={() => {
                        setSelectedAiStrategy(strat.id);
                        setLeverage(strat.recomLeverage);
                      }}
                      className={`p-2 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? "bg-[#1e2329] border-[#f0b90b] shadow-sm"
                          : "bg-[#12161c] border-[#2b313a] hover:border-[#363d45]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[10.5px] font-bold text-[#eaecef] truncate">
                          {strat.name}
                        </span>
                        <span className="text-[8px] font-extrabold px-1 py-0.2 rounded bg-[#2b313a] text-[#f0b90b] border border-[#363d45]">
                          {strat.badge}
                        </span>
                      </div>
                      <div className="text-[11px] font-black text-[#0ecb81] font-mono">
                        {strat.estYield}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-center">
                <div className="space-y-0.5">
                  <div className="flex justify-between text-[11px] text-[#848e9c]">
                    <span>Bot Margin</span>
                    <span className="font-mono text-[#0ecb81] font-bold">${estSize}</span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      value={orderAmount}
                      onChange={(e) => setOrderAmount(e.target.value)}
                      placeholder="100"
                      className="w-full bg-[#1e2329] border border-[#2b313a] rounded-xl py-1.5 pl-7 pr-12 text-xs font-mono font-bold text-[#eaecef] focus:border-[#f0b90b] outline-none"
                    />
                    <Bot
                      size={13}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#f0b90b]"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#848e9c]">
                      USDT
                    </span>
                  </div>
                </div>

                <div className="bg-[#12161c] p-2 rounded-xl border border-[#2b313a] space-y-0.5">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-[#848e9c]">Target Yield:</span>
                    <span className="text-[#0ecb81] font-bold font-mono">{currentStrategy.estYield}</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-[#848e9c]">Mode:</span>
                    <span className="text-[#f0b90b] font-bold font-mono">24/7 Auto Execution</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Execution Button */}
          <button
            onClick={handleExecuteTrade}
            className={`w-full py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-200 shadow-sm cursor-pointer flex items-center justify-center gap-1.5 active:scale-98 ${
              orderType === "ai"
                ? "bg-[#f0b90b] hover:bg-[#fcd535] text-[#181a20]"
                : orderSide === "buy"
                ? "bg-[#0ecb81] hover:bg-[#02c076] text-white"
                : "bg-[#f6465d] hover:bg-[#e0354c] text-white"
            }`}
          >
            {orderType === "ai" ? (
              <>
                <Cpu size={14} /> Deploy {currentStrategy.name} (${orderAmount} Margin)
              </>
            ) : (
              <>
                <Zap size={14} /> Place {orderSide.toUpperCase()} {leverage} {orderType.toUpperCase()} Order
              </>
            )}
          </button>
        </div>

        {/* Live Order Book */}
        <div className="lg:col-span-5 xl:col-span-4 bg-[#181a20] border border-[#2b313a] rounded-2xl p-3 space-y-2 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[#2b313a] pb-1.5">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#f0b90b] flex items-center gap-1.5">
              <Layers size={12} /> Order Book
            </span>
            <span className="text-[9px] bg-[#0ecb81]/15 text-[#0ecb81] px-1.5 py-0.2 rounded font-mono border border-[#0ecb81]/30">
              Spread: 0.01%
            </span>
          </div>

          {/* Asks (Sell Orders - Red Compact) */}
          <div className="space-y-0.5 font-mono text-[10px]">
            <div className="flex justify-between text-[8.5px] text-[#848e9c] font-sans pb-0.5">
              <span>Price (USDT)</span>
              <span>Amount</span>
            </div>
            {orderBookAsks.slice(0, 4).map((ask, idx) => (
              <div
                key={`ask-${idx}`}
                className="relative flex justify-between py-0.5 px-1 rounded text-[10px]"
              >
                <div
                  className="absolute right-0 top-0 bottom-0 bg-[#f6465d]/15 rounded"
                  style={{ width: `${ask.depth}%` }}
                />
                <span className="relative z-10 text-[#f6465d] font-bold">
                  ${ask.price < 1 ? ask.price.toFixed(4) : ask.price.toFixed(2)}
                </span>
                <span className="relative z-10 text-[#eaecef]">{ask.amount}</span>
              </div>
            ))}
          </div>

          {/* Mid Price Spread Indicator */}
          <div className="py-1 px-2 bg-[#12161c] rounded-lg border border-[#2b313a] flex items-center justify-between font-mono">
            <span className="text-xs font-black text-[#eaecef] flex items-center gap-1.5">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  tickDirection === "up" ? "bg-[#0ecb81]" : "bg-[#f6465d]"
                } animate-ping`}
              />
              ${selectedCoin.price < 1 ? selectedCoin.price.toFixed(4) : selectedCoin.price.toFixed(2)}
            </span>
            <span className="text-[8.5px] text-[#0ecb81] font-bold">Active Stream</span>
          </div>

          {/* Bids (Buy Orders - Green Compact) */}
          <div className="space-y-0.5 font-mono text-[10px]">
            {orderBookBids.slice(0, 4).map((bid, idx) => (
              <div
                key={`bid-${idx}`}
                className="relative flex justify-between py-0.5 px-1 rounded text-[10px]"
              >
                <div
                  className="absolute right-0 top-0 bottom-0 bg-[#0ecb81]/15 rounded"
                  style={{ width: `${bid.depth}%` }}
                />
                <span className="relative z-10 text-[#0ecb81] font-bold">
                  ${bid.price < 1 ? bid.price.toFixed(4) : bid.price.toFixed(2)}
                </span>
                <span className="relative z-10 text-[#eaecef]">{bid.amount}</span>
              </div>
            ))}
          </div>

          <div className="pt-1.5 border-t border-[#2b313a] flex items-center justify-between text-[9px] font-mono text-[#848e9c]">
            <span>Vol: <strong className="text-[#eaecef]">{selectedCoin.volume || "$12.4M"}</strong></span>
            <span className="text-[#f0b90b] font-bold">Ultra-Low Latency</span>
          </div>
        </div>
      </div>

      {/* (Active Positions & AI Bots Table Removed as requested) */}
    </div>
  );
};

export default DashboardTradingTerminal;
