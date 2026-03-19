import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, MapPin, Clock, Filter, List, Map as MapIcon, Navigation, MessageCircle, RefreshCw, AlertCircle, Recycle, ChevronDown, X, Leaf, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { foodDonationService } from '../../services/foodDonationService';
import { FoodDonation } from '../../types/foodListing';
import FoodListingVisibility from '../common/FoodListingVisibility';
import InteractiveMap from '../maps/InteractiveMap';
import useSocket from '../../hooks/useSocket';

/* ─────────────────────────────────────────────────
   SAFE helpers — do NOT rely on expirationUtils
   because bestBefore is stored as a decimal string
   (e.g. "4" = 4 hours, "4.5" = 4h 30m)
───────────────────────────────────────────────── */
function isExpired(listing: any): boolean {
    // If backend explicitly marks it expired
    const s = (listing.status || '').toLowerCase().trim();
    if (s === 'expired' || s === 'completed' || s === 'cancelled') return true;

    try {
        const created = new Date(listing.createdAt).getTime();
        const hours   = parseFloat(listing.bestBefore);
        if (isNaN(created) || isNaN(hours) || hours <= 0) return false;
        return Date.now() > created + hours * 3_600_000;
    } catch {
        return false;
    }
}

function isAvailable(listing: any): boolean {
    const s = (listing.status || '').toLowerCase().trim();
    // Accept anything that is NOT explicitly a terminal state
    // This handles: 'available', 'Available', 'AVAILABLE', '', undefined, null
    return s === '' || s === 'available' || s === 'active' || s === 'open';
}

const FILTERS   = ['All Types', 'Vegetarian', 'Vegan', 'Non-Vegetarian', 'Gluten-Free', 'Dairy-Free'];
const SORT_OPTS = ['Newest First', 'Expiring Soon', 'Most Servings'];

export default function FoodListingsPage() {
    const navigate = useNavigate();
    const { getUnreadCount } = useSocket();

    const [listings,       setListings]       = useState<FoodDonation[]>([]);
    const [loading,        setLoading]        = useState(true);
    const [error,          setError]          = useState<string | null>(null);
    const [lastRefresh,    setLastRefresh]    = useState(new Date());
    const [searchQuery,    setSearchQuery]    = useState('');
    const [selectedFilter, setSelectedFilter] = useState('All Types');
    const [sortBy,         setSortBy]         = useState('Newest First');
    const [viewMode,       setViewMode]       = useState<'list' | 'map'>('list');
    const [userLocation,   setUserLocation]   = useState<{ lat: number; lng: number } | null>(null);
    const [headerScrolled, setHeaderScrolled] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    /* ─── Fetch ─── */
    const fetchListings = useCallback(async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            setError(null);

            const data = await foodDonationService.getAll();
            const arr  = Array.isArray(data) ? data : (data as any)?.donations || [];

            // ✅ Fixed filter: accept empty/undefined status, reject only terminal states
            const available = arr.filter((l: any) => isAvailable(l) && !isExpired(l));

            console.log(`[FoodListings] fetched ${arr.length} total, ${available.length} available`);
            setListings(available);
            setLastRefresh(new Date());
        } catch (err: any) {
            console.error('[FoodListings] fetch error:', err);
            setError(err?.response?.data?.message || 'Failed to load listings. Check your connection.');
        } finally {
            setLoading(false);
        }
    }, []);

    /* Mount + auto-refresh every 60s */
    useEffect(() => {
        fetchListings();
        intervalRef.current = setInterval(() => fetchListings(true), 60_000);
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [fetchListings]);

    /* Re-fetch when tab regains focus */
    useEffect(() => {
        const onFocus = () => fetchListings(true);
        window.addEventListener('focus', onFocus);
        return () => window.removeEventListener('focus', onFocus);
    }, [fetchListings]);

    /* Geolocation */
    useEffect(() => {
        navigator.geolocation?.getCurrentPosition(
            p  => setUserLocation({ lat: p.coords.latitude,  lng: p.coords.longitude }),
            () => setUserLocation({ lat: 22.5726, lng: 88.3639 }) // Kolkata fallback
        );
    }, []);

    useEffect(() => {
        const fn = () => setHeaderScrolled(window.scrollY > 10);
        window.addEventListener('scroll', fn);
        return () => window.removeEventListener('scroll', fn);
    }, []);

    /* ─── Filter + Sort ─── */
    const filtered = listings
        .filter(l => {
            const lAny = l as any;
            const q = searchQuery.toLowerCase();
            const matchSearch = !q
                || lAny.foodType?.toLowerCase().includes(q)
                || lAny.description?.toLowerCase().includes(q)
                || lAny.location?.address?.toLowerCase().includes(q);

            const matchFilter = selectedFilter === 'All Types'
                || lAny.foodType?.toLowerCase().includes(selectedFilter.toLowerCase())
                || (lAny.allergens || []).some((a: string) => a.toLowerCase().includes(selectedFilter.toLowerCase()))
                || lAny.category?.toLowerCase().includes(selectedFilter.toLowerCase());

            return matchSearch && matchFilter;
        })
        .sort((a: any, b: any) => {
            if (sortBy === 'Expiring Soon') {
                const tA = new Date(a.createdAt).getTime() + parseFloat(a.bestBefore || '0') * 3_600_000;
                const tB = new Date(b.createdAt).getTime() + parseFloat(b.bestBefore || '0') * 3_600_000;
                return tA - tB;
            }
            if (sortBy === 'Most Servings') return (b.servings || 0) - (a.servings || 0);
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

    const todayCount    = listings.filter(l => new Date((l as any).createdAt).toDateString() === new Date().toDateString()).length;
    const totalServings = listings.reduce((s, l) => s + ((l as any).servings || 0), 0);
    const unread        = getUnreadCount();

    /* ─── Styles ─── */
    const CSS = `
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@700;800&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        @keyframes pulse  { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.6;transform:scale(1.4)} }
        * { box-sizing:border-box; margin:0; padding:0; }
        input,select,textarea { font-family:inherit; }
        ::-webkit-scrollbar { height:4px; }
        ::-webkit-scrollbar-track { background:#f1f5f9; border-radius:99px; }
        ::-webkit-scrollbar-thumb { background:#cbd5e1; border-radius:99px; }
    `;

    return (
        <div style={{ minHeight:'100vh', background:'linear-gradient(145deg,#f5f3ff 0%,#f8fafc 50%,#eff6ff 100%)', fontFamily:"'DM Sans',system-ui,sans-serif" }}>
            <style>{CSS}</style>

            {/* ══ HEADER ══ */}
            <header style={{ position:'sticky', top:0, zIndex:50, background: headerScrolled ? 'rgba(255,255,255,0.96)' : 'rgba(255,255,255,0.82)', backdropFilter:'blur(20px)', borderBottom:`1px solid ${headerScrolled ? 'rgba(0,0,0,0.08)' : 'transparent'}`, boxShadow: headerScrolled ? '0 2px 20px rgba(0,0,0,0.06)' : 'none', transition:'all .3s' }}>
                <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 24px', height:66, display:'flex', alignItems:'center', justifyContent:'space-between', gap:16 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                        <div style={{ width:38, height:38, borderRadius:12, background:'linear-gradient(135deg,#8b5cf6,#6d28d9)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 12px rgba(139,92,246,.35)' }}>
                            <Leaf size={17} color="#fff" />
                        </div>
                        <div>
                            <h1 style={{ fontSize:'1rem', fontWeight:800, color:'#0f172a', fontFamily:"'Playfair Display',serif" }}>Available Food</h1>
                            <p style={{ fontSize:'0.66rem', color:'#94a3b8' }}>{listings.length} listing{listings.length !== 1 ? 's' : ''} near you</p>
                        </div>
                    </div>

                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        {/* Notification badge */}
                        {unread > 0 && (
                            <div style={{ position:'relative', width:36, height:36, borderRadius:10, background:'#fef2f2', border:'1px solid #fecaca', display:'flex', alignItems:'center', justifyContent:'center' }}>
                                <MessageCircle size={15} color="#ef4444" />
                                <div style={{ position:'absolute', top:-4, right:-4, width:16, height:16, borderRadius:'50%', background:'#ef4444', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.55rem', color:'#fff', fontWeight:700 }}>{unread}</div>
                            </div>
                        )}

                        {/* View toggle */}
                        <div style={{ display:'flex', background:'#f1f5f9', borderRadius:11, padding:3 }}>
                            {(['list','map'] as const).map(mode => (
                                <button key={mode} onClick={() => setViewMode(mode)}
                                    style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 12px', borderRadius:9, border:'none', cursor:'pointer', fontFamily:'inherit', fontSize:'0.78rem', fontWeight:600, background: viewMode === mode ? '#fff' : 'transparent', color: viewMode === mode ? '#0f172a' : '#94a3b8', boxShadow: viewMode === mode ? '0 1px 6px rgba(0,0,0,.08)' : 'none', transition:'all .2s' }}>
                                    {mode === 'list' ? <List size={13}/> : <MapIcon size={13}/>}
                                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                                </button>
                            ))}
                        </div>

                        {/* Refresh */}
                        <button onClick={() => fetchListings()} title="Refresh"
                            style={{ width:36, height:36, borderRadius:10, border:'1px solid #e2e8f0', background:'#f8fafc', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                            <RefreshCw size={14} color="#64748b" style={{ animation: loading ? 'spin .8s linear infinite' : 'none' }} />
                        </button>

                        {/* Profile */}
                        <button onClick={() => navigate('/profile')}
                            style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:11, background:'#f8fafc', border:'1px solid #e2e8f0', color:'#334155', fontWeight:600, fontSize:'0.78rem', cursor:'pointer', fontFamily:'inherit' }}>
                            <User size={13}/> Profile
                        </button>
                    </div>
                </div>
            </header>

            <div style={{ maxWidth:1100, margin:'0 auto', padding:'28px 24px 60px' }}>

                {/* ══ HERO ══ */}
                <div style={{ background:'linear-gradient(135deg,#2e1065,#4c1d95,#6d28d9,#8b5cf6)', borderRadius:24, padding:'24px 28px', marginBottom:24, position:'relative', overflow:'hidden', animation:'fadeUp .5s ease both', boxShadow:'0 16px 48px rgba(109,40,217,.25)' }}>
                    <div style={{ position:'absolute', top:-40, right:-40, width:220, height:220, borderRadius:'50%', background:'rgba(167,139,250,.18)', filter:'blur(20px)', pointerEvents:'none' }} />
                    <div style={{ position:'relative', zIndex:1, display:'flex', alignItems:'center', justifyContent:'space-between', gap:20, flexWrap:'wrap' }}>
                        <div>
                            <div style={{ display:'inline-flex', alignItems:'center', gap:7, background:'rgba(255,255,255,.1)', border:'1px solid rgba(255,255,255,.15)', borderRadius:99, padding:'4px 12px', marginBottom:12 }}>
                                <div style={{ width:7, height:7, borderRadius:'50%', background:'#4ade80', animation:'pulse 1.8s ease-in-out infinite' }} />
                                <span style={{ fontSize:'0.66rem', color:'rgba(255,255,255,.65)', fontWeight:700, letterSpacing:'.08em' }}>LIVE FEED</span>
                            </div>
                            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(1.3rem,2.5vw,1.8rem)', color:'#fff', marginBottom:8 }}>Find Free Food Near You 🌿</h2>
                            <p style={{ fontSize:'0.85rem', color:'rgba(255,255,255,.55)', maxWidth:380, lineHeight:1.7 }}>
                                <strong style={{ color:'#c4b5fd' }}>{listings.length} listing{listings.length!==1?'s':''}</strong> available right now · refreshes automatically
                            </p>
                        </div>
                        <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                            {[['🍱', String(listings.length),'available'],['🌅',String(todayCount),'fresh today'],['👥',String(totalServings),'servings']].map(([emoji,val,sub])=>(
                                <div key={sub} style={{ background:'rgba(255,255,255,.1)', border:'1px solid rgba(255,255,255,.15)', borderRadius:14, padding:'10px 16px', textAlign:'center', backdropFilter:'blur(8px)' }}>
                                    <div style={{ fontSize:'1rem', fontWeight:700, color:'#fff' }}>{emoji} {val}</div>
                                    <div style={{ fontSize:'0.64rem', color:'rgba(255,255,255,.45)', marginTop:2 }}>{sub}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ══ SEARCH + FILTERS ══ */}
                <div style={{ background:'#fff', borderRadius:20, border:'1px solid #f1f5f9', boxShadow:'0 2px 14px rgba(0,0,0,.04)', padding:'16px 20px', marginBottom:20 }}>
                    <div style={{ display:'flex', gap:10, marginBottom:14 }}>
                        <div style={{ position:'relative', flex:1 }}>
                            <Search size={16} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'#94a3b8', pointerEvents:'none' }} />
                            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search food type, description, location…"
                                style={{ width:'100%', padding:'11px 14px 11px 40px', borderRadius:12, border:'1.5px solid #e2e8f0', background:'#f8fafc', fontSize:'0.875rem', color:'#0f172a', outline:'none', transition:'all .2s' }}
                                onFocus={e => { e.currentTarget.style.borderColor='#8b5cf6'; e.currentTarget.style.background='#fff'; }}
                                onBlur={e  => { e.currentTarget.style.borderColor='#e2e8f0'; e.currentTarget.style.background='#f8fafc'; }}
                            />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery('')} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer' }}>
                                    <X size={14} color="#94a3b8" />
                                </button>
                            )}
                        </div>
                        <div style={{ position:'relative' }}>
                            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                                style={{ padding:'11px 32px 11px 14px', borderRadius:12, border:'1.5px solid #e2e8f0', background:'#f8fafc', fontSize:'0.82rem', fontWeight:600, color:'#334155', cursor:'pointer', outline:'none', appearance:'none' }}>
                                {SORT_OPTS.map(o => <option key={o}>{o}</option>)}
                            </select>
                            <ChevronDown size={13} color="#64748b" style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }} />
                        </div>
                    </div>

                    <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:2 }}>
                        {FILTERS.map(f => (
                            <button key={f} onClick={() => setSelectedFilter(f)}
                                style={{ padding:'6px 14px', borderRadius:99, fontSize:'0.78rem', fontWeight:600, border:`1.5px solid ${selectedFilter===f?'#8b5cf6':'#e2e8f0'}`, background: selectedFilter===f?'#f5f3ff':'#f8fafc', color: selectedFilter===f?'#7c3aed':'#64748b', cursor:'pointer', whiteSpace:'nowrap', transition:'all .2s' }}>
                                {f}
                            </button>
                        ))}
                    </div>

                    <div style={{ marginTop:12, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                        <p style={{ fontSize:'0.75rem', color:'#94a3b8' }}>
                            Showing <strong style={{ color:'#334155' }}>{filtered.length}</strong> of <strong style={{ color:'#334155' }}>{listings.length}</strong> listings
                            {searchQuery && <> matching "<strong style={{ color:'#7c3aed' }}>{searchQuery}</strong>"</>}
                        </p>
                        <p style={{ fontSize:'0.68rem', color:'#cbd5e1' }}>Updated {lastRefresh.toLocaleTimeString()}</p>
                    </div>
                </div>

                {/* ══ CONTENT ══ */}
                {viewMode === 'map' ? (
                    <div>
                        <div style={{ borderRadius:20, overflow:'hidden', border:'1px solid #f1f5f9', boxShadow:'0 4px 20px rgba(0,0,0,.06)', marginBottom:16 }}>
                            <InteractiveMap
                                foodListings={filtered}
                                userLocation={userLocation}
                                onListingClick={(l: any) => navigate(`/food-listings/${l._id}`)}
                                height="480px"
                                showUserLocation
                            />
                        </div>
                        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:12 }}>
                            {[
                                { label:'Total Available', value:filtered.length,    icon:MapPin,      color:'#8b5cf6', bg:'#f5f3ff' },
                                { label:'Near You',        value:filtered.filter((l:any) => l.location?.coordinates).length, icon:Navigation, color:'#22c55e', bg:'#f0fdf4' },
                                { label:'Fresh Today',     value:todayCount,          icon:Clock,       color:'#f97316', bg:'#fff7ed' },
                                { label:'Total Servings',  value:totalServings,       icon:MessageCircle,color:'#3b82f6', bg:'#eff6ff' },
                            ].map(({ label, value, icon:Icon, color, bg }) => (
                                <div key={label} style={{ background:'#fff', borderRadius:16, border:'1px solid #f1f5f9', padding:16, boxShadow:'0 2px 10px rgba(0,0,0,.04)', display:'flex', alignItems:'center', gap:12 }}>
                                    <div style={{ width:36, height:36, borderRadius:10, background:bg, display:'flex', alignItems:'center', justifyContent:'center' }}>
                                        <Icon size={16} color={color} />
                                    </div>
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
                                <div style={{ width:44, height:44, borderRadius:'50%', border:'3px solid #e2e8f0', borderTopColor:'#8b5cf6', animation:'spin .8s linear infinite', margin:'0 auto 16px' }} />
                                <p style={{ fontSize:'0.9rem', color:'#64748b', fontWeight:500 }}>Loading food listings…</p>
                            </div>
                        ) : error ? (
                            <div style={{ textAlign:'center', padding:'48px 24px', background:'#fff', borderRadius:20, border:'1px solid #fecaca' }}>
                                <AlertCircle size={28} color="#ef4444" style={{ margin:'0 auto 12px', display:'block' }} />
                                <p style={{ fontSize:'0.9rem', fontWeight:600, color:'#dc2626', marginBottom:6 }}>{error}</p>
                                <button onClick={() => fetchListings()} style={{ marginTop:12, padding:'10px 22px', borderRadius:12, background:'linear-gradient(135deg,#8b5cf6,#6d28d9)', border:'none', color:'#fff', fontWeight:700, cursor:'pointer' }}>
                                    Try Again
                                </button>
                            </div>
                        ) : filtered.length === 0 ? (
                            <div style={{ textAlign:'center', padding:'56px 24px', background:'#fff', borderRadius:20, border:'1px solid #f1f5f9' }}>
                                <div style={{ fontSize:'3rem', marginBottom:14 }}>🍽️</div>
                                <h3 style={{ fontSize:'1.05rem', fontWeight:700, color:'#0f172a', marginBottom:8 }}>
                                    {listings.length === 0 ? 'No food available right now' : 'No matches found'}
                                </h3>
                                <p style={{ fontSize:'0.82rem', color:'#64748b', maxWidth:360, margin:'0 auto 20px', lineHeight:1.7 }}>
                                    {listings.length === 0
                                        ? "Donors haven't posted any surplus food yet. Check back soon — listings appear here instantly!"
                                        : `No listings match "${searchQuery || selectedFilter}". Try clearing filters.`}
                                </p>
                                <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
                                    {(searchQuery || selectedFilter !== 'All Types') && (
                                        <button onClick={() => { setSearchQuery(''); setSelectedFilter('All Types'); }}
                                            style={{ padding:'9px 20px', borderRadius:12, background:'#f5f3ff', border:'1px solid #ddd6fe', color:'#7c3aed', fontWeight:600, cursor:'pointer' }}>
                                            Clear Filters
                                        </button>
                                    )}
                                    <button onClick={() => fetchListings()}
                                        style={{ padding:'9px 20px', borderRadius:12, background:'linear-gradient(135deg,#8b5cf6,#6d28d9)', border:'none', color:'#fff', fontWeight:600, cursor:'pointer' }}>
                                        Refresh
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                                {filtered.map((listing, i) => (
                                    <div key={(listing as any)._id} style={{ animation:`fadeUp .4s ease ${i*.04}s both`, opacity:0 }}>
                                        <FoodListingVisibility listing={listing} />
                                    </div>
                                ))}
                                <p style={{ textAlign:'center', fontSize:'0.75rem', color:'#94a3b8', padding:'12px 0' }}>
                                    ✅ Showing all {filtered.length} available listing{filtered.length!==1?'s':''}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* ══ WASTE CTA ══ */}
                <div style={{ marginTop:28, background:'linear-gradient(135deg,#f0fdf4,#ecfdf5)', borderRadius:20, padding:'20px 24px', border:'1px solid #bbf7d0', display:'flex', alignItems:'center', justifyContent:'space-between', gap:16, flexWrap:'wrap' }}>
                    <div>
                        <h3 style={{ fontSize:'0.95rem', fontWeight:700, color:'#14532d', marginBottom:4 }}>Have organic waste?</h3>
                        <p style={{ fontSize:'0.8rem', color:'#16a34a', lineHeight:1.6 }}>Turn it into renewable energy — schedule a free pickup today.</p>
                    </div>
                    <button onClick={() => navigate('/waste-to-energy')}
                        style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 20px', borderRadius:14, background:'linear-gradient(135deg,#22c55e,#15803d)', border:'none', color:'#fff', fontWeight:700, fontSize:'0.85rem', cursor:'pointer', boxShadow:'0 4px 14px rgba(34,197,94,.3)', whiteSpace:'nowrap' }}>
                        <Recycle size={15}/> Schedule Pickup
                    </button>
                </div>
            </div>
        </div>
    );
}