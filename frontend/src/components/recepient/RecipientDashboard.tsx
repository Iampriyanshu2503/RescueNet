import React, { useState } from 'react';
import { Search, MapPin, Clock, Star, Users, Filter, Home, FileText, MessageCircle, User, Recycle, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FoodListing {
    id: string;
    title: string;
    restaurant: string;
    rating: number;
    quantity: number;
    pickup: {
        start: string;
        end: string;
    };
    location: {
        address: string;
        distance: string;
    };
    tags: string[];
    status: 'Fresh Today' | 'Expires Soon' | 'Urgent Pickup';
    image?: string;
    availableUntil: string;
    isPickupOnly?: boolean;
}

const mockListings: FoodListing[] = [
    {
        id: '1',
        title: 'Fresh Biryani & Raita',
        restaurant: 'Rajesh Biryani House',
        rating: 4.8,
        quantity: 25,
        pickup: { start: '11:00 AM', end: '1:00 PM' },
        location: { address: 'Sector V, Salt Lake', distance: '0.8 km' },
        tags: ['Vegetarian', 'Spicy', 'Halal'],
        status: 'Fresh Today',
        availableUntil: '12:00 PM - 2:00 PM'
    },
    {
        id: '2',
        title: 'South Indian Thali',
        restaurant: 'Priya\'s South Kitchen',
        rating: 4.9,
        quantity: 30,
        pickup: { start: '12:30 PM', end: '2:30 PM' },
        location: { address: 'Park Street', distance: '1.2 km' },
        tags: ['South Indian', 'Gluten-free'],
        status: 'Expires Soon',
        availableUntil: '1:05 PM - 3:30 PM'
    },
    {
        id: '3',
        title: 'Bengali Fish Curry',
        restaurant: 'Maa Durga Restaurant',
        rating: 4.6,
        quantity: 15,
        pickup: { start: '1:00 PM', end: '2:00 PM' },
        location: { address: 'New Market', distance: '2.1 km' },
        tags: ['Bengali', 'Non-Veg'],
        status: 'Urgent Pickup',
        availableUntil: 'Pickup Only',
        isPickupOnly: true
    }
];

export default function FoodListingsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('All Types');
    const [listings] = useState<FoodListing[]>(mockListings);

    const navigate = useNavigate();

    const filters = ['All Types', 'All Items', 'All Areas'];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Fresh Today':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'Expires Soon':
                return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'Urgent Pickup':
                return 'bg-red-100 text-red-700 border-red-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const handleRequest = (listingId: string) => {
        console.log('Requesting food listing:', listingId);
        navigate(`/food-listings/${listingId}`);
    };

    const handleViewDetails = (listingId: string) => {
        console.log('Viewing details for:', listingId);
    };

    const navigateToWastePickup = () => {
        console.log('Navigate to waste pickup page');
        navigate('/waste-to-energy');
    };

    const handleSearch = () => {
        console.log('Search functionality');
        // Focus on search input
        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
        if (searchInput) searchInput.focus();
    };

    const handleRequestHistory = () => {
        console.log('Navigate to request history');
        navigate('/request-history');
    };

    const handleChatSupport = () => {
        console.log('Navigate to chat support');
        navigate('/chat-support');
    };

    const handleProfile = () => {
        console.log('Navigate to profile');
        navigate('/recipient-profile');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between py-4">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mr-4">
                                <span className="text-white font-bold text-lg">H</span>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Hope Foundation</h1>
                                <div className="flex items-center">
                                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                    <span className="text-sm text-gray-600 ml-1">4.9 (99)</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={navigateToWastePickup}
                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center"
                        >
                            <Recycle className="w-4 h-4 mr-2" />
                            Waste Pickup
                        </button>
                    </div>
                </div>
            </div>

            {/* Action Tabs */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-3 gap-2 py-4">
                        <button
                            onClick={handleRequestHistory}
                            className="flex flex-col items-center p-4 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                        >
                            <FileText className="w-6 h-6 mb-2" />
                            <span className="text-sm font-medium">Request History</span>
                        </button>
                        <button
                            onClick={handleChatSupport}
                            className="flex flex-col items-center p-4 rounded-xl bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                        >
                            <MessageCircle className="w-6 h-6 mb-2" />
                            <span className="text-sm font-medium">Chat Support</span>
                        </button>
                        <button
                            onClick={navigateToWastePickup}
                            className="flex flex-col items-center p-4 rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors"
                        >
                            <Recycle className="w-6 h-6 mb-2" />
                            <span className="text-sm font-medium">Waste Pickup</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Section Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Live Food Listings</h2>
                        <p className="text-green-600 font-medium mt-1 flex items-center">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                            3 Available
                        </p>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="mb-6 space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search food items or restaurants..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        />
                    </div>

                    <div className="flex space-x-2 overflow-x-auto pb-2">
                        {filters.map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setSelectedFilter(filter)}
                                className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition-all ${selectedFilter === filter
                                    ? 'bg-blue-500 text-white shadow-md'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                    }`}
                            >
                                {filter}
                            </button>
                        ))}
                        <button className="px-4 py-2 rounded-full whitespace-nowrap font-medium bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 flex items-center">
                            <Filter className="w-4 h-4 mr-2" />
                            More Filters
                        </button>
                    </div>
                </div>

                {/* Food Listings */}
                <div className="space-y-4">
                    {listings.map((listing) => (
                        <div key={listing.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                            <div className="p-6">
                                <div className="flex items-start space-x-4">
                                    {/* Food Image */}
                                    <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                        {listing.image ? (
                                            <img src={listing.image} alt={listing.title} className="w-full h-full object-cover rounded-xl" />
                                        ) : (
                                            <div className="text-gray-400 text-2xl">🍽️</div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-bold text-gray-900 mb-1">{listing.title}</h3>
                                                <div className="flex items-center mb-2">
                                                    <span className="text-gray-600 text-sm">{listing.restaurant}</span>
                                                    <div className="flex items-center ml-2">
                                                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                                        <span className="text-sm text-gray-600 ml-1">{listing.rating}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(listing.status)}`}>
                                                {listing.status}
                                            </span>
                                        </div>

                                        {/* Details */}
                                        <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
                                            <div className="flex items-center">
                                                <Users className="w-4 h-4 mr-2 text-gray-400" />
                                                <span>Quantity: {listing.quantity} portions</span>
                                            </div>
                                            <div className="flex items-center">
                                                <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                                                <span>{listing.location.address} • {listing.location.distance}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <Clock className="w-4 h-4 mr-2 text-gray-400" />
                                                <span>Pickup: {listing.pickup.start} - {listing.pickup.end}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <Clock className="w-4 h-4 mr-2 text-gray-400" />
                                                <span>{listing.availableUntil}</span>
                                            </div>
                                        </div>

                                        {/* Tags */}
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {listing.tags.map((tag) => (
                                                <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                                                    {tag}
                                                </span>
                                            ))}
                                            {listing.isPickupOnly && (
                                                <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                                                    Pickup Only
                                                </span>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex space-x-3">
                                            <button
                                                onClick={() => handleRequest(listing.id)}
                                                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
                                            >
                                                Request
                                            </button>
                                            <button
                                                onClick={() => handleViewDetails(listing.id)}
                                                className="px-6 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                                            >
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Load More */}
                <div className="text-center mt-8">
                    <button className="bg-white border border-gray-200 text-gray-700 font-semibold py-3 px-8 rounded-xl hover:bg-gray-50 transition-colors">
                        Load More Listings
                    </button>
                </div>
            </div>

            {/* Bottom Navigation */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-5 gap-1">
                        <button
                            onClick={() => navigate('/recipient-dashboard')}
                            className="flex flex-col items-center py-2 px-1 text-blue-600"
                        >
                            <Home className="w-5 h-5 mb-1" />
                            <span className="text-xs font-medium">Home</span>
                        </button>
                        <button
                            onClick={handleSearch}
                            className="flex flex-col items-center py-2 px-1 text-gray-600 hover:text-blue-600 transition-colors"
                        >
                            <Search className="w-5 h-5 mb-1" />
                            <span className="text-xs font-medium">Search</span>
                        </button>
                        <button
                            onClick={handleRequestHistory}
                            className="flex flex-col items-center py-2 px-1 text-gray-600 hover:text-blue-600 transition-colors"
                        >
                            <FileText className="w-5 h-5 mb-1" />
                            <span className="text-xs font-medium">Requests</span>
                        </button>
                        <button
                            onClick={handleChatSupport}
                            className="flex flex-col items-center py-2 px-1 text-gray-600 hover:text-blue-600 transition-colors"
                        >
                            <MessageCircle className="w-5 h-5 mb-1" />
                            <span className="text-xs font-medium">Chat</span>
                        </button>
                        <button
                            onClick={handleProfile}
                            className="flex flex-col items-center py-2 px-1 text-gray-600 hover:text-blue-600 transition-colors"
                        >
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
