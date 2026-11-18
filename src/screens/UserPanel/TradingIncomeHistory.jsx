import React, { useEffect, useState, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import {
  TrendingUp,
  Flame,
  Zap,
  ShieldCheck,
  RefreshCw,
  Copy,
  Check,
  Download,
  Calendar,
  DollarSign,
  ArrowUpRight,
  Sparkles,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  Trophy,
  Rocket,
  Shield,
  Star,
  Gem,
  Crown,
  Infinity as InfinityIcon,
  Timer,
  Award,
} from "lucide-react";

import DataTable from "../../components/Screen/UserPanel/DataTable";
import StatCard from "../../components/Screen/UserPanel/StatCard";
import { setLoading } from "../../redux/slices/loadingSlice";
import {
  getAllTradingIncomeHistory,
  getDailyRoiSummaryApi,
  getAvailableIncomeBalance,
  getBoosterStatusApi,
  clickTradeButtonApi,
  getDashboardStatsApi,
} from "../../api/user.api";
import { getIncomeTotal } from "../../api/auth.api";
import { isToday } from "../../utils/helper";
import { VELTRION_PACKAGES } from "./InvestmentPage";

const ROI_PACKAGES_DISPLAY = [
  {
    name: "NOVA",
    min: 10,
    max: 200,
    daily: "4.5%",
    monthly: "135%",
    icon: Star,
    border: "border-amber-500/40",
    badgeBg: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    glow: "shadow-[0_0_20px_rgba(245,158,11,0.2)]",
    cardBg: "from-amber-500/10 via-[#061833] to-[#020817]",
  },
  {
    name: "VANTAGE",
    min: 250,
    max: 500,
    daily: "5.0%",
    monthly: "150%",
    icon: Gem,
    border: "border-sky-400/40",
    badgeBg: "bg-sky-500/20 text-sky-300 border-sky-400/40",
    glow: "shadow-[0_0_20px_rgba(56,189,248,0.2)]",
    cardBg: "from-sky-500/10 via-[#061833] to-[#020817]",
  },
  {
    name: "NEXUS",
    min: 550,
    max: 2000,
    daily: "5.5%",
    monthly: "165%",
    icon: Shield,
    border: "border-blue-500/40",
    badgeBg: "bg-blue-500/20 text-blue-300 border-blue-400/40",
    glow: "shadow-[0_0_20px_rgba(59,130,246,0.25)]",
    cardBg: "from-blue-500/10 via-[#061833] to-[#020817]",
  },
  {
    name: "PRIME",
    min: 2500,
    max: 5000,
    daily: "6.0%",
    monthly: "180%",
    icon: Crown,
    border: "border-yellow-400/40",
    badgeBg: "bg-yellow-500/20 text-yellow-300 border-yellow-400/40",
    glow: "shadow-[0_0_20px_rgba(234,179,8,0.25)]",
    cardBg: "from-yellow-500/10 via-[#061833] to-[#020817]",
  },
  {
    name: "TITAN",
    min: 5500,
    max: 10000,
    daily: "6.5%",
    monthly: "195%",
    icon: Flame,
    border: "border-orange-500/40",
    badgeBg: "bg-orange-500/20 text-orange-300 border-orange-400/40",
    glow: "shadow-[0_0_20px_rgba(249,115,22,0.25)]",
    cardBg: "from-orange-500/10 via-[#061833] to-[#020817]",
  },
  {
    name: "INFINITY",
    min: 10500,
    max: 25000,
    daily: "7.5%",
    monthly: "220% Cap",
    icon: InfinityIcon,
    border: "border-purple-500/40",
    badgeBg: "bg-purple-500/20 text-purple-300 border-purple-400/40",
    glow: "shadow-[0_0_20px_rgba(168,85,247,0.25)]",
    cardBg: "from-purple-500/10 via-[#061833] to-[#020817]",
  },
];

const TradingIncomeHistory = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const navState = location?.state;

  const [historyList, setHistoryList] = useState([]);
  const [totalStats, setTotalStats] = useState({ totalIncome: 0, todayTotal: 0 });
  const [summaryData, setSummaryData] = useState(null);
  const [balanceData, setBalanceData] = useState(null);
  const [boosterStatus, setBoosterStatus] = useState(null);
  const [typeFilter, setTypeFilter] = useState(navState === "today" ? "today" : "all");
  const [refreshing, setRefreshing] = useState(false);
  const [executingTrade, setExecutingTrade] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const userInfo = useSelector((state) => state?.isLoggedUser?.data);

  const fetchData = useCallback(
    async (isManual = false) => {
      try {
        if (isManual) setRefreshing(true);
        else dispatch(setLoading(true));

        const [
          historyRes,
          summaryRes,
          balanceRes,
          statsRes,
          boosterRes,
          dashStatsRes,
        ] = await Promise.allSettled([
          getAllTradingIncomeHistory(),
          getDailyRoiSummaryApi(),
          getAvailableIncomeBalance(),
          getIncomeTotal(),
          getBoosterStatusApi(),
          getDashboardStatsApi(),
        ]);

        if (historyRes.status === "fulfilled" && historyRes.value?.success) {
          const resObj = historyRes.value;
          const rawHistory = Array.isArray(resObj?.data)
            ? resObj.data
            : Array.isArray(resObj?.data?.history)
            ? resObj.data.history
            : [];

          const calculatedEarned = rawHistory.reduce(
            (sum, item) => sum + Number(item?.income || 0),
            0
          );
          const calculatedToday = rawHistory
            .filter((item) => isToday(new Date(item?.createdAt)))
            .reduce((sum, item) => sum + Number(item?.income || 0), 0);

          setHistoryList(rawHistory);
          setTotalStats({
            totalIncome: Number(
              resObj?.summary?.totalEarned ??
                resObj?.data?.totalIncome ??
                calculatedEarned
            ),
            todayTotal: Number(resObj?.data?.todayTotal ?? calculatedToday),
          });
        } else {
          setHistoryList([]);
        }

        const mergedSummary = {
          ...(dashStatsRes.status === "fulfilled"
            ? dashStatsRes.value?.data || dashStatsRes.value
            : {}),
          ...(statsRes.status === "fulfilled"
            ? statsRes.value?.data || statsRes.value
            : {}),
          ...(summaryRes.status === "fulfilled"
            ? summaryRes.value?.data || summaryRes.value
            : {}),
        };
        setSummaryData(mergedSummary);

        if (balanceRes.status === "fulfilled" && balanceRes.value?.success) {
          setBalanceData(balanceRes.value?.data || {});
        }

        if (boosterRes.status === "fulfilled" && boosterRes.value?.success) {
          setBoosterStatus(boosterRes.value?.data || boosterRes.value);
        }

        if (isManual) {
          toast.success("ROI income reports refreshed");
        }
      } catch (err) {
        console.error("ROI fetch error:", err);
        toast.error("Failed to fetch Daily ROI reports");
        setHistoryList([]);
      } finally {
        if (isManual) setRefreshing(false);
        else dispatch(setLoading(false));
      }
    },
    [dispatch]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Execute Daily Trade Button Click Handler
  const handleExecuteDailyTrade = async () => {
    try {
      setExecutingTrade(true);
      const res = await clickTradeButtonApi();
      if (res?.success || String(res?.message || "").toLowerCase().includes("success")) {
        toast.success(res?.message || "Daily trading ROI dividend credited successfully!");
        fetchData(true);
      } else {
        toast.info(res?.message || "Daily trade has already been executed for today.");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to execute daily trade");
    } finally {
      setExecutingTrade(false);
    }
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportCSV = () => {
    if (!historyList.length) {
      toast.info("No records to export");
      return;
    }

    const headers = [
      "#",
      "Payout ID",
      "Type",
      "Package Amount ($)",
      "Daily Rate (%)",
      "Daily ROI ($)",
      "Status",
      "Date",
      "Remark",
    ];
    const rows = historyList.map((item, idx) => [
      idx + 1,
      item.id || item._id || "",
      item.type || "Daily ROI",
      Number(item.amount || 0).toFixed(2),
      `${item.percentage || 4.5}%`,
      Number(item.income || 0).toFixed(2),
      item.status || "Completed",
      item.createdAt ? new Date(item.createdAt).toLocaleString() : "",
      `"${(item.remark || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `veltrion_daily_roi_history_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter List
  const filteredHistory = useMemo(() => {
    return historyList.filter((item) => {
      if (typeFilter === "today") {
        return isToday(new Date(item?.createdAt));
      }
      if (typeFilter === "daily") {
        return (
          String(item?.type).toLowerCase().includes("daily") ||
          String(item?.type).toLowerCase().includes("trading") ||
          String(item?.type).toLowerCase().includes("roi")
        );
      }
      if (typeFilter === "booster") {
        return String(item?.type).toLowerCase().includes("booster");
      }
      return true;
    });
  }, [historyList, typeFilter]);

  const dailyRoiItems = historyList.filter(
    (item) => !String(item?.type || "").toLowerCase().includes("booster")
  );
  const boosterRoiItems = historyList.filter(
    (item) => String(item?.type || "").toLowerCase().includes("booster")
  );

  const sumDailyRoi = dailyRoiItems.reduce(
    (acc, curr) => acc + Number(curr?.income || 0),
    0
  );
  const sumBoosterRoi = boosterRoiItems.reduce(
    (acc, curr) => acc + Number(curr?.income || 0),
    0
  );
  const sumTodayDailyRoi = dailyRoiItems
    .filter((item) => isToday(new Date(item?.createdAt)))
    .reduce((acc, curr) => acc + Number(curr?.income || 0), 0);

  const activeInvestment = Number(
    balanceData?.currentInvestment ??
      summaryData?.activeInvestment ??
      summaryData?.investment ??
      userInfo?.investment ??
      (historyList.length > 0 ? Number(historyList[0]?.amount || 0) : 0)
  );

  const statsIncomes =
    summaryData?.incomes ??
    summaryData?.data?.incomes ??
    summaryData?.data ??
    summaryData ??
    {};

  const statsDailyRoi =
    statsIncomes?.dailyRoi ??
    summaryData?.dailyRoi ??
    summaryData?.data?.dailyRoi ??
    {};

  const totalDailyRoi = Number(
    statsDailyRoi?.total ??
      summaryData?.totalDailyRoi ??
      summaryData?.totalRoi ??
      (sumDailyRoi > 0 ? sumDailyRoi : totalStats.totalIncome)
  );

  const todayDailyRoi = Number(
    statsDailyRoi?.today ??
      summaryData?.todayDailyRoi ??
      summaryData?.todayRoi ??
      (sumTodayDailyRoi > 0 ? sumTodayDailyRoi : totalStats.todayTotal)
  );

  const totalBoosterRoi = Number(
    statsIncomes?.boosterRoi?.total ??
      summaryData?.totalBoosterRoi ??
      sumBoosterRoi
  );

  // Maximum ROI Cap 220%
  const maxRoiCap = Number(
    userInfo?.earnings?.maxRoiCap ||
    summaryData?.maxRoiCap ||
    (activeInvestment * 2.2)
  );
  const capProgress = maxRoiCap > 0 ? Math.min((totalDailyRoi / maxRoiCap) * 100, 100) : 0;

  // Active Package Detection
  const currentActivePackage = useMemo(() => {
    if (activeInvestment < 10) return null;
    return (
      ROI_PACKAGES_DISPLAY.slice().reverse().find((p) => activeInvestment >= p.min) ||
      ROI_PACKAGES_DISPLAY[0]
    );
  }, [activeInvestment]);

  // Booster Status
  const isBoosterActive = Boolean(
    boosterStatus?.isBoosterActive ??
      boosterStatus?.isActive ??
      summaryData?.isBoosterActive ??
      totalBoosterRoi > 0
  );

  const cardData = [
    {
      title: "Total Daily ROI Earned",
      value: `$ ${totalDailyRoi.toFixed(2)}`,
      icon: "https://img.icons8.com/3d-fluency/94/candle-sticks.png",
      highlight: totalDailyRoi > 0,
    },
    {
      title: "Today's Daily ROI",
      value: `$ ${todayDailyRoi.toFixed(2)}`,
      icon: "https://img.icons8.com/3d-fluency/94/receive-cash.png",
      highlight: todayDailyRoi > 0,
    },
    {
      title: "Active Investment",
      value: `$ ${userActiveInvestment.toFixed(2)}`,
      icon: "https://img.icons8.com/3d-fluency/94/wallet.png",
      highlight: userActiveInvestment > 0,
    },
    {
      title: "Maximum ROI Cap (220%)",
      value: `$ ${maxRoiCap.toFixed(2)}`,
      icon: "https://img.icons8.com/3d-fluency/94/trophy.png",
      highlight: true,
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
            title="Copy ID"
          >
            {copiedId === (row?.id || row?._id) ? (
              <Check size={13} className="text-emerald-400" />
            ) : (
              <Copy size={13} />
            )}
          </button>
        </div>
      ),
    },
    {
      header: "Type",
      accessor: "type",
      cell: (row) => {
        const isBooster = String(row?.type || "").toLowerCase().includes("booster");
        return (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
              isBooster
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
            }`}
          >
            {isBooster ? (
              <Flame size={12} className="text-amber-400" />
            ) : (
              <TrendingUp size={12} className="text-cyan-400" />
            )}
            {row?.type || "Daily ROI"}
          </span>
        );
      },
    },
    {
      header: "Active Investment",
      accessor: "amount",
      cell: (row) => (
        <span className="font-mono text-slate-200 font-bold">
          ${Number(row?.amount || 0).toFixed(2)}
        </span>
      ),
    },
    {
      header: "Daily %",
      accessor: "percentage",
      cell: (row) => (
        <span className="px-2 py-0.5 rounded-full font-bold text-xs bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
          {row?.percentage ? `${row.percentage}%` : "4.5%"}
        </span>
      ),
    },
    {
      header: "ROI Payout",
      accessor: "income",
      cell: (row) => (
        <span className="font-mono font-black text-emerald-400 text-sm">
          +${Number(row?.income || 0).toFixed(2)}
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
        <span className="text-xs text-slate-400 line-clamp-1 max-w-xs">
          {row?.remark || "Daily ROI dividend credited"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 mt-4">
      {/* ═══════════ TOP BANNER ═══════════ */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-[#061a38] to-slate-900 border border-cyan-500/25 p-6 md:p-8 shadow-2xl backdrop-blur-md">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-bold mb-2">
              <TrendingUp size={13} className="text-cyan-400" />
              4.5% – 7.5% Daily ROI • Maximum ROI Cap Up to 220%
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight font-['Orbitron',monospace]">
              Daily Trading ROI Hub
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
              Earnings are calculated according to your selected package tier and credited daily at{" "}
              <strong className="text-white">12:10 AM IST</strong>. All payouts continue up to the ecosystem{" "}
              <span className="text-amber-400 font-bold">220% Maximum ROI Cap</span>.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleExecuteDailyTrade}
              disabled={executingTrade}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-black flex items-center gap-1.5 transition active:scale-95 shadow-lg shadow-cyan-500/25 cursor-pointer disabled:opacity-50"
            >
              <Zap size={14} className={executingTrade ? "animate-spin" : "fill-slate-950"} />
              {executingTrade ? "Processing Trade..." : "Execute Daily Trade"}
            </button>
            <button
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>
            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <Download size={13} />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════ 1. OFFICIAL PACKAGE-BASED ROI STRUCTURE (IMAGE 1) ═══════════ */}
      <div className="rounded-3xl bg-[#030d1d] border border-cyan-500/25 p-6 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-5 border-b border-cyan-500/15">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400">
                  Veltrion Capital Official
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Package-Based ROI
                </span>
              </div>
              <h2 className="text-xl font-black text-white font-['Orbitron',monospace] mt-0.5">
                ROI & Maximum ROI Structure
              </h2>
            </div>
          </div>

          {currentActivePackage && (
            <div className="px-3.5 py-1.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-slate-300">Your Active Tier:</span>
              <strong className="text-xs font-mono font-black text-amber-300">
                {currentActivePackage.name} ({currentActivePackage.daily}/day)
              </strong>
            </div>
          )}
        </div>

        {/* 6 Package Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-5">
          {ROI_PACKAGES_DISPLAY.map((pkg) => {
            const Icon = pkg.icon;
            const isUserPackage = currentActivePackage?.name === pkg.name;

            return (
              <div
                key={pkg.name}
                className={`relative rounded-2xl p-4 transition-all duration-300 flex flex-col justify-between border bg-gradient-to-b ${pkg.cardBg} ${
                  isUserPackage
                    ? `${pkg.border} ${pkg.glow} ring-2 ring-cyan-400/50 scale-[1.02]`
                    : "border-slate-800/80 hover:border-slate-700"
                }`}
              >
                {isUserPackage && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[9px] font-black bg-cyan-500 text-slate-950 uppercase tracking-widest shadow-md">
                    Active
                  </span>
                )}

                <div className="text-center">
                  <div className="w-10 h-10 mx-auto rounded-xl bg-slate-900/80 border border-white/10 flex items-center justify-center text-white mb-2 shadow-inner">
                    <Icon className="w-5 h-5 text-amber-400" />
                  </div>
                  <h4 className="text-sm font-black text-white tracking-wide font-['Orbitron',monospace]">
                    {pkg.name}
                  </h4>
                  <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                    ${pkg.min.toLocaleString()} – ${pkg.max.toLocaleString()}
                  </p>
                </div>

                <div className="mt-3 pt-3 border-t border-white/10 text-center space-y-1">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Daily ROI</span>
                    <strong className="text-lg font-black text-emerald-400 font-mono">
                      {pkg.daily}
                    </strong>
                  </div>
                  <span className="inline-block text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900/60 text-slate-300 border border-white/5">
                    30D: {pkg.monthly}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 220% Max ROI Cap Strip & Rule Disclaimers */}
        <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-3 pt-4 border-t border-cyan-500/15">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-[#0c1f3d] to-cyan-500/15 border border-amber-500/30 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0">
                <Rocket className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block">
                  Capping Limit
                </span>
                <h4 className="text-base font-black text-white tracking-wide">
                  MAXIMUM ROI UP TO <span className="text-amber-300">220%</span>
                </h4>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block font-mono">Your Cap</span>
              <strong className="text-sm font-mono text-emerald-400">
                ${maxRoiCap.toFixed(2)}
              </strong>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
            <p className="text-[11px] leading-relaxed">
              Applicable ROI continues according to the selected package and remains subject to the overall maximum 220% ROI rules of the ecosystem.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
            <p className="text-[11px] leading-relaxed">
              ROI percentages describe the plan structure and continue daily until the 220% cap is achieved.
            </p>
          </div>
        </div>
      </div>

      {/* ═══════════ 2. FINANCIAL STAT CARDS ═══════════ */}
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

      {/* ═══════════ 3. FILTER TABS & SEARCH ═══════════ */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#030d1d] border border-cyan-500/20 p-3.5 rounded-2xl">
        <div className="flex items-center gap-2">
          {[
            { id: "all", label: `All Records (${historyList.length})` },
            { id: "today", label: "Today's Payouts" },
            { id: "daily", label: "Daily ROI Payouts" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTypeFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                typeFilter === tab.id
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-lg shadow-cyan-500/25 font-black"
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="text-xs font-mono text-slate-400">
          Showing <strong className="text-cyan-300">{filteredHistory.length}</strong> transactions
        </div>
      </div>

      {/* ═══════════ 4. DATA TABLE ═══════════ */}
      <DataTable
        title="Daily Trading ROI Dividend History"
        columns={columns}
        data={filteredHistory}
        pageSize={10}
      />
    </div>
  );
};

export default TradingIncomeHistory;
