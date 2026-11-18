import React, { useState, useEffect } from "react";
import { Wallet, ArrowUpRight, DollarSign, CreditCard, Shield, CheckCircle, AlertCircle, TrendingUp, Send, UserPlus, Search, X, Lock, Users } from 'lucide-react';
import { toast } from "react-toastify";
import { 
  getROIWalletBalance, 
  depositFromROIWallet, 
  depositForOtherUser, 
  transferROIWallet,
  getP2PBalanceApi,
  transferP2PApi,
  activateUserWithP2PApi,
  getUserProfileApi
} from "../../api/user.api";

const getMoneySymbol = () => "$";

const DepositCardPage = () => {
  const [activeTab, setActiveTab] = useState("p2pTransfer"); // p2pTransfer | p2pActivate | roiDeposit | roiTransfer
  const [amount, setAmount] = useState("");
  const [targetIdentifier, setTargetIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [p2pBalance, setP2pBalance] = useState(0);
  const [p2pHistory, setP2pHistory] = useState([]);
  const [walletBalance, setWalletBalance] = useState({
    roiWallet: 0,
    levelIncomeWallet: 0,
    totalDepositWallet: 0,
    currentIncome: 0
  });

  const fetchBalances = async () => {
    try {
      const [roiRes, p2pRes] = await Promise.all([
        getROIWalletBalance(),
        getP2PBalanceApi(),
      ]);

      if (roiRes?.success) {
        setWalletBalance(roiRes.data);
      }
      if (p2pRes?.success) {
        setP2pBalance(p2pRes?.data?.p2pBalance ?? 0);
        setP2pHistory(p2pRes?.data?.history || []);
      }
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
    }
  };

  useEffect(() => {
    fetchBalances();
  }, []);

  const numAmount = Number(amount) || 0;

  // Handler: Transfer P2P Balance
  const handleP2PTransfer = async (e) => {
    if (e) e.preventDefault();
    if (!targetIdentifier.trim()) { toast.error("Recipient User ID or Username is required"); return; }
    if (numAmount <= 0) { toast.error("Transfer Amount must be greater than 0"); return; }
    if (numAmount > p2pBalance) { toast.error(`Insufficient P2P Balance ($${p2pBalance.toFixed(2)} available)`); return; }

    setLoading(true);
    try {
      const res = await transferP2PApi({
        recipientIdentifier: targetIdentifier.trim(),
        amount: numAmount,
        password: password || undefined,
      });

      if (res?.success) {
        toast.success(res?.message || `Successfully transferred $${numAmount} to ${targetIdentifier}!`);
        setAmount("");
        setTargetIdentifier("");
        setPassword("");
        fetchBalances();
      } else {
        toast.error(res?.message || "P2P transfer failed");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Transfer error");
    } finally {
      setLoading(false);
    }
  };

  // Handler: Activate User using P2P Balance
  const handleP2PActivateUser = async (e) => {
    if (e) e.preventDefault();
    if (!targetIdentifier.trim()) { toast.error("Target User ID or Username is required"); return; }
    if (numAmount < 10) { toast.error("Minimum activation amount is $10"); return; }
    if (numAmount > p2pBalance) { toast.error(`Insufficient P2P Balance ($${p2pBalance.toFixed(2)} available)`); return; }

    setLoading(true);
    try {
      const res = await activateUserWithP2PApi({
        targetIdentifier: targetIdentifier.trim(),
        amount: numAmount,
      });

      if (res?.success) {
        toast.success(res?.message || `User ${targetIdentifier} activated with $${numAmount}!`);
        setAmount("");
        setTargetIdentifier("");
        fetchBalances();
      } else {
        toast.error(res?.message || "Activation failed");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Activation error");
    } finally {
      setLoading(false);
    }
  };

  // Handler: Deposit for Own ID from Deposit Wallet
  const handleDepositForOwn = async () => {
    if (numAmount < 5) { toast.error("Minimum deposit amount is $5"); return; }
    if (numAmount > walletBalance.totalDepositWallet) {
      toast.error(`Insufficient deposit wallet balance ($${walletBalance.totalDepositWallet.toFixed(2)} available)`);
      return;
    }

    setLoading(true);
    try {
      const res = await depositFromROIWallet({ amount: numAmount });
      if (res?.success) {
        toast.success(res?.message || "Deposit successful!");
        setAmount("");
        fetchBalances();
      } else {
        toast.error(res?.message || "Deposit failed");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Error processing deposit");
    } finally {
      setLoading(false);
    }
  };

  const quickAmounts = [10, 25, 50, 100, 250, 500];

  return (
    <div className="max-w-4xl mx-auto space-y-6 mt-4">
      {/* Wallet Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="neon-glow-card p-5 border border-sky-400/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sky-300 text-xs font-black uppercase tracking-wider">P2P Wallet Balance</span>
            <div className="w-8 h-8 rounded-xl bg-sky-500/20 flex items-center justify-center text-sky-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-black text-amber-300 font-mono drop-shadow-[0_0_10px_rgba(251,191,36,0.3)]">{getMoneySymbol()}{Number(p2pBalance).toFixed(2)}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">50% withdrawal split & peer transfers</span>
        </div>

        <div className="neon-glow-card p-5 border border-amber-400/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-amber-300 text-xs font-black uppercase tracking-wider">ROI & Profit Wallet</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-black text-amber-300 font-mono drop-shadow-[0_0_10px_rgba(251,191,36,0.3)]">{getMoneySymbol()}{Number(walletBalance.roiWallet).toFixed(2)}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Available trading profit balance</span>
        </div>

        <div className="neon-glow-card p-5 border border-emerald-400/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-emerald-300 text-xs font-black uppercase tracking-wider">Total Deposit Wallet</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-black text-amber-300 font-mono drop-shadow-[0_0_10px_rgba(251,191,36,0.3)]">{getMoneySymbol()}{Number(walletBalance.totalDepositWallet).toFixed(2)}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Deposited funds for ID activation</span>
        </div>
      </div>

      {/* Main Operations Card */}
      <div className="neon-glow-card p-6 md:p-8">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-sky-500/20 pb-4 mb-6">
          {[
            { id: "p2pTransfer", label: "P2P Balance Transfer", icon: Send },
            { id: "p2pActivate", label: "Activate User via P2P", icon: UserPlus },
            { id: "roiDeposit", label: "Deposit for Own ID", icon: ArrowUpRight },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setAmount("");
                  setTargetIdentifier("");
                  setPassword("");
                }}
                className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                    : "bg-[#060e1e] text-slate-300 hover:text-white hover:bg-sky-950/40 border border-sky-500/30"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab 1: P2P Transfer */}
        {activeTab === "p2pTransfer" && (
          <form onSubmit={handleP2PTransfer} className="space-y-5">
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-400" />
                Recipient Username / User ID
              </label>
              <input
                type="text"
                value={targetIdentifier}
                onChange={(e) => setTargetIdentifier(e.target.value.trimStart())}
                placeholder="Enter recipient's username or ID (e.g. Powex123456)"
                className="w-full bg-[#060e1e] border border-sky-500/30 rounded-xl py-3.5 px-4 text-white text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                required
              />
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-amber-400" />
                Transfer Amount ($)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                min="1"
                className="w-full bg-[#060e1e] border border-sky-500/30 rounded-xl py-3.5 px-4 text-white text-lg font-mono font-bold focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                required
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Available P2P balance: <strong className="text-amber-300">${Number(p2pBalance).toFixed(2)}</strong>
              </span>
            </div>

            {/* Quick Amounts */}
            <div className="flex flex-wrap gap-2">
              {quickAmounts.map((q) => (
                <button
                  type="button"
                  key={q}
                  onClick={() => setAmount(String(q))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider border transition cursor-pointer ${
                    Number(amount) === q
                      ? "bg-amber-400 text-slate-950 border-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.3)]"
                      : "bg-[#060e1e] text-slate-300 border-sky-500/30 hover:bg-sky-950/40"
                  }`}
                >
                  ${q}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading || numAmount <= 0 || numAmount > p2pBalance || !targetIdentifier.trim()}
              className={`w-full py-4 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg ${
                loading || numAmount <= 0 || numAmount > p2pBalance || !targetIdentifier.trim()
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                  : "bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 hover:from-amber-400 hover:to-yellow-300 shadow-[0_0_20px_rgba(245,158,11,0.4)] cursor-pointer"
              }`}
            >
              <Send className="w-4 h-4" />
              {loading ? "Sending..." : `Send $${numAmount.toFixed(2)} to ${targetIdentifier || "User"}`}
            </button>
          </form>
        )}

        {/* Tab 2: Activate User via P2P */}
        {activeTab === "p2pActivate" && (
          <form onSubmit={handleP2PActivateUser} className="space-y-5">
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-sky-400" />
                Target User to Activate (Username / User ID)
              </label>
              <input
                type="text"
                value={targetIdentifier}
                onChange={(e) => setTargetIdentifier(e.target.value.trimStart())}
                placeholder="Enter username or ID to activate"
                className="w-full bg-[#060e1e] border border-sky-500/30 rounded-xl py-3.5 px-4 text-white text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                required
              />
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-amber-400" />
                Activation Amount ($)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Minimum $10"
                min="10"
                className="w-full bg-[#060e1e] border border-sky-500/30 rounded-xl py-3.5 px-4 text-white text-lg font-mono font-bold focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                required
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Minimum: $10 (Activates 1.0% Daily ROI & 3X / 5X Capping) | Available: <strong className="text-amber-300">${Number(p2pBalance).toFixed(2)}</strong>
              </span>
            </div>

            <button
              type="submit"
              disabled={loading || numAmount < 10 || numAmount > p2pBalance || !targetIdentifier.trim()}
              className={`w-full py-4 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg ${
                loading || numAmount < 10 || numAmount > p2pBalance || !targetIdentifier.trim()
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                  : "bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 hover:from-amber-400 hover:to-yellow-300 shadow-[0_0_20px_rgba(245,158,11,0.4)] cursor-pointer"
              }`}
            >
              <UserPlus className="w-4 h-4" />
              {loading ? "Activating..." : `Activate User with $${numAmount.toFixed(2)}`}
            </button>
          </form>
        )}

        {/* Tab 3: Deposit for Own ID */}
        {activeTab === "roiDeposit" && (
          <div className="space-y-5">
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-amber-400" />
                Deposit Amount ($)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Minimum $5"
                min="5"
                className="w-full bg-[#060e1e] border border-sky-500/30 rounded-xl py-3.5 px-4 text-white text-lg font-mono font-bold focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Available in Deposit Wallet: <strong className="text-amber-300">${Number(walletBalance.totalDepositWallet).toFixed(2)}</strong>
              </span>
            </div>

            <button
              onClick={handleDepositForOwn}
              disabled={loading || numAmount < 5 || numAmount > walletBalance.totalDepositWallet}
              className={`w-full py-4 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg ${
                loading || numAmount < 5 || numAmount > walletBalance.totalDepositWallet
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                  : "bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 hover:from-amber-400 hover:to-yellow-300 shadow-[0_0_20px_rgba(245,158,11,0.4)] cursor-pointer"
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              {loading ? "Depositing..." : `Deposit $${numAmount.toFixed(2)}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DepositCardPage;
