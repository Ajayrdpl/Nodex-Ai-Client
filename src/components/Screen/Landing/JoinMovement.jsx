import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { LandingRouters } from "../../../constants/routes";
import { FiChevronDown, FiArrowRight, FiCheckCircle, FiHelpCircle, FiSend, FiShield, FiLayers } from "react-icons/fi";
import { RiRobot2Fill } from "react-icons/ri";

const steps = [
  { step: "01", title: "Prepare Wallet", desc: "Use a compatible Web3 wallet (MetaMask, Trust Wallet, etc.) supporting BNB Smart Chain." },
  { step: "02", title: "Keep USDT Ready", desc: "Maintain the required USDT (BEP-20) balance in your wallet according to your chosen package." },
  { step: "03", title: "Keep BNB For Gas", desc: "Maintain a small amount of BNB for blockchain network gas fees." },
  { step: "04", title: "Open Platform", desc: "Visit the official NODEXAI platform or use a verified partner referral link." },
  { step: "05", title: "Connect Wallet", desc: "Click Connect Wallet and ensure BNB Smart Chain (BEP-20) network is selected." },
  { step: "06", title: "Select Package", desc: "Choose an eligible package tier from $10 up to $25,000 based on your preferred participation level." },
  { step: "07", title: "Verify & Confirm", desc: "Review network prompts, amount, and smart-contract details before approving." },
  { step: "08", title: "Check Activation", desc: "After successful on-chain confirmation, verify your package and live activation on your dashboard." },
];

const roadmapPhases = [
  { phase: "PHASE 01", title: "FOUNDATION", tag: "BUILD", desc: "Smart contract architecture, dashboard development, technical & security audits." },
  { phase: "PHASE 02", title: "GLOBAL LAUNCH", tag: "CONNECT", desc: "USDT BEP-20 participation launch, package system activation, community onboarding." },
  { phase: "PHASE 03", title: "EXPANSION", tag: "EXPAND", desc: "Global community growth, platform enhancements, UX upgrades & regional leader support." },
  { phase: "PHASE 04", title: "DEVELOPMENT", tag: "INNOVATE", desc: "Additional DeFi utilities, automated staking vaults, strategic ecosystem integrations." },
  { phase: "PHASE 05", title: "FUTURE VISION", tag: "GROW", desc: "Broader blockchain integration, advanced DeFi utilities, sustainable ecosystem expansion." },
];

const faqs = [
  {
    q: "What is NODEXAI?",
    a: "NODEXAI is a community-focused decentralized finance ecosystem built around blockchain and smart contract technology on BNB Smart Chain.",
  },
  {
    q: "What packages are available and what is the Daily ROI?",
    a: "There are six packages: Nova ($10-$200 | 4.5% daily), Vantage ($250-$500 | 5.0% daily), Nexus ($550-$2,000 | 5.5% daily), Prime ($2,500-$5,000 | 6.0% daily), Titan ($5,500-$10,000 | 6.5% daily), and Infinity ($10,500-$25,000 | 7.5% daily). All packages have a Maximum ROI Cap of 220%.",
  },
  {
    q: "How does the 12% Direct Booster work?",
    a: "Members who complete the required Direct Business / Direct Referral criteria within 24 hours of account activation are eligible to receive an elevated 12% Direct Booster Income.",
  },
  {
    q: "What is the 10-Level Community Income?",
    a: "The ecosystem distributes a total of 24% across 10 levels: Level 1 (8%), Level 2 (4%), Level 3 (3%), Level 4 (2%), Level 5 (1.5%), Level 6 (1.5%), and Levels 7 to 10 (1.0% each). Joining with $500 or above automatically unlocks all 10 levels.",
  },
  {
    q: "How does Auto-Compounding work?",
    a: "Participants can compound their eligible balance anytime according to platform rules and receive an additional +0.5% Auto Compounding Bonus added directly into their active balance.",
  },
  {
    q: "What are the withdrawal conditions and fees?",
    a: "The minimum withdrawal is $1 USDT with a 5% platform withdrawal fee. Principal capital can be withdrawn at any time: before 30 days incurs a 25% early withdrawal deduction, and after 30 days there is 0% deduction.",
  },
];

const JoinMovement = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <section id="how-to-join" className="relative overflow-hidden bg-[#020817] py-20 px-4 sm:px-6 lg:px-8 text-white">
      {/* Background Ambience */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* ── STEP-BY-STEP HOW TO JOIN (PDF Page 21-22) ── */}
        <div className="mb-20">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/40 border border-amber-400/25 mb-4">
              <FiCheckCircle className="text-amber-400 text-sm" />
              <span className="text-xs font-mono font-bold tracking-[0.2em] text-amber-300 uppercase">
                START YOUR JOURNEY • HOW TO JOIN
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-['Orbitron',sans-serif] tracking-tight">
              Eight Simple Steps to{" "}
              <span className="bg-gradient-to-r from-amber-400 via-yellow-200 to-cyan-300 bg-clip-text text-transparent">
                Get Started
              </span>
            </h2>

            <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed">
              Join using USDT (BEP-20) on BNB Smart Chain through a compatible Web3 wallet starting from only $10.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {steps.map((st, idx) => (
              <motion.div
                key={st.step}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="p-5 rounded-2xl bg-gradient-to-b from-[#071630]/90 to-[#030d1f]/95 border border-slate-800 hover:border-amber-400/40 backdrop-blur-md transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="w-8 h-8 rounded-lg bg-amber-400/15 border border-amber-400/30 text-amber-300 font-mono font-bold text-xs flex items-center justify-center">
                    {st.step}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">Step {idx + 1}</span>
                </div>
                <h4 className="text-sm font-bold font-['Orbitron',sans-serif] text-white mb-1.5">
                  {st.title}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {st.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── ROADMAP (PDF Page 23) ── */}
        <div className="mb-20">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/40 border border-cyan-400/25 mb-4">
              <FiLayers className="text-cyan-400 text-sm" />
              <span className="text-xs font-mono font-bold tracking-[0.2em] text-cyan-300 uppercase">
                ROADMAP • STEP BY STEP
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-['Orbitron',sans-serif] tracking-tight">
              NODEXAI{" "}
              <span className="bg-gradient-to-r from-amber-400 via-yellow-200 to-cyan-300 bg-clip-text text-transparent">
                Strategic Roadmap
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {roadmapPhases.map((r, i) => (
              <div
                key={r.phase}
                className="p-5 rounded-2xl bg-[#061429]/80 border border-slate-800 hover:border-cyan-400/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold text-amber-300">{r.phase}</span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-cyan-400/15 text-cyan-300">{r.tag}</span>
                  </div>
                  <h4 className="text-sm font-bold font-['Orbitron',sans-serif] text-white mb-2">{r.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{r.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── FAQ ACCORDION (PDF Aligned) ── */}
        <div className="mb-20">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/40 border border-amber-400/25 mb-4">
              <FiHelpCircle className="text-amber-400 text-sm" />
              <span className="text-xs font-mono font-bold tracking-[0.2em] text-amber-300 uppercase">
                FAQ • KNOWLEDGE BASE
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black font-['Orbitron',sans-serif] tracking-tight">
              Frequently Asked{" "}
              <span className="bg-gradient-to-r from-amber-400 via-yellow-200 to-cyan-300 bg-clip-text text-transparent">
                Questions
              </span>
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-3.5">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-800 bg-[#06142a]/70 backdrop-blur-md overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-800/20 transition-colors"
                  >
                    <span className="text-sm sm:text-base font-bold font-['Orbitron',sans-serif] text-white">
                      {faq.q}
                    </span>
                    <FiChevronDown
                      className={`text-amber-400 text-lg shrink-0 transition-transform duration-300 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── FINAL CALL TO ACTION WITH OFFICIAL LOGO (NODEXAI-logo.jpg) ── */}
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#061836] via-[#092247] to-[#041026] border-2 border-amber-400/40 shadow-[0_0_60px_rgba(214,168,58,0.25)] flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-mono font-bold uppercase">
              THE FUTURE IS DECENTRALIZED
            </div>
            <h3 className="text-2xl sm:text-4xl font-black font-['Orbitron',sans-serif] text-white leading-tight">
              Ready to Power Your Financial Freedom with USDT?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Connect your Web3 wallet today, activate starting from $10, and begin earning daily automated returns with NODEXAI.
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
              <button
                onClick={() => navigate(LandingRouters.USER_REGISTER)}
                className="px-7 py-3.5 rounded-xl font-bold font-['Orbitron',sans-serif] text-xs uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-300 shadow-[0_0_25px_rgba(245,158,11,0.5)] hover:scale-105 transition-all cursor-pointer flex items-center gap-2"
              >
                <RiRobot2Fill className="text-base" />
                <span>Join NODEXAI</span>
                <FiArrowRight />
              </button>
              <button
                onClick={() => navigate(LandingRouters.USER_LOGIN)}
                className="px-6 py-3.5 rounded-xl font-bold font-['Orbitron',sans-serif] text-xs uppercase tracking-wider text-slate-200 border border-slate-700 hover:border-amber-400/50 bg-[#020713]/70 hover:bg-amber-500/10 transition-all cursor-pointer"
              >
                Member Login
              </button>
            </div>
          </div>

          <div className="shrink-0 flex flex-col items-center">
            <div className="p-3 rounded-2xl bg-[#020713]/80 border border-amber-400/40 shadow-xl">
              <img
                src="/NodexAI.jpeg"
                alt="NODEXAI"
                className="h-32 w-auto max-w-[280px] object-contain rounded-xl"
              />
            </div>
            <span className="text-[11px] font-mono text-amber-300 font-bold mt-2">
              INVEST • GROW • EARN
            </span>
          </div>
        </div>

      </div>
    </section>
  );
};

export default JoinMovement;
