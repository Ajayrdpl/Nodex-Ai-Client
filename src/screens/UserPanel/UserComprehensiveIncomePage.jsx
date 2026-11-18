// src/screens/UserPanel/UserComprehensiveIncomePage.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  Users,
  TrendingUp,
  Network,
  Award,
  Wallet,
  ArrowUpRight,
  RefreshCw,
  Copy,
  Check,
  Download,
  ShieldCheck,
  Zap,
  Repeat,
  DollarSign,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { UserService } from "../../api/services.api";
import { setLoading } from "../../redux/slices/loadingSlice";

const UserComprehensiveIncomePage = () => {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state?.toggleThemeSlice?.theme);

  const [activeTab, setActiveTab] = useState("incomes");
  const [incomeSubTab, setIncomeSubTab] = useState("referral");
  const [refreshing, setRefreshing] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // States for All Endpoints
  const [dashboardStats, setDashboardStats] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [incomeBalance, setIncomeBalance] = useState({ balance: 0, referralBalance: 0, roiBalance: 0 });
  const [investmentHistory, setInvestmentHistory] = useState([]);

  // 5 Incomes
  const [referralIncome, setReferralIncome] = useState({ history: [], total: 0 });
  const [roiIncome, setRoiIncome] = useState({ history: [], total: 0, today: 0 });
  const [levelIncome, setLevelIncome] = useState({ history: [], total: 0 });
  const [salaryRankStatus, setSalaryRankStatus] = useState(null);
  const [salaryTiers, setSalaryTiers] = useState([]);

  // 3-Matrix Team
  const [matrixTree, setMatrixTree] = useState(null);
  const [directPartners, setDirectPartners] = useState([]);
  const [teamDivision, setTeamDivision] = useState(null);

  // Withdrawals
  const [withdrawalEligibility, setWithdrawalEligibility] = useState(null);
  const [withdrawalHistory, setWithdrawalHistory] = useState([]);
  const [withdrawForm, setWithdrawForm] = useState({ amount: "", walletAddress: "", type: "USDT_TRC20" });
  const [reinvestAmount, setReinvestAmount] = useState("");

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Fetch all User API Data
  const loadAllUserData = useCallback(async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else dispatch(setLoading(true));

      const [
        statsRes,
        profileRes,
        balanceRes,
        investRes,
        refRes,
        roiRes,
        lvlRes,
        rankRes,
        tiersRes,
        treeRes,
        partnersRes,
        divRes,
        eligibilityRes,
        withHistoryRes,
      ] = await Promise.allSettled([
        UserService.getDashboardStats(),
        UserService.getProfile(),
        UserService.getIncomeBalance(),
        UserService.getInvestmentHistory(),
        UserService.getReferralIncome(),
        UserService.getDailyRoiIncome(),
        UserService.getLevelIncome(),
        UserService.getSalaryRankStatus(),
        UserService.getAllSalaryTiers(),
        UserService.get3MatrixTree(),
        UserService.getDirectPartners(),
        UserService.getTeamDivision(),
        UserService.getWithdrawalEligibility(),
        UserService.getWithdrawalHistory(),
      ]);

      if (statsRes.status === "fulfilled") setDashboardStats(statsRes.value?.data || statsRes.value);
      if (profileRes.status === "fulfilled") setProfileData(profileRes.value?.data || profileRes.value);
      if (balanceRes.status === "fulfilled") setIncomeBalance(balanceRes.value?.data || balanceRes.value || {});
      if (investRes.status === "fulfilled") setInvestmentHistory(investRes.value?.data?.history || investRes.value?.data || []);
      
      // Incomes
      if (refRes.status === "fulfilled") {
        const d = refRes.value?.data || refRes.value || {};
        setReferralIncome({
          history: Array.isArray(d?.history) ? d.history : Array.isArray(d) ? d : [],
          total: d?.totalReferralIncome || d?.total || 0,
        });
      }
      if (roiRes.status === "fulfilled") {
        const d = roiRes.value?.data || roiRes.value || {};
        const rawHistory = Array.isArray(roiRes.value?.data)
          ? roiRes.value.data
          : Array.isArray(d?.history)
          ? d.history
          : Array.isArray(d)
          ? d
          : [];
        const calculatedEarned = rawHistory.reduce((sum, item) => sum + Number(item?.income || 0), 0);
        setRoiIncome({
          history: rawHistory,
          total: Number(roiRes.value?.summary?.totalEarned ?? d?.totalRoiIncome ?? d?.total ?? calculatedEarned),
          today: Number(d?.todayRoiIncome ?? 0),
        });
      }
      if (lvlRes.status === "fulfilled") {
        const d = lvlRes.value?.data || lvlRes.value || {};
        setLevelIncome({
          history: Array.isArray(d?.history) ? d.history : Array.isArray(d) ? d : [],
          total: d?.totalLevelIncome || d?.total || 0,
        });
      }
      if (rankRes.status === "fulfilled") setSalaryRankStatus(rankRes.value?.data || rankRes.value);
      if (tiersRes.status === "fulfilled") setSalaryTiers(tiersRes.value?.data?.tiers || tiersRes.value?.data || []);

      // 3-Matrix
      if (treeRes.status === "fulfilled") setMatrixTree(treeRes.value?.data || treeRes.value);
      if (partnersRes.status === "fulfilled") {
        const pd = partnersRes.value?.data || partnersRes.value || {};
        let pList = [];
        if (Array.isArray(pd)) {
          pList = pd;
        } else if (Array.isArray(pd?.partners)) {
          pList = pd.partners;
        } else if (Array.isArray(pd?.data)) {
          pList = pd.data;
        }
        setDirectPartners(pList);
      }
      if (divRes.status === "fulfilled") setTeamDivision(divRes.value?.data || divRes.value);

      // Withdrawals
      if (eligibilityRes.status === "fulfilled") setWithdrawalEligibility(eligibilityRes.value?.data || eligibilityRes.value);
      if (withHistoryRes.status === "fulfilled") {
        const d = withHistoryRes.value?.data || withHistoryRes.value || {};
        setWithdrawalHistory(Array.isArray(d?.history) ? d.history : Array.isArray(d) ? d : []);
      }

      if (isManual) toast.success("Data refreshed successfully!");
    } catch (err) {
      toast.error("Failed to load user portal data");
    } finally {
      if (isManual) setRefreshing(false);
      else dispatch(setLoading(false));
    }
  }, [dispatch]);

  useEffect(() => {
    loadAllUserData();
  }, [loadAllUserData]);

  // Reinvest handler
  const handleReinvest = async (e) => {
    e.preventDefault();
    if (!reinvestAmount || Number(reinvestAmount) <= 0) {
      toast.warning("Please enter a valid reinvestment amount");
      return;
    }
    try {
      const res = await UserService.reinvest(Number(reinvestAmount));
      if (res?.success || String(res?.message || "").toLowerCase().includes("success")) {
        toast.success(res?.message || "Reinvestment successful!");
        setReinvestAmount("");
        loadAllUserData(true);
      } else {
        toast.error(res?.message || "Reinvestment failed");
      }
    } catch (err) {
      toast.error(err.message || "Reinvestment error");
    }
  };

  // Withdrawal Request Handler
  const handleWithdrawalRequest = async (e) => {
    e.preventDefault();
    if (!withdrawForm.amount || Number(withdrawForm.amount) <= 0) {
      toast.warning("Please enter a valid amount");
      return;
    }
    if (!withdrawForm.walletAddress) {
      toast.warning("Please enter your wallet address");
      return;
    }
    try {
      const res = await UserService.requestWithdrawal(withdrawForm);
      if (res?.success || String(res?.message || "").toLowerCase().includes("success")) {
        toast.success(res?.message || "Withdrawal requested successfully!");
        setWithdrawForm({ amount: "", walletAddress: "", type: "USDT_TRC20" });
        loadAllUserData(true);
      } else {
        toast.error(res?.message || "Withdrawal request failed");
      }
    } catch (err) {
      toast.error(err.message || "Withdrawal error");
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* 🚀 Top Banner & Global Stats */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-3xl border border-slate-800 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-white">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">NODEXAI</span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-1">
            Welcome, {profileData?.user?.username || profileData?.username || "Investor"}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Ref ID: <span className="font-mono text-indigo-300">{profileData?.user?.userId || profileData?.userId || "—"}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-slate-800/80 px-4 py-2.5 rounded-2xl border border-slate-700">
            <span className="text-xs text-slate-400 block uppercase">Income Balance</span>
            <span className="text-xl font-black text-emerald-400">
              ${Number(incomeBalance?.balance || incomeBalance?.totalBalance || 0).toFixed(2)}
            </span>
          </div>

          <button
            onClick={() => loadAllUserData(true)}
            disabled={refreshing}
            className="p-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-2xl transition flex items-center gap-2 font-medium text-sm shadow-lg shadow-indigo-600/20"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            Sync Data
          </button>
        </div>
      </div>

      {/* 🧭 Main Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
        {[
          { key: "incomes", label: "5 Incomes Center", icon: TrendingUp },
          { key: "team", label: "3-Matrix Team", icon: Network },
          { key: "invest", label: "Investment & Reinvest", icon: Repeat },
          { key: "withdraw", label: "Withdrawal Hub", icon: Wallet },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 py-3 px-5 rounded-2xl text-sm font-bold transition-all ${
                isActive
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                  : "bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800/60"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TAB 1: 5 INCOMES CENTER
      ───────────────────────────────────────────────────────────── */}
      {activeTab === "incomes" && (
        <div className="space-y-6">
          {/* Sub-tabs for 5 Incomes */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800">
            {[
              { id: "referral", label: "Referral Income", icon: Users, color: "text-blue-400" },
              { id: "roi", label: "Trading Daily ROI", icon: TrendingUp, color: "text-emerald-400" },
              { id: "level", label: "15-Level Income", icon: Network, color: "text-purple-400" },
              { id: "salary", label: "Salary & Rank", icon: Award, color: "text-rose-400" },
            ].map((st) => {
              const Icon = st.icon;
              const isSelected = incomeSubTab === st.id;
              return (
                <button
                  key={st.id}
                  onClick={() => setIncomeSubTab(st.id)}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition ${
                    isSelected ? "bg-slate-800 text-white border border-slate-700 shadow" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${st.color}`} />
                  <span>{st.label}</span>
                </button>
              );
            })}
          </div>

          {/* Sub 1: Referral Income */}
          {incomeSubTab === "referral" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <StatBox title="Total Referral Income" value={`$${Number(referralIncome.total || 0).toFixed(2)}`} icon={Users} color="text-blue-400" />
                <StatBox title="Direct Sponsors Count" value={directPartners.length} icon={Users} color="text-indigo-400" />
              </div>
              <TableRenderer
                title="Direct Referral Income History"
                data={referralIncome.history}
                columns={["S/N", "From User", "Package Amount", "Direct Income ($)", "Date"]}
                renderRow={(item, idx) => (
                  <tr key={item._id || idx} className="border-b border-slate-800 text-sm hover:bg-slate-800/30">
                    <td className="p-3.5 text-slate-400">{idx + 1}</td>
                    <td className="p-3.5 text-white font-medium">{item?.fromUser?.username || item?.fromUser || "Direct Partner"}</td>
                    <td className="p-3.5 text-slate-300">${Number(item?.amount || item?.investmentAmount || 0).toFixed(2)}</td>
                    <td className="p-3.5 text-emerald-400 font-bold">+${Number(item?.income || item?.amount || 0).toFixed(2)}</td>
                    <td className="p-3.5 text-slate-400 text-xs">{new Date(item?.createdAt || Date.now()).toLocaleDateString()}</td>
                  </tr>
                )}
              />
            </div>
          )}

          {/* Sub 2: Daily ROI */}
          {incomeSubTab === "roi" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <StatBox title="Total Trading ROI Earned" value={`$${Number(roiIncome.total || 0).toFixed(2)}`} icon={TrendingUp} color="text-emerald-400" />
                <StatBox title="Today's ROI Yield" value={`+$${Number(roiIncome.today || 0).toFixed(2)}`} icon={Zap} color="text-amber-400" />
              </div>
              <TableRenderer
                title="Daily Trading Yield History"
                data={roiIncome.history}
                columns={["S/N", "Package Base", "Daily Rate (%)", "Yield Credited ($)", "Date"]}
                renderRow={(item, idx) => (
                  <tr key={item._id || idx} className="border-b border-slate-800 text-sm hover:bg-slate-800/30">
                    <td className="p-3.5 text-slate-400">{idx + 1}</td>
                    <td className="p-3.5 text-slate-300">${Number(item?.investmentAmount || item?.packageAmount || 0).toFixed(2)}</td>
                    <td className="p-3.5 text-emerald-400 font-medium">{item?.roiPercent || "1.0"}%</td>
                    <td className="p-3.5 text-emerald-400 font-bold">+${Number(item?.amount || 0).toFixed(2)}</td>
                    <td className="p-3.5 text-slate-400 text-xs">{new Date(item?.createdAt || Date.now()).toLocaleDateString()}</td>
                  </tr>
                )}
              />
            </div>
          )}

          {/* Sub 3: Level Income */}
          {incomeSubTab === "level" && (
            <div className="space-y-4">
              <StatBox title="Total Generation Level Income" value={`$${Number(levelIncome.total || 0).toFixed(2)}`} icon={Network} color="text-purple-400" />
              <TableRenderer
                title="15-Level Generation Income History"
                data={levelIncome.history}
                columns={["S/N", "Generation Level", "From User", "Level Income ($)", "Date"]}
                renderRow={(item, idx) => (
                  <tr key={item._id || idx} className="border-b border-slate-800 text-sm hover:bg-slate-800/30">
                    <td className="p-3.5 text-slate-400">{idx + 1}</td>
                    <td className="p-3.5 font-bold text-purple-400">Level {item?.level || 1}</td>
                    <td className="p-3.5 text-white">{item?.fromUser?.username || item?.fromUser || "Team Member"}</td>
                    <td className="p-3.5 text-emerald-400 font-bold">+${Number(item?.amount || 0).toFixed(2)}</td>
                    <td className="p-3.5 text-slate-400 text-xs">{new Date(item?.createdAt || Date.now()).toLocaleDateString()}</td>
                  </tr>
                )}
              />
            </div>
          )}

          {/* Sub 4: Salary & Rank */}
          {incomeSubTab === "salary" && (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <span className="text-xs font-bold text-rose-400 uppercase">My Leadership Status</span>
                  <h3 className="text-2xl font-black text-white mt-1">
                    {salaryRankStatus?.currentRankName || "Star Leader"}
                  </h3>
                  <p className="text-slate-400 text-xs mt-1">
                    Weekly Reward: <span className="text-emerald-400 font-bold">${salaryRankStatus?.weeklySalary || 0}/week</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Active Qualified Leg Ratio</span>
                  <span className="text-sm font-mono text-indigo-300">50% Leg A • 30% Leg B • 20% Others</span>
                </div>
              </div>

              {/* Tiers List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {salaryTiers.map((tier) => (
                  <div key={tier.rank || tier.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                    <span className="text-xs font-bold text-amber-400">Rank #{tier.rank}</span>
                    <h4 className="text-white font-bold text-base mt-0.5">{tier.name || `Tier ${tier.rank}`}</h4>
                    <p className="text-emerald-400 font-extrabold text-lg mt-1">${tier.weeklySalary || tier.salary}/wk</p>
                    <div className="text-xs text-slate-400 mt-2 pt-2 border-t border-slate-800 flex justify-between">
                      <span>Target: ${Number(tier.targetVolume || 0).toLocaleString()}</span>
                      <span>{tier.durationWeeks || 15} Wks</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 2: 3-MATRIX TEAM & NETWORK
      ───────────────────────────────────────────────────────────── */}
      {activeTab === "team" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatBox title="Direct Partners" value={directPartners.length} icon={Users} color="text-blue-400" />
            <StatBox title="Leg A Volume (Main)" value={`$${Number(teamDivision?.legA || 0).toFixed(2)}`} icon={Network} color="text-indigo-400" />
            <StatBox title="Leg B & Other Volume" value={`$${Number((teamDivision?.legB || 0) + (teamDivision?.otherLegs || 0)).toFixed(2)}`} icon={Network} color="text-purple-400" />
          </div>

          <TableRenderer
            title="Direct Partners List"
            data={directPartners}
            columns={["S/N", "Partner Username", "Email", "Active Package", "Joining Date"]}
            renderRow={(item, idx) => (
              <tr key={item._id || idx} className="border-b border-slate-800 text-sm hover:bg-slate-800/30">
                <td className="p-3.5 text-slate-400">{idx + 1}</td>
                <td className="p-3.5 text-white font-semibold">{item.username || "Partner"}</td>
                <td className="p-3.5 text-slate-400">{item.email || "—"}</td>
                <td className="p-3.5 text-emerald-400 font-bold">${Number(item.activePackage || item.investment || 0).toFixed(2)}</td>
                <td className="p-3.5 text-slate-400 text-xs">{new Date(item.createdAt || Date.now()).toLocaleDateString()}</td>
              </tr>
            )}
          />
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 3: INVESTMENT & REINVEST
      ───────────────────────────────────────────────────────────── */}
      {activeTab === "invest" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Reinvestment Box */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl h-fit space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Repeat className="w-5 h-5 text-indigo-400" />
              Reinvest from Incomes
            </h3>
            <p className="text-xs text-slate-400">
              Available Balance: <strong className="text-emerald-400">${Number(incomeBalance?.balance || 0).toFixed(2)}</strong>
            </p>

            <form onSubmit={handleReinvest} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Reinvest Amount ($)</label>
                <input
                  type="number"
                  min="10"
                  step="any"
                  placeholder="Min $10.00"
                  value={reinvestAmount}
                  onChange={(e) => setReinvestAmount(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition shadow-lg shadow-indigo-600/20"
              >
                Confirm Reinvestment
              </button>
            </form>
          </div>

          {/* History */}
          <div className="lg:col-span-2">
            <TableRenderer
              title="Investment & Package Reports"
              data={investmentHistory}
              columns={["S/N", "Package", "Amount ($)", "Status", "Date"]}
              renderRow={(item, idx) => (
                <tr key={item._id || idx} className="border-b border-slate-800 text-sm hover:bg-slate-800/30">
                  <td className="p-3.5 text-slate-400">{idx + 1}</td>
                  <td className="p-3.5 text-white font-medium">{item.packageName || "Trading Package"}</td>
                  <td className="p-3.5 text-emerald-400 font-bold">${Number(item.amount || 0).toFixed(2)}</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/20 text-emerald-400">Active</span>
                  </td>
                  <td className="p-3.5 text-slate-400 text-xs">{new Date(item.createdAt || Date.now()).toLocaleDateString()}</td>
                </tr>
              )}
            />
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 4: WITHDRAWAL HUB
      ───────────────────────────────────────────────────────────── */}
      {activeTab === "withdraw" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Request Form */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl h-fit space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Wallet className="w-5 h-5 text-emerald-400" />
              Request Withdrawal
            </h3>

            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Eligibility:</span>
                <span className={withdrawalEligibility?.isEligible ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
                  {withdrawalEligibility?.isEligible ? "Qualified" : "Check Criteria"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Available:</span>
                <span className="text-white font-bold">${Number(incomeBalance?.balance || 0).toFixed(2)}</span>
              </div>
            </div>

            <form onSubmit={handleWithdrawalRequest} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Withdrawal Amount ($)</label>
                <input
                  type="number"
                  min="10"
                  step="any"
                  placeholder="Min $10.00"
                  value={withdrawForm.amount}
                  onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">USDT TRC20 Wallet Address</label>
                <input
                  type="text"
                  placeholder="T..."
                  value={withdrawForm.walletAddress}
                  onChange={(e) => setWithdrawForm({ ...withdrawForm, walletAddress: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm outline-none font-mono focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition shadow-lg shadow-emerald-600/20"
              >
                Submit Withdrawal
              </button>
            </form>
          </div>

          {/* History */}
          <div className="lg:col-span-2">
            <TableRenderer
              title="Withdrawal Transaction History"
              data={withdrawalHistory}
              columns={["S/N", "Amount ($)", "Address", "Status", "Date"]}
              renderRow={(item, idx) => (
                <tr key={item._id || idx} className="border-b border-slate-800 text-sm hover:bg-slate-800/30">
                  <td className="p-3.5 text-slate-400">{idx + 1}</td>
                  <td className="p-3.5 text-emerald-400 font-bold">${Number(item.amount || 0).toFixed(2)}</td>
                  <td className="p-3.5 text-slate-400 font-mono text-xs truncate max-w-[150px]">{item.walletAddress || item.address || "—"}</td>
                  <td className="p-3.5">
                    <span
                      className={`px-2.5 py-0.5 rounded text-xs font-semibold ${
                        item.status === "Approved"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : item.status === "Pending"
                          ? "bg-amber-500/20 text-amber-400"
                          : "bg-rose-500/20 text-rose-400"
                      }`}
                    >
                      {item.status || "Pending"}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-400 text-xs">{new Date(item.createdAt || Date.now()).toLocaleDateString()}</td>
                </tr>
              )}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Reusable Helper Components
const StatBox = ({ title, value, icon: Icon, color = "text-white" }) => (
  <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
    <div>
      <span className="text-xs text-slate-400 uppercase tracking-wider block font-semibold">{title}</span>
      <h3 className={`text-2xl font-extrabold mt-1 ${color}`}>{value}</h3>
    </div>
    <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/60">
      <Icon className={`w-6 h-6 ${color}`} />
    </div>
  </div>
);

const TableRenderer = ({ title, data = [], columns = [], renderRow }) => (
  <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
    <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/90">
      <h3 className="font-bold text-white text-base">{title}</h3>
      <span className="text-xs text-slate-400">Total: {data.length} records</span>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-800/60 text-slate-400 uppercase text-xs">
            {columns.map((col, i) => (
              <th key={i} className="p-3.5 font-semibold">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((item, idx) => renderRow(item, idx))
          ) : (
            <tr>
              <td colSpan={columns.length} className="text-center py-12 text-slate-500 text-sm">
                No transaction records available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

export default UserComprehensiveIncomePage;
