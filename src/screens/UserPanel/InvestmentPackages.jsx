import React, { useState, useEffect } from 'react';
import { Axios } from '../../constants/mainContent';
import { toast } from 'react-toastify';
import { Sparkles, ShieldCheck, Zap, Lock, DollarSign, TrendingUp, Layers, CheckCircle } from 'lucide-react';

const InvestmentPackages = () => {
  const [packages, setPackages] = useState({ tradingSlabs: [], stakingPlans: [] });
  const [userInvestments, setUserInvestments] = useState({ investments: [], summary: {} });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('packages');
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [investmentForm, setInvestmentForm] = useState({
    amount: '',
    appliedROI: '',
    lockDays: ''
  });

  useEffect(() => {
    fetchPackages();
    fetchUserInvestments();
  }, []);

  const fetchPackages = async () => {
    try {
      const response = await Axios.get('/packages');
      if (response.data?.success) {
        setPackages(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
    }
  };

  const fetchUserInvestments = async () => {
    try {
      const response = await Axios.get('/packages/my-investments');
      if (response.data?.success) {
        setUserInvestments(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching investments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvestment = async (type) => {
    try {
      const endpoint = type === 'TRADING' ? '/packages/trading' : '/packages/staking';
      const payload = type === 'TRADING'
        ? { amount: parseFloat(investmentForm.amount), appliedROI: parseFloat(investmentForm.appliedROI) }
        : { amount: parseFloat(investmentForm.amount), lockDays: parseInt(investmentForm.lockDays) };

      const response = await Axios.post(endpoint, payload);

      if (response.data?.success) {
        toast.success(`${type === 'TRADING' ? 'Trading' : 'Staking'} investment created successfully!`);
        setSelectedPackage(null);
        setInvestmentForm({ amount: '', appliedROI: '', lockDays: '' });
        fetchUserInvestments();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Investment failed');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-sky-500/20">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black flex items-center gap-2.5">
            <span className="gold-badge-icon w-9 h-9 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-slate-950" />
            </span>
            <span className="gold-metallic-text tracking-wide uppercase">Institutional Deposit Packages</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-semibold tracking-wider uppercase mt-1">
            Flexible Trading Slabs & High-Yield Staking Plans
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-[#060e1e] p-1.5 rounded-2xl border border-sky-500/30">
          <button
            onClick={() => setActiveTab('packages')}
            className={`py-2 px-5 rounded-xl font-black text-xs sm:text-sm transition-all cursor-pointer ${
              activeTab === 'packages'
                ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Deposit Packages
          </button>
          <button
            onClick={() => setActiveTab('investments')}
            className={`py-2 px-5 rounded-xl font-black text-xs sm:text-sm transition-all cursor-pointer ${
              activeTab === 'investments'
                ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            My Investments Ledger
          </button>
        </div>
      </div>

      {activeTab === 'packages' && (
        <div className="space-y-8">
          {/* Trading Packages */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-sky-400 shadow-[0_0_10px_#38bdf8]" />
              <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-wider">
                Trading Investment Slabs <span className="text-xs text-sky-400 font-mono font-normal">(Monthly ROI 1.0% - 2.0%)</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {(packages.tradingSlabs?.length > 0 ? packages.tradingSlabs : [
                { name: "Starter Slab", description: "Standard Institutional Trading", minAmount: 50, maxAmount: 499, minROI: 1.0, maxROI: 1.2 },
                { name: "Pro Trader", description: "Advanced High-Yield Allocation", minAmount: 500, maxAmount: 1999, minROI: 1.2, maxROI: 1.5 },
                { name: "Elite Club", description: "Direct Arbitrage Stream", minAmount: 2000, maxAmount: 4999, minROI: 1.5, maxROI: 1.8 },
                { name: "Institutional Whale", description: "Maximum Yield & Priority Capping", minAmount: 5000, maxAmount: Infinity, minROI: 1.8, maxROI: 2.0 }
              ]).map((slab, index) => (
                <div key={index} className="neon-glow-card p-5 border border-sky-500/40 hover:border-amber-400 transition-all duration-300 flex flex-col justify-between group">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-xs font-black uppercase text-amber-400 tracking-wider">
                        {slab.name}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-300 border border-sky-500/30 text-[10px] font-bold">
                        ACTIVE
                      </span>
                    </div>
                    <div className="text-xs text-slate-300 mb-4">{slab.description}</div>

                    <div className="space-y-2.5">
                      <div className="bg-[#050c18] p-3 rounded-xl border border-sky-500/20">
                        <div className="text-[11px] text-slate-400 uppercase font-semibold">Investment Range</div>
                        <div className="font-mono font-black text-sm text-white mt-0.5">
                          {formatCurrency(slab.minAmount)} - {slab.maxAmount === Infinity || !slab.maxAmount ? '∞' : formatCurrency(slab.maxAmount)}
                        </div>
                      </div>

                      <div className="bg-[#050c18] p-3 rounded-xl border border-sky-500/20">
                        <div className="text-[11px] text-slate-400 uppercase font-semibold">Monthly ROI</div>
                        <div className="font-mono font-black text-base text-amber-400 mt-0.5">
                          {slab.minROI}% - {slab.maxROI}%
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedPackage({ type: 'TRADING', data: slab })}
                    className="w-full mt-5 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider hover:from-amber-400 hover:to-yellow-300 shadow-[0_0_15px_rgba(245,158,11,0.3)] transition cursor-pointer"
                  >
                    Deposit Now
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Staking Packages */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_10px_#facc15]" />
              <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-wider">
                Fixed Staking Plans <span className="text-xs text-amber-400 font-mono font-normal">(Guaranteed Lock-In Yield)</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {(packages.stakingPlans?.length > 0 ? packages.stakingPlans : [
                { name: "Silver Staking", description: "90 Days Locked Yield", lockDays: 90, monthlyROI: 1.5, totalReturn: 104.5 },
                { name: "Gold Staking", description: "180 Days Compound Pool", lockDays: 180, monthlyROI: 2.0, totalReturn: 112.0 },
                { name: "Diamond Whale Pool", description: "365 Days Max Yield Vault", lockDays: 365, monthlyROI: 2.5, totalReturn: 130.0 }
              ]).map((plan, index) => (
                <div key={index} className="neon-glow-card p-5 border border-amber-500/40 hover:border-sky-400 transition-all duration-300 flex flex-col justify-between group">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <h3 className="text-sm font-black text-white uppercase tracking-wider">{plan.name}</h3>
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                        {plan.lockDays} DAYS
                      </span>
                    </div>
                    <div className="text-xs text-slate-300 mb-4">{plan.description}</div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-[#050c18] p-3 rounded-xl border border-sky-500/20">
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">Monthly ROI</div>
                        <div className="font-mono font-black text-sm text-emerald-400">{plan.monthlyROI}%</div>
                      </div>

                      <div className="bg-[#050c18] p-3 rounded-xl border border-sky-500/20">
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Return</div>
                        <div className="font-mono font-black text-sm text-amber-400">~{plan.totalReturn}%</div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedPackage({ type: 'STAKING', data: plan })}
                    className="w-full mt-5 py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 via-sky-400 to-blue-600 text-white font-black text-xs uppercase tracking-wider hover:from-sky-400 hover:to-blue-500 shadow-[0_0_15px_rgba(14,165,233,0.3)] transition cursor-pointer"
                  >
                    Stake Now
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'investments' && (
        <div className="space-y-6">
          {/* Summary Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            <div className="neon-glow-card p-3.5 border border-sky-500/30">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Total Staked</div>
              <div className="text-base sm:text-lg font-black text-white font-mono mt-1">
                {formatCurrency(userInvestments.summary?.totalInvestment || 0)}
              </div>
            </div>
            <div className="neon-glow-card p-3.5 border border-sky-500/30">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Trading Volume</div>
              <div className="text-base sm:text-lg font-black text-sky-400 font-mono mt-1">
                {formatCurrency(userInvestments.summary?.tradingInvestment || 0)}
              </div>
            </div>
            <div className="neon-glow-card p-3.5 border border-sky-500/30">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Staking Volume</div>
              <div className="text-base sm:text-lg font-black text-purple-400 font-mono mt-1">
                {formatCurrency(userInvestments.summary?.stakingInvestment || 0)}
              </div>
            </div>
            <div className="neon-glow-card p-3.5 border border-sky-500/30">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Active Packages</div>
              <div className="text-base sm:text-lg font-black text-amber-400 font-mono mt-1">
                {userInvestments.summary?.activePackages || 0}
              </div>
            </div>
            <div className="neon-glow-card p-3.5 border border-sky-500/30 col-span-2 sm:col-span-1">
              <div className="text-[10px] text-slate-400 font-bold uppercase">Generated Yield</div>
              <div className="text-base sm:text-lg font-black text-emerald-400 font-mono mt-1">
                {formatCurrency(userInvestments.summary?.totalIncomeGenerated || 0)}
              </div>
            </div>
          </div>

          {/* Investment List Table with Split Blue & Gold Header */}
          <div className="neon-glow-card p-4 sm:p-6 border border-sky-400/40 shadow-[0_0_30px_rgba(14,165,233,0.22)] rounded-3xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="gold-badge-icon w-9 h-9 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-slate-950 font-black" />
              </div>
              <div>
                <h2 className="text-lg font-black uppercase gold-metallic-text">Active Investment Portfolio</h2>
                <p className="text-xs text-slate-300 font-semibold uppercase">Verified On-Chain Staking & Trading Ledgers</p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-sky-500/30 shadow-inner bg-[#040914]/90">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-nowrap divide-x divide-white/10">
                    <th className="py-3.5 px-4 text-xs font-black tracking-wider uppercase split-header-blue">Package / Plan</th>
                    <th className="py-3.5 px-4 text-xs font-black tracking-wider uppercase split-header-blue">Amount</th>
                    <th className="py-3.5 px-4 text-xs font-black tracking-wider uppercase split-header-blue">Monthly ROI</th>
                    <th className="py-3.5 px-4 text-xs font-black tracking-wider uppercase split-header-gold">Status</th>
                    <th className="py-3.5 px-4 text-xs font-black tracking-wider uppercase split-header-gold">Income Yield</th>
                    <th className="py-3.5 px-4 text-xs font-black tracking-wider uppercase split-header-gold">Created Date</th>
                  </tr>
                </thead>
                <tbody className="text-xs sm:text-sm divide-y divide-sky-500/15">
                  {(userInvestments.investments?.length > 0 ? userInvestments.investments : []).map((investment, idx) => {
                    const isTrading = investment.type === 'TRADING';
                    return (
                      <tr key={investment._id || idx} className="hover:bg-sky-950/30 text-nowrap transition-colors border-b border-sky-500/10">
                        <td className="py-3.5 px-4 text-slate-100 font-medium">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${isTrading ? 'bg-sky-400' : 'bg-amber-400'}`} />
                            <span className="font-bold text-white">
                              {isTrading ? (investment.slab?.name || "Trading Slab") : (investment.stakingPlan?.name || "Fixed Staking")}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">({investment.type})</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-100 font-mono font-bold">
                          {formatCurrency(investment.amount)}
                        </td>
                        <td className="py-3.5 px-4 text-emerald-400 font-mono font-bold">
                          {investment.roi}% / mo
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            investment.status === 'active'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}>
                            {investment.status || 'Active'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-amber-300 font-mono font-bold">
                          {formatCurrency(investment.totalIncomeGenerated)}
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 font-mono text-xs">
                          {investment.createdAt ? new Date(investment.createdAt).toLocaleDateString() : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {(!userInvestments.investments || userInvestments.investments.length === 0) && (
                <div className="text-center py-12">
                  <Layers className="w-10 h-10 text-sky-400/40 mx-auto mb-2" />
                  <p className="text-slate-400 text-sm font-medium">No investments found.</p>
                  <button
                    onClick={() => setActiveTab('packages')}
                    className="mt-4 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold text-xs uppercase cursor-pointer"
                  >
                    Explore Packages
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Investment Modal */}
      {selectedPackage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="neon-glow-card p-6 w-full max-w-md border border-sky-400/50 shadow-2xl rounded-3xl">
            <h3 className="text-lg font-black gold-metallic-text uppercase tracking-wide mb-4">
              {selectedPackage.type === 'TRADING' ? 'Trading Investment Slabs' : 'Fixed Staking Deposit'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                  Investment Amount (USD)
                </label>
                <input
                  type="number"
                  value={investmentForm.amount}
                  onChange={(e) => setInvestmentForm({ ...investmentForm, amount: e.target.value })}
                  className="w-full bg-[#060e1e] border border-sky-500/40 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                  placeholder="Enter amount (min $50)"
                  min="10"
                />
              </div>

              {selectedPackage.type === 'TRADING' && (
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                    Applied ROI (%)
                  </label>
                  <input
                    type="number"
                    value={investmentForm.appliedROI}
                    onChange={(e) => setInvestmentForm({ ...investmentForm, appliedROI: e.target.value })}
                    className="w-full bg-[#060e1e] border border-sky-500/40 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                    placeholder={`${selectedPackage.data?.minROI || 1.0} - ${selectedPackage.data?.maxROI || 2.0}`}
                    min={selectedPackage.data?.minROI}
                    max={selectedPackage.data?.maxROI}
                    step="0.1"
                  />
                </div>
              )}

              {selectedPackage.type === 'STAKING' && (
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1.5">
                    Lock Period
                  </label>
                  <input
                    type="number"
                    value={selectedPackage.data?.lockDays || 90}
                    readOnly
                    className="w-full bg-[#060e1e]/60 border border-sky-500/30 text-slate-400 rounded-xl px-4 py-2.5 text-sm"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setSelectedPackage(null)}
                className="flex-1 py-2.5 px-4 bg-slate-800 text-slate-300 rounded-xl font-bold text-xs uppercase hover:bg-slate-700 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleInvestment(selectedPackage.type)}
                className="flex-1 py-2.5 px-4 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 rounded-xl font-black text-xs uppercase hover:from-amber-400 hover:to-yellow-300 shadow-[0_0_15px_rgba(245,158,11,0.4)] transition cursor-pointer"
              >
                Confirm Deposit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestmentPackages;