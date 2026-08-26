import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Link } from 'react-router-dom';
import { ShieldCheck, CheckCircle, XCircle, Clock, Award, Eye, FileText, CheckCheck } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    pending: 0,
    open: 0,
    underReview: 0,
    inProgress: 0,
    resolved: 0,
    totalChallenges: 0,
    totalProposals: 0,
    totalUsers: 0,
  });

  const [activeTab, setActiveTab] = useState('Pending');
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');

  const fetchStats = async () => {
    try {
      const res = await API.get('/admin/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Error fetching admin stats:', err);
    }
  };

  const fetchTabChallenges = async (status) => {
    setLoading(true);
    try {
      const res = await API.get(`/challenges?status=${status}`);
      setChallenges(res.data);
    } catch (err) {
      console.error('Error fetching challenges:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchTabChallenges(activeTab);
  }, [activeTab]);

  const handleStatusChange = async (challengeId, newStatus, note) => {
    setActionMessage('');
    try {
      await API.patch(`/challenges/${challengeId}/status`, { status: newStatus, note });
      setActionMessage(`Challenge status updated to '${newStatus}' successfully.`);
      fetchStats();
      fetchTabChallenges(activeTab);
    } catch (err) {
      console.error('Error updating status:', err);
      setActionMessage('Failed to update status');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Admin Banner */}
      <div className="bg-gradient-to-r from-purple-800 to-indigo-900 text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold bg-purple-500/30 text-purple-200 px-3 py-1 rounded-full mb-2 border border-purple-400/30">
            <ShieldCheck className="w-4 h-4" /> Platform Moderation & Oversight
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Admin Control Center</h1>
          <p className="text-purple-200 text-xs sm:text-sm mt-1">
            Moderate citizen submissions, evaluate institutional proposals, and verify final resolution evidence.
          </p>
        </div>
      </div>

      {actionMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-sm font-medium">
          {actionMessage}
        </div>
      )}

      {/* Metrics Counter Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          { label: 'Pending Moderation', count: stats.pending, color: 'border-amber-400 bg-amber-50 text-amber-900', key: 'Pending' },
          { label: 'Open for Proposals', count: stats.open, color: 'border-emerald-400 bg-emerald-50 text-emerald-900', key: 'Open' },
          { label: 'Under Review', count: stats.underReview, color: 'border-purple-400 bg-purple-50 text-purple-900', key: 'Under Review' },
          { label: 'In Progress', count: stats.inProgress, color: 'border-blue-400 bg-blue-50 text-blue-900', key: 'In Progress' },
          { label: 'Resolved', count: stats.resolved, color: 'border-teal-400 bg-teal-50 text-teal-900', key: 'Resolved' },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => setActiveTab(item.key)}
            className={`p-4 rounded-xl border text-left transition-all shadow-sm ${item.color} ${
              activeTab === item.key ? 'ring-2 ring-purple-600 scale-[1.02]' : 'opacity-80 hover:opacity-100'
            }`}
          >
            <div className="text-2xl font-black">{item.count}</div>
            <div className="text-xs font-semibold uppercase tracking-wider mt-1">{item.label}</div>
          </button>
        ))}
      </div>

      {/* Main Tabbed Management Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Header Tabs */}
        <div className="flex flex-wrap border-b border-slate-200 bg-slate-50">
          {['Pending', 'Open', 'Under Review', 'In Progress', 'Resolved'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3.5 text-xs font-bold uppercase tracking-wider transition-colors border-b-2 ${
                activeTab === tab
                  ? 'border-purple-600 text-purple-700 bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab} Challenges ({tab === 'Pending' ? stats.pending : tab === 'Open' ? stats.open : tab === 'Under Review' ? stats.underReview : tab === 'In Progress' ? stats.inProgress : stats.resolved})
            </button>
          ))}
        </div>

        {/* Content list */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <span className="text-xs text-slate-500 mt-2 block">Loading challenges...</span>
            </div>
          ) : challenges.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              No challenges currently in <strong>{activeTab}</strong> stage.
            </div>
          ) : (
            <div className="space-y-4">
              {challenges.map((challenge) => (
                <div
                  key={challenge._id}
                  className="bg-slate-50 p-5 rounded-xl border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                >
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold bg-white border border-slate-300 px-2 py-0.5 rounded text-slate-700">
                        {challenge.category}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">📍 {challenge.location}</span>
                      <span className="text-xs text-slate-400">
                        Submitted by: {challenge.createdBy?.name || 'Citizen'}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-base">{challenge.title}</h3>
                    <p className="text-xs text-slate-600 line-clamp-2">{challenge.description}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 w-full md:w-auto shrink-0 border-t md:border-t-0 pt-3 md:pt-0">
                    
                    <Link
                      to={`/challenges/${challenge._id}`}
                      className="px-3 py-1.5 text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> Details & Proposals
                    </Link>

                    {activeTab === 'Pending' && (
                      <button
                        onClick={() => handleStatusChange(challenge._id, 'Open', 'Approved by Admin for public feed and institutional proposals.')}
                        className="px-3.5 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm flex items-center gap-1"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Approve (Open)
                      </button>
                    )}

                    {(activeTab === 'Open' || activeTab === 'Under Review') && (
                      <Link
                        to={`/challenges/${challenge._id}`}
                        className="px-3.5 py-1.5 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-sm flex items-center gap-1"
                      >
                        <Award className="w-3.5 h-3.5" /> Review Proposals
                      </Link>
                    )}

                    {activeTab === 'In Progress' && (
                      <button
                        onClick={() => handleStatusChange(challenge._id, 'Resolved', 'Verified institutional evidence and marked as Resolved.')}
                        className="px-3.5 py-1.5 text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-sm flex items-center gap-1"
                      >
                        <CheckCheck className="w-3.5 h-3.5" /> Mark Resolved
                      </button>
                    )}

                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;
