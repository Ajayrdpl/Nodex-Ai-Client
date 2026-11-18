import React, { useState, useEffect } from 'react';
import { Award, ShieldCheck, CheckCircle2, TrendingUp, History, Check, Clock, Inbox } from 'lucide-react';

const UserAwardRewards = () => {
  const [userProgress, setUserProgress] = useState({});
  const [awardHistory, setAwardHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Rank & Reward tiers data
  const awardTiers = [
    { rank: 'Dream Starter',   rewardAmount: 100,     teamTarget: 10000    },
    { rank: 'Rising Star',     rewardAmount: 300,     teamTarget: 30000    },
    { rank: 'Action Achiever', rewardAmount: 500,     teamTarget: 50000    },
    { rank: 'Vision Builder',  rewardAmount: 1000,    teamTarget: 100000   },
    { rank: 'Success Mentor',  rewardAmount: 2000,    teamTarget: 200000   },
    { rank: 'Growth Champion', rewardAmount: 5000,    teamTarget: 500000   },
    { rank: 'Power Director',  rewardAmount: 10000,   teamTarget: 1000000  },
    { rank: 'Elite Performer', rewardAmount: 50000,   teamTarget: 5000000  },
    { rank: 'Crown Legend',    rewardAmount: 100000,  teamTarget: 10000000 },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/user/award-history', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setUserProgress({
              teamBusiness: data.data.teamBusiness || 0
            });
            setAwardHistory(data.data.awardHistory || []);
          } else {
            setUserProgress({ teamBusiness: 0 });
            setAwardHistory([]);
          }
        } else {
          setUserProgress({ teamBusiness: 0 });
          setAwardHistory([]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setUserProgress({ teamBusiness: 0 });
        setAwardHistory([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="neon-glow-card p-8 flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-amber-300 font-mono font-bold text-sm">Loading Awards & Rewards...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-2 sm:p-4 md:p-6 space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header and Criteria Card */}
        <div className="neon-glow-card p-6 rounded-3xl border border-sky-400/40 shadow-[0_0_30px_rgba(14,165,233,0.22)]">
          <div className="flex items-center gap-4 mb-6 pb-4 border-b border-sky-500/20">
            <div className="gold-badge-icon w-12 h-12 flex items-center justify-center shadow-lg shrink-0">
              <Award className="w-6 h-6 text-slate-950 font-black" />
            </div>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-wide">
                <span className="gold-metallic-text">Awards & Rank Rewards</span>
              </h1>
              <p className="text-xs text-slate-300 font-semibold uppercase tracking-wider mt-0.5">
                Achieve team business milestones to unlock elite lifetime rank rewards
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-[#050c18] border border-sky-500/30 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-300 shrink-0">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-slate-400">Your Current Team Business:</span>
                  <div className="text-2xl font-black text-amber-300 font-mono drop-shadow-[0_0_10px_rgba(251,191,36,0.3)]">
                    ${(userProgress.teamBusiness || 0).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#050c18] border border-sky-500/30 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-sky-300 mb-1">Qualifying Rules</h3>
                  <ul className="text-xs text-slate-300 space-y-0.5">
                    <li>• Business volume is cumulative across direct & downline team</li>
                    <li>• Higher milestones unlock larger guaranteed cash reward bonuses</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Award Tiers Table */}
          <div className="overflow-x-auto rounded-2xl border border-sky-400/30 shadow-2xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-sky-500/30">
                  <th className="split-header-blue py-4 px-4 text-xs font-black uppercase tracking-wider text-white">#</th>
                  <th className="split-header-blue py-4 px-4 text-xs font-black uppercase tracking-wider text-white">Rank Title</th>
                  <th className="split-header-gold py-4 px-4 text-xs font-black uppercase tracking-wider text-slate-950">Reward Amount</th>
                  <th className="split-header-gold py-4 px-4 text-xs font-black uppercase tracking-wider text-slate-950">Team Business Target</th>
                  <th className="split-header-gold py-4 px-4 text-center text-xs font-black uppercase tracking-wider text-slate-950">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-950/40 bg-[#040914]/90 text-xs">
                {awardTiers.map((tier, index) => {
                  const current = userProgress.teamBusiness || 0;
                  const isAchieved = current >= tier.teamTarget;
                  const progress = Math.min((current / tier.teamTarget) * 100, 100);

                  return (
                    <tr key={index} className="hover:bg-sky-950/30 transition-colors">
                      <td className="py-4 px-4 font-mono font-bold text-slate-400">{index + 1}</td>
                      <td className="py-4 px-4">
                        <span className="font-bold text-white uppercase">{tier.rank}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-base font-black text-amber-300 font-mono drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]">
                          ${tier.rewardAmount.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-slate-200 font-mono font-semibold">
                          ${tier.teamTarget.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        {isAchieved ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-black uppercase tracking-wider">
                            <Check className="w-3.5 h-3.5" />
                            Achieved
                          </span>
                        ) : (
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-[10px] text-amber-300 font-mono font-bold">{progress.toFixed(1)}%</span>
                            <div className="w-20 bg-[#060e1e] border border-sky-500/30 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className="h-1.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-300"
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Award History Section */}
        <div className="neon-glow-card p-6 rounded-3xl border border-sky-400/40 shadow-[0_0_30px_rgba(14,165,233,0.22)]">
          <div className="flex items-center gap-4 mb-6 pb-4 border-b border-sky-500/20">
            <div className="gold-badge-icon w-10 h-10 flex items-center justify-center shrink-0">
              <History className="w-5 h-5 text-slate-950 font-black" />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-wide">
                <span className="gold-metallic-text">Award Payout History</span>
              </h2>
              <p className="text-xs text-slate-300 font-semibold uppercase tracking-wider mt-0.5">
                Your monthly and lifetime award bonus payment records
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-sky-400/30 shadow-2xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-sky-500/30">
                  <th className="split-header-blue py-4 px-4 text-xs font-black uppercase tracking-wider text-white">Date</th>
                  <th className="split-header-gold py-4 px-4 text-xs font-black uppercase tracking-wider text-slate-950">Amount ($)</th>
                  <th className="split-header-blue py-4 px-4 text-xs font-black uppercase tracking-wider text-white">Installment</th>
                  <th className="split-header-gold py-4 px-4 text-xs font-black uppercase tracking-wider text-slate-950">Total Reward</th>
                  <th className="split-header-gold py-4 px-4 text-xs font-black uppercase tracking-wider text-slate-950">Team Target</th>
                  <th className="split-header-gold py-4 px-4 text-center text-xs font-black uppercase tracking-wider text-slate-950">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-950/40 bg-[#040914]/90 text-xs">
                {awardHistory.length > 0 ? (
                  awardHistory.map((record) => (
                    <tr key={record.id} className="hover:bg-sky-950/30 transition-colors">
                      <td className="py-4 px-4 text-slate-300 font-mono">
                        {new Date(record.date).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-amber-300 font-mono font-black text-sm">
                          ${record.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-white font-mono">
                        {record.installment}/{record.totalInstallments}
                      </td>
                      <td className="py-4 px-4 text-amber-300 font-mono font-bold">
                        ${record.totalReward.toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-slate-300 font-mono">
                        ${record.teamTarget.toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${
                          record.status === 'Paid' 
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        }`}>
                          {record.status === 'Paid' ? <Check className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-400">
                      <Inbox className="w-8 h-8 mx-auto mb-2 text-slate-500" />
                      <span className="text-xs font-mono">No award payout history records found</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserAwardRewards;