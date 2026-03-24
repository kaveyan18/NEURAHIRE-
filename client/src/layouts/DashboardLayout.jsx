import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { BellIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import Logo from '../components/Logo';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/result': 'Resume Analysis',
  '/analysis': 'Resume Analysis',
  '/keywords': 'Keyword Gaps',
  '/settings': 'Settings',
};

export default function DashboardLayout() {
  const { pathname } = useLocation();
  const title = pageTitles[pathname] || 'Dashboard';

  return (
    <div className="min-h-screen bg-[#050a12] flex">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[20%] w-[400px] h-[400px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent)', filter: 'blur(80px)' }} />
        <div className="absolute bottom-[10%] right-[5%] w-[300px] h-[300px] rounded-full opacity-8"
          style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)', filter: 'blur(60px)' }} />
      </div>

      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 ml-[200px] flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 glass-card border-b border-white/5 px-8 py-4 flex items-center justify-between">
          <h2 className="text-white font-semibold text-base">{title}</h2>
          <div className="flex items-center gap-3">
            <button className="relative text-slate-400 hover:text-white transition-colors" aria-label="Notifications">
              <BellIcon className="w-5 h-5" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-indigo-400" />
            </button>
            <button className="text-slate-400 hover:text-white transition-colors" aria-label="Profile">
              <UserCircleIcon className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 px-8 py-8 relative z-10">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="border-t border-white/5 px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <Logo textSize="text-base" />
            <p className="text-slate-600 text-xs">© 2026 NeuraHire AI. All rights reserved.</p>
          </div>
          <nav className="flex gap-5">
            {['Privacy Policy', 'Terms of Service', 'API Access', 'Contact Support'].map((l) => (
              <a key={l} href="#" className="text-slate-600 hover:text-slate-400 text-xs transition-colors">{l}</a>
            ))}
          </nav>
        </footer>
      </div>
    </div>
  );
}
