import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiZap, FiClock, FiCheckCircle, FiDollarSign, FiUsers } from "react-icons/fi";

const DirectReferralIncome = () => {
  const [calcAmount, setCalcAmount] = useState(1000);
  const [referralCount, setReferralCount] = useState(3);

  const standardEarning = (calcAmount * 0.08 * referralCount).toFixed(0);
  const boosterEarning = (calcAmount * 0.12 * referralCount).toFixed(0);

  return (
    <section id="direct-referral" className="relative overflow-hidden bg-[#020817] py-20 px-4 sm:px-6 lg:px-8 text-white">
      {/* Background Glow */}
      <div className="absolute top-1/2 -left-40 -translate-y-1/2 w-80 h-80 bg-amber-500/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-1/2 -right-40 -translate-y-1/2 w-80 h-80 bg-cyan-500/10 rounded-full blur-[130px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/40 border border-amber-400/25 mb-4">
            <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]" />
            <span className="text-xs font-mono font-bold tracking-[0.2em] text-amber-300 uppercase">
              DIRECT BOOSTER INCOME • 24-HOUR QUALIFICATION
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-['Orbitron',sans-serif] tracking-tight">
            Direct Booster{" "}
            <span className="bg-gradient-to-r from-amber-400 via-yellow-200 to-cyan-300 bg-clip-text text-transparent">
              Income (12%)
            </span>
          </h2>

          <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed">
            Act Fast • Unlock More! Members who complete the required Direct Business / Direct Referral criteria within 24 hours of activation will be eligible to receive 12% Direct Booster Income.
          </p>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left: 24-Hour Rule & Steps */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-6 rounded-3xl bg-gradient-to-r from-[#071630]/90 to-[#030d1f]/95 border border-amber-500/30 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-400/40 text-amber-300 flex items-center justify-center font-bold font-mono text-xl shrink-0">
                  <FiClock />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-amber-300 font-bold uppercase">24-Hour Golden Window</span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-400/20 text-amber-200">ACCELERATED</span>
                  </div>
                  <h4 className="text-base font-bold font-['Orbitron',sans-serif] text-white">
                    12% Direct Booster Within 24 Hours
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                    Designed to reward members who actively complete their direct qualification during their initial 24-hour activation window. Receive an elevated 12% commission rate directly into your wallet.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-gradient-to-r from-[#071630]/90 to-[#030d1f]/95 border border-cyan-500/20 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-400/30 text-cyan-400 flex items-center justify-center font-bold font-mono text-xl shrink-0">
                  <FiUsers />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-cyan-300 font-bold uppercase">Standard Community Depth</span>
                  </div>
                  <h4 className="text-base font-bold font-['Orbitron',sans-serif] text-white">
                    8% Level 1 Direct Income (Ongoing)
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                    Standard Level 1 direct participation earns 8% continuously across unlimited direct sponsors, feeding into your 10-level multi-tier community tree.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-gradient-to-r from-[#071630]/90 to-[#030d1f]/95 border border-emerald-500/20 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-400 flex items-center justify-center font-bold font-mono text-xl shrink-0">
                  <FiZap />
                </div>
                <div>
                  <h4 className="text-base font-bold font-['Orbitron',sans-serif] text-white">
                    Instant Credit & Liquidity
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                    Commissions are credited automatically via smart contract execution with zero hold times, accessible for immediate USDT withdrawal or auto-compounding (+0.5% bonus).
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Interactive Dual Booster Calculator */}
          <div className="lg:col-span-6">
            <div className="p-7 sm:p-8 rounded-3xl bg-gradient-to-b from-[#081836] to-[#040e22] border border-amber-500/30 shadow-[0_0_40px_rgba(214,168,58,0.2)] relative overflow-hidden">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
                <h4 className="text-lg font-bold font-['Orbitron',sans-serif] text-white flex items-center gap-2">
                  <FiDollarSign className="text-amber-400" />
                  Direct Earnings Calculator
                </h4>
                <span className="text-xs font-mono text-amber-300 uppercase font-bold">
                  24h Booster vs Standard
                </span>
              </div>

              {/* Slider 1: Package Amount */}
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400 uppercase">Average Direct Package</span>
                  <span className="text-amber-300 font-bold text-sm">${calcAmount.toLocaleString()} USDT</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="10000"
                  step="50"
                  value={calcAmount}
                  onChange={(e) => setCalcAmount(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>$50</span>
                  <span>$2,500</span>
                  <span>$5,000</span>
                  <span>$10,000</span>
                </div>
              </div>

              {/* Slider 2: Number of Directs */}
              <div className="space-y-2 mb-7">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400 uppercase">Direct Referrals</span>
                  <span className="text-cyan-300 font-bold text-sm">{referralCount} Members</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="1"
                  value={referralCount}
                  onChange={(e) => setReferralCount(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>1 Member</span>
                  <span>5 Members</span>
                  <span>10 Members</span>
                  <span>20 Members</span>
                </div>
              </div>

              {/* Comparison Output Boxes */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                <div className="p-4 rounded-2xl bg-[#030919] border border-cyan-400/20 text-center">
                  <span className="text-[10px] text-slate-400 font-mono uppercase block">
                    Standard Level 1 (8%)
                  </span>
                  <div className="text-2xl sm:text-3xl font-black font-['Orbitron',sans-serif] text-cyan-300 my-1">
                    ${standardEarning}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">Standard Rate</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#091b33] border border-amber-400/50 text-center shadow-[0_0_20px_rgba(214,168,58,0.25)]">
                  <span className="text-[10px] text-amber-300 font-mono uppercase font-bold block">
                    24h Booster (12%)
                  </span>
                  <div className="text-2xl sm:text-3xl font-black font-['Orbitron',sans-serif] text-amber-300 my-1">
                    ${boosterEarning}
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono font-bold">+50% Higher Yield</span>
                </div>
              </div>

              {/* Footer Note with Logo */}
              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img src="/NodexAI.jpeg" alt="NODEXAI" className="h-7 w-auto object-contain rounded" />
                  <span className="text-[11px] text-slate-400 font-mono">Instant USDT Payouts</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">BNB Smart Chain (BEP-20)</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default DirectReferralIncome;
