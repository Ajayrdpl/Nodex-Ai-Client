import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  DollarSign,
  Download,
  RefreshCw,
  Crown,
  Share2,
  Users,
  TrendingUp,
  Wallet,
  Zap,
  CheckCircle2,
  Clock,
  Layers,
  BarChart3,
  Calendar,
  Search,
  ArrowUpRight,
  ShieldCheck,
  Check,
  Copy,
} from "lucide-react";

import DataTable from "../../components/Screen/UserPanel/DataTable";
import StatCard from "../../components/Screen/UserPanel/StatCard";
import { setLoading } from "../../redux/slices/loadingSlice";
import {
  getIncomeSummaryApi,
  getAvailableIncomeBalance,
  getLevelInfoApi,
  getReferralIncomeHistoryApi,
  getTradingIncomeHistoryApi,
  getLevelIncomeHistoryApi,
  getAllUserIncomeHistory,
  getDirectBoosterIncomeHistoryApi,
  getTeamBoosterIncomeHistoryApi,
  getCompoundingHistoryApi,
} from "../../api/user.api";
import { getIncomeTotal } from "../../api/auth.api";
import { AuthenticatedUserRouters } from "../../constants/routes";
import { maskWalletAddress } from "../../utils/additionalFunc";

const UserIncomeHistory = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Active Tab for Income Breakdown Table
  const [activeTab, setActiveTab] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  // Financial Stats States
  const [incomeSummary, setIncomeSummary] = useState(null);
  const [totalIncome, setTotalIncome] = useState(null);
  const [balanceData, setBalanceData] = useState(null);
  const [levelInfo, setLevelInfo] = useState(null);

  // Stream-specific History Lists
  const [allIncomeHistory, setAllIncomeHistory] = useState([]);
  const [referralHistory, setReferralHistory] = useState([]);
  const [directBoosterHistory, setDirectBoosterHistory] = useState([]);
  const [roiHistory, setRoiHistory] = useState([]);
  const [levelHistory, setLevelHistory] = useState([]);
  const [teamBoosterHistory, setTeamBoosterHistory] = useState([]);
  const [compoundingHistory, setCompoundingHistory] = useState([]);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Fetch All Income Data & Ledgers
  const loadIncomeReportData = useCallback(
    async (isManual = false) => {
      try {
        if (isManual) setRefreshing(true);
        else dispatch(setLoading(true));

        const [
          summaryRes,
          statsRes,
          balRes,
          lvlRes,
          allHistoryRes,
          refHistoryRes,
          boosterHistoryRes,
          roiHistoryRes,
          lvlHistoryRes,
          teamBoosterRes,
          compoundRes,
        ] = await Promise.allSettled([
          getIncomeSummaryApi(),
          getIncomeTotal(),
          getAvailableIncomeBalance(),
          getLevelInfoApi(),
          getAllUserIncomeHistory(),
          getReferralIncomeHistoryApi({ page: 1, limit: 100 }),
          getDirectBoosterIncomeHistoryApi(),
          getTradingIncomeHistoryApi({ page: 1, limit: 100 }),
          getLevelIncomeHistoryApi({ page: 1, limit: 100 }),
          getTeamBoosterIncomeHistoryApi(),
          getCompoundingHistoryApi({ page: 1, limit: 100 }),
        ]);

        if (summaryRes.status === "fulfilled" && summaryRes.value?.success) {
          setIncomeSummary(summaryRes.value?.data || {});
        }

        if (statsRes.status === "fulfilled" && statsRes.value?.success) {
          setTotalIncome(statsRes.value?.data || {});
        }

        if (balRes.status === "fulfilled" && balRes.value?.success) {
          setBalanceData(balRes.value?.data || {});
        }

        if (lvlRes.status === "fulfilled" && lvlRes.value?.success) {
          setLevelInfo(lvlRes.value?.data || {});
        }

        // Parse Table Histories
        if (allHistoryRes.status === "fulfilled" && allHistoryRes.value?.success) {
          const raw = allHistoryRes.value?.data || [];
          setAllIncomeHistory(Array.isArray(raw) ? raw : raw?.history || []);
        }

        if (refHistoryRes.status === "fulfilled" && refHistoryRes.value?.success) {
          const raw = refHistoryRes.value?.data || [];
          setReferralHistory(Array.isArray(raw) ? raw : raw?.history || []);
        }

        if (boosterHistoryRes.status === "fulfilled" && boosterHistoryRes.value?.success) {
          const raw = boosterHistoryRes.value?.data?.history || boosterHistoryRes.value?.data || [];
          setDirectBoosterHistory(Array.isArray(raw) ? raw : []);
        }

        if (roiHistoryRes.status === "fulfilled" && roiHistoryRes.value?.success) {
          const raw = roiHistoryRes.value?.data || [];
          setRoiHistory(Array.isArray(raw) ? raw : raw?.history || []);
        }

        if (lvlHistoryRes.status === "fulfilled" && lvlHistoryRes.value?.success) {
          const raw = lvlHistoryRes.value?.data || [];
          setLevelHistory(Array.isArray(raw) ? raw : raw?.history || []);
        }

        if (teamBoosterRes.status === "fulfilled" && teamBoosterRes.value?.success) {
          const raw = teamBoosterRes.value?.data?.history || teamBoosterRes.value?.data || [];
          setTeamBoosterHistory(Array.isArray(raw) ? raw : []);
        }

        if (compoundRes.status === "fulfilled" && compoundRes.value?.success) {
          const raw = compoundRes.value?.data?.history || compoundRes.value?.data || [];
          setCompoundingHistory(Array.isArray(raw) ? raw : []);
        }

        if (isManual) {
          toast.success("Income report data refreshed!");
        }
      } catch (err) {
        console.error("Failed to load income report data:", err);
        toast.error("Failed to load income report");
      } finally {
        if (isManual) setRefreshing(false);
        else dispatch(setLoading(false));
      }
    },
    [dispatch]
  );

  useEffect(() => {
    loadIncomeReportData();
  }, [loadIncomeReportData]);

  // Consolidate User & Stats Object
  const stats = totalIncome?.data || totalIncome || incomeSummary?.data || incomeSummary || {};
  const incomes = totalIncome?.incomes || incomeSummary?.incomes || {};
  const salaryRank = totalIncome?.salaryRank || salaryRankData || {};

  // Derived Financial Variables
  const activeInvestment = Number(
    stats?.activeInvestment ??
    stats?.totalInvestment ??
    stats?.investment ??
    0
  );

  const withdrawalWallet = Number(
    balanceData?.availableBalance ??
    balanceData?.totalIncome ??
    stats?.withdrawableBalance ??
    stats?.totalIncome ??
    incomes?.total ??
    0
  );

  const fundWallet = Number(
    balanceData?.fundWallet ??
    stats?.fundWallet ??
    0
  );

  const totalDailyRoi = Number(
    stats?.dailyRoi?.total ??
    incomes?.dailyRoi?.total ??
    stats?.totalDailyRoi ??
    stats?.totalTrading ??
    0
  );
  const todayDailyRoi = Number(
    stats?.dailyRoi?.today ??
    incomes?.dailyRoi?.today ??
    stats?.todayDailyRoi ??
    stats?.todayTrading ??
    0
  );

  const totalDirectBooster = Number(
    stats?.totalDirectBooster ??
    incomes?.directBooster?.total ??
    stats?.directBoosterIncome ??
    0
  );
  const todayDirectBooster = Number(
    stats?.todayDirectBooster ??
    incomes?.directBooster?.today ??
    0
  );

  const totalTeamBooster = Number(
    stats?.totalTeamBooster ??
    incomes?.teamBooster?.total ??
    stats?.teamBoosterIncome ??
    0
  );
  const todayTeamBooster = Number(
    stats?.todayTeamBooster ??
    incomes?.teamBooster?.today ??
    0
  );

  const totalCompoundingBonus = Number(
    stats?.totalCompoundingBonus ??
    incomes?.compoundingBonus?.total ??
    0
  );
  const totalCompounded = Number(
    stats?.totalCompounded ??
    0
  );

  const isBoosterActive = Boolean(
    stats?.isBoosterActive ||
    stats?.boosterStatus?.isBoosterActive ||
    totalDirectBooster > 0
  );

  const totalReferral = Number(
    stats?.totalReferral ??
    incomes?.referral?.total ??
    0
  );
  const todayReferral = Number(
    stats?.todayReferral ??
    incomes?.referral?.today ??
    0
  );

  const totalLevelRoi = Number(
    stats?.totalLevelRoi ??
    stats?.totalLevel ??
    incomes?.levelRoi?.total ??
    0
  );
  const todayLevelRoi = Number(
    stats?.todayLevelRoi ??
    stats?.todayLevel ??
    incomes?.levelRoi?.today ??
    0
  );

  const totalIncomeAmount = Number(
    stats?.totalIncome ??
    incomes?.total ??
    (totalDailyRoi + totalDirectBooster + totalReferral + totalLevelRoi + totalTeamBooster + totalCompoundingBonus)
  );
  const todayIncomeAmount = Number(
    stats?.todayIncome ??
    incomes?.today ??
    (todayDailyRoi + todayDirectBooster + todayReferral + todayLevelRoi + todayTeamBooster)
  );

  const totalDownlineUsers = Number(
    stats?.totalDownlineUsers ??
    stats?.partners ??
    0
  );
  const partnerActive = Number(
    stats?.partnerActive ??
    levelInfo?.qualifiedDirects ??
    totalDownlineUsers
  );

  const totalTeamTransaction = Number(
    stats?.totalTeamBusiness ??
    stats?.totalTeamTransaction ??
    0
  );

  // 220% Max ROI Cap calculation
  const maxRoiCap = activeInvestment * 2.2;
  const roiEarned = totalDailyRoi;
  const roiProgress = maxRoiCap > 0 ? Math.min((roiEarned / maxRoiCap) * 100, 100) : 0;
  const roiRemaining = Math.max(0, maxRoiCap - roiEarned);

  // Unlocked levels
  const isAllLevelsUnlocked = activeInvestment >= 500 || Boolean(stats?.isAllLevelsUnlocked);
  const unlockedLevelsCount = isAllLevelsUnlocked ? 10 : Math.min(10, partnerActive);

  // 10 Notebook Income Cards
  const notebookCards = [
    {
      title: "Package (Active Staked)",
      value: `$ ${activeInvestment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: "https://img.icons8.com/3d-fluency/94/exchange.png",
      path: AuthenticatedUserRouters.INVEST,
      theme: "cyan",
      badge: activeInvestment >= 10 ? "ACTIVE $10+" : "INACTIVE",
      subText: isAllLevelsUnlocked ? "VIP All 10 Levels Unlocked" : `Staked: $ ${activeInvestment.toFixed(2)}`,
    },
    {
      title: "Current Balance",
      value: `$ ${withdrawalWallet.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: "https://img.icons8.com/3d-fluency/94/wallet.png",
      path: AuthenticatedUserRouters.WITHDRAW,
      theme: "blue",
      badge: "WITHDRAWABLE",
      subText: fundWallet > 0 ? `Fund Wallet: $ ${fundWallet.toFixed(2)}` : "Available Balance",
    },
    {
      title: "Package Daily ROI",
      value: `$ ${totalDailyRoi.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: "https://img.icons8.com/3d-fluency/94/candle-sticks.png",
      path: AuthenticatedUserRouters.TRADING_INCOME_HISTORY,
      highlight: true,
      theme: "emerald",
      badge: "4.5%–7.5% DAILY",
      subText: `Today: +$ ${todayDailyRoi.toFixed(2)}`,
    },
    {
      title: "Direct Referral (5%)",
      value: `$ ${((totalReferral || 0) + (totalDirectBooster || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: "https://img.icons8.com/3d-plastilina/69/share--v1.png",
      path: AuthenticatedUserRouters.REFERRAL_INCOME_HISTORY,
      theme: "amber",
      badge: "5% DIRECT",
      subText: `Active Partners: ${partnerActive}`,
    },
    {
      title: "10-Level ROI (24%)",
      value: `$ ${totalLevelRoi.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: "https://cdn-icons-png.flaticon.com/512/10102/10102408.png",
      path: AuthenticatedUserRouters.LEVEL_INCOME_HISTORY,
      theme: "purple",
      badge: isAllLevelsUnlocked ? "ALL 10 UNLOCKED" : `${unlockedLevelsCount}/10 LEVELS`,
      subText: isAllLevelsUnlocked ? "Auto-Unlocked ($500+)" : `Today: +$ ${todayLevelRoi.toFixed(2)}`,
    },
    {
      title: "7-Days Team Booster",
      value: `$ ${totalTeamBooster.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: "https://img.icons8.com/3d-fluency/94/trophy.png",
      path: AuthenticatedUserRouters.TEAM_BOOSTER_INCOME,
      theme: "amber",
      badge: "SLABS $20–$5K",
      subText: "Monday Weekly Distribution",
    },
    {
      title: "Auto Compounding",
      value: `$ ${totalCompoundingBonus.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: "https://img.icons8.com/3d-fluency/94/refresh.png",
      path: AuthenticatedUserRouters.AUTO_COMPOUNDING,
      theme: "emerald",
      badge: "+0.5% BONUS",
      subText: `Compounded: $ ${totalCompounded.toFixed(2)}`,
    },
    {
      title: "Total Income",
      value: `$ ${totalIncomeAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: "https://img.icons8.com/3d-fluency/94/stack-of-coins.png",
      path: AuthenticatedUserRouters.INCOME_HISTORY,
      highlight: true,
      theme: "emerald",
      badge: "MAX 220% ROI",
      subText: `Today: +$ ${todayIncomeAmount.toFixed(2)}`,
    },
    {
      title: "Total Team Business",
      value: `$ ${totalTeamTransaction.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: "https://img.icons8.com/pulsar-gradient/48/refund-2.png",
      path: AuthenticatedUserRouters.MY_TEAM_DIVISION,
      highlight: true,
      theme: "purple",
      badge: "NETWORK VOL",
      subText: `${totalDownlineUsers} Members`,
    },
  ];

  // Active Ledger Source depending on tab
  const getActiveLedgerData = () => {
    switch (activeTab) {
      case "direct":
        return referralHistory;
      case "direct-booster":
        return directBoosterHistory;
      case "roi":
        return roiHistory;
      case "level":
        return levelHistory;
      case "team-booster":
        return teamBoosterHistory;
      case "compounding":
        return compoundingHistory;
      case "all":
      default:
        return allIncomeHistory.length > 0
          ? allIncomeHistory
          : [
              ...referralHistory,
              ...directBoosterHistory,
              ...roiHistory,
              ...levelHistory,
              ...teamBoosterHistory,
              ...compoundingHistory,
            ];
    }
  };

  const currentLedger = getActiveLedgerData();

  const filteredLedger = currentLedger.filter((item) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      (item?.id || item?._id || "").toLowerCase().includes(query) ||
      (item?.type || item?.remark || "").toLowerCase().includes(query) ||
      (item?.fromUser || item?.username || "").toLowerCase().includes(query)
    );
  });

  // Export to CSV
  const handleExportCSV = () => {
    if (!filteredLedger || filteredLedger.length === 0) {
      toast.info("No records to export");
      return;
    }
    const headers = ["#", "Transaction ID", "Date", "Income Type", "Amount ($)", "Status", "Remark"];
    const rows = filteredLedger.map((r, idx) => [
      idx + 1,
      r?.id || r?._id || "N/A",
      r?.createdAt ? new Date(r.createdAt).toLocaleString() : "",
      r?.type || activeTab.toUpperCase(),
      Number(r?.income || r?.amount || 0).toFixed(2),
      r?.status || "Completed",
      `"${(r?.remark || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Income_Report_${activeTab}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns = [
    {
      header: "S/N",
      accessor: "_id",
      cell: (_, rowIndex) => (
        <span className="font-semibold text-[#848e9c]">{rowIndex + 1}</span>
      ),
    },
    {
      header: "Transaction ID",
      accessor: "id",
      cell: (row) => (
        <div className="flex items-center gap-1.5 font-mono text-xs text-[#f0b90b] font-bold">
          <span>{row?.id || row?._id || "N/A"}</span>
          <button
            onClick={() => copyToClipboard(row?.id || row?._id, row?.id || row?._id)}
            className="text-[#848e9c] hover:text-[#f0b90b] transition cursor-pointer"
            title="Copy ID"
          >
            {copiedId === (row?.id || row?._id) ? (
              <Check size={12} className="text-[#0ecb81]" />
            ) : (
              <Copy size={12} />
            )}
          </button>
        </div>
      ),
    },
    {
      header: "Income Stream",
      accessor: "type",
      cell: (row) => (
        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-[#1e2329] text-[#eaecef] border border-[#2b313a] font-mono">
          {row?.type || activeTab.toUpperCase()}
        </span>
      ),
    },
    {
      header: "Amount (USDT)",
      accessor: "income",
      cell: (row) => (
        <span className="font-mono font-black text-xs text-[#0ecb81]">
          +${Number(row?.income || row?.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      cell: (row) => (
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-black border ${
            row?.status === "Completed" || !row?.status
              ? "bg-[#0ecb81]/15 text-[#0ecb81] border-[#0ecb81]/30"
              : "bg-[#f0b90b]/15 text-[#f0b90b] border-[#f0b90b]/30"
          }`}
        >
          {row?.status || "Completed"}
        </span>
      ),
    },
    {
      header: "Timestamp",
      accessor: "createdAt",
      cell: (row) => (
        <span className="text-[11px] text-[#848e9c] font-mono">
          {row?.createdAt ? new Date(row.createdAt).toLocaleString() : "N/A"}
        </span>
      ),
    },
    {
      header: "Remark",
      accessor: "remark",
      cell: (row) => (
        <span className="text-xs text-[#848e9c] truncate max-w-xs block">
          {row?.remark || "System Dividend Settlement"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-5 min-h-screen p-1 sm:p-2 md:p-3 max-w-full overflow-hidden text-white">
      {/* ── HEADER BANNER ── */}
      <div className="neon-glow-card p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="gold-badge-icon w-10 h-10 flex items-center justify-center shrink-0">
              <DollarSign className="w-5 h-5 text-slate-950 font-black" />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-black uppercase tracking-wide">
                <span className="gold-metallic-text">Income Report & Balance Overview</span>
              </h1>
              <p className="text-xs text-slate-300 font-semibold uppercase tracking-wider">
                Comprehensive real-time ledger of all 5 income streams, 15-level dividend pools, and rank royalties.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => loadIncomeReportData(true)}
            disabled={refreshing}
            className="px-3.5 py-2 rounded-xl bg-[#060e1e] border border-sky-500/30 hover:bg-sky-950/40 text-slate-200 text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={13} className={refreshing ? "animate-spin text-amber-400" : ""} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-[#060e1e] border border-emerald-500/30 hover:bg-emerald-950/40 text-emerald-400 text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer"
          >
            <Download size={13} />
            Export CSV
          </button>
          <button
            onClick={() => navigate(AuthenticatedUserRouters.WITHDRAW)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.4)]"
          >
            <Wallet size={13} />
            Withdraw Funds
          </button>
        </div>
      </div>

      {/* ── 1. ALL 10 NOTEBOOK INCOMES & BALANCE CARDS GRID ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-black uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
            <Layers size={13} className="text-amber-400" /> Financial Breakdown (10 Streams)
          </span>
          <span className="text-[9px] text-amber-300 font-mono font-bold">100% Real-Time Ledger</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-2.5">
          {notebookCards.map((item) => (
            <StatCard
              key={item.title}
              title={item.title}
              value={item.value}
              iconImage={item.icon}
              path={item.path}
              highlight={item.highlight}
              theme={item.theme}
              badge={item.badge}
              subText={item.subText}
            />
          ))}
        </div>
      </div>

      {/* ── 2. OFFICIAL NODEXAI PLAN METRICS (220% MAX ROI CAP & 7-DAYS BOOSTER) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Card 1: 220% Max ROI Structure (Images 1 & 9) */}
        <div className="neon-glow-card p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-sky-500/20 pb-2.5">
            <div className="flex items-center gap-2.5">
              <div className="gold-badge-icon w-8 h-8 flex items-center justify-center shrink-0">
                <TrendingUp className="w-4 h-4 text-slate-950 font-black" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-black uppercase tracking-wide">
                  <span className="gold-metallic-text">Maximum ROI Up to 220%</span>
                </h3>
                <p className="text-[10px] text-slate-300">
                  Applicable ROI continues according to the selected package up to 220% cap
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-xl bg-[#060e1e] border border-amber-400/30 text-amber-300 font-mono text-[11px] font-bold">
              220% MAX CAP
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Total ROI Yields Earned:</span>
              <span className="font-mono font-bold text-emerald-400">${roiEarned.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">220% Maximum Cap Ceiling:</span>
              <span className="font-mono font-bold text-amber-300">${maxRoiCap.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Remaining ROI Cap:</span>
              <span className="font-mono font-bold text-sky-300">${roiRemaining.toFixed(2)}</span>
            </div>

            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>Progress to Cap</span>
                <span className="text-amber-300 font-bold">{roiProgress.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-[#060e1e] rounded-full h-2 overflow-hidden border border-sky-500/30">
                <div
                  className="bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${roiProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: 7-Days Team Booster Slabs ($20 - $5,000) (Image 5) */}
        <div className="neon-glow-card p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-sky-500/20 pb-2.5">
            <div className="flex items-center gap-2.5">
              <div className="gold-badge-icon w-8 h-8 flex items-center justify-center shrink-0">
                <Crown className="w-4 h-4 text-slate-950 font-black" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-black uppercase tracking-wide">
                  <span className="gold-metallic-text">7-Days Team Booster Slabs</span>
                </h3>
                <p className="text-[10px] text-slate-300">
                  Monday weekly distribution • Slabs $1,000 ($20) to $100,000 ($5,000)
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate(AuthenticatedUserRouters.TEAM_BOOSTER_INCOME)}
              className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-wider transition cursor-pointer"
            >
              View Slabs
            </button>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Total Team Business Volume:</span>
              <span className="font-mono font-bold text-white">${totalTeamTransaction.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Total Booster Bonus Earned:</span>
              <span className="font-mono font-bold text-amber-300">${totalTeamBooster.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Active Directs (Self $100+ & 3 Dir $100+):</span>
              <span className={`font-mono font-bold ${partnerActive >= 3 && activeInvestment >= 100 ? "text-emerald-400" : "text-amber-400"}`}>
                {partnerActive} Active {partnerActive >= 3 && activeInvestment >= 100 ? "(Qualified)" : "(Need 3)"}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 pt-1">
              Highest achieved eligible slab bonus automatically credited every Monday.
            </p>
          </div>
        </div>
      </div>

      {/* ── 3. DETAILED LEDGER TABLE WITH TABBED BREAKDOWN ── */}
      <div className="neon-glow-card p-4 sm:p-5 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-sky-500/20 pb-3">
          {/* Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: "all", label: "All Incomes", count: allIncomeHistory.length },
              { id: "roi", label: "Package ROI (4.5%-7.5%)", count: roiHistory.length },
              { id: "direct", label: "Direct Referral (5%)", count: referralHistory.length + directBoosterHistory.length },
              { id: "level", label: "10-Level ROI (24%)", count: levelHistory.length },
              { id: "team-booster", label: "7-Days Booster", count: teamBoosterHistory.length },
              { id: "compounding", label: "Auto Compounding (0.5%)", count: compoundingHistory.length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.4)]"
                    : "bg-[#060e1e] text-slate-300 hover:text-white border border-sky-500/30"
                }`}
              >
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9.5px] font-mono ${
                      activeTab === tab.id
                        ? "bg-slate-950 text-amber-300"
                        : "bg-slate-800 text-slate-300"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID or remark..."
              className="w-full bg-[#060e1e] border border-sky-500/30 focus:border-amber-400 rounded-xl py-1.5 pl-8 pr-3 text-xs text-white placeholder-slate-400 outline-none font-mono"
            />
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        {/* Data Table */}
        <DataTable
          title=""
          columns={columns}
          data={filteredLedger}
          pageSize={15}
        />
      </div>
    </div>
  );
};

export default UserIncomeHistory;
