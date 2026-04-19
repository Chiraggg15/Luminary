import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authAPI } from '../services/api';
import { Eye, EyeOff, Lock } from 'lucide-react';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      await authAPI.resetPassword(token, password);
      toast.success('Password reset successful! You can now login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to reset password. Link may be expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-zinc-950">
      <div className="hidden lg:flex flex-col justify-center w-1/2 p-16 xl:p-24 border-r border-zinc-900 bg-zinc-950 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none"></div>
        <div className="relative z-10 max-w-xl">
           <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-800 bg-zinc-900/50 mb-8">
            <Lock size={14} className="text-emerald-500" />
            <span className="text-xs font-semibold tracking-wide text-zinc-300 uppercase">Secure Reset</span>
          </div>
          <h1 className="text-5xl xl:text-6xl font-bold text-white mb-6 leading-[1.1] tracking-tight">
            Create a stronger password.
          </h1>
          <p className="text-xl text-zinc-400 font-medium mb-12 max-w-md leading-relaxed">
            Choose a combination of letters, numbers, and symbols to ensure your account remains safe.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-md">
          <div className="text-center lg:text-left mb-10">
            <h2 className="text-3xl font-bold text-white tracking-tight mb-2">Set new password</h2>
            <p className="text-zinc-400">Please enter your new security credentials below.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="label-glass" htmlFor="password">New Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="input-glass pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 p-2"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="label-glass" htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
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
                'Update Password'
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-zinc-500 text-sm italic">
            Note: Updating your password will invalidate the previous one immediately.
          </p>
        </div>
      </div>
    </div>
  );
}
