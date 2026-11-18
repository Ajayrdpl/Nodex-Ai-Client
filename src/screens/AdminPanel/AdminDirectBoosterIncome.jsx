import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { useLocation } from "react-router-dom";
import {
  Rocket,
  Timer,
  Clock,
  Award,
  Zap,
  Users,
  Copy,
  Check,
  TrendingUp,
  RefreshCw,
  Download,
  DollarSign,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

import DataTable from "../../components/Screen/UserPanel/DataTable";
import StatCard from "../../components/Screen/UserPanel/StatCard";
import { setLoading } from "../../redux/slices/loadingSlice";
import { getAdminDirectBoosterIncomeApi } from "../../api/admin.api";
import { isToday } from "../../utils/helper";

const AdminDirectBoosterIncome = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const filterState = location?.state;

  const [allBoosterHistory, setAllBoosterHistory] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [todayTotal, setTodayTotal] = useState(0);
  const [copiedId, setCopiedId] = useState(null);
  const [activeFilter, setActiveFilter] = useState(filterState === "today" ? "today" : "all");
  const [refreshing, setRefreshing] = useState(false);

  const fetchAllData = useCallback(
    async (isManualRefresh = false) => {
      try {
        if (isManualRefresh) setRefreshing(true);
        else dispatch(setLoading(true));

        const response = await getAdminDirectBoosterIncomeApi();

        if (response?.success) {
          const list = Array.isArray(response?.data?.history)
            ? response.data.history
            : Array.isArray(response?.data)
            ? response.data
            : [];
          setAllBoosterHistory(list);
          setTotalIncome(Number(response?.data?.totalIncome || 0));
          setTodayTotal(Number(response?.data?.todayTotal || 0));
          if (isManualRefresh) toast.success("12% Direct Booster data refreshed");
        } else {
          setAllBoosterHistory([]);
        }
      } catch (err) {
        console.error("Admin Direct Booster Fetch Error:", err);
        toast.error("Failed to fetch Direct Booster reports");
        setAllBoosterHistory([]);
      } finally {
        if (isManualRefresh) setRefreshing(false);
        else dispatch(setLoading(false));
      }
    },
    [dispatch]
  );

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportCSV = () => {
    if (!filteredHistory.length) {
      toast.info("No records to export");
      return;
    }

    const headers = [
      "#",
      "Payout ID",
      "Sponsor User",
      "Direct Investor",
      "Investment Amount ($)",
      "Rate (%)",
      "Booster Income ($)",
      "Status",
      "Date & Time",
      "Remark",
    ];

    const rows = filteredHistory.map((item, idx) => [
      idx + 1,
      item.id || item._id || "",
      item?.user?.username || item?.user?.id || "N/A",
      item?.fromUser?.username || item?.fromUser?.id || "N/A",
      Number(item.amount || 0).toFixed(2),
      "12%",
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
      `admin_direct_booster_report_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV export downloaded successfully!");
  };

  const filteredHistory = useMemo(() => {
    if (activeFilter === "today") {
      return allBoosterHistory.filter((item) => isToday(new Date(item.createdAt)));
    }
    return allBoosterHistory;
  }, [allBoosterHistory, activeFilter]);

  const calculatedTotal =
    totalIncome || allBoosterHistory.reduce((s, i) => s + Number(i.income || 0), 0);
  const calculatedToday =
    todayTotal ||
    allBoosterHistory
      .filter((i) => isToday(new Date(i.createdAt)))
      .reduce((s, i) => s + Number(i.income || 0), 0);

  const cardData = [
    {
      title: "Total 12% Booster Distributed",
      value: `$${Number(calculatedTotal).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: "https://img.icons8.com/3d-fluency/94/rocket.png",
      highlight: calculatedTotal > 0,
    },
    {
      title: "Today's Distributed Booster",
      value: `$${Number(calculatedToday).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: "https://img.icons8.com/3d-fluency/94/receive-cash.png",
      highlight: calculatedToday > 0,
    },
    {
      title: "Total Booster Payouts",
      value: `${allBoosterHistory.length} Transactions`,
      icon: "https://img.icons8.com/3d-fluency/94/layers.png",
      highlight: allBoosterHistory.length > 0,
    },
    {
      title: "Booster Bonus Rate",
      value: "12% Flat (24h Window)",
      icon: "https://img.icons8.com/3d-fluency/94/trophy.png",
      highlight: true,
    },
  ];

  const columns = [
    {
      header: "S/N",
      accessor: "_id",
      cell: (_, rowIndex) => (
        <span className="font-medium text-slate-400">{rowIndex + 1}</span>
      ),
    },
    {
      header: "Payout ID",
      accessor: "id",
      cell: (row) => (
        <div className="flex items-center gap-1.5 font-mono text-xs text-amber-400 font-semibold">
          <span>{row.id || String(row._id).slice(-8).toUpperCase()}</span>
          <button
            onClick={() => handleCopy(row.id || row._id, row._id)}
            className="text-slate-500 hover:text-amber-300 transition cursor-pointer"
            title="Copy ID"
          >
            {copiedId === row._id ? (
              <Check size={12} className="text-emerald-400" />
            ) : (
              <Copy size={12} />
            )}
          </button>
        </div>
      ),
    },
    {
      header: "Sponsor (Recipient)",
      accessor: "user.username",
      cell: (row) => (
        <div>
          <div className="font-bold text-white text-xs">
            {row?.user?.username || row?.user?.id || "N/A"}
          </div>
          <div className="text-[10px] font-mono text-slate-400">
            {row?.user?.email || (row?.user?.account ? `${row.user.account.slice(0, 6)}...` : "")}
          </div>
        </div>
      ),
    },
    {
      header: "Direct Investor (From)",
      accessor: "fromUser.username",
      cell: (row) => (
        <div>
          <div className="font-bold text-amber-300 text-xs">
            {row?.fromUser?.username || row?.fromUser?.id || "Direct Partner"}
          </div>
          <div className="text-[10px] font-mono text-slate-400">
            {row?.fromUser?.account ? `${row.fromUser.account.slice(0, 6)}...` : "—"}
          </div>
        </div>
      ),
    },
    {
      header: "Investment ($)",
      accessor: "amount",
      cell: (row) => (
        <span className="font-mono font-bold text-slate-200">
          ${Number(row.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      header: "Rate",
      accessor: "percentage",
      cell: () => (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 border border-amber-500/40">
          <Zap size={11} className="fill-amber-400" />
          12%
        </span>
      ),
    },
    {
      header: "Booster Payout",
      accessor: "income",
      cell: (row) => (
        <span className="font-mono font-black text-amber-400 text-sm">
          +${Number(row.income || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      cell: (row) => (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
          <CheckCircle2 size={11} />
          {row.status || "Completed"}
        </span>
      ),
    },
    {
      header: "Date & Time",
      accessor: "createdAt",
      cell: (row) => (
        <span className="text-xs font-mono text-slate-400">
          {row.createdAt ? new Date(row.createdAt).toLocaleString() : "—"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 mt-4">
      {/* ═══════════ TOP BANNER & CONTROLS ═══════════ */}
      <div className="bg-gradient-to-r from-slate-900 via-[#191508] to-slate-900 border border-amber-500/30 rounded-3xl p-6 shadow-2xl backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold mb-2">
            <Clock size={13} className="text-amber-400" />
            01b. 12% Direct Booster Income Engine • 24-Hour Golden Window
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white font-['Orbitron',monospace]">
            Direct Booster Income (12%) Analytics
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl">
            Real-time audit log of all 12% Direct Booster payouts distributed to sponsors whose direct referrals joined and invested within their initial 24-hour activation window.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => fetchAllData(true)}
            disabled={refreshing}
            className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition flex items-center gap-2 cursor-pointer text-xs font-bold"
            title="Refresh Logs"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition flex items-center gap-2 cursor-pointer text-xs font-bold"
            title="Export CSV"
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </div>

      {/* ═══════════ 24-HOUR GOLDEN WINDOW RULE STRIP ═══════════ */}
      <div className="bg-[#030d1d] border border-amber-500/25 rounded-2xl p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs mb-3 pb-2 border-b border-amber-500/10">
          <span className="font-mono text-amber-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Timer size={14} className="text-amber-400" />
            12% Direct Booster Qualification Logic & Rules
          </span>
          <span className="text-slate-400 font-mono text-[11px]">
            Window Duration: <strong className="text-amber-300">24 Hours from Activation</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 mb-1">
              <Award className="w-4 h-4 text-amber-400" />
              <strong className="text-white">Rule 1: Sponsor Active ID</strong>
            </div>
            <p className="text-slate-400 text-[11px]">
              Sponsor must have an active ID ($10+) to be eligible for direct rewards.
            </p>
          </div>

          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-amber-400" />
              <strong className="text-white">Rule 2: 24-Hour Golden Window</strong>
            </div>
            <p className="text-slate-400 text-[11px]">
              Directs who invest within 24h of sponsor's activation trigger 12% Booster.
            </p>
          </div>

          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-amber-400" />
              <strong className="text-white">Rule 3: After 24 Hours</strong>
            </div>
            <p className="text-slate-400 text-[11px]">
              Direct referrals investing after 24h receive standard 10% direct income.
            </p>
          </div>
        </div>
      </div>

      {/* ═══════════ STAT CARDS ═══════════ */}
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

      {/* ═══════════ FILTER TABS & COUNT ═══════════ */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#030d1d] border border-amber-500/20 p-3.5 rounded-2xl">
        <div className="flex items-center gap-2">
          {[
            { id: "all", label: `All Booster Payouts (${allBoosterHistory.length})` },
            { id: "today", label: "Today's Payouts" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeFilter === tab.id
                  ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-lg shadow-amber-500/25 font-black"
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="text-xs font-mono text-slate-400">
          Showing <strong className="text-amber-300">{filteredHistory.length}</strong> transactions
        </div>
      </div>

      {/* ═══════════ DATA TABLE ═══════════ */}
      <DataTable
        title="12% Direct Booster Income Distribution Log (Network-Wide)"
        columns={columns}
        data={filteredHistory}
        pageSize={10}
      />
    </div>
  );
};

export default AdminDirectBoosterIncome;

