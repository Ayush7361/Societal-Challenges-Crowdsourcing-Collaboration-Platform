import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import ChallengeCard from '../components/ChallengeCard';
import { Link } from 'react-router-dom';
import { PlusCircle, FileText } from 'lucide-react';

const MyChallenges = () => {
  const { user } = useContext(AuthContext);
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyChallenges = async () => {
      if (user) {
        try {
          const res = await API.get(`/challenges?createdBy=${user._id}`);
          setChallenges(res.data);
        } catch (err) {
          console.error('Error fetching user challenges:', err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchMyChallenges();
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-brand-600" />
            My Submitted Challenges
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track real-time moderation, voting, institution proposals, and progress updates on your reported issues.
          </p>
        </div>

        <Link
          to="/create-challenge"
          className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl shadow text-sm flex items-center gap-2"
        >
          <PlusCircle className="w-4 h-4" /> Report New Challenge
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
        </div>
      ) : challenges.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto">
          <p className="text-slate-500 text-sm mb-4">You haven't reported any societal challenges yet.</p>
          <Link
            to="/create-challenge"
            className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-semibold inline-block"
          >
            Create Your First Challenge
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {challenges.map((challenge) => (
            <ChallengeCard key={challenge._id} challenge={challenge} />
          ))}
        </div>
      )}

    </div>
  );
};

export default MyChallenges;
