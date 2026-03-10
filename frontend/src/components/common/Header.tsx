import React, { useState, useEffect, useRef } from 'react';
import { Bell, Search, Menu, X, User, MapPin, Gift, LogOut, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { logout } from '../../store/authSlice';
import { getDashboardRoute } from '../../utils/routeUtils';
import { showNotification } from '../../utils/notificationUtils';

interface NotificationItem {
    id: string;
    message: string;
    timeAgo: string;
    type: 'donation' | 'request' | 'report';
}

const notifications: NotificationItem[] = [
    { id: '1', message: 'New donation available in Downtown Area', timeAgo: '5 minutes ago', type: 'donation' },
    { id: '2', message: 'Your donation request has been accepted', timeAgo: '1 hour ago', type: 'request' },
    { id: '3', message: 'Weekly impact report is ready', timeAgo: '2 hours ago', type: 'report' }
];

const Header = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state: RootState) => state.auth);
    
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showLocationSearch, setShowLocationSearch] = useState(false);
    const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
    const [locationSuggestions, setLocationSuggestions] = useState<Array<{id: string, address: string, coordinates: [number, number]}>>([]);
    const searchRef = useRef<HTMLDivElement>(null);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const toggleNotifications = () => setIsNotificationOpen(!isNotificationOpen);
    
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => { setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude }); },
                (error) => { console.error('Error getting location:', { code: error.code, message: error.message }); }
            );
        }
    }, []);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowLocationSearch(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => { document.removeEventListener('mousedown', handleClickOutside); };
    }, []);

    const handleProfileClick = () => {
        if (user) {
            switch (user.role) {
                case 'donor': navigate('/donor-profile'); break;
                case 'recipient': navigate('/recipient-profile'); break;
                case 'volunteer': navigate('/volunteer-dashboard'); break;
                default: navigate('/login');
            }
        } else { navigate('/login'); }
    };

    const handleDonateClick = () => {
        if (user && user.role === 'donor') { navigate('/donor-dashboard'); }
        else if (user) { navigate(getDashboardRoute(user.role)); }
        else { navigate('/login'); }
    };

    const handleFindFoodClick = () => {
        if (user && user.role === 'recipient') { navigate('/recipient-dashboard'); }
        else if (user) { navigate(getDashboardRoute(user.role)); }
        else { navigate('/login'); }
    };
    
    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        if (user?.role === 'recipient') {
            navigate('/recipient-dashboard', { state: { searchQuery: searchQuery.trim() } });
        } else {
            navigate('/find-food', { state: { searchQuery: searchQuery.trim() } });
        }
        setShowLocationSearch(false);
        showNotification.success(`Searching for "${searchQuery.trim()}"`);  
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        if (e.target.value.length > 2) {
            setShowLocationSearch(true);
            setLocationSuggestions([
                { id: '1', address: `${e.target.value} Downtown`, coordinates: [40.7128, -74.0060] },
                { id: '2', address: `${e.target.value} Uptown`, coordinates: [40.8075, -73.9626] },
                { id: '3', address: `${e.target.value} Midtown`, coordinates: [40.7549, -73.9840] },
            ]);
        } else { setShowLocationSearch(false); }
    };

    const handleLogout = () => { dispatch(logout()); navigate('/login'); };
    const getDashboardLink = () => !user ? '/login' : getDashboardRoute(user.role);

    return (
        <div>
            <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">

                        {/* ── Logo ── */}
                        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate(getDashboardLink())}>
                            <img
                                src="/logo192.png"
                                alt="RescueNet"
                                className="w-9 h-9 rounded-full object-cover"
                                onError={(e) => {
                                    // Fallback to green circle if image fails
                                    (e.target as HTMLImageElement).style.display = 'none';
                                }}
                            />
                            <span className="text-xl font-bold text-gray-900">RescueNet</span>
                        </div>

                        {/* Search Bar - Desktop */}
                        <div className="flex-1 max-w-lg mx-8" ref={searchRef}>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <form onSubmit={handleSearchSubmit}>
                                    <input
                                        type="text"
                                        placeholder="Search donations, locations..."
                                        value={searchQuery}
                                        onChange={handleSearchChange}
                                        onFocus={() => { if (searchQuery.length > 2) setShowLocationSearch(true); }}
                                        className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                                    />
                                </form>
                                {userLocation && (
                                    <button
                                        onClick={() => {
                                            setSearchQuery('Near my location');
                                            if (user?.role === 'recipient') { navigate('/recipient-dashboard', { state: { useCurrentLocation: true } }); }
                                            else { navigate('/find-food', { state: { useCurrentLocation: true } }); }
                                            setShowLocationSearch(false);
                                        }}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500 hover:text-blue-700"
                                        title="Use my current location"
                                    >
                                        <Navigation className="w-5 h-5" />
                                    </button>
                                )}
                                {showLocationSearch && locationSuggestions.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-60 overflow-y-auto">
                                        {locationSuggestions.map((suggestion) => (
                                            <button key={suggestion.id}
                                                onClick={() => {
                                                    setSearchQuery(suggestion.address);
                                                    setShowLocationSearch(false);
                                                    if (user?.role === 'recipient') { navigate('/recipient-dashboard', { state: { searchLocation: { address: suggestion.address, coordinates: suggestion.coordinates } } }); }
                                                    else { navigate('/find-food', { state: { searchLocation: { address: suggestion.address, coordinates: suggestion.coordinates } } }); }
                                                }}
                                                className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 border-b border-gray-100 last:border-b-0"
                                            >
                                                <MapPin className="w-4 h-4 text-gray-500" />
                                                <div className="flex-1">
                                                    <div className="font-medium text-gray-900">{suggestion.address}</div>
                                                    <div className="text-sm text-gray-500">Food available nearby</div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Navigation - Desktop */}
                        <div className="flex items-center space-x-4">
                            {user && (
                                <>
                                    <button onClick={handleDonateClick} className="flex items-center space-x-1 text-gray-700 hover:text-green-600 transition-colors font-medium">
                                        <Gift className="w-5 h-5" /><span>Donate</span>
                                    </button>
                                    <button onClick={handleFindFoodClick} className="flex items-center space-x-1 text-gray-700 hover:text-green-600 transition-colors font-medium">
                                        <MapPin className="w-5 h-5" /><span>Find Food</span>
                                    </button>
                                </>
                            )}

                            {user && (
                                <div className="relative">
                                    <button onClick={toggleNotifications} className="relative p-2 text-gray-700 hover:text-green-600 transition-colors">
                                        <Bell className="w-6 h-6" />
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">{notifications.length}</span>
                                    </button>
                                    {isNotificationOpen && (
                                        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                                            <div className="bg-green-50 px-6 py-4 border-b border-green-100">
                                                <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                                            </div>
                                            <div className="max-h-96 overflow-y-auto">
                                                {notifications.map((n) => (
                                                    <div key={n.id} className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                                        <p className="text-sm text-gray-800 font-medium mb-1">{n.message}</p>
                                                        <p className="text-xs text-gray-500">{n.timeAgo}</p>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="bg-gray-50 p-3 border-t border-gray-100">
                                                <button className="text-sm text-green-600 hover:text-green-700 font-semibold transition-colors">View all notifications</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {user ? (
                                <div className="flex items-center space-x-2">
                                    <button onClick={handleProfileClick} className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg">
                                        <User className="w-5 h-5" />
                                        <span className="hidden sm:inline">{user.name?.split(' ')[0] || 'Profile'}</span>
                                    </button>
                                    <button onClick={handleLogout} className="flex items-center space-x-2 bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-lg font-semibold transition-all duration-300 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg" title="Logout">
                                        <LogOut className="w-4 h-4" />
                                        <span className="hidden sm:inline">Logout</span>
                                    </button>
                                </div>
                            ) : (
                                <button onClick={() => navigate('/login')} className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg">
                                    <User className="w-5 h-5" /><span className="hidden sm:inline">Login</span>
                                </button>
                            )}

                            <div className="md:hidden flex items-center space-x-2">
                                <button onClick={toggleNotifications} className="relative p-2 text-gray-700 hover:text-green-600 transition-colors">
                                    <Bell className="w-5 h-5" />
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-semibold">{notifications.length}</span>
                                </button>
                                <button onClick={handleProfileClick} className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg">
                                    <User className="w-5 h-5" />
                                </button>
                                <button onClick={toggleMenu} className="p-2 text-gray-700 hover:text-green-600 transition-colors">
                                    {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Search */}
                    <div className="md:hidden px-4 pb-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <form onSubmit={handleSearchSubmit}>
                                <input type="text" placeholder="Search donations, locations..." value={searchQuery} onChange={handleSearchChange}
                                    className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors" />
                            </form>
                            <div className="mt-2">
                                <button className="flex items-center w-full p-2 bg-blue-50 hover:bg-blue-100 rounded-md text-left text-sm"
                                    onClick={() => {
                                        if (userLocation) {
                                            if (user?.role === 'recipient') { navigate('/recipient-dashboard', { state: { useCurrentLocation: true, coordinates: userLocation } }); }
                                            else { navigate('/find-food', { state: { useCurrentLocation: true, coordinates: userLocation } }); }
                                            showNotification.success('Using your current location');
                                        } else { showNotification.error('Unable to get your location. Please enable location services.'); }
                                    }}>
                                    <Navigation className="w-4 h-4 mr-2 text-blue-500" />
                                    Use my current location
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden bg-white border-t border-gray-200 shadow-sm">
                        <div className="px-4 py-3 space-y-3">
                            {user && (
                                <>
                                    <button onClick={handleDonateClick} className="flex items-center space-x-3 py-2 text-gray-700 hover:text-green-600 transition-colors w-full text-left font-medium">
                                        <Gift className="w-5 h-5" /><span>Donate Food</span>
                                    </button>
                                    <button onClick={handleFindFoodClick} className="flex items-center space-x-3 py-2 text-gray-700 hover:text-green-600 transition-colors w-full text-left font-medium">
                                        <MapPin className="w-5 h-5" /><span>Find Food</span>
                                    </button>
                                    <button onClick={toggleNotifications} className="flex items-center space-x-3 py-2 text-gray-700 hover:text-green-600 transition-colors w-full text-left font-medium">
                                        <Bell className="w-5 h-5" /><span>Notifications</span>
                                        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 ml-auto font-semibold">{notifications.length}</span>
                                    </button>
                                </>
                            )}
                            <div className="pt-3 border-t border-gray-100">
                                {user ? (
                                    <>
                                        <button onClick={handleProfileClick} className="flex items-center space-x-3 w-full bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg font-semibold mb-2">
                                            <User className="w-5 h-5" /><span>View Profile</span>
                                        </button>
                                        <button onClick={handleLogout} className="flex items-center space-x-3 w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg font-semibold">
                                            <LogOut className="w-5 h-5" /><span>Logout</span>
                                        </button>
                                    </>
                                ) : (
                                    <button onClick={() => navigate('/login')} className="flex items-center space-x-3 w-full bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg font-semibold">
                                        <User className="w-5 h-5" /><span>Login</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Header;