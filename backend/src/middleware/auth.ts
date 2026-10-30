import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin, supabaseConfigured } from '../config/supabase';

export interface AuthenticatedRequest extends Request {
  userId?: string;
  accessToken?: string;
}

export async function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!supabaseConfigured) {
    res.status(503).json({ error: 'Server not configured. Please fill in backend/.env with Supabase credentials.' });
    return;
  }
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing or invalid authorization header' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }

    req.userId = user.id;
    req.accessToken = token;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(500).json({ error: 'Authentication failed' });
  }
}

