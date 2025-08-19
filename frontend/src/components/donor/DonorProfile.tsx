import React, { useState, useEffect } from 'react';
import {
    ArrowLeft,
    User,
    Mail,
    Phone,
    MapPin,
    Heart,
    Building,
    Edit3,
    Settings,
    Calendar,
    Award,
    TrendingUp,
    Package,
    Loader
} from 'lucide-react';

type DonorProfile = {
    _id?: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    organization: string;
    joinDate: string;
    totalDonations: number;
    mealsServed: number;
    impactScore: number;
    status: 'active' | 'verified' | 'pending';
    createdAt?: string;
    updatedAt?: string;
};

type ApiResponse = {
    success: boolean;
    data?: DonorProfile;
    message?: string;
    error?: string;
};

const ORGANIZATION_LABELS: { [key: string]: string } = {
    restaurant: 'Restaurant',
    cafe: 'Cafe',
    bakery: 'Bakery',
    canteen: 'Canteen',
    hotel: 'Hotel',
    catering: 'Catering Service',
    grocery: 'Grocery Store',
    supermarket: 'Supermarket',
    food_court: 'Food Court',
    individual: 'Individual',
    other: 'Other'
};

export default function DonorProfilePage() {
    const [isEditing, setIsEditing] = useState(false);
    const [profile, setProfile] = useState<DonorProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Get current user's token/ID from localStorage or context
    const getCurrentUserId = (): string | null => {
        // Method 1: From localStorage (if you store user ID)
        const userId = localStorage.getItem('userId');
        if (userId) return userId;

        // Method 2: From JWT token (if you store JWT)
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                return payload.userId || payload.id;
            } catch (e) {
                console.error('Error parsing token:', e);
            }
        }

        return null;
    };

    // Fetch donor profile from API
    const fetchDonorProfile = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch("http://localhost:5000/api/donors/me", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                credentials: "include", // 👈 sends cookie
            });

            if (!response.ok) {
                throw new Error(response.status === 401 ? "Please login again." : "Failed to fetch profile.");
            }

            const data: ApiResponse = await response.json();
            if (data.success && data.data) {
                setProfile(data.data);
            } else {
                throw new Error(data.message || "Failed to load profile");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unexpected error");
        } finally {
            setLoading(false);
        }
    };


    // Fetch profile on component mount
    useEffect(() => {
        fetchDonorProfile();
    }, []);

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center space-y-4">
                    <Loader className="w-8 h-8 animate-spin text-blue-500" />
                    <p className="text-gray-600">Loading your profile...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-red-500 text-2xl">⚠️</span>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Profile</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={fetchDonorProfile}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // No profile data
    if (!profile) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                    <p className="text-gray-600">No profile data found.</p>
                </div>
            </div>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'verified':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'active':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            default:
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'verified':
                return '✓';
            case 'active':
                return '●';
            default:
                return '⏳';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <ArrowLeft className="w-5 h-5 text-gray-600" />
                            </button>
                            <div>
                                <h1 className="text-xl font-semibold text-gray-800">Donor Profile</h1>
                                <p className="text-sm text-gray-500">Manage your donation profile</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            >
                                <Edit3 className="w-4 h-4" />
                                <span>Edit</span>
                            </button>
                            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <Settings className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-4 space-y-6">
                {/* Profile Header Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-32 relative">
                        <div className="absolute inset-0 bg-black/10"></div>
                    </div>
                    <div className="relative px-6 pb-6">
                        {/* Profile Avatar */}
                        <div className="absolute -top-12 left-6">
                            <div className="w-24 h-24 bg-white rounded-2xl shadow-lg flex items-center justify-center border-4 border-white">
                                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                                    <Heart className="w-8 h-8 text-white" />
                                </div>
                            </div>
                        </div>

                        {/* Status Badge */}
                        <div className="absolute -top-3 right-6">
                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(profile.status)}`}>
                                <span className="mr-1">{getStatusIcon(profile.status)}</span>
                                {profile.status.charAt(0).toUpperCase() + profile.status.slice(1)}
                            </div>
                        </div>

                        <div className="pt-16 space-y-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">
                                    {profile.firstName} {profile.lastName}
                                </h2>
                                <p className="text-blue-600 font-medium">
                                    {ORGANIZATION_LABELS[profile.organization]} Donor
                                </p>
                                <p className="text-gray-500 text-sm flex items-center mt-1">
                                    <Calendar className="w-4 h-4 mr-1" />
                                    Member since {formatDate(profile.createdAt || profile.joinDate)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200/50 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm font-medium">Total Donations</p>
                                <p className="text-2xl font-bold text-gray-800 mt-1">{profile.totalDonations}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <Package className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-green-600 text-sm">
                            <TrendingUp className="w-4 h-4 mr-1" />
                            +12% this month
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg border border-gray-200/50 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm font-medium">Meals Served</p>
                                <p className="text-2xl font-bold text-gray-800 mt-1">{profile.mealsServed}</p>
                            </div>
                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                <Heart className="w-6 h-6 text-orange-600" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-orange-600 text-sm">
                            <Award className="w-4 h-4 mr-1" />
                            Lives impacted
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg border border-gray-200/50 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm font-medium">Impact Score</p>
                                <p className="text-2xl font-bold text-gray-800 mt-1">{profile.impactScore}</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                        <div className="mt-4">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${profile.impactScore}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                        <User className="w-5 h-5 mr-2 text-blue-500" />
                        Contact Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                                <Mail className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-gray-700">Email Address</p>
                                    <p className="text-gray-600 break-all">{profile.email}</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                                <Phone className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Phone Number</p>
                                    <p className="text-gray-600">{profile.phone}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                                <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Address</p>
                                    <p className="text-gray-600 leading-relaxed">{profile.address}</p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                                <Building className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Organization Type</p>
                                    <p className="text-gray-600">{ORGANIZATION_LABELS[profile.organization]}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-6">Recent Activity</h3>

                    <div className="space-y-4">
                        {[
                            { action: 'Food donation completed', location: 'Downtown Community Center', time: '2 hours ago', type: 'donation' },
                            { action: 'Profile updated', location: 'Contact information', time: '1 day ago', type: 'update' },
                            { action: 'New recipient connected', location: 'Local Food Bank', time: '3 days ago', type: 'connection' },
                        ].map((activity, index) => (
                            <div key={index} className="flex items-center space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
                                <div className={`w-3 h-3 rounded-full ${activity.type === 'donation' ? 'bg-green-400' :
                                    activity.type === 'update' ? 'bg-blue-400' : 'bg-purple-400'
                                    }`}></div>
                                <div className="flex-1">
                                    <p className="text-gray-800 font-medium">{activity.action}</p>
                                    <p className="text-gray-500 text-sm">{activity.location}</p>
                                </div>
                                <p className="text-gray-400 text-sm">{activity.time}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}