import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Building2, ShieldCheck, UserCheck, PlusCircle, LogOut, LogIn, UserPlus } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full border border-purple-200">
            <ShieldCheck className="w-3 h-3" /> Admin
          </span>
        );
      case 'institution':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full border border-indigo-200">
            <Building2 className="w-3 h-3" /> Institution
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
            <UserCheck className="w-3 h-3" /> Citizen
          </span>
        );
    }
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-md group-hover:scale-105 transition-transform">
                स
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-brand-700 to-indigo-700 bg-clip-text text-transparent">
                  Samadhan Setu
                </span>
                <p className="text-[10px] text-slate-500 font-medium tracking-tight">Societal Challenges Platform</p>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link to="/" className="hover:text-brand-600 transition-colors">
              Public Feed
            </Link>

            {user && user.role === 'citizen' && (
              <>
                <Link
                  to="/create-challenge"
                  className="flex items-center gap-1 text-brand-600 hover:text-brand-700 font-semibold"
                >
                  <PlusCircle className="w-4 h-4" /> Report Challenge
                </Link>
                <Link to="/my-challenges" className="hover:text-brand-600 transition-colors">
                  My Submissions
                </Link>
              </>
            )}

            {user && user.role === 'institution' && (
              <Link to="/institution-dashboard" className="flex items-center gap-1.5 text-indigo-700 hover:text-indigo-900 font-semibold">
                <Building2 className="w-4 h-4" /> Institution Portal
              </Link>
            )}

            {user && user.role === 'admin' && (
              <Link to="/admin-dashboard" className="flex items-center gap-1.5 text-purple-700 hover:text-purple-900 font-semibold">
                <ShieldCheck className="w-4 h-4" /> Admin Dashboard
              </Link>
            )}
          </div>

          {/* Auth Controls */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-semibold text-slate-800">{user.name}</div>
                  {getRoleBadge(user.role)}
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium border border-slate-200"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1"
                >
                  <LogIn className="w-4 h-4" /> Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1.5 text-sm font-medium bg-brand-600 hover:bg-brand-700 text-white rounded-lg transition-colors shadow-sm flex items-center gap-1"
                >
                  <UserPlus className="w-4 h-4" /> Register
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
