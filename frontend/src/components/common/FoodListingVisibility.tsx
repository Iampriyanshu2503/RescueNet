import React, { useState } from 'react';
import {
  Clock, MapPin, AlertCircle, Info, Edit,
  ShoppingBag, ChevronDown, ChevronUp, Users
} from 'lucide-react';
import { FoodDonation } from '../../types/foodListing';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { showNotification } from '../../utils/notificationUtils';
import CountdownTimer from './CountdownTimer';
import InteractiveMap from '../maps/InteractiveMap';

/* Compute expiry locally — avoids broken isListingExpired util */
function computeIsExpired(listing: any): boolean {
  if (listing.status === 'expired') return true;
  try {
    const created = new Date(listing.createdAt).getTime();
    const hours   = parseFloat(listing.bestBefore);
    if (isNaN(created) || isNaN(hours)) return false;
    return Date.now() > created + hours * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

interface FoodListingVisibilityProps {
  listing: FoodDonation;
}

/* ─── Status badge config ─── */
function getStatusConfig(listing: FoodDonation) {
  if (computeIsExpired(listing)) {
    return { label: 'Expired', bg: '#fef2f2', color: '#dc2626', border: '#fecaca', dot: '#ef4444' };
  }
  if (listing.status === 'completed' || listing.status === 'claimed') {
    return { label: 'Completed', bg: '#fff7ed', color: '#ea580c', border: '#fed7aa', dot: '#f97316' };
  }
  return { label: 'Available', bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0', dot: '#22c55e', pulse: true };
}

const FoodListingVisibility: React.FC<FoodListingVisibilityProps> = ({ listing }) => {
  const navigate  = useNavigate();
  const { user }  = useAuth();
  const [showMap, setShowMap] = useState(false);
  const [imgError, setImgError] = useState(false);

  const isExpired    = computeIsExpired(listing);
  const isDonor      = user?.role === 'donor' && user._id === listing.user;
  const isRecipient  = user?.role === 'recipient';
  const canRequest   = isRecipient && !isExpired && listing.status === 'available';
  const hasCoords    = !!(listing.location?.coordinates);
  const statusConfig = getStatusConfig(listing);

  const handleViewDetails  = () => navigate(`/food-details/${listing._id}`);
  const handleRequestFood  = () => { navigate(`/request-food/${listing._id}`); showNotification.success('Request initiated'); };
  const handleEditListing  = () => navigate(`/edit-listing/${listing._id}`);

  // Normalise coords for InteractiveMap legacy `locations` prop
  const mapLocations = hasCoords ? [{
    position: Array.isArray(listing.location!.coordinates)
      ? { lat: listing.location!.coordinates[0], lng: listing.location!.coordinates[1] }
      : listing.location!.coordinates,
    title: listing.foodType,
    info: `${listing.servings} servings`,
  }] : [];

  return (
    <div style={{
      background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9',
      overflow: 'hidden', transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      fontFamily: "'DM Sans',system-ui,sans-serif",
    }}
      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = '0 8px 28px rgba(0,0,0,0.09)'; el.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; el.style.transform = 'none'; }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes pulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.5);opacity:0.55} }
      `}</style>

      {/* Food Image */}
      {listing.image && !imgError && (
        <div style={{ height: 160, overflow: 'hidden', position: 'relative' }}>
          <img
            src={listing.image}
            alt={listing.foodType}
            onError={() => setImgError(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.04)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
          />
          {/* Gradient scrim so status badge is legible */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.25) 100%)', pointerEvents: 'none' }} />
        </div>
      )}

      <div style={{ padding: '16px 18px' }}>
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {listing.foodType}
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', color: '#64748b', fontWeight: 500 }}>
                <Users size={11} /> {listing.servings} servings
              </div>
            </div>
          </div>

          {/* Status badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 99, background: statusConfig.bg, border: `1px solid ${statusConfig.border}`, flexShrink: 0 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: statusConfig.dot, ...(statusConfig.pulse ? { animation: 'pulse 1.8s ease-in-out infinite' } : {}) }} />
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: statusConfig.color }}>{statusConfig.label}</span>
          </div>
        </div>

        {/* Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 12 }}>
          {/* Countdown timer */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: '#64748b' }}>
            <Clock size={13} color="#94a3b8" />
            <CountdownTimer
              expiryDate={new Date(
                new Date(listing.createdAt).getTime() +
                parseFloat(listing.bestBefore) * 60 * 60 * 1000
              )}
            />
          </div>

          {/* Location — clickable to toggle map */}
          <button
            disabled={!hasCoords}
            onClick={() => hasCoords && setShowMap(v => !v)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: hasCoords ? '#3b82f6' : '#94a3b8', background: 'none', border: 'none', padding: 0, cursor: hasCoords ? 'pointer' : 'default', textAlign: 'left', fontFamily: 'inherit', transition: 'color 0.15s' }}
            onMouseEnter={e => { if (hasCoords) (e.currentTarget as HTMLElement).style.color = '#1d4ed8'; }}
            onMouseLeave={e => { if (hasCoords) (e.currentTarget as HTMLElement).style.color = '#3b82f6'; }}
          >
            <MapPin size={13} color="currentColor" />
            <span style={{ flex: 1 }}>{listing.location?.address || 'Location not specified'}</span>
            {hasCoords && (showMap ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
          </button>

          {/* Inline map preview */}
          {showMap && hasCoords && (
            <div style={{ marginTop: 4, borderRadius: 12, overflow: 'hidden', border: '1px solid #e2e8f0', animation: 'fadeIn 0.3s ease both' }}>
              <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}`}</style>
              <InteractiveMap
                locations={mapLocations}
                zoom={14}
                height="180px"
                showUserLocation={false}
              />
            </div>
          )}

          {/* Description */}
          {listing.description && (
            <p style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>{listing.description}</p>
          )}

          {/* Allergens */}
          {listing.allergens && listing.allergens.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: '0.75rem', color: '#92400e', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '6px 10px' }}>
              <AlertCircle size={13} style={{ flexShrink: 0, marginTop: 1 }} />
              <span><strong>Allergens:</strong> {listing.allergens.join(', ')}</span>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {/* View Details — always shown */}
          <ActionBtn
            onClick={handleViewDetails}
            icon={<Info size={13} />}
            label="View Details"
            bg="#f8fafc" border="#e2e8f0" color="#475569"
            hoverBg="#f1f5f9"
          />

          {/* Recipient: request or expired notice */}
          {isRecipient && (
            isExpired ? (
              <ActionBtn
                icon={<AlertCircle size={13} />}
                label="Expired"
                bg="#fef2f2" border="#fecaca" color="#dc2626"
                disabled
              />
            ) : listing.status === 'available' ? (
              <ActionBtn
                onClick={handleRequestFood}
                icon={<ShoppingBag size={13} />}
                label="Request Food"
                bg="linear-gradient(135deg,#3b82f6,#1d4ed8)" border="transparent" color="#fff"
                hoverBg="linear-gradient(135deg,#2563eb,#1e40af)"
                shadow="0 3px 10px rgba(59,130,246,0.35)"
              />
            ) : null
          )}

          {/* Donor: edit own listing */}
          {isDonor && (
            <ActionBtn
              onClick={handleEditListing}
              icon={<Edit size={13} />}
              label="Edit Listing"
              bg="#fffbeb" border="#fde68a" color="#92400e"
              hoverBg="#fef3c7"
            />
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── Mini action button ─── */
function ActionBtn({ onClick, icon, label, bg, border, color, hoverBg, shadow, disabled = false }: {
  onClick?: () => void; icon: React.ReactNode; label: string;
  bg: string; border: string; color: string; hoverBg?: string;
  shadow?: string; disabled?: boolean;
}) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 5, padding: '7px 13px',
        borderRadius: 9, border: `1px solid ${border}`,
        background: hov && hoverBg ? hoverBg : bg,
        color, fontWeight: 600, fontSize: '0.78rem', fontFamily: 'inherit',
        cursor: disabled ? 'default' : 'pointer', transition: 'all 0.2s ease',
        boxShadow: hov && shadow ? shadow : 'none',
        transform: hov && !disabled ? 'translateY(-1px)' : 'none',
        opacity: disabled ? 0.8 : 1,
      }}
    >
      {icon}{label}
    </button>
  );
}

export default FoodListingVisibility;