import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { supabaseAdmin, supabaseConfigured } from '../config/supabase';

export const authRouter = Router();

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  full_name: z.string().min(1).default('Fashion Enthusiast'),
});

const DEMO_EMAIL = 'demo@styleguru.com';
const DEMO_PASSWORD = 'StyleGuruDemo123!';

// Ensure demo user exists in Supabase
async function ensureDemoUser() {
  if (!supabaseAdmin) return null;
  try {
    const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
    const existing = usersData?.users?.find(u => u.email === DEMO_EMAIL);
    if (existing) {
      return existing;
    }

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: 'Demo Fashionista' },
    });

    if (error) {
      console.warn('Could not auto-create demo user:', error.message);
      return null;
    }
    return data.user;
  } catch (err: any) {
    console.warn('Error ensuring demo user:', err.message);
    return null;
  }
}

// POST /api/v1/auth/signup - Admin creates user with email_confirm: true (ZERO email limit / ZERO confirmation delays)
authRouter.post('/signup', async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
      return;
    }

    const { email, password, full_name } = parsed.data;

    if (!supabaseConfigured || !supabaseAdmin) {
      res.status(503).json({ error: 'Supabase is not configured on the backend.' });
      return;
    }

    // Create user with email pre-confirmed
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name },
    });

    if (error) {
      // If user already registered, provide clean message
      if (error.message.toLowerCase().includes('already registered') || error.message.toLowerCase().includes('already exists')) {
        res.status(409).json({ error: 'Email already registered. You can sign in directly.' });
        return;
      }
      res.status(400).json({ error: error.message });
      return;
    }

    // Try to auto-create profile if table exists
    try {
      if (data?.user) {
        await supabaseAdmin.from('profiles').upsert({
          id: data.user.id,
          full_name,
          onboarding_completed: false,
        });
      }
    } catch {
      // Ignore if table not yet created
    }

    res.status(201).json({
      message: 'Account created and verified instantly!',
      user: {
        id: data.user?.id,
        email: data.user?.email,
      },
    });
  } catch (err: any) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Failed to create account. Please try again.' });
  }
});

// POST /api/v1/auth/demo - Get or setup demo user credentials for instant 1-click login
authRouter.post('/demo', async (_req: Request, res: Response): Promise<void> => {
  try {
    await ensureDemoUser();
    res.json({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      message: 'Demo credentials ready',
    });
  } catch (err: any) {
    console.error('Demo auth error:', err);
    res.json({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
    });
  }
});
