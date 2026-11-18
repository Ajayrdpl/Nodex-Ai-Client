import React, { useEffect, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  Sparkles,
  RefreshCw,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Layers,
  Copy,
  Check,
  Zap,
} from "lucide-react";

import DataTable from "../../components/Screen/UserPanel/DataTable";
import StatCard from "../../components/Screen/UserPanel/StatCard";
import { setLoading } from "../../redux/slices/loadingSlice";
import {
  getMyNodeWonderIncomeHistoryApi,
  getMyNodeWonderStatusApi,
} from "../../api/user.api";
import { AuthenticatedUserRouters } from "../../constants/routes";

const UserNodeWonderIncomeHistory = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [historyList, setHistoryList] = useState([]);
  const [summary, setSummary] = useState({
    totalIncome: 0,
    todayIncome: 0,
    totalCyclesCompleted: 0,
  });
  const [nodeStatus, setNodeStatus] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else dispatch(setLoading(true));

      const [histRes, statusRes] = await Promise.allSettled([
        getMyNodeWonderIncomeHistoryApi({ page: 1, limit: 100 }),
        getMyNodeWonderStatusApi(),
      ]);

      if (histRes.status === "fulfilled" && histRes.value?.success) {
        setHistoryList(histRes.value.data || []);
        if (histRes.value.summary) {
          setSummary(histRes.value.summary);
        }
      }

      if (statusRes.status === "fulfilled" && statusRes.value?.success) {
        setNodeStatus(statusRes.value.data);
      }
    } catch (error) {
      console.error("fetchNodeWonderIncomeHistory error:", error);
      toast.error("Failed to load Node Wonder income history");
    } finally {
      dispatch(setLoading(false));
      setRefreshing(false);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("ID Copied!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const statCards = [
    {
      title: "Total Cycle Payouts",
      value: `$ ${Number(summary.totalIncome || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: "https://img.icons8.com/3d-fluency/94/bullish.png",
      subText: "From Universal 2-ID Queue",
      highlight: true,
    },
    {
      title: "Today's Cycle Income",
      value: `$ ${Number(summary.todayIncome || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: "https://img.icons8.com/3d-fluency/94/money-box.png",
      subText: "Credited Today",
    },
    {
      title: "Completed Cycles",
      value: `${summary.totalCyclesCompleted || 0} Cycles`,
      icon: "https://img.icons8.com/3d-fluency/94/checkmark.png",
      subText: "$150.00 each cycle",
    },
    {
      title: "Current Queue Status",
      value: nodeStatus?.hasActivePackage ? `Queue #${nodeStatus.activePackage?.queueNumber}` : "Idle",
      icon: "https://img.icons8.com/3d-fluency/94/process.png",
      subText: nodeStatus?.hasActivePackage ? `${nodeStatus.activePackage?.subsequentIdsCount || 0}/2 IDs Joined` : "Re-invest to queue",
      path: AuthenticatedUserRouters.NODE_WONDER,
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
        <div className="flex items-center gap-1.5 font-mono text-xs text-purple-400 font-semibold">
          <span>{row?.id || row?._id?.substring(0, 10) || "NW-PAYOUT"}</span>
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
      header: "Income Type",
      accessor: "type",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-[10.5px] font-bold font-mono bg-purple-500/20 text-purple-300 border border-purple-500/40">
            {row.type || "Node Wonder Income"}
          </span>
        </div>
      ),
    },
    {
      header: "Cycle Payout",
      accessor: "income",
      cell: (row) => (
        <span className="font-extrabold text-emerald-400 font-mono text-sm">
          +${Number(row.income || 150).toFixed(2)} USDT
        </span>
      ),
    },
    {
      header: "Description / Trigger",
      accessor: "description",
      cell: (row) => (
        <span className="text-xs text-slate-300 font-mono">
          {row.description || "Universal 2-ID Queue completed payout"}
        </span>
      ),
    },
    {
      header: "Date & Time",
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
          PAID OUT ✓
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
            <span>UNIVERSAL 2-ID QUEUE MATRIX</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Orbitron',monospace] tracking-wider">
            Node Wonder Cycle Income ($150 Payouts)
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl font-mono">
            Every time 2 global IDs join anywhere in the company after your position, $150.00 is paid directly into your wallet.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="px-4 py-2.5 rounded-xl bg-[#1a0c36] hover:bg-[#25124d] border border-purple-500/30 text-purple-300 text-xs font-mono font-bold flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => navigate(AuthenticatedUserRouters.NODE_WONDER)}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-purple-600/30 transition-all font-['Orbitron',monospace]"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Go To Queue Hub</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => (
          <StatCard key={idx} {...card} />
        ))}
      </div>

      {/* Main Data Table */}
      <div className="p-6 rounded-3xl bg-[#090312] border border-purple-500/20 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold font-['Orbitron',monospace] text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-400" />
            <span>Node Wonder Payout Transactions ({historyList.length})</span>
          </h2>
          <span className="text-xs text-purple-300 font-mono">
            $150.00 per completed cycle
          </span>
        </div>

        <DataTable
          columns={columns}
          data={historyList}
          emptyText="No Node Wonder payouts yet. Activate your $100 package in the Queue Hub to start earning!"
        />
      </div>
    </div>
  );
};

export default UserNodeWonderIncomeHistory;
