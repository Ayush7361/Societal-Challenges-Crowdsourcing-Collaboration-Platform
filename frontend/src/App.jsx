import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateChallenge from './pages/CreateChallenge';
import ChallengeDetail from './pages/ChallengeDetail';
import AdminDashboard from './pages/AdminDashboard';
import InstitutionDashboard from './pages/InstitutionDashboard';
import MyChallenges from './pages/MyChallenges';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/challenges/:id" element={<ChallengeDetail />} />

              {/* Citizen Routes */}
              <Route
                path="/create-challenge"
                element={
                  <ProtectedRoute allowedRoles={['citizen']}>
                    <CreateChallenge />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-challenges"
                element={
                  <ProtectedRoute allowedRoles={['citizen']}>
                    <MyChallenges />
                  </ProtectedRoute>
                }
              />

              {/* Institution Routes */}
              <Route
                path="/institution-dashboard"
                element={
                  <ProtectedRoute allowedRoles={['institution']}>
                    <InstitutionDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin-dashboard"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
          <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
              <div>
                <strong>Samadhan Setu</strong> — Societal Challenges Crowdsourcing & Collaboration Platform
              </div>
              <div className="text-slate-400">
                Status Flow: Pending → Open → Under Review → In Progress → Resolved
              </div>
            </div>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
