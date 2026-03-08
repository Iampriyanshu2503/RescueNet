import React, { useState, useEffect } from 'react';
import { Search, MapPin, Clock, Star, Users, Filter, Home, FileText, MessageCircle, User, Recycle, Map, List, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { foodDonationService } from '../../services/foodDonationService';
import { FoodDonation } from '../../types/foodListing';
import FoodListingVisibility from '../common/FoodListingVisibility';
import InteractiveMap from '../maps/InteractiveMap';
import { showNotification } from '../../utils/notificationUtils';
import { handleExpiredListings, isListingExpired } from '../../utils/expirationUtils';
import useSocket from '../../hooks/useSocket';

export default function FoodListingsPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('All Types');
    const [listings, setListings] = useState<FoodDonation[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
    const [userLocation, setUserLocation] = useState(null);
    const [selectedListing, setSelectedListing] = useState(null);

    const navigate = useNavigate();
    const { notifications, getUnreadCount } = useSocket();

    const filters = ['All Types', 'Vegetarian', 'Non-Vegetarian', 'Vegan', 'Gluten-Free'];

    useEffect(() => {
        const fetchListings = async () => {
            try {
                setLoading(true);
                const data = await foodDonationService.getAll();
                // Filter only available listings that are not expired
                const availableListings = data.filter(listing => 
                    listing.status === 'available' && !isListingExpired(listing)
                );
                setListings(availableListings);
            } catch (error) {
                console.error('Failed to fetch food listings', error);
                showNotification.error('Failed to load food listings. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchListings();
    }, []);

    useEffect(() => {
        // Get user's current location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    console.log('Error getting location:', { code: error.code, message: error.message });
                    // Set default location (NYC)
                    setUserLocation({ lat: 40.7128, lng: -74.0060 });
                }
            );
        }
    }, []);

    const navigateToWastePickup = () => {
        navigate('/waste-to-energy');
    };

    const handleListingClick = (listing) => {
        setSelectedListing(listing);
        navigate(`/food-listings/${listing._id}`);
    };

    // Filter listings based on search query and selected filter
    const filteredListings = listings.filter(listing => {
        const matchesSearch = searchQuery === '' || 
            listing.foodType.toLowerCase().includes(searchQuery.toLowerCase()) ||
            listing.description.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesFilter = selectedFilter === 'All Types' || 
            (listing.allergens && listing.allergens.includes(selectedFilter));
        
        return matchesSearch && matchesFilter;
    });

    const getUnreadNotificationsCount = () => {
        return getUnreadCount();
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="py-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Find Available Food</h1>
                                <p className="text-sm text-gray-600 mt-1">Browse and request surplus food donations</p>
                            </div>
                            <div className="flex items-center space-x-2">
                                {/* Notification Badge */}
                                {getUnreadNotificationsCount() > 0 && (
                                    <div className="relative">
                                        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                            {getUnreadNotificationsCount()}
                                        </div>
                                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                                    </div>
                                )}
                                
                                {/* View Mode Toggle */}
                                <div className="flex bg-gray-100 rounded-lg p-1">
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                            viewMode === 'list'
                                                ? 'bg-white text-gray-900 shadow-sm'
                                                : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                    >
                                        <List className="w-4 h-4 inline mr-1" />
                                        List
                                    </button>
                                    <button
                                        onClick={() => setViewMode('map')}
                                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                            viewMode === 'map'
                                                ? 'bg-white text-gray-900 shadow-sm'
                                                : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                    >
                                        <Map className="w-4 h-4 inline mr-1" />
                                        Map
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Search and Filters */}
                <div className="mb-6">
                    <div className="relative mb-4">
                        <input
                            type="text"
                            placeholder="Search for food items..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-colors"
                        />
                        <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
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

                {/* Content Based on View Mode */}
                {viewMode === 'map' ? (
                    /* Map View */
                    <div className="space-y-6">
                        <InteractiveMap
                            foodListings={filteredListings}
                            userLocation={userLocation}
                            onListingClick={handleListingClick}
                            height="500px"
                            showUserLocation={true}
                        />
                        
                        {/* Quick Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Available</p>
                                        <p className="text-2xl font-bold text-gray-900">{filteredListings.length}</p>
                                    </div>
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <MapPin className="w-6 h-6 text-blue-600" />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Near You</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {userLocation ? filteredListings.filter(l => l.location?.coordinates).length : 'N/A'}
                                        </p>
                                    </div>
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <Navigation className="w-6 h-6 text-green-600" />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Fresh Today</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {filteredListings.filter(l => {
                                                const today = new Date();
                                                const listingDate = new Date(l.createdAt);
                                                return listingDate.toDateString() === today.toDateString();
                                            }).length}
                                        </p>
                                    </div>
                                    <div className="p-2 bg-yellow-100 rounded-lg">
                                        <Clock className="w-6 h-6 text-yellow-600" />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Notifications</p>
                                        <p className="text-2xl font-bold text-gray-900">{getUnreadNotificationsCount()}</p>
                                    </div>
                                    <div className="p-2 bg-purple-100 rounded-lg">
                                        <MessageCircle className="w-6 h-6 text-purple-600" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* List View */
                    <div className="space-y-3 sm:space-y-4">
                        {loading ? (
                            <div className="text-center py-10">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-500 mb-4"></div>
                                <p className="text-gray-600">Loading available food listings...</p>
                            </div>
                        ) : filteredListings.length > 0 ? (
                            filteredListings.map((listing) => (
                                <FoodListingVisibility key={listing._id} listing={listing} />
                            ))
                        ) : (
                            <div className="text-center py-10 bg-white rounded-2xl shadow-sm border border-gray-100">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Search className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No food listings found</h3>
                                <p className="text-gray-600 max-w-md mx-auto">
                                    There are currently no available food listings matching your criteria. Please check back later or try a different search.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Waste to Energy CTA */}
                <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Have organic waste?</h3>
                            <p className="text-gray-600 max-w-md">
                                Turn your organic waste into renewable energy. Schedule a pickup today!
                            </p>
                        </div>
                        <button
                            onClick={navigateToWastePickup}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                        >
                            <Recycle className="w-5 h-5 mr-2 inline-block" />
                            Schedule Pickup
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
