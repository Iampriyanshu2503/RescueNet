import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    ArrowLeft, CheckCircle, Clock, MapPin, Phone,
    MessageCircle, User, Package, Navigation, Info,
    RefreshCw, AlertCircle, Leaf, ThumbsUp
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { foodDonationService } from '../../services/foodDonationService';
import { showNotification } from '../../utils/notificationUtils';
import api from '../../services/api';

/* ── Real status → step index mapping ── */
const STATUS_STEPS = [
    { key:'requested',  label:'Request Sent',          desc:'Your request has been submitted',      icon:'📤' },
    { key:'confirmed',  label:'Donor Confirmed',        desc:'Donor has accepted your request',      icon:'✅' },
    { key:'reserved',   label:'Volunteer Assigned',     desc:'A volunteer has taken the pickup',     icon:'🚴' },
    { key:'picked_up',  label:'Food Picked Up',         desc:'Volunteer collected the food',         icon:'📦' },
    { key:'in_transit', label:'On the Way',             desc:'Food is being delivered to you',       icon:'🚗' },
    { key:'completed',  label:'Delivered!',             desc:'Food delivered successfully',          icon:'🎉' },
];
const STATUS_ORDER = STATUS_STEPS.map(s => s.key);

function getStepIndex(status: string): number {
    // Map legacy/variant statuses
    const map: Record<string, string> = {
        initiated:  'requested',
        preparing:  'confirmed',
        claimed:    'completed',
        delivered:  'completed',
    };
    const normalized = map[status] || status;
    const idx = STATUS_ORDER.indexOf(normalized);
    return idx === -1 ? 0 : idx;
}

const FOOD_LABELS: Record<string, string> = {
    'main-course':'Main Course','appetizer':'Appetizer','dessert':'Dessert',
    'beverages':'Beverages','snacks':'Snacks','fruits':'Fruits',
    'vegetables':'Vegetables','baked-goods':'Baked Goods','dairy':'Dairy','other':'Other',
};

export default function OrderTrackingPage() {
    const { id }   = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [listing,       setListing]       = useState<any>(null);
    const [orderStatus,   setOrderStatus]   = useState('requested');
    const [loading,       setLoading]       = useState(true);
    const [error,         setError]         = useState<string | null>(null);
    const [lastUpdated,   setLastUpdated]   = useState(new Date());
    const [confirming,    setConfirming]    = useState(false); // recipient confirming receipt
    const [rated,         setRated]         = useState(false);
    const [rating,        setRating]        = useState(0);
    const [reviewComment, setReviewComment] = useState('');
    const [submittingRev, setSubmittingRev] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval>|null>(null);

    const fetchData = useCallback(async (silent = false) => {
        if (!id) return;
        try {
            if (!silent) setLoading(true);
            setError(null);
            const data = await foodDonationService.getById(id);
            setListing(data);
            setOrderStatus((data as any).status || 'requested');
            setLastUpdated(new Date());
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Failed to load order details.');
        } finally { setLoading(false); }
    }, [id]);

    useEffect(() => {
        fetchData();
        // Poll every 15s for faster status updates
        intervalRef.current = setInterval(() => fetchData(true), 15_000);
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [fetchData]);

    useEffect(() => {
        const onFocus = () => fetchData(true);
        window.addEventListener('focus', onFocus);
        return () => window.removeEventListener('focus', onFocus);
    }, [fetchData]);

    /* ── Recipient confirms receipt ── */
    const handleConfirmReceipt = async () => {
        setConfirming(true);
        try {
            await api.post(`/food-donations/${id}/received`, {});
            setOrderStatus('completed');
            showNotification.success('Thank you for confirming! Enjoy your meal 🍽️');
            fetchData(true);
        } catch (err: any) {
            showNotification.error(err?.response?.data?.message || 'Failed to confirm receipt');
        } finally { setConfirming(false); }
    };

    /* ── Submit review ── */
    const handleSubmitReview = async () => {
        if (!rating) return;
        setSubmittingRev(true);
        try {
            await api.post(`/food-donations/${id}/reviews`, {
                rating, comment: reviewComment || 'Great donation!', reviewType: 'donor'
            });
            setRated(true);
            showNotification.success('Review submitted! Thank you 🌟');
        } catch (err: any) {
            showNotification.error(err?.response?.data?.message || 'Failed to submit review');
        } finally { setSubmittingRev(false); }
    };

    const currentIdx  = getStepIndex(orderStatus);
    const isCompleted = orderStatus === 'completed';
    const isInTransit = orderStatus === 'in_transit';
    const canConfirm  = isInTransit || orderStatus === 'picked_up'; // recipient can confirm when food is en route

    const CSS = `
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@700&display=swap');
        @keyframes fadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        @keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes slideIn { from{opacity:0;transform:translateX(-10px)} to{opacity:1;transform:translateX(0)} }
        @keyframes popIn   { from{opacity:0;transform:scale(.9)} to{opacity:1;transform:scale(1)} }
        * { box-sizing:border-box; }
        textarea { font-family:inherit; }
    `;

    if (loading) return (
        <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f8fafc', fontFamily:"'DM Sans',system-ui,sans-serif" }}>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <div style={{ textAlign:'center' }}>
                <div style={{ width:44, height:44, borderRadius:'50%', border:'3px solid #e2e8f0', borderTopColor:'#8b5cf6', animation:'spin .8s linear infinite', margin:'0 auto 16px' }}/>
                <p style={{ color:'#64748b', fontWeight:500 }}>Loading your order…</p>
            </div>
        </div>
    );

    if (error) return (
        <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f8fafc', fontFamily:"'DM Sans',system-ui,sans-serif", padding:24 }}>
            <div style={{ textAlign:'center', maxWidth:360 }}>
                <AlertCircle size={40} color="#ef4444" style={{ margin:'0 auto 16px', display:'block' }}/>
                <p style={{ fontWeight:600, color:'#dc2626', marginBottom:8 }}>{error}</p>
                <button onClick={()=>fetchData()} style={{ padding:'10px 24px', borderRadius:12, background:'linear-gradient(135deg,#8b5cf6,#6d28d9)', border:'none', color:'#fff', fontWeight:700, cursor:'pointer', marginRight:8 }}>Retry</button>
                <button onClick={()=>navigate('/recipient-dashboard')} style={{ padding:'10px 24px', borderRadius:12, background:'#f1f5f9', border:'none', color:'#374151', fontWeight:700, cursor:'pointer' }}>Back</button>
            </div>
        </div>
    );

    return (
        <div style={{ minHeight:'100vh', background:'linear-gradient(145deg,#f5f3ff,#f8fafc,#eff6ff)', fontFamily:"'DM Sans',system-ui,sans-serif" }}>
            <style>{CSS}</style>

            {/* Header */}
            <header style={{ position:'sticky', top:0, zIndex:40, background:'rgba(255,255,255,0.94)', backdropFilter:'blur(16px)', borderBottom:'1px solid rgba(0,0,0,0.07)', boxShadow:'0 2px 12px rgba(0,0,0,0.05)' }}>
                <div style={{ maxWidth:760, margin:'0 auto', padding:'0 20px', height:62, display:'flex', alignItems:'center', gap:14 }}>
                    <button onClick={()=>navigate('/recipient-dashboard')} style={{ width:36, height:36, borderRadius:11, background:'#f1f5f9', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <ArrowLeft size={16} color="#374151"/>
                    </button>
                    <div style={{ flex:1 }}>
                        <h1 style={{ fontSize:'1rem', fontWeight:800, color:'#0f172a', fontFamily:"'Playfair Display',serif" }}>Order Tracking</h1>
                        <p style={{ fontSize:'0.66rem', color:'#94a3b8' }}>Updated {lastUpdated.toLocaleTimeString()} · auto-refreshes every 15s</p>
                    </div>
                    <button onClick={()=>fetchData(true)} style={{ width:34, height:34, borderRadius:10, border:'1px solid #e2e8f0', background:'#f8fafc', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                        <RefreshCw size={13} color="#64748b"/>
                    </button>
                </div>
            </header>

            <div style={{ maxWidth:760, margin:'0 auto', padding:'24px 20px 80px', display:'flex', flexDirection:'column', gap:16 }}>

                {/* Order summary */}
                <div style={{ background:'linear-gradient(135deg,#2e1065,#4c1d95,#6d28d9)', borderRadius:22, padding:'22px', position:'relative', overflow:'hidden', animation:'fadeUp .4s ease both', boxShadow:'0 12px 40px rgba(109,40,217,.25)' }}>
                    <div style={{ position:'absolute', top:-30, right:-30, width:160, height:160, borderRadius:'50%', background:'rgba(167,139,250,.15)', filter:'blur(16px)', pointerEvents:'none' }}/>
                    <div style={{ position:'relative', zIndex:1 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
                            <div style={{ width:36, height:36, borderRadius:11, background:'rgba(255,255,255,.15)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                                <Package size={17} color="#fff"/>
                            </div>
                            <div>
                                <p style={{ fontSize:'0.66rem', color:'rgba(255,255,255,.5)', fontWeight:700, letterSpacing:'.08em' }}>ORDER</p>
                                <p style={{ fontSize:'0.82rem', color:'#fff', fontWeight:700 }}>#{id?.slice(-8).toUpperCase()}</p>
                            </div>
                            <div style={{ marginLeft:'auto', background:isCompleted?'#22c55e':'rgba(255,255,255,.15)', border:'1px solid rgba(255,255,255,.2)', borderRadius:99, padding:'5px 14px', fontSize:'0.72rem', color:'#fff', fontWeight:700 }}>
                                {isCompleted ? '✅ Delivered' : canConfirm ? '🚗 Almost There!' : '🔄 In Progress'}
                            </div>
                        </div>
                        <h2 style={{ fontSize:'1.2rem', fontWeight:800, color:'#fff', marginBottom:8, fontFamily:"'Playfair Display',serif" }}>
                            {FOOD_LABELS[listing?.foodType] || listing?.foodType || 'Food Request'}
                        </h2>
                        <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
                            <span style={{ display:'flex', alignItems:'center', gap:6, fontSize:'0.78rem', color:'rgba(255,255,255,.65)' }}>
                                <User size={13}/> {listing?.servings} servings
                            </span>
                            <span style={{ display:'flex', alignItems:'center', gap:6, fontSize:'0.78rem', color:'rgba(255,255,255,.65)' }}>
                                <MapPin size={13}/> {listing?.location?.address?.split(',')[0] || 'Location set'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* ── CONFIRM RECEIPT BANNER ── show when in_transit or picked_up */}
                {canConfirm && !isCompleted && (
                    <div style={{ background:'linear-gradient(135deg,#f0fdf4,#dcfce7)', border:'2px solid #22c55e', borderRadius:20, padding:'20px 22px', display:'flex', alignItems:'center', gap:16, animation:'popIn .4s ease both', boxShadow:'0 8px 24px rgba(34,197,94,.2)' }}>
                        <div style={{ width:48, height:48, borderRadius:14, background:'#22c55e', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:'1.4rem' }}>
                            🎁
                        </div>
                        <div style={{ flex:1 }}>
                            <p style={{ fontSize:'0.95rem', fontWeight:800, color:'#14532d', marginBottom:4 }}>Your food is on the way!</p>
                            <p style={{ fontSize:'0.8rem', color:'#16a34a', lineHeight:1.6 }}>When you receive it, tap the button to confirm delivery and help the volunteer complete their task.</p>
                        </div>
                        <button onClick={handleConfirmReceipt} disabled={confirming}
                            style={{ padding:'11px 20px', borderRadius:13, background:confirming?'#94a3b8':'linear-gradient(135deg,#22c55e,#15803d)', border:'none', color:'#fff', fontWeight:800, fontSize:'0.85rem', cursor:confirming?'not-allowed':'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:7, boxShadow:'0 4px 14px rgba(34,197,94,.35)', whiteSpace:'nowrap', flexShrink:0 }}>
                            {confirming
                                ? <><div style={{ width:14, height:14, borderRadius:'50%', border:'2px solid rgba(255,255,255,0.4)', borderTopColor:'#fff', animation:'spin .8s linear infinite' }}/> Confirming…</>
                                : <><ThumbsUp size={14}/> I Got It!</>
                            }
                        </button>
                    </div>
                )}

                {/* Progress timeline */}
                <div style={{ background:'#fff', borderRadius:22, border:'1px solid #f1f5f9', boxShadow:'0 4px 20px rgba(0,0,0,.06)', overflow:'hidden', animation:'fadeUp .4s ease .06s both', opacity:0 }}>
                    <div style={{ background:'linear-gradient(135deg,#eff6ff,#f5f3ff)', padding:'14px 22px', borderBottom:'1px solid #e2e8f0', display:'flex', alignItems:'center', gap:10 }}>
                        <Navigation size={16} color="#6d28d9"/>
                        <h3 style={{ fontWeight:700, color:'#1e1b4b', fontSize:'0.95rem' }}>Delivery Progress</h3>
                        <span style={{ marginLeft:'auto', fontSize:'0.72rem', color:'#8b5cf6', fontWeight:600 }}>
                            Step {currentIdx+1} of {STATUS_STEPS.length}
                        </span>
                    </div>
                    <div style={{ height:4, background:'#f1f5f9' }}>
                        <div style={{ height:'100%', width:`${(currentIdx/(STATUS_STEPS.length-1))*100}%`, background:'linear-gradient(90deg,#8b5cf6,#6d28d9)', borderRadius:'0 99px 99px 0', transition:'width .6s cubic-bezier(.4,0,.2,1)' }}/>
                    </div>
                    <div style={{ padding:'18px 22px', display:'flex', flexDirection:'column', gap:10 }}>
                        {STATUS_STEPS.map((step, i) => {
                            const done    = i < currentIdx;
                            const current = i === currentIdx;
                            const future  = i > currentIdx;
                            return (
                                <div key={step.key} style={{ display:'flex', alignItems:'flex-start', gap:14, padding:'12px 16px', borderRadius:14, border:`1.5px solid ${current?'#8b5cf6':done?'#bbf7d0':'#f1f5f9'}`, background:current?'#faf5ff':done?'#f0fdf4':'#fafafa', transition:'all .3s', animation:`slideIn .3s ease ${i*.05}s both`, opacity:future?0.5:1 }}>
                                    <div style={{ width:36, height:36, borderRadius:11, background:done?'#22c55e':current?'#8b5cf6':'#e2e8f0', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:current?'0 4px 14px rgba(139,92,246,.3)':'none' }}>
                                        {done
                                            ? <CheckCircle size={18} color="#fff"/>
                                            : current
                                            ? <Clock size={18} color="#fff" style={{ animation:'pulse 1.5s ease-in-out infinite' }}/>
                                            : <span style={{ fontSize:'1rem' }}>{step.icon}</span>
                                        }
                                    </div>
                                    <div style={{ flex:1 }}>
                                        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
                                            <p style={{ fontWeight:700, fontSize:'0.875rem', color:future?'#94a3b8':'#0f172a' }}>{step.label}</p>
                                            {current && <span style={{ background:'#8b5cf6', color:'#fff', borderRadius:99, padding:'2px 8px', fontSize:'0.62rem', fontWeight:700 }}>NOW</span>}
                                            {done    && <span style={{ background:'#22c55e', color:'#fff', borderRadius:99, padding:'2px 8px', fontSize:'0.62rem', fontWeight:700 }}>DONE</span>}
                                        </div>
                                        <p style={{ fontSize:'0.78rem', color:'#94a3b8' }}>{step.desc}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Pickup details */}
                <div style={{ background:'#fff', borderRadius:22, border:'1px solid #f1f5f9', boxShadow:'0 4px 20px rgba(0,0,0,.06)', overflow:'hidden', animation:'fadeUp .4s ease .12s both', opacity:0 }}>
                    <div style={{ background:'#f0fdf4', padding:'14px 22px', borderBottom:'1px solid #dcfce7', display:'flex', alignItems:'center', gap:10 }}>
                        <Leaf size={15} color="#16a34a"/>
                        <h3 style={{ fontWeight:700, color:'#14532d', fontSize:'0.95rem' }}>Pickup Details</h3>
                    </div>
                    <div style={{ padding:'18px 22px', display:'flex', flexDirection:'column', gap:14 }}>
                        <div style={{ display:'flex', gap:12 }}>
                            <MapPin size={15} color="#94a3b8" style={{ flexShrink:0, marginTop:2 }}/>
                            <div>
                                <p style={{ fontSize:'0.78rem', color:'#94a3b8', marginBottom:2 }}>Pickup Address</p>
                                <p style={{ fontWeight:600, color:'#0f172a', fontSize:'0.875rem' }}>{listing?.location?.address || 'Address on file'}</p>
                            </div>
                        </div>
                        {listing?.pickupInstructions && (
                            <div style={{ display:'flex', gap:12 }}>
                                <Info size={15} color="#94a3b8" style={{ flexShrink:0, marginTop:2 }}/>
                                <div>
                                    <p style={{ fontSize:'0.78rem', color:'#94a3b8', marginBottom:2 }}>Instructions</p>
                                    <p style={{ fontSize:'0.82rem', color:'#475569', lineHeight:1.6 }}>{listing.pickupInstructions}</p>
                                </div>
                            </div>
                        )}
                        {listing?.donor?.phone && (
                            <div style={{ display:'flex', gap:10 }}>
                                <a href={`tel:${listing.donor.phone}`} style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:7, padding:'10px', borderRadius:12, background:'#f0fdf4', border:'1px solid #bbf7d0', color:'#15803d', fontWeight:600, fontSize:'0.82rem', textDecoration:'none' }}>
                                    <Phone size={13}/> Call Donor
                                </a>
                                <a href={`sms:${listing.donor.phone}`} style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:7, padding:'10px', borderRadius:12, background:'#eff6ff', border:'1px solid #bfdbfe', color:'#1d4ed8', fontWeight:600, fontSize:'0.82rem', textDecoration:'none' }}>
                                    <MessageCircle size={13}/> Message
                                </a>
                            </div>
                        )}
                    </div>
                </div>

                {/* Review section — only after completed */}
                {isCompleted && !rated && (
                    <div style={{ background:'#fff', borderRadius:22, border:'1.5px solid #fde68a', boxShadow:'0 4px 20px rgba(0,0,0,.06)', padding:'22px', animation:'popIn .4s ease both' }}>
                        <div style={{ textAlign:'center', marginBottom:16 }}>
                            <p style={{ fontSize:'1.4rem', marginBottom:6 }}>🌟</p>
                            <h3 style={{ fontWeight:800, color:'#0f172a', marginBottom:4 }}>How was your experience?</h3>
                            <p style={{ fontSize:'0.82rem', color:'#64748b' }}>Rate the donor to help the community</p>
                        </div>
                        <div style={{ display:'flex', justifyContent:'center', gap:10, marginBottom:16 }}>
                            {[1,2,3,4,5].map(star=>(
                                <button key={star} onClick={()=>setRating(star)}
                                    style={{ width:44, height:44, borderRadius:13, border:`2px solid ${star<=rating?'#fbbf24':'#e2e8f0'}`, background:star<=rating?'#fef3c7':'#f8fafc', cursor:'pointer', fontSize:'1.4rem', transition:'all .2s', transform:star<=rating?'scale(1.15)':'scale(1)' }}>
                                    ⭐
                                </button>
                            ))}
                        </div>
                        {rating > 0 && (
                            <>
                                <textarea value={reviewComment} onChange={e=>setReviewComment(e.target.value)}
                                    placeholder="Share your experience (optional)…" rows={2}
                                    style={{ width:'100%', padding:'10px 14px', borderRadius:12, border:'1.5px solid #e2e8f0', background:'#f8fafc', fontSize:'0.85rem', color:'#0f172a', outline:'none', resize:'none', marginBottom:12 }}
                                    onFocus={e=>{e.currentTarget.style.borderColor='#8b5cf6';e.currentTarget.style.background='#fff';}}
                                    onBlur={e =>{e.currentTarget.style.borderColor='#e2e8f0';e.currentTarget.style.background='#f8fafc';}}/>
                                <button onClick={handleSubmitReview} disabled={submittingRev}
                                    style={{ width:'100%', padding:'11px', borderRadius:13, background:submittingRev?'#94a3b8':'linear-gradient(135deg,#f59e0b,#d97706)', border:'none', color:'#fff', fontWeight:800, cursor:submittingRev?'not-allowed':'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:7 }}>
                                    {submittingRev?<><div style={{ width:14, height:14, borderRadius:'50%', border:'2px solid rgba(255,255,255,0.4)', borderTopColor:'#fff', animation:'spin .8s linear infinite' }}/> Submitting…</>:<>⭐ Submit Review</>}
                                </button>
                            </>
                        )}
                    </div>
                )}
                {isCompleted && rated && (
                    <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:16, padding:'16px', textAlign:'center' }}>
                        <p style={{ color:'#15803d', fontWeight:700 }}>✅ Review submitted! Thank you for your feedback.</p>
                    </div>
                )}

                {/* Action buttons */}
                <div style={{ display:'flex', gap:12 }}>
                    <button onClick={()=>navigate('/recipient-dashboard')} style={{ flex:1, padding:'13px', borderRadius:14, border:'1.5px solid #e2e8f0', background:'#fff', color:'#374151', fontWeight:700, fontSize:'0.875rem', cursor:'pointer', fontFamily:'inherit' }}>
                        ← Back to Listings
                    </button>
                    <button onClick={()=>fetchData(true)} style={{ flex:1, padding:'13px', borderRadius:14, border:'none', background:'linear-gradient(135deg,#8b5cf6,#6d28d9)', color:'#fff', fontWeight:700, fontSize:'0.875rem', cursor:'pointer', fontFamily:'inherit', boxShadow:'0 4px 14px rgba(139,92,246,.3)' }}>
                        Refresh Status
                    </button>
                </div>
            </div>
        </div>
    );
}