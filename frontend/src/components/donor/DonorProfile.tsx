import React, { useState, useEffect } from 'react';
import authService from '../../services/authService';
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
    const [activeTab, setActiveTab] = useState<'profile' | 'settings'>('profile');
    const [activeStatus, setActiveStatus] = useState<'active' | 'inactive'>('active');
    const [profile, setProfile] = useState<DonorProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        organization: ''
    });

    // Handle input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Initialize form data when profile is loaded or editing is enabled
    useEffect(() => {
        if (profile && isEditing) {
            setFormData({
                firstName: profile.firstName || '',
                lastName: profile.lastName || '',
                email: profile.email || '',
                phone: profile.phone || '',
                address: profile.address || '',
                organization: profile.organization || ''
            });
        }
    }, [profile, isEditing]);

    // Handle form submission
    const handleSubmit = async () => {
        const userId = getCurrentUserId();
        if (!userId) {
            setError("User ID not found. Please log in again.");
            return;
        }

        try {
            if (profile) {
                setLoading(true);
                const response = await fetch(`/api/donors/${userId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                if (result.success) {
                    setProfile(prev => (prev ? { ...prev, ...formData } : prev));
                    setIsEditing(false);
                } else {
                    setError(result.message || "Failed to update profile");
                }
            }
        } catch (err) {
            setError("An error occurred while updating profile");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Get current user ID
    const getCurrentUserId = (): string | null => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                if (user && user._id) return user._id;
            } catch (e) {
                console.error('Error parsing user from localStorage:', e);
            }
        }
        const token = localStorage.getItem('token');
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

    // Fetch donor profile
    const fetchDonorProfile = async () => {
        try {
            setLoading(true);
            setError(null);

            const storedUser = authService.getStoredUser();
            if (storedUser) {
                setProfile({
                    _id: storedUser._id,
                    firstName: storedUser.name?.split(' ')[0] || storedUser.name || '',
                    lastName: storedUser.name?.split(' ')[1] || '',
                    email: storedUser.email,
                    phone: storedUser.phone || '',
                    address: storedUser.address || '',
                    organization: storedUser.organization || 'other',
                    joinDate: storedUser.createdAt || new Date().toISOString(),
                    totalDonations: storedUser.totalDonations || 0,
                    mealsServed: storedUser.mealsServed || 0,
                    impactScore: storedUser.impactScore || 0,
                    status: 'active',
                    createdAt: storedUser.createdAt || new Date().toISOString(),
                    updatedAt: storedUser.updatedAt || new Date().toISOString(),
                });
                setLoading(false);
                return;
            }

            try {
                const user = await authService.getProfile();
                setProfile({
                    _id: user._id,
                    firstName: user.name?.split(' ')[0] || user.name || '',
                    lastName: user.name?.split(' ')[1] || '',
                    email: user.email,
                    phone: user.phone || '',
                    address: user.address || '',
                    organization: user.organization || 'other',
                    joinDate: user.createdAt || new Date().toISOString(),
                    totalDonations: user.totalDonations || 0,
                    mealsServed: user.mealsServed || 0,
                    impactScore: user.impactScore || 0,
                    status: 'active',
                    createdAt: user.createdAt || new Date().toISOString(),
                    updatedAt: user.updatedAt || new Date().toISOString(),
                });
            } catch (apiError) {
                console.error('API error:', apiError);
                const fallbackUser = {
                    _id: 'temp-id',
                    name: 'User',
                    email: 'user@example.com',
                    organization: 'restaurant',
                    createdAt: new Date().toISOString()
                };
                setProfile({
                    _id: fallbackUser._id,
                    firstName: fallbackUser.name?.split(' ')[0] || fallbackUser.name || '',
                    lastName: fallbackUser.name?.split(' ')[1] || '',
                    email: fallbackUser.email,
                    phone: '',
                    address: '',
                    organization: fallbackUser.organization || 'restaurant',
                    joinDate: fallbackUser.createdAt || new Date().toISOString(),
                    totalDonations: 0,
                    mealsServed: 0,
                    impactScore: 0,
                    status: 'active',
                    createdAt: fallbackUser.createdAt || new Date().toISOString(),
                    updatedAt: fallbackUser.createdAt || new Date().toISOString(),
                });
            }
        } catch (err) {
            console.error('Profile loading error:', err);
            setError('Error loading profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDonorProfile();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'verified': return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200 transition-colors';
            case 'active': return 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200 transition-colors';
            case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200 transition-colors';
            default: return 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200 transition-colors';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'verified': return '✅';
            case 'active': return '🟢';
            case 'inactive': return '⚪';
            default: return '⏳';
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // UI
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-red-600">{error}</p>
            </div>
        );
    }
    if (!profile) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>No profile data found.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <button className="p-2 hover:bg-gray-100 rounded-full">
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-xl font-semibold">Donor Profile</h1>
                            <p className="text-sm text-gray-500">Manage your donation profile</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        {activeTab === 'profile' && (
                            <button
                                onClick={() => (isEditing ? handleSubmit() : setIsEditing(true))}
                                className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                            >
                                <Edit3 className="w-4 h-4 mr-2" />
                                {isEditing ? 'Save Changes' : 'Edit Profile'}
                            </button>
                        )}
                        <button
                            onClick={() => setActiveTab(activeTab === 'profile' ? 'settings' : 'profile')}
                            className="p-2 hover:bg-gray-100 rounded-full"
                        >
                            <Settings className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main */}
            <div className="max-w-4xl mx-auto p-4 space-y-6">
                {/* Profile card */}
                <div className="bg-white rounded-2xl shadow-lg p-6 relative">
                    <div className="absolute -top-12 left-6">
                        <div className="w-24 h-24 bg-white rounded-2xl shadow-lg flex items-center justify-center border-4 border-white">
                            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                                <Heart className="w-8 h-8 text-white" />
                            </div>
                        </div>
                    </div>
                    <div className="absolute -top-3 right-6">
                        <button
                            onClick={() => setActiveStatus(activeStatus === 'active' ? 'inactive' : 'active')}
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(activeStatus)}`}
                        >
                            <span className="mr-1">{getStatusIcon(activeStatus)}</span>
                            {activeStatus.charAt(0).toUpperCase() + activeStatus.slice(1)}
                        </button>
                    </div>

                    <div className="pt-16">
                        {isEditing ? (
                            <form className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input name="firstName" value={formData.firstName} onChange={handleInputChange} className="border p-2 rounded" placeholder="First Name" />
                                    <input name="lastName" value={formData.lastName} onChange={handleInputChange} className="border p-2 rounded" placeholder="Last Name" />
                                    <input name="email" value={formData.email} onChange={handleInputChange} className="border p-2 rounded" placeholder="Email" />
                                    <input name="phone" value={formData.phone} onChange={handleInputChange} className="border p-2 rounded" placeholder="Phone" />
                                    <textarea name="address" value={formData.address} onChange={handleInputChange} className="border p-2 rounded col-span-2" placeholder="Address" />
                                    <select name="organization" value={formData.organization} onChange={handleInputChange} className="border p-2 rounded">
                                        {Object.entries(ORGANIZATION_LABELS).map(([key, label]) => (
                                            <option key={key} value={key}>{label}</option>
                                        ))}
                                    </select>
                                </div>
                            </form>
                        ) : (
                            <div>
                                <h2 className="text-2xl font-bold">{profile.firstName} {profile.lastName}</h2>
                                <p className="text-blue-600">{ORGANIZATION_LABELS[profile.organization]} Donor</p>
                                <p className="text-gray-500 text-sm flex items-center mt-1">
                                    <Calendar className="w-4 h-4 mr-1" />
                                    Member since {formatDate(profile.createdAt || profile.joinDate)}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <p className="text-gray-500">Total Donations</p>
                        <p className="text-2xl font-bold">{profile.totalDonations}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <p className="text-gray-500">Meals Served</p>
                        <p className="text-2xl font-bold">{profile.mealsServed}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <p className="text-gray-500">Impact Score</p>
                        <p className="text-2xl font-bold">{profile.impactScore}</p>
                    </div>
                </div>

                {/* Contact Info */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                    <p>Email: {profile.email}</p>
                    <p>Phone: {profile.phone}</p>
                    <p>Address: {profile.address}</p>
                    <p>Organization: {ORGANIZATION_LABELS[profile.organization]}</p>
                </div>
            </div>
        </div>
    );
}
