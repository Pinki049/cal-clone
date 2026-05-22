CalClone — Scheduling Platform (Cal.com Clone)

A functional scheduling/booking web application replicating Cal.com's design and user experience.

Live Demo:
Frontend: https://cal-clone-gamma.vercel.app
Backend: https://cal-clone-y5yg.onrender.com

Tech Stack:
Layer        Technology
Frontend   - Next.js 14, React 18, Tailwind CSS
Backend    - Node.js, Express.js
Database   - PostgreSQL
Hosting    - Vercel (frontend), Render (backend)

Features:
1.Event Types — Create, edit, delete with title, description, duration, slug, color
2.Availability Settings — Set days, time ranges, timezone
3.Public Booking Page — Calendar view, available time slots, booking form
4.Double Booking Prevention — Slot conflict detection on server side
5.Booking Confirmation Page — Full event details shown after booking
6.Bookings Dashboard — View upcoming, past, all bookings with cancel option
7.Responsive design mobile and desktop

Setup Instructions
1. Clone the Repository
git clone https://github.com/Pinki049/cal-clone.git
cd cal-clone

2. Database Setup
createdb calclone
psql -d calclone -f schema.sql

3. Backend Setup
cd backend
npm install
Create a .env file inside backend folder with these values:
PORT=5000
DATABASE_URL=postgresql://postgres:PASSWORD@localhost:5432/calclone
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
Then run:
npm run dev
Server starts at http://localhost:5000

4. Frontend Setup
cd frontend
npm install
Create a .env.local file inside frontend folder with these values:
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_BASE_URL=http://localhost:3000
Then run:
npm run dev
App starts at http://localhost:3000

How to Use
Admin Side no login required
Page
Dashboard       - /dashboard
Availability    - /availability
Bookings        - /bookings
Settings        - /settings

Public Booking Page
Visit http://localhost:3000/alex/30min
Pick a date, pick a time, fill name and email, confirm

Database Schema:

users — id, name, email, username, timezone
event_types — id, user_id, title, description, duration, slug, color
availability — id, user_id, name, timezone, is_default
availability_rules — id, availability_id, day_of_week, start_time, end_time
date_overrides — id, availability_id, date, start_time, end_time, is_blocked
bookings — id, event_type_id, booker_name, booker_email, start_time, end_time, uid, status

Assumptions Made:

1.Single user — Only one default user Alex Johnson is assumed logged in. No authentication implemented as per assignment instructions.
2.Slot generation — Available slots are generated at every duration-minute interval within working hours.
3.No buffer time — Back-to-back bookings are allowed.
4.No email notifications — Booking confirmation is shown on screen only.
5.Timezone — Default timezone is Asia/Kolkata.
6.Seed data — Database is pre-seeded with 4 event types, availability schedule Mon-Fri 9am to 5pm, and 5 sample bookings.

