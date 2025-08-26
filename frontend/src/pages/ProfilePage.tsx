import React, { useState } from 'react';
import {
    ArrowLeft,
    Edit3,
    User,
    MapPin,
    Mail,
    Award,
    TrendingUp,
    Heart,
    Bell,
    Settings,
    Shield,
    HelpCircle,
    LogOut,
    Plus,
    Check,
    X,
    Home,
    Search,
    FileText,
    MessageCircle,
    Save,
    Camera,
    Phone
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import EnhancedUserProfile from '../components/common/EnhancedUserProfile';

interface UserProfile {
    name: string;
    email: string;
    location: string;
    phone: string;
    avatar?: string;
    stats: {
        totalRequests: number;
        successfulPickups: number;
        successRate: number;
    };
    preferences: {
        foodTypes: string[];
        dietaryRestrictions: string[];
    };
    notifications: {
        newDonations: boolean;
        requestUpdates: boolean;
        locationBased: boolean;
    };
}

const userProfile: UserProfile = {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    location: 'Downtown Area, New York',
    phone: '+1 (555) 123-4567',
    stats: {
        totalRequests: 23,
        successfulPickups: 21,
        successRate: 91
    },
    preferences: {
        foodTypes: ['Fresh Produce', 'Cooked Meals', 'Baked Goods'],
        dietaryRestrictions: ['Vegetarian', 'Nut-free']
    },
    notifications: {
        newDonations: true,
        requestUpdates: true,
        locationBased: true
    }
};

export default function ModernProfilePage() {
    const [profile, setProfile] = useState(userProfile);
    const [isEditing, setIsEditing] = useState(false);
    const [showAddPreference, setShowAddPreference] = useState(false);
    const [newPreference, setNewPreference] = useState('');
    const [preferenceType, setPreferenceType] = useState<'foodTypes' | 'dietaryRestrictions'>('foodTypes');
    const [editForm, setEditForm] = useState({
        name: profile.name,
        email: profile.email,
        location: profile.location,
        phone: profile.phone
    });
    const navigate = useNavigate();

    const handleBack = () => {
        console.log('Navigate back');
        navigate(-1);
    };

    const handleEdit = () => {
        if (isEditing) {
            // Save changes
            setProfile(prev => ({
                ...prev,
                ...editForm
            }));
            toast.success('Profile updated successfully!');
        }
        setIsEditing(!isEditing);
    };

    const handleCancelEdit = () => {
        setEditForm({
            name: profile.name,
            email: profile.email,
            location: profile.location,
            phone: profile.phone
        });
        setIsEditing(false);
        toast.error('Changes cancelled');
    };

    const handleInputChange = (field: keyof typeof editForm, value: string) => {
        setEditForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleNotificationToggle = (type: keyof typeof profile.notifications) => {
        setProfile(prev => ({
            ...prev,
            notifications: {
                ...prev.notifications,
                [type]: !prev.notifications[type]
            }
        }));
        toast.success(`${type.replace(/([A-Z])/g, ' $1').toLowerCase()} notifications ${!profile.notifications[type] ? 'enabled' : 'disabled'}`);
    };

    const handleRemovePreference = (type: 'foodTypes' | 'dietaryRestrictions', item: string) => {
        setProfile(prev => ({
            ...prev,
            preferences: {
                ...prev.preferences,
                [type]: prev.preferences[type].filter(pref => pref !== item)
            }
        }));
        toast.success(`${item} removed from ${type.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
    };

    const handleAddPreference = () => {
        if (newPreference.trim()) {
            setProfile(prev => ({
                ...prev,
                preferences: {
                    ...prev.preferences,
                    [preferenceType]: [...prev.preferences[preferenceType], newPreference.trim()]
                }
            }));
            setNewPreference('');
            setShowAddPreference(false);
            toast.success(`${newPreference} added to ${preferenceType.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        }
    };

    const handleSignOut = () => {
        console.log('Sign out');
        toast.success('Signed out successfully');
        navigate('/login');
    };

    const StatCard = ({ icon, value, label, color = 'blue' }: { icon: React.ReactNode, value: string | number, label: string, color?: string }) => (
        <div className={`bg-gradient-to-br from-${color}-50 to-${color}-100 rounded-2xl p-6 border border-${color}-200`}>
            <div className={`w-12 h-12 bg-${color}-500 rounded-xl flex items-center justify-center mb-4`}>
                {icon}
            </div>
            <div className={`text-3xl font-bold text-${color}-700 mb-1`}>{value}</div>
            <div className={`text-${color}-600 text-sm font-medium`}>{label}</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-200/50">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between py-4">
                        <div className="flex items-center">
                            <button
                                onClick={handleBack}
                                className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <ArrowLeft className="w-6 h-6 text-gray-600" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
                                <p className="text-sm text-gray-600 mt-1">Manage your account</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            {isEditing && (
                                <button
                                    onClick={handleCancelEdit}
                                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-xl font-semibold transition-colors flex items-center"
                                >
                                    <X className="w-4 h-4 mr-2" />
                                    Cancel
                                </button>
                            )}
                            <button
                                onClick={handleEdit}
                                className={`px-4 py-2 rounded-xl font-semibold transition-colors flex items-center ${
                                    isEditing 
                                        ? 'bg-green-500 hover:bg-green-600 text-white' 
                                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                                }`}
                            >
                                {isEditing ? (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Save
                                    </>
                                ) : (
                                    <>
                                        <Edit3 className="w-4 h-4 mr-2" />
                                        Edit
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Profile Header */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-32"></div>
                    <div className="px-8 pb-8">
                        <div className="flex items-start -mt-16 mb-6">
                            <div className="relative">
                                <div className="w-24 h-24 bg-white rounded-full p-1 shadow-xl">
                                    <div className="w-full h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                                        <User className="w-10 h-10 text-white" />
                                    </div>
                                </div>
                                {isEditing && (
                                    <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                                        <Camera className="w-4 h-4 text-white" />
                                    </button>
                                )}
                            </div>
                            <div className="ml-6 mt-16 flex-1">
                                {isEditing ? (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                            <input
                                                type="text"
                                                value={editForm.name}
                                                onChange={(e) => handleInputChange('name', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                            <input
                                                type="email"
                                                value={editForm.email}
                                                onChange={(e) => handleInputChange('email', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                            <input
                                                type="text"
                                                value={editForm.location}
                                                onChange={(e) => handleInputChange('location', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                            <input
                                                type="tel"
                                                value={editForm.phone}
                                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <h2 className="text-2xl font-bold text-gray-900">{profile.name}</h2>
                                        <div className="flex items-center text-gray-600 mt-1">
                                            <Mail className="w-4 h-4 mr-2" />
                                            {profile.email}
                                        </div>
                                        <div className="flex items-center text-gray-600 mt-1">
                                            <MapPin className="w-4 h-4 mr-2" />
                                            {profile.location}
                                        </div>
                                        <div className="flex items-center text-gray-600 mt-1">
                                            <Phone className="w-4 h-4 mr-2" />
                                            {profile.phone}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard
                        icon={<FileText className="w-6 h-6 text-white" />}
                        value={profile.stats.totalRequests}
                        label="Total Requests"
                        color="blue"
                    />
                    <StatCard
                        icon={<Heart className="w-6 h-6 text-white" />}
                        value={profile.stats.successfulPickups}
                        label="Successful Pickups"
                        color="green"
                    />
                    <StatCard
                        icon={<TrendingUp className="w-6 h-6 text-white" />}
                        value={`${profile.stats.successRate}%`}
                        label="Success Rate"
                        color="purple"
                    />
                </div>

                {/* Food Preferences */}
                <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-orange-50 to-red-50 px-8 py-6 border-b border-orange-100">
                        <h3 className="text-xl font-bold text-gray-900 flex items-center">
                            <Heart className="w-6 h-6 mr-3 text-orange-500" />
                            Food Preferences
                        </h3>
                    </div>
                    <div className="p-8 space-y-6">
                        {/* Preferred Food Types */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="font-semibold text-gray-900">Preferred Food Types</h4>
                                <button
                                    onClick={() => {
                                        setPreferenceType('foodTypes');
                                        setShowAddPreference(!showAddPreference);
                                    }}
                                    className="text-blue-500 hover:text-blue-600 font-medium flex items-center text-sm"
                                >
                                    <Plus className="w-4 h-4 mr-1" />
                                    Add
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {profile.preferences.foodTypes.map((type) => (
                                    <span
                                        key={type}
                                        className="px-4 py-2 bg-green-100 text-green-700 rounded-xl font-medium flex items-center group hover:bg-green-200 transition-colors"
                                    >
                                        {type}
                                        <button
                                            onClick={() => handleRemovePreference('foodTypes', type)}
                                            className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Dietary Restrictions */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="font-semibold text-gray-900">Dietary Restrictions</h4>
                                <button
                                    onClick={() => {
                                        setPreferenceType('dietaryRestrictions');
                                        setShowAddPreference(!showAddPreference);
                                    }}
                                    className="text-blue-500 hover:text-blue-600 font-medium flex items-center text-sm"
                                >
                                    <Plus className="w-4 h-4 mr-1" />
                                    Add
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {profile.preferences.dietaryRestrictions.map((restriction) => (
                                    <span
                                        key={restriction}
                                        className="px-4 py-2 bg-orange-100 text-orange-700 rounded-xl font-medium flex items-center group hover:bg-orange-200 transition-colors"
                                    >
                                        {restriction}
                                        <button
                                            onClick={() => handleRemovePreference('dietaryRestrictions', restriction)}
                                            className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Add Preference Form */}
                        {showAddPreference && (
                            <div className="bg-gray-50 rounded-xl p-4">
                                <div className="flex items-center space-x-2 mb-3">
                                    <input
                                        type="text"
                                        placeholder={`Add new ${preferenceType.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
                                        value={newPreference}
                                        onChange={(e) => setNewPreference(e.target.value)}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        onKeyPress={(e) => e.key === 'Enter' && handleAddPreference()}
                                    />
                                    <button
                                        onClick={handleAddPreference}
                                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                                    >
                                        <Check className="w-4 h-4 mr-1" />
                                        Add
                                    </button>
                                    <button
                                        onClick={() => setShowAddPreference(false)}
                                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                                    >
                                        <X className="w-4 h-4 mr-1" />
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Notification Settings */}
                <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b border-blue-100">
                        <h3 className="text-xl font-bold text-gray-900 flex items-center">
                            <Bell className="w-6 h-6 mr-3 text-blue-500" />
                            Notification Settings
                        </h3>
                    </div>
                    <div className="p-8 space-y-6">
                        {[
                            {
                                key: 'newDonations' as keyof typeof profile.notifications,
                                title: 'New Donations',
                                description: 'Get notified of nearby donations',
                                icon: <Award className="w-5 h-5 text-blue-500" />
                            },
                            {
                                key: 'requestUpdates' as keyof typeof profile.notifications,
                                title: 'Request Updates',
                                description: 'Status changes on your requests',
                                icon: <FileText className="w-5 h-5 text-green-500" />
                            },
                            {
                                key: 'locationBased' as keyof typeof profile.notifications,
                                title: 'Location Based',
                                description: 'Donations within your radius',
                                icon: <MapPin className="w-5 h-5 text-orange-500" />
                            }
                        ].map((setting) => (
                            <div key={setting.key} className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-colors">
                                <div className="flex items-center space-x-4">
                                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                                        {setting.icon}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">{setting.title}</h4>
                                        <p className="text-gray-600 text-sm">{setting.description}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleNotificationToggle(setting.key)}
                                    className={`w-12 h-6 rounded-full transition-all duration-300 ${profile.notifications[setting.key]
                                        ? 'bg-green-500'
                                        : 'bg-gray-300'
                                        }`}
                                >
                                    <div
                                        className={`w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${profile.notifications[setting.key]
                                            ? 'translate-x-6'
                                            : 'translate-x-0.5'
                                            }`}
                                    />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Account Settings */}
                <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-gray-50 to-slate-50 px-8 py-6 border-b border-gray-100">
                        <h3 className="text-xl font-bold text-gray-900 flex items-center">
                            <Settings className="w-6 h-6 mr-3 text-gray-500" />
                            Account
                        </h3>
                    </div>
                    <div className="p-8 space-y-2">
                        {[
                            {
                                title: 'Account Settings',
                                icon: <Settings className="w-5 h-5 text-gray-500" />,
                                onClick: () => toast.info('Account settings feature coming soon!')
                            },
                            {
                                title: 'Privacy & Security',
                                icon: <Shield className="w-5 h-5 text-gray-500" />,
                                onClick: () => toast.info('Privacy settings feature coming soon!')
                            },
                            {
                                title: 'Help & Support',
                                icon: <HelpCircle className="w-5 h-5 text-gray-500" />,
                                onClick: () => toast.info('Help & support feature coming soon!')
                            }
                        ].map((item) => (
                            <button
                                key={item.title}
                                onClick={item.onClick}
                                className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-colors text-left"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                                        {item.icon}
                                    </div>
                                    <span className="font-medium text-gray-900">{item.title}</span>
                                </div>
                                <ArrowLeft className="w-5 h-5 text-gray-400 rotate-180" />
                            </button>
                        ))}

                        {/* Sign Out Button */}
                        <button
                            onClick={handleSignOut}
                            className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-red-50 transition-colors text-left mt-4"
                        >
                            <div className="flex items-center space-x-4">
                                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                                    <LogOut className="w-5 h-5 text-red-500" />
                                </div>
                                <span className="font-medium text-red-600">Sign Out</span>
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom Navigation */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200/50 px-4 py-2">
                <div className="max-w-4xl mx-auto">
                    <div className="grid grid-cols-5 gap-1">
                        <button className="flex flex-col items-center py-2 px-1 text-gray-600">
                            <Home className="w-5 h-5 mb-1" />
                            <span className="text-xs font-medium">Home</span>
                        </button>
                        <button className="flex flex-col items-center py-2 px-1 text-gray-600">
                            <MapPin className="w-5 h-5 mb-1" />
                            <span className="text-xs font-medium">Map</span>
                        </button>
                        <button className="flex flex-col items-center py-2 px-1 text-gray-600">
                            <FileText className="w-5 h-5 mb-1" />
                            <span className="text-xs font-medium">Requests</span>
                        </button>
                        <button className="flex flex-col items-center py-2 px-1 text-gray-600">
                            <MessageCircle className="w-5 h-5 mb-1" />
                            <span className="text-xs font-medium">Chat</span>
                        </button>
                        <button className="flex flex-col items-center py-2 px-1 text-blue-600">
                            <User className="w-5 h-5 mb-1" />
                            <span className="text-xs font-medium">Profile</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom padding */}
            <div className="h-20"></div>
        </div>
    );
}