import React from 'react';
import { Truck, MapPin, Clock, Package } from 'lucide-react';

const VolunteerDashboard = () => {
    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Volunteer Dashboard</h1>
                    <p className="text-gray-600">Help deliver food from donors to those in need</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <Truck className="w-6 h-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Deliveries</p>
                                <p className="text-2xl font-bold text-gray-900">24</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Clock className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Hours Volunteered</p>
                                <p className="text-2xl font-bold text-gray-900">48</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Package className="w-6 h-6 text-purple-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Food Delivered</p>
                                <p className="text-2xl font-bold text-gray-900">156 lbs</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <MapPin className="w-6 h-6 text-orange-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Miles Traveled</p>
                                <p className="text-2xl font-bold text-gray-900">287</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Available Deliveries */}
                <div className="bg-white rounded-lg shadow mb-8">
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-bold text-gray-900">Available Deliveries</h2>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            {/* Sample delivery items */}
                            <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Fresh Vegetables & Fruits</h3>
                                        <p className="text-sm text-gray-600 mt-1">From: Downtown Restaurant</p>
                                        <p className="text-sm text-gray-600">To: Community Food Bank</p>
                                        <p className="text-sm text-gray-600">Distance: 3.2 miles</p>
                                    </div>
                                    <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
                                        Accept
                                    </button>
                                </div>
                            </div>

                            <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Bakery Items</h3>
                                        <p className="text-sm text-gray-600 mt-1">From: Local Bakery</p>
                                        <p className="text-sm text-gray-600">To: Senior Center</p>
                                        <p className="text-sm text-gray-600">Distance: 1.8 miles</p>
                                    </div>
                                    <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
                                        Accept
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-lg shadow">
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-bold text-gray-900">Recent Deliveries</h2>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            <div className="flex items-center space-x-4">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <div>
                                    <p className="font-medium text-gray-900">Delivered groceries to Family Center</p>
                                    <p className="text-sm text-gray-600">2 hours ago</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <div>
                                    <p className="font-medium text-gray-900">Delivered lunch items to Homeless Shelter</p>
                                    <p className="text-sm text-gray-600">Yesterday</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VolunteerDashboard;
