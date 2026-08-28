import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { MapPin, ExternalLink, ThumbsUp, AlertTriangle } from 'lucide-react';

// Fix default Leaflet icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom colored icons for severity levels
const createCustomIcon = (severity) => {
  let color = '#3b82f6'; // default blue
  if (severity === 'Critical') color = '#e11d48'; // red
  if (severity === 'High') color = '#f97316'; // orange
  if (severity === 'Medium') color = '#f59e0b'; // amber
  if (severity === 'Low') color = '#64748b'; // slate

  const svgHtml = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="32" height="32" stroke="#ffffff" stroke-width="1.5">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  `;

  return L.divIcon({
    html: svgHtml,
    className: 'custom-map-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

const ChallengeMapDisplay = ({ challenge, challenges = [], height = '350px' }) => {
  // If single challenge mode
  if (challenge) {
    const hasCoords = challenge.latitude && challenge.longitude;
    const center = hasCoords ? [challenge.latitude, challenge.longitude] : [23.5000, 85.0000];

    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <MapPin className="w-4 h-4 text-rose-500" /> Ground Location Map
          </div>
          {hasCoords && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${challenge.latitude},${challenge.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline"
            >
              Open in Google Maps <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        {!hasCoords ? (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-xs text-amber-800 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <p className="font-bold">Approximate text location provided</p>
              <p className="mt-0.5">Location: {challenge.location || [challenge.locality, challenge.district, challenge.state].filter(Boolean).join(', ')}</p>
            </div>
          </div>
        ) : (
          <div className="relative rounded-xl overflow-hidden border border-slate-200 z-0" style={{ height }}>
            <MapContainer center={center} zoom={15} scrollWheelZoom={false} className="w-full h-full">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={center} icon={createCustomIcon(challenge.severity)}>
                <Popup>
                  <div className="p-1 space-y-1 max-w-xs">
                    <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                      {challenge.category}
                    </span>
                    <h4 className="font-bold text-slate-900 text-xs leading-snug">{challenge.title}</h4>
                    <p className="text-[11px] text-slate-600 truncate">{challenge.location}</p>
                    <p className="text-[10px] font-mono text-brand-700">
                      📍 {challenge.latitude.toFixed(5)}, {challenge.longitude.toFixed(5)}
                    </p>
                  </div>
                </Popup>
              </Marker>
            </MapContainer>
          </div>
        )}
      </div>
    );
  }

  // Multi-challenge mode (for Home page or Feed)
  const validChallenges = challenges.filter((c) => c.latitude && c.longitude);

  if (validChallenges.length === 0) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center text-slate-500 text-xs">
        <MapPin className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        No mapped challenges with GPS coordinates available in this view.
      </div>
    );
  }

  // Calculate bounding center
  const avgLat = validChallenges.reduce((acc, c) => acc + c.latitude, 0) / validChallenges.length;
  const avgLng = validChallenges.reduce((acc, c) => acc + c.longitude, 0) / validChallenges.length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between text-xs font-bold text-slate-800">
        <span className="flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-brand-600" /> Interactive Map View ({validChallenges.length} Pinned Issues)
        </span>
        <span className="text-[11px] text-slate-500 font-normal">Click pins for details</span>
      </div>

      <div className="relative rounded-xl overflow-hidden border border-slate-200 z-0" style={{ height }}>
        <MapContainer center={[avgLat, avgLng]} zoom={6} scrollWheelZoom={true} className="w-full h-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {validChallenges.map((c) => (
            <Marker key={c._id} position={[c.latitude, c.longitude]} icon={createCustomIcon(c.severity)}>
              <Popup>
                <div className="p-1 space-y-1.5 max-w-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                      {c.category}
                    </span>
                    <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded">
                      {c.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs leading-snug">{c.title}</h4>
                  <p className="text-[11px] text-slate-600">{c.location || `${c.locality}, ${c.district}`}</p>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3 text-brand-600" /> {c.votesCount || 0} votes
                    </span>
                    <Link
                      to={`/challenges/${c._id}`}
                      className="text-[11px] font-bold text-brand-600 hover:underline flex items-center gap-0.5"
                    >
                      View Report →
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default ChallengeMapDisplay;
