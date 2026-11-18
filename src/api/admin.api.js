import { Axios } from "../constants/mainContent";
export { AdminService } from "./services.api";

const adminApi = "/admin";

// ==========================================
// 1. ADMIN AUTHENTICATION
// ==========================================

export const adminLogin = async (payload) => {
  try {
    const response = await Axios.post(`${adminApi}/login`, payload);
    return response?.data;
  } catch (error) {
    return error?.response?.data || { success: false, message: error.message || "Admin login failed" };
  }
};

export async function changeAdminPassword(payload) {
  try {
    const response = await Axios.put(`${adminApi}/password-change`, payload);
    return response?.data;
  } catch (error) {
    return error?.response?.data || { success: false, message: error.message || "Password change failed" };
  }
}

// ==========================================
// 2. ADMIN DASHBOARD & USER MANAGEMENT
// ==========================================

export const getIncomeTotalForAdmin = async () => {
  try {
    const response = await Axios.get(`${adminApi}/get-income-summary`);
    if (response?.data?.success) return response.data;
    const fallback = await Axios.get(`${adminApi}/dashboard-stats`);
    return fallback?.data;
  } catch (error) {
    try {
      const fallback = await Axios.get(`${adminApi}/dashboard-stats`);
      return fallback?.data;
    } catch (err) {
      return error?.response?.data || error;
    }
  }
};

export const getAdminDashboardStats = getIncomeTotalForAdmin;

export const getAllUsers = async (params) => {
  try {
    const response = await Axios.get(`${adminApi}/users`, { params });
    if (response?.data?.success) return response.data;
    const fallback = await Axios.get(`${adminApi}/all-users`, { params });
    return fallback?.data;
  } catch (error) {
    try {
      const fallback = await Axios.get(`${adminApi}/all-users`, { params });
      return fallback?.data;
    } catch (err) {
      return error?.response?.data || error;
    }
  }
};

export const getAllUsersList = async () => {
  try {
    const response = await Axios.get(`${adminApi}/all-users-list`);
    if (response?.data?.success) return response.data;
    const fallback = await Axios.get(`${adminApi}/all-users`);
    return fallback?.data;
  } catch (error) {
    try {
      const fallback = await Axios.get(`${adminApi}/all-users`);
      return fallback?.data;
    } catch (err) {
      return error?.response?.data || error;
    }
  }
};

export async function BlockUser(id) {
  try {
    const response = await Axios.get(`${adminApi}/user-block/${id}`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || error;
  }
}

export async function HoldCapitalIncome(id) {
  try {
    const response = await Axios.get(`${adminApi}/user-currentIncome-hold/${id}`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || error;
  }
}

export async function lockUnlockCapitalInvestment(id) {
  try {
    const response = await Axios.get(`${adminApi}/user-capital-lock/${id}`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || error;
  }
}

export async function RoiGenerate(id) {
  try {
    const response = await Axios.get(`${adminApi}/user-roi-block/${id}`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || error;
  }
}

export async function updateUserDetails(id, payload) {
  try {
    const response = await Axios.post(`${adminApi}/update-user-info/${id}`, payload);
    return response?.data;
  } catch (error) {
    return error?.response?.data || error;
  }
}

export async function getUserDashboardAccess(id) {
  try {
    const response = await Axios.post(`${adminApi}/get-dashboard-access`, id);
    return response?.data;
  } catch (error) {
    return error?.response?.data || error;
  }
}

// ==========================================
// 3. ADMIN FUND (ADD FUND & DEPOSITS)
// ==========================================

export const AddUserFund = async (payload) => {
  try {
    const response = await Axios.post(`${adminApi}/fund/add`, payload);
    return response?.data;
  } catch (error) {
    try {
      const fallback = await Axios.post(`/fund/add`, payload);
      return fallback?.data;
    } catch (err) {
      return err?.response?.data || { success: false, message: error.message || "Failed to add fund" };
    }
  }
};

export const adminAddFundApi = AddUserFund;

export const getAllAddFundHistory = async ({ page = 1, limit = 20 } = {}) => {
  try {
    const response = await Axios.get(`${adminApi}/fund/get-fund-history`, { params: { page, limit } });
    return response?.data;
  } catch (error) {
    try {
      const fallback = await Axios.get(`/fund/get-fund-history`, { params: { page, limit } });
      return fallback?.data;
    } catch (err) {
      return err?.response?.data || error;
    }
  }
};

export const getAdminFundHistoryApi = getAllAddFundHistory;

export const getAddFundRequests = async () => {
  try {
    const response = await Axios.get(`${adminApi}/tx/get-deposit-history`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || error;
  }
};

export const addFundAcceptReject = async (id, payload) => {
  try {
    const response = await Axios.put(`${adminApi}/tx/deposit-amount-admin/${id}`, payload);
    return response?.data;
  } catch (error) {
    return error?.response?.data || error;
  }
};

export const getUserFundAccepted = async () => {
  try {
    const response = await Axios.get(`${adminApi}/tx/get-completed-deposit-history-manually`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || error;
  }
};

export const getUserFundRejected = async () => {
  try {
    const response = await Axios.get(`${adminApi}/tx/get-rejected-deposit-history-manually`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || error;
  }
};

// ==========================================
// 4. ADMIN INCOME TRIGGERS & REPORTS
// ==========================================

// Manual Daily ROI Cron Trigger
export const triggerDailyRoiCron = async () => {
  try {
    const response = await Axios.post(`${adminApi}/trading-income/distribute`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || { success: false, message: error.message || "ROI distribution failed" };
  }
};

export const distributeTradingIncomeAdmin = triggerDailyRoiCron;

// Manual Weekly Salary Cron Trigger
export const triggerWeeklySalaryCron = async (payload = {}) => {
  try {
    const response = await Axios.post(`${adminApi}/salary/trigger-salary-admin`, payload);
    if (response?.data?.success) return response.data;
    const fallback = await Axios.post(`${adminApi}/salary/distribute`, payload);
    return fallback?.data;
  } catch (error) {
    try {
      const fallback = await Axios.post(`${adminApi}/salary/distribute`, payload);
      return fallback?.data;
    } catch (err) {
      return error?.response?.data || { success: false, message: error.message || "Salary distribution failed" };
    }
  }
};

export const triggerSalaryAdmin = triggerWeeklySalaryCron;
export const triggerManualSalaryGeneration = triggerWeeklySalaryCron;

// All 15 Salary Ranks & Overall Salary Stats
export const getAdminSalaryStatsApi = async () => {
  try {
    const response = await Axios.get(`${adminApi}/salary/stats`);
    if (response?.data?.success) return response.data;
    const fallback = await Axios.get(`${adminApi}/salary/all-ranks`);
    return fallback?.data;
  } catch (error) {
    try {
      const fallback = await Axios.get(`${adminApi}/salary/all-ranks`);
      return fallback?.data;
    } catch (err) {
      return error?.response?.data || { success: false, message: error.message || "API error" };
    }
  }
};

export const getAllSalaryRanksAdmin = async () => {
  try {
    const response = await Axios.get(`${adminApi}/salary/stats`);
    if (response?.data?.success) return response.data;
    const fallback = await Axios.get(`${adminApi}/salary/all-ranks`);
    return fallback?.data;
  } catch (error) {
    try {
      const fallback = await Axios.get(`${adminApi}/salary/all-tiers`);
      return fallback?.data;
    } catch (err) {
      return error?.response?.data || error;
    }
  }
};

// All Direct Referral Income Records
export const getAllReferralIncomeAdmin = async ({ page = 1, limit = 20, userId } = {}) => {
  try {
    const params = { page, limit };
    if (userId) params.userId = userId;
    const response = await Axios.get(`${adminApi}/referral-income/all`, { params });
    if (response?.data?.success) return response.data;
    const fallback = await Axios.get(`${adminApi}/get-referralincome-history`, { params });
    return fallback?.data;
  } catch (error) {
    try {
      const fallback = await Axios.get(`${adminApi}/get-referralincome-history`, { params: { page, limit, userId } });
      return fallback?.data;
    } catch (err) {
      return error?.response?.data || { success: false, message: error.message || "API error" };
    }
  }
};

export const getAdminAllReferralIncome = getAllReferralIncomeAdmin;
export const getAllReferralIncomeHistory = getAllReferralIncomeAdmin;

export const getReferralIncomeStatsApi = async () => {
  try {
    const response = await Axios.get(`${adminApi}/referral-income/stats`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || error;
  }
};

export const getAllTradingList = async ({ page = 1, limit = 20, userId } = {}) => {
  try {
    const params = { page, limit };
    if (userId) params.userId = userId;
    const response = await Axios.get(`${adminApi}/trading-income/all`, { params });
    if (response?.data?.success) return response.data;
    const fallback = await Axios.get(`${adminApi}/get-tradingprofit-history`, { params });
    return fallback?.data;
  } catch (error) {
    try {
      const fallback = await Axios.get(`${adminApi}/get-tradingprofit-history`, { params: { page, limit, userId } });
      return fallback?.data;
    } catch (err) {
      return error?.response?.data || error;
    }
  }
};

/**
 * 01b. 12% Direct Booster Income History (Admin)
 * GET /api/admin/get-booster-income-history
 */
export const getAdminDirectBoosterIncomeApi = async () => {
  try {
    const response = await Axios.get(`${adminApi}/get-booster-income-history`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || { success: false, message: error.message || "API error" };
  }
};

/**
 * 01c. 7-Days Team Business Booster Reports (Admin)
 * GET /api/admin/get-team-booster-history
 */
export const getAdminTeamBoosterIncomeApi = async () => {
  try {
    const response = await Axios.get(`${adminApi}/get-team-booster-history`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || { success: false, message: error.message || "API error" };
  }
};

/**
 * Trigger 7-Days Team Business Booster Distribution (Admin)
 * POST /api/admin/trigger-team-booster
 */
export const triggerTeamBoosterDistributionApi = async () => {
  try {
    const response = await Axios.post(`${adminApi}/trigger-team-booster`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || { success: false, message: error.message || "API error" };
  }
};

export const getAllLevelIncomeHistory = async ({ page = 1, limit = 20, level } = {}) => {
  try {
    const params = { page, limit };
    if (level) params.level = level;
    const response = await Axios.get(`${adminApi}/level-income/all`, { params });
    if (response?.data?.success) return response.data;
    const fallback = await Axios.get(`${adminApi}/get-levelincome-history`, { params });
    return fallback?.data;
  } catch (error) {
    try {
      const fallback = await Axios.get(`${adminApi}/get-levelincome-history`, { params: { page, limit, level } });
      return fallback?.data;
    } catch (err) {
      return error?.response?.data || { success: false, message: error.message || "API error" };
    }
  }
};

export const getAllMatchingIncomeHistory = async () => {
  try {
    const response = await Axios.get(`${adminApi}/get-matching-history`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || { success: false, message: error.message || "API error" };
  }
};

export const getAllRankRewardHistory = async () => {
  try {
    const response = await Axios.get(`${adminApi}/get-rankreward-history`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || { success: false, message: error.message || "API error" };
  }
};

export const getAllIncomeHistory = async ({ page = 1 } = {}) => {
  try {
    const response = await Axios.get(`${adminApi}/income-history`, { params: { page } });
    return response?.data;
  } catch (error) {
    return error?.response?.data || { success: false, message: error.message || "API error" };
  }
};

export async function getIncomeTotalForAdminIncome() {
  try {
    const response = await Axios.get(`${adminApi}/get-income-summary`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || error;
  }
}

// ==========================================
// 5. ADMIN TRANSACTIONS & WITHDRAWALS
// ==========================================

export async function getTransactionHistoryForAdmin() {
  try {
    const response = await Axios.get(`${adminApi}/recent-transactions`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || error;
  }
}

export const getAllTransactions = async () => {
  try {
    const response = await Axios.get(`${adminApi}/all-transactions`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || error;
  }
};

export const getAllWithdrawalRequests = async () => {
  try {
    const response = await Axios.get(`${adminApi}/get-withdrawal-history`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || error;
  }
};

export const getAllApprovedWithdrawalRequests = async () => {
  try {
    const response = await Axios.get(`${adminApi}/get-approved-withdrawal-request`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || error;
  }
};

export const getAllRejectedWithdrawalRequests = async () => {
  try {
    const response = await Axios.get(`${adminApi}/get-rejected-withdrawal-request`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || error;
  }
};

export const getAllWithdrawalRequestss = async (params) => {
  try {
    const response = await Axios.get(`${adminApi}/get-withdrawal-history`, { params });
    if (
      response?.data?.success ||
      Array.isArray(response?.data?.withdrawals) ||
      Array.isArray(response?.data?.history) ||
      Array.isArray(response?.data)
    ) {
      return response.data;
    }
    const fallback = await Axios.get(`${adminApi}/tx/withdrawals/pending`, { params });
    return fallback?.data;
  } catch (error) {
    try {
      const fallback = await Axios.get(`${adminApi}/tx/withdrawals/pending`, { params });
      return fallback?.data;
    } catch (err) {
      try {
        const fallback2 = await Axios.get(`${adminApi}/all-withdrawal-request`, { params });
        return fallback2?.data;
      } catch (err2) {
        return error?.response?.data || { success: false, data: [], message: error?.message || "Failed to fetch withdrawals" };
      }
    }
  }
};

export const approveWithdrawal = async (data, txHash) => {
  const payload =
    typeof data === "object"
      ? { status: "Approved", ...data }
      : { withdrawalId: data, id: data, status: "Approved", txHash };

  if (!payload.id && payload.withdrawalId) payload.id = payload.withdrawalId;
  if (!payload.withdrawalId && payload.id) payload.withdrawalId = payload.id;
  if (txHash && !payload.txHash) payload.txHash = txHash;
  if (txHash && !payload.hash) payload.hash = txHash;

  const endpoints = [
    `${adminApi}/withdrawal-approve`,
    `${adminApi}/withdrawal-accepted`,
    `${adminApi}/withdrawal-approve-reject`,
    `${adminApi}/tx/withdrawal-accepted`,
  ];

  for (const ep of endpoints) {
    try {
      const response = await Axios.post(ep, payload);
      if (response?.data?.success) return response.data;
      if (response?.data && response.status === 200) return response.data;
    } catch (err) {
      if (err?.response?.status && err.response.status !== 404) {
        return err?.response?.data || { success: false, message: err?.message };
      }
    }
  }

  const targetId = payload.withdrawalId || payload.id || payload.transactionId;
  if (targetId) {
    try {
      const patchResp = await Axios.patch(`${adminApi}/tx/withdrawals/${targetId}/approve`, payload);
      if (patchResp?.data?.success) return patchResp.data;
    } catch (err) {
      // ignore
    }
  }

  return { success: false, message: "Failed to approve withdrawal (endpoint not reachable)." };
};

export const rejectWithdrawal = async (data, reason) => {
  const payload =
    typeof data === "object"
      ? { status: "Rejected", ...data }
      : { withdrawalId: data, id: data, status: "Rejected", reason };

  if (!payload.id && payload.withdrawalId) payload.id = payload.withdrawalId;
  if (!payload.withdrawalId && payload.id) payload.withdrawalId = payload.id;
  if (reason && !payload.reason) payload.reason = reason;
  if (reason && !payload.remark) payload.remark = reason;

  const endpoints = [
    `${adminApi}/withdrawal-approve`,
    `${adminApi}/withdrawal-reject`,
    `${adminApi}/withdrawal-accepted`,
    `${adminApi}/withdrawal-approve-reject`,
    `${adminApi}/tx/withdrawal-accepted`,
  ];

  for (const ep of endpoints) {
    try {
      const response = await Axios.post(ep, payload);
      if (response?.data?.success) return response.data;
      if (response?.data && response.status === 200) return response.data;
    } catch (err) {
      if (err?.response?.status && err.response.status !== 404) {
        return err?.response?.data || { success: false, message: err?.message };
      }
    }
  }

  const targetId = payload.withdrawalId || payload.id || payload.transactionId;
  if (targetId) {
    try {
      const patchResp = await Axios.patch(`${adminApi}/tx/withdrawals/${targetId}/reject`, { reason: payload.reason || reason });
      if (patchResp?.data?.success) return patchResp.data;
    } catch (err) {
      // ignore
    }
  }

  return { success: false, message: "Failed to reject withdrawal (endpoint not reachable)." };
};

export async function requestWithdrawalStatus(payload) {
  try {
    const response = await Axios.post(`${adminApi}/tx/withdrawal-accepted`, payload);
    return response?.data;
  } catch (error) {
    return error?.response?.data || error;
  }
}

export async function withdrawalRequestApproveReject(id, status) {
  try {
    const response = await Axios.post(`${adminApi}/get-dashboard-access/${id}`, status);
    return response?.data;
  } catch (error) {
    return error?.response?.data || error;
  }
}

// ==========================================
// 6. ADMIN PACKAGES & PLANS
// ==========================================

export async function getPackageInfoAdmin() {
  try {
    const response = await Axios.get(`${adminApi}/package/get-all-packages`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || error;
  }
}

export const createPackageAdmin = async (payload) => {
  try {
    const response = await Axios.post(`${adminApi}/package/create`, payload);
    return response?.data;
  } catch (error) {
    return error?.response?.data || error;
  }
};

export const updatePackageAdmin = async (id, payload) => {
  try {
    if (!id) return { success: false, message: "Package ID is required" };
    const response = await Axios.put(`${adminApi}/package/update/${id}`, payload);
    return response?.data;
  } catch (error) {
    return error?.response?.data || error;
  }
};

export const deletePackageAdmin = async (id) => {
  try {
    if (!id) return { success: false, message: "Package ID is required" };
    const response = await Axios.delete(`${adminApi}/package/delete/${id}`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || error;
  }
};

export async function getAllPackageBuyers() {
  try {
    const response = await Axios.get(`${adminApi}/package/get-package-buyers`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || error;
  }
}

export async function getPlanInfoAdmin() {
  try {
    const response = await Axios.get(`${adminApi}/plan/get-admin-reports`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || error;
  }
}

export const createPlanAdmin = async (payload) => {
  try {
    const response = await Axios.post(`${adminApi}/plan/create`, payload);
    return response?.data;
  } catch (error) {
    return error?.response?.data || error;
  }
};

export const updatePlanAdmin = async (id, payload) => {
  try {
    if (!id) return { success: false, message: "Plan ID is required" };
    const response = await Axios.put(`${adminApi}/plan/update/${id}`, payload);
    return response?.data;
  } catch (error) {
    return error?.response?.data || error;
  }
};

export const deletePlanAdmin = async (id) => {
  try {
    if (!id) return { success: false, message: "Plan ID is required" };
    const response = await Axios.delete(`${adminApi}/plan/delete/${id}`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || error;
  }
};

// ==========================================
// 7. ADMIN SUPPORT TICKETS
// ==========================================

export async function getAllTickets() {
  try {
    const response = await Axios.get(`${adminApi}/support/get-all-reports`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || error;
  }
}

export async function getAllClosedTickets() {
  try {
    const response = await Axios.get(`${adminApi}/support/get-approved-support`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || error;
  }
}

export async function closeTicket(id, payload) {
  try {
    const response = await Axios.put(`${adminApi}/support/ticket-response/${id}`, payload);
    return response?.data;
  } catch (error) {
    return error?.response?.data || error;
  }
}

// ==========================================
// 8. ADMIN REWARD TIERS & RANKS
// ==========================================

export const getAllRewardTiers = async () => {
  try {
    const response = await Axios.get(`${adminApi}/reward-tier/admin/all`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || error;
  }
};

export const getActiveRewardTiers = async () => {
  try {
    const response = await Axios.get(`/user/reward-tier/active`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || error;
  }
};

export const createRewardTier = async (payload) => {
  try {
    const response = await Axios.post(`${adminApi}/reward-tier`, payload);
    return response?.data;
  } catch (error) {
    return error?.response?.data || error;
  }
};

export const updateRewardTier = async (id, payload) => {
  try {
    if (!id) return { success: false, message: "Reward Tier ID is required" };
    const response = await Axios.put(`${adminApi}/reward-tier/${id}`, payload);
    return response?.data;
  } catch (error) {
    return error?.response?.data || error;
  }
};

export const deleteRewardTier = async (id) => {
  try {
    if (!id) return { success: false, message: "Reward Tier ID is required" };
    const response = await Axios.delete(`${adminApi}/reward-tier/${id}`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || error;
  }
};

export const toggleRewardTierStatus = async (id) => {
  try {
    if (!id) return { success: false, message: "Reward Tier ID is required" };
    const response = await Axios.patch(`${adminApi}/reward-tier/${id}/toggle-status`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || error;
  }
};

export const getAdminRankRewardRecipients = async () => {
  try {
    const response = await Axios.get(`${adminApi}/rank-reward/all-recipients`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || { success: false, message: error.message || "API error" };
  }
};

export const checkAllRankRewards = async () => {
  try {
    const response = await Axios.post(`${adminApi}/check-all-rank-rewards`, {});
    return response?.data;
  } catch (error) {
    return error?.response?.data || { success: false, message: error.message || "Failed to check rank rewards" };
  }
};

export const syncMissingReferralBonuses = async () => {
  try {
    const response = await Axios.post(`${adminApi}/sync-missing-referral-bonuses`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || { success: false, message: error.message || "Failed to sync referral bonuses" };
  }
};

// ==========================================
// 9. ADMIN SALARY & ROYALTY & MENTORSHIP
// ==========================================

export const getAdminSalaryIncomeAll = async ({ status, page = 1, limit = 50, search, userId } = {}) => {
  try {
    const params = { page, limit };
    if (status && status !== "All") params.status = status;
    if (search) params.search = search;
    if (userId) params.userId = userId;
    const response = await Axios.get(`${adminApi}/salary/all`, { params });
    if (response?.data?.success) return response.data;
    const fallback = await Axios.get(`${adminApi}/get-salary-history`, { params });
    return fallback?.data;
  } catch (error) {
    try {
      const params = { page, limit };
      if (status && status !== "All") params.status = status;
      if (search) params.search = search;
      if (userId) params.userId = userId;
      const fallback = await Axios.get(`${adminApi}/get-salary-history`, { params });
      return fallback?.data;
    } catch (err) {
      return err?.response?.data || { success: false, message: error.message || "API error" };
    }
  }
};

export const getAdminSalaryWithdrawalAll = async ({ status, page = 1, limit = 10, userId } = {}) => {
  try {
    const params = { page, limit };
    if (status) params.status = status;
    if (userId) params.userId = userId;
    const response = await Axios.get(`${adminApi}/salary/withdrawal/all`, { params });
    return response?.data;
  } catch (error) {
    return error?.response?.data || { success: false, message: error.message || "API error" };
  }
};

export const getAdminSalaryWithdrawalStats = async () => {
  try {
    const response = await Axios.get(`${adminApi}/salary/withdrawal/stats`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || { success: false, message: error.message || "API error" };
  }
};

export const getAdminSalaryWithdrawalByUser = async (userId) => {
  try {
    const response = await Axios.get(`${adminApi}/salary/withdrawal/user/${userId}`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || { success: false, message: error.message || "API error" };
  }
};

export const adminCalculateRoyalty = async (payload) => {
  try {
    const response = await Axios.post(`${adminApi}/royalty-income/calculate`, payload);
    return response?.data;
  } catch (error) {
    return error?.response?.data || { success: false, message: error.message || "API error" };
  }
};

export const getAdminRoyaltyAll = async ({ tier } = {}) => {
  try {
    const response = await Axios.get(`${adminApi}/royalty-income/all`, { params: tier ? { tier } : {} });
    return response?.data;
  } catch (error) {
    return error?.response?.data || { success: false, message: error.message || "API error" };
  }
};

export const getAdminRoyaltyMembers = async ({ tier } = {}) => {
  try {
    const response = await Axios.get(`${adminApi}/royalty-income/members`, { params: tier ? { tier } : {} });
    return response?.data;
  } catch (error) {
    return error?.response?.data || { success: false, message: error.message || "API error" };
  }
};

export const getAdminRoyaltyTurnover = async ({ month, year } = {}) => {
  try {
    const response = await Axios.get(`${adminApi}/royalty-income/turnover`, { params: { month, year } });
    return response?.data;
  } catch (error) {
    return error?.response?.data || { success: false, message: error.message || "API error" };
  }
};

export const getAdminMentorshipEligibleUsers = async (params = {}) => {
  try {
    const response = await Axios.get(`${adminApi}/mentorship/eligible-users`, { params });
    return response?.data;
  } catch (error) {
    return error?.response?.data || { success: false, message: error.message || "Failed to fetch eligible users" };
  }
};

export const adminDistributeMentorship = async (payload = {}) => {
  try {
    const response = await Axios.post(`${adminApi}/mentorship/distribute`, payload);
    return response?.data;
  } catch (error) {
    return error?.response?.data || { success: false, message: error.message || "Failed to distribute mentorship bonus" };
  }
};

export const adminDistributeSingleMentorship = async (payload = {}) => {
  try {
    const response = await Axios.post(`${adminApi}/mentorship/distribute-single`, payload);
    return response?.data;
  } catch (error) {
    return error?.response?.data || { success: false, message: error.message || "Failed to distribute mentorship bonus" };
  }
};

export const getAdminMentorshipAllHistory = async (params = {}) => {
  try {
    const response = await Axios.get(`${adminApi}/mentorship/all-history`, { params });
    return response?.data;
  } catch (error) {
    return error?.response?.data || { success: false, message: error.message || "Failed to fetch mentorship history" };
  }
};

// ==========================================
// 10. ADMIN DOLLAR BANK & GLOBAL ACHIEVERS
// ==========================================

export const getDollarBankSummary = async () => {
  try {
    const response = await Axios.get(`${adminApi}/dollar-bank/summary`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || error;
  }
};

export const getAllDollarBankUsers = async () => {
  try {
    const response = await Axios.get(`${adminApi}/dollar-bank/all-users`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || error;
  }
};

export const getAllDollarBankWithdrawalRequests = async () => {
  try {
    const response = await Axios.get(`${adminApi}/dollar-bank/withdrawal-requests`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || error;
  }
};

export const updateDollarBankWithdrawalStatus = async (payload) => {
  try {
    const response = await Axios.post(`/dollar-bank/withdrawal-approve-reject`, payload);
    return response?.data;
  } catch (error) {
    return error?.response?.data || error;
  }
};

export const getAllGlobalAchievers = async () => {
  try {
    const response = await Axios.get(`${adminApi}/get-globalachiever-history`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || error;
  }
};

export async function createRankAndReward(payload) {
  try {
    const response = await Axios.post(`${adminApi}/reward/create`, payload);
    return response?.data;
  } catch (error) {
    return error?.response?.data;
  }
}

export async function getRankAndReward() {
  try {
    const response = await Axios.get(`${adminApi}/reward/get-admin-reports`);
    return response?.data;
  } catch (error) {
    return error?.response?.data;
  }
}

export async function updateRewardAndRank(id, payload) {
  try {
    const response = await Axios.put(`${adminApi}/reward/update/${id}`, payload);
    return response?.data;
  } catch (error) {
    return error?.response?.data;
  }
}

export async function rankAndRewardStatus(id) {
  try {
    const response = await Axios.put(`${adminApi}/reward/status/${id}`);
    return response?.data;
  } catch (error) {
    return error?.response?.data;
  }
}

export async function getAllGlobalAchieversClub() {
  try {
    const response = await Axios.get(`${adminApi}/reward/get-global-acheivers`);
    return response?.data;
  } catch (error) {
    return error?.response?.data;
  }
}

export async function updateGlobalAchieversClub(id, payload) {
  try {
    const response = await Axios.put(`${adminApi}/reward/update/${id}`, payload);
    return response?.data;
  } catch (error) {
    return error?.response?.data;
  }
}

export async function globalachieverStatus(id) {
  try {
    const response = await Axios.put(`${adminApi}/reward/status/${id}`);
    return response?.data;
  } catch (error) {
    return error?.response?.data;
  }
}

// ==========================================
// AUTO COMPOUNDING (0.5% BONUS) - ADMIN
// ==========================================

export async function getAllCompoundingHistoryAdmin(params = {}) {
  try {
    const response = await Axios.get(`${adminApi}/compounding/all`, { params });
    return response?.data;
  } catch (error) {
    return error?.response?.data || { success: false, message: error.message || "Failed to fetch compounding history" };
  }
}

export async function getCompoundingStatsAdmin() {
  try {
    const response = await Axios.get(`${adminApi}/compounding/stats`);
    return response?.data;
  } catch (error) {
    return error?.response?.data || { success: false, message: error.message || "Failed to fetch compounding stats" };
  }
}
