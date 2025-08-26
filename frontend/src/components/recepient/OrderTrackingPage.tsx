import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, Clock, Truck, MapPin, Phone, MessageCircle, User, Package, Home, Navigation, Star, Info } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { showNotification } from '../../utils/notificationUtils';

interface OrderStatus {
    id: string;
    status: 'initiated' | 'confirmed' | 'preparing' | 'picked_up' | 'in_transit' | 'delivered';
    title: string;
    description: string;
    timestamp: string;
    completed: boolean;
    current: boolean;
}

interface OrderDetails {
    id: string;
    foodType: string;
    quantity: number;
    donor: {
        name: string;
        phone: string;
        address: string;
    };
    carrier?: {
        name: string;
        phone: string;
        vehicle: string;
    };
    estimatedDelivery: string;
    specialInstructions: string;
}

export default function OrderTrackingPage() {
    const [currentStep, setCurrentStep] = useState<OrderStatus['status']>('initiated');
    const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    // Mock order details (in real app, this would come from API)
    const mockOrderDetails: OrderDetails = {
        id: id || 'ORD001',
        foodType: 'Fresh Salads & Sandwiches',
        quantity: 15,
        donor: {
            name: 'Green Bistro',
            phone: '+1 (555) 123-4567',
            address: '123 Main Street, Downtown, NY 10001'
        },
        carrier: {
            name: 'John Smith',
            phone: '+1 (555) 987-6543',
            vehicle: 'White Van (ABC-123)'
        },
        estimatedDelivery: '2:30 PM - 3:00 PM',
        specialInstructions: 'Please bring your own containers. Ring the back door bell.'
    };

    const orderSteps: OrderStatus[] = [
        {
            id: '1',
            status: 'initiated',
            title: 'Order Initiated',
            description: 'Your food request has been submitted successfully',
            timestamp: '2:00 PM',
            completed: true,
            current: false
        },
        {
            id: '2',
            status: 'confirmed',
            title: 'Order Confirmed',
            description: 'Donor has confirmed your request',
            timestamp: '2:05 PM',
            completed: true,
            current: false
        },
        {
            id: '3',
            status: 'preparing',
            title: 'Food Being Prepared',
            description: 'Donor is preparing your food for pickup',
            timestamp: '2:10 PM',
            completed: true,
            current: false
        },
        {
            id: '4',
            status: 'picked_up',
            title: 'Picked Up by Carrier',
            description: 'Food has been picked up and is on its way',
            timestamp: '2:15 PM',
            completed: false,
            current: true
        },
        {
            id: '5',
            status: 'in_transit',
            title: 'In Transit',
            description: 'Food is being delivered to your location',
            timestamp: '2:20 PM',
            completed: false,
            current: false
        },
        {
            id: '6',
            status: 'delivered',
            title: 'Delivered',
            description: 'Food has been delivered to your location',
            timestamp: '2:30 PM',
            completed: false,
            current: false
        }
    ];

    useEffect(() => {
        console.log('OrderTrackingPage mounted with id:', id);
        // Simulate loading order details
        const loadOrderDetails = async () => {
            try {
                console.log('Loading order details...');
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 1000));
                setOrderDetails(mockOrderDetails);
                
                // Simulate order progress
                simulateOrderProgress();
                console.log('Order details loaded successfully');
            } catch (error) {
                console.error('Failed to load order details:', error);
                showNotification.error('Failed to load order details');
            } finally {
                setLoading(false);
            }
        };

        loadOrderDetails();
    }, [id]);

    const simulateOrderProgress = () => {
        // Simulate order progressing through steps
        const steps = ['initiated', 'confirmed', 'preparing', 'picked_up', 'in_transit', 'delivered'];
        let currentIndex = 0;

        const progressInterval = setInterval(() => {
            if (currentIndex < steps.length) {
                setCurrentStep(steps[currentIndex] as OrderStatus['status']);
                currentIndex++;
            } else {
                clearInterval(progressInterval);
            }
        }, 5000); // Progress every 5 seconds for demo
    };

    const handleBack = () => {
        navigate('/recipient-dashboard');
    };

    const handleCallDonor = () => {
        if (orderDetails) {
            window.open(`tel:${orderDetails.donor.phone}`, '_self');
        }
    };

    const handleCallCarrier = () => {
        if (orderDetails?.carrier) {
            window.open(`tel:${orderDetails.carrier.phone}`, '_self');
        }
    };

    const handleMessageDonor = () => {
        if (orderDetails) {
            window.open(`sms:${orderDetails.donor.phone}`, '_self');
        }
    };

    const getStepIcon = (step: OrderStatus) => {
        if (step.completed) {
            return <CheckCircle className="w-6 h-6 text-green-500" />;
        } else if (step.current) {
            return <Clock className="w-6 h-6 text-blue-500 animate-pulse" />;
        } else {
            return <div className="w-6 h-6 border-2 border-gray-300 rounded-full" />;
        }
    };

    const getStepStatus = (step: OrderStatus) => {
        if (step.completed) {
            return 'bg-green-50 border-green-200';
        } else if (step.current) {
            return 'bg-blue-50 border-blue-200';
        } else {
            return 'bg-gray-50 border-gray-200';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-500 mb-4"></div>
                    <p className="text-gray-600">Loading your order details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
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
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Order Tracking</h1>
                            <p className="text-sm text-gray-600 mt-1">Track your food delivery in real-time</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
                {/* Order Summary Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-4">
                        <h2 className="text-lg font-semibold text-white flex items-center">
                            <Package className="w-5 h-5 mr-2" />
                            Order #{orderDetails?.id}
                        </h2>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-2">{orderDetails?.foodType}</h3>
                                <p className="text-sm text-gray-600">{orderDetails?.quantity} portions</p>
                                <p className="text-sm text-gray-600 mt-1">
                                    <strong>Estimated Delivery:</strong> {orderDetails?.estimatedDelivery}
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                    <Clock className="w-4 h-4 mr-1" />
                                    {currentStep === 'delivered' ? 'Delivered' : 'In Progress'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Progress Timeline */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-4">
                        <h3 className="text-lg font-semibold text-white flex items-center">
                            <Navigation className="w-5 h-5 mr-2" />
                            Delivery Progress
                        </h3>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            {orderSteps.map((step, index) => (
                                <div key={step.id} className={`flex items-start space-x-4 p-4 rounded-xl border ${getStepStatus(step)}`}>
                                    <div className="flex-shrink-0 mt-1">
                                        {getStepIcon(step)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-semibold text-gray-900">{step.title}</h4>
                                            <span className="text-sm text-gray-500">{step.timestamp}</span>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                                        {step.current && (
                                            <div className="mt-2 flex items-center space-x-2">
                                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                                <span className="text-xs text-blue-600 font-medium">Currently in progress</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Donor Information */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-green-50 px-6 py-4 border-b border-green-100">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                <User className="w-5 h-5 mr-2 text-green-600" />
                                Donor Information
                            </h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <p className="font-medium text-gray-900">{orderDetails?.donor.name}</p>
                                <p className="text-sm text-gray-600">{orderDetails?.donor.address}</p>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={handleCallDonor}
                                    className="flex-1 px-4 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors flex items-center justify-center"
                                >
                                    <Phone className="w-4 h-4 mr-1" />
                                    Call
                                </button>
                                <button
                                    onClick={handleMessageDonor}
                                    className="flex-1 px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center"
                                >
                                    <MessageCircle className="w-4 h-4 mr-1" />
                                    Message
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Carrier Information */}
                    {orderDetails?.carrier && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                    <Truck className="w-5 h-5 mr-2 text-blue-600" />
                                    Carrier Information
                                </h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <p className="font-medium text-gray-900">{orderDetails.carrier.name}</p>
                                    <p className="text-sm text-gray-600">{orderDetails.carrier.vehicle}</p>
                                </div>
                                <button
                                    onClick={handleCallCarrier}
                                    className="w-full px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors flex items-center justify-center"
                                >
                                    <Phone className="w-4 h-4 mr-1" />
                                    Call Carrier
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Special Instructions */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-yellow-50 px-6 py-4 border-b border-yellow-100">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                            <Info className="w-5 h-5 mr-2 text-yellow-600" />
                            Special Instructions
                        </h3>
                    </div>
                    <div className="p-6">
                        <p className="text-gray-700">{orderDetails?.specialInstructions}</p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4">
                    <button
                        onClick={handleBack}
                        className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-2xl font-semibold hover:bg-gray-200 transition-colors"
                    >
                        Back to Dashboard
                    </button>
                    <button
                        onClick={() => window.location.reload()}
                        className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-2xl font-semibold hover:bg-blue-600 transition-colors"
                    >
                        Refresh Status
                    </button>
                </div>

                {/* Estimated Time */}
                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl p-6 text-white text-center">
                    <div className="flex items-center justify-center mb-2">
                        <Clock className="w-6 h-6 mr-2" />
                        <h3 className="text-lg font-semibold">Estimated Delivery Time</h3>
                    </div>
                    <p className="text-2xl font-bold">{orderDetails?.estimatedDelivery}</p>
                    <p className="text-blue-100 mt-2">Your food is being prepared with care!</p>
                </div>
            </div>
        </div>
    );
}
