import { Router, Response } from 'express';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { profileSchema } from '../schemas';
import { createUserClient, supabaseAdmin } from '../config/supabase';
import { upload, handleMulterError } from '../middleware/upload';

export const profileRouter = Router();

// In-memory fallback for profiles if table not created
const fallbackProfiles = new Map<string, any>();

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
        // Not found, return default
        const defaultProfile = {
          id: req.userId!,
          full_name: 'Fashion Enthusiast',
          onboarding_completed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        res.json({ profile: fallbackProfiles.get(req.userId!) || defaultProfile });
        return;
      }
      // Table might not exist yet (PGRST205), return fallback
      if (error.code === 'PGRST205' || error.message?.includes('schema cache')) {
        const fallback = fallbackProfiles.get(req.userId!) || {
          id: req.userId!,
          full_name: 'Fashion Enthusiast',
          onboarding_completed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        res.json({ profile: fallback });
        return;
      }
      throw error;
    }

    res.json({ profile: data });
  } catch (err) {
    console.warn('Get profile fallback due to:', (err as any).message);
    const fallback = fallbackProfiles.get(req.userId!) || {
      id: req.userId!,
      full_name: 'Fashion Enthusiast',
      onboarding_completed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    res.json({ profile: fallback });
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

    if (error) {
      // If table doesn't exist yet, save in fallback memory
      if (error.code === 'PGRST205' || error.message?.includes('schema cache')) {
        const updated = {
          id: req.userId!,
          ...parsed.data,
          updated_at: new Date().toISOString(),
        };
        fallbackProfiles.set(req.userId!, updated);
        res.json({ profile: updated });
        return;
      }
      throw error;
    }

    res.json({ profile: data });
  } catch (err) {
    console.warn('Update profile fallback due to:', (err as any).message);
    const updated = {
      id: req.userId!,
      ...req.body,
      updated_at: new Date().toISOString(),
    };
    fallbackProfiles.set(req.userId!, updated);
    res.json({ profile: updated });
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

      let publicUrl: string | undefined;

      try {
        const ext = req.file.originalname.split('.').pop();
        const path = `avatars/${req.userId}.${ext}`;

        const { error: uploadError } = await supabaseAdmin.storage
          .from('wardrobe-images')
          .upload(path, req.file.buffer, {
            contentType: req.file.mimetype,
            upsert: true,
          });

        if (!uploadError) {
          const { data } = supabaseAdmin.storage
            .from('wardrobe-images')
            .getPublicUrl(path);
          publicUrl = data.publicUrl;
        }
      } catch (e) {
        console.warn('Storage bucket not ready, falling back to data URL');
      }

      // If bucket upload didn't work, fallback to base64 data URL
      if (!publicUrl) {
        publicUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      }

      res.json({ avatar_url: publicUrl });
    } catch (err) {
      console.error('Avatar upload error:', err);
      res.status(500).json({ error: 'Failed to upload avatar' });
    }
  }
);
