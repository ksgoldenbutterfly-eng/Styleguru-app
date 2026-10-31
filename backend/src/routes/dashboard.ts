import { Router, Response } from 'express';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { createUserClient } from '../config/supabase';

export const dashboardRouter = Router();

// GET /api/v1/dashboard/stats
dashboardRouter.get('/dashboard/stats', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const client = createUserClient(req.accessToken!);

    let wardrobeData: any[] = [];
    let outfitsData: any[] = [];
    let analysisData: any[] = [];
    let favoritesData: any[] = [];

    try {
      const [wardrobeResult, outfitsResult, analysisResult, favoritesResult] = await Promise.all([
        client.from('wardrobe_items').select('id, category, color, created_at').eq('user_id', req.userId!),
        client.from('outfits').select('id, occasion, created_at').eq('user_id', req.userId!),
        client.from('outfit_analyses').select('id, created_at').eq('user_id', req.userId!),
        client.from('outfits').select('id').eq('user_id', req.userId!).eq('is_favorite', true),
      ]);
      wardrobeData = wardrobeResult.data || [];
      outfitsData = outfitsResult.data || [];
      analysisData = analysisResult.data || [];
      favoritesData = favoritesResult.data || [];
    } catch (e) {
      // Fallback
    }

    // Category breakdown
    const categoryBreakdown: Record<string, number> = {};
    wardrobeData.forEach(item => {
      if (item.category) {
        categoryBreakdown[item.category] = (categoryBreakdown[item.category] || 0) + 1;
      }
    });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentOutfits = outfitsData.filter(
      o => new Date(o.created_at) > sevenDaysAgo
    ).length;

    res.json({
      stats: {
        total_wardrobe_items: wardrobeData.length,
        total_outfits_generated: outfitsData.length,
        total_analyses: analysisData.length,
        total_favorites: favoritesData.length,
        recent_outfits_this_week: recentOutfits,
        category_breakdown: categoryBreakdown,
      },
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.json({
      stats: {
        total_wardrobe_items: 0,
        total_outfits_generated: 0,
        total_analyses: 0,
        total_favorites: 0,
        recent_outfits_this_week: 0,
        category_breakdown: {},
      },
    });
  }
});
