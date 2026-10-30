import { Router, Response } from 'express';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { createUserClient } from '../config/supabase';

export const dashboardRouter = Router();

// GET /api/v1/dashboard/stats
dashboardRouter.get('/dashboard/stats', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const client = createUserClient(req.accessToken!);

    const [wardrobeResult, outfitsResult, analysisResult, favoritesResult] = await Promise.all([
      client.from('wardrobe_items').select('id, category, color, created_at').eq('user_id', req.userId!),
      client.from('outfits').select('id, occasion, created_at').eq('user_id', req.userId!),
      client.from('outfit_analyses').select('id, created_at').eq('user_id', req.userId!),
      client.from('outfits').select('id').eq('user_id', req.userId!).eq('is_favorite', true),
    ]);

    // Category breakdown
    const categoryBreakdown: Record<string, number> = {};
    (wardrobeResult.data || []).forEach(item => {
      categoryBreakdown[item.category] = (categoryBreakdown[item.category] || 0) + 1;
    });

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentOutfits = (outfitsResult.data || []).filter(
      o => new Date(o.created_at) > sevenDaysAgo
    ).length;

    res.json({
      stats: {
        total_wardrobe_items: wardrobeResult.data?.length || 0,
        total_outfits_generated: outfitsResult.data?.length || 0,
        total_analyses: analysisResult.data?.length || 0,
        total_favorites: favoritesResult.data?.length || 0,
        recent_outfits_this_week: recentOutfits,
        category_breakdown: categoryBreakdown,
      },
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

