import React, { useState } from 'react';
import { ArrowLeft, Recycle, Calendar, Clock, MapPin, Leaf, Scale, FileText, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { wastePickupService } from '../../services/wastePickupService';
import type { CreateWastePickupRequest } from '../../types/foodListing';
import { showNotification } from '../../utils/notificationUtils';


interface WasteFormData {
    wasteType: string;
    estimatedWeight: string;
    description: string;
    preferredDate: string;
    timeSlot: string;
    pickupAddress: string;
    specialInstructions: string;
}

export default function WasteToEnergyForm() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<WasteFormData>({
        wasteType: '',
        estimatedWeight: '',
        description: '',
        preferredDate: '',
        timeSlot: '',
        pickupAddress: 'Hope Foundation, Park Street, Kolkata, West Bengal 700016',
        specialInstructions: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showThankYou, setShowThankYou] = useState(false);

    const wasteTypes = [
        'Food Scraps & Kitchen Waste',
        'Garden Waste & Leaves',
        'Paper & Cardboard',
        'Vegetable Peels',
        'Fruit Waste',
        'Coffee Grounds & Tea Leaves',
        'Organic Mixed Waste'
    ];

    const timeSlots = [
        '9:00 AM - 11:00 AM',
        '11:00 AM - 1:00 PM',
        '2:00 PM - 4:00 PM',
        '4:00 PM - 6:00 PM',
        'Evening (6:00 PM - 8:00 PM)'
    ];

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleBack = () => {
        console.log('Navigate back to Add Food Surplus page');
        navigate('/donor-dashboard');
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            // Ensure all required fields are present
            if (!formData.wasteType || !formData.estimatedWeight || !formData.description || 
                !formData.preferredDate || !formData.timeSlot || !formData.pickupAddress) {
                showNotification.error('Please fill in all required fields');
                setIsSubmitting(false);
                return;
            }
            
            const payload: CreateWastePickupRequest = {
                wasteType: formData.wasteType,
                estimatedWeight: formData.estimatedWeight,
                description: formData.description,
                preferredDate: formData.preferredDate,
                timeSlot: formData.timeSlot,
                pickupAddress: formData.pickupAddress,
                specialInstructions: formData.specialInstructions || undefined,
            };
            
            console.log('Submitting waste pickup request:', payload);
            const response = await wastePickupService.create(payload);
            console.log('Waste pickup response:', response);
            
            setShowThankYou(true);
            // Navigate after 3 seconds
            setTimeout(() => {
                navigate('/donor-dashboard');
            }, 3000);
        } catch (e) {
            console.error('Failed to create waste pickup', e);
            showNotification.error('Failed to request pickup. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Show thank you animation if submission was successful
    if (showThankYou) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-xl p-8 text-center max-w-md w-full animate-fade-in">
                    <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                        <CheckCircle className="w-12 h-12 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4 animate-fade-in">Thank You!</h2>
                    <p className="text-xl text-green-600 font-semibold mb-6 animate-fade-in">
                        For your contribution to Zero Waste
                    </p>
                    <div className="bg-green-50 rounded-2xl p-6 mb-6 animate-fade-in">
                        <p className="text-green-700">
                            Your waste pickup request has been submitted successfully. 
                            A volunteer will contact you soon to arrange the pickup.
                        </p>
                    </div>
                    <div className="animate-pulse">
                        <p className="text-gray-500">Redirecting to dashboard...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
            {/* Header with improved gradient */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center py-6">
                        <button
                            onClick={handleBack}
                            className="mr-4 p-2 hover:bg-white/20 rounded-full transition-colors"
                        >
                            <ArrowLeft className="w-6 h-6 text-white" />
                        </button>
                        <div className="flex items-center">
                            <div className="bg-white/20 rounded-2xl p-3 mr-4">
                                <Recycle className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">Turn Waste into Energy</h1>
                                <p className="text-green-100 mt-1">Help create biogas from organic waste. Every kg contributes to renewable energy!</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-8 space-y-8">
                        {/* Waste Type Section */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Waste Type</h3>
                            <p className="text-sm text-gray-600 mb-4">Select the type of organic waste you have</p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {wasteTypes.map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => handleInputChange('wasteType', type)}
                                        className={`px-4 py-3 rounded-lg border text-sm font-medium transition-all ${
                                            formData.wasteType === type
                                                ? 'bg-green-50 border-green-200 text-green-700'
                                                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                                        }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Waste Details Section */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-6">Waste Details</h3>

                            <div className="space-y-6">
                                {/* Estimated Weight */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Estimated Weight (kg) <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Scale className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="number"
                                            placeholder="e.g. 5"
                                            value={formData.estimatedWeight}
                                            onChange={(e) => handleInputChange('estimatedWeight', e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50"
                                        />
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        placeholder="Describe the waste composition, source, etc..."
                                        value={formData.description}
                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50 resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Pickup Details Section */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-6">Pickup Details</h3>

                            <div className="space-y-6">
                                {/* Preferred Date */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Preferred Date <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="date"
                                            value={formData.preferredDate}
                                            onChange={(e) => handleInputChange('preferredDate', e.target.value)}
                                            min={new Date().toISOString().split('T')[0]}
                                            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50"
                                        />
                                    </div>
                                </div>

                                {/* Time Slot */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Time Slot <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <select
                                            value={formData.timeSlot}
                                            onChange={(e) => handleInputChange('timeSlot', e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50"
                                        >
                                            <option value="">Select a time slot</option>
                                            {timeSlots.map((slot) => (
                                                <option key={slot} value={slot}>
                                                    {slot}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Pickup Address */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Pickup Address <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-5 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <textarea
                                            placeholder="Enter the pickup address"
                                            value={formData.pickupAddress}
                                            onChange={(e) => handleInputChange('pickupAddress', e.target.value)}
                                            rows={2}
                                            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50 resize-none"
                                        />
                                    </div>
                                </div>

                                {/* Special Instructions */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Special Instructions (Optional)
                                    </label>
                                    <div className="relative">
                                        <FileText className="absolute left-3 top-5 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <textarea
                                            placeholder="Any special instructions for pickup..."
                                            value={formData.specialInstructions}
                                            onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                                            rows={3}
                                            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50 resize-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Environmental Impact Section */}
                        <div className="bg-green-50 rounded-xl p-6 border border-green-100">
                            <div className="flex items-start">
                                <div className="bg-green-500 rounded-full p-2 mr-4 flex-shrink-0">
                                    <Leaf className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-green-800 mb-2">Your Environmental Impact</h4>
                                    <p className="text-green-700 text-sm">
                                        By recycling organic waste, you're helping to:
                                    </p>
                                    <ul className="text-sm text-green-700 mt-2 space-y-1">
                                        <li>• Reduce methane emissions from landfills</li>
                                        <li>• Generate renewable energy through biogas</li>
                                        <li>• Create nutrient-rich compost for agriculture</li>
                                        <li>• Conserve water and reduce soil pollution</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-green-200 px-4 py-4 shadow-lg">
                <div className="max-w-4xl mx-auto">
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <div className="flex items-center justify-center">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                Submitting...
                            </div>
                        ) : (
                            <>
                                <Recycle className="w-6 h-6 mr-3" />
                                REQUEST PICKUP
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Bottom padding */}
            <div className="h-24"></div>
        </div>
    );
}