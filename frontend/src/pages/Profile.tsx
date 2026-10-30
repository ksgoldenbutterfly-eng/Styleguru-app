import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { profileApi } from '../services/api';
import type { Profile } from '../types';
import { Camera, Save } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const schema = z.object({
  full_name: z.string().min(1, 'Name is required').max(100),
  age: z.union([z.number().int().min(13).max(120), z.nan()]).optional(),
  preferred_style: z.string().max(50).optional(),
  bio: z.string().max(500).optional(),
  budget_preference: z.string().max(50).optional(),
});
type FormData = z.infer<typeof schema>;

const styles = ['Indian Wear', 'Western Wear', 'Indo-Western', 'Casual', 'Formal', 'Traditional', 'Eclectic'];
const colorOptions = ['Black', 'White', 'Navy Blue', 'Grey', 'Beige', 'Red', 'Pink', 'Yellow', 'Green', 'Blue', 'Purple', 'Brown', 'Gold', 'Maroon'];

export default function Profile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    profileApi.get().then(r => {
      setProfile(r.profile);
      setSelectedColors(r.profile.favorite_colors || []);
      reset({
        full_name: r.profile.full_name,
        age: r.profile.age,
        preferred_style: r.profile.preferred_style,
        bio: r.profile.bio,
        budget_preference: r.profile.budget_preference,
      });
    }).catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  }, [reset]);

  const onSubmit = async (data: FormData) => {
    try {
      const updated = await profileApi.update({ ...data, favorite_colors: selectedColors });
      setProfile(updated.profile);
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarLoading(true);
    try {
      const res = await profileApi.uploadAvatar(file);
      await profileApi.update({ avatar_url: res.avatar_url });
      setProfile(p => p ? { ...p, avatar_url: res.avatar_url } : p);
      toast.success('Avatar updated!');
    } catch {
      toast.error('Failed to upload avatar');
    } finally {
      setAvatarLoading(false);
    }
  };

  const toggleColor = (color: string) => {
    setSelectedColors(prev => prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]);
  };

  if (loading) return <LoadingSpinner text="Loading profile..." />;

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500 mt-1">Manage your personal information and style preferences</p>
      </div>

      {/* Avatar */}
      <div className="card flex items-center gap-6">
        <div className="relative">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="Avatar" className="w-20 h-20 rounded-full object-cover" />
          ) : (
            <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {profile?.full_name?.[0]?.toUpperCase() || 'U'}
            </div>
          )}
          <label htmlFor="avatar-upload"
            className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-700 transition-colors"
            aria-label="Upload avatar">
            <Camera className="w-3.5 h-3.5 text-white" aria-hidden="true" />
            <input id="avatar-upload" type="file" accept="image/*" className="sr-only" onChange={handleAvatarUpload} disabled={avatarLoading} />
          </label>
        </div>
        <div>
          <p className="font-semibold text-gray-900">{profile?.full_name || 'Your Name'}</p>
          <p className="text-sm text-gray-500">{profile?.preferred_style || 'No style preference set'}</p>
          {avatarLoading && <p className="text-xs text-primary-600 mt-1">Uploading...</p>}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="card space-y-5">
        <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Full Name *</label>
            <input className="input-field" type="text" {...register('full_name')} aria-invalid={!!errors.full_name} />
            {errors.full_name && <p className="error-text">{errors.full_name.message}</p>}
          </div>
          <div>
            <label className="label">Age (optional)</label>
            <input className="input-field" type="number" {...register('age', { valueAsNumber: true })} placeholder="Your age" />
          </div>
        </div>

        <div>
          <label className="label">Bio (optional)</label>
          <textarea className="input-field h-20 resize-none" {...register('bio')} placeholder="Tell us about your style..." />
        </div>

        <div>
          <label className="label">Preferred Style</label>
          <div className="flex flex-wrap gap-2">
            {styles.map(s => {
              const [watchedStyle] = [profile?.preferred_style];
              const isSelected = watchedStyle === s;
              return (
                <button key={s} type="button"
                  onClick={() => setProfile(p => p ? { ...p, preferred_style: s } : p)}
                  className={clsx('px-4 py-2 rounded-full text-sm font-medium border transition-all',
                    isSelected ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'
                  )}>
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="label">Favorite Colors</label>
          <div className="flex flex-wrap gap-2">
            {colorOptions.map(c => (
              <button key={c} type="button" onClick={() => toggleColor(c)}
                className={clsx('px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                  selectedColors.includes(c) ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'
                )}>
                {c}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">Budget Preference</label>
          <select className="input-field" {...register('budget_preference')}>
            <option value="">Select budget range</option>
            <option>Budget-friendly (₹500–₹2000)</option>
            <option>Mid-range (₹2000–₹5000)</option>
            <option>Premium (₹5000–₹15000)</option>
            <option>Luxury (₹15000+)</option>
          </select>
        </div>

        <button type="submit" className="btn-primary flex items-center gap-2" disabled={isSubmitting}>
          <Save className="w-4 h-4" /> {isSubmitting ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
}

