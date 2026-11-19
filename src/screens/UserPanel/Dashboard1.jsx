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
  };

  const role = useSelector((state) => state?.isLoggedUser?.role);
  const userInfo = useSelector((state) => state?.isLoggedUser?.data);

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

  // ── NODEXAI.IO 5 OFFICIAL INCOME STREAMS ──
  // 1. DIRECT INCOME (10% = $2.50 per Direct)
  const totalDirectIncome = Number(
    stats?.directIncome?.total ??
    incomes?.directIncome?.total ??
    stats?.totalReferral ??
    incomes?.referral?.total ??
    userObj?.earnings?.referralIncome ??
    0
  );
  const todayDirectIncome = Number(
    stats?.directIncome?.today ??
    incomes?.directIncome?.today ??
    stats?.todayReferral ??
    incomes?.referral?.today ??
    0
  );

  // 2. 10-LEVEL INCOME (20% = $5.00 across 10 levels)
  const totalLevelIncome = Number(
    stats?.levelIncome?.total ??
    incomes?.levelIncome?.total ??
    stats?.totalLevelRoi ??
    stats?.totalLevel ??
    incomes?.levelRoi?.total ??
    0
  );
  const todayLevelIncome = Number(
    stats?.levelIncome?.today ??
    incomes?.levelIncome?.today ??
    stats?.todayLevelRoi ??
    stats?.todayLevel ??
    incomes?.levelRoi?.today ??
    0
  );

  // 3. BINARY MATCHING INCOME (50% = $12.50, 1:1 Matching Bonus)
  const totalBinaryIncome = Number(
    userObj?.binary?.totalBinaryEarned ??
    stats?.binaryIncome?.total ??
    incomes?.binaryIncome?.total ??
    stats?.totalMatching ??
    incomes?.matching?.total ??
    0
  );
  const todayBinaryIncome = Number(
    userObj?.binary?.todayBinaryEarned ??
    stats?.binaryIncome?.today ??
    incomes?.binaryIncome?.today ??
    0
  );
  const leftVolume = Number(userObj?.binary?.leftVolume ?? stats?.leftVolume ?? 0);
  const rightVolume = Number(userObj?.binary?.rightVolume ?? stats?.rightVolume ?? 0);
  const carryLeft = Number(userObj?.binary?.carryLeft ?? stats?.carryLeft ?? 0);
  const carryRight = Number(userObj?.binary?.carryRight ?? stats?.carryRight ?? 0);

  // 4. CLUB INCOME (10% C.T.O Pool + Milestone Rewards: Puma $150, Pajero $300, Panther $500)
  const totalClubIncome = Number(
    stats?.clubIncome?.total ??
    incomes?.clubIncome?.total ??
    userObj?.club?.rewardsPaid ??
    stats?.totalRoyalty ??
    incomes?.royalty?.total ??
    0
  );
  const isPuma = Boolean(userObj?.club?.pumaAchieved);
  const isPajero = Boolean(userObj?.club?.pajeroAchieved);
  const isPanther = Boolean(userObj?.club?.pantherAchieved);
  const activeClubTier = isPanther ? "Panther ($500+2% CTO)" : isPajero ? "Pajero ($300+3% CTO)" : isPuma ? "Puma ($150+5% CTO)" : "No Club Yet";

  // 5. COMMUNITY DEVELOPMENT & BONANZA (10%)
  const totalCommunity = Number(
    stats?.communitySupport?.total ??
    incomes?.communitySupport?.total ??
    stats?.totalBonanza ??
    0
  );

  // 6. NODE WONDER (Universal 2-ID Queue + 5% Referral)
  const totalNodeWonderCycle = Number(
    stats?.nodeWonderIncome?.total ??
    incomes?.nodeWonderIncome?.total ??
    userObj?.nodeWonderInfo?.totalEarnedFromCycles ??
    userObj?.nodeWonderInfo?.totalQueueEarned ??
    0
  );
  const totalNodeWonderRef = Number(
    stats?.nodeWonderReferral?.total ??
    incomes?.nodeWonderReferral?.total ??
    userObj?.nodeWonderInfo?.totalReferralIncome ??
    userObj?.nodeWonderInfo?.totalReferralEarned ??
    0
  );
  const totalNodeWonder = totalNodeWonderCycle + totalNodeWonderRef;

  // Aggregate Total Income
  const totalIncomeAmount = Number(
    stats?.totalIncome ??
    incomes?.total ??
    (totalDirectIncome + totalLevelIncome + totalBinaryIncome + totalClubIncome + totalCommunity + totalNodeWonder)
  );
  const todayIncomeAmount = Number(
    stats?.todayIncome ??
    incomes?.today ??
    (todayDirectIncome + todayLevelIncome + todayBinaryIncome)
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
    (leftVolume + rightVolume) ??
    0
  );

  const totalWithdraw = Number(
    stats?.totalWithdraw ??
    0
  );

  const isActiveId = Boolean(
    userObj?.active?.isActive ?? userObj?.isActive ?? activeInvestment >= 25
  );

  // Unlocked levels: 5 directs compulsory for all 10 levels
  const isAllLevelsUnlocked = partnerActive >= 5 || Boolean(userObj?.isAllLevelsUnlocked);
  const unlockedLevelsCount = isAllLevelsUnlocked ? 10 : Math.min(10, partnerActive * 2);

  // Referral URL Setup (User's Own Member ID is their Referral Code)
  const userOwnId = userObj?.id || userInfo?.id || userObj?.username || userInfo?.username || "NODEX000000";
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

  // 10 Official Cards strictly based on NODEXAI $25 Income Plan:
  const notebookCards = [
    // 1. PACKAGE
    {
      title: "NODEXAI Package",
      value: `$ ${activeInvestment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: "https://img.icons8.com/3d-fluency/94/exchange.png",
      path: AuthenticatedUserRouters.INVEST,
      theme: "cyan",
      badge: isActiveId ? "ACTIVE $25" : "INACTIVE",
      subText: isActiveId ? "Official $25 Plan Active" : "Activate $25 Package",
    },
    // 2. CURRENT BALANCE
    {
      title: "Current Balance",
      value: `$ ${withdrawalWallet.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: "https://img.icons8.com/3d-fluency/94/wallet.png",
      path: AuthenticatedUserRouters.WITHDRAW,
      theme: "blue",
      badge: "WITHDRAWABLE",
      subText: fundWallet > 0 ? `Fund Wallet: $ ${fundWallet.toFixed(2)}` : "Available for Payout",
    },
    // 3. DIRECT INCOME (5% = $1.25)
    {
      title: "01. Direct Income",
      value: `$ ${totalDirectIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: "https://img.icons8.com/3d-plastilina/69/share--v1.png",
      path: AuthenticatedUserRouters.REFERRAL_INCOME_HISTORY,
      theme: "amber",
      badge: "5% ($1.25 / Direct)",
      subText: `Today: +$ ${todayDirectIncome.toFixed(2)} • ${partnerActive} Active Directs`,
    },
    // 4. LEVEL INCOME (20% = $5.00)
    {
      title: "02. 10-Level Income",
      value: `$ ${totalLevelIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: "https://cdn-icons-png.flaticon.com/512/10102/10102408.png",
      path: AuthenticatedUserRouters.LEVEL_INCOME_HISTORY,
      theme: "purple",
      badge: isAllLevelsUnlocked ? "ALL 10 UNLOCKED" : `${unlockedLevelsCount}/10 LEVELS`,
      subText: isAllLevelsUnlocked ? "5 Directs Rule Met" : "5 Directs for All Levels",
    },
    // 5. BINARY MATCHING (50% = $12.50, 1:1)
    {
      title: "03. Binary Matching",
      value: `$ ${totalBinaryIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: "https://img.icons8.com/3d-fluency/94/candle-sticks.png",
      path: AuthenticatedUserRouters.MATCHING_INCOME_HISTORY,
      highlight: true,
      theme: "emerald",
      badge: "50% (1:1 / $12.50)",
      subText: `Left: $${leftVolume} | Right: $${rightVolume}`,
    },
    // 6. CLUB CTO POOL (10%)
    {
      title: "04. Club CTO Income",
      value: `$ ${totalClubIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: "https://img.icons8.com/3d-fluency/94/trophy.png",
      path: AuthenticatedUserRouters.ROYALTY_CLUB_INCOME,
      theme: "amber",
      badge: activeClubTier,
      subText: "Puma (5%) • Pajero (3%) • Panther (2%)",
    },
    // 7. COMMUNITY & BONANZA (10%)
    {
      title: "05. Community Bonanza",
      value: `$ ${totalCommunity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: "https://img.icons8.com/3d-fluency/94/conference-call.png",
      path: AuthenticatedUserRouters.GLOBAL_ACHIEVERS,
      theme: "cyan",
      badge: "10% ALLOCATED",
      subText: "Development & Leader Rewards",
    },
    // 8. BINARY CARRY FORWARD
    {
      title: "Binary Volumes (L / R)",
      value: `$${carryLeft} / $${carryRight}`,
      icon: "https://img.icons8.com/pulsar-gradient/48/refund-2.png",
      path: AuthenticatedUserRouters.MATRIX_TREE,
      theme: "purple",
      badge: "CARRY FORWARD",
      subText: `Total Vol: $${(leftVolume + rightVolume).toFixed(2)}`,
    },
    // 9. NODE WONDER CYCLE INCOME ($150)
    {
      title: "Node Wonder Income",
      value: `$ ${totalNodeWonderCycle.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: "https://img.icons8.com/3d-fluency/94/process.png",
      path: AuthenticatedUserRouters.NODE_WONDER_INCOME_HISTORY,
      theme: "purple",
      badge: userObj?.nodeWonderInfo?.hasActivePackage ? "IN QUEUE" : "$150 / CYCLE",
      subText: `${userObj?.nodeWonderInfo?.totalCyclesCompleted || 0} Cycles Completed`,
    },
    // 10. NODE WONDER REFERRAL INCOME (5%)
    {
      title: "Node Wonder Referral",
      value: `$ ${totalNodeWonderRef.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: "https://img.icons8.com/3d-plastilina/69/share--v1.png",
      path: AuthenticatedUserRouters.NODE_WONDER_REFERRAL_HISTORY,
      theme: "amber",
      badge: "5% UNCONDITIONAL",
      subText: "$5.00 per direct $100 package",
    },
    // 11. TOTAL INCOME
    {
      title: "Total Income",
      value: `$ ${totalIncomeAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: "https://img.icons8.com/3d-fluency/94/stack-of-coins.png",
      path: AuthenticatedUserRouters.INCOME_HISTORY,
      highlight: true,
      theme: "emerald",
      badge: "100% DISTRIBUTED",
      subText: `Today: +$ ${todayIncomeAmount.toFixed(2)}`,
    },
    // 10. DIRECT PARTNERS
    {
      title: "Direct Partners",
      value: `${partnersCount}`,
      icon: "https://img.icons8.com/3d-fluency/94/group--v2.png",
      path: AuthenticatedUserRouters.MY_REFERRALS,
      theme: "blue",
      badge: `${partnerActive} ACTIVE`,
      subText: partnerActive >= 5 ? "All 10 Levels Unlocked" : `${Math.max(0, 5 - partnerActive)} more for all levels`,
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
      title: "Active Users ($25)",
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
      title: "Total Distributed Income",
      value: `$ ${Number(totalIncome?.totalIncome ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: "https://img.icons8.com/3d-fluency/94/stack-of-coins.png",
      path: AuthenticatedAdminRouters.INCOME_HISTORY,
    },
    {
      title: "01. Direct Income (10%)",
      value: `$ ${Number(totalIncome?.totalReferral ?? totalIncome?.incomes?.referral?.total ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: "https://img.icons8.com/3d-plastilina/69/share--v1.png",
      path: AuthenticatedAdminRouters.REFERRAL_INCOME_HISTORY,
    },
    {
      title: "02. Level Income (20%)",
      value: `$ ${Number(totalIncome?.totalLevel ?? totalIncome?.incomes?.levelRoi?.total ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: "https://cdn-icons-png.flaticon.com/512/10102/10102408.png",
      path: AuthenticatedAdminRouters.LEVEL_INCOME_HISTORY,
    },
    {
      title: "03. Binary Matching (50%)",
      value: `$ ${Number(totalIncome?.totalMatching ?? totalIncome?.incomes?.matching?.total ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: "https://img.icons8.com/3d-fluency/94/candle-sticks.png",
      path: AuthenticatedAdminRouters.MATCHING_INCOME_HISTORY,
    },
    {
      title: "04. Club CTO Pool (10%)",
      value: `$ ${Number(totalIncome?.totalRoyalty ?? totalIncome?.incomes?.royalty?.total ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: "https://img.icons8.com/3d-fluency/94/trophy.png",
      path: AuthenticatedAdminRouters.ADMIN_ROYALTY_INCOME,
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
          {/* ⚡ 1. Live 24/7 Infinite-Scrolling Market Ticker Marquee Line */}
          <LiveMarketTickerMarquee
            onSelectCoin={handleSelectTradingCoin}
            activeCoinId={selectedTradingCoin?.id}
          />

          {/* ── 2. Top User Banner with ID, Status & Referral Hub ── */}
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
                    {isActiveId ? "● Active ID ($25)" : "○ Inactive ($25 to Activate)"}
                  </span>
                </div>

                <h1 className="text-lg sm:text-2xl md:text-3xl font-black text-white tracking-tight">
                  Welcome back,{" "}
                  <span className="text-[#f0b90b] font-['Orbitron',monospace]">
                    {userObj?.username || userOwnId}
                  </span>
                  !
                </h1>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-100 pt-0.5">
                  <span className="flex items-center gap-1 font-mono bg-[#1e2329] px-2.5 py-1 rounded-xl border border-[#2b313a] text-[11px] text-white">
                    User ID: <strong className="text-[#f0b90b] font-bold">{userOwnId}</strong>
                    <button onClick={copyUserId} className="hover:text-[#f0b90b] transition ml-1 cursor-pointer" title="Copy User ID">
                      {copiedId ? <Check size={12} className="text-[#0ecb81]" /> : <Copy size={12} className="text-white" />}
                    </button>
                  </span>
                  {sponsorCode && (
                    <span className="flex items-center gap-1 font-mono bg-[#1e2329] px-2.5 py-1 rounded-xl border border-[#2b313a] text-[11px] text-white">
                      Sponsor: <strong className="text-[#0ecb81]">{sponsorCode}</strong>
                    </span>
                  )}
                  {userObj?.account && (
                    <span className="flex items-center gap-1 font-mono bg-[#1e2329] px-2.5 py-1 rounded-xl border border-[#2b313a] text-[11px] text-white">
                      Wallet: <strong className="text-white">{maskWalletAddress(userObj.account)}</strong>
                    </span>
                  )}
                  {userObj?.email && (
                    <span className="hidden sm:flex items-center gap-1 font-mono bg-[#1e2329] px-2.5 py-1 rounded-xl border border-[#2b313a] text-white text-[11px]">
                      Email: <strong className="text-white">{userObj.email}</strong>
                    </span>
                  )}
                </div>
              </div>

              {/* Binance Style Referral Box */}
              <div className="w-full lg:w-auto bg-[#1e2329] border border-[#2b313a] rounded-2xl p-3 space-y-2 shadow-lg">
                {/* 1. Direct Referral Code */}
                <div className="flex items-center justify-between bg-[#181a20] border border-[#2b313a] rounded-xl px-3 py-1.5 gap-2">
                  <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                    <span className="text-[10px] font-bold text-white uppercase tracking-wider shrink-0">Your Referral Code:</span>
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
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1">
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
              <span className="text-[11px] font-black uppercase tracking-wider text-white font-['Orbitron',monospace] flex items-center gap-1.5">
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
              <span className="text-[10px] font-black uppercase tracking-wider text-white font-['Orbitron',monospace] flex items-center gap-1.5">
                <Zap size={11} className="text-[#f0b90b]" /> Fast Action Command Center
              </span>
              <span className="text-[9px] text-white/90 font-mono">1-Click Quick Access</span>
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
                  <div className="font-black text-[10.5px] text-white group-hover:text-[#f0b90b] transition truncate font-['Orbitron',monospace]">
                    Deposit
                  </div>
                  <div className="text-[8.5px] text-slate-100 font-medium truncate">
                    $25 Package
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
                  <div className="font-black text-[10.5px] text-white group-hover:text-[#0ecb81] transition truncate font-['Orbitron',monospace]">
                    Withdrawal
                  </div>
                  <div className="text-[8.5px] text-slate-100 font-medium truncate">
                    5% Fee
                  </div>
                </div>
              </button>

              {/* 3. Binary Matching */}
              <button
                onClick={() => navigate(AuthenticatedUserRouters.MATCHING_INCOME_HISTORY)}
                className="group px-2 py-1.5 rounded-xl bg-[#181a20] border border-[#2b313a] hover:border-[#0ecb81] text-left transition-all duration-200 hover:scale-[1.02] active:scale-95 shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-[#1e2329] border border-[#0ecb81]/40 flex items-center justify-center text-[#0ecb81] font-black shadow-sm shrink-0">
                  <DollarSign size={11} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-black text-[10.5px] text-white group-hover:text-[#0ecb81] transition truncate font-['Orbitron',monospace]">
                    Binary 1:1
                  </div>
                  <div className="text-[8.5px] text-slate-100 font-medium truncate">
                    50% ($12.50)
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
                  <div className="font-black text-[10.5px] text-white group-hover:text-[#f0b90b] transition truncate font-['Orbitron',monospace]">
                    Tree
                  </div>
                  <div className="text-[8.5px] text-slate-100 font-medium truncate">
                    Genealogy
                  </div>
                </div>
              </button>

              {/* 5. Club Status */}
              <button
                onClick={() => navigate(AuthenticatedUserRouters.ROYALTY_CLUB_INCOME)}
                className="group px-2 py-1.5 rounded-xl bg-[#181a20] border border-[#2b313a] hover:border-[#f0b90b] text-left transition-all duration-200 hover:scale-[1.02] active:scale-95 shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-[#1e2329] border border-[#f0b90b]/40 flex items-center justify-center text-[#eaecef] font-black shadow-sm shrink-0">
                  <Crown size={11} className="text-[#f0b90b]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-black text-[10.5px] text-white group-hover:text-[#f0b90b] transition truncate font-['Orbitron',monospace]">
                    Club Status
                  </div>
                  <div className="text-[8.5px] text-slate-100 font-medium truncate">
                    10% CTO Pool
                  </div>
                </div>
              </button>

              {/* 6. Level Income */}
              <button
                onClick={() => navigate(AuthenticatedUserRouters.LEVEL_INCOME_HISTORY)}
                className="group px-2 py-1.5 rounded-xl bg-[#181a20] border border-[#2b313a] hover:border-[#0ecb81] text-left transition-all duration-200 hover:scale-[1.02] active:scale-95 shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-[#1e2329] border border-[#2b313a] flex items-center justify-center text-[#0ecb81] font-black shadow-sm shrink-0">
                  <BarChart3 size={11} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-black text-[10.5px] text-white group-hover:text-[#0ecb81] transition truncate font-['Orbitron',monospace]">
                    10-Level
                  </div>
                  <div className="text-[8.5px] text-slate-100 font-medium truncate">
                    20% ($5.00)
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