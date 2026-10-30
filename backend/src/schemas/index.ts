import { z } from 'zod';

// Profile schemas
export const profileSchema = z.object({
  full_name: z.string().min(1, 'Name is required').max(100),
  age: z.number().int().min(13).max(120).optional(),
  preferred_style: z.string().max(50).optional(),
  preferred_categories: z.array(z.string()).optional(),
  favorite_colors: z.array(z.string()).optional(),
  budget_preference: z.string().max(20).optional(),
  bio: z.string().max(500).optional(),
  avatar_url: z.string().url().optional(),
});

// Wardrobe schemas
export const wardrobeItemSchema = z.object({
  name: z.string().min(1, 'Item name is required').max(100),
  category: z.enum([
    'tops', 'shirts', 't-shirts', 'trousers', 'jeans', 'dresses',
    'skirts', 'sarees', 'kurtas', 'footwear', 'accessories', 'other'
  ]),
  color: z.string().min(1, 'Color is required').max(50),
  brand: z.string().max(50).optional(),
  occasion: z.array(z.enum([
    'college', 'office', 'parties', 'weddings', 'festivals',
    'casual', 'interviews', 'other'
  ])).min(1, 'At least one occasion required'),
  fashion_type: z.enum([
    'indian', 'western', 'indo-western', 'casual', 'formal', 'traditional', 'other'
  ]).optional(),
  description: z.string().max(500).optional(),
  image_url: z.string().url().optional(),
});

// Outfit generation schemas
export const outfitGeneratorSchema = z.object({
  occasion: z.enum([
    'college', 'office', 'parties', 'weddings', 'festivals', 'casual', 'interviews', 'other'
  ]),
  preferred_style: z.string().max(50).optional(),
  color_preference: z.string().max(100).optional(),
  weather: z.string().max(50).optional(),
  use_wardrobe_only: z.boolean().default(false),
  accessibility_notes: z.string().max(500).optional(),
});

// Chat message schema
export const chatMessageSchema = z.object({
  message: z.string().min(1, 'Message is required').max(2000),
  conversation_id: z.string().uuid().optional(),
});

// Outfit analysis schema
export const outfitAnalysisSchema = z.object({
  notes: z.string().max(500).optional(),
});

// AI response schemas for validation
export const outfitRecommendationSchema = z.object({
  outfits: z.array(z.object({
    title: z.string(),
    description: z.string(),
    items: z.array(z.string()),
    colors: z.array(z.string()),
    occasion: z.string(),
    reason: z.string(),
    accessibility_notes: z.string().optional(),
  })),
});

export const outfitAnalysisResponseSchema = z.object({
  overall_feedback: z.string(),
  color_combination: z.string(),
  style: z.string(),
  occasion: z.string(),
  suggestions: z.array(z.string()),
  rating: z.number().min(1).max(10),
});

// Image upload validation
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

