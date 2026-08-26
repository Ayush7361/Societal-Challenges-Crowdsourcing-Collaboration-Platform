import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogIn, Key, Mail, ShieldAlert, Sparkles } from 'lucide-react';

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'admin') navigate('/admin-dashboard');
      else if (user.role === 'institution') navigate('/institution-dashboard');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
    setLoading(true);
    try {
      const user = await login(demoEmail, demoPass);
      if (user.role === 'admin') navigate('/admin-dashboard');
      else if (user.role === 'institution') navigate('/institution-dashboard');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        
        <div className="text-center">
          <div className="w-12 h-12 bg-brand-600 rounded-xl mx-auto flex items-center justify-center text-white text-2xl font-bold mb-3 shadow-md">
            स
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">Sign in to Samadhan Setu</h2>
          <p className="mt-1 text-sm text-slate-500">Collaborate to solve societal challenges</p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm p-3 rounded-lg flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                placeholder="you@domain.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Password</label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg shadow transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Accounts Quick Login */}
        <div className="mt-6 border-t border-slate-100 pt-5">
          <div className="flex items-center gap-1 text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> One-Click Demo Logins:
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleQuickDemo('citizen@samadhan.org', 'password123')}
              className="px-2 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg transition-colors text-center"
            >
              👤 Citizen
            </button>
            <button
              onClick={() => handleQuickDemo('inst@nitdumka.edu.in', 'password123')}
              className="px-2 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 text-xs font-semibold rounded-lg transition-colors text-center"
            >
              🏫 Institution
            </button>
            <button
              onClick={() => handleQuickDemo('admin@samadhan.org', 'password123')}
              className="px-2 py-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 text-xs font-semibold rounded-lg transition-colors text-center"
            >
              🛡️ Admin
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500 pt-2">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand-600 font-semibold hover:underline">
            Register here
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Login;
