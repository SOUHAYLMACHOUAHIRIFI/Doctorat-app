// Central API Client for GCD USMBA Full-Stack Platform

const API_BASE = '/api';

// Retrieve stored token if any (fallback for Authorization header)
export const getStoredToken = (): string | null => {
  return localStorage.getItem('gcd_auth_token');
};

export const setStoredToken = (token: string | null) => {
  if (token) {
    localStorage.setItem('gcd_auth_token', token);
  } else {
    localStorage.removeItem('gcd_auth_token');
  }
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include', // Automatically passes HttpOnly cookies
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.message || `Erreur serveur (${response.status})`;
    throw new Error(errorMsg);
  }

  return data;
}

export const api = {
  auth: {
    async register(payload: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      cin: string;
      phone: string;
      etablissementOrigine: string;
      diplomeOrigine: string;
    }) {
      const res = await request<{ success: boolean; user: any; token: string; message: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      if (res.token) setStoredToken(res.token);
      return res;
    },

    async login(email: string, password: string) {
      const res = await request<{ success: boolean; user: any; token: string; message: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (res.token) setStoredToken(res.token);
      return res;
    },

    async logout() {
      try {
        await request('/auth/logout', { method: 'POST' });
      } finally {
        setStoredToken(null);
      }
    },

    async getMe() {
      return request<{ success: boolean; user: any }>('/auth/me');
    },

    async updateProfile(updates: Record<string, any>) {
      return request<{ success: boolean; user: any; message: string }>('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    },

    async requestPasswordReset(email: string) {
      return request<{ success: boolean; message: string }>('/auth/password/reset-request', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    },

    async confirmPasswordReset(token: string, newPassword: string) {
      return request<{ success: boolean; message: string }>('/auth/password/reset-confirm', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword }),
      });
    },
  },

  topics: {
    async getAll() {
      return request<{ success: boolean; count: number; topics: any[] }>('/topics');
    },

    async getById(id: string) {
      return request<{ success: boolean; topic: any }>(`/topics/${id}`);
    },

    async create(payload: {
      title: string;
      summary: string;
      keywords: string[];
      establishment: string;
      laboratoryId: string;
      slotsTotal?: number;
    }) {
      return request<{ success: boolean; topic: any; message: string }>('/topics', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    async update(id: string, updates: Record<string, any>) {
      return request<{ success: boolean; topic: any; message: string }>(`/topics/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    },

    async reviewStructure(id: string, decision: 'APPROVE' | 'REJECT', feedback: string) {
      return request<{ success: boolean; topic: any; message: string }>(`/topics/${id}/review`, {
        method: 'POST',
        body: JSON.stringify({ decision, feedback }),
      });
    },
  },

  documents: {
    async getMy() {
      return request<{ success: boolean; count: number; isDossierComplet: boolean; documents: any[] }>('/documents/my');
    },

    async getByCandidate(candidateUserId: string) {
      return request<{ success: boolean; count: number; documents: any[] }>(`/documents/candidate/${candidateUserId}`);
    },

    async upload(payload: {
      typeCode: string;
      fileName: string;
      fileSize?: string;
      fileMimeType?: string;
      dataUrl: string;
      captureMethod?: 'camera' | 'upload';
    }) {
      return request<{ success: boolean; document: any; message: string }>('/documents/upload', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    async review(id: string, status: 'VALIDE' | 'REJETE' | 'A_CORRIGER', reason?: string) {
      return request<{ success: boolean; document: any; message: string }>(`/documents/${id}/review`, {
        method: 'POST',
        body: JSON.stringify({ status, reason }),
      });
    },

    async delete(id: string) {
      return request<{ success: boolean; message: string }>(`/documents/${id}`, {
        method: 'DELETE',
      });
    },
  },

  applications: {
    async getAll() {
      return request<{ success: boolean; count: number; applications: any[] }>('/applications');
    },

    async getById(id: string) {
      return request<{ success: boolean; application: any }>(`/applications/${id}`);
    },

    async submit(payload: {
      topicId: string;
      notes?: string;
      motivationLetter?: string;
      profileDetails?: Record<string, any>;
    }) {
      return request<{ success: boolean; application: any; message: string }>('/applications', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    async withdraw(id: string) {
      return request<{ success: boolean; message: string }>(`/applications/${id}`, {
        method: 'DELETE',
      });
    },

    async evaluateSupervisor(id: string, decision: 'FAVORABLE' | 'DEFAVORABLE' | 'A_CORRIGER', grade?: string, feedback?: string) {
      return request<{ success: boolean; application: any; message: string }>(`/applications/${id}/evaluate`, {
        method: 'POST',
        body: JSON.stringify({ decision, grade, feedback }),
      });
    },

    async validateStructure(id: string, decision: 'VALIDE' | 'REJETE', feedback: string) {
      return request<{ success: boolean; application: any; message: string }>(`/applications/${id}/validate-structure`, {
        method: 'POST',
        body: JSON.stringify({ decision, feedback }),
      });
    },
  },

  reEnrollments: {
    async getAll() {
      return request<{ success: boolean; count: number; reEnrollments: any[] }>('/re-enrollments');
    },

    async submit(payload: {
      yearNumber: number;
      summary: string;
      publicationsCount?: number;
      communicationsCount?: number;
      progressPercentage?: number;
      reportFileName?: string;
      reportDataUrl?: string;
    }) {
      return request<{ success: boolean; reEnrollment: any; message: string }>('/re-enrollments', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    async evaluateSupervisor(id: string, status: string, feedback: string) {
      return request<{ success: boolean; reEnrollment: any; message: string }>(`/re-enrollments/${id}/evaluate`, {
        method: 'POST',
        body: JSON.stringify({ status, feedback }),
      });
    },

    async validateCed(id: string, status: string, feedback: string) {
      return request<{ success: boolean; reEnrollment: any; message: string }>(`/re-enrollments/${id}/validate-ced`, {
        method: 'POST',
        body: JSON.stringify({ status, feedback }),
      });
    },
  },

  notifications: {
    async getMy() {
      return request<{ success: boolean; count: number; unreadCount: number; notifications: any[] }>('/notifications/my');
    },

    async markAsRead(id: string) {
      return request<{ success: boolean }>(`/notifications/${id}/read`, {
        method: 'PUT',
      });
    },

    async markAllAsRead() {
      return request<{ success: boolean }>('/notifications/read-all', {
        method: 'PUT',
      });
    },
  },

  stats: {
    async getDashboard() {
      return request<{ success: boolean; stats: any }>('/stats/dashboard');
    },
  },

  admin: {
    async getAuditLogs(limit = 100) {
      return request<{ success: boolean; count: number; logs: any[] }>(`/audit?limit=${limit}`);
    },

    async getUsers() {
      return request<{ success: boolean; count: number; users: any[] }>('/admin/users');
    },

    async updateUserRole(userId: string, role: string, isActive: boolean) {
      return request<{ success: boolean; user: any; message: string }>(`/admin/users/${userId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role, isActive }),
      });
    },

    async getAcademicYears() {
      return request<{ success: boolean; academicYears: any[] }>('/admin/academic-years');
    },

    async updateCampaign(id: string, campaignOpen: boolean, campaignDeadline?: string) {
      return request<{ success: boolean; academicYear: any; message: string }>('/admin/academic-years/campaign', {
        method: 'PUT',
        body: JSON.stringify({ id, campaignOpen, campaignDeadline }),
      });
    },
  },
};
