import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { User, Lock, MapPin, Linkedin, Github, Globe, Phone, FileText, LogOut, Save, Shield } from 'lucide-react';
import { authAPI } from '../services/api';
import PhoneInput from '../components/PhoneInput';
import AutoResizeTextarea from '../components/AutoResizeTextarea';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('profile');
  const [profileForm, setProfileForm] = useState({
    phone:     user?.profile?.phone     || '',
    location:  user?.profile?.location  || '',
    linkedin:  user?.profile?.linkedin  || '',
    github:    user?.profile?.github    || '',
    portfolio: user?.profile?.portfolio || '',
    summary:   user?.profile?.summary   || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [saving,   setSaving]   = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [imgLoading, setImgLoading] = useState(false);

  const handleImageUpload = async (file) => {
    if (!file) return;
    
    // Validate file size (max 800KB for base64 storage)
    if (file.size > 800 * 1024) {
      toast.error('Image is too large. Please use a file smaller than 800KB.');
      return;
    }

    setImgLoading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64String = reader.result;
        const res = await authAPI.updateMe({ profile_image: base64String });
        updateUser(res.data.user);
        toast.success('Profile picture updated!');
      } catch (err) {
        toast.error('Failed to upload image');
      } finally {
        setImgLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await authAPI.updateMe(profileForm);
      updateUser(res.data.user);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordForm.new_password.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    setPwSaving(true);
    try {
      await authAPI.changePassword({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      });
      toast.success('Password changed successfully!');
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to change password');
    } finally {
      setPwSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  const tabs = [
    { id: 'profile',  label: 'Profile',  icon: User   },
    { id: 'security', label: 'Security', icon: Shield  },
  ];

  return (
    <div className="max-w-4xl mx-auto py-4 animate-[fadeIn_0.3s_ease-out]">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Account Settings</h1>
        <p className="text-zinc-400 text-sm">Manage your profile information, security, and preferences.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full lg:w-64 shrink-0 space-y-4">
          {/* User Card */}
          <div className="glass-panel p-5 text-center">
            <div className="relative group w-20 h-20 mx-auto mb-3">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-zinc-950 font-bold text-2xl shadow-lg shadow-emerald-500/20 overflow-hidden border-2 border-zinc-800">
                {user?.profile?.profile_image ? (
                  <img src={user.profile.profile_image} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              
              {/* Upload Overlay */}
              <label 
                htmlFor="avatar-upload" 
                className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-opacity"
              >
                {imgLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save size={18} className="text-white" />
                )}
                <input 
                  id="avatar-upload" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => handleImageUpload(e.target.files[0])}
                  disabled={imgLoading}
                />
              </label>
            </div>
            <h3 className="text-white font-bold text-base">{user?.full_name}</h3>
            <p className="text-zinc-500 text-xs mt-1 truncate">{user?.email}</p>
          </div>

          {/* Tab Navigation */}
          <div className="glass-panel p-2">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all text-left ${
                    activeTab === tab.id
                      ? 'bg-zinc-800 text-white border border-zinc-700'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                  }`}
                >
                  <Icon size={16} className={activeTab === tab.id ? 'text-emerald-400' : ''} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Danger Zone */}
          <div className="glass-panel p-4 border-red-500/10">
            <p className="text-xs font-bold uppercase tracking-widest text-green-500/70 mb-3">Danger Zone</p>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-400 hover:text-white hover:bg-red-500/10 border border-red-500/20 hover:border-red-500/40 rounded-lg transition-all"
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSave} className="glass-panel p-6 md:p-8">
              <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                <User size={20} className="text-emerald-400" /> Profile Information
              </h2>
              <p className="text-zinc-500 text-sm mb-8">Update your public profile details. This will appear in job applications.</p>

              <div className="space-y-5">
                {/* Read-only: name & email from auth */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-4 bg-zinc-800/30 rounded-xl border border-zinc-800">
                  <div>
                    <label className="label-glass flex items-center gap-1.5"><User size={12} /> Full Name (read-only)</label>
                    <input className="input-glass opacity-60 cursor-not-allowed" value={user?.full_name || ''} disabled />
                  </div>
                  <div>
                    <label className="label-glass flex items-center gap-1.5"><FileText size={12} /> Email (read-only)</label>
                    <input className="input-glass opacity-60 cursor-not-allowed" value={user?.email || ''} disabled />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <PhoneInput
                    label="Phone"
                    value={profileForm.phone}
                    onChange={val => setProfileForm(f => ({ ...f, phone: val }))}
                  />
                  <div>
                    <label className="label-glass flex items-center gap-1.5"><MapPin size={12} /> Location</label>
                    <input
                      className="input-glass"
                      placeholder="Kathmandu, Nepal"
                      value={profileForm.location}
                      onChange={e => setProfileForm(f => ({ ...f, location: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="label-glass flex items-center gap-1.5"><Linkedin size={12} /> LinkedIn URL</label>
                    <input
                      className="input-glass"
                      placeholder="linkedin.com/in/yourprofile"
                      value={profileForm.linkedin}
                      onChange={e => setProfileForm(f => ({ ...f, linkedin: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="label-glass flex items-center gap-1.5"><Github size={12} /> GitHub URL</label>
                    <input
                      className="input-glass"
                      placeholder="github.com/yourusername"
                      value={profileForm.github}
                      onChange={e => setProfileForm(f => ({ ...f, github: e.target.value }))}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="label-glass flex items-center gap-1.5"><Globe size={12} /> Portfolio / Website</label>
                    <input
                      className="input-glass"
                      placeholder="https://yourportfolio.com"
                      value={profileForm.portfolio}
                      onChange={e => setProfileForm(f => ({ ...f, portfolio: e.target.value }))}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="label-glass">Professional Summary</label>
                    <AutoResizeTextarea
                      className="input-glass"
                      rows={4}
                      placeholder="Write a concise professional summary for your default profile..."
                      value={profileForm.summary}
                      onChange={e => setProfileForm(f => ({ ...f, summary: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button type="submit" className="btn-primary flex items-center gap-2 px-8" disabled={saving}>
                  {saving ? <div className="w-4 h-4 border-2 border-zinc-900/30 border-t-zinc-900 rounded-full animate-spin" /> : <Save size={16} />}
                  Save Profile
                </button>
              </div>
            </form>
          )}

          {activeTab === 'security' && (
            <form onSubmit={handlePasswordSave} className="glass-panel p-6 md:p-8">
              <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                <Lock size={20} className="text-emerald-400" /> Change Password
              </h2>
              <p className="text-zinc-500 text-sm mb-8">Use a strong, unique password to protect your account.</p>

              <div className="space-y-5 max-w-md">
                <div>
                  <label className="label-glass">Current Password</label>
                  <input
                    type="password"
                    className="input-glass"
                    placeholder="Enter current password"
                    value={passwordForm.current_password}
                    onChange={e => setPasswordForm(f => ({ ...f, current_password: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="label-glass">New Password</label>
                  <input
                    type="password"
                    className="input-glass"
                    placeholder="Min. 8 characters"
                    value={passwordForm.new_password}
                    onChange={e => setPasswordForm(f => ({ ...f, new_password: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="label-glass">Confirm New Password</label>
                  <input
                    type="password"
                    className="input-glass"
                    placeholder="Repeat new password"
                    value={passwordForm.confirm_password}
                    onChange={e => setPasswordForm(f => ({ ...f, confirm_password: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button type="submit" className="btn-primary flex items-center gap-2 px-8" disabled={pwSaving}>
                  {pwSaving ? <div className="w-4 h-4 border-2 border-zinc-900/30 border-t-zinc-900 rounded-full animate-spin" /> : <Lock size={16} />}
                  Update Password
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
