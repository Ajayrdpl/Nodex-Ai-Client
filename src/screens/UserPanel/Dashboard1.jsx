import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  TrendingUp,
  ShieldCheck,
  Zap,
  Copy,
  Check,
  Users,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Flame,
  Award,
  Crown,
  Share2,
  Activity,
  DollarSign,
  Layers,
  BarChart3,
  UserCheck,
  Globe,
  Sparkles,
  Target,
  Clock,
  Briefcase,
  CheckCircle2,
  Lock,
  Headphones,
} from "lucide-react";
import { toast } from "react-toastify";

import StatCard from "../../components/Screen/UserPanel/StatCard";
import { getIncomeTotal, getTransactionHistory } from "../../api/auth.api";
import {
  getIncomeSummaryApi,
  getAvailableIncomeBalance,
  getLevelInfoApi,
  getSalaryHistoryApi,
  getMySalaryRankApi,
} from "../../api/user.api";
import { setLoading } from "../../redux/slices/loadingSlice";
import {
  getIncomeTotalForAdminIncome,
  getTransactionHistoryForAdmin,
} from "../../api/admin.api";
import {
  AuthenticatedAdminRouters,
  AuthenticatedUserRouters,
} from "../../constants/routes";
import { maskWalletAddress } from "../../utils/additionalFunc";
import {
  LiveMarketTickerMarquee,
  INITIAL_COINS_LIST,
} from "../../components/Screen/UserPanel/LiveTradingHeroSlider";
import DashboardTradingTerminal from "../../components/Screen/UserPanel/DashboardTradingTerminal";
import { MainContent } from "../../constants/mainContent";

const Dashboard1 = () => {
  const [transactionHistory, setTransactionHistory] = useState(null);
  const [totalIncome, setTotalIncome] = useState(null);
  const [incomeSummary, setIncomeSummary] = useState(null);
  const [dashboardUser, setDashboardUser] = useState(null);
  const [salaryRankData, setSalaryRankData] = useState(null);
  const [levelInfo, setLevelInfo] = useState(null);
  const [salaryData, setSalaryData] = useState(null);
  const [balanceData, setBalanceData] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [selectedTradingCoin, setSelectedTradingCoin] = useState(INITIAL_COINS_LIST[0]);

  const handleSelectTradingCoin = (coin) => {
    setSelectedTradingCoin(coin);
    const elem = document.getElementById("live-trading-terminal-section");
    if (elem) {
      elem.scrollIntoView({ behavior: "smooth" });
    }
  };

  const role = useSelector((state) => state?.isLoggedUser?.role);
  const userInfo = useSelector((state) => state?.isLoggedUser?.data);
  const access = localStorage.getItem("access");

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Fetch Transaction History
  const fetchTransactionHistory = async () => {
    try {
      dispatch(setLoading(true));
      if (role === "USER") {
        const response = await getTransactionHistory();
        setTransactionHistory(response?.data);
      } else if (role === "ADMIN") {
        const response = await getTransactionHistoryForAdmin();
        setTransactionHistory(response?.data);
      }
    } catch (err) {
      console.error("Transaction history error:", err);
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    fetchTransactionHistory();
  }, [role]);

  // Fetch Dashboard Stats & Incomes
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        dispatch(setLoading(true));
        if (role === "USER") {
          const [summaryRes, statsRes, lvlRes, salRes, balRes, rankRes] = await Promise.allSettled([
            getIncomeSummaryApi(),
            getIncomeTotal(),
            getLevelInfoApi(),
            getSalaryHistoryApi(),
            getAvailableIncomeBalance(),
            getMySalaryRankApi(),
          ]);

          if (summaryRes.status === "fulfilled" && summaryRes.value?.success) {
            setIncomeSummary(summaryRes.value?.data || {});
          }

          if (statsRes.status === "fulfilled" && statsRes.value?.success) {
            setTotalIncome(statsRes.value?.data || {});
            if (statsRes.value?.user) {
              setDashboardUser(statsRes.value.user);
            }
          }

          if (lvlRes.status === "fulfilled" && lvlRes.value?.success) {
            setLevelInfo(lvlRes.value?.data || {});
          }

          if (salRes.status === "fulfilled" && salRes.value?.success) {
            setSalaryData(salRes.value?.data || {});
          }

          if (balRes.status === "fulfilled" && balRes.value?.success) {
            setBalanceData(balRes.value?.data || {});
          }

          if (rankRes.status === "fulfilled" && rankRes.value?.success) {
            setSalaryRankData(rankRes.value?.data || {});
          }
        } else {
          const response = await getIncomeTotalForAdminIncome();
          if (response?.success) {
            setTotalIncome(response.data);
          }
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchDashboardData();
  }, [dispatch, access, role]);

  // Consolidate User & Stats Object
  const stats = totalIncome?.data || totalIncome || incomeSummary?.data || incomeSummary || {};
  const userObj = dashboardUser || totalIncome?.user || incomeSummary?.user || userInfo || {};
  const incomes = totalIncome?.incomes || incomeSummary?.incomes || {};
  const salaryRank = totalIncome?.salaryRank || salaryRankData || {};

  // 1. PACKAGE (Active Staked Capital)
  const activeInvestment = Number(
    stats?.activeInvestment ??
    stats?.totalInvestment ??
    stats?.investment ??
    userObj?.activeInvestment ??
    userObj?.totalInvestment ??
    userObj?.investment ??
    0
  );

  // 2. CURRENT BALANCE (Withdrawal Wallet & Fund Wallet)
  const withdrawalWallet = Number(
    balanceData?.availableBalance ??
    balanceData?.totalIncome ??
    stats?.withdrawableBalance ??
    stats?.totalIncome ??
    incomes?.total ??
    userObj?.withdrawalWallet ??
    userObj?.earnings?.totalRoi ??
    0
  );

  const fundWallet = Number(
    balanceData?.fundWallet ??
    userObj?.fundWallet ??
    stats?.fundWallet ??
    userObj?.wallet ??
    0
  );

  // 3. DAILY R.O.I (1% / Day)
  const totalDailyRoi = Number(
    stats?.dailyRoi?.total ??
    incomes?.dailyRoi?.total ??
    stats?.totalDailyRoi ??
    stats?.totalTrading ??
    stats?.dailyRoi ??
    0
  );
  const todayDailyRoi = Number(
    stats?.dailyRoi?.today ??
    incomes?.dailyRoi?.today ??
    stats?.todayDailyRoi ??
    stats?.todayTrading ??
    0
  );

  // 4. DIRECT BOOSTER INCOME (12% within 24 hours)
  const totalDirectBooster = Number(
    stats?.totalDirectBooster ??
    incomes?.directBooster?.total ??
    stats?.directBoosterIncome ??
    0
  );
  const todayDirectBooster = Number(
    stats?.todayDirectBooster ??
    incomes?.directBooster?.today ??
    0
  );

  // 5. DIRECT REFERRAL INCOME (10% after 24 hours)
  const totalReferral = Number(
    stats?.totalReferral ??
    incomes?.referral?.total ??
    0
  );
  const todayReferral = Number(
    stats?.todayReferral ??
    incomes?.referral?.today ??
    0
  );

  // 6. 10-LEVEL ROI INCOME (24% Total)
  const totalLevelRoi = Number(
    stats?.totalLevelRoi ??
    stats?.totalLevel ??
    incomes?.levelRoi?.total ??
    0
  );
  const todayLevelRoi = Number(
    stats?.todayLevelRoi ??
    stats?.todayLevel ??
    incomes?.levelRoi?.today ??
    0
  );

  // 7. 7-DAYS TEAM BOOSTER BONUS ($20 - $5,000)
  const totalTeamBooster = Number(
    stats?.totalTeamBooster ??
    incomes?.teamBooster?.total ??
    stats?.teamBoosterIncome ??
    0
  );
  const todayTeamBooster = Number(
    stats?.todayTeamBooster ??
    incomes?.teamBooster?.today ??
    0
  );

  // 8. AUTO COMPOUNDING BONUS (0.5% added to active balance)
  const totalCompoundingBonus = Number(
    stats?.totalCompoundingBonus ??
    incomes?.compoundingBonus?.total ??
    userObj?.compounding?.totalBonusEarned ??
    0
  );
  const totalCompounded = Number(
    stats?.totalCompounded ??
    userObj?.compounding?.totalCompounded ??
    0
  );

  // 9. TOTAL INCOME (Combined Aggregate, 220% Max ROI Cap)
  const totalIncomeAmount = Number(
    stats?.totalIncome ??
    incomes?.total ??
    (totalDailyRoi + totalDirectBooster + totalReferral + totalLevelRoi + totalTeamBooster + totalCompoundingBonus)
  );
  const todayIncomeAmount = Number(
    stats?.todayIncome ??
    incomes?.today ??
    (todayDailyRoi + todayDirectBooster + todayReferral + todayLevelRoi + todayTeamBooster)
  );

  // 10. TOTAL TEAM SIZE & BUSINESS
  const partnersCount = Number(
    stats?.partners ??
    userObj?.directs ??
    0
  );
  const partnerActive = Number(
    stats?.partnerActive ??
    levelInfo?.qualifiedDirects ??
    partnersCount
  );
  const totalDownlineUsers = Number(
    stats?.totalDownlineUsers ??
    partnersCount ??
    0
  );

  const totalTeamTransaction = Number(
    stats?.totalTeamBusiness ??
    stats?.totalTeamTransaction ??
    userObj?.totalTeamBusiness ??
    0
  );

  const totalWithdraw = Number(
    stats?.totalWithdraw ??
    0
  );

  const isActiveId = Boolean(
    userObj?.active?.isActive ?? userObj?.isActive ?? activeInvestment >= 10
  );

  // Unlocked levels
  const isAllLevelsUnlocked = activeInvestment >= 500 || Boolean(userObj?.isAllLevelsUnlocked);
  const unlockedLevelsCount = isAllLevelsUnlocked ? 10 : Math.min(10, partnerActive);

  // Referral URL Setup (User's Own Member ID is their Referral Code)
  const userOwnId = userObj?.id || userInfo?.id || userObj?.username || userInfo?.username || "PEH000000";
  const sponsorCode = userObj?.sponsor?.id || userObj?.sponsor || userObj?.referralCode || userObj?.referral || null;
  const origin = window.location.origin;
  const referralLink = `${origin}/register?referral=${encodeURIComponent(userOwnId)}`;

  const copyReferral = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    toast.success("Referral link copied to clipboard!");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const copyUserId = () => {
    navigator.clipboard.writeText(userOwnId);
    setCopiedId(true);
    toast.success("Referral Code copied!");
    setTimeout(() => setCopiedId(false), 2000);
  };

  // 10 Official Cards strictly based on NODEXAI Income Plan:
  // 1. Package, 2. Current Balance, 3. Daily ROI, 4. Direct Booster 12%, 5. Direct Referral 10%,
  // 6. 10-Level ROI, 7. 7-Days Booster, 8. Auto Compounding 0.5%, 9. Total Income (220% Cap), 10. Team Business
  const notebookCards = [
    // 1. PACKAGE
    {
      title: "Package",
      value: `$ ${activeInvestment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: "https://img.icons8.com/3d-fluency/94/exchange.png",
      path: AuthenticatedUserRouters.INVEST,
      theme: "cyan",
      badge: isActiveId ? "ACTIVE $10+" : "INACTIVE",
      subText: activeInvestment >= 500 ? "VIP All 10 Levels Unlocked" : `Staked: $ ${activeInvestment.toFixed(2)}`,
    },
    // 2. CURRENT BALANCE
    {
      title: "Current Balance",
      value: `$ ${withdrawalWallet.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: "https://img.icons8.com/3d-fluency/94/wallet.png",
      path: AuthenticatedUserRouters.WITHDRAW,
      theme: "blue",
      badge: "WITHDRAWABLE",
      subText: fundWallet > 0 ? `Fund Wallet: $ ${fundWallet.toFixed(2)}` : "Available Balance",
    },
    // 3. DAILY ROI (4.5% - 7.5%)
    {
      title: "Package Daily ROI",
      value: `$ ${totalDailyRoi.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: "https://img.icons8.com/3d-fluency/94/candle-sticks.png",
      path: AuthenticatedUserRouters.TRADING_INCOME_HISTORY,
      highlight: true,
      theme: "emerald",
      badge: "4.5%-7.5% / DAY",
      subText: `Today: +$ ${todayDailyRoi.toFixed(2)}`,
    },
    // 4. DIRECT REFERRAL (12%)
    {
      title: "Direct Referral (12%)",
      value: `$ ${((totalReferral || 0) + (totalDirectBooster || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: "https://img.icons8.com/3d-plastilina/69/share--v1.png",
      path: AuthenticatedUserRouters.REFERRAL_INCOME_HISTORY,
      theme: "amber",
      badge: "12% DIRECT",
      subText: `Today: +$ ${((todayReferral || 0) + (todayDirectBooster || 0)).toFixed(2)} • ${partnerActive} Active`,
    },
    // 5. 10-LEVEL ROI (24%)
    {
      title: "10-Level ROI (24%)",
      value: `$ ${totalLevelRoi.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: "https://cdn-icons-png.flaticon.com/512/10102/10102408.png",
      path: AuthenticatedUserRouters.LEVEL_INCOME_HISTORY,
      theme: "purple",
      badge: isAllLevelsUnlocked ? "ALL 10 UNLOCKED" : `${unlockedLevelsCount}/10 LEVELS`,
      subText: isAllLevelsUnlocked ? "Auto-Unlocked ($500+)" : `${partnerActive} Active Directs`,
    },
    // 6. 10-LEVEL ROI (24%)
    {
      title: "10-Level ROI (24%)",
      value: `$ ${totalLevelRoi.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: "https://cdn-icons-png.flaticon.com/512/10102/10102408.png",
      path: AuthenticatedUserRouters.LEVEL_INCOME_HISTORY,
      theme: "purple",
      badge: isAllLevelsUnlocked ? "ALL 10 UNLOCKED" : `${unlockedLevelsCount}/10 LEVELS`,
      subText: isAllLevelsUnlocked ? "Auto-Unlocked ($500+)" : `${partnerActive} Active Directs`,
    },
    // 7. 7-DAYS TEAM BOOSTER
    {
      title: "7-Days Team Booster",
      value: `$ ${totalTeamBooster.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: "https://img.icons8.com/3d-fluency/94/trophy.png",
      path: AuthenticatedUserRouters.TEAM_BOOSTER_INCOME,
      theme: "amber",
      badge: "SLABS $20–$5K",
      subText: "Monday Weekly Distribution",
    },
    // 8. AUTO COMPOUNDING (0.5% BONUS)
    {
      title: "Auto Compounding",
      value: `$ ${totalCompoundingBonus.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: "https://img.icons8.com/3d-fluency/94/refresh.png",
      path: AuthenticatedUserRouters.AUTO_COMPOUNDING,
      theme: "emerald",
      badge: "+0.5% BONUS",
      subText: `Compounded: $ ${totalCompounded.toFixed(2)}`,
    },
    // 9. TOTAL INCOME
    {
      title: "Total Income",
      value: `$ ${totalIncomeAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: "https://img.icons8.com/3d-fluency/94/stack-of-coins.png",
      path: AuthenticatedUserRouters.INCOME_HISTORY,
      highlight: true,
      theme: "emerald",
      badge: "MAX 220% ROI",
      subText: `Today: +$ ${todayIncomeAmount.toFixed(2)}`,
    },
    // 10. TEAM BUSINESS
    {
      title: "Team Business",
      value: `$ ${totalTeamTransaction.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: "https://img.icons8.com/pulsar-gradient/48/refund-2.png",
      path: AuthenticatedUserRouters.MY_TEAM_DIVISION,
      highlight: true,
      theme: "purple",
      badge: "NETWORK VOL",
      subText: `${partnersCount} Team Members`,
    },
  ];

  // Admin Card Data
  const cardData = [
    {
      title: "All Users",
      value: `${Number(totalIncome?.users ?? 0)}`,
      icon: "https://img.icons8.com/3d-fluency/94/group--v2.png",
      path: AuthenticatedAdminRouters.ALL_USERS,
    },
    {
      title: "Active Users",
      value: `${Number(totalIncome?.userActive ?? 0)}`,
      icon: "https://img.icons8.com/3d-fluency/94/group.png",
      path: AuthenticatedAdminRouters.ACTIVE_USERS,
    },
    {
      title: "Inactive Users",
      value: `${Number(totalIncome?.userInactive ?? 0)}`,
      icon: "https://img.icons8.com/3d-fluency/94/group--v4.png",
      path: AuthenticatedAdminRouters.INACTIVE_USERS,
    },
    {
      title: "Total Income",
      value: `$ ${Number(totalIncome?.totalIncome ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: "https://img.icons8.com/3d-fluency/94/stack-of-coins.png",
      path: AuthenticatedAdminRouters.INCOME_HISTORY,
    },
    {
      title: "Direct & Booster Incomes",
      value: `$ ${Number(totalIncome?.totalReferral ?? totalIncome?.incomes?.referral?.total ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: "https://img.icons8.com/3d-plastilina/69/share--v1.png",
      path: AuthenticatedAdminRouters.DIRECT_BOOSTER_INCOME,
    },
    {
      title: "Daily Package ROI",
      value: `$ ${Number(totalIncome?.totalTrading ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: "https://img.icons8.com/3d-fluency/94/candle-sticks.png",
      path: AuthenticatedAdminRouters.ROI_INCOME,
    },
    {
      title: "7-Days Team Booster",
      value: `$ ${Number(totalIncome?.totalTeamBooster ?? totalIncome?.incomes?.teamBooster?.total ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: "https://img.icons8.com/3d-fluency/94/trophy.png",
      path: AuthenticatedAdminRouters.TEAM_BOOSTER_INCOME,
    },
    {
      title: "Auto Compounding",
      value: `$ ${Number(totalIncome?.totalCompounded ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: "https://img.icons8.com/3d-fluency/94/refresh.png",
      path: AuthenticatedAdminRouters.ADMIN_COMPOUNDING,
    },
    {
      title: "Total Withdrawals",
      value: `$ ${Number(totalIncome?.totalWithdraw ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: "https://img.icons8.com/3d-fluency/94/money-bag.png",
      path: AuthenticatedAdminRouters.APPROVED_WITHDRAWAL_REQUEST,
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-5 min-h-screen p-1 sm:p-2 md:p-3 bg-[#0b0e11] max-w-full overflow-hidden text-[#eaecef]">
      {/* ── USER PANEL HERO & OVERVIEW ── */}
      {role === "USER" && (
        <div className="space-y-4 sm:space-y-5 animate-fadeIn">
          {/* ⚡ 1. Live 24/7 Infinite-Scrolling Market Ticker Marquee Line (Above Terminal) */}
          <LiveMarketTickerMarquee
            onSelectCoin={handleSelectTradingCoin}
            activeCoinId={selectedTradingCoin?.id}
          />

          {/* ⚡ 3. INSTITUTIONAL TRADING ENGINE & MULTI-CHAIN MARKET TERMINAL */}
          <div id="live-trading-terminal-section">
            <DashboardTradingTerminal
              selectedCoinState={selectedTradingCoin}
              onCoinChange={(c) => setSelectedTradingCoin(c)}
            />
          </div>

          {/* ── 4. Binance Pro Top User Banner with ID, Status & Referral Hub ── */}
          <div className="bg-[#181a20] border border-[#2b313a] rounded-2xl p-3.5 sm:p-5 relative overflow-hidden shadow-xl">
            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-5">
              <div className="space-y-2 w-full lg:w-auto">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#f0b90b] bg-[#1e2329] border border-[#f0b90b]/40 px-2.5 py-0.5 rounded-full">
                    NODEXAI
                  </span>
                  <span
                    className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border shadow-sm ${
                      isActiveId
                        ? "bg-[#0ecb81]/15 text-[#0ecb81] border-[#0ecb81]/40"
                        : "bg-[#f0b90b]/15 text-[#f0b90b] border-[#f0b90b]/40"
                    }`}
                  >
                    {isActiveId ? "● Active ID ($50+)" : "○ Inactive ($50 to Activate)"}
                  </span>
                </div>

                <h1 className="text-lg sm:text-2xl md:text-3xl font-black text-[#eaecef] tracking-tight">
                  Welcome back,{" "}
                  <span className="text-[#f0b90b] font-['Orbitron',monospace]">
                    {userObj?.username || userOwnId}
                  </span>
                  !
                </h1>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-[#848e9c] pt-0.5">
                  <span className="flex items-center gap-1 font-mono bg-[#1e2329] px-2.5 py-1 rounded-xl border border-[#2b313a] text-[11px]">
                    User ID: <strong className="text-[#f0b90b] font-bold">{userOwnId}</strong>
                    <button onClick={copyUserId} className="hover:text-[#f0b90b] transition ml-1 cursor-pointer" title="Copy User ID">
                      {copiedId ? <Check size={12} className="text-[#0ecb81]" /> : <Copy size={12} className="text-[#848e9c]" />}
                    </button>
                  </span>
                  {sponsorCode && (
                    <span className="flex items-center gap-1 font-mono bg-[#1e2329] px-2.5 py-1 rounded-xl border border-[#2b313a] text-[11px]">
                      Sponsor: <strong className="text-[#0ecb81]">{sponsorCode}</strong>
                    </span>
                  )}
                  {userObj?.account && (
                    <span className="flex items-center gap-1 font-mono bg-[#1e2329] px-2.5 py-1 rounded-xl border border-[#2b313a] text-[11px]">
                      Wallet: <strong className="text-[#eaecef]">{maskWalletAddress(userObj.account)}</strong>
                    </span>
                  )}
                  {userObj?.email && (
                    <span className="hidden sm:flex items-center gap-1 font-mono bg-[#1e2329] px-2.5 py-1 rounded-xl border border-[#2b313a] text-[#848e9c] text-[11px]">
                      Email: <strong className="text-[#eaecef]">{userObj.email}</strong>
                    </span>
                  )}
                </div>
              </div>

              {/* Binance Style Referral Box */}
              <div className="w-full lg:w-auto bg-[#1e2329] border border-[#2b313a] rounded-2xl p-3 space-y-2 shadow-lg">
                {/* 1. Direct Referral Code */}
                <div className="flex items-center justify-between bg-[#181a20] border border-[#2b313a] rounded-xl px-3 py-1.5 gap-2">
                  <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                    <span className="text-[10px] font-bold text-[#848e9c] uppercase tracking-wider shrink-0">Your Referral Code:</span>
                    <span className="text-xs sm:text-sm font-black font-mono text-[#f0b90b] tracking-wider truncate">{userOwnId}</span>
                  </div>
                  <button
                    onClick={copyUserId}
                    className="px-2.5 py-1 rounded-lg bg-[#f0b90b]/15 hover:bg-[#f0b90b]/25 border border-[#f0b90b]/40 text-[#f0b90b] text-[10px] font-bold transition flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    {copiedId ? <Check size={11} className="text-[#0ecb81]" /> : <Copy size={11} />}
                    {copiedId ? "Copied" : "Copy Code"}
                  </button>
                </div>

                {/* 2. Full Referral Link */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-[#848e9c] uppercase tracking-wider flex items-center gap-1">
                    <Share2 size={11} className="text-[#f0b90b]" /> Your Referral Link
                  </span>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5">
                    <input
                      type="text"
                      readOnly
                      value={referralLink}
                      className="bg-[#181a20] border border-[#2b313a] focus:border-[#f0b90b] rounded-xl px-2.5 py-1.5 text-[11px] text-[#eaecef] w-full lg:w-64 font-mono outline-none min-w-0 truncate select-all"
                    />
                    <button
                      onClick={copyReferral}
                      className="px-3 py-1.5 rounded-xl bg-[#f0b90b] hover:bg-[#fcd535] text-[#181a20] text-[10.5px] font-black transition flex items-center justify-center gap-1 whitespace-nowrap active:scale-95 cursor-pointer shrink-0"
                    >
                      {copiedLink ? <Check size={12} className="text-[#181a20]" /> : <Copy size={12} />}
                      {copiedLink ? "Copied" : "Copy Link"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── 5. ALL 10 FINANCIAL & TEAM INCOME CARDS ── */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#848e9c] font-['Orbitron',monospace] flex items-center gap-1.5">
                <Sparkles size={12} className="text-[#f0b90b]" /> Financial Overview & Income Streams
              </span>
              <span className="text-[10px] text-[#0ecb81] font-mono font-bold">● Live Synced</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
              {notebookCards.map((item) => (
                <StatCard
                  key={item.title}
                  title={item.title}
                  value={item.value}
                  iconImage={item.icon}
                  path={item.path}
                  theme={item.theme}
                  highlight={item.highlight}
                  badge={item.badge}
                  subText={item.subText}
                />
              ))}
            </div>
          </div>

          {/* ── 🚀 FAST ACTION COMMAND CENTER ── */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#848e9c] font-['Orbitron',monospace] flex items-center gap-1.5">
                <Zap size={11} className="text-[#f0b90b]" /> Fast Action Command Center
              </span>
              <span className="text-[9px] text-[#848e9c] font-mono">1-Click Quick Access</span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-1.5 sm:gap-2">
              {/* 1. Deposit Packages */}
              <button
                onClick={() => navigate(AuthenticatedUserRouters.INVEST)}
                className="group px-2 py-1.5 rounded-xl bg-[#181a20] border border-[#2b313a] hover:border-[#f0b90b] text-left transition-all duration-200 hover:scale-[1.02] active:scale-95 shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-[#f0b90b] flex items-center justify-center text-[#181a20] font-black shadow-sm shrink-0">
                  <Zap size={11} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-black text-[10px] text-[#eaecef] group-hover:text-[#f0b90b] transition truncate font-['Orbitron',monospace]">
                    Deposit
                  </div>
                  <div className="text-[8px] text-[#848e9c] truncate">
                    $10 - $1000
                  </div>
                </div>
              </button>

              {/* 2. Withdrawal */}
              <button
                onClick={() => navigate(AuthenticatedUserRouters.WITHDRAW)}
                className="group px-2 py-1.5 rounded-xl bg-[#181a20] border border-[#2b313a] hover:border-[#0ecb81] text-left transition-all duration-200 hover:scale-[1.02] active:scale-95 shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-[#0ecb81] flex items-center justify-center text-white font-black shadow-sm shrink-0">
                  <ArrowDownLeft size={11} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-black text-[10px] text-[#eaecef] group-hover:text-[#0ecb81] transition truncate font-['Orbitron',monospace]">
                    Withdrawal
                  </div>
                  <div className="text-[8px] text-[#848e9c] truncate">
                    5% Fee
                  </div>
                </div>
              </button>

              {/* 3. Income Report */}
              <button
                onClick={() => navigate(AuthenticatedUserRouters.INCOME_HISTORY)}
                className="group px-2 py-1.5 rounded-xl bg-[#181a20] border border-[#2b313a] hover:border-[#0ecb81] text-left transition-all duration-200 hover:scale-[1.02] active:scale-95 shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-[#1e2329] border border-[#0ecb81]/40 flex items-center justify-center text-[#0ecb81] font-black shadow-sm shrink-0">
                  <DollarSign size={11} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-black text-[10px] text-[#eaecef] group-hover:text-[#0ecb81] transition truncate font-['Orbitron',monospace]">
                    Income Report
                  </div>
                  <div className="text-[8px] text-[#848e9c] truncate">
                    Ledger & Breakdown
                  </div>
                </div>
              </button>

              {/* 4. Genealogy Tree */}
              <button
                onClick={() => navigate(AuthenticatedUserRouters.MATRIX_TREE)}
                className="group px-2 py-1.5 rounded-xl bg-[#181a20] border border-[#2b313a] hover:border-[#f0b90b] text-left transition-all duration-200 hover:scale-[1.02] active:scale-95 shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-[#1e2329] border border-[#f0b90b]/40 flex items-center justify-center text-[#f0b90b] font-black shadow-sm shrink-0">
                  <Users size={11} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-black text-[10px] text-[#eaecef] group-hover:text-[#f0b90b] transition truncate font-['Orbitron',monospace]">
                    Tree
                  </div>
                  <div className="text-[8px] text-[#848e9c] truncate">
                    Genealogy
                  </div>
                </div>
              </button>

              {/* 5. Re-Invest */}
              <button
                onClick={() => navigate(AuthenticatedUserRouters.REINVEST)}
                className="group px-2 py-1.5 rounded-xl bg-[#181a20] border border-[#2b313a] hover:border-[#f0b90b] text-left transition-all duration-200 hover:scale-[1.02] active:scale-95 shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-[#1e2329] border border-[#2b313a] flex items-center justify-center text-[#eaecef] font-black shadow-sm shrink-0">
                  <RefreshCw size={11} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-black text-[10px] text-[#eaecef] group-hover:text-[#f0b90b] transition truncate font-['Orbitron',monospace]">
                    Re-Invest
                  </div>
                  <div className="text-[8px] text-[#848e9c] truncate">
                    Self 100% / New 50%
                  </div>
                </div>
              </button>

              {/* 6. Trading Income Records */}
              <button
                onClick={() => navigate(AuthenticatedUserRouters.TRADING_INCOME_HISTORY)}
                className="group px-2 py-1.5 rounded-xl bg-[#181a20] border border-[#2b313a] hover:border-[#0ecb81] text-left transition-all duration-200 hover:scale-[1.02] active:scale-95 shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-[#1e2329] border border-[#2b313a] flex items-center justify-center text-[#0ecb81] font-black shadow-sm shrink-0">
                  <BarChart3 size={11} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-black text-[10px] text-[#eaecef] group-hover:text-[#0ecb81] transition truncate font-['Orbitron',monospace]">
                    Trading ROI
                  </div>
                  <div className="text-[8px] text-[#848e9c] truncate">
                    Daily & Booster
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* ── 🌟 THANK YOU & PLATFORM LOGO FOOTER ── */}
          <div className="mt-5 sm:mt-6 rounded-2xl bg-[#181a20] border border-[#2b313a] p-3.5 sm:p-4 relative overflow-hidden shadow-lg">
            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              {/* Logo + Thank You */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#1e2329] border border-[#f0b90b]/40 p-1.5 flex items-center justify-center shrink-0 shadow-md">
                  <img
                    src={MainContent?.shortLogo || "/NodexAI.jpeg"}
                    alt="NODEXAI"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-[#eaecef] tracking-tight">
                    Thank You for Trading with{" "}
                    <span className="text-[#f0b90b] font-['Orbitron',monospace]">
                      NODEXAI
                    </span>
                  </h3>
                  <p className="text-[11px] text-[#848e9c]">
                    INVEST • GROW • EARN
                  </p>
                </div>
              </div>

              {/* Status & Copyright */}
              <div className="flex items-center gap-3 text-[11px] font-mono text-[#848e9c]">
                <span className="inline-flex items-center gap-1.5 text-[#0ecb81] bg-[#1e2329] px-2.5 py-1 rounded-lg border border-[#2b313a]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0ecb81] animate-ping" />
                  <span>Nodes Online (99.99%)</span>
                </span>
                <span>© {new Date().getFullYear()} PEH</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ADMIN PANEL STATS ── */}
      {role === "ADMIN" && (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
          {cardData.map((item) => (
            <StatCard
              key={item.title}
              title={item.title}
              value={item.value}
              iconImage={item.icon}
              change={item.change}
              changeType={item.changeType}
              path={item.path}
              data={item.data}
              theme={item.theme}
              badge={item.badge}
              subText={item.subText}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard1;