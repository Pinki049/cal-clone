import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { getBookings, cancelBooking } from '../lib/api';
import toast from 'react-hot-toast';
import { format, isPast } from 'date-fns';
import { Calendar, Clock, User, Mail, XCircle } from 'lucide-react';

export default function Bookings() {
  const [tab, setTab] = useState('upcoming');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchBookings(); }, [tab]);

  async function fetchBookings() {
    setLoading(true);
    try { setBookings(await getBookings(tab)); }
    catch { toast.error('Failed to load bookings'); }
    finally { setLoading(false); }
  }

  async function handleCancel(uid, name) {
    if (!confirm(`Cancel booking with ${name}?`)) return;
    try { await cancelBooking(uid); toast.success('Cancelled'); fetchBookings(); }
    catch { toast.error('Failed to cancel'); }
  }

  return (
    <Layout title="Bookings">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Bookings</h1>
          <p className="text-sm text-gray-500 mt-1">View and manage your scheduled meetings.</p>
        </div>
        <div className="flex gap-1 mb-6 border-b border-gray-200">
          {['upcoming','past','all'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium capitalize border-b-2 -mb-px transition-colors ${tab===t ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {t}
            </button>
          ))}
        </div>
        {loading ? (
          <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="card animate-pulse h-20" />)}</div>
        ) : bookings.length === 0 ? (
          <div className="card text-center py-16">
            <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <h3 className="text-gray-900 font-medium">No {tab} bookings</h3>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map(b => {
              const start = new Date(b.start_time);
              const end = new Date(b.end_time);
              return (
                <div key={b.uid} className="card flex gap-4">
                  <div className="w-1 rounded-full flex-shrink-0" style={{ backgroundColor: b.color || '#6366f1' }} />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <h3 className="font-medium text-gray-900 text-sm">{b.event_title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${b.status==='confirmed' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{b.status}</span>
                    </div>
                    <div className="flex gap-3 mt-1">
                      <span className="text-xs text-gray-500 flex items-center gap-1"><Calendar className="w-3 h-3" />{format(start,'EEE, MMM d, yyyy')}</span>
                      <span className="text-xs text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3" />{format(start,'h:mm a')} – {format(end,'h:mm a')}</span>
                    </div>
                    <div className="flex gap-3 mt-1">
                      <span className="text-xs text-gray-400 flex items-center gap-1"><User className="w-3 h-3" />{b.booker_name}</span>
                      <span className="text-xs text-gray-400 flex items-center gap-1"><Mail className="w-3 h-3" />{b.booker_email}</span>
                    </div>
                  </div>
                  {b.status === 'confirmed' && !isPast(end) && (
                    <button onClick={() => handleCancel(b.uid, b.booker_name)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md self-start">
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}