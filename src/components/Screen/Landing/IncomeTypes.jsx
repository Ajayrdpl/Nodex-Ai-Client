import React from "react";
import { motion } from "framer-motion";
import { FiTrendingUp, FiZap, FiLayers, FiAward, FiRepeat, FiCheck } from "react-icons/fi";

const INCOME_STREAMS = [
  {
    key: "roi",
    num: "01",
    title: "Daily Package ROI",
    tag: "Passive Cashflow",
    highlight: "4.5% - 7.5%",
    highlightLabel: "Daily Credited 24/7",
    desc: "Earn consistent automated daily yields according to your active package tier, capped at 220% maximum total ROI.",
    color: "#00D2FF",
    icon: <FiTrendingUp className="w-6 h-6" />,
    points: [
      "Nova: 4.5% | Vantage: 5.0% | Nexus: 5.5%",
      "Prime: 6.0% | Titan: 6.5% | Infinity: 7.5%",
      "Overall Maximum ROI Cap up to 220%",
      "30-day estimated yields from 135% to 195%",
    ],
  },
  {
    key: "direct-booster",
    num: "02",
    title: "Direct Booster Income",
    tag: "24-Hour Fast Track",
    highlight: "12%",
    highlightLabel: "Direct Booster Rate",
    desc: "Members who complete the required direct business or referral criteria within 24 hours of activation receive an accelerated 12% reward.",
    color: "#D6A83A",
    icon: <FiZap className="w-6 h-6" />,
    points: [
      "12% Direct Booster Income rate",
      "Qualify within the first 24 hours of activation",
      "Instant reward credited directly to your wallet",
      "High acceleration for proactive team leaders",
    ],
  },
  {
    key: "level",
    num: "03",
    title: "10-Level Community Income",
    tag: "Total 24% Distribution",
    highlight: "10 Levels",
    highlightLabel: "Network Generation",
    desc: "Build community and expand your network depth across 10 structured levels distributing a generous 24% total team volume.",
    color: "#38bdf8",
    icon: <FiLayers className="w-6 h-6" />,
    points: [
      "Level 1: 8% | Level 2: 4% | Level 3: 3%",
      "Level 4: 2% | Level 5: 1.5% | Level 6: 1.5%",
      "Level 7 to Level 10: 1.0% each level",
      "All 10 levels auto-unlocked with $500+ package",
    ],
  },
  {
    key: "team-booster",
    num: "04",
    title: "7-Day Team Business Booster",
    tag: "Weekly Team Milestones",
    highlight: "Up to $5,000",
    highlightLabel: "Every 7-Day Cycle",
    desc: "Achieve team business milestones within a 7-day cycle to unlock lump-sum cash bonuses ranging from $20 up to $5,000.",
    color: "#f59e0b",
    icon: <FiAward className="w-6 h-6" />,
    points: [
      "$1K Team: $20 | $2.5K Team: $60 | $5K Team: $150",
      "$10K Team: $350 | $25K Team: $1,000",
      "$50K Team: $2,250 | $100K Team: $5,000",
      "Every 7 days a new booster cycle starts",
    ],
  },
  {
    key: "compounding",
    num: "05",
    title: "Auto-Compounding Bonus",
    tag: "Compound Anytime",
    highlight: "+0.5%",
    highlightLabel: "Extra Bonus Added",
    desc: "Reinvest your eligible balance anytime and receive an additional 0.5% bonus automatically added to your new active capital.",
    color: "#10b981",
    icon: <FiRepeat className="w-6 h-6" />,
    points: [
      "Compounding available anytime without waiting",
      "+0.5% bonus added automatically to principal",
      "Compounded amount becomes active balance",
      "Continues earning package daily ROI up to 220%",
    ],
  },
];

const IncomeTypes = () => {
  return (
    <section id="income" className="relative overflow-hidden bg-[#020817] py-20 px-4 sm:px-6 lg:px-8 text-white">
      {/* Background Lighting */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 210, 255, 0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 210, 255, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/40 border border-amber-400/25 mb-4">
            <FiZap className="text-amber-400 text-sm" />
            <span className="text-xs font-mono font-bold tracking-[0.2em] text-amber-300 uppercase">
              FIVE MULTI-TIER EARNING STREAMS
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-['Orbitron',sans-serif] tracking-tight">
            Multiple Avenues of{" "}
            <span className="bg-gradient-to-r from-amber-400 via-yellow-200 to-cyan-300 bg-clip-text text-transparent">
              Wealth Generation
            </span>
          </h2>

          <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed">
            Veltrion Capital is engineered with five interconnected revenue pillars designed for maximum transparency, sustainable profitability, and fair community rewards.
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
              className="p-7 rounded-3xl bg-gradient-to-b from-[#071630]/90 to-[#030d1f]/95 border border-slate-800 hover:border-amber-400/50 backdrop-blur-xl shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between group"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-bold tracking-widest text-slate-400">
                    STREAM {stream.num}
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
