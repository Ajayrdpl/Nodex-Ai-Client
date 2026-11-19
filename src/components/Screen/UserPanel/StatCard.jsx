/* eslint-disable react/prop-types */
import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, ArrowDownRight, TrendingUp, Sparkles } from "lucide-react";

// Curated Binance Pro Dark & Gold Theme Definitions
const THEME_CONFIG = {
  emerald: {
    cardBg: "bg-[#181a20]",
    border: "border-[#2b313a] hover:border-[#0ecb81]",
    glow: "bg-[#0ecb81]/15 group-hover:bg-[#0ecb81]/25",
    shadow: "hover:shadow-[0_4px_16px_rgba(14,203,129,0.2)]",
    iconPod: "bg-[#1e2329] border-[#2b313a] text-[#0ecb81] group-hover:border-[#0ecb81] group-hover:scale-105",
    titleColor: "text-white font-bold group-hover:text-white",
    valueGradient: "text-[#0ecb81]",
    badgeBg: "bg-[#0ecb81]/25 text-white font-extrabold border-[#0ecb81]/40",
    actionColor: "text-[#0ecb81] group-hover:text-emerald-300",
    beacon: "bg-[#0ecb81]",
  },
  cyan: {
    cardBg: "bg-[#181a20]",
    border: "border-[#2b313a] hover:border-[#f0b90b]",
    glow: "bg-[#f0b90b]/15 group-hover:bg-[#f0b90b]/25",
    shadow: "hover:shadow-[0_4px_16px_rgba(240,185,11,0.2)]",
    iconPod: "bg-[#1e2329] border-[#2b313a] text-[#f0b90b] group-hover:border-[#f0b90b] group-hover:scale-105",
    titleColor: "text-white font-bold group-hover:text-white",
    valueGradient: "text-[#f0b90b]",
    badgeBg: "bg-[#2b313a] text-white font-extrabold border-[#363d45]",
    actionColor: "text-[#f0b90b] group-hover:text-[#fcd535]",
    beacon: "bg-[#f0b90b]",
  },
  purple: {
    cardBg: "bg-[#181a20]",
    border: "border-[#2b313a] hover:border-[#f0b90b]",
    glow: "bg-[#f0b90b]/10 group-hover:bg-[#f0b90b]/20",
    shadow: "hover:shadow-[0_4px_16px_rgba(240,185,11,0.2)]",
    iconPod: "bg-[#1e2329] border-[#2b313a] text-[#f0b90b] group-hover:border-[#f0b90b] group-hover:scale-105",
    titleColor: "text-white font-bold group-hover:text-white",
    valueGradient: "text-white font-black",
    badgeBg: "bg-[#2b313a] text-white font-extrabold border-[#363d45]",
    actionColor: "text-[#f0b90b] group-hover:text-[#fcd535]",
    beacon: "bg-[#f0b90b]",
  },
  amber: {
    cardBg: "bg-[#181a20]",
    border: "border-[#2b313a] hover:border-[#f0b90b]",
    glow: "bg-[#f0b90b]/20 group-hover:bg-[#f0b90b]/30",
    shadow: "hover:shadow-[0_4px_16px_rgba(240,185,11,0.3)]",
    iconPod: "bg-[#1e2329] border-[#2b313a] text-[#f0b90b] shadow-sm group-hover:border-[#f0b90b] group-hover:scale-105",
    titleColor: "text-white font-bold group-hover:text-white",
    valueGradient: "text-[#f0b90b]",
    badgeBg: "bg-[#f0b90b]/25 text-white font-extrabold border-[#f0b90b]/40",
    actionColor: "text-[#f0b90b] group-hover:text-[#fcd535]",
    beacon: "bg-[#f0b90b]",
  },
  rose: {
    cardBg: "bg-[#181a20]",
    border: "border-[#2b313a] hover:border-[#f6465d]",
    glow: "bg-[#f6465d]/15 group-hover:bg-[#f6465d]/25",
    shadow: "hover:shadow-[0_4px_16px_rgba(246,70,93,0.2)]",
    iconPod: "bg-[#1e2329] border-[#2b313a] text-[#f6465d] group-hover:border-[#f6465d] group-hover:scale-105",
    titleColor: "text-white font-bold group-hover:text-white",
    valueGradient: "text-[#f6465d]",
    badgeBg: "bg-[#f6465d]/25 text-white font-extrabold border-[#f6465d]/40",
    actionColor: "text-[#f6465d] group-hover:text-rose-400",
    beacon: "bg-[#f6465d]",
  },
  blue: {
    cardBg: "bg-[#181a20]",
    border: "border-[#2b313a] hover:border-[#f0b90b]",
    glow: "bg-[#f0b90b]/15 group-hover:bg-[#f0b90b]/25",
    shadow: "hover:shadow-[0_4px_16px_rgba(240,185,11,0.25)]",
    iconPod: "bg-[#1e2329] border-[#2b313a] text-white group-hover:border-[#f0b90b] group-hover:scale-105",
    titleColor: "text-white font-bold group-hover:text-white",
    valueGradient: "text-white",
    badgeBg: "bg-[#2b313a] text-white font-extrabold border-[#363d45]",
    actionColor: "text-[#f0b90b] group-hover:text-[#fcd535]",
    beacon: "bg-[#f0b90b]",
  },
};


const StatCard = ({
  title,
  value,
  icon,
  iconImage,
  change,
  changeType,
  isMoney,
  path,
  data,
  highlight,
  theme,
  badge,
  subText,
}) => {
  const isPositive = changeType === "positive";
  const navigate = useNavigate();

  // Auto-assign theme if not explicitly passed
  const activeThemeKey =
    theme ||
    (highlight
      ? "emerald"
      : title?.toLowerCase().includes("investment") || title?.toLowerCase().includes("balance")
        ? "cyan"
        : title?.toLowerCase().includes("referral")
          ? "amber"
          : title?.toLowerCase().includes("booster") || title?.toLowerCase().includes("withdraw")
            ? "rose"
            : title?.toLowerCase().includes("salary") || title?.toLowerCase().includes("turnover")
              ? "purple"
              : "blue");

  const cfg = THEME_CONFIG[activeThemeKey] || THEME_CONFIG.cyan;

  const handleNavigate = () => {
    if (path) navigate(path, { state: data });
  };

  return (
    <div
      onClick={handleNavigate}
      className={`relative overflow-hidden rounded-xl p-2 sm:p-2.5 transition-all duration-200 group select-none border backdrop-blur-md shadow-sm hover:shadow-md ${cfg.cardBg
        } ${cfg.border} ${cfg.shadow} ${path ? "cursor-pointer hover:-translate-y-0.5 active:scale-[0.99]" : ""
        }`}
    >
      {/* Background Ambient Radial Glow */}
      <div
        className={`absolute -top-6 -right-6 w-16 h-16 rounded-full blur-lg pointer-events-none transition-opacity duration-200 ${cfg.glow}`}
      />

      <div className="relative z-10 flex items-center justify-between gap-1.5 min-w-0">
        <div className="space-y-0.5 flex-1 min-w-0">
          {/* Header Title + Badge */}
          <div className="flex items-center gap-1 flex-wrap min-w-0">
            <span
              className="text-[8.5px] sm:text-[10px] font-black uppercase tracking-wider truncate text-white transition-colors"
            >
              {title}
            </span>
            {badge && (
              <span
                className={`text-[6.5px] sm:text-[7.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border shrink-0 ${cfg.badgeBg}`}
              >
                {badge}
              </span>
            )}
            {highlight && (
              <Sparkles size={8} className="text-emerald-400 shrink-0 animate-pulse" />
            )}
          </div>

          {/* Primary Metric Value */}
          <h3
            className={`text-xs sm:text-sm md:text-base font-black tracking-tight font-['Orbitron',monospace] truncate ${cfg.valueGradient}`}
          >
            {value || "$0.00"}
          </h3>
        </div>

        {/* 3D Glowing Icon Avatar Pod */}
        <div
          className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center p-0.5 shrink-0 border transition-all duration-200 group-hover:scale-105 shadow-sm ${cfg.iconPod}`}
        >
          {iconImage ? (
            <img src={iconImage} alt={title} className="w-full h-full object-contain drop-shadow-sm" />
          ) : typeof icon === "string" ? (
            <img src={icon} alt="" className="w-full h-full object-contain drop-shadow-sm" />
          ) : (
            icon || <TrendingUp size={12} />
          )}
        </div>
      </div>

      {/* Subtext & Live / Action Strip (Tight Compact Footer) */}
      <div className="relative z-10 flex items-center justify-between pt-0.5 mt-1 border-t border-slate-800/60 text-[7.5px] sm:text-[8.5px] gap-1 min-w-0">
        {subText ? (
          <span className="text-white font-semibold truncate max-w-[70%]">
            {subText}
          </span>
        ) : change ? (
          <span
            className={`flex items-center gap-0.5 font-bold font-mono px-1 py-0.2 rounded text-[7px] sm:text-[7.5px] shrink-0 ${isPositive
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
              }`}
          >
            {isPositive ? <ArrowUpRight size={8} /> : <ArrowDownRight size={8} />}
            {change}
          </span>
        ) : (
          <span className="text-slate-200 font-medium flex items-center gap-1 shrink-0">
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.beacon}`} />
            <span>Verified</span>
          </span>
        )}

        {path && (
          <span className={`font-bold flex items-center gap-0.5 transition shrink-0 ${cfg.actionColor}`}>
            View{" "}
            <ArrowUpRight
              size={8}
              className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition"
            />
          </span>
        )}
      </div>
    </div>
  );
};

export default StatCard;