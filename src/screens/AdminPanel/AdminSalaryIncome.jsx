import React, { useEffect, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import {
  Briefcase,
  Users,
  PlayCircle,
  Eye,
  CheckCircle,
  Clock,
  X,
  RefreshCw,
  Search,
  Filter,
  Calendar,
  Copy,
  Check,
  Download,
  DollarSign,
  Wallet,
  Crown,
  Zap,
  ShieldCheck,
  Award,
} from "lucide-react";
import { setLoading } from "../../redux/slices/loadingSlice";
import {
  getAdminSalaryIncomeAll,
  getAdminSalaryStatsApi,
  triggerWeeklySalaryCron,
} from "../../api/admin.api";
import DataTable from "../../components/Screen/UserPanel/DataTable";
import StatCard from "../../components/Screen/UserPanel/StatCard";



const STATUS_OPTIONS = ["All", "Completed", "Paid", "Pending", "Credited"];

const AdminSalaryIncome = () => {
  const dispatch = useDispatch();

  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState(null);
  const [summary, setSummary] = useState({ totalIncome: 0, todayTotal: 0 });
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalRecords: 0, limit: 50 });
  const [copiedText, setCopiedText] = useState(null);

  // Manual Trigger State
  const [showTriggerModal, setShowTriggerModal] = useState(false);
  const [triggering, setTriggering] = useState(false);

  // User Detail Modal
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchSalaryData = useCallback(async (p = 1, status = "All", search = "") => {
    try {
      dispatch(setLoading(true));
      const [incomeRes, statsRes] = await Promise.all([
        getAdminSalaryIncomeAll({
          page: p,
          limit: 50,
          status: status === "All" ? undefined : status,
          search: search.trim() || undefined,
        }),
        getAdminSalaryStatsApi(),
      ]);

      if (incomeRes?.success) {
        const list = Array.isArray(incomeRes.data?.history)
          ? incomeRes.data.history
          : Array.isArray(incomeRes.data)
          ? incomeRes.data
          : incomeRes.data?.records || [];
        setRecords(list);
        setSummary({
          totalIncome: Number(incomeRes.data?.totalIncome ?? 0),
          todayTotal: Number(incomeRes.data?.todayTotal ?? 0),
        });
        if (incomeRes.data?.pagination) {
          setPagination(incomeRes.data.pagination);
        }
      } else {
        toast.error(incomeRes?.message || "Failed to fetch salary records");
        setRecords([]);
      }

      if (statsRes?.success) {
        setStats(statsRes.data);
      }
    } catch (err) {
      console.error("Admin salary fetch error:", err);
      toast.error("Failed to load admin salary data");
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  useEffect(() => {
    fetchSalaryData(1, statusFilter, searchQuery);
  }, [fetchSalaryData, statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchSalaryData(1, statusFilter, searchQuery);
  };

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedText(key);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedText(null), 2000);
  };

  const exportCSV = () => {
    if (!records || records.length === 0) {
      toast.info("No records to export");
      return;
    }
    const headers = ["#", "Payout ID", "User ID", "Username", "Email", "Rank Name", "Weeks Paid", "Salary Amount ($)", "Date", "Status", "Remark"];
    const rows = records.map((r, idx) => [
      idx + 1,
      r?.id || r?._id || "",
      r?.user?.id || r?.userId?.id || r?.user || "",
      r?.user?.username || r?.username || "",
      r?.user?.email || r?.email || "",
      r?.user?.salaryRank?.rankName || r?.level || "Associate",
      `${r?.user?.salaryRank?.totalWeeksPaid || 0}/10`,
      Number(r?.income || r?.amount || 0).toFixed(2),
      r?.createdAt ? new Date(r.createdAt).toISOString() : "",
      r?.status || "Completed",
      `"${(r?.remark || "").replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Admin_Weekly_Salary_Payouts_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleManualTrigger = async () => {
    try {
      setTriggering(true);
      const res = await triggerWeeklySalaryCron();
      if (res?.success) {
        toast.success(res.message || "Weekly salary distribution executed successfully!");
        setShowTriggerModal(false);
        fetchSalaryData(1, statusFilter, searchQuery);
      } else {
        toast.error(res?.message || "Failed to trigger salary distribution");
      }
    } catch (err) {
      console.error("Trigger salary error:", err);
      toast.error("An error occurred during salary distribution trigger");
    } finally {
      setTriggering(false);
    }
  };

  const totalDistributed = Number(
    stats?.totalSalaryDistributed ??
    summary?.totalIncome ??
    records.reduce((acc, curr) => acc + Number(curr.income || curr.amount || 0), 0)
  );

  const todayDistributed = Number(
    stats?.todaySalaryDistributed ??
    summary?.todayTotal ??
    0
  );

  const totalPayoutsCount = Number(
    stats?.totalPayoutsCount ??
    pagination?.totalRecords ??
    records.length
  );

  const eligibleLeadersCount = Number(
    stats?.eligibleRankHolders ??
    0
  );

  const cardData = [
    {
      title: "Total Salary Distributed",
      value: `$ ${totalDistributed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: "https://img.icons8.com/3d-fluency/94/money-bag.png",
      highlight: true,
    },
    {
      title: "Today's Distributed Salary",
      value: `$ ${todayDistributed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: "https://img.icons8.com/3d-fluency/94/receive-cash.png",
      highlight: todayDistributed > 0,
    },
    {
      title: "Total Salary Payouts",
      value: `${totalPayoutsCount} Completed Payouts`,
      icon: "https://img.icons8.com/3d-fluency/94/calendar.png",
    },
    {
      title: "Eligible Rank Holders",
      value: `${eligibleLeadersCount} Qualified Leaders`,
      icon: "https://img.icons8.com/3d-fluency/94/trophy.png",
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
      header: "User Details",
      accessor: "user",
      cell: (row) => {
        const u = row?.user || {};
        return (
          <div className="flex flex-col">
            <span className="font-bold text-white flex items-center gap-1">
              {u.username || row?.username || "Trader"}
              {u.id && <span className="text-[11px] font-mono text-cyan-400 font-normal">({u.id})</span>}
            </span>
            <span className="text-[11px] text-slate-400">{u.email || row?.email || "N/A"}</span>
          </div>
        );
      },
    },
    {
      header: "Salary Rank & Week",
      accessor: "rank",
      cell: (row) => {
        const u = row?.user || {};
        const rankName = u?.salaryRank?.rankName || row?.remark || "Associate";
        const weeksPaid = u?.salaryRank?.totalWeeksPaid || 1;
        const weeksLeft = u?.salaryRank?.weeksRemaining || 9;

        return (
          <div className="flex flex-col">
            <span className="font-bold text-amber-300 flex items-center gap-1">
              <Crown size={12} className="text-amber-400" />
              {u?.salaryRank?.rankName || "Rank Holder"}
            </span>
            <span className="text-[10px] text-slate-400">
              Week {weeksPaid}/10 ({weeksLeft} wks left)
            </span>
          </div>
        );
      },
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
      header: "Status",
      accessor: "status",
      cell: (row) => (
        <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          {row?.status || "Credited"}
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
      header: "Remark / Description",
      accessor: "remark",
      cell: (row) => (
        <span className="text-xs text-slate-300 line-clamp-1 max-w-xs">
          {row?.remark || "Weekly Salary for Associate"}
        </span>
      ),
    },
    {
      header: "Action",
      accessor: "action",
      cell: (row) => (
        <button
          onClick={() => setSelectedUser(row)}
          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-cyan-500/30 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
        >
          <Eye size={12} />
          View
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 mt-4">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800 p-6 md:p-8 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold mb-2">
              <Briefcase size={13} className="text-indigo-400" />
              15-Rank Weekly Salary System (Admin Control Terminal)
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Weekly Salary Management
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl">
              Track date-wise salary payouts distributed across all qualified users, inspect 50:30:20 leg volumes, and execute manual weekly salary cycles.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowTriggerModal(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-2 transition active:scale-95 shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              <Zap size={15} />
              Trigger Salary Payout Now
            </button>
            <button
              onClick={() => fetchSalaryData(1, statusFilter, searchQuery)}
              className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <RefreshCw size={13} />
              Refresh
            </button>
            <button
              onClick={exportCSV}
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
        <form onSubmit={handleSearch} className="w-full md:w-96 flex items-center gap-2">
          <div className="relative w-full">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search by username, email, or user ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-slate-500 outline-none focus:border-cyan-500/50"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition cursor-pointer"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <span className="text-xs font-bold text-slate-400 whitespace-nowrap">Filter Status:</span>
          {STATUS_OPTIONS.map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                statusFilter === st
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-950 border border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Salary Records Table */}
      <DataTable
        title="All Salary Payout Records"
        columns={columns}
        data={records}
        pageSize={15}
      />

      {/* Manual Salary Execution Modal */}
      {showTriggerModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Zap className="text-emerald-400" size={18} />
                Confirm Salary Distribution
              </h3>
              <button
                onClick={() => setShowTriggerModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to execute the weekly salary distribution now?
              This will evaluate all user qualifying ranks (50:30:20 leg business) and credit weekly salary rewards for the current week cycle.
            </p>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <p>• Endpoint: <strong className="text-cyan-400">/api/admin/salary/trigger-salary-admin</strong></p>
              <p>• Payout Type: <strong className="text-emerald-400">Weekly Salary Income (10 Weeks Duration)</strong></p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowTriggerModal(false)}
                disabled={triggering}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleManualTrigger}
                disabled={triggering}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                {triggering ? <RefreshCw className="animate-spin" size={14} /> : <Zap size={14} />}
                {triggering ? "Executing..." : "Confirm & Execute"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Payout Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Award className="text-amber-400" size={18} />
                User Salary Payout Details
              </h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">User ID:</span>
                <span className="font-mono font-bold text-white">{selectedUser?.user?.id || selectedUser?.userId?.id || selectedUser?.user || "N/A"}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Username:</span>
                <span className="font-semibold text-cyan-400">{selectedUser?.user?.username || selectedUser?.username || "N/A"}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Email:</span>
                <span className="font-mono text-slate-300">{selectedUser?.user?.email || selectedUser?.email || "N/A"}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Salary Amount:</span>
                <span className="font-mono font-black text-emerald-400 text-sm">+${Number(selectedUser?.income || selectedUser?.amount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Salary Rank:</span>
                <span className="font-bold text-amber-300">{selectedUser?.user?.salaryRank?.rankName || selectedUser?.level || "Associate"}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Payout Progress:</span>
                <span className="text-white">Week {selectedUser?.user?.salaryRank?.totalWeeksPaid || 1} of 10 ({selectedUser?.user?.salaryRank?.weeksRemaining || 9} remaining)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Credited At:</span>
                <span className="font-mono text-slate-300">{selectedUser?.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : "-"}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">Remark:</span>
                <span className="text-slate-300 text-right">{selectedUser?.remark || "Weekly Salary Income"}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-700 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSalaryIncome;
