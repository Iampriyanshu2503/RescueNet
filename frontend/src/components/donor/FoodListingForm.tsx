import React, { useState } from 'react';
import { ArrowLeft, Camera, Users, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


interface FormData {
    foodType: string;
    servings: string;
    description: string;
    bestBefore: string;
    allergens: string[];
    pickupInstructions: string;
}

export default function AddSurplusFood() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<FormData>({
        foodType: '',
        servings: '',
        description: '',
        bestBefore: '',
        allergens: [],
        pickupInstructions: ''
    });

    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const allergenOptions = [
        'Contains Gluten',
        'Contains Dairy',
        'Contains Nuts',
        'Contains Eggs',
        'Contains Soy',
        'Spicy Food',
        'Contains Seafood'
    ];

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleAllergenToggle = (allergen: string) => {
        setFormData(prev => ({
            ...prev,
            allergens: prev.allergens.includes(allergen)
                ? prev.allergens.filter(a => a !== allergen)
                : [...prev.allergens, allergen]
        }));
    };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files && event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (typeof e.target?.result === 'string') {
                    setSelectedImage(e.target.result);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleBack = () => {
        navigate('/donor-dashboard');
        console.log('Back button clicked');
    };

    const handleSubmit = () => {
        console.log('Form submitted:', formData);
        navigate('/donor-dashboard');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center py-6">
                        <button
                            onClick={handleBack}
                            className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Add Surplus Food</h1>
                            <p className="text-sm text-gray-600 mt-1">Share your surplus with those in need</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-8 space-y-8">
                        {/* Food Photo Section */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Food Photo</h3>
                            <p className="text-sm text-gray-600 mb-4">Add an appealing photo of your surplus food</p>

                            <div className="relative border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-gray-300 transition-colors">
                                {selectedImage ? (
                                    <div className="relative">
                                        <img
                                            src={selectedImage}
                                            alt="Food preview"
                                            className="max-h-64 mx-auto rounded-lg shadow-md"
                                        />
                                        <button
                                            onClick={() => setSelectedImage(null)}
                                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-600 mb-2">Tap to add photo</p>
                                        <p className="text-xs text-gray-500">JPG, PNG up to 10MB</p>
                                    </>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    title="Upload food photo"
                                />
                            </div>
                        </div>

                        {/* Food Details Section */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-6">Food Details</h3>

                            <div className="space-y-6">
                                {/* Food Type */}
                                <div>
                                    <label htmlFor="foodType" className="block text-sm font-medium text-gray-700 mb-2">
                                        Food Type <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="foodType"
                                        value={formData.foodType}
                                        onChange={(e) => handleInputChange('foodType', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-gray-700"
                                    >
                                        <option value="">Select food category</option>
                                        <option value="main-course">Main Course</option>
                                        <option value="appetizer">Appetizer</option>
                                        <option value="dessert">Dessert</option>
                                        <option value="beverages">Beverages</option>
                                        <option value="snacks">Snacks</option>
                                        <option value="fruits">Fruits</option>
                                        <option value="vegetables">Vegetables</option>
                                    </select>
                                </div>

                                {/* Number of Servings */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Number of Servings <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="number"
                                            placeholder="e.g. 25"
                                            value={formData.servings}
                                            onChange={(e) => handleInputChange('servings', e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                                        />
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        placeholder="Describe the food items, taste, and any special details..."
                                        value={formData.description}
                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                        rows={4}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 resize-none"
                                    />
                                </div>

                                {/* Best Before */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Best Before (Hours from now) <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="number"
                                            placeholder="e.g. 4"
                                            value={formData.bestBefore}
                                            onChange={(e) => handleInputChange('bestBefore', e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">How many hours until the food should be consumed</p>
                                </div>
                            </div>
                        </div>

                        {/* Allergen Information */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Allergen Information</h3>
                            <p className="text-sm text-gray-600 mb-4">Select all applicable allergens</p>

                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                {allergenOptions.map((allergen) => (
                                    <button
                                        key={allergen}
                                        onClick={() => handleAllergenToggle(allergen)}
                                        className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${formData.allergens.includes(allergen)
                                            ? 'bg-red-50 border-red-200 text-red-700'
                                            : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                                            }`}
                                    >
                                        {allergen}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Pickup Instructions */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pickup Instructions</h3>
                            <textarea
                                placeholder="Provide specific instructions for pickup location, timing, contact person, etc..."
                                value={formData.pickupInstructions}
                                onChange={(e) => handleInputChange('pickupInstructions', e.target.value)}
                                rows={4}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 resize-none"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4">
                <div className="max-w-4xl mx-auto">
                    <button
                        onClick={handleSubmit}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 px-6 rounded-xl transition-colors shadow-lg"
                    >
                        POST LISTING
                    </button>
                </div>
            </div>

            {/* Bottom padding to prevent content being hidden behind fixed button */}
            <div className="h-24"></div>
        </div>
    );
}