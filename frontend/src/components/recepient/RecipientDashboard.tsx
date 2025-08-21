import React, { useState } from 'react';
import { Search, MapPin, Clock, Star, Users, Filter, Home, FileText, MessageCircle, User, Recycle } from 'lucide-react';
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
        console.log('Navigate to search page');
        navigate('/search');
    };

    const handleRequestHistory = () => {
        console.log('Navigate to pickup history');
        navigate('/pickup-history');
    };

    const handleChatSupport = () => {
        console.log('Opening chat support');
        // For now, provide contact information until full chat is implemented
        const contactInfo = 'Chat Support\\n\\nFor immediate assistance:\\n📞 Phone: +1 (555) 123-HELP\\n📧 Email: support@foodshare.org\\n\\nLive chat coming soon!';
        alert(contactInfo);
    };

    const handleProfile = () => {
        console.log('Navigate to recipient profile');
        navigate('/recipient-profile');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between py-3 sm:py-4">
                        <div className="flex items-center min-w-0 flex-1">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
                                <span className="text-white font-bold text-base sm:text-lg">H</span>
                            </div>
                            <div className="min-w-0 flex-1">
                                <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">Hope Foundation</h1>
                                <div className="flex items-center">
                                    <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
                                    <span className="text-xs sm:text-sm text-gray-600 ml-1">4.9 (99 reviews)</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={navigateToWastePickup}
                            className="bg-green-500 hover:bg-green-600 active:scale-95 text-white px-3 sm:px-4 py-2 rounded-lg font-semibold transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg flex items-center ml-2"
                        >
                            <Recycle className="w-4 h-4 mr-1 sm:mr-2" />
                            <span className="hidden sm:inline">Waste Pickup</span>
                            <span className="sm:hidden">Pickup</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Action Tabs */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-3 gap-2 sm:gap-3 py-3 sm:py-4">
                        <button
                            onClick={handleRequestHistory}
                            className="flex flex-col items-center p-3 sm:p-4 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 active:bg-blue-200 transition-all duration-300 hover:scale-105 active:scale-95"
                        >
                            <FileText className="w-5 h-5 sm:w-6 sm:h-6 mb-1 sm:mb-2" />
                            <span className="text-xs sm:text-sm font-medium text-center leading-tight">Request History</span>
                        </button>
                        <button
                            onClick={handleChatSupport}
                            className="flex flex-col items-center p-3 sm:p-4 rounded-xl bg-green-50 text-green-600 hover:bg-green-100 active:bg-green-200 transition-all duration-300 hover:scale-105 active:scale-95"
                        >
                            <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 mb-1 sm:mb-2" />
                            <span className="text-xs sm:text-sm font-medium text-center leading-tight">Chat Support</span>
                        </button>
                        <button
                            onClick={navigateToWastePickup}
                            className="flex flex-col items-center p-3 sm:p-4 rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-100 active:bg-orange-200 transition-all duration-300 hover:scale-105 active:scale-95"
                        >
                            <Recycle className="w-5 h-5 sm:w-6 sm:h-6 mb-1 sm:mb-2" />
                            <span className="text-xs sm:text-sm font-medium text-center leading-tight">Waste Pickup</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                {/* Section Header */}
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Live Food Listings</h2>
                        <p className="text-green-600 font-medium mt-1 flex items-center text-sm sm:text-base">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                            3 Available Near You
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/search')}
                        className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 sm:px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105 active:scale-95 flex items-center"
                    >
                        <Search className="w-4 h-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">Advanced Search</span>
                        <span className="sm:hidden">Search</span>
                    </button>
                </div>

                {/* Search and Filters */}
                <div className="mb-4 sm:mb-6 space-y-3 sm:space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search food items, restaurants, or cuisine..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 sm:py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm hover:shadow-md transition-all duration-300 text-sm sm:text-base"
                        />
                    </div>

                    <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                        {filters.map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setSelectedFilter(filter)}
                                className={`px-3 sm:px-4 py-2 rounded-full whitespace-nowrap font-medium transition-all duration-300 hover:scale-105 active:scale-95 text-sm sm:text-base ${selectedFilter === filter
                                    ? 'bg-blue-500 text-white shadow-md hover:bg-blue-600'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                                    }`}
                            >
                                {filter}
                            </button>
                        ))}
                        <button className="px-3 sm:px-4 py-2 rounded-full whitespace-nowrap font-medium bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center text-sm sm:text-base">
                            <Filter className="w-4 h-4 mr-1 sm:mr-2" />
                            More Filters
                        </button>
                    </div>
                </div>

                {/* Food Listings */}
                <div className="space-y-3 sm:space-y-4">
                    {listings.map((listing) => (
                        <div key={listing.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:scale-[1.01] transition-all duration-300">
                            <div className="p-4 sm:p-6">
                                <div className="flex items-start space-x-3 sm:space-x-4">
                                    {/* Food Image */}
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center flex-shrink-0 shadow-inner">
                                        {listing.image ? (
                                            <img src={listing.image} alt={listing.title} className="w-full h-full object-cover rounded-xl" />
                                        ) : (
                                            <div className="text-gray-400 text-xl sm:text-2xl">🍽️</div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1 truncate">{listing.title}</h3>
                                                <div className="flex items-center mb-2">
                                                    <span className="text-gray-600 text-sm truncate">{listing.restaurant}</span>
                                                    <div className="flex items-center ml-2 flex-shrink-0">
                                                        <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
                                                        <span className="text-xs sm:text-sm text-gray-600 ml-1">{listing.rating}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ml-2 ${getStatusColor(listing.status)}`}>
                                                {listing.status}
                                            </span>
                                        </div>

                                        {/* Details - Mobile Optimized */}
                                        <div className="space-y-2 mb-3 sm:mb-4 text-xs sm:text-sm text-gray-600">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                <div className="flex items-center">
                                                    <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-gray-400 flex-shrink-0" />
                                                    <span className="truncate">{listing.quantity} portions available</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-gray-400 flex-shrink-0" />
                                                    <span className="truncate">{listing.location.address} • {listing.location.distance}</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-gray-400 flex-shrink-0" />
                                                    <span className="truncate">Pickup: {listing.pickup.start} - {listing.pickup.end}</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-green-500 flex-shrink-0" />
                                                    <span className="truncate font-medium text-green-600">{listing.availableUntil}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Tags */}
                                        <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4">
                                            {listing.tags.slice(0, 3).map((tag) => (
                                                <span key={tag} className="px-2 sm:px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                                                    {tag}
                                                </span>
                                            ))}
                                            {listing.tags.length > 3 && (
                                                <span className="px-2 sm:px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                                                    +{listing.tags.length - 3} more
                                                </span>
                                            )}
                                            {listing.isPickupOnly && (
                                                <span className="px-2 sm:px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                                                    Pickup Only
                                                </span>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex space-x-2 sm:space-x-3">
                                            <button
                                                onClick={() => handleRequest(listing.id)}
                                                className="flex-1 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg text-sm sm:text-base"
                                            >
                                                Request Now
                                            </button>
                                            <button
                                                onClick={() => handleViewDetails(listing.id)}
                                                className="px-4 sm:px-6 py-2.5 sm:py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md text-sm sm:text-base"
                                            >
                                                Details
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
