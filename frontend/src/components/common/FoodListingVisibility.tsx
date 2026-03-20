import React, { useState } from 'react';
import {
  Clock, MapPin, AlertCircle, Info, Edit,
  ShoppingBag, ChevronDown, ChevronUp, Users,
  CheckCircle, X, Loader
} from 'lucide-react';
import { FoodDonation } from '../../types/foodListing';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { showNotification } from '../../utils/notificationUtils';
import CountdownTimer from './CountdownTimer';
import InteractiveMap from '../maps/InteractiveMap';
import api from '../../services/api';

function computeIsExpired(listing: any): boolean {
  // completed = successfully delivered — NOT expired, show delivery badge
  if (['expired','cancelled'].includes(listing.status)) return true;
  try {
    const h = parseFloat(listing.bestBefore);
    const t = new Date(listing.createdAt).getTime();
    if (isNaN(h) || isNaN(t) || h <= 0) return false;
    return Date.now() > t + h * 3_600_000;
  } catch { return false; }
}

function getStatusConfig(listing: any) {
  if (computeIsExpired(listing))
    return { label:'Expired',   bg:'#fef2f2', color:'#dc2626', border:'#fecaca', dot:'#ef4444' };
  if (listing.status === 'requested')
    return { label:'Requested', bg:'#eff6ff', color:'#1d4ed8', border:'#bfdbfe', dot:'#3b82f6', pulse:true };
  if (listing.status === 'confirmed')
    return { label:'Confirmed', bg:'#f0fdf4', color:'#15803d', border:'#bbf7d0', dot:'#22c55e', pulse:true };
  if (listing.status === 'reserved')
    return { label:'Reserved',  bg:'#faf5ff', color:'#7c3aed', border:'#ddd6fe', dot:'#a855f7', pulse:true };
  if (listing.status === 'completed' || listing.status === 'claimed')
    return { label:'Delivered ✓', bg:'#f0fdf4', color:'#15803d', border:'#bbf7d0', dot:'#22c55e' };
  return { label:'Available', bg:'#f0fdf4', color:'#16a34a', border:'#bbf7d0', dot:'#22c55e', pulse:true };
}

interface Props {
  listing: FoodDonation;
  onStatusChange?: (id: string, newStatus: string) => void;
  onExpire?: (id: string) => void;
}

const FoodListingVisibility: React.FC<Props> = ({ listing, onStatusChange, onExpire }) => {
  const navigate  = useNavigate();
  const { user }  = useAuth();
  const [showMap,   setShowMap]   = useState(false);
  const [imgError,  setImgError]  = useState(false);
  const [collapsed, setCollapsed] = useState(computeIsExpired(listing));
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [hidden,      setHidden]      = useState(false);
  const [localStatus, setLocalStatus] = useState((listing as any).status);

  const handleExpire = () => {
    setHidden(true);
    onExpire?.(listing._id);
  };

  // Use localStatus for immediate UI updates after approve/reject
  const effectiveListing = { ...listing, status: localStatus };
  const isExpired   = computeIsExpired(effectiveListing);
  const isDonor     = user?.role === 'donor' && (
    (user as any)._id === (listing as any).user?.toString() ||
    (user as any)._id === (listing as any).user ||
    (user as any).id  === (listing as any).user
  );

  // Hide this card if timer just expired (for recipient/volunteer views)
  if (hidden && !isDonor) return null;
  const isRecipient = user?.role === 'recipient';
  const hasCoords   = !!(listing.location?.coordinates);
  const statusCfg   = getStatusConfig(effectiveListing);
  const isRequested = localStatus === 'requested';

  const handleApprove = async () => {
    setApproving(true);
    try {
      await api.post(`/food-donations/${listing._id}/approve`, {});
      showNotification.success('Request approved! Volunteer will be notified.');
      setLocalStatus('confirmed');
      onStatusChange?.(listing._id, 'confirmed');
    } catch (err: any) {
      showNotification.error(err?.response?.data?.message || 'Failed to approve');
    } finally { setApproving(false); }
  };

  const handleReject = async () => {
    setRejecting(true);
    try {
      await api.post(`/food-donations/${listing._id}/reject`, {});
      showNotification.success('Request declined — listing is available again.');
      setLocalStatus('available');
      onStatusChange?.(listing._id, 'available');
    } catch (err: any) {
      showNotification.error(err?.response?.data?.message || 'Failed to decline');
    } finally { setRejecting(false); }
  };

  const mapLocations = hasCoords ? [{
    position: Array.isArray(listing.location!.coordinates)
      ? { lat: (listing.location!.coordinates as any)[0], lng: (listing.location!.coordinates as any)[1] }
      : listing.location!.coordinates,
    title: listing.foodType,
    info: `${listing.servings} servings`,
  }] : [];

  /* ── EXPIRED card — greyed + collapsed ── */
  if (isExpired) return (
    <div style={{ background:'#fafafa', borderRadius:14, border:'1px solid #f1f5f9', overflow:'hidden', opacity:0.6, fontFamily:"'DM Sans',system-ui,sans-serif" }}>
      <button onClick={() => setCollapsed(c=>!c)}
        style={{ width:'100%', display:'flex', alignItems:'center', gap:12, padding:'12px 16px', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit', textAlign:'left' }}>
        {listing.image && !imgError && (
          <div style={{ width:40, height:40, borderRadius:8, overflow:'hidden', flexShrink:0 }}>
            <img src={listing.image} alt="" onError={()=>setImgError(true)} style={{ width:'100%', height:'100%', objectFit:'cover', filter:'grayscale(1)' }}/>
          </div>
        )}
        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ fontSize:'0.85rem', fontWeight:700, color:'#64748b', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{listing.foodType}</p>
          <p style={{ fontSize:'0.7rem', color:'#94a3b8' }}>{listing.servings} servings · <span style={{color:'#dc2626',fontWeight:700}}>Expired</span></p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
          <span style={{ padding:'3px 9px', borderRadius:99, background:'#fef2f2', border:'1px solid #fecaca', fontSize:'0.65rem', fontWeight:700, color:'#dc2626' }}>Expired</span>
          {collapsed ? <ChevronDown size={14} color="#94a3b8"/> : <ChevronUp size={14} color="#94a3b8"/>}
        </div>
      </button>
      {!collapsed && (
        <div style={{ padding:'0 16px 14px', borderTop:'1px solid #f1f5f9' }}>
          <div style={{ display:'flex', gap:8, marginTop:10 }}>
            {isDonor && <ActionBtn onClick={() => navigate(`/edit-listing/${listing._id}`)} icon={<Edit size={13}/>} label="Edit" bg="#fffbeb" border="#fde68a" color="#92400e" hoverBg="#fef3c7"/>}
            <ActionBtn onClick={() => navigate(`/food-details/${listing._id}`)} icon={<Info size={13}/>} label="View Details" bg="#f8fafc" border="#e2e8f0" color="#475569" hoverBg="#f1f5f9"/>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div style={{ background:'#fff', borderRadius:16, border:`1.5px solid ${isRequested && isDonor ? '#bfdbfe' : '#f1f5f9'}`, overflow:'hidden', transition:'all 0.25s cubic-bezier(0.4,0,0.2,1)', boxShadow: isRequested && isDonor ? '0 4px 20px rgba(59,130,246,0.12)' : '0 2px 8px rgba(0,0,0,0.04)', fontFamily:"'DM Sans',system-ui,sans-serif" }}
      onMouseEnter={e => { const el=e.currentTarget as HTMLElement; el.style.boxShadow='0 8px 28px rgba(0,0,0,0.09)'; el.style.transform='translateY(-2px)'; }}
      onMouseLeave={e => { const el=e.currentTarget as HTMLElement; el.style.boxShadow=isRequested&&isDonor?'0 4px 20px rgba(59,130,246,0.12)':'0 2px 8px rgba(0,0,0,0.04)'; el.style.transform='none'; }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes pulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.5);opacity:.55}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>

      {/* ── NEW REQUEST BANNER for donor ── */}
      {isRequested && isDonor && (
        <div style={{ background:'linear-gradient(135deg,#1d4ed8,#3b82f6)', padding:'10px 18px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, flexWrap:'wrap' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:8, height:8, borderRadius:'50%', background:'#fbbf24', animation:'pulse 1.5s ease-in-out infinite' }}/>
            <span style={{ fontSize:'0.78rem', fontWeight:700, color:'#fff' }}>New pickup request for this listing!</span>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={handleApprove} disabled={approving||rejecting}
              style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 14px', borderRadius:8, background:'#22c55e', border:'none', color:'#fff', fontWeight:700, fontSize:'0.78rem', cursor:'pointer', fontFamily:'inherit', opacity:approving?0.7:1 }}>
              {approving ? <Loader size={12} style={{animation:'spin .8s linear infinite'}}/> : <CheckCircle size={12}/>}
              {approving ? 'Accepting…' : 'Accept'}
            </button>
            <button onClick={handleReject} disabled={approving||rejecting}
              style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 14px', borderRadius:8, background:'rgba(255,255,255,0.15)', border:'1px solid rgba(255,255,255,0.3)', color:'#fff', fontWeight:700, fontSize:'0.78rem', cursor:'pointer', fontFamily:'inherit', opacity:rejecting?0.7:1 }}>
              {rejecting ? <Loader size={12} style={{animation:'spin .8s linear infinite'}}/> : <X size={12}/>}
              {rejecting ? 'Declining…' : 'Decline'}
            </button>
          </div>
        </div>
      )}

      {/* Food Image */}
      {listing.image && !imgError && (
        <div style={{ height:160, overflow:'hidden', position:'relative' }}>
          <img src={listing.image} alt={listing.foodType} onError={()=>setImgError(true)}
            style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform 0.4s ease' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform='scale(1.04)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform='scale(1)'; }}/>
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.25) 100%)', pointerEvents:'none' }}/>
        </div>
      )}

      <div style={{ padding:'16px 18px' }}>
        {/* Header */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:10, marginBottom:12 }}>
          <div style={{ flex:1, minWidth:0 }}>
            <h3 style={{ fontSize:'0.95rem', fontWeight:700, color:'#0f172a', marginBottom:4, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{listing.foodType}</h3>
            <div style={{ display:'flex', alignItems:'center', gap:4, fontSize:'0.72rem', color:'#64748b', fontWeight:500 }}>
              <Users size={11}/> {listing.servings} servings
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:5, padding:'4px 10px', borderRadius:99, background:statusCfg.bg, border:`1px solid ${statusCfg.border}`, flexShrink:0 }}>
            <div style={{ width:6, height:6, borderRadius:'50%', background:statusCfg.dot, ...((statusCfg as any).pulse?{animation:'pulse 1.8s ease-in-out infinite'}:{}) }}/>
            <span style={{ fontSize:'0.68rem', fontWeight:700, color:statusCfg.color }}>{statusCfg.label}</span>
          </div>
        </div>

        {/* Details */}
        <div style={{ display:'flex', flexDirection:'column', gap:7, marginBottom:12 }}>
          <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:'0.78rem', color:'#64748b' }}>
            {['completed','claimed','in_transit','picked_up','reserved'].includes(localStatus) ? (
              <span style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:'0.78rem', fontWeight:700, color:'#16a34a' }}>
                ✅ {localStatus === 'completed' || localStatus === 'claimed' ? 'Delivered successfully' : 
                    localStatus === 'in_transit' ? 'En route to recipient' :
                    localStatus === 'picked_up'  ? 'Picked up by volunteer' : 'Volunteer assigned'}
              </span>
            ) : (
              <CountdownTimer
                expiryDate={new Date(new Date(listing.createdAt).getTime() + parseFloat(listing.bestBefore || '0') * 3_600_000)}
                onExpire={handleExpire}
              />
            )}
          </div>

          <button disabled={!hasCoords} onClick={() => hasCoords && setShowMap(v=>!v)}
            style={{ display:'flex', alignItems:'center', gap:6, fontSize:'0.78rem', color:hasCoords?'#3b82f6':'#94a3b8', background:'none', border:'none', padding:0, cursor:hasCoords?'pointer':'default', textAlign:'left', fontFamily:'inherit', transition:'color 0.15s' }}
            onMouseEnter={e => { if(hasCoords)(e.currentTarget as HTMLElement).style.color='#1d4ed8'; }}
            onMouseLeave={e => { if(hasCoords)(e.currentTarget as HTMLElement).style.color='#3b82f6'; }}>
            <MapPin size={13} color="currentColor"/>
            <span style={{ flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{listing.location?.address || 'Location not specified'}</span>
            {hasCoords && (showMap ? <ChevronUp size={12}/> : <ChevronDown size={12}/>)}
          </button>

          {showMap && hasCoords && (
            <div style={{ marginTop:4, borderRadius:12, overflow:'hidden', border:'1px solid #e2e8f0', animation:'fadeIn 0.3s ease both' }}>
              <InteractiveMap locations={mapLocations} zoom={14} height="180px" showUserLocation={false}/>
            </div>
          )}

          {listing.description && (
            <p style={{ fontSize:'0.78rem', color:'#475569', lineHeight:1.6, margin:0 }}>{listing.description}</p>
          )}

          {listing.allergens && listing.allergens.length > 0 && (
            <div style={{ display:'flex', alignItems:'flex-start', gap:6, fontSize:'0.75rem', color:'#92400e', background:'#fffbeb', border:'1px solid #fde68a', borderRadius:8, padding:'6px 10px' }}>
              <AlertCircle size={13} style={{ flexShrink:0, marginTop:1 }}/>
              <span><strong>Allergens:</strong> {listing.allergens.join(', ')}</span>
            </div>
          )}
        </div>

        {/* Delivered success banner */}
        {(localStatus === 'completed' || localStatus === 'claimed') && (
          <div style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 14px', borderRadius:14, background:'linear-gradient(135deg,#f0fdf4,#dcfce7)', border:'1.5px solid #22c55e', marginBottom:8, animation:'fadeIn .3s ease both' }}>
            <div style={{ width:34, height:34, borderRadius:10, background:'linear-gradient(135deg,#22c55e,#15803d)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:'0 4px 12px rgba(34,197,94,.3)' }}>
              <span style={{ fontSize:'1rem' }}>🎉</span>
            </div>
            <div style={{ flex:1 }}>
              <p style={{ fontSize:'0.82rem', fontWeight:800, color:'#14532d', marginBottom:2 }}>Successfully Delivered!</p>
              <p style={{ fontSize:'0.72rem', color:'#16a34a' }}>
                {listing.servings} serving{listing.servings !== 1 ? 's' : ''} reached someone in need
                {(listing as any).completedAt ? ` · ${new Date((listing as any).completedAt).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}` : ''}
              </p>
            </div>
            <CheckCircle size={18} color="#22c55e"/>
          </div>
        )}

        {/* Actions */}
        <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
          <ActionBtn onClick={() => navigate(`/food-details/${listing._id}`)} icon={<Info size={13}/>} label="View Details"
            bg="#f8fafc" border="#e2e8f0" color="#475569" hoverBg="#f1f5f9"/>

          {isRecipient && localStatus === 'available' && !isExpired && (
            <ActionBtn onClick={() => { navigate(`/food-listings/${listing._id}`); showNotification.success('Request initiated'); }}
              icon={<ShoppingBag size={13}/>} label="Request Food"
              bg="linear-gradient(135deg,#3b82f6,#1d4ed8)" border="transparent" color="#fff"
              hoverBg="linear-gradient(135deg,#2563eb,#1e40af)" shadow="0 3px 10px rgba(59,130,246,0.35)"/>
          )}
          {isRecipient && (isExpired || localStatus === 'expired') && (
            <ActionBtn icon={<AlertCircle size={13}/>} label="Listing Expired"
              bg="#fef2f2" border="#fecaca" color="#dc2626" disabled/>
          )}
          {isRecipient && localStatus === 'requested' && (
            <ActionBtn icon={<Clock size={13}/>} label="Awaiting Donor" bg="#eff6ff" border="#bfdbfe" color="#1d4ed8" disabled/>
          )}
          {isRecipient && localStatus === 'confirmed' && (
            <ActionBtn onClick={() => navigate(`/order-tracking/${listing._id}`)}
              icon={<CheckCircle size={13}/>} label="Track Order"
              bg="linear-gradient(135deg,#22c55e,#15803d)" border="transparent" color="#fff"
              hoverBg="linear-gradient(135deg,#16a34a,#166534)" shadow="0 3px 10px rgba(34,197,94,0.35)"/>
          )}

          {isDonor && !isRequested && localStatus !== 'completed' && localStatus !== 'claimed' && (
            <ActionBtn onClick={() => navigate(`/edit-listing/${listing._id}`)} icon={<Edit size={13}/>} label="Edit Listing"
              bg="#fffbeb" border="#fde68a" color="#92400e" hoverBg="#fef3c7"/>
          )}
          {isDonor && isRequested && (
            <>
              <ActionBtn onClick={handleApprove} disabled={approving||rejecting}
                icon={approving?<Loader size={13} style={{animation:'spin .8s linear infinite'}}/>:<CheckCircle size={13}/>}
                label={approving?'Accepting…':'Accept Request'}
                bg="linear-gradient(135deg,#22c55e,#15803d)" border="transparent" color="#fff"
                hoverBg="linear-gradient(135deg,#16a34a,#166534)" shadow="0 3px 10px rgba(34,197,94,0.35)"/>
              <ActionBtn onClick={handleReject} disabled={approving||rejecting}
                icon={rejecting?<Loader size={13} style={{animation:'spin .8s linear infinite'}}/>:<X size={13}/>}
                label={rejecting?'Declining…':'Decline'}
                bg="#fef2f2" border="#fecaca" color="#dc2626" hoverBg="#fee2e2"/>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

function ActionBtn({ onClick, icon, label, bg, border, color, hoverBg, shadow, disabled=false }: any) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ display:'flex', alignItems:'center', gap:5, padding:'7px 13px', borderRadius:9,
        border:`1px solid ${border}`, background:hov&&hoverBg?hoverBg:bg, color,
        fontWeight:600, fontSize:'0.78rem', fontFamily:'inherit',
        cursor:disabled?'default':'pointer', transition:'all 0.2s ease',
        boxShadow:hov&&shadow?shadow:'none',
        transform:hov&&!disabled?'translateY(-1px)':'none',
        opacity:disabled?0.75:1 }}>
      {icon}{label}
    </button>
  );
}

export default FoodListingVisibility;