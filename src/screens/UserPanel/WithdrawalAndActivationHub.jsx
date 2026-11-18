// src/screens/UserPanel/WithdrawalAndActivationHub.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import {
  Wallet,
  ArrowUpRight,
  Users,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  Zap,
  DollarSign,
  UserCheck,
  Sparkles,
  Layers,
  ArrowRight,
} from "lucide-react";
import { UserService } from "../../api/services.api";
import { setLoading } from "../../redux/slices/loadingSlice";

const WithdrawalAndActivationHub = () => {
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState("withdraw"); // "withdraw" | "activate"
  const [loading, setLoadingState] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Balances & Eligibility
  const [eligibilityData, setEligibilityData] = useState(null);
  const [withdrawalHistory, setWithdrawalHistory] = useState([]);

  // Withdrawal Form
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [walletAddress, setWalletAddress] = useState("");

  // Team Activation Form
  const [targetUsername, setTargetUsername] = useState("");
  const [activationAmount, setActivationAmount] = useState("");
  const [activationWalletType, setActivationWalletType] = useState("INCOME"); // "INCOME" | "P2P"

  // Fetch Eligibility & History
  const loadData = useCallback(async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else dispatch(setLoading(true));

      const [eligibilityRes, historyRes] = await Promise.allSettled([
        UserService.getWithdrawalEligibility(),
        UserService.getWithdrawalHistory(),
      ]);

      if (eligibilityRes.status === "fulfilled") {
        const d = eligibilityRes.value?.data || eligibilityRes.value;
        setEligibilityData(d);
        if (d?.walletBalances?.registeredWalletAddress && !walletAddress) {
          setWalletAddress(d.walletBalances.registeredWalletAddress);
        }
      }

      if (historyRes.status === "fulfilled") {
        const d = historyRes.value?.data || historyRes.value || {};
        setWithdrawalHistory(Array.isArray(d?.history) ? d.history : Array.isArray(d) ? d : []);
      }

      if (isManual) toast.success("Balances & limits updated!");
    } catch (err) {
      toast.error("Failed to load withdrawal data");
    } finally {
      if (isManual) setRefreshing(false);
      else dispatch(setLoading(false));
    }
  }, [dispatch, walletAddress]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Real-time 50/50 Calculation
  const numericWithdrawAmount = Number(withdrawAmount) || 0;
  const adminFee = numericWithdrawAmount * 0.10; // 10% Fee
  const netTotal = numericWithdrawAmount - adminFee; // 90% Net
  const exchangeCryptoAmount = netTotal * 0.50; // 50% Exchange Transfer
  const p2pWalletAmount = netTotal * 0.50; // 50% P2P Instant Credit

  // Submit Withdrawal Handler
  const handleWithdrawalSubmit = async (e) => {
    e.preventDefault();
    if (!numericWithdrawAmount || numericWithdrawAmount < (eligibilityData?.withdrawalRules?.minimumAmount || 10)) {
      toast.warning(`Minimum withdrawal amount is $${eligibilityData?.withdrawalRules?.minimumAmount || 10}`);
      return;
    }
    if (!walletAddress) {
      toast.warning("Please provide a valid destination wallet address");
      return;
    }
    if (numericWithdrawAmount > (eligibilityData?.walletBalances?.currentIncomeWallet || 0)) {
      toast.error("Withdrawal amount exceeds current income balance");
      return;
    }

    try {
      setLoadingState(true);
      const res = await UserService.requestWithdrawal({
        amount: numericWithdrawAmount,
        walletAddress: walletAddress.trim(),
      });

      if (res?.success || res?.message?.toLowerCase().includes("success")) {
        toast.success(res?.message || "Withdrawal submitted successfully! 50% credited to P2P Wallet.");
        setWithdrawAmount("");
        loadData(true);
      } else {
        toast.error(res?.message || "Failed to process withdrawal request");
      }
    } catch (err) {
      toast.error(err.message || "Withdrawal request failed");
    } finally {
      setLoadingState(false);
    }
  };

  // Submit Team Activation Handler (0% Fee)
  const handleTeamActivationSubmit = async (e) => {
    e.preventDefault();
    const numAmount = Number(activationAmount);
    if (!targetUsername.trim()) {
      toast.warning("Please enter team member's username");
      return;
    }
    if (!numAmount || numAmount < 10) {
      toast.warning("Minimum activation amount is $10 ($50 for full package activation)");
      return;
    }

    const availableBal =
      activationWalletType === "INCOME"
        ? eligibilityData?.walletBalances?.currentIncomeWallet || 0
        : eligibilityData?.walletBalances?.p2pWallet || 0;

    if (numAmount > availableBal) {
      toast.error(`Insufficient balance in ${activationWalletType} wallet`);
      return;
    }

    try {
      setLoadingState(true);
      const res = await UserService.activateTeamMember({
        targetUsername: targetUsername.trim(),
        amount: numAmount,
        walletType: activationWalletType,
      });

      if (res?.success || res?.message?.toLowerCase().includes("success")) {
        toast.success(res?.message || `Successfully activated ${targetUsername} with $${numAmount}! (0% Fee)`);
        setTargetUsername("");
        setActivationAmount("");
        loadData(true);
      } else {
        toast.error(res?.message || "Activation failed");
      }
    } catch (err) {
      toast.error(err.message || "Team activation error");
    } finally {
      setLoadingState(false);
    }
  };

  const incomeBal = eligibilityData?.walletBalances?.currentIncomeWallet || 0;
  const p2pBal = eligibilityData?.walletBalances?.p2pWallet || 0;
  const canWithdraw = eligibilityData?.frequencyLimit?.canWithdraw !== false;

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* 🚀 Top Summary Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 rounded-3xl shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-white">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">Financial Hub</span>
          <h1 className="text-2xl md:text-3xl font-black mt-1">Withdrawals & Team Member Activation</h1>
          <p className="text-slate-400 text-sm mt-1">
            50/50 Smart Split (50% Crypto Payout + 50% Instant P2P Credit) & 0% Team Activation Fee.
          </p>
        </div>

        <button
          onClick={() => loadData(true)}
          disabled={refreshing}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-semibold flex items-center gap-2 transition"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh Balances
        </button>
      </div>

      {/* 💳 Live Wallet Balances */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 uppercase font-semibold">Income Wallet</span>
            <h3 className="text-2xl font-black text-emerald-400 mt-1">${Number(incomeBal).toFixed(2)}</h3>
            <span className="text-[11px] text-slate-500">Available for withdrawal/activation</span>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
            <Wallet className="w-6 h-6 text-emerald-400" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 uppercase font-semibold">P2P Wallet</span>
            <h3 className="text-2xl font-black text-indigo-400 mt-1">${Number(p2pBal).toFixed(2)}</h3>
            <span className="text-[11px] text-indigo-300">0% Team Activation & P2P Trade</span>
          </div>
          <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
            <Layers className="w-6 h-6 text-indigo-400" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 uppercase font-semibold">24h Frequency Limit</span>
            <h3 className={`text-xl font-bold mt-1 ${canWithdraw ? "text-emerald-400" : "text-amber-400"}`}>
              {canWithdraw ? "Eligible" : "Cooldown Active"}
            </h3>
            <span className="text-[11px] text-slate-500">1 Withdrawal per 24 Hours</span>
          </div>
          <div className={`p-3 rounded-2xl border ${canWithdraw ? "bg-emerald-500/10 border-emerald-500/20" : "bg-amber-500/10 border-amber-500/20"}`}>
            <Clock className={`w-6 h-6 ${canWithdraw ? "text-emerald-400" : "text-amber-400"}`} />
          </div>
        </div>
      </div>

      {/* 🧭 Main Selection Tabs */}
      <div className="flex gap-3 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab("withdraw")}
          className={`flex items-center gap-2 py-3 px-6 rounded-2xl text-sm font-bold transition ${
            activeTab === "withdraw"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
              : "bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800/60"
          }`}
        >
          <ArrowUpRight className="w-4 h-4" />
          Request Withdrawal (50/50 Split)
        </button>

        <button
          onClick={() => setActiveTab("activate")}
          className={`flex items-center gap-2 py-3 px-6 rounded-2xl text-sm font-bold transition ${
            activeTab === "activate"
              ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
              : "bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800/60"
          }`}
        >
          <UserCheck className="w-4 h-4" />
          Activate Team Member (0% Fee)
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 1: WITHDRAWAL REQUEST (50/50 SPLIT)
      ───────────────────────────────────────────────────────────── */}
      {activeTab === "withdraw" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Withdrawal Form */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-5 h-fit shadow-xl">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-white text-lg">Submit Withdrawal</h3>
              <span className="text-xs bg-indigo-500/10 text-indigo-300 px-2.5 py-1 rounded-full font-bold border border-indigo-500/20">
                10% Admin Fee
              </span>
            </div>

            <form onSubmit={handleWithdrawalSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Gross Withdrawal Amount ($)
                </label>
                <input
                  type="number"
                  min="10"
                  step="any"
                  placeholder="e.g. 100"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-base font-bold outline-none focus:border-indigo-500"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">Min Withdrawal: $10.00</span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Destination Crypto Wallet Address (USDT TRC20 / BEP20)
                </label>
                <input
                  type="text"
                  placeholder="0x... or T..."
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-xs font-mono outline-none focus:border-indigo-500"
                />
              </div>

              {/* 📊 Live Breakdown Calculation Card */}
              {numericWithdrawAmount > 0 && (
                <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
                  <div className="text-slate-400 font-bold uppercase tracking-wider text-[10px] pb-1 border-b border-slate-800">
                    Live Payout Breakdown
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Gross Request:</span>
                    <span className="font-bold text-white">${numericWithdrawAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-rose-400">
                    <span>Admin Fee (10%):</span>
                    <span>-${adminFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-300 font-semibold pt-1 border-t border-slate-800">
                    <span>Net Distribution (90%):</span>
                    <span className="text-emerald-400 font-bold">${netTotal.toFixed(2)}</span>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-xl space-y-1.5 mt-2 border border-slate-800">
                    <div className="flex justify-between items-center text-blue-300">
                      <span className="flex items-center gap-1.5 font-semibold">
                        <ArrowRight className="w-3 h-3 text-blue-400" />
                        50% Exchange Crypto Payout:
                      </span>
                      <strong className="text-white">${exchangeCryptoAmount.toFixed(2)}</strong>
                    </div>
                    <span className="text-[10px] text-slate-400 block pl-4.5">
                      • Status: Pending Admin Manual Transfer to Exchange
                    </span>

                    <div className="flex justify-between items-center text-emerald-300 pt-1 border-t border-slate-800/60">
                      <span className="flex items-center gap-1.5 font-semibold">
                        <ArrowRight className="w-3 h-3 text-emerald-400" />
                        50% P2P Wallet Credit:
                      </span>
                      <strong className="text-emerald-400 font-bold">${p2pWalletAmount.toFixed(2)}</strong>
                    </div>
                    <span className="text-[10px] text-emerald-400/80 block pl-4.5">
                      • Status: Instant Automatic Credit to P2P Wallet
                    </span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !canWithdraw}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-bold text-sm transition shadow-lg shadow-indigo-600/25"
              >
                {loading ? "Processing..." : "Submit Withdrawal Request"}
              </button>
            </form>
          </div>

          {/* Withdrawal History Table */}
          <div className="lg:col-span-2">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
              <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/90">
                <h3 className="font-bold text-white text-base">Withdrawal Records</h3>
                <span className="text-xs text-slate-400">Total: {withdrawalHistory.length}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-800/60 text-slate-400 uppercase text-xs">
                      <th className="p-3.5">Tx ID</th>
                      <th className="p-3.5">Gross</th>
                      <th className="p-3.5">Fee (10%)</th>
                      <th className="p-3.5">50% Crypto</th>
                      <th className="p-3.5">50% P2P</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {withdrawalHistory.length > 0 ? (
                      withdrawalHistory.map((item, idx) => (
                        <tr key={item._id || idx} className="border-b border-slate-800 hover:bg-slate-800/30 text-xs sm:text-sm">
                          <td className="p-3.5 font-mono text-indigo-400 font-medium">
                            {item.id || item.customId || `WITH-${idx + 1}`}
                          </td>
                          <td className="p-3.5 font-bold text-white">${Number(item.investment || item.amount || 0).toFixed(2)}</td>
                          <td className="p-3.5 text-rose-400">-${Number(item.gasFee || item.adminFee || 0).toFixed(2)}</td>
                          <td className="p-3.5 text-blue-300 font-semibold">
                            ${Number(item.exchangeAmount || (Number(item.investment || item.amount || 0) * 0.45)).toFixed(2)}
                          </td>
                          <td className="p-3.5 text-emerald-400 font-bold">
                            ${Number(item.p2pAmount || (Number(item.investment || item.amount || 0) * 0.45)).toFixed(2)}
                          </td>
                          <td className="p-3.5">
                            <span
                              className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                                item.status === "Completed" || item.status === "Approved"
                                  ? "bg-emerald-500/20 text-emerald-400"
                                  : item.status === "Pending"
                                  ? "bg-amber-500/20 text-amber-400"
                                  : "bg-rose-500/20 text-rose-400"
                              }`}
                            >
                              {item.status || "Pending"}
                            </span>
                          </td>
                          <td className="p-3.5 text-slate-400 text-xs">
                            {new Date(item.createdAt || Date.now()).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center py-12 text-slate-500 text-sm">
                          No withdrawal records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SECTION 2: ACTIVATE TEAM MEMBER ID (0% PLATFORM FEE)
      ───────────────────────────────────────────────────────────── */}
      {activeTab === "activate" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-5 h-fit shadow-xl">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-400" />
                Activate Downline ID
              </h3>
              <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full font-bold border border-emerald-500/20">
                0% Fee Guarantee
              </span>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-2xl text-emerald-300 text-xs flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>0% Platform Charge:</strong> 100% of the deduction will directly invest & activate your downline partner without any admin fee cut.
              </span>
            </div>

            <form onSubmit={handleTeamActivationSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Select Wallet Source
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setActivationWalletType("INCOME")}
                    className={`p-3 rounded-xl border text-xs font-bold text-left transition ${
                      activationWalletType === "INCOME"
                        ? "bg-slate-800 border-emerald-500 text-white shadow"
                        : "bg-slate-950 border-slate-800 text-slate-400"
                    }`}
                  >
                    <span className="block text-[10px] uppercase text-slate-400">Income Wallet</span>
                    <span className="text-emerald-400 font-extrabold text-sm">${Number(incomeBal).toFixed(2)}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActivationWalletType("P2P")}
                    className={`p-3 rounded-xl border text-xs font-bold text-left transition ${
                      activationWalletType === "P2P"
                        ? "bg-slate-800 border-indigo-500 text-white shadow"
                        : "bg-slate-950 border-slate-800 text-slate-400"
                    }`}
                  >
                    <span className="block text-[10px] uppercase text-slate-400">P2P Wallet</span>
                    <span className="text-indigo-400 font-extrabold text-sm">${Number(p2pBal).toFixed(2)}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Team Member Username
                </label>
                <input
                  type="text"
                  placeholder="e.g. downline_user1"
                  value={targetUsername}
                  onChange={(e) => setTargetUsername(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Activation Package Amount ($)
                </label>
                <input
                  type="number"
                  min="10"
                  step="any"
                  placeholder="Min $50.00 for Package Activation"
                  value={activationAmount}
                  onChange={(e) => setActivationAmount(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-base font-bold outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold text-sm transition shadow-lg shadow-emerald-600/25"
              >
                {loading ? "Activating ID..." : "Activate Team Member Now"}
              </button>
            </form>
          </div>

          {/* Activation Guidelines & Advantages */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
              <h3 className="font-bold text-white text-lg">Why Activate Downlines Directly?</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-4 h-4" /> 0% Platform Fee
                  </div>
                  <p className="text-slate-400">
                    Unlike external withdrawals that incur 10% admin fee, team member activations have <strong>$0 fee</strong>.
                  </p>
                </div>

                <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-400 font-bold">
                    <Zap className="w-4 h-4" /> Instant Activation
                  </div>
                  <p className="text-slate-400">
                    Downline account activates immediately and enters the 3-Matrix network without waiting for blockchain confirmations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WithdrawalAndActivationHub;
