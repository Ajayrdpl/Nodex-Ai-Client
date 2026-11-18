import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { ethers } from "ethers";
import Swal from "sweetalert2";
import { getMoneySymbol, getInjectedProvider } from "../../../utils/additionalFunc";
import { setLoading } from "../../../redux/slices/loadingSlice";
import { sendPaymentDetail, activateUserAccount } from "../../../api/user.api";
import { Zap, ShieldCheck, CheckCircle2, TrendingUp, Sparkles, X, Wallet, Award, Rocket } from "lucide-react";

const InvestmentModal = ({ plan, onClose }) => {
  const dispatch = useDispatch();
  const userInfo = useSelector((state) => state?.isLoggedUser?.data);

  const actualMinimum = Number(plan?.minAmount || plan?.min || 10);
  const actualMaximum = plan?.maxAmount && plan.maxAmount !== Infinity ? Number(plan.maxAmount) : (plan?.max && plan.max !== Infinity ? Number(plan.max) : 25000);

  const dailyRoiPercent = Number(plan?.dailyRoi || plan?.percentage || 4.5);
  const thirtyDaysRoiPercent = Number(plan?.thirtyDaysRoi || plan?.monthlyRoi || (dailyRoiPercent * 30));
  const maxRoiCapPercent = 220;

  const [amount, setAmount] = useState(actualMinimum);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setAmount(actualMinimum);
  }, [plan, actualMinimum]);

  const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955";
  const USDT_ABI = [
    "function allowance(address owner, address spender) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function transfer(address to, uint256 amount) returns (bool)",
    "function balanceOf(address account) view returns (uint256)",
    "function decimals() view returns (uint8)",
  ];

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
  };

  const numberAmount = Number(amount) || 0;
  const isAmountValid = numberAmount >= actualMinimum && numberAmount <= actualMaximum;

  // Live Calculations matching image & PDF
  const dailyRoiAmount = ((numberAmount * dailyRoiPercent) / 100).toFixed(2);
  const thirtyDaysRoiAmount = ((numberAmount * thirtyDaysRoiPercent) / 100).toFixed(2);
  const maxRoiCapAmount = (numberAmount * (maxRoiCapPercent / 100)).toFixed(2);

  // Dynamic presets
  const presets = plan?.presetAmounts || [
    actualMinimum,
    Math.round((actualMinimum * 2 + actualMaximum) / 3),
    Math.round((actualMinimum + actualMaximum * 2) / 3),
    actualMaximum,
  ];

  const handleConnectAndPayment = async () => {
    if (!amount || numberAmount <= 0) {
      toast.error("Please enter a valid investment amount");
      return;
    }

    if (numberAmount < actualMinimum) {
      toast.error(`Minimum investment amount is ${getMoneySymbol()}${actualMinimum}`);
      return;
    }

    if (numberAmount > actualMaximum) {
      toast.error(`Maximum investment amount for this plan is ${getMoneySymbol()}${actualMaximum}`);
      return;
    }

    try {
      setIsLoading(true);
      dispatch(setLoading(true));

      const walletType = sessionStorage.getItem("walletType") || "metamask";
      const injectedProvider = getInjectedProvider(walletType);

      if (!injectedProvider) {
        throw new Error("Web3 Wallet not detected. Please unlock or refresh your browser extension.");
      }

      // Request accounts
      const accounts = await injectedProvider.request({ method: "eth_requestAccounts" });
      if (!accounts || !accounts.length) {
        throw new Error("No accounts found. Please unlock your wallet.");
      }

      // Switch or Add Binance Smart Chain (Chain ID: 56 / 0x38)
      try {
        await injectedProvider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x38" }],
        });
      } catch (switchError) {
        if (switchError.code === 4902 || switchError.data?.originalError?.code === 4902) {
          try {
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
          } catch (addError) {
            console.error("Error adding BSC network:", addError);
            throw new Error("Failed to add BSC network");
          }
        }
      }

      const browserProvider = new ethers.BrowserProvider(injectedProvider);
      const signer = await browserProvider.getSigner();
      const userAddress = await signer.getAddress();

      const recipientAddress = import.meta.env.VITE_WALLET_ADDRESS || "0x1ACC50Eba638E41cA9fBe74f9e71BD5934CD7f2a";
      const decimals = 18;
      const amountInUSDT = ethers.parseUnits(numberAmount.toString(), decimals);

      // Check Balance
      const BSC_RPC_URLS = [
        "https://bsc-dataseed1.binance.org/",
        "https://bsc-dataseed2.binance.org/",
        "https://bsc-dataseed3.binance.org/",
      ];

      let balanceNum = 0;
      for (const rpcUrl of BSC_RPC_URLS) {
        try {
          const readProvider = new ethers.JsonRpcProvider(rpcUrl);
          const readContract = new ethers.Contract(USDT_ADDRESS, USDT_ABI, readProvider);
          const balance = await readContract.balanceOf(userAddress);
          balanceNum = parseFloat(ethers.formatUnits(balance, decimals));
          break;
        } catch (rpcErr) {
          console.warn(`RPC ${rpcUrl} error:`, rpcErr.message);
        }
      }

      if (balanceNum < numberAmount) {
        throw new Error(`Insufficient USDT balance in your wallet. (Balance: ${balanceNum.toFixed(2)} USDT, Required: ${numberAmount} USDT)`);
      }

      // Execute USDT Transfer
      toast.info("Please confirm the USDT transaction in your wallet...");
      const usdtContract = new ethers.Contract(USDT_ADDRESS, USDT_ABI, signer);
      const tx = await usdtContract.transfer(recipientAddress, amountInUSDT);

      toast.info("Waiting for blockchain confirmation...");
      await tx.wait();

      // Submit to backend
      const backendData = {
        packageId: !plan?.isPlan ? plan?._id || plan?.id : null,
        planId: plan?.isPlan ? plan?._id || plan?.id : null,
        txnHash: tx.hash,
        amount: numberAmount,
        toWalletAddress: recipientAddress,
        fromWalletAddress: userAddress,
        isStaked: true,
        stakeLockPeriod: 30,
      };

      const response = await sendPaymentDetail(backendData);
      if (response?.success || response?.message?.toLowerCase().includes("success")) {
        try {
          await activateUserAccount();
        } catch (actErr) {
          console.warn("Activation note:", actErr.message);
        }

        Swal.fire({
          icon: "success",
          title: "Investment Successful!",
          text: `You have successfully invested $${numberAmount} in ${plan.title || "Package"}. ${dailyRoiPercent}% Daily ROI is now active!`,
          confirmButtonColor: "#00D2FF",
        });

        onClose();
        setTimeout(() => window.location.reload(), 2000);
      } else {
        toast.error(response?.message || "Failed to save investment record. Hash: " + tx.hash);
      }
    } catch (error) {
      console.error("❌ Investment error:", error);
      Swal.fire({
        icon: "error",
        title: "Investment Failed",
        text: error.message || "Failed to complete investment transaction.",
        confirmButtonColor: "#EF4444",
      });
    } finally {
      setIsLoading(false);
      dispatch(setLoading(false));
    }
  };

  if (!plan) return null;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-[#030d1d] border border-cyan-500/25 rounded-3xl p-6 sm:p-8 w-full max-w-lg relative shadow-2xl space-y-5 text-white">
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-[#020714]/95 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center z-20 p-6 text-center space-y-4">
            <div className="w-14 h-14 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            <h3 className="text-xl font-black text-white font-['Orbitron',monospace]">Confirming on Blockchain</h3>
            <p className="text-xs text-slate-400">Please confirm the prompt in your Web3 wallet and do not close this window.</p>
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-start border-b border-cyan-500/15 pb-4">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400">
              NODEXAI • BNB Smart Chain
            </span>
            <h2 className="text-2xl font-black text-white mt-0.5 font-['Orbitron',monospace]">
              {plan.title || "Investment Package"}
            </h2>
          </div>
          <button
            onClick={!isLoading ? onClose : undefined}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Amount Box */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs text-slate-400 font-mono">
            <span>Investment Amount (USDT BEP-20)</span>
            <span className="text-amber-400 font-bold">
              Range: ${actualMinimum.toLocaleString()} – ${actualMaximum.toLocaleString()}
            </span>
          </div>

          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-slate-400">$</span>
            <input
              type="number"
              value={amount}
              onChange={handleAmountChange}
              min={actualMinimum}
              max={actualMaximum}
              placeholder={`Enter amount ($${actualMinimum} – $${actualMaximum})`}
              className="w-full bg-[#020817] border border-cyan-500/30 focus:border-cyan-400 rounded-2xl py-3.5 pl-10 pr-4 text-white text-xl font-black outline-none transition font-mono shadow-inner"
              disabled={isLoading}
            />
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap gap-2 pt-1">
            {presets.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setAmount(val)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${numberAmount === val
                    ? "bg-cyan-500/20 text-cyan-300 border-cyan-400"
                    : "bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700/60"
                  }`}
              >
                ${val.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {/* Live Calculation Card */}
        <div className="bg-[#020817]/90 border border-cyan-500/20 p-4 rounded-2xl space-y-2.5 text-xs">
          <div className="flex justify-between items-center pb-2 border-b border-cyan-500/15">
            <span className="text-slate-400 flex items-center gap-1.5 font-semibold">
              <TrendingUp className="w-4 h-4 text-cyan-400" /> Daily ROI ({dailyRoiPercent}% / Day):
            </span>
            <strong className="text-cyan-300 text-sm font-black font-mono">
              +${dailyRoiAmount} / day
            </strong>
          </div>

          <div className="flex justify-between items-center text-slate-300">
            <span className="text-slate-400">30 Days ROI ({thirtyDaysRoiPercent}%):</span>
            <strong className="text-amber-300 font-bold font-mono">${thirtyDaysRoiAmount}</strong>
          </div>

          <div className="flex justify-between items-center text-slate-300">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Rocket className="w-3.5 h-3.5 text-emerald-400" />
              Maximum ROI Cap ({maxRoiCapPercent}%):
            </span>
            <strong className="text-emerald-400 font-bold font-mono">${maxRoiCapAmount}</strong>
          </div>

          {numberAmount >= 500 && (
            <div className="pt-2 border-t border-cyan-500/15 flex items-center gap-1.5 text-amber-300 text-[11px] font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>VIP Privilege: All 10 Levels Community Income Automatically Unlocked!</span>
            </div>
          )}
        </div>

        {/* Confirm Investment Action Button */}
        <button
          onClick={handleConnectAndPayment}
          disabled={!isAmountValid || isLoading}
          className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all shadow-xl flex items-center justify-center gap-2 font-['Orbitron',monospace] cursor-pointer ${!isAmountValid || isLoading
              ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
              : "bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-400 hover:brightness-110 text-white shadow-[0_0_20px_rgba(0,210,255,0.35)] active:scale-98"
            }`}
        >
          <Zap className="w-4 h-4" />
          {!isAmountValid
            ? numberAmount < actualMinimum
              ? `Min $${actualMinimum.toLocaleString()} Required`
              : `Max $${actualMaximum.toLocaleString()} Allowed`
            : `Confirm & Invest $${numberAmount.toLocaleString()} USDT`}
        </button>

        <p className="text-[11px] text-slate-500 text-center flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Non-custodial smart contract transfer via BNB Smart Chain (BEP-20)</span>
        </p>
      </div>
    </div>
  );
};

export default InvestmentModal;
