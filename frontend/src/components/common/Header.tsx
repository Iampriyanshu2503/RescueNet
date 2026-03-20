import React, { useState, useEffect, useRef } from 'react';
import { Bell, Search, Menu, X, User, MapPin, Gift, LogOut, Navigation, Truck, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { logout } from '../../store/authSlice';
import { getDashboardRoute } from '../../utils/routeUtils';
import { showNotification } from '../../utils/notificationUtils';

interface NotificationItem {
    id: string; message: string; timeAgo: string; type: 'donation' | 'request' | 'report'; read?: boolean;
}

/* Role → profile route */
const PROFILE_ROUTE: Record<string, string> = {
    donor:     '/donor-profile',
    recipient: '/recipient-profile',
    volunteer: '/volunteer-profile',
};

/* Role → accent colour */
const ROLE_COLOR: Record<string, { bg: string; hover: string }> = {
    donor:     { bg: '#22c55e', hover: '#16a34a' },
    recipient: { bg: '#8b5cf6', hover: '#7c3aed' },
    volunteer: { bg: '#f97316', hover: '#ea580c' },
};

const Header = () => {
    const navigate  = useNavigate();
    const dispatch  = useDispatch();
    const { user }  = useSelector((state: RootState) => state.auth);

    const [isMenuOpen,          setIsMenuOpen]          = useState(false);
    const [isNotificationOpen,  setIsNotificationOpen]  = useState(false);
    const [searchQuery,         setSearchQuery]         = useState('');
    const [showLocationSearch,  setShowLocationSearch]  = useState(false);
    const [userLocation,        setUserLocation]        = useState<{lat:number,lng:number}|null>(null);
    const [locationSuggestions, setLocationSuggestions] = useState<Array<{id:string,address:string,coordinates:[number,number]}>>([]);
    const [profileHov,          setProfileHov]          = useState(false);
    const [logoutHov,           setLogoutHov]           = useState(false);
    const [notifications,       setNotifications]       = useState<NotificationItem[]>([]);
    const [notifsLoaded,        setNotifsLoaded]        = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    const roleColor = ROLE_COLOR[user?.role || 'donor'] || ROLE_COLOR.donor;

    /* ── Fetch real notifications ── */
    useEffect(() => {
        if (!user || notifsLoaded) return;
        const fetchNotifs = async () => {
            try {
                const items: NotificationItem[] = [];
                const timeAgo = (d: string) => {
                    const diff = Date.now() - new Date(d).getTime();
                    const m = Math.floor(diff / 60000);
                    if (m < 1)  return 'just now';
                    if (m < 60) return `${m}m ago`;
                    const h = Math.floor(m / 60);
                    if (h < 24) return `${h}h ago`;
                    return `${Math.floor(h/24)}d ago`;
                };

                if (user.role === 'donor') {
                    const res = await fetch('/api/food-donations/my-donations', {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                    });
                    const data = await res.json();
                    if (Array.isArray(data)) {
                        data.filter((d: any) => d.status === 'requested').slice(0, 5).forEach((d: any) => {
                            items.push({ id: d._id, message: `New request for "${d.foodType}"`, timeAgo: timeAgo(d.requestedAt || d.updatedAt), type: 'request' });
                        });
                        data.filter((d: any) => d.status === 'completed').slice(0, 3).forEach((d: any) => {
                            items.push({ id: d._id + '_c', message: `"${d.foodType}" was picked up successfully`, timeAgo: timeAgo(d.completedAt || d.updatedAt), type: 'donation' });
                        });
                    }
                } else if (user.role === 'recipient') {
                    const res = await fetch('/api/food-donations/my-requests', {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                    });
                    const data = await res.json();
                    if (Array.isArray(data)) {
                        data.filter((d: any) => d.status === 'confirmed').slice(0, 3).forEach((d: any) => {
                            items.push({ id: d._id, message: `Donor confirmed your request for "${d.foodType}"`, timeAgo: timeAgo(d.confirmedAt || d.updatedAt), type: 'request' });
                        });
                        data.filter((d: any) => d.status === 'in_transit').slice(0, 3).forEach((d: any) => {
                            items.push({ id: d._id + '_t', message: `Your food "${d.foodType}" is on the way!`, timeAgo: timeAgo(d.inTransitAt || d.updatedAt), type: 'donation' });
                        });
                    }
                } else if (user.role === 'volunteer') {
                    const res = await fetch('/api/food-donations/volunteer-feed', {
                        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                    });
                    const data = await res.json();
                    if (Array.isArray(data)) {
                        data.filter((d: any) => d.status === 'confirmed').slice(0, 5).forEach((d: any) => {
                            items.push({ id: d._id, message: `New pickup available: "${d.foodType}" — ${d.servings} servings`, timeAgo: timeAgo(d.confirmedAt || d.createdAt), type: 'donation' });
                        });
                    }
                }
                setNotifications(items);
                setNotifsLoaded(true);
            } catch {}
        };
        fetchNotifs();
        const interval = setInterval(fetchNotifs, 60_000);
        return () => clearInterval(interval);
    }, [user, notifsLoaded]);

    useEffect(() => {
        navigator.geolocation?.getCurrentPosition(
            p => setUserLocation({ lat: p.coords.latitude, lng: p.coords.longitude }),
            err => console.error('Location error:', err.code)
        );
    }, []);

    useEffect(() => {
        const fn = (e: MouseEvent) => { if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowLocationSearch(false); };
        document.addEventListener('mousedown', fn);
        return () => document.removeEventListener('mousedown', fn);
    }, []);

    /* ── Navigation handlers ── */
    const handleProfileClick = () => {
        if (!user) { navigate('/login'); return; }
        navigate(PROFILE_ROUTE[user.role] || getDashboardRoute(user.role));
    };

    const handleDonateClick = () => {
        if (!user) { navigate('/login'); return; }
        navigate(user.role === 'donor' ? '/donor-dashboard' : getDashboardRoute(user.role));
    };

    const handleFindFoodClick = () => {
        if (!user) { navigate('/login'); return; }
        navigate(user.role === 'recipient' ? '/recipient-dashboard' : getDashboardRoute(user.role));
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        navigate(user?.role === 'recipient' ? '/recipient-dashboard' : '/find-food',
            { state: { searchQuery: searchQuery.trim() } });
        setShowLocationSearch(false);
        showNotification.success(`Searching for "${searchQuery.trim()}"`);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        if (e.target.value.length > 2) {
            setShowLocationSearch(true);
            setLocationSuggestions([
                { id:'1', address:`${e.target.value} Downtown`,  coordinates:[40.7128,-74.0060] },
                { id:'2', address:`${e.target.value} Uptown`,    coordinates:[40.8075,-73.9626] },
                { id:'3', address:`${e.target.value} Midtown`,   coordinates:[40.7549,-73.9840] },
            ]);
        } else { setShowLocationSearch(false); }
    };

    const handleLogout = () => { dispatch(logout()); navigate('/login'); };
    const getDashboardLink = () => user ? getDashboardRoute(user.role) : '/login';

    /* Initials from name */
    const initials = user?.name ? user.name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2) : 'U';

    const CSS = `
        .header-profile-btn {
            display:flex; align-items:center; gap:8px;
            padding:8px 16px; border-radius:12px; border:none;
            font-weight:700; font-size:0.875rem; cursor:pointer;
            font-family:inherit; transition:all 0.2s;
            box-shadow:0 2px 8px rgba(0,0,0,0.15);
        }
        .header-profile-btn:hover { transform:translateY(-1px); box-shadow:0 4px 16px rgba(0,0,0,0.2); }
        .header-profile-btn:active { transform:scale(0.97); }
        .header-logout-btn {
            display:flex; align-items:center; gap:6px;
            padding:8px 14px; border-radius:12px;
            border:1.5px solid #e5e7eb; background:#fff;
            color:#374151; font-weight:600; font-size:0.875rem;
            cursor:pointer; font-family:inherit; transition:all 0.2s;
        }
        .header-logout-btn:hover { background:#fef2f2; border-color:#fecaca; color:#dc2626; transform:translateY(-1px); }
        .header-logout-btn:active { transform:scale(0.97); }
    `;

    return (
        <div>
            <style>{CSS}</style>
            <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">

                        {/* Logo */}
                        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate(getDashboardLink())}>
                            <img src="/logo192.png" alt="RescueNet" className="w-9 h-9 rounded-full object-cover"
                                onError={e => { (e.target as HTMLImageElement).style.display='none'; }}/>
                            <span className="text-xl font-bold text-gray-900">RescueNet</span>
                        </div>

                        {/* Search */}
                        <div className="flex-1 max-w-lg mx-8" ref={searchRef}>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <form onSubmit={handleSearchSubmit}>
                                    <input type="text" placeholder="Search donations, locations..." value={searchQuery}
                                        onChange={handleSearchChange}
                                        onFocus={() => { if (searchQuery.length > 2) setShowLocationSearch(true); }}
                                        className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all" />
                                </form>
                                {userLocation && (
                                    <button onClick={() => {
                                        setSearchQuery('Near my location');
                                        navigate(user?.role==='recipient' ? '/recipient-dashboard' : '/find-food', { state:{ useCurrentLocation:true } });
                                        setShowLocationSearch(false);
                                    }} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500 hover:text-blue-700" title="Use my current location">
                                        <Navigation className="w-5 h-5" />
                                    </button>
                                )}
                                {showLocationSearch && locationSuggestions.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-60 overflow-y-auto">
                                        {locationSuggestions.map(s => (
                                            <button key={s.id} onClick={() => {
                                                setSearchQuery(s.address); setShowLocationSearch(false);
                                                navigate(user?.role==='recipient' ? '/recipient-dashboard' : '/find-food',
                                                    { state:{ searchLocation:{ address:s.address, coordinates:s.coordinates } } });
                                            }} className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 border-b border-gray-100 last:border-b-0">
                                                <MapPin className="w-4 h-4 text-gray-500" />
                                                <div className="flex-1">
                                                    <div className="font-medium text-gray-900">{s.address}</div>
                                                    <div className="text-sm text-gray-500">Food available nearby</div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Nav right */}
                        <div className="flex items-center space-x-3">
                            {user && (
                                <>
                                    <button onClick={handleDonateClick} className="hidden md:flex items-center space-x-1 text-gray-600 hover:text-green-600 transition-colors font-medium text-sm">
                                        <Gift className="w-4 h-4" /><span>Donate</span>
                                    </button>
                                    <button onClick={handleFindFoodClick} className="hidden md:flex items-center space-x-1 text-gray-600 hover:text-green-600 transition-colors font-medium text-sm">
                                        <MapPin className="w-4 h-4" /><span>Find Food</span>
                                    </button>
                                </>
                            )}

                            {/* Notifications */}
                            {user && (
                                <div className="relative">
                                    <button onClick={() => setIsNotificationOpen(o=>!o)} className="relative p-2 text-gray-500 hover:text-green-600 transition-colors">
                                        <Bell className="w-5 h-5" />
                                        {notifications.length > 0 && <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">{notifications.length}</span>}
                                    </button>
                                    {isNotificationOpen && (
                                        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                                            <div className="bg-green-50 px-5 py-3 border-b border-green-100 flex items-center justify-between">
                                                <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
                                                <button onClick={() => setIsNotificationOpen(false)}><X className="w-4 h-4 text-gray-400"/></button>
                                            </div>
                                            <div className="max-h-72 overflow-y-auto">
                                                {notifications.length === 0 ? (
                                                    <div className="px-5 py-8 text-center">
                                                        <p className="text-2xl mb-2">🔔</p>
                                                        <p className="text-sm text-gray-500 font-medium">No new notifications</p>
                                                        <p className="text-xs text-gray-400 mt-1">You are all caught up!</p>
                                                    </div>
                                                ) : notifications.map(n => (
                                                    <div key={n.id} className="px-5 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                                        <p className="text-xs font-bold mb-0.5" style={{color: n.type === 'request' ? '#8b5cf6' : '#16a34a'}}>
                                                            {n.type === 'request' ? '📤 New Request' : '🍱 Donation Update'}
                                                        </p>
                                                        <p className="text-sm text-gray-800 font-medium">{n.message}</p>
                                                        <p className="text-xs text-gray-400 mt-0.5">{n.timeAgo}</p>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="bg-gray-50 px-5 py-2 border-t border-gray-100 flex items-center justify-between">
                                                <button className="text-xs text-green-600 hover:text-green-700 font-semibold" onClick={() => navigate(getDashboardRoute(user?.role || ''))}>View dashboard</button>
                                                <button className="text-xs text-gray-400 hover:text-gray-600" onClick={() => setNotifsLoaded(false)}>↻ Refresh</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Profile + Logout */}
                            {user ? (
                                <div className="flex items-center gap-2">
                                    {/* Profile button — role-specific */}
                                    <button className="header-profile-btn" onClick={handleProfileClick}
                                        style={{ background: profileHov ? roleColor.hover : roleColor.bg, color:'#fff' }}
                                        onMouseEnter={() => setProfileHov(true)}
                                        onMouseLeave={() => setProfileHov(false)}>
                                        {user.role === 'donor'     && <Heart className="w-4 h-4"/>}
                                        {user.role === 'recipient' && <MapPin className="w-4 h-4"/>}
                                        {user.role === 'volunteer' && <Truck  className="w-4 h-4"/>}
                                        {!['donor','recipient','volunteer'].includes(user.role) && <User className="w-4 h-4"/>}
                                        <span className="hidden sm:inline font-bold">{initials}</span>
                                        <span className="hidden md:inline text-sm font-semibold opacity-90">
                                            · {user.name?.split(' ')[0] || 'Profile'}
                                        </span>
                                        {/* Role badge */}
                                        <span onClick={(e) => { e.stopPropagation(); navigate(getDashboardRoute(user.role)); }}
                                            style={{
                                                fontSize:'0.6rem', fontWeight:700, padding:'2px 6px',
                                                borderRadius:99, background:'rgba(255,255,255,0.22)',
                                                border:'1px solid rgba(255,255,255,0.3)',
                                                lineHeight:1.4, letterSpacing:'0.04em',
                                                textTransform:'uppercase' as const,
                                                display: 'inline-block', cursor:'pointer',
                                            }} className="hidden lg:inline">
                                            {user.role === 'donor' ? '🌿 Donor' : user.role === 'recipient' ? '🍱 Recipient' : user.role === 'volunteer' ? '🚴 Volunteer' : user.role}
                                        </span>
                                    </button>

                                    {/* Logout button — clean minimal style */}
                                    <button className="header-logout-btn" onClick={handleLogout}
                                        onMouseEnter={() => setLogoutHov(true)}
                                        onMouseLeave={() => setLogoutHov(false)}>
                                        <LogOut className="w-4 h-4"/>
                                        <span className="hidden sm:inline">Logout</span>
                                    </button>
                                </div>
                            ) : (
                                <button onClick={() => navigate('/login')}
                                    className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl font-semibold transition-all hover:scale-105 active:scale-95 shadow-md text-sm">
                                    <User className="w-4 h-4"/><span>Login</span>
                                </button>
                            )}

                            {/* Mobile menu toggle */}
                            <button onClick={() => setIsMenuOpen(o=>!o)} className="md:hidden p-2 text-gray-500 hover:text-green-600 transition-colors">
                                {isMenuOpen ? <X className="w-5 h-5"/> : <Menu className="w-5 h-5"/>}
                            </button>
                        </div>
                    </div>

                    {/* Mobile search */}
                    <div className="md:hidden px-2 pb-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"/>
                            <form onSubmit={handleSearchSubmit}>
                                <input type="text" placeholder="Search..." value={searchQuery} onChange={handleSearchChange}
                                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none text-sm"/>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Mobile menu */}
                {isMenuOpen && (
                    <div className="md:hidden bg-white border-t border-gray-100 shadow-sm">
                        <div className="px-4 py-3 space-y-2">
                            {user && (
                                <>
                                    <button onClick={handleDonateClick} className="flex items-center space-x-3 py-2 text-gray-600 hover:text-green-600 w-full text-left font-medium text-sm">
                                        <Gift className="w-4 h-4"/><span>Donate Food</span>
                                    </button>
                                    <button onClick={handleFindFoodClick} className="flex items-center space-x-3 py-2 text-gray-600 hover:text-green-600 w-full text-left font-medium text-sm">
                                        <MapPin className="w-4 h-4"/><span>Find Food</span>
                                    </button>
                                </>
                            )}
                            <div className="pt-2 border-t border-gray-100 space-y-2">
                                {user ? (
                                    <>
                                        <button onClick={handleProfileClick}
                                            className="flex items-center space-x-3 w-full text-white px-4 py-3 rounded-xl font-semibold text-sm"
                                            style={{ background: roleColor.bg }}>
                                            <User className="w-4 h-4"/><span>My Profile ({user.role})</span>
                                        </button>
                                        <button onClick={handleLogout}
                                            className="flex items-center space-x-3 w-full bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-600 px-4 py-3 rounded-xl font-semibold text-sm transition-colors">
                                            <LogOut className="w-4 h-4"/><span>Logout</span>
                                        </button>
                                    </>
                                ) : (
                                    <button onClick={() => navigate('/login')}
                                        className="flex items-center space-x-3 w-full bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-xl font-semibold text-sm">
                                        <User className="w-4 h-4"/><span>Login</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Header;