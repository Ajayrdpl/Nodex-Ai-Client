import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setLoading } from "../../redux/slices/loadingSlice";
import PlanCard from "../../components/Screen/UserPanel/PlanCard";
import {
  getPlanInfoAdmin,
  updatePlanAdmin,
  createPlanAdmin,
  deletePlanAdmin,
} from "../../api/admin.api";
import { getMoneySymbol } from "../../utils/additionalFunc";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import DataTable from "../../components/Screen/UserPanel/DataTable";
import { NODEXAI_PACKAGES } from "../UserPanel/InvestmentPage";
import {
  Sparkles,
  Rocket,
  Plus,
  RefreshCw,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Coins,
  Calendar,
} from "lucide-react";

const PLAN_PRESETS = {
  NOVA: {
    planType: "NOVA",
    title: "NOVA",
    category: "GLOBAL PACKAGE PLAN",
    minAmount: 10,
    maxAmount: 200,
    dailyRoi: 4.5,
    thirtyDaysRoi: 135,
    totalRoi: 220,
    duration: 49,
    lockPeriod: 30,
    isStaked: false,
    status: true,
  },
  VANTAGE: {
    planType: "VANTAGE",
    title: "VANTAGE",
    category: "GLOBAL PACKAGE PLAN",
    minAmount: 250,
    maxAmount: 500,
    dailyRoi: 5.0,
    thirtyDaysRoi: 150,
    totalRoi: 220,
    duration: 44,
    lockPeriod: 30,
    isStaked: false,
    status: true,
  },
  NEXUS: {
    planType: "NEXUS",
    title: "NEXUS",
    category: "GLOBAL PACKAGE PLAN",
    minAmount: 550,
    maxAmount: 2000,
    dailyRoi: 5.5,
    thirtyDaysRoi: 165,
    totalRoi: 220,
    duration: 40,
    lockPeriod: 30,
    isStaked: false,
    status: true,
  },
  PRIME: {
    planType: "PRIME",
    title: "PRIME",
    category: "ADVANCED PACKAGE OPTIONS",
    minAmount: 2500,
    maxAmount: 5000,
    dailyRoi: 6.0,
    thirtyDaysRoi: 180,
    totalRoi: 220,
    duration: 37,
    lockPeriod: 30,
    isStaked: false,
    status: true,
  },
  TITAN: {
    planType: "TITAN",
    title: "TITAN",
    category: "ADVANCED PACKAGE OPTIONS",
    minAmount: 5500,
    maxAmount: 10000,
    dailyRoi: 6.5,
    thirtyDaysRoi: 195,
    totalRoi: 220,
    duration: 34,
    lockPeriod: 30,
    isStaked: false,
    status: true,
  },
  INFINITY: {
    planType: "INFINITY",
    title: "INFINITY",
    category: "ADVANCED PACKAGE OPTIONS",
    minAmount: 10500,
    maxAmount: 25000,
    dailyRoi: 7.5,
    thirtyDaysRoi: 220,
    totalRoi: 220,
    duration: 30,
    lockPeriod: 30,
    isStaked: false,
    status: true,
  },
  CUSTOM: {
    planType: "CUSTOM",
    title: "",
    category: "GLOBAL PACKAGE PLAN",
    minAmount: 10,
    maxAmount: 1000,
    dailyRoi: 5.0,
    thirtyDaysRoi: 150,
    totalRoi: 220,
    duration: 30,
    lockPeriod: 30,
    isStaked: false,
    status: true,
  },
};

const ManagePlans = () => {
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [plans, setPlans] = useState([]);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [viewType, setViewType] = useState("grid"); // 'grid' or 'table'
  const [activeTab, setActiveTab] = useState("ALL"); // ALL, GLOBAL, ADVANCED

  const [formData, setFormData] = useState({
    planType: "NOVA",
    title: "NOVA",
    category: "GLOBAL PACKAGE PLAN",
    duration: 49,
    minAmount: 10,
    maxAmount: 200,
    dailyRoi: 4.5,
    thirtyDaysRoi: 135,
    totalRoi: 220,
    isStaked: false,
    lockPeriod: 30,
    status: true,
  });

  const fetchPlans = async () => {
    try {
      dispatch(setLoading(true));
      const response = await getPlanInfoAdmin();
      const rawPlans = response?.data || [];

      if (rawPlans && Array.isArray(rawPlans) && rawPlans.length > 0) {
        const transformedPlans = rawPlans.map((plan) => {
          const type = (plan.planType || plan.title || "NOVA").toUpperCase();
          const category =
            plan.category ||
            (["NOVA", "VANTAGE", "NEXUS"].includes(type)
              ? "GLOBAL PACKAGE PLAN"
              : "ADVANCED PACKAGE OPTIONS");

          const thirtyDaysRoi =
            plan.thirtyDaysRoi ||
            (type === "NOVA"
              ? 135
              : type === "VANTAGE"
              ? 150
              : type === "NEXUS"
              ? 165
              : type === "PRIME"
              ? 180
              : type === "TITAN"
              ? 195
              : type === "INFINITY"
              ? 220
              : parseFloat((plan.dailyRoi * 30).toFixed(2)));

          return {
            _id: plan._id,
            id: plan.id || plan._id,
            planType: type,
            title: plan.title || type,
            category,
            min: plan.minAmount,
            max: plan.maxAmount,
            minAmount: plan.minAmount,
            maxAmount: plan.maxAmount,
            duration: plan.duration,
            dailyRoi: plan.dailyRoi,
            thirtyDaysRoi,
            monthlyRoi: thirtyDaysRoi,
            totalRoi: plan.totalRoi || 220,
            maxRoiCap: 220,
            isStaked: plan.isStaked || false,
            lockPeriod: plan.lockPeriod || 30,
            status: plan.status !== false,
            features: [
              `Daily ROI: ${plan.dailyRoi}%`,
              `Investment: $${plan.minAmount} – $${plan.maxAmount || "Above"}`,
              `30 Days ROI: ${thirtyDaysRoi}%`,
              `Maximum ROI Cap: 220%`,
              plan.minAmount >= 500
                ? "⭐ All 10 Levels Auto-Unlocked"
                : "Eligible for 10-Level Community Income",
            ],
          };
        });

        setPlans(transformedPlans);
      } else {
        // Fallback to the 6 NODEXAI plans if database is currently empty
        setPlans(
          NODEXAI_PACKAGES.map((p) => ({
            ...p,
            planType: p.title,
            duration: p.title === "NOVA" ? 49 : p.title === "VANTAGE" ? 44 : p.title === "NEXUS" ? 40 : p.title === "PRIME" ? 37 : p.title === "TITAN" ? 34 : 30,
            lockPeriod: 30,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
      toast.error("Failed to fetch plans from server");
      setPlans(NODEXAI_PACKAGES);
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
    setIsCreateMode(false);
    setFormData({
      planType: plan.planType || "NOVA",
      title: plan.title || "NOVA",
      category: plan.category || "GLOBAL PACKAGE PLAN",
      duration: plan.duration || 30,
      minAmount: plan.min || plan.minAmount || 10,
      maxAmount: plan.max || plan.maxAmount || 200,
      dailyRoi: plan.dailyRoi || 4.5,
      thirtyDaysRoi: plan.thirtyDaysRoi || 135,
      totalRoi: plan.totalRoi || 220,
      isStaked: plan.isStaked || false,
      lockPeriod: plan.lockPeriod || 30,
      status: plan.status !== false,
    });
  };

  const handleCreateNew = () => {
    setSelectedPlan(null);
    setIsModalOpen(true);
    setIsCreateMode(true);
    setFormData(PLAN_PRESETS.NOVA);
  };

  const handlePresetSelect = (presetKey) => {
    const preset = PLAN_PRESETS[presetKey] || PLAN_PRESETS.CUSTOM;
    setFormData((prev) => ({
      ...prev,
      ...preset,
    }));
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPlan(null);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };

      // Auto recalculate 30 days ROI if dailyRoi changes
      if (name === "dailyRoi") {
        const dRoi = parseFloat(value) || 0;
        updated.thirtyDaysRoi = parseFloat((dRoi * 30).toFixed(2));
      }
      return updated;
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || formData.minAmount === "" || formData.dailyRoi === "") {
      toast.error("Please fill all required fields");
      return;
    }

    const payload = {
      planType: formData.planType,
      title: formData.title.trim(),
      category: formData.category,
      minAmount: parseFloat(formData.minAmount),
      maxAmount: formData.maxAmount ? parseFloat(formData.maxAmount) : null,
      dailyRoi: parseFloat(formData.dailyRoi),
      thirtyDaysRoi: parseFloat(formData.thirtyDaysRoi) || parseFloat(formData.dailyRoi) * 30,
      totalRoi: 220,
      duration: parseInt(formData.duration) || 30,
      lockPeriod: parseInt(formData.lockPeriod) || 30,
      isStaked: Boolean(formData.isStaked),
      status: Boolean(formData.status),
    };

    try {
      dispatch(setLoading(true));
      let res;
      if (isCreateMode) {
        res = await createPlanAdmin(payload);
      } else {
        res = await updatePlanAdmin(selectedPlan._id || selectedPlan.id, payload);
      }

      if (res?.success) {
        toast.success(res.message || "Plan saved successfully");
        handleCloseModal();
        fetchPlans();
      } else {
        toast.error(res?.message || "Operation failed");
      }
    } catch (error) {
      toast.error(error.message || "Operation failed");
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleDeletePlan = async (id) => {
    const result = await Swal.fire({
      title: "Delete Plan?",
      text: "Are you sure you want to delete this plan from the database?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#64748B",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        dispatch(setLoading(true));
        const res = await deletePlanAdmin(id);
        if (res?.success) {
          toast.success(res.message || "Plan deleted successfully");
          fetchPlans();
        } else {
          toast.error(res?.message || "Deletion failed");
        }
      } catch (error) {
        toast.error("Deletion failed");
      } finally {
        dispatch(setLoading(false));
      }
    }
  };

  // One-click batch sync of the 6 official NODEXAI plans to MongoDB
  const handleBatchSyncPlans = async () => {
    const result = await Swal.fire({
      title: "Sync Official 6 Plans?",
      text: "This will create/sync NOVA, VANTAGE, NEXUS, PRIME, TITAN, and INFINITY in the MongoDB database.",
      icon: "info",
      showCancelButton: true,
      confirmButtonColor: "#00D2FF",
      cancelButtonColor: "#64748B",
      confirmButtonText: "Yes, Sync Now!",
    });

    if (result.isConfirmed) {
      try {
        dispatch(setLoading(true));
        let successCount = 0;

        for (const key of ["NOVA", "VANTAGE", "NEXUS", "PRIME", "TITAN", "INFINITY"]) {
          const planData = PLAN_PRESETS[key];
          try {
            await createPlanAdmin(planData);
            successCount++;
          } catch {
            // Plan might already exist, continue
          }
        }

        toast.success(`Synced ${successCount} plans to database successfully!`);
        fetchPlans();
      } catch (err) {
        toast.error("Sync failed: " + err.message);
      } finally {
        dispatch(setLoading(false));
      }
    }
  };

  const filteredPlans =
    activeTab === "ALL"
      ? plans
      : activeTab === "GLOBAL"
      ? plans.filter((p) => (p.category || "").includes("GLOBAL") || ["NOVA", "VANTAGE", "NEXUS"].includes(p.planType))
      : plans.filter((p) => (p.category || "").includes("ADVANCED") || ["PRIME", "TITAN", "INFINITY"].includes(p.planType));

  const columns = [
    {
      header: "S/N",
      accessor: "_id",
      cell: (_, rowIndex) => (
        <span className="font-mono text-slate-400 text-xs">{rowIndex + 1}</span>
      ),
    },
    {
      header: "Plan Package",
      accessor: "title",
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-extrabold text-white text-sm font-['Orbitron',monospace]">
            {row.title}
          </span>
          <span className="text-[10px] text-cyan-400 font-mono">
            {row.category || "NODEXAI Package"}
          </span>
        </div>
      ),
    },
    {
      header: "Investment Range",
      accessor: "min",
      cell: (row) => (
        <span className="font-mono font-bold text-white text-xs">
          ${row.min?.toLocaleString()} – {row.max ? `$${row.max.toLocaleString()}` : "Above"}
        </span>
      ),
    },
    {
      header: "Daily ROI",
      accessor: "dailyRoi",
      cell: (row) => (
        <span className="font-mono font-black text-cyan-300 text-sm">
          {row.dailyRoi}% / day
        </span>
      ),
    },
    {
      header: "30 Days ROI",
      accessor: "thirtyDaysRoi",
      cell: (row) => (
        <span className="font-mono font-black text-amber-300 text-sm">
          {row.thirtyDaysRoi}%
        </span>
      ),
    },
    {
      header: "Max Cap",
      accessor: "totalRoi",
      cell: () => (
        <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-mono font-bold text-xs border border-emerald-500/30">
          220% Max
        </span>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      cell: (row) => (
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
            row.status
              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
              : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
          }`}
        >
          {row.status ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
          <span>{row.status ? "Active" : "Inactive"}</span>
        </span>
      ),
    },
    {
      header: "Actions",
      accessor: "actions",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSelectPlan(row)}
            className="p-2 rounded-xl bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/30 hover:text-white transition-all cursor-pointer border border-cyan-500/30"
            title="Edit Plan"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleDeletePlan(row._id || row.id)}
            className="p-2 rounded-xl bg-rose-500/15 text-rose-400 hover:bg-rose-500/30 hover:text-white transition-all cursor-pointer border border-rose-500/30"
            title="Delete Plan"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8 pt-4 pb-12 text-white">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-[#030d1d] p-6 md:p-8 rounded-3xl border border-cyan-500/20 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 blur-3xl -z-10 pointer-events-none" />

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-cyan-500/10 text-cyan-300 rounded-full text-[10px] font-black uppercase tracking-widest border border-cyan-500/30 font-mono flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-400" /> ADMIN MANAGEMENT CONSOLE
            </span>
            <span className="px-3 py-1 bg-amber-500/10 text-amber-300 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-500/30 font-mono">
              DYNAMIC DATABASE PLANS
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-['Orbitron',monospace] tracking-wider">
            Manage Investment Plans
          </h1>
          <p className="text-slate-400 text-sm max-w-2xl">
            Live dynamic configuration of NOVA, VANTAGE, NEXUS, PRIME, TITAN, and INFINITY packages. All edits persist directly to MongoDB.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={handleBatchSyncPlans}
            className="px-4 py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/40 text-amber-300 text-xs font-bold font-mono transition-all flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.2)]"
            title="Sync the 6 official NODEXAI plans to MongoDB"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Sync Default Plans</span>
          </button>

          {/* View Toggle */}
          <div className="bg-[#020714] p-1 rounded-2xl border border-cyan-500/20 flex backdrop-blur-md">
            <button
              onClick={() => setViewType("grid")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer ${
                viewType === "grid"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setViewType("table")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer ${
                viewType === "table"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Table
            </button>
          </div>

          <button
            onClick={handleCreateNew}
            className="bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-400 hover:brightness-110 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(0,210,255,0.35)] flex items-center gap-2 active:scale-95 cursor-pointer font-['Orbitron',monospace]"
          >
            <Plus className="w-4 h-4" />
            <span>New Plan</span>
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-hide no-scrollbar">
        <button
          onClick={() => setActiveTab("ALL")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer border ${
            activeTab === "ALL"
              ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(0,210,255,0.25)]"
              : "bg-[#030d1d] border-cyan-500/10 text-slate-400 hover:text-white"
          }`}
        >
          All Plans ({plans.length})
        </button>
        <button
          onClick={() => setActiveTab("GLOBAL")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer border ${
            activeTab === "GLOBAL"
              ? "bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.25)]"
              : "bg-[#030d1d] border-cyan-500/10 text-slate-400 hover:text-white"
          }`}
        >
          Global Plans ($10 – $2,000)
        </button>
        <button
          onClick={() => setActiveTab("ADVANCED")}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer border ${
            activeTab === "ADVANCED"
              ? "bg-purple-500/20 border-purple-400 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.25)]"
              : "bg-[#030d1d] border-cyan-500/10 text-slate-400 hover:text-white"
          }`}
        >
          Advanced Options ($2,500 – $25,000)
        </button>
      </div>

      {/* Main Content View */}
      {viewType === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPlans.map((plan) => (
            <div key={plan._id || plan.id} className="relative group">
              <PlanCard plan={plan} onSelect={() => handleSelectPlan(plan)} isAdmin={true} />
              <div className="absolute top-4 right-4 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <button
                  onClick={() => handleSelectPlan(plan)}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white p-2 rounded-xl transition-all shadow-lg cursor-pointer"
                  title="Edit Plan"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeletePlan(plan._id || plan.id)}
                  className="bg-rose-600 hover:bg-rose-500 text-white p-2 rounded-xl transition-all shadow-lg cursor-pointer"
                  title="Delete Plan"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#030d1d] rounded-3xl border border-cyan-500/20 p-4 sm:p-6 shadow-2xl">
          <DataTable data={filteredPlans} columns={columns} />
        </div>
      )}

      {/* Create / Edit Plan Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#030d1d] border border-cyan-500/30 p-6 sm:p-8 rounded-3xl shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto space-y-5 text-white">
            <div className="flex justify-between items-start border-b border-cyan-500/15 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400">
                  NODEXAI Admin
                </span>
                <h2 className="text-2xl font-black text-white font-['Orbitron',monospace]">
                  {isCreateMode ? "Create New Plan" : `Edit Plan: ${selectedPlan?.title}`}
                </h2>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Preset Selector */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Quick Tier Preset</label>
                <select
                  name="planType"
                  value={formData.planType}
                  onChange={(e) => {
                    handleFormChange(e);
                    handlePresetSelect(e.target.value);
                  }}
                  className="w-full p-3 rounded-xl bg-[#020817] text-white border border-cyan-500/30 focus:border-cyan-400 outline-none text-xs sm:text-sm font-mono cursor-pointer"
                >
                  <option value="NOVA">NOVA (Global: $10 – $200 @ 4.5% Daily ROI, 135% 30 Days)</option>
                  <option value="VANTAGE">VANTAGE (Global: $250 – $500 @ 5.0% Daily ROI, 150% 30 Days)</option>
                  <option value="NEXUS">NEXUS (Global: $550 – $2,000 @ 5.5% Daily ROI, 165% 30 Days)</option>
                  <option value="PRIME">PRIME (Advanced: $2,500 – $5,000 @ 6.0% Daily ROI, 180% 30 Days)</option>
                  <option value="TITAN">TITAN (Advanced: $5,500 – $10,000 @ 6.5% Daily ROI, 195% 30 Days)</option>
                  <option value="INFINITY">INFINITY (Advanced: $10,500 – $25,000 @ 7.5% Daily ROI, 220% Max)</option>
                  <option value="CUSTOM">CUSTOM (Custom Investment Package)</option>
                </select>
              </div>

              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Plan Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleFormChange}
                    placeholder="e.g. NOVA"
                    className="w-full p-3 rounded-xl bg-[#020817] text-white border border-cyan-500/30 focus:border-cyan-400 outline-none text-sm font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleFormChange}
                    className="w-full p-3 rounded-xl bg-[#020817] text-white border border-cyan-500/30 focus:border-cyan-400 outline-none text-xs cursor-pointer"
                  >
                    <option value="GLOBAL PACKAGE PLAN">GLOBAL PACKAGE PLAN</option>
                    <option value="ADVANCED PACKAGE OPTIONS">ADVANCED PACKAGE OPTIONS</option>
                  </select>
                </div>
              </div>

              {/* Min & Max Amount */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Min Amount ($)</label>
                  <input
                    type="number"
                    name="minAmount"
                    value={formData.minAmount}
                    onChange={handleFormChange}
                    min="1"
                    className="w-full p-3 rounded-xl bg-[#020817] text-white border border-cyan-500/30 focus:border-cyan-400 outline-none text-sm font-mono font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Max Amount ($)</label>
                  <input
                    type="number"
                    name="maxAmount"
                    value={formData.maxAmount}
                    onChange={handleFormChange}
                    className="w-full p-3 rounded-xl bg-[#020817] text-white border border-cyan-500/30 focus:border-cyan-400 outline-none text-sm font-mono font-bold"
                  />
                </div>
              </div>

              {/* Daily ROI (%) & 30 Days ROI (%) */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Daily ROI (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    name="dailyRoi"
                    value={formData.dailyRoi}
                    onChange={handleFormChange}
                    className="w-full p-3 rounded-xl bg-[#020817] text-cyan-300 border border-cyan-500/30 focus:border-cyan-400 outline-none text-sm font-mono font-black"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">30 Days ROI (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    name="thirtyDaysRoi"
                    value={formData.thirtyDaysRoi}
                    onChange={handleFormChange}
                    className="w-full p-3 rounded-xl bg-[#020817] text-amber-300 border border-cyan-500/30 focus:border-cyan-400 outline-none text-sm font-mono font-black"
                  />
                </div>
              </div>

              {/* Total ROI Cap & Duration */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Max ROI Cap (%)</label>
                  <input
                    type="number"
                    name="totalRoi"
                    value={formData.totalRoi || 220}
                    onChange={handleFormChange}
                    className="w-full p-3 rounded-xl bg-[#020817] text-emerald-400 border border-cyan-500/30 focus:border-cyan-400 outline-none text-sm font-mono font-black"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Duration (Days)</label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleFormChange}
                    className="w-full p-3 rounded-xl bg-[#020817] text-white border border-cyan-500/30 focus:border-cyan-400 outline-none text-sm font-mono"
                  />
                </div>
              </div>

              {/* Status Toggle */}
              <div className="pt-2 flex items-center justify-between border-t border-cyan-500/15">
                <span className="text-xs text-slate-300 font-semibold">Active Status</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="status"
                    checked={formData.status}
                    onChange={handleFormChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="w-1/2 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-400 hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider transition shadow-[0_0_20px_rgba(0,210,255,0.35)] cursor-pointer font-['Orbitron',monospace]"
                >
                  {isCreateMode ? "Create Plan" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagePlans;
