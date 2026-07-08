import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  LayoutDashboard, FileText, PenTool, MessageSquare,
  Settings, Briefcase, DollarSign, Target, Sun, Moon
} from 'lucide-react';
import NotificationBell from './NotificationBell';
import { resumeAPI, jobAPI } from '../services/api';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const location = useLocation();
  const [resumes, setResumes] = useState([]);
  const [jobs,    setJobs]    = useState([]);

  // Load data for notification bell silently
  useEffect(() => {
    resumeAPI.getAll().then(r => setResumes(r.data.resumes || [])).catch(() => {});
    jobAPI.getAll().then(r => setJobs(r.data.jobs || [])).catch(() => {});
  }, [location.pathname]); // refresh on navigation

  const isActive = (path) => location.pathname.startsWith(path);

  const navLinks = [
    { to: '/dashboard',      icon: LayoutDashboard, label: 'Dashboard'    },
    { to: '/resume/new',     icon: FileText,        label: 'Builder'      },
    { to: '/cover-letter',   icon: PenTool,         label: 'Cover Letter' },
    { to: '/mock-interview', icon: MessageSquare,   label: 'Interview'    },
    { to: '/job-tracker',    icon: Briefcase,       label: 'Jobs'         },
    { to: '/salary',         icon: DollarSign,      label: 'Salary'       },
    { to: '/skill-gap',      icon: Target,          label: 'Skill Gap'    },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800 px-4 py-3 flex justify-between items-center mb-8 gap-4">
      {/* Logo + Nav links */}
      <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
        <Link to="/dashboard" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded bg-emerald-500 flex items-center justify-center text-zinc-950 font-bold text-lg">L</div>
          <span className="font-bold tracking-tight text-white hidden md:block">Luminary</span>
        </Link>

        <div className="flex items-center gap-0.5">
          {navLinks.map(({ to, icon: Icon, label }) => (
            <Link key={to} to={to}
              className={`flex items-center gap-1.5 px-2.5 py-2 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                isActive(to) ? 'text-white bg-zinc-800/70' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/40'
              }`}>
              <Icon size={14} />
              <span className="hidden lg:inline">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Right: notifications + theme + user */}
      <div className="flex items-center gap-2 shrink-0">
        <NotificationBell resumes={resumes} jobs={jobs} />

        {/* Theme toggle */}
        <button onClick={toggle}
          className="p-2 rounded-lg border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <span className="text-sm font-medium text-zinc-400 hidden sm:block">
          {user?.full_name?.split(' ')[0] || 'User'}
        </span>

        <Link to="/settings"
          className={`p-2 rounded-lg border transition-colors ${isActive('/settings') ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400' : 'border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500'}`}
          title="Settings">
          <Settings size={16} />
        </Link>

        <button
          className="text-xs font-medium px-3 py-2 border border-zinc-700 hover:border-zinc-500 rounded-lg text-zinc-300 transition-colors"
          onClick={logout}>
          Sign out
        </button>
      </div>
    </nav>
  );
}
