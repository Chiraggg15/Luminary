import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ResumeBuilder from './pages/ResumeBuilder';
import CoverLetter from './pages/CoverLetter';
import MockInterview from './pages/MockInterview';

/* eslint-disable react/prop-types */
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex justify-center items-center">
      <div className="w-8 h-8 border-4 border-zinc-800 border-t-white rounded-full animate-spin" />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
      <div className="min-h-screen bg-zinc-950 font-sans selection:bg-emerald-500/20 selection:text-emerald-300">
        <Toaster 
          position="top-right" 
          toastOptions={{
            style: {
              background: '#18181b', // zinc-900
              color: '#f4f4f5',      // zinc-100
              border: '1px solid #27272a', // zinc-800
              borderRadius: '0.5rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)'
            },
            success: {
              iconTheme: { primary: '#10b981', secondary: '#18181b' }, // emerald-500
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#18181b' },
            }
          }}
        />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <div className="max-w-7xl mx-auto flex flex-col min-h-screen">
                  <Navbar />
                  <main className="flex-1 px-4 sm:px-6 md:px-8 pb-12 w-full">
                    <Routes>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/resume/new" element={<ResumeBuilder />} />
                      <Route path="/resume/:id" element={<ResumeBuilder />} />
                      <Route path="/cover-letter" element={<CoverLetter />} />
                      <Route path="/mock-interview" element={<MockInterview />} />
                      <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                  </main>
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
    </AuthProvider>
  );
}
