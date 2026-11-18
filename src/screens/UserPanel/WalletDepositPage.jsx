import React, { useState } from "react";
import { Wallet, ArrowUpRight, DollarSign, CreditCard, Shield, CheckCircle, AlertCircle, TrendingUp, X } from 'lucide-react';
import { toast } from "react-toastify";

// Mock function for demonstration
const getMoneySymbol = () => "$";

const WalletDepositPage = () => {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const value = e.target.value;
    setAmount(value);
  };

  const handleWalletDepositRequest = async () => {
    const numberAmount = Number(amount);
    
    if (numberAmount <= 0) {
      toast.error("Deposit Amount must be greater than 0");
      return;
    }
    
    if (numberAmount < 100) {
      toast.error("Minimum deposit amount is $100");
      return;
    }
    
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success("Deposit Request Generated Successfully");
      setAmount("");
    } catch (error) {
      console.error("Error in deposit request:", error);
      toast.error("Error processing deposit request");
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amt) => {
    return amt ? Number(amt).toLocaleString() : "0";
  };

  const quickAmounts = [100, 500, 1000, 5000];

  const setQuickAmount = (value) => {
    setAmount(value.toString());
  };

  return (
    <div className="max-w-2xl mx-auto p-2 sm:p-4">
      <div className="neon-glow-card rounded-3xl p-6 sm:p-8 shadow-[0_0_30px_rgba(14,165,233,0.22)] border border-sky-400/40 relative overflow-hidden backdrop-blur-xl">
        
        {/* Header */}
        <div className="relative flex items-center justify-between mb-8 pb-5 border-b border-sky-500/20">
          <div className="flex items-center gap-4">
            <div className="gold-badge-icon w-12 h-12 flex items-center justify-center shadow-lg shrink-0">
              <ArrowUpRight className="w-6 h-6 text-slate-950 font-black" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-wide">
                <span className="gold-metallic-text">Wallet Deposit</span>
              </h2>
              <p className="text-xs text-slate-300 font-semibold uppercase tracking-wider mt-0.5">
                Add Funds To Your Investment Activation Wallet
              </p>
            </div>
          </div>
        </div>

        {/* Security Badge */}
        <div className="relative mb-6 p-4 bg-[#050c18] border border-sky-500/30 rounded-2xl">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div>
              <span className="text-amber-300 text-xs font-black uppercase tracking-wider">Secure Cryptographic Deposit</span>
              <p className="text-slate-300 text-xs mt-0.5">
                Protected with multi-signature verification and instant blockchain confirmation.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Amount Buttons */}
        <div className="relative mb-6">
          <label className="flex items-center gap-2 text-xs font-black uppercase text-slate-300 mb-3">
            <DollarSign className="w-4 h-4 text-amber-400" />
            Quick Select Amount
          </label>
          <div className="grid grid-cols-4 gap-2.5">
            {quickAmounts.map((value) => (
              <button
                key={value}
                onClick={() => setQuickAmount(value)}
                className={`p-3 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all duration-300 border cursor-pointer ${
                  amount === value.toString()
                    ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.3)]'
                    : 'bg-[#060e1e] border-sky-500/30 text-slate-300 hover:bg-sky-950/40 hover:text-white'
                }`}
              >
                {getMoneySymbol()}{value.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {/* Amount Input */}
        <div className="relative mb-6">
          <label className="flex items-center gap-2 text-xs font-black uppercase text-slate-300 mb-2">
            <Wallet className="w-4 h-4 text-sky-400" />
            Deposit Amount ({getMoneySymbol()})
          </label>
          <div className="relative group">
            <input
              type="number"
              value={amount}
              onChange={handleChange}
              placeholder="Enter amount (Min $100)"
              className="w-full bg-[#060e1e] border border-sky-500/30 rounded-xl py-3.5 px-4 text-white text-xl sm:text-2xl font-mono font-bold focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition pr-24"
              onKeyDown={(e) => ['ArrowUp', 'ArrowDown', 'e', 'E', '+', '-'].includes(e.key) && e.preventDefault()}
              onWheel={(e) => e.target.blur()}
              min="0"
            />
            
            {/* Amount Preview */}
            {amount && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <span className="text-amber-400 font-mono font-bold text-sm">
                  {getMoneySymbol()}{formatAmount(amount)}
                </span>
              </div>
            )}
          </div>
          {amount && Number(amount) > 0 && (
            <div className="mt-2">
              {Number(amount) >= 100 ? (
                <p className="text-xs text-emerald-400 flex items-center gap-1 font-mono font-semibold">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Amount valid for activation
                </p>
              ) : (
                <p className="text-xs text-rose-400 flex items-center gap-1 font-mono font-semibold">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Minimum deposit amount is $100
                </p>
              )}
            </div>
          )}
        </div>

        {/* Deposit Summary */}
        {amount && Number(amount) >= 100 && (
          <div className="relative mb-6 p-4 bg-[#050c18] border border-sky-500/30 rounded-2xl space-y-2 text-xs">
            <h3 className="font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              Deposit Summary
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-slate-300">
                <span>Deposit Amount:</span>
                <span className="text-white font-mono font-bold text-sm">{getMoneySymbol()}{formatAmount(amount)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Processing Fee:</span>
                <span className="text-emerald-400 font-mono font-bold">0.00% ({getMoneySymbol()}0.00)</span>
              </div>
              <div className="border-t border-sky-500/20 pt-2">
                <div className="flex justify-between items-center font-black">
                  <span className="text-white uppercase">Credited To Wallet:</span>
                  <span className="text-amber-400 font-mono text-lg">{getMoneySymbol()}{formatAmount(amount)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleWalletDepositRequest}
          disabled={loading || !amount || Number(amount) < 100}
          className={`w-full py-4 px-6 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 cursor-pointer ${
            loading || !amount || Number(amount) < 100
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 hover:from-amber-400 hover:to-yellow-300 shadow-[0_0_20px_rgba(245,158,11,0.4)]'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950/40 border-t-slate-950 rounded-full animate-spin"></div>
                <span>Processing Deposit...</span>
              </>
            ) : (
              <>
                <TrendingUp className="w-4 h-4" />
                <span>
                  {!amount || Number(amount) < 100 
                    ? 'Minimum deposit amount is $100'
                    : `Confirm Deposit ${getMoneySymbol()}${formatAmount(amount)}`
                  }
                </span>
              </>
            )}
          </div>
        </button>

        {/* Security Notice */}
        <div className="mt-6 p-3.5 bg-[#050c18] border border-sky-500/20 rounded-xl">
          <p className="text-[11px] text-slate-400 flex items-start gap-2">
            <Shield className="w-3.5 h-3.5 text-sky-400 flex-shrink-0 mt-0.5" />
            <span>
              All deposits are credited immediately after blockchain confirmation and made available for ID activation and yield staking.
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default WalletDepositPage;