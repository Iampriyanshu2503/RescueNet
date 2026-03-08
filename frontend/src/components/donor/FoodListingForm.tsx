import React, { useState, useEffect } from 'react';
import { ArrowLeft, Camera, Users, Clock, MapPin, AlertCircle, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { foodDonationService } from '../../services/foodDonationService';
import type { CreateFoodDonationRequest } from '../../types/foodListing';
import { showNotification } from '../../utils/notificationUtils';
import LocationPicker from '../maps/LocationPicker';
import InteractiveMap from '../maps/InteractiveMap';

interface FormData {
    foodType: string;
    servings: string;
    description: string;
    bestBefore: string;
    bestBeforeHours: string;
    bestBeforeMinutes: string;
    allergens: string[];
    pickupInstructions: string;
    location: any;
}

export default function AddSurplusFood() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<FormData>({
        foodType: '',
        servings: '',
        description: '',
        bestBefore: '',
        bestBeforeHours: '',
        bestBeforeMinutes: '',
        allergens: [],
        pickupInstructions: '',
        location: null
    });

    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
    const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
    const [showLocationHelp, setShowLocationHelp] = useState(false);

    const allergenOptions = [
        'Contains Gluten',
        'Contains Dairy',
        'Contains Nuts',
        'Contains Eggs',
        'Contains Soy',
        'Spicy Food',
        'Contains Seafood'
    ];

    const handleInputChange = (field: keyof FormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleLocationSelect = (location: any) => {
        setFormData(prev => ({ ...prev, location }));
        if (location && validationErrors.location) {
            setValidationErrors(prev => {
                const next = { ...prev };
                delete next.location;
                return next;
            });
        }
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
        const file = event.target.files?.[0];
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

    const handleBack = () => navigate('/donor-dashboard');

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
                    const code = error.code;
                    const human =
                        code === 1 ? 'Location permission denied. Please allow location access.'
                        : code === 2 ? 'Location unavailable. Check GPS or network.'
                        : code === 3 ? 'Location request timed out. Try again.'
                        : 'Unable to get location.';
                    console.log('Error getting location:', { code, message: error.message });
                    showNotification?.warning?.(human);
                },
                { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
            );
        }
    }, []);

    const validateForm = () => {
        const errors: {[key: string]: string} = {};

        if (!formData.foodType)
            errors.foodType = 'Food type is required';

        if (!formData.servings)
            errors.servings = 'Number of servings is required';

        if (!formData.description)
            errors.description = 'Description is required';

        if (!formData.bestBeforeHours && !formData.bestBeforeMinutes)
            errors.bestBefore = 'Best before time is required';

        if (!formData.location) {
            errors.location = 'Pickup location is required';
        } else if (!formData.location.coordinates) {
            errors.location = 'Please select a location with valid coordinates';
        } else if (typeof formData.location.coordinates !== 'object') {
            errors.location = 'Invalid location format';
        }

        return errors;
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            const missingFields = Object.keys(errors).map(key => {
                switch (key) {
                    case 'foodType': return 'Food Type';
                    case 'servings': return 'Servings';
                    case 'description': return 'Description';
                    case 'bestBefore': return 'Best Before Time';
                    case 'location': return 'Pickup Location';
                    default: return key;
                }
            }).join(', ');
            showNotification.error(`Please fill in these required fields: ${missingFields}`);
            return;
        }

        setIsSubmitting(true);

        try {
            const pickupInstructions = formData.pickupInstructions || 'Contact for pickup details';

            const hours = parseInt(formData.bestBeforeHours) || 0;
            const minutes = parseInt(formData.bestBeforeMinutes) || 0;
            const bestBefore = (hours + minutes / 60).toString();

            let locationData = formData.location;
            if (
                locationData?.coordinates &&
                typeof locationData.coordinates === 'object' &&
                'lat' in locationData.coordinates &&
                'lng' in locationData.coordinates
            ) {
                locationData = {
                    ...locationData,
                    coordinates: [locationData.coordinates.lat, locationData.coordinates.lng]
                };
            }

            const payload: CreateFoodDonationRequest = {
                foodType: formData.foodType,
                servings: formData.servings,
                description: formData.description,
                bestBefore,
                allergens: formData.allergens,
                pickupInstructions,
                location: locationData,
            };

            let processedImage: string | null = null;
            if (selectedImage?.startsWith('data:image')) {
                if (selectedImage.length > 7_000_000) {
                    showNotification.warning('Image is too large and will not be included');
                } else {
                    processedImage = selectedImage;
                }
            }
            if (processedImage) payload.image = processedImage;

            const response = await foodDonationService.create(payload);
            console.log('Submission response:', response);

            setFormData({
                foodType: '',
                servings: '',
                description: '',
                bestBefore: '',
                bestBeforeHours: '',
                bestBeforeMinutes: '',
                allergens: [],
                pickupInstructions: '',
                location: null
            });
            setSelectedImage(null);
            setValidationErrors({});

            showNotification.success('Food listing submitted successfully!');
            navigate('/donor-dashboard');

        } catch (error: any) {
            console.error('Failed to create food donation', error);

            let errorMessage = 'Failed to submit food listing. Please try again.';
            let errorDetails = '';

            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
                if (error.response.data.errors) {
                    errorDetails = Object.entries(error.response.data.errors)
                        .map(([field, msg]) => `${field}: ${msg}`)
                        .join(', ');
                }
            } else if (error.message?.includes('Network Error')) {
                errorMessage = 'Network error. Please check your connection and try again.';
            } else if (error.message) {
                errorMessage = error.message;
            }

            showNotification.error(errorMessage);
            if (errorDetails) showNotification.error(`Validation errors: ${errorDetails}`);

            if (error.response?.data?.errors?.location) {
                setValidationErrors(prev => ({
                    ...prev,
                    location: error.response.data.errors.location
                }));
            }
        } finally {
            setIsSubmitting(false);
        }
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

            {/* Form Content */}
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
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Food Type <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={formData.foodType}
                                        onChange={(e) => handleInputChange('foodType', e.target.value)}
                                        className={`w-full px-4 py-3 border ${validationErrors.foodType ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50`}
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
                                    {validationErrors.foodType && (
                                        <p className="mt-1 text-sm text-red-500">{validationErrors.foodType}</p>
                                    )}
                                </div>

                                {/* Servings */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Number of Servings <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                        <input
                                            type="number"
                                            placeholder="e.g. 25"
                                            value={formData.servings}
                                            onChange={(e) => handleInputChange('servings', e.target.value)}
                                            className={`w-full pl-12 pr-4 py-3 border ${validationErrors.servings ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50`}
                                        />
                                    </div>
                                    {validationErrors.servings && (
                                        <p className="mt-1 text-sm text-red-500">{validationErrors.servings}</p>
                                    )}
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                        placeholder="Describe the food (e.g., ingredients, preparation)"
                                        rows={3}
                                        className={`w-full px-4 py-3 border ${validationErrors.description ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50 resize-none`}
                                    />
                                    {validationErrors.description && (
                                        <p className="mt-1 text-sm text-red-500">{validationErrors.description}</p>
                                    )}
                                </div>

                                {/* Best Before */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Best Before (Time from now) <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex space-x-4">
                                        <div className="relative flex-1">
                                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                            <input
                                                type="number"
                                                min="0"
                                                placeholder="Hours"
                                                value={formData.bestBeforeHours}
                                                onChange={(e) => handleInputChange('bestBeforeHours', e.target.value)}
                                                className={`w-full pl-12 pr-10 py-3 border ${validationErrors.bestBefore ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50`}
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">hrs</span>
                                        </div>
                                        <div className="relative flex-1">
                                            <input
                                                type="number"
                                                min="0"
                                                max="59"
                                                placeholder="Minutes"
                                                value={formData.bestBeforeMinutes}
                                                onChange={(e) => handleInputChange('bestBeforeMinutes', e.target.value)}
                                                className={`w-full px-4 pr-14 py-3 border ${validationErrors.bestBefore ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50`}
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">mins</span>
                                        </div>
                                    </div>
                                    {validationErrors.bestBefore ? (
                                        <p className="text-sm text-red-500 mt-1">{validationErrors.bestBefore}</p>
                                    ) : (
                                        <p className="text-xs text-gray-500 mt-1">How many hours/minutes until the food should be consumed</p>
                                    )}
                                </div>

                                {/* Pickup Location */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Pickup Location <span className="text-red-500">*</span>
                                    </label>
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-gray-500">Select a precise location for food pickup</span>
                                            <button
                                                type="button"
                                                onClick={() => setShowLocationHelp(!showLocationHelp)}
                                                className="text-blue-500 hover:text-blue-700 flex items-center"
                                            >
                                                <Info className="w-4 h-4 mr-1" />
                                                <span className="text-xs">Help</span>
                                            </button>
                                        </div>

                                        {showLocationHelp && (
                                            <div className="mb-3 p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800">
                                                <p className="font-medium mb-1">Location Selection Tips:</p>
                                                <ul className="list-disc pl-5 space-y-1">
                                                    <li>Use the search box to find your exact address</li>
                                                    <li>Click "Use current location" for your present position</li>
                                                    <li>Use "Manual Entry" to input coordinates directly</li>
                                                    <li>Ensure the selected location has valid coordinates</li>
                                                    <li>A precise location helps volunteers find your donation</li>
                                                </ul>
                                            </div>
                                        )}

                                        <LocationPicker
                                            onLocationSelect={handleLocationSelect}
                                            required={true}
                                            showMap={true}
                                        />

                                        {validationErrors.location && (
                                            <div className="mt-2 flex items-center space-x-2 text-red-600">
                                                <AlertCircle className="w-4 h-4" />
                                                <span className="text-sm">{validationErrors.location}</span>
                                            </div>
                                        )}

                                        {formData.location?.coordinates && (
                                            <div className="mt-4 border border-gray-200 rounded-lg overflow-hidden">
                                                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                                                    <h3 className="text-sm font-medium text-gray-700">Location Preview</h3>
                                                </div>
                                                <div className="h-48">
                                                    <InteractiveMap
                                                        foodListings={[{
                                                            id: 'preview',
                                                            title: 'Pickup Location',
                                                            description: formData.description || 'Food donation pickup',
                                                            location: { coordinates: formData.location.coordinates }
                                                        }]}
                                                        userLocation={userLocation}
                                                        height="100%"
                                                        showUserLocation={true}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Allergen Information */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Allergen Information</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                {allergenOptions.map((allergen) => (
                                    <button
                                        key={allergen}
                                        type="button"
                                        onClick={() => handleAllergenToggle(allergen)}
                                        className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                                            formData.allergens.includes(allergen)
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
                                placeholder="Provide specific instructions..."
                                value={formData.pickupInstructions}
                                onChange={(e) => handleInputChange('pickupInstructions', e.target.value)}
                                rows={4}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50 resize-none"
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
                        disabled={isSubmitting}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 px-6 rounded-xl transition-colors shadow-lg disabled:opacity-50"
                    >
                        {isSubmitting ? 'Submitting...' : 'POST LISTING'}
                    </button>
                </div>
            </div>
            <div className="h-24" />
        </div>
    );
}