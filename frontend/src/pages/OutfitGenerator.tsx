import { useState } from 'react';
import { outfitsApi } from '../services/api';
import { OutfitRecommendation } from '../types';
import { Wand2, Heart, HeartOff, ChevronDown, ChevronUp } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const occasions = ['college', 'office', 'parties', 'weddings', 'festivals', 'casual', 'interviews', 'other'];
const styles = ['Indian Wear', 'Western Wear', 'Indo-Western', 'Casual', 'Formal', 'Traditional', 'Any'];
const weathers = ['Summer', 'Winter', 'Rainy', 'Spring', 'Autumn', 'Any'];

function OutfitCard({ outfit, outfitId, index }: { outfit: OutfitRecommendation; outfitId?: string; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFavorite = async () => {
    if (!outfitId) return;
    setLoading(true);
    try {
      if (favorited) {
        await outfitsApi.unfavorite(outfitId);
        setFavorited(false);
        toast.success('Removed from favorites');
      } else {
        await outfitsApi.favorite(outfitId);
        setFavorited(true);
        toast.success('Added to favorites!');
      }
    } catch {
      toast.error('Failed to update favorite');
    } finally {
      setLoading(false);
    }
  };

  const colorMap: Record<string, string> = {
    Blue: '#3B82F6', Red: '#EF4444', Green: '#22C55E', Yellow: '#EAB308',
    Black: '#1F2937', White: '#F9FAFB', Pink: '#EC4899', Purple: '#A855F7',
    Navy: '#1E3A5F', Beige: '#D4C5A9', Brown: '#92400E', Grey: '#6B7280',
  };

  return (
    <div className={clsx(
      'card border-2 transition-all duration-200',
      index === 0 ? 'border-primary-200 bg-gradient-to-br from-primary-50 to-white' : 'border-transparent'
    )}>
      {index === 0 && (
        <span className="inline-block text-xs font-semibold text-primary-700 bg-primary-100 px-2.5 py-1 rounded-full mb-3">
          ⭐ Top Pick
        </span>
      )}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-base">{outfit.title}</h3>
          <p className="text-gray-500 text-sm mt-1">{outfit.description}</p>
        </div>
        {outfitId && (
          <button onClick={handleFavorite} disabled={loading}
            className="flex-shrink-0 p-2 rounded-xl hover:bg-gray-100 transition-colors"
            aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}>
            {favorited ? <Heart className="w-5 h-5 text-red-500 fill-current" /> : <HeartOff className="w-5 h-5 text-gray-400" />}
          </button>
        )}
      </div>

      {/* Colors */}
      <div className="flex items-center gap-2 mt-3">
        <span className="text-xs text-gray-500">Colors:</span>
        <div className="flex gap-1">
          {outfit.colors.map(color => (
            <div key={color} className="w-5 h-5 rounded-full border border-gray-200 flex-shrink-0"
              style={{ backgroundColor: colorMap[color] || '#E5E7EB' }}
              title={color} aria-label={color} />
          ))}
        </div>
        <span className="text-xs text-gray-500">{outfit.colors.join(', ')}</span>
      </div>

      {/* Items */}
      {outfit.items?.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-medium text-gray-600 mb-1.5">Outfit items:</p>
          <div className="flex flex-wrap gap-1.5">
            {outfit.items.map((item, i) => (
              <span key={i} className="text-xs px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full">{item}</span>
            ))}
          </div>
        </div>
      )}

      {/* Expandable details */}
      <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1 text-xs text-primary-600 mt-3 hover:text-primary-700">
        {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        {expanded ? 'Hide details' : 'Why this outfit?'}
      </button>
      {expanded && (
        <div className="mt-3 space-y-2 text-sm animate-slide-up">
          <p className="text-gray-600"><span className="font-medium">Reason: </span>{outfit.reason}</p>
          {outfit.accessibility_notes && (
            <p className="text-gray-500 text-xs bg-blue-50 p-2 rounded-lg">
              ♿ {outfit.accessibility_notes}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function OutfitGenerator() {
  const [loading, setLoading] = useState(false);
  const [outfits, setOutfits] = useState<OutfitRecommendation[]>([]);
  const [outfitId, setOutfitId] = useState<string | undefined>();
  const [form, setForm] = useState({
    occasion: '',
    preferred_style: '',
    color_preference: '',
    weather: '',
    use_wardrobe_only: false,
    accessibility_notes: '',
  });

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.occasion) { toast.error('Please select an occasion'); return; }
    setLoading(true);
    setOutfits([]);
    try {
      const res = await outfitsApi.generate(form);
      setOutfits(res.outfits || []);
      setOutfitId(res.outfit_id);
      if (!res.outfits?.length) toast.error('No outfits generated. Try different preferences.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate outfits');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900">Outfit Generator</h1>
        <p className="text-gray-500 mt-1">Get AI-powered outfit recommendations tailored to you</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Form */}
        <form onSubmit={handleGenerate} className="lg:col-span-2 card space-y-4 h-fit">
          <h2 className="font-semibold text-gray-900">Your Preferences</h2>

          <div>
            <label className="label">Occasion *</label>
            <select className="input-field" value={form.occasion}
              onChange={e => setForm(f => ({ ...f, occasion: e.target.value }))} required>
              <option value="">Select occasion</option>
              {occasions.map(o => <option key={o} value={o} className="capitalize">{o}</option>)}
            </select>
          </div>

          <div>
            <label className="label">Style Preference</label>
            <select className="input-field" value={form.preferred_style}
              onChange={e => setForm(f => ({ ...f, preferred_style: e.target.value }))}>
              <option value="">Any style</option>
              {styles.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="label">Color Preference</label>
            <input className="input-field" type="text" placeholder="e.g. Blue and white, pastels..."
              value={form.color_preference} onChange={e => setForm(f => ({ ...f, color_preference: e.target.value }))} />
          </div>

          <div>
            <label className="label">Weather</label>
            <select className="input-field" value={form.weather}
              onChange={e => setForm(f => ({ ...f, weather: e.target.value }))}>
              <option value="">Any weather</option>
              {weathers.map(w => <option key={w} value={w}>{w}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <input type="checkbox" id="wardrobe_only" className="w-4 h-4 accent-primary-600"
              checked={form.use_wardrobe_only}
              onChange={e => setForm(f => ({ ...f, use_wardrobe_only: e.target.checked }))} />
            <label htmlFor="wardrobe_only" className="text-sm text-gray-700 cursor-pointer">
              Only use items from my wardrobe
            </label>
          </div>

          <div>
            <label className="label">Accessibility Notes <span className="text-gray-400 font-normal">(optional)</span></label>
            <textarea className="input-field h-16 resize-none text-sm" placeholder="Any comfort or accessibility preferences..."
              value={form.accessibility_notes} onChange={e => setForm(f => ({ ...f, accessibility_notes: e.target.value }))} />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            <Wand2 className="w-4 h-4" />
            {loading ? 'Generating...' : 'Generate Outfits'}
          </button>
        </form>

        {/* Results */}
        <div className="lg:col-span-3 space-y-4">
          {loading ? (
            <div className="card">
              <LoadingSpinner text="StyleGuru AI is creating your outfits..." />
            </div>
          ) : outfits.length > 0 ? (
            <>
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">{outfits.length} Outfits Generated</h2>
                <button onClick={handleGenerate}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                  <Wand2 className="w-3.5 h-3.5" /> Regenerate
                </button>
              </div>
              {outfits.map((outfit, i) => (
                <OutfitCard key={i} outfit={outfit} outfitId={outfitId} index={i} />
              ))}
            </>
          ) : (
            <div className="card text-center py-16">
              <Wand2 className="w-16 h-16 text-gray-200 mx-auto mb-4" aria-hidden="true" />
              <h3 className="text-lg font-semibold text-gray-500 mb-2">Ready to Style You!</h3>
              <p className="text-gray-400 text-sm">Fill in your preferences and click Generate Outfits</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

