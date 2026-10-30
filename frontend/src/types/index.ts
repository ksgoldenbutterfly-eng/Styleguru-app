// TypeScript types for StyleGuru

export interface Profile {
  id: string;
  full_name: string;
  age?: number;
  preferred_style?: string;
  preferred_categories?: string[];
  favorite_colors?: string[];
  budget_preference?: string;
  bio?: string;
  avatar_url?: string;
  onboarding_completed?: boolean;
  accessibility_preferences?: AccessibilityPreferences;
  created_at: string;
  updated_at: string;
}

export interface AccessibilityPreferences {
  comfort_level?: string;
  sensory_preferences?: string[];
  mobility_preferences?: string[];
  visual_preferences?: string[];
  notes?: string;
}

export interface WardrobeItem {
  id: string;
  user_id: string;
  name: string;
  category: ClothingCategory;
  color: string;
  brand?: string;
  occasion: Occasion[];
  fashion_type?: FashionType;
  description?: string;
  image_url?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export type ClothingCategory =
  | 'tops' | 'shirts' | 't-shirts' | 'trousers' | 'jeans'
  | 'dresses' | 'skirts' | 'sarees' | 'kurtas'
  | 'footwear' | 'accessories' | 'other';

export type Occasion =
  | 'college' | 'office' | 'parties' | 'weddings' | 'festivals'
  | 'casual' | 'interviews' | 'other';

export type FashionType =
  | 'indian' | 'western' | 'indo-western' | 'casual'
  | 'formal' | 'traditional' | 'other';

export interface OutfitRecommendation {
  title: string;
  description: string;
  items: string[];
  colors: string[];
  occasion: string;
  reason: string;
  accessibility_notes?: string;
}

export interface Outfit {
  id: string;
  user_id: string;
  title?: string;
  occasion?: string;
  style_preferences: Record<string, unknown>;
  recommendations: OutfitRecommendation[];
  image_url?: string;
  is_ai_generated: boolean;
  is_favorite: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OutfitAnalysis {
  overall_feedback: string;
  color_combination: string;
  style: string;
  occasion: string;
  suggestions: string[];
  rating: number;
}

export interface OutfitAnalysisRecord {
  id: string;
  user_id: string;
  image_url: string;
  analysis_result: OutfitAnalysis;
  notes?: string;
  created_at: string;
}

export interface ChatConversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  user_id: string;
  role: 'user' | 'model';
  content: string;
  created_at: string;
}

export interface DashboardStats {
  total_wardrobe_items: number;
  total_outfits_generated: number;
  total_analyses: number;
  total_favorites: number;
  recent_outfits_this_week: number;
  category_breakdown: Record<string, number>;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

