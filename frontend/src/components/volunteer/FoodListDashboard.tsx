import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Truck, MapPin, Clock, Package, Users,
  Navigation, CheckCircle, Search, Bell,
  Settings, User, AlertCircle, RefreshCw,
  Zap, Filter, Heart, ArrowUpRight, Flame
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { foodDonationService } from '../../services/foodDonationService';
import CountdownTimer from '../common/CountdownTimer';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

interface FoodListing {
  _id: string;
  foodType: string;
  description?: string;
  quantity: number;
  unit?: string;
  status: 'available' | 'requested' | 'confirmed' | 'reserved' | 'picked_up' | 'in_transit' | 'completed' | 'expired';
  location?: { address?: string; coordinates?: number[] };
  bestBefore?: string;
  createdAt: string;
  user?: { name?: string; phone?: string; _id?: string };
  servings?: number;
  category?: string;
  volunteerId?: string;
}

const urgencyFromListing = (l: FoodListing): 'high' | 'medium' | 'low' => {
  if (!l.bestBefore) return 'low';
  // Calculate remaining time
  const createdMs = new Date(l.createdAt).getTime();
  const expiryMs  = createdMs + parseFloat(l.bestBefore) * 3_600_000;
  const remainingHours = (expiryMs - Date.now()) / 3_600_000;
  if (remainingHours <= 0.5) return 'high';   // < 30 min
  if (remainingHours <= 2)   return 'high';   // < 2 hours
  if (remainingHours <= 6)   return 'medium'; // < 6 hours
  return 'low';
};

function getExpiryDate(l: FoodListing): Date {
  return new Date(new Date(l.createdAt).getTime() + parseFloat(l.bestBefore || '0') * 3_600_000);
}

function isListingExpired(l: FoodListing): boolean {
  if (!l.bestBefore) return false;
  return getExpiryDate(l).getTime() < Date.now();
}

const FOOD_TYPES = ['All Types','Fresh Produce','Baked Goods','Non-perishable','Cooked Meals','Dairy','Beverages','Snacks'];
const CATEGORY_EMOJI: Record<string,string> = {
  'Fresh Produce':'🥦','Baked Goods':'🍞','Non-perishable':'🥫',
  'Cooked Meals':'🍱','Dairy':'🥛','Beverages':'🧃','Snacks':'🍿',
};
const timeAgo = (d: string) => {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff/60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m/60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h/24)}d ago`;
};

/* ── Step buttons per status ── */
function getVolunteerActions(status: string, volunteerId: string | undefined, userId: string | undefined) {
  const isMyPickup = volunteerId === userId;
  if (status === 'available' || status === 'requested' || status === 'confirmed')
    return [{ key:'accept',  label:'Accept Delivery', color:'#0ea5e9', icon:'🚴' }];
  if (status === 'reserved' && isMyPickup)
    return [{ key:'pickup',  label:'Mark Picked Up',  color:'#f97316', icon:'📦' }];
  if (status === 'picked_up' && isMyPickup)
    return [{ key:'deliver', label:'Mark Delivered',  color:'#8b5cf6', icon:'🚗' }];
  return [];
}

/* ── Delivery Card ── */
const DeliveryCard = ({ listing, onAction, processing, userId }: {
  listing: FoodListing;
  onAction: (id: string, action: string) => void;
  processing: string | null;
  userId?: string;
}) => {
  const [hov, setHov] = useState(false);
  const urgency = urgencyFromListing(listing);
  const address = listing.location?.address || 'Location not specified';
  const hoursLeft = listing.bestBefore ? parseFloat(listing.bestBefore) : null;
  const emoji = CATEGORY_EMOJI[listing.category || listing.foodType] || '🍽️';
  const busy = processing === listing._id;
  const actions = getVolunteerActions(listing.status, listing.volunteerId, userId);

  const urgencyConfig = {
    high:   { bg:'#fff1f2', border:'#fda4af', text:'#be123c', dot:'#f43f5e', label:'Urgent' },
    medium: { bg:'#fff7ed', border:'#fdba74', text:'#c2410c', dot:'#f97316', label:'Soon' },
    low:    { bg:'#f0fdf4', border:'#86efac', text:'#15803d', dot:'#22c55e', label:'Flexible' },
  }[urgency];

  const statusBadge: Record<string, { bg:string; color:string; border:string; label:string }> = {
    available:  { bg:'#f0fdf4', color:'#15803d', border:'#bbf7d0', label:'Available' },
    requested:  { bg:'#eff6ff', color:'#1d4ed8', border:'#bfdbfe', label:'Needs Pickup' },
    confirmed:  { bg:'#fef3c7', color:'#92400e', border:'#fde68a', label:'Donor Confirmed ✓' },
    reserved:   { bg:'#faf5ff', color:'#7c3aed', border:'#ddd6fe', label:'Assigned to You' },
    picked_up:  { bg:'#fff7ed', color:'#c2410c', border:'#fed7aa', label:'Picked Up' },
    in_transit: { bg:'#eff6ff', color:'#1d4ed8', border:'#bfdbfe', label:'En Route' },
    completed:  { bg:'#f0fdf4', color:'#15803d', border:'#bbf7d0', label:'✓ Completed' },
  };
  const badge = statusBadge[listing.status] || { bg:'#f8fafc', color:'#64748b', border:'#e2e8f0', label: listing.status };

  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ background:hov?'#fafeff':'#fff', border:`1.5px solid ${hov?'#bae6fd':'#f1f5f9'}`, borderRadius:20, transition:'all 0.2s', boxShadow:hov?'0 12px 40px rgba(14,165,233,0.1)':'0 1px 4px rgba(0,0,0,0.04)', overflow:'hidden', fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif" }}>
      <div style={{ height:3, background:urgencyConfig.dot, opacity:urgency==='high'?1:0.35 }}/>
      <div style={{ padding:'20px 24px' }}>
        {/* Header */}
        <div style={{ display:'flex', alignItems:'flex-start', gap:14, marginBottom:14 }}>
          <div style={{ width:52, height:52, borderRadius:16, flexShrink:0, background:'linear-gradient(135deg,#f0f9ff,#e0f2fe)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.6rem', border:'1px solid #bae6fd' }}>
            {emoji}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap', marginBottom:6 }}>
              <h3 style={{ fontSize:'1rem', fontWeight:800, color:'#0f172a', margin:0 }}>{listing.foodType}</h3>
              <span style={{ fontSize:'0.65rem', fontWeight:800, padding:'3px 9px', borderRadius:20, background:urgencyConfig.bg, color:urgencyConfig.text, border:`1px solid ${urgencyConfig.border}` }}>
                {urgencyConfig.label}
              </span>
              <span style={{ fontSize:'0.65rem', fontWeight:800, padding:'3px 9px', borderRadius:20, background:badge.bg, color:badge.color, border:`1px solid ${badge.border}` }}>
                {badge.label}
              </span>
            </div>
            {listing.description && (
              <p style={{ fontSize:'0.8rem', color:'#64748b', margin:0, lineHeight:1.5, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' as any }}>{listing.description}</p>
            )}
          </div>
          <span style={{ fontSize:'0.7rem', color:'#94a3b8', fontWeight:600, whiteSpace:'nowrap', flexShrink:0 }}>{timeAgo(listing.createdAt)}</span>
        </div>

        {/* Info pills */}
        {/* Countdown timer */}
        <div style={{ marginBottom:10 }}>
          <CountdownTimer expiryDate={getExpiryDate(listing)} compact={false}/>
        </div>

        <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:14 }}>
          {[
            { icon:<MapPin size={11}/>, text:address.length>35?address.slice(0,35)+'…':address },
            { icon:<Package size={11}/>, text:`${listing.servings||listing.quantity||'?'} servings` },
          ].map(({icon,text})=>(
            <div key={text} style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 12px', borderRadius:10, background:'#f8fafc', border:'1px solid #f1f5f9', fontSize:'0.75rem', color:'#475569', fontWeight:600 }}>
              <span style={{ color:'#94a3b8' }}>{icon}</span>{text}
            </div>
          ))}
        </div>

        {urgency === 'high' && (
          <div style={{ display:'flex', alignItems:'center', gap:8, background:'linear-gradient(135deg,#fff1f2,#ffe4e6)', border:'1px solid #fda4af', borderRadius:12, padding:'10px 14px', marginBottom:14 }}>
            <Flame size={14} color="#f43f5e"/>
            <p style={{ fontSize:'0.78rem', color:'#be123c', margin:0, fontWeight:700 }}>Expires in under 2 hours — pick up immediately!</p>
          </div>
        )}

        {/* Progress steps for active deliveries */}
        {['reserved','picked_up','in_transit'].includes(listing.status) && listing.volunteerId === userId && (
          <div style={{ display:'flex', gap:6, marginBottom:14 }}>
            {[
              { s:'reserved',   label:'Accepted',   done:true },
              { s:'picked_up',  label:'Picked Up',  done:['picked_up','in_transit'].includes(listing.status) },
              { s:'in_transit', label:'Delivered',  done:listing.status === 'in_transit' },
            ].map(({label, done}, i) => (
              <div key={label} style={{ flex:1, textAlign:'center' }}>
                <div style={{ height:4, borderRadius:99, background:done?'linear-gradient(90deg,#22c55e,#15803d)':'#e2e8f0', marginBottom:4, transition:'background .3s' }}/>
                <span style={{ fontSize:'0.62rem', color:done?'#15803d':'#94a3b8', fontWeight:700 }}>{label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:14, borderTop:'1px solid #f8fafc', gap:12, flexWrap:'wrap' }}>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={() => { if(listing.location?.coordinates) window.open(`https://maps.google.com/?q=${listing.location.coordinates[1]},${listing.location.coordinates[0]}`,'_blank'); }}
              style={{ width:34, height:34, borderRadius:10, background:'#f8fafc', border:'1px solid #e2e8f0', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Navigation size={14} color="#64748b"/>
            </button>
          </div>
          <div style={{ display:'flex', gap:8 }}>
            {actions.map(action => (
              <button key={action.key} onClick={() => onAction(listing._id, action.key)} disabled={busy}
                style={{ padding:'8px 18px', borderRadius:11, border:'none', cursor:busy?'not-allowed':'pointer',
                  background:busy?'#94a3b8':`linear-gradient(135deg,${action.color},${action.color}cc)`,
                  color:'#fff', fontWeight:800, fontSize:'0.8rem', fontFamily:'inherit',
                  display:'flex', alignItems:'center', gap:6,
                  boxShadow:busy?'none':`0 4px 12px ${action.color}40`,
                  transition:'all 0.15s', opacity:busy?0.7:1 }}>
                {busy
                  ? <><div style={{ width:12, height:12, borderRadius:'50%', border:'2px solid rgba(255,255,255,0.4)', borderTopColor:'#fff', animation:'spin .8s linear infinite' }}/> Working…</>
                  : <>{action.icon} {action.label}</>
                }
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, sub, gradient, iconBg }: any) => (
  <div style={{ borderRadius:22, padding:'24px 26px', background:gradient, position:'relative', overflow:'hidden', fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif" }}>
    <div style={{ position:'absolute', top:-20, right:-20, width:100, height:100, borderRadius:'50%', background:'rgba(255,255,255,0.08)' }}/>
    <div style={{ position:'relative' }}>
      <div style={{ width:42, height:42, borderRadius:14, background:iconBg, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:16 }}>{icon}</div>
      <p style={{ fontSize:'0.72rem', fontWeight:700, color:'rgba(255,255,255,0.7)', textTransform:'uppercase', letterSpacing:'0.06em', margin:'0 0 6px' }}>{label}</p>
      <p style={{ fontSize:'2.2rem', fontWeight:900, color:'#fff', margin:'0 0 8px', lineHeight:1 }}>{value}</p>
      <p style={{ fontSize:'0.73rem', color:'rgba(255,255,255,0.65)', margin:0, fontWeight:600 }}>{sub}</p>
    </div>
  </div>
);

type TabKey = 'available' | 'confirmed' | 'reserved' | 'picked_up' | 'completed';

const VolunteerDashboard = () => {
  const [activeTab,    setActiveTab]    = useState<TabKey>('available');
  const [searchQuery,  setSearchQuery]  = useState('');
  const [selectedType, setSelectedType] = useState('All Types');
  const [isOnline,     setIsOnline]     = useState(true);
  const [listings,     setListings]     = useState<FoodListing[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState<string | null>(null);
  const [refreshing,   setRefreshing]   = useState(false);
  const [processing,   setProcessing]   = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const intervalRef = useRef<ReturnType<typeof setInterval>|null>(null);

  const fetchListings = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) setRefreshing(true); else setLoading(true);
      setError(null);
      // Try volunteer-specific endpoint first, fall back to public
      try {
        const res = await api.get('/food-donations/volunteer-feed');
        setListings(Array.isArray(res.data) ? res.data : []);
      } catch {
        const data = await foodDonationService.getAll();
        // For fallback, also get confirmed listings
        const allRes = await api.get('/food-donations/my-donations').catch(() => ({ data: [] }));
        const combined = [...(Array.isArray(data)?data:[]), ...(Array.isArray(allRes.data)?allRes.data:[])];
        const unique = combined.filter((l,i,arr) => arr.findIndex(x=>x._id===l._id)===i);
        setListings(unique);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load listings.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchListings();
    intervalRef.current = setInterval(() => fetchListings(true), 30_000);
    return () => { if(intervalRef.current) clearInterval(intervalRef.current); };
  }, [fetchListings]);

  /* ── Unified action handler ── */
  const handleAction = async (id: string, action: string) => {
    setProcessing(id);
    try {
      await api.post(`/food-donations/${id}/${action}`, {});
      const statusMap: Record<string, FoodListing['status']> = {
        accept:  'reserved',
        pickup:  'picked_up',
        deliver: 'in_transit',
        complete:'completed',
      };
      const newStatus = statusMap[action];
      if (newStatus) {
        setListings(prev => prev.map(l => l._id===id ? { ...l, status:newStatus, volunteerId:(user as any)?._id } : l));
        // Switch to appropriate tab
        if (action === 'accept')  setActiveTab('reserved');
        if (action === 'pickup')  setActiveTab('picked_up');
        if (action === 'deliver') setActiveTab('picked_up'); // stays in picked_up until recipient confirms
      }
      // Refresh after action
      setTimeout(() => fetchListings(true), 1000);
    } catch (err: any) {
      alert(err?.response?.data?.message || `Failed to ${action}`);
    } finally {
      setProcessing(null);
    }
  };

  const stats = useMemo(() => {
    const completed = listings.filter(l => l.status === 'completed');
    const myActive  = listings.filter(l => ['reserved','picked_up','in_transit'].includes(l.status) && l.volunteerId === (user as any)?._id);
    const people    = completed.reduce((s,l) => s+(l.servings||l.quantity||0), 0);
    const needPickup= listings.filter(l => l.status === 'confirmed').length;
    return { totalDeliveries:completed.length, activeDeliveries:myActive.length, peopleHelped:people, needPickup };
  }, [listings, user]);

  const tabConfig: { key: TabKey; label: string; color: string; desc: string }[] = [
    { key:'available', label:'Available',    color:'#0ea5e9', desc:'Open for pickup' },
    { key:'confirmed', label:'Ready',        color:'#f59e0b', desc:'Donor confirmed' },
    { key:'reserved',  label:'My Pickups',   color:'#8b5cf6', desc:'You accepted' },
    { key:'picked_up', label:'In Progress',  color:'#f97316', desc:'Picked up' },
    { key:'completed', label:'Completed',    color:'#22c55e', desc:'Done' },
  ];

  const tabCounts = useMemo(() => ({
    available: listings.filter(l=>l.status==='available').length,
    confirmed: listings.filter(l=>l.status==='confirmed').length,
    reserved:  listings.filter(l=>l.status==='reserved' && l.volunteerId===(user as any)?._id).length,
    picked_up: listings.filter(l=>l.status==='picked_up' && l.volunteerId===(user as any)?._id).length,
    completed: listings.filter(l=>l.status==='completed').length,
  }), [listings, user]);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return listings.filter(l => {
      let matchTab = l.status === activeTab;
      // For reserved/picked_up — only show volunteer's own
      if (['reserved','picked_up'].includes(activeTab))
        matchTab = matchTab && l.volunteerId === (user as any)?._id;
      const matchSearch = !q || l.foodType?.toLowerCase().includes(q) || l.description?.toLowerCase().includes(q) || l.location?.address?.toLowerCase().includes(q);
      const matchType   = selectedType==='All Types' || l.category===selectedType || l.foodType===selectedType;
      return matchTab && matchSearch && matchType;
    });
  }, [listings, activeTab, searchQuery, selectedType, user]);

  const greeting = () => { const h=new Date().getHours(); return h<12?'Good morning':h<17?'Good afternoon':'Good evening'; };

  return (
    <div style={{ minHeight:'100vh', background:'#f0f4f8', fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        @keyframes spin   { to{transform:rotate(360deg)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.5} }
        * { box-sizing:border-box; }
      `}</style>

      {/* Nav */}
      <div style={{ background:'#fff', borderBottom:'1px solid #eef2f7', padding:'0 32px', height:64, display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:100, boxShadow:'0 1px 0 #eef2f7' }}>
        <div>
          <span style={{ fontSize:'1.05rem', fontWeight:900, color:'#0f172a' }}>Volunteer Dashboard</span>
          <span style={{ fontSize:'0.75rem', color:'#94a3b8', fontWeight:600, marginLeft:12 }}>{greeting()}, {user?.name?.split(' ')[0]||'Volunteer'} 👋</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <button onClick={()=>setIsOnline(o=>!o)} style={{ display:'flex', alignItems:'center', gap:7, padding:'7px 14px', borderRadius:20, cursor:'pointer', border:'none', background:isOnline?'#dcfce7':'#fee2e2' }}>
            <div style={{ width:7, height:7, borderRadius:'50%', background:isOnline?'#22c55e':'#ef4444', animation:isOnline?'pulse 2s infinite':'none' }}/>
            <span style={{ fontSize:'0.75rem', fontWeight:800, color:isOnline?'#15803d':'#dc2626' }}>{isOnline?'Online':'Offline'}</span>
          </button>
          <button onClick={()=>fetchListings(true)} style={{ width:36, height:36, borderRadius:10, background:'#f8fafc', border:'1px solid #e2e8f0', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <RefreshCw size={14} color="#64748b" style={{ animation:refreshing?'spin 0.8s linear infinite':'none' }}/>
          </button>
          <button style={{ width:36, height:36, borderRadius:10, background:'#f8fafc', border:'1px solid #e2e8f0', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
            <Bell size={14} color="#64748b"/>
            {(stats.needPickup + tabCounts.confirmed) > 0 && (
              <div style={{ position:'absolute', top:6, right:6, width:8, height:8, borderRadius:'50%', background:'#ef4444', border:'1.5px solid #fff' }}/>
            )}
          </button>
          <button onClick={()=>navigate('/volunteer-profile')} style={{ width:36, height:36, borderRadius:10, background:'#f8fafc', border:'1px solid #e2e8f0', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Settings size={14} color="#64748b"/>
          </button>
        </div>
      </div>

      <div style={{ maxWidth:1200, margin:'0 auto', padding:'28px 24px' }}>
        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:16, marginBottom:28, animation:'fadeUp 0.4s ease both' }}>
          <StatCard icon={<Truck size={18} color="#fff"/>} iconBg="rgba(255,255,255,0.2)" gradient="linear-gradient(135deg,#0ea5e9,#0284c7)" label="Completed" value={loading?'—':stats.totalDeliveries} sub="Total deliveries done"/>
          <StatCard icon={<Zap size={18} color="#fff"/>} iconBg="rgba(255,255,255,0.2)" gradient="linear-gradient(135deg,#f59e0b,#d97706)" label="My Active" value={loading?'—':stats.activeDeliveries} sub="Currently assigned to you"/>
          <StatCard icon={<Package size={18} color="#fff"/>} iconBg="rgba(255,255,255,0.2)" gradient="linear-gradient(135deg,#8b5cf6,#7c3aed)" label="Ready to Pick Up" value={loading?'—':tabCounts.confirmed} sub="Donor confirmed — needs volunteer"/>
          <StatCard icon={<Heart size={18} color="#fff"/>} iconBg="rgba(255,255,255,0.2)" gradient="linear-gradient(135deg,#22c55e,#16a34a)" label="People Helped" value={loading?'—':stats.peopleHelped} sub="Lives positively impacted"/>
        </div>

        {/* Main panel */}
        <div style={{ background:'#fff', borderRadius:24, border:'1px solid #eef2f7', boxShadow:'0 2px 12px rgba(0,0,0,0.04)', overflow:'hidden', animation:'fadeUp 0.5s ease 0.1s both' }}>
          <div style={{ padding:'20px 28px 0', borderBottom:'1px solid #f8fafc' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
              <h2 style={{ fontSize:'1rem', fontWeight:800, color:'#0f172a', margin:0 }}>Food Listings</h2>
              <div style={{ display:'flex', gap:8 }}>
                <div style={{ position:'relative' }}>
                  <Search size={13} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#94a3b8', pointerEvents:'none' }}/>
                  <input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder="Search…"
                    style={{ padding:'8px 14px 8px 30px', border:'1.5px solid #e2e8f0', borderRadius:12, fontSize:'0.78rem', fontFamily:'inherit', outline:'none', width:200, background:'#f8fafc', color:'#0f172a' }}
                    onFocus={e=>{e.target.style.borderColor='#0ea5e9';e.target.style.background='#fff';}}
                    onBlur={e =>{e.target.style.borderColor='#e2e8f0';e.target.style.background='#f8fafc';}}/>
                </div>
                <div style={{ position:'relative' }}>
                  <Filter size={12} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'#94a3b8', pointerEvents:'none' }}/>
                  <select value={selectedType} onChange={e=>setSelectedType(e.target.value)}
                    style={{ padding:'8px 28px 8px 28px', border:'1.5px solid #e2e8f0', borderRadius:12, fontSize:'0.78rem', fontFamily:'inherit', outline:'none', background:'#f8fafc', color:'#0f172a', cursor:'pointer', appearance:'none' }}>
                    {FOOD_TYPES.map(t=><option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display:'flex', gap:0, overflowX:'auto' }}>
              {tabConfig.map(({ key, label, color, desc }) => {
                const active = activeTab === key;
                const count  = tabCounts[key];
                return (
                  <button key={key} onClick={()=>setActiveTab(key)}
                    style={{ padding:'12px 18px', border:'none', background:'none', cursor:'pointer', fontFamily:'inherit', fontSize:'0.8rem', fontWeight:active?800:600, color:active?color:'#94a3b8', borderBottom:`2.5px solid ${active?color:'transparent'}`, transition:'all 0.15s', display:'flex', alignItems:'center', gap:6, marginBottom:-1, whiteSpace:'nowrap' }}>
                    {label}
                    {count > 0 && (
                      <span style={{ padding:'1px 7px', borderRadius:10, fontSize:'0.65rem', fontWeight:800, background:active?color+'18':'#f8fafc', color:active?color:'#94a3b8' }}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ padding:24 }}>
            {loading ? (
              <div style={{ textAlign:'center', padding:'80px 0' }}>
                <div style={{ width:44, height:44, borderRadius:'50%', border:'3.5px solid #e2e8f0', borderTopColor:'#0ea5e9', animation:'spin 0.8s linear infinite', margin:'0 auto 16px' }}/>
                <p style={{ color:'#94a3b8', fontSize:'0.85rem', fontWeight:700 }}>Loading food listings…</p>
              </div>
            ) : error ? (
              <div style={{ textAlign:'center', padding:'80px 0' }}>
                <AlertCircle size={28} color="#f87171" style={{ margin:'0 auto 16px', display:'block' }}/>
                <p style={{ color:'#ef4444', fontWeight:800, marginBottom:18 }}>{error}</p>
                <button onClick={()=>fetchListings()} style={{ padding:'10px 24px', borderRadius:12, background:'linear-gradient(135deg,#0ea5e9,#0284c7)', color:'#fff', border:'none', fontWeight:800, cursor:'pointer', fontFamily:'inherit' }}>Try Again</button>
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign:'center', padding:'80px 0' }}>
                <div style={{ fontSize:'3.5rem', marginBottom:12 }}>🍽️</div>
                <h3 style={{ color:'#0f172a', fontWeight:800, marginBottom:8, fontSize:'1.05rem' }}>No listings found</h3>
                <p style={{ color:'#94a3b8', fontSize:'0.82rem' }}>
                  {activeTab==='confirmed' ? 'No donor-confirmed pickups yet — check back soon!' :
                   activeTab==='reserved'  ? 'You have no active pickups.' :
                   searchQuery ? 'Try adjusting your search.' :
                   `No ${activeTab} deliveries right now.`}
                </p>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {filtered.map((listing,i)=>(
                  <div key={listing._id} style={{ animation:`fadeUp 0.3s ease ${i*0.05}s both` }}>
                    <DeliveryCard listing={listing} onAction={handleAction} processing={processing} userId={(user as any)?._id}/>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ marginTop:20, display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:14, animation:'fadeUp 0.5s ease 0.2s both' }}>
          {[
            { icon:'📅', title:'Schedule Availability', sub:'Set your volunteer hours',      gradient:'linear-gradient(135deg,#eff6ff,#dbeafe)', border:'#bfdbfe', onClick:undefined },
            { icon:'📍', title:'Update Location',        sub:'Change your service area',      gradient:'linear-gradient(135deg,#f0fdf4,#dcfce7)', border:'#bbf7d0', onClick:undefined },
            { icon:'👤', title:'View Profile',           sub:'Manage your volunteer profile', gradient:'linear-gradient(135deg,#faf5ff,#ede9fe)', border:'#ddd6fe', onClick:()=>navigate('/volunteer-profile') },
          ].map(({icon,title,sub,gradient,border,onClick})=>(
            <button key={title} onClick={onClick}
              style={{ padding:'18px 20px', borderRadius:18, border:`1.5px solid ${border}`, background:gradient, cursor:'pointer', textAlign:'left', fontFamily:'inherit', display:'flex', alignItems:'center', gap:14, transition:'transform 0.15s, box-shadow 0.15s' }}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,0.08)';}}
              onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='none';}}>
              <span style={{ fontSize:'1.6rem' }}>{icon}</span>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:'0.85rem', fontWeight:800, color:'#0f172a', margin:0 }}>{title}</p>
                <p style={{ fontSize:'0.73rem', color:'#64748b', margin:'3px 0 0', fontWeight:600 }}>{sub}</p>
              </div>
              <ArrowUpRight size={15} color="#94a3b8"/>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VolunteerDashboard;