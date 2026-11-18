import React from "react";
import { motion } from "framer-motion";
import { FiCpu, FiUsers, FiDollarSign, FiLayers, FiZap, FiClock, FiRepeat, FiShield } from "react-icons/fi";
import { RiThumbUpLine } from "react-icons/ri";

const highlights = [
  {
    number: "01",
    title: "Smart Contract Based",
    desc: "Built around blockchain and smart contract technology for transparent and verifiable on-chain execution.",
    icon: <FiCpu className="w-6 h-6" />,
    color: "#00D2FF",
    tag: "BNB Smart Chain",
  },
  {
    number: "02",
    title: "Community Driven",
    desc: "An ecosystem focused on fair participation, multi-tier network rewards, and global community growth.",
    icon: <FiUsers className="w-6 h-6" />,
    color: "#D6A83A",
    tag: "Total 24% Levels",
  },
  {
    number: "03",
    title: "Flexible Packages",
    desc: "Multiple participation options starting from only $10 up to $25,000 to match any portfolio size.",
    icon: <FiDollarSign className="w-6 h-6" />,
    color: "#10b981",
    tag: "From $10",
  },
  {
    number: "04",
    title: "10-Level System",
    desc: "Community-based Level Income across 10 levels distributing 24% total volume, with auto-unlock for $500+.",
    icon: <FiLayers className="w-6 h-6" />,
    color: "#38bdf8",
    tag: "10 Generations",
  },
  {
    number: "05",
    title: "Direct Booster (12%)",
    desc: "An additional 12% incentive for completing applicable direct qualification within the initial 24 hours.",
    icon: <FiZap className="w-6 h-6" />,
    color: "#f59e0b",
    tag: "24h Fast Track",
  },
  {
    number: "06",
    title: "7-Day Business Booster",
    desc: "Team business-based bonus opportunities up to $5,000 every 7-day cyclical milestone.",
    icon: <FiClock className="w-6 h-6" />,
    color: "#ec4899",
    tag: "Up to $5,000",
  },
  {
    number: "07",
    title: "Auto Compounding",
    desc: "Compound eligible amounts anytime with an additional +0.5% bonus automatically added to your active balance.",
    icon: <FiRepeat className="w-6 h-6" />,
    color: "#00D2FF",
    tag: "+0.5% Free",
  },
  {
    number: "08",
    title: "Maximum 220% Cap",
    desc: "Disciplined mathematical risk controls ensuring total returns are capped at 220% for long-term sustainability.",
    icon: <FiShield className="w-6 h-6" />,
    color: "#D6A83A",
    tag: "Sustainable Cap",
  },
];

const ChooseUs = () => {
  return (
    <section id="why-choose-us" className="relative overflow-hidden bg-[#020817] py-20 px-4 sm:px-6 lg:px-8 text-white">
      {/* Glows */}
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/40 border border-amber-400/25 mb-4">
            <RiThumbUpLine className="text-amber-400 text-sm" />
            <span className="text-xs font-mono font-bold tracking-[0.2em] text-amber-300 uppercase">
              ECOSYSTEM HIGHLIGHTS
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-['Orbitron',sans-serif] tracking-tight">
            Why Choose{" "}
            <span className="bg-gradient-to-r from-amber-400 via-yellow-200 to-cyan-300 bg-clip-text text-transparent">
              NODEXAI?
            </span>
          </h2>

          <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed">
            Discover a comprehensive decentralized finance ecosystem designed for transparency, accessibility, innovation, and community-led development.
          </p>
        </div>

        {/* 8 Feature Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {highlights.map((item, idx) => (
            <motion.div
              key={item.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: idx * 0.05 }}
              className="p-6 rounded-3xl bg-gradient-to-b from-[#071733]/80 to-[#030d1f]/95 border border-slate-800 hover:border-amber-400/50 backdrop-blur-xl shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center border transition-transform group-hover:scale-110"
                    style={{
                      backgroundColor: `${item.color}15`,
                      borderColor: `${item.color}40`,
                      color: item.color,
                      boxShadow: `0 0 15px ${item.color}20`,
                    }}
                  >
                    {item.icon}
                  </div>
                  <span
                    className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-wider uppercase border"
                    style={{
                      backgroundColor: `${item.color}15`,
                      borderColor: `${item.color}40`,
                      color: item.color,
                    }}
                  >
                    {item.tag}
                  </span>
                </div>

                <div className="text-[10px] font-mono text-slate-400 mb-1">
                  HIGHLIGHT {item.number}
                </div>

                <h3 className="text-base font-bold font-['Orbitron',sans-serif] text-white mb-2">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Verified</span>
                <span className="text-emerald-400 font-bold">100% On-Chain</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Brand Banner Box */}
        <div className="mt-12 p-6 rounded-3xl bg-[#030919] border border-amber-400/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img src="/NodexAI.jpeg" alt="NODEXAI" className="h-10 w-auto object-contain rounded-xl shadow-md" />
            <div>
              <div className="text-sm font-bold font-['Orbitron',sans-serif] text-white">NODEXAI Ecosystem</div>
              <div className="text-xs text-slate-400 font-mono">Invest • Grow • Earn — Powering Your Financial Freedom with USDT</div>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-amber-300 bg-amber-400/10 px-4 py-2 rounded-xl border border-amber-400/25">
            USDT (BEP-20) on BNB Smart Chain
          </span>
        </div>

      </div>
    </section>
  );
};

export default ChooseUs;
