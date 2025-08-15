import React, { useState } from 'react';
import { ArrowLeft, Recycle, Calendar, Clock, MapPin, Leaf, Scale, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


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

    const handleSubmit = () => {
        console.log('Waste pickup request submitted:', formData);
        // In real app: submit form and navigate to confirmation
        navigate('/donor-dashboard');
    };

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

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="space-y-6">
                    {/* Waste Details Card */}
                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-green-100">
                        <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-4">
                            <div className="flex items-center">
                                <Leaf className="w-6 h-6 text-white mr-3" />
                                <h3 className="text-xl font-semibold text-white">Waste Details</h3>
                            </div>
                        </div>

                        <div className="p-8 space-y-6">
                            {/* Type of Organic Waste */}
                            <div>
                                <label htmlFor="wasteType" className="block text-sm font-semibold text-gray-700 mb-3">
                                    Type of Organic Waste <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="wasteType"
                                    value={formData.wasteType}
                                    onChange={(e) => handleInputChange('wasteType', e.target.value)}
                                    className="w-full px-4 py-4 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-green-50/50 text-gray-700 font-medium transition-all"
                                >
                                    <option value="">Select waste type</option>
                                    {wasteTypes.map((type) => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Estimated Weight */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    Estimated Weight (kg) <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Scale className="absolute left-4 top-1/2 transform -translate-y-1/2 text-green-500 w-5 h-5" />
                                    <input
                                        type="number"
                                        placeholder="Enter estimated weight"
                                        value={formData.estimatedWeight}
                                        onChange={(e) => handleInputChange('estimatedWeight', e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-green-50/50 font-medium"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-2">Even small amounts help! Minimum 1kg accepted</p>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    Description <span className="text-gray-400">(Optional)</span>
                                </label>
                                <div className="relative">
                                    <FileText className="absolute left-4 top-4 text-green-500 w-5 h-5" />
                                    <textarea
                                        placeholder="Describe the waste condition, any specific details..."
                                        value={formData.description}
                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                        rows={4}
                                        className="w-full pl-12 pr-4 py-4 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-green-50/50 resize-none font-medium"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pickup Details Card */}
                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-green-100">
                        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4">
                            <div className="flex items-center">
                                <Calendar className="w-6 h-6 text-white mr-3" />
                                <h3 className="text-xl font-semibold text-white">Pickup Details</h3>
                            </div>
                        </div>

                        <div className="p-8 space-y-6">
                            {/* Preferred Pickup Date */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    Preferred Pickup Date <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-emerald-500 w-5 h-5" />
                                    <input
                                        type="date"
                                        value={formData.preferredDate}
                                        onChange={(e) => handleInputChange('preferredDate', e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full pl-12 pr-4 py-4 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-green-50/50 font-medium"
                                        placeholder="Select a date"
                                        title="Preferred Pickup Date"
                                    />
                                </div>
                            </div>

                            {/* Preferred Time Slot */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    Preferred Time Slot <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {timeSlots.map((slot) => (
                                        <button
                                            key={slot}
                                            onClick={() => handleInputChange('timeSlot', slot)}
                                            className={`px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${formData.timeSlot === slot
                                                ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg transform scale-105'
                                                : 'bg-green-50 border-green-200 text-gray-600 hover:bg-green-100 hover:border-green-300'
                                                }`}
                                        >
                                            <Clock className="w-4 h-4 mx-auto mb-1" />
                                            {slot}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Pickup Address */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    Pickup Address
                                </label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-4 text-emerald-500 w-5 h-5" />
                                    <div className="pl-12 pr-4 py-4 border-2 border-green-200 rounded-xl bg-green-50/50 text-gray-700 font-medium">
                                        {formData.pickupAddress}
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">Our team will collect from this registered address</p>
                            </div>

                            {/* Special Instructions */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    Special Instructions <span className="text-gray-400">(Optional)</span>
                                </label>
                                <textarea
                                    placeholder="Access instructions, contact person, specific location within premises..."
                                    value={formData.specialInstructions}
                                    onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                                    rows={4}
                                    className="w-full px-4 py-4 border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-green-50/50 resize-none font-medium"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Impact Info Card */}
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl p-6 text-white">
                        <div className="flex items-center mb-4">
                            <Leaf className="w-8 h-8 mr-3" />
                            <h3 className="text-xl font-bold">Environmental Impact</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                            <div className="bg-white/20 rounded-2xl p-4">
                                <div className="text-2xl font-bold">1kg</div>
                                <div className="text-sm opacity-90">≈ 0.4m³ biogas</div>
                            </div>
                            <div className="bg-white/20 rounded-2xl p-4">
                                <div className="text-2xl font-bold">5kg</div>
                                <div className="text-sm opacity-90">Powers 1 home for 2 hours</div>
                            </div>
                            <div className="bg-white/20 rounded-2xl p-4">
                                <div className="text-2xl font-bold">100%</div>
                                <div className="text-sm opacity-90">Carbon neutral process</div>
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
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center"
                    >
                        <Recycle className="w-6 h-6 mr-3" />
                        REQUEST PICKUP
                    </button>
                </div>
            </div>

            {/* Bottom padding */}
            <div className="h-24"></div>
        </div>
    );
}