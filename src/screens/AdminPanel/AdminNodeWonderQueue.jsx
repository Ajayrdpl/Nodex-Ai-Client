import React, { useEffect, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import {
  Layers,
  Sparkles,
  RefreshCw,
  Search,
  Users,
  DollarSign,
  Copy,
  Check,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";

import DataTable from "../../components/Screen/UserPanel/DataTable";
import StatCard from "../../components/Screen/UserPanel/StatCard";
import { setLoading } from "../../redux/slices/loadingSlice";
import { getAdminNodeWonderQueueApi } from "../../api/admin.api";
import Pagination from "../../components/Screen/UserPanel/Pagination";

const AdminNodeWonderQueue = () => {
  const dispatch = useDispatch();

  const [queueList, setQueueList] = useState([]);
  const [stats, setStats] = useState({
    totalEntries: 0,
    totalQueued: 0,
    totalCompleted: 0,
    totalPayoutDistributed: 0,
  });
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL, QUEUED, COMPLETED
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

        const params = {
          page,
          limit: 20,
          search: searchQuery.trim(),
        };
        if (statusFilter !== "ALL") {
          params.status = statusFilter;
        }

        const res = await getAdminNodeWonderQueueApi(params);

        if (res?.success && res?.data) {
          setQueueList(res.data.records || []);
          if (res.data.stats) {
            setStats(res.data.stats);
          }
          setTotalPages(res.pagination?.totalPages || 1);
        } else {
          setQueueList([]);
        }
      } catch (error) {
        console.error("getAdminNodeWonderQueue error:", error);
        toast.error("Failed to fetch Node Wonder queue");
      } finally {
        dispatch(setLoading(false));
        setRefreshing(false);
      }
    },
    [dispatch, page, searchQuery, statusFilter]
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
      title: "Total Queue Entries",
      value: `${stats.totalEntries || 0} Slots`,
      icon: "https://img.icons8.com/3d-fluency/94/process.png",
      subText: "$100 Package Activations",
      highlight: true,
    },
    {
      title: "Active Queued Entries",
      value: `${stats.totalQueued || 0} In Queue`,
      icon: "https://img.icons8.com/3d-fluency/94/clock.png",
      subText: "Awaiting Subsequent IDs",
    },
    {
      title: "Completed ($150 Paid)",
      value: `${stats.totalCompleted || 0} Cycles`,
      icon: "https://img.icons8.com/3d-fluency/94/checkmark.png",
      subText: "Auto-disabled upon payout",
    },
    {
      title: "Total Payouts Released",
      value: `$ ${Number(stats.totalPayoutDistributed || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: "https://img.icons8.com/3d-fluency/94/bullish.png",
      subText: "Distributed To Queued Users",
    },
  ];

  const columns = [
    {
      header: "Queue #",
      accessor: "queueNumber",
      cell: (row) => (
        <span className="font-extrabold text-purple-400 font-mono text-sm">
          #{row?.queueNumber || "0"}
        </span>
      ),
    },
    {
      header: "Member User",
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
      header: "Cost",
      accessor: "packageAmount",
      cell: () => (
        <span className="font-bold text-white font-mono text-xs">
          $100.00
        </span>
      ),
    },
    {
      header: "Subsequent IDs (2 Required)",
      accessor: "subsequentIdsCount",
      cell: (row) => {
        const count = row?.subsequentIdsCount || 0;
        return (
          <div className="flex items-center gap-2">
            <div className="w-16 bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  count >= 2 ? "bg-emerald-400" : count === 1 ? "bg-amber-400" : "bg-slate-600"
                }`}
                style={{ width: `${Math.min(100, (count / 2) * 100)}%` }}
              />
            </div>
            <span className="font-mono text-xs font-bold text-white">
              {count} / 2
            </span>
          </div>
        );
      },
    },
    {
      header: "Payout",
      accessor: "payoutAmount",
      cell: (row) => (
        <span className="font-extrabold text-emerald-400 font-mono text-sm">
          ${Number(row?.payoutAmount || 150).toFixed(2)} USDT
        </span>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      cell: (row) => {
        const status = row?.status || "QUEUED";
        const isComp = status === "COMPLETED";
        const isQueued = status === "QUEUED";
        return (
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono border ${
              isComp
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                : isQueued
                ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                : "bg-slate-700/40 text-slate-400 border-slate-600"
            }`}
          >
            {status}
          </span>
        );
      },
    },
    {
      header: "Joined Date",
      accessor: "createdAt",
      cell: (row) => (
        <span className="text-xs text-slate-400 font-mono">
          {new Date(row?.createdAt).toLocaleString()}
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
            <span>ADMIN CONSOLE • UNIVERSAL MATRIX</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Orbitron',monospace] tracking-wider">
            Node Wonder Queue Monitor
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl font-mono">
            Company-wide sequential queue tracking. Every 2 subsequent IDs pay $150.00 and auto-disable the queued slot.
          </p>
        </div>

        <button
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="px-4 py-2.5 rounded-xl bg-[#1a0c36] hover:bg-[#25124d] border border-purple-500/30 text-purple-300 text-xs font-mono font-bold flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
          <span>Refresh Queue</span>
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
          {/* Status Tabs */}
          <div className="inline-flex rounded-xl bg-[#120624] p-1 border border-slate-800 font-mono text-xs">
            {["ALL", "QUEUED", "COMPLETED"].map((st) => (
              <button
                key={st}
                onClick={() => {
                  setStatusFilter(st);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  statusFilter === st
                    ? "bg-purple-600 text-white font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

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
          data={queueList}
          emptyText="No Node Wonder queue entries found for the selected filter."
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

export default AdminNodeWonderQueue;
