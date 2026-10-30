import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

const missingVars = [
  !supabaseUrl && 'SUPABASE_URL',
  !supabaseServiceKey && 'SUPABASE_SERVICE_ROLE_KEY',
  !supabaseAnonKey && 'SUPABASE_ANON_KEY',
].filter(Boolean);

if (missingVars.length > 0) {
  console.warn(`⚠️  Missing Supabase env vars: ${missingVars.join(', ')}`);
  console.warn('   Please fill in backend/.env with your Supabase credentials.');
}

const isConfigured = supabaseUrl && supabaseServiceKey && supabaseAnonKey &&
  !supabaseUrl.includes('your_') && !supabaseServiceKey.includes('your_');

// Admin client with service role - for backend operations
export const supabaseAdmin = isConfigured
  ? createClient(supabaseUrl!, supabaseServiceKey!, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : null as unknown as ReturnType<typeof createClient>;

// User-context client factory - creates client that respects RLS using user's JWT
export function createUserClient(accessToken: string) {
  if (!isConfigured) throw new Error('Supabase is not configured. Please fill in backend/.env');
  return createClient(supabaseUrl!, supabaseAnonKey!, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export { supabaseUrl, supabaseAnonKey, isConfigured as supabaseConfigured };
