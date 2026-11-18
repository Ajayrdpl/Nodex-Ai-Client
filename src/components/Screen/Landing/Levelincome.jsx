import React from "react";
import { motion } from "framer-motion";
import { FiLayers, FiCheckCircle, FiUnlock, FiUsers, FiStar } from "react-icons/fi";
import { RiOrganizationChart } from "react-icons/ri";

const levelData = [
  { level: 1, income: "8.0%", required: "1 Active Direct", color: "#00D2FF", badge: "DIRECT" },
  { level: 2, income: "4.0%", required: "2 Active Directs", color: "#38bdf8", badge: "TIER 02" },
  { level: 3, income: "3.0%", required: "3 Active Directs", color: "#60a5fa", badge: "TIER 03" },
  { level: 4, income: "2.0%", required: "4 Active Directs", color: "#D6A83A", badge: "TIER 04" },
  { level: 5, income: "1.5%", required: "5 Active Directs", color: "#f59e0b", badge: "TIER 05" },
  { level: 6, income: "1.5%", required: "6 Active Directs", color: "#f59e0b", badge: "TIER 06" },
  { level: 7, income: "1.0%", required: "7 Active Directs", color: "#a855f7", badge: "TIER 07" },
  { level: 8, income: "1.0%", required: "8 Active Directs", color: "#a855f7", badge: "TIER 08" },
  { level: 9, income: "1.0%", required: "9 Active Directs", color: "#ec4899", badge: "TIER 09" },
  { level: 10, income: "1.0%", required: "10 Active Directs", color: "#ec4899", badge: "TIER 10" },
];

const LevelIncome = () => {
  return (
    <section id="level-income" className="relative overflow-hidden bg-[#020817] py-20 px-4 sm:px-6 lg:px-8 text-white">
      {/* Glow Ambience */}
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/40 border border-amber-400/25 mb-4">
            <RiOrganizationChart className="text-amber-400 text-sm" />
            <span className="text-xs font-mono font-bold tracking-[0.2em] text-amber-300 uppercase">
              10 LEVEL INCOME • TOTAL DISTRIBUTION 24%
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-['Orbitron',sans-serif] tracking-tight">
            Build Your Community •{" "}
            <span className="bg-gradient-to-r from-amber-400 via-yellow-200 to-cyan-300 bg-clip-text text-transparent">
              Expand Your Network
            </span>
          </h2>

          <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed">
            NODEXAI distributes a staggering 24% total across 10 deep generation levels to reward network builders and leaders.
          </p>
        </div>

        {/* 10-Level Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5 sm:gap-4 mb-10">
          {levelData.map((item, index) => (
            <motion.div
              key={item.level}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="p-4 rounded-2xl bg-gradient-to-b from-[#071733]/90 to-[#030d1f]/95 border border-slate-800 hover:border-amber-400/50 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 text-center shadow-lg group"
            >
              <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 uppercase tracking-wider mb-2">
                <span>{item.badge}</span>
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
              </div>

              <div className="text-xs font-bold font-['Orbitron',sans-serif] text-slate-200 uppercase">
                Level {item.level < 10 ? `0${item.level}` : item.level}
              </div>

              <div
                className="text-2xl sm:text-3xl font-black font-['Orbitron',sans-serif] my-2 transition-transform group-hover:scale-110"
                style={{
                  color: item.color,
                  textShadow: `0 0 15px ${item.color}30`,
                }}
              >
                {item.income}
              </div>

              <div className="text-[10px] text-slate-400 font-mono">
                {item.required}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Total Distribution & Level Unlocking Rules Card */}
        <div className="p-7 sm:p-9 rounded-3xl bg-gradient-to-b from-[#081836] to-[#040e22] border border-cyan-500/30 shadow-[0_0_40px_rgba(0,210,255,0.15)]">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            
            {/* Left: Total 24% Distribution Banner */}
            <div className="md:col-span-5 p-6 rounded-2xl bg-gradient-to-r from-[#0a2347] to-[#061730] border border-amber-400/40 text-center md:text-left">
              <span className="text-[10px] font-mono text-amber-300 uppercase tracking-widest font-bold">
                CUMULATIVE PAYOUT
              </span>
              <div className="text-3xl sm:text-4xl font-black font-['Orbitron',sans-serif] text-white my-2 flex items-center justify-center md:justify-start gap-2">
                <span>Total Level Distribution</span>
                <span className="text-amber-300">➔ 24%</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Full 24% volume distributed instantly through smart contract across 10 generations with zero manual intervention.
              </p>
            </div>

            {/* Right: Golden Level Unlocking Rule ($500+ Auto Unlock) */}
            <div className="md:col-span-7 space-y-4">
              <div className="p-5 rounded-2xl bg-[#030d1f]/90 border border-amber-400/50 shadow-[0_0_20px_rgba(214,168,58,0.2)]">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold">
                    <FiUnlock />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase text-amber-300 font-bold tracking-wider">
                      GOLDEN VIP UNLOCK RULE
                    </span>
                    <h4 className="text-base font-bold font-['Orbitron',sans-serif] text-white">
                      Join With $500 Or Above
                    </h4>
                  </div>
                </div>
                <div className="text-xs sm:text-sm text-emerald-400 font-semibold bg-emerald-950/40 border border-emerald-500/30 px-3 py-2 rounded-xl">
                  ★ ALL 10 LEVELS AUTOMATICALLY UNLOCKED WITH ZERO CONDITIONAL DELAYS!
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#030919] border border-slate-800 text-slate-300">
                  <strong className="text-white block font-mono">1 Active Direct:</strong>
                  <span>Unlocks Level 1</span>
                </div>
                <div className="p-3 rounded-xl bg-[#030919] border border-slate-800 text-slate-300">
                  <strong className="text-white block font-mono">10 Active Directs:</strong>
                  <span>Unlocks All 10 Levels</span>
                </div>
              </div>
            </div>

          </div>

          {/* Footer Logo */}
          <div className="mt-7 pt-4 border-t border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/NodexAI.jpeg" alt="NODEXAI" className="h-7 w-auto object-contain rounded" />
              <span className="text-xs font-mono text-slate-400">Decentralized Multi-Tier Generation Network</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">BNB Smart Chain (BEP-20)</span>
          </div>
        </div>

      </div>
    </section>
  );
};

export default LevelIncome;
