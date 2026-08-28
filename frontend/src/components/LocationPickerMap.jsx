import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, CheckCircle, Crosshair } from 'lucide-react';

// Fix Leaflet default marker icon issue with bundlers (Vite/Webpack)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Component to handle map clicks and move marker
function MapEvents({ position, setPosition, onChange }) {
  useMapEvents({
    click(e) {
      const newPos = { lat: Number(e.latlng.lat.toFixed(6)), lng: Number(e.latlng.lng.toFixed(6)) };
      setPosition(newPos);
      if (onChange) onChange(newPos);
    },
  });
  return null;
}

// Component to recalculate map center when position changes externally (e.g., Geolocation)
function RecenterMap({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position?.lat && position?.lng) {
      map.setView([position.lat, position.lng], 15);
    }
  }, [position, map]);
  return null;
}

const LocationPickerMap = ({ initialLat, initialLng, onChange }) => {
  // Default center (Jharkhand / Central India)
  const defaultCenter = { lat: initialLat || 23.5000, lng: initialLng || 85.0000 };
  const [position, setPosition] = useState(
    initialLat && initialLng ? { lat: Number(initialLat), lng: Number(initialLng) } : null
  );
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState('');

  const handleMarkerDrag = (e) => {
    const latLng = e.target.getLatLng();
    const newPos = { lat: Number(latLng.lat.toFixed(6)), lng: Number(latLng.lng.toFixed(6)) };
    setPosition(newPos);
    if (onChange) onChange(newPos);
  };

  const handleUseMyLocation = () => {
    setLocating(true);
    setGeoError('');
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser');
      setLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newPos = {
          lat: Number(pos.coords.latitude.toFixed(6)),
          lng: Number(pos.coords.longitude.toFixed(6)),
        };
        setPosition(newPos);
        if (onChange) onChange(newPos);
        setLocating(false);
      },
      (err) => {
        console.error('Geolocation Error:', err);
        setGeoError('Could not fetch current location. Click on the map manually to place pin.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
          <MapPin className="w-4 h-4 text-brand-600" /> Interactive Map Pin Picker
        </div>
        <button
          type="button"
          onClick={handleUseMyLocation}
          disabled={locating}
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-lg border border-brand-200 transition-colors disabled:opacity-50"
        >
          {locating ? (
            <span className="inline-block animate-spin">⌛</span>
          ) : (
            <Navigation className="w-3.5 h-3.5" />
          )}
          {locating ? 'Locating...' : 'Use My Current Location'}
        </button>
      </div>

      {geoError && (
        <div className="text-xs text-rose-600 bg-rose-50 p-2 rounded-md border border-rose-200">
          {geoError}
        </div>
      )}

      {/* Map Canvas */}
      <div className="relative rounded-xl overflow-hidden border border-slate-300 shadow-inner h-64 z-0">
        <MapContainer
          center={position ? [position.lat, position.lng] : [defaultCenter.lat, defaultCenter.lng]}
          zoom={position ? 14 : 6}
          scrollWheelZoom={true}
          className="w-full h-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapEvents position={position} setPosition={setPosition} onChange={onChange} />

          {position && <RecenterMap position={position} />}

          {position && (
            <Marker
              position={[position.lat, position.lng]}
              draggable={true}
              eventHandlers={{ dragend: handleMarkerDrag }}
            />
          )}
        </MapContainer>
      </div>

      <div className="flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200">
        {position ? (
          <div className="flex items-center gap-2 text-emerald-700 font-medium">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>
              Coordinates Pinned: <strong className="font-mono">{position.lat}, {position.lng}</strong>
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-slate-500 italic">
            <Crosshair className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Click anywhere on the map or drag the pin to set exact coordinates</span>
          </div>
        )}

        {position && (
          <button
            type="button"
            onClick={() => {
              setPosition(null);
              if (onChange) onChange(null);
            }}
            className="text-[11px] font-semibold text-rose-600 hover:underline"
          >
            Clear Pin
          </button>
        )}
      </div>
    </div>
  );
};

export default LocationPickerMap;
