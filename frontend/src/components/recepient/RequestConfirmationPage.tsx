import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Clock, Phone, MessageCircle, Users, Timer, CheckCircle, Info, Star, Calendar, Navigation, AlertTriangle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { foodDonationService } from '../../services/foodDonationService';
import { FoodDonation } from '../../types/foodListing';
import { showNotification } from '../../utils/notificationUtils';

interface RequestDetails {
    id: string;
    title: string;
    restaurant: string;
    quantity: number;
    timeLeft: string;
    status: string;
    pickup: {
        location: string;
        address: string;
        distance: string;
        timeSlot: string;
    };
    contact: {
        phone: string;
        description: string;
    };
    specialInstructions: string;
    allergenInfo: string[];
}

export default function RequestConfirmationPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [foodListing, setFoodListing] = useState<FoodDonation | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    // Mock request data (in real app, this would come from the food listing)
    const requestData: RequestDetails = {
        id: id || 'REQ001',
        title: 'Fresh Salads & Sandwiches',
        restaurant: 'Green Bistro',
        quantity: 15,
        timeLeft: '2 hours left',
        status: 'Fresh',
        pickup: {
            location: '123 Main Street, Downtown',
            address: '123 Main Street, Downtown',
            distance: '0.8 km away',
            timeSlot: 'Available now - 6:00 PM'
        },
        contact: {
            phone: '+1 (555) 123-4567',
            description: 'Call for pickup coordination'
        },
        specialInstructions: 'Please bring your own containers. Ring the back door bell.',
        allergenInfo: ['Contains nuts', 'dairy']
    };

    useEffect(() => {
        const fetchFoodListing = async () => {
            try {
                if (id) {
                    const data = await foodDonationService.getById(id);
                    setFoodListing(data);
                    // Update request data with actual food listing data
                    requestData.title = data.foodType;
                    requestData.quantity = parseInt(data.servings);
                    requestData.specialInstructions = data.pickupInstructions || 'Contact donor for pickup details';
                    if (data.location?.address) {
                        requestData.pickup.address = data.location.address;
                        requestData.pickup.location = data.location.address;
                    }
                }
            } catch (error) {
                console.error('Failed to fetch food listing:', error);
                showNotification.error('Failed to load food listing details');
            } finally {
                setLoading(false);
            }
        };

        fetchFoodListing();
    }, [id]);

    const handleBack = () => {
        navigate('/recipient-dashboard');
    };

    const handleCall = () => {
        console.log('Calling donor:', requestData.contact.phone);
        // In a real app, this would open phone dialer
        window.open(`tel:${requestData.contact.phone}`, '_self');
    };

    const handleMessage = () => {
        console.log('Opening message to donor');
        // In a real app, this would open messaging app
        window.open(`sms:${requestData.contact.phone}`, '_self');
    };

    const handleCancel = () => {
        navigate('/recipient-dashboard');
    };

    const handleConfirmRequest = async () => {
        setIsSubmitting(true);

        try {
            // Simulate API call to request food
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // In a real app, this would be an actual API call
            // await foodDonationService.requestFood(id, requestData);

            setIsSubmitting(false);
            setShowConfirmation(true);
            showNotification.success('Food request submitted successfully!');

            // Auto-navigate to order tracking page after showing confirmation
            setTimeout(() => {
                console.log('Navigating to order tracking page:', `/order-tracking/${id}`);
                navigate(`/order-tracking/${id}`);
            }, 3000); // Reduced to 3 seconds for better UX
        } catch (error) {
            console.error('Failed to submit request:', error);
            showNotification.error('Failed to submit request. Please try again.');
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-500 mb-4"></div>
                    <p className="text-gray-600">Loading food details...</p>
                </div>
            </div>
        );
    }

    if (showConfirmation) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-xl p-8 text-center max-w-md w-full">
                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                        <CheckCircle className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Request Confirmed! 🎉</h2>
                    <p className="text-gray-600 mb-6">
                        Your request has been sent to the donor.
                        You'll receive a notification once they respond.
                    </p>
                    
                    <div className="bg-green-50 rounded-2xl p-4 mb-6">
                        <p className="text-sm text-green-700">
                            <strong>Pickup Details:</strong><br />
                            📍 {requestData.pickup.address}<br />
                            ⏰ {requestData.pickup.timeSlot}
                        </p>
                    </div>
                    
                    <div className="bg-blue-50 rounded-2xl p-4 mb-6">
                        <p className="text-sm text-blue-700">
                            <strong>Next Steps:</strong><br />
                            • Contact the donor to coordinate pickup<br />
                            • Bring your own containers<br />
                            • Arrive within the specified time window<br />
                            • Check your notifications for updates
                        </p>
                    </div>
                    
                    <div className="bg-yellow-50 rounded-2xl p-4 mb-6">
                        <p className="text-sm text-yellow-700">
                            <strong>Important:</strong><br />
                            You will be automatically redirected to the dashboard in 5 seconds.
                        </p>
                    </div>
                    
                    <button
                        onClick={handleBack}
                        className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-2xl transition-colors"
                    >
                        Back to Listings
                    </button>
                </div>
            </div>
        );
    }

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
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Request Confirmation</h1>
                            <p className="text-sm text-gray-600 mt-1 hidden sm:block">Review details before confirming your request</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
                {/* Food Details Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start space-x-4">
                                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center">
                                    <span className="text-2xl">🍽️</span>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 mb-1">{requestData.title}</h2>
                                    <p className="text-gray-600 font-medium">{requestData.restaurant}</p>
                                    <div className="flex items-center mt-2 space-x-4 text-sm text-gray-500">
                                        <div className="flex items-center">
                                            <Users className="w-4 h-4 mr-1" />
                                            {requestData.quantity} portions
                                        </div>
                                        <div className="flex items-center">
                                            <Timer className="w-4 h-4 mr-1" />
                                            {requestData.timeLeft}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                                {requestData.status}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Pickup Information Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                            <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                            Pickup Information
                        </h3>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="flex items-start space-x-3">
                            <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div>
                                <p className="font-medium text-gray-900">{requestData.pickup.location}</p>
                                <p className="text-sm text-gray-600">{requestData.pickup.distance}</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div>
                                <p className="font-medium text-gray-900">Pickup Time</p>
                                <p className="text-sm text-gray-600">{requestData.pickup.timeSlot}</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <Info className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div>
                                <p className="font-medium text-gray-900">Special Instructions</p>
                                <p className="text-sm text-gray-600">{requestData.specialInstructions}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Information Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-green-50 px-6 py-4 border-b border-green-100">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                            <Phone className="w-5 h-5 mr-2 text-green-600" />
                            Contact Information
                        </h3>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-gray-900">{requestData.contact.phone}</p>
                                <p className="text-sm text-gray-600">{requestData.contact.description}</p>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={handleCall}
                                    className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                                    title="Call donor"
                                >
                                    <Phone className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={handleMessage}
                                    className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                                    title="Message donor"
                                >
                                    <MessageCircle className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Allergen Information Card */}
                {requestData.allergenInfo.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-yellow-50 px-6 py-4 border-b border-yellow-100">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                <AlertTriangle className="w-5 h-5 mr-2 text-yellow-600" />
                                Allergen Information
                            </h3>
                        </div>
                        <div className="p-6">
                            <div className="flex flex-wrap gap-2">
                                {requestData.allergenInfo.map((allergen, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium"
                                    >
                                        {allergen}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-4">
                    <button
                        onClick={handleCancel}
                        className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-2xl font-semibold hover:bg-gray-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirmRequest}
                        disabled={isSubmitting}
                        className="flex-1 px-6 py-3 bg-green-500 text-white rounded-2xl font-semibold hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                                Submitting...
                            </div>
                        ) : (
                            'Confirm Request'
                        )}
                    </button>
                </div>

                {/* Important Notice */}
                <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
                    <div className="flex items-start space-x-3">
                        <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-medium text-blue-900 mb-1">Important Notice</p>
                            <p className="text-sm text-blue-700">
                                By confirming this request, you agree to pick up the food within the specified time window. 
                                Please bring your own containers and follow the donor's instructions.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
