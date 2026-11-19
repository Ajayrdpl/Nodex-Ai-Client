import { NavLink as RouterNavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { maskWalletAddress } from "../../../utils/additionalFunc";
import {
  AuthenticatedAdminRouters,
  AuthenticatedUserRouters,
  LandingRouters,
} from "../../../constants/routes";
import { MainContent } from "../../../constants/mainContent";
import { logoutUser } from "../../../redux/slices/authSlice";

const NavLink = ({ to, icon, text, badge, hasNotification = false, onClose }) => {
  return (
    <RouterNavLink
      to={to}
      end={to === AuthenticatedUserRouters.DASHBOARD || to === AuthenticatedAdminRouters.ADMIN_DASHBOARD}
      onClick={onClose}
      className={({ isActive }) => `
        group flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl relative
        transition-all duration-200 ease-in-out cursor-pointer text-xs font-bold
        ${isActive
          ? "text-amber-300 bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
          : "text-slate-100 hover:text-cyan-300 hover:bg-[#0a1833]/80 border border-transparent hover:border-cyan-500/25"
        }
      `}
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute left-0 top-2 bottom-2 w-1 bg-gradient-to-b from-amber-400 to-yellow-300 rounded-r-full shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
          )}

          <i className={`${icon} w-4 text-center text-xs transition-colors ${isActive ? "text-amber-400" : "text-cyan-400/80 group-hover:text-cyan-300"}`} />
          <span className="truncate text-white font-medium">{text}</span>

          {badge && (
            <span className="ml-auto px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-cyan-950/70 text-cyan-300 border border-cyan-500/40 tracking-wider font-mono">
              {badge}
            </span>
          )}

          {hasNotification && !badge && (
            <span className="ml-auto bg-rose-500 text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold text-white shadow-[0_0_8px_rgba(244,63,94,0.6)]">
              1
            </span>
          )}
        </>
      )}
    </RouterNavLink>
  );
};

const SidebarDropdown = ({
  icon,
  text,
  children,
  id,
  openDropdown,
  setOpenDropdown,
}) => {
  const isOpen = openDropdown === id;

  const toggleDropdown = () => {
    setOpenDropdown(isOpen ? null : id);
  };

  return (
    <div className="w-full">
      <button
        onClick={toggleDropdown}
        className={`
          group flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold text-nowrap
          text-left text-slate-100 hover:text-cyan-300 hover:bg-[#0a1833]/80
          transition-all cursor-pointer border border-transparent hover:border-cyan-500/25
          ${isOpen ? "text-amber-300 bg-[#09172f] border-cyan-500/30 font-bold" : ""}
        `}
      >
        <span className="flex items-center gap-3.5">
          <i className={`${icon} w-4 text-center text-xs transition-colors ${isOpen ? "text-amber-400" : "text-cyan-400/80 group-hover:text-cyan-300"}`}></i>
          <span className="text-white font-medium">{text}</span>
        </span>
        <i
          className={`fa-solid fa-chevron-${isOpen ? "up" : "down"} text-[10px] ${isOpen ? "text-amber-400" : "text-cyan-400/60"}`}
        ></i>
      </button>
      <div
        className={`pl-3 mt-1 space-y-1 transition-all duration-300 ease-in-out ${isOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0 overflow-hidden"
          }`}
      >
        {children}
      </div>
    </div>
  );
};

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [openDropdown, setOpenDropdown] = useState(null);
  const role = useSelector((state) => state?.isLoggedUser?.role);
  const userInfo = useSelector((state) => state?.userInfo?.userInfo);

  const handleNavigate = () => {
    if (role === "ADMIN") {
      navigate(AuthenticatedAdminRouters.ADMIN_DASHBOARD);
    } else if (role === "USER") {
      navigate(AuthenticatedUserRouters.DASHBOARD);
    }
  };

  const logoutHandler = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, logout",
      cancelButtonText: "No, cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(logoutUser());
        toast.success("Logged out successfully");
        navigate(LandingRouters.USER_LOGIN);
      }
    });
  };

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-40 w-64 p-4 flex flex-col
        transform transition-transform duration-300 ease-in-out 
        bg-[#060d1a]/95 backdrop-blur-2xl border-r border-cyan-500/20 shadow-[0_0_35px_rgba(0,0,0,0.8)]
        ${isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}
        lg:relative lg:translate-x-0
      `}
    >
      {/* Top Cyber Accent Line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-amber-400 to-emerald-400"></div>

      {/* Brand Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-cyan-500/20 relative pt-1">
        <div
          onClick={() => {
            handleNavigate();
            onClose();
          }}
          className="flex items-center gap-2.5 p-2 rounded-2xl bg-gradient-to-r from-[#09172f] to-[#040a14] border border-cyan-500/30 cursor-pointer hover:border-cyan-400/60 shadow-[0_0_15px_rgba(0,210,255,0.15)] transition-all duration-200 w-full"
        >
          <img
            src={MainContent.shortLogo}
            alt="NODEXAI Logo"
            className="h-9 w-9 rounded-full object-cover border border-cyan-400/50 shadow-[0_0_10px_rgba(0,210,255,0.3)] shrink-0"
          />
          <div className="min-w-0 flex-1">
            <span className="text-xs font-black bg-gradient-to-r from-cyan-400 via-white to-amber-300 bg-clip-text text-transparent font-['Orbitron',sans-serif] tracking-wider block truncate">
              {MainContent.appName}
            </span>
            <span className="text-[9px] text-cyan-300 font-mono tracking-wider block">
              {role === "ADMIN" ? "ADMIN CONSOLE" : "TRADING TERMINAL"}
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden text-slate-300 hover:text-cyan-300 text-xl p-1.5 hover:bg-[#09172f] rounded-xl ml-2 cursor-pointer transition-colors"
        >
          ×
        </button>
      </div>

      <nav className="flex-grow space-y-1 overflow-y-auto pr-1 custom-scrollbar">
        {role === "USER" && (
          <>
            {/* 1. Dashboard */}
            <NavLink
              to={AuthenticatedUserRouters.DASHBOARD}
              icon="fa-solid fa-gauge-high"
              text="Dashboard"
              onClose={() => {
                onClose();
                setOpenDropdown(null);
              }}
            />

            {/* 2. My Team (Direct, Tree, Level Team 1-15) */}
            <SidebarDropdown
              id="my-team"
              icon="fa-solid fa-users"
              text="My Team"
              openDropdown={openDropdown}
              setOpenDropdown={setOpenDropdown}
            >
              <NavLink
                to={AuthenticatedUserRouters.MY_REFERRALS}
                icon="fa-solid fa-user-plus"
                text="Direct"
                onClose={() => {
                  onClose();
                  setOpenDropdown(null);
                }}
              />
              <NavLink
                to={AuthenticatedUserRouters.MATRIX_TREE}
                icon="fa-solid fa-sitemap"
                text="Tree (Genealogy)"
                badge="3-LEG"
                onClose={() => {
                  onClose();
                  setOpenDropdown(null);
                }}
              />
              <NavLink
                to={AuthenticatedUserRouters.MY_TEAM}
                icon="fa-solid fa-layer-group"
                text="Level Team (1-10)"
                onClose={() => {
                  onClose();
                  setOpenDropdown(null);
                }}
              />
              <NavLink
                to={AuthenticatedUserRouters.MY_TEAM_DIVISION}
                icon="fa-solid fa-chart-pie"
                text="Team Business"
                onClose={() => {
                  onClose();
                  setOpenDropdown(null);
                }}
              />
            </SidebarDropdown>

            {/* 3. Deposit (NODEXAI $25 Package, Node Wonder, Re-Invest) */}
            <SidebarDropdown
              id="deposit"
              icon="fa-solid fa-wallet"
              text="Deposit & Packages"
              openDropdown={openDropdown}
              setOpenDropdown={setOpenDropdown}
            >
              <NavLink
                to={AuthenticatedUserRouters.INVEST}
                icon="fa-solid fa-cubes"
                text="NODEXAI Package"
                badge="$25"
                onClose={() => {
                  onClose();
                  setOpenDropdown(null);
                }}
              />
              <NavLink
                to={AuthenticatedUserRouters.NODE_WONDER}
                icon="fa-solid fa-bolt"
                text="Node Wonder Queue"
                badge="$100 / $150"
                onClose={() => {
                  onClose();
                  setOpenDropdown(null);
                }}
              />
              <NavLink
                to={AuthenticatedUserRouters.REINVEST}
                icon="fa-solid fa-repeat"
                text="Re-Invest (100%/50%)"
                onClose={() => {
                  onClose();
                  setOpenDropdown(null);
                }}
              />
              <NavLink
                to={AuthenticatedUserRouters.INVESTMENT_REPORT}
                icon="fa-solid fa-file-invoice-dollar"
                text="Investment Report"
                onClose={() => {
                  onClose();
                  setOpenDropdown(null);
                }}
              />
            </SidebarDropdown>

            {/* 4. History (NODEXAI Incomes: Direct 10%, Level 20%, Binary 50%, Club CTO 10%, Node Wonder) */}
            <SidebarDropdown
              id="history"
              icon="fa-solid fa-clock-rotate-left"
              text="History & Incomes"
              openDropdown={openDropdown}
              setOpenDropdown={setOpenDropdown}
            >
              <NavLink
                to={AuthenticatedUserRouters.INCOME_HISTORY}
                icon="fa-solid fa-chart-line"
                text="Income Report"
                onClose={() => {
                  onClose();
                  setOpenDropdown(null);
                }}
              />
              <NavLink
                to={AuthenticatedUserRouters.REFERRAL_INCOME_HISTORY}
                icon="fa-solid fa-share-nodes"
                text="01. Direct Income"
                badge="5% ($1.25)"
                onClose={() => {
                  onClose();
                  setOpenDropdown(null);
                }}
              />
              <NavLink
                to={AuthenticatedUserRouters.LEVEL_INCOME_HISTORY}
                icon="fa-solid fa-diagram-next"
                text="02. Level Income"
                badge="20% (10 Lvl)"
                onClose={() => {
                  onClose();
                  setOpenDropdown(null);
                }}
              />
              <NavLink
                to={AuthenticatedUserRouters.MATCHING_INCOME_HISTORY}
                icon="fa-solid fa-scale-balanced"
                text="03. Binary Matching"
                badge="50% (1:1)"
                onClose={() => {
                  onClose();
                  setOpenDropdown(null);
                }}
              />
              <NavLink
                to={AuthenticatedUserRouters.ROYALTY_CLUB_INCOME}
                icon="fa-solid fa-crown"
                text="04. Club Income"
                badge="10% CTO"
                onClose={() => {
                  onClose();
                  setOpenDropdown(null);
                }}
              />
              <NavLink
                to={AuthenticatedUserRouters.NODE_WONDER_INCOME_HISTORY}
                icon="fa-solid fa-arrows-split-up-and-left"
                text="05. Node Wonder Income"
                badge="$150 Payouts"
                onClose={() => {
                  onClose();
                  setOpenDropdown(null);
                }}
              />
              <NavLink
                to={AuthenticatedUserRouters.NODE_WONDER_REFERRAL_HISTORY}
                icon="fa-solid fa-hand-holding-dollar"
                text="06. Node Wonder Referral"
                badge="5% ($5)"
                onClose={() => {
                  onClose();
                  setOpenDropdown(null);
                }}
              />
            </SidebarDropdown>

            {/* 5. Withdrawal (Single Unified Module: Min $10, 5% Admin Charge) */}
            <NavLink
              to={AuthenticatedUserRouters.WITHDRAW}
              icon="fa-solid fa-money-bill-transfer"
              text="Withdrawal"
              badge="MIN $10 • 5%"
              onClose={() => {
                onClose();
                setOpenDropdown(null);
              }}
            />

            {/* 6. Support */}
            <SidebarDropdown
              id="support"
              icon="fa-solid fa-headset"
              text="Support"
              openDropdown={openDropdown}
              setOpenDropdown={setOpenDropdown}
            >
              <NavLink
                to={AuthenticatedUserRouters.RAISE_TICKET}
                icon="fa-solid fa-circle-plus"
                text="Raise Ticket"
                onClose={() => {
                  onClose();
                  setOpenDropdown(null);
                }}
              />
              <NavLink
                to={AuthenticatedUserRouters.RAISE_TICKET_HISTORY}
                icon="fa-solid fa-circle-info"
                text="Ticket History"
                onClose={() => {
                  onClose();
                  setOpenDropdown(null);
                }}
              />
            </SidebarDropdown>

            {/* 7. Profile */}
            <NavLink
              to={AuthenticatedUserRouters.PROFILE}
              icon="fa-solid fa-user"
              text="Profile"
              onClose={() => {
                onClose();
                setOpenDropdown(null);
              }}
            />
          </>
        )}

        {role === "ADMIN" && (
          <>
            <NavLink
              to={AuthenticatedAdminRouters.ADMIN_DASHBOARD}
              icon="fa-solid fa-table-columns"
              text="Dashboard"
              onClose={() => {
                onClose();
                setOpenDropdown(null);
              }}
            />
            <NavLink
              to={AuthenticatedAdminRouters.ALL_USERS}
              icon="fa-solid fa-users"
              text="User Management"
              onClose={() => {
                onClose();
                setOpenDropdown(null);
              }}
            />
            <NavLink
              to={AuthenticatedAdminRouters.MANAGE_PLANS}
              icon="fa-solid fa-layer-group"
              text="Manage Plans"
              onClose={() => {
                onClose();
                setOpenDropdown(null);
              }}
            />
            <NavLink
              to={AuthenticatedAdminRouters.TOTAL_TRANSACTIONS}
              icon="fa-solid fa-money-bill-transfer"
              text="Transactions"
              onClose={() => {
                onClose();
                setOpenDropdown(null);
              }}
            />
            <SidebarDropdown
              id="manage-withdrawal"
              icon="fa-solid fa-money-bill-transfer"
              text="Manage Withdraw"
              openDropdown={openDropdown}
              setOpenDropdown={setOpenDropdown}
            >
              <NavLink
                to={AuthenticatedAdminRouters.WITHDRAWAL_REQUEST}
                icon="fa-solid fa-clock"
                text="Pending Requests"
                onClose={() => {
                  onClose();
                  setOpenDropdown(null);
                }}
              />
              <NavLink
                to={AuthenticatedAdminRouters.APPROVED_WITHDRAWAL_REQUEST}
                icon="fa-solid fa-circle-check"
                text="Withdrawal History"
                onClose={() => {
                  onClose();
                  setOpenDropdown(null);
                }}
              />
            </SidebarDropdown>

            <SidebarDropdown
              id="income-history"
              icon="fa-solid fa-hand-holding-dollar"
              text="Incomes Engine"
              openDropdown={openDropdown}
              setOpenDropdown={setOpenDropdown}
            >
              <NavLink
                to={AuthenticatedAdminRouters.INCOME_HISTORY}
                icon="fa-solid fa-chart-pie"
                text="All Incomes Analytics"
                onClose={() => {
                  onClose();
                  setOpenDropdown(null);
                }}
              />
              <NavLink
                to={AuthenticatedAdminRouters.REFERRAL_INCOME_HISTORY}
                icon="fa-solid fa-share-nodes"
                text="01. Direct Income (5%)"
                badge="$1.25"
                onClose={() => {
                  onClose();
                  setOpenDropdown(null);
                }}
              />
              <NavLink
                to={AuthenticatedAdminRouters.LEVEL_INCOME_HISTORY}
                icon="fa-solid fa-layer-group"
                text="02. 10-Level Income (20%)"
                badge="$5.00"
                onClose={() => {
                  onClose();
                  setOpenDropdown(null);
                }}
              />
              <NavLink
                to={AuthenticatedAdminRouters.MATCHING_INCOME_HISTORY}
                icon="fa-solid fa-scale-balanced"
                text="03. Binary Matching (50%)"
                badge="1:1 / $12.50"
                onClose={() => {
                  onClose();
                  setOpenDropdown(null);
                }}
              />
              <NavLink
                to={AuthenticatedAdminRouters.ADMIN_ROYALTY_INCOME}
                icon="fa-solid fa-crown"
                text="04. Club Income (10% CTO)"
                badge="Puma/Pajero/Panther"
                onClose={() => {
                  onClose();
                  setOpenDropdown(null);
                }}
              />
              <NavLink
                to={AuthenticatedAdminRouters.ADMIN_NODE_WONDER_INCOME}
                icon="fa-solid fa-arrows-split-up-and-left"
                text="05. Node Wonder Income"
                badge="$150 Payouts"
                onClose={() => {
                  onClose();
                  setOpenDropdown(null);
                }}
              />
              <NavLink
                to={AuthenticatedAdminRouters.ADMIN_NODE_WONDER_REFERRAL}
                icon="fa-solid fa-hand-holding-dollar"
                text="06. Node Wonder Referral"
                badge="5% ($5)"
                onClose={() => {
                  onClose();
                  setOpenDropdown(null);
                }}
              />
              <NavLink
                to={AuthenticatedAdminRouters.ADMIN_NODE_WONDER_QUEUE}
                icon="fa-solid fa-list-ol"
                text="07. Node Wonder Queue"
                badge="Queue Monitor"
                onClose={() => {
                  onClose();
                  setOpenDropdown(null);
                }}
              />
            </SidebarDropdown>

            <SidebarDropdown
              id="manage-funds"
              icon="fa-solid fa-hand-holding-dollar"
              text="Manage Funds"
              openDropdown={openDropdown}
              setOpenDropdown={setOpenDropdown}
            >
              <NavLink
                to={AuthenticatedAdminRouters.ADD_FUND}
                icon="fa-solid fa-dollar-sign"
                text="Add Fund To User"
                onClose={() => {
                  onClose();
                  setOpenDropdown(null);
                }}
              />
              <NavLink
                to={AuthenticatedAdminRouters.ADD_FUND_HISTORY}
                icon="fa-solid fa-chart-line"
                text="Add Fund History"
                onClose={() => {
                  onClose();
                  setOpenDropdown(null);
                }}
              />
            </SidebarDropdown>

            <SidebarDropdown
              id="manage-support"
              icon="fa-solid fa-headset"
              text="Support"
              openDropdown={openDropdown}
              setOpenDropdown={setOpenDropdown}
            >
              <NavLink
                to={AuthenticatedAdminRouters.PENDING_TICKETS}
                icon="fa-solid fa-circle-info"
                text="Pending Tickets"
                onClose={() => {
                  onClose();
                  setOpenDropdown(null);
                }}
              />
              <NavLink
                to={AuthenticatedAdminRouters.CLOSED_TICKETS}
                icon="fa-solid fa-circle-check"
                text="Closed Tickets"
                onClose={() => {
                  onClose();
                  setOpenDropdown(null);
                }}
              />
            </SidebarDropdown>

            <NavLink
              to={AuthenticatedAdminRouters.CHANGE_PASSWORD}
              icon="fa-solid fa-lock"
              text="Change Password"
              onClose={() => {
                onClose();
                setOpenDropdown(null);
              }}
            />
          </>
        )}
      </nav>

      {/* Bottom Pinned User Profile & High-Visibility Logout */}
      <div className="pt-3 mt-auto border-t border-cyan-500/20 space-y-2 shrink-0">
        <div className="flex items-center gap-2.5 p-2 rounded-2xl bg-gradient-to-r from-[#08152c] to-[#040c1a] border border-cyan-500/25 shadow-lg">
          <img
            src={userInfo?.picture || "https://api.dicebear.com/8.x/lorelei/svg?seed=Lanre"}
            alt="User Avatar"
            className="w-8 h-8 rounded-full border border-cyan-400/60 shadow-[0_0_8px_rgba(0,210,255,0.3)] object-cover shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-white truncate uppercase">
              {userInfo?.username || (role === "ADMIN" ? "ADMIN" : "TRADER")}
            </p>
            <p className="text-[10px] text-cyan-300/80 font-mono truncate">
              {maskWalletAddress(userInfo?.account)}
            </p>
          </div>
          <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-lg bg-cyan-950/70 text-cyan-300 border border-cyan-500/40 font-mono">
            {role || "USER"}
          </span>
        </div>

        <button
          onClick={() => {
            if (onClose) onClose();
            logoutHandler();
          }}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3.5 rounded-xl font-bold text-xs tracking-wider transition-all duration-200 cursor-pointer bg-gradient-to-r from-rose-500/15 to-red-600/25 hover:from-rose-500/30 hover:to-red-600/40 text-rose-300 hover:text-white border border-rose-500/40 hover:border-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.15)] hover:shadow-[0_0_18px_rgba(244,63,94,0.3)] uppercase"
        >
          <i className="fa-solid fa-arrow-right-from-bracket text-sm"></i>
          <span>LOGOUT</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
