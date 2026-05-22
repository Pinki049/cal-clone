import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { getPublicEvent, getAvailableSlots, createBooking } from '../../lib/api';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isPast, startOfDay } from 'date-fns';
import toast from 'react-hot-toast';
import { ChevronLeft, ChevronRight, Clock, Globe, Calendar, CheckCircle, ArrowLeft } from 'lucide-react';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function BookingPage() {
  const router = useRouter();
  const { username, slug } = router.query;

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [step, setStep] = useState('calendar');
  const [form, setForm] = useState({ name: '', email: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  useEffect(() => {
    if (!username || !slug) return;
    getPublicEvent(username, slug)
      .then(data => { setEvent(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [username, slug]);

  useEffect(() => {
    if (!selectedDate || !username || !slug) return;
    setSlotsLoading(true);
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    getAvailableSlots(username, slug, dateStr)
      .then(data => setSlots(data.slots || []))
      .catch(() => { setSlots([]); toast.error('Failed to load slots'); })
      .finally(() => setSlotsLoading(false));
  }, [selectedDate, username, slug]);

  async function handleBook(e) {
    e.preventDefault();
    if (!form.name || !form.email) return toast.error('Name and email required');
    setSubmitting(true);
    try {
      const result = await createBooking(username, slug, {
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: selectedTime,
        name: form.name,
        email: form.email,
        notes: form.notes,
      });
      setConfirmedBooking(result);
      setStep('confirmed');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Booking failed');
    } finally { setSubmitting(false); }
  }

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const firstDayOfWeek = monthStart.getDay();

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
    </div>
  );

  if (!event) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Event not found</h1>
        <p className="text-gray-500 text-sm">This booking link does not exist or has been deactivated.</p>
      </div>
    </div>
  );

  // ── Confirmed screen ─────────────────────────────
  if (step === 'confirmed' && confirmedBooking) {
    const start = new Date(confirmedBooking.booking.start_time);
    const end = new Date(confirmedBooking.booking.end_time);
    return (
      <>
        <Head><title>Booking Confirmed</title></Head>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 max-w-md w-full text-center shadow-sm">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">You're scheduled!</h1>
            <p className="text-gray-500 text-sm mb-6">A confirmation has been sent to your email.</p>
            <div className="bg-gray-50 rounded-xl p-4 text-left space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <div className="text-xs text-gray-500">What</div>
                  <div className="text-sm font-medium text-gray-900">{event.title} with {event.host_name}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-gray-400" />
                <div>
                  <div className="text-xs text-gray-500">When</div>
                  <div className="text-sm font-medium text-gray-900">{format(start, 'EEEE, MMMM d, yyyy')}</div>
                  <div className="text-sm text-gray-600">{format(start, 'h:mm a')} – {format(end, 'h:mm a')}</div>
                </div>
              </div>
            </div>
            <button onClick={() => { setStep('calendar'); setSelectedDate(null); setSelectedTime(null); setConfirmedBooking(null); }}
              className="mt-6 text-sm text-gray-500 hover:text-gray-700">
              Book another meeting
            </button>
          </div>
        </div>
      </>
    );
  }

  // ── Booking form screen ───────────────────────────
  if (step === 'form') {
    return (
      <>
        <Head><title>Book {event.title}</title></Head>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm max-w-2xl w-full overflow-hidden flex flex-col md:flex-row">
            <div className="md:w-64 p-6 border-b md:border-b-0 md:border-r border-gray-100">
              <button onClick={() => setStep('calendar')} className="text-gray-400 hover:text-gray-600 mb-4 flex items-center gap-1 text-sm">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <div className="w-3 h-3 rounded-full mb-3" style={{ backgroundColor: event.color }} />
              <p className="text-sm text-gray-500 mb-0.5">{event.host_name}</p>
              <h1 className="text-lg font-semibold text-gray-900 mb-4">{event.title}</h1>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" /> {event.duration} minutes
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  {format(selectedDate, 'EEE, MMM d')} at {selectedTime}
                </div>
              </div>
            </div>
            <form onSubmit={handleBook} className="flex-1 p-6 space-y-4">
              <h2 className="text-base font-medium text-gray-900">Your details</h2>
              <div>
                <label className="label">Your Name *</label>
                <input className="input" placeholder="John Doe" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div>
                <label className="label">Email Address *</label>
                <input className="input" type="email" placeholder="you@example.com" value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
              </div>
              <div>
                <label className="label">Notes</label>
                <textarea className="input min-h-[80px] resize-none" placeholder="Anything you'd like to share..."
                  value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
              <button type="submit" className="btn-primary w-full" disabled={submitting}>
                {submitting ? 'Booking...' : 'Confirm Booking'}
              </button>
            </form>
          </div>
        </div>
      </>
    );
  }

  // ── Calendar screen ───────────────────────────────
  return (
    <>
      <Head><title>Book {event.title} | {event.host_name}</title></Head>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm max-w-5xl w-full overflow-hidden">
          <div className="flex flex-col md:flex-row">

            {/* Left - event info */}
            <div className="md:w-72 p-8 border-b md:border-b-0 md:border-r border-gray-100">
              <div className="w-10 h-10 rounded-full mb-4 flex items-center justify-center text-white font-semibold"
                style={{ backgroundColor: event.color }}>
                {event.host_name?.[0]?.toUpperCase()}
              </div>
              <p className="text-sm text-gray-500 mb-1">{event.host_name}</p>
              <h1 className="text-xl font-semibold text-gray-900 mb-4">{event.title}</h1>
              {event.description && <p className="text-sm text-gray-600 mb-4">{event.description}</p>}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" /> {event.duration} minutes
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Globe className="w-4 h-4" /> {event.host_timezone}
                </div>
              </div>
            </div>

            {/* Middle - calendar */}
            <div className="flex-1 p-8 border-b md:border-b-0 md:border-r border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-base font-medium text-gray-900">{format(currentMonth, 'MMMM yyyy')}</h2>
                <div className="flex gap-1">
                  <button onClick={() => setCurrentMonth(prev => subMonths(prev, 1))} className="p-1.5 rounded-md hover:bg-gray-100">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button onClick={() => setCurrentMonth(prev => addMonths(prev, 1))} className="p-1.5 rounded-md hover:bg-gray-100">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 mb-2">
                {WEEKDAYS.map(d => <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>)}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {Array(firstDayOfWeek).fill(null).map((_, i) => <div key={`e-${i}`} />)}
                {calDays.map(day => {
                  const past = isPast(startOfDay(day)) && !isToday(day);
                  const selected = selectedDate && isSameDay(day, selectedDate);
                  const today = isToday(day);
                  return (
                    <button key={day.toISOString()} onClick={() => !past && (setSelectedDate(day), setSelectedTime(null), setSlots([]))}
                      disabled={past}
                      className={`w-full aspect-square rounded-full text-sm flex items-center justify-center transition-colors
                        ${past ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100 cursor-pointer'}
                        ${selected ? 'bg-gray-900 text-white hover:bg-gray-800' : ''}
                        ${today && !selected ? 'font-bold text-gray-900' : ''}
                        ${!selected && !past ? 'text-gray-700' : ''}
                      `}>
                      {format(day, 'd')}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right - time slots */}
            {selectedDate && (
              <div className="md:w-56 p-6">
                <h3 className="text-sm font-medium text-gray-900 mb-1">{format(selectedDate, 'EEE, MMM d')}</h3>
                <p className="text-xs text-gray-500 mb-4">Select a time</p>
                {slotsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900" />
                  </div>
                ) : slots.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sm text-gray-500">No slots available</p>
                    <p className="text-xs text-gray-400 mt-1">Try another day</p>
                  </div>
                ) : (
                  <div className="space-y-2 overflow-y-auto max-h-80">
                    {slots.map(slot => (
                      <button key={slot} onClick={() => { setSelectedTime(slot); setStep('form'); }}
                        className="w-full py-2.5 rounded-md text-sm border border-gray-300 text-gray-700 hover:border-gray-900 hover:text-gray-900 transition-all font-medium">
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}