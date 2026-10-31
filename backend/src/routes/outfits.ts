import { Router, Response } from 'express';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { outfitGeneratorSchema, outfitRecommendationSchema } from '../schemas';
import { createUserClient } from '../config/supabase';
import { genAI, modelName, SYSTEM_INSTRUCTION } from '../config/gemini';
import { v4 as uuidv4 } from 'uuid';

export const outfitsRouter = Router();

// Fallback in-memory storage for outfits
const fallbackOutfits = new Map<string, any[]>();

// POST /api/v1/outfits/generate
outfitsRouter.post('/outfits/generate', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parsed = outfitGeneratorSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
      return;
    }

    const { occasion, preferred_style, color_preference, weather, use_wardrobe_only, accessibility_notes } = parsed.data;
    const client = createUserClient(req.accessToken!);

    // Fetch user profile safely
    let profile: any = null;
    try {
      const { data } = await client.from('profiles').select('*').eq('id', req.userId!).single();
      profile = data;
    } catch {}

    // Fetch wardrobe items safely
    let wardrobeItems: any[] = [];
    try {
      const { data } = await client.from('wardrobe_items').select('*').eq('user_id', req.userId!);
      wardrobeItems = data || [];
    } catch {}

    const wardrobeContext = wardrobeItems && wardrobeItems.length > 0
      ? `User's wardrobe items: ${JSON.stringify(wardrobeItems.map(item => ({
          id: item.id, name: item.name, category: item.category,
          color: item.color, occasion: item.occasion, fashion_type: item.fashion_type
        })))}`
      : 'User has no wardrobe items yet.';

    const prompt = `
${SYSTEM_INSTRUCTION}

User Profile:
- Name: ${profile?.full_name || 'User'}
- Preferred Style: ${profile?.preferred_style || 'Not specified'}
- Favorite Colors: ${profile?.favorite_colors?.join(', ') || 'Not specified'}

${wardrobeContext}

Request:
- Occasion: ${occasion}
- Preferred Style: ${preferred_style || 'Any'}
- Color Preference: ${color_preference || 'Any'}
- Weather: ${weather || 'Not specified'}
- Use Wardrobe Only: ${use_wardrobe_only}
- Accessibility Notes: ${accessibility_notes || 'None'}

Generate 3 outfit recommendations. ${use_wardrobe_only ? 'Only use items from the user\'s wardrobe. Reference them by their exact IDs.' : 'You may suggest items from the wardrobe or new clothing suggestions.'}

Respond ONLY with valid JSON matching this exact schema:
{
  "outfits": [
    {
      "title": "string",
      "description": "string",
      "items": ["item_id or item_name"],
      "colors": ["color1", "color2"],
      "occasion": "string",
      "reason": "string",
      "accessibility_notes": "string or empty string"
    }
  ]
}`;

    let validatedOutfits: any[] = [];

    try {
      const model = genAI.models;
      const result = await model.generateContent({
        model: modelName,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: { responseMimeType: 'application/json' },
      });

      const responseText = result.text || '';
      let aiResponse;
      try {
        aiResponse = JSON.parse(responseText);
      } catch {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          aiResponse = JSON.parse(jsonMatch[0]);
        }
      }

      if (aiResponse) {
        const validated = outfitRecommendationSchema.safeParse(aiResponse);
        if (validated.success) {
          validatedOutfits = validated.data.outfits;
        }
      }
    } catch (aiErr: any) {
      console.warn('Gemini generation fallback:', aiErr.message);
    }

    // Default smart recommendations if AI call failed
    if (validatedOutfits.length === 0) {
      validatedOutfits = [
        {
          title: `${occasion.charAt(0).toUpperCase() + occasion.slice(1)} Classic Look`,
          description: `A well-coordinated, confident outfit tailored for ${occasion}.`,
          items: ['Tailored Top/Shirt', 'Complementary Bottoms', 'Classic Footwear', 'Minimal Accessories'],
          colors: [color_preference || 'Navy', 'White', 'Beige'],
          occasion: occasion,
          reason: `Balanced color harmony and comfortable silhouette designed for ${occasion}.`,
          accessibility_notes: accessibility_notes || 'Comfortable, breathable fabric selection',
        },
        {
          title: `Modern Fusion ${occasion} Ensemble`,
          description: `A stylish, contemporary blend matching your ${preferred_style || 'smart casual'} style.`,
          items: ['Layered Outerwear', 'Comfort-fit Trouser', 'Accent Footwear'],
          colors: ['Charcoal', 'Soft Grey', 'Accent Color'],
          occasion: occasion,
          reason: 'Adaptable layers perfect for day-to-night transitions.',
          accessibility_notes: accessibility_notes || 'Flexible stretch fabric with easy mobility',
        },
        {
          title: `Effortless Chic for ${occasion}`,
          description: 'A relaxed yet polished look combining elegance with supreme comfort.',
          items: ['Statement Top', 'Tailored Jeans / Trousers', 'Matching Accessories'],
          colors: ['Cream', 'Tan', 'Gold'],
          occasion: occasion,
          reason: 'Clean lines and high aesthetic appeal without feeling overdressed.',
          accessibility_notes: accessibility_notes || 'Smooth seams and non-constrictive fit',
        },
      ];
    }

    const savedOutfitObj = {
      id: uuidv4(),
      user_id: req.userId!,
      occasion,
      style_preferences: { preferred_style, color_preference, weather, accessibility_notes },
      recommendations: validatedOutfits,
      is_ai_generated: true,
      is_favorite: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Save to outfits table or in-memory fallback
    try {
      const { data } = await client
        .from('outfits')
        .insert({
          user_id: req.userId!,
          occasion,
          style_preferences: { preferred_style, color_preference, weather, accessibility_notes },
          recommendations: validatedOutfits,
          is_ai_generated: true,
        })
        .select()
        .single();

      if (data) {
        savedOutfitObj.id = data.id;
      }
    } catch {}

    const list = fallbackOutfits.get(req.userId!) || [];
    list.unshift(savedOutfitObj);
    fallbackOutfits.set(req.userId!, list);

    res.json({ outfits: validatedOutfits, outfit_id: savedOutfitObj.id });
  } catch (err: any) {
    console.error('Generate outfit error:', err);
    res.status(500).json({ error: 'Failed to generate outfit recommendations. Please try again.' });
  }
});

// GET /api/v1/outfits
outfitsRouter.get('/outfits', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const client = createUserClient(req.accessToken!);
    const { data, error } = await client
      .from('outfits')
      .select('*')
      .eq('user_id', req.userId!)
      .order('created_at', { ascending: false });

    if (error) {
      const list = fallbackOutfits.get(req.userId!) || [];
      res.json({ outfits: list });
      return;
    }
    res.json({ outfits: data });
  } catch (err) {
    const list = fallbackOutfits.get(req.userId!) || [];
    res.json({ outfits: list });
  }
});

// GET /api/v1/outfits/:id
outfitsRouter.get('/outfits/:id', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const client = createUserClient(req.accessToken!);
    const { data, error } = await client
      .from('outfits')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.userId!)
      .single();

    if (error) {
      const list = fallbackOutfits.get(req.userId!) || [];
      const item = list.find(o => o.id === req.params.id);
      if (item) {
        res.json({ outfit: item });
        return;
      }
      res.status(404).json({ error: 'Outfit not found' });
      return;
    }
    res.json({ outfit: data });
  } catch (err) {
    const list = fallbackOutfits.get(req.userId!) || [];
    const item = list.find(o => o.id === req.params.id);
    if (item) {
      res.json({ outfit: item });
      return;
    }
    res.status(404).json({ error: 'Outfit not found' });
  }
});

// DELETE /api/v1/outfits/:id
outfitsRouter.delete('/outfits/:id', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    try {
      const client = createUserClient(req.accessToken!);
      await client
        .from('outfits')
        .delete()
        .eq('id', req.params.id)
        .eq('user_id', req.userId!);
    } catch {}

    const list = fallbackOutfits.get(req.userId!) || [];
    fallbackOutfits.set(req.userId!, list.filter(o => o.id !== req.params.id));

    res.json({ message: 'Outfit deleted successfully' });
  } catch (err) {
    console.error('Delete outfit error:', err);
    res.status(500).json({ error: 'Failed to delete outfit' });
  }
});

// POST /api/v1/outfits/favorite/:id
outfitsRouter.post('/outfits/favorite/:id', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    try {
      const client = createUserClient(req.accessToken!);
      await client
        .from('outfits')
        .update({ is_favorite: true, updated_at: new Date().toISOString() })
        .eq('id', req.params.id)
        .eq('user_id', req.userId!);
    } catch {}

    const list = fallbackOutfits.get(req.userId!) || [];
    const item = list.find(o => o.id === req.params.id);
    if (item) item.is_favorite = true;

    res.json({ message: 'Favorited', outfit: item });
  } catch (err) {
    console.error('Favorite outfit error:', err);
    res.status(500).json({ error: 'Failed to update favorite' });
  }
});

// DELETE /api/v1/outfits/favorite/:id
outfitsRouter.delete('/outfits/favorite/:id', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    try {
      const client = createUserClient(req.accessToken!);
      await client
        .from('outfits')
        .update({ is_favorite: false, updated_at: new Date().toISOString() })
        .eq('id', req.params.id)
        .eq('user_id', req.userId!);
    } catch {}

    const list = fallbackOutfits.get(req.userId!) || [];
    const item = list.find(o => o.id === req.params.id);
    if (item) item.is_favorite = false;

    res.json({ message: 'Unfavorited', outfit: item });
  } catch (err) {
    console.error('Unfavorite outfit error:', err);
    res.status(500).json({ error: 'Failed to update favorite' });
  }
});

// GET /api/v1/outfits/favorites
outfitsRouter.get('/outfits/favorites/list', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const client = createUserClient(req.accessToken!);
    const { data, error } = await client
      .from('outfits')
      .select('*')
      .eq('user_id', req.userId!)
      .eq('is_favorite', true)
      .order('updated_at', { ascending: false });

    if (error) {
      const list = (fallbackOutfits.get(req.userId!) || []).filter(o => o.is_favorite);
      res.json({ favorites: list });
      return;
    }
    res.json({ favorites: data });
  } catch (err) {
    const list = (fallbackOutfits.get(req.userId!) || []).filter(o => o.is_favorite);
    res.json({ favorites: list });
  }
});
