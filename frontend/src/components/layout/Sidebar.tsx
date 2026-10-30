import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard, Shirt, Wand2, Camera, MessageSquare,
  Heart, Accessibility, Settings, User, X, Sparkles, LogOut
} from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/wardrobe', label: 'My Wardrobe', icon: Shirt },
  { path: '/outfit-generator', label: 'Generate Outfit', icon: Wand2 },
  { path: '/outfit-analyzer', label: 'Analyze Outfit', icon: Camera },
  { path: '/ai-stylist', label: 'AI Stylist', icon: MessageSquare },
  { path: '/favorites', label: 'Favorites', icon: Heart },
  { path: '/accessibility', label: 'Accessibility', icon: Accessibility },
  { path: '/profile', label: 'Profile', icon: User },
  { path: '/settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const location = useLocation();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try { await signOut(); } catch (err) { console.error(err); }
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 flex flex-col transition-transform duration-300',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <Link to="/dashboard" className="flex items-center gap-2" onClick={onClose}>
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-gray-900">StyleGuru</span>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname === path || location.pathname.startsWith(path + '/');
            return (
              <Link
                key={path}
                to={path}
                onClick={onClose}
                className={clsx(
                  'sidebar-link',
                  isActive && 'sidebar-link-active'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Sign out */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleSignOut}
            className="sidebar-link w-full text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}

