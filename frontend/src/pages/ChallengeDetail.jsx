import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import StatusTimeline from '../components/StatusTimeline';
import ChallengeMapDisplay from '../components/ChallengeMapDisplay';
import { getImageUrl } from '../utils/imageUrl';
import {
  MapPin, ThumbsUp, MessageSquare, Building2, ShieldCheck,
  CheckCircle2, Clock, Upload, ArrowLeft, Send, Sparkles, AlertCircle
} from 'lucide-react';

const ChallengeDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);

  const [challenge, setChallenge] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [progressUpdates, setProgressUpdates] = useState([]);
  const [comments, setComments] = useState([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [similar, setSimilar] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  // Form states
  const [commentText, setCommentText] = useState('');

  // Proposal form state
  const [solution, setSolution] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('₹18,000');
  const [timeline, setTimeline] = useState('15 days');
  const [submittingProposal, setSubmittingProposal] = useState(false);

  // Scope & Budget Revision state
  const [scopeRevisions, setScopeRevisions] = useState([]);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [revisionReason, setRevisionReason] = useState('Unforeseen Weather / Monsoon Damage');
  const [revisionJustification, setRevisionJustification] = useState('');
  const [revisedCost, setRevisedCost] = useState('₹30,000');
  const [revisedTimeline, setRevisedTimeline] = useState('30 days');
  const [revisionEvidenceFiles, setRevisionEvidenceFiles] = useState([]);
  const [submittingRevision, setSubmittingRevision] = useState(false);
  const [reviewingRevisionId, setReviewingRevisionId] = useState(null);

  const handleSubmitScopeRevision = async (e) => {
    e.preventDefault();
    if (!revisionJustification.trim() || !revisedCost.trim()) {
      alert('Justification and revised cost are required.');
      return;
    }
    setSubmittingRevision(true);
    try {
      const formData = new FormData();
      formData.append('reason', revisionReason);
      formData.append('justification', revisionJustification.trim());
      formData.append('revisedCost', revisedCost.trim());
      formData.append('revisedTimeline', revisedTimeline.trim());
      revisionEvidenceFiles.forEach((f) => formData.append('evidence', f));

      await API.post(`/challenges/${id}/scope-revisions`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMsg('Scope & Budget Revision request submitted successfully! Awaiting Admin review.');
      setShowRevisionModal(false);
      setRevisionJustification('');
      setRevisionEvidenceFiles([]);
      fetchChallengeDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit scope revision request');
    } finally {
      setSubmittingRevision(false);
    }
  };

  const handleReviewScopeRevision = async (revisionId, status, adminNote = '') => {
    setReviewingRevisionId(revisionId);
    try {
      await API.patch(`/scope-revisions/${revisionId}/review`, { status, adminNote });
      setMsg(`Scope Revision Request ${status} successfully!`);
      fetchChallengeDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to review scope revision request');
    } finally {
      setReviewingRevisionId(null);
    }
  };

  const fetchChallengeDetails = async () => {

    try {
      const res = await API.get(`/challenges/${id}`);
      setChallenge(res.data);

      try {
        const commentsRes = await API.get(`/challenges/${id}/comments`);
        setComments(commentsRes.data || []);
      } catch (e) {
        setComments([]);
      }

      try {
        const progressRes = await API.get(`/challenges/${id}/progress`);
        setProgressUpdates(progressRes.data || []);
      } catch (e) {
        setProgressUpdates([]);
      }

      if (user?.role === 'admin' && !res.data.mergedInto) {
        try {
          const params = new URLSearchParams({
            title: res.data.title || '',
            category: res.data.category || '',
            excludeId: id,
          });
          if (res.data.district) params.set('district', res.data.district);
          if (res.data.locality) params.set('locality', res.data.locality);
          const simRes = await API.get(`/challenges/similar?${params.toString()}`);
          setSimilar(simRes.data || []);
        } catch (e) {
          setSimilar([]);
        }
      } else {
        setSimilar([]);
      }

      // Fetch proposals & scope revisions if user is logged in
      if (user) {
        try {
          const propRes = await API.get(`/challenges/${id}/proposals`);
          setProposals(propRes.data);
        } catch (e) {
          // ignore error if unauthorized for proposals
        }

        try {
          const revRes = await API.get(`/challenges/${id}/scope-revisions`);
          setScopeRevisions(revRes.data || []);
        } catch (e) {
          setScopeRevisions([]);
        }

        try {
          const voteRes = await API.get(`/challenges/${id}/hasVoted`);
          setHasVoted(voteRes.data.hasVoted);
        } catch (e) {
          // ignore
        }
      }


    } catch (err) {
      console.error('Error fetching challenge details:', err);
      setError('Failed to load challenge details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallengeDetails();
  }, [id, user]);

  const handleVote = async () => {
    if (!user) {
      alert('Please log in to vote on challenges.');
      return;
    }
    try {
      const res = await API.post(`/challenges/${id}/vote`);
      setChallenge({ ...challenge, votesCount: res.data.votesCount });
      setHasVoted(true);
      setMsg('Vote recorded!');
      setTimeout(() => setMsg(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record vote');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      const res = await API.post(`/challenges/${id}/comments`, { text: commentText });
      setComments([res.data, ...comments]);
      setCommentText('');
    } catch (err) {
      alert('Failed to post comment');
    }
  };

  const handleSubmitProposal = async (e) => {
    e.preventDefault();
    setSubmittingProposal(true);
    try {
      await API.post(`/challenges/${id}/proposals`, {
        solution,
        estimatedCost,
        timeline,
      });
      setMsg('Proposal submitted successfully! Status updated to Under Review.');
      setSolution('');
      fetchChallengeDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit proposal');
    } finally {
      setSubmittingProposal(false);
    }
  };

  const handleSelectProposal = async (proposalId) => {
    if (!window.confirm('Are you sure you want to select this proposal? This will set the challenge status to In Progress.')) {
      return;
    }
    try {
      await API.patch(`/proposals/${proposalId}/select`);
      setMsg('Proposal selected! Challenge is now In Progress.');
      fetchChallengeDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to select proposal');
    }
  };

  const handlePostProgress = async (e) => {
    e.preventDefault();
    if (!progressText.trim()) return;
    setSubmittingProgress(true);
    try {
      const formData = new FormData();
      formData.append('text', progressText.trim());
      if (progressImage) {
        formData.append('image', progressImage);
      }

      await API.post(`/challenges/${id}/progress`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMsg('Progress update posted with evidence!');
      setProgressText('');
      setProgressImage(null);
      setProgressImagePreview('');
      fetchChallengeDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to post progress update');
    } finally {
      setSubmittingProgress(false);
    }
  };

  const handleAdminChangeStatus = async (newStatus, note) => {
    try {
      await API.patch(`/challenges/${id}/status`, { status: newStatus, note });
      setMsg(`Challenge marked as ${newStatus}!`);
      fetchChallengeDetails();
    } catch (err) {
      alert('Failed to update challenge status');
    }
  };

  const handleMerge = async (duplicateId, duplicateTitle) => {
    if (!window.confirm(`Merge “${duplicateTitle}” into this report? It will leave the public feed and its votes will be added here.`)) {
      return;
    }
    try {
      await API.post(`/challenges/${id}/merge`, { duplicateId });
      setMsg('Duplicate merged into this report.');
      fetchChallengeDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to merge');
    }
  };

  const severityBadgeClass = (level) => {
    switch (level) {
      case 'Critical':
        return 'bg-rose-100 text-rose-700';
      case 'High':
        return 'bg-orange-100 text-orange-700';
      case 'Low':
        return 'bg-slate-100 text-slate-600';
      case 'Medium':
      default:
        return 'bg-amber-100 text-amber-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (error || !challenge) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-6 rounded-2xl">
          <AlertCircle className="w-8 h-8 mx-auto mb-2" />
          <h2 className="text-lg font-bold">{error || 'Challenge not found'}</h2>
          <Link to="/" className="text-sm font-semibold text-brand-600 underline mt-2 block">
            Return to Public Feed
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* Back button */}
      <div>
        <Link to="/" className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-brand-600 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Challenges
        </Link>
      </div>

      {msg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-sm font-medium shadow-sm">
          {msg}
        </div>
      )}

      {challenge.mergedInto && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-xl text-sm">
          This report was merged into the main issue:{' '}
          <Link to={`/challenges/${challenge.mergedInto._id || challenge.mergedInto}`} className="font-bold underline">
            {challenge.mergedInto.title || 'Open main report'}
          </Link>
        </div>
      )}

      {challenge.mergedCount > 0 && (
        <div className="bg-slate-100 border border-slate-200 text-slate-700 p-3 rounded-xl text-xs font-medium">
          {challenge.mergedCount} similar report{challenge.mergedCount === 1 ? '' : 's'} merged into this one.
        </div>
      )}

      {scopeRevisions.some((r) => r.status === 'Approved') && (
        <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 text-white rounded-2xl p-5 shadow-md border border-amber-600/40 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-extrabold text-xs uppercase tracking-wider">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            Public Governance Note: Contract Budget & Scope Revised
          </div>
          {(() => {
            const approvedRev = scopeRevisions.find((r) => r.status === 'Approved');
            return (
              <div className="space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span>Official Budget Adjusted: <del className="text-slate-400">{approvedRev.originalCost}</del> → <strong className="text-amber-300 font-bold text-base">{approvedRev.revisedCost}</strong></span>
                  {approvedRev.revisedTimeline && (
                    <span className="text-xs text-amber-200 bg-amber-900/60 px-2.5 py-1 rounded border border-amber-700/50">⏱️ New Timeline: {approvedRev.revisedTimeline}</span>
                  )}
                </div>
                <p className="text-xs text-slate-300 italic pt-1">
                  <strong className="text-amber-200 uppercase text-[10px] not-italic mr-1">Justification:</strong>
                  "{approvedRev.reason}" — {approvedRev.justification} (Approved by Admin)
                </p>
              </div>
            );
          })()}
        </div>
      )}

      {/* Main Detail Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">


        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <span className="text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-md">
            {challenge.category}
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-500 font-medium">📍 {challenge.location}</span>
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${severityBadgeClass(challenge.severity)}`}>
              {challenge.severity || 'Medium'} Severity
            </span>
            {challenge.affectedCount > 0 && (
              <span className="text-xs text-slate-500 font-medium">
                👥 ~{challenge.affectedCount} people affected
              </span>
            )}
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-4 leading-tight">
          {challenge.title}
        </h1>

        <p className="text-slate-700 text-base leading-relaxed mb-6 whitespace-pre-line">
          {challenge.description}
        </p>

        {challenge.image && (
          <div className="mb-6">
            <div className="rounded-xl overflow-hidden max-h-96 border border-slate-200 bg-slate-100 relative">
              <img src={getImageUrl(challenge.image)} alt={challenge.title} className="w-full h-full object-cover" />
            </div>
            {challenge.exifVerified && (
              <div className="mt-2 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg p-3 text-xs flex flex-wrap items-center justify-between gap-2 shadow-sm">
                <div className="flex items-center gap-2 font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Geotag Verified: Photo GPS coordinates match reported location {challenge.exifDistanceKm ? `(${challenge.exifDistanceKm} km away)` : '(On-Site Match)'}</span>
                </div>
                {challenge.exifLatitude && challenge.exifLongitude && (
                  <span className="text-[11px] text-emerald-700 font-mono bg-emerald-100/80 px-2 py-0.5 rounded">📍 Photo EXIF: {challenge.exifLatitude}, {challenge.exifLongitude}</span>
                )}
              </div>
            )}
          </div>
        )}

        {challenge.evidence?.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Additional Evidence
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {challenge.evidence.map((url, i) => (
                <div key={i} className="rounded-lg overflow-hidden h-24 border border-slate-200 bg-slate-100">
                  <img src={getImageUrl(url)} alt={`evidence-${i}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mb-6">
          <ChallengeMapDisplay challenge={challenge} />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4">
          <div className="text-xs text-slate-500">
            Reported by <strong className="text-slate-800">{challenge.createdBy?.name || 'Citizen'}</strong> on{' '}
            {new Date(challenge.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </div>

          <button
            onClick={handleVote}
            disabled={hasVoted}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-sm ${
              hasVoted
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                : 'bg-brand-600 hover:bg-brand-700 text-white'
            }`}
          >
            <ThumbsUp className="w-4 h-4" />
            {hasVoted ? `Voted (${challenge.votesCount})` : `Upvote Challenge (${challenge.votesCount})`}
          </button>
        </div>

      </div>

      {/* Strict 5-Stage Status Timeline Component */}
      <StatusTimeline currentStatus={challenge.status} statusHistory={challenge.statusHistory} />

      {/* Admin Operations Box (If User is Admin) */}
      {user && user.role === 'admin' && (
        <div className="bg-purple-50 border border-purple-200 p-6 rounded-2xl space-y-3">
          <div className="flex items-center gap-2 text-purple-900 font-bold text-sm">
            <ShieldCheck className="w-5 h-5 text-purple-700" /> Admin Control Actions
          </div>
          <p className="text-xs text-purple-800">
            Current Status: <strong>{challenge.status}</strong>. You can manually adjust status or perform action steps below.
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            {challenge.status === 'Pending' && (
              <button
                onClick={() => handleAdminChangeStatus('Open', 'Approved by Admin for public feed')}
                className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-lg hover:bg-emerald-700"
              >
                Approve Challenge (Pending → Open)
              </button>
            )}

            {challenge.status === 'In Progress' && (
              <button
                onClick={() => handleAdminChangeStatus('Resolved', 'Verified institutional work evidence and marked Resolved')}
                className="px-4 py-2 bg-teal-600 text-white font-bold text-xs rounded-lg hover:bg-teal-700 flex items-center gap-1"
              >
                <CheckCircle2 className="w-4 h-4" /> Verify Evidence & Mark Resolved
              </button>
            )}
          </div>
        </div>
      )}

      {/* Institution Proposal Submission Section */}
      {user && user.role === 'institution' && (challenge.status === 'Open' || challenge.status === 'Under Review') && (
        <div className="bg-indigo-50 border border-indigo-200 p-6 rounded-2xl space-y-4">
          <div className="flex items-center gap-2 text-indigo-900 font-bold text-base">
            <Building2 className="w-5 h-5 text-indigo-700" /> Submit Resolution Proposal
          </div>
          <p className="text-xs text-indigo-800">
            As an accredited academic/industry institution, submit your proposed technical solution, timeline, and estimated cost.
          </p>

          <form onSubmit={handleSubmitProposal} className="space-y-4 bg-white p-5 rounded-xl border border-indigo-100">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Proposed Solution & Methodology *
              </label>
              <textarea
                required
                rows={3}
                value={solution}
                onChange={(e) => setSolution(e.target.value)}
                placeholder="Describe your technical approach, equipment needed, and execution strategy..."
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Estimated Cost * <span className="text-indigo-600 text-[10px] lowercase font-normal">(labeled as illustrative)</span>
                </label>
                <input
                  type="text"
                  required
                  value={estimatedCost}
                  onChange={(e) => setEstimatedCost(e.target.value)}
                  placeholder="e.g. ₹18,000 (illustrative)"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Estimated Timeline *
                </label>
                <input
                  type="text"
                  required
                  value={timeline}
                  onChange={(e) => setTimeline(e.target.value)}
                  placeholder="e.g. 15 days"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submittingProposal}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-sm transition-colors shadow-sm disabled:opacity-50"
            >
              {submittingProposal ? 'Submitting Proposal...' : 'Submit Institutional Proposal'}
            </button>
          </form>
        </div>
      )}

      {/* Proposals List & Evaluation Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-600" />
            Submitted Proposals ({proposals.length})
          </span>
        </h3>

        {proposals.length === 0 ? (
          <p className="text-sm text-slate-500 italic py-4">No proposals submitted yet.</p>
        ) : (
          <div className="space-y-4">
            {proposals.map((prop) => (
              <div
                key={prop._id}
                className={`p-5 rounded-xl border transition-all ${
                  prop.status === 'Selected'
                    ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-200'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                  <div>
                    <span className="font-bold text-slate-900 text-sm">
                      {prop.submittedBy?.organization || prop.submittedBy?.name || 'Institution'}
                    </span>
                    <span className="text-xs text-slate-500 block">
                      Submitted by: {prop.submittedBy?.name} ({prop.submittedBy?.email})
                    </span>
                  </div>

                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      prop.status === 'Selected'
                        ? 'bg-emerald-600 text-white'
                        : prop.status === 'Rejected'
                        ? 'bg-slate-200 text-slate-600'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {prop.status === 'Selected' ? '✓ Selected Proposal' : prop.status}
                  </span>
                </div>

                <p className="text-sm text-slate-700 mb-3">{prop.solution}</p>

                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600 border-t border-slate-200/60 pt-3">
                  <div>💰 Cost: <span className="text-emerald-700 font-bold">{prop.estimatedCost}</span></div>
                  <div>⏱️ Timeline: <span className="text-indigo-700 font-bold">{prop.timeline}</span></div>
                </div>

                {user && user.role === 'admin' && prop.status !== 'Selected' && (
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <button
                      onClick={() => handleSelectProposal(prop._id)}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-sm"
                    >
                      Select & Assign this Proposal
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Progress Updates Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-teal-600" />
            Execution & Progress Evidence ({progressUpdates.length})
          </h3>
        </div>

        {/* Institution post progress form */}
        {user && (user.role === 'institution' || user.role === 'admin') && challenge.status === 'In Progress' && (
          <form onSubmit={handlePostProgress} className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Post New Execution Progress & Ground Evidence
            </h4>
            <textarea
              required
              rows={3}
              value={progressText}
              onChange={(e) => setProgressText(e.target.value)}
              placeholder="Detail work completed (e.g., borehole flushed, new pump handle installed and tested)..."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 bg-white"
            />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="cursor-pointer text-xs font-semibold text-teal-700 hover:underline flex items-center gap-1">
                <Upload className="w-4 h-4" /> Attach Evidence Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files[0]) {
                      setProgressImage(e.target.files[0]);
                      setProgressImagePreview(URL.createObjectURL(e.target.files[0]));
                    }
                  }}
                  className="hidden"
                />
              </label>

              <button
                type="submit"
                disabled={submittingProgress}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-lg shadow-sm disabled:opacity-50"
              >
                {submittingProgress ? 'Posting...' : 'Post Progress Evidence'}
              </button>
            </div>

            {progressImagePreview && (
              <div className="mt-2 rounded-lg overflow-hidden h-32 max-w-xs border border-slate-200">
                <img src={progressImagePreview} alt="Evidence preview" className="w-full h-full object-cover" />
              </div>
            )}
          </form>
        )}

        {/* Progress List */}
        {progressUpdates.length === 0 ? (
          <p className="text-sm text-slate-500 italic py-2">No progress updates posted yet.</p>
        ) : (
          <div className="space-y-4">
            {progressUpdates.map((update) => (
              <div key={update._id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-800">
                    {update.postedBy?.organization || update.postedBy?.name || 'Institution Partner'}
                  </span>
                  <span className="text-slate-400">
                    {new Date(update.createdAt).toLocaleString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-sm text-slate-700">{update.text}</p>
                {update.image && (
                  <div className="rounded-lg overflow-hidden h-44 max-w-md border border-slate-200 mt-2">
                    <img src={update.image} alt="Progress evidence" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Community Comments Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-brand-600" />
          Community Discussion ({comments.length})
        </h3>

        {user ? (
          <form onSubmit={handleAddComment} className="flex gap-2">
            <input
              type="text"
              required
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment or community feedback..."
              className="flex-1 px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500"
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-sm shadow-sm flex items-center gap-1 shrink-0"
            >
              <Send className="w-4 h-4" /> Post
            </button>
          </form>
        ) : (
          <p className="text-xs text-slate-500">
            <Link to="/login" className="text-brand-600 font-bold underline">
              Log in
            </Link>{' '}
            to participate in community comments.
          </p>
        )}

        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c._id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-slate-800">{c.user?.name || 'Citizen'}</span>
                <span className="text-slate-400">
                  {new Date(c.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </span>
              </div>
              <p className="text-slate-600">{c.text}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default ChallengeDetail;