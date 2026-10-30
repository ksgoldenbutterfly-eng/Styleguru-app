import { Router, Response } from 'express';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { wardrobeItemSchema } from '../schemas';
import { createUserClient, supabaseAdmin } from '../config/supabase';
import { upload, handleMulterError } from '../middleware/upload';
import { v4 as uuidv4 } from 'uuid';

export const wardrobeRouter = Router();

// GET /api/v1/wardrobe
wardrobeRouter.get('/wardrobe', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const client = createUserClient(req.accessToken!);
    const { category, occasion, search } = req.query;

    let query = client
      .from('wardrobe_items')
      .select('*')
      .eq('user_id', req.userId!)
      .order('created_at', { ascending: false });

    if (category) query = query.eq('category', category as string);
    if (occasion) query = query.contains('occasion', [occasion as string]);
    if (search) query = query.ilike('name', `%${search}%`);

    const { data, error } = await query;
    if (error) throw error;

    res.json({ items: data, total: data.length });
  } catch (err) {
    console.error('Get wardrobe error:', err);
    res.status(500).json({ error: 'Failed to fetch wardrobe items' });
  }
});

// POST /api/v1/wardrobe
wardrobeRouter.post(
  '/wardrobe',
  authenticate,
  upload.single('image'),
  handleMulterError,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      // Parse occasion as array if sent as string
      const body = { ...req.body };
      if (typeof body.occasion === 'string') {
        try { body.occasion = JSON.parse(body.occasion); } catch { body.occasion = [body.occasion]; }
      }

      const parsed = wardrobeItemSchema.safeParse(body);
      if (!parsed.success) {
        res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
        return;
      }

      let imageUrl: string | undefined;

      // Upload image if provided
      if (req.file) {
        const ext = req.file.originalname.split('.').pop();
        const path = `wardrobe/${req.userId}/${uuidv4()}.${ext}`;
        const { error: uploadError } = await supabaseAdmin.storage
          .from('wardrobe-images')
          .upload(path, req.file.buffer, { contentType: req.file.mimetype });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabaseAdmin.storage
          .from('wardrobe-images')
          .getPublicUrl(path);
        imageUrl = publicUrl;
      }

      const client = createUserClient(req.accessToken!);
      const { data, error } = await client
        .from('wardrobe_items')
        .insert({
          user_id: req.userId!,
          ...parsed.data,
          image_url: imageUrl || parsed.data.image_url,
        })
        .select()
        .single();

      if (error) throw error;

      res.status(201).json({ item: data });
    } catch (err) {
      console.error('Add wardrobe item error:', err);
      res.status(500).json({ error: 'Failed to add wardrobe item' });
    }
  }
);

// PUT /api/v1/wardrobe/:id
wardrobeRouter.put(
  '/wardrobe/:id',
  authenticate,
  upload.single('image'),
  handleMulterError,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const body = { ...req.body };
      if (typeof body.occasion === 'string') {
        try { body.occasion = JSON.parse(body.occasion); } catch { body.occasion = [body.occasion]; }
      }

      const parsed = wardrobeItemSchema.partial().safeParse(body);
      if (!parsed.success) {
        res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
        return;
      }

      let imageUrl: string | undefined;
      if (req.file) {
        const ext = req.file.originalname.split('.').pop();
        const path = `wardrobe/${req.userId}/${uuidv4()}.${ext}`;
        const { error: uploadError } = await supabaseAdmin.storage
          .from('wardrobe-images')
          .upload(path, req.file.buffer, { contentType: req.file.mimetype });
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabaseAdmin.storage
          .from('wardrobe-images')
          .getPublicUrl(path);
        imageUrl = publicUrl;
      }

      const client = createUserClient(req.accessToken!);
      const { data, error } = await client
        .from('wardrobe_items')
        .update({
          ...parsed.data,
          ...(imageUrl ? { image_url: imageUrl } : {}),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', req.userId!)
        .select()
        .single();

      if (error) throw error;
      if (!data) { res.status(404).json({ error: 'Item not found' }); return; }

      res.json({ item: data });
    } catch (err) {
      console.error('Update wardrobe item error:', err);
      res.status(500).json({ error: 'Failed to update wardrobe item' });
    }
  }
);

// DELETE /api/v1/wardrobe/:id
wardrobeRouter.delete('/wardrobe/:id', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const client = createUserClient(req.accessToken!);

    const { error } = await client
      .from('wardrobe_items')
      .delete()
      .eq('id', id)
      .eq('user_id', req.userId!);

    if (error) throw error;

    res.json({ message: 'Item deleted successfully' });
  } catch (err) {
    console.error('Delete wardrobe item error:', err);
    res.status(500).json({ error: 'Failed to delete wardrobe item' });
  }
});

