import { Link } from 'react-router-dom';
import { Sparkles, FileText, MessageSquare, ArrowRight, Layout, LayoutTemplate } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-zinc-950 font-sans selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-500 p-2 rounded-lg">
              <Sparkles className="w-5 h-5 text-zinc-950" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">AI Resume Builder</span>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <Link
                to="/dashboard"
                className="text-sm font-medium text-zinc-300 hover:text-white transition-colors"
                aria-label="Dashboard"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-zinc-300 hover:text-white transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium bg-white text-zinc-950 rounded-full hover:bg-zinc-200 transition-colors shadow-lg shadow-white/10"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_center,rgba(16,185,129,0.1),transparent_50%)]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-zinc-500 tracking-tight mb-6">
            Land Your Dream Job <br className="hidden md:block" />
            with AI-Powered Precision.
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10">
            Create professional, ATS-friendly resumes and tailored cover letters in seconds. Practice with AI mock interviews and stay ahead of the curve.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={user ? "/dashboard" : "/register"}
              className="group flex items-center gap-2 px-8 py-4 bg-emerald-500 text-zinc-950 font-bold rounded-full hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 w-full sm:w-auto justify-center"
            >
              Start Building Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#features"
              className="px-8 py-4 text-zinc-300 font-medium hover:text-white transition-colors w-full sm:w-auto text-center"
            >
              See How It Works
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-zinc-900/50 border-y border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Everything You Need to Get Hired</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">We use advanced AI to help you build the perfect application from start to finish.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-zinc-950 border border-zinc-800 p-8 rounded-2xl hover:border-emerald-500/30 transition-colors group">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <LayoutTemplate className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">AI Resume Builder</h3>
              <p className="text-zinc-400 leading-relaxed">
                Generate tailored, ATS-optimized resumes based on your skills and experience. Choose from elegant, professional templates.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-zinc-950 border border-zinc-800 p-8 rounded-2xl hover:border-emerald-500/30 transition-colors group">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Cover Letter Generator</h3>
              <p className="text-zinc-400 leading-relaxed">
                Craft compelling cover letters that match the job description perfectly. Never write a cover letter from scratch again.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-zinc-950 border border-zinc-800 p-8 rounded-2xl hover:border-emerald-500/30 transition-colors group">
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Mock Interviews</h3>
              <p className="text-zinc-400 leading-relaxed">
                Practice your interviewing skills with our AI. Get instant feedback on your answers and body language insights.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works simple text */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-16">Three Steps to Success</h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 text-zinc-300">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center text-2xl font-bold text-white mb-4">1</div>
              <h4 className="text-lg font-semibold text-white mb-2">Create Profile</h4>
              <p className="text-sm text-zinc-500 text-center max-w-[200px]">Enter your basic info, experiences & skills.</p>
            </div>
            <div className="hidden md:block w-16 h-[2px] bg-zinc-800"></div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-2xl font-bold text-emerald-400 mb-4">2</div>
              <h4 className="text-lg font-semibold text-white mb-2">AI Magic</h4>
              <p className="text-sm text-zinc-500 text-center max-w-[200px]">Let our AI align your resume to the job role.</p>
            </div>
            <div className="hidden md:block w-16 h-[2px] bg-zinc-800"></div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center text-2xl font-bold text-white mb-4">3</div>
              <h4 className="text-lg font-semibold text-white mb-2">Get Hired!</h4>
              <p className="text-sm text-zinc-500 text-center max-w-[200px]">Download your polished resume & apply.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 bg-zinc-950 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-500" />
            <span className="font-semibold text-white tracking-tight">AI Resume Builder</span>
          </div>
          <p className="text-zinc-500 text-sm">© {new Date().getFullYear()} AI Resume Builder. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
