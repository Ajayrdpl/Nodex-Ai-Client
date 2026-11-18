import { Axios } from "../constants/mainContent";
export { UserService } from "./services.api";

const userApi = "/user";

// ==========================================
// 1. AUTHENTICATION & PROFILE APIS
// ==========================================

export const loginUser = async (payload) => {
  try {
    const response = await Axios.post(`${userApi}/login`, payload);
    return response.data;
  } catch (error) {
    return error?.response?.data || { success: false, message: error.message || "Login failed" };
  }
};

export const registerUser = async (payload) => {
  try {
    const response = await Axios.post(`${userApi}/register`, payload);
    return response.data;
  } catch (error) {
    return error?.response?.data || { success: false, message: error.message || "Registration failed" };
  }
};

export const getUserProfileApi = async () => {
  try {
    const response = await Axios.get(`${userApi}/profile`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || { success: false, message: error.message || "Failed to fetch user profile" };
  }
};

export const getUserProfile = getUserProfileApi;

export const updateProfile = async (payload) => {
  try {
    const response = await Axios.post(`${userApi}/update-profile`, payload);
    return response?.data;
  } catch (error) {
    return error?.response?.data || { success: false, message: error.message || "API error" };
  }
};

export const verifyUser = async (payload) => {
  try {
    const response = await Axios.post(`${userApi}/get-name-by-username`, payload);
    return response?.data;
  } catch (error) {
    return error?.response?.data || { success: false, message: error.message || "API error" };
  }
};

// ==========================================
// 2. INVESTMENT & RETOPUP APIS
// ==========================================

export async function sendPaymentDetail(payload) {
  try {
    const response = await Axios.post(`${userApi}/investment`, payload);
    return response?.data;
  } catch (error) {
    return error?.response?.data || {
      success: false,
      message: error?.response?.data?.message || error.message || "Investment failed"
    };
  }
}

export const packageInvestmentApi = sendPaymentDetail;

export const retopupAccountApi = async (payload) => {
  try {
    const response = await Axios.post(`${userApi}/tx/retopup`, payload);
    return response?.data;
  } catch (error) {
    return error?.response?.data || {
      success: false,
      message: error?.response?.data?.message || error.message || "Retopup failed"
    };
  }
};

export const retopupAccount = retopupAccountApi;

export async function getPackageInfo() {
  try {
    const response = await Axios.get(`${userApi}/get-all-packages`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || error;
  }
}

export async function getPlanInfo() {
  try {
    const response = await Axios.get(`${userApi}/get-all-plans`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || error;
  }
}

export async function getPlanInvestmentHistory() {
  try {
    const response = await Axios.get(`${userApi}/get-plan-investment-history`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || error;
  }
}

export async function getPlanReinvestmentHistory() {
  try {
    const response = await Axios.get(`${userApi}/get-plan-reinvestment-history`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || error;
  }
}

export async function reinvestFromIncomeForPlan(payload) {
  try {
    const response = await Axios.post(`${userApi}/reinvest-plan`, payload);
    return response?.data;
  } catch (error) {
    return error?.response?.data || error;
  }
}

export const getAllInvestmentHistory = async () => {
  try {
    const response = await Axios.get(`${userApi}/get-investment-reports`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || error;
  }
};

// ==========================================
// 3. WITHDRAWAL APIS ($1 Min, 5% Fee)
// ==========================================

export const generateWithdrawalRequest = async (payload) => {
  try {
    const response = await Axios.post(`${userApi}/withdrawal-request`, payload);
    if (response?.data?.success) return response.data;
    const fallback = await Axios.post(`${userApi}/tx/withdrawal-request`, payload);
    return fallback?.data;
  } catch (error) {
    try {
      const fallback = await Axios.post(`${userApi}/tx/withdrawal-request`, payload);
      return fallback?.data;
    } catch (err) {
      return (
        err?.response?.data || {
          success: false,
          message: err?.response?.data?.message || err?.response?.data?.error || err?.message || "Withdrawal request failed",
        }
      );
    }
  }
};

export const requestWithdrawalApi = generateWithdrawalRequest;
export const verifyWithdrawalDetails = generateWithdrawalRequest;

// 🛡️ Principal Capital Withdrawal ($1 Min, 25% Deduction < 30 Days | 0% Deduction >= 30 Days + 5% Fee)
export const requestPrincipalWithdrawalApi = async (payload) => {
  try {
    const response = await Axios.post(`${userApi}/tx/principal-withdrawal`, payload);
    if (response?.data?.success) return response.data;
    const fallback = await Axios.post(`${userApi}/principal-withdrawal`, payload);
    return fallback?.data;
  } catch (error) {
    try {
      const fallback = await Axios.post(`${userApi}/principal-withdrawal`, payload);
      return fallback?.data;
    } catch (err) {
      return (
        err?.response?.data || {
          success: false,
          message:
            err?.response?.data?.message ||
            err?.response?.data?.error ||
            err?.message ||
            "Principal withdrawal request failed",
        }
      );
    }
  }
};

// 🚀 Direct Team Member ID Activation (0% Platform Fee)
export const activateTeamMemberApi = async (payload) => {
  try {
    const response = await Axios.post(`${userApi}/tx/activate-team-member`, payload);
    if (response?.data?.success) return response.data;
    const fallback = await Axios.post(`${userApi}/activate-team-member`, payload);
    return fallback?.data;
  } catch (error) {
    try {
      const fallback = await Axios.post(`${userApi}/activate-team-member`, payload);
      return fallback?.data;
    } catch (err) {
      return (
        err?.response?.data || {
          success: false,
          message: err?.response?.data?.message || err?.message || "Team activation failed",
        }
      );
    }
  }
};

// 🔄 Self Reinvestment from P2P / Income Wallet (0% Fee)
export const reinvestSelfApi = async (payload) => {
  try {
    const response = await Axios.post(`${userApi}/tx/reinvest-self`, payload);
    if (response?.data?.success) return response.data;
    const fallback = await Axios.post(`${userApi}/reinvest`, payload);
    return fallback?.data;
  } catch (error) {
    try {
      const fallback = await Axios.post(`${userApi}/reinvest`, payload);
      return fallback?.data;
    } catch (err) {
      return (
        err?.response?.data || {
          success: false,
          message: err?.response?.data?.message || err?.message || "Reinvestment failed",
        }
      );
    }
  }
};

// 💳 Live Wallet Balances & Eligibility
export const getWalletBalancesApi = async () => {
  try {
    const response = await Axios.get(`${userApi}/tx/wallet-balances`);
    if (response?.data?.success) return response.data;
    const fallback = await Axios.get(`${userApi}/get-income-balance`);
    return fallback?.data;
  } catch (error) {
    try {
      const fallback = await Axios.get(`${userApi}/get-income-balance`);
      return fallback?.data;
    } catch (err) {
      return (
        err?.response?.data || {
          success: false,
          message: err?.response?.data?.message || error?.message || "Failed to fetch wallet balances",
        }
      );
    }
  }
};

export const getAllUserWithdrawalHistory = async (params) => {
  try {
    const response = await Axios.get(`${userApi}/get-withdrawal-history`, { params });
    return response?.data;
  } catch (error) {
    return error?.response?.data || error;
  }
};

export const getOptForWithdrawal = async () => {
  try {
    const response = await Axios.get(`${userApi}/tx/get-otp-for-withdrawal`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || error;
  }
};

export const getWithdrawalEligibility = async () => {
  try {
    const response = await Axios.get(`${userApi}/tx/withdrawal-eligibility`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || { success: false, message: error?.response?.data?.message || error.message || "API error" };
  }
};

export const requestTypedWithdrawal = async (payload) => {
  try {
    const response = await Axios.post(`${userApi}/tx/withdrawal-typed-request`, payload);
    return response?.data;
  } catch (error) {
    return error?.response?.data || { success: false, message: error?.response?.data?.message || error.message || "API error" };
  }
};

// ==========================================
// 4. P2P WALLET APIS
// ==========================================

export const getP2PBalanceApi = async () => {
  try {
    const response = await Axios.get(`${userApi}/p2p/balance`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || { success: false, message: error?.response?.data?.message || error.message || "Failed to fetch P2P balance" };
  }
};

export const getP2PWallet = getP2PBalanceApi;

export const transferP2PApi = async (payload) => {
  try {
    const response = await Axios.post(`${userApi}/p2p/transfer`, payload);
    return response?.data;
  } catch (error) {
    return error?.response?.data || { success: false, message: error?.response?.data?.message || error.message || "P2P transfer failed" };
  }
};

export const activateUserWithP2PApi = async (payload) => {
  try {
    const response = await Axios.post(`${userApi}/p2p/activate-user`, payload);
    return response?.data;
  } catch (error) {
    return error?.response?.data || { success: false, message: error?.response?.data?.message || error.message || "User activation failed" };
  }
};

// ==========================================
// 5. CONSOLIDATED INCOME & DASHBOARD STATS APIS
// ==========================================

// Consolidated Income Summary Overview
export const getIncomeSummaryApi = async () => {
  try {
    const response = await Axios.get(`${userApi}/get-income-summary`);
    if (response?.data?.success) return response.data;
    const fallback = await Axios.get(`${userApi}/dashboard-stats`);
    return fallback?.data;
  } catch (error) {
    try {
      const fallback = await Axios.get(`${userApi}/dashboard-stats`);
      return fallback?.data;
    } catch (err) {
      return err?.response?.data || { success: false, message: error.message || "Failed to fetch income summary" };
    }
  }
};

// Direct Referral Income (10% Flat)
export const getReferralIncomeHistoryApi = async ({ page = 1, limit = 20 } = {}) => {
  try {
    const response = await Axios.get(`${userApi}/referral-income/history`, { params: { page, limit } });
    if (response?.data?.success) return response.data;
    const fallback = await Axios.get(`${userApi}/get-referralincome-history`, { params: { page, limit } });
    return fallback?.data;
  } catch (error) {
    try {
      const fallback = await Axios.get(`${userApi}/get-referralincome-history`, { params: { page, limit } });
      if (fallback?.data?.success) return fallback.data;
      const fallback2 = await Axios.get(`${userApi}/get-referral-history`, { params: { page, limit } });
      return fallback2?.data;
    } catch (err) {
      try {
        const fallback2 = await Axios.get(`${userApi}/get-referral-history`, { params: { page, limit } });
        return fallback2?.data;
      } catch (err2) {
        return err2?.response?.data || { success: false, message: error.message || "API error" };
      }
    }
  }
};

export const getReferralIncomeSummaryApi = async () => {
  try {
    const response = await Axios.get(`${userApi}/referral-income/summary`);
    if (response?.data?.success) return response.data;
    const fallback = await Axios.get(`${userApi}/referral-income/history`);
    return fallback?.data;
  } catch (error) {
    try {
      const fallback = await Axios.get(`${userApi}/referral-income/history`);
      return fallback?.data;
    } catch (err) {
      return error?.response?.data || { success: false, message: error.message || "API error" };
    }
  }
};

export const getAllUserReferralIncomeHistory = async () => {
  try {
    const response = await Axios.get(`${userApi}/referral-income/history`);
    if (response?.data?.success) return response.data;
    const fallback = await Axios.get(`${userApi}/get-referralincome-history`);
    return fallback?.data;
  } catch (error) {
    try {
      const fallback = await Axios.get(`${userApi}/get-referralincome-history`);
      if (fallback?.data?.success) return fallback.data;
      const fallback2 = await Axios.get(`${userApi}/get-referral-history`);
      return fallback2?.data;
    } catch (err) {
      try {
        const fallback2 = await Axios.get(`${userApi}/get-referral-history`);
        return fallback2?.data;
      } catch (err2) {
        return err2?.response?.data || { success: false, message: error.message || "API error" };
      }
    }
  }
};

// Daily ROI & Booster ROI (1.0% / 2.0%)
export const getDailyRoiHistoryApi = async ({ page = 1, limit = 20 } = {}) => {
  try {
    const response = await Axios.get(`${userApi}/trading-income/history`, { params: { page, limit } });
    if (response?.data?.success) return response.data;
    const fallback = await Axios.get(`${userApi}/get-tradingprofit-history`, { params: { page, limit } });
    return fallback?.data;
  } catch (error) {
    try {
      const fallback = await Axios.get(`${userApi}/get-tradingprofit-history`, { params: { page, limit } });
      return fallback?.data;
    } catch (err) {
      return err?.response?.data || { success: false, message: error.message || "API error" };
    }
  }
};

export const getDailyRoiSummaryApi = async () => {
  try {
    const response = await Axios.get(`${userApi}/trading-income/summary`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || { success: false, message: error.message || "API error" };
  }
};

export const getTradingIncomeSummaryApi = getDailyRoiSummaryApi;

export const getBoosterStatusApi = async () => {
  try {
    const response = await Axios.get(`${userApi}/trading-income/booster-status`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || { success: false, message: error.message || "API error" };
  }
};

/**
 * 12% Direct Booster Income History & 24-Hour Golden Window Status
 * GET /api/user/get-booster-income-history
 */
export const getDirectBoosterIncomeHistoryApi = async () => {
  try {
    const response = await Axios.get(`${userApi}/get-booster-income-history`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || { success: false, message: error.message || "API error" };
  }
};

/**
 * 01c. 7-Days Team Business Booster Reports & Slabs Qualification
 * GET /api/user/get-team-booster-history
 */
export const getTeamBoosterIncomeHistoryApi = async () => {
  try {
    const response = await Axios.get(`${userApi}/get-team-booster-history`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || { success: false, message: error.message || "API error" };
  }
};

/**
 * 05. Auto Compounding Bonus APIs (0.5% Extra)
 */
export const processCompoundApi = async (payload) => {
  try {
    const response = await Axios.post(`${userApi}/compounding/process`, payload);
    if (response?.data?.success) return response.data;
    const fallback = await Axios.post(`${userApi}/compound`, payload);
    return fallback?.data;
  } catch (error) {
    try {
      const fallback = await Axios.post(`${userApi}/compound`, payload);
      return fallback?.data;
    } catch (err) {
      return error?.response?.data || { success: false, message: error.message || "Compounding failed" };
    }
  }
};

export const getCompoundingHistoryApi = async ({ page = 1, limit = 20 } = {}) => {
  try {
    const response = await Axios.get(`${userApi}/compounding/history`, { params: { page, limit } });
    if (response?.data?.success) return response.data;
    const fallback = await Axios.get(`${userApi}/get-compounding-history`, { params: { page, limit } });
    return fallback?.data;
  } catch (error) {
    try {
      const fallback = await Axios.get(`${userApi}/get-compounding-history`, { params: { page, limit } });
      return fallback?.data;
    } catch (err) {
      return error?.response?.data || { success: false, message: error.message || "Failed to fetch compounding history" };
    }
  }
};

export const getCompoundingSummaryApi = async () => {
  try {
    const response = await Axios.get(`${userApi}/compounding/summary`);
    if (response?.data?.success) return response.data;
    const fallback = await Axios.get(`${userApi}/get-compounding-summary`);
    return fallback?.data;
  } catch (error) {
    try {
      const fallback = await Axios.get(`${userApi}/get-compounding-summary`);
      return fallback?.data;
    } catch (err) {
      return error?.response?.data || { success: false, message: error.message || "Failed to fetch compounding summary" };
    }
  }
};

export const clickTradeButtonApi = async () => {
  try {
    const response = await Axios.post(`${userApi}/trade-button/click`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || { success: false, message: error.message || "API error" };
  }
};

export const getDashboardStatsApi = async () => {
  try {
    const response = await Axios.get(`${userApi}/dashboard-stats`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || { success: false, message: error.message || "API error" };
  }
};

export const getAllTradingIncomeHistory = async (params = {}) => {
  try {
    const response = await Axios.get(`${userApi}/trading-income/history`, { params });
    if (response?.data?.success) return response.data;
    const fallback = await Axios.get(`${userApi}/get-tradingprofit-history`, { params });
    return fallback?.data;
  } catch (error) {
    try {
      const fallback = await Axios.get(`${userApi}/get-tradingprofit-history`, { params });
      return fallback?.data;
    } catch (err) {
      return err?.response?.data || { success: false, message: error.message || "API error" };
    }
  }
};

export const getTradingIncomeHistoryApi = getDailyRoiHistoryApi;
export const getAllTradingIncomeHistoryApi = getAllTradingIncomeHistory;

// 15-Level ROI Dividend Income (L1-2: 10%, L3-5: 5%, L6-7: 4%, L8-9: 3%, L10-12: 2%, L13-15: 1%)
export const getLevelInfoApi = async () => {
  try {
    const response = await Axios.get(`${userApi}/get-level-info`);
    if (response?.data?.success) return response.data;
    const fallback = await Axios.get(`${userApi}/level-income/info`);
    return fallback?.data;
  } catch (error) {
    try {
      const fallback = await Axios.get(`${userApi}/level-income/info`);
      return fallback?.data;
    } catch (err) {
      return err?.response?.data || { success: false, message: error.message || "Failed to fetch level info" };
    }
  }
};

export const getLevelIncomeHistoryApi = async ({ page = 1, limit = 20 } = {}) => {
  try {
    const response = await Axios.get(`${userApi}/level-income/history`, { params: { page, limit } });
    if (response?.data?.success) return response.data;
    const fallback = await Axios.get(`${userApi}/get-levelincome-history`, { params: { page, limit } });
    return fallback?.data;
  } catch (error) {
    try {
      const fallback = await Axios.get(`${userApi}/get-levelincome-history`, { params: { page, limit } });
      return fallback?.data;
    } catch (err) {
      return err?.response?.data || { success: false, message: error.message || "API error" };
    }
  }
};

export const getAllUserLevelIncomeHistory = async () => {
  try {
    const response = await Axios.get(`${userApi}/level-income/history`);
    if (response?.data?.success) return response.data;
    const fallback = await Axios.get(`${userApi}/get-levelincome-history`);
    return fallback?.data;
  } catch (error) {
    try {
      const fallback = await Axios.get(`${userApi}/get-levelincome-history`);
      return fallback?.data;
    } catch (err) {
      return err?.response?.data || { success: false, message: error.message || "API error" };
    }
  }
};

export const getAllGenerationRoiHistory = async () => {
  try {
    const response = await Axios.get(`${userApi}/generation-roi-history`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || { success: false, message: error.message || "API error" };
  }
};

export const getAllUserUserRoiHistory = async () => {
  try {
    const response = await Axios.get(`${userApi}/get-roi-history`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || { success: false, message: error.message || "API error" };
  }
};

// 15 Weekly Salary Tiers & Rank Status (50:30:20 Matrix)
export const getSalaryHistoryApi = async (params = {}) => {
  try {
    const response = await Axios.get(`${userApi}/salary/history`, { params });
    if (response?.data?.success) return response.data;
    const fallback = await Axios.get(`${userApi}/get-salary-history`, { params });
    return fallback?.data;
  } catch (error) {
    try {
      const fallback = await Axios.get(`${userApi}/get-salary-history`, { params });
      return fallback?.data;
    } catch (err) {
      return err?.response?.data || { success: false, message: error.message || "API error" };
    }
  }
};

export const getMySalaryRankApi = async () => {
  try {
    const response = await Axios.get(`${userApi}/salary/my-rank`);
    if (response?.data?.success) return response.data;
    const fallback = await Axios.get(`${userApi}/get-salary-history`);
    return fallback?.data;
  } catch (error) {
    try {
      const fallback = await Axios.get(`${userApi}/get-salary-history`);
      return fallback?.data;
    } catch (err) {
      return err?.response?.data || { success: false, message: error.message || "API error" };
    }
  }
};

export const getUserSalarySummaryApi = async () => {
  try {
    const response = await Axios.get(`${userApi}/salary/summary`);
    if (response?.data?.success) return response.data;
    const fallback = await Axios.get(`${userApi}/salary/my-rank`);
    return fallback?.data;
  } catch (error) {
    try {
      const fallback = await Axios.get(`${userApi}/salary/my-rank`);
      return fallback?.data;
    } catch (err) {
      return err?.response?.data || { success: false, message: error.message || "API error" };
    }
  }
};

export const getAllSalaryTiersApi = async () => {
  try {
    const response = await Axios.get(`${userApi}/salary/my-rank`);
    if (response?.data?.success) return response.data;
    const fallback = await Axios.get(`/salary/all-tiers`);
    return fallback?.data;
  } catch (error) {
    return error?.response?.data || { success: false, message: error.message || "API error" };
  }
};

export const getSalaryIncomeHistory = async ({ page = 1, limit = 10 } = {}) => {
  return getSalaryHistoryApi({ page, limit });
};

export const getSalaryStatus = async () => {
  try {
    const response = await Axios.get(`${userApi}/salary/my-rank`);
    if (response?.data?.success) return response.data;
    const fallback = await Axios.get(`${userApi}/get-salary-history`);
    return fallback?.data;
  } catch (error) {
    try {
      const fallback = await Axios.get(`${userApi}/get-salary-history`);
      return fallback?.data;
    } catch (err) {
      return err?.response?.data || { success: false, message: error.message || "API error" };
    }
  }
};

export const getSalaryWithdrawalBalance = async () => {
  try {
    const response = await Axios.get(`${userApi}/salary/withdrawal/balance`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || { success: false, message: error?.response?.data?.message || error.message || "API error" };
  }
};

export const submitSalaryWithdrawal = async (payload) => {
  try {
    const response = await Axios.post(`${userApi}/salary/withdrawal/request`, payload);
    return response?.data;
  } catch (error) {
    return error?.response?.data || { success: false, message: error?.response?.data?.message || error.message || "API error" };
  }
};

export const getSalaryWithdrawalHistory = async ({ page = 1, limit = 10 } = {}) => {
  try {
    const response = await Axios.get(`${userApi}/salary/withdrawal/history`, { params: { page, limit } });
    return response?.data;
  } catch (error) {
    return error?.response?.data || { success: false, message: error?.response?.data?.message || error.message || "API error" };
  }
};

// General Incomes & Transactions
export const getAllUserIncomeHistory = async () => {
  try {
    const response = await Axios.get(`${userApi}/get-income-history`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || { success: false, message: error.message || "API error" };
  }
};

export const getAllUserTransactions = async () => {
  try {
    const response = await Axios.get(`${userApi}/all-transactions`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || error;
  }
};

export const getIncomeWeakData = async () => {
  try {
    const response = await Axios.get(`${userApi}/7-days-history`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || error;
  }
};

export const getEarningHistory = async () => {
  try {
    const response = await Axios.get(`${userApi}/get-earning-history`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || error;
  }
};

// ==========================================
// 6. TEAMS & REFERRALS APIS
// ==========================================

export async function getDirectUsers() {
  try {
    const response = await Axios.get(`${userApi}/get-myteams`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || error;
  }
}

export async function getTeamDivision() {
  try {
    const response = await Axios.get(`${userApi}/get-team-division`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || { success: false, message: error.message || "API error" };
  }
}

export async function getAllTeamMembers() {
  try {
    const response = await Axios.get(`${userApi}/get-all-team-members`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || { success: false, message: error.message || "API error" };
  }
}

export async function getReferralPartners() {
  try {
    const response = await Axios.get(`${userApi}/get-partners`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || { success: false, message: error?.message || "Failed to fetch direct partners", data: [] };
  }
}

// ==========================================
// 7. DEPOSIT & WALLET APIS
// ==========================================

export const walletDepositRequest = async (payload) => {
  try {
    const response = await Axios.post(`${userApi}/tx/deposit-amount-wallet`, payload);
    return response?.data;
  } catch (error) {
    return error?.response?.data || { success: false, message: error.message || "API error" };
  }
};

export const getAllDepositWalletHistory = async () => {
  try {
    const response = await Axios.get(`${userApi}/tx/get-deposit-history-manually`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || { success: false, message: error.message || "API error" };
  }
};

export const getROIWalletBalance = async () => {
  try {
    const response = await Axios.get(`${userApi}/tx/get-roi-wallet-balance`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || { success: false, message: error.message || "API error" };
  }
};

export const depositFromROIWallet = async (payload) => {
  try {
    const response = await Axios.post(`${userApi}/tx/deposit-from-roi-wallet`, payload);
    return response?.data;
  } catch (error) {
    return error?.response?.data || { success: false, message: error.message || "API error" };
  }
};

export const depositForOtherUser = async (payload) => {
  try {
    const response = await Axios.post(`${userApi}/tx/deposit-for-other-user`, payload);
    return response?.data;
  } catch (error) {
    return error?.response?.data || { success: false, message: error.message || "API error" };
  }
};

export const transferROIWallet = async (payload) => {
  try {
    const response = await Axios.post(`${userApi}/tx/transfer-roi-wallet`, payload);
    return response?.data;
  } catch (error) {
    return error?.response?.data || { success: false, message: error.message || "API error" };
  }
};

// ==========================================
// 8. REINVESTMENT & BALANCE APIS
// ==========================================

export const getAvailableIncomeBalance = async () => {
  try {
    const response = await Axios.get(`${userApi}/get-income-balance`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || { success: false, message: error.message || "API error" };
  }
};

export const reinvestFromIncome = async (payload) => {
  try {
    const response = await Axios.post(`${userApi}/reinvest`, payload);
    return response?.data;
  } catch (error) {
    return error?.response?.data || { success: false, message: error.message || "API error" };
  }
};

export const getReinvestmentHistory = async () => {
  try {
    const response = await Axios.get(`${userApi}/get-reinvestment-history`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || { success: false, message: error.message || "API error" };
  }
};

export const activateUserAccount = async () => {
  try {
    const response = await Axios.post(`${userApi}/activate-account`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || { success: false, message: error.message || "API error" };
  }
};

// ==========================================
// 9. SUPPORT TICKET APIS
// ==========================================

export const createTicket = async (payload) => {
  try {
    const response = await Axios.post(`${userApi}/support/ticket-raise`, payload);
    return response?.data;
  } catch (error) {
    return error?.response?.data || { success: false, message: error.message || "API error" };
  }
};

export const getAllRaisedTickets = async () => {
  try {
    const response = await Axios.get(`${userApi}/support/get-history`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || { success: false, message: error.message || "API error" };
  }
};

// ==========================================
// 10. AI TRADING & STAKING APIS
// ==========================================

export async function tradeInAi() {
  try {
    const response = await Axios.post(`${userApi}/activate-ai-trade`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || { success: false, message: error.message || "API error" };
  }
}

export async function getAiTradeStatus() {
  try {
    const response = await Axios.get(`${userApi}/ai-trade-status`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || { success: false, message: error.message || "API error" };
  }
}

export const getTradingSlabs = async () => {
  try {
    const response = await Axios.get(`${userApi}/get-trading-slabs`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || { success: false, message: error?.response?.data?.message || error.message || "API error" };
  }
};

export const stakeInvestment = async (payload) => {
  try {
    const response = await Axios.post(`/api/staking/stake`, payload);
    return response?.data;
  } catch (error) {
    return error?.response?.data || { success: false, message: error?.response?.data?.message || error.message || "API error" };
  }
};

export const claimDailyReward = async () => {
  try {
    const response = await Axios.post(`${userApi}/staking/claim`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || { success: false, message: error?.response?.data?.message || error.message || "API error" };
  }
};

export const getStakingStatus = async () => {
  try {
    const response = await Axios.get(`${userApi}/staking/status`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || { success: false, message: error?.response?.data?.message || error.message || "API error" };
  }
};

export const getStakingHistory = async () => {
  try {
    const response = await Axios.get(`${userApi}/staking/history`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || { success: false, message: error?.response?.data?.message || error.message || "API error" };
  }
};

export const getStakingWallet = async () => {
  try {
    const response = await Axios.get(`${userApi}/staking/wallet`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || { success: false, message: error?.response?.data?.message || error.message || "API error" };
  }
};

export const checkStakingEligibility = async () => {
  try {
    const response = await Axios.get(`${userApi}/staking/eligibility`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || { success: false, message: error?.response?.data?.message || error.message || "API error" };
  }
};

export const getDailyStakingHistory = async () => {
  try {
    const response = await Axios.get(`${userApi}/get-income-history`);
    if (response?.data?.success) {
      const allData = response.data.data || [];
      const stakingData = allData.filter(
        (item) => item?.type === "Staking Bonus Income"
      );
      return { success: true, data: stakingData };
    }
    return { success: false, data: [], message: response?.data?.message || "Failed to fetch" };
  } catch (error) {
    return { success: false, data: [], message: error?.response?.data?.message || error.message || "API error" };
  }
};

// ==========================================
// 11. ROYALTY, RANK & MENTORSHIP APIS
// ==========================================

export const getRoyaltyStatus = async () => {
  try {
    const response = await Axios.get(`${userApi}/royalty-income/status`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || { success: false, message: error?.response?.data?.message || error.message || "API error" };
  }
};

export const getRoyaltyHistory = async ({ page = 1, limit = 10 } = {}) => {
  try {
    const response = await Axios.get(`${userApi}/royalty-income/history`, { params: { page, limit } });
    return response?.data;
  } catch (error) {
    return error?.response?.data || { success: false, message: error?.response?.data?.message || error.message || "API error" };
  }
};

export const getRoyaltyStats = async () => {
  try {
    const response = await Axios.get(`${userApi}/royalty-income/stats`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || { success: false, message: error?.response?.data?.message || error.message || "API error" };
  }
};

export const getRankRewardProgress = async () => {
  try {
    const response = await Axios.get(`${userApi}/rank-reward/progress`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || { success: false, message: error?.response?.data?.message || error.message || "API error" };
  }
};

export const getRankRewardHistory = async ({ page = 1, limit = 10 } = {}) => {
  try {
    const response = await Axios.get(`${userApi}/get-rankreward-history`, { params: { page, limit } });
    return response?.data;
  } catch (error) {
    try {
      const fallback = await Axios.get(`${userApi}/rank-reward/history`, { params: { page, limit } });
      return fallback?.data;
    } catch (err) {
      return err?.response?.data || { success: false, message: error?.response?.data?.message || error.message || "API error" };
    }
  }
};

export const getAllUserRankRewardHistory = async () => {
  try {
    const response = await Axios.get(`${userApi}/get-rankreward-history`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || { success: false, message: error.message || "API error" };
  }
};

export const getAllUserGlobalAchievers = async () => {
  try {
    const response = await Axios.get(`${userApi}/get-globalachiever-history`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || error;
  }
};

export const getAllUserMatchingIncomeHistory = async () => {
  try {
    const response = await Axios.get(`${userApi}/get-matching-history`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || { success: false, message: error.message || "API error" };
  }
};

export const getMentorshipStatus = async () => {
  try {
    const response = await Axios.get(`${userApi}/mentorship/status`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || {
      success: false,
      message: error?.response?.data?.message || error.message || "Failed to fetch mentorship status",
    };
  }
};

export const getMentorshipHistory = async (params = {}) => {
  try {
    const response = await Axios.get(`${userApi}/mentorship/history`, { params });
    return response?.data;
  } catch (error) {
    return error?.response?.data || {
      success: false,
      message: error?.response?.data?.message || error.message || "Failed to fetch mentorship history",
    };
  }
};

export const getUserAwardStatus = async () => {
  try {
    const response = await Axios.get(`/api/user/award-reward/user/status`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || { success: false, message: error?.response?.data?.message || error.message || "Failed to fetch award status" };
  }
};

export const getUserAwardHistory = async () => {
  try {
    const response = await Axios.get(`/api/user/award-reward/user/history`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || { success: false, message: error?.response?.data?.message || error.message || "Failed to fetch award history" };
  }
};

export const getAllRewardTiers = async () => {
  try {
    const response = await Axios.get(`/api/user/award-reward/tiers`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || { success: false, message: error?.response?.data?.message || error.message || "Failed to fetch reward tiers" };
  }
};

// ==========================================
// 12. FUND TRANSFER & DOLLAR BANK APIS
// ==========================================

export const transferFunds = async (payload) => {
  try {
    const response = await Axios.post(`${userApi}/verify-transfer`, payload);
    return response?.data;
  } catch (error) {
    return error?.response?.data || { success: false, message: error.message || "API error" };
  }
};

export const verifyPayment = async (payload) => {
  try {
    const response = await Axios.post(`${userApi}/add-fund`, payload);
    return response?.data;
  } catch (error) {
    return error?.response?.data || { success: false, message: error.message || "API error" };
  }
};

export const sendOtp = async (payload) => {
  try {
    const response = await Axios.post(`${userApi}/add-fund`, payload);
    return response?.data;
  } catch (error) {
    return error?.response?.data || { success: false, message: error.message || "API error" };
  }
};

export const verifyOtp = async (payload) => {
  try {
    const response = await Axios.post(`${userApi}/verify-otp`, payload);
    return response?.data;
  } catch (error) {
    return error?.response?.data || { success: false, message: error.message || "API error" };
  }
};

export const getAllUserFundTransferHistory = async () => {
  try {
    const response = await Axios.get(`${userApi}/addfund-history`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || error;
  }
};

export const investInDollarBank = async (payload) => {
  try {
    const response = await Axios.post(`${userApi}/dollar-bank/invest`, payload);
    return response?.data;
  } catch (error) {
    return error?.response?.data || error;
  }
};

export const getUserDollarBankInvestments = async () => {
  try {
    const response = await Axios.get(`${userApi}/dollar-bank/my-investments`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || error;
  }
};

export const requestDollarBankWithdrawal = async (payload) => {
  try {
    const response = await Axios.post(`${userApi}/dollar-bank/withdraw`, payload);
    return response?.data;
  } catch (error) {
    return error?.response?.data || error;
  }
};

export const investInDollarBankFromWithdrawalWallet = async (payload) => {
  try {
    const response = await Axios.post(`${userApi}/dollar-bank/invest-from-withdrawal-wallet`, payload);
    return response?.data;
  } catch (error) {
    return error?.response?.data || error;
  }
};

export const getMatrixTreeApi = async (params) => {
  try {
    const response = await Axios.get(`${userApi}/get-matrix-tree`, { params });
    return response?.data;
  } catch (error) {
    const status = error?.response?.status;
    const is403 = status === 403;
    const serverMessage = error?.response?.data?.message;
    return {
      success: false,
      status: status || 500,
      isForbidden: is403,
      message: serverMessage || (is403 ? "Access Denied: You do not have permission to view users outside your downline team." : (error.message || "Failed to fetch 3-Matrix tree"))
    };
  }
};

// ── NODEXAI TRADING PACKAGE APIS ──
export const buyTradingPackageApi = async (payload) => {
  try {
    const response = await Axios.post(`${userApi}/trading-package/buy`, payload);
    return response?.data;
  } catch (error) {
    return error?.response?.data || error;
  }
};

export const getMyTradingPackagesApi = async () => {
  try {
    const response = await Axios.get(`${userApi}/trading-package/my-packages`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || error;
  }
};

export const getMyTradingHistoryApi = async (params) => {
  try {
    const response = await Axios.get(`${userApi}/trading-package/history`, { params });
    return response?.data;
  } catch (error) {
    return error?.response?.data || error;
  }
};

// ── NODEXAI NODE WONDER APIS ──
export const buyNodeWonderApi = async (payload = {}) => {
  try {
    const response = await Axios.post(`${userApi}/node-wonder/buy`, payload);
    return response?.data;
  } catch (error) {
    return error?.response?.data || error;
  }
};

export const getMyNodeWonderStatusApi = async () => {
  try {
    const response = await Axios.get(`${userApi}/node-wonder/status`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || error;
  }
};

export const getMyNodeWonderHistoryApi = async (params) => {
  try {
    const response = await Axios.get(`${userApi}/node-wonder/history`, { params });
    return response?.data;
  } catch (error) {
    return error?.response?.data || error;
  }
};

export const getGlobalNodeWonderQueueApi = async () => {
  try {
    const response = await Axios.get(`${userApi}/node-wonder/global-queue`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || error;
  }
};
