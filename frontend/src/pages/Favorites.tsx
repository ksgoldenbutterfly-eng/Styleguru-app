import { useEffect, useState } from 'react';
import { outfitsApi } from '../services/api';
import { Outfit } from '../types';
import { Heart, HeartOff, Wand2, Trash2 } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { ConfirmDialog } from '../components/ui/Modal';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

export default function Favorites() {
  const [favorites, setFavorites] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [removeId, setRemoveId] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    outfitsApi.getFavorites()
      .then(r => setFavorites(r.favorites || []))
      .catch(() => toast.error('Failed to load favorites'))
      .finally(() => setLoading(false));
  }, []);

  const handleRemoveFavorite = async () => {
    if (!removeId) return;
    setRemoving(true);
    try {
      await outfitsApi.unfavorite(removeId);
      setFavorites(prev => prev.filter(f => f.id !== removeId));
      toast.success('Removed from favorites');
    } catch {
      toast.error('Failed to remove favorite');
    } finally {
      setRemoving(false);
      setRemoveId(null);
    }
  };

  if (loading) return <LoadingSpinner text="Loading favorites..." />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900">Favorite Outfits</h1>
        <p className="text-gray-500 mt-1">{favorites.length} saved outfit{favorites.length !== 1 ? 's' : ''}</p>
      </div>

      {favorites.length === 0 ? (
        <div className="card text-center py-16">
          <Heart className="w-16 h-16 text-gray-200 mx-auto mb-4" aria-hidden="true" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Favorites Yet</h3>
          <p className="text-gray-400 text-sm mb-6">Generate outfits and heart the ones you love to save them here.</p>
          <Link to="/outfit-generator" className="btn-primary inline-flex items-center gap-2">
            <Wand2 className="w-4 h-4" /> Generate Outfits
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites.map(outfit => (
            <div key={outfit.id} className="card">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="badge bg-primary-100 text-primary-700 capitalize">
                    {outfit.occasion || 'General'} Outfit
                  </span>
                </div>
                <div className="flex gap-1">
                  <Heart className="w-4 h-4 text-red-500 fill-current" aria-hidden="true" />
                  <button onClick={() => setRemoveId(outfit.id)}
                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors ml-1"
                    aria-label="Remove from favorites">
                    <Trash2 className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                </div>
              </div>

              {outfit.recommendations?.map((rec, i) => (
                <div key={i} className={i > 0 ? 'mt-4 pt-4 border-t border-gray-100' : ''}>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">{rec.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{rec.description}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {rec.colors?.map(c => (
                      <span key={c} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">{c}</span>
                    ))}
                  </div>
                  {rec.items?.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-400 mb-1">Items:</p>
                      <div className="flex flex-wrap gap-1">
                        {rec.items.map((item, j) => (
                          <span key={j} className="text-xs px-2 py-0.5 bg-primary-50 text-primary-700 rounded-full">{item}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              <p className="text-xs text-gray-400 mt-3">
                Saved {new Date(outfit.updated_at || outfit.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!removeId}
        onClose={() => setRemoveId(null)}
        onConfirm={handleRemoveFavorite}
        title="Remove Favorite"
        message="Remove this outfit from your favorites? You can always re-add it later."
        confirmText="Remove"
        loading={removing}
      />
    </div>
  );
}

