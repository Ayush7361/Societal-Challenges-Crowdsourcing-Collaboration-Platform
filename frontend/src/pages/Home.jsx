import React, { useState, useEffect } from 'react';
import API from '../services/api';
import ChallengeCard from '../components/ChallengeCard';
import { Search, Filter, AlertCircle, RefreshCw } from 'lucide-react';

const Home = () => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchChallenges = async () => {
    setLoading(true);
    setError('');
    try {
      let queryParams = [];
      if (statusFilter) queryParams.push(`status=${encodeURIComponent(statusFilter)}`);
      if (categoryFilter) queryParams.push(`category=${encodeURIComponent(categoryFilter)}`);
      
      const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
      const res = await API.get(`/challenges${queryString}`);
      
      // By default on public feed, hide Pending unless specifically selected or viewing all
      let data = res.data;
      if (!statusFilter) {
        data = data.filter(c => c.status !== 'Pending');
      }
      setChallenges(data);
    } catch (err) {
      console.error('Error fetching challenges:', err);
      setError('Failed to load challenges. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, [statusFilter, categoryFilter]);

  const filteredChallenges = challenges.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-brand-700 via-brand-600 to-indigo-700 text-white rounded-2xl p-8 shadow-lg relative overflow-hidden">
        <div className="max-w-2xl relative z-10">
          <span className="inline-block bg-white/20 backdrop-blur-md text-white text-xs font-semibold px-3 py-1 rounded-full mb-3">
            🇮🇳 Societal Challenges Crowdsourcing & Collaboration Platform
          </span>
          <h1 className="text-3xl sm:text-4xl font-black leading-tight mb-3">
            Bridge Local Issues to Institutional Solutions
          </h1>
          <p className="text-brand-100 text-sm sm:text-base leading-relaxed">
            Samadhan Setu connects citizens reporting grassroots challenges with academic institutions, innovation labs, and local administrators for transparent resolution.
          </p>
        </div>
        <div className="absolute right-[-40px] bottom-[-40px] opacity-10 font-bold text-[180px] pointer-events-none select-none">
          स
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search location, title..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg text-slate-700 focus:ring-brand-500"
          >
            <option value="">All Approved Statuses</option>
            <option value="Open">Open for Proposals</option>
            <option value="Under Review">Under Review</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg text-slate-700 focus:ring-brand-500"
          >
            <option value="">All Categories</option>
            <option value="Water & Sanitation">Water & Sanitation</option>
            <option value="Education">Education</option>
            <option value="Infrastructure">Infrastructure</option>
            <option value="Health">Health</option>
            <option value="Environment">Environment</option>
          </select>

          <button
            onClick={fetchChallenges}
            className="p-2 text-slate-500 hover:text-brand-600 border border-slate-200 rounded-lg bg-white"
            title="Refresh Feed"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Challenges Feed Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
          <span className="text-sm font-medium text-slate-500">Loading public challenges...</span>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
          <button onClick={fetchChallenges} className="text-xs bg-rose-600 text-white px-3 py-1.5 rounded-lg font-semibold">
            Retry
          </button>
        </div>
      ) : filteredChallenges.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
            🔍
          </div>
          <h3 className="text-lg font-bold text-slate-800">No challenges found</h3>
          <p className="text-sm text-slate-500 mt-1">Try clearing your search query or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChallenges.map((challenge) => (
            <ChallengeCard key={challenge._id} challenge={challenge} />
          ))}
        </div>
      )}

    </div>
  );
};

export default Home;
