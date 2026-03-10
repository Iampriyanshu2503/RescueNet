import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { MapPin, Navigation, Clock, Users, AlertCircle, Loader2, ExternalLink, RefreshCw } from 'lucide-react';

/* ─────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────── */
const LIBRARIES = ['places']; // stable reference – prevents infinite re-renders

const MAP_STYLES = [
  { featureType: 'poi',     elementType: 'labels',          stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', elementType: 'labels',          stylers: [{ visibility: 'off' }] },
  { featureType: 'water',   elementType: 'geometry',        stylers: [{ color: '#dbe9f7' }] },
  { featureType: 'road',    elementType: 'geometry',        stylers: [{ color: '#ffffff' }] },
  { featureType: 'road',    elementType: 'geometry.stroke', stylers: [{ color: '#e2e8f0' }] },
  { featureType: 'landscape', elementType: 'geometry',      stylers: [{ color: '#f8fafc' }] },
  { featureType: 'road.highway', elementType: 'geometry',   stylers: [{ color: '#e2e8f0' }] },
];

const MAP_OPTIONS = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  scaleControl: false,
  streetViewControl: false,
  rotateControl: false,
  fullscreenControl: true,
  styles: MAP_STYLES,
};

const DEFAULT_CENTER = { lat: 40.7128, lng: -74.0060 }; // NYC fallback

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */

/**
 * Normalise coordinates from multiple possible shapes:
 *   [lat, lng]                 → { lat, lng }
 *   { lat, lng }               → { lat, lng }
 *   { latitude, longitude }    → { lat, lng }
 * Returns null if coordinates are invalid.
 */
function normaliseCoords(raw) {
  if (!raw) return null;
  if (Array.isArray(raw)) {
    const [a, b] = raw;
    const lat = parseFloat(a), lng = parseFloat(b);
    if (isNaN(lat) || isNaN(lng)) return null;
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
    return { lat, lng };
  }
  if (typeof raw === 'object') {
    const lat = parseFloat(raw.lat ?? raw.latitude);
    const lng = parseFloat(raw.lng ?? raw.longitude);
    if (isNaN(lat) || isNaN(lng)) return null;
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
    return { lat, lng };
  }
  return null;
}

/** Haversine straight-line distance (km) as fallback when Distance Matrix fails */
function haversineKm(a, b) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const sinA = Math.sin(dLat / 2);
  const sinB = Math.sin(dLng / 2);
  const c = sinA * sinA + Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * sinB * sinB;
  const d = R * 2 * Math.atan2(Math.sqrt(c), Math.sqrt(1 - c));
  return d;
}

function formatDistance(km) {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

/** SVG marker URL for food listings */
function makeFoodMarker(available) {
  const fill = available ? '%2322c55e' : '%2394a3b8';
  const emoji = available ? '🍽' : '⏰';
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="44" height="54" viewBox="0 0 44 54"><ellipse cx="22" cy="50" rx="8" ry="3" fill="rgba(0,0,0,0.15)"/><path d="M22 2 C11 2 3 10 3 20 C3 33 22 50 22 50 C22 50 41 33 41 20 C41 10 33 2 22 2Z" fill="${fill}" stroke="white" stroke-width="2.5"/><text x="22" y="26" font-size="15" text-anchor="middle" fill="white">${emoji}</text></svg>`;
}

/** SVG marker for user location */
const USER_MARKER = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="44" height="54" viewBox="0 0 44 54"><ellipse cx="22" cy="50" rx="8" ry="3" fill="rgba(0,0,0,0.15)"/><path d="M22 2 C11 2 3 10 3 20 C3 33 22 50 22 50 C22 50 41 33 41 20 C41 10 33 2 22 2Z" fill="%233b82f6" stroke="white" stroke-width="2.5"/><text x="22" y="26" font-size="15" text-anchor="middle" fill="white">📍</text></svg>`;

/* ─────────────────────────────────────────────
   ERROR PANEL
───────────────────────────────────────────── */
function MapErrorPanel({ error, onRetry }) {
  const isApiKey = error?.toString().includes('ApiNotActivated') ||
                   error?.toString().includes('InvalidKeyMapError') ||
                   error?.toString().includes('RefererNotAllowed');

  return (
    <div style={{
      width: '100%', height: '100%', minHeight: 200,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg,#fef2f2,#fff7ed)',
      border: '1.5px solid #fecaca', borderRadius: 14, padding: '28px 24px', textAlign: 'center',
    }}>
      <div style={{ width: 52, height: 52, borderRadius: 16, background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
        <AlertCircle size={26} color="#dc2626" />
      </div>
      <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#991b1b', marginBottom: 8 }}>
        {isApiKey ? 'Maps API not activated' : 'Map failed to load'}
      </h3>
      {isApiKey ? (
        <p style={{ fontSize: '0.78rem', color: '#b91c1c', marginBottom: 14, maxWidth: 320, lineHeight: 1.6 }}>
          Enable <strong>Maps JavaScript API</strong> in the Google Cloud Console for your API key, then refresh.
        </p>
      ) : (
        <p style={{ fontSize: '0.78rem', color: '#b91c1c', marginBottom: 14, maxWidth: 320, lineHeight: 1.6 }}>
          Could not load Google Maps. Check your API key and internet connection.
        </p>
      )}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button onClick={onRetry} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: '#dc2626', border: 'none', color: '#fff', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>
          <RefreshCw size={13} /> Retry
        </button>
        {isApiKey && (
          <a href="https://console.cloud.google.com/apis/library/maps-backend.googleapis.com" target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: '#fff', border: '1px solid #fecaca', color: '#dc2626', fontWeight: 600, fontSize: '0.8rem', textDecoration: 'none' }}>
            <ExternalLink size={13} /> Google Console
          </a>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   LOADING SKELETON
───────────────────────────────────────────── */
function MapSkeleton({ height }) {
  return (
    <div style={{ width: '100%', height, borderRadius: 14, overflow: 'hidden', position: 'relative', background: 'linear-gradient(135deg,#f0f9ff,#f0fdf4)' }}>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid #22c55e', borderTopColor: 'transparent', animation: 'spin 0.9s linear infinite' }} />
        <p style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 500 }}>Loading map…</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}

/* ─────────────────────────────────────────────
   INFO WINDOW CONTENT
───────────────────────────────────────────── */
function ListingInfoContent({ listing, userLocation, onGetDirections }) {
  const [distance, setDistance] = useState(null);
  const coords = normaliseCoords(listing.location?.coordinates);

  useEffect(() => {
    if (!coords || !userLocation) return;
    // Try Distance Matrix first
    const tryDistanceMatrix = async () => {
      try {
        if (!window.google?.maps?.DistanceMatrixService) throw new Error('no-api');
        const svc = new window.google.maps.DistanceMatrixService();
        const res = await svc.getDistanceMatrix({
          origins: [userLocation],
          destinations: [coords],
          travelMode: 'DRIVING',
        });
        const el = res?.rows?.[0]?.elements?.[0];
        if (el?.status === 'OK') {
          setDistance(el.distance.text);
        } else {
          throw new Error('bad-status');
        }
      } catch {
        // Fallback to Haversine
        setDistance(formatDistance(haversineKm(userLocation, coords)));
      }
    };
    tryDistanceMatrix();
  }, [listing._id, userLocation]); // eslint-disable-line

  return (
    <div style={{ fontFamily: 'inherit', minWidth: 200, maxWidth: 260 }}>
      <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
        {listing.foodType || listing.title || 'Food Listing'}
      </h3>
      {listing.description && (
        <p style={{ fontSize: '0.76rem', color: '#64748b', marginBottom: 6, lineHeight: 1.5 }}>{listing.description}</p>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 8 }}>
        {listing.servings && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.75rem', color: '#475569' }}>
            <Users size={12} />{listing.servings} servings
          </div>
        )}
        {distance && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.75rem', color: '#3b82f6' }}>
            <MapPin size={12} />{distance} away
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.75rem' }}>
          <span style={{ padding: '1px 7px', borderRadius: 99, background: listing.status === 'available' ? '#dcfce7' : '#f1f5f9', color: listing.status === 'available' ? '#16a34a' : '#64748b', fontWeight: 600 }}>
            {listing.status || 'available'}
          </span>
        </div>
      </div>
      <button onClick={() => onGetDirections(coords)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '7px 12px', borderRadius: 8, background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', border: 'none', color: '#fff', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer' }}>
        <Navigation size={12} /> Get Directions
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
const InteractiveMap = ({
  foodListings = [],
  userLocation = null,
  onListingClick = null,
  height = '400px',
  showUserLocation = true,
  // Legacy prop support: some callers pass `locations` array with {position,title,info}
  locations = null,
  zoom = 13,
}) => {
  const [selectedListing, setSelectedListing] = useState(null);
  const [mapInstance, setMapInstance]         = useState(null);
  const [retryKey, setRetryKey]               = useState(0);

  // ── Derive the effective listings list ──
  // Support legacy `locations` prop (used inside FoodListingVisibility inline map)
  const effectiveListings = React.useMemo(() => {
    if (foodListings.length > 0) return foodListings;
    if (locations && locations.length > 0) {
      // Normalise legacy shape → FoodDonation-ish shape
      return locations.map((loc, i) => ({
        _id: `loc-${i}`,
        foodType: loc.title || 'Food',
        description: loc.info || '',
        servings: null,
        status: 'available',
        location: { coordinates: loc.position }, // {lat,lng}
      }));
    }
    return [];
  }, [foodListings, locations]);

  // ── Map center ──
  const center = React.useMemo(() => {
    if (userLocation) return userLocation;
    // Try first listing with valid coords
    for (const l of effectiveListings) {
      const c = normaliseCoords(l.location?.coordinates);
      if (c) return c;
    }
    return DEFAULT_CENTER;
  }, [userLocation, effectiveListings]);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '',
    libraries: LIBRARIES,
  });

  const onLoad    = useCallback(map => setMapInstance(map), []);
  const onUnmount = useCallback(()  => setMapInstance(null), []);

  // Re-center when userLocation changes
  useEffect(() => {
    if (mapInstance && userLocation) mapInstance.panTo(userLocation);
  }, [mapInstance, userLocation]);

  const handleGetDirections = useCallback((coords) => {
    if (!coords) return;
    const dest = `${coords.lat},${coords.lng}`;
    const origin = userLocation ? `${userLocation.lat},${userLocation.lng}` : '';
    const url = `https://www.google.com/maps/dir/?api=1&destination=${dest}${origin ? `&origin=${origin}` : ''}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }, [userLocation]);

  const handleMarkerClick = useCallback((listing) => {
    setSelectedListing(listing);
    if (onListingClick) onListingClick(listing);
  }, [onListingClick]);

  const centerOnUser = useCallback(() => {
    if (mapInstance && userLocation) {
      mapInstance.panTo(userLocation);
      mapInstance.setZoom(14);
    }
  }, [mapInstance, userLocation]);

  // ── Render states ──
  if (loadError) {
    return (
      <div style={{ width: '100%', height }}>
        <MapErrorPanel error={loadError} onRetry={() => setRetryKey(k => k + 1)} />
      </div>
    );
  }

  if (!isLoaded) return <MapSkeleton height={height} />;

  const availableCount = effectiveListings.filter(l => l.status === 'available').length;

  return (
    <div style={{ width: '100%', fontFamily: "'DM Sans',system-ui,sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        .map-btn { transition: all 0.2s ease; }
        .map-btn:hover { transform: translateY(-1px); }
      `}</style>

      {/* Legend / stats bar */}
      {effectiveListings.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: 10, animation: 'fadeIn 0.4s ease both' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 11px', borderRadius: 99, background: '#dcfce7', border: '1px solid #bbf7d0', fontSize: '0.72rem', fontWeight: 600, color: '#15803d' }}>
              🍽 {availableCount} available
            </span>
            {effectiveListings.length - availableCount > 0 && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 11px', borderRadius: 99, background: '#f1f5f9', border: '1px solid #e2e8f0', fontSize: '0.72rem', fontWeight: 600, color: '#64748b' }}>
                ⏰ {effectiveListings.length - availableCount} unavailable
              </span>
            )}
            {userLocation && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 11px', borderRadius: 99, background: '#eff6ff', border: '1px solid #bfdbfe', fontSize: '0.72rem', fontWeight: 600, color: '#1d4ed8' }}>
                📍 Your location
              </span>
            )}
          </div>
          {userLocation && (
            <button onClick={centerOnUser} className="map-btn"
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 10, background: '#fff', border: '1px solid #e2e8f0', color: '#475569', fontWeight: 600, fontSize: '0.72rem', cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <Navigation size={12} /> Center on me
            </button>
          )}
        </div>
      )}

      {/* Map */}
      <div style={{ borderRadius: 14, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' }}>
        <GoogleMap
          key={retryKey}
          mapContainerStyle={{ width: '100%', height }}
          center={center}
          zoom={zoom}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={MAP_OPTIONS}
          onClick={() => setSelectedListing(null)}
        >
          {/* Food listing markers */}
          {effectiveListings.map((listing, index) => {
            const coords = normaliseCoords(listing.location?.coordinates);
            if (!coords) return null;
            const key = listing._id || `listing-${index}`;
            const isSelected = selectedListing?._id === listing._id;
            return (
              <Marker
                key={key}
                position={coords}
                icon={{
                  url: makeFoodMarker(listing.status === 'available'),
                  scaledSize: new window.google.maps.Size(isSelected ? 52 : 44, isSelected ? 65 : 54),
                  anchor: new window.google.maps.Point(isSelected ? 26 : 22, isSelected ? 65 : 54),
                }}
                zIndex={isSelected ? 999 : index}
                onClick={() => handleMarkerClick(listing)}
              />
            );
          })}

          {/* User location marker */}
          {showUserLocation && userLocation && (
            <Marker
              position={userLocation}
              icon={{
                url: USER_MARKER,
                scaledSize: new window.google.maps.Size(44, 54),
                anchor: new window.google.maps.Point(22, 54),
              }}
              zIndex={1000}
              onClick={() => setSelectedListing(null)}
            />
          )}

          {/* Info window */}
          {selectedListing && (() => {
            const coords = normaliseCoords(selectedListing.location?.coordinates);
            if (!coords) return null;
            return (
              <InfoWindow
                position={coords}
                onCloseClick={() => setSelectedListing(null)}
                options={{ pixelOffset: new window.google.maps.Size(0, -54) }}
              >
                <ListingInfoContent
                  listing={selectedListing}
                  userLocation={userLocation}
                  onGetDirections={handleGetDirections}
                />
              </InfoWindow>
            );
          })()}
        </GoogleMap>
      </div>

      {/* Empty state */}
      {effectiveListings.length === 0 && !userLocation && (
        <div style={{ marginTop: 10, textAlign: 'center', padding: '8px 0' }}>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>No listings to display on the map</p>
        </div>
      )}
    </div>
  );
};

export default InteractiveMap;