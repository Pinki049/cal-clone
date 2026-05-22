import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { getMe, updateMe } from '../lib/api';
import toast from 'react-hot-toast';

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', email: '' });

  useEffect(() => {
    getMe().then(data => { setForm(data); setLoading(false); })
      .catch(() => { toast.error('Failed to load'); setLoading(false); });
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try { await updateMe(form); toast.success('Profile updated!'); }
    catch { toast.error('Failed to update'); }
    finally { setSaving(false); }
  }

  if (loading) return <Layout title="Settings"><div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" /></div></Layout>;

  return (
    <Layout title="Settings">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
        </div>
        <form onSubmit={handleSave} className="card space-y-5">
          <div>
            <label className="label">Full Name</label>
            <input className="input" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} />
          </div>
          <div className="flex justify-end">
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </form>
      </div>
    </Layout>
  );
}