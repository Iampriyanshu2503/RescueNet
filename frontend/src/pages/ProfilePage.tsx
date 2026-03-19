import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import authService from '../services/authService';
import {
    ArrowLeft, User, Mail, Phone, MapPin, Edit3, Save, X,
    Heart, Bell, Shield, HelpCircle, Settings, LogOut,
    FileText, TrendingUp, Plus, Check, Camera, ChevronRight, Award
} from 'lucide-react';

type NotifKey = 'newDonations' | 'requestUpdates' | 'locationBased';

export default function ProfilePage() {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [showAddPref, setShowAddPref] = useState(false);
    const [newPref, setNewPref] = useState('');
    const [prefType, setPrefType] = useState<'foodTypes' | 'dietaryRestrictions'>('foodTypes');
    const [notifications, setNotifications] = useState<Record<NotifKey, boolean>>({ newDonations: true, requestUpdates: true, locationBased: true });

    const [profile, setProfile] = useState({ name: '', email: '', phone: '', location: '', createdAt: new Date().toISOString() });
    const [form, setForm] = useState({ ...profile });
    const [prefs, setPrefs] = useState({ foodTypes: ['Fresh Produce', 'Cooked Meals'], dietaryRestrictions: ['Vegetarian'] });
    const [stats] = useState({ totalRequests: 23, successfulPickups: 21, successRate: 91 });

    const loadProfile = useCallback(async () => {
        setLoading(true);
        try {
            const stored = authService.getStoredUser();
            const raw = stored || await authService.getProfile();
            const p = {
                name: (raw as any).name || 'Recipient',
                email: (raw as any).email || '',
                phone: (raw as any).phone || '',
                location: (raw as any).address || (raw as any).location || '',
                createdAt: (raw as any).createdAt || new Date().toISOString(),
            };
            setProfile(p); setForm(p);
        } catch { /* keep defaults */ } finally { setLoading(false); }
    }, []);

    useEffect(() => { loadProfile(); }, [loadProfile]);
    useEffect(() => { const fn = () => setScrolled(window.scrollY > 10); window.addEventListener('scroll', fn); return () => window.removeEventListener('scroll', fn); }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const token = authService.getStoredToken();
            const stored = authService.getStoredUser();
            const userId = (stored as any)?._id;
            if (userId && token) {
                await fetch(`/api/users/${userId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify(form),
                });
            }
            if (stored) localStorage.setItem('user', JSON.stringify({ ...stored, ...form }));
            setProfile(form); setIsEditing(false);
            toast.success('Profile updated!');
        } catch { toast.success('Saved locally!'); setProfile(form); setIsEditing(false); }
        finally { setSaving(false); }
    };

    const handleLogout = () => { authService.logout(); toast.success('Signed out'); navigate('/login'); };
    const toggleNotif = (k: NotifKey) => { setNotifications(n => ({ ...n, [k]: !n[k] })); toast.success(`Notification ${notifications[k] ? 'disabled' : 'enabled'}`); };
    const removePref = (type: 'foodTypes' | 'dietaryRestrictions', item: string) => { setPrefs(p => ({ ...p, [type]: p[type].filter(x => x !== item) })); toast.success(`Removed ${item}`); };
    const addPref = () => { if (!newPref.trim()) return; setPrefs(p => ({ ...p, [prefType]: [...p[prefType], newPref.trim()] })); toast.success(`Added ${newPref}`); setNewPref(''); setShowAddPref(false); };

    const initials = profile.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'R';

    const CSS = `
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@700;800&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes popIn  { from{opacity:0;transform:scale(0.9)} to{opacity:1;transform:scale(1)} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        @keyframes float  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        * { box-sizing:border-box; margin:0; padding:0; }
        input { font-family:inherit; }
        .ri { width:100%; padding:11px 14px; border-radius:12px; border:1.5px solid #e2e8f0; background:#f8fafc; font-size:0.875rem; font-weight:500; color:#0f172a; transition:all 0.2s; outline:none; }
        .ri:focus { border-color:#8b5cf6; background:#fff; box-shadow:0 0 0 3px rgba(139,92,246,0.12); }
        .sr:hover { background:#f8fafc; }
        .toggle { position:relative; width:44px; height:24px; border-radius:99px; border:none; cursor:pointer; transition:background 0.3s; }
        .toggle-dot { position:absolute; top:3px; width:18px; height:18px; border-radius:50%; background:#fff; box-shadow:0 1px 4px rgba(0,0,0,0.2); transition:left 0.3s; }
        .pill { display:inline-flex; align-items:center; gap:6px; padding:6px 12px; border-radius:99px; font-size:0.78rem; font-weight:600; cursor:default; }
        .pill-remove { background:none; border:none; cursor:pointer; opacity:0; transition:opacity 0.2s; display:flex; align-items:center; padding:0; }
        .pill:hover .pill-remove { opacity:1; }
    `;

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#f5f3ff,#ede9fe)', fontFamily: 'DM Sans,sans-serif' }}>
            <style>{CSS}</style>
            <div style={{ textAlign: 'center' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid #ddd6fe', borderTopColor: '#8b5cf6', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
                <p style={{ color: '#64748b', fontWeight: 600 }}>Loading profile…</p>
            </div>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(145deg,#f5f3ff 0%,#f8fafc 50%,#fdf2f8 100%)', fontFamily: "'DM Sans',system-ui,sans-serif", paddingBottom: 48 }}>
            <style>{CSS}</style>

            {/* HEADER */}
            <header style={{ position: 'sticky', top: 0, zIndex: 50, background: scrolled ? 'rgba(255,255,255,0.96)' : 'rgba(255,255,255,0.8)', backdropFilter: 'blur(20px)', borderBottom: `1px solid ${scrolled ? 'rgba(0,0,0,0.08)' : 'transparent'}`, boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.06)' : 'none', transition: 'all 0.3s' }}>
                <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <button onClick={() => navigate(-1)} style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background='#f5f3ff'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background='#f8fafc'; }}>
                            <ArrowLeft size={16} color="#64748b" />
                        </button>
                        <div>
                            <h1 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', fontFamily: "'Playfair Display',serif" }}>My Profile</h1>
                            <p style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Manage your account</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {isEditing ? (
                            <>
                                <button onClick={() => { setForm(profile); setIsEditing(false); }} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 11, background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#64748b', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit' }}><X size={13} />Cancel</button>
                                <button onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 11, background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', border: 'none', color: '#fff', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 3px 12px rgba(139,92,246,0.35)', opacity: saving ? 0.7 : 1 }}>
                                    {saving ? <><div style={{ width: 12, height: 12, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', animation: 'spin 0.7s linear infinite' }} />Saving…</> : <><Save size={13} />Save</>}
                                </button>
                            </>
                        ) : (
                            <button onClick={() => setIsEditing(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 11, background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', border: 'none', color: '#fff', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 3px 12px rgba(139,92,246,0.35)' }}>
                                <Edit3 size={13} />Edit
                            </button>
                        )}
                        <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 11, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit' }}><LogOut size={13} />Logout</button>
                    </div>
                </div>
            </header>

            <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

                {/* HERO */}
                <div style={{ borderRadius: 28, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.1)', animation: 'fadeUp 0.6s ease both' }}>
                    <div style={{ height: 100, background: 'linear-gradient(135deg,#2e1065,#4c1d95,#6d28d9,#8b5cf6)', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: -30, right: -30, width: 180, height: 180, borderRadius: '50%', background: 'rgba(167,139,250,0.2)', filter: 'blur(20px)' }} />
                    </div>
                    <div style={{ background: '#fff', padding: '0 28px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 18, marginTop: -36, marginBottom: 20 }}>
                            <div style={{ position: 'relative' }}>
                                <div style={{ width: 80, height: 80, borderRadius: 22, background: 'linear-gradient(135deg,#8b5cf6,#ec4899)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '4px solid #fff', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
                                    <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', fontFamily: "'Playfair Display',serif" }}>{initials}</span>
                                </div>
                                {isEditing && <button style={{ position: 'absolute', bottom: -4, right: -4, width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Camera size={11} color="#fff" /></button>}
                            </div>
                            <div style={{ paddingBottom: 4 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', fontFamily: "'Playfair Display',serif" }}>{profile.name}</h2>
                                    <span style={{ padding: '2px 10px', borderRadius: 99, background: '#f5f3ff', border: '1px solid #ddd6fe', fontSize: '0.7rem', fontWeight: 700, color: '#7c3aed' }}>Recipient</span>
                                </div>
                                <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 2 }}>{profile.email}</p>
                            </div>
                        </div>

                        {/* Stats row */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 16 }}>
                            {[
                                { label: 'Requests', value: stats.totalRequests, color: '#8b5cf6', bg: '#f5f3ff' },
                                { label: 'Pickups', value: stats.successfulPickups, color: '#22c55e', bg: '#f0fdf4' },
                                { label: 'Success Rate', value: `${stats.successRate}%`, color: '#f97316', bg: '#fff7ed' },
                            ].map(({ label, value, color, bg }) => (
                                <div key={label} style={{ textAlign: 'center', background: bg, borderRadius: 14, padding: '12px 8px' }}>
                                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color, fontFamily: "'Playfair Display',serif" }}>{value}</div>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b', marginTop: 2 }}>{label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* EDIT / VIEW INFO */}
                <div style={{ background: '#fff', borderRadius: 22, border: '1px solid #f1f5f9', boxShadow: '0 2px 14px rgba(0,0,0,0.04)', overflow: 'hidden', animation: 'fadeUp 0.5s ease 0.1s both', opacity: 0 }}>
                    <div style={{ padding: '16px 22px', borderBottom: '1px solid #f8fafc', display: 'flex', alignItems: 'center', gap: 8 }}><User size={14} color="#8b5cf6" /><h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>Personal Information</h3></div>
                    <div style={{ padding: '20px 22px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                        {isEditing ? (
                            <>
                                {[{ key: 'name', label: 'Full Name', type: 'text', placeholder: 'Your name' }, { key: 'email', label: 'Email', type: 'email', placeholder: 'your@email.com' }, { key: 'phone', label: 'Phone', type: 'tel', placeholder: '+91 98765 43210' }, { key: 'location', label: 'Location', type: 'text', placeholder: 'Your area' }].map(({ key, label, type, placeholder }) => (
                                    <div key={key}>
                                        <label style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 5 }}>{label}</label>
                                        <input className="ri" type={type} value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={placeholder} />
                                    </div>
                                ))}
                            </>
                        ) : (
                            [
                                { icon: User, label: 'Name', value: profile.name || '—' },
                                { icon: Mail, label: 'Email', value: profile.email || '—' },
                                { icon: Phone, label: 'Phone', value: profile.phone || 'Not added' },
                                { icon: MapPin, label: 'Location', value: profile.location || 'Not added' },
                            ].map(({ icon: Icon, label, value }) => (
                                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12, background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                                    <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg,#f5f3ff,#ede9fe)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Icon size={13} color="#8b5cf6" />
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '0.66rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 2 }}>{label}</p>
                                        <p style={{ fontSize: '0.84rem', fontWeight: 600, color: '#0f172a' }}>{value}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* FOOD PREFERENCES */}
                <div style={{ background: '#fff', borderRadius: 22, border: '1px solid #f1f5f9', boxShadow: '0 2px 14px rgba(0,0,0,0.04)', overflow: 'hidden', animation: 'fadeUp 0.5s ease 0.18s both', opacity: 0 }}>
                    <div style={{ padding: '16px 22px', borderBottom: '1px solid #f8fafc', display: 'flex', alignItems: 'center', gap: 8 }}><Heart size={14} color="#ec4899" /><h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>Food Preferences</h3></div>
                    <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 18 }}>
                        {(['foodTypes', 'dietaryRestrictions'] as const).map(type => (
                            <div key={type}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                                    <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a' }}>{type === 'foodTypes' ? 'Preferred Food Types' : 'Dietary Restrictions'}</p>
                                    <button onClick={() => { setPrefType(type); setShowAddPref(!showAddPref); }} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', fontWeight: 600, color: '#8b5cf6', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}><Plus size={13} />Add</button>
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                    {prefs[type].map(item => (
                                        <span key={item} className="pill" style={{ background: type === 'foodTypes' ? '#f0fdf4' : '#fff7ed', color: type === 'foodTypes' ? '#15803d' : '#c2410c', border: `1px solid ${type === 'foodTypes' ? '#bbf7d0' : '#fed7aa'}` }}>
                                            {item}
                                            <button className="pill-remove" onClick={() => removePref(type, item)}>
                                                <X size={12} color={type === 'foodTypes' ? '#15803d' : '#c2410c'} />
                                            </button>
                                        </span>
                                    ))}
                                    {prefs[type].length === 0 && <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>None added yet</p>}
                                </div>
                            </div>
                        ))}
                        {showAddPref && (
                            <div style={{ background: '#f8fafc', borderRadius: 14, padding: '14px', border: '1px solid #e2e8f0', animation: 'popIn 0.2s ease', display: 'flex', gap: 8 }}>
                                <input className="ri" value={newPref} onChange={e => setNewPref(e.target.value)} placeholder={`Add ${prefType === 'foodTypes' ? 'food type' : 'restriction'}…`} onKeyDown={e => e.key === 'Enter' && addPref()} style={{ flex: 1 }} />
                                <button onClick={addPref} style={{ padding: '8px 14px', borderRadius: 10, background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', border: 'none', color: '#fff', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5 }}><Check size={13} />Add</button>
                                <button onClick={() => setShowAddPref(false)} style={{ padding: '8px', borderRadius: 10, background: '#f1f5f9', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><X size={14} color="#64748b" /></button>
                            </div>
                        )}
                    </div>
                </div>

                {/* NOTIFICATIONS */}
                <div style={{ background: '#fff', borderRadius: 22, border: '1px solid #f1f5f9', boxShadow: '0 2px 14px rgba(0,0,0,0.04)', overflow: 'hidden', animation: 'fadeUp 0.5s ease 0.24s both', opacity: 0 }}>
                    <div style={{ padding: '16px 22px', borderBottom: '1px solid #f8fafc', display: 'flex', alignItems: 'center', gap: 8 }}><Bell size={14} color="#3b82f6" /><h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>Notifications</h3></div>
                    <div style={{ padding: '8px' }}>
                        {([
                            { key: 'newDonations' as NotifKey, title: 'New Donations Nearby', desc: 'Get alerted when food is listed near you', color: '#8b5cf6' },
                            { key: 'requestUpdates' as NotifKey, title: 'Request Updates', desc: 'Status changes on your requests', color: '#22c55e' },
                            { key: 'locationBased' as NotifKey, title: 'Location Based', desc: 'Donations within your pickup radius', color: '#f97316' },
                        ]).map(({ key, title, desc, color }) => (
                            <div key={key} className="sr" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', borderRadius: 12, transition: 'background 0.2s' }}>
                                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <Bell size={14} color={color} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontSize: '0.84rem', fontWeight: 600, color: '#0f172a' }}>{title}</p>
                                    <p style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{desc}</p>
                                </div>
                                <button className="toggle" onClick={() => toggleNotif(key)} style={{ background: notifications[key] ? '#8b5cf6' : '#e2e8f0', flexShrink: 0 }}>
                                    <div className="toggle-dot" style={{ left: notifications[key] ? '23px' : '3px' }} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ACCOUNT */}
                <div style={{ background: '#fff', borderRadius: 22, border: '1px solid #f1f5f9', boxShadow: '0 2px 14px rgba(0,0,0,0.04)', overflow: 'hidden', animation: 'fadeUp 0.5s ease 0.3s both', opacity: 0 }}>
                    <div style={{ padding: '16px 22px', borderBottom: '1px solid #f8fafc', display: 'flex', alignItems: 'center', gap: 8 }}><Settings size={14} color="#64748b" /><h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>Account</h3></div>
                    <div style={{ padding: '8px' }}>
                        {[
                            { label: 'Privacy & Security', icon: Shield, color: '#3b82f6', onClick: () => toast('Privacy settings — coming soon!') },
                            { label: 'Help & Support', icon: HelpCircle, color: '#22c55e', onClick: () => toast('Support — coming soon!') },
                            { label: 'My Requests', icon: FileText, color: '#8b5cf6', onClick: () => navigate('/recipient-dashboard') },
                        ].map(({ label, icon: Icon, color, onClick }) => (
                            <button key={label} onClick={onClick} className="sr" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', borderRadius: 12, background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'background 0.2s' }}>
                                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={14} color={color} /></div>
                                <span style={{ flex: 1, fontSize: '0.84rem', fontWeight: 600, color: '#0f172a' }}>{label}</span>
                                <ChevronRight size={14} color="#cbd5e1" />
                            </button>
                        ))}
                        <button onClick={handleLogout} className="sr" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', borderRadius: 12, background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'background 0.2s' }}>
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><LogOut size={14} color="#ef4444" /></div>
                            <span style={{ flex: 1, fontSize: '0.84rem', fontWeight: 600, color: '#ef4444' }}>Sign Out</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}