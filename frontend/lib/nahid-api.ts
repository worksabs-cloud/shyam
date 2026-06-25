"use client";

export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

const TOKEN_KEY = "nahid_access_token";
const REFRESH_KEY = "nahid_refresh_token";
const USER_KEY = "nahid_user";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser(): any | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function setSession(accessToken: string, refreshToken: string, user: any) {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_KEY, refreshToken);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401 && typeof window !== "undefined") {
    clearSession();
    window.location.href = "/nahid/login";
  }

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const data = await res.json();
      detail = data.detail || detail;
    } catch {
      /* ignore */
    }
    throw new Error(detail);
  }
  return res.json();
}

export const nahidApi = {
  // Auth
  login: (email: string, password: string) =>
    request<{ access_token: string; refresh_token: string; user_role: string; user_id: number }>(
      "/api/v2/auth/login",
      { method: "POST", body: JSON.stringify({ email, password }) }
    ),
  register: (data: { email: string; password: string; first_name: string; last_name: string; role: string; phone?: string }) =>
    request<{ access_token: string; refresh_token: string; user_role: string; user_id: number }>(
      "/api/v2/auth/register",
      { method: "POST", body: JSON.stringify(data) }
    ),
  me: () => request<any>("/api/v2/auth/me"),

  // Medicines
  getMedicines: (params?: { skip?: number; limit?: number; search?: string; category?: string }) => {
    const q = new URLSearchParams();
    if (params?.skip !== undefined) q.set("skip", String(params.skip));
    if (params?.limit !== undefined) q.set("limit", String(params.limit));
    if (params?.search) q.set("search", params.search);
    if (params?.category) q.set("category", params.category);
    return request<any[]>(`/api/v2/medicines/?${q}`);
  },
  getAllMedicinesAdmin: (params?: { search?: string }) => {
    const q = new URLSearchParams();
    if (params?.search) q.set("search", params.search);
    return request<any[]>(`/api/v2/medicines/all-admin?${q}`);
  },
  getMedicine: (id: number) => request<any>(`/api/v2/medicines/${id}`),
  createMedicine: (data: any) =>
    request<any>("/api/v2/medicines/", { method: "POST", body: JSON.stringify(data) }),
  updateMedicine: (id: number, data: any) =>
    request<any>(`/api/v2/medicines/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  getLowStock: () => request<any[]>("/api/v2/medicines/low-stock"),
  getExpiring: (days = 30) => request<any[]>(`/api/v2/medicines/expiring?days=${days}`),

  // Orders
  createOrder: (data: any) =>
    request<any>("/api/v2/orders/", { method: "POST", body: JSON.stringify(data) }),
  getOrders: () => request<any[]>("/api/v2/orders/"),
  getOrdersSummary: () => request<any>("/api/v2/orders/summary"),
  getOrder: (id: number) => request<any>(`/api/v2/orders/${id}`),
  updateOrderStatus: (id: number, status: string, notes?: string) =>
    request<any>(`/api/v2/orders/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status, notes }),
    }),

  // Analytics
  getDashboard: () => request<any>("/api/v2/analytics/dashboard"),
  getSalesTrend: (days = 30) => request<any[]>(`/api/v2/analytics/sales-trend?days=${days}`),
  getTopMedicines: (limit = 10) => request<any[]>(`/api/v2/analytics/top-medicines?limit=${limit}`),
  getCategoryBreakdown: () => request<any[]>("/api/v2/analytics/category-breakdown"),

  // Inventory
  getInventory: () => request<any[]>("/api/v2/inventory/"),
  addBatch: (data: any) =>
    request<any>("/api/v2/inventory/batch", { method: "POST", body: JSON.stringify(data) }),
  getBatches: (medicineId: number) => request<any[]>(`/api/v2/inventory/batches/${medicineId}`),

  // Users
  getUsers: () => request<any[]>("/api/v2/users/"),
  updateUserStatus: (id: number, status: string) =>
    request<any>(`/api/v2/users/${id}/status?status=${status}`, { method: "PUT" }),
  getNotifications: () => request<any[]>("/api/v2/users/notifications"),

  // Pharmacies
  getPharmacies: () => request<any[]>("/api/v2/pharmacies/"),
  getMyPharmacyProfile: () => request<any>("/api/v2/pharmacies/my-profile"),
  approvePharmacy: (id: number) =>
    request<any>(`/api/v2/pharmacies/${id}/approve`, { method: "PUT" }),

  // Suppliers
  getSuppliers: () => request<any[]>("/api/v2/suppliers/"),
  getMySupplierProfile: () => request<any>("/api/v2/suppliers/my-profile"),

  // Delivery
  getMyDeliveries: () => request<any[]>("/api/v2/delivery/my-deliveries"),
  getDeliveryAgents: () => request<any[]>("/api/v2/delivery/agents"),

  // AI
  aiSearch: (query: string) => request<any>(`/api/v2/ai/search?query=${encodeURIComponent(query)}`),
  getDemandForecast: (medicineId: number) => request<any>(`/api/v2/ai/forecast/${medicineId}`),
  getExpiryRisk: () => request<any[]>("/api/v2/ai/expiry-risk"),
  getReorderRecommendations: () => request<any[]>("/api/v2/ai/reorder-recommendations"),
};
