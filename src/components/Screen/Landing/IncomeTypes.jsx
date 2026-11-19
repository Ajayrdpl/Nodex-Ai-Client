import React from "react";
import { motion } from "framer-motion";
import { FiTrendingUp, FiZap, FiLayers, FiAward, FiGlobe, FiCheck } from "react-icons/fi";

const INCOME_STREAMS = [
  {
    key: "direct",
    num: "01",
    title: "Direct Referral Income",
    tag: "Instant Payout",
    highlight: "5%",
    highlightLabel: "$1.25 Per Direct",
    desc: "Earn $1.25 instantly in your wallet for every direct member joining with the $25 package. No limits on sponsoring.",
    color: "#00D2FF",
    icon: <FiZap className="w-6 h-6" />,
    points: [
      "5% Direct Referral Commission ($1.25)",
      "Instant real-time wallet settlement",
      "Unlimited direct sponsoring allowed",
      "Qualifies you for 10-Level Income & Club Tiers",
    ],
  },
  {
    key: "level",
    num: "02",
    title: "10-Level Generation Income",
    tag: "20% Total Allocation",
    highlight: "20%",
    highlightLabel: "$5.00 Across 10 Levels",
    desc: "Earn multi-tier residual bonuses from your entire network across 10 generations. 5 Directs opens all 10 levels.",
    color: "#fbbf24",
    icon: <FiLayers className="w-6 h-6" />,
    points: [
      "Level 1: 5% ($1.25 - Direct Income)",
      "Level 2: 5% ($1.25) | Level 3: 3% ($0.75)",
      "Level 4 to 8: 2% ($0.50 each level)",
      "Level 9 to 10: 1% ($0.25 each level)",
    ],
  },
  {
    key: "binary",
    num: "03",
    title: "Binary Matching Income",
    tag: "1:1 Matching Bonus",
    highlight: "50%",
    highlightLabel: "$12.50 Per Matched Pair",
    desc: "Build Left and Right teams. Every 1:1 volume match of $25 packages pays a massive 50% matching commission.",
    color: "#10b981",
    icon: <FiTrendingUp className="w-6 h-6" />,
    points: [
      "1:1 Matching Bonus ($25 Left : $25 Right)",
      "Generous $12.50 payout per matched pair",
      "Unmatched stronger leg carries forward",
      "Daily capping for sustainable long-term returns",
    ],
  },
  {
    key: "club",
    num: "04",
    title: "Club Income & CTO Pool",
    tag: "Daily Turnover Share",
    highlight: "10%",
    highlightLabel: "Puma • Pajero • Panther",
    desc: "Unlock milestone cash rewards ($150 to $500) plus a permanent daily share of global company turnover (CTO).",
    color: "#a855f7",
    icon: <FiAward className="w-6 h-6" />,
    points: [
      "Puma Club: 5 Directs (7 Days) → $150 + 5% Daily CTO",
      "Pajero Club: 10 Directs (15 Days) → $300 + 3% Daily CTO",
      "Panther Club: 15 Directs (30 Days) → $500 + 2% Daily CTO",
      "Equally shared daily among all qualified achievers",
    ],
  },
  {
    key: "community",
    num: "05",
    title: "Community Support & Bonanza",
    tag: "Global Expansion",
    highlight: "10%",
    highlightLabel: "$2.50 Fund Pool",
    desc: "Reserved for international marketing, platform development, leader incentives, and special bonanza rewards.",
    color: "#f43f5e",
    icon: <FiGlobe className="w-6 h-6" />,
    points: [
      "$2.50 allocated from every $25 package",
      "Exciting seasonal & festival bonanza rewards",
      "Community leadership and promotional bonuses",
      "Decentralized ecosystem growth and adoption",
    ],
  },
];

const IncomeTypes = () => {
  return (
    <section id="income" className="relative overflow-hidden bg-[#020817] py-20 px-4 sm:px-6 lg:px-8 text-white">
      {/* Background Lighting */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/40 border border-cyan-400/25 mb-4">
            <FiZap className="text-cyan-400 text-sm" />
            <span className="text-xs font-mono font-bold tracking-[0.2em] text-cyan-300 uppercase">
              FIVE MULTI-TIER EARNING STREAMS
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-['Orbitron',sans-serif] tracking-tight">
            100% Distributed{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-sky-200 to-amber-300 bg-clip-text text-transparent">
              Income Ecosystem
            </span>
          </h2>

          <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed">
            Every $25 joining package in NODEXAI is 100% allocated across five high-yield revenue streams designed for instant payouts and passive long-term growth.
          </p>
        </div>

        {/* 5 Income Streams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {INCOME_STREAMS.map((stream, idx) => (
            <motion.div
              key={stream.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="p-7 rounded-3xl bg-gradient-to-b from-[#071630]/90 to-[#030d1f]/95 border border-slate-800 hover:border-cyan-400/50 backdrop-blur-xl shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between group"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-bold tracking-widest text-slate-400">
                    STREAM #{stream.num}
                  </span>
                  <span
                    className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase border"
                    style={{
                      backgroundColor: `${stream.color}15`,
                      borderColor: `${stream.color}40`,
                      color: stream.color,
                    }}
                  >
                    {stream.tag}
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0 transition-transform group-hover:scale-110"
                    style={{
                      backgroundColor: `${stream.color}15`,
                      borderColor: `${stream.color}40`,
                      color: stream.color,
                      boxShadow: `0 0 15px ${stream.color}20`,
                    }}
                  >
                    {stream.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold font-['Orbitron',sans-serif] text-white">
                      {stream.title}
                    </h3>
                  </div>
                </div>

                {/* Highlight Badge */}
                <div className="p-3.5 rounded-2xl bg-[#040e21]/70 border border-slate-800 mb-4 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-mono uppercase text-slate-400">
                      {stream.highlightLabel}
                    </div>
                    <div
                      className="text-2xl font-black font-['Orbitron',sans-serif]"
                      style={{ color: stream.color }}
                    >
                      {stream.highlight}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-5">
                  {stream.desc}
                </p>

                {/* Points */}
                <div className="space-y-2 pt-3 border-t border-slate-800">
                  {stream.points.map((pt, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                      <FiCheck className="text-emerald-400 shrink-0 text-sm" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default IncomeTypes;
