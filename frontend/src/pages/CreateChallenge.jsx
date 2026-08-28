import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { PlusCircle, Upload, MapPin, Tag, CheckCircle2, ShieldAlert } from 'lucide-react';

const CreateChallenge = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [locality, setLocality] = useState('');
  const [landmark, setLandmark] = useState('');
  const [pincode, setPincode] = useState('');
  const [regionType, setRegionType] = useState('Rural');
  const [category, setCategory] = useState('Water & Sanitation');
  const [severity, setSeverity] = useState('Medium');
  const [affectedCount, setAffectedCount] = useState('');
  const [affectedWho, setAffectedWho] = useState('');
  const [localContext, setLocalContext] = useState('');
  const [baselineMetric, setBaselineMetric] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [evidenceFiles, setEvidenceFiles] = useState([]);
  const [similar, setSimilar] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleEvidenceChange = (e) => {
    setEvidenceFiles(Array.from(e.target.files).slice(0, 4));
  };

  useEffect(() => {
    if (title.trim().length < 6) {
      setSimilar([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({
          title: title.trim(),
          category,
        });
        if (district.trim()) params.set('district', district.trim());
        if (locality.trim()) params.set('locality', locality.trim());
        const res = await API.get(`/challenges/similar?${params.toString()}`);
        setSimilar(res.data || []);
      } catch (err) {
        setSimilar([]);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [title, category, district, locality]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!title.trim() || !description.trim()) {
      setError('Title and description are required');
      return;
    }
    if (!state.trim() || !district.trim() || !locality.trim()) {
      setError('Exact location is required: state, district, and village/ward. “There is a water shortage” is not enough.');
      return;
    }
    if (!affectedWho.trim()) {
      setError('Say who is affected — households, school children, farmers, vendors, etc.');
      return;
    }
    if (!imageFile && evidenceFiles.length === 0) {
      setError('At least one ground photo is required as evidence.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('state', state.trim());
      formData.append('district', district.trim());
      formData.append('locality', locality.trim());
      formData.append('landmark', landmark.trim());
      formData.append('pincode', pincode.trim());
      formData.append('regionType', regionType);
      formData.append('category', category);
      formData.append('severity', severity);
      formData.append('affectedCount', affectedCount || 0);
      formData.append('affectedWho', affectedWho.trim());
      formData.append('localContext', localContext.trim());
      formData.append('baselineMetric', baselineMetric.trim());
      if (imageFile) {
        formData.append('image', imageFile);
      }
      evidenceFiles.forEach((file) => formData.append('evidence', file));

      const res = await API.post('/challenges', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSuccess('Challenge created successfully! Sent for Admin moderation.');
      setTimeout(() => {
        navigate(`/challenges/${res.data._id}`);
      }, 1500);
    } catch (err) {
      console.error('Create Challenge Error:', err);
      setError(err.response?.data?.message || 'Failed to submit challenge');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">

        <div className="mb-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2 text-brand-600 font-bold text-sm mb-1 uppercase tracking-wider">
            <PlusCircle className="w-4 h-4" /> Citizen Portal
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Report a Grassroots Challenge</h1>
          <p className="text-sm text-slate-500 mt-1">
            Name the exact place and who is affected. If this issue is already reported, join that report instead of creating a copy.
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm p-3 rounded-lg flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm p-3 rounded-lg flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Challenge Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Handpump not working near Government Middle School"
              className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {similar.length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-2">
              <p className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                Possible same issue already reported
              </p>
              <p className="text-[11px] text-amber-800">
                If this is a duplicate, open the existing report and upvote it instead of creating another.
              </p>
              <ul className="space-y-2">
                {similar.map((item) => (
                  <li key={item._id} className="bg-white border border-amber-100 rounded-lg px-3 py-2 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{item.title}</p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {item.location || [item.locality, item.district].filter(Boolean).join(', ')} · {item.votesCount || 0} votes
                      </p>
                    </div>
                    <Link
                      to={`/challenges/${item._id}`}
                      className="shrink-0 text-xs font-bold text-brand-700 hover:underline"
                    >
                      Open existing
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Category *
              </label>
              <div className="relative">
                <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 bg-white"
                >
                  <option value="Water & Sanitation">Water & Sanitation</option>
                  <option value="Education">Education</option>
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Health">Health</option>
                  <option value="Environment">Environment</option>
                  <option value="Governance">Governance</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Region type *
              </label>
              <select
                value={regionType}
                onChange={(e) => setRegionType(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 bg-white"
              >
                <option value="Rural">Rural</option>
                <option value="Urban">Urban</option>
                <option value="Tribal">Tribal / Aspirational</option>
                <option value="Peri-urban">Peri-urban</option>
              </select>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <MapPin className="w-4 h-4 text-rose-500" /> Exact location — not a slogan
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                required
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="State *"
                className="px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
              />
              <input
                required
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="District *"
                className="px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
              />
              <input
                required
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                placeholder="Village / ward / mohalla *"
                className="px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
              />
              <input
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="PIN code"
                className="px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
              />
            </div>
            <input
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              placeholder="Landmark (school, haat, tank, lane number)"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Severity *
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 bg-white"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                People affected (approx.)
              </label>
              <input
                type="number"
                min="0"
                value={affectedCount}
                onChange={(e) => setAffectedCount(e.target.value)}
                placeholder="e.g. 200"
                className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Who is affected *
            </label>
            <input
              required
              value={affectedWho}
              onChange={(e) => setAffectedWho(e.target.value)}
              placeholder="e.g. 220 school children and 40 Adivasi households on this pump"
              className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Why this region’s version is different
            </label>
            <textarea
              rows={2}
              value={localContext}
              onChange={(e) => setLocalContext(e.target.value)}
              placeholder="Urban piped leakage vs rural borehole failure — what would be the wrong copy-paste fix here?"
              className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Baseline measure (before any solution)
            </label>
            <input
              value={baselineMetric}
              onChange={(e) => setBaselineMetric(e.target.value)}
              placeholder="e.g. 0 working pumps in 1 km / 20 minutes supply per day"
              className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Detailed description *
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Background, when it started, and what support is needed..."
              className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Ground photo (required)
            </label>
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-brand-500 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="challenge-image-upload"
              />
              <label htmlFor="challenge-image-upload" className="cursor-pointer flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-slate-400" />
                <span className="text-xs font-semibold text-brand-600">Click to upload photo evidence</span>
                <span className="text-[11px] text-slate-400">PNG, JPG, WEBP up to 5MB</span>
              </label>

              {imagePreview && (
                <div className="mt-3 rounded-lg overflow-hidden h-40 max-w-sm mx-auto border border-slate-200">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Additional evidence photos (optional, up to 4)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleEvidenceChange}
              className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700"
            />
            {evidenceFiles.length > 0 && (
              <p className="text-[11px] text-slate-400 mt-1">{evidenceFiles.length} file(s) selected</p>
            )}
          </div>

          <div className="pt-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {loading ? 'Submitting Challenge...' : 'Submit Challenge for Moderation'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default CreateChallenge;
