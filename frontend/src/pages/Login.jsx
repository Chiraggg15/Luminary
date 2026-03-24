import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm]       = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.email.trim())    errs.email    = 'Email is required';
    if (!form.password.trim()) errs.password = 'Password is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await authAPI.login(form);
      login(res.data.user, res.data.token);
      toast.success(`Welcome back, ${res.data.user.full_name}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-zinc-950">
      {/* Left side: Beautiful Clean Landing Reference */}
      <div className="hidden lg:flex flex-col justify-center w-1/2 p-16 xl:p-24 border-r border-zinc-900 bg-zinc-950 relative overflow-hidden">
        {/* Subtle accent blob */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none"></div>

        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-800 bg-zinc-900/50 mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-semibold tracking-wide text-zinc-300 uppercase">ResumeAI 2.0</span>
          </div>
          
          <h1 className="text-5xl xl:text-6xl font-bold text-white mb-6 leading-[1.1] tracking-tight">
            Win your dream job with AI validation.
          </h1>
          <p className="text-xl text-zinc-400 font-medium mb-12 max-w-md leading-relaxed">
            Submit better job applications 10x faster. Our algorithmic engine acts as your personal resume writer and scanner.
          </p>

          <div className="grid grid-cols-2 gap-8">
            <div className="border-l border-zinc-800 pl-4">
              <h3 className="text-white font-semibold mb-1">AI Resume Builder</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">Instantly generate keyword-optimized summaries and bullets powered by GPT-4.</p>
            </div>
            <div className="border-l border-zinc-800 pl-4">
              <h3 className="text-white font-semibold mb-1">ATS Scanner</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">Cross-reference your actual resume against real job descriptions to identify exact missing skills.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <div className="w-10 h-10 rounded bg-emerald-500 flex items-center justify-center text-zinc-950 font-bold text-xl mx-auto mb-6 lg:hidden">
              R
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight mb-2">Welcome back</h2>
            <p className="text-zinc-400">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label-glass" htmlFor="email">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@company.com"
                className={`input-glass ${errors.email ? 'border-red-500 focus:border-red-500' : ''}`}
              />
              {errors.email && <span className="text-red-400 text-sm mt-1">{errors.email}</span>}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-semibold text-zinc-400" htmlFor="password">Password</label>
                <Link to="#" className="text-sm font-medium text-emerald-400 hover:text-emerald-300">Forgot password?</Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className={`input-glass ${errors.password ? 'border-red-500 focus:border-red-500' : ''}`}
              />
              {errors.password && <span className="text-red-400 text-sm mt-1">{errors.password}</span>}
            </div>

            <button
              type="submit"
              className="btn-primary w-full h-12 mt-4 text-[15px]"
              disabled={loading}
            >
              {loading ? <div className="w-5 h-5 border-2 border-zinc-900/30 border-t-zinc-900 rounded-full animate-spin" /> : 'Log in securely'}
            </button>
          </form>

          <p className="mt-8 text-center text-zinc-500 text-sm">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-white font-medium hover:underline">Sign up for free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
