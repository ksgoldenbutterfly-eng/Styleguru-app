import { useState, useRef } from 'react';
import { analysisApi } from '../services/api';
import { OutfitAnalysis } from '../types';
import { Camera, Upload, X, Star, Lightbulb } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

function RatingBar({ rating }: { rating: number }) {
  const pct = (rating / 10) * 100;
  const color = rating >= 8 ? 'bg-green-500' : rating >= 6 ? 'bg-yellow-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-3 ${color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex items-center gap-1">
        <Star className="w-4 h-4 text-yellow-500 fill-current" aria-hidden="true" />
        <span className="font-bold text-gray-900">{rating}/10</span>
      </div>
    </div>
  );
}

export default function OutfitAnalyzer() {
  const [preview, setPreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [notes, setNotes] = useState('');
  const [analysis, setAnalysis] = useState<OutfitAnalysis | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
    setAnalysis(null);
  };

  const handleAnalyze = async () => {
    if (!imageFile) { toast.error('Please upload an outfit image'); return; }
    setLoading(true);
    try {
      const res = await analysisApi.analyze(imageFile, notes || undefined);
      setAnalysis(res.analysis);
      setImageUrl(res.image_url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    setPreview(null); setImageFile(null); setAnalysis(null); setImageUrl(null); setNotes('');
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900">Outfit Analyzer</h1>
        <p className="text-gray-500 mt-1">Upload an outfit photo and get AI-powered style feedback</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <div className="space-y-4">
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-4">Upload Outfit Image</h2>

            {preview ? (
              <div className="relative">
                <img src={preview} alt="Outfit preview" className="w-full max-h-80 object-contain rounded-xl border border-gray-100" />
                <button onClick={resetAll}
                  className="absolute top-2 right-2 w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors"
                  aria-label="Remove image">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button onClick={() => fileRef.current?.click()}
                className="w-full h-52 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-primary-300 hover:bg-primary-50 transition-all">
                <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center">
                  <Camera className="w-7 h-7 text-primary-600" aria-hidden="true" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-700">Upload outfit photo</p>
                  <p className="text-xs text-gray-400 mt-1">JPEG, PNG, WebP up to 5MB</p>
                </div>
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp"
              className="sr-only" onChange={handleImageChange} />

            <div className="mt-4">
              <label className="label" htmlFor="notes">Additional Notes <span className="text-gray-400 font-normal">(optional)</span></label>
              <textarea id="notes" className="input-field h-20 resize-none text-sm"
                placeholder="Any context about the outfit, occasion, or what feedback you want..."
                value={notes} onChange={e => setNotes(e.target.value)} />
            </div>

            <button onClick={handleAnalyze} disabled={!imageFile || loading}
              className="btn-primary w-full mt-4 flex items-center justify-center gap-2">
              <Upload className="w-4 h-4" />
              {loading ? 'Analyzing...' : 'Analyze Outfit'}
            </button>
          </div>
        </div>

        {/* Results Section */}
        <div>
          {loading ? (
            <div className="card">
              <LoadingSpinner text="StyleGuru AI is analyzing your outfit..." />
            </div>
          ) : analysis ? (
            <div className="space-y-4 animate-slide-up">
              {/* Rating */}
              <div className="card">
                <h2 className="font-semibold text-gray-900 mb-3">Style Rating</h2>
                <RatingBar rating={analysis.rating} />
              </div>

              {/* Overall Feedback */}
              <div className="card">
                <h3 className="font-semibold text-gray-900 mb-2">Overall Feedback</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{analysis.overall_feedback}</p>
              </div>

              {/* Details */}
              <div className="card grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Style</p>
                  <p className="text-sm font-semibold text-gray-900">{analysis.style}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Colors</p>
                  <p className="text-sm font-semibold text-gray-900">{analysis.color_combination}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Occasion</p>
                  <p className="text-sm font-semibold text-gray-900">{analysis.occasion}</p>
                </div>
              </div>

              {/* Suggestions */}
              {analysis.suggestions?.length > 0 && (
                <div className="card">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-yellow-500" aria-hidden="true" />
                    Style Suggestions
                  </h3>
                  <ul className="space-y-2">
                    {analysis.suggestions.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="w-5 h-5 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button onClick={resetAll} className="btn-secondary w-full">
                Analyze Another Outfit
              </button>
            </div>
          ) : (
            <div className="card text-center py-16">
              <Camera className="w-16 h-16 text-gray-200 mx-auto mb-4" aria-hidden="true" />
              <h3 className="text-lg font-semibold text-gray-500 mb-2">Upload & Analyze</h3>
              <p className="text-gray-400 text-sm">Upload an outfit photo to get instant AI style feedback</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

