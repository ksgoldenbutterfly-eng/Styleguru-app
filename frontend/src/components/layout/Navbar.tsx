import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Menu, Bell, Sparkles } from 'lucide-react';

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-gray-100 px-4 sm:px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>
        <div className="hidden lg:flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary-600" aria-hidden="true" />
          <span className="font-medium text-gray-700 text-sm">StyleGuru AI</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="p-2 rounded-xl hover:bg-gray-100 transition-colors relative" aria-label="Notifications">
          <Bell className="w-5 h-5 text-gray-600" />
        </button>
        <Link
          to="/profile"
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
            {user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[120px] truncate">
            {user?.email}
          </span>
        </Link>
      </div>
    </header>
  );
}

