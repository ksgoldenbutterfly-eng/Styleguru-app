import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { wardrobeApi } from '../services/api';
import { WardrobeItem, ClothingCategory, Occasion } from '../types';
import { Plus, Search, Shirt, Edit2, Trash2, Filter } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { ConfirmDialog } from '../components/ui/Modal';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const categories: { value: string; label: string }[] = [
  { value: '', label: 'All Categories' },
  { value: 'tops', label: 'Tops' },
  { value: 'shirts', label: 'Shirts' },
  { value: 't-shirts', label: 'T-Shirts' },
  { value: 'trousers', label: 'Trousers' },
  { value: 'jeans', label: 'Jeans' },
  { value: 'dresses', label: 'Dresses' },
  { value: 'skirts', label: 'Skirts' },
  { value: 'sarees', label: 'Sarees' },
  { value: 'kurtas', label: 'Kurtas' },
  { value: 'footwear', label: 'Footwear' },
  { value: 'accessories', label: 'Accessories' },
  { value: 'other', label: 'Other' },
];

export default function Wardrobe() {
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadItems = async () => {
    try {
      const res = await wardrobeApi.list({ category: category || undefined, search: search || undefined });
      setItems(res.items || []);
    } catch {
      toast.error('Failed to load wardrobe');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(loadItems, 300);
    return () => clearTimeout(t);
  }, [search, category]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await wardrobeApi.delete(deleteId);
      setItems(items.filter(i => i.id !== deleteId));
      toast.success('Item deleted');
    } catch {
      toast.error('Failed to delete item');
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">My Wardrobe</h1>
          <p className="text-gray-500 mt-1">{items.length} items in your wardrobe</p>
        </div>
        <Link to="/wardrobe/add" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Item
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
          <input className="input-field pl-10" type="search" placeholder="Search clothing..."
            value={search} onChange={e => setSearch(e.target.value)} aria-label="Search wardrobe" />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" aria-hidden="true" />
          <select className="input-field pl-10 pr-8 w-full sm:w-auto min-w-[160px]"
            value={category} onChange={e => setCategory(e.target.value)} aria-label="Filter by category">
            {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
      </div>

      {/* Grid */}
      {loading ? <LoadingSpinner text="Loading wardrobe..." /> : items.length === 0 ? (
        <div className="card text-center py-16">
          <Shirt className="w-16 h-16 text-gray-300 mx-auto mb-4" aria-hidden="true" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            {search || category ? 'No items found' : 'Your wardrobe is empty'}
          </h3>
          <p className="text-gray-500 text-sm mb-6">
            {search || category ? 'Try different filters' : 'Start adding your clothing items to get AI recommendations.'}
          </p>
          {!search && !category && (
            <Link to="/wardrobe/add" className="btn-primary inline-flex gap-2">
              <Plus className="w-4 h-4" /> Add First Item
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {items.map(item => (
            <WardrobeCard key={item.id} item={item} onDelete={() => setDeleteId(item.id)} />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Item"
        message="Are you sure you want to delete this clothing item? This action cannot be undone."
        confirmText="Delete"
        isDestructive
        loading={deleting}
      />
    </div>
  );
}

function WardrobeCard({ item, onDelete }: { item: WardrobeItem; onDelete: () => void }) {
  return (
    <div className="card p-3 group relative overflow-hidden hover:shadow-md transition-all duration-200">
      {item.image_url ? (
        <img src={item.image_url} alt={item.name} className="w-full h-40 object-cover rounded-lg mb-3" loading="lazy" />
      ) : (
        <div className="w-full h-40 bg-gradient-to-br from-primary-50 to-purple-50 rounded-lg mb-3 flex items-center justify-center">
          <Shirt className="w-10 h-10 text-primary-300" aria-hidden="true" />
        </div>
      )}

      {/* Actions overlay */}
      <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={onDelete}
          className="w-7 h-7 bg-red-100 text-red-600 rounded-lg flex items-center justify-center hover:bg-red-200 transition-colors"
          aria-label={`Delete ${item.name}`}>
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
      <p className="text-xs text-gray-500 capitalize mt-0.5">{item.category}</p>
      <div className="flex items-center gap-2 mt-2">
        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full capitalize">{item.color}</span>
        {item.brand && <span className="text-xs text-gray-400 truncate">{item.brand}</span>}
      </div>
    </div>
  );
}

