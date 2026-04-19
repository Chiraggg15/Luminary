import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Email is required');
      return;
    }

    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setSubmitted(true);
      toast.success('Reset link sent to your email!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-zinc-950">
      {/* Left side: branding/info (simplified version of Login) */}
      <div className="hidden lg:flex flex-col justify-center w-1/2 p-16 xl:p-24 border-r border-zinc-900 bg-zinc-950 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none"></div>
        <div className="relative z-10 max-w-xl">
           <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-800 bg-zinc-900/50 mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-semibold tracking-wide text-zinc-300 uppercase">Recovery Mode</span>
          </div>
          <h1 className="text-5xl xl:text-6xl font-bold text-white mb-6 leading-[1.1] tracking-tight">
            Regain access to your career account.
          </h1>
          <p className="text-xl text-zinc-400 font-medium mb-12 max-w-md leading-relaxed">
            Enter your email and we&apos;ll send you a secure link to set a new password.
          </p>
        </div>
      </div>

      {/* Right side: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-md text-center lg:text-left">
          {!submitted ? (
            <>
              <div className="mb-10 text-center lg:text-left">
                <Link to="/login" className="text-emerald-400 hover:text-emerald-300 text-sm font-medium inline-flex items-center gap-2 mb-8 group transition-colors">
                  <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to login
                </Link>
                <h2 className="text-3xl font-bold text-white tracking-tight mb-2">Forgot Password?</h2>
                <p className="text-zinc-400">No worries, it happens. We&apos;ll send you instructions.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="label-glass" htmlFor="email">Email address</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="input-glass"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full h-12 text-[15px]"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-zinc-900/30 border-t-zinc-900 rounded-full animate-spin mx-auto" />
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-8 border border-emerald-500/20">
                <span className="text-2xl">📧</span>
              </div>
              <h2 className="text-3xl font-bold text-white tracking-tight mb-4">Check your email</h2>
              <p className="text-zinc-400 mb-10 leading-relaxed text-lg">
                We&apos;ve sent a password reset link to <br/>
                <span className="text-white font-medium">{email}</span>
              </p>
              <Link to="/login" className="btn-primary inline-flex px-8 h-12">
                Return to Login
              </Link>
              <button 
                onClick={() => setSubmitted(false)}
                className="block w-full mt-6 text-zinc-500 hover:text-zinc-300 text-sm font-medium"
              >
                Didn&apos;t receive it? Try another email
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
