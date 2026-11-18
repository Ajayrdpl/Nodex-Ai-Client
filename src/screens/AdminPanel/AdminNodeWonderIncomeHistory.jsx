import React, { useEffect, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import {
  TrendingUp,
  Sparkles,
  RefreshCw,
  Search,
  Users,
  DollarSign,
  Copy,
  Check,
  Layers,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";

import DataTable from "../../components/Screen/UserPanel/DataTable";
import StatCard from "../../components/Screen/UserPanel/StatCard";
import { setLoading } from "../../redux/slices/loadingSlice";
import { getAdminNodeWonderIncomeHistoryApi } from "../../api/admin.api";
import Pagination from "../../components/Screen/UserPanel/Pagination";

const AdminNodeWonderIncomeHistory = () => {
  const dispatch = useDispatch();

  const [historyList, setHistoryList] = useState([]);
  const [summaryData, setSummaryData] = useState({
    totalIncome: 0,
    todayTotal: 0,
    totalRecords: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [copiedId, setCopiedId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(
    async (isManual = false) => {
      try {
        if (isManual) setRefreshing(true);
        else dispatch(setLoading(true));

        const res = await getAdminNodeWonderIncomeHistoryApi({
          page,
          limit: 20,
          search: searchQuery.trim(),
        });

        if (res?.success && res?.data) {
          setHistoryList(res.data.history || []);
          setSummaryData({
            totalIncome: res.data.totalIncome || 0,
            todayTotal: res.data.todayTotal || 0,
            totalRecords: res.data.totalRecords || 0,
          });
          setTotalPages(res.pagination?.totalPages || 1);
        } else {
          setHistoryList([]);
        }
      } catch (error) {
        console.error("getAdminNodeWonderIncomeHistory error:", error);
        toast.error("Failed to fetch admin Node Wonder income reports");
      } finally {
        dispatch(setLoading(false));
        setRefreshing(false);
      }
    },
    [dispatch, page, searchQuery]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const statCards = [
    {
      title: "Total Payouts Distributed",
      value: `$ ${Number(summaryData.totalIncome || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: "https://img.icons8.com/3d-fluency/94/bullish.png",
      subText: "Universal 2-ID Queue Payouts",
      highlight: true,
    },
    {
      title: "Today's Distributed Payouts",
      value: `$ ${Number(summaryData.todayTotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: "https://img.icons8.com/3d-fluency/94/money-box.png",
      subText: "Credited Today",
    },
    {
      title: "Total Completed Cycles",
      value: `${summaryData.totalRecords || 0} Cycles`,
      icon: "https://img.icons8.com/3d-fluency/94/checkmark.png",
      subText: "$150.00 each cycle",
    },
    {
      title: "Queue Matrix Model",
      value: "Universal 2-ID",
      icon: "https://img.icons8.com/3d-fluency/94/process.png",
      subText: "Single-leg company sequential",
    },
  ];

  const columns = [
    {
      header: "S/N",
      accessor: "_id",
      cell: (_, rowIndex) => (
        <span className="font-semibold text-slate-400">
          {(page - 1) * 20 + rowIndex + 1}
        </span>
      ),
    },
    {
      header: "Transaction ID",
      accessor: "id",
      cell: (row) => (
        <div className="flex items-center gap-1.5 font-mono text-xs text-purple-400 font-semibold">
          <span>{row?.id || row?._id?.substring(0, 10) || "NW-PAY"}</span>
          <button
            onClick={() => handleCopy(row?.id || row?._id, row?.id || row?._id)}
            className="text-slate-500 hover:text-purple-300 transition cursor-pointer"
          >
            {copiedId === (row?.id || row?._id) ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
          </button>
        </div>
      ),
    },
    {
      header: "Recipient User",
      accessor: "user",
      cell: (row) => {
        const u = row?.user || {};
        return (
          <div className="flex flex-col">
            <span className="font-bold text-white font-mono flex items-center gap-1">
              <span>@{u.username || "USER"}</span>
              {u.account && <span className="text-[10px] text-purple-300 font-mono">({u.account})</span>}
            </span>
            <span className="text-[10.5px] text-slate-400 font-mono">
              {u.email || "Node Wonder Member"}
            </span>
          </div>
        );
      },
    },
    {
      header: "Payout Amount",
      accessor: "income",
      cell: (row) => (
        <span className="font-extrabold text-emerald-400 font-mono text-sm">
          ${Number(row.income || 150).toFixed(2)} USDT
        </span>
      ),
    },
    {
      header: "Description",
      accessor: "description",
      cell: (row) => (
        <span className="text-xs text-slate-300 font-mono">
          {row.description || "Node Wonder 2-ID Queue completed payout"}
        </span>
      ),
    },
    {
      header: "Payout Date",
      accessor: "createdAt",
      cell: (row) => (
        <span className="text-xs text-slate-400 font-mono">
          {new Date(row.createdAt).toLocaleString()}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      cell: () => (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
          COMPLETED ✓
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 pt-3 pb-12 text-white">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-[#170830] via-[#0d041c] to-[#06020c] border border-purple-500/30">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-mono font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>ADMIN CONSOLE • NODE WONDER</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Orbitron',monospace] tracking-wider">
            Node Wonder Cycle Income Reports ($150 Payouts)
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl font-mono">
            Platform-wide audit log of all $150 Node Wonder universal queue cycle payouts distributed to users.
          </p>
        </div>

        <button
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="px-4 py-2.5 rounded-xl bg-[#1a0c36] hover:bg-[#25124d] border border-purple-500/30 text-purple-300 text-xs font-mono font-bold flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
          <span>Refresh Reports</span>
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => (
          <StatCard key={idx} {...card} />
        ))}
      </div>

      {/* Filter / Search Bar & Table */}
      <div className="p-6 rounded-3xl bg-[#090312] border border-purple-500/20 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-lg font-bold font-['Orbitron',monospace] text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-400" />
            <span>Cycle Payout Transactions ({summaryData.totalRecords})</span>
          </h2>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search user, account, email..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 bg-[#120624] border border-slate-800 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
        </div>

        <DataTable
          columns={columns}
          data={historyList}
          emptyText="No Node Wonder cycle payouts found for the given filter."
        />

        {totalPages > 1 && (
          <div className="pt-2">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminNodeWonderIncomeHistory;
