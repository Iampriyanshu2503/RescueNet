import React, { useState } from 'react';
import { ArrowLeft, Search, Filter } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function SearchResults() {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState('');

    const handleBack = () => {
        navigate('/recipient-dashboard');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center py-4">
                        <button
                            onClick={handleBack}
                            className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <ArrowLeft className="w-6 h-6 text-gray-600" />
                        </button>
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-gray-900">Search Food</h1>
                            <p className="text-sm text-gray-600 mt-1">Find food listings near you</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Enhanced Search Bar */}
                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search for food items, restaurants, or cuisine..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-lg"
                            autoFocus
                        />
                    </div>
                    
                    <div className="flex items-center gap-2 mt-4">
                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                            <Search className="w-4 h-4" />
                            Search
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
                            <Filter className="w-4 h-4" />
                            Filters
                        </button>
                    </div>
                </div>

                {/* Search Results Placeholder */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Start your search</h3>
                    <p className="text-gray-600 mb-4">
                        Enter keywords above to find available food listings
                    </p>
                    <button 
                        onClick={handleBack}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                        ← Back to Food Listings
                    </button>
                </div>
            </div>
        </div>
    );
}
