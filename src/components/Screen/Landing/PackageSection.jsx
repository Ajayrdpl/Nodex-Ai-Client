import React from "react";
import { motion } from "framer-motion";
import { FiDollarSign, FiZap, FiTrendingUp, FiShield, FiCheck, FiArrowRight, FiUsers, FiAward, FiLayers, FiActivity, FiGlobe } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { LandingRouters } from "../../../constants/routes";

const INCOMES = [
  {
    num: "01",
    name: "Direct Referral Income",
    percent: "5%",
    amount: "$1.25",
    color: "#00D2FF",
    icon: <FiUsers className="w-6 h-6 text-cyan-400" />,
    badge: "INSTANT CREDIT",
    desc: "Earn $1.25 immediately for every direct partner joining with the $25 package.",
    breakdown: [
      "1 Direct Sponsor = $1.25",
      "5 Direct Sponsors = $6.25",
      "10 Direct Sponsors = $12.50",
      "Unlimited Direct Sponsoring",
    ],
  },
  {
    num: "02",
    name: "10-Level Team Income",
    percent: "20%",
    amount: "$5.00",
    color: "#fbbf24",
    icon: <FiLayers className="w-6 h-6 text-amber-400" />,
    badge: "5 DIRECTS UNLOCKS ALL",
    desc: "Earn multi-tier commissions from 10 generations of your growing network.",
    breakdown: [
      "L1: 5% ($1.25) Direct",
      "L2: 5% ($1.25) | L3: 3% ($0.75)",
      "L4–L8: 2% ($0.50 each)",
      "L9–L10: 1% ($0.25 each)",
    ],
  },
  {
    num: "03",
    name: "Binary Matching Income",
    percent: "50%",
    amount: "$12.50",
    color: "#10b981",
    icon: <FiActivity className="w-6 h-6 text-emerald-400" />,
    badge: "1:1 MATCHING BONUS",
    desc: "Match Left and Right team package volume for generous 50% payout per pair.",
    breakdown: [
      "1:1 Matching Bonus Ratio",
      "$12.50 per matched $25 pair",
      "Unmatched volume carries forward",
      "Daily capping for sustained growth",
    ],
  },
  {
    num: "04",
    name: "Club Income & CTO Pool",
    percent: "10%",
    amount: "$2.50",
    color: "#a855f7",
    icon: <FiAward className="w-6 h-6 text-purple-400" />,
    badge: "DAILY CTO + REWARDS",
    desc: "Achieve milestone clubs for one-time cash rewards + share of daily company turnover.",
    breakdown: [
      "Puma: 5 Directs (7 Days) → $150 + 5% CTO",
      "Pajero: 10 Directs (15 Days) → $300 + 3% CTO",
      "Panther: 15 Directs (30 Days) → $500 + 2% CTO",
      "Equally shared among club achievers",
    ],
  },
  {
    num: "05",
    name: "Community Support & Bonanza",
    percent: "10%",
    amount: "$2.50",
    color: "#f43f5e",
    icon: <FiGlobe className="w-6 h-6 text-rose-400" />,
    badge: "ECOSYSTEM GROWTH",
    desc: "Reserved for global community development, leader rewards, marketing and bonanza promotions.",
    breakdown: [
      "$2.50 allocated from every package",
      "Special Festival Bonanza Rewards",
      "Global Community Leader Incentives",
      "Ecosystem Marketing & Expansion",
    ],
  },
  {
    num: "06",
    name: "Node Wonder Cycle Engine",
    percent: "150% ROI",
    amount: "$150.00",
    color: "#38bdf8",
    icon: <FiZap className="w-6 h-6 text-cyan-400" />,
    badge: "GLOBAL FIFO QUEUE",
    desc: "Autonomous 2:1 queuing engine yielding $150 per cycle with unlimited re-entries and 5% direct referral.",
    breakdown: [
      "$100 Node Wonder Entry Package",
      "$150 Payout per completed cycle",
      "5% ($5.00) Unconditional Direct Bonus",
      "Unlimited Cycles & FIFO Transparency",
    ],
  },
];

const PackageSection = () => {
  const navigate = useNavigate();

  return (
    <section id="packages" className="relative overflow-hidden bg-[#020817] py-20 px-4 sm:px-6 lg:px-8 text-white">
      {/* Ambient Radial Lights */}
      <div className="absolute top-10 left-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/3 w-96 h-96 bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/40 border border-cyan-400/25 mb-4">
            <FiZap className="text-cyan-400 text-sm" />
            <span className="text-xs font-mono font-bold tracking-[0.2em] text-cyan-300 uppercase">
              NODEXAI.IO OFFICIAL BUSINESS PLAN
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-['Orbitron',sans-serif] tracking-tight">
            Single $25 Package,{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-sky-200 to-amber-300 bg-clip-text text-transparent">
              Five Powerful Incomes
            </span>
          </h2>

          <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed">
            Every $25 joining package is 100% transparently distributed across 5 high-yield reward streams designed for maximum community empowerment and long-term sustainability.
          </p>
        </div>

        {/* ── HERO PACKAGE HIGHLIGHT CARD ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative max-w-4xl mx-auto mb-16 p-8 sm:p-10 rounded-3xl bg-gradient-to-b from-[#081836] via-[#041026] to-[#020817] border-2 border-cyan-500/40 shadow-[0_0_50px_rgba(0,210,255,0.2)] overflow-hidden"
        >
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 text-center md:text-left">
              <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 tracking-widest uppercase">
                STARTER ACTIVATION PACKAGE
              </span>
              <h3 className="text-3xl sm:text-4xl font-extrabold font-['Orbitron',monospace] text-white">
                NODEXAI PACKAGE — <span className="text-cyan-400">$25 USDT</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md">
                100% Package Distribution with 1:1 Binary Matching, 10-Level Matrix, Direct Commission, and Daily Company Turnover Club Pools!
              </p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>BNB Smart Chain (BEP-20)</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span>Instant $25 Activation</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center gap-4 shrink-0">
              <div className="text-center p-6 rounded-2xl bg-[#06142e]/90 border border-cyan-400/30 shadow-inner">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest">Package Price</span>
                <div className="text-4xl sm:text-5xl font-black font-['Orbitron',monospace] text-amber-400 mt-1">
                  $25<span className="text-sm text-slate-400 font-normal">.00</span>
                </div>
                <span className="text-[10px] text-cyan-300 font-mono mt-1 block">100% Distributed</span>
              </div>
              <button
                onClick={() => navigate(LandingRouters.USER_REGISTER)}
                className="w-full px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-400 hover:brightness-110 shadow-[0_0_20px_rgba(0,210,255,0.4)] flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 hover:scale-105 font-['Orbitron',monospace]"
              >
                <span>Activate $25 Plan</span>
                <FiArrowRight />
              </button>
            </div>
          </div>
        </motion.div>

        {/* ── 5 INCOMES GRID ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {INCOMES.map((inc, idx) => (
            <motion.div
              key={inc.num}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="relative p-6 rounded-3xl bg-gradient-to-b from-[#06142e]/90 to-[#020b1c]/95 border border-slate-800 hover:border-cyan-400/50 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden shadow-xl group"
            >
              {/* Header */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-700 group-hover:scale-110 transition-transform">
                    {inc.icon}
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[9px] font-mono font-bold bg-cyan-950/60 text-cyan-300 border border-cyan-500/20 uppercase tracking-widest">
                    {inc.badge}
                  </span>
                </div>

                <div className="flex items-baseline justify-between mb-2">
                  <h4 className="text-lg font-bold font-['Orbitron',sans-serif] text-white">
                    {inc.name}
                  </h4>
                  <div className="text-right">
                    <span className="text-xl font-black font-['Orbitron',monospace] text-amber-400">
                      {inc.percent}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-mono">({inc.amount})</span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  {inc.desc}
                </p>

                {/* Breakdown List */}
                <ul className="space-y-2 pt-3 border-t border-slate-800/80">
                  {inc.breakdown.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-slate-300 font-mono">
                      <FiCheck className="text-emerald-400 text-xs shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Bottom tag */}
              <div className="mt-5 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>Stream #{inc.num}</span>
                <span className="text-cyan-400 font-semibold">{inc.amount} Allocation</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Total Distribution Footer Banner */}
        <div className="p-6 rounded-2xl bg-[#030d22] border border-cyan-500/20 text-center max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <span className="text-xs font-mono font-bold text-cyan-300 tracking-wider uppercase block">
              100% Mathematical Precision
            </span>
            <span className="text-sm text-slate-300">
              Direct ($2.50) + Level ($5.00) + Binary ($12.50) + Club ($2.50) + Community ($2.50) = <strong className="text-white">$25.00 Total</strong>
            </span>
          </div>
          <button
            onClick={() => navigate(LandingRouters.USER_REGISTER)}
            className="px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-black bg-gradient-to-r from-amber-400 to-yellow-300 hover:brightness-110 cursor-pointer font-['Orbitron',monospace] shrink-0"
          >
            Join NODEXAI Today
          </button>
        </div>

      </div>
    </section>
  );
};

export default PackageSection;
