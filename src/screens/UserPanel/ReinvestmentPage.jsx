import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setLoading } from "../../redux/slices/loadingSlice";
import {
  getAvailableIncomeBalance,
  reinvestFromIncome,
  getReinvestmentHistory,
  reinvestSelfApi,
  getWalletBalancesApi,
} from "../../api/user.api";
import { NumberFormatCommas } from "../../utils/FormatText";
import { toast } from "react-toastify";
import moment from "moment";
import Pagination from "../../components/Screen/UserPanel/Pagination";
import {
  Wallet,
  RefreshCw,
  Zap,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  DollarSign,
  Crown,
} from "lucide-react";

// Stats Card Component
const StatCard = ({ icon, label, value, color, subLabel, highlight = false }) => (
  <div
    className={`rounded-2xl p-4 transition-all shadow-xl backdrop-blur-md border ${
      highlight
        ? "bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-950 border-emerald-500/40 shadow-emerald-500/10"
        : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
    }`}
  >
    <div className="flex items-center gap-3.5">
      <div className={`w-11 h-11 flex items-center justify-center rounded-2xl ${color} shadow-inner`}>
        <i className={`fa-solid ${icon} text-xl`}></i>
      </div>
      <div>
        <p className="text-slate-400 text-[10.5px] font-semibold uppercase tracking-wider">{label}</p>
        <p className="text-white font-black text-lg mt-0.5">{value}</p>
        {subLabel && <p className="text-slate-400 text-[10px] mt-0.5">{subLabel}</p>}
      </div>
    </div>
  </div>
);

// Quick Amount Button
const QuickAmountBtn = ({ amount, onClick, isSelected }) => (
  <button
    type="button"
    onClick={() => onClick(amount)}
    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
      isSelected
        ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/25 scale-105"
        : "bg-slate-800/80 text-slate-300 hover:bg-slate-700 border border-slate-700/60"
    }`}
  >
    ${amount}
  </button>
);

const ReinvestmentPage = () => {
  const dispatch = useDispatch();
  const userInfo = useSelector((state) => state?.isLoggedUser?.data);

  const [balanceData, setBalanceData] = useState(null);
  const [walletBalances, setWalletBalances] = useState({
    currentIncomeWallet: 0,
    p2pWallet: 0,
    totalInvestment: 0,
    activeInvestment: 0,
  });
  const [walletType, setWalletType] = useState("P2P"); // "P2P" | "INCOME"
  const [historyData, setHistoryData] = useState([]);
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil((historyData?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const visibleHistory = (historyData || []).slice(startIndex, startIndex + itemsPerPage);

  const fetchData = async (isManual = false) => {
    try {
      if (!isManual) dispatch(setLoading(true));

      const [balanceRes, walletRes, historyRes] = await Promise.allSettled([
        getAvailableIncomeBalance(),
        getWalletBalancesApi(),
        getReinvestmentHistory(),
      ]);

      if (balanceRes.status === "fulfilled" && balanceRes.value?.success) {
        setBalanceData(balanceRes.value.data);
      }

      if (walletRes.status === "fulfilled" && walletRes.value?.success) {
        const d = walletRes.value.data || walletRes.value;
        setWalletBalances({
          currentIncomeWallet: Number(d.currentIncomeWallet ?? d.totalIncome ?? 0),
          p2pWallet: Number(d.p2pWallet ?? 0),
          totalInvestment: Number(d.totalInvestment ?? 0),
          activeInvestment: Number(d.activeInvestment ?? 0),
        });
      }

      if (historyRes.status === "fulfilled" && historyRes.value?.success) {
        const list = Array.isArray(historyRes.value?.data?.history)
          ? historyRes.value.data.history
          : Array.isArray(historyRes.value?.data)
          ? historyRes.value.data
          : Array.isArray(historyRes.value?.data?.recentReinvestments)
          ? historyRes.value.data.recentReinvestments
          : [];
        setHistoryData(list);
      }

      if (isManual) {
        toast.success("Wallet balances refreshed successfully!");
      }
    } catch (error) {
      console.error("Error fetching reinvestment data:", error);
      toast.error("Failed to load wallet balance");
    } finally {
      if (!isManual) dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const availableIncome = Number(
    walletBalances.currentIncomeWallet ||
      balanceData?.totalIncome ||
      balanceData?.availableBalance ||
      0
  );
  const p2pBalance = Number(walletBalances.p2pWallet || 0);
  const selectedWalletBalance = walletType === "P2P" ? p2pBalance : availableIncome;
  const currentInvestment = Number(
    walletBalances.activeInvestment ||
      balanceData?.currentInvestment ||
      userInfo?.investment ||
      0
  );
  const totalReinvested = Number(balanceData?.totalReinvested ?? 0);

  const handleReinvest = async () => {
    const reinvestAmount = parseFloat(amount);

    if (!reinvestAmount || reinvestAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (reinvestAmount < 10) {
      toast.error("Minimum reinvestment amount is $10");
      return;
    }

    if (reinvestAmount > selectedWalletBalance) {
      toast.error(
        `Insufficient balance in ${walletType} Wallet ($${selectedWalletBalance.toFixed(2)} available)`
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await reinvestSelfApi({
        amount: reinvestAmount,
        walletType: walletType,
      });

      if (response?.success || response?.message?.toLowerCase().includes("success")) {
        toast.success(
          response.message ||
            `Successfully reinvested $${reinvestAmount.toFixed(2)} from ${walletType} Wallet! (0% Fee Applied)`
        );
        setAmount("");
        fetchData();
      } else {
        toast.error(response?.message || "Reinvestment failed");
      }
    } catch (error) {
      console.error("Reinvestment error:", error);
      toast.error(error?.response?.data?.message || "Failed to process reinvestment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMaxClick = () => {
    setAmount(selectedWalletBalance > 0 ? selectedWalletBalance.toFixed(2) : "0");
  };

  const quickAmounts = [10, 50, 100, 250, 500, 1000];
  const numAmount = parseFloat(amount || 0);

  return (
    <div className="space-y-6 mt-4">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border border-emerald-500/20 p-6 md:p-8 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold mb-2">
              <Zap size={13} className="text-emerald-400" />
              Direct In-Wallet Reinvestment & Capping Extension (0% Fee)
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Reinvest from P2P / Income Wallet
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
              Compound your profits by reinvesting directly from your P2P or Income Wallet with <span className="text-emerald-400 font-bold">0% Platform Fee</span>.
              Instantly expands your <span className="text-cyan-400 font-bold">3X Non-Working</span> and <span className="text-purple-400 font-bold">5X Working Capping</span> limits.
            </p>
          </div>

          <button
            onClick={() => fetchData(true)}
            className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon="fa-wallet"
          label="P2P Wallet Balance"
          value={`$${p2pBalance.toFixed(2)}`}
          color="bg-purple-500/20 text-purple-400"
          subLabel="50% split / 0% fee reinvestment"
          highlight={walletType === "P2P"}
        />
        <StatCard
          icon="fa-sack-dollar"
          label="Income Wallet Balance"
          value={`$${availableIncome.toFixed(2)}`}
          color="bg-emerald-500/20 text-emerald-400"
          subLabel="Total withdrawable & reinvestable"
          highlight={walletType === "INCOME"}
        />
        <StatCard
          icon="fa-shield"
          label="Current Active Investment"
          value={`$${currentInvestment.toFixed(2)}`}
          color="bg-cyan-500/20 text-cyan-400"
          subLabel="Active package generating ROI"
        />
        <StatCard
          icon="fa-arrows-rotate"
          label="3X & 5X Capping Capacity"
          value={`$${(currentInvestment * 3).toFixed(0)} / $${(currentInvestment * 5).toFixed(0)}`}
          color="bg-blue-500/20 text-blue-400"
          subLabel="3X ROI Cap / 5X Working Cap"
        />
      </div>

      {/* Reinvestment Form Card */}
      <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl">
        <h3 className="text-xl font-black text-white mb-4 flex items-center gap-2">
          <Zap className="text-emerald-400 w-5 h-5" />
          Reinvest into Package (0% Fee - Extend 3X & 5X Capping)
        </h3>

        {/* Source Deduction Wallet Selector */}
        <div className="mb-6 space-y-2">
          <label className="text-xs font-bold text-slate-300">Select Source Wallet (0% Fee Applied)</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setWalletType("P2P");
                setAmount("");
              }}
              className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                walletType === "P2P"
                  ? "bg-purple-950/60 border-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.25)]"
                  : "bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase font-bold text-purple-400">P2P Wallet (0% Fee)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">0% Fee</span>
              </div>
              <span className="text-lg font-black font-mono mt-1 block text-white">
                ${p2pBalance.toFixed(2)}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setWalletType("INCOME");
                setAmount("");
              }}
              className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                walletType === "INCOME"
                  ? "bg-emerald-950/60 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.25)]"
                  : "bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase font-bold text-emerald-400">Income Wallet (0% Fee)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">0% Fee</span>
              </div>
              <span className="text-lg font-black font-mono mt-1 block text-white">
                ${availableIncome.toFixed(2)}
              </span>
            </button>
          </div>
        </div>

        {/* Quick Amount Presets */}
        <div className="mb-6">
          <label className="text-xs text-slate-400 mb-2 block font-semibold">Quick Select Amount</label>
          <div className="flex flex-wrap gap-2">
            {quickAmounts.map((amt) => (
              <QuickAmountBtn
                key={amt}
                amount={amt}
                onClick={(a) => setAmount(a.toString())}
                isSelected={parseFloat(amount) === amt}
              />
            ))}
          </div>
        </div>

        {/* Amount Input */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-bold text-slate-300">Reinvestment Amount ($)</label>
            <button
              type="button"
              onClick={handleMaxClick}
              className="text-xs font-black text-emerald-400 hover:underline cursor-pointer"
            >
              Use Max in {walletType} (${selectedWalletBalance.toFixed(2)})
            </button>
          </div>

          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl font-bold">$</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              min="10"
              className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-400 rounded-2xl py-4 pl-10 pr-4 text-white text-xl font-black outline-none transition shadow-inner"
            />
          </div>
          <p className="text-slate-400 text-xs mt-2">
            Minimum: $10 | Available in {walletType} Wallet: <strong className="text-emerald-400">${selectedWalletBalance.toFixed(2)}</strong> (0% Fee)
          </p>
        </div>

        {/* Capping Extension Preview */}
        {numAmount > 0 && (
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-slate-900 border border-emerald-500/30 mb-6 space-y-2.5 text-sm">
            <h4 className="text-emerald-400 font-bold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              Capping Extension Preview (0% Fee)
            </h4>
            <div className="flex justify-between text-slate-300">
              <span>New Active Investment:</span>
              <span className="font-bold text-white">${(currentInvestment + numAmount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Extended 3X Non-Working ROI Cap:</span>
              <span className="font-bold text-cyan-400">${((currentInvestment + numAmount) * 3).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Extended 5X Working Cap:</span>
              <span className="font-bold text-purple-400">${((currentInvestment + numAmount) * 5).toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleReinvest}
          disabled={isSubmitting || numAmount < 10 || numAmount > selectedWalletBalance}
          className={`w-full py-4 rounded-2xl font-black text-base uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xl ${
            isSubmitting || numAmount < 10 || numAmount > selectedWalletBalance
              ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
              : "bg-gradient-to-r from-emerald-500 to-teal-500 text-black hover:from-emerald-400 hover:to-teal-400 shadow-emerald-500/25 active:scale-98 cursor-pointer"
          }`}
        >
          {isSubmitting ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Processing Reinvestment...
            </>
          ) : (
            <>
              <Zap className="w-5 h-5" />
              Confirm Reinvest ${numAmount > 0 ? numAmount.toFixed(2) : "0.00"} from {walletType} (0% Fee)
            </>
          )}
        </button>
      </div>

      {/* History Table */}
      <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-3xl overflow-hidden shadow-xl p-6">
        <h3 className="text-xl font-black text-white mb-4 flex items-center gap-2">
          <i className="fa-solid fa-clock-rotate-left text-cyan-400"></i>
          Reinvestment History
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-950/80 text-slate-400">
                <th className="text-left px-5 py-3.5 font-bold">#</th>
                <th className="text-left px-5 py-3.5 font-bold">Transaction ID</th>
                <th className="text-left px-5 py-3.5 font-bold">Reinvested Amount ($)</th>
                <th className="text-left px-5 py-3.5 font-bold">Status</th>
                <th className="text-left px-5 py-3.5 font-bold">Date & Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {visibleHistory.length > 0 ? (
                visibleHistory.map((tx, index) => (
                  <tr
                    key={tx._id || index}
                    className="hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-5 py-4 text-slate-400">{startIndex + index + 1}</td>
                    <td className="px-5 py-4 font-mono text-xs text-cyan-400 font-semibold">{tx.id || tx._id || "N/A"}</td>
                    <td className="px-5 py-4 font-bold text-white">
                      +${Number(tx.investment || tx.amount || 0).toFixed(2)}
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {tx.status || "Completed"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-400 text-xs">
                      {tx.createdAt ? moment(tx.createdAt).format("DD MMM YYYY, hh:mm A") : "-"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-5 py-10 text-center text-slate-500">
                    No reinvestment records found yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {historyData.length > itemsPerPage && (
          <div className="pt-4 border-t border-slate-800">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ReinvestmentPage;
