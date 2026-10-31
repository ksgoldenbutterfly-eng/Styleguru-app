import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState } from 'react';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
  new_password: z.string().min(6, 'Password must be at least 6 characters'),
  confirm_password: z.string(),
}).refine(d => d.new_password === d.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
});

type FormData = z.infer<typeof schema>;

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await resetPassword(data.email, data.new_password);
      toast.success('Password updated successfully! Please sign in with your new password.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update password. Please check your email.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-2xl text-gray-900">StyleGuru</span>
          </Link>
        </div>

        <div className="card shadow-lg border border-gray-100">
          <h1 className="text-2xl font-display font-bold text-gray-900 mb-1">Reset Password</h1>
          <p className="text-gray-500 text-sm mb-6">Enter your registered email and choose a new password</p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <div>
              <label htmlFor="email" className="label">Registered Email</label>
              <input
                id="email"
                type="email"
                className="input-field"
                placeholder="you@example.com"
                {...register('email')}
                aria-invalid={!!errors.email}
              />
              {errors.email && <p className="error-text">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="new_password" className="label">New Password</label>
              <div className="relative">
                <input
                  id="new_password"
                  type={showPassword ? 'text' : 'password'}
                  className="input-field pr-10"
                  placeholder="Min. 6 characters"
                  {...register('new_password')}
                  aria-invalid={!!errors.new_password}
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
              {errors.new_password && <p className="error-text">{errors.new_password.message}</p>}
            </div>

            <div>
              <label htmlFor="confirm_password" className="label">Confirm New Password</label>
              <input
                id="confirm_password"
                type={showPassword ? 'text' : 'password'}
                className="input-field"
                placeholder="Repeat your new password"
                {...register('confirm_password')}
                aria-invalid={!!errors.confirm_password}
              />
              {errors.confirm_password && <p className="error-text">{errors.confirm_password.message}</p>}
            </div>

            <button type="submit" className="btn-primary w-full py-3" disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Update Password'}
            </button>
          </form>

          <Link to="/login" className="flex items-center gap-1.5 justify-center text-sm text-gray-500 hover:text-gray-700 mt-6">
            <ArrowLeft className="w-4 h-4" /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
