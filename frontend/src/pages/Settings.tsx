import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { useNavigate } from 'react-router-dom';
import { Trash2, Key, LogOut, Shield, AlertTriangle } from 'lucide-react';
import { ConfirmDialog } from '../components/ui/Modal';
import toast from 'react-hot-toast';

export default function Settings() {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPwForm, setShowPwForm] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch {
      toast.error('Failed to sign out');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    if (newPassword !== confirmPass) { toast.error('Passwords do not match'); return; }
    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success('Password changed successfully!');
      setShowPwForm(false);
      setNewPassword('');
      setConfirmPass('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      // Sign out first
      await signOut();
      toast.success('Account deleted. Goodbye!');
      navigate('/');
    } catch {
      toast.error('Failed to delete account. Please contact support.');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account security and preferences</p>
      </div>

      {/* Account Info */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary-600" aria-hidden="true" />
          Account Information
        </h2>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-gray-500">Email Address</p>
            <p className="font-medium text-gray-900">{user?.email}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Account ID</p>
            <p className="font-medium text-gray-700 text-xs font-mono">{user?.id}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Member Since</p>
            <p className="font-medium text-gray-900">{new Date(user?.created_at || '').toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Key className="w-4 h-4 text-primary-600" aria-hidden="true" />
            Password
          </h2>
          <button onClick={() => setShowPwForm(!showPwForm)} className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            {showPwForm ? 'Cancel' : 'Change Password'}
          </button>
        </div>

        {showPwForm && (
          <form onSubmit={handleChangePassword} className="space-y-4" noValidate>
            <div>
              <label className="label" htmlFor="new-password">New Password</label>
              <input id="new-password" type="password" className="input-field" placeholder="Min. 8 characters"
                value={newPassword} onChange={e => setNewPassword(e.target.value)} autoComplete="new-password" />
            </div>
            <div>
              <label className="label" htmlFor="confirm-password">Confirm New Password</label>
              <input id="confirm-password" type="password" className="input-field" placeholder="Repeat new password"
                value={confirmPass} onChange={e => setConfirmPass(e.target.value)} autoComplete="new-password" />
            </div>
            <button type="submit" disabled={changingPassword} className="btn-primary">
              {changingPassword ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        )}
        {!showPwForm && <p className="text-sm text-gray-500">Keep your account secure with a strong password.</p>}
      </div>

      {/* Sign Out */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <LogOut className="w-4 h-4 text-gray-600" aria-hidden="true" />
          Sign Out
        </h2>
        <p className="text-sm text-gray-500 mb-4">You will be redirected to the home page after signing out.</p>
        <button onClick={() => setShowSignOutConfirm(true)} className="btn-secondary">
          Sign Out
        </button>
      </div>

      {/* Danger Zone */}
      <div className="card border-red-100">
        <h2 className="font-semibold text-red-700 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" aria-hidden="true" />
          Danger Zone
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Deleting your account will permanently remove all your data including your wardrobe, outfits, and conversations. This action cannot be undone.
        </p>
        <button onClick={() => setShowDeleteConfirm(true)} className="btn-danger flex items-center gap-2">
          <Trash2 className="w-4 h-4" /> Delete Account
        </button>
      </div>

      <ConfirmDialog
        open={showSignOutConfirm}
        onClose={() => setShowSignOutConfirm(false)}
        onConfirm={handleSignOut}
        title="Sign Out"
        message="Are you sure you want to sign out of StyleGuru?"
        confirmText="Sign Out"
      />

      <ConfirmDialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Account"
        message="This will permanently delete your account and all associated data. This action cannot be undone."
        confirmText="Delete My Account"
        isDestructive
        loading={deleting}
      />
    </div>
  );
}

