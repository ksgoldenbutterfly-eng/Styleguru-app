import { supabase } from './supabase';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('Not authenticated');
  }
  return {
    Authorization: `Bearer ${session.access_token}`,
  };
}

async function apiRequest<T>(
  method: string,
  path: string,
  body?: unknown,
  isFormData = false
): Promise<T> {
  const headers = await getAuthHeaders();
  
  const options: RequestInit = {
    method,
    headers: isFormData ? headers : { ...headers, 'Content-Type': 'application/json' },
  };

  if (body) {
    options.body = isFormData ? (body as FormData) : JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE}${path}`, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `API error: ${response.status}`);
  }

  return data as T;
}

// Profile API
export const profileApi = {
  get: () => apiRequest<{ profile: import('../types').Profile }>('GET', '/profile'),
  update: (data: Partial<import('../types').Profile>) => 
    apiRequest<{ profile: import('../types').Profile }>('PUT', '/profile', data),
  uploadAvatar: (file: File) => {
    const form = new FormData();
    form.append('avatar', file);
    return apiRequest<{ avatar_url: string }>('POST', '/profile/avatar', form, true);
  },
};

// Wardrobe API
export const wardrobeApi = {
  list: (params?: { category?: string; occasion?: string; search?: string }) => {
    const query = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : '';
    return apiRequest<{ items: import('../types').WardrobeItem[]; total: number }>('GET', `/wardrobe${query}`);
  },
  add: (data: FormData) => apiRequest<{ item: import('../types').WardrobeItem }>('POST', '/wardrobe', data, true),
  update: (id: string, data: FormData) => 
    apiRequest<{ item: import('../types').WardrobeItem }>('PUT', `/wardrobe/${id}`, data, true),
  delete: (id: string) => apiRequest<{ message: string }>('DELETE', `/wardrobe/${id}`),
};

// Outfits API
export const outfitsApi = {
  generate: (data: {
    occasion: string;
    preferred_style?: string;
    color_preference?: string;
    weather?: string;
    use_wardrobe_only?: boolean;
    accessibility_notes?: string;
  }) => apiRequest<{ outfits: import('../types').OutfitRecommendation[]; outfit_id?: string }>('POST', '/outfits/generate', data),
  list: () => apiRequest<{ outfits: import('../types').Outfit[] }>('GET', '/outfits'),
  get: (id: string) => apiRequest<{ outfit: import('../types').Outfit }>('GET', `/outfits/${id}`),
  delete: (id: string) => apiRequest<{ message: string }>('DELETE', `/outfits/${id}`),
  favorite: (id: string) => apiRequest<{ outfit: import('../types').Outfit }>('POST', `/outfits/favorite/${id}`),
  unfavorite: (id: string) => apiRequest<{ outfit: import('../types').Outfit }>('DELETE', `/outfits/favorite/${id}`),
  getFavorites: () => apiRequest<{ favorites: import('../types').Outfit[] }>('GET', '/outfits/favorites/list'),
};

// Analysis API
export const analysisApi = {
  analyze: (imageFile: File, notes?: string) => {
    const form = new FormData();
    form.append('image', imageFile);
    if (notes) form.append('notes', notes);
    return apiRequest<{
      analysis: import('../types').OutfitAnalysis;
      analysis_id?: string;
      image_url: string;
    }>('POST', '/analysis/outfit', form, true);
  },
  history: () => apiRequest<{ analyses: import('../types').OutfitAnalysisRecord[] }>('GET', '/analysis/history'),
};

// AI Chat API
export const chatApi = {
  sendMessage: (message: string, conversation_id?: string) =>
    apiRequest<{
      reply: string;
      conversation_id: string;
      conversation: import('../types').ChatConversation;
    }>('POST', '/ai/chat', { message, conversation_id }),
  getConversations: () => 
    apiRequest<{ conversations: import('../types').ChatConversation[] }>('GET', '/ai/conversations'),
  getMessages: (conversationId: string) =>
    apiRequest<{ messages: import('../types').ChatMessage[] }>('GET', `/ai/conversations/${conversationId}/messages`),
};

// Dashboard API
export const dashboardApi = {
  getStats: () => apiRequest<{ stats: import('../types').DashboardStats }>('GET', '/dashboard/stats'),
};

// Health check (no auth required)
export const healthCheck = () => 
  fetch(`${API_BASE}/health`).then(r => r.json());

