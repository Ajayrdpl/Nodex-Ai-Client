import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
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
  Share2,
  DollarSign,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";

import DataTable from "../../components/Screen/UserPanel/DataTable";
import StatCard from "../../components/Screen/UserPanel/StatCard";
import { setLoading } from "../../redux/slices/loadingSlice";
import { getDirectBoosterIncomeHistoryApi } from "../../api/user.api";

const DirectBoosterIncomePage = () => {
  const dispatch = useDispatch();
  const userInfo = useSelector((state) => state?.isLoggedUser?.data);

  const [historyList, setHistoryList] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [todayTotal, setTodayTotal] = useState(0);
  const [windowInfo, setWindowInfo] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'today'

  // Live countdown state (hours, minutes, seconds)
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: true,
  });

  const referralCode = userInfo?.referralLink || userInfo?.id || userInfo?.username || "";
  const referralLink = `${window.location.origin}/register?ref=${referralCode}`;

  // Fetch Booster Income & Window Data
  const fetchData = useCallback(
    async (isManual = false) => {
      try {
        if (isManual) setRefreshing(true);
        else dispatch(setLoading(true));

        const res = await getDirectBoosterIncomeHistoryApi();

        if (res?.success) {
          const list = Array.isArray(res?.data?.history) ? res.data.history : [];
          setHistoryList(list);
          setTotalIncome(Number(res?.data?.totalIncome || 0));
          setTodayTotal(Number(res?.data?.todayTotal || 0));
          setWindowInfo(res?.data?.windowInfo || null);
        } else {
          setHistoryList([]);
        }

        if (isManual) {
          toast.success("Direct Booster data refreshed");
        }
      } catch (err) {
        console.error("Error fetching direct booster data:", err);
        toast.error("Failed to fetch booster income history");
        setHistoryList([]);
      } finally {
        if (isManual) setRefreshing(false);
        else dispatch(setLoading(false));
      }
    },
    [dispatch]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Live 24-Hour Countdown Timer
  useEffect(() => {
    const calculateTimeRemaining = () => {
      if (!windowInfo?.eligibleUntil) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      const expiryTime = new Date(windowInfo.eligibleUntil).getTime();
      const now = Date.now();
      const diff = expiryTime - now;

      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isExpired: true });
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds, isExpired: false });
      }
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);
    return () => clearInterval(interval);
  }, [windowInfo]);

  // Copy helper
  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    toast.success("Referral link copied!");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // CSV Export
  const handleExportCSV = () => {
    if (!historyList.length) {
      toast.info("No booster records to export");
      return;
    }

    const headers = [
      "#",
      "Payout ID",
      "From User",
      "Investment ($)",
      "Booster Rate (%)",
      "Booster Income ($)",
      "Status",
      "Date",
      "Remark",
    ];

    const rows = historyList.map((item, idx) => [
      idx + 1,
      item.id || item._id || "",
      item.fromUser?.username || item.fromUser?.id || "Direct Member",
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
    link.setAttribute("download", `Direct_Booster_Income_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Booster report downloaded!");
  };

  // Filtered List
  const filteredHistory = useMemo(() => {
    if (activeTab === "today") {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      return historyList.filter((item) => new Date(item.createdAt) >= startOfToday);
    }
    return historyList;
  }, [historyList, activeTab]);

  // Stat cards data
  const cardData = [
    {
      title: "12% Booster Earned",
      value: `$ ${totalIncome.toFixed(2)}`,
      icon: "https://img.icons8.com/3d-fluency/94/rocket.png",
      highlight: totalIncome > 0,
    },
    {
      title: "Today's Booster Income",
      value: `$ ${todayTotal.toFixed(2)}`,
      icon: "https://img.icons8.com/3d-fluency/94/receive-cash.png",
      highlight: todayTotal > 0,
    },
    {
      title: "24h Direct Volume",
      value: `$ ${(windowInfo?.businessInWindow || 0).toFixed(2)}`,
      icon: "https://img.icons8.com/3d-fluency/94/bank-cards.png",
      highlight: (windowInfo?.businessInWindow || 0) > 0,
    },
    {
      title: "24h Qualified Directs",
      value: `${windowInfo?.directsInWindowCount || 0} Members`,
      icon: "https://img.icons8.com/3d-fluency/94/conference-call.png",
      highlight: (windowInfo?.directsInWindowCount || 0) > 0,
    },
  ];

  // Table Columns
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
        <div className="flex items-center gap-1.5 font-mono text-xs text-amber-400 font-semibold">
          <span>{row.id || String(row._id).slice(-8).toUpperCase()}</span>
          <button
            onClick={() => handleCopy(row.id || row._id, row._id)}
            className="text-slate-400 hover:text-amber-300 transition cursor-pointer"
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
      header: "Direct Member",
      accessor: "fromUser",
      cell: (row) => {
        const member = row.fromUser || {};
        return (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500/20 to-yellow-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300 font-black text-xs">
              {(member.username || "D")[0]?.toUpperCase()}
            </div>
            <div>
              <div className="text-xs font-bold text-white">
                {member.username || "Direct Partner"}
              </div>
              <div className="text-[10px] font-mono text-slate-400">
                {member.id || (member.account ? `${member.account.slice(0, 6)}...` : "—")}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      header: "Investment ($)",
      accessor: "amount",
      cell: (row) => (
        <span className="font-mono font-bold text-slate-200">
          $ {Number(row.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
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
      header: "Booster Income",
      accessor: "income",
      cell: (row) => (
        <div className="font-mono font-black text-amber-400 text-sm">
          +$ {Number(row.income || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </div>
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
    <div className="space-y-6 pb-12">
      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* 1. HERO BANNER - 12% DIRECT BOOSTER INCOME (IMAGE 2 DESIGN)      */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#030d1d] via-[#102347] to-[#030d1d] border border-amber-500/40 p-6 md:p-8 shadow-2xl overflow-hidden backdrop-blur-xl">
        {/* Glow ambient background elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-amber-500/20">
          <div className="max-w-2xl">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 shadow-sm">
                <Clock size={13} />
                Within 24 Hours
              </span>
              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1">
                <Sparkles size={12} />
                Act Fast • Unlock More
              </span>
            </div>

            {/* Main Headings */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight font-['Orbitron',monospace]">
              DIRECT BOOSTER <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500">INCOME</span>
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm mt-3 leading-relaxed">
              Members who complete the required Direct Business / Direct Referral criteria within{" "}
              <strong className="text-amber-300 font-mono">24 hours</strong> of activation will be eligible to receive:{" "}
              <strong className="text-white font-mono bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
                12% DIRECT BOOSTER INCOME
              </strong>
              . Designed to maximize your returns right from day one!
            </p>
          </div>

          {/* 24-Hour Golden Window Clock & Live Countdown */}
          <div className="shrink-0 p-5 rounded-3xl bg-[#030914]/90 border border-amber-500/40 shadow-xl shadow-amber-500/10 min-w-[280px] text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Timer className="w-5 h-5 text-amber-400 animate-pulse" />
              <span className="text-xs uppercase font-extrabold text-amber-300 tracking-wider">
                24H Golden Window
              </span>
            </div>

            {!windowInfo?.isActive ? (
              <div className="py-2">
                <span className="text-xs text-slate-400 block mb-1">Status</span>
                <div className="text-sm font-bold text-amber-400 bg-amber-500/10 py-1.5 px-3 rounded-xl border border-amber-500/20">
                  Account Inactive (Min $10)
                </div>
              </div>
            ) : timeLeft.isExpired ? (
              <div className="py-2">
                <span className="text-xs text-slate-400 block mb-1">Window Status</span>
                <div className="text-sm font-bold text-slate-300 bg-slate-800/80 py-1.5 px-3 rounded-xl border border-slate-700">
                  24h Window Closed
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5">
                  Directs now earn standard 10% Direct Income
                </p>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-3 gap-1.5 my-2">
                  <div className="bg-[#050f24] border border-amber-500/30 rounded-xl p-2">
                    <div className="text-2xl font-black text-amber-400 font-mono">
                      {String(timeLeft.hours).padStart(2, "0")}
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Hours</span>
                  </div>
                  <div className="bg-[#050f24] border border-amber-500/30 rounded-xl p-2">
                    <div className="text-2xl font-black text-amber-400 font-mono">
                      {String(timeLeft.minutes).padStart(2, "0")}
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Mins</span>
                  </div>
                  <div className="bg-[#050f24] border border-amber-500/30 rounded-xl p-2">
                    <div className="text-2xl font-black text-amber-400 font-mono">
                      {String(timeLeft.seconds).padStart(2, "0")}
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Secs</span>
                  </div>
                </div>
                <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  12% Golden Window Active!
                </div>
              </div>
            )}

            <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>Booster Rate:</span>
              <strong className="text-amber-300 font-mono font-bold text-sm">12% Flat</strong>
            </div>
          </div>
        </div>

        {/* 3-Step Flow Diagram (Directly from Image 2) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 relative z-10">
          <div className="p-4 bg-[#050c18]/90 rounded-2xl border border-amber-500/25 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-amber-400 block text-[10px] uppercase font-bold tracking-wider">
                Step 01
              </span>
              <strong className="text-white text-xs sm:text-sm font-semibold">
                Complete Direct Qualification
              </strong>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Invite direct referrals within your first 24 hours
              </p>
            </div>
          </div>

          <div className="p-4 bg-[#050c18]/90 rounded-2xl border border-amber-500/25 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-amber-400 block text-[10px] uppercase font-bold tracking-wider">
                Step 02
              </span>
              <strong className="text-white text-xs sm:text-sm font-semibold">
                Unlock 12% Booster Income
              </strong>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Receive instant 12% on all investments placed
              </p>
            </div>
          </div>

          <div className="p-4 bg-[#050c18]/90 rounded-2xl border border-amber-500/25 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-amber-400 block text-[10px] uppercase font-bold tracking-wider">
                Step 03
              </span>
              <strong className="text-white text-xs sm:text-sm font-semibold">
                Grow Together
              </strong>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Supercharge your network growth & matrix depth
              </p>
            </div>
          </div>
        </div>

        {/* Disclaimer / Qualification Note */}
        <div className="mt-5 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center gap-2.5 text-xs text-amber-200">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <p className="text-[11px] leading-relaxed">
            <strong>Eligibility Note:</strong> Direct Booster Income is calculated on active direct referrals joining and funding within 24 hours of your account activation. Directs after 24 hours receive standard 10% direct income.
          </p>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* 2. REFERRAL LINK FAST-SHARE CARD                                  */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      <div className="rounded-2xl bg-[#030d1d] border border-amber-500/20 p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Your Direct Referral Link</h4>
            <p className="text-xs text-slate-400">
              Share with contacts to maximize your 12% Booster bonus before time runs out!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 truncate max-w-xs select-all">
            {referralLink}
          </div>
          <button
            onClick={handleCopyLink}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs font-black flex items-center gap-1.5 transition active:scale-95 shadow-lg shadow-amber-500/20 cursor-pointer shrink-0"
          >
            {copiedLink ? <Check size={14} /> : <Copy size={14} />}
            {copiedLink ? "Copied" : "Copy Link"}
          </button>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* 3. FINANCIAL STAT CARDS                                           */}
      {/* ═════════════════════════════════════════════════════════════════ */}
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

      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* 4. CONTROLS, FILTER TABS & EXPORT                                 */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#030d1d] border border-amber-500/20 p-3.5 rounded-2xl">
        <div className="flex items-center gap-2">
          {[
            { id: "all", label: `All Booster Payouts (${historyList.length})` },
            { id: "today", label: "Today's Payouts" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-lg shadow-amber-500/25 font-black"
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
          >
            <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
          >
            <Download size={12} />
            Export CSV
          </button>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* 5. DATA TABLE - DIRECT BOOSTER PAYOUT HISTORY                    */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      <DataTable
        title="12% Direct Booster Income Payout History"
        columns={columns}
        data={filteredHistory}
        pageSize={10}
      />
    </div>
  );
};

export default DirectBoosterIncomePage;

