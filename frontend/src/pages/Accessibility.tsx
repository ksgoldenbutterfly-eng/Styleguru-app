import { useState, useEffect } from 'react';
import { profileApi } from '../services/api';
import { AccessibilityPreferences } from '../types';
import { Save, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const comfortLevels = ['Very loose fitting', 'Loose fitting', 'Regular fit', 'Slim fit', 'Any'];
const sensoryOptions = ['Avoid scratchy fabrics', 'Prefer soft fabrics (cotton, bamboo)', 'Avoid tight waistbands', 'Prefer seamless clothing', 'Avoid heavy fabrics'];
const mobilityOptions = ['Easy to put on/take off', 'Avoid buttons (prefer velcro/elastic)', 'Prefer adaptive clothing features', 'Seated wear considerations', 'Prefer stretchy fabrics'];
const visualOptions = ['High contrast colors', 'Avoid busy patterns', 'Easy-to-feel texture cues', 'Bold and simple designs'];

function MultiSelectGroup({ label, options, values, onChange }: {
  label: string; options: string[]; values: string[]; onChange: (v: string[]) => void;
}) {
  const toggle = (opt: string) =>
    onChange(values.includes(opt) ? values.filter(v => v !== opt) : [...values, opt]);

  return (
    <div>
      <label className="label">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <button key={opt} type="button" onClick={() => toggle(opt)}
            className={clsx('px-3 py-2 rounded-xl text-sm border transition-all text-left',
              values.includes(opt)
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'
            )}>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Accessibility() {
  const [prefs, setPrefs] = useState<AccessibilityPreferences>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    profileApi.get()
      .then(r => setPrefs(r.profile.accessibility_preferences || {}))
      .catch(() => toast.error('Failed to load preferences'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await profileApi.update({ accessibility_preferences: prefs } as Parameters<typeof profileApi.update>[0]);
      toast.success('Accessibility preferences saved!');
    } catch {
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center mt-16"><div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900">Accessibility Preferences</h1>
        <p className="text-gray-500 mt-1">Personalize recommendations for comfort and accessibility</p>
      </div>

      {/* Notice */}
      <div className="flex gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
        <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <div className="text-sm text-blue-700">
          <p className="font-medium mb-1">Your privacy matters</p>
          <p className="text-blue-600">All accessibility preferences are completely optional. Share only what you're comfortable with. This information helps us provide better clothing recommendations for you.</p>
        </div>
      </div>

      <div className="card space-y-6">
        {/* Comfort Level */}
        <div>
          <label className="label" htmlFor="comfort">Preferred Clothing Fit</label>
          <select id="comfort" className="input-field"
            value={prefs.comfort_level || ''}
            onChange={e => setPrefs(p => ({ ...p, comfort_level: e.target.value }))}>
            <option value="">Not specified</option>
            {comfortLevels.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <MultiSelectGroup
          label="Sensory Preferences"
          options={sensoryOptions}
          values={prefs.sensory_preferences || []}
          onChange={v => setPrefs(p => ({ ...p, sensory_preferences: v }))}
        />

        <MultiSelectGroup
          label="Mobility-Related Preferences"
          options={mobilityOptions}
          values={prefs.mobility_preferences || []}
          onChange={v => setPrefs(p => ({ ...p, mobility_preferences: v }))}
        />

        <MultiSelectGroup
          label="Visual Accessibility Preferences"
          options={visualOptions}
          values={prefs.visual_preferences || []}
          onChange={v => setPrefs(p => ({ ...p, visual_preferences: v }))}
        />

        {/* Notes */}
        <div>
          <label className="label" htmlFor="a11y-notes">Additional Notes (optional)</label>
          <textarea id="a11y-notes" className="input-field h-24 resize-none"
            placeholder="Any other preferences or considerations you'd like to share..."
            value={prefs.notes || ''}
            onChange={e => setPrefs(p => ({ ...p, notes: e.target.value }))} />
        </div>

        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </div>
  );
}

