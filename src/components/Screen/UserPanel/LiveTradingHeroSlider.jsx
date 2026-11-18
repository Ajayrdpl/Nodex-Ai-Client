import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, TrendingUp } from "lucide-react";

// ─── TOP INSTITUTIONAL TRADING IMAGE BANNERS (UNCROPPED WIDESCREEN) ──────
export const TRADING_HERO_SLIDES = [
  {
    id: "slide-1",
    image: "/image/banner2.png",
    alt: "NODEXAI Yield Packages & Staking Pool",
  },
  {
    id: "slide-2",
    image: "/image/banner3.png",
    alt: "NODEXAI 3-Matrix Team Network System",
  },
  {
    id: "slide-3",
    image: "/image/banner4.png",
    alt: "NODEXAI Institutional Trading & Liquidity",
  },
  {
    id: "slide-4",
    image: "/image/banner5.png",
    alt: "NODEXAI AI Trading Engine & Market Hub",
  },
  {
    id: "slide-5",
    image: "/NodexAI.jpeg",
    alt: "NODEXAI Multi-Chain Institutional Trading Terminal",
  },
];

// ─── INITIAL COINS LIST (PEH, BTC, ETH, BNB, SOL, SFP, XRP, TRX, DOGE) ─────
export const INITIAL_COINS_LIST = [
  {
    id: "nodex-ai",
    symbol: "VC",
    name: "NODEXAI",
    pair: "VC / USDT",
    price: 0.0602,
    change24h: 4.72,
    volume: "605.04K",
    high24h: 0.0642,
    low24h: 0.0571,
    icon: "/NodexAI.jpeg",
    sparkline: [0.057, 0.058, 0.059, 0.060, 0.061, 0.0602],
  },
  {
    id: "bitcoin",
    symbol: "BTC",
    name: "Bitcoin",
    pair: "BTC / USDT",
    price: 83208.73,
    change24h: 2.12,
    volume: "28.45B",
    high24h: 84120.0,
    low24h: 81900.5,
    icon: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
    sparkline: [82100, 82400, 82900, 83100, 83050, 83200, 83208.73],
  },
  {
    id: "ethereum",
    symbol: "ETH",
    name: "Ethereum",
    pair: "ETH / USDT",
    price: 2694.67,
    change24h: 2.03,
    volume: "14.20B",
    high24h: 2710.0,
    low24h: 2620.0,
    icon: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
    sparkline: [2620, 2635, 2650, 2640, 2665, 2670, 2694.67],
  },
  {
    id: "binancecoin",
    symbol: "BNB",
    name: "BNB",
    pair: "BNB / USDT",
    price: 744.41,
    change24h: 0.76,
    volume: "2.10B",
    high24h: 768.4,
    low24h: 742.2,
    icon: "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png",
    sparkline: [742, 745, 748, 746, 750, 744.41],
  },
  {
    id: "solana",
    symbol: "SOL",
    name: "Solana",
    pair: "SOL / USDT",
    price: 188.99,
    change24h: 5.94,
    volume: "4.82B",
    high24h: 191.5,
    low24h: 176.2,
    icon: "https://assets.coingecko.com/coins/images/4128/small/solana.png",
    sparkline: [176, 179, 182, 185, 187, 188.99],
  },
  {
    id: "safepal",
    symbol: "SFP",
    name: "SafePal",
    pair: "SFP / USDT",
    price: 1.08,
    change24h: 3.4,
    volume: "45.8M",
    high24h: 1.12,
    low24h: 1.04,
    icon: "https://assets.coingecko.com/coins/images/13905/small/SafePal_SFP_App_Icon.png",
    sparkline: [1.02, 1.04, 1.05, 1.07, 1.065, 1.08],
  },
  {
    id: "ripple",
    symbol: "XRP",
    name: "XRP",
    pair: "XRP / USDT",
    price: 1.5008,
    change24h: -0.48,
    volume: "1.85B",
    high24h: 1.54,
    low24h: 1.48,
    icon: "https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png",
    sparkline: [1.52, 1.515, 1.51, 1.508, 1.505, 1.5008],
  },
  {
    id: "tron",
    symbol: "TRX",
    name: "TRON",
    pair: "TRX / USDT",
    price: 0.3384,
    change24h: 0.74,
    volume: "740M",
    high24h: 0.345,
    low24h: 0.331,
    icon: "https://assets.coingecko.com/coins/images/1094/small/tron-logo.png",
    sparkline: [0.334, 0.335, 0.336, 0.337, 0.3384],
  },
  {
    id: "dogecoin",
    symbol: "DOGE",
    name: "Dogecoin",
    pair: "DOGE / USDT",
    price: 0.09377,
    change24h: -1.37,
    volume: "680M",
    high24h: 0.098,
    low24h: 0.092,
    icon: "https://assets.coingecko.com/coins/images/5/small/dogecoin.png",
    sparkline: [0.096, 0.0955, 0.095, 0.0945, 0.09377],
  },
];

// ─── 🚀 PURE IMAGE ONLY TRADING SLIDER (FAST AUTO-SCROLL, UNCROPPED) ───────
export const LiveTradingHeroSlider = ({ onTradeNow }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Fast Automatic Scroll (2.5 seconds per slide)
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % TRADING_HERO_SLIDES.length);
    }, 2500);
    return () => clearInterval(timer);
  }, [isPaused]);

  const slide = TRADING_HERO_SLIDES[currentSlide];

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onClick={() => onTradeNow && onTradeNow()}
      className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-[#040814] border-2 border-cyan-500/30 hover:border-cyan-400/70 shadow-[0_0_25px_rgba(6,182,212,0.18)] transition-all duration-300 group cursor-pointer w-full"
    >
      {/* Responsive Aspect-Ratio Container to Prevent Image Cutting */}
      <div className="relative w-full aspect-[16/7] sm:aspect-[21/7] md:aspect-[24/7] min-h-[140px] max-h-[300px] overflow-hidden bg-gradient-to-r from-slate-950 via-[#030816] to-slate-950 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.img
            key={slide.id}
            src={slide.image}
            alt={slide.alt || "Trading Banner"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="w-full h-full object-contain object-center transform-gpu"
          />
        </AnimatePresence>

        {/* Subtle Ambient Vignette Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

        {/* Navigation Arrows */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setCurrentSlide(
              (prev) =>
                (prev - 1 + TRADING_HERO_SLIDES.length) %
                TRADING_HERO_SLIDES.length
            );
          }}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-cyan-500 text-white hover:text-black border border-slate-700 hover:border-cyan-400 transition-all opacity-0 group-hover:opacity-100 backdrop-blur-md cursor-pointer z-10 shadow-lg active:scale-95"
          title="Previous Banner"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setCurrentSlide(
              (prev) => (prev + 1) % TRADING_HERO_SLIDES.length
            );
          }}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-cyan-500 text-white hover:text-black border border-slate-700 hover:border-cyan-400 transition-all opacity-0 group-hover:opacity-100 backdrop-blur-md cursor-pointer z-10 shadow-lg active:scale-95"
          title="Next Banner"
        >
          <ChevronRight size={16} />
        </button>

        {/* Sleek Bottom Indicators */}
        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-slate-800/80">
          {TRADING_HERO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentSlide(idx);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                currentSlide === idx
                  ? "w-6 bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.9)]"
                  : "w-2 bg-slate-600 hover:bg-slate-400"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── 🔄 INFINITE CONTINUOUS SMOOTH SCROLLING LIVE MARKET TICKER MARQUEE ─────
export const LiveMarketTickerMarquee = ({
  coinsData,
  onSelectCoin,
  activeCoinId,
}) => {
  const [coins, setCoins] = useState(coinsData || INITIAL_COINS_LIST);

  // Live real-time price fluctuation ticker simulation
  useEffect(() => {
    if (coinsData && coinsData.length) {
      setCoins(coinsData);
      return;
    }

    const interval = setInterval(() => {
      setCoins((prev) =>
        prev.map((coin) => {
          const delta = (Math.random() - 0.49) * 0.003;
          const newPrice = Number(
            (coin.price * (1 + delta)).toFixed(coin.price < 1 ? 6 : 2)
          );
          const newChange = Number(
            (coin.change24h + (Math.random() - 0.5) * 0.06).toFixed(2)
          );
          return {
            ...coin,
            price: newPrice,
            change24h: newChange,
          };
        })
      );
    }, 1800);

    return () => clearInterval(interval);
  }, [coinsData]);

  // Triplicate array for smooth, gapless infinite loop
  const displayCoins = [...coins, ...coins, ...coins];

  return (
    <div className="bg-[#070E1E]/95 border border-slate-800 hover:border-cyan-500/40 rounded-2xl p-2 sm:p-2.5 flex items-center gap-2 sm:gap-3 overflow-hidden backdrop-blur-md shadow-lg transition group select-none w-full">
      {/* Pinned Left LIVE MARKET Badge */}
      <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-black text-cyan-400 shrink-0 font-['Orbitron',monospace] bg-cyan-950/90 border border-cyan-800/80 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl shadow-md z-10">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <span className="hidden sm:inline tracking-wider">LIVE MARKET</span>
        <span className="sm:hidden tracking-wider text-[10px]">LIVE</span>
      </div>

      {/* Infinite Horizontal Marquee Track Container */}
      <div className="relative overflow-hidden w-full flex items-center">
        {/* CSS Keyframes injected for pure continuous infinite motion */}
        <style>{`
          @keyframes infiniteTickerScroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-33.3333%); }
          }
          .animate-infinite-ticker {
            display: flex;
            width: max-content;
            animation: infiniteTickerScroll 28s linear infinite;
          }
          .animate-infinite-ticker:hover {
            animation-play-state: paused;
          }
        `}</style>

        <div className="animate-infinite-ticker items-center gap-2 sm:gap-3.5 py-0.5">
          {displayCoins.map((c, index) => {
            const isSelected = activeCoinId === c.id;
            const isPositive = c.change24h >= 0;
            return (
              <div
                key={`${c.id}-${index}`}
                onClick={() => onSelectCoin && onSelectCoin(c)}
                className={`flex items-center gap-1.5 sm:gap-2 shrink-0 cursor-pointer px-2 sm:px-2.5 py-1 rounded-xl transition-all duration-200 border text-xs whitespace-nowrap ${
                  isSelected
                    ? "bg-cyan-500/25 border-cyan-400 text-white shadow-md shadow-cyan-500/20 scale-105"
                    : "bg-slate-950/85 border-slate-800 hover:bg-slate-900 hover:border-cyan-500/50 text-slate-200 hover:scale-102"
                }`}
              >
                <img
                  src={c.icon}
                  alt={c.symbol}
                  className="w-4 h-4 rounded-full object-contain bg-slate-900 border border-slate-700 shrink-0"
                />
                <span className="font-black text-white tracking-wide font-['Orbitron',monospace] text-[11px] sm:text-xs">
                  {c.symbol}
                </span>
                <span className="font-mono text-cyan-300 font-extrabold text-[11px] sm:text-xs">
                  ${c.price.toLocaleString(undefined, {
                    minimumFractionDigits: c.price < 1 ? 4 : 2,
                    maximumFractionDigits: c.price < 1 ? 6 : 2,
                  })}
                </span>
                <span
                  className={`font-mono text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5 ${
                    isPositive
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                  }`}
                >
                  {isPositive ? "+" : ""}
                  {c.change24h}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LiveTradingHeroSlider;
