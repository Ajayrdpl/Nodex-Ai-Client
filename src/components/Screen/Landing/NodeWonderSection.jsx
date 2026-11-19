import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FiZap,
  FiTrendingUp,
  FiRefreshCw,
  FiUsers,
  FiShield,
  FiArrowRight,
  FiCheckCircle,
  FiLayers,
  FiAward,
  FiActivity,
  FiClock,
} from "react-icons/fi";
import { LandingRouters } from "../../../constants/routes";

const NodeWonderSection = () => {
  const navigate = useNavigate();

  const handleJoin = () => {
    navigate(LandingRouters.USER_LOGIN);
  };

  const steps = [
    {
      num: "01",
      title: "Activate Package",
      subtitle: "$100 USDT Entry",
      desc: "Deposit $100 USDT (BEP-20) or activate via your internal fund wallet to enter the decentralized queue.",
      icon: <FiZap className="w-5 h-5 text-amber-400" />,
      tag: "Instant Entry",
    },
    {
      num: "02",
      title: "FIFO Queue Placement",
      subtitle: "Global Chronological Order",
      desc: "Receive your unique queue position in the First-In-First-Out global ledger with real-time rank tracking.",
      icon: <FiLayers className="w-5 h-5 text-cyan-400" />,
      tag: "Transparent Ledger",
    },
    {
      num: "03",
      title: "2:1 Global Push",
      subtitle: "Autonomous Progression",
      desc: "Every 2 new package purchases anywhere in the global ecosystem automatically advance top positions forward.",
      icon: <FiRefreshCw className="w-5 h-5 text-purple-400" />,
      tag: "Community Powered",
    },
    {
      num: "04",
      title: "Cycle Out & $150 Payout",
      subtitle: "150% Guaranteed Return",
      desc: "Your position cycles out with a massive $150.00 payout credited straight into your withdrawable wallet.",
      icon: <FiTrendingUp className="w-5 h-5 text-emerald-400" />,
      tag: "150% Yield",
    },
  ];

  return (
    <section id="node-wonder" className="relative overflow-hidden bg-[#020817] py-20 px-4 sm:px-6 lg:px-8 text-white">
      {/* Background Ambient Glows */}
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[28rem] h-[28rem] bg-cyan-500/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-7xl bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.05)_0%,transparent_70%)] pointer-events-none" />

      {/* Tech Grid Pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 210, 255, 0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 210, 255, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: "56px 56px",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* ── SECTION HEADER ── */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/40 border border-cyan-400/30 backdrop-blur-md mb-4 shadow-[0_0_15px_rgba(0,210,255,0.15)]"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
            </span>
            <span className="text-xs font-mono font-bold tracking-[0.2em] text-cyan-300 uppercase">
              REVOLUTIONARY AUTO-FIFO QUEUE PROTOCOL
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-black font-['Orbitron',sans-serif] tracking-tight"
          >
            Node Wonder{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-sky-200 to-amber-300 bg-clip-text text-transparent">
              Global Cycle Engine
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed"
          >
            Experience our flagship $100 automated queuing system. Every entry yields{" "}
            <strong className="text-amber-300 font-bold">$150.00 (150% Return)</strong> via community-driven FIFO cycles, plus a permanent{" "}
            <strong className="text-cyan-300 font-bold">5% ($5.00) Unconditional Direct Referral Commission</strong> with zero personal package requirement!
          </motion.p>
        </div>

        {/* ── 2 HERO SHOWCASE CARDS (CYCLE YIELD & UNCONDITIONAL REFERRAL) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch mb-16">
          {/* Card 1: $150 Cycle Payout */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-7 rounded-3xl bg-gradient-to-br from-[#08152c]/95 via-[#061022]/95 to-[#030814]/95 border-2 border-cyan-500/30 p-6 sm:p-8 relative overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.8),0_0_30px_rgba(0,210,255,0.1)] flex flex-col justify-between"
          >
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-cyan-500/15 rounded-full blur-2xl pointer-events-none" />

            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 tracking-wider uppercase">
                  NODE WONDER $100 ENTRY
                </span>
                <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  150% Profit per Cycle
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-baseline gap-2">
                <h3 className="text-3xl sm:text-5xl font-black font-['Orbitron',sans-serif] text-white">
                  $150.00 <span className="text-lg sm:text-2xl text-amber-300 font-bold">USDT</span>
                </h3>
                <span className="text-xs text-slate-400 font-mono">/ Per Completed Cycle</span>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Activate a Node Wonder position for $100. The decentralized First-In-First-Out engine places you into the universal queue. Every 2 new entries into the platform propel the oldest entry to complete its cycle, triggering a full <strong>$150.00 cash settlement</strong>.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-2xl bg-[#030814] border border-cyan-500/20">
                  <span className="text-[10px] text-slate-400 font-mono uppercase block">Package</span>
                  <span className="text-base sm:text-lg font-black text-cyan-300 font-['Orbitron',monospace]">$100 USDT</span>
                </div>
                <div className="p-3 rounded-2xl bg-[#030814] border border-amber-500/20">
                  <span className="text-[10px] text-slate-400 font-mono uppercase block">Net Profit</span>
                  <span className="text-base sm:text-lg font-black text-amber-300 font-['Orbitron',monospace]">+$50.00</span>
                </div>
                <div className="p-3 rounded-2xl bg-[#030814] border border-emerald-500/20 col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-slate-400 font-mono uppercase block">Re-Entries</span>
                  <span className="text-base sm:text-lg font-black text-emerald-400 font-['Orbitron',monospace]">Unlimited</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-cyan-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                <FiCheckCircle className="text-emerald-400" />
                <span>Zero downline balancing required</span>
              </div>
              <button
                onClick={handleJoin}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-yellow-200 text-slate-950 font-black text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-[0_0_20px_rgba(245,158,11,0.35)] flex items-center justify-center gap-2"
              >
                <span>Join Node Wonder</span>
                <FiArrowRight />
              </button>
            </div>
          </motion.div>

          {/* Card 2: 5% Unconditional Referral Income */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-5 rounded-3xl bg-gradient-to-br from-[#08152c]/95 via-[#061022]/95 to-[#030814]/95 border-2 border-amber-500/30 p-6 sm:p-8 relative overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.8),0_0_30px_rgba(245,158,11,0.1)] flex flex-col justify-between"
          >
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />

            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-500/40 tracking-wider uppercase">
                  UNCONDITIONAL REFERRAL
                </span>
                <span className="text-xs font-mono font-bold text-cyan-300">
                  Instant Wallet Credit
                </span>
              </div>

              <div>
                <h3 className="text-3xl sm:text-5xl font-black font-['Orbitron',sans-serif] text-amber-300">
                  5% <span className="text-lg sm:text-2xl text-white font-bold">($5.00)</span>
                </h3>
                <span className="text-xs text-slate-400 font-mono">/ On Every Direct Sponsor $100 Package</span>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Earn <strong>$5.00 USDT</strong> instantly every time any person sponsored by you purchases a Node Wonder package.
              </p>

              <div className="p-4 rounded-2xl bg-[#030814] border border-amber-500/25 space-y-2">
                <div className="flex items-start gap-2 text-xs text-slate-200">
                  <FiCheckCircle className="text-amber-400 mt-0.5 shrink-0" />
                  <span><strong>Zero Condition:</strong> You earn 5% even if you do NOT own a Node Wonder package yourself!</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-slate-200">
                  <FiCheckCircle className="text-amber-400 mt-0.5 shrink-0" />
                  <span><strong>Unlimited Referrals:</strong> Sponsor 10 partners = $50, 100 partners = $500 direct profit.</span>
                </div>
                <div className="flex items-start gap-2 text-xs text-slate-200">
                  <FiCheckCircle className="text-amber-400 mt-0.5 shrink-0" />
                  <span><strong>Re-Entry Income:</strong> Earn $5.00 every time your referral cycles and re-enters the queue!</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-amber-500/20">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Direct Sponsoring:</span>
                <span className="text-amber-300 font-bold uppercase">100% Active For All Members</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── 4-STEP VISUAL PROGRESSION TIMELINE ── */}
        <div className="space-y-6">
          <div className="text-center max-w-xl mx-auto">
            <h3 className="text-xl sm:text-2xl font-black font-['Orbitron',sans-serif] text-white">
              How the 2:1 FIFO Engine Cycles
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Automated smart queue logic guarantees transparent progression
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {steps.map((st, idx) => (
              <motion.div
                key={st.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="rounded-2xl bg-gradient-to-br from-[#08152c]/90 to-[#030914]/90 border border-cyan-500/20 p-5 space-y-3 relative group hover:border-cyan-400/50 hover:shadow-[0_8px_30px_rgba(0,210,255,0.15)] transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black font-['Orbitron',sans-serif] bg-gradient-to-r from-cyan-400 to-amber-300 bg-clip-text text-transparent">
                    {st.num}
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-[#0a1e3f] border border-cyan-500/30 flex items-center justify-center shadow-sm">
                    {st.icon}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-black text-white tracking-wide">{st.title}</h4>
                  <span className="text-[10px] text-cyan-300 font-mono font-bold block">{st.subtitle}</span>
                </div>

                <p className="text-[11px] text-slate-300 leading-relaxed">{st.desc}</p>

                <div className="pt-2 border-t border-cyan-500/15">
                  <span className="text-[9px] font-mono font-bold text-amber-300 uppercase tracking-wider px-2 py-0.5 rounded bg-amber-950/60 border border-amber-500/30">
                    {st.tag}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default NodeWonderSection;
