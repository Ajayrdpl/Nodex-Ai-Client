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
import { loginUser, logoutUser } from "../../../redux/slices/authSlice";
import { getUserDashboardAccess } from "../../../api/admin.api";
import { setLoading } from "../../../redux/slices/loadingSlice";

const NavLink = ({ to, icon, text, badge, hasNotification = false, onClose }) => {
  return (
    <RouterNavLink
      to={to}
      end={to === AuthenticatedUserRouters.DASHBOARD || to === AuthenticatedAdminRouters.ADMIN_DASHBOARD}
      onClick={onClose}
      className={({ isActive }) => `
        flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl relative
        transition-all duration-200 ease-in-out cursor-pointer text-xs font-semibold
        ${isActive
          ? "text-[#f0b90b] bg-[#1e2329] border border-[#f0b90b]/30 shadow-sm"
          : "text-[#848e9c] hover:text-[#eaecef] hover:bg-[#1e2329]/60"
        }
      `}
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute left-0 top-2 bottom-2 w-1 bg-[#f0b90b] rounded-r-full shadow-[0_0_8px_rgba(240,185,11,0.5)]" />
          )}

          <i className={`${icon} w-4 text-center text-xs transition-colors ${isActive ? "text-[#f0b90b]" : "text-[#848e9c]"}`} />
          <span className="truncate">{text}</span>

          {badge && (
            <span className="ml-auto px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-[#f0b90b]/15 text-[#f0b90b] border border-[#f0b90b]/30 tracking-wider font-mono">
              {badge}
            </span>
          )}

          {hasNotification && !badge && (
            <span className="ml-auto bg-[#f6465d] text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold text-white">
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
          flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold text-nowrap
          text-left text-[#848e9c] hover:text-[#eaecef] hover:bg-[#1e2329]/60
          transition-all cursor-pointer border border-transparent hover:border-[#2b313a]
          ${isOpen ? "text-[#eaecef] bg-[#1e2329]/40 border-[#2b313a]" : ""}
        `}
      >
        <span className="flex items-center gap-3.5">
          <i className={`${icon} w-4 text-center text-xs text-[#848e9c]`}></i>
          {text}
        </span>
        <i
          className={`fa-solid fa-chevron-${isOpen ? "up" : "down"} text-[10px] text-[#848e9c]`}
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
  const access = localStorage.getItem("access");
  const adminId = localStorage.getItem("adminId");

  const handleNavigate = () => {
    if (role === "ADMIN") {
      navigate(AuthenticatedAdminRouters.ADMIN_DASHBOARD);
    } else if (role === "USER") {
      navigate(AuthenticatedUserRouters.DASHBOARD);
    }
  };

  const handleSubmit = async (id) => {
    dispatch(setLoading(true));
    try {
      const response = await getUserDashboardAccess({ id });
      if (response?.success) {
        await dispatch(
          loginUser({
            token: response?.token,
            userId: response?.data?._id,
            role: response?.data?.role,
            data: response?.data,
          })
        );
        localStorage.removeItem("access");
        navigate(AuthenticatedAdminRouters.ADMIN_DASHBOARD);
        Swal.fire({
          icon: "success",
          text: response?.message || "Access granted successfully",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
      } else {
        Swal.fire({
          icon: "error",
          text: response?.message || "Failed to grant access",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        text: "Something went wrong while granting access!",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
    } finally {
      dispatch(setLoading(false));
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
        bg-[#181a20] border-r border-[#2b313a]
        ${isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}
        lg:relative lg:translate-x-0
      `}
    >
      {/* Binance Yellow Header Accent Line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-[#f0b90b]"></div>

      {/* Brand Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#2b313a] relative pt-1">
        <div
          onClick={() => {
            handleNavigate();
            onClose();
          }}
          className="flex items-center gap-2.5 p-2 rounded-xl bg-[#1e2329] border border-[#2b313a] cursor-pointer hover:border-[#f0b90b] transition-all duration-200 w-full"
        >
          <img
            src={MainContent.shortLogo}
            alt="NODEXAI Logo"
            className="h-9 w-9 rounded-full object-cover border border-[#f0b90b]/50 shadow-[0_0_8px_rgba(240,185,11,0.3)]"
          />
          <div className="min-w-0 flex-1">
            <span className="text-xs font-black text-[#eaecef] font-['Orbitron',monospace] tracking-wider block truncate">
              {MainContent.appName}
            </span>
            <span className="text-[9px] text-[#f0b90b] font-mono block">
              {role === "ADMIN" ? "ADMIN CONSOLE" : "TRADING TERMINAL"}
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden text-[#848e9c] hover:text-white text-xl p-1.5 hover:bg-[#1e2329] rounded-lg ml-2 cursor-pointer"
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

            {/* 3. Deposit (NODEXAI $25 Package, Trading Package, Node Wonder, Re-Invest) */}
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
                to={AuthenticatedUserRouters.TRADING_PACKAGE}
                icon="fa-solid fa-chart-line"
                text="Trading Profit (3%)"
                badge="Min $50 / 2X"
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

            {/* 4. History (NODEXAI Incomes: Direct 10%, Level 20%, Binary 50%, Club CTO 10%, Trading 3%, Node Wonder) */}
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
                badge="10% ($2.50)"
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
                to={AuthenticatedUserRouters.TRADING_PACKAGE}
                icon="fa-solid fa-arrow-trend-up"
                text="05. Trading Profit"
                badge="3% / 2X Cap"
                onClose={() => {
                  onClose();
                  setOpenDropdown(null);
                }}
              />
              <NavLink
                to={AuthenticatedUserRouters.NODE_WONDER}
                icon="fa-solid fa-arrows-split-up-and-left"
                text="06. Node Wonder"
                badge="$150 Queue"
                onClose={() => {
                  onClose();
                  setOpenDropdown(null);
                }}
              />
            </SidebarDropdown>

            {/* 5. Withdrawal (Withdrawal 5% fee, Principal Withdrawal, History) */}
            <SidebarDropdown
              id="withdrawal"
              icon="fa-solid fa-money-bill-transfer"
              text="Withdrawal"
              openDropdown={openDropdown}
              setOpenDropdown={setOpenDropdown}
            >
              <NavLink
                to={AuthenticatedUserRouters.WITHDRAW}
                icon="fa-solid fa-arrow-down"
                text="Withdrawal (5% Fee)"
                badge="5%"
                onClose={() => {
                  onClose();
                  setOpenDropdown(null);
                }}
              />
              <NavLink
                to={AuthenticatedUserRouters.USER_FUND_TRANSFER}
                icon="fa-solid fa-arrow-right-arrow-left"
                text="Transfer (100% Wallet)"
                badge="100%"
                onClose={() => {
                  onClose();
                  setOpenDropdown(null);
                }}
              />
              <NavLink
                to={AuthenticatedUserRouters.WITHDRAWAL_HISTORY}
                icon="fa-solid fa-receipt"
                text="Withdrawal History"
                onClose={() => {
                  onClose();
                  setOpenDropdown(null);
                }}
              />
            </SidebarDropdown>

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
                text="01. Direct Income (10%)"
                badge="$2.50"
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
      <div className="pt-3 mt-auto border-t border-[#2b313a] space-y-2 shrink-0">
        <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[#1e2329]/80 border border-[#2b313a]">
          <img
            src={userInfo?.picture || "https://api.dicebear.com/8.x/lorelei/svg?seed=Lanre"}
            alt="User Avatar"
            className="w-8 h-8 rounded-full border border-[#f0b90b]/50 object-cover shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-[#eaecef] truncate uppercase">
              {userInfo?.username || (role === "ADMIN" ? "ADMIN" : "TRADER")}
            </p>
            <p className="text-[10px] text-[#848e9c] font-mono truncate">
              {maskWalletAddress(userInfo?.account)}
            </p>
          </div>
          <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-[#f0b90b]/15 text-[#f0b90b] border border-[#f0b90b]/30">
            {role || "USER"}
          </span>
        </div>

        {access && (
          <button
            onClick={() => {
              if (onClose) onClose();
              handleSubmit(adminId);
            }}
            className="w-full flex items-center justify-center gap-2 py-2 px-3.5 rounded-xl font-bold text-xs tracking-wider transition-all duration-200 cursor-pointer shadow-md bg-amber-500/15 hover:bg-amber-500/25 text-[#f0b90b] border border-[#f0b90b]/40 shadow-[0_0_10px_rgba(240,185,11,0.2)]"
          >
            <i className="fa-solid fa-arrow-left text-xs"></i>
            <span>RETURN TO ADMIN</span>
          </button>
        )}

        <button
          onClick={() => {
            if (onClose) onClose();
            logoutHandler();
          }}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3.5 rounded-xl font-bold text-xs tracking-wider transition-all duration-200 cursor-pointer shadow-md bg-red-500/15 hover:bg-red-500/25 text-[#f6465d] hover:text-white border border-red-500/30 hover:border-red-500/60 shadow-[0_0_12px_rgba(246,70,93,0.15)] hover:shadow-[0_0_18px_rgba(246,70,93,0.3)]"
        >
          <i className="fa-solid fa-arrow-right-from-bracket text-sm"></i>
          <span>LOGOUT</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
