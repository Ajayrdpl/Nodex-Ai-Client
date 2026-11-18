import React, { useEffect, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import {
  Briefcase,
  Award,
  Crown,
  CheckCircle,
  Clock,
  Calendar,
  Copy,
  Check,
  RefreshCw,
  TrendingUp,
  Download,
  Target,
  Zap,
  ArrowRight,
  ShieldCheck,
  Layers,
  Sparkles,
  DollarSign,
} from "lucide-react";

import { setLoading } from "../../redux/slices/loadingSlice";
import {
  getSalaryHistoryApi,
  getMySalaryRankApi,
  getAllSalaryTiersApi,
} from "../../api/user.api";
import { getIncomeTotal } from "../../api/auth.api";
import DataTable from "../../components/Screen/UserPanel/DataTable";
import StatCard from "../../components/Screen/UserPanel/StatCard";

// 15 Ranks Reference Data (50%:30%:20% Matrix)
const SALARY_TIERS_DEFAULT = [
  { rank: 1, name: "Associate", target: 1000, weeklySalary: 10, weeks: 10, totalPayout: 100 },
  { rank: 2, name: "Senior Associate", target: 3000, weeklySalary: 20, weeks: 10, totalPayout: 200 },
  { rank: 3, name: "Executive", target: 5000, weeklySalary: 30, weeks: 10, totalPayout: 300 },
  { rank: 4, name: "Senior Executive", target: 10000, weeklySalary: 50, weeks: 10, totalPayout: 500 },
  { rank: 5, name: "Team Leader", target: 25000, weeklySalary: 100, weeks: 15, totalPayout: 1500 },
  { rank: 6, name: "Senior Team Leader", target: 50000, weeklySalary: 200, weeks: 15, totalPayout: 3000 },
  { rank: 7, name: "Assistant Manager", target: 75000, weeklySalary: 300, weeks: 20, totalPayout: 6000 },
  { rank: 8, name: "Manager", target: 100000, weeklySalary: 500, weeks: 15, totalPayout: 7500 },
  { rank: 9, name: "Senior Manager", target: 200000, weeklySalary: 750, weeks: 20, totalPayout: 15000 },
  { rank: 10, name: "Assistant Director", target: 500000, weeklySalary: 1000, weeks: 25, totalPayout: 25000 },
  { rank: 11, name: "Director", target: 1000000, weeklySalary: 2000, weeks: 25, totalPayout: 50000 },
  { rank: 12, name: "Senior Director", target: 2500000, weeklySalary: 3000, weeks: 25, totalPayout: 75000 },
  { rank: 13, name: "Vice President", target: 5000000, weeklySalary: 5000, weeks: 20, totalPayout: 100000 },
  { rank: 14, name: "Senior Vice President", target: 10000000, weeklySalary: 10000, weeks: 20, totalPayout: 200000 },
  { rank: 15, name: "President", target: 25000000, weeklySalary: 20000, weeks: 15, totalPayout: 300000 },
];

const UserSalaryIncome = () => {
  const dispatch = useDispatch();

  const [salaryRankData, setSalaryRankData] = useState(null);
  const [salaryHistory, setSalaryHistory] = useState([]);
  const [salarySummary, setSalarySummary] = useState({ totalIncome: 0, todayTotal: 0 });
  const [allTiers, setAllTiers] = useState(SALARY_TIERS_DEFAULT);
  const [copiedId, setCopiedId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSalaryData = useCallback(
    async (isManual = false) => {
      try {
        if (isManual) setRefreshing(true);
        else dispatch(setLoading(true));

        const [rankRes, historyRes, tiersRes, statsRes] = await Promise.allSettled([
          getMySalaryRankApi(),
          getSalaryHistoryApi({ page: 1, limit: 100 }),
          getAllSalaryTiersApi(),
          getIncomeTotal(),
        ]);

        const statsData = statsRes.status === "fulfilled" ? statsRes.value : {};
        const fallbackRank = statsData?.salaryRank || statsData?.data?.salaryRank || null;

        let rankData = {};
        if (rankRes.status === "fulfilled" && rankRes.value?.success) {
          rankData = rankRes.value?.data || fallbackRank || {};
          setSalaryRankData(rankData);
        } else if (fallbackRank) {
          rankData = fallbackRank;
          setSalaryRankData(fallbackRank);
        }

        let historyList = [];
        let totalIncomeFromHistory = 0;
        let todayIncomeFromHistory = 0;

        if (historyRes.status === "fulfilled" && historyRes.value?.success) {
          const resData = historyRes.value?.data || {};
          historyList = Array.isArray(resData?.history)
            ? resData.history
            : Array.isArray(resData?.salaryHistory)
            ? resData.salaryHistory
            : Array.isArray(resData)
            ? resData
            : [];
          totalIncomeFromHistory = Number(resData?.totalIncome ?? 0);
          todayIncomeFromHistory = Number(resData?.todayTotal ?? 0);
        }

        // Fallback to salaryHistory inside /salary/my-rank response if historyRes is empty
        if (historyList.length === 0 && Array.isArray(rankData?.salaryHistory) && rankData.salaryHistory.length > 0) {
          historyList = rankData.salaryHistory;
        }

        setSalaryHistory(historyList);

        const calculatedTotal = Number(
          totalIncomeFromHistory ||
          rankData?.salaryRankDetails?.totalSalaryPaid ||
          rankData?.totalIncome ||
          statsData?.data?.totalWeeklySalary ||
          statsData?.incomes?.weeklySalary?.total ||
          historyList.reduce((acc, curr) => acc + Number(curr.income || curr.amount || 0), 0)
        );

        const calculatedToday = Number(
          todayIncomeFromHistory ||
          statsData?.data?.todayWeeklySalary ||
          statsData?.incomes?.weeklySalary?.today ||
          0
        );

        setSalarySummary({
          totalIncome: calculatedTotal,
          todayTotal: calculatedToday,
        });

        // Merge tiers from tiersRes or rankData
        const rawTiers = (tiersRes.status === "fulfilled" && tiersRes.value?.success)
          ? (tiersRes.value?.data?.allTiers || tiersRes.value?.data?.tiers || tiersRes.value?.data || [])
          : (rankData?.allTiers || []);

        if (Array.isArray(rawTiers) && rawTiers.length > 0) {
          const merged = SALARY_TIERS_DEFAULT.map((def, idx) => {
            const fromApi = rawTiers.find((t) => t.rank === def.rank || t.name === def.name) || rawTiers[idx] || {};
            return {
              ...def,
              ...fromApi,
              rank: fromApi.rank || def.rank,
              name: fromApi.name || def.name,
              target: Number(fromApi.target ?? def.target),
              weeklySalary: Number(fromApi.weeklySalary ?? fromApi.weekly ?? def.weeklySalary),
              weeks: Number(fromApi.weeks ?? def.weeks),
              totalPayout: Number(fromApi.totalPayout ?? def.totalPayout),
            };
          });
          setAllTiers(merged);
        } else {
          setAllTiers(SALARY_TIERS_DEFAULT);
        }

        if (isManual) {
          toast.success("Weekly salary data refreshed!");
        }
      } catch (err) {
        console.error("Failed to load salary data:", err);
        toast.error("Failed to load weekly salary data");
      } finally {
        if (isManual) setRefreshing(false);
        else dispatch(setLoading(false));
      }
    },
    [dispatch]
  );

  useEffect(() => {
    fetchSalaryData();
  }, [fetchSalaryData]);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const exportCSV = () => {
    if (!salaryHistory || salaryHistory.length === 0) {
      toast.info("No salary records to export");
      return;
    }
    const headers = ["#", "Payout ID", "Date", "Payout Income ($)", "Level", "Status", "Remark"];
    const rows = salaryHistory.map((r, idx) => [
      idx + 1,
      r?.id || r?._id || "",
      r?.createdAt ? new Date(r.createdAt).toLocaleString() : "",
      Number(r?.income || r?.amount || 0).toFixed(2),
      r?.level || "1",
      r?.status || "Completed",
      `"${(r?.remark || "").replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Weekly_Salary_History_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Rank & Leg Matrix Calculations
  const currentRankNum = Number(salaryRankData?.currentRank ?? salaryRankData?.qualifiedRank ?? 0);
  const currentTier = salaryRankData?.currentTier || (currentRankNum > 0 ? allTiers[currentRankNum - 1] : null);
  const nextTier = salaryRankData?.nextTier || (currentRankNum < allTiers.length ? allTiers[currentRankNum] : allTiers[0]);

  const leg1 = Number(salaryRankData?.legBreakdown?.leg1Volume ?? salaryRankData?.leg1Volume ?? 0);
  const leg2 = Number(salaryRankData?.legBreakdown?.leg2Volume ?? salaryRankData?.leg2Volume ?? 0);
  const otherLegs = Number(salaryRankData?.legBreakdown?.otherLegsVolume ?? salaryRankData?.otherLegsVolume ?? 0);
  const effectiveBusiness = Number(salaryRankData?.effectiveBusiness ?? (leg1 + leg2 + otherLegs));

  const targetVolume = Number(nextTier?.target || 1000);
  const targetLeg1 = targetVolume * 0.5; // 50%
  const targetLeg2 = targetVolume * 0.3; // 30%
  const targetOther = targetVolume * 0.2; // 20%

  const progressLeg1 = targetLeg1 > 0 ? Math.min((leg1 / targetLeg1) * 100, 100) : 0;
  const progressLeg2 = targetLeg2 > 0 ? Math.min((leg2 / targetLeg2) * 100, 100) : 0;
  const progressOther = targetOther > 0 ? Math.min((otherLegs / targetOther) * 100, 100) : 0;
  const overallProgress = targetVolume > 0 ? Math.min((effectiveBusiness / targetVolume) * 100, 100) : 0;

  const rankDetails = salaryRankData?.salaryRankDetails || {};
  const currentTierWeeks = currentTier?.weeks || 10;
  const weeksRemaining = rankDetails?.weeksRemaining ?? (currentTier ? currentTierWeeks : 0);
  const totalWeeksPaid = rankDetails?.totalWeeksPaid ?? (salaryHistory.length || 0);
  const weeklyAmount = Number(
    rankDetails?.weeklySalaryAmount ?? currentTier?.weeklySalary ?? 0
  );

  const calculatedTotalSalary = salarySummary.totalIncome > 0
    ? salarySummary.totalIncome
    : salaryHistory.reduce((acc, curr) => acc + Number(curr.income || curr.amount || 0), 0);

  const cardData = [
    {
      title: "Current Salary Rank",
      value: currentTier ? `${currentTier.name} (Rank ${currentTier.rank})` : "Unranked (In Progress)",
      icon: "https://img.icons8.com/3d-fluency/94/trophy.png",
      highlight: Boolean(currentTier),
    },
    {
      title: "Weekly Payout Reward",
      value: weeklyAmount > 0 ? `$ ${weeklyAmount.toFixed(2)} / Week` : "$ 0.00 / Week",
      icon: "https://img.icons8.com/3d-fluency/94/receive-cash.png",
      highlight: weeklyAmount > 0,
    },
    {
      title: `Payout Progress (${currentTier ? currentTierWeeks : nextTier?.weeks || 10} Wks)`,
      value: currentTier
        ? `${totalWeeksPaid} / ${currentTierWeeks} Weeks Paid (${weeksRemaining} Left)`
        : `0 / ${nextTier?.weeks || 10} Weeks (Targeting ${nextTier?.name || "Associate"})`,
      icon: "https://img.icons8.com/3d-fluency/94/calendar.png",
    },
    {
      title: "Total Salary Earned",
      value: `$ ${calculatedTotalSalary.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: "https://img.icons8.com/3d-fluency/94/money-bag.png",
      highlight: calculatedTotalSalary > 0,
    },
  ];

  const columns = [
    {
      header: "S/N",
      accessor: "_id",
      cell: (_, rowIndex) => (
        <span className="font-semibold text-slate-400">{rowIndex + 1}</span>
      ),
    },
    {
      header: "Payout ID",
      accessor: "id",
      cell: (row) => (
        <div className="flex items-center gap-1.5 font-mono text-xs text-cyan-400 font-semibold">
          <span>{row?.id || row?._id || "N/A"}</span>
          <button
            onClick={() => handleCopy(row?.id || row?._id, row?.id || row?._id)}
            className="text-slate-500 hover:text-cyan-300 transition cursor-pointer"
          >
            {copiedId === (row?.id || row?._id) ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
          </button>
        </div>
      ),
    },
    {
      header: "Salary Amount",
      accessor: "income",
      cell: (row) => (
        <span className="font-mono font-black text-emerald-400 text-sm">
          +${Number(row?.income || row?.amount || 0).toFixed(2)}
        </span>
      ),
    },
    {
      header: "Payout Type",
      accessor: "type",
      cell: (row) => (
        <span className="px-2.5 py-1 text-xs font-black uppercase tracking-wider rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
          {row?.type || "Weekly Salary"}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      cell: (row) => (
        <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          {row?.status || "Completed"}
        </span>
      ),
    },
    {
      header: "Date & Time",
      accessor: "createdAt",
      cell: (row) => (
        <span className="text-xs text-slate-400 font-mono">
          {row?.createdAt ? new Date(row.createdAt).toLocaleString() : "-"}
        </span>
      ),
    },
    {
      header: "Remark",
      accessor: "remark",
      cell: (row) => (
        <span className="text-xs text-slate-300 line-clamp-1 max-w-xs font-medium">
          {row?.remark || "Weekly salary payout credited"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 mt-4">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800 p-6 md:p-8 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold mb-2">
              <Briefcase size={13} className="text-indigo-400" />
              15-Rank Weekly Salary Structure (50% : 30% : 20% Matrix)
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Weekly Salary Hub
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl">
              Achieve qualifying team volume across 3 active legs to unlock fixed weekly salaries from <strong className="text-white">$10/week up to $20,000/week</strong> across 15 leadership ranks.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchSalaryData(true)}
              disabled={refreshing}
              className="px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>
            <button
              onClick={exportCSV}
              className="px-4 py-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-300 text-xs font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <Download size={13} />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cardData.map((item) => (
          <StatCard
            key={item.title}
            title={item.title}
            value={item.value}
            iconImage={item.icon}
            highlight={item.highlight}
          />
        ))}
      </div>

      {/* 50% : 30% : 20% Leg Matrix Volume Status */}
      <div className="neon-glow-card border border-sky-400/40 rounded-3xl p-6 shadow-[0_0_30px_rgba(14,165,233,0.22)] backdrop-blur-xl space-y-5">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-4 border-b border-sky-500/20">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-amber-400">
              Leg Matrix Target Tracking (50% : 30% : 20%)
            </span>
            <h3 className="text-xl font-black text-white mt-0.5 flex items-center gap-2">
              <Target className="w-5 h-5 text-sky-400" />
              Target for Next Rank: <span className="gold-metallic-text">{nextTier?.name} (${nextTier?.target?.toLocaleString()})</span>
            </h3>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-300 font-semibold uppercase">Next Weekly Payout:</span>
            <div className="text-lg font-black text-amber-300 font-mono">
              ${nextTier?.weeklySalary || 0}/week ({nextTier?.weeks || 10} Weeks = ${(nextTier?.totalPayout ?? ((nextTier?.weeklySalary || 0) * (nextTier?.weeks || 10))).toLocaleString()})
            </div>
          </div>
        </div>

        {/* 3 Legs Progress */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Leg 1 (50%) */}
          <div className="p-4 bg-[#050c18] rounded-2xl border border-sky-500/20 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-300 uppercase text-[11px]">Strongest Leg (50% Req)</span>
              <span className="font-mono text-sky-300 font-bold">{progressLeg1.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-[#0b1324] rounded-full h-2.5 overflow-hidden border border-sky-500/20">
              <div className="h-full bg-gradient-to-r from-sky-500 to-blue-600 rounded-full transition-all" style={{ width: `${progressLeg1}%` }} />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>Current: ${leg1.toLocaleString()}</span>
              <span>Req: ${targetLeg1.toLocaleString()}</span>
            </div>
          </div>

          {/* Leg 2 (30%) */}
          <div className="p-4 bg-[#050c18] rounded-2xl border border-sky-500/20 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-300 uppercase text-[11px]">2nd Strong Leg (30% Req)</span>
              <span className="font-mono text-purple-300 font-bold">{progressLeg2.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-[#0b1324] rounded-full h-2.5 overflow-hidden border border-sky-500/20">
              <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all" style={{ width: `${progressLeg2}%` }} />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>Current: ${leg2.toLocaleString()}</span>
              <span>Req: ${targetLeg2.toLocaleString()}</span>
            </div>
          </div>

          {/* Other Legs (20%) */}
          <div className="p-4 bg-[#050c18] rounded-2xl border border-sky-500/20 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-300 uppercase text-[11px]">Other Legs Combined (20% Req)</span>
              <span className="font-mono text-amber-300 font-bold">{progressOther.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-[#0b1324] rounded-full h-2.5 overflow-hidden border border-sky-500/20">
              <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all" style={{ width: `${progressOther}%` }} />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>Current: ${otherLegs.toLocaleString()}</span>
              <span>Req: ${targetOther.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Total Effective Business */}
        <div className="p-4 bg-[#050c18] rounded-2xl border border-sky-500/30 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="gold-badge-icon w-10 h-10 flex items-center justify-center font-bold">
              <ShieldCheck size={20} className="text-slate-950" />
            </div>
            <div>
              <h4 className="text-sm font-black text-white uppercase tracking-wider">Effective Qualifying Business</h4>
              <p className="text-xs text-slate-400">Calculated strictly using the institutional 50:30:20 leg ratio algorithm</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 font-semibold uppercase">Overall Target Progress:</span>
            <div className="text-base sm:text-lg font-black font-mono text-white">
              ${effectiveBusiness.toLocaleString()} / <span className="text-amber-300">${targetVolume.toLocaleString()} ({overallProgress.toFixed(1)}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Salary Payout History Table */}
      <DataTable
        title="Weekly Salary Payout History"
        columns={columns}
        data={salaryHistory}
        pageSize={10}
      />
    </div>
  );
};

export default UserSalaryIncome;
