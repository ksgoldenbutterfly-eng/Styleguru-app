import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { supabaseAdmin, supabaseConfigured } from '../config/supabase';

export const authRouter = Router();

const signupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  full_name: z.string().min(1, 'Name is required').default('Fashion Enthusiast'),
});

const resetPasswordSchema = z.object({
  email: z.string().email(),
  new_password: z.string().min(6),
});

// POST /api/v1/auth/signup
// Handles user registration cleanly with automatic email confirmation (no SMTP limit issues)
authRouter.post('/signup', async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
      return;
    }

    const { email, password, full_name } = parsed.data;

    if (!supabaseConfigured || !supabaseAdmin) {
      res.status(503).json({ error: 'Authentication service not ready.' });
      return;
    }

    // Check if user already exists
    const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = usersData?.users?.find(
      u => u.email?.toLowerCase() === email.toLowerCase()
    );

    let userId: string;

    if (existingUser) {
      // Update password and confirm email so user can sign in immediately
      const { data: updatedData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        existingUser.id,
        {
          password,
          email_confirm: true,
          user_metadata: { full_name },
        }
      );

      if (updateError) {
        res.status(400).json({ error: updateError.message });
        return;
      }

      userId = updatedData.user.id;
    } else {
      // Create new user with pre-confirmed email (bypasses Supabase email rate limit)
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name },
      });

      if (error) {
        res.status(400).json({ error: error.message });
        return;
      }

      userId = data.user.id;
    }

    // Ensure profile row exists if database table is ready
    try {
      await supabaseAdmin.from('profiles').upsert({
        id: userId,
        full_name,
        onboarding_completed: false,
      });
    } catch {}

    res.status(200).json({
      message: 'Account ready',
      user: { id: userId, email },
    });
  } catch (err: any) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Failed to process registration. Please try again.' });
  }
});

// POST /api/v1/auth/reset-password
authRouter.post('/reset-password', async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = resetPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid input' });
      return;
    }

    const { email, new_password } = parsed.data;

    if (!supabaseConfigured || !supabaseAdmin) {
      res.status(503).json({ error: 'Auth service unavailable' });
      return;
    }

    const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
    const user = usersData?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase());

    if (!user) {
      res.status(404).json({ error: 'No account found with this email address' });
      return;
    }

    const { error } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      password: new_password,
      email_confirm: true,
    });

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.json({ message: 'Password reset successfully' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to reset password' });
  }
});
