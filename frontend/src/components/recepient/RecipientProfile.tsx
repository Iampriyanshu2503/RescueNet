import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import api from '../../services/api';
import {
    ArrowLeft, User, Mail, Phone, MapPin, Heart, Users,
    Edit3, Save, X, Calendar, Award, Package, TrendingUp,
    LogOut, Bell, Shield, HelpCircle, Settings, CheckCircle,
    Camera, Star, Zap, Leaf, ChevronRight, RefreshCw,
    Upload, Activity, Clock, Target, ShoppingBag
} from 'lucide-react';

type NotifKey = 'newListings' | 'orderUpdates' | 'weeklyDigest';

/* ── Animated counter ── */
function Counter({ to, duration = 1200 }: { to: number; duration?: number }) {
    const [val, setVal] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    useEffect(() => {
        const obs = new IntersectionObserver(([e]) => {
            if (!e.isIntersecting) return;
            const t0 = Date.now();
            const tick = () => {
                const p = Math.min((Date.now() - t0) / duration, 1);
                setVal(Math.round((1 - Math.pow(1 - p, 3)) * to));
                if (p < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
            obs.disconnect();
        }, { threshold: 0.3 });
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, [to, duration]);
    return <span ref={ref}>{val >= 1000 ? (val / 1000).toFixed(1) + 'k' : val}</span>;
}

/* ── Animated progress bar ── */
function ProgressBar({ value, max, color, delay = 0 }: { value: number; max: number; color: string; delay?: number }) {
    const [width, setWidth] = useState(0);
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const obs = new IntersectionObserver(([e]) => {
            if (!e.isIntersecting) return;
            setTimeout(() => setWidth(Math.round((value / Math.max(max, 1)) * 100)), delay);
            obs.disconnect();
        }, { threshold: 0.3 });
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, [value, max, delay]);
    return (
        <div ref={ref} style={{ height: 8, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${width}%`, background: color, borderRadius: 99, transition: 'width 1s cubic-bezier(0.34,1.56,0.64,1)' }} />
        </div>
    );
}

/* ── Achievement badge ── */
function Badge({ emoji, label, desc, unlocked, delay = 0 }: { emoji: string; label: string; desc: string; unlocked: boolean; delay?: number }) {
    const [hov, setHov] = useState(false);
    return (
        <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
            style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8, padding:'16px 12px', borderRadius:18, border:`1.5px solid ${unlocked ? (hov ? '#8b5cf6' : '#ddd6fe') : '#f1f5f9'}`, background: unlocked ? (hov ? '#f5f3ff' : '#faf8ff') : '#fafafa', transition:'all 0.25s', cursor:'default', animation:`popIn 0.5s ease ${delay}s both`, opacity: unlocked ? 1 : 0.45, filter: unlocked ? 'none' : 'grayscale(1)', transform: hov && unlocked ? 'translateY(-4px) scale(1.04)' : 'none' }}>
            <div style={{ fontSize:'1.8rem', lineHeight:1 }}>{emoji}</div>
            <p style={{ fontSize:'0.72rem', fontWeight:800, color: unlocked ? '#6d28d9' : '#94a3b8', textAlign:'center', lineHeight:1.3 }}>{label}</p>
            <p style={{ fontSize:'0.65rem', color:'#94a3b8', textAlign:'center', lineHeight:1.4 }}>{desc}</p>
            {unlocked && <div style={{ width:18, height:18, borderRadius:'50%', background:'linear-gradient(135deg,#8b5cf6,#6d28d9)', display:'flex', alignItems:'center', justifyContent:'center' }}><CheckCircle size={10} color="#fff"/></div>}
        </div>
    );
}

/* ── Inline edit field ── */
function InlineField({ label, value, onChange, type = 'text', icon: Icon, color = '#8b5cf6' }: { label: string; value: string; onChange: (v: string) => void; type?: string; icon: any; color?: string }) {
    const [editing, setEditing] = useState(false);
    const [local, setLocal] = useState(value);
    const inputRef = useRef<HTMLInputElement>(null);
    useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);
    useEffect(() => { setLocal(value); }, [value]);
    const commit = () => { onChange(local); setEditing(false); };
    const cancel = () => { setLocal(value); setEditing(false); };
    return (
        <div style={{ display:'flex', alignItems:'flex-start', gap:14, padding:'14px 16px', borderRadius:16, border:'1.5px solid #f1f5f9', background:'#fafafa', transition:'all 0.2s', cursor: editing ? 'default' : 'pointer' }}
            onClick={() => !editing && setEditing(true)}
            onMouseEnter={e => { if (!editing) (e.currentTarget as HTMLElement).style.borderColor=color+'40'; }}
            onMouseLeave={e => { if (!editing) (e.currentTarget as HTMLElement).style.borderColor='#f1f5f9'; }}>
            <div style={{ width:36, height:36, borderRadius:11, background:`${color}15`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <Icon size={15} color={color}/>
            </div>
            <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontSize:'0.68rem', fontWeight:700, color:'#94a3b8', letterSpacing:'0.05em', textTransform:'uppercase', marginBottom:4 }}>{label}</p>
                {editing ? (
                    <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                        <input ref={inputRef} type={type} value={local} onChange={e => setLocal(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') cancel(); }}
                            style={{ flex:1, padding:'6px 10px', borderRadius:9, border:`1.5px solid ${color}`, background:'#fff', fontSize:'0.875rem', fontWeight:600, color:'#0f172a', outline:'none', fontFamily:'inherit' }}/>
                        <button onClick={commit} style={{ width:28, height:28, borderRadius:8, background:'linear-gradient(135deg,#8b5cf6,#6d28d9)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}><CheckCircle size={13} color="#fff"/></button>
                        <button onClick={cancel} style={{ width:28, height:28, borderRadius:8, background:'#f1f5f9', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}><X size={13} color="#64748b"/></button>
                    </div>
                ) : (
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <p style={{ fontSize:'0.875rem', fontWeight:600, color: value ? '#0f172a' : '#cbd5e1', flex:1 }}>{value || 'Click to add…'}</p>
                        <Edit3 size={12} color="#cbd5e1"/>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function RecipientProfile() {
    const navigate = useNavigate();
    const [saving,    setSaving]    = useState(false);
    const [loading,   setLoading]   = useState(true);
    const [activeTab, setActiveTab] = useState<'profile'|'stats'|'achievements'|'settings'>('profile');
    const [scrolled,  setScrolled]  = useState(false);
    const [saveMsg,   setSaveMsg]   = useState('');
    const [avatarHov, setAvatarHov] = useState(false);
    const [avatarImg, setAvatarImg] = useState<string|null>(null);
    const fileRef = useRef<HTMLInputElement>(null);
    const [notifications, setNotifications] = useState<Record<NotifKey, boolean>>({ newListings:true, orderUpdates:true, weeklyDigest:false });
    const [stats, setStats] = useState({ total:0, completed:0, active:0, servings:0, pending:0 });
    const [profile, setProfile] = useState({ name:'', email:'', phone:'', address:'', organization:'', createdAt: new Date().toISOString() });
    const [form, setForm] = useState({ ...profile });

    const loadProfile = useCallback(async () => {
        setLoading(true);
        try {
            const stored = authService.getStoredUser();
            const raw = stored || await authService.getProfile();
            const p = {
                name:         (raw as any).name         || 'Recipient',
                email:        (raw as any).email        || '',
                phone:        (raw as any).phone        || '',
                address:      (raw as any).address      || '',
                organization: (raw as any).organization || '',
                createdAt:    (raw as any).createdAt    || new Date().toISOString(),
            };
            setProfile(p); setForm(p);
        } catch {} finally { setLoading(false); }
    }, []);

    const loadStats = useCallback(async () => {
        try {
            const res = await api.get('/food-donations/my-requests');
            const arr = Array.isArray(res.data) ? res.data : [];
            setStats({
                total:     arr.length,
                completed: arr.filter((d:any) => d.status === 'completed').length,
                active:    arr.filter((d:any) => ['confirmed','reserved','picked_up','in_transit'].includes(d.status)).length,
                servings:  arr.reduce((s:number, d:any) => s + (d.servings || 0), 0),
                pending:   arr.filter((d:any) => d.status === 'requested').length,
            });
        } catch {}
    }, []);

    useEffect(() => { loadProfile(); loadStats(); }, [loadProfile, loadStats]);
    useEffect(() => { const fn = () => setScrolled(window.scrollY > 10); window.addEventListener('scroll', fn); return () => window.removeEventListener('scroll', fn); }, []);

    const handleFieldChange = (field: string) => (value: string) => {
        const updated = { ...form, [field]: value };
        setForm(updated);
        setTimeout(async () => {
            const token  = authService.getStoredToken();
            const stored = authService.getStoredUser();
            const userId = (stored as any)?._id;
            if (userId && token) {
                try {
                    await fetch(`/api/users/${userId}`, { method:'PUT', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` }, body:JSON.stringify(updated) });
                    const existing = authService.getStoredUser();
                    if (existing) localStorage.setItem('user', JSON.stringify({ ...existing, ...updated }));
                    setProfile(updated);
                    setSaveMsg('Auto-saved ✓'); setTimeout(() => setSaveMsg(''), 2000);
                } catch {}
            }
        }, 400);
    };

    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => { if (typeof ev.target?.result === 'string') setAvatarImg(ev.target.result); };
        reader.readAsDataURL(file);
    };

    const handleLogout = () => { authService.logout(); navigate('/login'); };
    const toggleNotif  = (k: NotifKey) => setNotifications(n => ({ ...n, [k]: !n[k] }));

    const initials  = profile.name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2) || 'R';
    const joinYear  = new Date(profile.createdAt).getFullYear();
    const successRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

    const achievements = [
        { emoji:'🌿', label:'First Bite',     desc:'Received your first food',       unlocked: stats.total >= 1 },
        { emoji:'🔟', label:'Ten Times',      desc:'10 successful requests',          unlocked: stats.completed >= 10 },
        { emoji:'🍽️', label:'100 Meals',      desc:'Received 100 servings',           unlocked: stats.servings >= 100 },
        { emoji:'🏆', label:'Power User',     desc:'50+ requests made',               unlocked: stats.total >= 50 },
        { emoji:'⚡', label:'Quick Claimer',  desc:'5 active orders at once',         unlocked: stats.active >= 5 },
        { emoji:'💯', label:'Century',        desc:'100 requests completed',          unlocked: stats.completed >= 100 },
        { emoji:'🌍', label:'Impact Rider',   desc:'1,000 servings received',         unlocked: stats.servings >= 1000 },
        { emoji:'🎯', label:'Consistent',     desc:'Requests every month',            unlocked: stats.completed >= 12 },
    ];
    const unlocked = achievements.filter(a => a.unlocked).length;

    const CSS = `
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@700;800&display=swap');
        @keyframes fadeUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes popIn   { from{opacity:0;transform:scale(0.85)} to{opacity:1;transform:scale(1)} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        @keyframes pulse   { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.4)} }
        @keyframes float   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes slideIn { from{opacity:0;transform:translateX(-10px)} to{opacity:1;transform:translateX(0)} }
        @keyframes glow    { 0%,100%{box-shadow:0 0 0 0 rgba(139,92,246,0)} 50%{box-shadow:0 0 0 8px rgba(139,92,246,0.15)} }
        * { box-sizing:border-box; margin:0; padding:0; }
        input,select,textarea { font-family:inherit; }
        .toggle { position:relative; width:44px; height:24px; border-radius:99px; border:none; cursor:pointer; transition:background 0.3s; }
        .toggle-dot { position:absolute; top:3px; width:18px; height:18px; border-radius:50%; background:#fff; box-shadow:0 1px 4px rgba(0,0,0,0.2); transition:left 0.3s cubic-bezier(0.34,1.56,0.64,1); }
        .action-btn:hover { transform:translateX(4px); background:#f8fafc !important; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-thumb { background:#e2e8f0; border-radius:99px; }
    `;

    if (loading) return (
        <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg,#f5f3ff,#eff6ff)', fontFamily:"'DM Sans',sans-serif" }}>
            <style>{CSS}</style>
            <div style={{ textAlign:'center' }}>
                <div style={{ width:48, height:48, borderRadius:'50%', border:'3px solid #ddd6fe', borderTopColor:'#8b5cf6', animation:'spin 0.8s linear infinite', margin:'0 auto 16px' }}/>
                <p style={{ color:'#64748b', fontWeight:600 }}>Loading profile…</p>
            </div>
        </div>
    );

    return (
        <div style={{ minHeight:'100vh', background:'linear-gradient(145deg,#f5f3ff 0%,#f8fafc 50%,#eff6ff 100%)', fontFamily:"'DM Sans',system-ui,sans-serif", paddingBottom:60 }}>
            <style>{CSS}</style>

            {/* ══ HEADER ══ */}
            <header style={{ position:'sticky', top:0, zIndex:50, background:scrolled?'rgba(255,255,255,0.96)':'rgba(255,255,255,0.8)', backdropFilter:'blur(20px)', borderBottom:`1px solid ${scrolled?'rgba(0,0,0,0.08)':'transparent'}`, boxShadow:scrolled?'0 2px 20px rgba(0,0,0,0.06)':'none', transition:'all 0.3s' }}>
                <div style={{ maxWidth:900, margin:'0 auto', padding:'0 24px', height:64, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                        <button onClick={()=>navigate('/recipient-dashboard')} style={{ width:36, height:36, borderRadius:10, border:'1px solid #e2e8f0', background:'#f8fafc', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', transition:'all 0.2s' }}
                            onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background='#f5f3ff';(e.currentTarget as HTMLElement).style.borderColor='#ddd6fe';}}
                            onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background='#f8fafc';(e.currentTarget as HTMLElement).style.borderColor='#e2e8f0';}}>
                            <ArrowLeft size={16} color="#64748b"/>
                        </button>
                        <div>
                            <h1 style={{ fontSize:'1rem', fontWeight:800, color:'#0f172a', fontFamily:"'Playfair Display',serif" }}>Recipient Profile</h1>
                            <p style={{ fontSize:'0.68rem', color:'#94a3b8' }}>Click any field to edit inline</p>
                        </div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        {saveMsg && (
                            <span style={{ fontSize:'0.75rem', fontWeight:700, color:'#6d28d9', background:'#f5f3ff', border:'1px solid #ddd6fe', borderRadius:99, padding:'5px 12px', animation:'popIn 0.3s ease', display:'flex', alignItems:'center', gap:5 }}>
                                <CheckCircle size={11} color="#6d28d9"/> {saveMsg}
                            </span>
                        )}
                        <button onClick={()=>{loadProfile();loadStats();}} style={{ width:36, height:36, borderRadius:10, border:'1px solid #e2e8f0', background:'#f8fafc', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                            <RefreshCw size={14} color="#64748b"/>
                        </button>
                        <button onClick={()=>navigate('/recipient-dashboard')} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 16px', borderRadius:11, background:'linear-gradient(135deg,#8b5cf6,#6d28d9)', border:'none', color:'#fff', fontWeight:700, fontSize:'0.8rem', cursor:'pointer', fontFamily:'inherit', boxShadow:'0 3px 12px rgba(139,92,246,0.35)' }}>
                            <ShoppingBag size={13}/> Browse Food
                        </button>
                        <button onClick={handleLogout} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:11, background:'#fef2f2', border:'1px solid #fecaca', color:'#dc2626', fontWeight:600, fontSize:'0.8rem', cursor:'pointer', fontFamily:'inherit' }}>
                            <LogOut size={13}/> Logout
                        </button>
                    </div>
                </div>
            </header>

            <div style={{ maxWidth:900, margin:'0 auto', padding:'32px 24px' }}>

                {/* ══ HERO CARD ══ */}
                <div style={{ borderRadius:28, overflow:'visible', boxShadow:'0 20px 60px rgba(0,0,0,0.1)', marginBottom:24, animation:'fadeUp 0.6s ease both' }}>
                    {/* Banner */}
                    <div style={{ height:140, overflow:'hidden', background:'linear-gradient(135deg,#2e1065,#4c1d95,#6d28d9,#8b5cf6)', position:'relative', overflow:'hidden' }}>
                        <div style={{ position:'absolute', top:-40, right:-40, width:240, height:240, borderRadius:'50%', background:'rgba(167,139,250,0.12)', filter:'blur(24px)', animation:'float 4s ease-in-out infinite' }}/>
                        <div style={{ position:'absolute', bottom:-30, left:'20%', width:180, height:180, borderRadius:'50%', background:'rgba(139,92,246,0.08)', filter:'blur(20px)', animation:'float 5s ease-in-out 1s infinite' }}/>
                        {/* Stats pills — top left */}
                        <div style={{ position:'absolute', top:16, left:24, display:'flex', gap:8 }}>
                            {[['📦',String(stats.total),'requests'],['✅',String(stats.completed),'received'],['👥',String(stats.servings),'servings']].map(([emoji,val,sub])=>(
                                <div key={sub} style={{ background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:12, padding:'7px 12px', backdropFilter:'blur(8px)' }}>
                                    <div style={{ fontSize:'0.78rem', fontWeight:700, color:'#fff' }}>{emoji} {val}</div>
                                    <div style={{ fontSize:'0.6rem', color:'rgba(255,255,255,0.5)', marginTop:1 }}>{sub}</div>
                                </div>
                            ))}
                        </div>
                        <div style={{ position:'absolute', top:18, right:22, animation:'float 3s ease-in-out infinite' }}>
                            <Heart size={36} color="rgba(255,255,255,0.1)"/>
                        </div>
                    </div>

                    {/* Profile info */}
                    <div style={{ background:'#fff', padding:'8px 32px 28px' }}>
                        <div style={{ display:'flex', alignItems:'flex-end', gap:20, marginTop:-48, marginBottom:20, flexWrap:'wrap', position:'relative', zIndex:2 }}>
                            {/* Avatar */}
                            <div style={{ position:'relative', flexShrink:0 }}
                                onMouseEnter={()=>setAvatarHov(true)}
                                onMouseLeave={()=>setAvatarHov(false)}>
                                <div onClick={()=>fileRef.current?.click()}
                                    style={{ width:96, height:96, borderRadius:26, background: avatarImg?'transparent':'linear-gradient(135deg,#8b5cf6,#3b82f6)', display:'flex', alignItems:'center', justifyContent:'center', border:'4px solid #fff', boxShadow:'0 8px 24px rgba(0,0,0,0.12)', cursor:'pointer', overflow:'hidden', position:'relative', transition:'all 0.2s', animation:avatarHov?'glow 1s ease infinite':'none' }}>
                                    {avatarImg
                                        ? <img src={avatarImg} alt="Avatar" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                                        : <span style={{ fontSize:'2.2rem', fontWeight:800, color:'#fff', fontFamily:"'Playfair Display',serif" }}>{initials}</span>
                                    }
                                    {avatarHov && (
                                        <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:4, animation:'popIn 0.15s ease' }}>
                                            <Upload size={18} color="#fff"/>
                                            <span style={{ fontSize:'0.6rem', color:'#fff', fontWeight:700 }}>Upload</span>
                                        </div>
                                    )}
                                </div>
                                <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display:'none' }}/>
                                <div style={{ position:'absolute', bottom:2, right:2, width:16, height:16, borderRadius:'50%', background:'#8b5cf6', border:'3px solid #fff', animation:'pulse 2s ease-in-out infinite' }}/>
                            </div>

                            <div style={{ flex:1, paddingBottom:4, paddingTop:54 }}>
                                <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap', marginBottom:4 }}>
                                    <h2 style={{ fontSize:'1.6rem', fontWeight:800, color:'#0f172a', fontFamily:"'Playfair Display',serif" }}>{profile.name}</h2>
                                    <span style={{ display:'flex', alignItems:'center', gap:5, padding:'3px 10px', borderRadius:99, background:'#f5f3ff', border:'1px solid #ddd6fe', fontSize:'0.7rem', fontWeight:700, color:'#6d28d9' }}>
                                        <div style={{ width:6, height:6, borderRadius:'50%', background:'#8b5cf6', animation:'pulse 2s ease-in-out infinite' }}/> Active Recipient
                                    </span>
                                    {stats.completed >= 10 && (
                                        <span style={{ display:'flex', alignItems:'center', gap:5, padding:'3px 10px', borderRadius:99, background:'#fef3c7', border:'1px solid #fde68a', fontSize:'0.7rem', fontWeight:700, color:'#92400e' }}>
                                            <Star size={10} color="#f59e0b" fill="#f59e0b"/> Power User
                                        </span>
                                    )}
                                </div>
                                <p style={{ fontSize:'0.85rem', color:'#64748b' }}>{profile.organization || 'Individual'} · Member since {joinYear}</p>
                                <p style={{ fontSize:'0.8rem', color:'#94a3b8', marginTop:2 }}>{profile.email}</p>
                            </div>

                            {/* Badges count */}
                            <div style={{ flexShrink:0, textAlign:'center', padding:'8px 16px', background:'linear-gradient(135deg,#f5f3ff,#eff6ff)', border:'1px solid #ddd6fe', borderRadius:16 }}>
                                <p style={{ fontSize:'1.6rem', fontWeight:800, color:'#0f172a', fontFamily:"'Playfair Display',serif", lineHeight:1 }}>{unlocked}<span style={{ fontSize:'0.85rem', color:'#94a3b8', fontWeight:600 }}>/{achievements.length}</span></p>
                                <p style={{ fontSize:'0.68rem', color:'#64748b', marginTop:3 }}>badges earned</p>
                            </div>
                        </div>

                        {/* TABS */}
                        <div style={{ display:'flex', gap:4, background:'#f8fafc', borderRadius:14, padding:4 }}>
                            {([
                                { key:'profile',      label:'Profile',  icon:User },
                                { key:'stats',        label:'Stats',    icon:Activity },
                                { key:'achievements', label:'Badges',   icon:Award },
                                { key:'settings',     label:'Settings', icon:Settings },
                            ] as const).map(({key,label,icon:Icon})=>(
                                <button key={key} onClick={()=>setActiveTab(key)}
                                    style={{ flex:1, padding:'10px 0', borderRadius:11, fontSize:'0.78rem', fontWeight:700, border:'none', cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:6, background:activeTab===key?'#fff':'transparent', color:activeTab===key?'#0f172a':'#94a3b8', boxShadow:activeTab===key?'0 2px 8px rgba(0,0,0,0.08)':'none', transition:'all 0.2s' }}>
                                    <Icon size={13}/> {label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ══ PROFILE TAB ══ */}
                {activeTab === 'profile' && (
                    <div style={{ display:'flex', flexDirection:'column', gap:16, animation:'fadeUp 0.4s ease both' }}>
                        <div style={{ background:'#fff', borderRadius:22, border:'1px solid #f1f5f9', boxShadow:'0 2px 14px rgba(0,0,0,0.04)', overflow:'hidden' }}>
                            <div style={{ padding:'18px 24px', borderBottom:'1px solid #f8fafc', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                                    <User size={15} color="#8b5cf6"/>
                                    <h3 style={{ fontSize:'0.9rem', fontWeight:700, color:'#0f172a' }}>Personal Information</h3>
                                </div>
                                <span style={{ fontSize:'0.72rem', color:'#94a3b8', background:'#f8fafc', border:'1px solid #f1f5f9', borderRadius:99, padding:'3px 10px' }}>Click any field to edit</span>
                            </div>
                            <div style={{ padding:'20px 24px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                                <InlineField label="Full Name"    value={form.name}         onChange={handleFieldChange('name')}         icon={User}     color="#8b5cf6"/>
                                <InlineField label="Email"        value={form.email}        onChange={handleFieldChange('email')}        icon={Mail}     color="#3b82f6" type="email"/>
                                <InlineField label="Phone"        value={form.phone}        onChange={handleFieldChange('phone')}        icon={Phone}    color="#22c55e" type="tel"/>
                                <InlineField label="Organization" value={form.organization} onChange={handleFieldChange('organization')} icon={Users}    color="#f97316"/>
                                <div style={{ gridColumn:'1 / -1' }}>
                                    <InlineField label="Address" value={form.address} onChange={handleFieldChange('address')} icon={MapPin} color="#ef4444"/>
                                </div>
                                <div style={{ gridColumn:'1 / -1', display:'flex', alignItems:'center', gap:12, padding:'14px 16px', borderRadius:16, background:'#f8fafc', border:'1px solid #f1f5f9' }}>
                                    <div style={{ width:36, height:36, borderRadius:11, background:'#f5f3ff', display:'flex', alignItems:'center', justifyContent:'center' }}>
                                        <Calendar size={15} color="#8b5cf6"/>
                                    </div>
                                    <div>
                                        <p style={{ fontSize:'0.68rem', fontWeight:700, color:'#94a3b8', letterSpacing:'0.05em', textTransform:'uppercase', marginBottom:2 }}>Member Since</p>
                                        <p style={{ fontSize:'0.875rem', fontWeight:600, color:'#0f172a' }}>{new Date(profile.createdAt).toLocaleDateString('en-IN',{year:'numeric',month:'long',day:'numeric'})}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ══ STATS TAB ══ */}
                {activeTab === 'stats' && (
                    <div style={{ display:'flex', flexDirection:'column', gap:16, animation:'fadeUp 0.4s ease both' }}>
                        <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:14 }}>
                            {[
                                { label:'Total Requests',    value:stats.total,     icon:Package,     gradient:'linear-gradient(135deg,#8b5cf6,#6d28d9)', sub:'All time requests',          goal:50 },
                                { label:'Successfully Received', value:stats.completed, icon:CheckCircle, gradient:'linear-gradient(135deg,#22c55e,#15803d)', sub:'Deliveries completed',       goal:30 },
                                { label:'Active Orders',     value:stats.active,    icon:Clock,       gradient:'linear-gradient(135deg,#f97316,#c2410c)', sub:'Currently in progress',      goal:5 },
                                { label:'Servings Received', value:stats.servings,  icon:Heart,       gradient:'linear-gradient(135deg,#3b82f6,#1d4ed8)', sub:'Total meals received',        goal:500 },
                            ].map(({label,value,icon:Icon,gradient,sub,goal},i)=>(
                                <div key={label}
                                    style={{ background:'#fff', borderRadius:22, border:'1px solid #f1f5f9', padding:'22px', boxShadow:'0 2px 14px rgba(0,0,0,0.04)', animation:`popIn 0.5s ease ${i*0.08}s both`, position:'relative', overflow:'hidden', cursor:'default', transition:'all 0.25s ease' }}
                                    onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.transform='translateY(-4px)';el.style.boxShadow='0 16px 40px rgba(0,0,0,0.1)';}}
                                    onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.transform='none';el.style.boxShadow='0 2px 14px rgba(0,0,0,0.04)';}}>
                                    <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:gradient }}/>
                                    <div style={{ position:'absolute', top:-24, right:-24, width:96, height:96, borderRadius:'50%', background:gradient, opacity:0.06, filter:'blur(12px)' }}/>
                                    <div style={{ width:42, height:42, borderRadius:13, background:gradient, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:14, boxShadow:'0 4px 14px rgba(0,0,0,0.15)' }}>
                                        <Icon size={19} color="#fff"/>
                                    </div>
                                    <p style={{ fontSize:'2.2rem', fontWeight:800, color:'#0f172a', fontFamily:"'Playfair Display',serif", lineHeight:1, marginBottom:6 }}><Counter to={value}/></p>
                                    <p style={{ fontSize:'0.82rem', fontWeight:600, color:'#334155', marginBottom:2 }}>{label}</p>
                                    <p style={{ fontSize:'0.7rem', color:'#94a3b8', marginBottom:12 }}>{sub}</p>
                                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
                                        <span style={{ fontSize:'0.65rem', color:'#94a3b8', fontWeight:600 }}>Goal: {goal}</span>
                                        <span style={{ fontSize:'0.65rem', color:'#64748b', fontWeight:700 }}>{Math.min(Math.round((value/goal)*100),100)}%</span>
                                    </div>
                                    <ProgressBar value={value} max={goal} color={gradient.includes('8b5cf6')?'#8b5cf6':gradient.includes('22c55e')?'#22c55e':gradient.includes('f97316')?'#f97316':'#3b82f6'} delay={i*80}/>
                                </div>
                            ))}
                        </div>

                        {/* Breakdown */}
                        <div style={{ background:'#fff', borderRadius:22, border:'1px solid #f1f5f9', boxShadow:'0 2px 14px rgba(0,0,0,0.04)', overflow:'hidden' }}>
                            <div style={{ padding:'18px 24px', borderBottom:'1px solid #f8fafc', display:'flex', alignItems:'center', gap:8 }}>
                                <Activity size={15} color="#8b5cf6"/>
                                <h3 style={{ fontSize:'0.9rem', fontWeight:700, color:'#0f172a' }}>Request Breakdown</h3>
                            </div>
                            <div style={{ padding:'20px 24px', display:'flex', flexDirection:'column', gap:14 }}>
                                {[
                                    { label:'Awaiting donor approval', value:stats.pending,   total:stats.total, color:'#f97316' },
                                    { label:'In progress (with volunteer)', value:stats.active, total:stats.total, color:'#8b5cf6' },
                                    { label:'Completed deliveries',     value:stats.completed, total:stats.total, color:'#22c55e' },
                                    { label:'Total servings received',   value:stats.servings,  total:Math.max(stats.servings,500), color:'#3b82f6' },
                                ].map(({label,value,total,color})=>(
                                    <div key={label}>
                                        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:7 }}>
                                            <span style={{ fontSize:'0.82rem', fontWeight:600, color:'#334155' }}>{label}</span>
                                            <span style={{ fontSize:'0.82rem', fontWeight:800, color:'#0f172a' }}>{value}</span>
                                        </div>
                                        <ProgressBar value={value} max={total} color={color}/>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Impact banner */}
                        <div style={{ background:'linear-gradient(135deg,#2e1065,#4c1d95,#6d28d9)', borderRadius:22, padding:'24px 28px', display:'flex', alignItems:'center', gap:20, boxShadow:'0 12px 36px rgba(109,40,217,0.25)' }}>
                            <div style={{ width:52, height:52, borderRadius:16, background:'rgba(255,255,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, animation:'float 3s ease-in-out infinite' }}>
                                <Heart size={26} color="#f9a8d4" fill="#f9a8d4"/>
                            </div>
                            <div style={{ flex:1 }}>
                                <p style={{ fontSize:'1rem', fontWeight:700, color:'#fff', marginBottom:4 }}>🌿 You're part of the solution!</p>
                                <p style={{ fontSize:'0.8rem', color:'rgba(255,255,255,0.55)', lineHeight:1.6 }}>
                                    {stats.completed > 0
                                        ? `${successRate}% success rate · ${stats.servings} servings of rescued food received!`
                                        : 'Browse available food to start your impact journey.'}
                                </p>
                            </div>
                            <button onClick={()=>navigate('/recipient-dashboard')} style={{ padding:'10px 18px', borderRadius:12, background:'rgba(255,255,255,0.12)', border:'1px solid rgba(255,255,255,0.2)', color:'#fff', fontWeight:600, fontSize:'0.8rem', cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:6, whiteSpace:'nowrap', transition:'all 0.2s' }}
                                onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.22)';}}
                                onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.12)';}}>
                                Browse Food <ChevronRight size={13}/>
                            </button>
                        </div>
                    </div>
                )}

                {/* ══ ACHIEVEMENTS TAB ══ */}
                {activeTab === 'achievements' && (
                    <div style={{ display:'flex', flexDirection:'column', gap:16, animation:'fadeUp 0.4s ease both' }}>
                        <div style={{ background:'linear-gradient(135deg,#f5f3ff,#eff6ff)', borderRadius:22, padding:'20px 24px', border:'1px solid #ddd6fe', display:'flex', alignItems:'center', gap:20 }}>
                            <div style={{ width:64, height:64, borderRadius:20, background:'linear-gradient(135deg,#8b5cf6,#6d28d9)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:'0 8px 24px rgba(139,92,246,0.35)' }}>
                                <Award size={30} color="#fff"/>
                            </div>
                            <div style={{ flex:1 }}>
                                <h3 style={{ fontSize:'1.1rem', fontWeight:800, color:'#0f172a', marginBottom:6 }}>{unlocked} of {achievements.length} badges earned</h3>
                                <ProgressBar value={unlocked} max={achievements.length} color="linear-gradient(90deg,#8b5cf6,#3b82f6)" delay={100}/>
                                <p style={{ fontSize:'0.75rem', color:'#64748b', marginTop:6 }}>{achievements.length - unlocked} more to unlock · Keep requesting to earn them all!</p>
                            </div>
                        </div>
                        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
                            {achievements.map((a,i) => <Badge key={a.label} {...a} delay={i*0.05}/>)}
                        </div>
                        {achievements.find(a=>!a.unlocked) && (
                            <div style={{ background:'#fff', borderRadius:22, border:'1px solid #f1f5f9', padding:'20px 24px', display:'flex', alignItems:'center', gap:16 }}>
                                <div style={{ width:48, height:48, borderRadius:14, background:'#f8fafc', border:'1.5px dashed #e2e8f0', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:'1.6rem', filter:'grayscale(1)', opacity:0.5 }}>
                                    {achievements.find(a=>!a.unlocked)?.emoji}
                                </div>
                                <div style={{ flex:1 }}>
                                    <p style={{ fontSize:'0.72rem', fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:4 }}>Next Badge</p>
                                    <p style={{ fontSize:'0.95rem', fontWeight:700, color:'#0f172a' }}>{achievements.find(a=>!a.unlocked)?.label}</p>
                                    <p style={{ fontSize:'0.78rem', color:'#64748b', marginTop:2 }}>{achievements.find(a=>!a.unlocked)?.desc}</p>
                                </div>
                                <Target size={20} color="#94a3b8"/>
                            </div>
                        )}
                    </div>
                )}

                {/* ══ SETTINGS TAB ══ */}
                {activeTab === 'settings' && (
                    <div style={{ display:'flex', flexDirection:'column', gap:16, animation:'fadeUp 0.4s ease both' }}>
                        <div style={{ background:'#fff', borderRadius:22, border:'1px solid #f1f5f9', boxShadow:'0 2px 14px rgba(0,0,0,0.04)', overflow:'hidden' }}>
                            <div style={{ padding:'18px 24px', borderBottom:'1px solid #f8fafc', display:'flex', alignItems:'center', gap:8 }}>
                                <Bell size={15} color="#8b5cf6"/>
                                <h3 style={{ fontSize:'0.9rem', fontWeight:700, color:'#0f172a' }}>Notifications</h3>
                            </div>
                            <div style={{ padding:'8px' }}>
                                {([
                                    { key:'newListings'   as NotifKey, title:'New Food Listings',    desc:'When food is posted near you',         icon:Package,    color:'#8b5cf6' },
                                    { key:'orderUpdates'  as NotifKey, title:'Order Status Updates', desc:'When your request status changes',     icon:Clock,      color:'#3b82f6' },
                                    { key:'weeklyDigest'  as NotifKey, title:'Weekly Digest',        desc:'Summary of food in your area',         icon:TrendingUp, color:'#22c55e' },
                                ] as const).map(({key,title,desc,icon:Icon,color},i)=>(
                                    <div key={key}
                                        style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 16px', borderRadius:14, transition:'background 0.2s', animation:`slideIn 0.3s ease ${i*0.07}s both`, cursor:'pointer' }}
                                        onClick={()=>toggleNotif(key)}
                                        onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background='#f8fafc';}}
                                        onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background='transparent';}}>
                                        <div style={{ width:38, height:38, borderRadius:11, background:`${color}15`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                                            <Icon size={16} color={color}/>
                                        </div>
                                        <div style={{ flex:1 }}>
                                            <p style={{ fontSize:'0.875rem', fontWeight:600, color:'#0f172a' }}>{title}</p>
                                            <p style={{ fontSize:'0.75rem', color:'#94a3b8', marginTop:1 }}>{desc}</p>
                                        </div>
                                        <button className="toggle" onClick={e=>{e.stopPropagation();toggleNotif(key);}} style={{ background:notifications[key]?'#8b5cf6':'#e2e8f0' }}>
                                            <div className="toggle-dot" style={{ left:notifications[key]?'23px':'3px' }}/>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div style={{ background:'#fff', borderRadius:22, border:'1px solid #f1f5f9', boxShadow:'0 2px 14px rgba(0,0,0,0.04)', overflow:'hidden' }}>
                            <div style={{ padding:'18px 24px', borderBottom:'1px solid #f8fafc', display:'flex', alignItems:'center', gap:8 }}>
                                <Settings size={15} color="#64748b"/>
                                <h3 style={{ fontSize:'0.9rem', fontWeight:700, color:'#0f172a' }}>Account</h3>
                            </div>
                            <div style={{ padding:'8px' }}>
                                {[
                                    { label:'Privacy & Security', icon:Shield,       color:'#3b82f6', onClick:()=>alert('Coming soon!') },
                                    { label:'Help & Support',     icon:HelpCircle,   color:'#22c55e', onClick:()=>alert('Coming soon!') },
                                    { label:'My Orders',          icon:Package,      color:'#8b5cf6', onClick:()=>navigate('/recipient-dashboard') },
                                    { label:'Send Feedback',      icon:Zap,          color:'#f97316', onClick:()=>alert('Coming soon!') },
                                ].map(({label,icon:Icon,color,onClick},i)=>(
                                    <button key={label} onClick={onClick} className="action-btn"
                                        style={{ width:'100%', display:'flex', alignItems:'center', gap:14, padding:'14px 16px', borderRadius:14, background:'transparent', border:'none', cursor:'pointer', fontFamily:'inherit', textAlign:'left', transition:'all 0.2s', animation:`slideIn 0.3s ease ${i*0.06}s both` }}>
                                        <div style={{ width:38, height:38, borderRadius:11, background:`${color}15`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                                            <Icon size={16} color={color}/>
                                        </div>
                                        <span style={{ flex:1, fontSize:'0.875rem', fontWeight:600, color:'#0f172a' }}>{label}</span>
                                        <ChevronRight size={14} color="#cbd5e1"/>
                                    </button>
                                ))}
                                <button onClick={handleLogout} className="action-btn"
                                    style={{ width:'100%', display:'flex', alignItems:'center', gap:14, padding:'14px 16px', borderRadius:14, background:'transparent', border:'none', cursor:'pointer', fontFamily:'inherit', textAlign:'left', transition:'all 0.2s', marginTop:4 }}>
                                    <div style={{ width:38, height:38, borderRadius:11, background:'#fef2f2', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                                        <LogOut size={16} color="#ef4444"/>
                                    </div>
                                    <span style={{ flex:1, fontSize:'0.875rem', fontWeight:600, color:'#ef4444' }}>Sign Out</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}