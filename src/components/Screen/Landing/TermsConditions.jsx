import React from "react";
import { motion } from "framer-motion";
import { FiDollarSign, FiPercent, FiClock, FiShield, FiCheckCircle, FiAlertCircle } from "react-icons/fi";

const OPERATING_RULES = [
  {
    number: "01",
    title: "Minimum Deposit",
    value: "$10",
    label: "Low Entry Barrier",
    description: "Start participating with as little as $10 USDT (BEP-20) on BNB Smart Chain through any compatible Web3 wallet.",
    color: "#00D2FF",
    icon: <FiDollarSign className="w-6 h-6" />,
  },
  {
    number: "02",
    title: "Minimum Withdrawal",
    value: "$1",
    label: "Maximum Accessibility",
    description: "The minimum allowable withdrawal is only $1 USDT, making your earned daily ROI and affiliate commissions instantly accessible.",
    color: "#10b981",
    icon: <FiDollarSign className="w-6 h-6" />,
  },
  {
    number: "03",
    title: "Withdrawal Fee",
    value: "5%",
    label: "Flat Platform Fee",
    description: "A flat 5% platform withdrawal fee is automatically applied to cover blockchain operational costs and liquidity maintenance.",
    color: "#D6A83A",
    icon: <FiPercent className="w-6 h-6" />,
  },
  {
    number: "04",
    title: "Maximum ROI Capping",
    value: "220%",
    label: "Sustainable Cap",
    description: "All package earnings are capped at a maximum of 220% ROI to protect ecosystem longevity and mathematical stability.",
    color: "#ec4899",
    icon: <FiShield className="w-6 h-6" />,
  },
];

const TermsConditions = () => {
  return (
    <section id="terms" className="relative overflow-hidden bg-[#020817] py-20 px-4 sm:px-6 lg:px-8 text-white">
      {/* Background Ambience */}
      <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/3 w-96 h-96 bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/40 border border-amber-400/25 mb-4">
            <FiShield className="text-amber-400 text-sm" />
            <span className="text-xs font-mono font-bold tracking-[0.2em] text-amber-300 uppercase">
              DEPOSIT & WITHDRAWAL • OPERATING RULES
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-['Orbitron',sans-serif] tracking-tight">
            Deposit & Withdrawal{" "}
            <span className="bg-gradient-to-r from-amber-400 via-yellow-200 to-cyan-300 bg-clip-text text-transparent">
              Guidelines
            </span>
          </h2>

          <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed">
            Simple • Clear • Accessible. Our ecosystem operates with full transparency so every participant understands their exact financial terms.
          </p>
        </div>

        {/* 4 Operating Rules Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {OPERATING_RULES.map((rule, idx) => (
            <motion.div
              key={rule.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: idx * 0.08 }}
              className="p-7 rounded-3xl bg-gradient-to-b from-[#071630]/90 to-[#030d1f]/95 border border-slate-800 hover:border-amber-400/50 backdrop-blur-xl shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center border transition-transform group-hover:scale-110"
                    style={{
                      backgroundColor: `${rule.color}15`,
                      borderColor: `${rule.color}40`,
                      color: rule.color,
                      boxShadow: `0 0 15px ${rule.color}20`,
                    }}
                  >
                    {rule.icon}
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-400">
                    RULE {rule.number}
                  </span>
                </div>

                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
                  {rule.label}
                </div>

                <h3 className="text-lg font-bold font-['Orbitron',sans-serif] text-white mb-2">
                  {rule.title}
                </h3>

                <div
                  className="text-3xl font-black font-['Orbitron',sans-serif] my-2"
                  style={{ color: rule.color }}
                >
                  {rule.value}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mt-3">
                  {rule.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>Network</span>
                <span className="text-white font-bold">BNB Smart Chain</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Detailed Principal Release Breakdown Box */}
        <div className="p-7 sm:p-9 rounded-3xl bg-gradient-to-b from-[#081836] to-[#040e22] border border-amber-500/30 shadow-[0_0_40px_rgba(214,168,58,0.15)]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-7 pb-5 border-b border-slate-800">
            <div>
              <span className="text-xs font-mono text-amber-300 uppercase tracking-widest font-bold block">
                PRINCIPAL CAPITAL TRANSPARENCY
              </span>
              <h3 className="text-xl sm:text-2xl font-bold font-['Orbitron',sans-serif] text-white">
                Principal Withdrawal Terms
              </h3>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-400/30 text-cyan-300 text-xs font-mono">
              <FiCheckCircle className="text-emerald-400" />
              <span>Available Anytime</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-[#030a18] border border-rose-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono uppercase text-rose-300 font-bold">Before 30 Days</span>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono font-bold text-xs">
                  25% DEDUCTION
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                If the principal is withdrawn before completion of 30 days: A 25% deduction will be applied to the principal amount.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#030a18] border border-emerald-500/40">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono uppercase text-emerald-300 font-bold">After 30 Days</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold text-xs">
                  NO 25% DEDUCTION (0%)
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                After completing 30 days, principal may be withdrawn without the 25% early-withdrawal deduction.
              </p>
            </div>
          </div>

          {/* Footer Logo & Notice */}
          <div className="mt-7 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src="/NodexAI.jpeg" alt="NODEXAI" className="h-8 w-auto object-contain rounded" />
              <span className="text-xs font-mono text-slate-400">Always verify wallet and transaction details before confirming on-chain.</span>
            </div>
            <span className="text-xs font-mono text-amber-300 font-bold">
              Applicable blockchain gas fees are separate from platform fees.
            </span>
          </div>
        </div>

      </div>
    </section>
  );
};

export default TermsConditions;
