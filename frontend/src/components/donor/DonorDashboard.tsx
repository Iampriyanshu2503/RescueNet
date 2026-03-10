import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { foodDonationService } from '../../services/foodDonationService';
import type { FoodDonation } from '../../types/foodListing';
import {
    Users, TrendingUp, Star, Recycle, Plus, Truck,
    Bell, Settings, Package, Calendar, CheckCircle, Info,
    BarChart3, Sparkles, LogOut, ChevronRight,
    Zap, Leaf, ArrowUpRight, Activity
} from 'lucide-react';
import DetailedAnalyticsModal from './DetailedAnalyticsModal';
import FoodListingVisibility from '../common/FoodListingVisibility';

/* ════════════════════════════════════════════════
   ANIMATED COUNTER — eased count-up on viewport entry
════════════════════════════════════════════════ */
function Counter({ to, suffix = '', prefix = '', duration = 1400 }: {
    to: number; suffix?: string; prefix?: string; duration?: number;
}) {
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

    const display = val >= 10000
        ? (val / 1000).toFixed(val % 1000 === 0 ? 0 : 1) + 'k'
        : val >= 1000
        ? val.toLocaleString()
        : val;
    return <span ref={ref}>{prefix}{display}{suffix}</span>;
}

/* ════════════════════════════════════════════════
   STAT CARD — magnetic tilt + gradient orb + shimmer
════════════════════════════════════════════════ */
interface StatCardProps {
    icon: React.ElementType;
    label: string;
    value: string | number;
    numericValue: number;
    suffix?: string;
    trend?: string;
    gradient: string;
    shadowColor: string;
    onClick?: () => void;
    delay?: number;
}
function StatCard({ icon: Icon, label, numericValue, suffix = '', trend, gradient, shadowColor, onClick, delay = 0 }: StatCardProps) {
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
    const onMouseLeave = useCallback(() => { setHov(false); setTilt({ x: 0, y: 0 }); }, []);

    return (
        <div
            ref={cardRef}
            onClick={onClick}
            onMouseEnter={() => setHov(true)}
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseLeave}
            style={{
                position: 'relative', overflow: 'hidden', borderRadius: 22,
                padding: '22px 24px', cursor: 'pointer',
                background: '#fff',
                border: '1px solid rgba(0,0,0,0.06)',
                transition: 'box-shadow 0.35s ease, transform 0.12s ease',
                transform: hov
                    ? `perspective(600px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(-6px) scale(1.02)`
                    : 'perspective(600px) rotateX(0) rotateY(0) translateY(0) scale(1)',
                boxShadow: hov
                    ? `0 24px 56px ${shadowColor}30, 0 6px 20px rgba(0,0,0,0.08)`
                    : '0 2px 14px rgba(0,0,0,0.05)',
                animation: `cardEnter 0.6s cubic-bezier(0.34,1.56,0.64,1) ${delay}s both`,
            }}
        >
            {/* Gradient top bar */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: gradient, borderRadius: '22px 22px 0 0' }} />

            {/* Ambient glow */}
            <div style={{
                position: 'absolute', top: -40, right: -40, width: 130, height: 130,
                borderRadius: '50%', background: gradient,
                opacity: hov ? 0.12 : 0.05, filter: 'blur(24px)',
                transition: 'opacity 0.4s ease',
                pointerEvents: 'none',
            }} />

            {/* Shimmer sweep on hover */}
            {hov && (
                <div style={{
                    position: 'absolute', inset: 0, borderRadius: 22,
                    background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.5) 50%, transparent 65%)',
                    backgroundSize: '200% auto',
                    animation: 'shimmer 0.7s linear',
                    pointerEvents: 'none',
                }} />
            )}

            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, position: 'relative', zIndex: 1 }}>
                <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9ca3af', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 10 }}>{label}</p>
                    <p style={{ fontSize: '2.1rem', fontWeight: 800, color: '#0f172a', lineHeight: 1, marginBottom: 9, fontFamily: "'Playfair Display', 'Georgia', serif" }}>
                        <Counter to={numericValue} suffix={suffix} />
                    </p>
                    {trend && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'linear-gradient(135deg,#22c55e,#16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <ArrowUpRight size={9} color="#fff" />
                            </div>
                            <span style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: 600 }}>{trend}</span>
                        </div>
                    )}
                </div>
                <div style={{
                    width: 50, height: 50, borderRadius: 15, background: gradient,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    boxShadow: `0 6px 20px ${shadowColor}40`,
                    transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                    transform: hov ? 'rotate(10deg) scale(1.12)' : 'none',
                }}>
                    <Icon size={22} color="#fff" />
                </div>
            </div>

            {hov && (
                <div style={{
                    position: 'absolute', bottom: 12, right: 14,
                    fontSize: '0.62rem', fontWeight: 700, color: '#6366f1',
                    background: '#eef2ff', borderRadius: 99, padding: '3px 9px',
                    animation: 'popIn 0.2s ease both',
                    zIndex: 2,
                }}>
                    View analytics ↗
                </div>
            )}
        </div>
    );
}

/* ════════════════════════════════════════════════
   QUICK ACTION BUTTON — sliding highlight + icon spin
════════════════════════════════════════════════ */
function QuickBtn({ icon: Icon, label, gradient, shadowColor, onClick, delay = 0 }: {
    icon: React.ElementType; label: string; gradient: string;
    shadowColor: string; onClick?: () => void; delay?: number;
}) {
    const [hov, setHov] = useState(false);
    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                padding: '13px 16px', borderRadius: 14, border: 'none', cursor: 'pointer',
                background: gradient, color: '#fff', fontWeight: 600, fontSize: '0.875rem',
                fontFamily: 'inherit', position: 'relative', overflow: 'hidden',
                transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
                transform: hov ? 'translateX(5px) scale(1.01)' : 'none',
                boxShadow: hov ? `0 10px 28px ${shadowColor}45` : `0 3px 10px ${shadowColor}25`,
                animation: `slideRight 0.45s cubic-bezier(0.34,1.56,0.64,1) ${delay}s both`,
            }}
        >
            {/* Sliding highlight */}
            <div style={{
                position: 'absolute', inset: 0, borderRadius: 14,
                background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%)',
                backgroundSize: '200% auto',
                animation: hov ? 'shimmer 0.55s linear' : 'none',
                pointerEvents: 'none',
            }} />
            <div style={{
                width: 30, height: 30, borderRadius: 9, background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                transition: 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1)',
                transform: hov ? 'rotate(15deg) scale(1.1)' : 'none',
            }}>
                <Icon size={15} />
            </div>
            <span style={{ flex: 1, textAlign: 'left' }}>{label}</span>
            <ChevronRight size={14} style={{ opacity: hov ? 1 : 0, transition: 'opacity 0.2s, transform 0.2s', transform: hov ? 'translateX(3px)' : 'none' }} />
        </button>
    );
}

/* ════════════════════════════════════════════════
   ACTIVITY ITEM — staggered slide + hover reveal
════════════════════════════════════════════════ */
function ActivityItem({ icon: Icon, iconColor, iconBg, message, details, time, delay = 0 }: {
    icon: React.ElementType; iconColor: string; iconBg: string;
    message: string; details: string; time: string; delay?: number;
}) {
    const [hov, setHov] = useState(false);
    return (
        <div
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                display: 'flex', alignItems: 'flex-start', gap: 11, padding: '11px 12px',
                borderRadius: 14, transition: 'background 0.2s',
                background: hov ? '#f8fafc' : 'transparent',
                animation: `slideUp 0.5s ease ${delay}s both`,
                opacity: 0,
            }}
        >
            <div style={{ width: 34, height: 34, borderRadius: 10, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'transform 0.2s', transform: hov ? 'scale(1.08)' : 'none' }}>
                <Icon size={14} color={iconColor} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a', marginBottom: 3 }}>{message}</p>
                <p style={{ fontSize: '0.72rem', color: '#64748b', lineHeight: 1.5, marginBottom: 3 }}>{details}</p>
                <p style={{ fontSize: '0.67rem', color: '#94a3b8', fontWeight: 500 }}>{time}</p>
            </div>
        </div>
    );
}

/* ════════════════════════════════════════════════
   IMPACT METRIC — bounce-in + count-up
════════════════════════════════════════════════ */
function ImpactMetric({ icon: Icon, gradient, shadowColor, value, suffix, label, sub, delay = 0 }: {
    icon: React.ElementType; gradient: string; shadowColor: string;
    value: number; suffix: string; label: string; sub: string; delay?: number;
}) {
    const [hov, setHov] = useState(false);
    return (
        <div
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                textAlign: 'center', padding: '22px 16px', borderRadius: 20,
                background: hov ? '#fff' : '#f8fafc',
                border: `1px solid ${hov ? '#e2e8f0' : '#f1f5f9'}`,
                transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                transform: hov ? 'translateY(-5px)' : 'none',
                boxShadow: hov ? `0 16px 40px ${shadowColor}18, 0 4px 12px rgba(0,0,0,0.05)` : 'none',
                cursor: 'default',
                animation: `cardEnter 0.6s cubic-bezier(0.34,1.56,0.64,1) ${delay}s both`,
            }}
        >
            <div style={{
                width: 52, height: 52, borderRadius: 16, background: gradient,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 14px',
                boxShadow: `0 6px 18px ${shadowColor}35`,
                transition: 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1)',
                transform: hov ? 'rotate(-8deg) scale(1.1)' : 'none',
            }}>
                <Icon size={23} color="#fff" />
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', fontFamily: "'Playfair Display','Georgia',serif", lineHeight: 1, marginBottom: 5 }}>
                <Counter to={value} suffix={suffix} />
            </div>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: 3 }}>{label}</div>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{sub}</div>
        </div>
    );
}

/* ════════════════════════════════════════════════
   MAIN DASHBOARD
════════════════════════════════════════════════ */
export default function DonorDashboard() {
    const [currentTime,           setCurrentTime]           = useState(new Date());
    const [isAnalyticsModalOpen,  setIsAnalyticsModalOpen]  = useState(false);
    const [selectedAnalyticsType, setSelectedAnalyticsType] = useState<'donations' | 'people-served' | 'active-listings' | 'pickup-requests' | null>(null);
    const [myListings,            setMyListings]            = useState<FoodDonation[]>([]);
    const [headerScrolled,        setHeaderScrolled]        = useState(false);
    const navigate = useNavigate();

    // Timers & scroll
    useEffect(() => {
        const t = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(t);
    }, []);
    useEffect(() => {
        const fn = () => setHeaderScrolled(window.scrollY > 12);
        window.addEventListener('scroll', fn);
        return () => window.removeEventListener('scroll', fn);
    }, []);

    // Data
    useEffect(() => {
        foodDonationService.getMyDonations().then(setMyListings).catch(console.error);
    }, []);
    // Handlers (all original logic preserved)
    const handleAddSurplusFood      = () => navigate('/add-surplus-food');
    const handleRequestWastePickup  = () => navigate('/waste-to-energy');
    const handleAddEvent            = () => navigate('/list-event-food');
    const handleTestEventReminder   = () => { console.log('Test event reminder'); alert('Event reminder test - Notification system working!'); };
    const handleAnalytics           = () => navigate('/donor-analytics');
    const handleLogout              = () => navigate('/login');
    const handleStatClick = (t: 'donations' | 'people-served' | 'active-listings' | 'pickup-requests') => {
        setSelectedAnalyticsType(t); setIsAnalyticsModalOpen(true);
    };
    const closeAnalyticsModal = () => { setIsAnalyticsModalOpen(false); setSelectedAnalyticsType(null); };

    const hr = currentTime.getHours();
    const greeting = hr < 12 ? 'morning' : hr < 17 ? 'afternoon' : 'evening';

    const stats = [
        { icon: Package,  label: 'Total Donations', numericValue: 156,  suffix: '',   trend: '+12% this month',   gradient: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', shadowColor: '#3b82f6', analyticsType: 'donations'       as const },
        { icon: Users,    label: 'People Served',   numericValue: 2340, suffix: '',   trend: '+8% vs last month', gradient: 'linear-gradient(135deg,#22c55e,#15803d)', shadowColor: '#22c55e', analyticsType: 'people-served'   as const },
        { icon: Calendar, label: 'Active Listings', numericValue: 8,    suffix: '',   trend: '2 expiring soon',   gradient: 'linear-gradient(135deg,#f97316,#c2410c)', shadowColor: '#f97316', analyticsType: 'active-listings' as const },
        { icon: Truck,    label: 'Pickup Requests', numericValue: 23,   suffix: '',   trend: '5 new today',       gradient: 'linear-gradient(135deg,#a855f7,#6d28d9)', shadowColor: '#a855f7', analyticsType: 'pickup-requests' as const },
    ];

    const recentActivity = [
        { icon: CheckCircle, iconColor: '#16a34a', iconBg: '#f0fdf4', message: 'Pizza pickup completed',   details: 'Picked up by Maria from Campus NGO — 18 slices distributed', time: '2 hours ago' },
        { icon: Info,        iconColor: '#2563eb', iconBg: '#eff6ff', message: 'New pickup request',       details: 'Student Union requesting sandwich pickup for tonight',          time: '5 minutes ago' },
        { icon: Calendar,    iconColor: '#ea580c', iconBg: '#fff7ed', message: 'Event reminder',           details: 'Campus Food Drive event tomorrow at 2 PM',                     time: '1 hour ago' },
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
                @keyframes floatB     { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-7px) rotate(3deg)} }
                @keyframes pulse      { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.5);opacity:0.55} }
                @keyframes ripple     { 0%{transform:scale(1);opacity:0.8} 100%{transform:scale(3.2);opacity:0} }
                @keyframes spin       { to{transform:rotate(360deg)} }
                @keyframes shimmer    { 0%{background-position:-200% center} 100%{background-position:200% center} }
                @keyframes popIn      { from{opacity:0;transform:scale(0.8)} to{opacity:1;transform:scale(1)} }
                @keyframes ticker     { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
                @keyframes gradPulse  { 0%,100%{opacity:0.6} 50%{opacity:1} }
                @keyframes morph      { 0%,100%{border-radius:60% 40% 30% 70%/60% 30% 70% 40%} 50%{border-radius:30% 60% 70% 40%/50% 60% 30% 60%} }
                @keyframes badge      { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }

                * { box-sizing:border-box; }
            `}</style>

            {/* ══ STICKY HEADER ══ */}
            <header style={{
                position: 'sticky', top: 0, zIndex: 50,
                background: headerScrolled ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.75)',
                backdropFilter: 'blur(20px)',
                borderBottom: `1px solid ${headerScrolled ? 'rgba(0,0,0,0.07)' : 'rgba(0,0,0,0.04)'}`,
                boxShadow: headerScrolled ? '0 2px 24px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.35s ease',
            }}>
                <div style={{ maxWidth: 1320, margin: '0 auto', padding: '0 28px', height: 66, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>

                    {/* Brand */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 13, background: 'linear-gradient(135deg,#22c55e,#15803d)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(34,197,94,0.38)', animation: 'float 3.5s ease-in-out infinite' }}>
                            <Leaf size={19} color="#fff" />
                        </div>
                        <div>
                            <h1 style={{ fontSize: '1.05rem', fontWeight: 800, background: 'linear-gradient(135deg,#1d4ed8,#7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.025em', lineHeight: 1, fontFamily: "'Playfair Display',serif" }}>
                                Donor Dashboard
                            </h1>
                            <p style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: 2 }}>Welcome back! Ready to make a difference?</p>
                        </div>
                    </div>

                    {/* Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button onClick={handleAnalytics}
                            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 11, background: '#f8fafc', border: '1px solid #e2e8f0', color: '#334155', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}
                            onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = '#eff6ff'; el.style.borderColor = '#bfdbfe'; el.style.color = '#1d4ed8'; }}
                            onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = '#f8fafc'; el.style.borderColor = '#e2e8f0'; el.style.color = '#334155'; }}
                        >
                            <BarChart3 size={14} /> Analytics
                        </button>

                        {/* Bell with badge */}
                        <button style={{ width: 38, height: 38, borderRadius: 11, background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative', transition: 'all 0.2s' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#fef9c3'; (e.currentTarget as HTMLElement).style.borderColor = '#fde047'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#f8fafc'; (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0'; }}
                        >
                            <Bell size={15} color="#64748b" />
                            <div style={{ position: 'absolute', top: 7, right: 7, width: 7, height: 7, borderRadius: '50%', background: '#ef4444', border: '1.5px solid #fff', animation: 'pulse 2s ease-in-out infinite' }} />
                        </button>

                        <button onClick={handleLogout}
                            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 11, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#fee2e2'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#fef2f2'; }}
                        >
                            <LogOut size={13} /> Logout
                        </button>
                    </div>
                </div>
            </header>

            <div style={{ maxWidth: 1320, margin: '0 auto', padding: '32px 28px 56px' }}>

                {/* ══ HERO BANNER ══ */}
                <div style={{
                    background: 'linear-gradient(135deg,#052e16 0%,#064e3b 45%,#065f46 80%,#0f766e 100%)',
                    borderRadius: 26, padding: '28px 36px', marginBottom: 30,
                    position: 'relative', overflow: 'hidden',
                    animation: 'heroIn 0.65s ease both',
                    boxShadow: '0 20px 60px rgba(6,78,59,0.25)',
                }}>
                    {/* Morphing orbs */}
                    <div style={{ position: 'absolute', top: -50, right: -50, width: 280, height: 280, background: 'radial-gradient(circle,rgba(34,197,94,0.2),transparent 70%)', animation: 'morph 9s ease-in-out infinite, float 8s ease-in-out infinite', filter: 'blur(2px)', pointerEvents: 'none' }} />
                    <div style={{ position: 'absolute', bottom: -30, left: '25%', width: 200, height: 200, background: 'radial-gradient(circle,rgba(16,185,129,0.15),transparent 70%)', animation: 'morph 7s ease-in-out infinite reverse', filter: 'blur(8px)', pointerEvents: 'none' }} />

                    <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
                        <div>
                            {/* Live clock pill */}
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 99, padding: '5px 14px 5px 10px', marginBottom: 14 }}>
                                <div style={{ position: 'relative', width: 9, height: 9, flexShrink: 0 }}>
                                    <div style={{ position: 'absolute', inset: 0, background: '#4ade80', borderRadius: '50%', animation: 'pulse 1.6s ease-in-out infinite' }} />
                                    <div style={{ position: 'absolute', inset: 0, background: '#4ade80', borderRadius: '50%', animation: 'ripple 2s ease-out infinite' }} />
                                </div>
                                <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600, letterSpacing: '0.07em' }}>LIVE • {currentTime.toLocaleTimeString()}</span>
                            </div>

                            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(1.5rem,3vw,2rem)', color: '#fff', letterSpacing: '-0.025em', marginBottom: 10, lineHeight: 1.2 }}>
                                Good {greeting}! 🌿
                            </h2>
                            <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.58)', maxWidth: 400, lineHeight: 1.7 }}>
                                Your donations have fed&nbsp;<strong style={{ color: '#86efac' }}>2,340 people</strong> this month. Keep going!
                            </p>
                        </div>

                        {/* Stat pills */}
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                            {[['🍱', '156', 'donations'], ['⚡', '23', 'pickups'], ['🌱', '1.2t', 'CO₂ saved']].map(([emoji, val, sub]) => (
                                <div key={sub} style={{ background: 'rgba(255,255,255,0.09)', border: '1px solid rgba(255,255,255,0.13)', borderRadius: 16, padding: '11px 18px', textAlign: 'center', backdropFilter: 'blur(10px)', transition: 'all 0.2s', cursor: 'default' }}
                                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.18)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.09)'; (e.currentTarget as HTMLElement).style.transform = 'none'; }}
                                >
                                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>{emoji} {val}</div>
                                    <div style={{ fontSize: '0.66rem', color: 'rgba(255,255,255,0.45)', marginTop: 3 }}>{sub}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Scrolling ticker */}
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 26, background: 'rgba(0,0,0,0.18)', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: 40, animation: 'ticker 20s linear infinite', whiteSpace: 'nowrap' }}>
                            {['🍱 12 donations today', '⚡ 3 pickups in progress', '💚 New donor just joined', '🥗 Salad batch available nearby', '🍞 Bakery surplus posted', '✅ 18 meals delivered today',
                              '🍱 12 donations today', '⚡ 3 pickups in progress', '💚 New donor just joined', '🥗 Salad batch available nearby', '🍞 Bakery surplus posted', '✅ 18 meals delivered today'].map((t, i) => (
                                <span key={i} style={{ fontSize: '0.66rem', color: 'rgba(255,255,255,0.45)', fontWeight: 600, paddingLeft: i === 0 ? 20 : 0 }}>{t}</span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ══ STAT CARDS ══ */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 18, marginBottom: 28 }}>
                    {stats.map((s, i) => (
                        <StatCard key={i} {...s} value={s.numericValue} delay={0.05 + i * 0.08} onClick={() => handleStatClick(s.analyticsType)} />
                    ))}
                </div>

                {/* ══ MAIN 3-COL GRID ══ */}
                <div style={{ display: 'grid', gridTemplateColumns: '270px 1fr 255px', gap: 20, marginBottom: 28 }}>

                    {/* ─ Quick Actions ─ */}
                    <div style={{ background: '#fff', borderRadius: 22, border: '1px solid #f1f5f9', overflow: 'hidden', boxShadow: '0 2px 14px rgba(0,0,0,0.04)', animation: 'cardEnter 0.55s ease 0.2s both', opacity: 0 }}>
                        <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid #f8fafc', display: 'flex', alignItems: 'center', gap: 9 }}>
                            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg,#a855f7,#6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Zap size={15} color="#fff" />
                            </div>
                            <div>
                                <h2 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>Quick Actions</h2>
                                <p style={{ fontSize: '0.67rem', color: '#94a3b8', marginTop: 1 }}>Common donor tasks</p>
                            </div>
                        </div>
                        <div style={{ padding: '14px 14px 18px', display: 'flex', flexDirection: 'column', gap: 9 }}>
                            <QuickBtn icon={Plus}     label="Add Surplus Food"     gradient="linear-gradient(135deg,#22c55e,#15803d)" shadowColor="#22c55e" onClick={handleAddSurplusFood}     delay={0.25} />
                            <QuickBtn icon={Truck}    label="Request Waste Pickup" gradient="linear-gradient(135deg,#3b82f6,#1d4ed8)" shadowColor="#3b82f6" onClick={handleRequestWastePickup} delay={0.32} />
                            <QuickBtn icon={Bell}     label="Add Event"            gradient="linear-gradient(135deg,#a855f7,#6d28d9)" shadowColor="#a855f7" onClick={handleAddEvent}           delay={0.39} />
                            <QuickBtn icon={Settings} label="Test Event Reminder"  gradient="linear-gradient(135deg,#f97316,#c2410c)" shadowColor="#f97316" onClick={handleTestEventReminder}  delay={0.46} />

                            {/* Calendar badge */}
                            <div style={{ marginTop: 4, background: 'linear-gradient(135deg,#f0fdf4,#eff6ff)', border: '1px solid #bbf7d0', borderRadius: 15, padding: '13px 14px', animation: 'slideRight 0.5s ease 0.52s both', opacity: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                                    <Calendar size={12} color="#16a34a" />
                                    <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#14532d' }}>Event Calendar</span>
                                </div>
                                <p style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: 8 }}>Smart event-based redistribution</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#dcfce7', borderRadius: 8, padding: '5px 10px' }}>
                                    <CheckCircle size={10} color="#16a34a" />
                                    <span style={{ fontSize: '0.66rem', color: '#166534', fontWeight: 600 }}>Campus calendar connected</span>
                                </div>
                                <p style={{ fontSize: '0.66rem', color: '#94a3b8', marginTop: 5 }}>24 upcoming events this month</p>
                            </div>
                        </div>
                    </div>

                    {/* ─ Listings ─ */}
                    <div style={{ background: '#fff', borderRadius: 22, border: '1px solid #f1f5f9', overflow: 'hidden', boxShadow: '0 2px 14px rgba(0,0,0,0.04)', animation: 'cardEnter 0.55s ease 0.28s both', opacity: 0 }}>
                        <div style={{ padding: '18px 22px', borderBottom: '1px solid #f8fafc', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Package size={15} color="#3b82f6" />
                            <h2 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>Your Current Listings</h2>
                            {myListings.length > 0 && (
                                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#3b82f6', background: '#eff6ff', borderRadius: 99, padding: '2px 8px' }}>
                                    {myListings.length}
                                </span>
                            )}
                        </div>
                        <div style={{ padding: '20px 22px', minHeight: 300 }}>
                            {myListings.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                                    <div style={{ width: 54, height: 54, borderRadius: 16, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                                        <Package size={24} color="#94a3b8" />
                                    </div>
                                    <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: 14 }}>No active listings yet</p>
                                    <button onClick={handleAddSurplusFood} style={{ padding: '10px 20px', borderRadius: 11, background: 'linear-gradient(135deg,#22c55e,#15803d)', border: 'none', color: '#fff', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(34,197,94,0.35)' }}>
                                        + Add First Donation
                                    </button>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {myListings.map(item => <FoodListingVisibility key={item._id} listing={item} />)}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ─ Recent Activity ─ */}
                    <div style={{ background: '#fff', borderRadius: 22, border: '1px solid #f1f5f9', overflow: 'hidden', boxShadow: '0 2px 14px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', animation: 'cardEnter 0.55s ease 0.36s both', opacity: 0 }}>
                        <div style={{ padding: '18px 18px 14px', borderBottom: '1px solid #f8fafc', display: 'flex', alignItems: 'center', gap: 9 }}>
                            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg,#f97316,#c2410c)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Activity size={15} color="#fff" />
                            </div>
                            <div>
                                <h2 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>Recent Activity</h2>
                                <p style={{ fontSize: '0.67rem', color: '#94a3b8', marginTop: 1 }}>Latest donation updates</p>
                            </div>
                        </div>

                        <div style={{ padding: '6px 8px', flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {recentActivity.map((a, i) => (
                                <ActivityItem key={i} {...a} delay={0.42 + i * 0.09} />
                            ))}
                        </div>

                        {/* Impact Score mini */}
                        <div style={{ margin: '0 12px 14px', background: 'linear-gradient(135deg,#f0fdf4,#eff6ff)', border: '1px solid #bbf7d0', borderRadius: 14, padding: '13px 14px', animation: 'slideUp 0.5s ease 0.7s both', opacity: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 10 }}>
                                <Star size={12} color="#f97316" fill="#f97316" />
                                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#0f172a' }}>Your Impact Score</span>
                            </div>
                            <div style={{ display: 'flex', gap: 7 }}>
                                {[['🍱', '156'], ['👥', '2.3k'], ['🌿', 'A+']].map(([e, v]) => (
                                    <div key={v} style={{ flex: 1, textAlign: 'center', background: '#fff', borderRadius: 10, padding: '8px 4px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', transition: 'transform 0.2s' }}
                                        onMouseEnter={el => { (el.currentTarget as HTMLElement).style.transform = 'scale(1.06)'; }}
                                        onMouseLeave={el => { (el.currentTarget as HTMLElement).style.transform = 'none'; }}
                                    >
                                        <div style={{ fontSize: '0.95rem' }}>{e}</div>
                                        <div style={{ fontSize: '0.71rem', fontWeight: 700, color: '#0f172a', marginTop: 2 }}>{v}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ══ IMPACT SECTION ══ */}
                <div style={{ background: '#fff', borderRadius: 24, border: '1px solid #f1f5f9', overflow: 'hidden', boxShadow: '0 2px 14px rgba(0,0,0,0.04)', animation: 'cardEnter 0.55s ease 0.44s both', opacity: 0 }}>
                    <div style={{ padding: '18px 28px', borderBottom: '1px solid #f8fafc', display: 'flex', alignItems: 'center', gap: 9 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg,#22c55e,#3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <TrendingUp size={15} color="#fff" />
                        </div>
                        <h2 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>Your Impact This Month</h2>
                    </div>

                    <div style={{ padding: '26px 30px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: 16 }}>
                            <ImpactMetric icon={Users}   gradient="linear-gradient(135deg,#22c55e,#15803d)" shadowColor="#22c55e" value={2340} suffix=""    label="People Fed"      sub="This month"         delay={0.50} />
                            <ImpactMetric icon={Recycle} gradient="linear-gradient(135deg,#3b82f6,#1d4ed8)" shadowColor="#3b82f6" value={1200} suffix="kg"  label="CO₂ Prevented"   sub="Emissions avoided"  delay={0.57} />
                            <ImpactMetric icon={Package} gradient="linear-gradient(135deg,#f97316,#c2410c)" shadowColor="#f97316" value={156}  suffix=""    label="Meals Donated"   sub="Total donations"    delay={0.64} />
                            <ImpactMetric icon={Star}    gradient="linear-gradient(135deg,#a855f7,#6d28d9)" shadowColor="#a855f7" value={98}   suffix="%"   label="Success Rate"    sub="Pickups completed"  delay={0.71} />
                        </div>

                        {/* Thank-you banner */}
                        <div style={{ marginTop: 22, background: 'linear-gradient(135deg,#052e16,#064e3b,#065f46)', borderRadius: 18, padding: '20px 26px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', boxShadow: '0 8px 28px rgba(6,78,59,0.2)' }}>
                            <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, animation: 'floatB 3s ease-in-out infinite' }}>
                                <Star size={22} color="#fbbf24" fill="#fbbf24" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', marginBottom: 4 }}>Thank you for making a positive impact! 🎉</p>
                                <p style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.55)' }}>Your contributions are helping build a more sustainable community. You're in the top 5% of donors this month.</p>
                            </div>
                            <button onClick={handleAnalytics}
                                style={{ padding: '10px 18px', borderRadius: 11, background: 'rgba(255,255,255,0.11)', border: '1px solid rgba(255,255,255,0.18)', color: '#fff', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s', whiteSpace: 'nowrap' }}
                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.22)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.11)'; (e.currentTarget as HTMLElement).style.transform = 'none'; }}
                            >
                                View full report <ChevronRight size={13} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ══ FLOATING LIVE BADGE ══ */}
            <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 40, animation: 'popIn 0.4s ease 1s both', opacity: 0 }}>
                <div style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(16px)', borderRadius: 99, padding: '8px 16px 8px 12px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', border: '1px solid rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ position: 'relative', width: 9, height: 9 }}>
                        <div style={{ position: 'absolute', inset: 0, background: '#22c55e', borderRadius: '50%', animation: 'pulse 1.5s ease-in-out infinite' }} />
                        <div style={{ position: 'absolute', inset: 0, background: '#22c55e', borderRadius: '50%', animation: 'ripple 2s ease-out infinite' }} />
                    </div>
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#334155' }}>
                        Live • {currentTime.toLocaleTimeString()}
                    </span>
                </div>
            </div>

            {/* ══ ANALYTICS MODAL ══ */}
            <DetailedAnalyticsModal
                isOpen={isAnalyticsModalOpen}
                onClose={closeAnalyticsModal}
                analyticsType={selectedAnalyticsType}
            />
        </div>
    );
}