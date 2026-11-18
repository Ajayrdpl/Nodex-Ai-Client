import React, { useState } from "react";
import { Briefcase, Award, Crown, Zap, Sparkles, CheckCircle2, Lock, Unlock } from "lucide-react";

export const SALARY_STRUCTURE_DATA = [
  { rank: 1, name: "Associate", target: "$1,000", weekly: "$10 / wk", weeks: "10 Wks", total: "$100" },
  { rank: 2, name: "Senior Associate", target: "$3,000", weekly: "$20 / wk", weeks: "10 Wks", total: "$200" },
  { rank: 3, name: "Executive", target: "$5,000", weekly: "$30 / wk", weeks: "10 Wks", total: "$300" },
  { rank: 4, name: "Senior Executive", target: "$10,000", weekly: "$50 / wk", weeks: "10 Wks", total: "$500" },
  { rank: 5, name: "Team Leader", target: "$25,000", weekly: "$100 / wk", weeks: "15 Wks", total: "$1,500" },
  { rank: 6, name: "Senior Team Leader", target: "$50,000", weekly: "$200 / wk", weeks: "15 Wks", total: "$3,000" },
  { rank: 7, name: "Assistant Manager", target: "$75,000", weekly: "$300 / wk", weeks: "20 Wks", total: "$6,000" },
  { rank: 8, name: "Manager", target: "$100,000", weekly: "$500 / wk", weeks: "15 Wks", total: "$7,500" },
  { rank: 9, name: "Senior Manager", target: "$200,000", weekly: "$750 / wk", weeks: "20 Wks", total: "$15,000" },
  { rank: 10, name: "Assistant Director", target: "$500,000", weekly: "$1,000 / wk", weeks: "25 Wks", total: "$25,000" },
  { rank: 11, name: "Director", target: "$1,000,000", weekly: "$2,000 / wk", weeks: "25 Wks", total: "$50,000" },
  { rank: 12, name: "Senior Director", target: "$2,500,000", weekly: "$3,000 / wk", weeks: "25 Wks", total: "$75,000" },
  { rank: 13, name: "Vice President", target: "$5,000,000", weekly: "$5,000 / wk", weeks: "20 Wks", total: "$100,000" },
  { rank: 14, name: "Senior Vice President", target: "$10,000,000", weekly: "$10,000 / wk", weeks: "20 Wks", total: "$200,000" },
  { rank: 15, name: "President", target: "$25,000,000", weekly: "$20,000 / wk", weeks: "15 Wks", total: "$300,000" },
];

const SalaryStructurePlanCard = ({ userRank = 0, showFooterBranding = true }) => {
  return (
    <div className="w-full max-w-4xl mx-auto my-6 font-sans">
      {/* Outer Glowing Neon Card */}
      <div className="neon-glow-card p-4 sm:p-7 relative overflow-hidden transition-all duration-300">
        
        {/* Ambient Glow Orbs */}
        <div className="absolute top-0 left-1/3 w-64 h-32 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-48 h-32 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header Section */}
        <div className="flex items-center gap-3.5 sm:gap-4 mb-5 pt-1">
          {/* Gold Glowing Circular Badge */}
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full neon-gold-ring flex items-center justify-center shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300 drop-shadow-[0_0_8px_rgba(253,224,71,0.8)]" />
            </div>
          </div>

          {/* Title & Subtitle */}
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-2xl font-black tracking-wide uppercase gold-metallic-text flex items-center gap-2 flex-wrap">
              SALARY STRUCTURE — 15 RANKS
            </h2>
            <p className="text-[10px] sm:text-xs font-bold uppercase gold-sub-text mt-0.5 tracking-wider">
              WEEKLY FIXED PAYOUT ROADMAP (50% : 30% : 20% MATRIX)
            </p>
          </div>
        </div>

        {/* Two-Tone Futuristic Table */}
        <div className="overflow-hidden rounded-2xl border border-sky-500/40 shadow-[0_0_15px_rgba(14,165,233,0.2)] bg-slate-950/70 backdrop-blur-md overflow-x-auto">
          {/* Table Header */}
          <div className="grid grid-cols-5 text-center text-xs sm:text-sm font-black uppercase tracking-wider min-w-[550px]">
            <div className="split-header-blue py-3 px-2 border-r border-sky-400/30">
              Rank & Name
            </div>
            <div className="split-header-blue py-3 px-2 border-r border-sky-400/30">
              Team Business
            </div>
            <div className="split-header-gold py-3 px-2 border-r border-amber-500/40">
              Weekly Salary
            </div>
            <div className="split-header-gold py-3 px-2 border-r border-amber-500/40">
              Duration
            </div>
            <div className="split-header-gold py-3 px-2">
              Total Payout
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-sky-500/20 min-w-[550px]">
            {SALARY_STRUCTURE_DATA.map((item) => {
              const isAchieved = userRank >= item.rank;

              return (
                <div
                  key={item.rank}
                  className={`grid grid-cols-5 items-center text-center transition-all duration-200 text-xs sm:text-sm ${
                    isAchieved
                      ? "bg-emerald-950/40 hover:bg-emerald-900/50"
                      : "bg-[#061226]/60 hover:bg-[#0c2246]/80"
                  }`}
                >
                  {/* Rank & Name */}
                  <div className="py-2.5 px-3 font-bold text-white border-r border-sky-500/30 flex items-center justify-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-300 font-mono text-[10px] flex items-center justify-center border border-sky-400/30">
                      {item.rank}
                    </span>
                    <span className="truncate">{item.name}</span>
                  </div>

                  {/* Target */}
                  <div className="py-2.5 px-3 font-mono font-bold text-sky-200 border-r border-sky-500/30">
                    {item.target}
                  </div>

                  {/* Weekly Salary */}
                  <div className="py-2.5 px-3 font-black text-amber-300 border-r border-sky-500/30 drop-shadow-[0_0_6px_rgba(251,191,36,0.3)]">
                    {item.weekly}
                  </div>

                  {/* Duration */}
                  <div className="py-2.5 px-3 font-semibold text-slate-300 border-r border-sky-500/30">
                    {item.weeks}
                  </div>

                  {/* Total Payout */}
                  <div className="py-2.5 px-3 font-black text-emerald-400 font-mono">
                    {item.total}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Brand Pillars */}
        {showFooterBranding && (
          <div className="mt-5 pt-3 border-t border-sky-500/20 text-center">
            <div className="text-[9px] sm:text-[11px] font-bold tracking-widest uppercase text-slate-400 flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
              <span className="hover:text-amber-300 transition">OPPORTUNITIES</span>
              <span className="text-sky-500">|</span>
              <span className="hover:text-amber-300 transition">GROWTH</span>
              <span className="text-sky-500">|</span>
              <span className="hover:text-amber-300 transition">SUCCESS</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalaryStructurePlanCard;
