import React, { useState } from 'react';
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
    MapPin,
    Bell,
    Settings,
    Search
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';


export default function DonorDashboard() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const navigate = useNavigate();

    const handleAddSurplus = () => {
        navigate('/add-surplus-food');
    };
    const handleWasteToEnergy = () => {
        navigate('/waste-to-energy');
    };

    const stats = [
        { icon: Users, label: 'Meals Served', value: '2,340', color: 'bg-green-500', iconColor: 'text-white' },
        { icon: TrendingUp, label: 'Total Donations', value: '89', color: 'bg-blue-500', iconColor: 'text-white' },
        { icon: Star, label: 'Avg Rating', value: '4.8/5.0', color: 'bg-orange-500', iconColor: 'text-white' },
        { icon: Recycle, label: 'Food Saved (in Kgs)', value: '2.1 tons', color: 'bg-purple-500', iconColor: 'text-white' }
    ];

    const activeListings = [
        {
            id: 1,
            title: 'Indian Curry Buffet',
            servings: 25,
            timeAgo: '1 hour ago',
            timeLeft: '2 hours left',
            views: 12,
            requests: 3,
            status: 'active',
            image: '🍛'
        },
        {
            id: 2,
            title: 'Fresh Salad Bar',
            servings: 15,
            timeAgo: '30 mins ago',
            timeLeft: '4 hours left',
            views: 8,
            requests: 1,
            status: 'active',
            image: '🥗'
        },
        {
            id: 3,
            title: 'Dessert Platters',
            servings: 20,
            timeAgo: '2 hours ago',
            timeLeft: 'expired',
            views: 5,
            requests: 0,
            status: 'expired',
            image: '🍰'
        }
    ];

    const recentActivity = [
        {
            id: 1,
            type: 'request',
            message: 'New request from Hope Foundation',
            time: '5 mins ago',
            icon: MessageSquare,
            color: 'text-blue-500'
        },
        {
            id: 2,
            type: 'pickup',
            message: 'Food picked up by Raj Kumar',
            time: '1 hour ago',
            icon: Truck,
            color: 'text-green-500'
        },
        {
            id: 3,
            type: 'review',
            message: 'New 5-star review received',
            time: '2 hours ago',
            icon: Star,
            color: 'text-orange-500'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Restaurant Info */}
                        <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-sm">SG</span>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Spice Garden Restaurant</h1>
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-500">4.8</span>
                                    <div className="flex space-x-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                                        ))}
                                    </div>
                                    <span className="text-sm text-gray-500">(127)</span>
                                </div>
                            </div>
                        </div>

                        {/* Header Actions */}
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={handleAddSurplus}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Add Surplus</span>
                            </button>
                            <button
                                onClick={handleWasteToEnergy}
                                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                            >
                                <Truck className="w-4 h-4" />
                                <span>Waste Pickup</span>
                            </button>
                            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                                <Bell className="w-5 h-5" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                                <Settings className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat, index) => (
                        <div key={index} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                </div>
                                <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                                    <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Active Listings */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900">Active Listings</h2>
                                <button className="text-blue-500 hover:text-blue-600 text-sm font-medium">
                                    2 Active
                                </button>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            {activeListings.map((listing) => (
                                <div key={listing.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start space-x-4">
                                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                                                {listing.image}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900 mb-1">{listing.title}</h3>
                                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                                    <span>{listing.servings} servings</span>
                                                    <span>•</span>
                                                    <span>{listing.timeAgo}</span>
                                                </div>
                                                <div className="flex items-center space-x-4 mt-2">
                                                    <div className="flex items-center space-x-1">
                                                        <Eye className="w-4 h-4 text-gray-400" />
                                                        <span className="text-sm text-gray-600">{listing.views} views</span>
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        <MessageSquare className="w-4 h-4 text-gray-400" />
                                                        <span className="text-sm text-gray-600">{listing.requests} requests</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            {listing.status === 'expired' ? (
                                                <span className="text-red-500 text-sm font-medium">Expired</span>
                                            ) : (
                                                <span className="text-orange-500 text-sm font-medium">{listing.timeLeft}</span>
                                            )}
                                            <button className="p-1 hover:bg-gray-100 rounded">
                                                <MoreVertical className="w-4 h-4 text-gray-400" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white rounded-2xl shadow-sm">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            {recentActivity.map((activity) => (
                                <div key={activity.id} className="flex items-start space-x-3">
                                    <div className={`w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center`}>
                                        <activity.icon className={`w-4 h-4 ${activity.color}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-gray-900">{activity.message}</p>
                                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Impact Section */}
                <div className="mt-8 bg-white rounded-2xl shadow-sm">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Your Impact</h2>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Users className="w-8 h-8 text-white" />
                                </div>
                                <div className="text-2xl font-bold text-gray-900 mb-1">2,340</div>
                                <div className="text-sm text-gray-600">People Fed</div>
                            </div>
                            <div className="text-center">
                                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Recycle className="w-8 h-8 text-white" />
                                </div>
                                <div className="text-2xl font-bold text-gray-900 mb-1">1.2 tons</div>
                                <div className="text-sm text-gray-600">CO₂ Reduced</div>
                            </div>
                        </div>
                        <div className="mt-6 p-4 bg-green-50 rounded-lg">
                            <p className="text-center text-sm text-gray-600">
                                Thank you for making a positive impact on our community and environment!
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}