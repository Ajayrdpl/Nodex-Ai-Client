import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setLoading } from "../../redux/slices/loadingSlice";
import InvestmentModal from "../../components/Screen/UserPanel/InvestmentModal";
import PlanCard from "../../components/Screen/UserPanel/PlanCard";
import { getPackageInfo } from "../../api/user.api";
import { getMoneySymbol } from "../../utils/additionalFunc";
import DataTable from "../../components/Screen/UserPanel/DataTable";
import { VELTRION_PACKAGES } from "./InvestmentPage";
import { Zap, ShieldCheck, TrendingUp, Sparkles, Rocket, Calendar, Trophy } from "lucide-react";

const InvestmentPlans = () => {
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [plans, setPlans] = useState(VELTRION_PACKAGES);
  const [viewType, setViewType] = useState("grid"); // 'grid' or 'table'
  const [activeTab, setActiveTab] = useState("ALL");

  const fetchPlanInfo = async () => {
    try {
      dispatch(setLoading(true));
      const response = await getPackageInfo();
      const rawPlans = response?.data || response?.packages || response;

      if (rawPlans && Array.isArray(rawPlans) && rawPlans.length > 0) {
        const mapped = VELTRION_PACKAGES.map((vPkg) => {
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
        setPlans(VELTRION_PACKAGES);
      }
    } catch (error) {
      console.warn("Using default Veltrion packages:", error);
      setPlans(VELTRION_PACKAGES);
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    fetchPlanInfo();
  }, []);

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPlan(null);
  };

  const filteredPlans =
    activeTab === "ALL"
      ? plans
      : activeTab === "GLOBAL"
      ? plans.filter((p) => p.category === "GLOBAL")
      : plans.filter((p) => p.category === "ADVANCED");

  const columns = [
    {
      header: "Plan Package",
      accessor: "title",
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-extrabold text-white text-base font-['Orbitron',monospace]">
            {row.title}
          </span>
          <span className="text-[11px] text-cyan-400 font-mono">
            {row.categoryTitle || row.category}
          </span>
        </div>
      ),
    },
    {
      header: "Daily Yield",
      accessor: "dailyRoi",
      cell: (row) => (
        <div className="flex flex-col">
          <span className="text-cyan-300 font-black text-base font-mono">
            {row.dailyRoi}% / day
          </span>
          <span className="text-[10px] text-slate-400">Credited every 24h</span>
        </div>
      ),
    },
    {
      header: "Investment Range",
      accessor: "min",
      cell: (row) => (
        <div className="flex flex-col">
          <span className="text-white font-bold text-sm font-mono">
            ${row.min?.toLocaleString()} – ${row.max?.toLocaleString()}
          </span>
          <span className="text-[10px] text-amber-300 font-medium">USDT (BEP-20)</span>
        </div>
      ),
    },
    {
      header: "30 Days ROI",
      accessor: "thirtyDaysRoi",
      cell: (row) => (
        <span className="text-amber-400 font-black text-base font-mono">
          {row.thirtyDaysRoi}%
        </span>
      ),
    },
    {
      header: "Return Cap",
      accessor: "totalRoi",
      cell: () => (
        <div className="flex items-center gap-1.5">
          <Rocket className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-emerald-400 font-black text-sm font-mono">
            220% Max
          </span>
        </div>
      ),
    },
    {
      header: "Action",
      accessor: "action",
      className: "text-right",
      cell: (row) => (
        <button
          onClick={() => handleSelectPlan(row)}
          className="bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-400 hover:brightness-110 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-cyan-500/20 active:scale-95 cursor-pointer font-['Orbitron',monospace]"
        >
          Invest Now
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-8 pt-2 pb-12 text-white">
      {/* Header section with branding */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 bg-[#030d1d] p-6 md:p-8 rounded-3xl border border-cyan-500/20 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 blur-3xl -z-10 pointer-events-none" />

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-cyan-500/10 text-cyan-300 rounded-full text-[10px] font-black uppercase tracking-widest border border-cyan-500/30 flex items-center gap-1.5 font-mono">
              <Sparkles className="w-3 h-3 text-amber-400" /> VELTRION CAPITAL
            </span>
            <span className="px-3 py-1 bg-amber-500/10 text-amber-300 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-500/30 font-mono">
              4.5% – 7.5% DAILY ROI • 220% CAP
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-wider font-['Orbitron',monospace]">
            Investment Packages
          </h1>
          <p className="text-slate-400 text-sm max-w-xl">
            Choose your trading package to receive automated daily USDT yields. Overall returns capped at 220% with instant settlements on BNB Smart Chain.
          </p>
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="bg-[#020714] p-1.5 rounded-2xl border border-cyan-500/20 flex backdrop-blur-md shadow-xl">
            <button
              onClick={() => setViewType("grid")}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 text-xs font-black uppercase tracking-wider cursor-pointer ${
                viewType === "grid"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>Cards</span>
            </button>
            <button
              onClick={() => setViewType("table")}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 text-xs font-black uppercase tracking-wider cursor-pointer ${
                viewType === "table"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
        <button
          onClick={() => setActiveTab("ALL")}
          className={`px-5 py-3 rounded-2xl flex items-center gap-2.5 transition-all duration-300 border-2 whitespace-nowrap text-xs font-black uppercase tracking-wider cursor-pointer ${
            activeTab === "ALL"
              ? "bg-gradient-to-r from-cyan-500/15 to-blue-600/15 border-cyan-400 text-cyan-300 shadow-[0_0_20px_rgba(0,210,255,0.2)]"
              : "bg-[#030d1d] border-cyan-500/10 text-slate-400 hover:text-white hover:border-cyan-500/30"
          }`}
        >
          <span>All Packages (6)</span>
        </button>
        <button
          onClick={() => setActiveTab("GLOBAL")}
          className={`px-5 py-3 rounded-2xl flex items-center gap-2.5 transition-all duration-300 border-2 whitespace-nowrap text-xs font-black uppercase tracking-wider cursor-pointer ${
            activeTab === "GLOBAL"
              ? "bg-gradient-to-r from-amber-500/15 to-yellow-600/15 border-amber-400 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
              : "bg-[#030d1d] border-cyan-500/10 text-slate-400 hover:text-white hover:border-cyan-500/30"
          }`}
        >
          <span>Global Package Plan ($10 - $2,000)</span>
        </button>
        <button
          onClick={() => setActiveTab("ADVANCED")}
          className={`px-5 py-3 rounded-2xl flex items-center gap-2.5 transition-all duration-300 border-2 whitespace-nowrap text-xs font-black uppercase tracking-wider cursor-pointer ${
            activeTab === "ADVANCED"
              ? "bg-gradient-to-r from-purple-500/15 to-indigo-600/15 border-purple-400 text-purple-300 shadow-[0_0_20px_rgba(168,85,247,0.2)]"
              : "bg-[#030d1d] border-cyan-500/10 text-slate-400 hover:text-white hover:border-cyan-500/30"
          }`}
        >
          <span>Advanced Package Options ($2,500 - $25,000)</span>
        </button>
      </div>

      {/* Content View */}
      {viewType === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPlans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} onSelect={handleSelectPlan} />
          ))}
        </div>
      ) : (
        <div className="bg-[#030d1d] rounded-3xl border border-cyan-500/20 overflow-hidden shadow-2xl p-4 sm:p-6">
          <DataTable columns={columns} data={filteredPlans} />
        </div>
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

export default InvestmentPlans;
