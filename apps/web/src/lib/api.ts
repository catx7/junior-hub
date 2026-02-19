import { getIdToken } from './firebase';

const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || '';

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchWithAuth(endpoint: string, options: FetchOptions = {}): Promise<Response> {
  const { skipAuth = false, headers: customHeaders, ...restOptions } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  if (!skipAuth) {
    const token = await getIdToken();
    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...restOptions,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      error.error?.code || 'UNKNOWN_ERROR',
      error.error?.message || 'An error occurred',
      error.error?.details
    );
  }

  return response;
}

// Auth API
export const authApi = {
  register: async (data: { email: string; password: string; name: string }) => {
    const res = await fetchWithAuth('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.json();
  },

  social: async (data: { provider: string; idToken: string }) => {
    const res = await fetchWithAuth('/api/auth/social', {
      method: 'POST',
      body: JSON.stringify(data),
      skipAuth: true,
    });
    return res.json();
  },

  email: async () => {
    const res = await fetchWithAuth('/api/auth/email', {
      method: 'POST',
    });
    return res.json();
  },

  me: async () => {
    const res = await fetchWithAuth('/api/users/me');
    return res.json();
  },
};

// Users API
export const usersApi = {
  getMe: async () => {
    const res = await fetchWithAuth('/api/users/me');
    return res.json();
  },

  updateMe: async (data: Record<string, unknown>) => {
    const res = await fetchWithAuth('/api/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return res.json();
  },

  getById: async (id: string) => {
    const res = await fetchWithAuth(`/api/users/${id}`, { skipAuth: true });
    return res.json();
  },

  getReviews: async (id: string, page = 1, limit = 10) => {
    const res = await fetchWithAuth(`/api/users/${id}/reviews?page=${page}&limit=${limit}`, {
      skipAuth: true,
    });
    return res.json();
  },
};

// Jobs API
export const jobsApi = {
  list: async (params?: Record<string, string | number | undefined>) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }
    const query = searchParams.toString();
    const res = await fetchWithAuth(`/api/jobs${query ? `?${query}` : ''}`, {
      skipAuth: true,
    });
    return res.json();
  },

  getById: async (id: string) => {
    const res = await fetchWithAuth(`/api/jobs/${id}`, { skipAuth: true });
    return res.json();
  },

  create: async (data: Record<string, unknown>) => {
    const res = await fetchWithAuth('/api/jobs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.json();
  },

  update: async (id: string, data: Record<string, unknown>) => {
    const res = await fetchWithAuth(`/api/jobs/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return res.json();
  },

  delete: async (id: string) => {
    const res = await fetchWithAuth(`/api/jobs/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },

  updateStatus: async (id: string, status: string) => {
    const res = await fetchWithAuth(`/api/jobs/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return res.json();
  },

  uploadImages: async (id: string, files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));

    const token = await getIdToken();
    const res = await fetch(`${API_BASE_URL}/api/jobs/${id}/images`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new ApiError(
        res.status,
        error.error?.code || 'UPLOAD_ERROR',
        error.error?.message || 'Failed to upload images'
      );
    }

    return res.json();
  },
};

// Offers API
export const offersApi = {
  listMine: async (params?: { page?: number; limit?: number; status?: string }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }
    const query = searchParams.toString();
    const res = await fetchWithAuth(`/api/offers${query ? `?${query}` : ''}`);
    return res.json();
  },

  listForJob: async (jobId: string) => {
    const res = await fetchWithAuth(`/api/jobs/${jobId}/offers`);
    return res.json();
  },

  create: async (jobId: string, data: { price: number; message: string }) => {
    const res = await fetchWithAuth(`/api/jobs/${jobId}/offers`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.json();
  },

  accept: async (offerId: string) => {
    const res = await fetchWithAuth(`/api/offers/${offerId}/accept`, {
      method: 'PATCH',
    });
    return res.json();
  },

  reject: async (offerId: string) => {
    const res = await fetchWithAuth(`/api/offers/${offerId}/reject`, {
      method: 'PATCH',
    });
    return res.json();
  },

  withdraw: async (offerId: string) => {
    const res = await fetchWithAuth(`/api/offers/${offerId}`, {
      method: 'DELETE',
    });
    return res.json();
  },
};

// Reviews API
export const reviewsApi = {
  create: async (jobId: string, data: { rating: number; comment: string }) => {
    const res = await fetchWithAuth(`/api/jobs/${jobId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.json();
  },
};

// Conversations API
export const conversationsApi = {
  list: async () => {
    const res = await fetchWithAuth('/api/conversations');
    return res.json();
  },

  getMessages: async (id: string, before?: string, limit = 50) => {
    const params = new URLSearchParams({ limit: String(limit) });
    if (before) params.append('before', before);
    const res = await fetchWithAuth(`/api/conversations/${id}/messages?${params}`);
    return res.json();
  },

  sendMessage: async (id: string, content: string, imageUrl?: string) => {
    const res = await fetchWithAuth(`/api/conversations/${id}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content, imageUrl }),
    });
    return res.json();
  },
};

// Verification API
export const verificationApi = {
  getStatus: async () => {
    const res = await fetchWithAuth('/api/verification/status');
    return res.json();
  },

  submitRequest: async (data: { motivation: string; documentUrl?: string }) => {
    const res = await fetchWithAuth('/api/verification/request', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.json();
  },

  createSession: async (data: { motivation: string }) => {
    const res = await fetchWithAuth('/api/verification/create-session', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.json();
  },
};

export { ApiError };
