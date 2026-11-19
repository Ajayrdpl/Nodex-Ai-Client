// src/screens/UserPanel/RequestWithdrawal.jsx
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  DollarSign,
  Copy,
  Check,
  Clock,
  ExternalLink,
  Info,
  ShieldAlert,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  FileText,
  Lock,
} from "lucide-react";
import {
  requestWithdrawalApi,
  getWalletBalancesApi,
  getUserProfileApi,
  getAllUserWithdrawalHistory,
} from "../../api/user.api";
import { setLoading } from "../../redux/slices/loadingSlice";
import { maskWalletAddress } from "../../utils/additionalFunc";

// ═══════════════════════════════════════════════════════════════════════════════
// OFFICIAL NODEXAI WITHDRAWAL RULES
// 1. Minimum Withdrawal: $10.00
// 2. Admin Charges: 5% flat fee
// 3. Payout: 95% Net payout sent to registered BEP-20 address upon Admin Approval
// ═══════════════════════════════════════════════════════════════════════════════
const MIN_WITHDRAWAL = 10;          // $10 Minimum Withdrawal
const WITHDRAWAL_FEE_PERCENT = 5;  // 5% Admin Charge

const RequestWithdrawal = () => {
  const dispatch = useDispatch();
  const loggedUser = useSelector((state) => state?.isLoggedUser?.data);

  // View Mode: "REQUEST" | "HISTORY" | "ALL"
  const [activeTab, setActiveTab] = useState("REQUEST");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [copiedText, setCopiedText] = useState(null);

  // Wallet balances
  const [balances, setBalances] = useState({
    currentIncomeWallet: 0,
    totalWithdrawn: 0,
    p2pWallet: 0,
    activePrincipal: 0,
  });

  // Withdrawal form inputs
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [destinationWallet, setDestinationWallet] = useState(
    loggedUser?.account || loggedUser?.walletAddress || ""
  );

  // History & Filters
  const [historyList, setHistoryList] = useState([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Copy helper
  const handleCopy = (text, label = "Address") => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    toast.success(`${label} copied to clipboard!`);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // 📡 Fetch Wallet Balances, Profile, and History
  const loadData = useCallback(
    async (isManual = false) => {
      try {
        if (isManual) setRefreshing(true);
        else dispatch(setLoading(true));

        const [balRes, profRes, histRes] = await Promise.allSettled([
          getWalletBalancesApi(),
          getUserProfileApi(),
          getAllUserWithdrawalHistory(),
        ]);

        // 1. Process Wallet Balances
        if (balRes.status === "fulfilled" && balRes.value?.success) {
          const d = balRes.value.data || balRes.value;
          const inc = Number(
            d.currentIncomeWallet ??
            d.availableBalance ??
            d.walletBalances?.currentIncomeWallet ??
            d.totalIncome ??
            0
          );
          setBalances((prev) => ({
            ...prev,
            currentIncomeWallet: inc,
            p2pWallet: Number(d.p2pWallet ?? d.walletBalances?.p2pWallet ?? 0),
            activePrincipal: Number(d.activePrincipal ?? d.walletBalances?.activePrincipal ?? 0),
          }));
        }

        // 2. Process User Profile Wallet Address
        if (profRes.status === "fulfilled" && profRes.value?.success) {
          const profData = profRes.value?.data || profRes.value;
          const addr = profData?.account || profData?.walletAddress || "";
          if (addr && !destinationWallet) {
            setDestinationWallet(addr);
          }
          if (profData?.incomeDetails?.income?.currentIncome !== undefined) {
            setBalances((prev) => ({
              ...prev,
              currentIncomeWallet: Number(profData.incomeDetails.income.currentIncome || 0),
            }));
          }
        }

        // 3. Process History
        if (histRes.status === "fulfilled" && histRes.value) {
          const raw = histRes.value.data || histRes.value;
          const list = Array.isArray(raw?.history)
            ? raw.history
            : Array.isArray(raw)
            ? raw
            : [];
          setHistoryList(list);

          if (raw?.totalWithdrawn !== undefined) {
            setBalances((prev) => ({
              ...prev,
              totalWithdrawn: Number(raw.totalWithdrawn || 0),
            }));
          } else {
            const sumCompleted = list
              .filter(
                (item) =>
                  String(item.status).toLowerCase() === "completed" ||
                  String(item.status).toLowerCase() === "approved"
              )
              .reduce(
                (sum, item) =>
                  sum + Number(item.investment || item.requestedAmount || item.amount || 0),
                0
              );
            setBalances((prev) => ({ ...prev, totalWithdrawn: sumCompleted }));
          }
        }

        if (isManual) toast.success("Withdrawal data refreshed!");
      } catch (err) {
        console.error("Error loading withdrawal data:", err);
      } finally {
        if (isManual) setRefreshing(false);
        else dispatch(setLoading(false));
      }
    },
    [dispatch, destinationWallet]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Keep destination wallet synced with loggedUser if empty
  useEffect(() => {
    if (!destinationWallet && (loggedUser?.account || loggedUser?.walletAddress)) {
      setDestinationWallet(loggedUser?.account || loggedUser?.walletAddress);
    }
  }, [loggedUser, destinationWallet]);

  // 🧮 Live Calculations
  const numWithdraw = Number(withdrawAmount) || 0;
  const adminFee = (numWithdraw * WITHDRAWAL_FEE_PERCENT) / 100;
  const netWithdrawPayout = Math.max(0, numWithdraw - adminFee);

  // Preset Amount Buttons
  const handlePresetAmount = (val) => {
    if (val === "MAX") {
      setWithdrawAmount(Math.floor(balances.currentIncomeWallet).toString());
    } else {
      setWithdrawAmount(val.toString());
    }
  };

  // 🚀 Submit Withdrawal Request
  const handleWithdrawalSubmit = async (e) => {
    e.preventDefault();

    if (numWithdraw < MIN_WITHDRAWAL) {
      toast.warning(`Minimum withdrawal amount is $${MIN_WITHDRAWAL}.00`);
      return;
    }
    if (numWithdraw > balances.currentIncomeWallet) {
      toast.error(
        `Insufficient balance. Available: $${balances.currentIncomeWallet.toFixed(
          2
        )}, Requested: $${numWithdraw.toFixed(2)}`
      );
      return;
    }
    if (!destinationWallet || !destinationWallet.trim().startsWith("0x") || destinationWallet.trim().length !== 42) {
      toast.warning("Please provide a valid USDT BEP-20 (EVM) wallet address (starts with 0x, 42 chars).");
      return;
    }

    try {
      setIsSubmitting(true);
      dispatch(setLoading(true));

      const payload = {
        amount: numWithdraw,
        walletAddress: destinationWallet.trim(),
      };

      const res = await requestWithdrawalApi(payload);

      if (res?.success || String(res?.message || "").toLowerCase().includes("success")) {
        toast.success(
          res?.message ||
            `Withdrawal of $${numWithdraw.toFixed(2)} submitted! (Fee: $${adminFee.toFixed(
              2
            )}, Net: $${netWithdrawPayout.toFixed(2)})`
        );
        setWithdrawAmount("");
        await loadData(true);
        setActiveTab("HISTORY"); // Switch to history so user immediately sees their pending request
      } else {
        toast.error(res?.message || "Failed to submit withdrawal request.");
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err?.message || "Withdrawal request failed."
      );
    } finally {
      setIsSubmitting(false);
      dispatch(setLoading(false));
    }
  };

  // Filtered History
  const filteredHistory = useMemo(() => {
    return historyList.filter((item) => {
      const status = String(item?.status || "Pending").toLowerCase();
      if (statusFilter === "PENDING" && status !== "pending") return false;
      if (
        statusFilter === "COMPLETED" &&
        status !== "completed" &&
        status !== "approved"
      )
        return false;
      if (
        statusFilter === "CANCELLED" &&
        status !== "cancelled" &&
        status !== "rejected"
      )
        return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const txId = String(item?.id || item?._id || "").toLowerCase();
        const addr = String(item?.clientAddress || "").toLowerCase();
        const amount = String(item?.investment || item?.requestedAmount || "");
        const hash = String(item?.hash || "").toLowerCase();
        if (
          !txId.includes(query) &&
          !addr.includes(query) &&
          !amount.includes(query) &&
          !hash.includes(query)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [historyList, statusFilter, searchQuery]);

  return (
    <div className="p-3 sm:p-5 md:p-6 max-w-[1400px] mx-auto space-y-5 sm:space-y-6 text-slate-100 font-sans">
      {/* 🌟 Top Official Executive Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#020817] via-[#08152c] to-[#020817] border border-cyan-500/30 shadow-[0_0_30px_rgba(0,210,255,0.12)] p-4 sm:p-6 md:p-7">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,210,255,0.3)]">
                <DollarSign className="w-3.5 h-3.5" /> NODEXAI Official Withdrawal
              </span>
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> Min $10 • 5% Admin Charge
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Manual Admin Approval & Payout
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white font-['Orbitron',sans-serif] tracking-wide">
              Withdrawal Management Hub
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Request withdrawals from your Current Income Wallet. Flat <strong className="text-amber-400">5% Admin Fee</strong> is deducted, and <strong className="text-emerald-400">95% Net Payout</strong> is verified and transferred manually by Admin to your registered BEP-20 wallet.
            </p>
          </div>

          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="px-4 py-2.5 bg-[#09172f]/90 hover:bg-[#0d2247] text-cyan-300 hover:text-white border border-cyan-500/30 hover:border-cyan-400 rounded-2xl text-xs font-bold transition flex items-center gap-2 shadow-[0_0_15px_rgba(0,210,255,0.15)] cursor-pointer shrink-0 active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-cyan-400" : ""}`} />
            <span>Refresh Balances</span>
          </button>
        </div>

        {/* 4 Executive Stat Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-4 mt-4 border-t border-cyan-500/20">
          {/* Card 1: Available Income */}
          <div className="p-3.5 rounded-2xl bg-[#09172f]/70 border border-cyan-500/25">
            <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider">
              <span>Available Income</span>
              <Wallet className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="mt-1.5 text-lg sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-amber-300 font-['Orbitron',sans-serif]">
              ${balances.currentIncomeWallet.toFixed(2)}
            </div>
            <div className="text-[10px] text-cyan-400/80 font-mono mt-0.5">Withdrawable USDT</div>
          </div>

          {/* Card 2: Minimum Withdrawal */}
          <div className="p-3.5 rounded-2xl bg-[#09172f]/70 border border-amber-500/25">
            <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider">
              <span>Minimum Withdrawal</span>
              <DollarSign className="w-4 h-4 text-amber-400" />
            </div>
            <div className="mt-1.5 text-lg sm:text-2xl font-black text-amber-400 font-['Orbitron',sans-serif]">
              ${MIN_WITHDRAWAL}.00
            </div>
            <div className="text-[10px] text-amber-400/80 font-mono mt-0.5">Strict Threshold</div>
          </div>

          {/* Card 3: Admin Charges */}
          <div className="p-3.5 rounded-2xl bg-[#09172f]/70 border border-rose-500/25">
            <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider">
              <span>Admin Charges</span>
              <Info className="w-4 h-4 text-rose-400" />
            </div>
            <div className="mt-1.5 text-lg sm:text-2xl font-black text-rose-400 font-['Orbitron',sans-serif]">
              {WITHDRAWAL_FEE_PERCENT}%
            </div>
            <div className="text-[10px] text-rose-400/80 font-mono mt-0.5">Flat Deduction (95% Net)</div>
          </div>

          {/* Card 4: Total Withdrawn */}
          <div className="p-3.5 rounded-2xl bg-[#09172f]/70 border border-emerald-500/25">
            <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider">
              <span>Total Withdrawn</span>
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="mt-1.5 text-lg sm:text-2xl font-black text-emerald-400 font-['Orbitron',sans-serif]">
              ${balances.totalWithdrawn.toFixed(2)}
            </div>
            <div className="text-[10px] text-emerald-400/80 font-mono mt-0.5">Lifetime Approved</div>
          </div>
        </div>
      </div>

      {/* 🧭 Tab Switcher: Request Form / History Table */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#08152c]/90 border border-cyan-500/20 max-w-md">
        <button
          onClick={() => setActiveTab("REQUEST")}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
            activeTab === "REQUEST"
              ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-black shadow-[0_0_15px_rgba(0,210,255,0.4)]"
              : "text-slate-400 hover:text-white hover:bg-slate-800/50"
          }`}
        >
          <ArrowDownLeft className="w-4 h-4" />
          <span>Request Withdrawal</span>
        </button>

        <button
          onClick={() => setActiveTab("HISTORY")}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
            activeTab === "HISTORY"
              ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-black shadow-[0_0_15px_rgba(0,210,255,0.4)]"
              : "text-slate-400 hover:text-white hover:bg-slate-800/50"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Withdrawal History ({historyList.length})</span>
        </button>
      </div>

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* 1️⃣ TAB 1: WITHDRAWAL REQUEST FORM                                   */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {activeTab === "REQUEST" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Form Card (7 Cols) */}
          <div className="lg:col-span-7 rounded-3xl bg-[#08152c]/90 border border-cyan-500/25 p-5 sm:p-7 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 font-['Orbitron',sans-serif]">
                  <ArrowDownLeft className="w-5 h-5 text-cyan-400" /> Submit Withdrawal Request
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Direct transfer to your BEP-20 wallet upon Admin verification.
                </p>
              </div>
              <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Min $10 • 5% Fee
              </span>
            </div>

            <form onSubmit={handleWithdrawalSubmit} className="space-y-5">
              {/* Amount Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <label className="text-slate-300">Withdrawal Amount (USDT)</label>
                  <span className="text-slate-400">
                    Available: <strong className="text-cyan-300 font-mono">${balances.currentIncomeWallet.toFixed(2)}</strong>
                  </span>
                </div>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400 font-bold text-lg font-mono">
                    $
                  </span>
                  <input
                    type="number"
                    step="any"
                    min={MIN_WITHDRAWAL}
                    max={balances.currentIncomeWallet}
                    placeholder="Enter amount (min $10)"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full bg-[#030914] border border-cyan-500/30 focus:border-cyan-400 rounded-2xl py-3.5 pl-9 pr-24 text-white text-base sm:text-lg font-mono placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition"
                  />
                  <button
                    type="button"
                    onClick={() => handlePresetAmount("MAX")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-xl text-xs font-bold font-mono transition cursor-pointer"
                  >
                    MAX
                  </button>
                </div>

                {/* Preset Chips */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-slate-400 mr-1">Presets:</span>
                  {[10, 25, 50, 100, 250, 500].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handlePresetAmount(preset)}
                      className="px-2.5 py-1 bg-[#09172f] hover:bg-[#0f2752] text-slate-300 hover:text-cyan-300 border border-slate-700 hover:border-cyan-500/50 rounded-xl text-xs font-mono font-bold transition cursor-pointer"
                    >
                      +${preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Destination Wallet Address Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <label className="text-slate-300">Receiving Wallet Address (USDT BEP-20)</label>
                  {destinationWallet && (
                    <button
                      type="button"
                      onClick={() => handleCopy(destinationWallet, "Wallet Address")}
                      className="text-cyan-400 hover:text-cyan-300 text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      {copiedText === destinationWallet ? <Check size={12} /> : <Copy size={12} />}
                      <span>Copy Address</span>
                    </button>
                  )}
                </div>

                <div className="relative">
                  <input
                    type="text"
                    placeholder="0x... (BEP-20 / EVM address)"
                    value={destinationWallet}
                    onChange={(e) => setDestinationWallet(e.target.value)}
                    className="w-full bg-[#030914] border border-cyan-500/30 focus:border-cyan-400 rounded-2xl py-3.5 px-4 text-white text-xs sm:text-sm font-mono placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  Ensure this is your Binance Smart Chain (BEP-20) address. Admin sends USDT directly to this address.
                </p>
              </div>

              {/* Real-time Calculation Breakdown Box */}
              <div className="p-4 rounded-2xl bg-[#030914] border border-cyan-500/20 space-y-2.5">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Calculation Summary</span>
                  <span className="text-cyan-400 font-mono">5% Flat Fee Applied</span>
                </div>

                <div className="flex items-center justify-between text-xs sm:text-sm text-slate-300">
                  <span>Gross Requested Amount</span>
                  <span className="font-mono font-bold text-white">${numWithdraw.toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between text-xs sm:text-sm text-rose-400">
                  <span>Admin / Platform Fee ({WITHDRAWAL_FEE_PERCENT}%)</span>
                  <span className="font-mono font-bold">-${adminFee.toFixed(2)}</span>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-sm sm:text-base font-bold">
                  <span className="text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 size={16} /> Net Payout (95%)
                  </span>
                  <span className="font-mono text-emerald-400 text-lg sm:text-xl font-black">
                    ${netWithdrawPayout.toFixed(2)} USDT
                  </span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting || numWithdraw < MIN_WITHDRAWAL || numWithdraw > balances.currentIncomeWallet}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-400 hover:from-cyan-400 hover:to-blue-500 text-black font-black text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(0,210,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 cursor-pointer flex items-center justify-center gap-2 active:scale-98 font-['Orbitron',sans-serif]"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing Request...</span>
                  </>
                ) : (
                  <>
                    <ArrowDownLeft className="w-4 h-4" />
                    <span>Submit Withdrawal Request (${MIN_WITHDRAWAL} Min • 5% Fee)</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Rules & Policy Side Panel (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-3xl bg-[#08152c]/90 border border-cyan-500/20 p-5 sm:p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 font-['Orbitron',sans-serif]">
                <ShieldCheck className="w-4 h-4 text-cyan-400" /> Official Withdrawal Guidelines
              </h3>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="p-3 rounded-2xl bg-[#030914] border border-slate-800 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 font-bold font-mono">
                    10
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Minimum Withdrawal: $10.00</h4>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Requests below $10 cannot be submitted. You can accumulate earnings and request anytime.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-[#030914] border border-slate-800 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0 font-bold font-mono">
                    5%
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Admin / Platform Charge: 5%</h4>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      A flat 5% platform charge is deducted automatically. You receive 95% net amount in USDT.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-[#030914] border border-slate-800 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 font-bold font-mono">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Manual Admin Verification & Payout</h4>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      All withdrawal requests undergo manual administrative audit. Once approved, the payment is dispatched manually with an on-chain transaction hash.
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-[#030914] border border-slate-800 flex items-start gap-3">
                  <div className="w-7 h-7 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 font-bold font-mono">
                    24h
                  </div>
                  <div>
                    <h4 className="font-bold text-white">1 Withdrawal Request Per 24h</h4>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Users can place 1 withdrawal request per 24 hours to ensure orderly blockchain settlement.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Balance Status */}
            <div className="rounded-3xl bg-gradient-to-br from-[#09172f] to-[#030914] border border-cyan-500/30 p-5 shadow-xl">
              <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
                <span>Account Status</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Active Member
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-400">Available to Withdraw</div>
                  <div className="text-xl font-black text-cyan-300 font-mono mt-0.5">
                    ${balances.currentIncomeWallet.toFixed(2)} USDT
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("HISTORY")}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <span>View History</span>
                  <ExternalLink size={12} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* 2️⃣ TAB 2: LIVE WITHDRAWAL HISTORY & STATUS TRACKER                  */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {(activeTab === "HISTORY" || activeTab === "ALL") && (
        <div className="rounded-3xl bg-[#08152c]/90 border border-cyan-500/25 p-5 sm:p-7 shadow-xl space-y-5">
          {/* Header & Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800/80 pb-4">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 font-['Orbitron',sans-serif]">
                <Clock className="w-5 h-5 text-cyan-400" /> Withdrawal History & Status Tracker
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Track pending approvals, completed manual payments, and transaction hashes.
              </p>
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap items-center gap-1.5">
              {["ALL", "PENDING", "COMPLETED", "CANCELLED"].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition cursor-pointer ${
                    statusFilter === st
                      ? "bg-cyan-500 text-black shadow-[0_0_10px_rgba(0,210,255,0.4)]"
                      : "bg-[#030914] text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  {st === "COMPLETED" ? "PAID" : st}
                </button>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by ID, Address, Amount, or Hash..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#030914] border border-slate-800 focus:border-cyan-500/50 rounded-2xl py-2.5 pl-10 pr-4 text-xs sm:text-sm text-white placeholder:text-slate-600 focus:outline-none transition"
            />
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#030914]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#09172f]/80 text-slate-400 uppercase tracking-wider text-[11px] font-bold border-b border-slate-800">
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Request ID</th>
                  <th className="py-3 px-4">Gross Amount</th>
                  <th className="py-3 px-4">5% Admin Fee</th>
                  <th className="py-3 px-4">Net Payout</th>
                  <th className="py-3 px-4">Receiving Wallet</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Payment TxID / Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-10 text-center text-slate-500">
                      <FileText className="w-8 h-8 mx-auto text-slate-600 mb-2 opacity-50" />
                      <p className="text-sm font-semibold">No withdrawal records found.</p>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {statusFilter !== "ALL"
                          ? `No records under "${statusFilter}" filter.`
                          : "Submit a withdrawal above to see your history."}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredHistory.map((item, idx) => {
                    const gross = Number(
                      item.investment || item.requestedAmount || item.amount || 0
                    );
                    const fee = Number(item.gasFee ?? gross * 0.05);
                    const net = Number(
                      item.exchangeAmount ?? item.netAmount ?? gross - fee
                    );
                    const rawStatus = String(item.status || "Pending").toLowerCase();
                    const isPending = rawStatus === "pending";
                    const isApproved =
                      rawStatus === "completed" || rawStatus === "approved";
                    const isCancelled =
                      rawStatus === "cancelled" || rawStatus === "rejected";
                    const addr = item.clientAddress || loggedUser?.account || "";
                    const txId = item.id || item._id || "WITH-ID";

                    return (
                      <tr
                        key={item._id || item.id || idx}
                        className="hover:bg-[#09172f]/40 transition duration-150"
                      >
                        {/* Index */}
                        <td className="py-3.5 px-4 text-slate-500 font-mono">
                          {idx + 1}
                        </td>

                        {/* Request ID */}
                        <td className="py-3.5 px-4 font-mono font-bold text-cyan-300">
                          {txId}
                        </td>

                        {/* Gross */}
                        <td className="py-3.5 px-4 font-bold text-white font-mono">
                          ${gross.toFixed(2)}
                        </td>

                        {/* 5% Fee */}
                        <td className="py-3.5 px-4 font-mono font-semibold text-rose-400">
                          -${fee.toFixed(2)}
                        </td>

                        {/* Net */}
                        <td className="py-3.5 px-4 font-mono font-black text-emerald-400 text-sm">
                          ${net.toFixed(2)}
                        </td>

                        {/* Receiving Wallet */}
                        <td className="py-3.5 px-4 font-mono text-slate-300">
                          <div className="flex items-center gap-1.5">
                            <span title={addr}>{maskWalletAddress(addr)}</span>
                            {addr && (
                              <button
                                onClick={() => handleCopy(addr, "Address")}
                                className="text-slate-500 hover:text-cyan-400 transition"
                                title="Copy Address"
                              >
                                {copiedText === addr ? (
                                  <Check size={12} className="text-emerald-400" />
                                ) : (
                                  <Copy size={12} />
                                )}
                              </button>
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          {isPending && (
                            <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 inline-flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                              Pending Approval
                            </span>
                          )}
                          {isApproved && (
                            <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 inline-flex items-center gap-1.5">
                              <CheckCircle2 size={12} />
                              Paid / Approved
                            </span>
                          )}
                          {isCancelled && (
                            <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 inline-flex items-center gap-1.5">
                              <XCircle size={12} />
                              Rejected & Refunded
                            </span>
                          )}
                        </td>

                        {/* Date */}
                        <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                          {item.createdAt
                            ? new Date(item.createdAt).toLocaleString()
                            : "—"}
                        </td>

                        {/* Tx Hash / Note */}
                        <td className="py-3.5 px-4 font-mono text-[11px]">
                          {item.hash && item.hash !== "—" ? (
                            <div className="flex items-center gap-1 text-cyan-300">
                              <span className="truncate max-w-[120px]" title={item.hash}>
                                {item.hash.startsWith("0x")
                                  ? maskWalletAddress(item.hash)
                                  : item.hash}
                              </span>
                              <button
                                onClick={() => handleCopy(item.hash, "Tx Hash")}
                                className="text-slate-500 hover:text-cyan-400 transition"
                                title="Copy Tx Hash"
                              >
                                {copiedText === item.hash ? (
                                  <Check size={12} className="text-emerald-400" />
                                ) : (
                                  <Copy size={12} />
                                )}
                              </button>
                              {item.hash.startsWith("0x") && (
                                <a
                                  href={`https://bscscan.com/tx/${item.hash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-slate-500 hover:text-cyan-400 transition"
                                  title="View on BscScan"
                                >
                                  <ExternalLink size={12} />
                                </a>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-500 italic">
                              {item.remark || (isPending ? "Awaiting Admin Payout" : "—")}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestWithdrawal;
