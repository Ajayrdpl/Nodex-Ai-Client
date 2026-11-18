import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import {
  Users,
  UserCheck,
  UserX,
  Search,
  RefreshCw,
  Copy,
  Check,
  Download,
  DollarSign,
  Calendar,
  ShieldCheck,
  LayoutGrid,
  Table as TableIcon,
  Sparkles,
  Zap,
  TrendingUp,
  Share2,
  Filter,
  ArrowUpDown,
  Mail,
  Phone,
  Layers,
} from "lucide-react";
import { toast } from "react-toastify";
import moment from "moment";

import Pagination from "../../components/Screen/UserPanel/Pagination";
import PartnerCard from "../../components/Screen/UserPanel/PartnerCard";
import StatCard from "../../components/Screen/UserPanel/StatCard";
import { setLoading } from "../../redux/slices/loadingSlice";
import {
  getReferralPartners,
  getIncomeSummaryApi,
  getUserProfileApi,
} from "../../api/user.api";
import { NumberFormatCommas } from "../../utils/FormatText";
import { maskWalletAddress } from "../../utils/additionalFunc";

const Referrals = () => {
  const location = useLocation();
  const navData = location?.state;
  const dispatch = useDispatch();

  const authUser = useSelector((state) => state?.isLoggedUser?.user);

  const [partners, setPartners] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState(
    navData === "active" ? "active" : navData === "inactive" ? "inactive" : "all"
  );
  const [sortBy, setSortBy] = useState("newest"); // "newest" | "oldest" | "investment-high" | "investment-low" | "roi-high" | "name-asc"
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "table"
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(viewMode === "grid" ? 9 : 10);
  const [refreshing, setRefreshing] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [copiedRefLink, setCopiedRefLink] = useState(false);

  // ── Robust Data Extractor ──
  const extractPartnersData = (res) => {
    if (!res) return [];

    const resData = res?.data ?? res;
    if (!resData) return [];

    // Case 1: resData is directly an array of partner items
    if (Array.isArray(resData)) {
      // Check if it's a wrapper array where resData[0] has populated partners
      if (
        resData.length === 1 &&
        resData[0] &&
        Array.isArray(resData[0].partners) &&
        resData[0].partners.length > 0 &&
        (resData[0].partners[0]?._id || resData[0].partners[0]?.username)
      ) {
        return resData[0].partners;
      }
      return resData;
    }

    // Case 2: resData is an object with partners array
    if (typeof resData === "object") {
      if (Array.isArray(resData.data)) return resData.data;
      if (Array.isArray(resData.partners)) return resData.partners;
      if (Array.isArray(resData.directPartners)) return resData.directPartners;
      if (Array.isArray(resData.team)) return resData.team;
    }

    return [];
  };

  const fetchData = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else dispatch(setLoading(true));

      const [partnersRes, summaryRes, profileRes] = await Promise.allSettled([
        getReferralPartners(),
        getIncomeSummaryApi(),
        getUserProfileApi(),
      ]);

      // 1. Process Direct Partners List
      if (partnersRes.status === "fulfilled") {
        const val = partnersRes.value;
        if (val?.success !== false) {
          const list = extractPartnersData(val);
          setPartners(Array.isArray(list) ? list : []);
        } else {
          setPartners([]);
        }
      } else {
        setPartners([]);
      }

      // 2. Process Summary
      if (summaryRes.status === "fulfilled" && summaryRes.value?.success) {
        setSummaryData(summaryRes.value.data);
      }

      // 3. Process Profile
      if (profileRes.status === "fulfilled") {
        const pData = profileRes.value?.data || profileRes.value;
        if (pData) setUserProfile(pData);
      }

      if (isManual) {
        toast.success("Direct partners list refreshed successfully");
      }
    } catch (error) {
      console.error("Partners fetch error:", error);
      toast.error("Failed to load direct partners");
    } finally {
      if (isManual) setRefreshing(false);
      else dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update items per page when view mode changes
  useEffect(() => {
    setItemsPerPage(viewMode === "grid" ? 9 : 10);
    setCurrentPage(1);
  }, [viewMode]);

  // Copy helper
  const copyToClipboard = (text, idKey, label = "Text") => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(idKey);
    toast.success(`Copied ${label}: ${text}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Referral Link Generator
  const userOwnId =
    userProfile?.referralLink ||
    userProfile?.id ||
    authUser?.referralLink ||
    authUser?.id ||
    authUser?._id ||
    "";
  const origin = window.location.origin;
  const referralLink = userOwnId ? `${origin}/register?referral=${encodeURIComponent(userOwnId)}` : "";

  const copyReferralLink = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopiedRefLink(true);
    toast.success("Referral link copied to clipboard!");
    setTimeout(() => setCopiedRefLink(false), 2000);
  };

  // Export to CSV
  const exportToCSV = () => {
    if (!partners.length) {
      toast.info("No data available to export");
      return;
    }

    const headers = [
      "Index",
      "Member ID",
      "Username",
      "Email",
      "Mobile",
      "Wallet Address",
      "Self Investment ($)",
      "Total ROI Earned ($)",
      "Matrix Slot",
      "Status",
      "Booster Active",
      "Joined Date",
      "Activation Date",
    ];

    const rows = sortedAndFilteredPartners.map((p, idx) => {
      const inv = Number(p.investment || p.activeInvestment || 0);
      const isAct = Boolean(p.active?.isActive === true || inv >= 50);
      return [
        idx + 1,
        p.id || p._id || "N/A",
        p.username || "N/A",
        p.email || "N/A",
        p.mobile || "N/A",
        p.account || p.walletAddress || "N/A",
        inv.toFixed(2),
        Number(p.earnings?.totalRoi || 0).toFixed(2),
        p.matrixLevel ? `L${p.matrixLevel}-P${p.matrixPosition || 1}` : "N/A",
        isAct ? "ACTIVE" : "INACTIVE",
        p.boosterActive ? "YES" : "NO",
        p.createdAt ? moment(p.createdAt).format("YYYY-MM-DD HH:mm") : "N/A",
        p.active?.activeDate ? moment(p.active.activeDate).format("YYYY-MM-DD HH:mm") : "N/A",
      ];
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.map((val) => `"${val}"`).join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Direct_Partners_${moment().format("YYYY-MM-DD")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV export downloaded successfully");
  };

  // Filter & Search & Sort Pipeline
  const sortedAndFilteredPartners = useMemo(() => {
    let result = partners.filter((user) => {
      const query = searchQuery.trim().toLowerCase();
      const idMatch = String(user?.id || user?._id || "").toLowerCase().includes(query);
      const userMatch = String(user?.username || "").toLowerCase().includes(query);
      const addrMatch = String(user?.account || user?.walletAddress || "").toLowerCase().includes(query);
      const emailMatch = String(user?.email || "").toLowerCase().includes(query);
      const mobileMatch = String(user?.mobile || "").toLowerCase().includes(query);

      if (query && !idMatch && !userMatch && !addrMatch && !emailMatch && !mobileMatch) {
        return false;
      }

      const inv = Number(user?.investment || user?.activeInvestment || 0);
      const isActive = Boolean(
        user?.active?.isActive === true ||
        user?.isActive === true ||
        inv >= 50
      );

      if (filterType === "active") return isActive;
      if (filterType === "inactive") return !isActive;
      if (filterType === "high") return inv >= 300;
      if (filterType === "booster") return user?.boosterActive === true;
      return true;
    });

    // Apply Sorting
    result.sort((a, b) => {
      const invA = Number(a.investment || a.activeInvestment || 0);
      const invB = Number(b.investment || b.activeInvestment || 0);
      const roiA = Number(a.earnings?.totalRoi || 0);
      const roiB = Number(b.earnings?.totalRoi || 0);
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();

      switch (sortBy) {
        case "newest":
          return dateB - dateA;
        case "oldest":
          return dateA - dateB;
        case "investment-high":
          return invB - invA;
        case "investment-low":
          return invA - invB;
        case "roi-high":
          return roiB - roiA;
        case "name-asc":
          return String(a.username || "").localeCompare(String(b.username || ""));
        default:
          return 0;
      }
    });

    return result;
  }, [partners, searchQuery, filterType, sortBy]);

  const totalPages = Math.ceil(sortedAndFilteredPartners.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const visiblePartners = sortedAndFilteredPartners.slice(startIndex, startIndex + itemsPerPage);

  // Real-time Metrics Calculation
  const totalActive = partners.filter(
    (p) =>
      p?.active?.isActive === true ||
      p?.isActive === true ||
      Number(p?.investment || p?.activeInvestment || 0) >= 50
  ).length;
  const totalInactive = partners.length - totalActive;

  const totalDirectBusiness = partners.reduce(
    (acc, curr) => acc + Number(curr.investment || curr.activeInvestment || 0),
    0
  );

  const totalDirectRoi = partners.reduce(
    (acc, curr) => acc + Number(curr.earnings?.totalRoi || 0),
    0
  );

  const cardData = [
    {
      title: "Total Direct Partners",
      value: `${partners.length}`,
      icon: "https://img.icons8.com/3d-fluency/94/group.png",
    },
    {
      title: "Active Partners ($50+)",
      value: `${totalActive}`,
      icon: "https://img.icons8.com/3d-fluency/94/ok.png",
      highlight: true,
    },
    {
      title: "Inactive Partners (<$50)",
      value: `${totalInactive}`,
      icon: "https://img.icons8.com/3d-fluency/94/group--v3.png",
    },
    {
      title: "Direct Team Business",
      value: `$ ${totalDirectBusiness.toFixed(2)}`,
      icon: "https://img.icons8.com/3d-fluency/94/receive-cash.png",
    },
    {
      title: "Direct ROI Distributed",
      value: `$ ${totalDirectRoi.toFixed(2)}`,
      icon: "https://img.icons8.com/3d-fluency/94/money-bag.png",
    },
  ];

  return (
    <div className="space-y-6 mt-4 pb-12">
      {/* 🚀 Header Card with Referral Link Box */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border border-slate-800 p-6 md:p-8 shadow-2xl backdrop-blur-md">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mb-20" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-bold mb-2">
              <Sparkles size={13} className="text-cyan-400 animate-pulse" />
              Direct Referral Network & Level Qualifiers
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              My Direct Partners
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Track and manage all your direct sponsored members in real time. Each active direct partner ($50+ investment) unlocks generation levels and booster acceleration.
            </p>

            {/* Quick Referral Link Banner */}
            {referralLink && (
              <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-slate-950/70 border border-slate-800 p-1.5 sm:p-2 rounded-2xl max-w-xl">
                <div className="flex items-center gap-2 px-2 text-xs text-slate-400 font-mono truncate">
                  <Share2 size={13} className="text-cyan-400 flex-shrink-0" />
                  <span className="truncate">{referralLink}</span>
                </div>
                <button
                  onClick={copyReferralLink}
                  className="sm:ml-auto px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-cyan-500/20 active:scale-95 cursor-pointer flex-shrink-0"
                >
                  {copiedRefLink ? (
                    <>
                      <Check size={13} className="text-black" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={13} /> Copy Link
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2.5 flex-wrap self-end lg:self-center">
            <button
              onClick={exportToCSV}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-sm"
              title="Download CSV report"
            >
              <Download size={14} className="text-slate-400" />
              Export CSV
            </button>

            <button
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-cyan-500/20 active:scale-95 cursor-pointer"
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>
      </div>

      {/* 📊 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {cardData.map((item) => (
          <StatCard
            key={item.title}
            title={item.title}
            value={item.value}
            iconImage={item.icon}
            highlight={item.highlight}
          />
        ))}
      </div>

      {/* 🔍 Filter, Sort, View Toggle and Search Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 bg-slate-900/70 p-4 rounded-2xl border border-slate-800 backdrop-blur-md">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "all", label: `All (${partners.length})`, icon: Users },
            { id: "active", label: `Active ($50+) (${totalActive})`, icon: UserCheck },
            { id: "inactive", label: `Inactive (${totalInactive})`, icon: UserX },
            {
              id: "high",
              label: `High ($300+) (${partners.filter((p) => Number(p.investment || p.activeInvestment || 0) >= 300).length})`,
              icon: DollarSign,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setFilterType(tab.id);
                  setCurrentPage(1);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filterType === tab.id
                    ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/20 font-black"
                    : "bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 border border-slate-700/50"
                }`}
              >
                <Icon size={13} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* View Mode, Sort Dropdown & Search */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Sorting Dropdown */}
          <div className="relative w-full sm:w-auto">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full sm:w-44 bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs text-slate-200 outline-none focus:border-cyan-400 transition cursor-pointer appearance-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="investment-high">Investment: High to Low</option>
              <option value="investment-low">Investment: Low to High</option>
              <option value="roi-high">ROI: High to Low</option>
              <option value="name-asc">Username: A to Z</option>
            </select>
            <ArrowUpDown
              size={12}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 self-end sm:self-auto">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === "grid"
                  ? "bg-cyan-500 text-black shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Grid View"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === "table"
                  ? "bg-cyan-500 text-black shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Table View"
            >
              <TableIcon size={15} />
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by ID, username, wallet..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition"
            />
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          </div>
        </div>
      </div>

      {/* 📋 Data Presentation (Grid or Table) */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {visiblePartners.length > 0 ? (
            visiblePartners.map((partner, index) => (
              <PartnerCard
                key={partner.id || partner._id || index}
                partner={partner}
                index={startIndex + index}
              />
            ))
          ) : (
            <div className="col-span-full py-16 text-center text-slate-500 bg-slate-900/40 rounded-3xl border border-slate-800/80 p-6">
              <Users className="w-14 h-14 mx-auto mb-3 opacity-30 text-cyan-400" />
              <p className="text-base font-bold text-slate-200">No Direct Partners Found</p>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
                {searchQuery
                  ? "No partners match your current search query. Try clearing the search filter."
                  : "You do not have any direct partners registered yet. Share your referral link with friends to grow your team."}
              </p>
              {referralLink && !searchQuery && (
                <button
                  onClick={copyReferralLink}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs transition cursor-pointer shadow-lg shadow-cyan-500/20"
                >
                  <Copy size={13} /> Copy My Referral Link
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Table View */
        <div className="neon-glow-card p-4 sm:p-6 border border-sky-400/40 rounded-3xl overflow-hidden shadow-[0_0_30px_rgba(14,165,233,0.22)] backdrop-blur-xl">
          <div className="overflow-x-auto rounded-2xl border border-sky-500/30 shadow-inner bg-[#040914]/90">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-nowrap divide-x divide-white/10">
                  <th className="py-3.5 px-4 text-xs font-black tracking-wider uppercase split-header-blue">#</th>
                  <th className="py-3.5 px-4 text-xs font-black tracking-wider uppercase split-header-blue">Partner Profile</th>
                  <th className="py-3.5 px-4 text-xs font-black tracking-wider uppercase split-header-blue">Member ID</th>
                  <th className="py-3.5 px-4 text-xs font-black tracking-wider uppercase split-header-blue">Wallet Address</th>
                  <th className="py-3.5 px-4 text-xs font-black tracking-wider uppercase split-header-gold text-right">Investment</th>
                  <th className="py-3.5 px-4 text-xs font-black tracking-wider uppercase split-header-gold text-right">Total ROI</th>
                  <th className="py-3.5 px-4 text-xs font-black tracking-wider uppercase split-header-gold text-center">Matrix Slot</th>
                  <th className="py-3.5 px-4 text-xs font-black tracking-wider uppercase split-header-gold text-center">Status</th>
                  <th className="py-3.5 px-4 text-xs font-black tracking-wider uppercase split-header-gold">Joined / Activated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-500/15 text-xs sm:text-sm">
                {visiblePartners.length > 0 ? (
                  visiblePartners.map((partner, idx) => {
                    const investment = Number(partner.investment || partner.activeInvestment || 0);
                    const isActive = Boolean(
                      partner.active?.isActive === true ||
                      partner.isActive === true ||
                      investment >= 50
                    );
                    const totalRoi = Number(partner.earnings?.totalRoi ?? 0);
                    const wallet = partner.account || partner.walletAddress || "";
                    const partnerId = partner.id || partner._id || "N/A";
                    const joinedDate = partner.active?.activeDate || partner.createdAt;

                    return (
                      <tr
                        key={partner._id || partnerId || idx}
                        className="hover:bg-sky-950/30 transition-colors border-b border-sky-500/10 text-nowrap"
                      >
                        <td className="py-3.5 px-4 text-slate-400 font-mono">
                          {startIndex + idx + 1}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={`https://api.dicebear.com/8.x/bottts/svg?seed=${partner.id || partner.username || idx}`}
                              alt={partner.username}
                              className="w-9 h-9 rounded-full border border-sky-500/40 bg-slate-950 shadow-sm"
                            />
                            <div>
                              <div className="font-bold text-white flex items-center gap-1.5">
                                {partner.username || "User"}
                                {partner.active?.isVerified && (
                                  <ShieldCheck size={13} className="text-sky-400" title="Verified Member" />
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400 truncate max-w-[160px] flex items-center gap-1">
                                {partner.email || partner.mobile || "No Contact"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#060e1e] border border-sky-500/30 font-mono text-sky-300">
                            <span>{partnerId}</span>
                            <button
                              onClick={() => copyToClipboard(partnerId, `id-${partnerId}`, "Member ID")}
                              className="text-slate-400 hover:text-white transition cursor-pointer p-0.5"
                              title="Copy ID"
                            >
                              {copiedId === `id-${partnerId}` ? (
                                <Check size={12} className="text-amber-400" />
                              ) : (
                                <Copy size={12} />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          {wallet ? (
                            <div className="inline-flex items-center gap-1.5 text-slate-300 font-mono text-xs">
                              <span>{maskWalletAddress(wallet)}</span>
                              <button
                                onClick={() => copyToClipboard(wallet, `wallet-${partnerId}`, "Wallet")}
                                className="text-slate-400 hover:text-white transition cursor-pointer p-0.5"
                                title="Copy Wallet Address"
                              >
                                {copiedId === `wallet-${partnerId}` ? (
                                  <Check size={12} className="text-amber-400" />
                                ) : (
                                  <Copy size={12} />
                                )}
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-500">N/A</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <span className="font-bold text-emerald-400 font-mono">
                            ${investment.toFixed(2)}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <span className="font-bold text-amber-300 font-mono">
                            ${totalRoi.toFixed(2)}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="text-slate-300 font-mono text-xs px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                            {partner.matrixLevel ? `L${partner.matrixLevel}-P${partner.matrixPosition || 1}` : "Standard"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              isActive
                                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isActive ? "bg-emerald-400 animate-pulse" : "bg-rose-400"
                              }`}
                            />
                            {isActive ? "Active ($50+)" : "Inactive"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 font-mono text-xs">
                          {joinedDate ? moment(joinedDate).format("DD MMM YYYY, HH:mm") : "N/A"}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-500">
                      <Users className="w-10 h-10 mx-auto mb-2 opacity-30 text-sky-400" />
                      <p className="text-sm font-bold text-slate-400">No direct partners found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 📄 Pagination */}
      {sortedAndFilteredPartners.length > itemsPerPage && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        />
      )}
    </div>
  );
};

export default Referrals;
