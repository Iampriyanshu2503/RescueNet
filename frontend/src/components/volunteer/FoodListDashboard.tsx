import React, { useState, useEffect, useMemo } from 'react';
import {
  Truck, MapPin, Clock, Package, Users, Phone,
  MessageCircle, Navigation, CheckCircle, Calendar,
  Search, Bell, Settings, User, TrendingUp, Award,
  AlertCircle, RefreshCw, ChevronRight, Zap, Filter,
  Heart, Star, ArrowUpRight, Flame
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { foodDonationService } from '../../services/foodDonationService';
import { useAuth } from '../../hooks/useAuth';

/* ─── Types ─── */
interface FoodListing {
  _id: string;
  foodType: string;
  description?: string;
  quantity: number;
  unit?: string;
  status: 'available' | 'reserved' | 'completed' | 'expired';
  location?: { address?: string; coordinates?: number[] };
  bestBefore?: string;
  createdAt: string;
  user?: { name?: string; phone?: string; _id?: string };
  servings?: number;
  category?: string;
  distance?: string;
}

/* ─── Helpers ─── */
const urgencyFromListing = (l: FoodListing): 'high' | 'medium' | 'low' => {
  if (!l.bestBefore) return 'low';
  const h = parseFloat(l.bestBefore);
  if (h <= 2) return 'high';
  if (h <= 6) return 'medium';
  return 'low';
};

const FOOD_TYPES = ['All Types','Fresh Produce','Baked Goods','Non-perishable','Cooked Meals','Dairy','Beverages','Snacks'];

const CATEGORY_EMOJI: Record<string,string> = {
  'Fresh Produce':'🥦','Baked Goods':'🍞','Non-perishable':'🥫',
  'Cooked Meals':'🍱','Dairy':'🥛','Beverages':'🧃','Snacks':'🍿',
};

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff/60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m/60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h/24)}d ago`;
};

/* ═══════════════════════════════════════════════════════
   DELIVERY CARD
═══════════════════════════════════════════════════════ */
const DeliveryCard = ({ listing, onAccept, onComplete }: {
  listing: FoodListing;
  onAccept: (id: string) => void;
  onComplete: (id: string) => void;
}) => {
  const [hovered, setHovered] = useState(false);
  const urgency = urgencyFromListing(listing);
  const address = listing.location?.address || 'Location not specified';
  const hoursLeft = listing.bestBefore ? parseFloat(listing.bestBefore) : null;
  const emoji = CATEGORY_EMOJI[listing.category || listing.foodType] || '🍽️';

  const urgencyConfig = {
    high:   { bg: '#fff1f2', border: '#fda4af', text: '#be123c', dot: '#f43f5e', label: 'Urgent' },
    medium: { bg: '#fff7ed', border: '#fdba74', text: '#c2410c', dot: '#f97316', label: 'Soon' },
    low:    { bg: '#f0fdf4', border: '#86efac', text: '#15803d', dot: '#22c55e', label: 'Flexible' },
  }[urgency];

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? '#fafeff' : '#fff',
        border: `1.5px solid ${hovered ? '#bae6fd' : '#f1f5f9'}`,
        borderRadius: 20, padding: '0',
        transition: 'all 0.2s ease',
        boxShadow: hovered ? '0 12px 40px rgba(14,165,233,0.1)' : '0 1px 4px rgba(0,0,0,0.04)',
        overflow: 'hidden',
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      }}
    >
      {/* Urgency accent bar */}
      <div style={{ height: 3, background: urgencyConfig.dot, opacity: urgency === 'high' ? 1 : 0.4 }} />

      <div style={{ padding: '20px 24px' }}>
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
          {/* Emoji icon */}
          <div style={{
            width: 52, height: 52, borderRadius: 16, flexShrink: 0,
            background: 'linear-gradient(135deg,#f0f9ff,#e0f2fe)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.6rem', border: '1px solid #bae6fd',
          }}>
            {emoji}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{listing.foodType}</h3>
              {/* Urgency badge */}
              <span style={{
                fontSize: '0.68rem', fontWeight: 800, padding: '3px 9px', borderRadius: 20,
                background: urgencyConfig.bg, color: urgencyConfig.text, border: `1px solid ${urgencyConfig.border}`,
                display: 'flex', alignItems: 'center', gap: 4, letterSpacing: '0.02em',
              }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: urgencyConfig.dot, display: 'inline-block' }} />
                {urgencyConfig.label}
              </span>
              {listing.status === 'reserved' && (
                <span style={{ fontSize: '0.68rem', fontWeight: 800, padding: '3px 9px', borderRadius: 20, background: '#faf5ff', color: '#7c3aed', border: '1px solid #ddd6fe' }}>
                  In Progress
                </span>
              )}
              {listing.status === 'completed' && (
                <span style={{ fontSize: '0.68rem', fontWeight: 800, padding: '3px 9px', borderRadius: 20, background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' }}>
                  ✓ Completed
                </span>
              )}
            </div>
            {listing.description && (
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {listing.description}
              </p>
            )}
          </div>

          {/* Time posted */}
          <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 }}>
            {timeAgo(listing.createdAt)}
          </span>
        </div>

        {/* Info pills row */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          {[
            { icon: <MapPin size={11} />, text: address.length > 35 ? address.slice(0,35)+'…' : address },
            { icon: <Package size={11} />, text: `${listing.quantity}${listing.unit ? ' '+listing.unit : ' servings'}` },
            { icon: <Clock size={11} />, text: hoursLeft ? `${hoursLeft}h window` : 'Flexible timing' },
          ].map(({ icon, text }) => (
            <div key={text} style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '5px 12px', borderRadius: 10,
              background: '#f8fafc', border: '1px solid #f1f5f9',
              fontSize: '0.75rem', color: '#475569', fontWeight: 600,
            }}>
              <span style={{ color: '#94a3b8' }}>{icon}</span>
              {text}
            </div>
          ))}
        </div>

        {/* Urgent warning */}
        {urgency === 'high' && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'linear-gradient(135deg,#fff1f2,#ffe4e6)',
            border: '1px solid #fda4af', borderRadius: 12,
            padding: '10px 14px', marginBottom: 14,
          }}>
            <Flame size={14} color="#f43f5e" />
            <p style={{ fontSize: '0.78rem', color: '#be123c', margin: 0, fontWeight: 700 }}>
              Expires in under 2 hours — pick up immediately!
            </p>
          </div>
        )}

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14, borderTop: '1px solid #f8fafc', gap: 12, flexWrap: 'wrap' }}>
          {/* Contact */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {listing.user?.name && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={13} color="#fff" />
                </div>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155' }}>{listing.user.name}</span>
              </div>
            )}
            {listing.user?.phone && (
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>{listing.user.phone}</span>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Icon buttons */}
            {[
              { icon: <Navigation size={14} />, title: 'Navigate', onClick: () => { if (listing.location?.coordinates) window.open(`https://maps.google.com/?q=${listing.location.coordinates[1]},${listing.location.coordinates[0]}`, '_blank'); } },
              { icon: <MessageCircle size={14} />, title: 'Message', onClick: () => {} },
            ].map(({ icon, title, onClick }) => (
              <button key={title} onClick={onClick} title={title} style={{
                width: 34, height: 34, borderRadius: 10,
                background: '#f8fafc', border: '1px solid #e2e8f0',
                cursor: 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: '#64748b', transition: 'all 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = '#f0f9ff'; e.currentTarget.style.borderColor = '#bae6fd'; e.currentTarget.style.color = '#0284c7'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b'; }}
              >
                {icon}
              </button>
            ))}

            {/* Primary CTA */}
            {listing.status === 'available' && (
              <button onClick={() => onAccept(listing._id)} style={{
                padding: '8px 20px', borderRadius: 11, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg,#0ea5e9,#0284c7)',
                color: '#fff', fontWeight: 800, fontSize: '0.8rem',
                fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6,
                boxShadow: '0 4px 12px rgba(14,165,233,0.35)',
                transition: 'all 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(14,165,233,0.45)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(14,165,233,0.35)'; }}
              >
                <Truck size={13} /> Accept Delivery
              </button>
            )}
            {listing.status === 'reserved' && (
              <button onClick={() => onComplete(listing._id)} style={{
                padding: '8px 20px', borderRadius: 11, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg,#22c55e,#16a34a)',
                color: '#fff', fontWeight: 800, fontSize: '0.8rem',
                fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6,
                boxShadow: '0 4px 12px rgba(34,197,94,0.35)',
                transition: 'all 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
              >
                <CheckCircle size={13} /> Mark Complete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════
   STAT CARD
═══════════════════════════════════════════════════════ */
const StatCard = ({ icon, label, value, sub, gradient, iconBg }: any) => (
  <div style={{
    borderRadius: 22, padding: '24px 26px', background: gradient,
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    position: 'relative', overflow: 'hidden',
  }}>
    {/* Decorative circle */}
    <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
    <div style={{ position: 'absolute', top: 20, right: 20, width: 50, height: 50, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />

    <div style={{ position: 'relative' }}>
      <div style={{ width: 42, height: 42, borderRadius: 14, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
        {icon}
      </div>
      <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 6px' }}>{label}</p>
      <p style={{ fontSize: '2.2rem', fontWeight: 900, color: '#fff', margin: '0 0 8px', lineHeight: 1 }}>{value}</p>
      <p style={{ fontSize: '0.73rem', color: 'rgba(255,255,255,0.65)', margin: 0, fontWeight: 600 }}>{sub}</p>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════
   MAIN DASHBOARD
═══════════════════════════════════════════════════════ */
const VolunteerDashboard = () => {
  const [activeTab, setActiveTab]       = useState<'available' | 'reserved' | 'completed'>('available');
  const [searchQuery, setSearchQuery]   = useState('');
  const [selectedType, setSelectedType] = useState('All Types');
  const [isOnline, setIsOnline]         = useState(true);
  const [listings, setListings]         = useState<FoodListing[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [refreshing, setRefreshing]     = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchListings = async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true); else setLoading(true);
      setError(null);
      const data = await foodDonationService.getAll();
      setListings(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load food listings. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchListings(); }, []);

  const handleAccept = async (id: string) => {
    try { await foodDonationService.update(id, { status: 'reserved' } as any); } catch {}
    setListings(prev => prev.map(l => l._id === id ? { ...l, status: 'reserved' } : l));
  };

  const handleComplete = async (id: string) => {
    try { await foodDonationService.update(id, { status: 'completed' } as any); } catch {}
    setListings(prev => prev.map(l => l._id === id ? { ...l, status: 'completed' } : l));
  };

  const stats = useMemo(() => {
    const completed  = listings.filter(l => l.status === 'completed');
    const reserved   = listings.filter(l => l.status === 'reserved');
    const totalQty   = completed.reduce((s, l) => s + (l.quantity || 0), 0);
    const people     = completed.reduce((s, l) => s + (l.servings || l.quantity || 0), 0);
    return { totalDeliveries: completed.length, activeDeliveries: reserved.length, foodDelivered: totalQty, peopleHelped: people };
  }, [listings]);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return listings.filter(l => {
      const matchTab    = l.status === activeTab;
      const matchSearch = !q || l.foodType?.toLowerCase().includes(q) || l.description?.toLowerCase().includes(q) || l.location?.address?.toLowerCase().includes(q) || l.category?.toLowerCase().includes(q);
      const matchType   = selectedType === 'All Types' || l.category === selectedType || l.foodType === selectedType;
      return matchTab && matchSearch && matchType;
    });
  }, [listings, activeTab, searchQuery, selectedType]);

  const tabCounts = useMemo(() => ({
    available: listings.filter(l => l.status === 'available').length,
    reserved:  listings.filter(l => l.status === 'reserved').length,
    completed: listings.filter(l => l.status === 'completed').length,
  }), [listings]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        @keyframes spin   { to { transform: rotate(360deg) } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
        @keyframes pulse  { 0%,100%{ opacity:1 } 50%{ opacity:0.5 } }
        * { box-sizing: border-box; }
      `}</style>

      {/* ── Top nav ── */}
      <div style={{ background: '#fff', borderBottom: '1px solid #eef2f7', padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 0 #eef2f7' }}>
        <div>
          <span style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a' }}>Volunteer Dashboard</span>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, marginLeft: 12 }}>{greeting()}, {user?.name?.split(' ')[0] || 'Volunteer'} 👋</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Online toggle */}
          <button onClick={() => setIsOnline(o => !o)} style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '7px 14px', borderRadius: 20, cursor: 'pointer', border: 'none',
            background: isOnline ? '#dcfce7' : '#fee2e2',
            transition: 'all 0.2s',
          }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: isOnline ? '#22c55e' : '#ef4444', animation: isOnline ? 'pulse 2s infinite' : 'none' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: isOnline ? '#15803d' : '#dc2626' }}>{isOnline ? 'Online' : 'Offline'}</span>
          </button>
          <button onClick={() => fetchListings(true)} style={{ width: 36, height: 36, borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <RefreshCw size={14} color="#64748b" style={{ animation: refreshing ? 'spin 0.8s linear infinite' : 'none' }} />
          </button>
          <button style={{ width: 36, height: 36, borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <Bell size={14} color="#64748b" />
            <div style={{ position: 'absolute', top: 7, right: 7, width: 7, height: 7, borderRadius: '50%', background: '#ef4444', border: '1.5px solid #fff' }} />
          </button>
          <button onClick={() => navigate('/volunteer-profile')} style={{ width: 36, height: 36, borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Settings size={14} color="#64748b" />
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 24px' }}>

        {/* ── Stats Grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px,1fr))', gap: 16, marginBottom: 28, animation: 'fadeUp 0.4s ease both' }}>
          <StatCard
            icon={<Truck size={18} color="#fff" />}
            iconBg="rgba(255,255,255,0.2)"
            gradient="linear-gradient(135deg,#0ea5e9 0%,#0284c7 100%)"
            label="Completed Deliveries"
            value={loading ? '—' : stats.totalDeliveries}
            sub="Total pickups completed"
          />
          <StatCard
            icon={<Zap size={18} color="#fff" />}
            iconBg="rgba(255,255,255,0.2)"
            gradient="linear-gradient(135deg,#f59e0b 0%,#d97706 100%)"
            label="Active Deliveries"
            value={loading ? '—' : stats.activeDeliveries}
            sub="Currently in progress"
          />
          <StatCard
            icon={<Package size={18} color="#fff" />}
            iconBg="rgba(255,255,255,0.2)"
            gradient="linear-gradient(135deg,#8b5cf6 0%,#7c3aed 100%)"
            label="Food Delivered"
            value={loading ? '—' : `${stats.foodDelivered}`}
            sub="Total units redistributed"
          />
          <StatCard
            icon={<Heart size={18} color="#fff" />}
            iconBg="rgba(255,255,255,0.2)"
            gradient="linear-gradient(135deg,#22c55e 0%,#16a34a 100%)"
            label="People Helped"
            value={loading ? '—' : stats.peopleHelped}
            sub="Lives positively impacted"
          />
        </div>

        {/* ── Main Panel ── */}
        <div style={{ background: '#fff', borderRadius: 24, border: '1px solid #eef2f7', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', overflow: 'hidden', animation: 'fadeUp 0.5s ease 0.1s both' }}>

          {/* Panel header */}
          <div style={{ padding: '20px 28px 0', borderBottom: '1px solid #f8fafc' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Food Listings</h2>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ position: 'relative' }}>
                  <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                  <input
                    type="text"
                    placeholder="Search food, location…"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{
                      padding: '8px 14px 8px 30px', border: '1.5px solid #e2e8f0', borderRadius: 12,
                      fontSize: '0.78rem', fontFamily: 'inherit', outline: 'none', width: 200,
                      background: '#f8fafc', color: '#0f172a', transition: 'all 0.15s',
                    }}
                    onFocus={e => { e.target.style.borderColor = '#0ea5e9'; e.target.style.background = '#fff'; e.target.style.width = '240px'; }}
                    onBlur={e  => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; e.target.style.width = '200px'; }}
                  />
                </div>
                <div style={{ position: 'relative' }}>
                  <Filter size={12} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                  <select value={selectedType} onChange={e => setSelectedType(e.target.value)} style={{
                    padding: '8px 28px 8px 28px', border: '1.5px solid #e2e8f0', borderRadius: 12,
                    fontSize: '0.78rem', fontFamily: 'inherit', outline: 'none',
                    background: '#f8fafc', color: '#0f172a', cursor: 'pointer', appearance: 'none',
                  }}>
                    {FOOD_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 0 }}>
              {(['available','reserved','completed'] as const).map((tab, i) => {
                const icons = [<Truck size={13}/>, <Zap size={13}/>, <CheckCircle size={13}/>];
                const colors = { available: '#0ea5e9', reserved: '#f59e0b', completed: '#22c55e' };
                const active = activeTab === tab;
                return (
                  <button key={tab} onClick={() => setActiveTab(tab)} style={{
                    padding: '12px 20px', border: 'none', background: 'none', cursor: 'pointer',
                    fontFamily: 'inherit', fontSize: '0.82rem', fontWeight: active ? 800 : 600,
                    color: active ? colors[tab] : '#94a3b8',
                    borderBottom: `2.5px solid ${active ? colors[tab] : 'transparent'}`,
                    transition: 'all 0.15s',
                    display: 'flex', alignItems: 'center', gap: 7,
                    marginBottom: -1,
                  }}>
                    <span style={{ color: active ? colors[tab] : '#cbd5e1' }}>{icons[i]}</span>
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    <span style={{
                      padding: '1px 7px', borderRadius: 10, fontSize: '0.68rem', fontWeight: 800,
                      background: active ? colors[tab] + '18' : '#f8fafc',
                      color: active ? colors[tab] : '#94a3b8',
                    }}>
                      {tabCounts[tab]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Listing content */}
          <div style={{ padding: 24 }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '80px 0' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', border: '3.5px solid #e2e8f0', borderTopColor: '#0ea5e9', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 700 }}>Loading food listings…</p>
              </div>
            ) : error ? (
              <div style={{ textAlign: 'center', padding: '80px 0' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <AlertCircle size={28} color="#f87171" />
                </div>
                <p style={{ color: '#ef4444', fontWeight: 800, marginBottom: 6 }}>Something went wrong</p>
                <p style={{ color: '#94a3b8', fontSize: '0.82rem', marginBottom: 18 }}>{error}</p>
                <button onClick={() => fetchListings()} style={{ padding: '10px 24px', borderRadius: 12, background: 'linear-gradient(135deg,#0ea5e9,#0284c7)', color: '#fff', border: 'none', fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }}>
                  Try Again
                </button>
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 0' }}>
                <div style={{ fontSize: '3.5rem', marginBottom: 12 }}>🍽️</div>
                <h3 style={{ color: '#0f172a', fontWeight: 800, marginBottom: 8, fontSize: '1.05rem' }}>No listings found</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.82rem', marginBottom: 18 }}>
                  {searchQuery || selectedType !== 'All Types' ? 'Try adjusting your search or filter.' : `No ${activeTab} deliveries right now — check back soon!`}
                </p>
                {(searchQuery || selectedType !== 'All Types') && (
                  <button onClick={() => { setSearchQuery(''); setSelectedType('All Types'); }} style={{ padding: '8px 20px', borderRadius: 12, background: '#f8fafc', border: '1.5px solid #e2e8f0', color: '#475569', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.8rem' }}>
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {filtered.map((listing, i) => (
                  <div key={listing._id} style={{ animation: `fadeUp 0.3s ease ${i * 0.05}s both` }}>
                    <DeliveryCard listing={listing} onAccept={handleAccept} onComplete={handleComplete} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Quick Actions ── */}
        <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: 14, animation: 'fadeUp 0.5s ease 0.2s both' }}>
          {[
            { icon: '📅', title: 'Schedule Availability', sub: 'Set your volunteer hours', gradient: 'linear-gradient(135deg,#eff6ff,#dbeafe)', border: '#bfdbfe', onClick: undefined },
            { icon: '📍', title: 'Update Location',        sub: 'Change your service area',  gradient: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', border: '#bbf7d0', onClick: undefined },
            { icon: '👤', title: 'View Profile',           sub: 'Manage your volunteer profile', gradient: 'linear-gradient(135deg,#faf5ff,#ede9fe)', border: '#ddd6fe', onClick: () => navigate('/volunteer-profile') },
          ].map(({ icon, title, sub, gradient, border, onClick }) => (
            <button key={title} onClick={onClick} style={{
              padding: '18px 20px', borderRadius: 18, border: `1.5px solid ${border}`,
              background: gradient, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', gap: 14, transition: 'transform 0.15s, box-shadow 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <span style={{ fontSize: '1.6rem' }}>{icon}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{title}</p>
                <p style={{ fontSize: '0.73rem', color: '#64748b', margin: '3px 0 0', fontWeight: 600 }}>{sub}</p>
              </div>
              <ArrowUpRight size={15} color="#94a3b8" />
            </button>
          ))}
        </div>

      </div>
    </div>
  );
};

export default VolunteerDashboard;