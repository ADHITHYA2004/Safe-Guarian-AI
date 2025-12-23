const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Get token from localStorage
const getToken = () => {
  return localStorage.getItem('auth_token');
};

// Set token in localStorage
const setToken = (token: string) => {
  localStorage.setItem('auth_token', token);
};

// Remove token from localStorage
const removeToken = () => {
  localStorage.removeItem('auth_token');
};

// API request helper
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Token expired or invalid
    removeToken();
    window.location.href = '/auth';
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Auth API
export const authApi = {
  signUp: async (email: string, password: string) => {
    const data = await apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.token) {
      setToken(data.token);
    }
    return data;
  },

  signIn: async (email: string, password: string) => {
    const data = await apiRequest('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.token) {
      setToken(data.token);
    }
    return data;
  },

  signOut: () => {
    removeToken();
  },

  getCurrentUser: async () => {
    return apiRequest('/auth/me');
  },

  getSession: async () => {
    const token = getToken();
    if (!token) {
      return { session: null };
    }
    try {
      const data = await apiRequest('/auth/me');
      return { session: { user: data.user } };
    } catch {
      return { session: null };
    }
  },
};

// Emergency Contacts API
export const contactsApi = {
  getAll: () => apiRequest('/emergency-contacts'),
  
  create: (contact: {
    name: string;
    email: string;
    phone?: string;
    relationship?: string;
    alert_methods?: string[];
  }) => apiRequest('/emergency-contacts', {
    method: 'POST',
    body: JSON.stringify(contact),
  }),

  update: (id: string, contact: {
    name?: string;
    email?: string;
    phone?: string;
    relationship?: string;
    alert_methods?: string[];
    is_active?: boolean;
  }) => apiRequest(`/emergency-contacts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(contact),
  }),

  delete: (id: string) => apiRequest(`/emergency-contacts/${id}`, {
    method: 'DELETE',
  }),
};

// Alerts API
export const alertsApi = {
  getAll: (limit?: number) => {
    const query = limit ? `?limit=${limit}` : '';
    return apiRequest(`/alerts${query}`);
  },

  create: (alert: {
    alert_type: string;
    status: 'safe' | 'warning' | 'danger';
    confidence?: number;
    description: string;
    location: string;
    camera_id?: string;
    camera_name?: string;
    action_taken: string;
    contacts_notified?: any[];
    alert_results?: any[];
  }) => apiRequest('/alerts', {
    method: 'POST',
    body: JSON.stringify(alert),
  }),
};

// User Settings API
export const settingsApi = {
  get: () => apiRequest('/user-settings'),

  update: (settings: {
    detection_sensitivity?: string;
    confidence_threshold?: number;
    realtime_processing?: boolean;
    video_quality?: string;
    frame_rate?: number;
    auto_start_detection?: boolean;
    audio_alerts?: boolean;
    alert_volume?: number;
    auto_notify_contacts?: boolean;
    quiet_hours_enabled?: boolean;
    quiet_hours_start?: string;
    quiet_hours_end?: string;
    quiet_hours_days?: string[];
  }) => apiRequest('/user-settings', {
    method: 'PUT',
    body: JSON.stringify(settings),
  }),
};

// Emergency Alert API
export const emergencyApi = {
  send: (data: {
    location: string;
    alertType: string;
    cameraId?: string;
    cameraName?: string;
  }) => apiRequest('/emergency-alert', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};



