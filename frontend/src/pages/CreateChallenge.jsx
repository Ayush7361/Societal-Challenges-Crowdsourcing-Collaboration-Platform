import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BrainCircuit, CheckCircle2, MapPin, PlusCircle, ShieldAlert, SlidersHorizontal, Upload } from 'lucide-react';
import API from '../services/api';
import LocationPickerMap from '../components/LocationPickerMap';

const CATEGORIES = ['Water & Sanitation', 'Education', 'Infrastructure', 'Health', 'Environment', 'Governance', 'Other'];
const SEVERITIES = ['Low', 'Medium', 'High', 'Critical'];

const CreateChallenge = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [evidenceFiles, setEvidenceFiles] = useState([]);
  const [category, setCategory] = useState('Other');
  const [severity, setSeverity] = useState('Medium');
  const [locality, setLocality] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('');
  const [landmark, setLandmark] = useState('');
  const [pincode, setPincode] = useState('');
  const [coords, setCoords] = useState(null);
  const [regionType, setRegionType] = useState('Rural');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [similar, setSimilar] = useState([]);
  const [aiResult, setAiResult] = useState(null);
  const [checking, setChecking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const searchText = title.trim() || description.trim();

  useEffect(() => {
    if (searchText.length < 6) {
      setSimilar([]);
      return undefined;
    }
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ title: searchText, category });
        const locationParts = locationInput.split(',').map((part) => part.trim());
        if (district.trim() || locationParts[1]) params.set('district', district.trim() || locationParts[1]);
        const res = await API.get(`/challenges/similar?${params.toString()}`);
        setSimilar(res.data || []);
      } catch {
        setSimilar([]);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchText, category, district, locationInput]);

  const checkReport = async () => {
    setError('');
    if (description.trim().length < 20) return setError('Describe what happened and how it affects people in one short sentence.');
    if (!locationInput.trim()) return setError('Add the village/ward, district, and state before checking the report.');
    if (!imageFile && evidenceFiles.length === 0) return setError('Add at least one ground photo before checking the report.');

    setChecking(true);
    try {
      const { data } = await API.post('/challenges/ai-analyze', { title: title.trim(), location: locationInput.trim(), description: description.trim() });
      setAiResult(data);
      setCategory(data.category);
      setSeverity(data.severity);
      if (!title.trim() && data.suggestedTitle) setTitle(data.suggestedTitle);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to check the report. You can still complete it manually.');
    } finally {
      setChecking(false);
    }
  };

  const submitReport = async (event) => {
    event.preventDefault();
    setError('');
    const parts = locationInput.split(',').map((part) => part.trim()).filter(Boolean);
    const resolvedLocality = locality.trim() || parts[0] || '';
    const resolvedDistrict = district.trim() || parts[1] || '';
    const resolvedState = state.trim() || parts[2] || '';
    const finalTitle = title.trim() || aiResult?.suggestedTitle || description.trim().slice(0, 120);

    if (description.trim().length < 20) return setError('Describe what happened and how it affects people in one short sentence.');
    if (!resolvedLocality || !resolvedDistrict || !resolvedState) {
      setShowAdvanced(true);
      return setError('Use “Village/Ward, District, State” for location, or fill the detailed location fields.');
    }
    if (!imageFile && evidenceFiles.length === 0) return setError('At least one ground photo is required.');

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', finalTitle);
      formData.append('description', description.trim());
      formData.append('locality', resolvedLocality);
      formData.append('district', resolvedDistrict);
      formData.append('state', resolvedState);
      formData.append('landmark', landmark.trim());
      formData.append('pincode', pincode.trim());
      formData.append('regionType', regionType);
      formData.append('category', category);
      formData.append('severity', severity);
      if (coords?.lat && coords?.lng) {
        formData.append('latitude', coords.lat);
        formData.append('longitude', coords.lng);
      }
      if (imageFile) formData.append('image', imageFile);
      evidenceFiles.forEach((file) => formData.append('evidence', file));
      const { data } = await API.post('/challenges', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      navigate(`/challenges/${data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit the challenge.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="mb-6 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2 text-brand-600 font-bold text-sm mb-1 uppercase tracking-wider"><PlusCircle className="w-4 h-4" /> Citizen Portal</div>
          <h1 className="text-2xl font-extrabold text-slate-900">Report a Grassroots Challenge</h1>
          <p className="text-sm text-slate-500 mt-1">Add a photo, exact location, and a short explanation. AI helps you review—not submit—the report.</p>
        </div>

        {error && <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm p-3 rounded-lg flex items-center gap-2"><ShieldAlert className="w-4 h-4 shrink-0" /> {error}</div>}

        <form onSubmit={submitReport} className="space-y-5">
          <div><label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">Short title <span className="normal-case text-slate-400 font-normal">(optional—AI can suggest one)</span></label><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Broken handpump near the middle school" className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl bg-slate-50/50" /></div>
          <div><label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">What happened? *</label><textarea required rows={3} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Describe the issue and its impact, e.g. The handpump has been dry for three days and nearby families have no drinking water." className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl bg-slate-50/50" /></div>
          <div><label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">Exact location *</label><div className="relative"><MapPin className="w-4 h-4 text-rose-500 absolute left-3.5 top-3" /><input required value={locationInput} onChange={(event) => setLocationInput(event.target.value)} placeholder="Village/Ward, District, State" className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-300 rounded-xl bg-slate-50/50" /></div></div>
          <div><label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">Ground photo *</label><div className="border-2 border-dashed border-slate-300 rounded-xl p-5 text-center bg-slate-50/50"><input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="challenge-image-upload" /><label htmlFor="challenge-image-upload" className="cursor-pointer flex flex-col items-center gap-2"><Upload className="w-8 h-8 text-slate-400" /><span className="text-xs font-bold text-brand-600">Upload photo evidence</span><span className="text-[11px] text-slate-400">PNG, JPG, WEBP up to 5MB</span></label>{imagePreview && <img src={imagePreview} alt="Selected evidence" className="mt-3 h-40 max-w-sm mx-auto rounded-lg object-cover border border-slate-200" />}</div></div>

          <button type="button" onClick={checkReport} disabled={checking || loading} className="w-full py-3 px-5 border-2 border-brand-600 text-brand-700 font-bold rounded-xl flex justify-center items-center gap-2 disabled:opacity-50"><BrainCircuit className="w-5 h-5" /> {checking ? 'Checking your report…' : 'Check my report'}</button>

          {aiResult && <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 space-y-3 text-sm"><p className="font-bold text-indigo-950">Review AI suggestions before submitting</p><p className="text-indigo-900">{aiResult.reasoning}</p>{aiResult.qualityChecks?.map((check) => <p key={check} className="text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded p-2">{check}</p>)}<div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><label className="text-xs font-bold text-slate-700">Category<select value={category} onChange={(event) => setCategory(event.target.value)} className="mt-1 block w-full p-2 border border-slate-300 rounded-lg bg-white">{CATEGORIES.map((item) => <option key={item}>{item}</option>)}</select></label><label className="text-xs font-bold text-slate-700">Severity<select value={severity} onChange={(event) => setSeverity(event.target.value)} className="mt-1 block w-full p-2 border border-slate-300 rounded-lg bg-white">{SEVERITIES.map((item) => <option key={item}>{item}</option>)}</select></label></div></div>}

          {similar.length > 0 && <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-2"><p className="text-xs font-bold text-amber-900 uppercase tracking-wider">Possible similar reports</p>{similar.slice(0, 3).map((item) => <Link key={item._id} to={`/challenges/${item._id}`} className="block bg-white border border-amber-100 rounded-lg px-3 py-2 text-sm font-semibold text-slate-900 hover:text-brand-700">{item.title}<span className="block text-[11px] font-normal text-slate-500">{item.location} · {item.votesCount || 0} votes</span></Link>)}</div>}

          <div className="pt-2 border-t border-slate-100"><button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="text-xs font-bold text-slate-500 hover:text-brand-600 flex items-center gap-1.5"><SlidersHorizontal className="w-3.5 h-3.5" /> {showAdvanced ? 'Hide location details' : 'Add map pin or edit location details'}</button></div>
          {showAdvanced && <div className="space-y-4 bg-slate-50 p-4 rounded-xl"><div className="grid grid-cols-1 sm:grid-cols-3 gap-3"><input value={locality} onChange={(event) => setLocality(event.target.value)} placeholder="Village / Ward" className="p-2 text-sm border border-slate-300 rounded-lg" /><input value={district} onChange={(event) => setDistrict(event.target.value)} placeholder="District" className="p-2 text-sm border border-slate-300 rounded-lg" /><input value={state} onChange={(event) => setState(event.target.value)} placeholder="State" className="p-2 text-sm border border-slate-300 rounded-lg" /></div><input value={landmark} onChange={(event) => setLandmark(event.target.value)} placeholder="Landmark (optional)" className="w-full p-2 text-sm border border-slate-300 rounded-lg" /><input value={pincode} onChange={(event) => setPincode(event.target.value)} placeholder="Pincode (optional)" className="w-full p-2 text-sm border border-slate-300 rounded-lg" /><LocationPickerMap initialLat={coords?.lat} initialLng={coords?.lng} onChange={setCoords} /><input type="file" accept="image/*" multiple onChange={(event) => setEvidenceFiles(Array.from(event.target.files).slice(0, 4))} className="w-full text-xs" /></div>}

          <button type="submit" disabled={loading || checking} className="w-full py-3.5 px-6 bg-brand-600 hover:bg-brand-700 text-white font-black rounded-xl shadow-md disabled:opacity-50">{loading ? 'Submitting report…' : 'Submit report'}</button>
          <p className="text-center text-[11px] text-slate-500 flex justify-center items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> You review and control all submitted information.</p>
        </form>
      </div>
    </div>
  );
};

export default CreateChallenge;
