import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { profileApi } from '../services/api';
import { Sparkles, ChevronRight, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const styles = ['Indian Wear', 'Western Wear', 'Indo-Western', 'Casual', 'Formal', 'Traditional', 'Eclectic'];
const categories = ['Tops', 'Shirts', 'T-Shirts', 'Trousers', 'Jeans', 'Dresses', 'Skirts', 'Sarees', 'Kurtas', 'Footwear', 'Accessories'];
const colors = ['Black', 'White', 'Navy Blue', 'Grey', 'Beige', 'Red', 'Pink', 'Yellow', 'Green', 'Blue', 'Purple', 'Brown', 'Gold', 'Maroon'];
const budgets = ['Budget-friendly (₹500–₹2000)', 'Mid-range (₹2000–₹5000)', 'Premium (₹5000–₹15000)', 'Luxury (₹15000+)'];

function MultiSelect({ options, value, onChange }: { options: string[]; value: string[]; onChange: (v: string[]) => void }) {
  const toggle = (opt: string) => {
    onChange(value.includes(opt) ? value.filter(v => v !== opt) : [...value, opt]);
  };
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => (
        <button
          key={opt}
          type="button"
          onClick={() => toggle(opt)}
          className={clsx(
            'px-4 py-2 rounded-full text-sm font-medium border transition-all',
            value.includes(opt)
              ? 'bg-primary-600 text-white border-primary-600'
              : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

export default function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    full_name: user?.user_metadata?.full_name || '',
    preferred_style: '',
    preferred_categories: [] as string[],
    favorite_colors: [] as string[],
    budget_preference: '',
  });

  const steps = [
    {
      title: 'Welcome to StyleGuru! 🎉',
      subtitle: 'Let\'s personalize your experience. What\'s your name?',
      content: (
        <div>
          <label className="label">Your name</label>
          <input className="input-field" type="text" value={form.full_name}
            onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} placeholder="Enter your name" />
        </div>
      ),
    },
    {
      title: 'Your Style Preference',
      subtitle: 'Which fashion style resonates with you the most?',
      content: (
        <div className="flex flex-wrap gap-2">
          {styles.map(s => (
            <button key={s} type="button" onClick={() => setForm(f => ({ ...f, preferred_style: s }))}
              className={clsx('px-4 py-2 rounded-full text-sm font-medium border transition-all',
                form.preferred_style === s ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'
              )}>
              {s}
            </button>
          ))}
        </div>
      ),
    },
    {
      title: 'Favorite Clothing Categories',
      subtitle: 'What types of clothing do you wear most? (Select all that apply)',
      content: (
        <MultiSelect options={categories} value={form.preferred_categories}
          onChange={v => setForm(f => ({ ...f, preferred_categories: v }))} />
      ),
    },
    {
      title: 'Your Favorite Colors',
      subtitle: 'Which colors do you love wearing?',
      content: (
        <MultiSelect options={colors} value={form.favorite_colors}
          onChange={v => setForm(f => ({ ...f, favorite_colors: v }))} />
      ),
    },
    {
      title: 'Budget Preference',
      subtitle: 'What\'s your typical clothing budget? (Optional)',
      content: (
        <div className="space-y-3">
          {budgets.map(b => (
            <button key={b} type="button" onClick={() => setForm(f => ({ ...f, budget_preference: b }))}
              className={clsx('w-full px-4 py-3 rounded-xl text-sm font-medium border text-left transition-all',
                form.budget_preference === b ? 'bg-primary-50 border-primary-500 text-primary-700' : 'bg-white border-gray-200 text-gray-600 hover:border-primary-300'
              )}>
              {b}
            </button>
          ))}
        </div>
      ),
    },
  ];

  const handleComplete = async () => {
    setLoading(true);
    try {
      await profileApi.update({ ...form, onboarding_completed: true } as Parameters<typeof profileApi.update>[0]);
      toast.success('Profile set up! Let\'s explore your style.');
      navigate('/dashboard');
    } catch {
      toast.error('Failed to save preferences. You can update them in your profile.');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const isLast = step === steps.length - 1;
  const progress = ((step + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-2xl text-gray-900">StyleGuru</span>
          </div>
        </div>

        <div className="card">
          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>Step {step + 1} of {steps.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full">
              <div className="h-2 bg-gradient-to-r from-primary-500 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }} role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} />
            </div>
          </div>

          <h2 className="text-xl font-display font-bold text-gray-900 mb-1">{steps[step].title}</h2>
          <p className="text-gray-500 text-sm mb-6">{steps[step].subtitle}</p>

          {steps[step].content}

          <div className="flex justify-between mt-8">
            <button onClick={() => setStep(s => s - 1)} disabled={step === 0}
              className="btn-secondary flex items-center gap-2 disabled:opacity-30">
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            {isLast ? (
              <button onClick={handleComplete} disabled={loading} className="btn-primary flex items-center gap-2">
                {loading ? 'Saving...' : 'Complete Setup'} <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={() => setStep(s => s + 1)} className="btn-primary flex items-center gap-2">
                Next <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

