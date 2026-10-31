import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles, Eye, EyeOff, Zap } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormData = z.infer<typeof schema>;

export default function Login() {
  const { signIn, loginAsDemo } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isDemoLoggingIn, setIsDemoLoggingIn] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await signIn(data.email, data.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      if (msg.toLowerCase().includes('email not confirmed')) {
        toast.error('Account pending confirmation. Use 1-Click Demo or register again for instant login.');
      } else if (msg.includes('Invalid')) {
        toast.error('Invalid email or password');
      } else {
        toast.error(msg);
      }
    }
  };

  const handleDemoLogin = async () => {
    setIsDemoLoggingIn(true);
    try {
      await loginAsDemo();
      toast.success('Signed in as Demo User!');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error('Demo login failed: ' + (err.message || 'Please try again'));
    } finally {
      setIsDemoLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-2xl text-gray-900">StyleGuru</span>
          </Link>
        </div>

        <div className="card shadow-lg border border-purple-100">
          <h1 className="text-2xl font-display font-bold text-gray-900 mb-1">Welcome back</h1>
          <p className="text-gray-500 text-sm mb-6">Sign in to your StyleGuru account</p>

          {/* Quick Demo Login Button */}
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={isDemoLoggingIn}
            className="w-full mb-6 py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all duration-200 transform hover:-translate-y-0.5"
          >
            <Zap className="w-5 h-5 fill-current text-yellow-300" />
            {isDemoLoggingIn ? 'Logging into Demo...' : '⚡ 1-Click Instant Demo Login'}
          </button>

          <div className="relative flex py-2 items-center mb-6">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink mx-4 text-xs font-medium text-gray-400 uppercase tracking-wider">or sign in with email</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <div>
              <label htmlFor="email" className="label">Email address</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className="input-field"
                placeholder="you@example.com"
                {...register('email')}
                aria-invalid={!!errors.email}
              />
              {errors.email && <p className="error-text">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="password" className="label">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className="input-field pr-10"
                  placeholder="Your password"
                  {...register('password')}
                  aria-invalid={!!errors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="error-text">{errors.password.message}</p>}
            </div>

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                Forgot password?
              </Link>
            </div>

            <button type="submit" className="btn-primary w-full py-3" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
