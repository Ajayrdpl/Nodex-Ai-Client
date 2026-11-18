import React, { useEffect, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Sparkles,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Share2,
  Copy,
  Check,
  Zap,
} from "lucide-react";

import DataTable from "../../components/Screen/UserPanel/DataTable";
import StatCard from "../../components/Screen/UserPanel/StatCard";
import { setLoading } from "../../redux/slices/loadingSlice";
import {
  getMyNodeWonderReferralHistoryApi,
  getMyNodeWonderStatusApi,
} from "../../api/user.api";
import { AuthenticatedUserRouters } from "../../constants/routes";

const UserNodeWonderReferralHistory = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [historyList, setHistoryList] = useState([]);
  const [summary, setSummary] = useState({
    totalReferralIncome: 0,
    todayReferralIncome: 0,
    totalReferralsRewarded: 0,
  });
  const [copiedId, setCopiedId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else dispatch(setLoading(true));

      const [histRes, statusRes] = await Promise.allSettled([
        getMyNodeWonderReferralHistoryApi({ page: 1, limit: 100 }),
        getMyNodeWonderStatusApi(),
      ]);

      if (histRes.status === "fulfilled" && histRes.value?.success) {
        setHistoryList(histRes.value.data || []);
        if (histRes.value.summary) {
          setSummary(histRes.value.summary);
        }
      }
    } catch (error) {
      console.error("fetchNodeWonderReferralHistory error:", error);
      toast.error("Failed to load Node Wonder referral history");
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
      title: "Total Referral Bonus",
      value: `$ ${Number(summary.totalReferralIncome || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: "https://img.icons8.com/3d-plastilina/69/share--v1.png",
      subText: "5% per direct $100 package",
      highlight: true,
    },
    {
      title: "Today's Referral Bonus",
      value: `$ ${Number(summary.todayReferralIncome || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: "https://img.icons8.com/3d-fluency/94/money-box.png",
      subText: "Credited Today",
    },
    {
      title: "Rewarded Directs",
      value: `${summary.totalReferralsRewarded || 0} Directs`,
      icon: "https://img.icons8.com/3d-fluency/94/group.png",
      subText: "$5.00 credited per buyer",
    },
    {
      title: "Special Rule Status",
      value: "ACTIVE",
      icon: "https://img.icons8.com/3d-fluency/94/approval.png",
      subText: "Pays even if you are disabled!",
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
        <div className="flex items-center gap-1.5 font-mono text-xs text-amber-400 font-semibold">
          <span>{row?.id || row?._id?.substring(0, 10) || "NW-REF"}</span>
          <button
            onClick={() => handleCopy(row?.id || row?._id, row?.id || row?._id)}
            className="text-slate-500 hover:text-amber-300 transition cursor-pointer"
          >
            {copiedId === (row?.id || row?._id) ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
          </button>
        </div>
      ),
    },
    {
      header: "Purchaser (Direct Partner)",
      accessor: "fromUser",
      cell: (row) => {
        const from = row?.fromUser || {};
        return (
          <div className="flex flex-col">
            <span className="font-bold text-white font-mono flex items-center gap-1.5">
              <span>@{from.username || "DirectPartner"}</span>
              {from.account && <span className="text-[10px] text-amber-300">({from.account})</span>}
            </span>
            <span className="text-[10.5px] text-slate-400 font-mono">
              Activated $100 Node Wonder
            </span>
          </div>
        );
      },
    },
    {
      header: "Referral Rate",
      accessor: "percent",
      cell: () => (
        <span className="px-2 py-0.5 rounded text-[10.5px] font-bold font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40">
          5.0%
        </span>
      ),
    },
    {
      header: "Commission Earned",
      accessor: "income",
      cell: (row) => (
        <span className="font-extrabold text-emerald-400 font-mono text-sm">
          +${Number(row.income || 5).toFixed(2)} USDT
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
          CREDITED ✓
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 pt-3 pb-12 text-white">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-[#211204] via-[#120a02] to-[#080401] border border-amber-500/30">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>UNCONDITIONAL 5% DIRECT REFERRAL</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Orbitron',monospace] tracking-wider">
            Node Wonder Referral Income (5%)
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl font-mono">
            Earn $5.00 (5%) instantly every time your direct referrals join the $100 Node Wonder package. You receive this commission unconditionally even if you do not have an active package or your package is currently disabled!
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="px-4 py-2.5 rounded-xl bg-[#261605] hover:bg-[#382008] border border-amber-500/30 text-amber-300 text-xs font-mono font-bold flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => navigate(AuthenticatedUserRouters.NODE_WONDER)}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-mono font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/30 transition-all font-['Orbitron',monospace]"
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
      <div className="p-6 rounded-3xl bg-[#0d0701] border border-amber-500/20 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold font-['Orbitron',monospace] text-white flex items-center gap-2">
            <Share2 className="w-4 h-4 text-amber-400" />
            <span>Node Wonder Referral Commissions ({historyList.length})</span>
          </h2>
          <span className="text-xs text-amber-300 font-mono">
            $5.00 per direct referral activation
          </span>
        </div>

        <DataTable
          columns={columns}
          data={historyList}
          emptyText="No Node Wonder referral earnings yet. Invite direct members to activate the $100 package!"
        />
      </div>
    </div>
  );
};

export default UserNodeWonderReferralHistory;
