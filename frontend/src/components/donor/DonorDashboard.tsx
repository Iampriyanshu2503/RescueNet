import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { foodDonationService } from '../../services/foodDonationService';
import type { FoodDonation } from '../../types/foodListing';
import {
    Users, Star, Recycle, Plus, Truck,
    Bell, Package, Calendar, CheckCircle, Info,
    BarChart3, LogOut, ChevronRight,
    Zap, Leaf, ArrowUpRight, Activity, RefreshCw, User
} from 'lucide-react';
import DetailedAnalyticsModal from './DetailedAnalyticsModal';
import FoodListingVisibility from '../common/FoodListingVisibility';

function Counter({ to, suffix = '', prefix = '', duration = 1400 }: { to: number; suffix?: string; prefix?: string; duration?: number }) {
    const [val, setVal] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    useEffect(() => {
        const obs = new IntersectionObserver(([e]) => {
            if (!e.isIntersecting) return;
            const t0 = Date.now();
            const tick = () => {
                const p = Math.min((Date.now() - t0) / duration, 1);
                const eased = 1 - Math.pow(1 - p, 4);
                setVal(Math.round(eased * to));
                if (p < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
            obs.disconnect();
        }, { threshold: 0.3 });
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, [to, duration]);
    const display = val >= 10000 ? (val / 1000).toFixed(val % 1000 === 0 ? 0 : 1) + 'k' : val >= 1000 ? val.toLocaleString() : val;
    return <span ref={ref}>{prefix}{display}{suffix}</span>;
}

function StatCard({ icon: Icon, label, numericValue, suffix = '', trend, gradient, shadowColor, onClick, delay = 0 }: any) {
    const [hov, setHov] = useState(false);
    const [tilt, setTilt] = useState({ x: 0, y: 0 });
    const cardRef = useRef<HTMLDivElement>(null);
    const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;
        const r = cardRef.current.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        setTilt({ x: y * 10, y: -x * 10 });
    }, []);
    return (
        <div ref={cardRef} onClick={onClick} onMouseEnter={() => setHov(true)} onMouseMove={onMouseMove} onMouseLeave={() => { setHov(false); setTilt({ x: 0, y: 0 }); }}
            style={{ position: 'relative', overflow: 'hidden', borderRadius: 22, padding: '22px 24px', cursor: 'pointer', background: '#fff', border: '1px solid rgba(0,0,0,0.06)', transition: 'box-shadow 0.35s ease, transform 0.12s ease', transform: hov ? `perspective(600px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(-6px) scale(1.02)` : 'none', boxShadow: hov ? `0 24px 56px ${shadowColor}30, 0 6px 20px rgba(0,0,0,0.08)` : '0 2px 14px rgba(0,0,0,0.05)', animation: `cardEnter 0.6s cubic-bezier(0.34,1.56,0.64,1) ${delay}s both` }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: gradient, borderRadius: '22px 22px 0 0' }} />
            <div style={{ position: 'absolute', top: -40, right: -40, width: 130, height: 130, borderRadius: '50%', background: gradient, opacity: hov ? 0.12 : 0.05, filter: 'blur(24px)', transition: 'opacity 0.4s', pointerEvents: 'none' }} />
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, position: 'relative', zIndex: 1 }}>
                <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9ca3af', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 10 }}>{label}</p>
                    <p style={{ fontSize: '2.1rem', fontWeight: 800, color: '#0f172a', lineHeight: 1, marginBottom: 9, fontFamily: "'Playfair Display','Georgia',serif" }}><Counter to={numericValue} suffix={suffix} /></p>
                    {trend && <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><div style={{ width: 16, height: 16, borderRadius: '50%', background: 'linear-gradient(135deg,#22c55e,#16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ArrowUpRight size={9} color="#fff" /></div><span style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: 600 }}>{trend}</span></div>}
                </div>
                <div style={{ width: 50, height: 50, borderRadius: 15, background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 6px 20px ${shadowColor}40`, transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)', transform: hov ? 'rotate(10deg) scale(1.12)' : 'none' }}>
                    <Icon size={22} color="#fff" />
                </div>
            </div>
            {hov && <div style={{ position: 'absolute', bottom: 12, right: 14, fontSize: '0.62rem', fontWeight: 700, color: '#6366f1', background: '#eef2ff', borderRadius: 99, padding: '3px 9px', animation: 'popIn 0.2s ease both', zIndex: 2 }}>View analytics ↗</div>}
        </div>
    );
}

function QuickBtn({ icon: Icon, label, gradient, shadowColor, onClick, delay = 0 }: any) {
    const [hov, setHov] = useState(false);
    return (
        <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', borderRadius: 14, border: 'none', cursor: 'pointer', background: gradient, color: '#fff', fontWeight: 600, fontSize: '0.875rem', fontFamily: 'inherit', position: 'relative', overflow: 'hidden', transition: 'all 0.25s', transform: hov ? 'translateX(5px) scale(1.01)' : 'none', boxShadow: hov ? `0 10px 28px ${shadowColor}45` : `0 3px 10px ${shadowColor}25`, animation: `slideRight 0.45s cubic-bezier(0.34,1.56,0.64,1) ${delay}s both` }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'transform 0.35s', transform: hov ? 'rotate(15deg) scale(1.1)' : 'none' }}><Icon size={15} /></div>
            <span style={{ flex: 1, textAlign: 'left' }}>{label}</span>
            <ChevronRight size={14} style={{ opacity: hov ? 1 : 0, transition: 'opacity 0.2s, transform 0.2s', transform: hov ? 'translateX(3px)' : 'none' }} />
        </button>
    );
}

export default function DonorDashboard() {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);
    const [selectedAnalyticsType, setSelectedAnalyticsType] = useState<'donations' | 'people-served' | 'active-listings' | 'pickup-requests' | null>(null);
    const [myListings, setMyListings] = useState<FoodDonation[]>([]);
    const [listingsLoading, setListingsLoading] = useState(true);
    const [listingsError, setListingsError] = useState<string | null>(null);
    const [headerScrolled, setHeaderScrolled] = useState(false);
    const navigate = useNavigate();

    useEffect(() => { const t = setInterval(() => setCurrentTime(new Date()), 1000); return () => clearInterval(t); }, []);
    useEffect(() => { const fn = () => setHeaderScrolled(window.scrollY > 12); window.addEventListener('scroll', fn); return () => window.removeEventListener('scroll', fn); }, []);

    const fetchListings = useCallback(async () => {
        try {
            setListingsLoading(true);
            setListingsError(null);
            const data = await foodDonationService.getMyDonations();
            setMyListings(Array.isArray(data) ? data : []);
        } catch (err: any) {
            setListingsError(err?.response?.data?.message || 'Failed to load listings');
        } finally {
            setListingsLoading(false);
        }
    }, []);

    useEffect(() => { fetchListings(); }, [fetchListings]);
    useEffect(() => {
        const onFocus = () => fetchListings();
        window.addEventListener('focus', onFocus);
        return () => window.removeEventListener('focus', onFocus);
    }, [fetchListings]);

    const handleAddSurplusFood   = () => navigate('/add-surplus-food');
    const handleRequestWastePickup = () => navigate('/waste-to-energy');
    const handleAddEvent         = () => navigate('/list-event-food');
    const handleTestEventReminder= () => alert('Event reminder test — Notification system working!');
    const handleAnalytics        = () => navigate('/donor-analytics');
    const handleLogout           = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/login'); };
    const handleProfile          = () => navigate('/donor-profile');
    const handleStatClick        = (t: 'donations' | 'people-served' | 'active-listings' | 'pickup-requests') => { setSelectedAnalyticsType(t); setIsAnalyticsModalOpen(true); };

    const hr = currentTime.getHours();
    const greeting = hr < 12 ? 'morning' : hr < 17 ? 'afternoon' : 'evening';

    const activeListings    = myListings.filter(l => l.status === 'available').length;
    const requestedListings = myListings.filter(l => l.status === 'requested').length;

    function isExpiredListing(l: any) {
        // Trust the DB status first
        if (['expired', 'cancelled', 'removed'].includes(l.status)) return true;
        // Completed = done, not expired
        if (['completed', 'claimed', 'requested', 'confirmed', 'reserved', 'picked_up', 'in_transit'].includes(l.status)) return false;
        // For 'available' listings, check if time has actually run out
        if (!l.bestBefore || !l.createdAt) return false;
        try {
            const h = parseFloat(l.bestBefore);
            if (isNaN(h) || h <= 0) return false;
            return Date.now() > new Date(l.createdAt).getTime() + h * 3_600_000;
        } catch { return false; }
    }
    const completedListings = myListings.filter(l => l.status === 'completed' || l.status === 'claimed').length;
    const totalServings     = myListings.reduce((s, l) => s + (l.servings || 0), 0);

    // Real-time timeAgo helper
    const timeAgo = (d: string) => {
        const diff = Date.now() - new Date(d).getTime();
        const m = Math.floor(diff / 60000);
        if (m < 1) return 'just now';
        if (m < 60) return `${m}m ago`;
        const h = Math.floor(m / 60);
        if (h < 24) return `${h}h ago`;
        return `${Math.floor(h / 24)}d ago`;
    };

    // Build real activity feed from actual listings
    const activityFeed = (() => {
        const items: { icon: any; iconColor: string; iconBg: string; message: string; details: string; time: string }[] = [];
        myListings.filter((l: any) => l.status === 'requested').slice(0, 2).forEach((l: any) => {
            items.push({ icon: Info, iconColor: '#2563eb', iconBg: '#eff6ff', message: 'New pickup request', details: `Someone requested "${l.foodType}" — ${l.servings} servings`, time: timeAgo(l.requestedAt || l.updatedAt || l.createdAt) });
        });
        myListings.filter((l: any) => l.status === 'confirmed').slice(0, 1).forEach((l: any) => {
            items.push({ icon: CheckCircle, iconColor: '#7c3aed', iconBg: '#f5f3ff', message: 'Request confirmed', details: `You approved "${l.foodType}" — volunteer assigned`, time: timeAgo(l.confirmedAt || l.updatedAt || l.createdAt) });
        });
        myListings.filter((l: any) => l.status === 'completed' || l.status === 'claimed').slice(0, 2).forEach((l: any) => {
            items.push({ icon: CheckCircle, iconColor: '#16a34a', iconBg: '#f0fdf4', message: 'Pickup completed', details: `"${l.foodType}" — ${l.servings} servings delivered`, time: timeAgo(l.completedAt || l.updatedAt || l.createdAt) });
        });
        myListings.filter((l: any) => l.status === 'available').slice(0, 2).forEach((l: any) => {
            items.push({ icon: Package, iconColor: '#f97316', iconBg: '#fff7ed', message: 'Listing active', details: `"${l.foodType}" — ${l.servings} servings available`, time: timeAgo(l.createdAt) });
        });
        // Sort by most recent
        return items.slice(0, 4);
    })();

    const stats = [
        { icon: Package,  label: 'Total Donations',  numericValue: myListings.length, suffix: '', trend: `${completedListings} completed`,   gradient: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', shadowColor: '#3b82f6', analyticsType: 'donations' as const },
        { icon: Users,    label: 'People Served',    numericValue: totalServings,      suffix: '', trend: 'from your listings',               gradient: 'linear-gradient(135deg,#22c55e,#15803d)', shadowColor: '#22c55e', analyticsType: 'people-served' as const },
        { icon: Calendar, label: 'Active Listings',  numericValue: activeListings,     suffix: '', trend: `${requestedListings} requested`,   gradient: 'linear-gradient(135deg,#f97316,#c2410c)', shadowColor: '#f97316', analyticsType: 'active-listings' as const },
        { icon: Truck,    label: 'Pickup Requests',  numericValue: requestedListings,  suffix: '', trend: requestedListings > 0 ? `${requestedListings} need response` : 'all clear', gradient: 'linear-gradient(135deg,#a855f7,#6d28d9)', shadowColor: '#a855f7', analyticsType: 'pickup-requests' as const },
    ];

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(145deg,#f0fdf4 0%,#f8fafc 40%,#f0f9ff 100%)', fontFamily: "'DM Sans',system-ui,sans-serif" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@700;800&display=swap');
                @keyframes cardEnter  { from{opacity:0;transform:translateY(24px) scale(0.96)} to{opacity:1;transform:translateY(0) scale(1)} }
                @keyframes slideRight { from{opacity:0;transform:translateX(-16px)} to{opacity:1;transform:translateX(0)} }
                @keyframes slideUp    { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
                @keyframes heroIn     { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
                @keyframes float      { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
                @keyframes pulse      { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.5);opacity:0.55} }
                @keyframes popIn      { from{opacity:0;transform:scale(0.8)} to{opacity:1;transform:scale(1)} }
                @keyframes ticker     { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
                @keyframes morph      { 0%,100%{border-radius:60% 40% 30% 70%/60% 30% 70% 40%} 50%{border-radius:30% 60% 70% 40%/50% 60% 30% 60%} }
                @keyframes spin       { to{transform:rotate(360deg)} }
                * { box-sizing:border-box; margin:0; padding:0; }
            `}</style>

            {/* HEADER */}
            <header style={{ position: 'sticky', top: 0, zIndex: 50, background: headerScrolled ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.75)', backdropFilter: 'blur(20px)', borderBottom: `1px solid ${headerScrolled ? 'rgba(0,0,0,0.07)' : 'rgba(0,0,0,0.04)'}`, boxShadow: headerScrolled ? '0 2px 24px rgba(0,0,0,0.06)' : 'none', transition: 'all 0.35s ease' }}>
                <div style={{ maxWidth: 1320, margin: '0 auto', padding: '0 28px', height: 66, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 13, background: 'linear-gradient(135deg,#22c55e,#15803d)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(34,197,94,0.38)', animation: 'float 3.5s ease-in-out infinite' }}>
                            <Leaf size={19} color="#fff" />
                        </div>
                        <div>
                            <h1 style={{ fontSize: '1.05rem', fontWeight: 800, background: 'linear-gradient(135deg,#1d4ed8,#7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontFamily: "'Playfair Display',serif" }}>Donor Dashboard</h1>
                            <p style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: 2 }}>Welcome back! Ready to make a difference?</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button onClick={handleAnalytics} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 11, background: '#f8fafc', border: '1px solid #e2e8f0', color: '#334155', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit' }}
                            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background='#eff6ff'; el.style.color='#1d4ed8'; }}
                            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background='#f8fafc'; el.style.color='#334155'; }}>
                            <BarChart3 size={14} /> Analytics
                        </button>
                        <button onClick={handleProfile} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 11, background: '#f8fafc', border: '1px solid #e2e8f0', color: '#334155', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit' }}
                            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background='#f5f3ff'; el.style.color='#7c3aed'; }}
                            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background='#f8fafc'; el.style.color='#334155'; }}>
                            <User size={14} /> Profile
                        </button>
                        <button style={{ width: 38, height: 38, borderRadius: 11, background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}>
                            <Bell size={15} color="#64748b" />
                            {requestedListings > 0 && <div style={{ position: 'absolute', top: 7, right: 7, width: 7, height: 7, borderRadius: '50%', background: '#ef4444', border: '1.5px solid #fff', animation: 'pulse 2s ease-in-out infinite' }} />}
                        </button>
                        <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 11, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                            <LogOut size={13} /> Logout
                        </button>
                    </div>
                </div>
            </header>

            <div style={{ maxWidth: 1320, margin: '0 auto', padding: '32px 28px 56px' }}>

                {/* HERO */}
                <div style={{ background: 'linear-gradient(135deg,#052e16 0%,#064e3b 45%,#065f46 80%,#0f766e 100%)', borderRadius: 26, padding: '28px 36px', marginBottom: 30, position: 'relative', overflow: 'hidden', animation: 'heroIn 0.65s ease both', boxShadow: '0 20px 60px rgba(6,78,59,0.25)' }}>
                    <div style={{ position: 'absolute', top: -50, right: -50, width: 280, height: 280, background: 'radial-gradient(circle,rgba(34,197,94,0.2),transparent 70%)', animation: 'morph 9s ease-in-out infinite', pointerEvents: 'none' }} />
                    <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
                        <div>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 99, padding: '5px 14px 5px 10px', marginBottom: 14 }}>
                                <div style={{ position: 'relative', width: 9, height: 9 }}>
                                    <div style={{ position: 'absolute', inset: 0, background: '#4ade80', borderRadius: '50%', animation: 'pulse 1.6s ease-in-out infinite' }} />
                                </div>
                                <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600, letterSpacing: '0.07em' }}>LIVE • {currentTime.toLocaleTimeString()}</span>
                            </div>
                            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(1.5rem,3vw,2rem)', color: '#fff', letterSpacing: '-0.025em', marginBottom: 10, lineHeight: 1.2 }}>Good {greeting}! 🌿</h2>
                            <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.58)', maxWidth: 400, lineHeight: 1.7 }}>
                                You have <strong style={{ color: '#86efac' }}>{activeListings} active listing{activeListings !== 1 ? 's' : ''}</strong> right now.
                                {requestedListings > 0 && <> <strong style={{ color: '#fbbf24' }}>{requestedListings} pending request{requestedListings !== 1 ? 's' : ''}</strong> need your response!</>}
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                            {[['🍱', String(myListings.length), 'donations'], ['✅', String(completedListings), 'completed'], ['👥', String(totalServings), 'servings']].map(([emoji, val, sub]) => (
                                <div key={sub} style={{ background: 'rgba(255,255,255,0.09)', border: '1px solid rgba(255,255,255,0.13)', borderRadius: 16, padding: '11px 18px', textAlign: 'center', backdropFilter: 'blur(10px)', transition: 'all 0.2s', cursor: 'default' }}
                                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background='rgba(255,255,255,0.18)'; el.style.transform='translateY(-2px)'; }}
                                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background='rgba(255,255,255,0.09)'; el.style.transform='none'; }}>
                                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>{emoji} {val}</div>
                                    <div style={{ fontSize: '0.66rem', color: 'rgba(255,255,255,0.45)', marginTop: 3 }}>{sub}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 26, background: 'rgba(0,0,0,0.18)', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: 40, animation: 'ticker 20s linear infinite', whiteSpace: 'nowrap' }}>
                            {(() => {
                                const ticks = [
                                    `🍱 ${myListings.length} total donation${myListings.length !== 1 ? 's' : ''}`,
                                    `✅ ${completedListings} completed pickup${completedListings !== 1 ? 's' : ''}`,
                                    `⚡ ${activeListings} active listing${activeListings !== 1 ? 's' : ''}`,
                                    `👥 ${totalServings} serving${totalServings !== 1 ? 's' : ''} shared`,
                                    `📦 ${requestedListings} awaiting response`,
                                    ...myListings.slice(0, 3).map((l: any) => `🍽️ "${l.foodType}" listed`),
                                ].filter(Boolean);
                                return [...ticks, ...ticks].map((t, i) => (
                                    <span key={i} style={{ fontSize: '0.66rem', color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>{t}</span>
                                ));
                            })()}
                        </div>
                    </div>
                </div>

                {/* STAT CARDS */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 18, marginBottom: 28 }}>
                    {stats.map((s, i) => <StatCard key={i} {...s} value={s.numericValue} delay={0.05 + i * 0.08} onClick={() => handleStatClick(s.analyticsType)} />)}
                </div>

                {/* MAIN GRID */}
                <div style={{ display: 'grid', gridTemplateColumns: '270px 1fr 255px', gap: 20, marginBottom: 28 }}>

                    {/* Quick Actions */}
                    <div style={{ background: '#fff', borderRadius: 22, border: '1px solid #f1f5f9', overflow: 'hidden', boxShadow: '0 2px 14px rgba(0,0,0,0.04)', animation: 'cardEnter 0.55s ease 0.2s both', opacity: 0 }}>
                        <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid #f8fafc', display: 'flex', alignItems: 'center', gap: 9 }}>
                            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg,#a855f7,#6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Zap size={15} color="#fff" /></div>
                            <div><h2 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>Quick Actions</h2><p style={{ fontSize: '0.67rem', color: '#94a3b8', marginTop: 1 }}>Common donor tasks</p></div>
                        </div>
                        <div style={{ padding: '14px 14px 18px', display: 'flex', flexDirection: 'column', gap: 9 }}>
                            <QuickBtn icon={Plus}     label="Add Surplus Food"      gradient="linear-gradient(135deg,#22c55e,#15803d)" shadowColor="#22c55e" onClick={handleAddSurplusFood}      delay={0.25} />
                            <QuickBtn icon={Calendar} label="List Event Food"        gradient="linear-gradient(135deg,#22c55e,#15803d)" shadowColor="#22c55e" onClick={handleAddEvent}            delay={0.32} />
                            <QuickBtn icon={Recycle}  label="Schedule Waste Pickup"  gradient="linear-gradient(135deg,#f97316,#c2410c)" shadowColor="#f97316" onClick={handleRequestWastePickup}  delay={0.39} />
                            <QuickBtn icon={BarChart3} label="View Analytics"        gradient="linear-gradient(135deg,#3b82f6,#1d4ed8)" shadowColor="#3b82f6" onClick={handleAnalytics}           delay={0.46} />
                            <div style={{ marginTop: 4, background: 'linear-gradient(135deg,#f0fdf4,#eff6ff)', border: '1px solid #bbf7d0', borderRadius: 15, padding: '13px 14px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}><Calendar size={12} color="#16a34a" /><span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#14532d' }}>Event Calendar</span></div>
                                <p style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: 8 }}>Smart event-based redistribution</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#dcfce7', borderRadius: 8, padding: '5px 10px' }}><CheckCircle size={10} color="#16a34a" /><span style={{ fontSize: '0.66rem', color: '#166534', fontWeight: 600 }}>Campus calendar connected</span></div>
                            </div>
                        </div>
                    </div>

                    {/* LISTINGS PANEL */}
                    <div style={{ background: '#fff', borderRadius: 22, border: '1px solid #f1f5f9', overflow: 'hidden', boxShadow: '0 2px 14px rgba(0,0,0,0.04)', animation: 'cardEnter 0.55s ease 0.28s both', opacity: 0 }}>
                        <div style={{ padding: '18px 22px', borderBottom: '1px solid #f8fafc', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Package size={15} color="#3b82f6" />
                            <h2 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', flex: 1 }}>Your Current Listings</h2>
                            {myListings.length > 0 && <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#3b82f6', background: '#eff6ff', borderRadius: 99, padding: '2px 8px' }}>{myListings.length}</span>}
                            <button onClick={() => fetchListings()} title="Refresh" style={{ width: 28, height: 28, borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                <RefreshCw size={12} color="#64748b" style={{ animation: listingsLoading ? 'spin 0.8s linear infinite' : 'none' }} />
                            </button>
                        </div>
                        <div style={{ padding: '20px 22px', minHeight: 300, maxHeight: 600, overflowY: 'auto' }}>
                            {listingsLoading ? (
                                <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                                    <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid #e2e8f0', borderTopColor: '#3b82f6', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
                                    <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Loading your listings…</p>
                                </div>
                            ) : listingsError ? (
                                <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                                    <p style={{ fontSize: '0.82rem', color: '#ef4444', marginBottom: 12 }}>{listingsError}</p>
                                    <button onClick={() => fetchListings()} style={{ padding: '8px 18px', borderRadius: 10, background: '#3b82f6', border: 'none', color: '#fff', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit' }}>Retry</button>
                                </div>
                            ) : myListings.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                                    <div style={{ width: 54, height: 54, borderRadius: 16, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}><Package size={24} color="#94a3b8" /></div>
                                    <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: 14 }}>No active listings yet</p>
                                    <button onClick={handleAddSurplusFood} style={{ padding: '10px 20px', borderRadius: 11, background: 'linear-gradient(135deg,#22c55e,#15803d)', border: 'none', color: '#fff', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(34,197,94,0.35)' }}>
                                        + Add First Donation
                                    </button>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {/* ── Section helpers ── */}
                                    {(() => {
                                        const pending   = myListings.filter((l:any) => ['requested','confirmed','reserved','picked_up','in_transit'].includes(l.status));
                                        const active    = myListings.filter((l:any) => l.status === 'available');
                                        const delivered = myListings.filter((l:any) => l.status === 'completed' || l.status === 'claimed');
                                        const expired   = myListings.filter((l:any) => {
                                            if (l.status === 'expired') return true;
                                            if (['available'].includes(l.status) && l.bestBefore && l.createdAt) {
                                                try { return Date.now() > new Date(l.createdAt).getTime() + parseFloat(l.bestBefore) * 3_600_000; } catch { return false; }
                                            }
                                            return false;
                                        });
                                        const SectionHeader = ({ emoji, label, count, color, bg }: any) => (
                                            <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 12px', borderRadius:10, background:bg, marginBottom:8, marginTop:4 }}>
                                                <span style={{ fontSize:'0.9rem' }}>{emoji}</span>
                                                <span style={{ fontSize:'0.75rem', fontWeight:800, color, textTransform:'uppercase', letterSpacing:'0.06em' }}>{label}</span>
                                                <span style={{ marginLeft:'auto', fontSize:'0.68rem', fontWeight:700, color, background:'rgba(255,255,255,0.6)', borderRadius:99, padding:'2px 8px' }}>{count}</span>
                                            </div>
                                        );
                                        return (
                                            <>
                                                {/* Pending requests */}
                                                {pending.length > 0 && (
                                                    <div style={{ marginBottom:16 }}>
                                                        <SectionHeader emoji="📤" label="Pending Orders" count={pending.length} color="#1d4ed8" bg="#eff6ff"/>
                                                        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                                                            {pending.map((item:any) => (
                                                                <FoodListingVisibility key={item._id} listing={item} onStatusChange={() => setTimeout(fetchListings, 500)}/>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                {/* Active listings */}
                                                {active.length > 0 && (
                                                    <div style={{ marginBottom:16 }}>
                                                        <SectionHeader emoji="🍱" label="Active Listings" count={active.length} color="#15803d" bg="#f0fdf4"/>
                                                        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                                                            {active.map((item:any) => (
                                                                <FoodListingVisibility key={item._id} listing={item} onStatusChange={() => setTimeout(fetchListings, 500)}/>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                {/* Delivered */}
                                                {delivered.length > 0 && (
                                                    <div style={{ marginBottom:16 }}>
                                                        <SectionHeader emoji="✅" label="Delivered" count={delivered.length} color="#15803d" bg="#f0fdf4"/>
                                                        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                                                            {delivered.map((item:any) => (
                                                                <FoodListingVisibility key={item._id} listing={item} onStatusChange={() => setTimeout(fetchListings, 500)}/>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                {/* Expired */}
                                                {expired.length > 0 && (
                                                    <div>
                                                        <SectionHeader emoji="⏰" label="Expired" count={expired.length} color="#dc2626" bg="#fef2f2"/>
                                                        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                                                            {expired.map((item:any) => (
                                                                <FoodListingVisibility key={item._id} listing={item} onStatusChange={() => setTimeout(fetchListings, 500)}/>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                {/* All empty */}
                                                {pending.length === 0 && active.length === 0 && delivered.length === 0 && expired.length === 0 && (
                                                    <div style={{ textAlign:'center', padding:'32px 16px' }}>
                                                        <p style={{ fontSize:'0.82rem', color:'#94a3b8' }}>No listings yet</p>
                                                    </div>
                                                )}
                                            </>
                                        );
                                    })()}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RECENT ACTIVITY — real data */}
                    <div style={{ background: '#fff', borderRadius: 22, border: '1px solid #f1f5f9', overflow: 'hidden', boxShadow: '0 2px 14px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', animation: 'cardEnter 0.55s ease 0.36s both', opacity: 0 }}>
                        <div style={{ padding: '18px 18px 14px', borderBottom: '1px solid #f8fafc', display: 'flex', alignItems: 'center', gap: 9 }}>
                            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg,#f97316,#c2410c)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Activity size={15} color="#fff" /></div>
                            <div style={{ flex: 1 }}><h2 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>Recent Activity</h2><p style={{ fontSize: '0.67rem', color: '#94a3b8', marginTop: 1 }}>From your listings</p></div>
                            <button onClick={fetchListings} style={{ width: 24, height: 24, borderRadius: 7, background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                <RefreshCw size={10} color="#94a3b8" style={{ animation: listingsLoading ? 'spin 0.8s linear infinite' : 'none' }}/>
                            </button>
                        </div>
                        <div style={{ padding: '8px', flex: 1 }}>
                            {activityFeed.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '32px 16px' }}>
                                    <p style={{ fontSize: '1.5rem', marginBottom: 8 }}>📭</p>
                                    <p style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 500 }}>No recent activity</p>
                                    <p style={{ fontSize: '0.72rem', color: '#cbd5e1', marginTop: 4 }}>Add a listing to get started</p>
                                </div>
                            ) : activityFeed.map((a, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 10px', borderRadius: 12, transition: 'background 0.2s', cursor: 'default', animation: `slideUp 0.5s ease ${0.42 + i * 0.09}s both`, opacity: 0 }}
                                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f8fafc'; }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                                    <div style={{ width: 32, height: 32, borderRadius: 9, background: a.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><a.icon size={13} color={a.iconColor} /></div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0f172a', marginBottom: 2 }}>{a.message}</p>
                                        <p style={{ fontSize: '0.7rem', color: '#64748b', lineHeight: 1.5, marginBottom: 2 }}>{a.details}</p>
                                        <p style={{ fontSize: '0.65rem', color: '#94a3b8' }}>{a.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div style={{ margin: '0 12px 14px', background: 'linear-gradient(135deg,#f0fdf4,#eff6ff)', border: '1px solid #bbf7d0', borderRadius: 14, padding: '13px 14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 10 }}><Star size={12} color="#f97316" fill="#f97316" /><span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#0f172a' }}>Your Impact Score</span></div>
                            <div style={{ display: 'flex', gap: 7 }}>
                                {[['🍱', String(myListings.length)], ['👥', String(totalServings)], ['🌿', completedListings >= 10 ? 'A+' : completedListings >= 5 ? 'A' : completedListings >= 1 ? 'B+' : 'B']].map(([e, v]) => (
                                    <div key={v} style={{ flex: 1, textAlign: 'center', background: '#fff', borderRadius: 10, padding: '8px 4px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', transition: 'transform 0.2s', cursor: 'default' }}
                                        onMouseEnter={el => { (el.currentTarget as HTMLElement).style.transform = 'scale(1.06)'; }}
                                        onMouseLeave={el => { (el.currentTarget as HTMLElement).style.transform = 'none'; }}>
                                        <div style={{ fontSize: '0.95rem' }}>{e}</div>
                                        <div style={{ fontSize: '0.71rem', fontWeight: 700, color: '#0f172a', marginTop: 2 }}>{v}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating live badge */}
            <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 40, animation: 'popIn 0.4s ease 1s both', opacity: 0 }}>
                <div style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(16px)', borderRadius: 99, padding: '8px 16px 8px 12px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', border: '1px solid rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ position: 'relative', width: 9, height: 9 }}><div style={{ position: 'absolute', inset: 0, background: '#22c55e', borderRadius: '50%', animation: 'pulse 1.5s ease-in-out infinite' }} /></div>
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#334155' }}>Live • {currentTime.toLocaleTimeString()}</span>
                </div>
            </div>

            <DetailedAnalyticsModal isOpen={isAnalyticsModalOpen} onClose={() => { setIsAnalyticsModalOpen(false); setSelectedAnalyticsType(null); }} analyticsType={selectedAnalyticsType} />
        </div>
    );
}