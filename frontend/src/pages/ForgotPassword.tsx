import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState } from 'react';

const schema = z.object({
  email: z.string().email('Invalid email address'),
});
type FormData = z.infer<typeof schema>;

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await resetPassword(data.email);
      setSent(true);
    } catch (err) {
      toast.error('Failed to send reset email. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-2xl text-gray-900">StyleGuru</span>
          </Link>
        </div>

        <div className="card">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✉️</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Check your email</h2>
              <p className="text-gray-500 text-sm mb-6">We've sent a password reset link to your email address.</p>
              <Link to="/login" className="btn-primary inline-flex">Back to Login</Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-display font-bold text-gray-900 mb-1">Reset password</h1>
              <p className="text-gray-500 text-sm mb-6">Enter your email to receive a reset link</p>

              <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                <div>
                  <label htmlFor="email" className="label">Email address</label>
                  <input id="email" type="email" className="input-field" placeholder="you@example.com"
                    {...register('email')} aria-invalid={!!errors.email} />
                  {errors.email && <p className="error-text">{errors.email.message}</p>}
                </div>
                <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>

              <Link to="/login" className="flex items-center gap-1 justify-center text-sm text-gray-500 hover:text-gray-700 mt-6">
                <ArrowLeft className="w-4 h-4" /> Back to login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

