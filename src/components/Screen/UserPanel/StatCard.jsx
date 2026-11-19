/* eslint-disable react/prop-types */
import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, ArrowDownRight, TrendingUp, Sparkles } from "lucide-react";

// Curated NODEXAI Cyber-Glass Theme Definitions (Matching Landing Page)
const THEME_CONFIG = {
  emerald: {
    cardBg: "bg-gradient-to-br from-[#08152c]/95 via-[#061022]/95 to-[#030814]/95 backdrop-blur-xl",
    border: "border-cyan-500/20 hover:border-emerald-400/60",
    glow: "bg-emerald-500/15 group-hover:bg-emerald-500/25",
    shadow: "hover:shadow-[0_8px_25px_rgba(16,185,129,0.2)]",
    iconPod: "bg-[#06181f] border border-emerald-500/40 text-emerald-400 group-hover:border-emerald-400 group-hover:scale-105 shadow-[0_0_10px_rgba(16,185,129,0.15)]",
    titleColor: "text-white font-bold group-hover:text-white",
    valueGradient: "text-emerald-400 font-black",
    badgeBg: "bg-emerald-950/60 text-emerald-300 font-extrabold border-emerald-500/40 font-mono",
    actionColor: "text-emerald-400 group-hover:text-emerald-300 font-bold",
    beacon: "bg-emerald-400",
  },
  cyan: {
    cardBg: "bg-gradient-to-br from-[#08152c]/95 via-[#061022]/95 to-[#030814]/95 backdrop-blur-xl",
    border: "border-cyan-500/25 hover:border-cyan-400/60",
    glow: "bg-cyan-500/20 group-hover:bg-cyan-500/30",
    shadow: "hover:shadow-[0_8px_25px_rgba(0,210,255,0.2)]",
    iconPod: "bg-[#0a1e3f] border border-cyan-500/40 text-cyan-400 group-hover:border-cyan-300 group-hover:scale-105 shadow-[0_0_10px_rgba(0,210,255,0.2)]",
    titleColor: "text-white font-bold group-hover:text-white",
    valueGradient: "bg-gradient-to-r from-cyan-300 via-sky-200 to-white bg-clip-text text-transparent font-black",
    badgeBg: "bg-cyan-950/60 text-cyan-300 font-extrabold border-cyan-500/40 font-mono",
    actionColor: "text-cyan-400 group-hover:text-cyan-300 font-bold",
    beacon: "bg-cyan-400",
  },
  purple: {
    cardBg: "bg-gradient-to-br from-[#08152c]/95 via-[#061022]/95 to-[#030814]/95 backdrop-blur-xl",
    border: "border-cyan-500/20 hover:border-amber-400/60",
    glow: "bg-amber-500/15 group-hover:bg-cyan-500/25",
    shadow: "hover:shadow-[0_8px_25px_rgba(245,158,11,0.2)]",
    iconPod: "bg-[#0a1e3f] border border-cyan-500/30 text-cyan-300 group-hover:border-amber-400 group-hover:scale-105 shadow-[0_0_10px_rgba(0,210,255,0.15)]",
    titleColor: "text-white font-bold group-hover:text-white",
    valueGradient: "text-white font-black",
    badgeBg: "bg-cyan-950/60 text-cyan-300 font-extrabold border-cyan-500/40 font-mono",
    actionColor: "text-amber-400 group-hover:text-amber-300 font-bold",
    beacon: "bg-amber-400",
  },
  amber: {
    cardBg: "bg-gradient-to-br from-[#08152c]/95 via-[#061022]/95 to-[#030814]/95 backdrop-blur-xl",
    border: "border-amber-500/25 hover:border-amber-400/60",
    glow: "bg-amber-500/20 group-hover:bg-amber-500/35",
    shadow: "hover:shadow-[0_8px_25px_rgba(245,158,11,0.25)]",
    iconPod: "bg-[#211705] border border-amber-500/40 text-amber-400 group-hover:border-amber-300 group-hover:scale-105 shadow-[0_0_10px_rgba(245,158,11,0.2)]",
    titleColor: "text-white font-bold group-hover:text-white",
    valueGradient: "bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500 bg-clip-text text-transparent font-black",
    badgeBg: "bg-amber-950/60 text-amber-300 font-extrabold border-amber-500/40 font-mono",
    actionColor: "text-amber-400 group-hover:text-amber-300 font-bold",
    beacon: "bg-amber-400",
  },
  rose: {
    cardBg: "bg-gradient-to-br from-[#08152c]/95 via-[#061022]/95 to-[#030814]/95 backdrop-blur-xl",
    border: "border-rose-500/25 hover:border-rose-400/60",
    glow: "bg-rose-500/15 group-hover:bg-rose-500/25",
    shadow: "hover:shadow-[0_8px_25px_rgba(244,63,94,0.2)]",
    iconPod: "bg-[#230914] border border-rose-500/40 text-rose-400 group-hover:border-rose-300 group-hover:scale-105 shadow-[0_0_10px_rgba(244,63,94,0.15)]",
    titleColor: "text-white font-bold group-hover:text-white",
    valueGradient: "text-rose-400 font-black",
    badgeBg: "bg-rose-950/60 text-rose-300 font-extrabold border-rose-500/40 font-mono",
    actionColor: "text-rose-400 group-hover:text-rose-300 font-bold",
    beacon: "bg-rose-400",
  },
  blue: {
    cardBg: "bg-gradient-to-br from-[#08152c]/95 via-[#061022]/95 to-[#030814]/95 backdrop-blur-xl",
    border: "border-cyan-500/20 hover:border-cyan-400/60",
    glow: "bg-cyan-500/15 group-hover:bg-cyan-500/25",
    shadow: "hover:shadow-[0_8px_25px_rgba(0,210,255,0.2)]",
    iconPod: "bg-[#0b1c3a] border border-cyan-500/30 text-cyan-300 group-hover:border-cyan-300 group-hover:scale-105 shadow-[0_0_10px_rgba(0,210,255,0.15)]",
    titleColor: "text-white font-bold group-hover:text-white",
    valueGradient: "text-white font-black",
    badgeBg: "bg-cyan-950/60 text-cyan-300 font-extrabold border-cyan-500/40 font-mono",
    actionColor: "text-cyan-400 group-hover:text-cyan-300 font-bold",
    beacon: "bg-cyan-400",
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
      className={`relative overflow-hidden rounded-2xl p-2.5 sm:p-3 transition-all duration-300 group select-none border backdrop-blur-xl shadow-lg hover:shadow-xl ${cfg.cardBg
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
      <div className="relative z-10 flex items-center justify-between pt-1 mt-1.5 border-t border-cyan-500/15 text-[7.5px] sm:text-[8.5px] gap-1 min-w-0">
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