import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Calendar,
    MapPin,
    Clock,
    Camera,
    Upload,
    CheckCircle,
    AlertCircle,
    Users,
    Package,
    Info,
    Star,
    Utensils,
    Timer,
    FileText,
    Building,
    ChevronDown,
    ImageIcon
} from 'lucide-react';

interface FormData {
    foodType: string;
    estimatedQuantity: string;
    freshnessStatus: string;
    additionalNotes: string;
    availableUntil: string;
    location: string;
}

const ListEventFood: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<FormData>({
        foodType: '',
        estimatedQuantity: '',
        freshnessStatus: '',
        additionalNotes: '',
        availableUntil: '',
        location: ''
    });
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const foodTypes = [
        'Prepared Meals',
        'Fresh Fruits & Vegetables',
        'Baked Goods',
        'Dairy Products',
        'Beverages',
        'Packaged Foods',
        'Desserts',
        'Other'
    ];

    const handleBack = () => {
        navigate(-1);
    };

    const freshnessOptions = [
        'Excellent - Just prepared',
        'Good - Within 2 hours',
        'Fair - Within 4 hours',
        'Best consumed soon'
    ];

    const handleInputChange = (field: keyof FormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setSelectedImage(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsSubmitting(false);
        alert('Food listing submitted successfully!');
    };

    const isFormValid = formData.foodType && formData.estimatedQuantity && formData.freshnessStatus;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-green-50/50">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-6 py-4">
                    <div className="flex items-center gap-4">
                        <button onClick={handleBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <ArrowLeft size={20} className="text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">List Event Food</h1>
                            <p className="text-sm text-gray-600">Quick 60-second listing</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-8">
                {/* Event Info Card */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg p-6 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                            <Calendar size={24} className="text-white" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-lg font-semibold text-gray-900">Annual Physics Seminar</h2>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                                <div className="flex items-center gap-1">
                                    <Building size={14} />
                                    Science Building - Room 201
                                </div>
                            </div>
                            <div className="mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium inline-block">
                                Auto-filled from campus calendar
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Form */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg overflow-hidden">
                    <div className="p-6 border-b border-gray-200/50">
                        <h3 className="text-lg font-semibold text-gray-900">Food Details</h3>
                    </div>

                    <div className="p-6 space-y-8">
                        {/* Food Type */}
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                <Utensils size={16} />
                                Food Type
                            </label>
                            <div className="relative">
                                <select
                                    value={formData.foodType}
                                    onChange={(e) => handleInputChange('foodType', e.target.value)}
                                    className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none"
                                >
                                    <option value="">Select food type</option>
                                    {foodTypes.map((type) => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                                <ChevronDown size={20} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Estimated Quantity */}
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                <Package size={16} />
                                Estimated Quantity
                            </label>
                            <input
                                type="text"
                                placeholder="How much food?"
                                value={formData.estimatedQuantity}
                                onChange={(e) => handleInputChange('estimatedQuantity', e.target.value)}
                                className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            />
                            <p className="text-xs text-gray-500">e.g., "50 sandwiches", "3 large trays", "Serves 25 people"</p>
                        </div>

                        {/* Freshness Status */}
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                <Timer size={16} />
                                Freshness Status
                            </label>
                            <div className="relative">
                                <select
                                    value={formData.freshnessStatus}
                                    onChange={(e) => handleInputChange('freshnessStatus', e.target.value)}
                                    className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none"
                                >
                                    <option value="">Food condition</option>
                                    {freshnessOptions.map((option) => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                                <ChevronDown size={20} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Food Photo */}
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                <Camera size={16} />
                                Food Photo (Optional)
                            </label>

                            {selectedImage ? (
                                <div className="relative">
                                    <img
                                        src={selectedImage}
                                        alt="Food preview"
                                        className="w-full h-48 object-cover rounded-xl border border-gray-200"
                                    />
                                    <button
                                        onClick={() => setSelectedImage(null)}
                                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                    >
                                        ×
                                    </button>
                                </div>
                            ) : (
                                <label className="w-full h-48 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all group">
                                    <div className="p-4 bg-gray-100 rounded-full group-hover:bg-blue-100 transition-colors">
                                        <Camera size={32} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-600 mt-3">Tap to add photo</p>
                                    <p className="text-xs text-gray-500 mt-1">Helps recipients see what's available</p>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                </label>
                            )}
                        </div>

                        {/* Additional Notes */}
                        <div className="space-y-3">
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                <FileText size={16} />
                                Additional Notes (Optional)
                            </label>
                            <textarea
                                placeholder="Any special instructions, allergen info, or pickup details..."
                                value={formData.additionalNotes}
                                onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
                                rows={4}
                                className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Pickup Information */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg mt-8">
                    <div className="p-6 border-b border-gray-200/50">
                        <h3 className="text-lg font-semibold text-gray-900">Pickup Information</h3>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Available Now */}
                        <div className="flex items-start gap-4 p-4 bg-green-50/80 border border-green-200 rounded-xl">
                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <CheckCircle size={16} className="text-white" />
                            </div>
                            <div>
                                <h4 className="font-medium text-green-900">Available Now</h4>
                                <p className="text-sm text-green-700 mt-1">Until 6:00 PM today</p>
                            </div>
                        </div>

                        {/* Location */}
                        <div className="flex items-start gap-4 p-4 bg-blue-50/80 border border-blue-200 rounded-xl">
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <MapPin size={16} className="text-white" />
                            </div>
                            <div>
                                <h4 className="font-medium text-blue-900">Science Building - Room 201</h4>
                                <p className="text-sm text-blue-700 mt-1">Room 201 - Main entrance</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="mt-8">
                    <button
                        onClick={handleSubmit}
                        disabled={!isFormValid || isSubmitting}
                        className={`w-full py-4 rounded-2xl font-semibold text-white transition-all duration-300 ${isFormValid && !isSubmitting
                            ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 hover:scale-105 shadow-lg'
                            : 'bg-gray-300 cursor-not-allowed'
                            }`}
                    >
                        {isSubmitting ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Submitting...
                            </div>
                        ) : (
                            'List Food for Pickup'
                        )}
                    </button>

                    <div className="mt-4 p-4 bg-blue-50/80 border border-blue-200 rounded-xl">
                        <div className="flex items-start gap-3">
                            <Info size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm text-blue-900 font-medium">
                                    Your listing will be visible to campus recipients immediately
                                </p>
                                <p className="text-xs text-blue-700 mt-1">
                                    You'll receive notifications when someone requests pickup
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ListEventFood;