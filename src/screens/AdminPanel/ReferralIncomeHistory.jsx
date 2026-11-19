import React, { useEffect, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { useLocation } from "react-router-dom";
import {
  Copy,
  Check,
  TrendingUp,
  Sparkles,
  RefreshCw,
  Download,
  DatabaseZap,
  Search,
  Users,
  DollarSign,
  Share2,
} from "lucide-react";

import DataTable from "../../components/Screen/UserPanel/DataTable";
import StatCard from "../../components/Screen/UserPanel/StatCard";
import { setLoading } from "../../redux/slices/loadingSlice";
import {
  getAllReferralIncomeAdmin,
  getReferralIncomeStatsApi,
  syncMissingReferralBonuses,
} from "../../api/admin.api";
import { isToday } from "../../utils/helper";
import { AuthenticatedAdminRouters } from "../../constants/routes";

const ReferralIncomeHistory = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const filterState = location?.state;

  const [allReferralHistory, setAllReferralHistory] = useState([]);
  const [statsData, setStatsData] = useState(null);
  const [summaryData, setSummaryData] = useState({ totalPaid: 0, totalRecords: 0 });
  const [copiedId, setCopiedId] = useState(null);
  const [activeFilter, setActiveFilter] = useState(filterState === "today" ? "today" : "all");
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const fetchAllData = useCallback(async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      else dispatch(setLoading(true));

      const [historyRes, statsRes] = await Promise.allSettled([
        getAllReferralIncomeAdmin({ page: 1, limit: 100 }),
        getReferralIncomeStatsApi(),
      ]);

      if (historyRes.status === "fulfilled" && historyRes.value?.success) {
        const list = Array.isArray(historyRes.value?.data?.history)
          ? historyRes.value.data.history
          : Array.isArray(historyRes.value?.data)
          ? historyRes.value.data
          : [];
        setAllReferralHistory(list);
        setSummaryData({
          totalPaid: Number(historyRes.value?.summary?.totalPaid ?? historyRes.value?.data?.totalPaid ?? 0),
          totalRecords: Number(historyRes.value?.summary?.totalRecords ?? list.length),
        });
      } else {
        setAllReferralHistory([]);
      }

      if (statsRes.status === "fulfilled" && statsRes.value?.success) {
        setStatsData(statsRes.value.data);
      }

      if (isManualRefresh) {
        toast.success("Admin referral data refreshed");
      }
    } catch (err) {
      console.error("Failed to fetch referral income history:", err);
      toast.error("Failed to fetch referral income history");
      setAllReferralHistory([]);
    } finally {
      if (isManualRefresh) setRefreshing(false);
      else dispatch(setLoading(false));
    }
  }, [dispatch]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleSyncMissingBonuses = async () => {
    try {
      setSyncing(true);
      const res = await syncMissingReferralBonuses();
      if (res?.success) {
        toast.success(res?.message || "Missing referral bonuses synced successfully!");
        fetchAllData(true);
      } else {
        toast.error(res?.message || "Failed to sync referral bonuses");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || "Sync operation failed");
    } finally {
      setSyncing(false);
    }
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("ID copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportCSV = () => {
    if (!allReferralHistory.length) {
      toast.info("No referral data to export");
      return;
    }

    const headers = [
      "#",
      "Transaction ID",
      "Recipient Sponsor ID",
      "Recipient Username",
      "Recipient Email",
      "From Downline ID",
      "From Downline Username",
      "Package Amount ($)",
      "Rate (%)",
      "Referral Bonus ($)",
      "Status",
      "Date",
    ];
    const rows = allReferralHistory.map((item, idx) => [
      idx + 1,
      item.id || item._id || "",
      item?.user?.id || "",
      item?.user?.username || item?.user?.email || "Sponsor",
      item?.user?.email || "",
      item?.fromUser?.id || "",
      item?.fromUser?.username || "Downline",
      Number(item.amount || 0).toFixed(2),
      item.percentage || "12%",
      Number(item.income || 0).toFixed(2),
      item.status || "Completed",
      item.createdAt ? new Date(item.createdAt).toLocaleString() : "",
    ]);

    const csvContent = [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Admin_Direct_Referral_Incomes_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredHistory = allReferralHistory.filter((item) => {
    const matchesFilter =
      activeFilter === "today"
        ? isToday(new Date(item?.createdAt))
        : true;

    if (!matchesFilter) return false;
    if (!searchQuery.trim()) return true;

    const q = searchQuery.toLowerCase();
    const uName = (item?.user?.username || "").toLowerCase();
    const uEmail = (item?.user?.email || "").toLowerCase();
    const uId = (item?.user?.id || "").toLowerCase();
    const fName = (item?.fromUser?.username || "").toLowerCase();
    const fId = (item?.fromUser?.id || "").toLowerCase();
    const txId = (item?.id || item?._id || "").toLowerCase();

    return (
      uName.includes(q) ||
      uEmail.includes(q) ||
      uId.includes(q) ||
      fName.includes(q) ||
      fId.includes(q) ||
      txId.includes(q)
    );
  });

  const totalReferralAmount = Number(
    statsData?.totalPaid ??
    summaryData?.totalPaid ??
    allReferralHistory.reduce((acc, curr) => acc + Number(curr.income || 0), 0)
  );

  const todayReferralAmount = Number(
    statsData?.todayPaid ??
    allReferralHistory
      .filter((i) => isToday(new Date(i.createdAt)))
      .reduce((acc, curr) => acc + Number(curr.income || 0), 0)
  );

  const monthPaidAmount = Number(
    statsData?.monthPaid ??
    totalReferralAmount
  );

  const uniqueEarnersCount = Number(
    statsData?.uniqueEarners ??
    statsData?.uniqueReferrers ??
    1
  );

  const cardData = [
    {
      title: "Total Referral Distributed",
      value: `$ ${totalReferralAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: "https://img.icons8.com/3d-fluency/94/stack-of-coins.png",
      highlight: true,
    },
    {
      title: "Today's Distributed",
      value: `$ ${todayReferralAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: "https://img.icons8.com/3d-plastilina/69/share--v1.png",
      highlight: todayReferralAmount > 0,
    },
    {
      title: "Current Month Distributed",
      value: `$ ${monthPaidAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: "https://img.icons8.com/3d-fluency/94/calendar.png",
    },
    {
      title: "Unique Earners Count",
      value: `${uniqueEarnersCount} Earners`,
      icon: "https://img.icons8.com/3d-fluency/94/group.png",
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
      header: "Transaction ID",
      accessor: "id",
      cell: (row) => (
        <div className="flex items-center gap-1.5 font-mono text-xs text-cyan-400 font-semibold">
          <span>{row?.id || row?._id || "REF-ID"}</span>
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
      header: "Recipient Sponsor",
      accessor: "user",
      cell: (row) => {
        const u = row?.user || {};
        return (
          <div className="flex flex-col">
            <span className="font-bold text-white flex items-center gap-1">
              {u.username || row?.username || "Sponsor User"}
              {u.id && <span className="text-[11px] font-mono text-cyan-400 font-normal">({u.id})</span>}
            </span>
            <span className="text-[11px] text-slate-400">{u.email || "N/A"}</span>
          </div>
        );
      },
    },
    {
      header: "From Downline",
      accessor: "fromUser",
      cell: (row) => {
        const from = row?.fromUser || {};
        return (
          <div className="flex flex-col">
            <span className="font-semibold text-indigo-300 flex items-center gap-1">
              {from.username || "Downline User"}
              {from.id && <span className="text-[11px] font-mono text-slate-400">({from.id})</span>}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              Level 1 Direct Deposit
            </span>
          </div>
        );
      },
    },
    {
      header: "Package Amount",
      accessor: "amount",
      cell: (row) => (
        <span className="font-mono text-slate-200 text-xs font-semibold">
          ${Number(row?.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      header: "Rate",
      accessor: "percentage",
      cell: (row) => (
        <span className="px-2 py-0.5 rounded-full text-xs font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
          {row?.percentage ? `${row.percentage}%` : "12%"}
        </span>
      ),
    },
    {
      header: "Commission Paid",
      accessor: "income",
      cell: (row) => (
        <span className="font-mono font-black text-emerald-400 text-sm">
          +${Number(row?.income || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
  ];

  return (
    <div className="space-y-6 mt-4">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800 p-6 md:p-8 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-bold mb-2">
              <Share2 size={13} className="text-cyan-400" />
              5% Direct Referral Commission Distribution (Admin Records)
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              All Referral Income Distributions
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl">
              Real-time audit log of all 5% ($1.25 on $25 package) direct sponsor bonuses distributed across the platform with sender and recipient ledger entries.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleSyncMissingBonuses}
              disabled={syncing}
              className="px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <DatabaseZap size={13} className={syncing ? "animate-spin" : ""} />
              {syncing ? "Syncing..." : "Sync Missing Bonuses"}
            </button>
            <button
              onClick={() => fetchAllData(true)}
              disabled={refreshing}
              className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>
            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-300 text-xs font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
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

      {/* Search & Filter Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 backdrop-blur-md">
        <div className="relative w-full md:w-96">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by username, email, ID, or tx..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-slate-500 outline-none focus:border-cyan-500/50"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeFilter === "all"
                ? "bg-indigo-600 text-white"
                : "bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            All Payouts ({allReferralHistory.length})
          </button>
          <button
            onClick={() => setActiveFilter("today")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeFilter === "today"
                ? "bg-indigo-600 text-white"
                : "bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            Today ({allReferralHistory.filter((i) => isToday(new Date(i.createdAt))).length})
          </button>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        title="Direct Referral Income Audit Log"
        columns={columns}
        data={filteredHistory}
        pageSize={15}
      />
    </div>
  );
};

export default ReferralIncomeHistory;
