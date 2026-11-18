import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setLoading } from "../../redux/slices/loadingSlice";
import InvestmentModal from "../../components/Screen/UserPanel/InvestmentModal";
import { getPackageInfo } from "../../api/user.api";
import { Rocket, Sparkles, Shield, Zap, Layers, CheckCircle2, ArrowRight } from "lucide-react";

// Official NODEXAI $25 Business Plan Package
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
            NODEXAI Package Activation
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Activate the official $25 NODEXAI Package to unlock all 5 income streams: Direct Referral, 10-Level Team Matrix, 1:1 Binary Matching, and Daily Company Turnover Club Pools!
          </p>
        </div>
      </div>

      {/* Main $25 Package Card Showcase */}
      <div className="max-w-4xl mx-auto p-8 sm:p-10 rounded-3xl bg-gradient-to-b from-[#0a1936] via-[#041026] to-[#020817] border-2 border-cyan-500/40 shadow-[0_0_50px_rgba(0,210,255,0.25)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-5 text-center lg:text-left flex-1">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-mono font-bold tracking-widest uppercase">
              100% DISTRIBUTED PLAN
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
              Non-custodial smart contract activation
            </span>
          </div>
        </div>
      </div>

      {/* Investment Modal */}
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
