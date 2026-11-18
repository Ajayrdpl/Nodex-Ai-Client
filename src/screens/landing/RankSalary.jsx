import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiRepeat, FiLock, FiUnlock, FiDollarSign, FiCheckCircle, FiShield, FiTrendingUp } from "react-icons/fi";

const RankSalary = () => {
  const [compoundInput, setCompoundInput] = useState(1000);
  const bonusAmount = (compoundInput * 0.005).toFixed(2);
  const totalCompounded = (parseFloat(compoundInput) + parseFloat(bonusAmount)).toFixed(2);

  return (
    <section id="compounding-principal" className="relative overflow-hidden bg-[#020817] py-20 px-4 sm:px-6 lg:px-8 text-white">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-amber-500/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/40 border border-amber-400/25 mb-4">
            <FiRepeat className="text-amber-400 text-sm" />
            <span className="text-xs font-mono font-bold tracking-[0.2em] text-amber-300 uppercase">
              SMART COMPOUNDING & CAPITAL FREEDOM
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-['Orbitron',sans-serif] tracking-tight">
            Auto Compounding &{" "}
            <span className="bg-gradient-to-r from-amber-400 via-yellow-200 to-cyan-300 bg-clip-text text-transparent">
              Principal Withdrawal
            </span>
          </h2>

          <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed">
            Compound your balance anytime with an additional +0.5% auto bonus, or enjoy flexible capital withdrawals with clear, transparent rules.
          </p>
        </div>

        {/* 2-Column Grid: Left = Compounding Engine, Right = Principal Withdrawal */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
          
          {/* ── LEFT: Auto Compounding Showcase ── */}
          <div className="lg:col-span-6 p-7 sm:p-8 rounded-3xl bg-gradient-to-b from-[#081836] to-[#040e22] border border-amber-500/30 shadow-[0_0_40px_rgba(214,168,58,0.15)]">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold text-lg">
                  <FiRepeat />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-amber-300 font-bold tracking-widest block">
                    ANYTIME COMPOUNDING
                  </span>
                  <h3 className="text-xl font-bold font-['Orbitron',sans-serif] text-white">
                    +0.5% Auto Compounding Bonus
                  </h3>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/40 text-emerald-400 text-xs font-mono font-bold">
                +0.5% FREE
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed">
              Participants can compound eligible amounts according to platform rules and instantly receive an additional 0.5% Auto Compounding Bonus credited into their Active Balance.
            </p>

            {/* Official PDF Examples Showcase */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-2xl bg-[#030d1f] border border-slate-800">
                <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                  PDF Example 01
                </span>
                <div className="text-xs text-slate-300">Compound: <strong className="text-white">$100</strong></div>
                <div className="text-xs text-amber-300">Bonus (+0.5%): <strong>+$0.50</strong></div>
                <div className="mt-2 pt-2 border-t border-slate-800 text-sm font-bold font-mono text-emerald-400">
                  Total: $100.50
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#030d1f] border border-slate-800">
                <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                  PDF Example 02
                </span>
                <div className="text-xs text-slate-300">Compound: <strong className="text-white">$1,000</strong></div>
                <div className="text-xs text-amber-300">Bonus (+0.5%): <strong>+$5.00</strong></div>
                <div className="mt-2 pt-2 border-t border-slate-800 text-sm font-bold font-mono text-emerald-400">
                  Total: $1,005.00
                </div>
              </div>
            </div>

            {/* Live Interactive Compound Calculator */}
            <div className="p-5 rounded-2xl bg-[#020713]/80 border border-slate-800">
              <div className="flex justify-between text-xs font-mono mb-2">
                <span className="text-slate-400 uppercase">Test Re-invest Amount</span>
                <span className="text-amber-300 font-bold">${compoundInput.toLocaleString()} USDT</span>
              </div>
              <input
                type="range"
                min="50"
                max="25000"
                step="50"
                value={compoundInput}
                onChange={(e) => setCompoundInput(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400 mb-3"
              />
              <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                <span className="text-slate-400">+0.5% Auto Bonus: <strong className="text-amber-300">+${bonusAmount}</strong></span>
                <span className="text-emerald-400 font-bold font-mono">Active Balance: ${totalCompounded}</span>
              </div>
            </div>

            <div className="mt-5 space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <FiCheckCircle className="text-emerald-400 shrink-0" />
                <span>Compounded amount becomes part of Active Balance immediately</span>
              </div>
              <div className="flex items-center gap-2">
                <FiCheckCircle className="text-emerald-400 shrink-0" />
                <span>Applicable daily ROI continues according to the package (Up to 220% Cap)</span>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Principal Withdrawal Rules ── */}
          <div className="lg:col-span-6 p-7 sm:p-8 rounded-3xl bg-gradient-to-b from-[#081836] to-[#040e22] border border-cyan-500/30 shadow-[0_0_40px_rgba(0,210,255,0.15)]">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-400/20 text-cyan-300 flex items-center justify-center font-bold text-lg">
                  <FiShield />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-cyan-300 font-bold tracking-widest block">
                    CAPITAL TRANSPARENCY
                  </span>
                  <h3 className="text-xl font-bold font-['Orbitron',sans-serif] text-white">
                    Principal Withdrawal Rule
                  </h3>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 text-xs font-mono font-bold">
                FLEXIBILITY
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed">
              Principal withdrawal is available at any time, subject to applicable withdrawal conditions with crystal clear parameters:
            </p>

            {/* Before 30 Days vs After 30 Days Cards */}
            <div className="space-y-4 mb-6">
              
              {/* Option A: Before 30 Days */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-[#21111d] to-[#0f0914] border border-rose-500/30">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-rose-300 font-mono text-xs font-bold uppercase">
                    <FiLock />
                    <span>Before 30 Days</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono font-bold text-xs">
                    25% DEDUCTION
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  If the principal is withdrawn before completion of 30 days, a 25% early-exit deduction will be applied to the principal amount.
                </p>
              </div>

              {/* Option B: After 30 Days */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-[#0a2723] to-[#061816] border border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-emerald-300 font-mono text-xs font-bold uppercase">
                    <FiUnlock />
                    <span>After 30 Days</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold text-xs">
                    NO 25% DEDUCTION (0%)
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  After completing 30 days, principal may be withdrawn without any early-withdrawal deduction. Full capital autonomy!
                </p>
              </div>

            </div>

            {/* Quick View Summary Strip */}
            <div className="p-4 rounded-2xl bg-[#030919] border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <img src="/image/veltrion-logo.jpg" alt="Veltrion Capital" className="h-7 w-auto object-contain rounded" />
                <span className="text-slate-400 font-mono">Principal Autonomy</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Standard 5% Platform Fee Applies</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default RankSalary;
