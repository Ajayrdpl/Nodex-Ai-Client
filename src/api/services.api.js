import axios from "axios";
import store, { persistor } from "../redux/store";
import { logoutUser } from "../redux/slices/authSlice";

const BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
  (typeof process !== "undefined" && process.env && process.env.REACT_APP_API_URL) ||
  "https://api.nodexai.io/api";

export const API = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Auto-attach JWT token
API.interceptors.request.use(
  (config) => {
    const state = store?.getState?.();
    const token =
      state?.isLoggedUser?.token ||
      localStorage.getItem("token") ||
      localStorage.getItem("adminToken") ||
      localStorage.getItem("userToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response handler
API.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status;
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Server Error. Please try again.";

    // Auto logout on unauthorized token
    if (status === 401 || status === 403) {
      if (store?.dispatch) {
        store.dispatch(logoutUser());
        persistor?.purge?.();
      }
    }

    return Promise.reject(new Error(message));
  }
);

// Helper for fallback request support
const reqWithFallback = async (primaryPromise, fallbackPromise) => {
  try {
    return await primaryPromise();
  } catch (err) {
    if (fallbackPromise) {
      try {
        return await fallbackPromise();
      } catch (fallbackErr) {
        throw fallbackErr;
      }
    }
    throw err;
  }
};

// ──────────────────────────────────────────
// 👤 USER API SERVICE (Comprehensive Implementation matching USER_API_DOC.md)
// ──────────────────────────────────────────
export const UserService = {
  // 🔐 1. Auth & Profile
  register: (data) => API.post("/user/register", data),
  login: (data) => API.post("/user/login", data),
  getProfile: () => reqWithFallback(() => API.get("/user/profile"), () => API.get("/user/get-user")),
  getDashboardStats: () => reqWithFallback(() => API.get("/user/get-income-summary"), () => API.get("/user/dashboard-stats")),
  getIncomeSummary: () => reqWithFallback(() => API.get("/user/get-income-summary"), () => API.get("/user/dashboard-stats")),

  // 💼 2. Investment & Account Activation ($10 Min, $50 ID Activation, 3X/5X Caps)
  packageInvestment: (data) => API.post("/user/investment", data),
  getInvestmentHistory: () => API.get("/user/get-investment-reports"),

  // 💰 3. Consolidated Incomes Module
  // 01. Direct Referral Income (10% Flat)
  getReferralIncome: (params) =>
    reqWithFallback(
      () => API.get("/user/referral-income/history", { params }),
      () => API.get("/user/get-referralincome-history", { params })
    ),
  getReferralIncomeSummary: () => API.get("/user/referral-income/summary"),

  // 02. Daily ROI (1.0%) & Booster ROI (2.0%)
  getDailyRoiIncome: (params) =>
    reqWithFallback(
      () => API.get("/user/trading-income/history", { params }),
      () => API.get("/user/get-tradingprofit-history", { params })
    ),
  getDailyRoiSummary: () => API.get("/user/trading-income/summary"),

  // 03. 15-Level Income (10%, 5%, 4%, 3%, 2%, 1%)
  getLevelIncome: (params) =>
    reqWithFallback(
      () => API.get("/user/level-income/history", { params }),
      () => API.get("/user/get-levelincome-history", { params })
    ),
  getLevelInfo: () => API.get("/user/get-level-info"),

  // 04. 15-Rank Weekly Salary Structure (50%:30%:20% Matrix, $10-$20,000/week)
  getSalaryRankStatus: () =>
    reqWithFallback(
      () => API.get("/user/salary/my-rank"),
      () => API.get("/user/get-salary-history")
    ),
  getSalaryHistory: (params) =>
    reqWithFallback(
      () => API.get("/user/salary/history", { params }),
      () => API.get("/user/get-salary-history", { params })
    ),
  getAllSalaryTiers: () =>
    reqWithFallback(
      () => API.get("/user/salary/my-rank"),
      () => API.get("/user/salary/all-tiers"),
      () => API.get("/salary/all-tiers")
    ),
  claimWeeklySalary: () => API.post("/user/salary/claim-weekly"),

  // 🌲 5. Team & Downlines
  getDirectPartners: () => API.get("/user/get-partners"),
  get3MatrixTree: (params) => API.get("/user/get-matrix-tree", { params }),
  getTeamDivision: () => API.get("/user/get-team-division"),

  // 🔄 6. Reinvestment & Income Wallets
  getIncomeBalance: () => API.get("/user/get-income-balance"),
  reinvest: (data) =>
    typeof data === "object" ? API.post("/user/reinvest", data) : API.post("/user/reinvest", { amount: data }),

  // 💸 7. Withdrawals ($10 Min)
  requestWithdrawal: (data) =>
    reqWithFallback(
      () => API.post("/user/withdrawal-request", data),
      () => API.post("/user/tx/withdrawal-request", data)
    ),
  requestPrincipalWithdrawal: (data) =>
    reqWithFallback(
      () => API.post("/user/principal-withdrawal", data),
      () => API.post("/user/tx/principal-withdrawal", data)
    ),
  getWithdrawalHistory: (params) => API.get("/user/get-withdrawal-history", { params }),
  getWithdrawalEligibility: () => API.get("/user/tx/withdrawal-eligibility"),
  activateTeamMember: (data) =>
    reqWithFallback(
      () => API.post("/user/activate-team-member", data),
      () => API.post("/user/tx/activate-team-member", data)
    ),
};

// ──────────────────────────────────────────
// 🛡️ ADMIN API SERVICE (Comprehensive Implementation matching ADMIN_API_DOC.md v2.0.0)
// ──────────────────────────────────────────
export const AdminService = {
  // 🔐 1. Admin Authentication & Global Analytics
  login: (data) => API.post("/admin/login", data),
  getDashboardStats: () =>
    reqWithFallback(
      () => API.get("/admin/get-income-summary"),
      () => API.get("/admin/dashboard-stats")
    ),
  getIncomeSummary: () =>
    reqWithFallback(
      () => API.get("/admin/get-income-summary"),
      () => API.get("/admin/dashboard-stats")
    ),

  // 👥 2. User Management & Status Control
  getAllUsers: (params) =>
    reqWithFallback(
      () => API.get("/admin/users", { params }),
      () => API.get("/admin/all-users", { params })
    ),
  getUserDetails: (userId) =>
    typeof userId === "object" ? API.post("/admin/get-user", userId) : API.post("/admin/get-user", { userId }),
  updateUserInfo: (id, data) => API.post(`/admin/update-user-info/${id}`, data),
  toggleUserBlock: (id) => API.get(`/admin/user-block/${id}`),
  toggleRoiBlock: (id) => API.get(`/admin/user-roi-block/${id}`),
  toggleCapitalLock: (id) => API.get(`/admin/user-capital-lock/${id}`),

  // 💳 3. Add Fund & Manual Investment
  fundAdd: (data) =>
    reqWithFallback(
      () => API.post("/admin/fund/add", data),
      () => API.post("/fund/add", data)
    ),
  getFundHistory: (params) =>
    reqWithFallback(
      () => API.get("/admin/fund/get-fund-history", { params }),
      () => API.get("/fund/get-fund-history", { params })
    ),

  // 💵 4. Income Streams & Automated Crons
  // 01. Direct Referral Income
  getAllReferralIncome: (params) =>
    reqWithFallback(
      () => API.get("/admin/referral-income/all", { params }),
      () => API.get("/admin/get-referralincome-history", { params })
    ),
  getReferralIncomeStats: () => API.get("/admin/referral-income/stats"),

  // 02. Daily & Booster ROI
  getAllTradingIncome: (params) =>
    reqWithFallback(
      () => API.get("/admin/trading-income/all", { params }),
      () => API.get("/admin/get-tradingprofit-history", { params })
    ),
  triggerDailyRoi: () =>
    reqWithFallback(
      () => API.post("/admin/trading-income/distribute"),
      () => API.post("/admin/income-generation/daily-roi")
    ),

  // 03. 15-Level Income
  getAllLevelIncome: (params) =>
    reqWithFallback(
      () => API.get("/admin/level-income/all", { params }),
      () => API.get("/admin/get-levelincome-history", { params })
    ),

  // 04. 15-Rank Weekly Salary Structure
  getAllSalaryRanks: () =>
    reqWithFallback(
      () => API.get("/admin/salary/stats"),
      () => API.get("/admin/salary/all-ranks"),
      () => API.get("/admin/salary/all-tiers")
    ),
  getSalaryHistory: (params) =>
    reqWithFallback(
      () => API.get("/admin/salary/all", { params }),
      () => API.get("/admin/get-salary-history", { params })
    ),
  triggerWeeklySalary: (data = {}) =>
    reqWithFallback(
      () => API.post("/admin/salary/trigger-salary-admin", data),
      () => API.post("/admin/salary/distribute", data)
    ),

  // 🏧 5. Withdrawal Approvals
  getWithdrawals: (params) =>
    reqWithFallback(
      () => API.get("/admin/get-withdrawal-history", { params }),
      () => API.get("/admin/tx/withdrawals/pending", { params })
    ),
  approveWithdrawal: (data) => {
    const payload = typeof data === "string" ? { withdrawalId: data, status: "Approved" } : { status: "Approved", ...data };
    return reqWithFallback(
      () => API.post("/admin/withdrawal-approve", payload),
      () => (payload.withdrawalId ? API.patch(`/admin/tx/withdrawals/${payload.withdrawalId}/approve`, payload) : API.post("/admin/tx/withdrawal-accepted", payload))
    );
  },
  rejectWithdrawal: (data) => {
    const payload = typeof data === "string" ? { withdrawalId: data, status: "Rejected" } : { status: "Rejected", ...data };
    return reqWithFallback(
      () => API.post("/admin/withdrawal-approve", payload),
      () => (payload.withdrawalId ? API.patch(`/admin/tx/withdrawals/${payload.withdrawalId}/reject`, payload) : API.post("/admin/tx/withdrawal-accepted", { ...payload, status: "Cancelled" }))
    );
  },
  getAllTransactions: (params) => API.get("/admin/all-transactions", { params }),
};

export default API;
