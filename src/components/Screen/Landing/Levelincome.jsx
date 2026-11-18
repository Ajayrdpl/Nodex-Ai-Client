import React from "react";
import { motion } from "framer-motion";
import { FiLayers, FiCheckCircle, FiUnlock, FiUsers, FiStar, FiShield } from "react-icons/fi";
import { RiOrganizationChart } from "react-icons/ri";

const levelData = [
  { level: 1, percent: "10.0%", amount: "$2.50", desc: "Direct Income", color: "#00D2FF", badge: "DIRECT" },
  { level: 2, percent: "5.0%", amount: "$1.25", desc: "Generation 2", color: "#38bdf8", badge: "TIER 02" },
  { level: 3, percent: "3.0%", amount: "$0.75", desc: "Generation 3", color: "#60a5fa", badge: "TIER 03" },
  { level: 4, percent: "2.0%", amount: "$0.50", desc: "Generation 4", color: "#818cf8", badge: "TIER 04" },
  { level: 5, percent: "2.0%", amount: "$0.50", desc: "Generation 5", color: "#a855f7", badge: "TIER 05" },
  { level: 6, percent: "2.0%", amount: "$0.50", desc: "Generation 6", color: "#c084fc", badge: "TIER 06" },
  { level: 7, percent: "2.0%", amount: "$0.50", desc: "Generation 7", color: "#fbbf24", badge: "TIER 07" },
  { level: 8, percent: "2.0%", amount: "$0.50", desc: "Generation 8", color: "#f59e0b", badge: "TIER 08" },
  { level: 9, percent: "1.0%", amount: "$0.25", desc: "Generation 9", color: "#ec4899", badge: "TIER 09" },
  { level: 10, percent: "1.0%", amount: "$0.25", desc: "Generation 10", color: "#f43f5e", badge: "TIER 10" },
];

const LevelIncome = () => {
  return (
    <section id="level-income" className="relative overflow-hidden bg-[#020817] py-20 px-4 sm:px-6 lg:px-8 text-white">
      {/* Glow Ambience */}
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/40 border border-cyan-400/25 mb-4">
            <RiOrganizationChart className="text-cyan-400 text-sm" />
            <span className="text-xs font-mono font-bold tracking-[0.2em] text-cyan-300 uppercase">
              10 LEVEL GENERATION INCOME • 20% ALLOCATION ($5.00)
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-['Orbitron',sans-serif] tracking-tight">
            10-Generation{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-sky-200 to-amber-300 bg-clip-text text-transparent">
              Level Commission
            </span>
          </h2>

          <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed">
            Every $25 package allocates $5.00 (20%) across Level 2 to Level 10. Sponsor 5 active direct partners to unlock all 10 generations!
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
              className="p-4 rounded-2xl bg-gradient-to-b from-[#071733]/90 to-[#030d1f]/95 border border-slate-800 hover:border-cyan-400/50 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 text-center shadow-lg group"
            >
              <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 uppercase tracking-wider mb-2">
                <span>{item.badge}</span>
                <span className="text-cyan-400 font-bold">L{item.level}</span>
              </div>

              <div className="text-2xl sm:text-3xl font-black font-['Orbitron',monospace] text-white my-1 group-hover:scale-105 transition-transform" style={{ color: item.color }}>
                {item.percent}
              </div>

              <div className="text-xs font-mono font-bold text-amber-300">
                {item.amount}
              </div>

              <div className="mt-2 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 font-mono">
                {item.desc}
              </div>
            </motion.div>
          ))}
        </div>

        {/* 5-Directs Unlocking Rule Box */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#04122b] via-[#06183d] to-[#04122b] border border-amber-400/40 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/40 text-amber-300 flex items-center justify-center font-bold text-xl shrink-0">
              <FiUnlock />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-bold text-amber-300 uppercase">OFFICIAL QUALIFICATION RULE</span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-400/20 text-amber-200">5 DIRECTS</span>
              </div>
              <h4 className="text-lg font-bold text-white font-['Orbitron',sans-serif]">
                5 Direct Compulsory — All Levels Open
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed max-w-2xl">
                To receive commissions from all 10 generations, a member must have at least 5 active direct referrals who joined with the $25 package.
              </p>
            </div>
          </div>

          <div className="text-center md:text-right shrink-0 p-4 rounded-2xl bg-[#020a1a] border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Total Level Pool</span>
            <div className="text-2xl font-black font-['Orbitron',monospace] text-cyan-400">$5.00 (20%)</div>
            <span className="text-[10px] text-emerald-400 font-mono">Distributed 100%</span>
          </div>
        </div>

      </div>
    </section>
  );
};

export default LevelIncome;
