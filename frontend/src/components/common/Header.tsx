import React, { useState } from 'react';
import { Heart, Bell, Search, Menu, X, User, MapPin, Gift } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NotificationItem {
    id: string;
    message: string;
    timeAgo: string;
    type: 'donation' | 'request' | 'report';
}

const notifications: NotificationItem[] = [
    {
        id: '1',
        message: 'New donation available in Downtown Area',
        timeAgo: '5 minutes ago',
        type: 'donation'
    },
    {
        id: '2',
        message: 'Your donation request has been accepted',
        timeAgo: '1 hour ago',
        type: 'request'
    },
    {
        id: '3',
        message: 'Weekly impact report is ready',
        timeAgo: '2 hours ago',
        type: 'report'
    }
];

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const navigate = useNavigate();

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const toggleNotifications = () => setIsNotificationOpen(!isNotificationOpen);

    const handleProfileClick = () => {
        console.log('Navigate to profile page');
        // Add navigation logic here
        navigate('/profile');
    };

    const handleDonateClick = () => {
        console.log('Navigate to donate page');
        // Add navigation logic here
        navigate('/donor-dashboard');
    };

    const handleFindFoodClick = () => {
        console.log('Navigate to find food page');
        // Add navigation logic here
        navigate('/recipient-dashboard');
    };

    return (
        <div>
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <div className="flex items-center space-x-3">
                            <div className="bg-green-500 rounded-full p-2">
                                <Heart className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gray-900">Byte Banquet</span>
                        </div>

                        {/* Search Bar - Desktop */}
                        <div className="flex-1 max-w-lg mx-8">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search donations, locations..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>
                        </div>

                        {/* Navigation - Desktop */}
                        <div className="flex items-center space-x-4">
                            {/* Navigation Links */}
                            <button
                                onClick={handleDonateClick}
                                className="flex items-center space-x-1 text-gray-700 hover:text-green-600 transition-colors font-medium"
                            >
                                <Gift className="w-5 h-5" />
                                <span>Donate</span>
                            </button>
                            <button
                                onClick={handleFindFoodClick}
                                className="flex items-center space-x-1 text-gray-700 hover:text-green-600 transition-colors font-medium"
                            >
                                <MapPin className="w-5 h-5" />
                                <span>Find Food</span>
                            </button>

                            {/* Notifications */}
                            <div className="relative">
                                <button
                                    onClick={toggleNotifications}
                                    className="relative p-2 text-gray-700 hover:text-green-600 transition-colors"
                                >
                                    <Bell className="w-6 h-6" />
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                                        {notifications.length}
                                    </span>
                                </button>

                                {/* Notification Dropdown */}
                                {isNotificationOpen && (
                                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                                        <div className="bg-green-50 px-6 py-4 border-b border-green-100">
                                            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                                        </div>
                                        <div className="max-h-96 overflow-y-auto">
                                            {notifications.map((notification) => (
                                                <div key={notification.id} className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                                    <p className="text-sm text-gray-800 font-medium mb-1">
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {notification.timeAgo}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="bg-gray-50 p-3 border-t border-gray-100">
                                            <button className="text-sm text-green-600 hover:text-green-700 font-semibold transition-colors">
                                                View all notifications
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Profile Button */}
                            <button
                                onClick={handleProfileClick}
                                className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                            >
                                <User className="w-5 h-5" />
                                <span>Profile</span>
                            </button>

                            {/* Mobile Navigation - Only show on small screens */}
                            <div className="md:hidden flex items-center space-x-2">
                                {/* Notification for mobile */}
                                <button
                                    onClick={toggleNotifications}
                                    className="relative p-2 text-gray-700 hover:text-green-600 transition-colors"
                                >
                                    <Bell className="w-5 h-5" />
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-semibold">
                                        {notifications.length}
                                    </span>
                                </button>

                                {/* Profile button for mobile */}
                                <button
                                    onClick={handleProfileClick}
                                    className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg transition-colors"
                                >
                                    <User className="w-5 h-5" />
                                </button>

                                {/* Menu button */}
                                <button
                                    onClick={toggleMenu}
                                    className="p-2 text-gray-700 hover:text-green-600 transition-colors"
                                >
                                    {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Search */}
                    <div className="md:hidden px-4 pb-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search donations, locations..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-colors"
                            />
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden bg-white border-t border-gray-200 shadow-sm">
                        <div className="px-4 py-3 space-y-3">
                            <button
                                onClick={handleDonateClick}
                                className="flex items-center space-x-3 py-2 text-gray-700 hover:text-green-600 transition-colors w-full text-left font-medium"
                            >
                                <Gift className="w-5 h-5" />
                                <span>Donate Food</span>
                            </button>
                            <button
                                onClick={handleFindFoodClick}
                                className="flex items-center space-x-3 py-2 text-gray-700 hover:text-green-600 transition-colors w-full text-left font-medium"
                            >
                                <MapPin className="w-5 h-5" />
                                <span>Find Food</span>
                            </button>
                            <button
                                onClick={toggleNotifications}
                                className="flex items-center space-x-3 py-2 text-gray-700 hover:text-green-600 transition-colors w-full text-left font-medium"
                            >
                                <Bell className="w-5 h-5" />
                                <span>Notifications</span>
                                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 ml-auto font-semibold">
                                    {notifications.length}
                                </span>
                            </button>
                            <div className="pt-3 border-t border-gray-100">
                                <button
                                    onClick={handleProfileClick}
                                    className="flex items-center space-x-3 w-full bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-2xl transition-colors font-semibold"
                                >
                                    <User className="w-5 h-5" />
                                    <span>View Profile</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
