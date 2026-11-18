import React, { useEffect, useState, useMemo } from "react";
import { useDispatch } from "react-redux";
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
  Share2,
} from "lucide-react";
import { toast } from "react-toastify";
import moment from "moment";

import Pagination from "../../components/Screen/UserPanel/Pagination";
import PartnerCard from "../../components/Screen/UserPanel/PartnerCard";
import StatCard from "../../components/Screen/UserPanel/StatCard";
import { setLoading } from "../../redux/slices/loadingSlice";
import { getDirectUsers, getAllTeamMembers } from "../../api/user.api";
import { NumberFormatCommas } from "../../utils/FormatText";
import { maskWalletAddress } from "../../utils/additionalFunc";

const Teams = () => {
  const dispatch = useDispatch();

  const [teamMembers, setTeamMembers] = useState([]);
  const [totalTeamCount, setTotalTeamCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all"); // "all" | "active" | "inactive"
  const [viewMode, setViewMode] = useState("table"); // "table" | "grid"
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [refreshing, setRefreshing] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);

  // ── Robust Data Extractor ──
  const extractTeamData = (res) => {
    const d = res?.data ?? res;
    if (!d) return { team: [], total: 0 };

    // Case 1: d.team is array
    if (Array.isArray(d.team)) {
      return { team: d.team, total: Number(d.totalTeam ?? d.team.length) };
    }
    // Case 2: d.downlines is array
    if (Array.isArray(d.downlines)) {
      return { team: d.downlines, total: Number(d.totalDownlines ?? d.downlines.length) };
    }
    // Case 3: d.members is array
    if (Array.isArray(d.members)) {
      return { team: d.members, total: Number(d.totalMembers ?? d.members.length) };
    }
    // Case 4: d is array
    if (Array.isArray(d)) {
      return { team: d, total: d.length };
    }

    return { team: [], total: 0 };
  };

  const fetchTeamData = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else dispatch(setLoading(true));

      // Attempt primary endpoint getDirectUsers (/api/user/get-myteams)
      const res = await getDirectUsers();
      let { team, total } = extractTeamData(res);

      // If empty, try fallback endpoint getAllTeamMembers (/api/user/get-all-team-members)
      if (!team || team.length === 0) {
        const fallbackRes = await getAllTeamMembers();
        const fallbackData = extractTeamData(fallbackRes);
        if (fallbackData.team && fallbackData.team.length > 0) {
          team = fallbackData.team;
          total = fallbackData.total;
        }
      }

      setTeamMembers(team || []);
      setTotalTeamCount(total || (team ? team.length : 0));

      if (isManual) {
        toast.success("Downline team list refreshed successfully");
      }
    } catch (error) {
      console.error("Downline team fetch error:", error);
      toast.error("Failed to load downline team members");
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
    if (!teamMembers.length) {
      toast.info("No downline data to export");
      return;
    }

    const headers = ["#", "Member ID", "Username", "Sponsor ID", "Wallet Address", "Investment ($)", "Status", "Joined Date"];
    const rows = filteredMembers.map((m, idx) => [
      idx + 1,
      m.id || m._id || "N/A",
      m.username || "N/A",
      m.sponsor || "N/A",
      m.account || m.walletAddress || "N/A",
      Number(m.investment || m.activeInvestment || 0).toFixed(2),
      (m.active?.isActive === true || Number(m.investment || 0) >= 50) ? "Active" : "Inactive",
      m.createdAt ? moment(m.createdAt).format("YYYY-MM-DD HH:mm") : "N/A",
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Downline_Team_${moment().format("YYYY-MM-DD")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Downline CSV export downloaded");
  };

  // Filter & Search
  const filteredMembers = useMemo(() => {
    return teamMembers.filter((m) => {
      const query = searchQuery.trim().toLowerCase();
      const idMatch = String(m?.id || m?._id || "").toLowerCase().includes(query);
      const userMatch = String(m?.username || "").toLowerCase().includes(query);
      const addrMatch = String(m?.account || m?.walletAddress || "").toLowerCase().includes(query);
      const sponsorMatch = String(m?.sponsor || "").toLowerCase().includes(query);

      if (query && !idMatch && !userMatch && !addrMatch && !sponsorMatch) {
        return false;
      }

      const isActive = Boolean(
        m?.active?.isActive === true ||
        m?.isActive === true ||
        Number(m?.investment || m?.activeInvestment || 0) >= 50
      );

      if (filterType === "active") return isActive;
      if (filterType === "inactive") return !isActive;
      return true;
    });
  }, [teamMembers, searchQuery, filterType]);

  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const visibleMembers = filteredMembers.slice(startIndex, startIndex + itemsPerPage);

  const totalActive = teamMembers.filter(
    (m) => m?.active?.isActive === true || m?.isActive === true || Number(m?.investment || m?.activeInvestment || 0) >= 50
  ).length;
  const totalInactive = teamMembers.length - totalActive;
  const totalTurnover = teamMembers.reduce(
    (acc, m) => acc + Number(m?.investment || m?.activeInvestment || 0),
    0
  );

  const statCards = [
    {
      title: "Total Downline Team",
      value: `${totalTeamCount || teamMembers.length}`,
      icon: "https://img.icons8.com/3d-fluency/94/group.png",
    },
    {
      title: "Active Members ($50+)",
      value: `${totalActive}`,
      icon: "https://img.icons8.com/3d-fluency/94/ok.png",
      highlight: true,
    },
    {
      title: "Inactive Members (<$50)",
      value: `${totalInactive}`,
      icon: "https://img.icons8.com/3d-fluency/94/group--v3.png",
    },
    {
      title: "Total Team Turnover",
      value: `$ ${totalTurnover.toFixed(2)}`,
      icon: "https://img.icons8.com/3d-fluency/94/receive-cash.png",
    },
  ];

  return (
    <div className="space-y-6 mt-4">
      {/* 🚀 Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border border-slate-800 p-6 md:p-8 shadow-2xl backdrop-blur-md">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-bold mb-2">
              <Network size={13} className="text-blue-400" />
              Complete Downline Hierarchy & Team Volume
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              My Downline Team
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl">
              Monitor all downline members across your organization. View real-time active status, member IDs, wallet accounts, and investment contributions.
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

      {/* 🔍 Filter & Search Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-900/70 p-4 rounded-2xl border border-slate-800 backdrop-blur-md">
        {/* Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {[
            { id: "all", label: `All Team (${teamMembers.length})`, icon: Users },
            { id: "active", label: `Active ($50+) (${totalActive})`, icon: UserCheck },
            { id: "inactive", label: `Inactive (${totalInactive})`, icon: UserX },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setFilterType(tab.id);
                  setCurrentPage(1);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  filterType === tab.id
                    ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/20"
                    : "bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 border border-slate-700/50"
                }`}
              >
                <Icon size={13} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* View Mode Toggle & Search */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === "table"
                  ? "bg-cyan-500 text-black shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Table View"
            >
              <TableIcon size={15} />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg text-xs font-bold transition ${
                viewMode === "grid"
                  ? "bg-cyan-500 text-black shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Grid View"
            >
              <LayoutGrid size={15} />
            </button>
          </div>

          {/* Search Box */}
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
      </div>

      {/* 📋 Data Presentation (Table or Grid) */}
      {viewMode === "table" ? (
        <div className="neon-glow-card p-4 sm:p-6 border border-sky-400/40 rounded-3xl overflow-hidden shadow-[0_0_30px_rgba(14,165,233,0.22)] backdrop-blur-xl">
          <div className="overflow-x-auto rounded-2xl border border-sky-500/30 shadow-inner bg-[#040914]/90">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-nowrap divide-x divide-white/10">
                  <th className="py-3.5 px-4 text-xs font-black tracking-wider uppercase split-header-blue">#</th>
                  <th className="py-3.5 px-4 text-xs font-black tracking-wider uppercase split-header-blue">Member Profile</th>
                  <th className="py-3.5 px-4 text-xs font-black tracking-wider uppercase split-header-blue">Member ID</th>
                  <th className="py-3.5 px-4 text-xs font-black tracking-wider uppercase split-header-blue">Wallet Address</th>
                  <th className="py-3.5 px-4 text-xs font-black tracking-wider uppercase split-header-gold">Sponsor ID</th>
                  <th className="py-3.5 px-4 text-xs font-black tracking-wider uppercase split-header-gold text-right">Investment</th>
                  <th className="py-3.5 px-4 text-xs font-black tracking-wider uppercase split-header-gold text-center">Status</th>
                  <th className="py-3.5 px-4 text-xs font-black tracking-wider uppercase split-header-gold">Joined / Activated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-500/15 text-xs sm:text-sm">
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
                    const joinedDate = member.active?.activeDate || member.createdAt;

                    return (
                      <tr
                        key={member._id || memberId || idx}
                        className="hover:bg-sky-950/30 transition-colors border-b border-sky-500/10 text-nowrap"
                      >
                        <td className="py-3.5 px-4 text-slate-400 font-mono">
                          {startIndex + idx + 1}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={`https://api.dicebear.com/8.x/bottts/svg?seed=${member.id || member.username || idx}`}
                              alt={member.username}
                              className="w-9 h-9 rounded-full border border-sky-500/40 bg-slate-950"
                            />
                            <div>
                              <div className="font-bold text-white flex items-center gap-1.5">
                                {member.username || "Team User"}
                                {member.active?.isVerified && (
                                  <ShieldCheck size={13} className="text-sky-400" title="Verified Member" />
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400 truncate max-w-[140px]">
                                {member.referralLink ? `Ref: ${member.referralLink}` : member.email || "Downline Member"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#060e1e] border border-sky-500/30 font-mono text-sky-300">
                            <span>{memberId}</span>
                            <button
                              onClick={() => copyToClipboard(memberId, `id-${memberId}`)}
                              className="text-slate-400 hover:text-white transition cursor-pointer"
                              title="Copy ID"
                            >
                              {copiedKey === `id-${memberId}` ? <Check size={12} className="text-amber-400" /> : <Copy size={12} />}
                            </button>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          {wallet ? (
                            <div className="inline-flex items-center gap-1.5 text-slate-300 font-mono text-xs">
                              <span>{maskWalletAddress(wallet)}</span>
                              <button
                                onClick={() => copyToClipboard(wallet, `wallet-${memberId}`)}
                                className="text-slate-400 hover:text-white transition cursor-pointer"
                                title="Copy Wallet Address"
                              >
                                {copiedKey === `wallet-${memberId}` ? <Check size={12} className="text-amber-400" /> : <Copy size={12} />}
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-500">N/A</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-slate-400 font-mono text-xs">
                            {sponsorId.length > 12 ? maskWalletAddress(sponsorId) : sponsorId}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <span className="font-bold text-amber-300 font-mono">
                            ${investment.toFixed(2)}
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
                                isActive ? "bg-emerald-400" : "bg-rose-400"
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
                    <td colSpan={8} className="py-12 text-center text-slate-500">
                      <Users className="w-10 h-10 mx-auto mb-2 opacity-30 text-sky-400" />
                      <p className="text-sm font-bold text-slate-400">No downline team members found</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {searchQuery ? "No members match your search criteria" : "Start building your team to view members here"}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {visibleMembers.length > 0 ? (
            visibleMembers.map((member, index) => (
              <PartnerCard
                key={member.id || member._id || index}
                partner={member}
                index={startIndex + index}
              />
            ))
          ) : (
            <div className="col-span-full py-16 text-center text-slate-500 bg-slate-900/40 rounded-3xl border border-slate-800/80">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30 text-cyan-400" />
              <p className="text-base font-bold text-slate-300">No downline members found</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {searchQuery
                  ? "No members match your search query."
                  : "Invite partners using your referral link to expand your downline organization."}
              </p>
            </div>
          )}
        </div>
      )}

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

export default Teams;
