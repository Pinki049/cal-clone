import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { getAvailability, updateAvailability } from '../lib/api';
import toast from 'react-hot-toast';

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const TIME_OPTIONS = [];
for (let h = 0; h < 24; h++) {
  for (let m = 0; m < 60; m += 30) {
    TIME_OPTIONS.push(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`);
  }
}

export default function Availability() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [rules, setRules] = useState(
    DAYS.map((_, i) => ({ day_of_week: i, is_available: i >= 1 && i <= 5, start_time: '09:00', end_time: '17:00' }))
  );

  useEffect(() => {
    getAvailability().then(data => {
      setTimezone(data.timezone);
      if (data.rules?.length) {
        setRules(DAYS.map((_, i) => {
          const found = data.rules.find(r => r.day_of_week === i);
          return found ? { ...found, start_time: found.start_time?.slice(0,5), end_time: found.end_time?.slice(0,5) }
            : { day_of_week: i, is_available: false, start_time: '09:00', end_time: '17:00' };
        }));
      }
    }).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      await updateAvailability({ timezone, rules });
      toast.success('Availability saved!');
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  }

  if (loading) return <Layout title="Availability"><div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" /></div></Layout>;

  return (
    <Layout title="Availability">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Availability</h1>
          <p className="text-sm text-gray-500 mt-1">Set when you are available for meetings.</p>
        </div>
        <div className="card space-y-6">
          <div>
            <label className="label">Timezone</label>
            <select className="input" value={timezone} onChange={e => setTimezone(e.target.value)}>
              {['Asia/Kolkata','America/New_York','America/Los_Angeles','Europe/London','Asia/Tokyo'].map(tz =>
                <option key={tz} value={tz}>{tz}</option>
              )}
            </select>
          </div>
          <hr />
          <div className="space-y-3">
            {rules.map((rule, i) => (
              <div key={i} className="flex items-center gap-4">
                <button type="button" onClick={() => setRules(prev => prev.map((r,idx) => idx===i ? {...r, is_available: !r.is_available} : r))}
                  className={`relative w-10 h-5 rounded-full transition-colors ${rule.is_available ? 'bg-gray-900' : 'bg-gray-200'}`}>
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${rule.is_available ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
                <span className={`w-24 text-sm ${rule.is_available ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>{DAYS[i]}</span>
                {rule.is_available ? (
                  <div className="flex items-center gap-2">
                    <select className="border border-gray-300 rounded px-2 py-1 text-sm" value={rule.start_time}
                      onChange={e => setRules(prev => prev.map((r,idx) => idx===i ? {...r, start_time: e.target.value} : r))}>
                      {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <span className="text-gray-400">–</span>
                    <select className="border border-gray-300 rounded px-2 py-1 text-sm" value={rule.end_time}
                      onChange={e => setRules(prev => prev.map((r,idx) => idx===i ? {...r, end_time: e.target.value} : r))}>
                      {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                ) : <span className="text-sm text-gray-400">Unavailable</span>}
              </div>
            ))}
          </div>
          <div className="flex justify-end">
            <button onClick={handleSave} className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Availability'}</button>
          </div>
        </div>
      </div>
    </Layout>
  );
}