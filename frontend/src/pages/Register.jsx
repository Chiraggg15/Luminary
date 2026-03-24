import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Check } from 'lucide-react';

const PERKS = [
  'Unlimited AI-powered resume generation',
  'Advanced ATS keyword gap analysis',
  'Targeted cover letter builder',
  'Browser-native clean PDF exports',
];

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm]       = useState({ full_name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.full_name.trim())    errs.full_name = 'Full name is required';
    if (!form.email.trim())        errs.email     = 'Email is required';
    if (form.password.length < 8)  errs.password  = 'Minimum 8 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await authAPI.register(form);
      login(res.data.user, res.data.token);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-zinc-950">
      
      {/* Right side for Register (reversing the split for variation) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative z-10 bg-zinc-950 border-r border-zinc-900">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-white tracking-tight mb-2">Create your account</h2>
            <p className="text-zinc-400">Join thousands of professionals landing their dream roles.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label-glass" htmlFor="full_name">Full Name</label>
              <input
                id="full_name" name="full_name" type="text"
                value={form.full_name} onChange={handleChange}
                placeholder="John Doe"
                className={`input-glass ${errors.full_name ? 'border-red-500' : ''}`}
              />
              {errors.full_name && <span className="text-red-400 text-sm mt-1">{errors.full_name}</span>}
            </div>

            <div>
              <label className="label-glass" htmlFor="email">Work Email</label>
              <input
                id="email" name="email" type="email"
                value={form.email} onChange={handleChange}
                placeholder="you@company.com"
                className={`input-glass ${errors.email ? 'border-red-500' : ''}`}
              />
              {errors.email && <span className="text-red-400 text-sm mt-1">{errors.email}</span>}
            </div>

            <div>
              <label className="label-glass" htmlFor="password">Password</label>
              <input
                id="password" name="password" type="password"
                value={form.password} onChange={handleChange}
                placeholder="••••••••"
                className={`input-glass ${errors.password ? 'border-red-500' : ''}`}
              />
              {errors.password && <span className="text-red-400 text-sm mt-1">{errors.password}</span>}
            </div>

            <button
              type="submit"
              className="btn-primary w-full h-12 mt-4 text-[15px]"
              disabled={loading}
            >
              {loading ? <div className="w-5 h-5 border-2 border-zinc-900/30 border-t-zinc-900 rounded-full animate-spin" /> : 'Get Started For Free'}
            </button>
          </form>

          <p className="mt-8 text-center text-zinc-500 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-white font-medium hover:underline">Log in</Link>
          </p>
        </div>
      </div>

      {/* Left side: Beautiful Clean Landing Reference */}
      <div className="hidden lg:flex flex-col justify-center w-1/2 p-16 xl:p-24 bg-zinc-900 relative overflow-hidden">
        {/* Subtle dot pattern or simple gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px] opacity-30"></div>
        
        <div className="relative z-10 max-w-xl left-12">
          <h2 className="text-4xl font-bold text-white mb-8 tracking-tight">Everything you need to succeed</h2>
          
          <ul className="space-y-6">
            {PERKS.map((p, i) => (
              <li key={i} className="flex items-start gap-4">
                <div className="mt-1 w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 flex-shrink-0">
                  <Check size={14} className="text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-zinc-200 font-medium">{p}</h4>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-16 glass-panel p-6 border-zinc-800 bg-zinc-950/50 backdrop-blur-sm">
            <p className="text-zinc-400 text-sm italic leading-relaxed">
              "This tool acts exactly like an actual Recruiter mapping skills directly to the job description. Built my resume 10x faster."
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-300">JD</div>
              <div>
                <div className="text-xs font-semibold text-white">Jane Doe</div>
                <div className="text-xs text-zinc-500">Senior Product Manager</div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
