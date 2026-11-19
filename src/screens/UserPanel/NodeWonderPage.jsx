import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { ethers } from "ethers";
import {
  Sparkles,
  Zap,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Wallet,
  ShieldCheck,
  Award,
  AlertCircle,
  HelpCircle,
  Layers,
  History,
  Share2,
} from "lucide-react";
import { setLoading } from "../../redux/slices/loadingSlice";
import {
  buyNodeWonderApi,
  getMyNodeWonderStatusApi,
  getMyNodeWonderHistoryApi,
  getGlobalNodeWonderQueueApi,
  getAvailableIncomeBalance,
} from "../../api/user.api";
import { AuthenticatedUserRouters } from "../../constants/routes";
import { getInjectedProvider } from "../../utils/additionalFunc";
import Pagination from "../../components/Screen/UserPanel/Pagination";

const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955";
const USDT_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)",
];

const NodeWonderPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const userInfo = useSelector((state) => state?.isLoggedUser?.data);

  const [statusData, setStatusData] = useState({
    hasActivePackage: false,
    activePackage: null,
    totalCyclesCompleted: 0,
    totalEarnedFromCycles: 0,
    totalReferralIncome: 0,
    canEarnCycle: false,
    canEarnReferral: true,
  });

  const [balances, setBalances] = useState({
    walletBalance: 0,
    fundWallet: 0,
    withdrawableBalance: 0,
  });

  const [paymentMode, setPaymentMode] = useState("WALLET"); // "WALLET" | "WEB3"
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalQueue, setGlobalQueue] = useState([]);

  // History state
  const [historyList, setHistoryList] = useState([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [historyTotalRecords, setHistoryTotalRecords] = useState(0);

  const fetchData = async () => {
    try {
      dispatch(setLoading(true));
      const [statusRes, balRes, queueRes] = await Promise.all([
        getMyNodeWonderStatusApi(),
        getAvailableIncomeBalance(),
        getGlobalNodeWonderQueueApi(),
      ]);

      if (statusRes?.success && statusRes?.data) {
        const d = statusRes.data;
        setStatusData({
          hasActivePackage: Boolean(d.hasActivePackage),
          activePackage: d.activePackage || d.activeEntry || null,
          totalCyclesCompleted: Number(d.totalCyclesCompleted || 0),
          totalEarnedFromCycles: Number(d.totalEarnedFromCycles ?? d.totalQueueEarned ?? 0),
          totalReferralIncome: Number(d.totalReferralIncome ?? d.totalReferralEarned ?? 0),
          canEarnCycle: Boolean(d.hasActivePackage),
          canEarnReferral: true,
          ...d,
        });
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

      if (queueRes?.success) {
        const qData = queueRes.data;
        const list = Array.isArray(qData)
          ? qData
          : Array.isArray(qData?.activeQueue)
          ? qData.activeQueue
          : Array.isArray(queueRes?.queue)
          ? queueRes.queue
          : [];
        setGlobalQueue(list);
      } else {
        setGlobalQueue([]);
      }
    } catch (err) {
      console.error("fetchData error:", err);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await getMyNodeWonderHistoryApi({
        page: historyPage,
        limit: 10,
      });
      if (res?.success) {
        setHistoryList(Array.isArray(res.data) ? res.data : []);
        setHistoryTotalPages(res.pagination?.totalPages || 1);
        setHistoryTotalRecords(res.pagination?.total || 0);
      } else {
        setHistoryList([]);
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
  }, [historyPage]);

  const handleActivate = async () => {
    const cost = 100;

    if (paymentMode === "WALLET") {
      if (balances.walletBalance < cost) {
        toast.error(
          `Insufficient wallet balance ($${balances.walletBalance.toFixed(2)}). Required: $${cost}. Please select Web3 or deposit.`
        );
        return;
      }

      const confirm = await Swal.fire({
        title: "Activate Node Wonder ($100)",
        text: `Invest $100 to join the universal 2-ID queue and earn $150 on completion?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#8B5CF6",
        cancelButtonColor: "#64748B",
        confirmButtonText: "Yes, Activate for $100",
      });

      if (!confirm.isConfirmed) return;

      try {
        setIsSubmitting(true);
        dispatch(setLoading(true));
        const res = await buyNodeWonderApi({});
        if (res?.success) {
          Swal.fire({
            icon: "success",
            title: "Node Wonder Activated!",
            text: res.message || "You have successfully entered the Node Wonder queue!",
            confirmButtonColor: "#8B5CF6",
          });
          fetchData();
          fetchHistory();
        } else {
          toast.error(res?.message || "Activation failed");
        }
      } catch (err) {
        toast.error(err.message || "Failed to activate Node Wonder");
      } finally {
        setIsSubmitting(false);
        dispatch(setLoading(false));
      }
    } else {
      // WEB3 Payment
      try {
        setIsSubmitting(true);
        dispatch(setLoading(true));

        const walletType = sessionStorage.getItem("walletType") || "metamask";
        const injectedProvider = getInjectedProvider(walletType);

        if (!injectedProvider) {
          throw new Error("Web3 Wallet not detected. Please unlock MetaMask or TrustWallet.");
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
        const amountInUSDT = ethers.parseUnits(cost.toString(), decimals);

        toast.info("Please confirm the $100 USDT payment in your Web3 wallet...");
        const tx = await usdtContract.transfer(recipientAddress, amountInUSDT);
        toast.info("Waiting for BSC blockchain confirmation...");
        await tx.wait();

        const res = await buyNodeWonderApi({
          txnHash: tx.hash,
          fromWalletAddress: userAddress,
        });

        if (res?.success) {
          Swal.fire({
            icon: "success",
            title: "On-Chain Node Wonder Activated!",
            text: `Confirmed! Hash: ${tx.hash.substring(0, 16)}... You are placed in the queue!`,
            confirmButtonColor: "#8B5CF6",
          });
          fetchData();
          fetchHistory();
        } else {
          toast.error(res?.message || "Activation failed after transfer");
        }
      } catch (err) {
        console.error("Web3 Node Wonder error:", err);
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

  const activePackage = statusData?.activePackage || statusData?.activeEntry || null;
  const hasActivePackage = Boolean(statusData?.hasActivePackage);
  const totalCyclesCompleted = Number(statusData?.totalCyclesCompleted || 0);
  const totalEarnedFromCycles = Number(statusData?.totalEarnedFromCycles ?? statusData?.totalQueueEarned ?? 0);
  const totalReferralIncome = Number(statusData?.totalReferralIncome ?? statusData?.totalReferralEarned ?? 0);
  const subsequentCount = activePackage?.subsequentIdsCount || 0;

  const queueList = Array.isArray(globalQueue)
    ? globalQueue
    : Array.isArray(globalQueue?.activeQueue)
    ? globalQueue.activeQueue
    : Array.isArray(globalQueue?.queue)
    ? globalQueue.queue
    : [];

  const safeHistoryList = Array.isArray(historyList) ? historyList : [];

  return (
    <div className="space-y-8 pt-4 pb-12 text-white">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>UNIVERSAL 2-ID QUEUE MATRIX</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-['Orbitron',monospace] tracking-wider">
            Node Wonder Income ($100 / $150)
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-3xl">
            A revolutionary, transparent universal single-leg queue system. Buy a fixed <strong className="text-purple-400">$100 package</strong>. As soon as <strong className="text-emerald-400">any 2 IDs</strong> join globally across the entire company, you receive <strong className="text-emerald-400">$150</strong> instant payout! Plus, earn <strong className="text-amber-400">5% ($5.00) unconditional direct referral</strong> bonuses.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(AuthenticatedUserRouters.NODE_WONDER_INCOME_HISTORY)}
            className="px-4 py-2.5 rounded-xl bg-purple-900/60 hover:bg-purple-800/80 border border-purple-500/40 text-purple-200 text-xs font-mono font-bold flex items-center gap-2 cursor-pointer transition-all shadow-md"
          >
            <History className="w-3.5 h-3.5 text-purple-400" />
            <span>$150 Incomes</span>
          </button>
          <button
            onClick={() => navigate(AuthenticatedUserRouters.NODE_WONDER_REFERRAL_HISTORY)}
            className="px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold flex items-center gap-2 cursor-pointer transition-all shadow-md"
          >
            <Share2 className="w-3.5 h-3.5 text-amber-400" />
            <span>5% Referrals</span>
          </button>
        </div>
      </div>

      {/* 2. Top Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#130b29] to-[#080414] border border-purple-500/20 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase">Queue Status</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-['Orbitron',monospace] text-white mt-2">
            {hasActivePackage ? `QUEUE #${activePackage?.queueNumber}` : "IDLE"}
          </div>
          <div className="text-[11px] text-purple-300 mt-1 font-mono">
            {hasActivePackage ? `${subsequentCount} / 2 Global IDs Joined` : "No Active Queue Position"}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#130b29] to-[#080414] border border-emerald-500/20 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase">Cycle Payouts</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-['Orbitron',monospace] text-emerald-400 mt-2">
            ${Number(totalEarnedFromCycles || 0).toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            {totalCyclesCompleted} Complete Cycles ($150 each)
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#130b29] to-[#080414] border border-amber-500/20 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase">5% Referral Bonus</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-['Orbitron',monospace] text-amber-400 mt-2">
            ${Number(totalReferralIncome || 0).toFixed(2)}
          </div>
          <div className="text-[11px] text-amber-400/80 mt-1 font-mono">
            $5.00 per direct buyer (Unconditional)
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#130b29] to-[#080414] border border-cyan-500/20 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase">Total Node Wonder</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-['Orbitron',monospace] text-cyan-300 mt-2">
            ${(Number(totalEarnedFromCycles || 0) + Number(totalReferralIncome || 0)).toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            Cycles + Referral Earnings
          </div>
        </div>
      </div>

      {/* 3. Active Queue Status Interactive Box */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#170830] via-[#0d041c] to-[#06020c] border-2 border-purple-500/40 shadow-[0_0_40px_rgba(139,92,246,0.15)] relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-4 flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-mono font-bold">
              {hasActivePackage ? `LIVE QUEUE POSITION: #${activePackage?.queueNumber}` : "CYCLE READY FOR ACTIVATION"}
            </div>

            <h2 className="text-2xl sm:text-3xl font-black font-['Orbitron',monospace] text-white">
              {hasActivePackage ? (
                <>Waiting for <span className="text-purple-400">{2 - subsequentCount} Global IDs</span> to Payout $150</>
              ) : (
                <>Join the Queue for <span className="text-emerald-400">$100</span> & Earn <span className="text-purple-400">$150</span></>
              )}
            </h2>

            <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
              {hasActivePackage ? (
                `Your ID is placed at Position #${activePackage?.queueNumber}. Whenever 2 new members join Node Wonder across the entire company (from anywhere, not just your team), you automatically receive $150 into your wallet!`
              ) : (
                "You do not have an active Node Wonder queue entry right now. Activate now with $100 to receive your queue ticket. Once 2 new members join after you, $150 is paid directly to you!"
              )}
            </p>

            {/* 2-Step Progress Indicator */}
            <div className="pt-2">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-2">
                Subsequent IDs Joined Progress: {subsequentCount} / 2
              </span>
              <div className="grid grid-cols-2 gap-4 max-w-md">
                <div
                  className={`p-4 rounded-xl border flex items-center gap-3 transition-all ${
                    subsequentCount >= 1
                      ? "bg-emerald-500/15 border-emerald-500 text-white"
                      : "bg-[#0b0314] border-slate-800 text-slate-500"
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                      subsequentCount >= 1 ? "bg-emerald-500 text-black" : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    1
                  </div>
                  <div>
                    <span className="text-xs font-bold block font-mono">1st Subsequent ID</span>
                    <span className="text-[10px] text-slate-400">
                      {subsequentCount >= 1 ? "Verified ✓" : "Waiting for next user..."}
                    </span>
                  </div>
                </div>

                <div
                  className={`p-4 rounded-xl border flex items-center gap-3 transition-all ${
                    subsequentCount >= 2
                      ? "bg-purple-500/20 border-purple-500 text-white"
                      : "bg-[#0b0314] border-slate-800 text-slate-500"
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                      subsequentCount >= 2 ? "bg-purple-500 text-white" : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    2
                  </div>
                  <div>
                    <span className="text-xs font-bold block font-mono">2nd Subsequent ID</span>
                    <span className="text-[10px] text-slate-400">
                      {subsequentCount >= 2 ? "Completed! $150 Paid ✓" : "Triggers $150 Payout"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action / Re-invest Card */}
          <div className="p-6 sm:p-7 rounded-3xl bg-[#0e041d]/90 border border-purple-500/30 text-center w-full lg:w-88 shrink-0 shadow-xl space-y-4">
            <span className="text-xs font-mono uppercase text-slate-400 tracking-wider block">
              Node Wonder Package
            </span>
            <div className="text-4xl sm:text-5xl font-black font-['Orbitron',monospace] text-purple-400">
              $100<span className="text-sm text-slate-400 font-normal">.00</span>
            </div>
            <div className="text-xs font-mono text-emerald-400">
              Cycle Return: $150.00 USDT
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-2 gap-2 text-left pt-1">
              <button
                type="button"
                onClick={() => setPaymentMode("WALLET")}
                className={`p-2.5 rounded-lg border text-xs font-mono transition-all cursor-pointer ${
                  paymentMode === "WALLET"
                    ? "bg-purple-500/20 border-purple-500 text-white"
                    : "bg-[#080210] border-slate-800 text-slate-400"
                }`}
              >
                <div className="font-bold">Wallet</div>
                <div className="text-[9px] text-slate-400">${balances.walletBalance.toFixed(2)} Bal</div>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMode("WEB3")}
                className={`p-2.5 rounded-lg border text-xs font-mono transition-all cursor-pointer ${
                  paymentMode === "WEB3"
                    ? "bg-purple-500/20 border-purple-500 text-white"
                    : "bg-[#080210] border-slate-800 text-slate-400"
                }`}
              >
                <div className="font-bold">Web3 BSC</div>
                <div className="text-[9px] text-slate-400">USDT Transfer</div>
              </button>
            </div>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleActivate}
              className="w-full py-3.5 rounded-xl text-center text-xs font-black uppercase tracking-wider text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-500 hover:brightness-110 shadow-[0_0_25px_rgba(139,92,246,0.4)] flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 font-['Orbitron',monospace] disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Processing...</span>
              ) : hasActivePackage ? (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>Buy Another Queue Slot ($100)</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Activate Node Wonder ($100)</span>
                </>
              )}
            </button>

            <span className="text-[10px] text-slate-500 block font-mono">
              Auto-disables upon $150 payout. Re-invest to cycle again!
            </span>
          </div>
        </div>
      </div>

      {/* 4. Plan Rules & Conditions Card */}
      <div className="p-6 rounded-3xl bg-[#0d071c] border border-purple-500/20 space-y-4">
        <h3 className="text-base font-bold text-white font-['Orbitron',monospace] flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-purple-400" />
          <span>Rules & Operational Conditions (Node Wonder)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-4 rounded-2xl bg-[#06020c] border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <Users className="w-4 h-4" />
              <span>1. 5% Unconditional Referral Income ($5.00)</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Whenever any of your direct referrals purchases a $100 Node Wonder package, you instantly receive 5% ($5.00) into your wallet. Even if you have not purchased Node Wonder yourself, or your package is currently completed/disabled, you still get this 5% referral bonus!
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#06020c] border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-purple-400 font-bold">
              <RefreshCw className="w-4 h-4" />
              <span>2. Universal 2-ID Progression & Disabling</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Entries are arranged in a universal single sequential queue. When 2 IDs join globally anywhere in the company after your position, your $150 payout is released immediately, and your queue slot completes/disables. To earn the next $150, you must reinvest $100.
            </p>
          </div>
        </div>
      </div>

      {/* 5. Live Global Queue Transparency Table */}
      <div className="p-6 rounded-3xl bg-[#0d071c] border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white font-['Orbitron',monospace] flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-400" />
            <span>Live Global Node Wonder Queue ({queueList.length})</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            Company-wide sequential queue
          </span>
        </div>

        {queueList.length === 0 ? (
          <div className="py-12 text-center text-slate-500 font-mono text-xs">
            No entries in the global queue yet. Be the first to join!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-[#05010a] text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Queue #</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Joined At</th>
                  <th className="py-3 px-4">Subsequent IDs</th>
                  <th className="py-3 px-4">Payout</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {queueList.map((item) => (
                  <tr key={item._id} className="hover:bg-purple-950/20 transition-colors">
                    <td className="py-3 px-4 font-bold text-purple-300">
                      #{item.queueNumber}
                    </td>
                    <td className="py-3 px-4 font-bold text-white">
                      @{item.user?.username || "NODEX_USER"}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-white">{item.subsequentIdsCount || 0}</span> / 2
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-400">
                      ${item.payoutAmount || 150}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.status === "COMPLETED"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                            : item.status === "QUEUED"
                            ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                            : "bg-slate-700/40 text-slate-400 border border-slate-600"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 6. My Node Wonder History Table */}
      <div className="p-6 rounded-3xl bg-[#0d071c] border border-slate-800 space-y-4">
        <h3 className="text-lg font-bold text-white font-['Orbitron',monospace] flex items-center gap-2">
          <History className="w-4 h-4 text-emerald-400" />
          <span>My Node Wonder Earnings History</span>
        </h3>

        {safeHistoryList.length === 0 ? (
          <div className="py-12 text-center text-slate-500 font-mono text-xs">
            No Node Wonder income credited yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-[#05010a] text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Income Type</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Details</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {safeHistoryList.map((item) => (
                  <tr key={item._id} className="hover:bg-purple-950/20 transition-colors">
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(item.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-bold text-white">
                      {item.type}
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-400">
                      +${Number(item.income || 0).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {item.description || (item.fromUser ? `From @${item.fromUser?.username}` : "Universal 2-ID Queue Payout")}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                        PAID OUT
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

export default NodeWonderPage;
