import React from "react";
import { motion } from "framer-motion";
import { FiClock, FiAward, FiCheckCircle, FiShield, FiTrendingUp } from "react-icons/fi";

const BOOSTER_SLABS = [
  { target: "$1,000", bonus: "$20", badge: "TIER 01", color: "#38bdf8" },
  { target: "$2,500", bonus: "$60", badge: "TIER 02", color: "#00D2FF" },
  { target: "$5,000", bonus: "$150", badge: "TIER 03", color: "#60a5fa" },
  { target: "$10,000", bonus: "$350", badge: "TIER 04", color: "#D6A83A" },
  { target: "$25,000", bonus: "$1,000", badge: "TIER 05", color: "#f59e0b" },
  { target: "$50,000", bonus: "$2,250", badge: "TIER 06", color: "#f97316" },
  { target: "$100,000", bonus: "$5,000", badge: "TIER 07", color: "#ec4899", isMax: true },
];

const QUALIFICATION_RULES = [
  {
    title: "Self ID $100+ Required",
    desc: "Your personal activation must be $100 or above to participate in the booster pool.",
  },
  {
    title: "Minimum 3 Active Directs",
    desc: "Must sponsor at least 3 active direct referrals, each with an active package of $100 or above.",
  },
  {
    title: "7-Day Cyclical Completion",
    desc: "Required team business must be generated within the active 7-day booster window.",
  },
  {
    title: "Every 7 Days New Cycle",
    desc: "Cycles restart every 7 days, giving teams recurring opportunities to claim bonuses.",
  },
  {
    title: "Highest Slab Applicable",
    desc: "Only the highest achieved eligible slab bonus applies per cycle for clean distribution.",
  },
  {
    title: "Verified Team Business",
    desc: "Only eligible & verified on-chain team business volume counts toward qualification.",
  },
];

const BoosterIncome = () => {
  return (
    <section id="booster" className="relative overflow-hidden bg-[#020817] py-20 px-4 sm:px-6 lg:px-8 text-white">
      {/* Background Ambience */}
      <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/40 border border-amber-400/25 mb-4">
            <FiClock className="text-amber-400 text-sm" />
            <span className="text-xs font-mono font-bold tracking-[0.2em] text-amber-300 uppercase">
              7-DAY TEAM BUSINESS BOOSTER • UP TO $5,000 BONUS
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-['Orbitron',sans-serif] tracking-tight">
            Booster Bonus{" "}
            <span className="bg-gradient-to-r from-amber-400 via-yellow-200 to-cyan-300 bg-clip-text text-transparent">
              Slabs & Rules
            </span>
          </h2>

          <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed">
            Achieve your team business target within 7 days. Every 7 days a new booster cycle begins, unlocking massive bonus multipliers up to $5,000!
          </p>
        </div>

        {/* 7 Booster Slabs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
          {BOOSTER_SLABS.map((slab, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: idx * 0.06 }}
              className={`p-5 rounded-3xl backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 shadow-xl flex flex-col justify-between border ${
                slab.isMax
                  ? "bg-gradient-to-b from-[#1b103b] to-[#070c1d] border-pink-500/60 shadow-[0_0_30px_rgba(236,72,153,0.25)] md:col-span-2 lg:col-span-1"
                  : "bg-gradient-to-b from-[#071630]/90 to-[#030d1f]/95 border-slate-800 hover:border-amber-400/40"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-wider uppercase border"
                    style={{
                      backgroundColor: `${slab.color}15`,
                      borderColor: `${slab.color}40`,
                      color: slab.color,
                    }}
                  >
                    {slab.badge}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">7-Day Cycle</span>
                </div>

                <div className="text-xs font-mono uppercase text-slate-400">Team Business Target</div>
                <div className="text-xl sm:text-2xl font-black font-['Orbitron',sans-serif] text-white my-1">
                  {slab.target}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono uppercase">Booster Bonus</span>
                <span
                  className="text-xl sm:text-2xl font-black font-['Orbitron',sans-serif]"
                  style={{ color: slab.color }}
                >
                  {slab.bonus}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Qualification Rules 6-Card Grid */}
        <div className="p-7 sm:p-9 rounded-3xl bg-gradient-to-b from-[#081836] to-[#040e22] border border-cyan-500/30 shadow-[0_0_40px_rgba(0,210,255,0.15)]">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-7 pb-4 border-b border-slate-800">
            <div>
              <span className="text-xs font-mono text-amber-300 font-bold uppercase tracking-widest block">
                QUALIFICATION CRITERIA
              </span>
              <h3 className="text-xl sm:text-2xl font-bold font-['Orbitron',sans-serif] text-white">
                Booster Qualification Rules
              </h3>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 font-mono text-xs">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>7-Day Cyclical Engine</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {QUALIFICATION_RULES.map((rule, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-[#030c1d]/80 border border-slate-800 flex items-start gap-3.5"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-300 flex items-center justify-center font-bold text-sm shrink-0">
                  <FiCheckCircle />
                </div>
                <div>
                  <h4 className="text-sm font-bold font-['Orbitron',sans-serif] text-white">
                    {rule.title}
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {rule.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Footer Ribbon with Logo */}
          <div className="mt-7 pt-5 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src="/image/veltrion-logo.jpg" alt="Veltrion Capital" className="h-8 w-auto object-contain rounded" />
              <span className="text-xs font-mono text-slate-300">BUILD • QUALIFY • ACHIEVE</span>
            </div>
            <span className="text-xs font-mono text-amber-300 font-bold">
              Only the Highest Achieved Eligible Slab Bonus Applies.
            </span>
          </div>
        </div>

      </div>
    </section>
  );
};

export default BoosterIncome;
