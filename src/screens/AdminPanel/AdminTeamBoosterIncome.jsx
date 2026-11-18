import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { useLocation } from "react-router-dom";
import {
  Trophy,
  Calendar,
  Clock,
  Award,
  Zap,
  Users,
  Copy,
  Check,
  TrendingUp,
  RefreshCw,
  Download,
  PlayCircle,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import Swal from "sweetalert2";

import DataTable from "../../components/Screen/UserPanel/DataTable";
import StatCard from "../../components/Screen/UserPanel/StatCard";
import { setLoading } from "../../redux/slices/loadingSlice";
import {
  getAdminTeamBoosterIncomeApi,
  triggerTeamBoosterDistributionApi,
} from "../../api/admin.api";
import { isToday } from "../../utils/helper";

const SLABS_DATA = [
  { slab: 1, target: 1000, bonus: 20 },
  { slab: 2, target: 2500, bonus: 60 },
  { slab: 3, target: 5000, bonus: 150 },
  { slab: 4, target: 10000, bonus: 350 },
  { slab: 5, target: 25000, bonus: 1000 },
  { slab: 6, target: 50000, bonus: 2250 },
  { slab: 7, target: 100000, bonus: 5000 },
];

const AdminTeamBoosterIncome = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const filterState = location?.state;

  const [allHistory, setAllHistory] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [todayTotal, setTodayTotal] = useState(0);
  const [copiedId, setCopiedId] = useState(null);
  const [activeFilter, setActiveFilter] = useState(filterState === "today" ? "today" : "all");
  const [refreshing, setRefreshing] = useState(false);
  const [triggering, setTriggering] = useState(false);

  const fetchAllData = useCallback(
    async (isManualRefresh = false) => {
      try {
        if (isManualRefresh) setRefreshing(true);
        else dispatch(setLoading(true));

        const response = await getAdminTeamBoosterIncomeApi();

        if (response?.success) {
          const list = Array.isArray(response?.data?.history)
            ? response.data.history
            : Array.isArray(response?.data)
            ? response.data
            : [];
          setAllHistory(list);
          setTotalIncome(Number(response?.data?.totalIncome || 0));
          setTodayTotal(Number(response?.data?.todayTotal || 0));
          if (isManualRefresh) toast.success("Booster Bonus logs refreshed");
        } else {
          setAllHistory([]);
        }
      } catch (err) {
        console.error("Admin Booster Bonus Fetch Error:", err);
        toast.error("Failed to fetch Booster Bonus reports");
        setAllHistory([]);
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

  const handleTriggerManualDistribution = async () => {
    const confirm = await Swal.fire({
      title: "Trigger 7-Days Booster Bonus Distribution?",
      html: `
        <div style="text-align: left; font-size: 13px; color: #cbd5e1; line-height: 1.6;">
          <p style="margin-bottom: 8px;">This will calculate the last 7-day team volume for all members and award:</p>
          <ul style="padding-left: 20px; list-style-type: disc; margin-bottom: 12px;">
            <li><strong>Self ID >= $100</strong> qualification check</li>
            <li><strong>Min 3 Active Directs ($100+ each)</strong> check</li>
            <li><strong>Highest Achieved Slab Bonus</strong> ($20 up to $5,000)</li>
          </ul>
          <p style="color: #fbbf24; font-weight: bold;">Are you sure you want to execute Monday cycle Booster Bonus distribution now?</p>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#f59e0b",
      cancelButtonColor: "#64748B",
      confirmButtonText: "Yes, Execute Booster Bonus",
    });

    if (!confirm.isConfirmed) return;

    try {
      setTriggering(true);
      const res = await triggerTeamBoosterDistributionApi();
      if (res?.success) {
        Swal.fire({
          icon: "success",
          title: "Booster Bonus Distributed",
          text: `Total $${res?.data?.totalDistributed || 0} distributed to ${res?.data?.recipientsCount || 0} users.`,
        });
        fetchAllData(true);
      } else {
        Swal.fire({
          icon: "error",
          title: "Execution Failed",
          text: res?.message || "Failed to execute distribution",
        });
      }
    } catch (err) {
      toast.error(err?.message || "Error executing distribution");
    } finally {
      setTriggering(false);
    }
  };

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
      "User ID",
      "Team Business ($)",
      "Booster Bonus ($)",
      "Status",
      "Date & Time",
      "Remark",
    ];

    const rows = filteredHistory.map((item, idx) => [
      idx + 1,
      item.id || item._id || "",
      item?.user?.username || item?.user?.id || "N/A",
      Number(item.amount || 0).toFixed(2),
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
      `admin_team_booster_report_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV export downloaded successfully!");
  };

  const filteredHistory = useMemo(() => {
    if (activeFilter === "today") {
      return allHistory.filter((item) => isToday(new Date(item.createdAt)));
    }
    return allHistory;
  }, [allHistory, activeFilter]);

  const calculatedTotal =
    totalIncome || allHistory.reduce((s, i) => s + Number(i.income || 0), 0);
  const calculatedToday =
    todayTotal ||
    allHistory
      .filter((i) => isToday(new Date(i.createdAt)))
      .reduce((s, i) => s + Number(i.income || 0), 0);

  const cardData = [
    {
      title: "Total Booster Bonus Distributed",
      value: `$${Number(calculatedTotal).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: "https://img.icons8.com/3d-fluency/94/trophy.png",
      highlight: calculatedTotal > 0,
    },
    {
      title: "Today's Booster Bonus",
      value: `$${Number(calculatedToday).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: "https://img.icons8.com/3d-fluency/94/receive-cash.png",
      highlight: calculatedToday > 0,
    },
    {
      title: "Total Booster Bonus Payouts",
      value: `${allHistory.length} Payouts`,
      icon: "https://img.icons8.com/3d-fluency/94/layers.png",
      highlight: allHistory.length > 0,
    },
    {
      title: "Cron Schedule",
      value: "Every Monday 12:05 AM IST",
      icon: "https://img.icons8.com/3d-fluency/94/calendar.png",
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
      header: "User / Recipient",
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
      header: "7-Day Team Volume",
      accessor: "amount",
      cell: (row) => (
        <span className="font-mono font-bold text-slate-200">
          ${Number(row.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      header: "Booster Bonus",
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
    {
      header: "Remark",
      accessor: "remark",
      cell: (row) => (
        <span className="text-xs text-slate-300 max-w-xs truncate block" title={row.remark}>
          {row.remark || "7-Days Team Booster Bonus"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 mt-4">
      {/* ═══════════ TOP BANNER & CONTROLS ═══════════ */}
      <div className="bg-gradient-to-r from-slate-900 via-[#1b1507] to-slate-900 border border-amber-500/30 rounded-3xl p-6 shadow-2xl backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold mb-2">
            <Calendar size={13} className="text-amber-400" />
            01c. 7-Days Booster Bonus Engine • Weekly Monday Cycle
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white font-['Orbitron',monospace]">
            Booster Bonus Analytics
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl">
            Automated weekly payouts execute every Monday at 12:05 AM IST based on completed 7-day team volume milestones ($20 up to $5,000 Booster Bonus).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleTriggerManualDistribution}
            disabled={triggering}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs transition shadow-lg shadow-amber-500/25 flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <PlayCircle size={15} />
            {triggering ? "Executing..." : "Distribute Booster Bonus Now"}
          </button>

          <button
            onClick={() => fetchAllData(true)}
            disabled={refreshing}
            className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
            title="Refresh Logs"
          >
            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
          </button>

          <button
            onClick={handleExportCSV}
            className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
            title="Export CSV"
          >
            <Download size={15} />
          </button>
        </div>
      </div>

      {/* ═══════════ SLABS STRIP & QUALIFICATION RULES ═══════════ */}
      <div className="bg-[#030d1d] border border-amber-500/25 rounded-2xl p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs mb-3 pb-2 border-b border-amber-500/10">
          <span className="font-mono text-amber-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Trophy size={14} className="text-amber-400" />
            Official 7-Days Booster Bonus Slabs Reference
          </span>
          <span className="text-slate-400 font-mono text-[11px]">
            Target Period: <strong className="text-amber-300">7 Days Completed Volume (Monday to Monday)</strong>
          </span>
        </div>

        {/* 6 Eligibility Criteria Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-3 text-[11px]">
          <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">1. Self ID</span>
            <strong className="text-white">$100 or above</strong>
          </div>
          <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">2. Directs</span>
            <strong className="text-white">Min 3 Directs</strong>
          </div>
          <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">3. Directs Size</span>
            <strong className="text-white">$100+ Each</strong>
          </div>
          <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">4. Duration</span>
            <strong className="text-amber-300">Within 7 Days</strong>
          </div>
          <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">5. Slab Payout</span>
            <strong className="text-white">Highest Only</strong>
          </div>
          <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">6. Reset Cron</span>
            <strong className="text-emerald-400">Monday 12:05 AM</strong>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {SLABS_DATA.map((slab) => (
            <div
              key={slab.slab}
              className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-center"
            >
              <div className="text-[10px] font-mono text-slate-400 font-bold uppercase">
                Slab 0{slab.slab}
              </div>
              <div className="text-xs font-bold text-white mt-0.5">
                ${slab.target.toLocaleString()}
              </div>
              <div className="text-sm font-black text-amber-400 font-mono mt-1 pt-1 border-t border-slate-800">
                +${slab.bonus}
              </div>
            </div>
          ))}
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
            { id: "all", label: `All Weekly Payouts (${allHistory.length})` },
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
        title="7-Days Booster Bonus Distribution Log (Network-Wide)"
        columns={columns}
        data={filteredHistory}
        pageSize={10}
      />
    </div>
  );
};

export default AdminTeamBoosterIncome;

