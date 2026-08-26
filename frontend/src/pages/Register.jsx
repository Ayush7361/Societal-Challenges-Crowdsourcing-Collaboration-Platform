import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { UserPlus, Mail, Key, User, Building, ShieldAlert } from 'lucide-react';

const Register = () => {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'citizen',
    organization: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.role === 'institution' && !formData.organization.trim()) {
      setError('Organization name is required for institutions');
      return;
    }

    setLoading(true);
    try {
      const user = await register(formData);
      if (user.role === 'admin') navigate('/admin-dashboard');
      else if (user.role === 'institution') navigate('/institution-dashboard');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        
        <div className="text-center">
          <h2 className="text-2xl font-extrabold text-slate-900">Create your Account</h2>
          <p className="mt-1 text-sm text-slate-500">Join the Samadhan Setu network</p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm p-3 rounded-lg flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          
          {/* Role Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Select Your Role
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'citizen', label: 'Citizen', icon: '👤' },
                { id: 'institution', label: 'Institution', icon: '🏫' },
                { id: 'admin', label: 'Admin', icon: '🛡️' },
              ].map((r) => (
                <button
                  type="button"
                  key={r.id}
                  onClick={() => setFormData({ ...formData, role: r.id })}
                  className={`py-2 px-2 border rounded-xl text-xs font-bold transition-all text-center flex flex-col items-center gap-1 ${
                    formData.role === r.id
                      ? 'border-brand-600 bg-brand-50 text-brand-700 shadow-sm ring-2 ring-brand-200'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-base">{r.icon}</span>
                  <span>{r.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                placeholder="e.g. Ramesh Kumar"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                placeholder="you@domain.com"
              />
            </div>
          </div>

          {formData.role === 'institution' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Organization / College Name</label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  name="organization"
                  required
                  value={formData.organization}
                  onChange={handleChange}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  placeholder="e.g. National Institute of Technology Dumka"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Password</label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                placeholder="Minimum 6 characters"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg shadow transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50"
          >
            <UserPlus className="w-4 h-4" />
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2">
          Already registered?{' '}
          <Link to="/login" className="text-brand-600 font-semibold hover:underline">
            Sign in
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Register;
