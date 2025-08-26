import React, { useState, useEffect } from 'react';
import { 
    Truck, 
    MapPin, 
    Clock, 
    Package, 
    Users, 
    Star, 
    Phone, 
    MessageCircle, 
    Navigation, 
    AlertCircle, 
    CheckCircle, 
    Calendar,
    Filter,
    Search,
    Bell,
    Settings,
    User,
    TrendingUp,
    Award,
    Map,
    List,
    Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import InteractiveMap from '../maps/InteractiveMap';

interface DeliveryRequest {
    id: string;
    title: string;
    from: string;
    to: string;
    distance: string;
    estimatedTime: string;
    foodType: string;
    quantity: string;
    urgency: 'low' | 'medium' | 'high';
    status: 'available' | 'accepted' | 'in-progress' | 'completed';
    contact: {
        phone: string;
        name: string;
    };
    pickupTime: string;
    specialInstructions?: string;
}

const VolunteerDashboard = () => {
    const [activeTab, setActiveTab] = useState<'available' | 'accepted' | 'completed'>('available');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('All');
    const [isOnline, setIsOnline] = useState(true);
    const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
    const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
    const navigate = useNavigate();
    
    // Get user's current location
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    console.error('Error getting location:', error);
                }
            );
        }
    }, []);

    // Mock data for deliveries
    const [deliveries, setDeliveries] = useState<DeliveryRequest[]>([
        {
            id: '1',
            title: 'Fresh Vegetables & Fruits',
            from: 'Downtown Restaurant',
            to: 'Community Food Bank',
            distance: '3.2 miles',
            estimatedTime: '25 min',
            foodType: 'Fresh Produce',
            quantity: '50 lbs',
            urgency: 'high',
            status: 'available',
            contact: { phone: '+1 (555) 123-4567', name: 'John Smith' },
            pickupTime: 'Within 2 hours',
            specialInstructions: 'Handle with care, fragile items'
        },
        {
            id: '2',
            title: 'Bakery Items',
            from: 'Local Bakery',
            to: 'Senior Center',
            distance: '1.8 miles',
            estimatedTime: '15 min',
            foodType: 'Baked Goods',
            quantity: '30 lbs',
            urgency: 'medium',
            status: 'available',
            contact: { phone: '+1 (555) 987-6543', name: 'Sarah Johnson' },
            pickupTime: 'Before 6 PM today'
        },
        {
            id: '3',
            title: 'Canned Goods & Dry Food',
            from: 'Supermarket Chain',
            to: 'Homeless Shelter',
            distance: '4.5 miles',
            estimatedTime: '35 min',
            foodType: 'Non-perishable',
            quantity: '100 lbs',
            urgency: 'low',
            status: 'accepted',
            contact: { phone: '+1 (555) 456-7890', name: 'Mike Wilson' },
            pickupTime: 'Tomorrow morning'
        }
    ]);

    const stats = {
        totalDeliveries: 24,
        hoursVolunteered: 48,
        foodDelivered: '156 lbs',
        milesTraveled: 287,
        rating: 4.8,
        completedThisWeek: 5
    };

    const handleAcceptDelivery = (deliveryId: string) => {
        setDeliveries(prev => prev.map(delivery => 
            delivery.id === deliveryId 
                ? { ...delivery, status: 'accepted' as const }
                : delivery
        ));
    };

    const handleStartDelivery = (deliveryId: string) => {
        setDeliveries(prev => prev.map(delivery => 
            delivery.id === deliveryId 
                ? { ...delivery, status: 'in-progress' as const }
                : delivery
        ));
    };

    const handleCompleteDelivery = (deliveryId: string) => {
        setDeliveries(prev => prev.map(delivery => 
            delivery.id === deliveryId 
                ? { ...delivery, status: 'completed' as const }
                : delivery
        ));
    };

    const getUrgencyColor = (urgency: string) => {
        switch (urgency) {
            case 'high': return 'text-red-600 bg-red-100';
            case 'medium': return 'text-orange-600 bg-orange-100';
            case 'low': return 'text-green-600 bg-green-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'available': return 'text-blue-600 bg-blue-100';
            case 'accepted': return 'text-purple-600 bg-purple-100';
            case 'in-progress': return 'text-orange-600 bg-orange-100';
            case 'completed': return 'text-green-600 bg-green-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const filteredDeliveries = deliveries.filter(delivery => {
        const matchesSearch = searchQuery === '' || 
            delivery.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            delivery.from.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesFilter = selectedFilter === 'All' || 
            delivery.foodType === selectedFilter;
        
        const matchesTab = delivery.status === activeTab || 
            (activeTab === 'completed' && delivery.status === 'completed');
        
        return matchesSearch && matchesFilter && matchesTab;
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between py-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Volunteer Dashboard</h1>
                            <p className="text-sm text-gray-600">Help deliver food from donors to those in need</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                <span className="text-sm text-gray-600">{isOnline ? 'Online' : 'Offline'}</span>
                            </div>
                            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <Bell className="w-5 h-5 text-gray-600" />
                            </button>
                            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <Settings className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Deliveries</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.totalDeliveries}</p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-xl">
                                <Truck className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-sm text-green-600">
                            <TrendingUp className="w-4 h-4 mr-1" />
                            +12% this month
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Hours Volunteered</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.hoursVolunteered}</p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-xl">
                                <Clock className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-sm text-green-600">
                            <Award className="w-4 h-4 mr-1" />
                            Top 10% volunteer
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Food Delivered</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.foodDelivered}</p>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-xl">
                                <Package className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-sm text-green-600">
                            <Users className="w-4 h-4 mr-1" />
                            156 people helped
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Rating</p>
                                <div className="flex items-center">
                                    <p className="text-3xl font-bold text-gray-900">{stats.rating}</p>
                                    <Star className="w-5 h-5 text-yellow-500 ml-1 fill-current" />
                                </div>
                            </div>
                            <div className="p-3 bg-yellow-100 rounded-xl">
                                <Star className="w-6 h-6 text-yellow-600" />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-sm text-green-600">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            24 reviews
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8 px-6">
                            {[
                                { id: 'available', label: 'Available', count: deliveries.filter(d => d.status === 'available').length },
                                { id: 'accepted', label: 'Accepted', count: deliveries.filter(d => d.status === 'accepted').length },
                                { id: 'completed', label: 'Completed', count: deliveries.filter(d => d.status === 'completed').length }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                        activeTab === tab.id
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    {tab.label}
                                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                                        activeTab === tab.id
                                            ? 'bg-blue-100 text-blue-600'
                                            : 'bg-gray-100 text-gray-600'
                                    }`}>
                                        {tab.count}
                                    </span>
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Search and Filters */}
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search deliveries..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <select
                                value={selectedFilter}
                                onChange={(e) => setSelectedFilter(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="All">All Types</option>
                                <option value="Fresh Produce">Fresh Produce</option>
                                <option value="Baked Goods">Baked Goods</option>
                                <option value="Non-perishable">Non-perishable</option>
                                <option value="Cooked Meals">Cooked Meals</option>
                            </select>
                        </div>
                    </div>

                    {/* Deliveries List */}
                    <div className="p-6">
                        {filteredDeliveries.length > 0 ? (
                            <div className="space-y-4">
                                {filteredDeliveries.map((delivery) => (
                                    <div key={delivery.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <h3 className="text-lg font-semibold text-gray-900">{delivery.title}</h3>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(delivery.urgency)}`}>
                                                        {delivery.urgency} priority
                                                    </span>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(delivery.status)}`}>
                                                        {delivery.status}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                                                    <div>
                                                        <p><strong>From:</strong> {delivery.from}</p>
                                                        <p><strong>To:</strong> {delivery.to}</p>
                                                        <p><strong>Distance:</strong> {delivery.distance}</p>
                                                    </div>
                                                    <div>
                                                        <p><strong>Food Type:</strong> {delivery.foodType}</p>
                                                        <p><strong>Quantity:</strong> {delivery.quantity}</p>
                                                        <p><strong>Pickup Time:</strong> {delivery.pickupTime}</p>
                                                    </div>
                                                </div>
                                                {delivery.specialInstructions && (
                                                    <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                                                        <p className="text-sm text-yellow-800">
                                                            <strong>Special Instructions:</strong> {delivery.specialInstructions}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                            <div className="flex items-center space-x-4">
                                                <div className="flex items-center space-x-2">
                                                    <Phone className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm text-gray-600">{delivery.contact.phone}</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Clock className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm text-gray-600">{delivery.estimatedTime}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                {delivery.status === 'available' && (
                                                    <button
                                                        onClick={() => handleAcceptDelivery(delivery.id)}
                                                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                                                    >
                                                        Accept Delivery
                                                    </button>
                                                )}
                                                {delivery.status === 'accepted' && (
                                                    <button
                                                        onClick={() => handleStartDelivery(delivery.id)}
                                                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                                                    >
                                                        Start Delivery
                                                    </button>
                                                )}
                                                {delivery.status === 'in-progress' && (
                                                    <button
                                                        onClick={() => handleCompleteDelivery(delivery.id)}
                                                        className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                                                    >
                                                        Complete Delivery
                                                    </button>
                                                )}
                                                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                                    <Navigation className="w-5 h-5 text-gray-600" />
                                                </button>
                                                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                                    <MessageCircle className="w-5 h-5 text-gray-600" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No deliveries found</h3>
                                <p className="text-gray-600">There are currently no deliveries matching your criteria.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Delivery Map View */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Map className="w-5 h-5 text-blue-600" />
                            <h3 className="text-lg font-semibold text-gray-900">Delivery Routes</h3>
                        </div>
                        <div className="flex items-center space-x-2 bg-gray-100 p-1 rounded-lg">
                            <button
                                onClick={() => setViewMode('list')}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-600 hover:text-gray-800'}`}
                            >
                                <List className="w-4 h-4 inline mr-1" />
                                List
                            </button>
                            <button
                                onClick={() => setViewMode('map')}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'map' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-600 hover:text-gray-800'}`}
                            >
                                <Map className="w-4 h-4 inline mr-1" />
                                Map
                            </button>
                        </div>
                    </div>
                    
                    {viewMode === 'map' && (
                        <div>
                            <InteractiveMap
                                foodListings={deliveries.map(delivery => ({
                                    _id: delivery.id,
                                    foodType: delivery.title,
                                    description: `From: ${delivery.from} To: ${delivery.to}`,
                                    status: delivery.status === 'available' ? 'available' : 'reserved',
                                    location: {
                                        // For demo purposes, generate random locations near the user's location
                                        coordinates: userLocation ? [
                                            userLocation.lng + (Math.random() - 0.5) * 0.05,
                                            userLocation.lat + (Math.random() - 0.5) * 0.05
                                        ] : [0, 0],
                                        address: delivery.from
                                    },
                                    servings: parseInt(delivery.quantity) || 1
                                }))}
                                userLocation={userLocation}
                                height="500px"
                                showUserLocation={true}
                            />
                            <div className="mt-4 text-sm text-gray-500 flex items-center">
                                <Info className="w-4 h-4 mr-1" />
                                <span>Map shows all delivery pickup and dropoff locations</span>
                            </div>
                        </div>
                    )}
                </div>
                
                {/* Quick Actions */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button className="flex items-center p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                            <Calendar className="w-6 h-6 text-blue-600 mr-3" />
                            <div className="text-left">
                                <p className="font-medium text-gray-900">Schedule Availability</p>
                                <p className="text-sm text-gray-600">Set your volunteer hours</p>
                            </div>
                        </button>
                        <button className="flex items-center p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                            <MapPin className="w-6 h-6 text-green-600 mr-3" />
                            <div className="text-left">
                                <p className="font-medium text-gray-900">Update Location</p>
                                <p className="text-sm text-gray-600">Change your service area</p>
                            </div>
                        </button>
                        <button className="flex items-center p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                            <User className="w-6 h-6 text-purple-600 mr-3" />
                            <div className="text-left">
                                <p className="font-medium text-gray-900">View Profile</p>
                                <p className="text-sm text-gray-600">Manage your volunteer profile</p>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VolunteerDashboard;
