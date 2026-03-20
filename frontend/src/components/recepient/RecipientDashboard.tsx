import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Search, MapPin, Clock, List, Map as MapIcon, Navigation,
    MessageCircle, RefreshCw, AlertCircle, Recycle, ChevronDown,
    X, Leaf, User, Package, CheckCircle, Truck, ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { foodDonationService } from '../../services/foodDonationService';
import { FoodDonation } from '../../types/foodListing';
import FoodListingVisibility from '../common/FoodListingVisibility';
import InteractiveMap from '../maps/InteractiveMap';
import socketService from '../../services/socketService';
import api from '../../services/api';

function isExpired(listing: any): boolean {
    const s = (listing.status || '').toLowerCase().trim();
    if (s === 'expired' || s === 'completed' || s === 'cancelled') return true;
    try {
        const hours = parseFloat(listing.bestBefore);
        const created = new Date(listing.createdAt).getTime();
        if (isNaN(hours) || isNaN(created) || hours <= 0) return false;
        return Date.now() > created + hours * 3_600_000;
    } catch { return false; }
}
function isAvailable(listing: any): boolean {
    const s = (listing.status || '').toLowerCase().trim();
    return s === 'available' || s === 'active' || s === 'open';
}

/* ── Order status config ── */
const ORDER_STEPS = [
    { status: 'requested',  label: 'Request Sent',          desc: 'Your request has been submitted',       icon: '📤' },
    { status: 'confirmed',  label: 'Donor Confirmed',        desc: 'Donor has accepted your request',       icon: '✅' },
    { status: 'reserved',   label: 'Volunteer Assigned',     desc: 'A volunteer has taken the pickup',      icon: '🚴' },
    { status: 'picked_up',  label: 'Food Picked Up',         desc: 'Volunteer collected the food',          icon: '📦' },
    { status: 'in_transit', label: 'On the Way',             desc: 'Food is being delivered',               icon: '🚗' },
    { status: 'completed',  label: 'Delivered!',             desc: 'Food delivered successfully',           icon: '🎉' },
];
const STATUS_ORDER = ORDER_STEPS.map(s => s.status);

function getStepIndex(status: string): number {
    const idx = STATUS_ORDER.indexOf(status);
    return idx === -1 ? 0 : idx;
}

function getOrderBadge(status: string) {
    const map: Record<string, { bg: string; color: string; border: string; label: string }> = {
        requested:  { bg:'#eff6ff', color:'#1d4ed8', border:'#bfdbfe', label:'Awaiting Donor' },
        confirmed:  { bg:'#f0fdf4', color:'#15803d', border:'#bbf7d0', label:'Confirmed ✓' },
        reserved:   { bg:'#faf5ff', color:'#7c3aed', border:'#ddd6fe', label:'Volunteer Assigned' },
        picked_up:  { bg:'#fff7ed', color:'#c2410c', border:'#fed7aa', label:'Picked Up' },
        in_transit: { bg:'#fff7ed', color:'#c2410c', border:'#fed7aa', label:'On the Way' },
        completed:  { bg:'#f0fdf4', color:'#15803d', border:'#bbf7d0', label:'Delivered ✓' },
    };
    return map[status] || { bg:'#f8fafc', color:'#64748b', border:'#e2e8f0', label: status };
}

/* ── Mini order card ── */
function OrderCard({ order, onTrack }: { order: any; onTrack: (id: string) => void }) {
    const [hov, setHov] = useState(false);
    const stepIdx  = getStepIndex(order.status);
    const badge    = getOrderBadge(order.status);
    const progress = Math.round((stepIdx / (ORDER_STEPS.length - 1)) * 100);
    const currentStep = ORDER_STEPS[stepIdx];

    return (
        <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
            style={{ background:'#fff', borderRadius:18, border:'1.5px solid #f1f5f9', overflow:'hidden', transition:'all .25s', boxShadow: hov ? '0 8px 28px rgba(0,0,0,0.09)' : '0 2px 8px rgba(0,0,0,0.04)', transform: hov ? 'translateY(-2px)' : 'none' }}>

            {/* Progress bar */}
            <div style={{ height:4, background:'#f1f5f9' }}>
                <div style={{ height:'100%', width:`${progress}%`, background:'linear-gradient(90deg,#8b5cf6,#6d28d9)', borderRadius:'0 99px 99px 0', transition:'width .6s cubic-bezier(.4,0,.2,1)' }}/>
            </div>

            <div style={{ padding:'14px 16px' }}>
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:10, marginBottom:10 }}>
                    <div style={{ flex:1, minWidth:0 }}>
                        <h4 style={{ fontSize:'0.9rem', fontWeight:700, color:'#0f172a', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginBottom:3 }}>
                            {order.foodType}
                        </h4>
                        <p style={{ fontSize:'0.72rem', color:'#94a3b8' }}>
                            {order.servings} servings · Requested {new Date(order.requestedAt || order.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                    <span style={{ padding:'4px 10px', borderRadius:99, background:badge.bg, border:`1px solid ${badge.border}`, fontSize:'0.66rem', fontWeight:700, color:badge.color, flexShrink:0 }}>
                        {badge.label}
                    </span>
                </div>

                {/* Current step */}
                <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 12px', borderRadius:10, background:'#f8fafc', border:'1px solid #f1f5f9', marginBottom:12 }}>
                    <span style={{ fontSize:'1rem' }}>{currentStep?.icon}</span>
                    <div>
                        <p style={{ fontSize:'0.75rem', fontWeight:700, color:'#0f172a' }}>{currentStep?.label}</p>
                        <p style={{ fontSize:'0.68rem', color:'#94a3b8' }}>{currentStep?.desc}</p>
                    </div>
                </div>

                {/* Step dots */}
                <div style={{ display:'flex', alignItems:'center', gap:4, marginBottom:12 }}>
                    {ORDER_STEPS.map((step, i) => (
                        <div key={step.status} style={{ flex:1, height:4, borderRadius:99, background: i <= stepIdx ? 'linear-gradient(90deg,#8b5cf6,#6d28d9)' : '#f1f5f9', transition:'background .3s' }}/>
                    ))}
                </div>

                {order.status !== 'completed' ? (
                    <button onClick={() => onTrack(order._id)}
                        style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'9px 16px', borderRadius:11, background:'linear-gradient(135deg,#8b5cf6,#6d28d9)', border:'none', color:'#fff', fontWeight:700, fontSize:'0.8rem', cursor:'pointer', fontFamily:'inherit', boxShadow:'0 4px 14px rgba(139,92,246,0.3)', transition:'all .2s' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow='0 6px 20px rgba(139,92,246,0.45)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow='0 4px 14px rgba(139,92,246,0.3)'; }}>
                        <Truck size={13}/> Track Order <ArrowRight size={13}/>
                    </button>
                ) : (
                    <button onClick={() => onTrack(order._id)}
                        style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'9px 16px', borderRadius:11, background:'#f0fdf4', border:'1.5px solid #bbf7d0', color:'#15803d', fontWeight:700, fontSize:'0.8rem', cursor:'pointer', fontFamily:'inherit', transition:'all .2s' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background='#dcfce7'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background='#f0fdf4'; }}>
                        <CheckCircle size={13}/> View Details
                    </button>
                )}
            </div>
        </div>
    );
}

const FILTERS   = ['All Types', 'Vegetarian', 'Vegan', 'Non-Vegetarian', 'Gluten-Free'];
const SORT_OPTS = ['Newest First', 'Expiring Soon', 'Most Servings'];

export default function RecipientDashboard() {
    const navigate = useNavigate();
    const [activeTab,      setActiveTab]      = useState<'browse' | 'orders'>('browse');
    const [listings,       setListings]       = useState<FoodDonation[]>([]);
    const [myOrders,       setMyOrders]       = useState<any[]>([]);
    const [loading,        setLoading]        = useState(true);
    const [ordersLoading,  setOrdersLoading]  = useState(false);
    const [error,          setError]          = useState<string | null>(null);
    const [lastRefresh,    setLastRefresh]    = useState(new Date());
    const [socketConnected,setSocketConnected]= useState(false);
    const [searchQuery,    setSearchQuery]    = useState('');
    const [selectedFilter, setSelectedFilter] = useState('All Types');
    const [sortBy,         setSortBy]         = useState('Newest First');
    const [viewMode,       setViewMode]       = useState<'list' | 'map'>('list');
    const [userLocation,   setUserLocation]   = useState<{ lat: number; lng: number } | null>(null);
    const [headerScrolled, setHeaderScrolled] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    /* ── Fetch available listings ── */
    const fetchListings = useCallback(async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            setError(null);
            const data = await foodDonationService.getAll();
            const arr  = Array.isArray(data) ? data : (data as any)?.donations || [];
            setListings(arr.filter((l: any) => isAvailable(l) && !isExpired(l)));
            setLastRefresh(new Date());
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Failed to load listings.');
        } finally { setLoading(false); }
    }, []);

    /* ── Fetch my orders ── */
    const fetchMyOrders = useCallback(async (force = false) => {
        if (!force) setOrdersLoading(true);
        try {
            const res = await api.get('/food-donations/my-requests');
            const orders = Array.isArray(res.data) ? res.data : [];
            setMyOrders(orders);
        } catch {
            setMyOrders([]);
        } finally { setOrdersLoading(false); }
    }, []);

    useEffect(() => {
        fetchListings();
        fetchMyOrders();
        // Poll faster (5s) when active orders exist, otherwise 15s
    const pollMs = myOrders.some((o:any) =>
        ['confirmed','reserved','picked_up','in_transit'].includes(o.status)
    ) ? 5_000 : 15_000;
    intervalRef.current = setInterval(() => {
            fetchListings(true);
            fetchMyOrders();
        }, pollMs);
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [fetchListings, fetchMyOrders]);

    /* Auto-switch to My Orders if food is actively in progress */
    useEffect(() => {
        const urgentStatuses = ['in_transit', 'picked_up', 'confirmed', 'reserved', 'requested'];
        const hasUrgent = myOrders.some(o => urgentStatuses.includes(o.status));
        if (hasUrgent && activeTab === 'browse') {
            setActiveTab('orders');
        }
    }, [myOrders]);

    useEffect(() => {
        const onFocus = () => { fetchListings(true); fetchMyOrders(); };
        window.addEventListener('focus', onFocus);
        return () => window.removeEventListener('focus', onFocus);
    }, [fetchListings, fetchMyOrders]);

    /* ── Socket real-time ── */
    useEffect(() => {
        const handleUpdate = () => { fetchListings(true); fetchMyOrders(); };
        try {
            if (typeof socketService?.subscribe === 'function') {
                socketService.subscribe('new_food_donation', handleUpdate);
                socketService.subscribe('donation_update',   handleUpdate);
                setSocketConnected(true);
            }
        } catch { setSocketConnected(false); }
        return () => {
            try {
                if (typeof socketService?.unsubscribe === 'function') {
                    socketService.unsubscribe('new_food_donation', handleUpdate);
                    socketService.unsubscribe('donation_update',   handleUpdate);
                }
            } catch {}
        };
    }, [fetchListings, fetchMyOrders]);

    useEffect(() => {
        navigator.geolocation?.getCurrentPosition(
            p  => setUserLocation({ lat: p.coords.latitude, lng: p.coords.longitude }),
            () => setUserLocation({ lat: 22.5726, lng: 88.3639 })
        );
    }, []);

    useEffect(() => {
        const fn = () => setHeaderScrolled(window.scrollY > 10);
        window.addEventListener('scroll', fn);
        return () => window.removeEventListener('scroll', fn);
    }, []);

    const filtered = listings
        .filter((l: any) => {
            const q = searchQuery.toLowerCase();
            const matchSearch = !q || l.foodType?.toLowerCase().includes(q) || l.description?.toLowerCase().includes(q) || l.location?.address?.toLowerCase().includes(q);
            const matchFilter = selectedFilter === 'All Types' || l.foodType?.toLowerCase().includes(selectedFilter.toLowerCase()) || (l.allergens||[]).some((a:string)=>a.toLowerCase().includes(selectedFilter.toLowerCase()));
            return matchSearch && matchFilter;
        })
        .sort((a: any, b: any) => {
            if (sortBy === 'Expiring Soon') {
                return (new Date(a.createdAt).getTime() + parseFloat(a.bestBefore||'0')*3_600_000) -
                       (new Date(b.createdAt).getTime() + parseFloat(b.bestBefore||'0')*3_600_000);
            }
            if (sortBy === 'Most Servings') return (b.servings||0) - (a.servings||0);
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

    const todayCount    = listings.filter((l:any) => new Date(l.createdAt).toDateString() === new Date().toDateString()).length;
    const totalServings = listings.reduce((s,l:any)=>s+(l.servings||0), 0);
    const activeOrders  = myOrders.filter(o => o.status !== 'completed').length;

    const CSS = `
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@700;800&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        @keyframes pulse  { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.6;transform:scale(1.4)} }
        * { box-sizing:border-box; }
        input,select { font-family:inherit; }
        ::-webkit-scrollbar { height:4px; width:4px; }
        ::-webkit-scrollbar-track { background:#f1f5f9; border-radius:99px; }
        ::-webkit-scrollbar-thumb { background:#cbd5e1; border-radius:99px; }
    `;

    return (
        <div style={{ minHeight:'100vh', background:'linear-gradient(145deg,#f5f3ff 0%,#f8fafc 50%,#eff6ff 100%)', fontFamily:"'DM Sans',system-ui,sans-serif" }}>
            <style>{CSS}</style>

            {/* ══ HEADER ══ */}
            <header style={{ position:'sticky', top:0, zIndex:50, background: headerScrolled?'rgba(255,255,255,0.96)':'rgba(255,255,255,0.82)', backdropFilter:'blur(20px)', borderBottom:`1px solid ${headerScrolled?'rgba(0,0,0,0.08)':'transparent'}`, boxShadow: headerScrolled?'0 2px 20px rgba(0,0,0,0.06)':'none', transition:'all .3s' }}>
                <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 24px', height:66, display:'flex', alignItems:'center', justifyContent:'space-between', gap:16 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                        <div style={{ width:38, height:38, borderRadius:12, background:'linear-gradient(135deg,#8b5cf6,#6d28d9)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 12px rgba(139,92,246,.35)' }}>
                            <Leaf size={17} color="#fff"/>
                        </div>
                        <div>
                            <h1 style={{ fontSize:'1rem', fontWeight:800, color:'#0f172a', fontFamily:"'Playfair Display',serif" }}>
                                {activeTab === 'browse' ? 'Available Food' : 'My Orders'}
                            </h1>
                            <p style={{ fontSize:'0.66rem', color:'#94a3b8' }}>
                                {activeTab === 'browse' ? `${listings.length} listing${listings.length!==1?'s':''} near you` : `${myOrders.length} order${myOrders.length!==1?'s':''} total`}
                            </p>
                        </div>
                    </div>

                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        {/* Live indicator */}
                        <div style={{ display:'flex', alignItems:'center', gap:5, padding:'4px 10px', borderRadius:99, background:socketConnected?'#f0fdf4':'#f8fafc', border:`1px solid ${socketConnected?'#bbf7d0':'#e2e8f0'}` }}>
                            <div style={{ width:6, height:6, borderRadius:'50%', background:socketConnected?'#22c55e':'#94a3b8', animation:socketConnected?'pulse 1.8s ease-in-out infinite':'none' }}/>
                            <span style={{ fontSize:'0.62rem', fontWeight:700, color:socketConnected?'#15803d':'#94a3b8' }}>{socketConnected?'Live':'Polling'}</span>
                        </div>

                        {/* Tab toggle */}
                        <div style={{ display:'flex', background:'#f1f5f9', borderRadius:11, padding:3 }}>
                            <button onClick={() => setActiveTab('browse')}
                                style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 12px', borderRadius:9, border:'none', cursor:'pointer', fontFamily:'inherit', fontSize:'0.78rem', fontWeight:600, background:activeTab==='browse'?'#fff':'transparent', color:activeTab==='browse'?'#0f172a':'#94a3b8', boxShadow:activeTab==='browse'?'0 1px 6px rgba(0,0,0,.08)':'none', transition:'all .2s' }}>
                                <Search size={13}/> Browse
                            </button>
                            <button onClick={() => { setActiveTab('orders'); fetchMyOrders(true); }}
                                style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 12px', borderRadius:9, border:'none', cursor:'pointer', fontFamily:'inherit', fontSize:'0.78rem', fontWeight:600, background:activeTab==='orders'?'#fff':'transparent', color:activeTab==='orders'?'#0f172a':'#94a3b8', boxShadow:activeTab==='orders'?'0 1px 6px rgba(0,0,0,.08)':'none', transition:'all .2s', position:'relative' }}>
                                <Package size={13}/> My Orders
                                {activeOrders > 0 && (
                                    <span style={{ position:'absolute', top:-4, right:-4, width:16, height:16, borderRadius:'50%', background:'#ef4444', color:'#fff', fontSize:'0.55rem', fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>{activeOrders}</span>
                                )}
                            </button>
                        </div>

                        {activeTab === 'browse' && (
                            <div style={{ display:'flex', background:'#f1f5f9', borderRadius:11, padding:3 }}>
                                {(['list','map'] as const).map(mode => (
                                    <button key={mode} onClick={() => setViewMode(mode)}
                                        style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 12px', borderRadius:9, border:'none', cursor:'pointer', fontFamily:'inherit', fontSize:'0.78rem', fontWeight:600, background:viewMode===mode?'#fff':'transparent', color:viewMode===mode?'#0f172a':'#94a3b8', boxShadow:viewMode===mode?'0 1px 6px rgba(0,0,0,.08)':'none', transition:'all .2s' }}>
                                        {mode==='list'?<List size={13}/>:<MapIcon size={13}/>}
                                        {mode==='list'?'List':'Map'}
                                    </button>
                                ))}
                            </div>
                        )}

                        <button onClick={() => { fetchListings(); fetchMyOrders(); }} title="Refresh"
                            style={{ width:36, height:36, borderRadius:10, border:'1px solid #e2e8f0', background:'#f8fafc', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                            <RefreshCw size={14} color="#64748b" style={{ animation:loading||ordersLoading?'spin .8s linear infinite':'none' }}/>
                        </button>

                        <button onClick={() => navigate('/recipient-profile')}
                            style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:11, background:'#f8fafc', border:'1px solid #e2e8f0', color:'#334155', fontWeight:600, fontSize:'0.78rem', cursor:'pointer', fontFamily:'inherit' }}>
                            <User size={13}/> Profile
                        </button>
                    </div>
                </div>
            </header>

            <div style={{ maxWidth:1100, margin:'0 auto', padding:'28px 24px 60px' }}>

                {/* ══ HERO ══ */}
                <div style={{ background:'linear-gradient(135deg,#2e1065,#4c1d95,#6d28d9,#8b5cf6)', borderRadius:24, padding:'24px 28px', marginBottom:24, position:'relative', overflow:'hidden', animation:'fadeUp .5s ease both', boxShadow:'0 16px 48px rgba(109,40,217,.25)' }}>
                    <div style={{ position:'absolute', top:-40, right:-40, width:220, height:220, borderRadius:'50%', background:'rgba(167,139,250,.18)', filter:'blur(20px)', pointerEvents:'none' }}/>
                    <div style={{ position:'relative', zIndex:1, display:'flex', alignItems:'center', justifyContent:'space-between', gap:20, flexWrap:'wrap' }}>
                        <div>
                            <div style={{ display:'inline-flex', alignItems:'center', gap:7, background:'rgba(255,255,255,.1)', border:'1px solid rgba(255,255,255,.15)', borderRadius:99, padding:'4px 12px', marginBottom:12 }}>
                                <div style={{ width:7, height:7, borderRadius:'50%', background:'#4ade80', animation:'pulse 1.8s ease-in-out infinite' }}/>
                                <span style={{ fontSize:'0.66rem', color:'rgba(255,255,255,.65)', fontWeight:700, letterSpacing:'.08em' }}>
                                    {socketConnected?'LIVE · REAL-TIME':'LIVE FEED'}
                                </span>
                            </div>
                            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(1.3rem,2.5vw,1.8rem)', color:'#fff', marginBottom:8 }}>
                                {activeTab === 'browse' ? 'Find Free Food Near You 🌿' : 'Your Food Orders 📦'}
                            </h2>
                            <p style={{ fontSize:'0.85rem', color:'rgba(255,255,255,.55)', maxWidth:380, lineHeight:1.7 }}>
                                {activeTab === 'browse'
                                    ? <><strong style={{ color:'#c4b5fd' }}>{listings.length} listing{listings.length!==1?'s':''}</strong> available · {socketConnected?'updates instantly':'refreshes every minute'}</>
                                    : <><strong style={{ color:'#c4b5fd' }}>{activeOrders} active</strong> · {myOrders.filter(o=>o.status==='completed').length} completed</>
                                }
                            </p>
                        </div>
                        <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                            {activeTab === 'browse' ? (
                                [['🍱',String(listings.length),'available'],['🌅',String(todayCount),'fresh today'],['👥',String(totalServings),'servings']].map(([emoji,val,sub])=>(
                                    <div key={sub} style={{ background:'rgba(255,255,255,.1)', border:'1px solid rgba(255,255,255,.15)', borderRadius:14, padding:'10px 16px', textAlign:'center', backdropFilter:'blur(8px)' }}>
                                        <div style={{ fontSize:'1rem', fontWeight:700, color:'#fff' }}>{emoji} {val}</div>
                                        <div style={{ fontSize:'0.64rem', color:'rgba(255,255,255,.45)', marginTop:2 }}>{sub}</div>
                                    </div>
                                ))
                            ) : (
                                [
                                    ['📤', String(myOrders.filter(o=>o.status==='requested').length),  'awaiting donor'],
                                    ['✅', String(myOrders.filter(o=>o.status==='confirmed').length),  'confirmed'],
                                    ['🚴', String(myOrders.filter(o=>o.status==='reserved').length),   'with volunteer'],
                                    ['🎉', String(myOrders.filter(o=>o.status==='completed').length),  'delivered'],
                                ].map(([emoji,val,sub])=>(
                                    <div key={sub} style={{ background:'rgba(255,255,255,.1)', border:'1px solid rgba(255,255,255,.15)', borderRadius:14, padding:'10px 16px', textAlign:'center', backdropFilter:'blur(8px)' }}>
                                        <div style={{ fontSize:'1rem', fontWeight:700, color:'#fff' }}>{emoji} {val}</div>
                                        <div style={{ fontSize:'0.64rem', color:'rgba(255,255,255,.45)', marginTop:2 }}>{sub}</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* ══ BROWSE TAB ══ */}
                {activeTab === 'browse' && (
                    <>
                        {/* ── Active order banners ── */}
                {myOrders.some((o:any) => ['in_transit','picked_up'].includes(o.status)) && (
                    <div onClick={() => setActiveTab('orders')}
                        style={{ background:'linear-gradient(135deg,#f0fdf4,#dcfce7)', border:'2px solid #22c55e', borderRadius:18, padding:'14px 20px', marginBottom:16, display:'flex', alignItems:'center', gap:14, cursor:'pointer', boxShadow:'0 4px 20px rgba(34,197,94,.2)', transition:'all .2s' }}
                        onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.transform='translateY(-2px)';}}
                        onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.transform='none';}}>
                        <div style={{ fontSize:'1.8rem', flexShrink:0 }}>🚗</div>
                        <div style={{ flex:1 }}>
                            <p style={{ fontSize:'0.9rem', fontWeight:800, color:'#14532d', marginBottom:3 }}>Your food is on the way!</p>
                            <p style={{ fontSize:'0.78rem', color:'#16a34a' }}>Tap to track your order and confirm when received</p>
                        </div>
                        <div style={{ padding:'8px 14px', borderRadius:11, background:'#22c55e', color:'#fff', fontWeight:700, fontSize:'0.78rem', flexShrink:0 }}>Track →</div>
                    </div>
                )}
                {myOrders.some((o:any) => o.status === 'confirmed') && !myOrders.some((o:any) => ['in_transit','picked_up'].includes(o.status)) && (
                    <div onClick={() => setActiveTab('orders')}
                        style={{ background:'linear-gradient(135deg,#eff6ff,#dbeafe)', border:'1.5px solid #3b82f6', borderRadius:18, padding:'14px 20px', marginBottom:16, display:'flex', alignItems:'center', gap:14, cursor:'pointer', transition:'all .2s' }}
                        onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.transform='translateY(-2px)';}}
                        onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.transform='none';}}>
                        <div style={{ fontSize:'1.8rem', flexShrink:0 }}>✅</div>
                        <div style={{ flex:1 }}>
                            <p style={{ fontSize:'0.9rem', fontWeight:800, color:'#1e3a5f', marginBottom:3 }}>Donor confirmed your request!</p>
                            <p style={{ fontSize:'0.78rem', color:'#3b82f6' }}>A volunteer will pick it up soon — tap to track</p>
                        </div>
                        <div style={{ padding:'8px 14px', borderRadius:11, background:'#3b82f6', color:'#fff', fontWeight:700, fontSize:'0.78rem', flexShrink:0 }}>View →</div>
                    </div>
                )}
                {myOrders.some((o:any) => o.status === 'reserved') && !myOrders.some((o:any) => ['in_transit','picked_up','confirmed'].includes(o.status)) && (
                    <div onClick={() => setActiveTab('orders')}
                        style={{ background:'linear-gradient(135deg,#faf5ff,#ede9fe)', border:'1.5px solid #8b5cf6', borderRadius:18, padding:'14px 20px', marginBottom:16, display:'flex', alignItems:'center', gap:14, cursor:'pointer', transition:'all .2s' }}
                        onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.transform='translateY(-2px)';}}
                        onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.transform='none';}}>
                        <div style={{ fontSize:'1.8rem', flexShrink:0 }}>🚴</div>
                        <div style={{ flex:1 }}>
                            <p style={{ fontSize:'0.9rem', fontWeight:800, color:'#4c1d95', marginBottom:3 }}>Volunteer assigned!</p>
                            <p style={{ fontSize:'0.78rem', color:'#7c3aed' }}>A volunteer has accepted your pickup</p>
                        </div>
                        <div style={{ padding:'8px 14px', borderRadius:11, background:'#8b5cf6', color:'#fff', fontWeight:700, fontSize:'0.78rem', flexShrink:0 }}>Track →</div>
                    </div>
                )}

                {/* Search + Filters */}
                        <div style={{ background:'#fff', borderRadius:20, border:'1px solid #f1f5f9', boxShadow:'0 2px 14px rgba(0,0,0,.04)', padding:'16px 20px', marginBottom:20 }}>
                            <div style={{ display:'flex', gap:10, marginBottom:14 }}>
                                <div style={{ position:'relative', flex:1 }}>
                                    <Search size={16} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'#94a3b8', pointerEvents:'none' }}/>
                                    <input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}
                                        placeholder="Search food type, description, location…"
                                        style={{ width:'100%', padding:'11px 14px 11px 40px', borderRadius:12, border:'1.5px solid #e2e8f0', background:'#f8fafc', fontSize:'0.875rem', color:'#0f172a', outline:'none', transition:'all .2s', fontFamily:'inherit' }}
                                        onFocus={e=>{e.currentTarget.style.borderColor='#8b5cf6';e.currentTarget.style.background='#fff';e.currentTarget.style.boxShadow='0 0 0 3px rgba(139,92,246,.12)';}}
                                        onBlur={e =>{e.currentTarget.style.borderColor='#e2e8f0';e.currentTarget.style.background='#f8fafc';e.currentTarget.style.boxShadow='none';}}/>
                                    {searchQuery && (
                                        <button onClick={()=>setSearchQuery('')} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center' }}>
                                            <X size={14} color="#94a3b8"/>
                                        </button>
                                    )}
                                </div>
                                <div style={{ position:'relative' }}>
                                    <select value={sortBy} onChange={e=>setSortBy(e.target.value)}
                                        style={{ padding:'11px 32px 11px 14px', borderRadius:12, border:'1.5px solid #e2e8f0', background:'#f8fafc', fontSize:'0.82rem', fontWeight:600, color:'#334155', cursor:'pointer', outline:'none', appearance:'none' }}>
                                        {SORT_OPTS.map(o=><option key={o}>{o}</option>)}
                                    </select>
                                    <ChevronDown size={13} color="#64748b" style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}/>
                                </div>
                            </div>
                            <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:2 }}>
                                {FILTERS.map(f=>(
                                    <button key={f} onClick={()=>setSelectedFilter(f)}
                                        style={{ padding:'6px 14px', borderRadius:99, fontSize:'0.78rem', fontWeight:600, border:`1.5px solid ${selectedFilter===f?'#8b5cf6':'#e2e8f0'}`, background:selectedFilter===f?'#f5f3ff':'#f8fafc', color:selectedFilter===f?'#7c3aed':'#64748b', cursor:'pointer', whiteSpace:'nowrap', transition:'all .2s', fontFamily:'inherit' }}>
                                        {f}
                                    </button>
                                ))}
                            </div>
                            <div style={{ marginTop:12, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                                <p style={{ fontSize:'0.75rem', color:'#94a3b8' }}>
                                    Showing <strong style={{ color:'#334155' }}>{filtered.length}</strong> of <strong style={{ color:'#334155' }}>{listings.length}</strong> listings
                                    {searchQuery && <> matching "<strong style={{ color:'#7c3aed' }}>{searchQuery}</strong>"</>}
                                </p>
                                <p style={{ fontSize:'0.68rem', color:'#cbd5e1' }}>Updated {lastRefresh.toLocaleTimeString()}{socketConnected&&<span style={{ color:'#bbf7d0', marginLeft:4 }}>· live</span>}</p>
                            </div>
                        </div>

                        {/* Content */}
                        {viewMode === 'map' ? (
                            <div>
                                <div style={{ borderRadius:20, overflow:'hidden', border:'1px solid #f1f5f9', boxShadow:'0 4px 20px rgba(0,0,0,.06)', marginBottom:16 }}>
                                    <InteractiveMap foodListings={filtered} userLocation={userLocation} onListingClick={(l:any)=>navigate(`/food-listings/${l._id}`)} height="480px" showUserLocation/>
                                </div>
                                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:12 }}>
                                    {[
                                        { label:'Total Available', value:filtered.length, icon:MapPin, color:'#8b5cf6', bg:'#f5f3ff' },
                                        { label:'Near You', value:filtered.filter((l:any)=>l.location?.coordinates).length, icon:Navigation, color:'#22c55e', bg:'#f0fdf4' },
                                        { label:'Fresh Today', value:todayCount, icon:Clock, color:'#f97316', bg:'#fff7ed' },
                                        { label:'Total Servings', value:totalServings, icon:MessageCircle, color:'#3b82f6', bg:'#eff6ff' },
                                    ].map(({label,value,icon:Icon,color,bg})=>(
                                        <div key={label} style={{ background:'#fff', borderRadius:16, border:'1px solid #f1f5f9', padding:16, boxShadow:'0 2px 10px rgba(0,0,0,.04)', display:'flex', alignItems:'center', gap:12 }}>
                                            <div style={{ width:36, height:36, borderRadius:10, background:bg, display:'flex', alignItems:'center', justifyContent:'center' }}><Icon size={16} color={color}/></div>
                                            <div>
                                                <p style={{ fontSize:'1.4rem', fontWeight:800, color:'#0f172a', fontFamily:"'Playfair Display',serif", lineHeight:1 }}>{value}</p>
                                                <p style={{ fontSize:'0.7rem', color:'#94a3b8', marginTop:2 }}>{label}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div>
                                {loading ? (
                                    <div style={{ textAlign:'center', padding:'64px 24px', background:'#fff', borderRadius:20, border:'1px solid #f1f5f9' }}>
                                        <div style={{ width:44, height:44, borderRadius:'50%', border:'3px solid #e2e8f0', borderTopColor:'#8b5cf6', animation:'spin .8s linear infinite', margin:'0 auto 16px' }}/>
                                        <p style={{ fontSize:'0.9rem', color:'#64748b', fontWeight:500 }}>Loading food listings…</p>
                                    </div>
                                ) : error ? (
                                    <div style={{ textAlign:'center', padding:'48px 24px', background:'#fff', borderRadius:20, border:'1px solid #fecaca' }}>
                                        <AlertCircle size={28} color="#ef4444" style={{ margin:'0 auto 12px', display:'block' }}/>
                                        <p style={{ fontSize:'0.9rem', fontWeight:600, color:'#dc2626', marginBottom:18 }}>{error}</p>
                                        <button onClick={()=>fetchListings()} style={{ padding:'10px 22px', borderRadius:12, background:'linear-gradient(135deg,#8b5cf6,#6d28d9)', border:'none', color:'#fff', fontWeight:700, cursor:'pointer' }}>Try Again</button>
                                    </div>
                                ) : filtered.length === 0 ? (
                                    <div style={{ textAlign:'center', padding:'56px 24px', background:'#fff', borderRadius:20, border:'1px solid #f1f5f9' }}>
                                        <div style={{ fontSize:'3rem', marginBottom:14 }}>🍽️</div>
                                        <h3 style={{ fontSize:'1.05rem', fontWeight:700, color:'#0f172a', marginBottom:8 }}>
                                            {listings.length===0?'No food available right now':'No matches found'}
                                        </h3>
                                        <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap', marginTop:16 }}>
                                            {(searchQuery||selectedFilter!=='All Types') && (
                                                <button onClick={()=>{setSearchQuery('');setSelectedFilter('All Types');}} style={{ padding:'9px 20px', borderRadius:12, background:'#f5f3ff', border:'1px solid #ddd6fe', color:'#7c3aed', fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>Clear Filters</button>
                                            )}
                                            <button onClick={()=>fetchListings()} style={{ padding:'9px 20px', borderRadius:12, background:'linear-gradient(135deg,#8b5cf6,#6d28d9)', border:'none', color:'#fff', fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>Refresh</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                                        {filtered.map((listing:any,i:number)=>(
                                            <div key={listing._id} style={{ animation:`fadeUp .4s ease ${i*.04}s both`, opacity:0 }}>
                                                <FoodListingVisibility listing={listing}/>
                                            </div>
                                        ))}
                                        <p style={{ textAlign:'center', fontSize:'0.75rem', color:'#94a3b8', padding:'12px 0' }}>✅ {filtered.length} listing{filtered.length!==1?'s':''} shown</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}

                {/* ══ MY ORDERS TAB ══ */}
                {activeTab === 'orders' && (
                    <div style={{ animation:'fadeUp .4s ease both' }}>
                        {ordersLoading ? (
                            <div style={{ textAlign:'center', padding:'64px 24px', background:'#fff', borderRadius:20, border:'1px solid #f1f5f9' }}>
                                <div style={{ width:44, height:44, borderRadius:'50%', border:'3px solid #e2e8f0', borderTopColor:'#8b5cf6', animation:'spin .8s linear infinite', margin:'0 auto 16px' }}/>
                                <p style={{ fontSize:'0.9rem', color:'#64748b', fontWeight:500 }}>Loading your orders…</p>
                            </div>
                        ) : myOrders.length === 0 ? (
                            <div style={{ textAlign:'center', padding:'56px 24px', background:'#fff', borderRadius:20, border:'1px solid #f1f5f9' }}>
                                <div style={{ fontSize:'3rem', marginBottom:14 }}>📦</div>
                                <h3 style={{ fontSize:'1.05rem', fontWeight:700, color:'#0f172a', marginBottom:8 }}>No orders yet</h3>
                                <p style={{ fontSize:'0.82rem', color:'#64748b', maxWidth:320, margin:'0 auto 20px', lineHeight:1.7 }}>
                                    Browse available food and request a listing to see your orders here.
                                </p>
                                <button onClick={()=>setActiveTab('browse')} style={{ padding:'10px 24px', borderRadius:12, background:'linear-gradient(135deg,#8b5cf6,#6d28d9)', border:'none', color:'#fff', fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                                    Browse Food
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* Active orders */}
                                {myOrders.filter(o=>o.status!=='completed').length > 0 && (
                                    <div style={{ marginBottom:24 }}>
                                        <p style={{ fontSize:'0.75rem', fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:12 }}>
                                            Active Orders ({myOrders.filter(o=>o.status!=='completed').length})
                                        </p>
                                        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:14 }}>
                                            {myOrders.filter(o=>o.status!=='completed').map(order=>(
                                                <OrderCard key={order._id} order={order} onTrack={id=>navigate(`/order-tracking/${id}`)}/>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Completed orders */}
                                {myOrders.filter(o=>o.status==='completed').length > 0 && (
                                    <div>
                                        <p style={{ fontSize:'0.75rem', fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:12 }}>
                                            Completed ({myOrders.filter(o=>o.status==='completed').length})
                                        </p>
                                        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:14 }}>
                                            {myOrders.filter(o=>o.status==='completed').map(order=>(
                                                <OrderCard key={order._id} order={order} onTrack={id=>navigate(`/order-tracking/${id}`)}/>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}

                {/* ══ WASTE CTA ══ */}
                <div style={{ marginTop:28, background:'linear-gradient(135deg,#f0fdf4,#ecfdf5)', borderRadius:20, padding:'20px 24px', border:'1px solid #bbf7d0', display:'flex', alignItems:'center', justifyContent:'space-between', gap:16, flexWrap:'wrap' }}>
                    <div>
                        <h3 style={{ fontSize:'0.95rem', fontWeight:700, color:'#14532d', marginBottom:4 }}>Have organic waste?</h3>
                        <p style={{ fontSize:'0.8rem', color:'#16a34a', lineHeight:1.6 }}>Turn it into renewable energy — schedule a free pickup today.</p>
                    </div>
                    <button onClick={()=>navigate('/waste-to-energy')} style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 20px', borderRadius:14, background:'linear-gradient(135deg,#22c55e,#15803d)', border:'none', color:'#fff', fontWeight:700, fontSize:'0.85rem', cursor:'pointer', boxShadow:'0 4px 14px rgba(34,197,94,.3)', whiteSpace:'nowrap', flexShrink:0 }}>
                        <Recycle size={15}/> Schedule Pickup
                    </button>
                </div>
            </div>
        </div>
    );
}