import React, { useState } from 'react';
import {
    ArrowLeft,
    User,
    Mail,
    Phone,
    MapPin,
    Star,
    Settings,
    Bell,
    Shield,
    HelpCircle,
    LogOut,
    Edit3,
    Camera,
    Package,
    Users,
    Calendar,
    Award,
    Heart,
    MessageCircle,
    ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UserProfile {
    name: string;
    email: string;
    phone: string;
    organization: string;
    address: string;
    profileImage?: string;
    rating: number;
    reviewCount: number;
    joinDate: string;
    stats: {
        totalRequests: number;
        successfulPickups: number;
        peopleFed: number;
        monthsActive: number;
    };
}

const mockProfile: UserProfile = {
    name: 'Hope Foundation',
    email: 'contact@hopefoundation.org',
    phone: '+1 (555) 123-4567',
    organization: 'Non-Profit Organization',
    address: '123 Community Street, Downtown, NY 10001',
    rating: 4.9,
    reviewCount: 99,
    joinDate: 'March 2023',
    stats: {
        totalRequests: 156,
        successfulPickups: 148,
        peopleFed: 2340,
        monthsActive: 8
    }
};

const RecipientProfile: React.FC = () => {
    const navigate = useNavigate();
    const [profile] = useState<UserProfile>(mockProfile);
    const [isEditing, setIsEditing] = useState(false);

    const handleBack = () => {
        navigate('/recipient-dashboard');
    };

    const handleEditProfile = () => {
        setIsEditing(!isEditing);
    };

    const handleSaveProfile = () => {
        setIsEditing(false);
        // Save profile logic here
    };

    const handleLogout = () => {
        console.log('Logout user');
        navigate('/login');
    };

    const menuItems = [
        {
            icon: Bell,
            title: 'Notifications',
            subtitle: 'Manage your notification preferences',
            action: () => console.log('Open notifications settings')
        },
        {
            icon: Shield,
            title: 'Privacy & Security',
            subtitle: 'Control your privacy settings',
            action: () => console.log('Open privacy settings')
        },
        {
            icon: HelpCircle,
            title: 'Help & Support',
            subtitle: 'Get help and contact support',
            action: () => console.log('Open help center')
        },
        {
            icon: MessageCircle,
            title: 'Feedback',
            subtitle: 'Share your thoughts with us',
            action: () => console.log('Open feedback form')
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            {/* Header */}
            <div className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-white/20 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center py-4">
                        <button
                            onClick={handleBack}
                            className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-all duration-300 hover:scale-110"
                        >
                            <ArrowLeft className="w-6 h-6 text-gray-600" />
                        </button>
                        <div className="flex-1">
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Profile</h1>
                            <p className="text-sm text-gray-600 mt-1 hidden sm:block">Manage your account and preferences</p>
                        </div>
                        <button
                            onClick={handleEditProfile}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-xl font-semibold transition-all duration-300 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg flex items-center"
                        >
                            <Edit3 className="w-4 h-4 mr-1 sm:mr-2" />
                            <span className="hidden sm:inline">{isEditing ? 'Save' : 'Edit'}</span>
                            <span className="sm:hidden">{isEditing ? 'Save' : 'Edit'}</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
                {/* Profile Card */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 sm:p-8 text-white">
                        <div className="flex items-center space-x-4 sm:space-x-6">
                            <div className="relative">
                                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/20 rounded-full flex items-center justify-center">
                                    {profile.profileImage ? (
                                        <img
                                            src={profile.profileImage}
                                            alt={profile.name}
                                            className="w-full h-full object-cover rounded-full"
                                        />
                                    ) : (
                                        <User className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                                    )}
                                </div>
                                {isEditing && (
                                    <button className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors">
                                        <Camera className="w-4 h-4 text-white" />
                                    </button>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h2 className="text-xl sm:text-2xl font-bold mb-1">{profile.name}</h2>
                                <p className="text-blue-100 text-sm sm:text-base mb-2">{profile.organization}</p>
                                <div className="flex items-center">
                                    <Star className="w-4 h-4 text-yellow-300 fill-current" />
                                    <span className="text-white/90 text-sm ml-1">{profile.rating} ({profile.reviewCount} reviews)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="p-6">
                        {/* Contact Information */}
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <Mail className="w-5 h-5 text-gray-400" />
                                {isEditing ? (
                                    <input
                                        type="email"
                                        defaultValue={profile.email}
                                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                ) : (
                                    <span className="text-gray-700">{profile.email}</span>
                                )}
                            </div>
                            <div className="flex items-center space-x-3">
                                <Phone className="w-5 h-5 text-gray-400" />
                                {isEditing ? (
                                    <input
                                        type="tel"
                                        defaultValue={profile.phone}
                                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                ) : (
                                    <span className="text-gray-700">{profile.phone}</span>
                                )}
                            </div>
                            <div className="flex items-start space-x-3">
                                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                                {isEditing ? (
                                    <textarea
                                        defaultValue={profile.address}
                                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        rows={2}
                                    />
                                ) : (
                                    <span className="text-gray-700">{profile.address}</span>
                                )}
                            </div>
                        </div>
                        
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <p className="text-sm text-gray-500">
                                Member since {profile.joinDate} • Verified Organization
                            </p>
                        </div>
                    </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 text-center shadow-lg border border-white/20">
                        <Package className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-gray-900">{profile.stats.totalRequests}</div>
                        <div className="text-sm text-gray-600">Total Requests</div>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 text-center shadow-lg border border-white/20">
                        <Award className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-gray-900">{profile.stats.successfulPickups}</div>
                        <div className="text-sm text-gray-600">Successful Pickups</div>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 text-center shadow-lg border border-white/20">
                        <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-gray-900">{profile.stats.peopleFed.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">People Fed</div>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 text-center shadow-lg border border-white/20">
                        <Calendar className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-gray-900">{profile.stats.monthsActive}</div>
                        <div className="text-sm text-gray-600">Months Active</div>
                    </div>
                </div>

                {/* Impact Card */}
                <div className="bg-gradient-to-r from-green-50/80 to-blue-50/80 backdrop-blur-sm rounded-2xl p-6 border border-green-200/50 shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                        <Heart className="w-6 h-6 text-green-600" />
                        <h3 className="text-lg font-semibold text-gray-900">Your Impact</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                        <div>
                            <div className="text-2xl font-bold text-green-600">98%</div>
                            <div className="text-sm text-gray-600">Success Rate</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-blue-600">1.2 tons</div>
                            <div className="text-sm text-gray-600">Food Rescued</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-purple-600">4.8★</div>
                            <div className="text-sm text-gray-600">Community Rating</div>
                        </div>
                    </div>
                </div>

                {/* Menu Items */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
                    <div className="p-4 sm:p-6 border-b border-gray-200/50">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                            <Settings className="w-5 h-5 mr-2 text-blue-600" />
                            Settings & Support
                        </h3>
                    </div>
                    <div className="divide-y divide-gray-200/50">
                        {menuItems.map((item, index) => (
                            <button
                                key={index}
                                onClick={item.action}
                                className="w-full flex items-center justify-between p-4 sm:p-6 hover:bg-gray-50/80 transition-colors text-left"
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <item.icon className="w-5 h-5 text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{item.title}</p>
                                        <p className="text-sm text-gray-600">{item.subtitle}</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-400" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Logout Button */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center p-4 sm:p-6 text-red-600 hover:bg-red-50/80 transition-colors"
                    >
                        <LogOut className="w-5 h-5 mr-3" />
                        <span className="font-medium">Log Out</span>
                    </button>
                </div>
            </div>

            {/* Bottom padding for navigation */}
            <div className="h-20"></div>
        </div>
    );
};

export default RecipientProfile;
