import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ThumbsUp, Calendar, ArrowRight, Layers, ShieldCheck, Image as ImageIcon } from 'lucide-react';
import { getChallengeCoverUrl } from '../utils/imageUrl';

const ChallengeCard = ({ challenge }) => {
  const [imageError, setImageError] = useState(false);
  const coverUrl = getChallengeCoverUrl(challenge);

  // A card can stay mounted while its challenge data is refreshed. Retry when a
  // newly persisted upload (or evidence fallback) changes the resolved URL.
  useEffect(() => {
    setImageError(false);
  }, [coverUrl]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-amber-200">Pending Moderation</span>;
      case 'Open':
        return <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200">Open for Proposals</span>;
      case 'Under Review':
        return <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-purple-200">Under Review</span>;
      case 'In Progress':
        return <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-blue-200">In Progress</span>;
      case 'Resolved':
        return <span className="bg-teal-100 text-teal-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-teal-200">✓ Resolved</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">{status}</span>;
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'Critical':
        return <span className="bg-rose-100 text-rose-800 text-[11px] font-bold px-2 py-0.5 rounded-md border border-rose-200 flex items-center gap-1">🚨 Critical</span>;
      case 'High':
        return <span className="bg-orange-100 text-orange-800 text-[11px] font-bold px-2 py-0.5 rounded-md border border-orange-200 flex items-center gap-1">🔴 High</span>;
      case 'Medium':
        return <span className="bg-amber-100 text-amber-800 text-[11px] font-medium px-2 py-0.5 rounded-md border border-amber-200">🟡 Medium</span>;
      case 'Low':
        return <span className="bg-slate-100 text-slate-700 text-[11px] font-medium px-2 py-0.5 rounded-md border border-slate-200">🟢 Low</span>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden">
      {coverUrl ? (
        <div className="h-44 bg-slate-100 border-b border-slate-200 relative group overflow-hidden">
          {!imageError ? (
            <img
              src={coverUrl}
              alt={challenge.title}
              className="block w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-44 flex flex-col items-center justify-center bg-slate-100 text-slate-400 gap-1 text-xs">
              <ImageIcon className="w-6 h-6 opacity-40" />
              <span>Ground Evidence Photo</span>
            </div>
          )}
          {challenge.exifVerified && (
            <div className="absolute top-2 left-2 bg-slate-900/85 backdrop-blur-md text-emerald-400 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/40 flex items-center gap-1 shadow">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              Geotag Verified
            </div>
          )}
        </div>
      ) : null}

      <div className="p-5">
        
        {/* Header Meta: Category, Severity & Status */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
              <Layers className="w-3 h-3 text-slate-400" />
              {challenge.category}
            </span>
            {getSeverityBadge(challenge.severity)}
          </div>
          {getStatusBadge(challenge.status)}
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 hover:text-brand-600 transition-colors">
          <Link to={`/challenges/${challenge._id}`}>{challenge.title}</Link>
        </h3>

        {/* Description snippet */}
        <p className="text-slate-600 text-sm mb-4 line-clamp-2 leading-relaxed">
          {challenge.description}
        </p>

        {/* Location & Author */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mb-4 border-t border-slate-100 pt-3">
          <div className="flex items-center gap-1 text-slate-700 font-medium">
            <MapPin className="w-3.5 h-3.5 text-rose-500" />
            {challenge.location}
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(challenge.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </div>
        </div>

      </div>

      {/* Footer Info & CTA */}
      <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
          <ThumbsUp className="w-4 h-4 text-brand-600" />
          <span>{challenge.votesCount || 0} Votes</span>
        </div>

        <Link
          to={`/challenges/${challenge._id}`}
          className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 group"
        >
          View Details
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

    </div>
  );
};

export default ChallengeCard;
