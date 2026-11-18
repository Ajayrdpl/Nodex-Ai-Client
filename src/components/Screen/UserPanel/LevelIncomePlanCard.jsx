import React, { useState } from "react";
import { TrendingUp, BarChart3, ShieldCheck, Lock, Unlock, Sparkles, Award } from "lucide-react";

// Official NODEXAI 10-Level Income Plan (Total 24%)
export const LEVEL_INCOME_PLAN_DATA = [
  { level: 1, percentage: "8.0%", directs: 1 },
  { level: 2, percentage: "4.0%", directs: 2 },
  { level: 3, percentage: "3.0%", directs: 3 },
  { level: 4, percentage: "2.0%", directs: 4 },
  { level: 5, percentage: "1.5%", directs: 5 },
  { level: 6, percentage: "1.5%", directs: 6 },
  { level: 7, percentage: "1.0%", directs: 7 },
  { level: 8, percentage: "1.0%", directs: 8 },
  { level: 9, percentage: "1.0%", directs: 9 },
  { level: 10, percentage: "1.0%", directs: 10 },
];

const LevelIncomePlanCard = ({ levelInfo, directCount, showFooterBranding = true }) => {
  const [viewMode, setViewMode] = useState("all"); // 'all' or 'status'
  const qualifiedDirects = Number(levelInfo?.qualifiedDirects ?? directCount ?? 0);
  const userInvestment = Number(levelInfo?.selfInvestment || 0);
  const isVipAutoUnlocked = Boolean(levelInfo?.isVipAutoUnlocked || userInvestment >= 500);
  const maxUnlocked = isVipAutoUnlocked ? 10 : Number(levelInfo?.maxUnlockedLevel ?? qualifiedDirects);

  return (
    <div className="w-full max-w-2xl mx-auto my-6 font-sans">
      {/* Outer Glowing Neon Card */}
      <div className="neon-glow-card p-4 sm:p-7 relative overflow-hidden transition-all duration-300 bg-gradient-to-br from-[#071733] via-[#040e22] to-[#020817] border border-cyan-500/30 rounded-3xl shadow-2xl">
        
        {/* Ambient Top Glow Orbs */}
        <div className="absolute top-0 left-1/4 w-48 h-32 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-48 h-32 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Controls / Mode Toggle if live user data is present */}
        {levelInfo && (
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-cyan-500/20 text-xs">
            <div className="flex items-center gap-2 text-cyan-300 font-semibold font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>
                Unlocked Depth:{" "}
                <strong className="text-emerald-400 font-bold">
                  {maxUnlocked >= 10 ? "All 10 Levels (VIP)" : maxUnlocked > 0 ? `Level 1 - L${maxUnlocked}` : "Locked"}
                </strong>
              </span>
            </div>
            <div className="flex gap-1 bg-slate-950/80 p-1 rounded-xl border border-cyan-500/30">
              <button
                onClick={() => setViewMode("all")}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                  viewMode === "all" ? "bg-amber-400 text-slate-950 shadow-sm" : "text-slate-400 hover:text-white"
                }`}
              >
                Plan Overview
              </button>
              <button
                onClick={() => setViewMode("status")}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                  viewMode === "status" ? "bg-cyan-500 text-slate-950 shadow-sm font-black" : "text-slate-400 hover:text-white"
                }`}
              >
                My Unlock Status
              </button>
            </div>
          </div>
        )}

        {/* Header Section */}
        <div className="flex items-center gap-3.5 sm:gap-4 mb-5 pt-1">
          {/* Gold Glowing Circular Badge */}
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-amber-400/50 bg-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.25)] flex items-center justify-center shrink-0">
            <BarChart3 className="w-6 h-6 text-amber-300 drop-shadow-[0_0_8px_rgba(253,224,71,0.8)]" />
          </div>

          {/* Title & Subtitle */}
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-2xl font-black tracking-wide uppercase text-white font-['Orbitron',sans-serif] flex items-center gap-2 flex-wrap">
              10 LEVEL INCOME — 24%
            </h2>
            <p className="text-[10px] sm:text-xs font-bold uppercase text-amber-400 mt-0.5 tracking-wider font-mono">
              BUILD YOUR COMMUNITY • EXPAND YOUR NETWORK
            </p>
          </div>
        </div>

        {/* Two-Tone Futuristic Table */}
        <div className="overflow-hidden rounded-2xl border border-cyan-500/40 shadow-[0_0_15px_rgba(0,210,255,0.2)] bg-slate-950/70 backdrop-blur-md">
          {/* Table Header */}
          <div className="grid grid-cols-2 text-center text-sm sm:text-base font-black uppercase tracking-wider font-['Orbitron',sans-serif]">
            <div className="bg-[#051838] py-3 px-4 border-r border-cyan-400/30 text-cyan-300">
              Level Depth
            </div>
            <div className="bg-[#1f1705] py-3 px-4 text-amber-300">
              Income % (ROI on ROI)
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-cyan-500/15">
            {LEVEL_INCOME_PLAN_DATA.map(({ level, percentage, directs }) => {
              const isUnlocked = isVipAutoUnlocked || qualifiedDirects >= directs;

              return (
                <div
                  key={level}
                  className={`grid grid-cols-2 items-center text-center transition-all duration-200 font-mono ${
                    viewMode === "status"
                      ? isUnlocked
                        ? "bg-cyan-950/30 hover:bg-cyan-900/40"
                        : "bg-slate-950/40 opacity-60 hover:opacity-80"
                      : "bg-[#061226]/60 hover:bg-[#0c2246]/80"
                  }`}
                >
                  {/* Left Column: Level */}
                  <div className="py-2.5 px-4 font-bold text-sm sm:text-base text-white border-r border-cyan-500/20 flex items-center justify-center gap-2">
                    <span>Level {level < 10 ? `0${level}` : level}</span>
                    {viewMode === "status" && (
                      <span className="text-[10px]">
                        {isUnlocked ? (
                          <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                            <Unlock size={11} /> Unlocked
                          </span>
                        ) : (
                          <span className="text-slate-500 flex items-center gap-0.5">
                            <Lock size={11} /> (Req: {directs})
                          </span>
                        )}
                      </span>
                    )}
                  </div>

                  {/* Right Column: Income % */}
                  <div className="py-2.5 px-4 font-black text-sm sm:text-base text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]">
                    {percentage}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Golden VIP Rule Banner Inside Card */}
        <div className="mt-4 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-amber-300 font-bold">
            <Sparkles className="w-4 h-4 shrink-0 text-amber-400" />
            <span>VIP Rule: Join with $500 or above</span>
          </div>
          <span className="text-emerald-400 font-mono font-bold">
            ➔ All 10 Levels Automatically Unlocked!
          </span>
        </div>

        {/* Footer Brand Pillars */}
        {showFooterBranding && (
          <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>NODEXAI Community System</span>
            <span className="text-cyan-400">Total Distribution: 24%</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default LevelIncomePlanCard;
