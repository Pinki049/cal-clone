import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

export const getEventTypes = () => api.get('/event-types').then(r => r.data);
export const getEventType = (id) => api.get(`/event-types/${id}`).then(r => r.data);
export const createEventType = (data) => api.post('/event-types', data).then(r => r.data);
export const updateEventType = (id, data) => api.put(`/event-types/${id}`, data).then(r => r.data);
export const deleteEventType = (id) => api.delete(`/event-types/${id}`).then(r => r.data);

export const getAvailability = () => api.get('/availability').then(r => r.data);
export const updateAvailability = (data) => api.put('/availability', data).then(r => r.data);

export const getBookings = (filter = 'upcoming') => api.get(`/bookings?filter=${filter}`).then(r => r.data);
export const getBooking = (uid) => api.get(`/bookings/${uid}`).then(r => r.data);
export const cancelBooking = (uid, reason) => api.delete(`/bookings/${uid}`, { data: { reason } }).then(r => r.data);

export const getPublicEvent = (username, slug) => api.get(`/public/${username}/${slug}`).then(r => r.data);
export const getAvailableSlots = (username, slug, date) => api.get(`/public/${username}/${slug}/slots?date=${date}`).then(r => r.data);
export const createBooking = (username, slug, data) => api.post(`/public/${username}/${slug}/book`, data).then(r => r.data);

export const getMe = () => api.get('/users/me').then(r => r.data);
export const updateMe = (data) => api.put('/users/me', data).then(r => r.data);

export default api;  