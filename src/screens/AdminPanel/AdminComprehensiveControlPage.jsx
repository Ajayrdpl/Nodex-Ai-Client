// src/screens/AdminPanel/AdminComprehensiveControlPage.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import {
  Users,
  DollarSign,
  PlayCircle,
  CheckCircle,
  XCircle,
  Lock,
  Unlock,
  ShieldAlert,
  RefreshCw,
  Search,
  Wallet,
  TrendingUp,
  Award,
  Network,
  PlusCircle,
  FileText,
  Eye,
} from "lucide-react";
import { AdminService } from "../../api/services.api";
import { setLoading } from "../../redux/slices/loadingSlice";

const AdminComprehensiveControlPage = () => {
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoadingState] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // States
  const [dashboardStats, setDashboardStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Incomes & Funds
  const [allReferralIncomes, setAllReferralIncomes] = useState([]);
  const [allLevelIncomes, setAllLevelIncomes] = useState([]);
  const [allTradingIncomes, setAllTradingIncomes] = useState([]);
  const [salaryHistory, setSalaryHistory] = useState([]);
  const [fundHistory, setFundHistory] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [transactions, setTransactions] = useState([]);

  // Fund Add Form
  const [fundForm, setFundForm] = useState({ userId: "", amount: "", remark: "" });

  // Load Admin Data
  const loadAdminDashboardData = useCallback(async () => {
    try {
      setLoadingState(true);
      const [
        statsRes,
        usersRes,
        refRes,
        lvlRes,
        roiRes,
        salaryRes,
        fundRes,
        withRes,
        txRes,
      ] = await Promise.allSettled([
        AdminService.getDashboardStats(),
        AdminService.getAllUsers(),
        AdminService.getAllReferralIncome(),
        AdminService.getAllLevelIncome(),
        AdminService.getAllTradingIncome(),
        AdminService.getSalaryHistory(),
        AdminService.getFundHistory(),
        AdminService.getWithdrawals(),
        AdminService.getAllTransactions(),
      ]);

      if (statsRes.status === "fulfilled") setDashboardStats(statsRes.value?.data || statsRes.value);
      if (usersRes.status === "fulfilled") {
        const u = usersRes.value?.data || usersRes.value || {};
        setUsersList(Array.isArray(u?.users) ? u.users : Array.isArray(u) ? u : []);
      }
      if (refRes.status === "fulfilled") {
        const r = refRes.value?.data || refRes.value || {};
        setAllReferralIncomes(Array.isArray(r?.history) ? r.history : Array.isArray(r) ? r : []);
      }
      if (lvlRes.status === "fulfilled") {
        const l = lvlRes.value?.data || lvlRes.value || {};
        setAllLevelIncomes(Array.isArray(l?.history) ? l.history : Array.isArray(l) ? l : []);
      }
      if (roiRes.status === "fulfilled") {
        const ro = roiRes.value?.data || roiRes.value || {};
        setAllTradingIncomes(Array.isArray(ro?.history) ? ro.history : Array.isArray(ro) ? ro : []);
      }
      if (salaryRes.status === "fulfilled") {
        const s = salaryRes.value?.data || salaryRes.value || {};
        setSalaryHistory(Array.isArray(s?.history) ? s.history : Array.isArray(s) ? s : []);
      }
      if (fundRes.status === "fulfilled") {
        const f = fundRes.value?.data || fundRes.value || {};
        setFundHistory(Array.isArray(f?.history) ? f.history : Array.isArray(f) ? f : []);
      }
      if (withRes.status === "fulfilled") {
        const w = withRes.value?.data || withRes.value || {};
        setWithdrawals(Array.isArray(w?.history) ? w.history : Array.isArray(w) ? w : []);
      }
      if (txRes.status === "fulfilled") {
        const t = txRes.value?.data || txRes.value || {};
        setTransactions(Array.isArray(t?.transactions) ? t.transactions : Array.isArray(t) ? t : []);
      }
    } catch (err) {
      toast.error("Failed to load admin controls data");
    } finally {
      setLoadingState(false);
    }
  }, []);

  useEffect(() => {
    loadAdminDashboardData();
  }, [loadAdminDashboardData]);

  // 1. Toggle User Block
  const handleToggleBlock = async (id) => {
    try {
      const res = await AdminService.toggleUserBlock(id);
      if (res?.success || String(res?.message || "").toLowerCase().includes("success")) {
        toast.success(res?.message || "User block status updated");
        loadAdminDashboardData();
      } else {
        toast.error(res?.message || "Action failed");
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  // 2. Toggle ROI Block
  const handleToggleRoi = async (id) => {
    try {
      const res = await AdminService.toggleRoiBlock(id);
      if (res?.success || String(res?.message || "").toLowerCase().includes("success")) {
        toast.success(res?.message || "User ROI block status updated");
        loadAdminDashboardData();
      } else {
        toast.error(res?.message || "Action failed");
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  // 3. View User Details
  const handleViewUser = async (userId) => {
    try {
      const res = await AdminService.getUserDetails(userId);
      if (res?.success || res?.user) {
        setSelectedUser(res?.data?.user || res?.user || res?.data);
        setIsDetailModalOpen(true);
      } else {
        toast.error("Could not fetch user details");
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  // 4. Trigger Daily ROI Cron
  const handleTriggerRoi = async () => {
    if (!window.confirm("Distribute daily ROI yield to all qualified users now?")) return;
    try {
      toast.info("Executing Daily ROI Cron...");
      const res = await AdminService.triggerDailyRoi();
      if (res?.success || res?.message?.toLowerCase().includes("success")) {
        toast.success(res?.message || "Daily ROI distributed successfully!");
        loadAdminDashboardData();
      } else {
        toast.error(res?.message || "Failed to trigger ROI");
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  // 5. Trigger Weekly Salary Cron
  const handleTriggerSalary = async () => {
    if (!window.confirm("Distribute weekly salary to all ranked leaders now?")) return;
    try {
      toast.info("Executing Weekly Salary Distribution...");
      const res = await AdminService.triggerWeeklySalary();
      if (res?.success || res?.message?.toLowerCase().includes("success")) {
        toast.success(res?.message || "Weekly Salary distributed successfully!");
        loadAdminDashboardData();
      } else {
        toast.error(res?.message || "Failed to trigger Weekly Salary");
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  // 6. Add Fund to User
  const handleAddFundSubmit = async (e) => {
    e.preventDefault();
    if (!fundForm.userId || !fundForm.amount) {
      toast.warning("Please fill all required fields");
      return;
    }
    try {
      const res = await AdminService.fundAdd(fundForm);
      if (res?.success || res?.message?.toLowerCase().includes("success")) {
        toast.success(res?.message || "Fund added successfully!");
        setFundForm({ userId: "", amount: "", remark: "" });
        loadAdminDashboardData();
      } else {
        toast.error(res?.message || "Failed to add fund");
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  // 7. Approve Withdrawal
  const handleApproveWithdrawal = async (txId) => {
    try {
      const res = await AdminService.approveWithdrawal({ transactionId: txId, status: "Approved" });
      if (res?.success || res?.message?.toLowerCase().includes("success")) {
        toast.success("Withdrawal approved!");
        loadAdminDashboardData();
      } else {
        toast.error(res?.message || "Failed to approve");
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const filteredUsers = usersList.filter(
    (u) =>
      u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.userId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* 👑 Top Action Bar & Cron Triggers */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 rounded-3xl shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-white">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">Admin Control Center</span>
          <h1 className="text-2xl md:text-3xl font-black mt-1">Management & Income Trigger Hub</h1>
          <p className="text-slate-400 text-sm mt-1">Control user accounts, trigger income crons, and manage platform cash flow.</p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={handleTriggerRoi}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition"
          >
            <PlayCircle className="w-4 h-4" /> Trigger Daily ROI
          </button>
          <button
            onClick={handleTriggerSalary}
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg shadow-amber-600/20 transition"
          >
            <PlayCircle className="w-4 h-4" /> Trigger Weekly Salary
          </button>
          <button
            onClick={loadAdminDashboardData}
            disabled={loading}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* 🧭 Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
        {[
          { key: "dashboard", label: "Overview", icon: TrendingUp },
          { key: "users", label: `Users (${usersList.length})`, icon: Users },
          { key: "incomes", label: "Income Reports", icon: DollarSign },
          { key: "funds", label: "Fund Management", icon: PlusCircle },
          { key: "withdrawals", label: `Withdrawals (${withdrawals.length})`, icon: Wallet },
          { key: "transactions", label: "All Transactions", icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition ${
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
          TAB 1: DASHBOARD OVERVIEW
      ───────────────────────────────────────────────────────────── */}
      {activeTab === "dashboard" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatBox title="Total Users" value={dashboardStats?.totalUsers || usersList.length} icon={Users} color="text-blue-400" />
          <StatBox title="Total Platform Volume" value={`$${Number(dashboardStats?.totalInvestments || 0).toLocaleString()}`} icon={DollarSign} color="text-emerald-400" />
          <StatBox title="Pending Withdrawals" value={withdrawals.filter((w) => w.status === "Pending").length} icon={Wallet} color="text-amber-400" />
          <StatBox title="Distributed Incomes" value={`$${Number(dashboardStats?.totalDistributedIncome || 0).toLocaleString()}`} icon={Award} color="text-purple-400" />
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 2: USER MANAGEMENT
      ───────────────────────────────────────────────────────────── */}
      {activeTab === "users" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-2 rounded-xl max-w-sm">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search user, email or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none text-white text-sm w-full"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-800/60 text-slate-400 uppercase text-xs">
                  <th className="p-3.5">User</th>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5">Active Package</th>
                  <th className="p-3.5">ROI Status</th>
                  <th className="p-3.5">Account Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u._id || u.id} className="border-b border-slate-800 hover:bg-slate-800/30">
                    <td className="p-3.5 font-semibold text-white">{u.username}</td>
                    <td className="p-3.5 text-slate-400">{u.email}</td>
                    <td className="p-3.5 text-emerald-400 font-bold">${Number(u.activePackage || u.investment || 0).toFixed(2)}</td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${u.isRoiBlocked ? "bg-rose-500/20 text-rose-400" : "bg-emerald-500/20 text-emerald-400"}`}>
                        {u.isRoiBlocked ? "ROI Blocked" : "ROI Active"}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${u.isBlocked ? "bg-rose-500/20 text-rose-400" : "bg-emerald-500/20 text-emerald-400"}`}>
                        {u.isBlocked ? "Account Blocked" : "Active"}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => handleViewUser(u._id || u.id)}
                        className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-medium"
                      >
                        <Eye className="w-3.5 h-3.5 inline mr-1" /> View
                      </button>
                      <button
                        onClick={() => handleToggleRoi(u._id || u.id)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs"
                      >
                        {u.isRoiBlocked ? "Unblock ROI" : "Block ROI"}
                      </button>
                      <button
                        onClick={() => handleToggleBlock(u._id || u.id)}
                        className={`px-2.5 py-1 rounded text-xs font-semibold ${u.isBlocked ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"}`}
                      >
                        {u.isBlocked ? "Unblock" : "Block"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 3: ALL INCOMES MANAGEMENT
      ───────────────────────────────────────────────────────────── */}
      {activeTab === "incomes" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatBox title="Referral Records" value={allReferralIncomes.length} icon={Users} color="text-blue-400" />
            <StatBox title="Level Records" value={allLevelIncomes.length} icon={Network} color="text-purple-400" />
            <StatBox title="Trading ROI Records" value={allTradingIncomes.length} icon={TrendingUp} color="text-emerald-400" />
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 font-bold text-white">Platform Referral & Level Income Records</div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-800/60 text-slate-400 uppercase text-xs">
                    <th className="p-3.5">User</th>
                    <th className="p-3.5">From User</th>
                    <th className="p-3.5">Income Amount</th>
                    <th className="p-3.5">Type</th>
                    <th className="p-3.5">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {allReferralIncomes.slice(0, 15).map((item, idx) => (
                    <tr key={idx} className="border-b border-slate-800 text-sm">
                      <td className="p-3.5 text-white font-medium">{item?.toUser?.username || item?.username || "Investor"}</td>
                      <td className="p-3.5 text-slate-400">{item?.fromUser?.username || item?.fromUser || "—"}</td>
                      <td className="p-3.5 text-emerald-400 font-bold">+${Number(item?.amount || item?.income || 0).toFixed(2)}</td>
                      <td className="p-3.5 text-indigo-400 font-medium">{item?.type || "Direct Referral"}</td>
                      <td className="p-3.5 text-slate-400 text-xs">{new Date(item?.createdAt || Date.now()).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 4: FUND MANAGEMENT
      ───────────────────────────────────────────────────────────── */}
      {activeTab === "funds" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl h-fit space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-indigo-400" />
              Add Fund to User
            </h3>
            <form onSubmit={handleAddFundSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">User ID / Username</label>
                <input
                  type="text"
                  placeholder="Enter username or ID"
                  value={fundForm.userId}
                  onChange={(e) => setFundForm({ ...fundForm, userId: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Fund Amount ($)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={fundForm.amount}
                  onChange={(e) => setFundForm({ ...fundForm, amount: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Remark</label>
                <input
                  type="text"
                  placeholder="Admin credit remark"
                  value={fundForm.remark}
                  onChange={(e) => setFundForm({ ...fundForm, remark: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition shadow-lg shadow-indigo-600/20"
              >
                Transfer Fund
              </button>
            </form>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-slate-800 font-bold text-white">Fund Transfer History</div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-slate-800/60 text-slate-400 uppercase text-xs">
                      <th className="p-3.5">User</th>
                      <th className="p-3.5">Amount</th>
                      <th className="p-3.5">Remark</th>
                      <th className="p-3.5">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fundHistory.map((f, idx) => (
                      <tr key={idx} className="border-b border-slate-800">
                        <td className="p-3.5 text-white">{f?.user?.username || f?.username || "User"}</td>
                        <td className="p-3.5 text-emerald-400 font-bold">+${Number(f.amount || 0).toFixed(2)}</td>
                        <td className="p-3.5 text-slate-400">{f.remark || "Admin Credit"}</td>
                        <td className="p-3.5 text-slate-400 text-xs">{new Date(f.createdAt || Date.now()).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 5: WITHDRAWAL APPROVALS
      ───────────────────────────────────────────────────────────── */}
      {activeTab === "withdrawals" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 font-bold text-white">Platform Withdrawal Requests</div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-800/60 text-slate-400 uppercase text-xs">
                  <th className="p-3.5">User</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5">Wallet Address</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((w, idx) => (
                  <tr key={w._id || idx} className="border-b border-slate-800 hover:bg-slate-800/30">
                    <td className="p-3.5 text-white font-medium">{w?.user?.username || w?.username || "Investor"}</td>
                    <td className="p-3.5 text-emerald-400 font-bold">${Number(w.amount || 0).toFixed(2)}</td>
                    <td className="p-3.5 text-slate-400 font-mono text-xs truncate max-w-[150px]">{w.walletAddress || w.address || "—"}</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                          w.status === "Approved"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : w.status === "Pending"
                            ? "bg-amber-500/20 text-amber-400"
                            : "bg-rose-500/20 text-rose-400"
                        }`}
                      >
                        {w.status || "Pending"}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      {w.status === "Pending" && (
                        <button
                          onClick={() => handleApproveWithdrawal(w._id)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold shadow transition"
                        >
                          Approve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 6: ALL TRANSACTIONS
      ───────────────────────────────────────────────────────────── */}
      {activeTab === "transactions" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 font-bold text-white">Global Ledger & Transactions</div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-800/60 text-slate-400 uppercase text-xs">
                  <th className="p-3.5">User</th>
                  <th className="p-3.5">Tx Type</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, idx) => (
                  <tr key={tx._id || idx} className="border-b border-slate-800">
                    <td className="p-3.5 text-white">{tx?.user?.username || tx?.username || "User"}</td>
                    <td className="p-3.5 text-indigo-400 font-medium">{tx.type || "Transaction"}</td>
                    <td className="p-3.5 text-emerald-400 font-bold">${Number(tx.amount || 0).toFixed(2)}</td>
                    <td className="p-3.5 text-slate-400 text-xs">{tx.status || "Completed"}</td>
                    <td className="p-3.5 text-slate-400 text-xs">{new Date(tx.createdAt || Date.now()).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 🔍 User Detail Modal */}
      {isDetailModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 text-white">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-lg">User Profile & Package Details</h3>
              <button onClick={() => setIsDetailModalOpen(false)} className="text-slate-400 hover:text-white text-sm">✕</button>
            </div>
            <div className="space-y-2 text-sm">
              <p><span className="text-slate-400">Username:</span> <strong className="text-white">{selectedUser.username}</strong></p>
              <p><span className="text-slate-400">Email:</span> {selectedUser.email}</p>
              <p><span className="text-slate-400">User ID:</span> {selectedUser.userId || selectedUser._id}</p>
              <p><span className="text-slate-400">Active Investment:</span> <span className="text-emerald-400 font-bold">${Number(selectedUser.activePackage || selectedUser.investment || 0).toFixed(2)}</span></p>
              <p><span className="text-slate-400">Total Income:</span> <span className="text-indigo-400 font-bold">${Number(selectedUser.totalIncome || 0).toFixed(2)}</span></p>
            </div>
            <button
              onClick={() => setIsDetailModalOpen(false)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-semibold mt-4"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const StatBox = ({ title, value, icon: Icon, color = "text-white" }) => (
  <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-lg">
    <div>
      <span className="text-xs text-slate-400 uppercase tracking-wider block font-semibold">{title}</span>
      <h3 className={`text-2xl font-extrabold mt-1 ${color}`}>{value}</h3>
    </div>
    <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/60">
      <Icon className={`w-6 h-6 ${color}`} />
    </div>
  </div>
);

export default AdminComprehensiveControlPage;
