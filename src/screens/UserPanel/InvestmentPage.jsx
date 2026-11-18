import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setLoading } from "../../redux/slices/loadingSlice";
import InvestmentModal from "../../components/Screen/UserPanel/InvestmentModal";
import { getPackageInfo } from "../../api/user.api";
import { AuthenticatedUserRouters } from "../../constants/routes";
import {
  Rocket,
  Sparkles,
  Shield,
  Zap,
  Layers,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Award,
  RefreshCw,
  Clock,
  Flame,
} from "lucide-react";

// Official NODEXAI Packages Configuration
export const NODEXAI_PACKAGES = [
  {
    _id: "NODEX_PKG_25",
    id: "NODEX_PKG_25",
    category: "OFFICIAL",
    categoryTitle: "NODEXAI BUSINESS PACKAGE",
    title: "NODEXAI PACKAGE",
    amount: 25,
    min: 25,
    max: 25,
    minAmount: 25,
    maxAmount: 25,
    percentage: 100,
    dailyRoi: 0,
    iconType: "gem",
    color: "#00D2FF",
    badgeText: "$25 JOINING PACKAGE",
    presetAmounts: [25],
    features: [
      "10% Direct Income ($2.50 instant)",
      "20% 10-Level Matrix Income ($5.00)",
      "50% Binary 1:1 Matching Bonus ($12.50)",
      "10% Club Income (Puma, Pajero, Panther CTO)",
      "10% Community Development Support ($2.50)",
    ],
    status: true,
  },
];

export const VELTRION_PACKAGES = NODEXAI_PACKAGES;

const InvestmentPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(NODEXAI_PACKAGES[0]);
  const [plans, setPlans] = useState(NODEXAI_PACKAGES);

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const fetchPackageInfo = async () => {
    try {
      dispatch(setLoading(true));
      const response = await getPackageInfo();
      const rawPlans = response?.data || response?.packages || response;

      if (rawPlans && Array.isArray(rawPlans) && rawPlans.length > 0) {
        setPlans(rawPlans);
        if (rawPlans[0]) setSelectedPlan(rawPlans[0]);
      } else {
        setPlans(NODEXAI_PACKAGES);
      }
    } catch (error) {
      console.warn("Using default NODEXAI package:", error);
      setPlans(NODEXAI_PACKAGES);
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    fetchPackageInfo();
  }, []);

  const pkg = plans[0] || NODEXAI_PACKAGES[0];

  return (
    <div className="space-y-10 pt-4 pb-12 text-white">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 text-xs font-mono font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>USDT (BEP-20) ON BNB SMART CHAIN</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-['Orbitron',monospace] tracking-wider">
            NODEXAI Official Packages
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-3xl">
            Choose from our three official investment modules: the <strong>$25 Joining Package</strong> for binary & matrix team commissions, the <strong>Trading Profit Package</strong> (3% weekly / 2X cap), and the <strong>Node Wonder</strong> universal 2-ID queue ($150 cycle payout).
          </p>
        </div>
      </div>

      {/* Package 1: Main $25 Package Card Showcase */}
      <div className="max-w-5xl mx-auto p-8 sm:p-10 rounded-3xl bg-gradient-to-b from-[#0a1936] via-[#041026] to-[#020817] border-2 border-cyan-500/40 shadow-[0_0_50px_rgba(0,210,255,0.25)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-5 text-center lg:text-left flex-1">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 text-xs font-mono font-bold tracking-widest uppercase">
              100% DISTRIBUTED PLAN • PRIMARY JOINING
            </div>

            <h2 className="text-3xl sm:text-4xl font-black font-['Orbitron',monospace] text-white">
              NODEXAI PACKAGE — <span className="text-cyan-400">$25 USDT</span>
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
              One simple $25 package empowers you with five comprehensive income streams, instant wallet earnings, and binary matching commissions.
            </p>

            {/* 5 Incomes List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#030d22] border border-cyan-500/20 text-xs text-slate-200 font-mono">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>10% Direct ($2.50)</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#030d22] border border-amber-500/20 text-xs text-slate-200 font-mono">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>20% 10-Level ($5.00)</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#030d22] border border-emerald-500/20 text-xs text-slate-200 font-mono">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>50% Binary 1:1 ($12.50)</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#030d22] border border-purple-500/20 text-xs text-slate-200 font-mono">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                <span>10% Club CTO Pool ($2.50)</span>
              </div>
            </div>
          </div>

          {/* Pricing & CTA Action */}
          <div className="p-8 rounded-3xl bg-[#040e24]/90 border border-cyan-400/30 text-center w-full lg:w-80 shrink-0 shadow-xl space-y-5">
            <span className="text-xs font-mono uppercase text-slate-400 tracking-widest block">
              Package Cost
            </span>
            <div className="text-5xl font-black font-['Orbitron',monospace] text-amber-400">
              $25<span className="text-base text-slate-400 font-normal">.00</span>
            </div>
            <span className="text-xs text-cyan-300 font-mono block">USDT (BEP-20)</span>

            <button
              onClick={() => handleSelectPlan(pkg)}
              className="w-full py-4 rounded-xl text-center text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-400 hover:brightness-110 shadow-[0_0_25px_rgba(0,210,255,0.4)] flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 hover:scale-105 font-['Orbitron',monospace]"
            >
              <Rocket className="w-4 h-4" />
              <span>Activate Package Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <span className="text-[10px] text-slate-500 block font-mono">
              Direct BSC Smart Contract Deposit
            </span>
          </div>
        </div>
      </div>

      {/* Package 2 & 3 Showcase Grid */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Package 2: Trading Profit Package (Min $50 / 3% Weekly / 2X Capping) */}
        <div className="p-7 sm:p-8 rounded-3xl bg-gradient-to-b from-[#061b24] via-[#031118] to-[#01080c] border-2 border-emerald-500/40 shadow-xl flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                WEEKLY 3% TRADING PROFIT
              </span>
              <span className="text-xs font-mono text-emerald-400 font-bold">2X CAPPING</span>
            </div>

            <h3 className="text-2xl font-black font-['Orbitron',monospace] text-white">
              Trading Package — <span className="text-emerald-400">Min $50</span>
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed">
              Earn <strong>3.0% Weekly</strong> (Mon–Fri daily 0.60%) with strict <strong>200% (2X) capping</strong>. Plus earn <strong>60% across 10 levels</strong> on downline trading profits (ROI of ROI). Both ROI and Level ROI count towards your 2X cap.
            </p>

            <div className="space-y-2 pt-2 text-xs font-mono text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>3.0% Weekly Profit (Mon-Fri)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>2X Absolute Return Capping (200%)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>10-Level ROI of ROI (L1: 20%, L2: 10%, L3: 6%...)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Wallet or Web3 BSC USDT payment</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] text-slate-400 font-mono block">MINIMUM INVESTMENT</span>
                <span className="text-2xl font-black font-['Orbitron',monospace] text-emerald-400">$50+</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-mono block">WEEKLY RATE</span>
                <span className="text-base font-bold text-white font-mono">3.0% / Week</span>
              </div>
            </div>

            <button
              onClick={() => navigate(AuthenticatedUserRouters.TRADING_PACKAGE)}
              className="w-full py-3.5 rounded-xl text-center text-xs font-bold uppercase tracking-wider text-black bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-300 hover:brightness-110 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 font-['Orbitron',monospace]"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Go To Trading Package</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Package 3: Node Wonder ($100 / $150 Universal Queue) */}
        <div className="p-7 sm:p-8 rounded-3xl bg-gradient-to-b from-[#180a2b] via-[#0e041c] to-[#06020c] border-2 border-purple-500/40 shadow-xl flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                UNIVERSAL 2-ID QUEUE
              </span>
              <span className="text-xs font-mono text-amber-400 font-bold">5% DIRECT REF</span>
            </div>

            <h3 className="text-2xl font-black font-['Orbitron',monospace] text-white">
              Node Wonder — <span className="text-purple-400">$100</span>
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed">
              Buy for fixed <strong>$100</strong>. When <strong>any 2 IDs</strong> join globally across the entire company after your position, you receive <strong>$150</strong> cycle payout and your slot disables. Reinvest $100 to cycle again!
            </p>

            <div className="space-y-2 pt-2 text-xs font-mono text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                <span>$150 Payout on 2 Global Subsequent IDs</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                <span>5% ($5.00) Unconditional Direct Referral</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Direct referrals pay even when you are disabled!</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Universal company-wide transparent queue</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] text-slate-400 font-mono block">FIXED PACKAGE</span>
                <span className="text-2xl font-black font-['Orbitron',monospace] text-purple-400">$100.00</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-mono block">CYCLE PAYOUT</span>
                <span className="text-base font-bold text-emerald-400 font-mono">$150.00 USDT</span>
              </div>
            </div>

            <button
              onClick={() => navigate(AuthenticatedUserRouters.NODE_WONDER)}
              className="w-full py-3.5 rounded-xl text-center text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-500 hover:brightness-110 shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 font-['Orbitron',monospace]"
            >
              <Zap className="w-4 h-4" />
              <span>Go To Node Wonder</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Investment Modal for $25 Joining Package */}
      {isModalOpen && selectedPlan && (
        <InvestmentModal
          plan={selectedPlan}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          refresh={fetchPackageInfo}
        />
      )}
    </div>
  );
};

export default InvestmentPage;
