import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    TrendingUp,
    Star,
    Recycle,
    Plus,
    Truck,
    Eye,
    MessageSquare,
    MoreVertical,
    Clock,
    Bell,
    Settings,
    Package,
    Calendar,
    CheckCircle,
    Info,
    BarChart3,
    Sparkles
} from 'lucide-react';
import DetailedAnalyticsModal from './DetailedAnalyticsModal';

interface StatCardProps {
    icon: React.ElementType;
    label: string;
    value: string | number;
    trend?: string;
    color: string;
    iconColor: string;
    onClick?: () => void;
    analyticsType?: 'donations' | 'people-served' | 'active-listings' | 'pickup-requests';
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, trend, color, iconColor, onClick }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className={`relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer ${isHovered ? 'bg-white/90' : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={onClick}
        >
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-2">{label}</p>
                    <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
                    {trend && (
                        <div className="flex items-center gap-1 text-xs">
                            <TrendingUp size={12} className="text-green-500" />
                            <span className="text-green-600 font-medium">{trend}</span>
                        </div>
                    )}
                </div>
                <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center shadow-lg`}>
                    <Icon className={`w-7 h-7 ${iconColor}`} />
                </div>
            </div>

            {/* Animated background effect */}
            <div className={`absolute -right-8 -top-8 w-24 h-24 rounded-full ${color} bg-opacity-5 transition-all duration-300 ${isHovered ? 'scale-150 bg-opacity-10' : ''
                }`} />

            {/* Click indicator */}
            {isHovered && (
                <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium opacity-90">
                    Click for details
                </div>
            )}
        </div>
    );
};

const ActionButton: React.FC<{
    icon: React.ElementType;
    label: string;
    color: string;
    onClick?: () => void;
    variant?: 'primary' | 'secondary' | 'accent';
}> = ({ icon: Icon, label, color, onClick, variant = 'primary' }) => {
    const baseClasses = "flex items-center gap-2 px-6 py-3 rounded-2xl font-medium transition-all duration-300 hover:scale-105 shadow-lg";
    const variants = {
        primary: `${color} text-white hover:opacity-90`,
        secondary: "bg-white/80 backdrop-blur-sm text-gray-700 hover:bg-white border border-white/20",
        accent: "bg-gradient-to-r from-orange-400 to-orange-600 text-white hover:from-orange-500 hover:to-orange-700"
    };

    return (
        <button
            onClick={onClick}
            className={`${baseClasses} ${variants[variant]}`}
        >
            <Icon size={18} />
            <span>{label}</span>
        </button>
    );
};

const ListingCard: React.FC<{
    title: string;
    servings: number;
    timeAgo: string;
    timeLeft: string;
    views: number;
    requests: number;
    status: string;
    image: string;
}> = ({ title, servings, timeAgo, timeLeft, views, requests, status, image }) => {
    return (
        <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-2xl p-5 hover:shadow-lg transition-all duration-300 hover:bg-white/80">
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center text-2xl shadow-sm">
                        {image}
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                            <span className="flex items-center gap-1">
                                <Users size={14} />
                                {servings} servings
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock size={14} />
                                {timeAgo}
                            </span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                                <Eye size={12} />
                                {views} views
                            </div>
                            <div className="flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                                <MessageSquare size={12} />
                                {requests} requests
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {status === 'expired' ? (
                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                            Expired
                        </span>
                    ) : status === 'active' ? (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            Active
                        </span>
                    ) : (
                        <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                            Completed
                        </span>
                    )}
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <MoreVertical size={16} className="text-gray-400" />
                    </button>
                </div>
            </div>
        </div>
    );
};


export default function DonorDashboard() {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);
    const [selectedAnalyticsType, setSelectedAnalyticsType] = useState<'donations' | 'people-served' | 'active-listings' | 'pickup-requests' | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Navigation handlers
    const handleAddSurplusFood = () => {
        console.log('Navigate to add surplus food');
        navigate('/add-surplus-food');
    };

    const handleRequestWastePickup = () => {
        console.log('Navigate to waste pickup request');
        navigate('/organic-waste-form');
    };

    const handleAddEvent = () => {
        console.log('Navigate to add event');
        navigate('/add-event');
    };

    const handleTestEventReminder = () => {
        console.log('Test event reminder functionality');
        alert('Event reminder test - Notification system working!');
    };

    const handleAnalytics = () => {
        console.log('Navigate to analytics dashboard');
        navigate('/donor-analytics');
    };

    const handleLogout = () => {
        console.log('Logout user');
        navigate('/login');
    };

    const handleStatClick = (analyticsType: 'donations' | 'people-served' | 'active-listings' | 'pickup-requests') => {
        setSelectedAnalyticsType(analyticsType);
        setIsAnalyticsModalOpen(true);
    };

    const closeAnalyticsModal = () => {
        setIsAnalyticsModalOpen(false);
        setSelectedAnalyticsType(null);
    };

    const stats = [
        {
            icon: Package,
            label: 'Total Donations',
            value: 156,
            trend: '+12% this month',
            color: 'bg-gradient-to-r from-blue-500 to-blue-600',
            iconColor: 'text-white',
            analyticsType: 'donations' as const,
            onClick: () => handleStatClick('donations')
        },
        {
            icon: Users,
            label: 'People Served',
            value: '2,340',
            trend: '+8% vs last month',
            color: 'bg-gradient-to-r from-green-500 to-green-600',
            iconColor: 'text-white',
            analyticsType: 'people-served' as const,
            onClick: () => handleStatClick('people-served')
        },
        {
            icon: Calendar,
            label: 'Active Listings',
            value: 8,
            trend: '2 expiring soon',
            color: 'bg-gradient-to-r from-orange-500 to-orange-600',
            iconColor: 'text-white',
            analyticsType: 'active-listings' as const,
            onClick: () => handleStatClick('active-listings')
        },
        {
            icon: Truck,
            label: 'Pickup Requests',
            value: 23,
            trend: '5 new today',
            color: 'bg-gradient-to-r from-purple-500 to-purple-600',
            iconColor: 'text-white',
            analyticsType: 'pickup-requests' as const,
            onClick: () => handleStatClick('pickup-requests')
        }
    ];

    const activeListings = [
        {
            title: 'Fresh Sandwiches from Café',
            servings: 25,
            timeAgo: '2 hours ago',
            timeLeft: '3 hours left',
            views: 12,
            requests: 3,
            status: 'active',
            image: '🥪'
        },
        {
            title: 'Leftover Pizza Slices',
            servings: 15,
            timeAgo: '4 hours ago',
            timeLeft: '7 requests',
            views: 18,
            requests: 7,
            status: 'active',
            image: '🍕'
        },
        {
            title: 'Conference Lunch Boxes',
            servings: 20,
            timeAgo: '6 hours ago',
            timeLeft: 'Completed',
            views: 25,
            requests: 15,
            status: 'completed',
            image: '🍱'
        }
    ];

    const recentActivity = [
        {
            type: 'completed',
            message: 'Pizza pickup completed',
            details: 'Picked up by Maria from Campus NGO - 18 slices distributed',
            time: '2 hours ago',
            icon: CheckCircle,
            color: 'text-green-500'
        },
        {
            type: 'request',
            message: 'New pickup request',
            details: 'Student Union requesting sandwich pickup for tonight',
            time: '5 minutes ago',
            icon: Info,
            color: 'text-blue-500'
        },
        {
            type: 'reminder',
            message: 'Event reminder',
            details: 'Campus Food Drive event tomorrow at 2 PM',
            time: '1 hour ago',
            icon: Calendar,
            color: 'text-orange-500'
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Donor Dashboard
                            </h1>
                            <p className="text-gray-600 text-sm mt-1 hidden sm:block">Welcome back! Ready to make a difference today?</p>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-4">
                            <div className="hidden md:flex items-center gap-3">
                                <ActionButton
                                    icon={BarChart3}
                                    label="Analytics"
                                    color="bg-blue-500"
                                    variant="secondary"
                                    onClick={handleAnalytics}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="p-2 sm:p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all">
                                    <Bell size={18} className="sm:w-5 sm:h-5" />
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="px-3 py-2 sm:px-4 text-sm sm:text-base text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
                                >
                                    <span className="hidden sm:inline">Logout</span>
                                    <span className="sm:hidden">Exit</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
                    {stats.map((stat, index) => (
                        <StatCard key={index} {...stat} />
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
                    {/* Quick Actions */}
                    <div className="lg:col-span-1 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <Sparkles size={20} className="text-purple-600" />
                            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
                        </div>
                        <p className="text-sm text-gray-600 mb-6">Common tasks for food donors</p>

                        <div className="space-y-3">
                            <button
                                onClick={handleAddSurplusFood}
                                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 hover:scale-105 shadow-lg flex items-center gap-3"
                            >
                                <Plus size={18} />
                                <span className="font-medium">Add New Surplus Food</span>
                            </button>
                            <button
                                onClick={handleRequestWastePickup}
                                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 hover:scale-105 shadow-lg flex items-center gap-3"
                            >
                                <Truck size={18} />
                                <span className="font-medium">Request Waste Pickup</span>
                            </button>
                            <button
                                onClick={handleAddEvent}
                                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-300 hover:scale-105 shadow-lg flex items-center gap-3"
                            >
                                <Bell size={18} />
                                <span className="font-medium">Add Event</span>
                            </button>
                            <button
                                onClick={handleTestEventReminder}
                                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 hover:scale-105 shadow-lg flex items-center gap-3"
                            >
                                <Settings size={18} />
                                <span className="font-medium">Test Event Reminder</span>
                            </button>
                        </div>

                        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
                            <div className="flex items-center gap-2 mb-2">
                                <Calendar size={16} className="text-green-600" />
                                <span className="text-sm font-medium text-gray-900">Event Calendar</span>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">Smart event-based food redistribution</p>
                            <div className="flex items-center gap-2 text-xs text-green-700 bg-green-100 px-3 py-2 rounded-lg">
                                <CheckCircle size={12} />
                                <span>Campus calendar connected</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Automatically reminded about 24 upcoming events this month.</p>
                        </div>
                    </div>

                    {/* Current Listings */}
                    <div className="lg:col-span-2 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
                        <div className="p-6 border-b border-gray-200/50">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900">Your Current Listings</h2>
                                <span className="text-sm text-blue-600 font-medium">Manage your active food donations</span>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            {activeListings.map((listing, index) => (
                                <ListingCard key={index} {...listing} />
                            ))}
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
                        <div className="p-6 border-b border-gray-200/50">
                            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                            <p className="text-sm text-gray-600">Your latest donation activities</p>
                        </div>
                        <div className="p-4 space-y-2">
                            {recentActivity.map((activity, index) => (
                                <div key={index} className="p-3 hover:bg-gray-50/80 rounded-xl transition-colors">
                                    <div className="flex items-start gap-3">
                                        <div className={`w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center`}>
                                            <activity.icon size={14} className={activity.color} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                                            <p className="text-xs text-gray-600 mt-1">{activity.details}</p>
                                            <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Impact Section */}
                <div className="mt-8 bg-gradient-to-r from-white/70 to-white/50 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
                    <div className="p-6 border-b border-gray-200/50">
                        <h2 className="text-lg font-semibold text-gray-900">Your Impact</h2>
                    </div>
                    <div className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                            <div className="text-center">
                                <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                    <Users className="w-8 h-8 md:w-10 md:h-10 text-white" />
                                </div>
                                <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">2,340</div>
                                <div className="text-sm text-gray-600">People Fed This Month</div>
                            </div>
                            <div className="text-center">
                                <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                    <Recycle className="w-8 h-8 md:w-10 md:h-10 text-white" />
                                </div>
                                <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">1.2 tons</div>
                                <div className="text-sm text-gray-600">CO₂ Emissions Reduced</div>
                            </div>
                        </div>
                        <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl border border-green-200">
                            <div className="text-center">
                                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Star className="w-6 h-6 text-white" />
                                </div>
                                <p className="text-sm font-medium text-gray-900 mb-1">Thank you for making a positive impact!</p>
                                <p className="text-xs text-gray-600">Your contributions are helping build a more sustainable community.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Real-time Status */}
                <div className="fixed bottom-6 right-6">
                    <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-white/30 flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-gray-700">
                            Live • {currentTime.toLocaleTimeString()}
                        </span>
                    </div>
                </div>

                {/* Analytics Modal */}
                <DetailedAnalyticsModal
                    isOpen={isAnalyticsModalOpen}
                    onClose={closeAnalyticsModal}
                    analyticsType={selectedAnalyticsType}
                />
            </div>
        </div>
    );
};
