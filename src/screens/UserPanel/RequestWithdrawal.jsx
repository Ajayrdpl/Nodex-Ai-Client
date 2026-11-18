// src/screens/UserPanel/RequestWithdrawal.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Zap,
  Users,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  DollarSign,
  UserCheck,
  Sparkles,
  Layers,
  ArrowRight,
  Copy,
  Check,
  Info,
  Clock,
  ExternalLink,
  ShieldAlert,
  Lock,
  Unlock,
} from "lucide-react";
import {
  requestWithdrawalApi,
  requestPrincipalWithdrawalApi,
  activateTeamMemberApi,
  reinvestSelfApi,
  getWalletBalancesApi,
  getUserProfileApi,
  getAllUserWithdrawalHistory,
} from "../../api/user.api";
import { setLoading } from "../../redux/slices/loadingSlice";
import { maskWalletAddress } from "../../utils/additionalFunc";

const MIN_WITHDRAWAL = 1;              // $1 Minimum Withdrawal (Official NODEXAI Rule)
const WITHDRAWAL_FEE_PERCENT = 5;      // 5% Platform Fee (Official NODEXAI Rule)
const MIN_DEPOSIT = 10;                // $10 Minimum Deposit
const PRINCIPAL_EARLY_DAYS = 30;       // 30 Days threshold for Principal Withdrawal
const PRINCIPAL_EARLY_DEDUCTION = 25;  // 25% Principal Deduction Before 30 Days

const RequestWithdrawal = () => {
  const dispatch = useDispatch();
  const loggedUser = useSelector((state) => state?.isLoggedUser?.data);

  // Active Tab: "withdraw" | "principal" | "activate" | "reinvest" | "history"
  const [activeTab, setActiveTab] = useState("withdraw");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [copiedText, setCopiedText] = useState(null);

  // Live Wallet & System Balances
  const [walletBalances, setWalletBalances] = useState({
    currentIncomeWallet: 0,
    p2pWallet: 0,
    totalInvestment: 0,
    activeInvestment: 0,
    activePrincipal: 0,
    isActive: false,
    activationDate: null,
    daysActive: 0,
    isBefore30Days: true,
    earlyDeductionPercent: 25,
    earnings: {
      totalRoi: 0,
      totalWorking: 0,
      maxRoiCap: 0,
      maxWorkingCap: 0,
      isRoiCapped: false,
      isWorkingCapped: false,
    },
  });

  // 1. Standard Income Withdrawal Form State (5% Fee, Min $1)
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [destinationWallet, setDestinationWallet] = useState(
    loggedUser?.account || loggedUser?.walletAddress || ""
  );

  // 2. Principal Withdrawal Form State (25% Deduction < 30 Days | 0% >= 30 Days + 5% Fee)
  const [principalWithdrawAmount, setPrincipalWithdrawAmount] = useState("");
  const [principalDestinationWallet, setPrincipalDestinationWallet] = useState(
    loggedUser?.account || loggedUser?.walletAddress || ""
  );

  // 3. Direct Team ID Activation Form State (0% Fee)
  const [targetUsername, setTargetUsername] = useState("");
  const [activationAmount, setActivationAmount] = useState(50);
  const [activationWalletType, setActivationWalletType] = useState("INCOME"); // "INCOME" | "P2P"

  // 4. Self Reinvestment Form State (0% Fee)
  const [reinvestAmount, setReinvestAmount] = useState(50);
  const [reinvestWalletType, setReinvestWalletType] = useState("P2P"); // "P2P" | "INCOME"

  // 5. Withdrawal & Transaction History
  const [historyList, setHistoryList] = useState([]);

  // Copy helper
  const handleCopy = (text, label = "Copied") => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    toast.success(`${label} copied to clipboard!`);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // 📡 Fetch All Balances & Profile Data
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

        // Process Wallet Balances
        if (balRes.status === "fulfilled" && balRes.value?.success) {
          const d = balRes.value.data || balRes.value;
          const activePrincipalVal = Number(d.activePrincipal ?? d.activeInvestment ?? d.totalInvestment ?? 0);
          const actDate = d.principalWithdrawal?.activationDate || d.activationDate || loggedUser?.active?.activeDate || loggedUser?.createdAt;
          const daysPassed = d.principalWithdrawal?.daysActive !== undefined
            ? Number(d.principalWithdrawal.daysActive)
            : Math.max(0, Math.floor((Date.now() - new Date(actDate || Date.now()).getTime()) / (1000 * 60 * 60 * 24)));
          const before30 = daysPassed < PRINCIPAL_EARLY_DAYS;

          setWalletBalances({
            currentIncomeWallet: Number(d.currentIncomeWallet ?? d.availableBalance ?? d.totalIncome ?? 0),
            p2pWallet: Number(d.p2pWallet ?? d.p2pBalance ?? 0),
            totalInvestment: Number(d.totalInvestment ?? 0),
            activeInvestment: activePrincipalVal,
            activePrincipal: activePrincipalVal,
            isActive: d.isActive ?? false,
            activationDate: actDate,
            daysActive: daysPassed,
            isBefore30Days: before30,
            earlyDeductionPercent: before30 ? PRINCIPAL_EARLY_DEDUCTION : 0,
            earnings: d.earnings || {
              totalRoi: 0,
              totalWorking: 0,
              maxRoiCap: activePrincipalVal * 2.2,
              maxWorkingCap: activePrincipalVal * 5.0,
              isRoiCapped: false,
              isWorkingCapped: false,
            },
          });
        }

        // Process User Profile Wallet Address
        if (profRes.status === "fulfilled" && profRes.value?.success && profRes.value?.data?.account) {
          const addr = profRes.value.data.account;
          if (!destinationWallet) setDestinationWallet(addr);
          if (!principalDestinationWallet) setPrincipalDestinationWallet(addr);
        }

        // Process History
        if (histRes.status === "fulfilled" && histRes.value) {
          const raw = histRes.value.data || histRes.value;
          const list = Array.isArray(raw?.history)
            ? raw.history
            : Array.isArray(raw)
              ? raw
              : [];
          setHistoryList(list);
        }

      } catch (err) {
        console.error("Error fetching withdrawal & balance hub data:", err);
      } finally {
        if (isManual) setRefreshing(false);
        else dispatch(setLoading(false));
      }
    },
    [dispatch, destinationWallet, principalDestinationWallet, loggedUser]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 🧮 Standard Income Withdrawal Calculations (5% Fee)
  const numWithdraw = Number(withdrawAmount) || 0;
  const adminFee = (numWithdraw * WITHDRAWAL_FEE_PERCENT) / 100; // 5% Platform Deduction
  const netWithdrawPayout = Math.max(0, numWithdraw - adminFee);   // 95% Net Payout

  // 🧮 Principal Withdrawal Calculations (25% Deduction < 30 Days | 0% >= 30 Days + 5% Fee)
  const numPrincipal = Number(principalWithdrawAmount) || 0;
  const principalDays = walletBalances.daysActive || 0;
  const isEarlyPrincipal = walletBalances.isBefore30Days;
  const principalDeductionRate = isEarlyPrincipal ? PRINCIPAL_EARLY_DEDUCTION : 0;
  const principalDeductionAmount = (numPrincipal * principalDeductionRate) / 100;
  const principalPlatformFee = (numPrincipal * WITHDRAWAL_FEE_PERCENT) / 100; // 5%
  const totalPrincipalDeductions = principalDeductionAmount + principalPlatformFee;
  const netPrincipalPayout = Math.max(0, numPrincipal - totalPrincipalDeductions);

  // =========================================================================
  // 1️⃣ SUBMIT STANDARD INCOME WITHDRAWAL (5% Platform Fee, Min $1)
  // =========================================================================
  const handleStandardWithdrawalSubmit = async (e) => {
    e.preventDefault();

    if (numWithdraw < MIN_WITHDRAWAL) {
      toast.warning(`Minimum withdrawal amount is $${MIN_WITHDRAWAL}.`);
      return;
    }
    if (numWithdraw > walletBalances.currentIncomeWallet) {
      toast.error("Withdrawal amount exceeds your available Current Income Wallet balance.");
      return;
    }
    if (!destinationWallet || !destinationWallet.trim().startsWith("0x")) {
      toast.warning("Please provide a valid USDT (BEP-20) wallet address starting with 0x.");
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

      if (res?.success || res?.message?.toLowerCase().includes("success")) {
        toast.success(
          res?.message ||
          `Withdrawal request of $${numWithdraw} submitted! (5% Platform Fee: $${adminFee.toFixed(2)}, Net Payout: $${netWithdrawPayout.toFixed(2)})`
        );
        setWithdrawAmount("");
        loadData(true);
      } else {
        toast.error(res?.message || "Failed to submit withdrawal request.");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || "Withdrawal request failed.");
    } finally {
      setIsSubmitting(false);
      dispatch(setLoading(false));
    }
  };

  // =========================================================================
  // 2️⃣ SUBMIT PRINCIPAL WITHDRAWAL (25% Deduction < 30 Days | 0% >= 30 Days + 5% Fee)
  // =========================================================================
  const handlePrincipalWithdrawalSubmit = async (e) => {
    e.preventDefault();

    if (numPrincipal < MIN_WITHDRAWAL) {
      toast.warning(`Minimum principal withdrawal amount is $${MIN_WITHDRAWAL}.`);
      return;
    }
    if (numPrincipal > walletBalances.activePrincipal) {
      toast.error(`Requested amount exceeds your active principal balance of $${walletBalances.activePrincipal.toFixed(2)}.`);
      return;
    }
    if (!principalDestinationWallet || !principalDestinationWallet.trim().startsWith("0x")) {
      toast.warning("Please provide a valid USDT (BEP-20) wallet address starting with 0x.");
      return;
    }

    try {
      setIsSubmitting(true);
      dispatch(setLoading(true));

      const payload = {
        amount: numPrincipal,
        walletAddress: principalDestinationWallet.trim(),
      };

      const res = await requestPrincipalWithdrawalApi(payload);

      if (res?.success || res?.message?.toLowerCase().includes("success")) {
        toast.success(
          res?.message ||
          `Principal withdrawal of $${numPrincipal} submitted! Net Payout: $${netPrincipalPayout.toFixed(2)}`
        );
        setPrincipalWithdrawAmount("");
        loadData(true);
      } else {
        toast.error(res?.message || "Failed to submit principal withdrawal request.");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || "Principal withdrawal request failed.");
    } finally {
      setIsSubmitting(false);
      dispatch(setLoading(false));
    }
  };

  // =========================================================================
  // 3️⃣ SUBMIT DIRECT TEAM MEMBER ID ACTIVATION (0% Platform Fee - $0 Deduction)
  // =========================================================================
  const handleTeamMemberActivationSubmit = async (e) => {
    e.preventDefault();
    const numAmount = Number(activationAmount) || 0;

    if (!targetUsername.trim()) {
      toast.warning("Please enter the target team member's username.");
      return;
    }
    if (numAmount < MIN_DEPOSIT) {
      toast.warning(`Minimum activation amount is $${MIN_DEPOSIT}.`);
      return;
    }

    const availableBal =
      activationWalletType === "INCOME"
        ? walletBalances.currentIncomeWallet
        : walletBalances.p2pWallet;

    if (numAmount > availableBal) {
      toast.error(
        `Insufficient funds in ${activationWalletType} Wallet. Available: $${availableBal.toFixed(2)}`
      );
      return;
    }

    try {
      setIsSubmitting(true);
      dispatch(setLoading(true));

      const payload = {
        targetUsername: targetUsername.trim(),
        amount: numAmount,
        walletType: activationWalletType,
      };

      const res = await activateTeamMemberApi(payload);

      if (res?.success || res?.message?.toLowerCase().includes("success")) {
        toast.success(
          res?.message ||
          `Successfully activated ${targetUsername} with $${numAmount}! (0% Platform Fee Applied)`
        );
        setTargetUsername("");
        loadData(true);
      } else {
        toast.error(res?.message || "Failed to activate team member.");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || "Activation request failed.");
    } finally {
      setIsSubmitting(false);
      dispatch(setLoading(false));
    }
  };

  // =========================================================================
  // 4️⃣ SUBMIT SELF REINVESTMENT (0% Platform Fee - $0 Deduction)
  // =========================================================================
  const handleSelfReinvestmentSubmit = async (e) => {
    e.preventDefault();
    const numAmount = Number(reinvestAmount) || 0;

    if (numAmount < MIN_DEPOSIT) {
      toast.warning(`Minimum reinvestment amount is $${MIN_DEPOSIT}.`);
      return;
    }

    const availableBal =
      reinvestWalletType === "P2P"
        ? walletBalances.p2pWallet
        : walletBalances.currentIncomeWallet;

    if (numAmount > availableBal) {
      toast.error(
        `Insufficient funds in ${reinvestWalletType} Wallet. Available: $${availableBal.toFixed(2)}`
      );
      return;
    }

    try {
      setIsSubmitting(true);
      dispatch(setLoading(true));

      const payload = {
        amount: numAmount,
        walletType: reinvestWalletType,
      };

      const res = await reinvestSelfApi(payload);

      if (res?.success || res?.message?.toLowerCase().includes("success")) {
        toast.success(
          res?.message ||
          `Successfully reinvested $${numAmount} from ${reinvestWalletType} Wallet! (0% Fee Applied)`
        );
        setReinvestAmount(50);
        loadData(true);
      } else {
        toast.error(res?.message || "Self reinvestment failed.");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || "Self reinvestment error.");
    } finally {
      setIsSubmitting(false);
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="p-3 sm:p-5 md:p-6 max-w-[1400px] mx-auto space-y-4 sm:space-y-6 text-slate-100 font-sans">
      {/* 🌟 1. Top Executive Official Deposit & Withdrawal Banner (Exact Rules from Images) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-[#070D1E] to-slate-950 border border-cyan-500/30 shadow-2xl p-4 sm:p-6 md:p-7">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
                <DollarSign className="w-3.5 h-3.5" /> NODEXAI Official Rules
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Simple • Clear • Accessible
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white font-['Orbitron',monospace]">
              Deposit & Withdrawal Hub
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              Min Deposit: <strong className="text-white">$10</strong> | Min Withdrawal: <strong className="text-white">$1</strong> | Withdrawal Fee: <strong className="text-white">5%</strong> | Principal: <strong className="text-amber-300">25% Deduction (&lt;30 Days)</strong> / <strong className="text-emerald-400">0% Deduction (&ge;30 Days)</strong>
            </p>
          </div>

          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="px-4 py-2.5 bg-slate-900/90 hover:bg-slate-800 text-cyan-300 hover:text-white border border-slate-700 hover:border-cyan-400 rounded-2xl text-xs font-bold transition flex items-center gap-2 shadow-lg cursor-pointer shrink-0 active:scale-95"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-cyan-400" : ""}`} />
            <span>Refresh Balances</span>
          </button>
        </div>

        {/* 3 Executive Metric Badges Matching Image Structure */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 mt-4 border-t border-slate-800/80">
          <div className="p-3 bg-slate-900/80 rounded-2xl border border-cyan-500/20 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Minimum Deposit</span>
              <span className="text-lg font-black text-white font-mono">$10</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <ArrowDownLeft size={18} />
            </div>
          </div>

          <div className="p-3 bg-slate-900/80 rounded-2xl border border-emerald-500/20 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Minimum Withdrawal</span>
              <span className="text-lg font-black text-white font-mono">$1</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <ArrowUpRight size={18} />
            </div>
          </div>

          <div className="p-3 bg-slate-900/80 rounded-2xl border border-amber-500/20 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Withdrawal Fee</span>
              <span className="text-lg font-black text-amber-300 font-mono">5%</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <DollarSign size={18} />
            </div>
          </div>
        </div>
      </div>

      {/* 💳 2. Live Balances & Capping Pods (4 Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Pod 1: Current Income Wallet */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-950/70 via-slate-900/90 to-[#040814] border border-emerald-500/30 hover:border-emerald-400 p-3.5 sm:p-4 shadow-lg hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-emerald-300 transition">
              Current Income Wallet
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition shadow-sm">
              <DollarSign size={16} />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-100 font-mono tracking-tight font-['Orbitron',monospace]">
              ${walletBalances.currentIncomeWallet.toFixed(2)}
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium mt-1">
              <span>Standard 5% Fee Withdraw</span>
              <span className="text-emerald-400 font-bold">Min $1</span>
            </div>
          </div>
        </div>

        {/* Pod 2: Active Principal Capital */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-950/70 via-slate-900/90 to-[#040814] border border-cyan-500/30 hover:border-cyan-400 p-3.5 sm:p-4 shadow-lg hover:shadow-[0_0_20px_rgba(6,182,212,0.2)] transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-cyan-300 transition">
              Active Principal Capital
            </span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition shadow-sm">
              <ShieldCheck size={16} />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight font-['Orbitron',monospace]">
              ${walletBalances.activePrincipal.toFixed(2)}
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium mt-1">
              <span>Account Age: <strong className="text-cyan-300">{walletBalances.daysActive} Days</strong></span>
              <span className={walletBalances.isBefore30Days ? "text-amber-400 font-bold" : "text-emerald-400 font-bold"}>
                {walletBalances.isBefore30Days ? "25% Deduction" : "0% Deduction"}
              </span>
            </div>
          </div>
        </div>

        {/* Pod 3: P2P Wallet Balance */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-950/70 via-slate-900/90 to-[#040814] border border-purple-500/30 hover:border-purple-400 p-3.5 sm:p-4 shadow-lg hover:shadow-[0_0_20px_rgba(168,85,247,0.2)] transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-purple-300 transition">
              P2P Wallet Balance
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-105 transition shadow-sm">
              <Zap size={16} />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-300 to-purple-100 font-mono tracking-tight font-['Orbitron',monospace]">
              ${walletBalances.p2pWallet.toFixed(2)}
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium mt-1">
              <span>0% Fee Activation / Top-up</span>
              <span className="text-purple-400 font-bold">0% Fee</span>
            </div>
          </div>
        </div>

        {/* Pod 4: 220% Max ROI Capping */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-950/70 via-slate-900/90 to-[#040814] border border-blue-500/30 hover:border-blue-400 p-3.5 sm:p-4 shadow-lg hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-blue-300 transition">
              220% Max ROI Capping
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-105 transition shadow-sm">
              <Layers size={16} />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-base sm:text-lg font-black text-white font-mono tracking-tight flex items-center justify-between">
              <span>Cap: <strong className="text-cyan-300">${walletBalances.earnings?.maxRoiCap?.toFixed(2) || "0.00"}</strong></span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium mt-2 pt-1 border-t border-slate-800">
              <span>Earned ROI: ${walletBalances.earnings?.totalRoi?.toFixed(2) || "0.00"}</span>
              <span className="text-cyan-400 font-bold font-mono">220% Max</span>
            </div>
          </div>
        </div>
      </div>

      {/* 🧭 3. Navigation Hub Switcher (5 Tabs) */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        {[
          {
            key: "withdraw",
            label: "1. Income Withdrawal (5% Fee, Min $1)",
            icon: ArrowDownLeft,
            theme: "from-cyan-500 to-blue-600 text-black shadow-cyan-500/25",
          },
          {
            key: "principal",
            label: "2. Principal Withdrawal (30-Day Rule)",
            icon: Lock,
            theme: "from-amber-500 to-orange-600 text-black shadow-amber-500/25",
          },
          {
            key: "activate",
            label: "3. Direct Team ID Activation (0% Fee)",
            icon: UserCheck,
            theme: "from-emerald-500 to-teal-600 text-black shadow-emerald-500/25",
          },
          {
            key: "reinvest",
            label: "4. Self Reinvestment (0% Fee)",
            icon: RefreshCw,
            theme: "from-purple-500 to-indigo-600 text-white shadow-purple-500/25",
          },
          {
            key: "history",
            label: `Transaction History (${historyList.length})`,
            icon: Clock,
            theme: "from-slate-700 to-slate-800 text-white shadow-slate-700/25",
          },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 py-2 px-3.5 sm:px-4 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer ${isActive
                  ? `bg-gradient-to-r ${tab.theme} font-black shadow-lg scale-102`
                  : "bg-slate-900/90 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700"
                }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* =====================================================================
          TAB 1: STANDARD INCOME WITHDRAWAL (5% FEE, MIN $1)
          ===================================================================== */}
      {activeTab === "withdraw" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Form: Withdrawal Submission */}
          <div className="lg:col-span-7 bg-[#08101E]/95 border-2 border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 backdrop-blur-md">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 bg-cyan-950/80 border border-cyan-500/30 px-2.5 py-0.5 rounded-full">
                Income / Profit Withdrawal
              </span>
              <h3 className="text-lg sm:text-xl font-black text-white mt-1 font-['Orbitron',monospace]">
                Withdraw from Current Income Wallet
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Minimum withdrawal is <strong>$1</strong>. Flat <strong>5% platform fee</strong> applies. 95% net amount is transferred directly to your BEP-20 wallet address.
              </p>
            </div>

            <form onSubmit={handleStandardWithdrawalSubmit} className="space-y-4">
              {/* Amount Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-slate-300">Withdrawal Amount ($)</label>
                  <button
                    type="button"
                    onClick={() =>
                      setWithdrawAmount(
                        walletBalances.currentIncomeWallet > 0
                          ? walletBalances.currentIncomeWallet.toFixed(2)
                          : "0"
                      )
                    }
                    className="text-cyan-400 font-bold hover:underline cursor-pointer text-xs"
                  >
                    Max Available (${walletBalances.currentIncomeWallet.toFixed(2)})
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">$</span>
                  <input
                    type="number"
                    min={MIN_WITHDRAWAL}
                    step="any"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="Enter amount (Min $1)"
                    className="w-full pl-9 pr-4 py-3 bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-2xl text-white font-mono text-base outline-none transition shadow-inner"
                  />
                </div>
              </div>

              {/* Quick Amount Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                {[1, 5, 10, 25, 50, 100, 250, 500].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setWithdrawAmount(amt.toString())}
                    className="px-3 py-1 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 rounded-xl text-xs font-mono font-bold border border-slate-800 transition cursor-pointer"
                  >
                    ${amt}
                  </button>
                ))}
              </div>

              {/* Destination Wallet Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-slate-300">
                    Recipient USDT (BEP-20) Wallet Address
                  </label>
                  {destinationWallet && (
                    <button
                      type="button"
                      onClick={() => handleCopy(destinationWallet, "Wallet Address")}
                      className="text-cyan-400 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      {copiedText === destinationWallet ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      <span>{copiedText === destinationWallet ? "Copied" : "Copy"}</span>
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={destinationWallet}
                  onChange={(e) => setDestinationWallet(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-cyan-400 rounded-2xl text-white font-mono text-xs outline-none transition"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  numWithdraw < MIN_WITHDRAWAL ||
                  numWithdraw > walletBalances.currentIncomeWallet ||
                  !destinationWallet
                }
                className={`w-full py-3.5 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xl cursor-pointer active:scale-95 ${isSubmitting ||
                    numWithdraw < MIN_WITHDRAWAL ||
                    numWithdraw > walletBalances.currentIncomeWallet ||
                    !destinationWallet
                    ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                    : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black shadow-cyan-500/25 font-black"
                  }`}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Processing Withdrawal...
                  </>
                ) : (
                  <>
                    <ArrowDownLeft className="w-4 h-4" />
                    Submit Withdrawal ${numWithdraw > 0 ? numWithdraw.toFixed(2) : "0.00"}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Summary: Real-Time Breakdown */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-[#08101E]/95 border-2 border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5 font-['Orbitron',monospace]">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  Live Fee & Payout Calculator
                </h4>
                <span className="text-[10px] font-bold text-slate-400 font-mono">5% Platform Fee</span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800/80">
                  <span className="text-slate-400">Withdrawal Amount:</span>
                  <span className="font-mono font-bold text-white text-sm">${numWithdraw.toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800/80">
                  <span className="text-slate-400">Platform Fee (5%):</span>
                  <span className="font-mono font-bold text-rose-400">-${adminFee.toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800/80">
                  <span className="text-slate-300 font-bold">Net Payout to Wallet (95%):</span>
                  <span className="font-mono font-black text-emerald-400 text-sm">${netWithdrawPayout.toFixed(2)}</span>
                </div>
              </div>

              {/* Security & Verification Disclaimer */}
              <div className="p-3 bg-slate-950/90 rounded-2xl border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
                <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
                  <ShieldAlert className="w-4 h-4 text-cyan-400" />
                  Always Verify Before Confirming
                </div>
                <p>
                  Review the amount, network (BEP-20), wallet, and transaction details carefully before approving any blockchain transaction. Applicable blockchain network fees may be separate from platform fees.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 2: PRINCIPAL WITHDRAWAL (25% DEDUCTION < 30 DAYS | 0% >= 30 DAYS)
          ===================================================================== */}
      {activeTab === "principal" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Form: Principal Withdrawal */}
          <div className="lg:col-span-7 bg-[#08101E]/95 border-2 border-amber-500/40 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 backdrop-blur-md">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-950/80 border border-amber-500/40 px-2.5 py-0.5 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.3)]">
                  Principal Capital Withdrawal
                </span>
                <span className="text-[10px] font-bold text-slate-400 font-mono">30-Day Rule</span>
              </div>

              <h3 className="text-lg sm:text-xl font-black text-white mt-1.5 font-['Orbitron',monospace]">
                Withdraw Active Principal Investment
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Withdraw from your staked principal balance. Early withdrawals before 30 days are subject to a 25% principal deduction. After 30 days, <strong>NO early deduction (0%)</strong> applies!
              </p>
            </div>

            {/* Official 30-Day Status Banner Matching Image */}
            <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${isEarlyPrincipal ? "bg-rose-950/40 border-rose-500/40" : "bg-emerald-950/40 border-emerald-500/40"}`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${isEarlyPrincipal ? "bg-rose-500/20 text-rose-400 border border-rose-500/40" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"}`}>
                  {isEarlyPrincipal ? <Clock className="w-5 h-5 text-rose-400 animate-pulse" /> : <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                </div>
                <div>
                  <div className="text-xs font-black text-white uppercase tracking-wider">
                    {isEarlyPrincipal ? "Before 30 Days: 25% Principal Deduction" : "After 30 Days: No 25% Early Deduction"}
                  </div>
                  <div className="text-[11px] text-slate-300">
                    Account active for <strong className="text-white font-mono">{principalDays} days</strong> ({isEarlyPrincipal ? `${Math.max(0, 30 - principalDays)} days remaining for 0% deduction` : "Fully eligible for zero early penalty!"})
                  </div>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase ${isEarlyPrincipal ? "bg-rose-500/20 text-rose-300 border border-rose-500/40" : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"}`}>
                {isEarlyPrincipal ? "25% Deduction" : "0% Deduction"}
              </span>
            </div>

            <form onSubmit={handlePrincipalWithdrawalSubmit} className="space-y-4">
              {/* Amount Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-slate-300">Principal Amount to Withdraw ($)</label>
                  <button
                    type="button"
                    onClick={() =>
                      setPrincipalWithdrawAmount(
                        walletBalances.activePrincipal > 0
                          ? walletBalances.activePrincipal.toFixed(2)
                          : "0"
                      )
                    }
                    className="text-amber-400 font-bold hover:underline cursor-pointer text-xs"
                  >
                    Max Active (${walletBalances.activePrincipal.toFixed(2)})
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">$</span>
                  <input
                    type="number"
                    min={MIN_WITHDRAWAL}
                    step="any"
                    value={principalWithdrawAmount}
                    onChange={(e) => setPrincipalWithdrawAmount(e.target.value)}
                    placeholder="Enter principal amount (Min $1)"
                    className="w-full pl-9 pr-4 py-3 bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-2xl text-white font-mono text-base outline-none transition shadow-inner"
                  />
                </div>
              </div>

              {/* Destination Wallet Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-slate-300">
                    Recipient USDT (BEP-20) Wallet Address
                  </label>
                  {principalDestinationWallet && (
                    <button
                      type="button"
                      onClick={() => handleCopy(principalDestinationWallet, "Wallet Address")}
                      className="text-amber-400 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      {copiedText === principalDestinationWallet ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                      <span>{copiedText === principalDestinationWallet ? "Copied" : "Copy"}</span>
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={principalDestinationWallet}
                  onChange={(e) => setPrincipalDestinationWallet(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-2xl text-white font-mono text-xs outline-none transition"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  numPrincipal < MIN_WITHDRAWAL ||
                  numPrincipal > walletBalances.activePrincipal ||
                  !principalDestinationWallet
                }
                className={`w-full py-3.5 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xl cursor-pointer active:scale-95 ${isSubmitting ||
                    numPrincipal < MIN_WITHDRAWAL ||
                    numPrincipal > walletBalances.activePrincipal ||
                    !principalDestinationWallet
                    ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                    : "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black shadow-amber-500/25 font-black"
                  }`}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Processing Principal Withdrawal...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Submit Principal Withdrawal ${numPrincipal > 0 ? numPrincipal.toFixed(2) : "0.00"}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Summary: Transparent Deductions Breakdown */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-[#08101E]/95 border-2 border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5 font-['Orbitron',monospace]">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Principal Deductions & Payout
                </h4>
                <span className="text-[10px] font-bold text-slate-400 font-mono">
                  {isEarlyPrincipal ? "25% Early + 5% Fee" : "0% Early + 5% Fee"}
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800/80">
                  <span className="text-slate-400">Principal Requested:</span>
                  <span className="font-mono font-bold text-white text-sm">${numPrincipal.toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800/80">
                  <span className="text-slate-400">
                    Early Deduction ({principalDeductionRate}%):
                  </span>
                  <span className={`font-mono font-bold ${isEarlyPrincipal ? "text-rose-400" : "text-emerald-400"}`}>
                    {isEarlyPrincipal ? `-$${principalDeductionAmount.toFixed(2)}` : "$0.00 (Waived)"}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800/80">
                  <span className="text-slate-400">Platform Withdrawal Fee (5%):</span>
                  <span className="font-mono font-bold text-amber-400">-${principalPlatformFee.toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800/80">
                  <span className="text-slate-300 font-bold">Net Payout to Your Wallet:</span>
                  <span className="font-mono font-black text-emerald-400 text-sm">${netPrincipalPayout.toFixed(2)}</span>
                </div>
              </div>

              {/* Policy notes */}
              <div className="p-3 bg-slate-950/90 rounded-2xl border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
                <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                  <Info className="w-4 h-4 text-amber-400" />
                  Principal Withdrawal Policy
                </div>
                <ul className="list-disc pl-4 space-y-1 text-slate-400">
                  <li><strong>Before 30 Days:</strong> 25% Principal Deduction applies due to early unstaking.</li>
                  <li><strong>After 30 Days:</strong> 0% Early-Withdrawal Deduction (Only standard 5% platform fee applies).</li>
                  <li>Your 220% Maximum ROI capping will automatically adjust to match your remaining active principal.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 3: DIRECT TEAM MEMBER ID ACTIVATION (0% FEE - $0 DEDUCTION)
          ===================================================================== */}
      {activeTab === "activate" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Form: Team Activation */}
          <div className="lg:col-span-7 bg-[#08101E]/95 border-2 border-emerald-500/40 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 backdrop-blur-md">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-2.5 py-0.5 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.3)]">
                  0% Platform Fee Applied
                </span>
                <span className="text-[10px] font-bold text-slate-400 font-mono">$0 Deduction</span>
              </div>

              <h3 className="text-lg sm:text-xl font-black text-white mt-1.5 font-['Orbitron',monospace]">
                Direct Team Member ID Activation
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Activate any team member's ID directly from your Income Wallet or P2P Wallet. 100% of the funds go straight into their package with <strong>ZERO platform or withdrawal deductions</strong>.
              </p>
            </div>

            <form onSubmit={handleTeamMemberActivationSubmit} className="space-y-4">
              {/* Target Username Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Target Member Username (or User ID)</label>
                <div className="relative">
                  <UserCheck className="w-4 h-4 text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={targetUsername}
                    onChange={(e) => setTargetUsername(e.target.value)}
                    placeholder="Enter downline username (e.g. rahul_investor, PEH1025)"
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 focus:border-emerald-400 rounded-2xl text-white text-xs font-mono outline-none transition"
                  />
                </div>
              </div>

              {/* Source Wallet Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Select Source Deduction Wallet (0% Fee)</label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setActivationWalletType("INCOME")}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer ${activationWalletType === "INCOME"
                        ? "bg-emerald-950/60 border-emerald-400 text-white shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                      }`}
                  >
                    <span className="text-[10px] uppercase font-bold block text-emerald-400">Income Wallet (0% Fee)</span>
                    <span className="text-sm font-black font-mono mt-0.5 block">
                      ${walletBalances.currentIncomeWallet.toFixed(2)}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActivationWalletType("P2P")}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer ${activationWalletType === "P2P"
                        ? "bg-purple-950/60 border-purple-400 text-white shadow-[0_0_12px_rgba(168,85,247,0.2)]"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                      }`}
                  >
                    <span className="text-[10px] uppercase font-bold block text-purple-400">P2P Wallet (0% Fee)</span>
                    <span className="text-sm font-black font-mono mt-0.5 block">
                      ${walletBalances.p2pWallet.toFixed(2)}
                    </span>
                  </button>
                </div>
              </div>

              {/* Amount Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-slate-300">Activation Amount ($)</label>
                  <span className="text-emerald-400 font-bold font-mono">0% Fee = $0 Deduction</span>
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">$</span>
                  <input
                    type="number"
                    min={MIN_DEPOSIT}
                    step="any"
                    value={activationAmount}
                    onChange={(e) => setActivationAmount(e.target.value)}
                    placeholder="Enter amount (Min $10)"
                    className="w-full pl-9 pr-4 py-3 bg-slate-950 border border-slate-800 focus:border-emerald-400 rounded-2xl text-white font-mono text-base outline-none transition shadow-inner"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  !targetUsername.trim() ||
                  Number(activationAmount) < MIN_DEPOSIT ||
                  Number(activationAmount) >
                  (activationWalletType === "INCOME"
                    ? walletBalances.currentIncomeWallet
                    : walletBalances.p2pWallet)
                }
                className={`w-full py-3.5 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xl cursor-pointer active:scale-95 ${isSubmitting ||
                    !targetUsername.trim() ||
                    Number(activationAmount) < MIN_DEPOSIT ||
                    Number(activationAmount) >
                    (activationWalletType === "INCOME"
                      ? walletBalances.currentIncomeWallet
                      : walletBalances.p2pWallet)
                    ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                    : "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black shadow-emerald-500/25 font-black"
                  }`}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Activating ID...
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    Activate {targetUsername ? targetUsername : "Member"} with ${activationAmount} (0% Fee)
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Summary */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-[#08101E]/95 border-2 border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 backdrop-blur-md">
              <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 font-['Orbitron',monospace]">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Zero Fee Direct Activation Benefits
              </h4>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-300">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    Save 100% Platform Fees
                  </div>
                  <p className="text-[11px] text-slate-400">
                    No 5% platform fee is deducted. The full 100% value is instantly credited to the user's active investment balance.
                  </p>
                </div>

                <div className="p-3 bg-cyan-950/30 border border-cyan-500/30 rounded-2xl space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-cyan-300">
                    <Zap className="w-4 h-4 text-cyan-400" />
                    Instant Daily ROI Activation
                  </div>
                  <p className="text-[11px] text-slate-400">
                    The target user is upgraded to Active Status instantly, and their 4.5% - 7.5% daily trading ROI starts generating immediately.
                  </p>
                </div>

                <div className="p-3 bg-purple-950/30 border border-purple-500/30 rounded-2xl space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-purple-300">
                    <Users className="w-4 h-4 text-purple-400" />
                    Generates 12% Direct Referral
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Generates 12% Direct Referral Income and 10-Level ROI Dividend automatically for eligible sponsors.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 4: SELF REINVESTMENT (0% FEE FROM P2P / INCOME WALLET)
          ===================================================================== */}
      {activeTab === "reinvest" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Form: Self Reinvestment */}
          <div className="lg:col-span-7 bg-[#08101E]/95 border-2 border-purple-500/40 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 backdrop-blur-md">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-300 bg-purple-950/80 border border-purple-500/40 px-2.5 py-0.5 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.3)]">
                0% Fee Self Top-Up
              </span>
              <h3 className="text-lg sm:text-xl font-black text-white mt-1.5 font-['Orbitron',monospace]">
                Self Reinvestment & Package Top-Up
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Reinvest into your own account using your P2P Wallet or Income Wallet with <strong>0% fee</strong> to increase your active investment and expand your 220% Max ROI capping.
              </p>
            </div>

            <form onSubmit={handleSelfReinvestmentSubmit} className="space-y-4">
              {/* Source Wallet Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Select Source Deduction Wallet (0% Fee)</label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setReinvestWalletType("P2P")}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer ${reinvestWalletType === "P2P"
                        ? "bg-purple-950/60 border-purple-400 text-white shadow-[0_0_12px_rgba(168,85,247,0.2)]"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                      }`}
                  >
                    <span className="text-[10px] uppercase font-bold block text-purple-400">P2P Wallet (0% Fee)</span>
                    <span className="text-sm font-black font-mono mt-0.5 block">
                      ${walletBalances.p2pWallet.toFixed(2)}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReinvestWalletType("INCOME")}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer ${reinvestWalletType === "INCOME"
                        ? "bg-emerald-950/60 border-emerald-400 text-white shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                      }`}
                  >
                    <span className="text-[10px] uppercase font-bold block text-emerald-400">Income Wallet (0% Fee)</span>
                    <span className="text-sm font-black font-mono mt-0.5 block">
                      ${walletBalances.currentIncomeWallet.toFixed(2)}
                    </span>
                  </button>
                </div>
              </div>

              {/* Amount Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-slate-300">Reinvestment Amount ($)</label>
                  <span className="text-purple-400 font-bold font-mono">0% Platform Fee</span>
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">$</span>
                  <input
                    type="number"
                    min={MIN_DEPOSIT}
                    step="any"
                    value={reinvestAmount}
                    onChange={(e) => setReinvestAmount(e.target.value)}
                    placeholder="Enter amount (Min $10)"
                    className="w-full pl-9 pr-4 py-3 bg-slate-950 border border-slate-800 focus:border-purple-400 rounded-2xl text-white font-mono text-base outline-none transition shadow-inner"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  Number(reinvestAmount) < MIN_DEPOSIT ||
                  Number(reinvestAmount) >
                  (reinvestWalletType === "P2P"
                    ? walletBalances.p2pWallet
                    : walletBalances.currentIncomeWallet)
                }
                className={`w-full py-3.5 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xl cursor-pointer active:scale-95 ${isSubmitting ||
                    Number(reinvestAmount) < MIN_DEPOSIT ||
                    Number(reinvestAmount) >
                    (reinvestWalletType === "P2P"
                      ? walletBalances.p2pWallet
                      : walletBalances.currentIncomeWallet)
                    ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                    : "bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white shadow-purple-500/25 font-black"
                  }`}
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Reinvesting...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Reinvest ${reinvestAmount} into My ID (0% Fee)
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Info */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-[#08101E]/95 border-2 border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 backdrop-blur-md">
              <h4 className="text-xs font-black uppercase tracking-wider text-purple-400 flex items-center gap-1.5 font-['Orbitron',monospace]">
                <Layers className="w-4 h-4 text-purple-400" />
                Reinvestment & Compounding Power
              </h4>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="p-3 bg-purple-950/30 border border-purple-500/30 rounded-2xl space-y-1">
                  <span className="font-bold text-purple-300 block">220% Max ROI Capping Expansion:</span>
                  <p className="text-[11px] text-slate-400">
                    Reinvesting $100 immediately expands your maximum ROI cap by <strong>+$220.00</strong> (220%).
                  </p>
                </div>

                <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl space-y-1">
                  <span className="font-bold text-emerald-300 block">Daily Package Tier Upgrade:</span>
                  <p className="text-[11px] text-slate-400">
                    Your daily 4.5% - 7.5% package ROI will automatically scale up as your active principal balance advances across packages.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          TAB 5: TRANSACTION & WITHDRAWAL HISTORY LEDGER
          ===================================================================== */}
      {activeTab === "history" && (
        <div className="neon-glow-card border border-sky-400/40 rounded-3xl overflow-hidden shadow-[0_0_30px_rgba(14,165,233,0.22)] backdrop-blur-xl p-4 sm:p-6">
          <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="gold-badge-icon w-10 h-10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-slate-950 font-black" />
              </div>
              <div>
                <h3 className="font-black gold-metallic-text text-sm sm:text-base uppercase tracking-wider">
                  Withdrawal & Smart Distribution Ledger
                </h3>
                <p className="text-xs text-slate-300 font-semibold uppercase">Verified on-chain records of all withdrawal requests & activations</p>
              </div>
            </div>
            <span className="px-3.5 py-1.5 bg-sky-500/15 text-sky-300 border border-sky-500/30 rounded-xl text-xs font-bold font-mono">
              Total Records: {historyList.length}
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-sky-500/30 shadow-inner bg-[#040914]/90">
            <table className="w-full text-left text-xs md:text-sm border-collapse">
              <thead>
                <tr className="text-nowrap divide-x divide-white/10">
                  <th className="py-3.5 px-4 text-xs font-black tracking-wider uppercase split-header-blue">#</th>
                  <th className="py-3.5 px-4 text-xs font-black tracking-wider uppercase split-header-blue">Transaction Type</th>
                  <th className="py-3.5 px-4 text-xs font-black tracking-wider uppercase split-header-blue">Amount</th>
                  <th className="py-3.5 px-4 text-xs font-black tracking-wider uppercase split-header-blue">Destination / Details</th>
                  <th className="py-3.5 px-4 text-xs font-black tracking-wider uppercase split-header-gold">Status</th>
                  <th className="py-3.5 px-4 text-xs font-black tracking-wider uppercase split-header-gold">Date</th>
                  <th className="py-3.5 px-4 text-xs font-black tracking-wider uppercase split-header-gold text-right">TxHash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-500/15 text-xs sm:text-sm">
                {historyList.length > 0 ? (
                  historyList.map((item, idx) => {
                    const status = item.status || "Pending";
                    const isSuccess =
                      status.toLowerCase() === "completed" ||
                      status.toLowerCase() === "approved" ||
                      status.toLowerCase() === "success";
                    const isPending = status.toLowerCase() === "pending";

                    return (
                      <tr key={item._id || item.id || idx} className="hover:bg-sky-950/30 transition-colors border-b border-sky-500/10 text-nowrap">
                        <td className="py-3.5 px-4 text-slate-400 font-mono">{idx + 1}</td>
                        <td className="py-3.5 px-4">
                          <span className="font-bold text-white">
                            {item.type === "PrincipalWithdrawal"
                              ? "Principal Capital Withdrawal"
                              : item.type === "Withdrawal"
                                ? "Income Withdrawal (5% Fee)"
                                : item.type || "Transaction"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold font-mono text-amber-300">
                          ${Number(item.amount || item.investment || item.requestedAmount || 0).toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-xs text-slate-300">
                          {item.walletAddress || item.clientAddress || item.recipient ? (
                            <span title={item.walletAddress || item.clientAddress || item.recipient}>
                              {maskWalletAddress(item.walletAddress || item.clientAddress || item.recipient)}
                            </span>
                          ) : (
                            item.targetUser || item.targetUsername || "Self / ID"
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${isSuccess
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : isPending
                                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                  : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                              }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${isSuccess
                                  ? "bg-emerald-400"
                                  : isPending
                                    ? "bg-amber-400"
                                    : "bg-rose-400"
                                }`}
                            />
                            {status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 text-xs font-mono">
                          {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "—"}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-xs text-sky-400">
                          {item.hash || item.txHash || item.transactionHash ? (
                            <span className="truncate max-w-[100px] inline-block">
                              {maskWalletAddress(item.hash || item.txHash || item.transactionHash)}
                            </span>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 text-sm">
                      No withdrawal or activation history found.
                    </td>
                  </tr>
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
