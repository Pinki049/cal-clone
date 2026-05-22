import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Link from 'next/link';
import { getEventTypes, deleteEventType } from '../lib/api';
import toast from 'react-hot-toast';
import { Plus, Clock, Copy, ExternalLink, Edit2, Trash2 } from 'lucide-react';

const COLORS = {
  '#0ea5e9': 'bg-sky-500', '#8b5cf6': 'bg-violet-500',
  '#10b981': 'bg-emerald-500', '#f59e0b': 'bg-amber-500',
  '#ef4444': 'bg-red-500', '#6366f1': 'bg-indigo-500',
};

export default function Dashboard() {
  const [eventTypes, setEventTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchEventTypes(); }, []); 

  async function fetchEventTypes() {
    try {
      const data = await getEventTypes();
      setEventTypes(data);
    } catch { toast.error('Failed to load event types'); }
    finally { setLoading(false); }
  }

  async function handleDelete(id, title) {
    if (!confirm(`Delete "${title}"?`)) return;
    try {
      await deleteEventType(id);
      setEventTypes(prev => prev.filter(e => e.id !== id));
      toast.success('Deleted!');
    } catch { toast.error('Failed to delete'); }
  }

  function copyLink(slug) {
    navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_BASE_URL}/alex/${slug}`);
    toast.success('Link copied!');
  }

  return (
    <Layout title="Event Types">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Event Types</h1>
            <p className="text-sm text-gray-500 mt-1">Create events to share and let people book time with you.</p>
          </div>
          <Link href="/event-types/new" className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Event Type
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="card animate-pulse h-16" />)}
          </div>
        ) : eventTypes.length === 0 ? (
          <div className="card text-center py-16">
            <h3 className="font-medium text-gray-900 mb-2">No event types yet</h3>
            <Link href="/event-types/new" className="btn-primary inline-flex items-center gap-2">
              <Plus className="w-4 h-4" /> Create Event Type
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {eventTypes.map(event => (
              <div key={event.id} className="card flex items-center gap-4">
                <div className={`w-2 h-10 rounded-full ${COLORS[event.color] || 'bg-gray-400'}`} />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 text-sm">{event.title}</h3>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {event.duration} min
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => copyLink(event.slug)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"><Copy className="w-4 h-4" /></button>
                  <a href={`/alex/${event.slug}`} target="_blank" rel="noreferrer" className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"><ExternalLink className="w-4 h-4" /></a>
                  <Link href={`/event-types/${event.id}/edit`} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md"><Edit2 className="w-4 h-4" /></Link>
                  <button onClick={() => handleDelete(event.id, event.title)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}