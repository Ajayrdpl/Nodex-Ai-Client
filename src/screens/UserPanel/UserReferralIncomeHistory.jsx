import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Copy,
  Check,
  TrendingUp,
  Users,
  Wallet,
  ArrowUpRight,
  Sparkles,
  RefreshCw,
  Download,
  Share2,
  DollarSign,
  UserCheck,
  Zap,
} from "lucide-react";

import DataTable from "../../components/Screen/UserPanel/DataTable";
import StatCard from "../../components/Screen/UserPanel/StatCard";
import { setLoading } from "../../redux/slices/loadingSlice";
import {
  getReferralIncomeHistoryApi,
  getReferralIncomeSummaryApi,
  getAvailableIncomeBalance,
} from "../../api/user.api";
import { getIncomeTotal } from "../../api/auth.api";
import { isToday } from "../../utils/helper";
import { AuthenticatedUserRouters } from "../../constants/routes";

const UserReferralIncomeHistory = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const filterState = location?.state;

  const [allReferralHistory, setAllReferralHistory] = useState([]);
  const [referralSummary, setReferralSummary] = useState(null);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [balanceData, setBalanceData] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeFilter, setActiveFilter] = useState(filterState === "today" ? "today" : "all");
  const [refreshing, setRefreshing] = useState(false);

  const userInfo = useSelector((state) => state?.isLoggedUser?.data);

  const fetchData = useCallback(async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      else dispatch(setLoading(true));

      const [historyRes, summaryRes, statsRes, balanceRes] = await Promise.allSettled([
        getReferralIncomeHistoryApi({ page: 1, limit: 100 }),
        getReferralIncomeSummaryApi(),
        getIncomeTotal(),
        getAvailableIncomeBalance(),
      ]);

      // 1. Referral Income History List
      if (historyRes.status === "fulfilled" && historyRes.value?.success) {
        const list = Array.isArray(historyRes.value?.data?.history)
          ? historyRes.value.data.history
          : Array.isArray(historyRes.value?.data)
            ? historyRes.value.data
            : [];
        setAllReferralHistory(list);
      } else {
        setAllReferralHistory([]);
      }

      // 2. Referral Summary API (/user/referral-income/summary)
      if (summaryRes.status === "fulfilled" && summaryRes.value?.success) {
        setReferralSummary(summaryRes.value?.data || {});
      }

      // 3. Dashboard Stats
      if (statsRes.status === "fulfilled" && statsRes.value?.success) {
        setDashboardStats(statsRes.value);
      }

      // 4. Balance Data
      if (balanceRes.status === "fulfilled" && balanceRes.value?.success) {
        setBalanceData(balanceRes.value?.data);
      }

      if (isManualRefresh) {
        toast.success("Referral income data refreshed");
      }
    } catch (err) {
      console.error("Error fetching referral income:", err);
      toast.error("Failed to fetch referral income history");
      setAllReferralHistory([]);
    } finally {
      if (isManualRefresh) setRefreshing(false);
      else dispatch(setLoading(false));
    }
  }, [dispatch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Transaction ID copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const userRefId = userInfo?.id || userInfo?.username || "PEH000001";
  const referralLink = `${window.location.origin}/register?referral=${encodeURIComponent(userRefId)}`;

  const copyReferral = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    toast.success("Referral link copied!");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleExportCSV = () => {
    if (!allReferralHistory.length) {
      toast.info("No referral data to export");
      return;
    }

    const headers = ["#", "Transaction ID", "From User ID", "From Username", "Package Amount ($)", "Rate (%)", "Referral Bonus ($)", "Status", "Date", "Remark"];
    const rows = allReferralHistory.map((item, idx) => [
      idx + 1,
      item.id || item._id || "",
      item?.fromUser?.id || "",
      item?.fromUser?.username || item?.fromUser?.account || "Downline Partner",
      Number(item.amount || 0).toFixed(2),
      item.percentage || 12,
      Number(item.income || 0).toFixed(2),
      item.status || "Completed",
      item.createdAt ? new Date(item.createdAt).toLocaleString() : "",
      `"${(item.remark || "Direct Referral Income 12%").replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `direct_referral_income_history_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter Data
  const filteredHistory = allReferralHistory.filter((item) => {
    if (activeFilter === "today") {
      return isToday(new Date(item?.createdAt));
    }
    return true;
  });

  // Derived Stats
  const totalReferral = Number(
    referralSummary?.totalEarned ??
    dashboardStats?.incomes?.referral?.total ??
    dashboardStats?.data?.totalReferral ??
    allReferralHistory.reduce((acc, curr) => acc + Number(curr.income || 0), 0)
  );

  const todayReferral = Number(
    dashboardStats?.incomes?.referral?.today ??
    dashboardStats?.data?.todayReferral ??
    allReferralHistory
      .filter((i) => isToday(new Date(i.createdAt)))
      .reduce((acc, curr) => acc + Number(curr.income || 0), 0)
  );

  const directPartnersCount = Number(
    referralSummary?.directReferrals ??
    referralSummary?.totalReferrals ??
    dashboardStats?.data?.partners ??
    dashboardStats?.user?.directs ??
    dashboardStats?.data?.partnerActive ??
    0
  );

  const totalTeamCount = Number(
    referralSummary?.totalTeam ??
    dashboardStats?.data?.totalDownlineUsers ??
    dashboardStats?.data?.partners ??
    0
  );

  const cardData = [
    {
      title: "Total Referral Bonus (12%)",
      value: `$ ${totalReferral.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: "https://img.icons8.com/3d-fluency/94/stack-of-coins.png",
      highlight: true,
    },
    {
      title: "Today's Referral Income",
      value: `$ ${todayReferral.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: "https://img.icons8.com/3d-plastilina/69/share--v1.png",
      highlight: todayReferral > 0,
    },
    {
      title: "Direct Active Partners",
      value: `${directPartnersCount} Partners`,
      icon: "https://img.icons8.com/3d-fluency/94/group.png",
      path: AuthenticatedUserRouters.MY_REFERRALS,
    },
    {
      title: "Total Downline Team",
      value: `${totalTeamCount} Members`,
      icon: "https://img.icons8.com/3d-fluency/94/conference-call.png",
      path: AuthenticatedUserRouters.MY_TEAM_DIVISION,
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
      header: "From Partner",
      accessor: "fromUser",
      cell: (row) => {
        const from = row?.fromUser || {};
        return (
          <div className="flex flex-col">
            <span className="font-bold text-white flex items-center gap-1">
              {from.username || row?.fromUsername || "Downline Partner"}
              {from.id && <span className="text-[11px] font-mono text-cyan-400">({from.id})</span>}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              Level {row?.level || "1"} Direct Downline
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
      header: "Referral Bonus",
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
    {
      header: "Remark",
      accessor: "remark",
      cell: (row) => (
        <span className="text-xs text-slate-300 line-clamp-1 max-w-xs font-medium">
          {row?.remark || `12% Direct Referral Commission from ${row?.fromUser?.username || "downline"}`}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 mt-4">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800 p-6 md:p-8 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-bold mb-2">
              <Share2 size={13} className="text-cyan-400" />
              12% Instant Direct Referral Commission
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Direct Referral Income Hub
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl">
              Earn a flat <strong className="text-white">12% instant direct bonus</strong> on every activation package deposited by your directly sponsored partners.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            {/* Quick Referral Box */}
            <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 rounded-2xl p-2">
              <input
                type="text"
                readOnly
                value={referralLink}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 font-mono outline-none w-48"
              />
              <button
                onClick={copyReferral}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                {copiedLink ? <Check size={13} /> : <Copy size={13} />}
                {copiedLink ? "Copied" : "Copy"}
              </button>
            </div>

            <button
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>
            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-300 text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
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

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-slate-900/60 p-2 rounded-2xl border border-slate-800 w-fit">
        <button
          onClick={() => setActiveFilter("all")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${activeFilter === "all"
              ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20"
              : "text-slate-400 hover:text-white"
            }`}
        >
          All Payouts ({allReferralHistory.length})
        </button>
        <button
          onClick={() => setActiveFilter("today")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${activeFilter === "today"
              ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20"
              : "text-slate-400 hover:text-white"
            }`}
        >
          Today's Payouts ({allReferralHistory.filter((i) => isToday(new Date(i.createdAt))).length})
        </button>
      </div>

      {/* Referral History Data Table */}
      <DataTable
        title="Direct Referral Income History (10%)"
        columns={columns}
        data={filteredHistory}
        pageSize={15}
      />
    </div>
  );
};

export default UserReferralIncomeHistory;
