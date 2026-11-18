import React from "react";
import { motion } from "framer-motion";
import { FiAward, FiCheckCircle, FiShield, FiTrendingUp, FiZap, FiClock } from "react-icons/fi";

const CLUBS = [
  {
    key: "puma",
    name: "PUMA CLUB",
    directs: "5 Directs",
    timeframe: "7 Days",
    reward: "$150",
    ctoShare: "5% Daily CTO",
    badge: "FAST TRACK",
    color: "#00D2FF",
    desc: "Sponsor 5 direct members within your first 7 days to unlock $150 cash + 5% daily company turnover share.",
    highlights: [
      "Target: 5 Active Directs",
      "Time Window: 7 Days from activation",
      "Instant Cash Reward: $150.00",
      "Daily Income: 5% Daily Company Turnover Pool",
    ],
  },
  {
    key: "pajero",
    name: "PAJERO CLUB",
    directs: "10 Directs",
    timeframe: "15 Days",
    reward: "$300",
    ctoShare: "3% Daily CTO",
    badge: "LEADER TIER",
    color: "#D6A83A",
    desc: "Sponsor 10 direct members within 15 days to unlock $300 cash + 3% daily company turnover share.",
    highlights: [
      "Target: 10 Active Directs",
      "Time Window: 15 Days from activation",
      "Instant Cash Reward: $300.00",
      "Daily Income: 3% Daily Company Turnover Pool",
    ],
  },
  {
    key: "panther",
    name: "PANTHER CLUB",
    directs: "15 Directs",
    timeframe: "30 Days",
    reward: "$500",
    ctoShare: "2% Daily CTO",
    badge: "ROYALTY TIER",
    color: "#a855f7",
    desc: "Sponsor 15 direct members within 30 days to unlock $500 cash + 2% daily company turnover share.",
    highlights: [
      "Target: 15 Active Directs",
      "Time Window: 30 Days from activation",
      "Instant Cash Reward: $500.00",
      "Daily Income: 2% Daily Company Turnover Pool",
    ],
  },
];

const CLUB_RULES = [
  {
    title: "10% Package CTO Allocation",
    desc: "From every $25 package sold globally, $2.50 (10%) is automatically added to the Club Turnover Pool.",
  },
  {
    title: "Exact Milestone Rewards",
    desc: "One-time milestone cash rewards ($150, $300, $500) are credited directly to your income wallet.",
  },
  {
    title: "Daily Midday Pool Payout",
    desc: "Company Turnover Pool is divided equally each day among all active qualified achievers.",
  },
  {
    title: "100% On-Chain BEP-20",
    desc: "All packages and payouts settle on Binance Smart Chain using official USDT.",
  },
];

const BoosterIncome = () => {
  return (
    <section id="booster" className="relative overflow-hidden bg-[#020817] py-20 px-4 sm:px-6 lg:px-8 text-white">
      {/* Background Ambience */}
      <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/40 border border-cyan-400/25 mb-4">
            <FiAward className="text-cyan-400 text-sm" />
            <span className="text-xs font-mono font-bold tracking-[0.2em] text-cyan-300 uppercase">
              NODEXAI.IO CLUB INCOME & C.T.O POOL
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-['Orbitron',sans-serif] tracking-tight">
            Puma • Pajero • Panther{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-sky-200 to-amber-300 bg-clip-text text-transparent">
              Elite Clubs
            </span>
          </h2>

          <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed">
            Fast-track your network growth to claim up to $500 in one-time milestone rewards, plus earn daily shares from 10% of global company turnover!
          </p>
        </div>

        {/* 3 Club Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {CLUBS.map((club, idx) => (
            <motion.div
              key={club.key}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="relative p-8 rounded-3xl bg-gradient-to-b from-[#07193b] via-[#04112a] to-[#020919] border border-cyan-500/30 hover:border-cyan-400 transition-all duration-300 hover:-translate-y-2 flex flex-col justify-between shadow-2xl group overflow-hidden"
            >
              <div className="absolute -top-16 -right-16 w-40 h-40 rounded-full blur-2xl pointer-events-none" style={{ backgroundColor: `${club.color}15` }} />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-bold text-slate-400 tracking-widest uppercase">
                    {club.timeframe} TARGET
                  </span>
                  <span
                    className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest border"
                    style={{
                      backgroundColor: `${club.color}15`,
                      borderColor: `${club.color}40`,
                      color: club.color,
                    }}
                  >
                    {club.badge}
                  </span>
                </div>

                <h3 className="text-2xl font-black font-['Orbitron',sans-serif] text-white mb-2">
                  {club.name}
                </h3>

                <div className="p-4 rounded-2xl bg-[#030d22]/80 border border-slate-800 my-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Cash Reward</span>
                    <div className="text-3xl font-black font-['Orbitron',monospace]" style={{ color: club.color }}>
                      {club.reward}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Daily CTO</span>
                    <div className="text-xl font-bold font-mono text-amber-300 mt-1">
                      {club.ctoShare}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-6">
                  {club.desc}
                </p>

                <div className="space-y-2.5 pt-4 border-t border-slate-800/80">
                  {club.highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-300 font-mono">
                      <FiCheckCircle className="text-emerald-400 shrink-0 text-sm" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
                <span className="flex items-center gap-1.5 text-cyan-300">
                  <FiClock /> {club.timeframe} Limit
                </span>
                <span className="text-amber-400 font-bold">{club.directs}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Club Rules Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-8 rounded-3xl bg-[#030e24]/70 border border-cyan-500/20">
          {CLUB_RULES.map((rule, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 text-sm font-bold font-['Orbitron',monospace]">
                <FiShield className="text-base" />
                <span>Rule #{idx + 1}</span>
              </div>
              <h4 className="text-sm font-bold text-white">{rule.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{rule.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default BoosterIncome;
