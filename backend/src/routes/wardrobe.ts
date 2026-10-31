import { Router, Response } from 'express';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { wardrobeItemSchema } from '../schemas';
import { createUserClient, supabaseAdmin } from '../config/supabase';
import { upload, handleMulterError } from '../middleware/upload';
import { v4 as uuidv4 } from 'uuid';

export const wardrobeRouter = Router();

// Fallback in-memory storage if table not yet created
const fallbackWardrobe = new Map<string, any[]>();

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
    if (error) {
      if (error.code === 'PGRST205' || error.message?.includes('schema cache')) {
        let items = fallbackWardrobe.get(req.userId!) || [];
        if (category) items = items.filter(i => i.category === category);
        if (search) items = items.filter(i => i.name.toLowerCase().includes(String(search).toLowerCase()));
        res.json({ items, total: items.length });
        return;
      }
      throw error;
    }

    res.json({ items: data, total: data.length });
  } catch (err) {
    console.warn('Get wardrobe fallback:', (err as any).message);
    const items = fallbackWardrobe.get(req.userId!) || [];
    res.json({ items, total: items.length });
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
        try {
          const ext = req.file.originalname.split('.').pop();
          const path = `wardrobe/${req.userId}/${uuidv4()}.${ext}`;
          const { error: uploadError } = await supabaseAdmin.storage
            .from('wardrobe-images')
            .upload(path, req.file.buffer, { contentType: req.file.mimetype });

          if (!uploadError) {
            const { data } = supabaseAdmin.storage
              .from('wardrobe-images')
              .getPublicUrl(path);
            imageUrl = data.publicUrl;
          }
        } catch {
          // ignore storage upload error
        }

        // Fallback to data URL if storage upload failed
        if (!imageUrl) {
          imageUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
        }
      }

      const newItem = {
        id: uuidv4(),
        user_id: req.userId!,
        ...parsed.data,
        image_url: imageUrl || parsed.data.image_url,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      try {
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

        if (error) {
          // Fallback in-memory
          const list = fallbackWardrobe.get(req.userId!) || [];
          list.unshift(newItem);
          fallbackWardrobe.set(req.userId!, list);
          res.status(201).json({ item: newItem });
          return;
        }

        res.status(201).json({ item: data });
      } catch {
        const list = fallbackWardrobe.get(req.userId!) || [];
        list.unshift(newItem);
        fallbackWardrobe.set(req.userId!, list);
        res.status(201).json({ item: newItem });
      }
    } catch (err: any) {
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
        try {
          const ext = req.file.originalname.split('.').pop();
          const path = `wardrobe/${req.userId}/${uuidv4()}.${ext}`;
          const { error: uploadError } = await supabaseAdmin.storage
            .from('wardrobe-images')
            .upload(path, req.file.buffer, { contentType: req.file.mimetype });
          if (!uploadError) {
            const { data } = supabaseAdmin.storage
              .from('wardrobe-images')
              .getPublicUrl(path);
            imageUrl = data.publicUrl;
          }
        } catch {}

        if (!imageUrl) {
          imageUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
        }
      }

      try {
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

        if (error) {
          const list = fallbackWardrobe.get(req.userId!) || [];
          const idx = list.findIndex(i => i.id === id);
          if (idx !== -1) {
            list[idx] = { ...list[idx], ...parsed.data, ...(imageUrl ? { image_url: imageUrl } : {}), updated_at: new Date().toISOString() };
            res.json({ item: list[idx] });
            return;
          }
        }

        res.json({ item: data });
      } catch {
        const list = fallbackWardrobe.get(req.userId!) || [];
        const idx = list.findIndex(i => i.id === id);
        if (idx !== -1) {
          list[idx] = { ...list[idx], ...parsed.data, ...(imageUrl ? { image_url: imageUrl } : {}), updated_at: new Date().toISOString() };
          res.json({ item: list[idx] });
          return;
        }
        res.json({ item: { id, ...parsed.data } });
      }
    } catch (err: any) {
      console.error('Update wardrobe item error:', err);
      res.status(500).json({ error: 'Failed to update wardrobe item' });
    }
  }
);

// DELETE /api/v1/wardrobe/:id
wardrobeRouter.delete('/wardrobe/:id', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    try {
      const client = createUserClient(req.accessToken!);
      await client
        .from('wardrobe_items')
        .delete()
        .eq('id', id)
        .eq('user_id', req.userId!);
    } catch {}

    const list = fallbackWardrobe.get(req.userId!) || [];
    fallbackWardrobe.set(req.userId!, list.filter(i => i.id !== id));

    res.json({ message: 'Item deleted successfully' });
  } catch (err) {
    console.error('Delete wardrobe item error:', err);
    res.status(500).json({ error: 'Failed to delete wardrobe item' });
  }
});
