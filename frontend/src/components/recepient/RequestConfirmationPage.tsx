import React, { useState, useEffect } from 'react';
import {
    ArrowLeft, MapPin, Clock, Phone, MessageCircle, Users,
    CheckCircle, Info, AlertTriangle, Zap, Leaf
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { foodDonationService } from '../../services/foodDonationService';
import { FoodDonation } from '../../types/foodListing';
import { showNotification } from '../../utils/notificationUtils';
import api from '../../services/api';

function timeLeft(listing: any): string {
    try {
        const hours   = parseFloat(listing.bestBefore);
        const created = new Date(listing.createdAt).getTime();
        if (isNaN(hours) || isNaN(created)) return 'Unknown';
        const remaining = (created + hours * 3_600_000) - Date.now();
        if (remaining <= 0) return 'Expired';
        const h = Math.floor(remaining / 3_600_000);
        const m = Math.floor((remaining % 3_600_000) / 60_000);
        return h > 0 ? `${h}h ${m}m left` : `${m}m left`;
    } catch { return 'Unknown'; }
}

function foodEmoji(type: string): string {
    const t = (type || '').toLowerCase();
    if (t.includes('main') || t.includes('rice') || t.includes('curry')) return '🍛';
    if (t.includes('dessert') || t.includes('sweet'))  return '🍰';
    if (t.includes('beverage') || t.includes('drink')) return '☕';
    if (t.includes('snack'))   return '🍿';
    if (t.includes('fruit'))   return '🍎';
    if (t.includes('veg'))     return '🥦';
    if (t.includes('baked') || t.includes('bread'))    return '🍞';
    if (t.includes('dairy'))   return '🧀';
    return '🍽️';
}

const FOOD_LABELS: Record<string, string> = {
    'main-course':'Main Course','appetizer':'Appetizer','dessert':'Dessert',
    'beverages':'Beverages','snacks':'Snacks','fruits':'Fruits',
    'vegetables':'Vegetables','baked-goods':'Baked Goods','dairy':'Dairy','other':'Other',
};

export default function RequestConfirmationPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [listing,      setListing]      = useState<any>(null);
    const [loading,      setLoading]      = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [confirmed,    setConfirmed]    = useState(false);
    const [notes,        setNotes]        = useState('');

    useEffect(() => {
        if (!id) { navigate('/recipient-dashboard'); return; }
        foodDonationService.getById(id)
            .then(data => setListing(data))
            .catch(() => {
                showNotification.error('Failed to load listing');
                navigate('/recipient-dashboard');
            })
            .finally(() => setLoading(false));
    }, [id, navigate]);

    const handleConfirm = async () => {
        if (!listing || !id) return;
        setIsSubmitting(true);
        try {
            // Call the new /request endpoint
            await api.post(`/food-donations/${id}/request`, { notes });
            setConfirmed(true);
            showNotification.success('Request submitted successfully!');
            setTimeout(() => navigate(`/order-tracking/${id}`), 2500);
        } catch (err: any) {
            const msg = err?.response?.data?.message || '';
            // If already requested by someone else
            if (err?.response?.status === 400 && msg.includes('no longer available')) {
                showNotification.error('Sorry, this listing was just taken by someone else.');
                setTimeout(() => navigate('/recipient-dashboard'), 2000);
            } else {
                showNotification.error(msg || 'Failed to submit request. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return (
        <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f8fafc', fontFamily:"'DM Sans',system-ui,sans-serif" }}>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <div style={{ textAlign:'center' }}>
                <div style={{ width:44, height:44, borderRadius:'50%', border:'3px solid #e2e8f0', borderTopColor:'#8b5cf6', animation:'spin .8s linear infinite', margin:'0 auto 16px' }}/>
                <p style={{ color:'#64748b' }}>Loading food details…</p>
            </div>
        </div>
    );

    if (confirmed) return (
        <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg,#f0fdf4,#eff6ff)', fontFamily:"'DM Sans',system-ui,sans-serif", padding:24 }}>
            <style>{`@keyframes popIn{from{opacity:0;transform:scale(.8)}to{opacity:1;transform:scale(1)}} @keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <div style={{ background:'#fff', borderRadius:28, boxShadow:'0 20px 60px rgba(0,0,0,.1)', padding:'48px 36px', textAlign:'center', maxWidth:440, width:'100%', animation:'popIn .5s cubic-bezier(.34,1.56,.64,1) both' }}>
                <div style={{ width:80, height:80, borderRadius:'50%', background:'linear-gradient(135deg,#22c55e,#15803d)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', boxShadow:'0 12px 36px rgba(34,197,94,.35)' }}>
                    <CheckCircle size={38} color="#fff"/>
                </div>
                <h2 style={{ fontSize:'1.6rem', fontWeight:800, color:'#0f172a', marginBottom:10 }}>Request Confirmed! 🎉</h2>
                <p style={{ color:'#64748b', lineHeight:1.7, marginBottom:24 }}>
                    Your request has been sent to the donor. Redirecting to order tracking…
                </p>
                <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:16, padding:16, marginBottom:20, textAlign:'left' }}>
                    <p style={{ fontSize:'0.82rem', color:'#166534', lineHeight:1.8 }}>
                        📍 <strong>Pickup:</strong> {listing?.location?.address || 'See listing'}<br/>
                        🍽️ <strong>Food:</strong> {FOOD_LABELS[listing?.foodType] || listing?.foodType}<br/>
                        👥 <strong>Servings:</strong> {listing?.servings}
                    </p>
                </div>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, color:'#94a3b8', fontSize:'0.78rem' }}>
                    <div style={{ width:14, height:14, borderRadius:'50%', border:'2px solid #e2e8f0', borderTopColor:'#8b5cf6', animation:'spin .8s linear infinite' }}/>
                    Redirecting to order tracking…
                </div>
            </div>
        </div>
    );

    const l = listing;
    const remaining = timeLeft(l);
    const isExpiringSoon = remaining.includes('m left') && !remaining.includes('h');

    return (
        <div style={{ minHeight:'100vh', background:'linear-gradient(145deg,#f5f3ff,#f8fafc,#eff6ff)', fontFamily:"'DM Sans',system-ui,sans-serif" }}>
            <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}} @keyframes spin{to{transform:rotate(360deg)}} *{box-sizing:border-box;} textarea{font-family:inherit;}`}</style>

            {/* Header */}
            <header style={{ position:'sticky', top:0, zIndex:40, background:'rgba(255,255,255,0.94)', backdropFilter:'blur(16px)', borderBottom:'1px solid rgba(0,0,0,0.07)', boxShadow:'0 2px 12px rgba(0,0,0,0.05)' }}>
                <div style={{ maxWidth:720, margin:'0 auto', padding:'0 20px', height:62, display:'flex', alignItems:'center', gap:14 }}>
                    <button onClick={() => navigate('/recipient-dashboard')}
                        style={{ width:36, height:36, borderRadius:11, background:'#f1f5f9', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <ArrowLeft size={16} color="#374151"/>
                    </button>
                    <div style={{ flex:1 }}>
                        <h1 style={{ fontSize:'1rem', fontWeight:800, color:'#0f172a' }}>Confirm Request</h1>
                        <p style={{ fontSize:'0.66rem', color:'#94a3b8' }}>Review details before submitting</p>
                    </div>
                    {isExpiringSoon && (
                        <div style={{ display:'flex', alignItems:'center', gap:6, background:'#fef2f2', border:'1px solid #fecaca', borderRadius:99, padding:'4px 12px' }}>
                            <AlertTriangle size={12} color="#ef4444"/>
                            <span style={{ fontSize:'0.68rem', color:'#dc2626', fontWeight:700 }}>{remaining}</span>
                        </div>
                    )}
                </div>
            </header>

            <div style={{ maxWidth:720, margin:'0 auto', padding:'24px 20px 100px', display:'flex', flexDirection:'column', gap:16 }}>

                {/* Food card */}
                <div style={{ background:'#fff', borderRadius:22, border:'1px solid #f1f5f9', boxShadow:'0 4px 20px rgba(0,0,0,.06)', overflow:'hidden', animation:'fadeUp .4s ease both' }}>
                    <div style={{ background:'linear-gradient(135deg,#2e1065,#6d28d9,#8b5cf6)', padding:'20px 22px', display:'flex', alignItems:'center', gap:14 }}>
                        <div style={{ width:56, height:56, borderRadius:16, background:'rgba(255,255,255,.15)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.8rem', flexShrink:0 }}>
                            {foodEmoji(l?.foodType || '')}
                        </div>
                        <div style={{ flex:1 }}>
                            <h2 style={{ fontSize:'1.1rem', fontWeight:800, color:'#fff', marginBottom:4 }}>
                                {FOOD_LABELS[l?.foodType] || l?.foodType || 'Food Listing'}
                            </h2>
                            <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
                                <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:'0.75rem', color:'rgba(255,255,255,.7)' }}>
                                    <Users size={12}/> {l?.servings} servings
                                </span>
                                <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:'0.75rem', color: isExpiringSoon ? '#fca5a5' : 'rgba(255,255,255,.7)' }}>
                                    <Clock size={12}/> {remaining}
                                </span>
                            </div>
                        </div>
                        <span style={{ background:'rgba(255,255,255,.15)', border:'1px solid rgba(255,255,255,.2)', borderRadius:99, padding:'4px 12px', fontSize:'0.7rem', color:'#fff', fontWeight:700, flexShrink:0 }}>
                            AVAILABLE
                        </span>
                    </div>
                    <div style={{ padding:'18px 22px' }}>
                        <p style={{ fontSize:'0.875rem', color:'#334155', lineHeight:1.7 }}>{l?.description || 'No description provided.'}</p>
                        {l?.allergens?.length > 0 && (
                            <div style={{ marginTop:14, display:'flex', flexWrap:'wrap', gap:6, alignItems:'center' }}>
                                <span style={{ fontSize:'0.72rem', color:'#94a3b8', fontWeight:600 }}>Allergens:</span>
                                {l.allergens.map((a: string) => (
                                    <span key={a} style={{ padding:'3px 10px', borderRadius:99, background:'#fef3c7', border:'1px solid #fde68a', color:'#92400e', fontSize:'0.72rem', fontWeight:600 }}>{a}</span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Pickup info */}
                <div style={{ background:'#fff', borderRadius:22, border:'1px solid #f1f5f9', boxShadow:'0 4px 20px rgba(0,0,0,.06)', overflow:'hidden', animation:'fadeUp .4s ease .06s both', opacity:0 }}>
                    <div style={{ background:'#eff6ff', padding:'14px 22px', borderBottom:'1px solid #dbeafe', display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ width:32, height:32, borderRadius:10, background:'#3b82f6', display:'flex', alignItems:'center', justifyContent:'center' }}>
                            <MapPin size={15} color="#fff"/>
                        </div>
                        <h3 style={{ fontWeight:700, color:'#1e3a5f', fontSize:'0.95rem' }}>Pickup Information</h3>
                    </div>
                    <div style={{ padding:'18px 22px', display:'flex', flexDirection:'column', gap:14 }}>
                        <div style={{ display:'flex', gap:12 }}>
                            <MapPin size={16} color="#94a3b8" style={{ flexShrink:0, marginTop:2 }}/>
                            <div>
                                <p style={{ fontWeight:600, color:'#0f172a', fontSize:'0.875rem' }}>{l?.location?.address || 'Address not specified'}</p>
                                <p style={{ fontSize:'0.75rem', color:'#94a3b8', marginTop:2 }}>Pickup location</p>
                            </div>
                        </div>
                        <div style={{ display:'flex', gap:12 }}>
                            <Info size={16} color="#94a3b8" style={{ flexShrink:0, marginTop:2 }}/>
                            <div>
                                <p style={{ fontWeight:600, color:'#0f172a', fontSize:'0.875rem' }}>Pickup Instructions</p>
                                <p style={{ fontSize:'0.82rem', color:'#475569', marginTop:2, lineHeight:1.6 }}>
                                    {l?.pickupInstructions || 'Contact donor for pickup details.'}
                                </p>
                            </div>
                        </div>
                        {l?.donor?.phone && (
                            <div style={{ display:'flex', gap:10, marginTop:4 }}>
                                <a href={`tel:${l.donor.phone}`}
                                    style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:7, padding:'10px', borderRadius:12, background:'#f0fdf4', border:'1px solid #bbf7d0', color:'#15803d', fontWeight:600, fontSize:'0.82rem', textDecoration:'none' }}>
                                    <Phone size={14}/> Call Donor
                                </a>
                                <a href={`sms:${l.donor.phone}`}
                                    style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:7, padding:'10px', borderRadius:12, background:'#eff6ff', border:'1px solid #bfdbfe', color:'#1d4ed8', fontWeight:600, fontSize:'0.82rem', textDecoration:'none' }}>
                                    <MessageCircle size={14}/> Message
                                </a>
                            </div>
                        )}
                    </div>
                </div>

                {/* Notes */}
                <div style={{ background:'#fff', borderRadius:22, border:'1px solid #f1f5f9', boxShadow:'0 4px 20px rgba(0,0,0,.06)', padding:'18px 22px', animation:'fadeUp .4s ease .12s both', opacity:0 }}>
                    <label style={{ display:'block', fontSize:'0.82rem', fontWeight:700, color:'#374151', marginBottom:8 }}>
                        Notes for donor <span style={{ color:'#94a3b8', fontWeight:400 }}>(optional)</span>
                    </label>
                    <textarea value={notes} onChange={e => setNotes(e.target.value)}
                        placeholder="e.g. I'll arrive at 5 PM, I have my own containers…"
                        rows={3}
                        style={{ width:'100%', padding:'11px 14px', borderRadius:12, border:'1.5px solid #e2e8f0', background:'#f8fafc', fontSize:'0.875rem', color:'#0f172a', outline:'none', resize:'none', transition:'all .2s' }}
                        onFocus={e => { e.currentTarget.style.borderColor='#8b5cf6'; e.currentTarget.style.background='#fff'; }}
                        onBlur={e  => { e.currentTarget.style.borderColor='#e2e8f0'; e.currentTarget.style.background='#f8fafc'; }}
                    />
                </div>

                {/* Notice */}
                <div style={{ background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:16, padding:'14px 18px', display:'flex', gap:10, animation:'fadeUp .4s ease .16s both', opacity:0 }}>
                    <Info size={15} color="#3b82f6" style={{ flexShrink:0, marginTop:2 }}/>
                    <p style={{ fontSize:'0.78rem', color:'#1e40af', lineHeight:1.7 }}>
                        By confirming, you agree to pick up the food within the time window and follow the donor's instructions.
                    </p>
                </div>
            </div>

            {/* Bottom bar */}
            <div style={{ position:'fixed', bottom:0, left:0, right:0, background:'rgba(255,255,255,.96)', backdropFilter:'blur(20px)', borderTop:'1px solid #e5e7eb', padding:'14px 20px', zIndex:40 }}>
                <div style={{ maxWidth:720, margin:'0 auto', display:'flex', gap:12 }}>
                    <button onClick={() => navigate('/recipient-dashboard')}
                        style={{ flex:'0 0 auto', padding:'13px 20px', borderRadius:14, border:'1.5px solid #e5e7eb', background:'#fff', color:'#374151', fontWeight:700, fontSize:'0.875rem', cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:6 }}>
                        <ArrowLeft size={14}/> Cancel
                    </button>
                    <button onClick={handleConfirm} disabled={isSubmitting}
                        style={{ flex:1, padding:'14px 24px', borderRadius:14, border:'none', background: isSubmitting ? '#94a3b8' : 'linear-gradient(135deg,#8b5cf6,#6d28d9)', color:'#fff', fontWeight:800, fontSize:'0.95rem', cursor: isSubmitting ? 'not-allowed' : 'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow: isSubmitting ? 'none' : '0 6px 20px rgba(139,92,246,.4)', transition:'all .2s' }}>
                        {isSubmitting
                            ? <><div style={{ width:16, height:16, borderRadius:'50%', border:'2px solid rgba(255,255,255,.4)', borderTopColor:'#fff', animation:'spin .8s linear infinite' }}/> Submitting…</>
                            : <><Zap size={16}/> Confirm Request</>
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}