import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ThumbsUp, Calendar, ArrowRight, Layers } from 'lucide-react';

const ChallengeCard = ({ challenge }) => {
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

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden">
      <div className="p-5">
        
        {/* Header Meta: Category & Status */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
            <Layers className="w-3 h-3 text-slate-400" />
            {challenge.category}
          </span>
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

        {/* Image Preview if available */}
        {challenge.image && (
          <div className="mb-4 rounded-lg overflow-hidden h-36 bg-slate-100 border border-slate-200">
            <img
              src={challenge.image}
              alt={challenge.title}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
        )}

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
