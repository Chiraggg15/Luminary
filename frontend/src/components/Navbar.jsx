import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, FileText, PenTool, MessageSquare } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location  = useLocation();

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <nav className="sticky top-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 px-4 py-4 flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
      <div className="flex items-center gap-8 w-full sm:w-auto justify-between sm:justify-start">
        {/* ── Logo ─────────────────────────────────────────────────────── */}
        <Link to="/dashboard" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded bg-emerald-500 flex items-center justify-center text-zinc-950 font-bold text-lg">
            L
          </div>
          <span className="font-bold tracking-tight text-white hidden md:block">
            Luminary
          </span>
        </Link>

        {/* ── Navigation Links ──────────────────────────────────────────── */}
        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            to="/dashboard"
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive('/dashboard') 
                ? 'text-white bg-zinc-800/50' 
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/30'
            }`}
          >
            <LayoutDashboard size={16} />
            <span className="hidden lg:inline-block">Dashboard</span>
          </Link>
          <Link
            to="/resume/new"
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive('/resume') 
                ? 'text-white bg-zinc-800/50' 
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/30'
            }`}
          >
            <FileText size={16} />
            <span className="hidden lg:inline-block">Builder</span>
          </Link>
          <Link
            to="/cover-letter"
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive('/cover-letter') 
                ? 'text-white bg-zinc-800/50' 
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/30'
            }`}
          >
            <PenTool size={16} />
            <span className="hidden lg:inline-block">Cover Letter</span>
          </Link>
          <Link
            to="/mock-interview"
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive('/mock-interview') 
                ? 'text-white bg-zinc-800/50' 
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/30'
            }`}
          >
            <MessageSquare size={16} />
            <span className="hidden lg:inline-block">Interview Prep</span>
          </Link>
        </div>
      </div>

      {/* ── User + Logout ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-zinc-400 hidden sm:block">
          {user?.full_name?.split(' ')[0] || 'User'}
        </span>
        <button 
          className="text-sm font-medium px-4 py-2 border border-zinc-700 hover:border-zinc-500 rounded-lg text-zinc-300 transition-colors"
          onClick={logout}
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}
