import React, { useState, useEffect } from 'react';
import {
    ArrowLeft,
    Search,
    Filter,
    MapPin,
    Clock,
    Star,
    Users,
    Sliders,
    TrendingUp,
    Heart,
    Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SearchFilters {
    cuisine: string[];
    dietary: string[];
    distance: number;
    availability: string;
    rating: number;
}

const cuisineOptions = ['Indian', 'Italian', 'Chinese', 'Continental', 'Bengali', 'South Indian'];
const dietaryOptions = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Halal', 'Dairy-Free'];

export default function SearchResults() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [filters, setFilters] = useState<SearchFilters>({
        cuisine: [],
        dietary: [],
        distance: 5,
        availability: 'all',
        rating: 0
    });

    const [recentSearches] = useState([
        'Fresh vegetables',
        'Italian cuisine',
        'Breakfast items',
        'Vegetarian meals'
    ]);

    const [trendingSearches] = useState([
        'Biryani',
        'Pizza',
        'Sandwiches',
        'South Indian',
        'Bengali thali'
    ]);

    const handleBack = () => {
        navigate('/recipient-dashboard');
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        // Simulate search API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsSearching(false);

        // Here you would typically navigate to results or update state with results
        console.log('Search results for:', searchQuery, 'with filters:', filters);
    };

    const handleFilterChange = (category: keyof SearchFilters, value: any) => {
        setFilters(prev => ({
            ...prev,
            [category]: value
        }));
    };

    const toggleCuisine = (cuisine: string) => {
        setFilters(prev => ({
            ...prev,
            cuisine: prev.cuisine.includes(cuisine)
                ? prev.cuisine.filter(c => c !== cuisine)
                : [...prev.cuisine, cuisine]
        }));
    };

    const toggleDietary = (dietary: string) => {
        setFilters(prev => ({
            ...prev,
            dietary: prev.dietary.includes(dietary)
                ? prev.dietary.filter(d => d !== dietary)
                : [...prev.dietary, dietary]
        }));
    };

    const clearAllFilters = () => {
        setFilters({
            cuisine: [],
            dietary: [],
            distance: 5,
            availability: 'all',
            rating: 0
        });
    };

    const handleQuickSearch = (query: string) => {
        setSearchQuery(query);
    };

    useEffect(() => {
        // Auto-search when query changes (debounced)
        const timer = setTimeout(() => {
            if (searchQuery.trim()) {
                console.log('Auto-searching for:', searchQuery);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            {/* Header */}
            <div className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-white/20 sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center py-4">
                        <button
                            onClick={handleBack}
                            className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-all duration-300 hover:scale-110"
                        >
                            <ArrowLeft className="w-6 h-6 text-gray-600" />
                        </button>
                        <div className="flex-1">
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Search Food</h1>
                            <p className="text-sm text-gray-600 mt-1 hidden sm:block">Find available food listings near you</p>
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="ml-4 p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-full transition-all duration-300 hover:scale-110"
                        >
                            <Sliders className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
                {/* Enhanced Search Bar */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4 sm:p-6">
                    <div className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search for food items, restaurants, or cuisine..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-base sm:text-lg shadow-sm transition-all duration-300"
                                autoFocus
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                            <button
                                onClick={handleSearch}
                                disabled={isSearching || !searchQuery.trim()}
                                className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
                            >
                                {isSearching ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <Search className="w-4 h-4" />
                                )}
                                {isSearching ? 'Searching...' : 'Search'}
                            </button>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all duration-300 hover:scale-105 active:scale-95"
                            >
                                <Filter className="w-4 h-4" />
                                Filters
                                {(filters.cuisine.length > 0 || filters.dietary.length > 0 || filters.rating > 0) && (
                                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Advanced Filters */}
                {showFilters && (
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4 sm:p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">Advanced Filters</h3>
                            <button
                                onClick={clearAllFilters}
                                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Clear All
                            </button>
                        </div>

                        {/* Cuisine Types */}
                        <div>
                            <h4 className="font-medium text-gray-900 mb-3">Cuisine Type</h4>
                            <div className="flex flex-wrap gap-2">
                                {cuisineOptions.map((cuisine) => (
                                    <button
                                        key={cuisine}
                                        onClick={() => toggleCuisine(cuisine)}
                                        className={`px-3 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 ${
                                            filters.cuisine.includes(cuisine)
                                                ? 'bg-blue-500 text-white shadow-md'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        {cuisine}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Dietary Preferences */}
                        <div>
                            <h4 className="font-medium text-gray-900 mb-3">Dietary Preferences</h4>
                            <div className="flex flex-wrap gap-2">
                                {dietaryOptions.map((dietary) => (
                                    <button
                                        key={dietary}
                                        onClick={() => toggleDietary(dietary)}
                                        className={`px-3 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 ${
                                            filters.dietary.includes(dietary)
                                                ? 'bg-green-500 text-white shadow-md'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        {dietary}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Distance Range */}
                        <div>
                            <h4 className="font-medium text-gray-900 mb-3">Distance (within {filters.distance} km)</h4>
                            <input
                                type="range"
                                min="1"
                                max="20"
                                value={filters.distance}
                                onChange={(e) => handleFilterChange('distance', parseInt(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                            />
                        </div>

                        {/* Minimum Rating */}
                        <div>
                            <h4 className="font-medium text-gray-900 mb-3">Minimum Rating</h4>
                            <div className="flex gap-2">
                                {[0, 3, 4, 4.5].map((rating) => (
                                    <button
                                        key={rating}
                                        onClick={() => handleFilterChange('rating', rating)}
                                        className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:scale-105 ${
                                            filters.rating === rating
                                                ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        <Star className="w-4 h-4" />
                                        {rating === 0 ? 'Any' : `${rating}+`}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Quick Search Suggestions */}
                {!searchQuery && (
                    <div className="space-y-6">
                        {/* Recent Searches */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4 sm:p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Clock className="w-5 h-5 text-gray-600" />
                                <h3 className="font-semibold text-gray-900">Recent Searches</h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {recentSearches.map((search, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleQuickSearch(search)}
                                        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-all duration-300 hover:scale-105"
                                    >
                                        {search}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Trending Searches */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4 sm:p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingUp className="w-5 h-5 text-orange-600" />
                                <h3 className="font-semibold text-gray-900">Trending Now</h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {trendingSearches.map((search, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleQuickSearch(search)}
                                        className="px-3 py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-lg text-sm transition-all duration-300 hover:scale-105 flex items-center gap-1"
                                    >
                                        <Zap className="w-3 h-3" />
                                        {search}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {searchQuery && !isSearching && (
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8 text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Search className="w-10 h-10 text-blue-500" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">Search Results</h3>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                            Your search for "<span className="font-medium text-blue-600">{searchQuery}</span>" would show results here.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                onClick={handleBack}
                                className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 hover:scale-105 font-medium"
                            >
                                ← Back to Listings
                            </button>
                            <button
                                onClick={() => setSearchQuery('')}
                                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all duration-300 hover:scale-105 font-medium"
                            >
                                Try Another Search
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom padding for navigation */}
            <div className="h-20"></div>
        </div>
    );
}
