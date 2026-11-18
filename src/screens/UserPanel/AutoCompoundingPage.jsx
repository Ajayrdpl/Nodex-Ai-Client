import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import {
  RotateCcw,
  Sparkles,
  TrendingUp,
  Wallet,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  Layers,
  Award,
  Clock,
  AlertCircle,
  RefreshCw,
  Gift,
  HelpCircle,
  Zap,
} from "lucide-react";

import DataTable from "../../components/Screen/UserPanel/DataTable";
import StatCard from "../../components/Screen/UserPanel/StatCard";
import { setLoading } from "../../redux/slices/loadingSlice";
import {
  processCompoundApi,
  getCompoundingHistoryApi,
  getCompoundingSummaryApi,
} from "../../api/user.api";

const AutoCompoundingPage = () => {
  const dispatch = useDispatch();
  const [summary, setSummary] = useState(null);
  const [history, setHistory] = useState([]);
  const [compoundAmount, setCompoundAmount] = useState("");
  const [loading, setLocalLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  // Calculate live bonus (0.5%)
  const numAmount = Number(compoundAmount) || 0;
  const liveBonus = numAmount >= 10 ? parseFloat(((numAmount * 0.5) / 100).toFixed(4)) : 0;
  const liveTotalAdded = numAmount >= 10 ? parseFloat((numAmount + liveBonus).toFixed(4)) : 0;

  // Fetch Summary & History
  const loadData = useCallback(async (page = 1, isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else dispatch(setLoading(true));

      const [sumRes, histRes] = await Promise.all([
        getCompoundingSummaryApi(),
        getCompoundingHistoryApi({ page, limit: 10 }),
      ]);

      if (sumRes?.success) {
        setSummary(sumRes.data);
      }
      if (histRes?.success) {
        setHistory(histRes.data || []);
        if (histRes.pagination) {
          setPagination(histRes.pagination);
        }
      }

      if (isManual) {
        toast.success("Compounding data updated!");
      }
    } catch (err) {
      console.error("Error loading compounding data:", err);
      toast.error("Failed to load compounding data");
    } finally {
      if (isManual) setRefreshing(false);
      else dispatch(setLoading(false));
    }
  }, [dispatch]);

  useEffect(() => {
    loadData(1);
  }, [loadData]);

  // Handle Compounding Submission
  const handleCompoundSubmit = async (e) => {
    e.preventDefault();
    if (!numAmount || numAmount < 10) {
      toast.warn("Minimum compounding amount is $10");
      return;
    }

    const available = summary?.availableForCompounding || 0;
    if (numAmount > available) {
      toast.error(`Insufficient balance. You have $${available.toFixed(2)} available.`);
      return;
    }

    const result = await Swal.fire({
      title: "Confirm Auto Compounding?",
      html: `
        <div class="text-left text-sm space-y-2 text-slate-300">
          <p>Compound Amount: <strong class="text-white font-mono">$${numAmount.toLocaleString()}</strong></p>
          <p>Auto Bonus (0.5%): <strong class="text-emerald-400 font-mono">+$${liveBonus.toFixed(2)}</strong></p>
          <hr class="border-slate-700" />
          <p>Total Added to Active Balance: <strong class="text-amber-400 font-mono text-base">$${liveTotalAdded.toLocaleString()}</strong></p>
          <p class="text-xs text-slate-400 mt-2">✨ Compounded amount becomes part of your Active Balance and earns daily package ROI up to 220%.</p>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Compound Now",
      cancelButtonText: "Cancel",
      background: "#0d1322",
      color: "#fff",
      confirmButtonColor: "#f59e0b",
      cancelButtonColor: "#64748b",
    });

    if (!result.isConfirmed) return;

    try {
      setLocalLoading(true);
      const res = await processCompoundApi({ amount: numAmount });

      if (res?.success) {
        Swal.fire({
          title: "🎉 Compounding Successful!",
          html: `
            <p class="text-sm text-slate-300">
              Successfully compounded <strong>$${res.data?.compoundedAmount}</strong> +
              <span class="text-emerald-400 font-bold"> $${res.data?.bonus}</span> bonus!
            </p>
            <p class="text-base text-amber-400 font-bold mt-2">
              $${res.data?.totalAdded} added to Active Balance!
            </p>
            <p class="text-xs text-slate-400 mt-1">New Package: <strong class="text-white">${res.data?.newPackage}</strong></p>
          `,
          icon: "success",
          background: "#0d1322",
          color: "#fff",
          confirmButtonColor: "#f59e0b",
        });
        setCompoundAmount("");
        loadData(1);
      } else {
        toast.error(res?.message || "Compounding failed");
      }
    } catch (err) {
      toast.error(err?.message || "Server error");
    } finally {
      setLocalLoading(false);
    }
  };

  const handlePresetClick = (val) => {
    if (val === "MAX") {
      setCompoundAmount(String(Math.floor(summary?.availableForCompounding || 0)));
    } else {
      setCompoundAmount(String(val));
    }
  };

  // Table Columns
  const columns = [
    {
      header: "TX ID",
      accessor: "id",
      cell: (row) => (
        <span className="font-mono text-xs text-amber-400 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">
          {row.id || "CMP-AUTO"}
        </span>
      ),
    },
    {
      header: "Date & Time",
      accessor: "createdAt",
      cell: (row) => (
        <div className="text-xs text-slate-300">
          <div>{new Date(row.createdAt).toLocaleDateString()}</div>
          <div className="text-[10px] text-slate-500">{new Date(row.createdAt).toLocaleTimeString()}</div>
        </div>
      ),
    },
    {
      header: "Compound Amount",
      accessor: "amount",
      cell: (row) => (
        <span className="font-mono font-bold text-white text-xs">
          ${Number(row.amount || 0).toLocaleString()}
        </span>
      ),
    },
    {
      header: "Bonus (0.5%)",
      accessor: "income",
      cell: (row) => (
        <span className="font-mono font-bold text-emerald-400 text-xs flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          +${Number(row.income || 0).toFixed(4)}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      cell: () => (
        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 w-fit">
          <CheckCircle2 className="w-3 h-3" /> Added to Balance
        </span>
      ),
    },
    {
      header: "Remark",
      accessor: "remark",
      cell: (row) => (
        <span className="text-xs text-slate-400 truncate max-w-xs block">
          {row.remark || "Auto Compounding 0.5% Bonus"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* ── HEADER BANNER (NODEXAI Gold / Blue Theme) ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#071328] via-[#0b2149] to-[#081734] border border-amber-500/30 p-6 sm:p-8 shadow-[0_0_40px_rgba(245,158,11,0.15)]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Auto Compounding Bonus • 0.5% Extra
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <RotateCcw className="w-8 h-8 text-amber-400 animate-spin-slow" />
              Compound Anytime & Get Extra Bonus
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl mt-2 leading-relaxed">
              Participants can compound eligible amounts anytime according to platform rules and receive an additional{" "}
              <strong className="text-amber-400">0.5% Auto Compounding Bonus</strong> added directly to your Active Balance!
            </p>
          </div>

          <button
            onClick={() => loadData(1, true)}
            disabled={refreshing}
            className="self-start md:self-center inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-amber-400 ${refreshing ? "animate-spin" : ""}`} />
            Refresh Data
          </button>
        </div>
      </div>

      {/* ── STATS CARDS ROW ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Available for Compounding"
          value={`$${Number(summary?.availableForCompounding || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle="From your Income Wallet"
          icon={<Wallet className="w-6 h-6 text-amber-400" />}
          gradient="from-amber-500/15 via-slate-900 to-slate-900"
          border="border-amber-500/40"
        />

        <StatCard
          title="Total Compounded"
          value={`$${Number(summary?.totalCompounded || 0).toLocaleString()}`}
          subtitle="Cumulative amount compounded"
          icon={<RotateCcw className="w-6 h-6 text-sky-400" />}
          gradient="from-sky-500/15 via-slate-900 to-slate-900"
          border="border-sky-500/40"
        />

        <StatCard
          title="0.5% Bonus Earned"
          value={`+$${Number(summary?.totalBonusEarned || 0).toFixed(2)}`}
          subtitle="Free extra bonus added"
          icon={<Gift className="w-6 h-6 text-emerald-400" />}
          gradient="from-emerald-500/15 via-slate-900 to-slate-900"
          border="border-emerald-500/40"
        />

        <StatCard
          title="Active Balance & Package"
          value={`$${Number(summary?.currentActiveInvestment || 0).toLocaleString()}`}
          subtitle={`Current Tier: ${summary?.currentPackage || "NOVA"}`}
          icon={<Layers className="w-6 h-6 text-purple-400" />}
          gradient="from-purple-500/15 via-slate-900 to-slate-900"
          border="border-purple-500/40"
        />
      </div>

      {/* ── MAIN COMPOUNDING FORM & EXAMPLES ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Interactive Compounding Calculator & Action Form (7 Cols) */}
        <div className="lg:col-span-7 bg-[#0b1529]/90 border border-slate-800 rounded-2xl p-6 sm:p-7 relative overflow-hidden backdrop-blur-md shadow-xl">
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Execute Auto Compounding</h3>
                <p className="text-xs text-slate-400">Instant transfer from Income Wallet to Active Balance</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              +0.5% BONUS
            </span>
          </div>

          <form onSubmit={handleCompoundSubmit} className="space-y-5">
            {/* Amount Input */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold text-slate-300">Compounding Amount (USD)</label>
                <span className="text-xs text-slate-400">
                  Available:{" "}
                  <strong className="text-amber-400 font-mono">
                    ${Number(summary?.availableForCompounding || 0).toFixed(2)}
                  </strong>
                </span>
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <DollarSign className="w-5 h-5" />
                </div>
                <input
                  type="number"
                  min="10"
                  step="any"
                  placeholder="Enter amount (min $10)"
                  value={compoundAmount}
                  onChange={(e) => setCompoundAmount(e.target.value)}
                  className="w-full pl-10 pr-24 py-3 bg-[#070e1c] border border-slate-700 focus:border-amber-500 rounded-xl text-white font-mono text-base outline-none transition-all placeholder:text-slate-600"
                />
                <button
                  type="button"
                  onClick={() => handlePresetClick("MAX")}
                  className="absolute inset-y-1.5 right-1.5 px-3 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all cursor-pointer"
                >
                  MAX
                </button>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-2">
              <span className="text-[11px] text-slate-400 self-center mr-1">Quick Select:</span>
              {[10, 50, 100, 250, 500, 1000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handlePresetClick(amt)}
                  className="px-2.5 py-1 text-xs rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 font-mono transition-all cursor-pointer"
                >
                  ${amt}
                </button>
              ))}
            </div>

            {/* Live Calculation Preview Card */}
            {numAmount >= 10 && (
              <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 via-slate-900/60 to-slate-900/60 border border-amber-500/30 space-y-2.5 animate-fadeIn">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Compounding Principal:</span>
                  <span className="font-mono text-white font-semibold">${numAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-emerald-400 font-medium flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> 0.5% Auto Bonus:
                  </span>
                  <span className="font-mono text-emerald-400 font-bold">+${liveBonus.toFixed(2)}</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                  <span className="text-xs font-bold text-white">Total Added to Active Balance:</span>
                  <span className="font-mono text-base font-extrabold text-amber-400">
                    ${liveTotalAdded.toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {/* Submit CTA Button */}
            <button
              type="submit"
              disabled={loading || numAmount < 10 || numAmount > (summary?.availableForCompounding || 0)}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-extrabold text-sm tracking-wide shadow-[0_0_25px_rgba(245,158,11,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Processing Compounding...
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4" />
                  Compound ${numAmount >= 10 ? numAmount.toLocaleString() : "Now"} + 0.5% Bonus
                </>
              )}
            </button>
          </form>

          {/* Key Rule Footnote */}
          <div className="mt-4 flex items-start gap-2 text-[11px] text-slate-400 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              Minimum compounding is <strong>$10</strong>. Applicable package ROI continues according to the package and
              remains subject to the overall <strong>220% Maximum ROI Cap</strong>.
            </span>
          </div>
        </div>

        {/* Right Col: Official Rules & Image Examples Showcase (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Example 01 & Example 02 Cards (from Image 8) */}
          <div className="bg-[#0b1529]/90 border border-slate-800 rounded-2xl p-5 backdrop-blur-md">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2 mb-3">
              <Award className="w-4 h-4" /> How Auto Compounding Works
            </h4>

            <div className="space-y-3">
              {/* Example 01 */}
              <div className="p-3.5 rounded-xl bg-[#070e1c] border border-sky-500/30">
                <div className="text-[10px] font-bold uppercase text-sky-400 mb-1">Example 01</div>
                <div className="flex justify-between text-xs py-0.5 text-slate-300">
                  <span>Compound Amount:</span>
                  <span className="font-mono font-bold text-white">$100</span>
                </div>
                <div className="flex justify-between text-xs py-0.5 text-emerald-400">
                  <span>Compounding Bonus (0.5%):</span>
                  <span className="font-mono font-bold">+$0.50</span>
                </div>
                <div className="flex justify-between text-xs pt-1.5 mt-1 border-t border-slate-800 text-amber-400 font-bold">
                  <span>Added to Active Balance:</span>
                  <span className="font-mono font-extrabold">$100.50</span>
                </div>
              </div>

              {/* Example 02 */}
              <div className="p-3.5 rounded-xl bg-[#070e1c] border border-amber-500/30">
                <div className="text-[10px] font-bold uppercase text-amber-400 mb-1">Example 02</div>
                <div className="flex justify-between text-xs py-0.5 text-slate-300">
                  <span>Compound Amount:</span>
                  <span className="font-mono font-bold text-white">$1,000</span>
                </div>
                <div className="flex justify-between text-xs py-0.5 text-emerald-400">
                  <span>Compounding Bonus (0.5%):</span>
                  <span className="font-mono font-bold">+$5.00</span>
                </div>
                <div className="flex justify-between text-xs pt-1.5 mt-1 border-t border-slate-800 text-amber-400 font-bold">
                  <span>Added to Active Balance:</span>
                  <span className="font-mono font-extrabold">$1,005</span>
                </div>
              </div>
            </div>
          </div>

          {/* Key Features List (from Image 7) */}
          <div className="bg-[#0b1529]/90 border border-slate-800 rounded-2xl p-5 backdrop-blur-md">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Key Features
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Compounding Available Anytime 24/7</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Auto Compounding Bonus 0.5% extra credited instantly</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Bonus automatically added to the compounded amount</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Compounded amount becomes part of Active Balance</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Applicable daily ROI continues according to the package</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Maximum 220% ROI rules continue to apply</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── COMPOUNDING HISTORY TABLE ── */}
      <div className="bg-[#0b1529]/90 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800 mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" /> Compounding History
            </h3>
            <p className="text-xs text-slate-400">All past compounding transactions and 0.5% bonuses received</p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Total Records: <strong className="text-white">{pagination.total || history.length}</strong>
          </span>
        </div>

        <DataTable
          columns={columns}
          data={history}
          noDataMessage="No compounding transactions yet. Enter an amount above to compound and earn a 0.5% bonus!"
        />

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-between items-center pt-4 border-t border-slate-800 mt-4 text-xs">
            <button
              onClick={() => loadData(Math.max(1, pagination.page - 1))}
              disabled={pagination.page <= 1}
              className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 disabled:opacity-40 cursor-pointer"
            >
              Previous
            </button>
            <span className="text-slate-400 font-mono">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => loadData(Math.min(pagination.totalPages, pagination.page + 1))}
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 disabled:opacity-40 cursor-pointer"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AutoCompoundingPage;

