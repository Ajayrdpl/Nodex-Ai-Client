import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiLayers, FiCode, FiAward, FiArrowRight, FiCheck } from "react-icons/fi";
import { RiExchangeDollarLine, RiShieldCheckLine, RiCpuLine, RiCommunityLine } from "react-icons/ri";

const ecosystemPillars = [
  {
    id: "smart-contract",
    title: "Smart Contract Technology",
    badge: "Automated & Verifiable",
    icon: <RiCpuLine className="w-6 h-6" />,
    color: "#00D2FF",
    tagline: "Blockchain-based processes designed for transparent and verifiable participation",
    description:
      "All package interactions, daily ROI distributions, level commissions, and compounding bonuses are governed by immutable smart contract logic on BNB Smart Chain, ensuring trustless execution with zero manual manipulation.",
    features: [
      "On-chain verifiable execution on BNB Smart Chain",
      "Automated daily ROI calculation & accounting",
      "Instant wallet-to-contract direct interaction",
      "Immutable ecosystem rules and capping enforcement",
    ],
  },
  {
    id: "flexible-packages",
    title: "Flexible Participation",
    badge: "Starting From $10",
    icon: <RiExchangeDollarLine className="w-6 h-6" />,
    color: "#D6A83A",
    tagline: "Multiple package options tailored for every participation level",
    description:
      "Choose from six structured package tiers ranging from $10 to $25,000, offering 4.5% to 7.5% daily yields up to a strict 220% maximum ROI limit.",
    features: [
      "Six package tiers: Nova, Vantage, Nexus, Prime, Titan, Infinity",
      "Daily returns ranging from 4.5% up to 7.5%",
      "Maximum ROI cap up to 220% across all tiers",
      "Low barrier entry starting from only $10 USDT",
    ],
  },
  {
    id: "community-rewards",
    title: "Community Rewards Network",
    badge: "10-Level Matrix (24%)",
    icon: <RiCommunityLine className="w-6 h-6" />,
    color: "#00D2FF",
    tagline: "Comprehensive multi-tier incentives rewarding community development",
    description:
      "Earn across 10 structured levels distributing a generous 24% total team volume, plus 24-hour fast-track Direct Booster (12%) and 7-day cyclical Team Business Booster bonuses up to $5,000.",
    features: [
      "10-Level generation income distributing 24% total",
      "Direct Booster: 12% on direct qualification in 24 hours",
      "Automatic unlock of all 10 levels for $500+ activations",
      "7-Day Team Business Booster with bonuses up to $5,000",
    ],
  },
  {
    id: "smart-compounding",
    title: "Smart Auto-Compounding",
    badge: "+0.5% Extra Bonus",
    icon: <FiAward className="w-6 h-6" />,
    color: "#D6A83A",
    tagline: "Compound your eligible balance anytime with an additional 0.5% bonus",
    description:
      "Re-invest your active earnings directly back into your balance anytime. Veltrion Capital adds an instant 0.5% Auto Compounding Bonus on every compounded transaction to accelerate your passive earnings.",
    features: [
      "Compounding available 24/7 without lock-in delays",
      "Instant +0.5% bonus added to the compounded amount",
      "Compound amount immediately becomes active balance",
      "Continuous daily ROI earnings on new active balance",
    ],
  },
  {
    id: "global-access",
    title: "Global Web3 Access",
    badge: "USDT (BEP-20)",
    icon: <RiShieldCheckLine className="w-6 h-6" />,
    color: "#10b981",
    tagline: "Seamless participation using USDT (BEP-20) on BNB Smart Chain",
    description:
      "Connect through any standard Web3 wallet (MetaMask, Trust Wallet, etc.) on BNB Smart Chain with negligible gas fees, rapid confirmations, and zero custodial friction.",
    features: [
      "USDT (BEP-20) standard on BNB Smart Chain",
      "Low-cost gas fees powered by Binance Smart Chain",
      "Instant Web3 wallet connection and account creation",
      "Direct peer-to-contract deposit and withdrawal rails",
    ],
  },
];

const platformMetrics = [
  { label: "Daily ROI Yield", value: "4.5% - 7.5%", note: "6 Tier Packages" },
  { label: "Maximum ROI Cap", value: "220%", note: "Sustainable Capping" },
  { label: "Level Distribution", value: "24% (10 Levels)", note: "Generous Depth" },
  { label: "Auto Compounding", value: "+0.5% Bonus", note: "Available 24/7" },
];

const VisionEcosystem = () => {
  const [activeTab, setActiveTab] = useState("smart-contract");
  const selectedPillar = ecosystemPillars.find((p) => p.id === activeTab) || ecosystemPillars[0];

  return (
    <section id="ecosystem" className="relative overflow-hidden bg-[#020817] py-20 px-4 sm:px-6 lg:px-8 text-white">
      <div id="vision" className="absolute -top-20" />
      {/* Background Ambience */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/40 border border-amber-400/25 mb-4">
            <FiLayers className="text-amber-400 text-sm" />
            <span className="text-xs font-mono font-bold tracking-[0.2em] text-amber-300 uppercase">
              ONE ECOSYSTEM • MULTIPLE POSSIBILITIES
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-['Orbitron',sans-serif] tracking-tight">
            The Veltrion Capital{" "}
            <span className="bg-gradient-to-r from-amber-400 via-yellow-200 to-cyan-300 bg-clip-text text-transparent">
              DeFi Architecture
            </span>
          </h2>

          <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed">
            Our vision is to develop a globally accessible DeFi ecosystem where blockchain technology, smart contracts, and community participation work harmoniously together.
          </p>
        </div>

        {/* 4 Fast Metrics Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
          {platformMetrics.map((m, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-gradient-to-b from-[#071630]/80 to-[#030d1f]/95 border border-slate-800 backdrop-blur-md shadow-lg text-center"
            >
              <div className="text-xl sm:text-2xl font-black font-['Orbitron',sans-serif] bg-gradient-to-r from-amber-300 to-cyan-300 bg-clip-text text-transparent">
                {m.value}
              </div>
              <div className="text-xs font-bold text-white mt-1">{m.label}</div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">{m.note}</div>
            </div>
          ))}
        </div>

        {/* Interactive Pillar Selector Tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Tab Navigation List */}
          <div className="lg:col-span-5 space-y-3">
            {ecosystemPillars.map((p) => {
              const isActive = p.id === activeTab;
              return (
                <button
                  key={p.id}
                  onClick={() => setActiveTab(p.id)}
                  className={`w-full p-4 rounded-2xl border text-left transition-all duration-300 flex items-center justify-between group cursor-pointer ${
                    isActive
                      ? "bg-gradient-to-r from-[#092244] to-[#041226] border-amber-400/60 shadow-[0_0_20px_rgba(214,168,58,0.25)]"
                      : "bg-[#061429]/60 border-slate-800 hover:border-slate-700 hover:bg-[#071730]/60"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                        isActive
                          ? "bg-amber-400/20 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(214,168,58,0.4)]"
                          : "bg-slate-900 border-slate-800 text-slate-400 group-hover:text-cyan-300"
                      }`}
                    >
                      {p.icon}
                    </div>
                    <div>
                      <div className="text-xs font-mono uppercase tracking-wider text-slate-400 text-[10px]">
                        {p.badge}
                      </div>
                      <div className="text-sm font-bold font-['Orbitron',sans-serif] text-white">
                        {p.title}
                      </div>
                    </div>
                  </div>
                  <FiArrowRight
                    className={`text-sm transition-transform ${
                      isActive ? "text-amber-400 translate-x-1" : "text-slate-600 group-hover:text-slate-400"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Active Detail Showcase Box */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedPillar.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35 }}
                className="p-7 sm:p-9 rounded-3xl bg-gradient-to-b from-[#081b38] to-[#030d1f] border border-cyan-500/30 shadow-[0_0_40px_rgba(0,210,255,0.15)] relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                  <span className="text-xs font-mono uppercase tracking-widest text-amber-300 font-bold">
                    {selectedPillar.badge}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>Live On Mainnet</span>
                  </div>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold font-['Orbitron',sans-serif] text-white mb-2">
                  {selectedPillar.title}
                </h3>

                <p className="text-sm text-cyan-200/90 font-medium mb-4">
                  {selectedPillar.tagline}
                </p>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
                  {selectedPillar.description}
                </p>

                <div className="space-y-3 pt-4 border-t border-slate-800">
                  <div className="text-xs font-mono font-bold tracking-wider uppercase text-slate-400 mb-2">
                    Key Implementation Features:
                  </div>
                  {selectedPillar.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-200">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center shrink-0 text-emerald-400 text-xs">
                        <FiCheck />
                      </div>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                {/* Official Brand Logo embed */}
                <div className="mt-8 pt-5 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src="/image/veltrion-logo.jpg"
                      alt="Veltrion Capital"
                      className="h-9 w-auto object-contain rounded-lg border border-amber-400/40"
                    />
                    <span className="text-xs font-mono text-slate-400">BNB Smart Chain (BEP-20)</span>
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-amber-300/80 font-bold">
                    Max ROI: 220%
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>

      </div>
    </section>
  );
};

export default VisionEcosystem;
