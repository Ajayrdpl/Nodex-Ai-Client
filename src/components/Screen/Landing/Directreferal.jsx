import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiZap, FiCheckCircle, FiDollarSign, FiUsers, FiAward } from "react-icons/fi";

const DirectReferralIncome = () => {
  const [directs, setDirects] = useState(5);
  const packageCost = 25;
  const directPercent = 10;
  const perDirectEarn = (packageCost * directPercent) / 100; // $2.50
  const totalEarned = (directs * perDirectEarn).toFixed(2);

  return (
    <section id="direct-referral" className="relative overflow-hidden bg-[#020817] py-20 px-4 sm:px-6 lg:px-8 text-white">
      {/* Background Glow */}
      <div className="absolute top-1/2 -left-40 -translate-y-1/2 w-80 h-80 bg-cyan-500/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-1/2 -right-40 -translate-y-1/2 w-80 h-80 bg-amber-500/10 rounded-full blur-[130px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/40 border border-cyan-400/25 mb-4">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00D2FF]" />
            <span className="text-xs font-mono font-bold tracking-[0.2em] text-cyan-300 uppercase">
              STREAM #01 • DIRECT REFERRAL INCOME
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-['Orbitron',sans-serif] tracking-tight">
            Direct Referral{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-sky-200 to-amber-300 bg-clip-text text-transparent">
              Income (10%)
            </span>
          </h2>

          <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed">
            Earn $2.50 instantly for every new direct member who activates the $25 package using your personal referral link. Sponsoring is unlimited!
          </p>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left: Key Benefits */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-6 rounded-3xl bg-gradient-to-r from-[#071630]/90 to-[#030d1f]/95 border border-cyan-500/30 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-400/40 text-cyan-300 flex items-center justify-center font-bold font-mono text-xl shrink-0">
                  <FiZap />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-cyan-300 font-bold uppercase">Instant Wallet Settlement</span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-cyan-400/20 text-cyan-200">REAL-TIME</span>
                  </div>
                  <h4 className="text-base font-bold font-['Orbitron',sans-serif] text-white">
                    $2.50 Credited Per Direct Sponsor
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                    Zero lockup, zero waiting period. As soon as your referral activates their $25 package on Binance Smart Chain, $2.50 is credited immediately to your income wallet.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-gradient-to-r from-[#071630]/90 to-[#030d1f]/95 border border-amber-500/30 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-400/40 text-amber-300 flex items-center justify-center font-bold font-mono text-xl shrink-0">
                  <FiAward />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-amber-300 font-bold uppercase">5 Directs Rule</span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-400/20 text-amber-200">KEY CRITERIA</span>
                  </div>
                  <h4 className="text-base font-bold font-['Orbitron',sans-serif] text-white">
                    5 Directs Unlocks All 10 Levels & Puma Club
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                    Sponsoring 5 active direct members unlocks all 10 generations of Level Income ($5.00 distribution) and qualifies you for the $150 Puma Club Reward!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Interactive Direct Earnings Calculator */}
          <div className="lg:col-span-6">
            <div className="p-8 rounded-3xl bg-gradient-to-b from-[#091b3a] to-[#040e21] border border-cyan-500/40 shadow-2xl">
              <h3 className="text-xl font-bold font-['Orbitron',sans-serif] text-white mb-6 flex items-center gap-2">
                <FiUsers className="text-cyan-400" />
                <span>Direct Income Calculator</span>
              </h3>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-xs font-mono text-slate-300 mb-2">
                    <span>Number of Direct Partners</span>
                    <span className="text-cyan-400 font-bold">{directs} Members</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={directs}
                    onChange={(e) => setDirects(Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                    <span>1 Direct</span>
                    <span>10 Directs</span>
                    <span>25 Directs</span>
                    <span>50 Directs</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#020919] border border-slate-800 space-y-3">
                  <div className="flex justify-between text-xs font-mono text-slate-400">
                    <span>Package Amount</span>
                    <span className="text-white">$25.00 USDT</span>
                  </div>
                  <div className="flex justify-between text-xs font-mono text-slate-400">
                    <span>Direct Commission Rate</span>
                    <span className="text-cyan-300">10% ($2.50)</span>
                  </div>
                  <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
                    <span className="text-sm font-bold text-white font-['Orbitron',sans-serif]">
                      Total Direct Earnings
                    </span>
                    <span className="text-3xl font-black font-['Orbitron',monospace] text-amber-400">
                      ${totalEarned}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default DirectReferralIncome;
