import React, { useState } from "react";
import { ShieldCheck, Lock, Unlock, Users, Award, Sparkles, LayoutGrid, FileText, CheckCircle2 } from "lucide-react";
import LevelIncomePlanCard from "./LevelIncomePlanCard";

// Official Veltrion Capital 10-Level Income Structure (Total: 24%)
export const LEVEL_RATES = [
  { level: 1, percentage: 8.0, directsRequired: 1 },
  { level: 2, percentage: 4.0, directsRequired: 2 },
  { level: 3, percentage: 3.0, directsRequired: 3 },
  { level: 4, percentage: 2.0, directsRequired: 4 },
  { level: 5, percentage: 1.5, directsRequired: 5 },
  { level: 6, percentage: 1.5, directsRequired: 6 },
  { level: 7, percentage: 1.0, directsRequired: 7 },
  { level: 8, percentage: 1.0, directsRequired: 8 },
  { level: 9, percentage: 1.0, directsRequired: 9 },
  { level: 10, percentage: 1.0, directsRequired: 10 },
];

const LevelConditionsTable = ({ levelInfo, directCount }) => {
  const [activeTab, setActiveTab] = useState("showcase"); // "showcase" or "grid"
  const qualifiedDirects = Number(levelInfo?.qualifiedDirects ?? directCount ?? 0);
  const userInvestment = Number(levelInfo?.selfInvestment || 0);
  const isVipAutoUnlocked = Boolean(levelInfo?.isVipAutoUnlocked || userInvestment >= 500);
  const maxUnlocked = isVipAutoUnlocked ? 10 : Number(levelInfo?.maxUnlockedLevel ?? qualifiedDirects);
  const nextReq = levelInfo?.nextRequirement;

  return (
    <div className="space-y-6">
      {/* Criteria & Unlock Progress Banner */}
      <div className="neon-glow-card p-5 sm:p-6 relative overflow-hidden bg-gradient-to-br from-[#071733] via-[#040e22] to-[#020817] border border-cyan-500/30 rounded-3xl shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-500/15 border border-amber-500/30 rounded-2xl text-amber-300 shadow-[0_0_15px_rgba(234,179,8,0.3)] shrink-0">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-cyan-400 font-mono">
                  10-Level ROI Dividend Unlocking System
                </span>
                {isVipAutoUnlocked && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                    VIP $500+ Unlocked
                  </span>
                )}
              </div>
              <h3 className="text-xl md:text-2xl font-black text-white mt-0.5 font-['Orbitron',sans-serif]">
                Unlocked Depth:{" "}
                <span className="text-emerald-400 font-mono font-bold">
                  {maxUnlocked >= 10 ? "All 10 Levels Unlocked" : maxUnlocked > 0 ? `Level 1 to Level ${maxUnlocked}` : "Locked"}
                </span>
              </h3>
              <p className="text-slate-300 text-xs sm:text-sm mt-1">
                Rule: <strong className="text-amber-300">1 Active Direct ($10+) unlocks 1 Generation Level</strong> up to 10 Levels.
              </p>
            </div>
          </div>

          {/* Right Controls + Qualified Directs */}
          <div className="flex flex-col sm:flex-row items-end md:items-center gap-3 w-full md:w-auto justify-between">
            <div className="bg-slate-950/90 border border-cyan-500/30 p-3.5 rounded-2xl space-y-0.5 text-right min-w-[190px]">
              <div className="text-[11px] text-slate-400 font-mono">Active Directs:</div>
              <div className="text-2xl font-black text-amber-300 font-mono drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]">
                {isVipAutoUnlocked ? "10 / 10 (VIP)" : `${qualifiedDirects} / 10`}
              </div>
              {isVipAutoUnlocked ? (
                <div className="text-[10px] text-emerald-400 font-bold flex items-center justify-end gap-1">
                  <CheckCircle2 className="w-3 h-3" /> All 10 Levels Active
                </div>
              ) : nextReq?.description ? (
                <div className="text-[10px] text-cyan-300 font-medium truncate max-w-[200px]">
                  {nextReq.description}
                </div>
              ) : null}
            </div>

            {/* View Switcher */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-cyan-500/30 shrink-0">
              <button
                onClick={() => setActiveTab("showcase")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  activeTab === "showcase"
                    ? "bg-amber-400 text-slate-950 shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <FileText size={13} />
                Plan Card
              </button>
              <button
                onClick={() => setActiveTab("grid")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  activeTab === "grid"
                    ? "bg-cyan-500 text-slate-950 shadow-md font-black"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <LayoutGrid size={13} />
                Matrix Grid
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Official Rule & Condition Boxes (Matching Official Image) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Box 1: Level Unlock Condition (Blue) */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#061833] via-[#041026] to-[#020817] border border-cyan-500/40 shadow-[0_0_25px_rgba(0,210,255,0.15)] flex flex-col justify-between">
          <div className="flex items-center gap-2.5 pb-3 border-b border-cyan-500/20 mb-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300">
              <Users className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-extrabold uppercase tracking-wider text-cyan-300 font-['Orbitron',sans-serif]">
              LEVEL UNLOCK CONDITION
            </h4>
          </div>

          <div className="space-y-2.5 font-mono text-xs">
            <div className="flex justify-between items-center p-3 rounded-xl bg-[#020817] border border-cyan-500/20">
              <span className="text-slate-300 font-bold">1 Active Direct</span>
              <span className="text-cyan-400 font-black">➔ 1 Level Unlock</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-[#020817] border border-cyan-500/20">
              <span className="text-slate-300 font-bold">10 Active Directs</span>
              <span className="text-emerald-400 font-black">➔ All 10 Levels Unlock</span>
            </div>
          </div>
        </div>

        {/* Box 2: Level Unlocking Rule (Gold) */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#1a1205] via-[#0c0903] to-[#020817] border border-amber-500/40 shadow-[0_0_25px_rgba(245,158,11,0.15)] flex flex-col justify-between">
          <div className="flex items-center gap-2.5 pb-3 border-b border-amber-500/20 mb-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
              <Unlock className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-extrabold uppercase tracking-wider text-amber-300 font-['Orbitron',sans-serif]">
              LEVEL UNLOCKING RULE
            </h4>
          </div>

          <div className="p-3.5 rounded-xl bg-[#020817] border border-amber-500/30 text-center space-y-1">
            <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 block">
              JOIN WITH
            </span>
            <div className="text-xl sm:text-2xl font-black text-amber-300 font-['Orbitron',sans-serif] tracking-wider">
              $500 OR ABOVE
            </div>
            <span className="text-xs font-bold text-emerald-400 font-mono block">
              ALL 10 LEVELS AUTOMATICALLY UNLOCKED
            </span>
          </div>
        </div>
      </div>

      {/* View 1: Exact Luxury Showcase Card */}
      {activeTab === "showcase" && (
        <LevelIncomePlanCard levelInfo={levelInfo} directCount={directCount} />
      )}

      {/* View 2: Detailed 10-Level Matrix Cards Grid */}
      {activeTab === "grid" && (
        <div className="neon-glow-card p-6 shadow-xl rounded-3xl bg-[#030d1d] border border-cyan-500/25">
          <div className="flex items-center justify-between pb-4 border-b border-cyan-500/20 mb-6">
            <div>
              <h4 className="text-lg font-black text-white font-['Orbitron',sans-serif]">
                10-Level Dividend Breakdown & Status
              </h4>
              <p className="text-xs text-slate-400">
                Percentages paid on every downline&apos;s Daily Trading ROI dividend
              </p>
            </div>
            <span className="text-xs font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-3 py-1 rounded-full font-mono">
              Total Distribution: 24%
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {LEVEL_RATES.map(({ level, percentage, directsRequired }) => {
              const isUnlocked = isVipAutoUnlocked || qualifiedDirects >= directsRequired;

              return (
                <div
                  key={level}
                  className={`p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
                    isUnlocked
                      ? "bg-gradient-to-br from-cyan-950/40 via-slate-900 to-slate-950 border-cyan-500/40 shadow-lg shadow-cyan-500/5 hover:border-cyan-400"
                      : "bg-slate-950/60 border-slate-800/80 opacity-60 hover:opacity-80"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-400 font-mono">
                      Level {level < 10 ? `0${level}` : level}
                    </span>
                    {isUnlocked ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        <Unlock size={10} /> Unlocked
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-slate-500 bg-slate-800/60 px-2 py-0.5 rounded-full border border-slate-700/60">
                        <Lock size={10} /> Locked
                      </span>
                    )}
                  </div>

                  <div className="text-2xl font-black text-white mt-1 font-['Orbitron',sans-serif]">
                    <span className="text-amber-400">{percentage}%</span>{" "}
                    <span className="text-xs font-bold text-slate-400 font-sans">ROI Yield</span>
                  </div>

                  <div className="text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800/80 flex justify-between items-center font-mono">
                    <span>Required:</span>
                    <strong className={isUnlocked ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
                      {directsRequired} {directsRequired === 1 ? "Direct" : "Directs"}
                    </strong>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default LevelConditionsTable;
