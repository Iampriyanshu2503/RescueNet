import React, { useState } from 'react';
import {
    ArrowLeft,
    Calendar,
    MapPin,
    Clock,
    Star,
    Package,
    CheckCircle,
    AlertCircle,
    XCircle,
    Filter,
    Search,
    Users,
    MessageCircle,
    Phone,
    ChevronDown,
    MoreVertical
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PickupRecord {
    id: string;
    title: string;
    restaurant: string;
    date: string;
    time: string;
    quantity: number;
    location: string;
    status: 'completed' | 'cancelled' | 'no-show' | 'pending';
    rating?: number;
    review?: string;
    contactPhone?: string;
    peopleFed?: number;
    tags: string[];
}

const mockHistory: PickupRecord[] = [
    {
        id: '1',
        title: 'Fresh Salads & Sandwiches',
        restaurant: 'Green Bistro',
        date: '2024-01-15',
        time: '2:30 PM',
        quantity: 15,
        location: 'Downtown Campus',
        status: 'completed',
        rating: 5,
        review: 'Excellent quality food, perfectly fresh!',
        contactPhone: '+1 (555) 123-4567',
        peopleFed: 18,
        tags: ['Vegetarian', 'Fresh']
    },
    {
        id: '2',
        title: 'Pizza Slices & Garlic Bread',
        restaurant: 'Tony\'s Pizzeria',
        date: '2024-01-12',
        time: '6:00 PM',
        quantity: 20,
        location: 'Park Street',
        status: 'completed',
        rating: 4,
        peopleFed: 25,
        tags: ['Italian', 'Hot Food']
    },
    {
        id: '3',
        title: 'Bengali Fish Curry',
        restaurant: 'Maa Durga Restaurant',
        date: '2024-01-10',
        time: '1:30 PM',
        quantity: 12,
        location: 'New Market',
        status: 'cancelled',
        tags: ['Bengali', 'Non-Veg']
    },
    {
        id: '4',
        title: 'Breakfast Items',
        restaurant: 'Morning Café',
        date: '2024-01-08',
        time: '9:00 AM',
        quantity: 8,
        location: 'Central Avenue',
        status: 'no-show',
        tags: ['Breakfast', 'Continental']
    }
];

const PickupHistory: React.FC = () => {
    const navigate = useNavigate();
    const [history] = useState<PickupRecord[]>(mockHistory);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedCard, setExpandedCard] = useState<string | null>(null);

    const handleBack = () => {
        navigate('/recipient-dashboard');
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'cancelled':
                return <XCircle className="w-5 h-5 text-red-500" />;
            case 'no-show':
                return <AlertCircle className="w-5 h-5 text-orange-500" />;
            default:
                return <Clock className="w-5 h-5 text-blue-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'cancelled':
                return 'bg-red-100 text-red-700 border-red-200';
            case 'no-show':
                return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'pending':
                return 'bg-blue-100 text-blue-700 border-blue-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'completed':
                return 'Completed';
            case 'cancelled':
                return 'Cancelled';
            case 'no-show':
                return 'No Show';
            case 'pending':
                return 'Pending';
            default:
                return 'Unknown';
        }
    };

    const filteredHistory = history.filter(record => {
        const matchesFilter = filterStatus === 'all' || record.status === filterStatus;
        const matchesSearch = record.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            record.restaurant.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const totalCompleted = history.filter(r => r.status === 'completed').length;
    const totalPeopleFed = history.reduce((sum, r) => sum + (r.peopleFed || 0), 0);

    const handleCall = (phone: string) => {
        window.open(`tel:${phone}`, '_self');
    };

    const handleMessage = (restaurant: string) => {
        console.log('Message restaurant:', restaurant);
    };

    const toggleExpanded = (id: string) => {
        setExpandedCard(expandedCard === id ? null : id);
    };

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
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Pickup History</h1>
                            <p className="text-sm text-gray-600 mt-1 hidden sm:block">Track your food pickup requests and history</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
                {/* Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 text-center shadow-lg border border-white/20">
                        <Package className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-gray-900">{history.length}</div>
                        <div className="text-sm text-gray-600">Total Requests</div>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 text-center shadow-lg border border-white/20">
                        <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-gray-900">{totalCompleted}</div>
                        <div className="text-sm text-gray-600">Completed</div>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 text-center shadow-lg border border-white/20 col-span-2 md:col-span-1">
                        <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-gray-900">{totalPeopleFed}</div>
                        <div className="text-sm text-gray-600">People Fed</div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4 sm:p-6">
                    <div className="space-y-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by restaurant or food item..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
                            />
                        </div>

                        {/* Status Filters */}
                        <div className="flex flex-wrap gap-2">
                            {['all', 'completed', 'cancelled', 'no-show', 'pending'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 ${
                                        filterStatus === status
                                            ? 'bg-blue-500 text-white shadow-md'
                                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                    }`}
                                >
                                    {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* History List */}
                <div className="space-y-4">
                    {filteredHistory.length === 0 ? (
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8 text-center">
                            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No records found</h3>
                            <p className="text-gray-600 mb-4">
                                {searchQuery || filterStatus !== 'all'
                                    ? 'Try adjusting your search or filters'
                                    : 'You haven\'t made any pickup requests yet'}
                            </p>
                            <button
                                onClick={handleBack}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
                            >
                                Browse Food Listings
                            </button>
                        </div>
                    ) : (
                        filteredHistory.map((record) => (
                            <div
                                key={record.id}
                                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-xl transition-all duration-300"
                            >
                                <div className="p-4 sm:p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                {getStatusIcon(record.status)}
                                                <h3 className="text-lg font-bold text-gray-900 truncate">{record.title}</h3>
                                            </div>
                                            <p className="text-gray-600 font-medium mb-1">{record.restaurant}</p>
                                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                                <div className="flex items-center">
                                                    <Calendar className="w-4 h-4 mr-1" />
                                                    {new Date(record.date).toLocaleDateString()}
                                                </div>
                                                <div className="flex items-center">
                                                    <Clock className="w-4 h-4 mr-1" />
                                                    {record.time}
                                                </div>
                                                <div className="flex items-center">
                                                    <Package className="w-4 h-4 mr-1" />
                                                    {record.quantity} portions
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 ml-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(record.status)}`}>
                                                {getStatusText(record.status)}
                                            </span>
                                            <button
                                                onClick={() => toggleExpanded(record.id)}
                                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                            >
                                                <ChevronDown 
                                                    className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
                                                        expandedCard === record.id ? 'rotate-180' : ''
                                                    }`} 
                                                />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Tags */}
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {record.tags.map((tag) => (
                                            <span key={tag} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Expanded Details */}
                                    {expandedCard === record.id && (
                                        <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                                            <div className="flex items-center text-sm text-gray-600">
                                                <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                                                {record.location}
                                            </div>

                                            {record.status === 'completed' && (
                                                <>
                                                    {record.peopleFed && (
                                                        <div className="flex items-center text-sm text-gray-600">
                                                            <Users className="w-4 h-4 mr-2 text-gray-400" />
                                                            Fed {record.peopleFed} people
                                                        </div>
                                                    )}

                                                    {record.rating && (
                                                        <div className="flex items-center">
                                                            <span className="text-sm text-gray-600 mr-2">Your Rating:</span>
                                                            <div className="flex">
                                                                {[1, 2, 3, 4, 5].map((star) => (
                                                                    <Star
                                                                        key={star}
                                                                        className={`w-4 h-4 ${
                                                                            star <= record.rating!
                                                                                ? 'text-yellow-400 fill-current'
                                                                                : 'text-gray-300'
                                                                        }`}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {record.review && (
                                                        <div className="bg-gray-50 rounded-xl p-3">
                                                            <p className="text-sm text-gray-700 italic">"{record.review}"</p>
                                                        </div>
                                                    )}
                                                </>
                                            )}

                                            {/* Contact Actions */}
                                            {record.contactPhone && record.status === 'completed' && (
                                                <div className="flex gap-3">
                                                    <button
                                                        onClick={() => handleCall(record.contactPhone!)}
                                                        className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                                                    >
                                                        <Phone className="w-4 h-4" />
                                                        Call Again
                                                    </button>
                                                    <button
                                                        onClick={() => handleMessage(record.restaurant)}
                                                        className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                                                    >
                                                        <MessageCircle className="w-4 h-4" />
                                                        Message
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Bottom padding for navigation */}
            <div className="h-20"></div>
        </div>
    );
};

export default PickupHistory;
