import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi, wardrobeApi, outfitsApi } from '../services/api';
import { DashboardStats, WardrobeItem, Outfit } from '../types';
import { Shirt, Wand2, Camera, Heart, TrendingUp, Plus, ArrowRight } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: number; color: string }) {
  return (
    <div className="card flex items-center gap-4">
      <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center flex-shrink-0`}>
        <Icon className="w-6 h-6 text-white" aria-hidden="true" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentItems, setRecentItems] = useState<WardrobeItem[]>([]);
  const [recentOutfits, setRecentOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, wardrobeRes, outfitsRes] = await Promise.all([
          dashboardApi.getStats(),
          wardrobeApi.list(),
          outfitsApi.list(),
        ]);
        setStats(statsRes.stats);
        setRecentItems((wardrobeRes.items || []).slice(0, 4));
        setRecentOutfits((outfitsRes.outfits || []).slice(0, 3));
      } catch {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;

  const quickActions = [
    { to: '/wardrobe/add', icon: Plus, label: 'Add Clothing', color: 'bg-primary-600' },
    { to: '/outfit-generator', icon: Wand2, label: 'Generate Outfit', color: 'bg-purple-600' },
    { to: '/outfit-analyzer', icon: Camera, label: 'Analyze Outfit', color: 'bg-pink-600' },
    { to: '/ai-stylist', icon: TrendingUp, label: 'AI Stylist', color: 'bg-indigo-600' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back! Here's your style overview.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Shirt} label="Wardrobe Items" value={stats?.total_wardrobe_items || 0} color="bg-primary-500" />
        <StatCard icon={Wand2} label="Outfits Generated" value={stats?.total_outfits_generated || 0} color="bg-purple-500" />
        <StatCard icon={Camera} label="Analyses Done" value={stats?.total_analyses || 0} color="bg-pink-500" />
        <StatCard icon={Heart} label="Favorites" value={stats?.total_favorites || 0} color="bg-red-500" />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map(({ to, icon: Icon, label, color }) => (
            <Link key={to} to={to}
              className="card flex flex-col items-center gap-3 py-6 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 text-center">
              <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
                <Icon className="w-6 h-6 text-white" aria-hidden="true" />
              </div>
              <span className="text-sm font-medium text-gray-700">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Category Breakdown */}
      {stats?.category_breakdown && Object.keys(stats.category_breakdown).length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Wardrobe by Category</h2>
          <div className="space-y-3">
            {Object.entries(stats.category_breakdown)
              .sort(([, a], [, b]) => b - a)
              .map(([cat, count]) => {
                const pct = stats.total_wardrobe_items > 0
                  ? Math.round((count / stats.total_wardrobe_items) * 100)
                  : 0;
                return (
                  <div key={cat}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize text-gray-700">{cat}</span>
                      <span className="text-gray-500">{count} items ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full">
                      <div className="h-2 bg-gradient-to-r from-primary-400 to-purple-500 rounded-full transition-all"
                        style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Recent Wardrobe */}
      {recentItems.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Wardrobe Items</h2>
            <Link to="/wardrobe" className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recentItems.map(item => (
              <div key={item.id} className="card p-4">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name} className="w-full h-32 object-cover rounded-lg mb-3" />
                ) : (
                  <div className="w-full h-32 bg-gradient-to-br from-primary-100 to-purple-100 rounded-lg mb-3 flex items-center justify-center">
                    <Shirt className="w-8 h-8 text-primary-400" aria-hidden="true" />
                  </div>
                )}
                <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                <p className="text-xs text-gray-500 capitalize">{item.category} · {item.color}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Outfits */}
      {recentOutfits.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Outfits</h2>
            <Link to="/favorites" className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium">
              Favorites <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentOutfits.map(outfit => (
              <div key={outfit.id} className="card p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900 capitalize">{outfit.occasion || 'General'} Outfit</span>
                  {outfit.is_favorite && <Heart className="w-4 h-4 text-red-500 fill-current" aria-hidden="true" />}
                </div>
                {outfit.recommendations?.length > 0 && (
                  <p className="text-xs text-gray-500">{outfit.recommendations[0].title}</p>
                )}
                <p className="text-xs text-gray-400 mt-2">{new Date(outfit.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {stats?.total_wardrobe_items === 0 && (
        <div className="card text-center py-12">
          <Shirt className="w-16 h-16 text-gray-300 mx-auto mb-4" aria-hidden="true" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Start Building Your Wardrobe</h3>
          <p className="text-gray-500 text-sm mb-6">Add your clothing items to get personalized outfit recommendations.</p>
          <Link to="/wardrobe/add" className="btn-primary inline-flex">
            <Plus className="w-4 h-4 mr-2" /> Add First Item
          </Link>
        </div>
      )}
    </div>
  );
}

