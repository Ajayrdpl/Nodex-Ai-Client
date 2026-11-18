import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
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
  Network,
  Crown,
  Layers,
  Award,
  TrendingUp,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-toastify";
import moment from "moment";

import Pagination from "../../components/Screen/UserPanel/Pagination";
import StatCard from "../../components/Screen/UserPanel/StatCard";
import { setLoading } from "../../redux/slices/loadingSlice";
import { getAllTeamMembers, getTeamDivision, getDirectUsers } from "../../api/user.api";
import { NumberFormatCommas } from "../../utils/FormatText";
import { maskWalletAddress } from "../../utils/additionalFunc";

const MyTeamPage = () => {
  const dispatch = useDispatch();
  const loggedUser = useSelector((state) => state?.isLoggedUser);

  const [allMembers, setAllMembers] = useState([]);
  const [divisionData, setDivisionData] = useState(null);
  const [activeTab, setActiveTab] = useState("all"); // "all" | "level1" ... "level15" | "direct"
  const [filterType, setFilterType] = useState("all"); // "all" | "active" | "inactive"
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [refreshing, setRefreshing] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);

  // ── Robust Data Extractor ──
  const extractMembers = (res) => {
    const d = res?.data ?? res;
    if (!d) return [];
    if (Array.isArray(d)) return d;
    if (Array.isArray(d.members)) return d.members;
    if (Array.isArray(d.team)) return d.team;
    if (Array.isArray(d.downlines)) return d.downlines;
    return [];
  };

  const fetchTeamData = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else dispatch(setLoading(true));

      const [membersRes, divRes] = await Promise.allSettled([
        getAllTeamMembers(),
        getTeamDivision(),
      ]);

      let members = [];
      if (membersRes.status === "fulfilled" && (membersRes.value?.success || Array.isArray(membersRes.value?.data))) {
        members = extractMembers(membersRes.value);
      }

      // If all-members is empty, fallback to getDirectUsers
      if (members.length === 0) {
        try {
          const directRes = await getDirectUsers();
          members = extractMembers(directRes);
        } catch (e) {
          console.error("Fallback error:", e);
        }
      }

      setAllMembers(members);

      if (divRes.status === "fulfilled" && divRes.value?.success) {
        setDivisionData(divRes.value.data);
      }

      if (isManual) {
        toast.success("Team business and level data refreshed");
      }
    } catch (error) {
      console.error("Team data fetch error:", error);
      toast.error("Failed to load team data");
    } finally {
      if (isManual) setRefreshing(false);
      else dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    fetchTeamData();
  }, []);

  // Copy helper
  const copyToClipboard = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success(`Copied: ${text}`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Export CSV
  const exportToCSV = () => {
    if (!allMembers.length) {
      toast.info("No member data to export");
      return;
    }

    const headers = ["#", "Member ID", "Username", "Sponsor ID", "Wallet Address", "Level", "Investment ($)", "Status", "Joined Date"];
    const rows = filteredMembers.map((m, idx) => {
      const level = m.level || m.matrixLevel || 1;
      return [
        idx + 1,
        m.id || m._id || "N/A",
        m.username || "N/A",
        m.sponsor || "N/A",
        m.account || m.walletAddress || "N/A",
        `Level ${level}`,
        Number(m.investment || m.activeInvestment || 0).toFixed(2),
        (m.active?.isActive === true || Number(m.investment || 0) >= 50) ? "Active" : "Inactive",
        m.createdAt ? moment(m.createdAt).format("YYYY-MM-DD HH:mm") : "N/A",
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Team_Business_${activeTab}_${moment().format("YYYY-MM-DD")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Team data CSV downloaded");
  };

  // Filter members for activeTab and search
  const filteredMembers = useMemo(() => {
    return allMembers.filter((m) => {
      // 1. Tab Filter
      if (activeTab === "direct") {
        const isDirect = m.sponsor === loggedUser?._id || m.sponsor === loggedUser?.id || m.matrixLevel === 1 || m.level === 1;
        if (!isDirect && allMembers.length > 0) {
          // If no sponsor match is found, treat level 1 as direct
          if (m.level !== 1 && m.matrixLevel !== 1) return false;
        }
      } else if (activeTab.startsWith("level")) {
        const targetLevel = parseInt(activeTab.replace("level", ""), 10);
        const memberLevel = m.level || m.matrixLevel || 1;
        if (memberLevel !== targetLevel) return false;
      }

      // 2. Status Filter
      const isActive = Boolean(
        m?.active?.isActive === true ||
        m?.isActive === true ||
        Number(m?.investment || m?.activeInvestment || 0) >= 50
      );
      if (filterType === "active" && !isActive) return false;
      if (filterType === "inactive" && isActive) return false;

      // 3. Search Filter
      const query = searchQuery.trim().toLowerCase();
      if (query) {
        const idMatch = String(m?.id || m?._id || "").toLowerCase().includes(query);
        const userMatch = String(m?.username || "").toLowerCase().includes(query);
        const addrMatch = String(m?.account || m?.walletAddress || "").toLowerCase().includes(query);
        const sponsorMatch = String(m?.sponsor || "").toLowerCase().includes(query);
        if (!idMatch && !userMatch && !addrMatch && !sponsorMatch) return false;
      }

      return true;
    });
  }, [allMembers, activeTab, filterType, searchQuery, loggedUser]);

  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const visibleMembers = filteredMembers.slice(startIndex, startIndex + itemsPerPage);

  // Overall Statistics
  const totalTeamSize = allMembers.length;
  const totalActive = allMembers.filter(
    (m) => m?.active?.isActive === true || m?.isActive === true || Number(m?.investment || m?.activeInvestment || 0) >= 50
  ).length;
  const totalInactive = totalTeamSize - totalActive;
  const totalTeamBusiness = allMembers.reduce(
    (acc, m) => acc + Number(m?.investment || m?.activeInvestment || 0),
    0
  );

  // Tab generation for 15 Levels
  const levelTabs = useMemo(() => {
    const tabs = [
      { id: "all", label: "All Members", count: allMembers.length, icon: Users },
      {
        id: "direct",
        label: "Direct (L1)",
        count: allMembers.filter(
          (m) => m.level === 1 || m.matrixLevel === 1 || m.sponsor === loggedUser?._id || m.sponsor === loggedUser?.id
        ).length,
        icon: Award,
      },
    ];

    for (let lvl = 1; lvl <= 15; lvl++) {
      const count = allMembers.filter((m) => (m.level || m.matrixLevel || 1) === lvl).length;
      tabs.push({
        id: `level${lvl}`,
        label: `Level ${lvl}`,
        count: count,
        icon: Layers,
      });
    }

    return tabs;
  }, [allMembers, loggedUser]);

  const statCards = [
    {
      title: "Total Team Members",
      value: `${totalTeamSize}`,
      icon: "https://img.icons8.com/3d-fluency/94/group.png",
    },
    {
      title: "Active Team ($50+)",
      value: `${totalActive}`,
      icon: "https://img.icons8.com/3d-fluency/94/ok.png",
      highlight: true,
    },
    {
      title: "Inactive Team (<$50)",
      value: `${totalInactive}`,
      icon: "https://img.icons8.com/3d-fluency/94/group--v3.png",
    },
    {
      title: "Total Team Turnover",
      value: `$ ${totalTeamBusiness.toFixed(2)}`,
      icon: "https://img.icons8.com/3d-fluency/94/receive-cash.png",
    },
  ];

  const getLevelBadgeColor = (level) => {
    if (level === 1) return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    if (level <= 3) return "bg-cyan-500/20 text-cyan-400 border-cyan-500/30";
    if (level <= 6) return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    if (level <= 10) return "bg-indigo-500/20 text-indigo-400 border-indigo-500/30";
    if (level <= 15) return "bg-purple-500/20 text-purple-400 border-purple-500/30";
    return "bg-slate-700/40 text-slate-300 border-slate-600";
  };

  return (
    <div className="space-y-6 mt-4">
      {/* 🚀 Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border border-slate-800 p-6 md:p-8 shadow-2xl backdrop-blur-md">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-bold mb-2">
              <Sparkles size={13} className="text-cyan-400" />
              15-Level Generation Team Network & Business Volume
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Team Business & Level Breakdown
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl">
              Inspect your 15-Level unilevel generation structure. Track turnover by generation depth and ensure maximum qualification for daily level income bonuses.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={exportToCSV}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
              title="Download CSV"
            >
              <Download size={14} className="text-slate-400" />
              Export CSV
            </button>

            <button
              onClick={() => fetchTeamData(true)}
              disabled={refreshing}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold text-xs flex items-center gap-1.5 transition shadow-lg shadow-cyan-500/20 active:scale-95 cursor-pointer"
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* 📊 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((item) => (
          <StatCard
            key={item.title}
            title={item.title}
            value={item.value}
            iconImage={item.icon}
            highlight={item.highlight}
          />
        ))}
      </div>

      {/* 🧭 Level Navigation Tabs (Horizontal Scroll) */}
      <div className="bg-slate-900/70 backdrop-blur-md border border-slate-800 rounded-2xl p-2.5">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-700">
          {levelTabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setCurrentPage(1);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex-shrink-0 cursor-pointer ${
                  isSelected
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-black shadow-lg shadow-cyan-500/20"
                    : "bg-slate-950/60 text-slate-400 hover:text-white hover:bg-slate-800/80 border border-slate-800/60"
                }`}
              >
                <Icon size={13} className={isSelected ? "text-black" : "text-cyan-400"} />
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    isSelected ? "bg-black/20 text-black" : "bg-slate-800 text-slate-300"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 🔍 Search & Status Filter Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-900/70 p-4 rounded-2xl border border-slate-800 backdrop-blur-md">
        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {[
            { id: "all", label: `All in Tab (${filteredMembers.length})`, icon: Users },
            { id: "active", label: "Active ($50+)", icon: UserCheck },
            { id: "inactive", label: "Inactive (<$50)", icon: UserX },
          ].map((status) => {
            const Icon = status.icon;
            return (
              <button
                key={status.id}
                onClick={() => {
                  setFilterType(status.id);
                  setCurrentPage(1);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  filterType === status.id
                    ? "bg-cyan-500 text-black shadow-md shadow-cyan-500/20"
                    : "bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 border border-slate-700/50"
                }`}
              >
                <Icon size={12} />
                {status.label}
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by ID, username, address..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition"
          />
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        </div>
      </div>

      {/* 📋 Team Members Table */}
      <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                <th className="py-3.5 px-4">#</th>
                <th className="py-3.5 px-4">Member</th>
                <th className="py-3.5 px-4">Member ID</th>
                <th className="py-3.5 px-4">Level</th>
                <th className="py-3.5 px-4">Wallet Address</th>
                <th className="py-3.5 px-4">Sponsor ID</th>
                <th className="py-3.5 px-4 text-right">Investment</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {visibleMembers.length > 0 ? (
                visibleMembers.map((member, idx) => {
                  const isActive = Boolean(
                    member.active?.isActive === true ||
                    member.isActive === true ||
                    Number(member.investment || member.activeInvestment || 0) >= 50
                  );
                  const investment = Number(member.investment || member.activeInvestment || 0);
                  const wallet = member.account || member.walletAddress || "";
                  const memberId = member.id || member._id || "N/A";
                  const sponsorId = member.sponsor || "N/A";
                  const level = member.level || member.matrixLevel || 1;
                  const joinedDate = member.active?.activeDate || member.createdAt;

                  return (
                    <tr
                      key={member._id || memberId || idx}
                      className="hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-4 text-slate-500 font-medium">
                        {startIndex + idx + 1}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={`https://api.dicebear.com/8.x/bottts/svg?seed=${member.id || member.username || idx}`}
                            alt={member.username}
                            className="w-9 h-9 rounded-full border border-slate-700 bg-slate-950"
                          />
                          <div>
                            <div className="font-bold text-white flex items-center gap-1.5">
                              {member.username || "Team Member"}
                              {member.active?.isVerified && (
                                <ShieldCheck size={13} className="text-cyan-400" title="Verified" />
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate max-w-[140px]">
                              {member.referralLink ? `Ref: ${member.referralLink}` : member.email || "Member"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 font-mono text-cyan-300">
                          <span>{memberId}</span>
                          <button
                            onClick={() => copyToClipboard(memberId, `id-${memberId}`)}
                            className="text-slate-500 hover:text-white transition"
                            title="Copy ID"
                          >
                            {copiedKey === `id-${memberId}` ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getLevelBadgeColor(level)}`}>
                          Level {level}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {wallet ? (
                          <div className="inline-flex items-center gap-1.5 text-slate-300 font-mono">
                            <span>{maskWalletAddress(wallet)}</span>
                            <button
                              onClick={() => copyToClipboard(wallet, `wallet-${memberId}`)}
                              className="text-slate-500 hover:text-white transition"
                              title="Copy Wallet Address"
                            >
                              {copiedKey === `wallet-${memberId}` ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-500">N/A</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-slate-400 font-mono text-[11px]">
                          {sponsorId.length > 12 ? maskWalletAddress(sponsorId) : sponsorId}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-bold text-emerald-400 font-mono">
                          ${investment.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            isActive
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-red-500/10 text-red-400 border border-red-500/20"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isActive ? "bg-emerald-400 animate-pulse" : "bg-red-400"
                            }`}
                          />
                          {isActive ? "Active ($50+)" : "Inactive"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-xs">
                        {joinedDate ? moment(joinedDate).format("DD MMM YYYY, HH:mm") : "N/A"}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-slate-500">
                    <Users className="w-10 h-10 mx-auto mb-2 opacity-30 text-cyan-400" />
                    <p className="text-sm font-bold text-slate-400">No team members found in {activeTab}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {searchQuery ? "Try clearing the search query." : "Members will show here once your organization expands."}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 📄 Pagination */}
      {filteredMembers.length > itemsPerPage && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        />
      )}
    </div>
  );
};

export default MyTeamPage;
