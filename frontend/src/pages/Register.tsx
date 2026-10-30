import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

const schema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

export default function Register() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await signUp(data.email, data.password, data.full_name);
      toast.success('Account created! Please check your email to verify.');
      navigate('/onboarding');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      toast.error(msg.includes('already registered') ? 'Email already in use. Try logging in.' : msg);
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
          <h1 className="text-2xl font-display font-bold text-gray-900 mb-1">Create your account</h1>
          <p className="text-gray-500 text-sm mb-6">Start your personal style journey</p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <div>
              <label htmlFor="full_name" className="label">Full name</label>
              <input id="full_name" type="text" autoComplete="name" className="input-field"
                placeholder="Your full name" {...register('full_name')} aria-invalid={!!errors.full_name} />
              {errors.full_name && <p className="error-text">{errors.full_name.message}</p>}
            </div>

            <div>
              <label htmlFor="email" className="label">Email address</label>
              <input id="email" type="email" autoComplete="email" className="input-field"
                placeholder="you@example.com" {...register('email')} aria-invalid={!!errors.email} />
              {errors.email && <p className="error-text">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="password" className="label">Password</label>
              <div className="relative">
                <input id="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password"
                  className="input-field pr-10" placeholder="Min. 8 characters" {...register('password')} aria-invalid={!!errors.password} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="error-text">{errors.password.message}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="label">Confirm password</label>
              <input id="confirmPassword" type={showPassword ? 'text' : 'password'} autoComplete="new-password"
                className="input-field" placeholder="Repeat your password" {...register('confirmPassword')} aria-invalid={!!errors.confirmPassword} />
              {errors.confirmPassword && <p className="error-text">{errors.confirmPassword.message}</p>}
            </div>

            <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

