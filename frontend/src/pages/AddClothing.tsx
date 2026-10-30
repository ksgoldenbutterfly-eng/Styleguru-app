import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { wardrobeApi } from '../services/api';
import { Upload, X, ImageIcon, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const categories = ['tops', 'shirts', 't-shirts', 'trousers', 'jeans', 'dresses', 'skirts', 'sarees', 'kurtas', 'footwear', 'accessories', 'other'];
const occasions = ['college', 'office', 'parties', 'weddings', 'festivals', 'casual', 'interviews', 'other'];
const fashionTypes = ['indian', 'western', 'indo-western', 'casual', 'formal', 'traditional', 'other'];

export default function AddClothing() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', category: '', color: '', brand: '',
    fashion_type: '', description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be smaller than 5MB'); return; }
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const toggleOccasion = (o: string) => {
    setSelectedOccasions(prev => prev.includes(o) ? prev.filter(x => x !== o) : [...prev, o]);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Item name is required';
    if (!form.category) errs.category = 'Category is required';
    if (!form.color.trim()) errs.color = 'Color is required';
    if (selectedOccasions.length === 0) errs.occasion = 'Select at least one occasion';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
      fd.append('occasion', JSON.stringify(selectedOccasions));
      if (imageFile) fd.append('image', imageFile);

      await wardrobeApi.add(fd);
      toast.success('Clothing item added!');
      navigate('/wardrobe');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/wardrobe')} className="p-2 hover:bg-gray-100 rounded-xl transition-colors" aria-label="Go back">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Add Clothing Item</h1>
          <p className="text-gray-500 mt-0.5 text-sm">Add a new item to your digital wardrobe</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-5" noValidate>
        {/* Image Upload */}
        <div>
          <label className="label">Item Image (optional)</label>
          {preview ? (
            <div className="relative inline-block">
              <img src={preview} alt="Preview" className="w-40 h-40 object-cover rounded-xl border-2 border-primary-200" />
              <button type="button" onClick={() => { setPreview(null); setImageFile(null); if (fileRef.current) fileRef.current.value = ''; }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200"
                aria-label="Remove image">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => fileRef.current?.click()}
              className="w-full h-32 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-primary-300 hover:bg-primary-50 transition-all">
              <ImageIcon className="w-8 h-8 text-gray-300" aria-hidden="true" />
              <span className="text-sm text-gray-400">Click to upload image</span>
              <span className="text-xs text-gray-300">JPEG, PNG, WebP up to 5MB</span>
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only" onChange={handleImageChange} />
        </div>

        {/* Name */}
        <div>
          <label className="label" htmlFor="name">Item Name *</label>
          <input id="name" type="text" className="input-field" placeholder="e.g. Blue Denim Jacket"
            value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} aria-invalid={!!errors.name} />
          {errors.name && <p className="error-text">{errors.name}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Category */}
          <div>
            <label className="label" htmlFor="category">Category *</label>
            <select id="category" className="input-field capitalize"
              value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} aria-invalid={!!errors.category}>
              <option value="">Select category</option>
              {categories.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
            </select>
            {errors.category && <p className="error-text">{errors.category}</p>}
          </div>

          {/* Color */}
          <div>
            <label className="label" htmlFor="color">Color *</label>
            <input id="color" type="text" className="input-field" placeholder="e.g. Navy Blue"
              value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} aria-invalid={!!errors.color} />
            {errors.color && <p className="error-text">{errors.color}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Brand */}
          <div>
            <label className="label" htmlFor="brand">Brand (optional)</label>
            <input id="brand" type="text" className="input-field" placeholder="e.g. Zara, H&M"
              value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} />
          </div>

          {/* Fashion Type */}
          <div>
            <label className="label" htmlFor="fashion_type">Fashion Type (optional)</label>
            <select id="fashion_type" className="input-field"
              value={form.fashion_type} onChange={e => setForm(f => ({ ...f, fashion_type: e.target.value }))}>
              <option value="">Select type</option>
              {fashionTypes.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
            </select>
          </div>
        </div>

        {/* Occasions */}
        <div>
          <label className="label">Occasions * <span className="text-gray-400 font-normal">(select all that apply)</span></label>
          <div className="flex flex-wrap gap-2">
            {occasions.map(o => (
              <button key={o} type="button" onClick={() => toggleOccasion(o)}
                className={clsx('px-3 py-1.5 rounded-full text-sm font-medium border transition-all capitalize',
                  selectedOccasions.includes(o)
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'
                )}>
                {o}
              </button>
            ))}
          </div>
          {errors.occasion && <p className="error-text">{errors.occasion}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="label" htmlFor="description">Description (optional)</label>
          <textarea id="description" className="input-field h-20 resize-none" placeholder="Add notes about this item..."
            value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => navigate('/wardrobe')} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
            <Upload className="w-4 h-4" />
            {loading ? 'Adding...' : 'Add to Wardrobe'}
          </button>
        </div>
      </form>
    </div>
  );
}

