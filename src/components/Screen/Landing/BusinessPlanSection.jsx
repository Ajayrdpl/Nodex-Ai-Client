// src/components/Screen/Landing/BusinessPlanSection.jsx
import React, { useState } from "react";
import {
  TrendingUp,
  Zap,
  Users,
  Network,
  Award,
  Wallet,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Globe,
  Layers,
  ChevronRight,
  Star,
  Clock,
  Coins,
} from "lucide-react";

const PLAN_TABS = [
  { id: "overview", label: "Plan Overview", icon: Globe, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/30" },
  { id: "booster", label: "2% Booster ROI", icon: Zap, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30" },
  { id: "direct", label: "5% Direct Income", icon: Users, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30" },
  { id: "level", label: "15-Level ROI", icon: Network, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/30" },
  { id: "salary", label: "15 Salary & Ranks", icon: Award, color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/30" },
  { id: "withdrawal", label: "Withdrawal Rules", icon: Wallet, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
];

const LEVEL_DATA = [
  { levels: "Level 1 & Level 2", percentage: "10.0%", badge: "10% Daily ROI Dividend", directsNeeded: "1-2 Directs" },
  { levels: "Level 3, Level 4, Level 5", percentage: "5.0%", badge: "5% Daily ROI Dividend", directsNeeded: "3-5 Directs" },
  { levels: "Level 6 & Level 7", percentage: "4.0%", badge: "4% Daily ROI Dividend", directsNeeded: "6-7 Directs" },
  { levels: "Level 8 & Level 9", percentage: "3.0%", badge: "3% Daily ROI Dividend", directsNeeded: "8-9 Directs" },
  { levels: "Level 10, Level 11, Level 12", percentage: "2.0%", badge: "2% Daily ROI Dividend", directsNeeded: "10 Directs" },
  { levels: "Level 13, Level 14, Level 15", percentage: "1.0%", badge: "1% Daily ROI Dividend", directsNeeded: "10 Directs" },
];

const RANK_SALARY_DATA = [
  { rank: 1, business: "$1,000", reward: "$100", weeklySalary: "$10 / Week", ratio: "50:30:20" },
  { rank: 2, business: "$3,000", reward: "$200", weeklySalary: "$20 / Week", ratio: "50:30:20" },
  { rank: 3, business: "$5,000", reward: "$300", weeklySalary: "$30 / Week", ratio: "50:30:20" },
  { rank: 4, business: "$10,000", reward: "$500", weeklySalary: "$50 / Week", ratio: "50:30:20" },
  { rank: 5, business: "$25,000", reward: "$1,500", weeklySalary: "$100 / Week", ratio: "50:30:20" },
  { rank: 6, business: "$50,000", reward: "$3,000", weeklySalary: "$200 / Week", ratio: "50:30:20" },
  { rank: 7, business: "$75,000", reward: "$4,000", weeklySalary: "$300 / Week", ratio: "50:30:20" },
  { rank: 8, business: "$100,000 (1 Lakh)", reward: "$7,500", weeklySalary: "$500 / Week", ratio: "50:30:20" },
  { rank: 9, business: "$200,000 (2 Lakh)", reward: "$15,000", weeklySalary: "$750 / Week", ratio: "50:30:20" },
  { rank: 10, business: "$500,000 (5 Lakh)", reward: "$25,000", weeklySalary: "$1,000 / Week", ratio: "50:30:20" },
  { rank: 11, business: "$1,000,000 (10 Lakh)", reward: "$50,000", weeklySalary: "$2,000 / Week", ratio: "50:30:20" },
  { rank: 12, business: "$2,500,000 (25 Lakh)", reward: "$75,000", weeklySalary: "$3,000 / Week", ratio: "50:30:20" },
  { rank: 13, business: "$5,000,000 (50 Lakh)", reward: "$100,000 (1 L)", weeklySalary: "$5,000 / Week", ratio: "50:30:20" },
  { rank: 14, business: "$10,000,000 (100 Lakh)", reward: "$200,000 (2 L)", weeklySalary: "$10,000 / Week", ratio: "50:30:20" },
  { rank: 15, business: "$20,000,000 (200 Lakh)", reward: "$300,000 (3 L)", weeklySalary: "$20,000 / Week", ratio: "50:30:20" },
];

const BusinessPlanSection = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <section id="business-plan" className="py-16 px-4 md:px-8 max-w-7xl mx-auto space-y-12">
      {/* 🌟 Section Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-extrabold uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5" /> Official Business Plan & Income Structure
        </div>
        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
          NODEXAI <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">Ecosystem</span>
        </h2>
        <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto">
          Backed by <strong className="text-white">South Korea Crypto Trading</strong> algorithm. Explore transparent daily yields, booster rewards, 3-Matrix team genealogy, and 15 weekly salary ranks.
        </p>
      </div>

      {/* 🧭 Interactive Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 bg-slate-900/90 p-2 rounded-3xl border border-slate-800 shadow-2xl backdrop-blur-xl">
        {PLAN_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col sm:flex-row items-center justify-center gap-2 py-3 px-3 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-300 ${
                isActive
                  ? "bg-slate-800 text-white border border-slate-700 shadow-lg scale-[1.02]"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <div className={`p-1.5 rounded-xl ${tab.bg}`}>
                <Icon className={`w-4 h-4 ${tab.color}`} />
              </div>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TAB 1: PLAN OVERVIEW
      ───────────────────────────────────────────────────────────── */}
      {activeTab === "overview" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <FeatureCard
              title="Minimum Start"
              value="$10.00"
              subtext="Daily 1.0% ROI per day"
              icon={Coins}
              color="text-cyan-400"
            />
            <FeatureCard
              title="ID Activation"
              value="$50.00"
              subtext="Unlocks full working benefits"
              icon={CheckCircle2}
              color="text-emerald-400"
            />
            <FeatureCard
              title="Non-Working Cap"
              value="3X (300%)"
              subtext="Max passive return limit"
              icon={TrendingUp}
              color="text-blue-400"
            />
            <FeatureCard
              title="Working Cap"
              value="5X (500%)"
              subtext="Max team earnings limit"
              icon={Star}
              color="text-purple-400"
            />
          </div>

          <div className="bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border border-slate-800 p-6 md:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="space-y-2 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-extrabold text-indigo-400 uppercase tracking-widest">
                <Globe className="w-4 h-4" /> Global Trading Infrastructure
              </div>
              <h3 className="text-2xl font-extrabold text-white">
                South Korea AI Crypto Trading Technology
              </h3>
              <p className="text-slate-300 text-sm max-w-xl">
                3-Matrix Working Plan ($1 \rightarrow 3 \rightarrow 9 \rightarrow 27 \dots$) structured for sustainable multi-generational growth and automated profit-sharing.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <a
                href="/register"
                className="px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white rounded-2xl font-bold text-sm shadow-xl shadow-cyan-500/20 transition flex items-center justify-center gap-2"
              >
                Join Now <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="/login"
                className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold text-sm border border-slate-700 transition text-center"
              >
                Member Login
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 2: 2% BOOSTER ROI
      ───────────────────────────────────────────────────────────── */}
      {activeTab === "booster" && (
        <div className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-3xl shadow-2xl space-y-6 animate-fadeIn">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400">Double Daily Yield</span>
              <h3 className="text-2xl md:text-3xl font-black text-white mt-1">2.0% Daily Booster ROI</h3>
              <p className="text-slate-400 text-sm mt-1">
                Boost your daily returns from <strong className="text-white">1.0% to 2.0% per day</strong> by completing the simple 1-week booster condition.
              </p>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/30 px-5 py-3 rounded-2xl text-amber-400 font-extrabold text-xl text-center">
              ⚡ 2.0% Daily ROI
            </div>
          </div>

          {/* Booster Condition Rule Box */}
          <div className="bg-slate-950/90 border border-slate-800 p-6 rounded-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-400 font-bold text-base">
              <Zap className="w-5 h-5 shrink-0" />
              <span>Booster Qualification Criteria:</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm">
              <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 text-slate-300">
                <span className="block text-slate-400 text-xs mb-1 font-semibold">1. Qualifying Timeframe</span>
                <strong className="text-white text-base">Within 1 Week (7 Days)</strong> from registration/activation.
              </div>
              <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 text-slate-300">
                <span className="block text-slate-400 text-xs mb-1 font-semibold">2. Direct Sponsors</span>
                <strong className="text-white text-base">5 Direct Active Members</strong> sponsored directly.
              </div>
              <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 text-slate-300">
                <span className="block text-slate-400 text-xs mb-1 font-semibold">3. Package Amount</span>
                <strong className="text-white text-base">Same or Higher Package</strong> as your self-investment.
              </div>
            </div>

            {/* Visual 1 to 5 Direct Tree Representation */}
            <div className="pt-6 pb-2 flex flex-col items-center">
              <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider mb-4">
                Visual Sponsor Representation
              </span>
              <div className="flex flex-col items-center">
                <div className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-extrabold text-xs rounded-2xl shadow-lg shadow-amber-500/20">
                  👑 YOU (1 ID)
                </div>
                <div className="w-0.5 h-6 bg-amber-500/50" />
                <div className="flex flex-wrap justify-center gap-3 sm:gap-6 pt-3 border-t-2 border-amber-500/30">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex flex-col items-center">
                      <div className="w-0.5 h-3 bg-amber-500/40" />
                      <div className="px-3 py-1.5 bg-slate-800 border border-amber-500/40 rounded-xl text-center">
                        <span className="text-[10px] text-amber-300 font-bold block">Direct #{i}</span>
                        <span className="text-xs text-white font-extrabold">Same Pkg</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 3: DIRECT REFERRAL INCOME (10%)
      ───────────────────────────────────────────────────────────── */}
      {activeTab === "direct" && (
        <div className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-3xl shadow-2xl space-y-6 animate-fadeIn">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-blue-400">Instant Sponsor Commission</span>
              <h3 className="text-2xl md:text-3xl font-black text-white mt-1">5% Flat Direct Referral Income</h3>
              <p className="text-slate-400 text-sm mt-1">
                Earn <strong className="text-white">5% instant direct commission ($1.25 on $25 package)</strong> whenever any direct partner joins or activates their package.
              </p>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/30 px-5 py-3 rounded-2xl text-blue-400 font-extrabold text-xl">
              5% Instant Payout
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-2">
              <CheckCircle2 className="w-5 h-5 text-blue-400" />
              <h4 className="text-white font-bold">Instant Wallet Credit</h4>
              <p className="text-slate-400 text-xs">Direct commission is credited directly into your Income Wallet immediately upon investment.</p>
            </div>

            <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-2">
              <CheckCircle2 className="w-5 h-5 text-blue-400" />
              <h4 className="text-white font-bold">Unlimited Directs</h4>
              <p className="text-slate-400 text-xs">No limitation on direct sponsors. Earn 5% on every direct member without restrictions.</p>
            </div>

            <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-2">
              <CheckCircle2 className="w-5 h-5 text-blue-400" />
              <h4 className="text-white font-bold">Reinvestment Bonus</h4>
              <p className="text-slate-400 text-xs">Whenever your direct partner reinvests from their wallet, you earn 5% direct commission again!</p>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 4: 15-LEVEL GENERATION ROI INCOME
      ───────────────────────────────────────────────────────────── */}
      {activeTab === "level" && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl space-y-6 animate-fadeIn">
          <div className="p-6 md:p-8 pb-0">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-purple-400">Generation Yield</span>
                <h3 className="text-2xl md:text-3xl font-black text-white mt-1">15-Level Generation ROI Income</h3>
                <p className="text-slate-400 text-sm mt-1">
                  Earn daily percentage on your downline's daily trading profit across 15 deep generations.
                </p>
              </div>
              <div className="bg-purple-500/10 border border-purple-500/30 px-4 py-2 rounded-2xl text-purple-300 text-xs font-bold">
                10 Directs ($50 ID) = All 15 Levels Open!
              </div>
            </div>
          </div>

          <div className="overflow-x-auto px-4 md:px-8 pb-6">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-800/60 text-slate-400 uppercase text-xs">
                  <th className="p-3.5">Generations / Levels</th>
                  <th className="p-3.5">Commission %</th>
                  <th className="p-3.5">Type of Income</th>
                  <th className="p-3.5">Unlock Qualification</th>
                </tr>
              </thead>
              <tbody>
                {LEVEL_DATA.map((row, idx) => (
                  <tr key={idx} className="border-b border-slate-800 hover:bg-slate-800/30">
                    <td className="p-3.5 font-bold text-white">{row.levels}</td>
                    <td className="p-3.5 text-purple-400 font-black text-base">{row.percentage}</td>
                    <td className="p-3.5 text-slate-300 text-xs">{row.badge}</td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                        {row.directsNeeded}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 5: 15 SALARY & RANK REWARDS (50:30:20 RATIO)
      ───────────────────────────────────────────────────────────── */}
      {activeTab === "salary" && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl space-y-6 animate-fadeIn">
          <div className="p-6 md:p-8 pb-0">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-rose-400">Leadership Royalty</span>
                <h3 className="text-2xl md:text-3xl font-black text-white mt-1">15 Rank & Weekly Salary Program</h3>
                <p className="text-slate-400 text-sm mt-1">
                  Qualified team turnover based on <strong className="text-white">50% Leg 1 : 30% Leg 2 : 20% Other Legs</strong> matrix ratio.
                </p>
              </div>
              <div className="bg-rose-500/10 border border-rose-500/30 px-4 py-2 rounded-2xl text-rose-300 text-xs font-bold">
                50:30:20 Leg Volume Ratio
              </div>
            </div>
          </div>

          <div className="overflow-x-auto px-4 md:px-8 pb-6">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-800/60 text-slate-400 uppercase text-xs">
                  <th className="p-3.5">Rank #</th>
                  <th className="p-3.5">Team Business Turnover</th>
                  <th className="p-3.5">One-Time Reward</th>
                  <th className="p-3.5">Weekly Salary Payout</th>
                  <th className="p-3.5">Matrix Ratio</th>
                </tr>
              </thead>
              <tbody>
                {RANK_SALARY_DATA.map((r) => (
                  <tr key={r.rank} className="border-b border-slate-800 hover:bg-slate-800/30 text-xs sm:text-sm">
                    <td className="p-3.5 font-bold text-amber-400">Rank #{r.rank}</td>
                    <td className="p-3.5 font-bold text-white">{r.business}</td>
                    <td className="p-3.5 text-indigo-400 font-semibold">{r.reward}</td>
                    <td className="p-3.5 text-emerald-400 font-extrabold text-sm sm:text-base">{r.weeklySalary}</td>
                    <td className="p-3.5 font-mono text-slate-400 text-xs">{r.ratio}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 6: WITHDRAWAL RULES (50/50 SPLIT)
      ───────────────────────────────────────────────────────────── */}
      {activeTab === "withdrawal" && (
        <div className="bg-slate-900 border border-slate-800 p-6 md:p-8 rounded-3xl shadow-2xl space-y-6 animate-fadeIn">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Payout Architecture</span>
              <h3 className="text-2xl md:text-3xl font-black text-white mt-1">Withdrawal Policy & 50/50 Distribution</h3>
              <p className="text-slate-400 text-sm mt-1">
                Fair and automated liquidity management system with instant P2P internal transfer benefits.
              </p>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/30 px-5 py-3 rounded-2xl text-emerald-400 font-extrabold text-xl">
              50/50 Split System
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs sm:text-sm">
            <div className="bg-slate-950/90 p-5 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-slate-400 block text-xs">Withdrawal Window</span>
              <strong className="text-white text-base block">1 Time per 24 Hours</strong>
              <p className="text-slate-500 text-xs">Daily withdrawal request allowed once every 24-hour cycle.</p>
            </div>

            <div className="bg-slate-950/90 p-5 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-slate-400 block text-xs">Minimum Amount</span>
              <strong className="text-emerald-400 text-base block">$10.00 Minimum</strong>
              <p className="text-slate-500 text-xs">Accessible low minimum threshold for all investors.</p>
            </div>

            <div className="bg-slate-950/90 p-5 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-slate-400 block text-xs">Admin Platform Fee</span>
              <strong className="text-rose-400 text-base block">10% Flat Fee</strong>
              <p className="text-slate-500 text-xs">Deducted from gross requested amount.</p>
            </div>

            <div className="bg-slate-950/90 p-5 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-slate-400 block text-xs">Team Activation Fee</span>
              <strong className="text-cyan-400 text-base block">0% Fee (Free!)</strong>
              <p className="text-slate-500 text-xs">Direct downline ID activations incur zero platform charge.</p>
            </div>
          </div>

          {/* 50/50 Split Diagram */}
          <div className="bg-slate-950/90 p-6 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="font-bold text-white text-sm">Example Calculation on $100 Withdrawal:</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                <span className="text-slate-400 block">Gross Request:</span>
                <span className="text-white font-bold text-base">$100.00</span>
                <span className="text-rose-400 block mt-1">-$10.00 Admin Fee (10%)</span>
              </div>
              <div className="bg-slate-900 p-3.5 rounded-xl border border-blue-500/30">
                <span className="text-blue-400 font-bold block">50% Crypto Transfer ($45.00)</span>
                <span className="text-slate-300 text-[11px] block mt-1">Manual blockchain transfer to user's exchange wallet upon admin approval.</span>
              </div>
              <div className="bg-slate-900 p-3.5 rounded-xl border border-emerald-500/30">
                <span className="text-emerald-400 font-bold block">50% P2P Wallet Credit ($45.00)</span>
                <span className="text-slate-300 text-[11px] block mt-1">Instant automatic credit to user's P2P Wallet with 0% team activation utility.</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

const FeatureCard = ({ title, value, subtext, icon: Icon, color }) => (
  <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl flex items-center justify-between shadow-xl">
    <div>
      <span className="text-xs text-slate-400 uppercase tracking-wider block font-semibold">{title}</span>
      <h3 className={`text-2xl font-black mt-1 ${color}`}>{value}</h3>
      <span className="text-[11px] text-slate-500 block mt-0.5">{subtext}</span>
    </div>
    <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700/60">
      <Icon className={`w-6 h-6 ${color}`} />
    </div>
  </div>
);

export default BusinessPlanSection;
