import { Router, Response } from 'express';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { profileSchema } from '../schemas';
import { createUserClient, supabaseAdmin } from '../config/supabase';
import { upload, handleMulterError } from '../middleware/upload';

export const profileRouter = Router();

// GET /api/v1/profile
profileRouter.get('/profile', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const client = createUserClient(req.accessToken!);
    const { data, error } = await client
      .from('profiles')
      .select('*')
      .eq('id', req.userId!)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        res.status(404).json({ error: 'Profile not found' });
        return;
      }
      throw error;
    }

    res.json({ profile: data });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// PUT /api/v1/profile
profileRouter.put('/profile', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parsed = profileSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
      return;
    }

    const client = createUserClient(req.accessToken!);
    const { data, error } = await client
      .from('profiles')
      .upsert({
        id: req.userId!,
        ...parsed.data,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ profile: data });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// POST /api/v1/profile/avatar
profileRouter.post(
  '/profile/avatar',
  authenticate,
  upload.single('avatar'),
  handleMulterError,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No image file provided' });
        return;
      }

      const ext = req.file.originalname.split('.').pop();
      const path = `avatars/${req.userId}.${ext}`;

      const { error: uploadError } = await supabaseAdmin.storage
        .from('wardrobe-images')
        .upload(path, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabaseAdmin.storage
        .from('wardrobe-images')
        .getPublicUrl(path);

      res.json({ avatar_url: publicUrl });
    } catch (err) {
      console.error('Avatar upload error:', err);
      res.status(500).json({ error: 'Failed to upload avatar' });
    }
  }
);

