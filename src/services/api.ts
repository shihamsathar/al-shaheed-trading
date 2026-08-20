/**
 * Al Shaheed Trading and Equipment Co.
 * Client API Service with Token Handling & Error Management
 */

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('ast_auth_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMsg = 'An unexpected error occurred';
    try {
      const data = await res.json();
      errorMsg = data.error || data.message || errorMsg;
    } catch {
      errorMsg = res.statusText || errorMsg;
    }
    throw new Error(errorMsg);
  }
  return res.json();
}

export const api = {
  // Auth
  async login(credentials: { email?: string; username?: string; password?: string; role?: string }) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return handleResponse<{ token: string; user: any }>(res);
  },

  async register(data: any) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<{ token: string; user: any }>(res);
  },

  async logout() {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: getAuthHeader(),
      });
    } catch {
      // silent
    }
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeader(),
    });
    return handleResponse<any>(res);
  },

  async switchDemo(userId: string) {
    const res = await fetch(`${API_BASE}/auth/switch-demo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    return handleResponse<{ token: string; user: any }>(res);
  },

  async updateAdminCredentials(payload: { username?: string; email?: string; password?: string }) {
    const res = await fetch(`${API_BASE}/admin/credentials`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(payload),
    });
    return handleResponse<{ success: boolean; message: string; user: any }>(res);
  },

  // Listings / Marketplace
  async getListings(params?: { category?: string; status?: string; search?: string; origin?: string; port?: string }) {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${API_BASE}/listings?${query}`, {
      headers: getAuthHeader(),
    });
    return handleResponse<any[]>(res);
  },

  async getListingById(id: string) {
    const res = await fetch(`${API_BASE}/listings/${id}`, {
      headers: getAuthHeader(),
    });
    return handleResponse<any>(res);
  },

  async createListing(data: any) {
    const res = await fetch(`${API_BASE}/listings`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },

  async updateListing(id: string, data: any) {
    const res = await fetch(`${API_BASE}/listings/${id}`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },

  async deleteListing(id: string) {
    const res = await fetch(`${API_BASE}/listings/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    return handleResponse<{ success: boolean; message: string }>(res);
  },

  async updateListingStatus(id: string, status: string, adminNotes?: string) {
    const res = await fetch(`${API_BASE}/listings/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeader(),
      body: JSON.stringify({ status, adminNotes }),
    });
    return handleResponse<any>(res);
  },

  async expressInterest(listingId: string, payload?: { proposedQuantity?: number; proposedPrice?: number; message?: string }) {
    const res = await fetch(`${API_BASE}/listings/${listingId}/interest`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(payload || {}),
    });
    return handleResponse<any>(res);
  },

  // Requirements / Demands
  async getRequirements(params?: { category?: string; search?: string }) {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${API_BASE}/requirements?${query}`, {
      headers: getAuthHeader(),
    });
    return handleResponse<any[]>(res);
  },

  async createRequirement(data: any) {
    const res = await fetch(`${API_BASE}/requirements`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },

  async updateRequirement(id: string, data: any) {
    const res = await fetch(`${API_BASE}/requirements/${id}`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },

  async deleteRequirement(id: string) {
    const res = await fetch(`${API_BASE}/requirements/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    return handleResponse<{ success: boolean; message: string }>(res);
  },

  // Matches & Workspace
  async getMatches() {
    const res = await fetch(`${API_BASE}/matches`, {
      headers: getAuthHeader(),
    });
    return handleResponse<any[]>(res);
  },

  async analyzeMatchAI(listingId: string, requirementId: string) {
    const res = await fetch(`${API_BASE}/matches/analyze-ai`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ listingId, requirementId }),
    });
    return handleResponse<{ insight: string; confidence: number; recommendation: string }>(res);
  },

  async createDealFromMatch(payload: any) {
    const res = await fetch(`${API_BASE}/matches/create-deal`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(payload),
    });
    return handleResponse<any>(res);
  },

  // Transactions
  async getTransactions() {
    const res = await fetch(`${API_BASE}/transactions`, {
      headers: getAuthHeader(),
    });
    return handleResponse<any[]>(res);
  },

  async updateTransactionStatus(id: string, payload: { status?: string; paymentStatus?: string; shipmentStatus?: string }) {
    const res = await fetch(`${API_BASE}/transactions/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeader(),
      body: JSON.stringify(payload),
    });
    return handleResponse<any>(res);
  },

  async cancelTransaction(id: string, reason: string, financialImpact?: number, notes?: string) {
    const res = await fetch(`${API_BASE}/transactions/${id}/cancel`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ reason, financialImpact, notes }),
    });
    return handleResponse<any>(res);
  },

  // Agents
  async getAgents() {
    const res = await fetch(`${API_BASE}/agents`, {
      headers: getAuthHeader(),
    });
    return handleResponse<any[]>(res);
  },

  async createAgent(data: any) {
    const res = await fetch(`${API_BASE}/agents`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },

  async updateAgent(id: string, data: any) {
    const res = await fetch(`${API_BASE}/agents/${id}`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },

  async deleteAgent(id: string) {
    const res = await fetch(`${API_BASE}/agents/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    return handleResponse<{ success: boolean; message: string }>(res);
  },

  async getAgentAssignments() {
    const res = await fetch(`${API_BASE}/agent/assignments`, {
      headers: getAuthHeader(),
    });
    return handleResponse<any[]>(res);
  },

  async assignMaterialToAgent(payload: {
    listingId: string;
    agentId: string;
    quantityMT: number;
    agentRatePerTon: number;
    commercialTerms?: string;
    targetSalesPrice?: number;
  }) {
    const res = await fetch(`${API_BASE}/agents/assign`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(payload),
    });
    return handleResponse<any>(res);
  },

  async updateAgentProgress(assignmentId: string, status: string, note?: string) {
    const res = await fetch(`${API_BASE}/agent/assignments/${assignmentId}/update`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ status, note }),
    });
    return handleResponse<any>(res);
  },

  // Counterparties
  async getSuppliers() {
    const res = await fetch(`${API_BASE}/suppliers`, {
      headers: getAuthHeader(),
    });
    return handleResponse<any[]>(res);
  },

  async getBuyers() {
    const res = await fetch(`${API_BASE}/buyers`, {
      headers: getAuthHeader(),
    });
    return handleResponse<any[]>(res);
  },

  async createCounterparty(data: any) {
    const res = await fetch(`${API_BASE}/counterparties`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },

  async updateCounterparty(id: string, data: any) {
    const res = await fetch(`${API_BASE}/counterparties/${id}`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },

  async deleteCounterparty(id: string) {
    const res = await fetch(`${API_BASE}/counterparties/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    return handleResponse<{ success: boolean; message: string }>(res);
  },

  // Notifications
  async getNotifications() {
    const res = await fetch(`${API_BASE}/notifications`, {
      headers: getAuthHeader(),
    });
    return handleResponse<any[]>(res);
  },

  async markNotificationRead(id: string) {
    const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'PATCH',
      headers: getAuthHeader(),
    });
    return handleResponse<any>(res);
  },

  async markAllNotificationsRead() {
    const res = await fetch(`${API_BASE}/notifications/read-all`, {
      method: 'PATCH',
      headers: getAuthHeader(),
    });
    return handleResponse<any>(res);
  },

  // Documents
  async getDocuments() {
    const res = await fetch(`${API_BASE}/documents`, {
      headers: getAuthHeader(),
    });
    return handleResponse<any[]>(res);
  },

  async uploadDocument(data: any) {
    const res = await fetch(`${API_BASE}/documents`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },

  // Audit Logs
  async getAuditLogs() {
    const res = await fetch(`${API_BASE}/audit-logs`, {
      headers: getAuthHeader(),
    });
    return handleResponse<any[]>(res);
  },

  // Analytics
  async getAnalyticsSummary() {
    const res = await fetch(`${API_BASE}/analytics/summary`, {
      headers: getAuthHeader(),
    });
    return handleResponse<any>(res);
  },

  async getAnalyticsCharts() {
    const res = await fetch(`${API_BASE}/analytics/charts`, {
      headers: getAuthHeader(),
    });
    return handleResponse<any>(res);
  },

  // Settings
  async getSettings() {
    const res = await fetch(`${API_BASE}/settings`, {
      headers: getAuthHeader(),
    });
    return handleResponse<any>(res);
  },

  async updateSettings(data: any) {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },

  // AI Utilities
  async normalizeCommodityAI(rawText: string) {
    const res = await fetch(`${API_BASE}/ai/normalize-commodity`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ rawText }),
    });
    return handleResponse<{ original: string; normalized: string }>(res);
  },
};
