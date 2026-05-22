import Link from 'next/link';
import { useRouter } from 'next/router';
import { Grid, BookOpen, Clock, Settings, Calendar } from 'lucide-react';

const navItems = [
  { href: '/dashboard',    label: 'Event Types',  icon: Grid },
  { href: '/bookings',     label: 'Bookings',     icon: BookOpen },
  { href: '/availability', label: 'Availability', icon: Clock },
  { href: '/settings',     label: 'Settings',     icon: Settings },
];

export default function Sidebar() {
  const router = useRouter();
  return (
    <aside className="w-56 min-h-screen bg-white border-r border-gray-200 flex flex-col">
      <div className="px-4 py-5 border-b border-gray-100">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center">
            <Calendar className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-gray-900 text-sm">CalClone</span>
        </Link>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = router.pathname === href;
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                active ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}>
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="px-4 py-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-semibold text-indigo-600">A</div>
          <span className="text-sm text-gray-600">Alex Johnson</span>
        </div>
      </div>
    </aside>
  );
}