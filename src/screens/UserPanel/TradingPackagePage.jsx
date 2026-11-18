import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { ethers } from "ethers";
import {
  TrendingUp,
  ShieldCheck,
  Zap,
  Layers,
  ArrowRight,
  Sparkles,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  Percent,
  Wallet,
  History,
  Activity,
  Award,
} from "lucide-react";
import { setLoading } from "../../redux/slices/loadingSlice";
import {
  buyTradingPackageApi,
  getMyTradingPackagesApi,
  getMyTradingHistoryApi,
  getAvailableIncomeBalance,
} from "../../api/user.api";
import { getInjectedProvider } from "../../utils/additionalFunc";
import Pagination from "../../components/Screen/UserPanel/Pagination";

const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955";
const USDT_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)",
];

const PRESET_AMOUNTS = [50, 100, 250, 500, 1000, 2500, 5000];

const LEVEL_SLABS = [
  { level: "Level 1", percent: "20%", share: "Direct Team Trading Profit" },
  { level: "Level 2", percent: "10%", share: "2nd Generation Downline" },
  { level: "Level 3", percent: "6%", share: "3rd Generation Downline" },
  { level: "Level 4", percent: "4%", share: "4th Generation Downline" },
  { level: "Level 5", percent: "4%", share: "5th Generation Downline" },
  { level: "Level 6", percent: "4%", share: "6th Generation Downline" },
  { level: "Level 7", percent: "4%", share: "7th Generation Downline" },
  { level: "Level 8", percent: "4%", share: "8th Generation Downline" },
  { level: "Level 9", percent: "2%", share: "9th Generation Downline" },
  { level: "Level 10", percent: "2%", share: "10th Generation Downline" },
];

const TradingPackagePage = () => {
  const dispatch = useDispatch();
  const userInfo = useSelector((state) => state?.isLoggedUser?.data);

  const [packagesData, setPackagesData] = useState({
    packages: [],
    summary: {
      totalInvested: 0,
      activeInvested: 0,
      totalEarned: 0,
      maxCappingTotal: 0,
      remainingCapTotal: 0,
      cappingProgressPercent: 0,
    },
  });

  const [balances, setBalances] = useState({
    walletBalance: 0,
    fundWallet: 0,
    withdrawableBalance: 0,
  });

  const [amount, setAmount] = useState(50);
  const [paymentMode, setPaymentMode] = useState("WALLET"); // "WALLET" | "WEB3"
  const [isSubmitting, setIsSubmitting] = useState(false);

  // History state
  const [historyTab, setHistoryTab] = useState("ALL"); // "ALL" | "Trading ROI" | "ROI of ROI Level Income"
  const [historyList, setHistoryList] = useState([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [historyTotalRecords, setHistoryTotalRecords] = useState(0);

  const fetchData = async () => {
    try {
      dispatch(setLoading(true));
      const [pkgRes, balRes] = await Promise.all([
        getMyTradingPackagesApi(),
        getAvailableIncomeBalance(),
      ]);

      if (pkgRes?.success && pkgRes?.data) {
        setPackagesData(pkgRes.data);
      }

      if (balRes?.data) {
        const fw = Number(balRes.data.fundWallet || 0);
        const wb = Number(balRes.data.withdrawableBalance || balRes.data.availableIncomeBalance || 0);
        setBalances({
          fundWallet: fw,
          withdrawableBalance: wb,
          walletBalance: fw + wb,
        });
      }
    } catch (err) {
      console.error("fetchData error:", err);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const fetchHistory = async () => {
    try {
      const params = {
        page: historyPage,
        limit: 10,
      };
      if (historyTab !== "ALL") {
        params.type = historyTab;
      }
      const res = await getMyTradingHistoryApi(params);
      if (res?.success) {
        setHistoryList(res.data || []);
        setHistoryTotalPages(res.pagination?.totalPages || 1);
        setHistoryTotalRecords(res.pagination?.total || 0);
      }
    } catch (err) {
      console.error("fetchHistory error:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [historyPage, historyTab]);

  const numAmount = Number(amount) || 0;
  const weeklyProfitEst = (numAmount * 0.03).toFixed(2);
  const dailyProfitEst = (numAmount * 0.006).toFixed(2);
  const maxCappingEst = (numAmount * 2).toFixed(2);

  const handlePurchase = async () => {
    if (numAmount < 50) {
      toast.error("Minimum investment for Trading Package is $50");
      return;
    }

    if (paymentMode === "WALLET") {
      if (balances.walletBalance < numAmount) {
        toast.error(
          `Insufficient wallet balance ($${balances.walletBalance.toFixed(2)}). Required: $${numAmount}. Please select Web3 BSC or deposit funds.`
        );
        return;
      }

      const confirm = await Swal.fire({
        title: "Confirm Trading Package",
        text: `Invest $${numAmount} in Trading Package from your wallet? Weekly 3% profit with 2X ($${maxCappingEst}) capping.`,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#00D2FF",
        cancelButtonColor: "#64748B",
        confirmButtonText: "Yes, Activate Now",
      });

      if (!confirm.isConfirmed) return;

      try {
        setIsSubmitting(true);
        dispatch(setLoading(true));
        const res = await buyTradingPackageApi({ amount: numAmount });
        if (res?.success) {
          Swal.fire({
            icon: "success",
            title: "Package Activated!",
            text: res.message || `Successfully activated $${numAmount} Trading Package!`,
            confirmButtonColor: "#00D2FF",
          });
          setAmount(50);
          fetchData();
          fetchHistory();
        } else {
          toast.error(res?.message || "Activation failed");
        }
      } catch (err) {
        toast.error(err.message || "Something went wrong");
      } finally {
        setIsSubmitting(false);
        dispatch(setLoading(false));
      }
    } else {
      // WEB3 Payment on BSC
      try {
        setIsSubmitting(true);
        dispatch(setLoading(true));

        const walletType = sessionStorage.getItem("walletType") || "metamask";
        const injectedProvider = getInjectedProvider(walletType);

        if (!injectedProvider) {
          throw new Error("Web3 Wallet not detected. Please unlock or install MetaMask / TrustWallet.");
        }

        const accounts = await injectedProvider.request({ method: "eth_requestAccounts" });
        if (!accounts || !accounts.length) {
          throw new Error("No accounts found. Please unlock your wallet.");
        }

        try {
          await injectedProvider.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0x38" }],
          });
        } catch (switchError) {
          if (switchError.code === 4902) {
            await injectedProvider.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: "0x38",
                  chainName: "Binance Smart Chain",
                  nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
                  rpcUrls: ["https://bsc-dataseed1.binance.org/"],
                  blockExplorerUrls: ["https://bscscan.com/"],
                },
              ],
            });
          }
        }

        const browserProvider = new ethers.BrowserProvider(injectedProvider);
        const signer = await browserProvider.getSigner();
        const userAddress = await signer.getAddress();
        const recipientAddress = import.meta.env.VITE_WALLET_ADDRESS || "0x1ACC50Eba638E41cA9fBe74f9e71BD5934CD7f2a";

        const usdtContract = new ethers.Contract(USDT_ADDRESS, USDT_ABI, signer);
        const decimals = 18;
        const amountInUSDT = ethers.parseUnits(numAmount.toString(), decimals);

        toast.info("Please confirm USDT transfer in your Web3 wallet...");
        const tx = await usdtContract.transfer(recipientAddress, amountInUSDT);
        toast.info("Waiting for BSC blockchain confirmation...");
        await tx.wait();

        // Submit to API
        const res = await buyTradingPackageApi({
          amount: numAmount,
          txnHash: tx.hash,
          fromWalletAddress: userAddress,
        });

        if (res?.success) {
          Swal.fire({
            icon: "success",
            title: "On-Chain Package Activated!",
            text: `Transaction Confirmed: ${tx.hash.substring(0, 16)}... Weekly 3% profit active!`,
            confirmButtonColor: "#00D2FF",
          });
          fetchData();
          fetchHistory();
        } else {
          toast.error(res?.message || "Package activation failed after transfer");
        }
      } catch (err) {
        console.error("Web3 purchase error:", err);
        Swal.fire({
          icon: "error",
          title: "Payment Error",
          text: err.message || "Failed to process Web3 payment",
          confirmButtonColor: "#EF4444",
        });
      } finally {
        setIsSubmitting(false);
        dispatch(setLoading(false));
      }
    }
  };

  const { summary, packages } = packagesData;

  return (
    <div className="space-y-8 pt-4 pb-12 text-white">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>NODEXAI TRADING PROFIT SYSTEM</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-['Orbitron',monospace] tracking-wider">
            Trading Profit Package (3% Weekly)
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-3xl">
            Invest minimum <strong className="text-emerald-400">$50</strong> to earn <strong>3.0% Weekly</strong> (Mon–Fri daily 0.60%) with strict <strong>2X Capping (200%)</strong>. Earn up to <strong>60% across 10 levels</strong> on downline trading profits (ROI of ROI). Both ROI and Level ROI count towards your 2X capping.
          </p>
        </div>
      </div>

      {/* 2. KPI Cards & 2X Capping Progress */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0c1a30] to-[#040d1a] border border-cyan-500/20 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase">Active Trading Capital</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-['Orbitron',monospace] text-white mt-2">
            ${summary.activeInvested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Total Ever: ${summary.totalInvested.toFixed(2)}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0c1a30] to-[#040d1a] border border-emerald-500/20 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase">Total Earned</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-['Orbitron',monospace] text-emerald-400 mt-2">
            ${summary.totalEarned.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-emerald-400/80 mt-1">
            ROI + Level ROI Counted
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0c1a30] to-[#040d1a] border border-purple-500/20 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase">2X Max Capping</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-['Orbitron',monospace] text-purple-300 mt-2">
            ${summary.maxCappingTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            200% Total Package Return
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0c1a30] to-[#040d1a] border border-amber-500/20 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase">Remaining Cap Room</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-['Orbitron',monospace] text-amber-400 mt-2">
            ${summary.remainingCapTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-amber-300/80 mt-1 font-mono">
            {summary.cappingProgressPercent.toFixed(1)}% Reached
          </div>
        </div>
      </div>

      {/* 2X Capping Live Progress Bar Card */}
      {summary.activeInvested > 0 && (
        <div className="p-6 rounded-2xl bg-[#09152b] border border-cyan-500/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Percent className="w-5 h-5 text-cyan-400" />
              <span className="font-bold text-sm tracking-wide text-white">2X Capping Progress</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                {summary.cappingProgressPercent.toFixed(1)}% / 100%
              </span>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Earned ${summary.totalEarned.toFixed(2)} of ${summary.maxCappingTotal.toFixed(2)} Max Limit
            </span>
          </div>
          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-emerald-400 to-amber-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, summary.cappingProgressPercent)}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            When 2X capping is achieved (100%), the package matures. Reinvest to continue earning trading profits and downline commissions.
          </p>
        </div>
      )}

      {/* 3. Activation Section & ROI ki ROI Explanation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Purchase / Activation Form */}
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#0b172e] via-[#051124] to-[#020a17] border-2 border-emerald-500/30 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                ACTIVATE TRADING PACKAGE
              </span>
              <h2 className="text-xl sm:text-2xl font-black font-['Orbitron',monospace] text-white mt-2">
                Deposit Capital
              </h2>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block font-mono">Available Balance</span>
              <span className="text-sm font-bold text-emerald-400 font-mono">
                ${balances.walletBalance.toFixed(2)} USDT
              </span>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div>
            <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-2">
              Select or Enter Amount (Min $50)
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {PRESET_AMOUNTS.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setAmount(val)}
                  className={`py-2 px-1 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                    amount === val
                      ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/30 scale-105"
                      : "bg-[#09152b] text-slate-300 hover:bg-[#122344] border border-slate-700"
                  }`}
                >
                  ${val}
                </button>
              ))}
            </div>
          </div>

          {/* Amount Input */}
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold text-lg">
              $
            </span>
            <input
              type="number"
              min="50"
              step="10"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="Enter amount (min $50)"
              className="w-full pl-9 pr-24 py-3.5 bg-[#030d1d] border border-slate-700 focus:border-emerald-500 rounded-xl text-white font-mono text-lg font-bold outline-none transition-all"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-400">
              USDT (BEP-20)
            </span>
          </div>

          {/* Live Profit Preview Box */}
          <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-[#030a17] border border-emerald-500/20 font-mono text-center">
            <div>
              <span className="text-[10px] text-slate-400 uppercase block">Weekly 3.0%</span>
              <span className="text-sm font-black text-emerald-400">+${weeklyProfitEst}</span>
              <span className="text-[9px] text-slate-500 block">per week</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase block">Daily (Mon-Fri)</span>
              <span className="text-sm font-black text-cyan-400">+${dailyProfitEst}</span>
              <span className="text-[9px] text-slate-500 block">0.60% / day</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase block">2X Cap Limit</span>
              <span className="text-sm font-black text-amber-400">${maxCappingEst}</span>
              <span className="text-[9px] text-slate-500 block">200% return</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-2">
              Payment Method
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMode("WALLET")}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  paymentMode === "WALLET"
                    ? "bg-emerald-500/10 border-emerald-500 text-white shadow-md shadow-emerald-500/20"
                    : "bg-[#061224] border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold font-mono">Wallet Balance</span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-1 font-mono">
                  ${balances.walletBalance.toFixed(2)} Available
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMode("WEB3")}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  paymentMode === "WEB3"
                    ? "bg-cyan-500/10 border-cyan-500 text-white shadow-md shadow-cyan-500/20"
                    : "bg-[#061224] border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold font-mono">Web3 BSC USDT</span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-1 font-mono">
                  Direct Wallet Transfer
                </span>
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="button"
            disabled={isSubmitting || numAmount < 50}
            onClick={handlePurchase}
            className="w-full py-4 rounded-xl text-center text-xs font-black uppercase tracking-wider text-black bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-300 hover:brightness-110 shadow-[0_0_25px_rgba(16,185,129,0.35)] flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 font-['Orbitron',monospace] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span>Processing Activation...</span>
            ) : (
              <>
                <TrendingUp className="w-4 h-4" />
                <span>Invest ${numAmount} In Trading Package</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Right: ROI of ROI (10-Level Breakdown) Plan Sheet */}
        <div className="lg:col-span-5 p-6 sm:p-7 rounded-3xl bg-[#071329] border border-cyan-500/30 space-y-4">
          <div className="flex items-center gap-2.5">
            <Award className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-base font-bold text-white font-['Orbitron',monospace]">
                ROI ki ROI (10 Levels)
              </h3>
              <p className="text-[11px] text-slate-400">
                Earn 60% total level commission from downline trading profits!
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-800/80 rounded-2xl bg-[#030917] border border-slate-800 overflow-hidden font-mono text-xs">
            {LEVEL_SLABS.map((slab) => (
              <div key={slab.level} className="flex items-center justify-between p-2.5 px-3 hover:bg-slate-800/30 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span className="text-slate-300 font-semibold">{slab.level}</span>
                </div>
                <div className="text-right">
                  <span className="text-emerald-400 font-bold">{slab.percent}</span>
                  <span className="text-[10px] text-slate-500 block">{slab.share}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-[11px] text-amber-300 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Important 2X Capping Condition:</span>
            </div>
            <p className="text-slate-300">
              Both your direct Trading Profit (3% weekly) AND Level ROI of ROI (60% 10-level) count towards your 2X capping. Once your total earnings reach 2X ($200 on a $100 package), you must reinvest to keep receiving level profits.
            </p>
          </div>
        </div>
      </div>

      {/* 4. My Active Trading Packages Table */}
      <div className="p-6 rounded-3xl bg-[#071329] border border-slate-800 space-y-4">
        <h3 className="text-lg font-bold text-white font-['Orbitron',monospace] flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>My Trading Packages ({packages.length})</span>
        </h3>

        {packages.length === 0 ? (
          <div className="py-12 text-center text-slate-500 font-mono text-xs">
            No trading packages activated yet. Invest minimum $50 above to start earning weekly 3%!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-[#030a17] text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Package</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Trading ROI</th>
                  <th className="py-3 px-4">Level ROI</th>
                  <th className="py-3 px-4">Total Earned</th>
                  <th className="py-3 px-4">2X Cap Limit</th>
                  <th className="py-3 px-4">Progress</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {packages.map((pkg) => {
                  const capPercent = pkg.maxCapping > 0 ? Math.min(100, (pkg.totalEarned / pkg.maxCapping) * 100) : 0;
                  return (
                    <tr key={pkg._id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 font-bold text-white">
                        {pkg.title || "TRADING PACKAGE"}
                      </td>
                      <td className="py-3 px-4 font-bold text-emerald-400">
                        ${pkg.amount?.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-cyan-300">
                        ${(pkg.tradingRoiEarned || 0).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-purple-300">
                        ${(pkg.levelRoiEarned || 0).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 font-bold text-white">
                        ${(pkg.totalEarned || 0).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-amber-400">
                        ${(pkg.maxCapping || 0).toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="w-24 bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-400 h-full rounded-full"
                            style={{ width: `${capPercent}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-400 mt-0.5 block">{capPercent.toFixed(1)}%</span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            pkg.status === "ACTIVE"
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                              : "bg-slate-700/40 text-slate-400 border border-slate-600"
                          }`}
                        >
                          {pkg.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. Income History Section */}
      <div className="p-6 rounded-3xl bg-[#071329] border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-lg font-bold text-white font-['Orbitron',monospace] flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-400" />
            <span>Trading Commissions History</span>
          </h3>

          {/* Filter Tabs */}
          <div className="inline-flex rounded-xl bg-[#030917] p-1 border border-slate-800 font-mono text-xs">
            <button
              onClick={() => {
                setHistoryTab("ALL");
                setHistoryPage(1);
              }}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                historyTab === "ALL" ? "bg-emerald-500 text-black font-bold" : "text-slate-400 hover:text-white"
              }`}
            >
              All Incomes
            </button>
            <button
              onClick={() => {
                setHistoryTab("Trading ROI");
                setHistoryPage(1);
              }}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                historyTab === "Trading ROI" ? "bg-emerald-500 text-black font-bold" : "text-slate-400 hover:text-white"
              }`}
            >
              Trading ROI (3%)
            </button>
            <button
              onClick={() => {
                setHistoryTab("ROI of ROI Level Income");
                setHistoryPage(1);
              }}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                historyTab === "ROI of ROI Level Income" ? "bg-emerald-500 text-black font-bold" : "text-slate-400 hover:text-white"
              }`}
            >
              ROI of ROI (10 Levels)
            </button>
          </div>
        </div>

        {historyList.length === 0 ? (
          <div className="py-12 text-center text-slate-500 font-mono text-xs">
            No history records found for the selected filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-[#030a17] text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Income Type</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Details</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {historyList.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(item.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-bold text-white">
                      {item.type}
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-400">
                      +${item.income?.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {item.description || (item.fromUser ? `From @${item.fromUser?.username}` : "Weekly trading profit distribution")}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                        CREDITED
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {historyTotalPages > 1 && (
          <div className="pt-2">
            <Pagination
              currentPage={historyPage}
              totalPages={historyTotalPages}
              onPageChange={(p) => setHistoryPage(p)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TradingPackagePage;
