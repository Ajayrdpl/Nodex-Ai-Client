import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setLoading } from "../../redux/slices/loadingSlice";
import InvestmentModal from "../../components/Screen/UserPanel/InvestmentModal";
import PlanCard from "../../components/Screen/UserPanel/PlanCard";
import { getPackageInfo } from "../../api/user.api";
import { Rocket, Sparkles, Shield, Zap, Layers } from "lucide-react";

// The exact 6 packages from the Global Package Plan & Advanced Package Options images
export const NODEXAI_PACKAGES = [
  // ── 1. GLOBAL PACKAGE PLAN ──
  {
    _id: "pkg-nova",
    id: "pkg-nova",
    category: "GLOBAL",
    categoryTitle: "GLOBAL PACKAGE PLAN",
    title: "NOVA",
    min: 10,
    max: 200,
    minAmount: 10,
    maxAmount: 200,
    dailyRoi: 4.5,
    thirtyDaysRoi: 135,
    monthlyRoi: 135,
    totalRoi: 220,
    maxRoiCap: 220,
    iconType: "star",
    color: "#F59E0B",
    badgeText: "ENTRY TIER",
    presetAmounts: [10, 50, 100, 150, 200],
    status: true,
  },
  {
    _id: "pkg-vantage",
    id: "pkg-vantage",
    category: "GLOBAL",
    categoryTitle: "GLOBAL PACKAGE PLAN",
    title: "VANTAGE",
    min: 250,
    max: 500,
    minAmount: 250,
    maxAmount: 500,
    dailyRoi: 5.0,
    thirtyDaysRoi: 150,
    monthlyRoi: 150,
    totalRoi: 220,
    maxRoiCap: 220,
    iconType: "diamond",
    color: "#38BDF8",
    badgeText: "POPULAR TIER",
    presetAmounts: [250, 300, 400, 500],
    status: true,
  },
  {
    _id: "pkg-nexus",
    id: "pkg-nexus",
    category: "GLOBAL",
    categoryTitle: "GLOBAL PACKAGE PLAN",
    title: "NEXUS",
    min: 550,
    max: 2000,
    minAmount: 550,
    maxAmount: 2000,
    dailyRoi: 5.5,
    thirtyDaysRoi: 165,
    monthlyRoi: 165,
    totalRoi: 220,
    maxRoiCap: 220,
    iconType: "gem",
    color: "#00D2FF",
    badgeText: "VIP GROWTH",
    presetAmounts: [550, 800, 1200, 1600, 2000],
    status: true,
  },

  // ── 2. ADVANCED PACKAGE OPTIONS ──
  {
    _id: "pkg-prime",
    id: "pkg-prime",
    category: "ADVANCED",
    categoryTitle: "ADVANCED PACKAGE OPTIONS",
    title: "PRIME",
    min: 2500,
    max: 5000,
    minAmount: 2500,
    maxAmount: 5000,
    dailyRoi: 6.0,
    thirtyDaysRoi: 180,
    monthlyRoi: 180,
    totalRoi: 220,
    maxRoiCap: 220,
    iconType: "crown",
    color: "#EAB308",
    badgeText: "ADVANCED",
    presetAmounts: [2500, 3000, 4000, 5000],
    status: true,
  },
  {
    _id: "pkg-titan",
    id: "pkg-titan",
    category: "ADVANCED",
    categoryTitle: "ADVANCED PACKAGE OPTIONS",
    title: "TITAN",
    min: 5500,
    max: 10000,
    minAmount: 5500,
    maxAmount: 10000,
    dailyRoi: 6.5,
    thirtyDaysRoi: 195,
    monthlyRoi: 195,
    totalRoi: 220,
    maxRoiCap: 220,
    iconType: "flame",
    color: "#F97316",
    badgeText: "HIGH YIELD",
    presetAmounts: [5500, 6500, 8000, 10000],
    status: true,
  },
  {
    _id: "pkg-infinity",
    id: "pkg-infinity",
    category: "ADVANCED",
    categoryTitle: "ADVANCED PACKAGE OPTIONS",
    title: "INFINITY",
    min: 10500,
    max: 25000,
    minAmount: 10500,
    maxAmount: 25000,
    dailyRoi: 7.5,
    thirtyDaysRoi: 220,
    monthlyRoi: 220,
    totalRoi: 220,
    maxRoiCap: 220,
    iconType: "infinity",
    color: "#A855F7",
    badgeText: "MAXIMUM RETURN",
    presetAmounts: [10500, 15000, 20000, 25000],
    status: true,
  },
];

const InvestmentPage = () => {
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [plans, setPlans] = useState(NODEXAI_PACKAGES);
  const [filterTab, setFilterTab] = useState("ALL"); // ALL, GLOBAL, ADVANCED

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPlan(null);
  };

  const fetchPackageInfo = async () => {
    try {
      dispatch(setLoading(true));
      const response = await getPackageInfo();
      const rawPlans = response?.data || response?.packages || response;

      if (rawPlans && Array.isArray(rawPlans) && rawPlans.length > 0) {
        // Merge API packages with frontend tier definitions
        const mapped = NODEXAI_PACKAGES.map((vPkg) => {
          const apiMatch = rawPlans.find(
            (p) =>
              (p.title && p.title.toUpperCase() === vPkg.title) ||
              (p.id && p.id === vPkg.id) ||
              (p.minAmount === vPkg.min && p.maxAmount === vPkg.max)
          );
          if (apiMatch) {
            return {
              ...vPkg,
              _id: apiMatch._id || vPkg._id,
              id: apiMatch.id || apiMatch._id || vPkg.id,
              status: apiMatch.status !== false,
            };
          }
          return vPkg;
        });
        setPlans(mapped);
      } else {
        setPlans(NODEXAI_PACKAGES);
      }
    } catch (error) {
      console.warn("Using default NODEXAI packages:", error);
      setPlans(NODEXAI_PACKAGES);
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    fetchPackageInfo();
  }, []);

  const globalPlans = plans.filter((p) => p.category === "GLOBAL");
  const advancedPlans = plans.filter((p) => p.category === "ADVANCED");

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
            Investment Plans
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Choose a verified trading package to earn between 4.5% and 7.5% daily ROI with instant decentralized USDT settlements.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="inline-flex p-1 rounded-2xl bg-[#030d1d] border border-cyan-500/20 backdrop-blur-md">
          <button
            onClick={() => setFilterTab("ALL")}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
              filterTab === "ALL"
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_15px_rgba(0,210,255,0.4)]"
                : "text-slate-400 hover:text-white"
            }`}
          >
            All (6)
          </button>
          <button
            onClick={() => setFilterTab("GLOBAL")}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
              filterTab === "GLOBAL"
                ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Global ($10 - $2K)
          </button>
          <button
            onClick={() => setFilterTab("ADVANCED")}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all cursor-pointer ${
              filterTab === "ADVANCED"
                ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Advanced ($2.5K - $25K)
          </button>
        </div>
      </div>

      {/* Top Banner: MAXIMUM ROI CAP 220% */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#071938] via-[#05142f] to-[#041026] border border-cyan-500/30 p-5 sm:p-6 shadow-[0_0_30px_rgba(0,210,255,0.15)] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-amber-400 p-0.5 shadow-[0_0_20px_rgba(0,210,255,0.5)] shrink-0">
            <div className="w-full h-full rounded-2xl bg-[#030d1d] flex items-center justify-center">
              <Rocket className="w-7 h-7 text-amber-300" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-black text-white font-['Orbitron',monospace] tracking-wider">
                MAXIMUM ROI CAP
              </span>
              <span className="px-2.5 py-0.5 rounded-lg bg-amber-400/20 border border-amber-400/40 text-amber-300 font-mono text-base font-black">
                220%
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              All packages earn daily ROI until reaching the 220% total return ceiling. Any package of $500 or higher automatically unlocks all 10 Level Community Income tiers.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] text-slate-400 font-mono uppercase">Minimum Investment</p>
            <p className="text-lg font-black text-cyan-300 font-mono">$10 USDT</p>
          </div>
        </div>
      </div>

      {/* ═══════════ SECTION 1: GLOBAL PACKAGE PLAN ═══════════ */}
      {(filterTab === "ALL" || filterTab === "GLOBAL") && (
        <section className="space-y-6">
          <div className="flex items-center gap-3 border-b border-cyan-500/15 pb-3">
            <span className="w-2.5 h-7 rounded-full bg-gradient-to-b from-amber-400 to-cyan-400" />
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider font-['Orbitron',monospace]">
                GLOBAL PACKAGE PLAN
              </h2>
              <p className="text-xs text-slate-400">
                Accessible entry plans from $10 to $2,000 with 4.5% – 5.5% daily yields.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {globalPlans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} onSelect={handleSelectPlan} />
            ))}
          </div>
        </section>
      )}

      {/* ═══════════ SECTION 2: ADVANCED PACKAGE OPTIONS ═══════════ */}
      {(filterTab === "ALL" || filterTab === "ADVANCED") && (
        <section className="space-y-6 pt-4">
          <div className="flex items-center gap-3 border-b border-cyan-500/15 pb-3">
            <span className="w-2.5 h-7 rounded-full bg-gradient-to-b from-amber-400 via-orange-500 to-purple-500" />
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider font-['Orbitron',monospace]">
                ADVANCED PACKAGE OPTIONS
              </h2>
              <p className="text-xs text-slate-400">
                High-yield institutional packages from $2,500 to $25,000 with 6.0% – 7.5% daily yields.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {advancedPlans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} onSelect={handleSelectPlan} />
            ))}
          </div>
        </section>
      )}

      {/* Bottom Floating Rocket Badge matching Image 2 */}
      <div className="pt-4 flex justify-center">
        <div className="inline-flex items-center gap-4 px-6 sm:px-10 py-3.5 rounded-full bg-gradient-to-r from-[#031533] via-[#05214d] to-[#031533] border-2 border-cyan-400/50 shadow-[0_0_35px_rgba(0,210,255,0.35)]">
          <Rocket className="w-6 h-6 text-amber-300 animate-bounce" />
          <span className="font-['Orbitron',monospace] font-black text-sm sm:text-base tracking-widest text-white uppercase">
            MAXIMUM ROI CAP
          </span>
          <span className="text-xl sm:text-2xl font-mono font-black text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]">
            220%
          </span>
        </div>
      </div>

      {/* Investment Modal */}
      {isModalOpen && (
        <InvestmentModal plan={selectedPlan} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default InvestmentPage;
