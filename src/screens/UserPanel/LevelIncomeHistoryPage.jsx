import React, { useEffect, useState, useMemo } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { useLocation } from "react-router-dom";
import {
  Award,
  TrendingUp,
  RefreshCw,
  Copy,
  Check,
  Download,
  Users,
  ShieldCheck,
  Sparkles,
  Filter,
  Unlock,
  Lock,
  CheckCircle2,
} from "lucide-react";

import DataTable from "../../components/Screen/UserPanel/DataTable";
import StatCard from "../../components/Screen/UserPanel/StatCard";
import { setLoading } from "../../redux/slices/loadingSlice";
import {
  getAllUserLevelIncomeHistory,
  getLevelInfoApi,
  getIncomeSummaryApi,
} from "../../api/user.api";
import { getIncomeTotal } from "../../api/auth.api";
import { isToday } from "../../utils/helper";

// Official NODEXAI 10-Level Rates (Total 24%)
const LEVEL_RATES_MAP = {
  1: { rate: "8.0%", color: "#00D2FF", badgeBg: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40" },
  2: { rate: "4.0%", color: "#38bdf8", badgeBg: "bg-sky-500/20 text-sky-300 border-sky-500/40" },
  3: { rate: "3.0%", color: "#60a5fa", badgeBg: "bg-blue-500/20 text-blue-300 border-blue-500/40" },
  4: { rate: "2.0%", color: "#facc15", badgeBg: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40" },
  5: { rate: "1.5%", color: "#fb923c", badgeBg: "bg-orange-500/20 text-orange-300 border-orange-500/40" },
  6: { rate: "1.5%", color: "#fb923c", badgeBg: "bg-orange-500/20 text-orange-300 border-orange-500/40" },
  7: { rate: "1.0%", color: "#c084fc", badgeBg: "bg-purple-500/20 text-purple-300 border-purple-500/40" },
  8: { rate: "1.0%", color: "#c084fc", badgeBg: "bg-purple-500/20 text-purple-300 border-purple-500/40" },
  9: { rate: "1.0%", color: "#f472b6", badgeBg: "bg-pink-500/20 text-pink-300 border-pink-500/40" },
  10: { rate: "1.0%", color: "#f472b6", badgeBg: "bg-pink-500/20 text-pink-300 border-pink-500/40" },
};

const LevelIncomeHistoryPage = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navState = location?.state;

  const [allLevelIncomeHistory, setAllLevelIncomeHistory] = useState([]);
  const [levelInfo, setLevelInfo] = useState(null);
  const [totalStats, setTotalStats] = useState({ totalIncome: 0, todayTotal: 0 });
  const [summaryData, setSummaryData] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [activeDateFilter, setActiveDateFilter] = useState(navState === "today" ? "today" : "all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  const fetchAllData = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else dispatch(setLoading(true));

      const [historyRes, levelInfoRes, summaryRes, statsRes] = await Promise.allSettled([
        getAllUserLevelIncomeHistory(),
        getLevelInfoApi(),
        getIncomeSummaryApi(),
        getIncomeTotal(),
      ]);

      if (historyRes.status === "fulfilled" && historyRes.value?.success) {
        const list = Array.isArray(historyRes.value?.data?.history)
          ? historyRes.value.data.history
          : Array.isArray(historyRes.value?.data)
          ? historyRes.value.data
          : [];
        setAllLevelIncomeHistory(list);
        setTotalStats({
          totalIncome: Number(historyRes.value?.data?.totalIncome ?? 0),
          todayTotal: Number(historyRes.value?.data?.todayTotal ?? 0),
        });
      } else {
        setAllLevelIncomeHistory([]);
      }

      if (levelInfoRes.status === "fulfilled" && levelInfoRes.value?.success) {
        setLevelInfo(levelInfoRes.value.data);
      }

      const mergedSummary = {
        ...(statsRes.status === "fulfilled" ? statsRes.value?.data || statsRes.value : {}),
        ...(summaryRes.status === "fulfilled" ? summaryRes.value?.data || summaryRes.value : {}),
      };
      setSummaryData(mergedSummary);

      if (isManual) {
        toast.success("10-Level income data refreshed");
      }
    } catch (err) {
      console.error("10-Level fetch error:", err);
      toast.error("Failed to fetch 10-Level income history");
      setAllLevelIncomeHistory([]);
    } finally {
      if (isManual) setRefreshing(false);
      else dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportCSV = () => {
    if (!filteredIncomeHistory.length) {
      toast.info("No level income records to export");
      return;
    }

    const headers = [
      "#",
      "Transaction ID",
      "Level",
      "From User",
      "Downline ROI Amount ($)",
      "Commission (%)",
      "Level Income ($)",
      "Status",
      "Date",
      "Remark",
    ];
    const rows = filteredIncomeHistory.map((item, idx) => [
      idx + 1,
      item.id || item._id || "",
      `Level ${item.level || 1}`,
      item?.fromUser?.username || item?.fromUser?.id || "Downline",
      Number(item.amount || 0).toFixed(2),
      `${item.percentage || 0}%`,
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
      `10_level_income_history_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Dual Filtering: Date Filter + Level Filter
  const filteredIncomeHistory = useMemo(() => {
    return allLevelIncomeHistory.filter((item) => {
      // Date filter
      if (activeDateFilter === "today" && !isToday(new Date(item.createdAt))) {
        return false;
      }
      // Level filter
      if (selectedLevel !== "all" && String(item.level) !== String(selectedLevel)) {
        return false;
      }
      return true;
    });
  }, [allLevelIncomeHistory, activeDateFilter, selectedLevel]);

  const totalLevelIncome = Number(
    summaryData?.totalLevelRoi ??
      totalStats.totalIncome ??
      allLevelIncomeHistory.reduce((acc, curr) => acc + Number(curr.income || 0), 0)
  );

  const todayLevelIncome = Number(
    summaryData?.todayLevelRoi ??
      totalStats.todayTotal ??
      allLevelIncomeHistory
        .filter((i) => isToday(new Date(i.createdAt)))
        .reduce((acc, curr) => acc + Number(curr.income || 0), 0)
  );

  const userInvestment = Number(levelInfo?.selfInvestment || 0);
  const isVipAutoUnlocked = Boolean(levelInfo?.isVipAutoUnlocked || userInvestment >= 500);
  const qualifiedDirects = Number(levelInfo?.qualifiedDirects || 0);
  const maxUnlocked = isVipAutoUnlocked ? 10 : Number(levelInfo?.maxUnlockedLevel ?? qualifiedDirects);

  const cardData = [
    {
      title: "Total 10-Level Income",
      value: `$ ${totalLevelIncome.toFixed(2)}`,
      icon: "https://cdn-icons-png.flaticon.com/512/10102/10102408.png",
      highlight: true,
    },
    {
      title: "Today 10-Level Income",
      value: `$ ${todayLevelIncome.toFixed(2)}`,
      icon: "https://img.icons8.com/isometric/50/economic-improvement--v1.png",
    },
    {
      title: "Active Directs",
      value: isVipAutoUnlocked ? "10 / 10 (VIP)" : `${qualifiedDirects} / 10`,
      icon: "https://img.icons8.com/3d-fluency/94/group.png",
    },
    {
      title: "Unlocked Level:",
      value: isVipAutoUnlocked ? "All 10 Levels (VIP)" : maxUnlocked > 0 ? `Level 1 - L${maxUnlocked}` : "Locked",
      icon: "https://img.icons8.com/3d-fluency/94/trophy.png",
    },
  ];

  const columns = [
    {
      header: "S/N",
      accessor: "_id",
      cell: (_, rowIndex) => (
        <span className="font-semibold text-slate-400 font-mono">{rowIndex + 1}</span>
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
      header: "Level",
      accessor: "level",
      cell: (row) => {
        const lvl = parseInt(row?.level || 1);
        const meta = LEVEL_RATES_MAP[lvl] || { rate: `${row?.percentage || 0}%`, badgeBg: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" };
        return (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black uppercase font-mono tracking-wider border ${meta.badgeBg}`}
          >
            Level {lvl < 10 ? `0${lvl}` : lvl} ({meta.rate})
          </span>
        );
      },
    },
    {
      header: "From Downline",
      accessor: "fromUser",
      cell: (row) => (
        <div className="text-xs">
          <div className="font-bold text-white">
            {row?.fromUser?.username || (typeof row?.fromUser === "string" ? row?.fromUser : "Downline Member")}
          </div>
          {row?.fromUser?.id && (
            <div className="text-[10px] text-slate-400 font-mono">ID: {row?.fromUser?.id}</div>
          )}
        </div>
      ),
    },
    {
      header: "Downline ROI ($)",
      accessor: "amount",
      cell: (row) => (
        <span className="font-mono text-slate-200 font-bold">
          ${Number(row?.amount || 0).toFixed(2)}
        </span>
      ),
    },
    {
      header: "Rate (%)",
      accessor: "percentage",
      cell: (row) => (
        <span className="font-bold text-cyan-400 font-mono">
          {row?.percentage ? `${row.percentage}%` : "-"}
        </span>
      ),
    },
    {
      header: "Level Dividend",
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
        <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
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
  ];

  return (
    <div className="space-y-6 mt-4 text-white">
      {/* ═══════════════ HEADER BANNER ═══════════════ */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#071733] via-[#041026] to-[#020817] border border-cyan-500/25 p-6 md:p-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-bold mb-2 font-mono">
              <Award size={13} className="text-cyan-400" />
              10-Level Community Income Matrix • Total 24%
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight font-['Orbitron',sans-serif]">
              10-Level Income Reports
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Earn structured multi-level dividend yields from your entire community level across 10 generations (L1: 8%, L2: 4%, L3: 3%, L4: 2%, L5-6: 1.5%, L7-10: 1% • 24% Total Distribution).
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => fetchAllData(true)}
              disabled={refreshing}
              className="px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-cyan-500/30 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer font-mono"
            >
              <RefreshCw size={13} className={refreshing ? "animate-spin text-cyan-400" : "text-cyan-400"} />
              Refresh
            </button>
            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 border border-cyan-400/40 text-white text-xs font-black flex items-center gap-1.5 transition active:scale-95 cursor-pointer font-['Orbitron',sans-serif] shadow-[0_0_15px_rgba(0,210,255,0.3)]"
            >
              <Download size={13} />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════ STAT CARDS ═══════════════ */}
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

      {/* ═══════════════ LEVEL UNLOCKING RULE & CONDITION (OFFICIAL BOXES) ═══════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Box 1: Level Unlock Condition (Blue) */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#061833] via-[#041026] to-[#020817] border border-cyan-500/40 shadow-[0_0_25px_rgba(0,210,255,0.15)] flex flex-col justify-between">
          <div className="flex items-center gap-2.5 pb-3 border-b border-cyan-500/20 mb-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300">
              <Users className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-extrabold uppercase tracking-wider text-cyan-300 font-['Orbitron',sans-serif]">
              LEVEL UNLOCK CONDITION
            </h4>
          </div>

          <div className="space-y-2.5 font-mono text-xs">
            <div className="flex justify-between items-center p-3 rounded-xl bg-[#020817] border border-cyan-500/20">
              <span className="text-slate-300 font-bold">1 Active Direct</span>
              <span className="text-cyan-400 font-black">➔ 1 Level Unlock</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-[#020817] border border-cyan-500/20">
              <span className="text-slate-300 font-bold">10 Active Directs</span>
              <span className="text-emerald-400 font-black">➔ All 10 Levels Unlock</span>
            </div>
          </div>
        </div>

        {/* Box 2: Level Unlocking Rule (Gold) */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#1a1205] via-[#0c0903] to-[#020817] border border-amber-500/40 shadow-[0_0_25px_rgba(245,158,11,0.15)] flex flex-col justify-between">
          <div className="flex items-center gap-2.5 pb-3 border-b border-amber-500/20 mb-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
              <Unlock className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-extrabold uppercase tracking-wider text-amber-300 font-['Orbitron',sans-serif]">
              LEVEL UNLOCKING RULE
            </h4>
          </div>

          <div className="p-3.5 rounded-xl bg-[#020817] border border-amber-500/30 text-center space-y-1">
            <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 block">
              JOIN WITH
            </span>
            <div className="text-xl sm:text-2xl font-black text-amber-300 font-['Orbitron',sans-serif] tracking-wider">
              $500 OR ABOVE
            </div>
            <span className="text-xs font-bold text-emerald-400 font-mono block">
              ALL 10 LEVELS AUTOMATICALLY UNLOCKED
            </span>
          </div>
        </div>
      </div>

      {/* ═══════════════ LEVEL  FILTER PILLS ═══════════════ */}
      <div className="p-4 rounded-2xl bg-[#030d1d] border border-cyan-500/25 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300 font-mono">
            <Filter className="w-4 h-4 text-cyan-400" />
            <span>Filter by Generation Level:</span>
          </div>

          {/* Date Toggle */}
          <div className="flex items-center gap-1.5 self-start sm:self-center">
            <button
              onClick={() => setActiveDateFilter("all")}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                activeDateFilter === "all"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/50"
                  : "bg-slate-900 text-slate-400 hover:text-white"
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setActiveDateFilter("today")}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition cursor-pointer ${
                activeDateFilter === "today"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-400/50"
                  : "bg-slate-900 text-slate-400 hover:text-white"
              }`}
            >
              Today Only
            </button>
          </div>
        </div>

        {/* 10 Level Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <button
            onClick={() => setSelectedLevel("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer ${
              selectedLevel === "all"
                ? "bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(0,210,255,0.4)]"
                : "bg-slate-900/90 text-slate-400 hover:text-white border border-white/5"
            }`}
          >
            All 10 Levels ({allLevelIncomeHistory.length})
          </button>

          {Object.entries(LEVEL_RATES_MAP).map(([lvl, meta]) => {
            const count = allLevelIncomeHistory.filter((i) => String(i.level) === String(lvl)).length;
            const isSelected = selectedLevel === String(lvl);
            return (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(String(lvl))}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer flex items-center gap-1.5 border ${
                  isSelected
                    ? "bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-[0_0_12px_rgba(0,210,255,0.3)]"
                    : "bg-[#020817] text-slate-400 hover:text-white border-white/5 hover:border-cyan-500/30"
                }`}
              >
                <span>L{lvl}</span>
                <span className="text-[10px] text-amber-400">({meta.rate})</span>
                {count > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] text-slate-300">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══════════════ DATA TABLE ═══════════════ */}
      <DataTable
        title={`10-Level Community Income Records ${selectedLevel !== "all" ? `(Level ${selectedLevel} Only)` : ""}`}
        columns={columns}
        data={filteredIncomeHistory}
        pageSize={10}
      />
    </div>
  );
};

export default LevelIncomeHistoryPage;
