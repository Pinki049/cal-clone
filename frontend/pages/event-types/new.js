import { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import { createEventType } from '../../lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const COLORS = ['#0ea5e9','#8b5cf6','#10b981','#f59e0b','#ef4444','#6366f1'];
const DURATIONS = [15, 30, 45, 60, 90, 120];

export default function NewEventType() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', duration: 30, slug: '', color: '#0ea5e9' });

  function handleTitle(e) {
    const title = e.target.value;
    const slug = title.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'');
    setForm(f => ({ ...f, title, slug }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await createEventType(form);
      toast.success('Created!');
      router.push('/dashboard');
    } catch(err) {
      toast.error(err.response?.data?.error || 'Failed to create');
    } finally { setSaving(false); }
  }

  return (
    <Layout title="New Event Type">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/dashboard" className="text-gray-500 hover:text-gray-700"><ArrowLeft className="w-5 h-5" /></Link>
          <h1 className="text-2xl font-semibold text-gray-900">New Event Type</h1>
        </div>
        <form onSubmit={handleSubmit} className="card space-y-5">
          <div>
            <label className="label">Title *</label>
            <input className="input" placeholder="30 Minute Meeting" value={form.title} onChange={handleTitle} required />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input min-h-[80px] resize-none" value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} />
          </div>
          <div>
            <label className="label">Duration</label>
            <div className="grid grid-cols-3 gap-2">
              {DURATIONS.map(d => (
                <button key={d} type="button" onClick={() => setForm(f => ({...f, duration: d}))}
                  className={`py-2 rounded-md text-sm border transition-colors ${form.duration===d ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
                  {d} min
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">URL Slug *</label>
            <div className="flex items-center border border-gray-300 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-gray-900">
              <span className="bg-gray-50 px-3 py-2 text-sm text-gray-500 border-r border-gray-300">calclone.com/alex/</span>
              <input className="flex-1 px-3 py-2 text-sm outline-none" value={form.slug}
                onChange={e => setForm(f => ({...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,'')}))} required />
            </div>
          </div>
          <div>
            <label className="label">Color</label>
            <div className="flex gap-2">
              {COLORS.map(c => (
                <button key={c} type="button" onClick={() => setForm(f => ({...f, color: c}))}
                  className={`w-7 h-7 rounded-full transition-all ${form.color===c ? 'ring-2 ring-offset-2 ring-gray-900 scale-110' : ''}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Creating...' : 'Create Event Type'}</button>
            <Link href="/dashboard" className="btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </Layout>
  );
}