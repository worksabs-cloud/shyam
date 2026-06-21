"use client";

export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

const TOKEN_KEY = "medsupply_token";
const USER_KEY = "medsupply_user";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setSession(token: string, user: { full_name: string; role: string }) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getUser(): { full_name: string; role: string } | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
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
    logout();
    window.location.href = "/";
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

export const api = {
  login: (username: string, password: string) =>
    request<{ access_token: string; full_name: string; role: string }>(
      "/auth/login",
      { method: "POST", body: JSON.stringify({ username, password }) }
    ),

  loadDemo: () => request<{ inventory: number; catalog: number }>("/demo/load", { method: "POST" }),

  dashboard: () => request<any>("/dashboard/metrics"),

  inventory: () => request<any[]>("/inventory"),
  uploadInventory: (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return request<any>("/inventory/upload", { method: "POST", body: fd });
  },

  suppliers: () => request<any[]>("/suppliers"),
  uploadSuppliers: (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return request<any>("/suppliers/upload", { method: "POST", body: fd });
  },

  runAnalysis: () => request<any>("/analysis/run", { method: "POST" }),
  analysisResults: () => request<any>("/analysis/results"),

  generatePO: (payload: any) =>
    request<any>("/purchase-orders/generate", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  purchaseOrders: () => request<any[]>("/purchase-orders"),
  poPdfUrl: (id: number) => `${API_BASE}/purchase-orders/${id}/pdf`,

  auditLog: () => request<any[]>("/audit-log"),
};

export function downloadPdf(id: number, poNumber: string) {
  const token = getToken();
  fetch(`${API_BASE}/purchase-orders/${id}/pdf`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((r) => r.blob())
    .then((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${poNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    });
}
