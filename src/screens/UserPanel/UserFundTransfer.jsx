import React, { useState } from "react";
import {
  ArrowRightLeft,
  User,
  DollarSign,
  Send,
  Shield,
  CheckCircle,
  AlertCircle,
  UserCheck,
  X,
  Search,
  Copy,
  Wallet,
} from "lucide-react";
import {
  sendOtp,
  transferFunds,
  verifyOtp,
  verifyPayment,
  verifyUser,
} from "../../api/user.api";
import { toast } from "react-toastify";
import debounce from "lodash/debounce";
import { useSelector } from "react-redux";
import { sendUSDTToken } from "../../utils/helper";

// Mock function for demonstration
const getMoneySymbol = () => "$";

const UserFundTransfer = () => {
  const [formData, setFormData] = useState({
    username: "",
    amount: "",
  });
  const [loading, setLoading] = useState(false);
  const [userVerified, setUserVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [userInfo, setUserInfo] = useState(null); // will hold user's name if verified
  const [userError, setUserError] = useState(null);
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [copied, setCopied] = useState(false);
  const walletAddress = useSelector(
    (state) => state?.isLoggedUser?.data?.account
  );
  const [verifyPaymentDetails, setVerifyPaymentDetails] = useState(null);

  const OtpModal = ({ isOpen, onClose, onVerify, loading }) => {
    const [otp, setOtp] = useState("");

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-4">
        <div className="bg-slate-900 border border-purple-700/30 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center mb-5">
            <Shield className="w-10 h-10 text-purple-400 mx-auto mb-2" />
            <h3 className="text-xl font-bold text-white">OTP Verification</h3>
            <p className="text-sm text-slate-400 mt-1">
              Enter the 6-digit code sent to the registered device.
            </p>
          </div>

          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP"
            maxLength={6}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-center text-lg tracking-widest mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />

          <button
            onClick={() => onVerify(otp)}
            disabled={loading || otp.length !== 6}
            className={`w-full py-3 rounded-xl font-semibold text-white transition-all ${
              loading || otp.length !== 6
                ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500"
            }`}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </div>
      </div>
    );
  };

  // Inside the component
  const debouncedVerifyUser = React.useCallback(
    debounce(async (username) => {
      setVerifying(true);
      try {
        const response = await verifyUser({ username: username.trim() });
        if (response?.success) {
          setUserInfo(response?.data);
          setUserVerified(true);
          setUserError(null);
        } else {
          setUserInfo(null);
          setUserVerified(false);
          setUserError("User not found");
        }
      } catch (err) {
        console.error("Verification error:", err);
        setUserInfo(null);
        setUserVerified(false);
        setUserError("An error occurred while verifying");
      } finally {
        setVerifying(false);
      }
    }, 500), // 500ms debounce delay
    []
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "username") {
      setUserVerified(false);
      setUserInfo(null);
      setUserError(null);

      // Trigger debounced API call if valid length
      if (value.length >= 8 && value.length <= 12) {
        debouncedVerifyUser(value);
      } else {
        debouncedVerifyUser.cancel(); // Cancel if user deletes or it's not in range
      }
    }
  };

  const handleFundTransfer = async () => {
    if (!formData.username.trim()) {
      toast.error("Please enter a username");
      return;
    }

    if (!formData.amount || Number(formData.amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      const res = await verifyPayment({
        receiverAccount: userInfo?.account,
        amount: formData.amount,
      });
      if (res?.success) {
        toast.success(res?.message || "OTP sent successfully");
        setVerifyPaymentDetails(res?.data);
        setOtpModalOpen(true); // show OTP modal
      } else {
        toast.error(res?.message || "Something went wrong");
      }
    } catch (error) {
      toast.error("Error sending OTP. Please try again after some time.");
      console.error("Error sending OTP:", error);
    }
  };

  const handleVerifyOtp = async (otp) => {
    setVerifyingOtp(true);
    try {
      // Step 1: Verify OTP
      const otpRes = await verifyOtp({
        localTxId: verifyPaymentDetails?.localTxId,
        otp,
      });

      if (!otpRes?.success) {
        toast.error(otpRes?.message || "Invalid OTP");
        return;
      }

      // Step 2: Send on-chain USDT transfer
      toast.info("Initiating USDT transfer via MetaMask...");
      const tx = await sendUSDTToken(userInfo?.account, formData.amount);

      toast.success("Transaction sent! Waiting for confirmation...");
      await tx.wait(); // Wait for 1 block confirmation (optional but good UX)

      // Step 3: Notify backend with txHash
      const transferRes = await transferFunds({
        localTxId: verifyPaymentDetails?.localTxId,
        txHash: tx.hash,
      });

      if (transferRes?.success) {
        toast.success("Fund transfer successful!");
        setFormData({ username: "", amount: "" });
        setUserVerified(false);
        setUserInfo(null);
        setOtpModalOpen(false);
      } else {
        toast.error(transferRes?.message || "Transfer verification failed");
      }
    } catch (error) {
      console.error("Transfer error:", error);
      toast.error(error?.message || "Something went wrong during the transfer");
    } finally {
      setVerifyingOtp(false);
      setLoading(false);
    }
  };

  const formatAmount = (amt) => {
    return amt ? Number(amt).toLocaleString() : "0";
  };

  const quickAmounts = [50, 100, 500, 1000];

  const setQuickAmount = (value) => {
    setFormData((prev) => ({ ...prev, amount: value.toString() }));
  };

  const isFormValid =
    formData.username.trim() && formData.amount && Number(formData.amount) > 0;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        <div className="neon-glow-card border border-sky-400/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_30px_rgba(14,165,233,0.22)] backdrop-blur-xl">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6 pb-5 border-b border-sky-500/20">
            <div className="gold-badge-icon w-12 h-12 flex items-center justify-center shadow-lg shrink-0">
              <ArrowRightLeft className="w-6 h-6 text-slate-950 font-black" />
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-wide">
                <span className="gold-metallic-text">P2P Fund Transfer</span>
              </h2>
              <p className="text-xs text-slate-300 font-semibold tracking-wider uppercase mt-0.5">
                Instant Zero-Fee Internal Network Transfer
              </p>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mb-6 p-4 bg-[#050c18] border border-sky-500/30 rounded-2xl">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <div>
                <span className="text-amber-300 text-xs font-black uppercase tracking-wider">
                  Cryptographic Verification Active
                </span>
                <p className="text-slate-300 text-xs mt-0.5">
                  100% P2P wallet usage permitted for downline member activations and peer transfers with 0% fee.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="flex items-center gap-2 text-xs font-black uppercase text-slate-300 mb-2">
                <Wallet className="w-4 h-4 text-sky-400" />
                Origin Wallet Address
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={walletAddress}
                  disabled
                  className="w-full bg-[#060e1e] border border-sky-500/30 rounded-xl py-3 px-4 pr-12 text-slate-300 text-xs sm:text-sm font-mono cursor-not-allowed"
                />
                <button
                  onClick={copyToClipboard}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-slate-700/50 rounded-lg transition text-slate-400 hover:text-white cursor-pointer"
                  title="Copy address"
                >
                  {copied ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Username Field */}
            <div>
              <label className="flex items-center gap-2 text-xs font-black uppercase text-slate-300 mb-2">
                <User className="w-4 h-4 text-amber-400" />
                Recipient Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter recipient's username"
                  className="w-full bg-[#060e1e] border border-sky-500/30 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
                />
              </div>
              {verifying && (
                <p className="mt-1.5 text-xs text-sky-400 font-mono">
                  Verifying username on network...
                </p>
              )}

              {userVerified && userInfo?.username && (
                <div className="mt-1.5 flex items-center gap-1.5 text-emerald-400 text-xs font-bold font-mono">
                  <UserCheck className="w-4 h-4" />
                  Verified: <span className="text-white">{userInfo.username}</span>
                </div>
              )}

              {userError && (
                <p className="mt-1.5 text-xs text-rose-400 font-mono">{userError}</p>
              )}
            </div>

            {/* Amount Input */}
            <div>
              <label className="flex items-center gap-2 text-xs font-black uppercase text-slate-300 mb-2">
                <DollarSign className="w-4 h-4 text-amber-400" />
                Transfer Amount ($)
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="Enter amount to transfer (USD)"
                  className="w-full bg-[#060e1e] border border-sky-500/30 rounded-xl py-3 px-4 text-white text-base sm:text-lg font-mono font-bold focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
                  onKeyDown={(e) => ['ArrowUp', 'ArrowDown', 'e', 'E', '+', '-'].includes(e.key) && e.preventDefault()}
                  onWheel={(e) => e.target.blur()}
                  min="0"
                />
              </div>
            </div>

            {/* Transfer Summary */}
            {isFormValid && (
              <div className="p-4 bg-[#050c18] border border-sky-500/30 rounded-2xl space-y-2 text-xs">
                <h3 className="font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  Transfer Summary
                </h3>
                <div className="flex justify-between items-center text-slate-300">
                  <span>Recipient:</span>
                  <span className="text-sky-300 font-bold font-mono">@{formData.username}</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span>Transfer Amount:</span>
                  <span className="text-white font-bold font-mono">${formatAmount(formData.amount)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span>Transfer Fee:</span>
                  <span className="text-emerald-400 font-bold font-mono">0.00% ($0.00 Free)</span>
                </div>
                <div className="border-t border-sky-500/20 pt-2 flex justify-between items-center font-bold text-sm">
                  <span className="text-white">Total Debit:</span>
                  <span className="text-amber-400 font-mono text-base">${formatAmount(formData.amount)}</span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleFundTransfer}
              disabled={loading || !isFormValid}
              className={`w-full py-3.5 px-6 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                loading || !isFormValid
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                  : "bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 hover:from-amber-400 hover:to-yellow-300 shadow-[0_0_20px_rgba(245,158,11,0.4)]"
              }`}
            >
              {loading ? "Processing Transfer..." : `Transfer $${formatAmount(formData.amount) || "0.00"} Now`}
            </button>
          </div>
        </div>
      </div>
      <OtpModal
        isOpen={otpModalOpen}
        onClose={() => setOtpModalOpen(false)}
        onVerify={handleVerifyOtp}
        loading={verifyingOtp}
      />
    </>
  );
};

export default UserFundTransfer;
