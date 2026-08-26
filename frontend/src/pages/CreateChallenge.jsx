import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { PlusCircle, Upload, MapPin, Tag, FileText, CheckCircle2, ShieldAlert } from 'lucide-react';

const CreateChallenge = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('Water & Sanitation');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!title.trim() || !description.trim() || !location.trim()) {
      setError('Title, description, and location are required');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('location', location.trim());
      formData.append('category', category);
      if (imageFile) {
        formData.append('image', imageFile);
      }

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
            Describe the societal problem in your area so institutions and admins can collaborate to solve it.
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

        <form onSubmit={handleSubmit} className="space-y-5">
          
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
                Location *
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Dumka, Jharkhand"
                  className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Detailed Description *
            </label>
            <div className="relative">
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain the background, severity, who is affected, and any specific support needed..."
                className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Upload Ground Photo (Optional)
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
