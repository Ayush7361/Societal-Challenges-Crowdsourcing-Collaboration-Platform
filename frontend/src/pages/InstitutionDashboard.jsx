import React, { useState, useEffect, useContext } from 'react';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Building2, Search, ArrowRight, CheckCircle2, Clock, Upload } from 'lucide-react';

const InstitutionDashboard = () => {
  const { user } = useContext(AuthContext);
  const [openChallenges, setOpenChallenges] = useState([]);
  const [inProgressChallenges, setInProgressChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [openRes, inProgRes] = await Promise.all([
        API.get('/challenges?status=Open'),
        API.get('/challenges?status=In Progress'),
      ]);

      setOpenChallenges(openRes.data);
      setInProgressChallenges(inProgRes.data);
    } catch (err) {
      console.error('Error fetching institution dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Institution Banner */}
      <div className="bg-gradient-to-r from-indigo-800 to-brand-900 text-white rounded-2xl p-6 shadow-md">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold bg-indigo-500/30 text-indigo-200 px-3 py-1 rounded-full mb-2 border border-indigo-400/30">
          <Building2 className="w-4 h-4" /> Academic & Industry Partner Hub
        </div>
        <h1 className="text-2xl sm:text-3xl font-black">Institution Collaboration Portal</h1>
        <p className="text-indigo-200 text-xs sm:text-sm mt-1">
          {user?.organization || user?.name} — Browse verified societal challenges, submit technical & cost proposals, and upload execution progress.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Active Work In Progress Section */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Challenges In Progress ({inProgressChallenges.length})
            </h2>

            {inProgressChallenges.length === 0 ? (
              <div className="bg-white p-6 rounded-xl border border-slate-200 text-slate-500 text-sm text-center">
                No active assigned challenges in progress at the moment.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {inProgressChallenges.map((challenge) => (
                  <div key={challenge._id} className="bg-white p-5 rounded-xl border border-blue-200 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-0.5 rounded-full">
                          In Progress
                        </span>
                        <span className="text-xs text-slate-500">{challenge.category}</span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-base mb-1">{challenge.title}</h3>
                      <p className="text-xs text-slate-600 line-clamp-2 mb-3">{challenge.description}</p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs text-slate-500">📍 {challenge.location}</span>
                      <Link
                        to={`/challenges/${challenge._id}`}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-1"
                      >
                        <Upload className="w-3.5 h-3.5" /> Post Evidence / Progress
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Open Challenges Awaiting Proposals */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Search className="w-5 h-5 text-emerald-600" />
              Open Challenges Seeking Proposals ({openChallenges.length})
            </h2>

            {openChallenges.length === 0 ? (
              <div className="bg-white p-6 rounded-xl border border-slate-200 text-slate-500 text-sm text-center">
                There are currently no open challenges seeking new proposals.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {openChallenges.map((challenge) => (
                  <div key={challenge._id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                          Open
                        </span>
                        <span className="text-xs text-slate-500">{challenge.category}</span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-base mb-1">{challenge.title}</h3>
                      <p className="text-xs text-slate-600 line-clamp-2 mb-3">{challenge.description}</p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs text-slate-500">📍 {challenge.location}</span>
                      <Link
                        to={`/challenges/${challenge._id}`}
                        className="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-1"
                      >
                        Submit Proposal <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};

export default InstitutionDashboard;
