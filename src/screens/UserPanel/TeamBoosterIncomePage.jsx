import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
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
  DollarSign,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  Target,
  Repeat,
} from "lucide-react";

import DataTable from "../../components/Screen/UserPanel/DataTable";
import StatCard from "../../components/Screen/UserPanel/StatCard";
import { setLoading } from "../../redux/slices/loadingSlice";
import { getTeamBoosterIncomeHistoryApi } from "../../api/user.api";

const SLABS_DATA = [
  { slab: 1, target: 1000, bonus: 20 },
  { slab: 2, target: 2500, bonus: 60 },
  { slab: 3, target: 5000, bonus: 150 },
  { slab: 4, target: 10000, bonus: 350 },
  { slab: 5, target: 25000, bonus: 1000 },
  { slab: 6, target: 50000, bonus: 2250 },
  { slab: 7, target: 100000, bonus: 5000 },
];

const TeamBoosterIncomePage = () => {
  const dispatch = useDispatch();

  const [historyList, setHistoryList] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [todayTotal, setTodayTotal] = useState(0);
  const [qualification, setQualification] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [activeTab, setActiveTab] = useState("all");

  // Countdown to next Monday 12:05 AM IST
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const fetchData = useCallback(
    async (isManual = false) => {
      try {
        if (isManual) setRefreshing(true);
        else dispatch(setLoading(true));

        const res = await getTeamBoosterIncomeHistoryApi();

        if (res?.success) {
          const list = Array.isArray(res?.data?.history) ? res.data.history : [];
          setHistoryList(list);
          setTotalIncome(Number(res?.data?.totalIncome || 0));
          setTodayTotal(Number(res?.data?.todayTotal || 0));
          setQualification(res?.data?.qualification || null);
        } else {
          setHistoryList([]);
        }

        if (isManual) toast.success("7-Days Team Booster data refreshed");
      } catch (err) {
        console.error("Error fetching 7-days team booster data:", err);
        toast.error("Failed to fetch 7-Days team booster reports");
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

  // Live countdown to next Monday cycle end
  useEffect(() => {
    const calculateCountdown = () => {
      const now = new Date();
      // Target next Monday
      const day = now.getDay(); // 0 is Sunday, 1 is Monday
      const daysUntilMonday = ((1 - day + 7) % 7) || 7;
      const targetMonday = new Date(now);
      targetMonday.setDate(now.getDate() + daysUntilMonday);
      targetMonday.setHours(0, 5, 0, 0); // 12:05 AM

      const diff = targetMonday.getTime() - now.getTime();
      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    };

    calculateCountdown();
    const timer = setInterval(calculateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportCSV = () => {
    if (!historyList.length) {
      toast.info("No records to export");
      return;
    }

    const headers = [
      "#",
      "Payout ID",
      "Team Business ($)",
      "Booster Bonus ($)",
      "Status",
      "Date",
      "Remark",
    ];

    const rows = historyList.map((item, idx) => [
      idx + 1,
      item.id || item._id || "",
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
    link.setAttribute("download", `Team_Booster_Income_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV report downloaded!");
  };

  const filteredHistory = useMemo(() => {
    if (activeTab === "today") {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      return historyList.filter((item) => new Date(item.createdAt) >= startOfToday);
    }
    return historyList;
  }, [historyList, activeTab]);

  const currentTeamBusiness = Number(qualification?.teamBusiness || 0);
  const selfInvestment = Number(qualification?.selfInvestment || 0);
  const qualifiedDirects = Number(qualification?.qualifiedDirectsCount || 0);
  const eligibleBonus = Number(qualification?.bonus || 0);

  const cardData = [
    {
      title: "Total Team Booster Earned",
      value: `$ ${totalIncome.toFixed(2)}`,
      icon: "https://img.icons8.com/3d-fluency/94/trophy.png",
      highlight: totalIncome > 0,
    },
    {
      title: "Current 7-Day Team Business",
      value: `$ ${currentTeamBusiness.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      icon: "https://img.icons8.com/3d-fluency/94/sales-performance.png",
      highlight: currentTeamBusiness > 0,
    },
    {
      title: "Current Eligible Bonus",
      value: eligibleBonus > 0 ? `$ ${eligibleBonus.toFixed(2)}` : "$ 0.00",
      icon: "https://img.icons8.com/3d-fluency/94/receive-cash.png",
      highlight: eligibleBonus > 0,
    },
    {
      title: "Qualified Directs ($100+)",
      value: `${qualifiedDirects} / 3 Directs`,
      icon: "https://img.icons8.com/3d-fluency/94/conference-call.png",
      highlight: qualifiedDirects >= 3,
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
      header: "7-Day Team Volume",
      accessor: "amount",
      cell: (row) => (
        <span className="font-mono font-bold text-slate-200">
          $ {Number(row.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      header: "Booster Bonus",
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
    <div className="space-y-6 pb-12">
      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* 1. HERO BANNER - 7 DAYS TEAM BOOSTER (IMAGE 1 & 2 DESIGN)         */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#030d1d] via-[#102347] to-[#030d1d] border border-amber-500/40 p-6 md:p-8 shadow-2xl overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-amber-500/20">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 shadow-sm">
                <Calendar size={13} />
                7 Days Team Business ➔ Booster Bonus
              </span>
              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1">
                <Repeat size={12} />
                Every Monday Cron Cycle
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight font-['Orbitron',monospace]">
              BOOSTER <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500">BONUS SLABS</span>
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm mt-3 leading-relaxed">
              Achieve your team business target within the <strong className="text-amber-300 font-mono">7-day weekly cycle</strong>. The automated cron calculates qualified volume every <strong className="text-white font-mono">Monday at 12:05 AM IST</strong> and credits up to <strong className="text-amber-300 font-mono">$5,000</strong> Booster Bonus!
            </p>
          </div>

          {/* Monday Cron Live Countdown Timer */}
          <div className="shrink-0 p-5 rounded-3xl bg-[#030914]/90 border border-amber-500/40 shadow-xl shadow-amber-500/10 min-w-[300px] text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-amber-400 animate-spin" style={{ animationDuration: "12s" }} />
              <span className="text-xs uppercase font-extrabold text-amber-300 tracking-wider">
                Next Monday Payout In
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1.5 my-2">
              <div className="bg-[#050f24] border border-amber-500/30 rounded-xl p-2">
                <div className="text-xl font-black text-amber-400 font-mono">
                  {String(timeLeft.days).padStart(2, "0")}
                </div>
                <span className="text-[9px] font-bold text-slate-400 uppercase">Days</span>
              </div>
              <div className="bg-[#050f24] border border-amber-500/30 rounded-xl p-2">
                <div className="text-xl font-black text-amber-400 font-mono">
                  {String(timeLeft.hours).padStart(2, "0")}
                </div>
                <span className="text-[9px] font-bold text-slate-400 uppercase">Hours</span>
              </div>
              <div className="bg-[#050f24] border border-amber-500/30 rounded-xl p-2">
                <div className="text-xl font-black text-amber-400 font-mono">
                  {String(timeLeft.minutes).padStart(2, "0")}
                </div>
                <span className="text-[9px] font-bold text-slate-400 uppercase">Mins</span>
              </div>
              <div className="bg-[#050f24] border border-amber-500/30 rounded-xl p-2">
                <div className="text-xl font-black text-amber-400 font-mono">
                  {String(timeLeft.seconds).padStart(2, "0")}
                </div>
                <span className="text-[9px] font-bold text-slate-400 uppercase">Secs</span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>Cycle Reset:</span>
              <strong className="text-emerald-400 font-mono font-bold">Every Monday 12:05 AM IST</strong>
            </div>
          </div>
        </div>

        {/* ═══════════ QUALIFICATION RULES CHECKLIST (IMAGE 2) ═══════════ */}
        <div className="mt-6 pt-6 border-t border-amber-500/20">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-['Orbitron',monospace]">
                Booster Qualification Rules (Live Status)
              </h3>
            </div>
            <span className="text-[11px] font-mono text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-full font-bold">
              {qualification?.isFullyQualified ? "🟢 All Criteria Met" : "🟡 Criteria Incomplete"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {/* Rule 1: Self ID >= $100 */}
            <div className={`p-3.5 rounded-2xl border transition ${
              selfInvestment >= 100
                ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-300"
                : "bg-slate-900/80 border-slate-800 text-slate-400"
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold flex items-center gap-1.5 text-white">
                  {selfInvestment >= 100 ? (
                    <CheckCircle2 size={15} className="text-emerald-400" />
                  ) : (
                    <XCircle size={15} className="text-red-400" />
                  )}
                  Rule 1: Self ID $100+
                </span>
                <span className="font-mono text-[11px] font-bold">
                  ${selfInvestment.toFixed(2)} / $100
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Self ID must be active with $100 or above investment.
              </p>
            </div>

            {/* Rule 2 & 3: Min 3 Active Directs >= $100 */}
            <div className={`p-3.5 rounded-2xl border transition ${
              qualifiedDirects >= 3
                ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-300"
                : "bg-slate-900/80 border-slate-800 text-slate-400"
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold flex items-center gap-1.5 text-white">
                  {qualifiedDirects >= 3 ? (
                    <CheckCircle2 size={15} className="text-emerald-400" />
                  ) : (
                    <XCircle size={15} className="text-amber-400" />
                  )}
                  Rule 2 & 3: 3 Directs ($100+)
                </span>
                <span className="font-mono text-[11px] font-bold">
                  {qualifiedDirects} / 3 Qualified
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Minimum 3 active direct referrals, each having $100+ package.
              </p>
            </div>

            {/* Rule 4: 7 Days Business Window */}
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-slate-300">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold flex items-center gap-1.5 text-white">
                  <CheckCircle2 size={15} className="text-cyan-400" />
                  Rule 4: 7-Day Team Volume
                </span>
                <span className="font-mono text-[11px] text-cyan-300 font-bold">
                  ${currentTeamBusiness.toLocaleString()}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Volume completed within current Monday-to-Monday 7-day cycle.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* 2. THE 7 BOOSTER BONUS SLABS GRID (IMAGE 1 & 2 DESIGN)           */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      <div className="bg-[#030d1d] border border-amber-500/30 rounded-3xl p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-amber-500/20">
          <div>
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block font-mono">
              Achieve Your Team Business Target
            </span>
            <h3 className="text-xl font-black text-white font-['Orbitron',monospace]">
              7-Days Booster Bonus Slabs
            </h3>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-xs text-amber-300 font-bold flex items-center gap-1.5">
              <AlertCircle size={14} />
              Only Highest Achieved Eligible Slab Bonus Applies
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-300 font-bold flex items-center gap-1.5">
              <Trophy size={14} />
              Up to $5,000 Weekly Bonus
            </div>
          </div>
        </div>

        {/* Eligibility Criteria Summary Strip inside Slabs Container */}
        <div className="mb-5 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-amber-500/10 border border-amber-500/30">
          <div className="flex items-center gap-2 mb-2 text-xs font-black uppercase tracking-wider text-amber-300">
            <Sparkles size={14} className="text-amber-400" />
            <span>Eligibility Criteria for All Slabs:</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-[11px]">
            <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800">
              <div className="text-slate-400 font-semibold">1. Self ID</div>
              <div className="font-bold text-white mt-0.5">$100 or above</div>
            </div>
            <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800">
              <div className="text-slate-400 font-semibold">2. Active Directs</div>
              <div className="font-bold text-white mt-0.5">Min 3 Directs</div>
            </div>
            <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800">
              <div className="text-slate-400 font-semibold">3. Directs ID Size</div>
              <div className="font-bold text-white mt-0.5">$100+ each</div>
            </div>
            <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800">
              <div className="text-slate-400 font-semibold">4. Time Window</div>
              <div className="font-bold text-amber-300 mt-0.5">Within 7 Days</div>
            </div>
            <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800">
              <div className="text-slate-400 font-semibold">5. Slab Payout</div>
              <div className="font-bold text-white mt-0.5">Highest Only</div>
            </div>
            <div className="p-2 rounded-xl bg-slate-950/70 border border-slate-800">
              <div className="text-slate-400 font-semibold">6. Cycle Reset</div>
              <div className="font-bold text-emerald-400 mt-0.5">Every Monday</div>
            </div>
          </div>
        </div>

        {/* 7 Slabs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
          {SLABS_DATA.map((slab) => {
            const isAchieved = currentTeamBusiness >= slab.target;
            const isHighest = qualification?.eligibleSlab?.target === slab.target;
            const progressPct = Math.min(100, Math.round((currentTeamBusiness / slab.target) * 100));
            const isRulesMet = selfInvestment >= 100 && qualifiedDirects >= 3;

            return (
              <div
                key={slab.slab}
                className={`p-4 rounded-2xl border transition flex flex-col justify-between relative overflow-hidden ${
                  isHighest
                    ? "bg-gradient-to-b from-amber-500/25 to-yellow-500/10 border-amber-400 shadow-lg shadow-amber-500/25 ring-2 ring-amber-400/50"
                    : isAchieved
                    ? "bg-emerald-950/20 border-emerald-500/40"
                    : "bg-slate-900/60 border-slate-800"
                }`}
              >
                {isHighest && (
                  <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-yellow-400 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-bl uppercase tracking-wider">
                    Highest
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                      Slab 0{slab.slab}
                    </span>
                    <span className="text-[9px] font-mono font-bold text-amber-400">
                      {progressPct}%
                    </span>
                  </div>

                  <div className="text-lg font-black text-white font-mono">
                    ${slab.target.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    Team Target
                  </span>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isAchieved
                          ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                          : "bg-gradient-to-r from-amber-500 to-yellow-400"
                      }`}
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>

                <div className="my-2.5 flex items-center justify-center text-slate-600">
                  <ArrowRight size={14} />
                </div>

                <div className="pt-2 border-t border-slate-800 text-center">
                  <div className="text-2xl font-black text-amber-400 font-mono">
                    ${slab.bonus.toLocaleString()}
                  </div>
                  <span className="text-[10px] uppercase font-bold text-slate-300 block mb-2">
                    Bonus Reward
                  </span>

                  {/* Status Indicator */}
                  {isAchieved ? (
                    isRulesMet ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        <CheckCircle2 size={10} /> Qualified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40" title="Need Self $100+ and 3 Directs $100+">
                        <AlertCircle size={10} /> Volume Met
                      </span>
                    )
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
                      ${(slab.target - currentTeamBusiness).toLocaleString()} left
                    </span>
                  )}
                </div>
              </div>
            );
          })}
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
            { id: "all", label: `All Weekly Payouts (${historyList.length})` },
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
      {/* 5. DATA TABLE - WEEKLY TEAM BOOSTER PAYOUT HISTORY                */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      <DataTable
        title="7-Days Team Business Booster Payout History"
        columns={columns}
        data={filteredHistory}
        pageSize={10}
      />
    </div>
  );
};

export default TeamBoosterIncomePage;

