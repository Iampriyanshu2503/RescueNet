import React, { useState, useEffect, useRef } from 'react';
import {
    X, TrendingUp, TrendingDown, Calendar, Users, Package,
    Truck, BarChart3, PieChart, Target, Award, Heart, Zap
} from 'lucide-react';

interface BreakdownItem  { category: string; count: number; percentage: number; }
interface ChartDataPoint { label: string; value: number; trend?: number; }

interface AnalyticsData {
    title: string;
    icon: React.ReactNode;
    gradient: string;
    shadowColor: string;
    mainMetric: string;
    mainLabel: string;
    trend: string;
    trendUp: boolean;
    chartData: ChartDataPoint[];
    insights: string[];
    breakdown: BreakdownItem[];
}

interface DetailedAnalyticsModalProps {
    isOpen: boolean;
    onClose: () => void;
    analyticsType: 'donations' | 'people-served' | 'active-listings' | 'pickup-requests' | null;
}

/* ─── Animated bar ─── */
function AnimatedBar({ pct, gradient, delay = 0 }: { pct: number; gradient: string; delay?: number }) {
    const [width, setWidth] = useState(0);
    useEffect(() => {
        const id = setTimeout(() => setWidth(pct), 80 + delay);
        return () => clearTimeout(id);
    }, [pct, delay]);
    return (
        <div style={{ flex: 1, height: 10, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${width}%`, background: gradient, borderRadius: 99, transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)' }} />
        </div>
    );
}

/* ─── Animated counter ─── */
function PopCounter({ to, suffix = '' }: { to: number; suffix?: string }) {
    const [val, setVal] = useState(0);
    useEffect(() => {
        const t0 = Date.now();
        const dur = 900;
        const tick = () => {
            const p = Math.min((Date.now() - t0) / dur, 1);
            setVal(Math.round((1 - Math.pow(1 - p, 3)) * to));
            if (p < 1) requestAnimationFrame(tick);
        };
        const id = setTimeout(() => requestAnimationFrame(tick), 150);
        return () => clearTimeout(id);
    }, [to]);
    return <>{val >= 1000 ? val.toLocaleString() : val}{suffix}</>;
}

/* ─── Data definitions ─── */
function getAnalyticsData(type: string): AnalyticsData | null {
    const configs: Record<string, AnalyticsData> = {
        donations: {
            title: 'Total Donations',
            icon: <Package size={20} color="#fff" />,
            gradient: 'linear-gradient(135deg,#3b82f6,#1d4ed8)',
            shadowColor: '#3b82f6',
            mainMetric: '156', mainLabel: 'Total Donations', trend: '+12%', trendUp: true,
            chartData: [
                { label: 'Week 1', value: 38, trend: 15 },
                { label: 'Week 2', value: 42, trend: 10 },
                { label: 'Week 3', value: 35, trend: -5 },
                { label: 'Week 4', value: 41, trend: 8 },
            ],
            insights: [
                'Peak day: Tuesday (28% of weekly donations)',
                'Most popular type: Fresh produce (45%)',
                'Average donation size: 15–20 servings',
                'Best location: Downtown Campus',
            ],
            breakdown: [
                { category: 'Fresh Produce',   count: 70, percentage: 45 },
                { category: 'Prepared Meals',  count: 46, percentage: 29 },
                { category: 'Baked Goods',     count: 31, percentage: 20 },
                { category: 'Beverages',       count:  9, percentage:  6 },
            ],
        },
        'people-served': {
            title: 'People Served',
            icon: <Users size={20} color="#fff" />,
            gradient: 'linear-gradient(135deg,#22c55e,#15803d)',
            shadowColor: '#22c55e',
            mainMetric: '2,340', mainLabel: 'People Served', trend: '+8%', trendUp: true,
            chartData: [
                { label: 'Week 1', value: 580, trend: 12 },
                { label: 'Week 2', value: 620, trend:  8 },
                { label: 'Week 3', value: 540, trend: -3 },
                { label: 'Week 4', value: 600, trend: 15 },
            ],
            insights: [
                'Average meals per person: 2.3',
                'Return rate: 68% (served multiple times)',
                'Peak serving time: 6–8 PM',
                'Most active pickup: Student Center',
            ],
            breakdown: [
                { category: 'Students', count: 1404, percentage: 60 },
                { category: 'Families', count:  702, percentage: 30 },
                { category: 'Seniors',  count:  234, percentage: 10 },
            ],
        },
        'active-listings': {
            title: 'Active Listings',
            icon: <Calendar size={20} color="#fff" />,
            gradient: 'linear-gradient(135deg,#f97316,#c2410c)',
            shadowColor: '#f97316',
            mainMetric: '8', mainLabel: 'Active Listings', trend: '+25%', trendUp: true,
            chartData: [
                { label: 'Mon', value: 6, trend:   0 },
                { label: 'Tue', value: 8, trend:  33 },
                { label: 'Wed', value: 7, trend: -12 },
                { label: 'Thu', value: 9, trend:  28 },
            ],
            insights: [
                'Average listing duration: 4.2 hours',
                'Average views per listing: 15.3',
                'Success (pickup) rate: 95%',
                '2 listings expiring in next 4 hours',
            ],
            breakdown: [
                { category: 'Fresh Food',      count: 5, percentage: 62 },
                { category: 'Prepared Meals',  count: 2, percentage: 25 },
                { category: 'Event Surplus',   count: 1, percentage: 13 },
            ],
        },
        'pickup-requests': {
            title: 'Pickup Requests',
            icon: <Truck size={20} color="#fff" />,
            gradient: 'linear-gradient(135deg,#a855f7,#6d28d9)',
            shadowColor: '#a855f7',
            mainMetric: '23', mainLabel: 'Pickup Requests', trend: '+15%', trendUp: true,
            chartData: [
                { label: 'Week 1', value: 5, trend:  25 },
                { label: 'Week 2', value: 7, trend:  40 },
                { label: 'Week 3', value: 6, trend: -14 },
                { label: 'Week 4', value: 5, trend: -16 },
            ],
            insights: [
                'Average response time: 1.2 hours',
                'Completion rate: 96%',
                'Peak request day: Friday',
                '5 new requests today',
            ],
            breakdown: [
                { category: 'Same Day',   count: 15, percentage: 65 },
                { category: 'Next Day',   count:  6, percentage: 26 },
                { category: 'Scheduled', count:  2, percentage:  9 },
            ],
        },
    };
    return configs[type] ?? null;
}

/* ─── MAIN MODAL ─── */
const DetailedAnalyticsModal: React.FC<DetailedAnalyticsModalProps> = ({ isOpen, onClose, analyticsType }) => {
    const [visible, setVisible] = useState(false);
    const overlayRef = useRef<HTMLDivElement>(null);

    // Animate in
    useEffect(() => {
        if (isOpen) setTimeout(() => setVisible(true), 10);
        else setVisible(false);
    }, [isOpen]);

    // Close on overlay click
    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === overlayRef.current) onClose();
    };

    // Close on Escape
    useEffect(() => {
        if (!isOpen) return;
        const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', fn);
        return () => window.removeEventListener('keydown', fn);
    }, [isOpen, onClose]);

    if (!isOpen || !analyticsType) return null;
    const data = getAnalyticsData(analyticsType);
    if (!data) return null;

    const maxValue = Math.max(...data.chartData.map(d => d.value));
    const BREAKDOWN_COLORS = [data.gradient, 'linear-gradient(135deg,#6366f1,#4338ca)', 'linear-gradient(135deg,#f97316,#c2410c)', 'linear-gradient(135deg,#94a3b8,#64748b)'];

    return (
        <div
            ref={overlayRef}
            onClick={handleOverlayClick}
            style={{
                position: 'fixed', inset: 0, zIndex: 60,
                background: `rgba(15,23,42,${visible ? 0.55 : 0})`,
                backdropFilter: visible ? 'blur(6px)' : 'blur(0)',
                transition: 'background 0.3s ease, backdrop-filter 0.3s ease',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '16px',
                fontFamily: "'DM Sans',system-ui,sans-serif",
            }}
        >
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@700&display=swap');
                @keyframes modalIn  { from{opacity:0;transform:translateY(24px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
                @keyframes fadeRow  { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
                @keyframes dotPop   { from{transform:scale(0)} to{transform:scale(1)} }
                * { box-sizing:border-box; }
            `}</style>

            <div style={{
                width: '100%', maxWidth: 820,
                maxHeight: 'min(92vh, 820px)',
                display: 'flex', flexDirection: 'column',
                background: '#fff', borderRadius: 24,
                boxShadow: `0 32px 80px rgba(15,23,42,0.25), 0 8px 24px ${data.shadowColor}20`,
                overflow: 'hidden',
                opacity: visible ? 1 : 0,
                transform: visible ? 'none' : 'translateY(20px) scale(0.97)',
                transition: 'opacity 0.35s ease, transform 0.35s cubic-bezier(0.34,1.56,0.64,1)',
            }}>

                {/* ── Gradient header ── */}
                <div style={{ background: data.gradient, padding: '22px 28px', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
                    {/* Decorative orb */}
                    <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', pointerEvents: 'none' }} />
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 42, height: 42, borderRadius: 13, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {data.icon}
                            </div>
                            <div>
                                <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', fontFamily: "'Playfair Display',serif", letterSpacing: '-0.02em' }}>{data.title}</h2>
                                <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.65)', marginTop: 2 }}>Detailed insights & trends</p>
                            </div>
                        </div>
                        <button onClick={onClose}
                            style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.28)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.15)'; }}
                        >
                            <X size={18} color="#fff" />
                        </button>
                    </div>
                </div>

                {/* ── Scrollable body ── */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>

                    {/* Row 1: Trend chart + Hero metric */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: 16 }}>

                        {/* Chart */}
                        <div style={{ background: '#f8fafc', borderRadius: 18, padding: '20px 22px', border: '1px solid #f1f5f9', animation: 'modalIn 0.4s ease 0.05s both' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                                <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>Trend Analysis</h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 99, background: data.trendUp ? '#dcfce7' : '#fef2f2', border: `1px solid ${data.trendUp ? '#bbf7d0' : '#fecaca'}` }}>
                                    {data.trendUp ? <TrendingUp size={12} color="#16a34a" /> : <TrendingDown size={12} color="#dc2626" />}
                                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: data.trendUp ? '#16a34a' : '#dc2626' }}>{data.trend} vs last month</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {data.chartData.map((pt, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, animation: `fadeRow 0.4s ease ${0.1 + i * 0.07}s both` }}>
                                        <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#64748b', width: 46, flexShrink: 0 }}>{pt.label}</span>
                                        <AnimatedBar pct={(pt.value / maxValue) * 100} gradient={data.gradient} delay={i * 60} />
                                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a', width: 42, textAlign: 'right', flexShrink: 0 }}>
                                            {pt.value.toLocaleString()}
                                        </span>
                                        {pt.trend !== undefined && (
                                            <span style={{ fontSize: '0.68rem', fontWeight: 600, width: 38, textAlign: 'right', flexShrink: 0, color: pt.trend >= 0 ? '#16a34a' : '#dc2626' }}>
                                                {pt.trend > 0 ? '+' : ''}{pt.trend}%
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Hero metric */}
                        <div style={{ background: '#f8fafc', borderRadius: 18, padding: '20px 16px', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', animation: 'modalIn 0.4s ease 0.1s both' }}>
                            <div style={{ width: 56, height: 56, borderRadius: 18, background: data.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14, boxShadow: `0 6px 20px ${data.shadowColor}35` }}>
                                <Target size={26} color="#fff" />
                            </div>
                            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', fontFamily: "'Playfair Display',serif", lineHeight: 1, marginBottom: 6 }}>
                                {data.mainMetric}
                            </div>
                            <div style={{ fontSize: '0.76rem', color: '#64748b', marginBottom: 10 }}>{data.mainLabel}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 99, background: data.trendUp ? '#dcfce7' : '#fef2f2' }}>
                                {data.trendUp ? <TrendingUp size={11} color="#16a34a" /> : <TrendingDown size={11} color="#dc2626" />}
                                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: data.trendUp ? '#16a34a' : '#dc2626' }}>{data.trend}</span>
                            </div>
                        </div>
                    </div>

                    {/* Row 2: Breakdown + Insights */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

                        {/* Breakdown */}
                        <div style={{ background: '#f8fafc', borderRadius: 18, padding: '20px 22px', border: '1px solid #f1f5f9', animation: 'modalIn 0.4s ease 0.18s both' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 16 }}>
                                <div style={{ width: 28, height: 28, borderRadius: 8, background: data.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><PieChart size={13} color="#fff" /></div>
                                <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>Breakdown</h3>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {data.breakdown.map((item, i) => (
                                    <div key={i} style={{ animation: `fadeRow 0.4s ease ${0.22 + i * 0.07}s both` }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                                                <div style={{ width: 8, height: 8, borderRadius: 2, background: BREAKDOWN_COLORS[i] || data.gradient, animation: `dotPop 0.3s ease ${0.22 + i * 0.07}s both`, transform: 'scale(0)' }} />
                                                <span style={{ fontSize: '0.78rem', fontWeight: 500, color: '#334155' }}>{item.category}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a' }}>{item.count.toLocaleString()}</span>
                                                <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>({item.percentage}%)</span>
                                            </div>
                                        </div>
                                        <AnimatedBar pct={item.percentage} gradient={BREAKDOWN_COLORS[i] || data.gradient} delay={i * 80} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Insights */}
                        <div style={{ background: '#f8fafc', borderRadius: 18, padding: '20px 22px', border: '1px solid #f1f5f9', animation: 'modalIn 0.4s ease 0.24s both' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 16 }}>
                                <div style={{ width: 28, height: 28, borderRadius: 8, background: data.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><BarChart3 size={13} color="#fff" /></div>
                                <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>Key Insights</h3>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {data.insights.map((insight, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, animation: `fadeRow 0.4s ease ${0.28 + i * 0.07}s both` }}>
                                        <div style={{ width: 20, height: 20, borderRadius: 6, background: data.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                                            <Zap size={10} color="#fff" />
                                        </div>
                                        <p style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>{insight}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Row 3: Impact summary */}
                    <div style={{ background: 'linear-gradient(135deg,#f0fdf4,#eff6ff)', borderRadius: 18, padding: '20px 24px', border: '1px solid #bbf7d0', animation: 'modalIn 0.4s ease 0.32s both' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 16 }}>
                            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#22c55e,#3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Heart size={13} color="#fff" /></div>
                            <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>Impact Summary</h3>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
                            {[
                                { value: 98, suffix: '%', label: 'Success Rate',    color: '#1d4ed8' },
                                { value: 48, suffix: '★', label: 'Avg Rating (÷10)', color: '#16a34a' },
                                { value: 21, suffix: 'h', label: 'Avg Response (÷10)', color: '#7c3aed' },
                            ].map(({ value, suffix, label, color }, i) => (
                                <div key={label} style={{ textAlign: 'center', background: '#fff', borderRadius: 14, padding: '14px 10px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', animation: `modalIn 0.4s ease ${0.36 + i * 0.07}s both` }}>
                                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color, fontFamily: "'Playfair Display',serif", lineHeight: 1, marginBottom: 4 }}>
                                        <PopCounter to={value} suffix={suffix} />
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetailedAnalyticsModal;