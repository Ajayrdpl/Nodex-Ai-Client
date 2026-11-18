import React from "react";
import { motion } from "framer-motion";
import { FiDollarSign, FiZap, FiTrendingUp, FiShield, FiCheck, FiArrowRight } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { LandingRouters } from "../../../constants/routes";

const PACKAGES = [
  {
    code: "P1",
    name: "NOVA",
    range: "$10 – $200",
    min: 10,
    max: 200,
    dailyRoi: "4.5%",
    monthlyRoi: "135%",
    badge: "STARTER",
    color: "#00D2FF",
    features: [
      "Daily ROI: 4.5% credited 24/7",
      "30-Day Estimated Return: 135%",
      "Overall Maximum ROI Cap: 220%",
      "Eligible for 10-Level Community Income",
      "Auto-Compounding Available (+0.5%)",
    ],
  },
  {
    code: "P2",
    name: "VANTAGE",
    range: "$250 – $500",
    min: 250,
    max: 500,
    dailyRoi: "5.0%",
    monthlyRoi: "150%",
    badge: "POPULAR",
    color: "#38bdf8",
    features: [
      "Daily ROI: 5.0% credited 24/7",
      "30-Day Estimated Return: 150%",
      "Overall Maximum ROI Cap: 220%",
      "Eligible for 10-Level Community Income",
      "Auto-Compounding Available (+0.5%)",
    ],
  },
  {
    code: "P3",
    name: "NEXUS",
    range: "$550 – $2,000",
    min: 550,
    max: 2000,
    dailyRoi: "5.5%",
    monthlyRoi: "165%",
    badge: "GROWTH",
    color: "#60a5fa",
    features: [
      "Daily ROI: 5.5% credited 24/7",
      "30-Day Estimated Return: 165%",
      "Overall Maximum ROI Cap: 220%",
      "All 10 Levels Automatically Unlocked ($500+)",
      "Auto-Compounding Available (+0.5%)",
    ],
  },
  {
    code: "P4",
    name: "PRIME",
    range: "$2,500 – $5,000",
    min: 2500,
    max: 5000,
    dailyRoi: "6.0%",
    monthlyRoi: "180%",
    badge: "ADVANCED",
    color: "#D6A83A",
    features: [
      "Daily ROI: 6.0% credited 24/7",
      "30-Day Estimated Return: 180%",
      "Overall Maximum ROI Cap: 220%",
      "All 10 Levels Automatically Unlocked",
      "7-Day Booster Bonus Accelerator",
    ],
  },
  {
    code: "P5",
    name: "TITAN",
    range: "$5,500 – $10,000",
    min: 5500,
    max: 10000,
    dailyRoi: "6.5%",
    monthlyRoi: "195%",
    badge: "HIGH YIELD",
    color: "#f59e0b",
    features: [
      "Daily ROI: 6.5% credited 24/7",
      "30-Day Estimated Return: 195%",
      "Overall Maximum ROI Cap: 220%",
      "All 10 Levels Automatically Unlocked",
      "Priority Liquidity & Direct Booster",
    ],
  },
  {
    code: "P6",
    name: "INFINITY",
    range: "$10,500 – $25,000",
    min: 10500,
    max: 25000,
    dailyRoi: "7.5%",
    monthlyRoi: "220% Max",
    badge: "MAXIMUM",
    color: "#a855f7",
    isFeatured: true,
    features: [
      "Daily ROI: 7.5% Maximum Daily Rate",
      "Maximum ROI Cap: 220%",
      "Instant 10 Levels Full Tree Unlock",
      "VIP Institutional Status & Support",
      "Highest Booster Multiplier Tier",
    ],
  },
];

const PackageSection = () => {
  const navigate = useNavigate();

  return (
    <section id="packages" className="relative overflow-hidden bg-[#020817] py-20 px-4 sm:px-6 lg:px-8 text-white">
      {/* Background Lights */}
      <div className="absolute top-10 left-1/3 w-96 h-96 bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Background Grid */}
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
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/40 border border-amber-400/25 mb-4">
            <FiZap className="text-amber-400 text-sm" />
            <span className="text-xs font-mono font-bold tracking-[0.2em] text-amber-300 uppercase">
              GLOBAL PACKAGE PLAN • CHOOSE YOUR PARTICIPATION LEVEL
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-['Orbitron',sans-serif] tracking-tight">
            Six Structured{" "}
            <span className="bg-gradient-to-r from-amber-400 via-yellow-200 to-cyan-300 bg-clip-text text-transparent">
              Package Categories
            </span>
          </h2>

          <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed">
            Veltrion Capital offers six flexible package tiers starting from just $10 up to $25,000 with daily returns up to 7.5% and a disciplined 220% maximum ROI capping.
          </p>
        </div>

        {/* 6 Package Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {PACKAGES.map((pkg, idx) => (
            <motion.div
              key={pkg.code}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className={`relative p-7 rounded-3xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 flex flex-col justify-between overflow-hidden shadow-2xl ${
                pkg.isFeatured
                  ? "bg-gradient-to-b from-[#131138] via-[#091530] to-[#030919] border-2 border-purple-500/60 shadow-[0_0_35px_rgba(168,85,247,0.25)]"
                  : "bg-gradient-to-b from-[#071630]/90 to-[#030c1d]/95 border border-slate-800 hover:border-amber-400/50"
              }`}
            >
              {/* Top Accent Line */}
              <div
                className="absolute top-0 inset-x-0 h-1.5"
                style={{
                  background: `linear-gradient(90deg, transparent, ${pkg.color}, transparent)`,
                }}
              />

              <div>
                {/* Header Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span
                    className="px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-widest uppercase border"
                    style={{
                      backgroundColor: `${pkg.color}15`,
                      borderColor: `${pkg.color}40`,
                      color: pkg.color,
                    }}
                  >
                    {pkg.code} • {pkg.badge}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-400">
                    Cap: 220%
                  </span>
                </div>

                <h3 className="text-2xl font-black font-['Orbitron',sans-serif] text-white tracking-wide">
                  {pkg.name}
                </h3>

                <div className="my-4 p-4 rounded-2xl bg-[#040e21]/70 border border-slate-800/80">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    Investment Range
                  </div>
                  <div className="text-2xl sm:text-3xl font-black font-['Orbitron',sans-serif] text-amber-300 mt-0.5">
                    {pkg.range}
                  </div>
                </div>

                {/* ROI Highlight Metrics */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-400/20 text-center">
                    <div className="text-[10px] text-slate-400 font-mono uppercase">Daily ROI</div>
                    <div className="text-lg font-black font-['Orbitron',sans-serif] text-cyan-300">
                      {pkg.dailyRoi}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-400/20 text-center">
                    <div className="text-[10px] text-slate-400 font-mono uppercase">30 Days ROI</div>
                    <div className="text-lg font-black font-['Orbitron',sans-serif] text-amber-300">
                      {pkg.monthlyRoi}
                    </div>
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-2.5 pt-2 border-t border-slate-800">
                  {pkg.features.map((feat, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                      <FiCheck className="text-emerald-400 shrink-0 text-sm" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-7 pt-4 border-t border-slate-800/80">
                <button
                  onClick={() => navigate(LandingRouters.USER_REGISTER)}
                  className="w-full py-3 rounded-xl text-xs font-bold font-['Orbitron',sans-serif] tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer border"
                  style={{
                    backgroundColor: `${pkg.color}20`,
                    borderColor: `${pkg.color}60`,
                    color: pkg.color,
                  }}
                >
                  <span>Select {pkg.name}</span>
                  <FiArrowRight />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Global Package Conditions Callout Box */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#051833]/90 via-[#0a2347]/90 to-[#051833]/90 border border-amber-500/30 shadow-[0_15px_40px_rgba(0,0,0,0.6)] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs font-mono tracking-[0.2em] uppercase text-amber-400 font-bold">
              MAXIMUM RETURN & UNLOCK RULE
            </span>
            <h4 className="text-xl sm:text-2xl font-bold font-['Orbitron',sans-serif] text-white">
              Maximum ROI Cap Up To 220% Across All Tiers
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Applicable ROI continues according to the selected package and remains subject to the overall maximum ROI rules of the ecosystem. <strong className="text-amber-300">Join with $500 or above to automatically unlock all 10 affiliate levels.</strong>
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => navigate(LandingRouters.USER_REGISTER)}
              className="px-6 py-3.5 rounded-xl text-xs font-bold font-['Orbitron',sans-serif] uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-300 shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:scale-105 transition-all cursor-pointer"
            >
              Get Started Now
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};

export default PackageSection;
