import { Router, Response } from 'express';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { outfitGeneratorSchema, outfitRecommendationSchema } from '../schemas';
import { createUserClient } from '../config/supabase';
import { genAI, modelName, SYSTEM_INSTRUCTION } from '../config/gemini';

export const outfitsRouter = Router();

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

    // Fetch user profile
    const { data: profile } = await client.from('profiles').select('*').eq('id', req.userId!).single();

    // Fetch wardrobe items
    const { data: wardrobeItems } = await client.from('wardrobe_items').select('*').eq('user_id', req.userId!);

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
      // Try to extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        aiResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Invalid AI response format');
      }
    }

    const validated = outfitRecommendationSchema.safeParse(aiResponse);
    if (!validated.success) {
      res.status(500).json({ error: 'AI returned invalid response format. Please try again.' });
      return;
    }

    // Save to outfits table
    const { data: savedOutfit, error: saveError } = await client
      .from('outfits')
      .insert({
        user_id: req.userId!,
        occasion,
        style_preferences: { preferred_style, color_preference, weather, accessibility_notes },
        recommendations: validated.data.outfits,
        is_ai_generated: true,
      })
      .select()
      .single();

    if (saveError) console.error('Failed to save outfit:', saveError);

    res.json({ outfits: validated.data.outfits, outfit_id: savedOutfit?.id });
  } catch (err) {
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

    if (error) throw error;
    res.json({ outfits: data });
  } catch (err) {
    console.error('Get outfits error:', err);
    res.status(500).json({ error: 'Failed to fetch outfits' });
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

    if (error) { res.status(404).json({ error: 'Outfit not found' }); return; }
    res.json({ outfit: data });
  } catch (err) {
    console.error('Get outfit error:', err);
    res.status(500).json({ error: 'Failed to fetch outfit' });
  }
});

// DELETE /api/v1/outfits/:id
outfitsRouter.delete('/outfits/:id', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const client = createUserClient(req.accessToken!);
    const { error } = await client
      .from('outfits')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.userId!);

    if (error) throw error;
    res.json({ message: 'Outfit deleted successfully' });
  } catch (err) {
    console.error('Delete outfit error:', err);
    res.status(500).json({ error: 'Failed to delete outfit' });
  }
});

// POST /api/v1/outfits/favorite/:id
outfitsRouter.post('/outfits/favorite/:id', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const client = createUserClient(req.accessToken!);
    const { data, error } = await client
      .from('outfits')
      .update({ is_favorite: true, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .eq('user_id', req.userId!)
      .select()
      .single();

    if (error) throw error;
    res.json({ outfit: data });
  } catch (err) {
    console.error('Favorite outfit error:', err);
    res.status(500).json({ error: 'Failed to update favorite' });
  }
});

// DELETE /api/v1/outfits/favorite/:id
outfitsRouter.delete('/outfits/favorite/:id', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const client = createUserClient(req.accessToken!);
    const { data, error } = await client
      .from('outfits')
      .update({ is_favorite: false, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .eq('user_id', req.userId!)
      .select()
      .single();

    if (error) throw error;
    res.json({ outfit: data });
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

    if (error) throw error;
    res.json({ favorites: data });
  } catch (err) {
    console.error('Get favorites error:', err);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

