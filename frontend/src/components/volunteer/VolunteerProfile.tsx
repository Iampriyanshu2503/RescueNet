import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import api from '../../services/api';
import {
    ArrowLeft, User, Mail, Phone, MapPin, Edit3, Save, X,
    Calendar, Package, TrendingUp, LogOut, Bell, Shield,
    HelpCircle, Settings, CheckCircle, Camera, Star, Truck,
    ChevronRight, Clock, Heart, RefreshCw
} from 'lucide-react';

type NotifKey = 'newAssignments' | 'pickupReminders' | 'weeklyReport';

export default function VolunteerProfile() {
    const navigate = useNavigate();
    const [isEditing,   setIsEditing]   = useState(false);
    const [saving,      setSaving]      = useState(false);
    const [loading,     setLoading]     = useState(true);
    const [activeTab,   setActiveTab]   = useState<'profile' | 'stats' | 'settings'>('profile');
    const [scrolled,    setScrolled]    = useState(false);
    const [saveMsg,     setSaveMsg]     = useState('');
    const [notifications, setNotifications] = useState({ newAssignments:true, pickupReminders:true, weeklyReport:false });
    const [stats, setStats] = useState({ available:0, confirmed:0, reserved:0, completed:0, servings:0 });

    const [profile, setProfile] = useState({ name:'', email:'', phone:'', address:'', vehicle:'bicycle', createdAt:new Date().toISOString() });
    const [form,    setForm]    = useState({ ...profile });

    const VEHICLE_LABELS: Record<string,string> = {
        bicycle:'🚲 Bicycle', motorcycle:'🏍️ Motorcycle', car:'🚗 Car',
        van:'🚐 Van', walking:'🚶 Walking', other:'Other',
    };

    const loadProfile = useCallback(async () => {
        setLoading(true);
        try {
            const stored = authService.getStoredUser();
            const raw    = stored || await authService.getProfile();
            const p = {
                name:      (raw as any).name      || 'Volunteer',
                email:     (raw as any).email     || '',
                phone:     (raw as any).phone     || '',
                address:   (raw as any).address   || '',
                vehicle:   (raw as any).vehicle   || 'bicycle',
                createdAt: (raw as any).createdAt || new Date().toISOString(),
            };
            setProfile(p); setForm(p);
        } catch {} finally { setLoading(false); }
    }, []);

    const loadStats = useCallback(async () => {
        try {
            const res = await api.get('/food-donations/volunteer-feed');
            const arr = Array.isArray(res.data) ? res.data : [];
            const userId = (authService.getStoredUser() as any)?._id;
            setStats({
                available: arr.filter((d:any) => d.status === 'available').length,
                confirmed: arr.filter((d:any) => d.status === 'confirmed').length,
                reserved:  arr.filter((d:any) => d.status === 'reserved'  && d.volunteerId === userId).length,
                completed: arr.filter((d:any) => d.status === 'completed' && d.volunteerId === userId).length,
                servings:  arr.filter((d:any) => d.volunteerId === userId && d.status === 'completed').reduce((s:number,d:any) => s+(d.servings||0), 0),
            });
        } catch {}
    }, []);

    useEffect(() => { loadProfile(); loadStats(); }, [loadProfile, loadStats]);
    useEffect(() => { const fn = () => setScrolled(window.scrollY > 10); window.addEventListener('scroll', fn); return () => window.removeEventListener('scroll', fn); }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const token  = authService.getStoredToken();
            const stored = authService.getStoredUser();
            const userId = (stored as any)?._id;
            if (userId && token) {
                await fetch(`/api/users/${userId}`, { method:'PUT', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` }, body:JSON.stringify(form) });
            }
            if (stored) localStorage.setItem('user', JSON.stringify({ ...stored, ...form }));
            setProfile(form); setIsEditing(false);
            setSaveMsg('Profile saved!'); setTimeout(() => setSaveMsg(''), 3000);
        } catch { setSaveMsg('Saved locally.'); setTimeout(() => setSaveMsg(''), 3000); setProfile(form); setIsEditing(false); }
        finally { setSaving(false); }
    };

    const handleLogout = () => { authService.logout(); navigate('/login'); };
    const toggleNotif  = (k: NotifKey) => setNotifications(n => ({ ...n, [k]: !n[k] }));
    const initials     = profile.name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2) || 'V';
    const joinYear     = new Date(profile.createdAt).getFullYear();

    const CSS = `
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@700;800&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes popIn  { from{opacity:0;transform:scale(0.9)} to{opacity:1;transform:scale(1)} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        @keyframes float  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        * { box-sizing:border-box; margin:0; padding:0; }
        input,select { font-family:inherit; }
        .vi { width:100%; padding:11px 14px; border-radius:12px; border:1.5px solid #e2e8f0; background:#f8fafc; font-size:0.875rem; font-weight:500; color:#0f172a; transition:all 0.2s; outline:none; }
        .vi:focus { border-color:#f97316; background:#fff; box-shadow:0 0 0 3px rgba(249,115,22,0.12); }
        .tab-btn { border:none; cursor:pointer; font-family:inherit; transition:all 0.2s; }
        .sr:hover { background:#f8fafc; }
        .toggle { position:relative; width:44px; height:24px; border-radius:99px; border:none; cursor:pointer; transition:background 0.3s; }
        .toggle-dot { position:absolute; top:3px; width:18px; height:18px; border-radius:50%; background:#fff; box-shadow:0 1px 4px rgba(0,0,0,0.2); transition:left 0.3s; }
    `;

    if (loading) return (
        <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg,#fff7ed,#fffbeb)', fontFamily:'DM Sans,sans-serif' }}>
            <style>{CSS}</style>
            <div style={{ textAlign:'center' }}>
                <div style={{ width:48, height:48, borderRadius:'50%', border:'3px solid #fed7aa', borderTopColor:'#f97316', animation:'spin 0.8s linear infinite', margin:'0 auto 16px' }}/>
                <p style={{ color:'#64748b', fontWeight:600 }}>Loading profile…</p>
            </div>
        </div>
    );

    return (
        <div style={{ minHeight:'100vh', background:'linear-gradient(145deg,#fff7ed 0%,#f8fafc 50%,#fdf4ff 100%)', fontFamily:"'DM Sans',system-ui,sans-serif", paddingBottom:48 }}>
            <style>{CSS}</style>

            {/* HEADER */}
            <header style={{ position:'sticky', top:0, zIndex:50, background:scrolled?'rgba(255,255,255,0.96)':'rgba(255,255,255,0.8)', backdropFilter:'blur(20px)', borderBottom:`1px solid ${scrolled?'rgba(0,0,0,0.08)':'transparent'}`, boxShadow:scrolled?'0 2px 20px rgba(0,0,0,0.06)':'none', transition:'all 0.3s' }}>
                <div style={{ maxWidth:860, margin:'0 auto', padding:'0 24px', height:64, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                        <button onClick={() => navigate('/volunteer-dashboard')} style={{ width:36, height:36, borderRadius:10, border:'1px solid #e2e8f0', background:'#f8fafc', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}
                            onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background='#fff7ed';}}
                            onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background='#f8fafc';}}>
                            <ArrowLeft size={16} color="#64748b"/>
                        </button>
                        <div>
                            <h1 style={{ fontSize:'1rem', fontWeight:800, color:'#0f172a', fontFamily:"'Playfair Display',serif" }}>Volunteer Profile</h1>
                            <p style={{ fontSize:'0.68rem', color:'#94a3b8' }}>Manage your account</p>
                        </div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        {saveMsg && <span style={{ fontSize:'0.78rem', fontWeight:600, color:'#ea580c', background:'#fff7ed', border:'1px solid #fed7aa', borderRadius:99, padding:'4px 12px', animation:'popIn 0.3s ease' }}>{saveMsg}</span>}
                        <button onClick={() => loadStats()} style={{ width:32, height:32, borderRadius:9, border:'1px solid #e2e8f0', background:'#f8fafc', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                            <RefreshCw size={13} color="#64748b"/>
                        </button>
                        {isEditing ? (
                            <>
                                <button onClick={() => { setForm(profile); setIsEditing(false); }} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:11, background:'#f1f5f9', border:'1px solid #e2e8f0', color:'#64748b', fontWeight:600, fontSize:'0.8rem', cursor:'pointer', fontFamily:'inherit' }}>
                                    <X size={13}/> Cancel
                                </button>
                                <button onClick={handleSave} disabled={saving} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 16px', borderRadius:11, background:'linear-gradient(135deg,#f97316,#c2410c)', border:'none', color:'#fff', fontWeight:700, fontSize:'0.8rem', cursor:'pointer', fontFamily:'inherit', boxShadow:'0 3px 12px rgba(249,115,22,0.35)', opacity:saving?0.7:1 }}>
                                    {saving?<><div style={{ width:12, height:12, borderRadius:'50%', border:'2px solid rgba(255,255,255,0.4)', borderTopColor:'#fff', animation:'spin 0.7s linear infinite' }}/>Saving…</>:<><Save size={13}/>Save</>}
                                </button>
                            </>
                        ) : (
                            <button onClick={() => setIsEditing(true)} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 16px', borderRadius:11, background:'linear-gradient(135deg,#f97316,#c2410c)', border:'none', color:'#fff', fontWeight:700, fontSize:'0.8rem', cursor:'pointer', fontFamily:'inherit', boxShadow:'0 3px 12px rgba(249,115,22,0.35)' }}>
                                <Edit3 size={13}/> Edit Profile
                            </button>
                        )}
                        <button onClick={handleLogout} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:11, background:'#fef2f2', border:'1px solid #fecaca', color:'#dc2626', fontWeight:600, fontSize:'0.8rem', cursor:'pointer', fontFamily:'inherit' }}>
                            <LogOut size={13}/> Logout
                        </button>
                    </div>
                </div>
            </header>

            <div style={{ maxWidth:860, margin:'0 auto', padding:'32px 24px' }}>

                {/* HERO CARD */}
                <div style={{ borderRadius:28, overflow:'hidden', boxShadow:'0 20px 60px rgba(0,0,0,0.1)', marginBottom:24, animation:'fadeUp 0.6s ease both' }}>
                    <div style={{ height:120, background:'linear-gradient(135deg,#431407,#7c2d12,#c2410c,#f97316)', position:'relative', overflow:'hidden' }}>
                        <div style={{ position:'absolute', top:-30, right:-30, width:200, height:200, borderRadius:'50%', background:'rgba(251,146,60,0.2)', filter:'blur(20px)' }}/>
                        <div style={{ position:'absolute', top:20, right:30, animation:'float 3s ease-in-out infinite' }}>
                            <Truck size={32} color="rgba(255,255,255,0.12)"/>
                        </div>
                        {/* Stats pills in banner */}
                        <div style={{ position:'absolute', bottom:12, left:24, display:'flex', gap:8 }}>
                            {[['🚴', String(stats.reserved), 'active'], ['✅', String(stats.completed), 'done'], ['👥', String(stats.servings), 'fed']].map(([e,v,s]) => (
                                <div key={s} style={{ background:'rgba(255,255,255,0.12)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:10, padding:'5px 10px', backdropFilter:'blur(8px)' }}>
                                    <div style={{ fontSize:'0.78rem', fontWeight:700, color:'#fff' }}>{e} {v}</div>
                                    <div style={{ fontSize:'0.6rem', color:'rgba(255,255,255,0.5)' }}>{s}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div style={{ background:'#fff', padding:'0 32px 28px' }}>
                        <div style={{ display:'flex', alignItems:'flex-end', gap:20, marginTop:-40, marginBottom:24, flexWrap:'wrap' }}>
                            <div style={{ position:'relative', flexShrink:0 }}>
                                <div style={{ width:88, height:88, borderRadius:24, background:'linear-gradient(135deg,#f97316,#a855f7)', display:'flex', alignItems:'center', justifyContent:'center', border:'4px solid #fff', boxShadow:'0 8px 24px rgba(0,0,0,0.12)' }}>
                                    <span style={{ fontSize:'2rem', fontWeight:800, color:'#fff', fontFamily:"'Playfair Display',serif" }}>{initials}</span>
                                </div>
                                {isEditing && (
                                    <button style={{ position:'absolute', bottom:-4, right:-4, width:28, height:28, borderRadius:'50%', background:'linear-gradient(135deg,#f97316,#c2410c)', border:'2px solid #fff', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                                        <Camera size={12} color="#fff"/>
                                    </button>
                                )}
                            </div>
                            <div style={{ flex:1, paddingBottom:4 }}>
                                <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
                                    <h2 style={{ fontSize:'1.5rem', fontWeight:800, color:'#0f172a', fontFamily:"'Playfair Display',serif" }}>{profile.name}</h2>
                                    <span style={{ display:'flex', alignItems:'center', gap:5, padding:'3px 10px', borderRadius:99, background:'#fff7ed', border:'1px solid #fed7aa', fontSize:'0.7rem', fontWeight:700, color:'#ea580c' }}>
                                        <div style={{ width:6, height:6, borderRadius:'50%', background:'#f97316' }}/> Active Volunteer
                                    </span>
                                </div>
                                <p style={{ fontSize:'0.85rem', color:'#64748b', marginTop:3 }}>{VEHICLE_LABELS[profile.vehicle] || 'Volunteer'} · Member since {joinYear}</p>
                                <p style={{ fontSize:'0.8rem', color:'#94a3b8', marginTop:2 }}>{profile.email}</p>
                            </div>
                        </div>

                        {/* TABS */}
                        <div style={{ display:'flex', gap:4, background:'#f8fafc', borderRadius:14, padding:4 }}>
                            {(['profile','stats','settings'] as const).map(tab => (
                                <button key={tab} className="tab-btn" onClick={() => setActiveTab(tab)}
                                    style={{ flex:1, padding:'9px 0', borderRadius:11, fontSize:'0.8rem', fontWeight:700, textTransform:'capitalize', background:activeTab===tab?'#fff':'transparent', color:activeTab===tab?'#0f172a':'#94a3b8', boxShadow:activeTab===tab?'0 2px 8px rgba(0,0,0,0.08)':'none' }}>
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── PROFILE TAB ── */}
                {activeTab === 'profile' && (
                    <div style={{ animation:'fadeUp 0.4s ease both' }}>
                        <div style={{ background:'#fff', borderRadius:22, border:'1px solid #f1f5f9', boxShadow:'0 2px 14px rgba(0,0,0,0.04)', overflow:'hidden' }}>
                            <div style={{ padding:'18px 24px', borderBottom:'1px solid #f8fafc', display:'flex', alignItems:'center', gap:8 }}>
                                <User size={15} color="#f97316"/>
                                <h3 style={{ fontSize:'0.9rem', fontWeight:700, color:'#0f172a' }}>Personal Information</h3>
                            </div>
                            <div style={{ padding:'24px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                                {isEditing ? (
                                    <>
                                        {([
                                            { label:'Full Name',     key:'name'  as const, type:'text',  placeholder:'Your name' },
                                            { label:'Email Address', key:'email' as const, type:'email', placeholder:'your@email.com' },
                                            { label:'Phone Number',  key:'phone' as const, type:'tel',   placeholder:'+91 98765 43210' },
                                        ] as const).map(({ label, key, type, placeholder }) => (
                                            <div key={key}>
                                                <label style={{ fontSize:'0.72rem', fontWeight:700, color:'#64748b', letterSpacing:'0.05em', textTransform:'uppercase', display:'block', marginBottom:6 }}>{label}</label>
                                                <input className="vi" type={type} value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={placeholder}/>
                                            </div>
                                        ))}
                                        <div>
                                            <label style={{ fontSize:'0.72rem', fontWeight:700, color:'#64748b', letterSpacing:'0.05em', textTransform:'uppercase', display:'block', marginBottom:6 }}>Vehicle Type</label>
                                            <select className="vi" value={form.vehicle} onChange={e => setForm(f => ({ ...f, vehicle: e.target.value }))}>
                                                {Object.entries(VEHICLE_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                                            </select>
                                        </div>
                                        <div style={{ gridColumn:'1 / -1' }}>
                                            <label style={{ fontSize:'0.72rem', fontWeight:700, color:'#64748b', letterSpacing:'0.05em', textTransform:'uppercase', display:'block', marginBottom:6 }}>Address / Service Area</label>
                                            <input className="vi" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Your area or city"/>
                                        </div>
                                    </>
                                ) : (
                                    [
                                        { icon:User,     label:'Full Name',    value:profile.name    || '—' },
                                        { icon:Mail,     label:'Email',        value:profile.email   || '—' },
                                        { icon:Phone,    label:'Phone',        value:profile.phone   || 'Not added' },
                                        { icon:Truck,    label:'Vehicle',      value:VEHICLE_LABELS[profile.vehicle] || 'Not set' },
                                        { icon:MapPin,   label:'Service Area', value:profile.address || 'Not added',  full:true },
                                        { icon:Calendar, label:'Member Since', value:new Date(profile.createdAt).toLocaleDateString('en-IN', { year:'numeric', month:'long', day:'numeric' }), full:true },
                                    ].map(({ icon:Icon, label, value, full }) => (
                                        <div key={label} style={{ gridColumn:full?'1 / -1':undefined, display:'flex', alignItems:'flex-start', gap:12, padding:'12px 14px', borderRadius:14, background:'#f8fafc', border:'1px solid #f1f5f9' }}>
                                            <div style={{ width:34, height:34, borderRadius:10, background:'linear-gradient(135deg,#fff7ed,#ffedd5)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                                                <Icon size={15} color="#f97316"/>
                                            </div>
                                            <div>
                                                <p style={{ fontSize:'0.68rem', fontWeight:700, color:'#94a3b8', letterSpacing:'0.05em', textTransform:'uppercase', marginBottom:3 }}>{label}</p>
                                                <p style={{ fontSize:'0.875rem', fontWeight:600, color:'#0f172a' }}>{value}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── STATS TAB ── */}
                {activeTab === 'stats' && (
                    <div style={{ display:'flex', flexDirection:'column', gap:16, animation:'fadeUp 0.4s ease both' }}>
                        <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:14 }}>
                            {[
                                { label:'Ready to Pick Up', value:stats.confirmed, gradient:'linear-gradient(135deg,#f59e0b,#d97706)', icon:Package,     sub:'Donor confirmed — needs volunteer' },
                                { label:'My Active',        value:stats.reserved,  gradient:'linear-gradient(135deg,#f97316,#c2410c)', icon:Truck,       sub:'Currently assigned to you' },
                                { label:'Completed',        value:stats.completed, gradient:'linear-gradient(135deg,#22c55e,#15803d)', icon:CheckCircle, sub:'Successfully delivered by you' },
                                { label:'People Fed',       value:stats.servings,  gradient:'linear-gradient(135deg,#a855f7,#6d28d9)', icon:Heart,       sub:'Total servings you delivered' },
                            ].map(({ label, value, gradient, icon:Icon, sub }, i) => (
                                <div key={label} style={{ background:'#fff', borderRadius:20, border:'1px solid #f1f5f9', padding:'22px', boxShadow:'0 2px 14px rgba(0,0,0,0.04)', animation:`fadeUp 0.4s ease ${i*0.08}s both`, position:'relative', overflow:'hidden', cursor:'default', transition:'all 0.25s ease' }}
                                    onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.transform='translateY(-3px)';(e.currentTarget as HTMLElement).style.boxShadow='0 12px 32px rgba(0,0,0,0.1)';}}
                                    onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.transform='none';(e.currentTarget as HTMLElement).style.boxShadow='0 2px 14px rgba(0,0,0,0.04)';}}>
                                    <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:gradient }}/>
                                    <div style={{ position:'absolute', top:-20, right:-20, width:80, height:80, borderRadius:'50%', background:gradient, opacity:0.08, filter:'blur(10px)' }}/>
                                    <div style={{ width:40, height:40, borderRadius:12, background:gradient, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:14, boxShadow:'0 4px 12px rgba(0,0,0,0.15)' }}>
                                        <Icon size={18} color="#fff"/>
                                    </div>
                                    <p style={{ fontSize:'2rem', fontWeight:800, color:'#0f172a', fontFamily:"'Playfair Display',serif", lineHeight:1 }}>{value}</p>
                                    <p style={{ fontSize:'0.82rem', fontWeight:600, color:'#334155', marginTop:6, marginBottom:2 }}>{label}</p>
                                    <p style={{ fontSize:'0.7rem', color:'#94a3b8' }}>{sub}</p>
                                </div>
                            ))}
                        </div>
                        <div style={{ background:'linear-gradient(135deg,#431407,#7c2d12,#c2410c)', borderRadius:22, padding:'24px 28px', display:'flex', alignItems:'center', gap:20, boxShadow:'0 12px 36px rgba(194,65,12,0.25)' }}>
                            <div style={{ width:52, height:52, borderRadius:16, background:'rgba(255,255,255,0.12)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                                <Star size={26} color="#fbbf24" fill="#fbbf24"/>
                            </div>
                            <div style={{ flex:1 }}>
                                <p style={{ fontSize:'1rem', fontWeight:700, color:'#fff', marginBottom:4 }}>🚴 You're making a real impact!</p>
                                <p style={{ fontSize:'0.8rem', color:'rgba(255,255,255,0.55)' }}>Every delivery bridges the gap between surplus and hunger. Thank you!</p>
                            </div>
                            <button onClick={() => navigate('/volunteer-dashboard')} style={{ padding:'10px 18px', borderRadius:12, background:'rgba(255,255,255,0.12)', border:'1px solid rgba(255,255,255,0.2)', color:'#fff', fontWeight:600, fontSize:'0.8rem', cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:6, whiteSpace:'nowrap', transition:'all 0.2s' }}
                                onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.22)';}}
                                onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.12)';}}>
                                View Deliveries <ChevronRight size={13}/>
                            </button>
                        </div>
                    </div>
                )}

                {/* ── SETTINGS TAB ── */}
                {activeTab === 'settings' && (
                    <div style={{ display:'flex', flexDirection:'column', gap:16, animation:'fadeUp 0.4s ease both' }}>
                        <div style={{ background:'#fff', borderRadius:22, border:'1px solid #f1f5f9', boxShadow:'0 2px 14px rgba(0,0,0,0.04)', overflow:'hidden' }}>
                            <div style={{ padding:'18px 24px', borderBottom:'1px solid #f8fafc', display:'flex', alignItems:'center', gap:8 }}>
                                <Bell size={15} color="#f97316"/>
                                <h3 style={{ fontSize:'0.9rem', fontWeight:700, color:'#0f172a' }}>Notifications</h3>
                            </div>
                            <div style={{ padding:'8px' }}>
                                {([
                                    { key:'newAssignments'  as NotifKey, title:'New Pickup Assignments', desc:'When a new food pickup is available',     icon:Package,    color:'#f97316' },
                                    { key:'pickupReminders' as NotifKey, title:'Pickup Reminders',       desc:'Reminders before pickup expiry',          icon:Clock,      color:'#3b82f6' },
                                    { key:'weeklyReport'    as NotifKey, title:'Weekly Impact Report',   desc:'Your delivery summary every week',        icon:TrendingUp, color:'#a855f7' },
                                ] as const).map(({ key, title, desc, icon:Icon, color }) => (
                                    <div key={key} className="sr" style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 16px', borderRadius:14, transition:'background 0.2s' }}>
                                        <div style={{ width:38, height:38, borderRadius:11, background:`${color}18`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                                            <Icon size={16} color={color}/>
                                        </div>
                                        <div style={{ flex:1 }}>
                                            <p style={{ fontSize:'0.875rem', fontWeight:600, color:'#0f172a' }}>{title}</p>
                                            <p style={{ fontSize:'0.75rem', color:'#94a3b8', marginTop:1 }}>{desc}</p>
                                        </div>
                                        <button className="toggle" onClick={() => toggleNotif(key)} style={{ background:notifications[key]?'#f97316':'#e2e8f0' }}>
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
                                    { label:'Privacy & Security', icon:Shield,    color:'#3b82f6', onClick:() => alert('Coming soon!') },
                                    { label:'Help & Support',     icon:HelpCircle, color:'#22c55e', onClick:() => alert('Coming soon!') },
                                    { label:'My Deliveries',      icon:Truck,      color:'#f97316', onClick:() => navigate('/volunteer-dashboard') },
                                ].map(({ label, icon:Icon, color, onClick }) => (
                                    <button key={label} onClick={onClick} className="sr" style={{ width:'100%', display:'flex', alignItems:'center', gap:14, padding:'14px 16px', borderRadius:14, background:'transparent', border:'none', cursor:'pointer', fontFamily:'inherit', textAlign:'left' }}>
                                        <div style={{ width:38, height:38, borderRadius:11, background:`${color}15`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                                            <Icon size={16} color={color}/>
                                        </div>
                                        <span style={{ flex:1, fontSize:'0.875rem', fontWeight:600, color:'#0f172a' }}>{label}</span>
                                        <ChevronRight size={14} color="#cbd5e1"/>
                                    </button>
                                ))}
                                <button onClick={handleLogout} className="sr" style={{ width:'100%', display:'flex', alignItems:'center', gap:14, padding:'14px 16px', borderRadius:14, background:'transparent', border:'none', cursor:'pointer', fontFamily:'inherit', textAlign:'left' }}>
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