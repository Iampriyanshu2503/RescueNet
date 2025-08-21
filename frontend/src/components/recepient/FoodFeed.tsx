import React, { useState } from 'react';
import { ArrowLeft, MapPin, Clock, Phone, MessageCircle, Users, Timer, AlertTriangle, CheckCircle, Info, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


interface RequestDetails {
    id: string;
    title: string;
    restaurant: string;
    quantity: number;
    timeLeft: string;
    status: 'Fresh';
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

const requestData: RequestDetails = {
    id: 'REQ001',
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

export default function RequestConfirmationPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const navigate = useNavigate();

    const handleBack = () => {
        navigate('/recipient-dashboard');
    };

    const handleCall = () => {
        console.log('Calling donor:', requestData.contact.phone);
    };

    const handleMessage = () => {
        console.log('Opening message to donor');
    };

    const handleCancel = () => {
        console.log('Canceling request');
        handleBack();
        navigate('/recipient-dashboard');
    };

    const handleConfirmRequest = async () => {
        setIsSubmitting(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));

        setIsSubmitting(false);
        setShowConfirmation(true);

        // Auto-navigate after showing confirmation
        setTimeout(() => {
            console.log('Navigate to requests page');
        }, 2000);
    };

    if (showConfirmation) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-xl p-8 text-center max-w-md w-full">
                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Request Confirmed!</h2>
                    <p className="text-gray-600 mb-6">
                        Your request has been sent to {requestData.restaurant}.
                        You'll receive a notification once they respond.
                    </p>
                    <div className="bg-green-50 rounded-2xl p-4 mb-6">
                        <p className="text-sm text-green-700">
                            <strong>Pickup Details:</strong><br />
                            {requestData.pickup.address}<br />
                            {requestData.pickup.timeSlot}
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
                            <p className="text-sm text-gray-600 mt-1 hidden sm:block">Review details before confirming</p>
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
                                    <span className="text-2xl">🥗</span>
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
                                <p className="font-semibold text-gray-900">Location</p>
                                <p className="text-gray-600">{requestData.pickup.address}</p>
                                <p className="text-sm text-blue-600 font-medium">{requestData.pickup.distance}</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                            <div>
                                <p className="font-semibold text-gray-900">Pickup Time</p>
                                <p className="text-gray-600">{requestData.pickup.timeSlot}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Information Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-green-50 px-6 py-4 border-b border-green-100">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                            <Phone className="w-5 h-5 mr-2 text-green-600" />
                            Contact Donor
                        </h3>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <Phone className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="font-semibold text-gray-900">{requestData.contact.phone}</p>
                                    <p className="text-sm text-gray-600">{requestData.contact.description}</p>
                                </div>
                            </div>
                            <button
                                onClick={handleCall}
                                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center"
                            >
                                <Phone className="w-4 h-4 mr-2" />
                                Call
                            </button>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <MessageCircle className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="font-semibold text-gray-900">Message</p>
                                    <p className="text-sm text-gray-600">Send a quick message</p>
                                </div>
                            </div>
                            <button
                                onClick={handleMessage}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center"
                            >
                                <MessageCircle className="w-4 h-4 mr-2" />
                                Text
                            </button>
                        </div>
                    </div>
                </div>

                {/* Special Instructions Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-yellow-50 px-6 py-4 border-b border-yellow-100">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                            <Info className="w-5 h-5 mr-2 text-yellow-600" />
                            Special Instructions
                        </h3>
                    </div>
                    <div className="p-6">
                        <div className="bg-blue-50 rounded-xl p-4 mb-4">
                            <p className="text-blue-800 text-sm font-medium">
                                {requestData.specialInstructions}
                            </p>
                        </div>

                        {requestData.allergenInfo.length > 0 && (
                            <div className="bg-red-50 rounded-xl p-4">
                                <div className="flex items-start space-x-2">
                                    <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="font-semibold text-red-800 mb-1">Allergen Information</p>
                                        <p className="text-red-700 text-sm">
                                            {requestData.allergenInfo.join(', ')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Commitment Notice */}
                <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
                    <div className="flex items-start space-x-3">
                        <CheckCircle className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <h4 className="font-semibold text-green-900 mb-2">Ready to request?</h4>
                            <p className="text-green-800 text-sm leading-relaxed">
                                By confirming, you commit to picking up this donation within the specified time.
                                Please be respectful of the donor's time and effort.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 px-4 py-3 sm:py-4 shadow-lg safe-bottom">
                <div className="max-w-4xl mx-auto flex space-x-3 sm:space-x-4">
                    <button
                        onClick={handleCancel}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirmRequest}
                        disabled={isSubmitting}
                        className="flex-2 bg-green-500 hover:bg-green-600 disabled:bg-green-400 active:bg-green-700 text-white font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-xl sm:rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center min-w-[160px] sm:min-w-[200px] shadow-md hover:shadow-lg"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                <span className="text-sm sm:text-base">Confirming...</span>
                            </>
                        ) : (
                            <span className="text-sm sm:text-base">Confirm Request</span>
                        )}
                    </button>
                </div>
            </div>

            {/* Bottom padding */}
            <div className="h-24"></div>
        </div>
    );
}
