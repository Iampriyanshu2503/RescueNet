import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { foodDonationService } from '../services/foodDonationService';
import { FoodDonation, CreateFoodDonationRequest } from '../types/foodListing';

const EditFoodListing: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [foodListing, setFoodListing] = useState<FoodDonation | null>(null);
  
  const [formData, setFormData] = useState({
    foodType: '',
    servings: '',
    description: '',
    bestBeforeHours: '',
    bestBeforeMinutes: '',
    allergens: [] as string[],
    pickupInstructions: '',
    image: ''
  });

  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    const fetchFoodListing = async () => {
      try {
        if (!id) return;
        const data = await foodDonationService.getById(id);
        setFoodListing(data);
        
        // Parse bestBefore from hours format to hours and minutes
        const bestBeforeValue = parseFloat(data.bestBefore);
        const bestBeforeHours = Math.floor(bestBeforeValue);
        const bestBeforeMinutes = Math.round((bestBeforeValue - bestBeforeHours) * 60);
        
        setFormData({
          foodType: data.foodType,
          servings: data.servings,
          description: data.description,
          bestBeforeHours: bestBeforeHours.toString(),
          bestBeforeMinutes: bestBeforeMinutes.toString(),
          allergens: data.allergens || [],
          pickupInstructions: data.pickupInstructions || '',
          image: data.image || ''
        });
      } catch (error) {
        console.error('Error fetching food listing:', error);
        toast.error('Failed to load food listing details');
      } finally {
        setLoading(false);
      }
    };

    fetchFoodListing();
  }, [id]);

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear validation error when field is edited
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[field];
        return newErrors;
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

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!formData.foodType) {
      errors.foodType = 'Food type is required';
    }
    
    if (!formData.servings) {
      errors.servings = 'Number of servings is required';
    }
    
    if (!formData.description) {
      errors.description = 'Description is required';
    }
    
    if (!formData.bestBeforeHours && !formData.bestBeforeMinutes) {
      errors.bestBefore = 'Best before time is required';
    }
    
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      
      // Create a specific error message listing missing fields
      const missingFields = Object.keys(errors).map(key => {
        switch(key) {
          case 'foodType': return 'Food Type';
          case 'servings': return 'Servings';
          case 'description': return 'Description';
          case 'bestBefore': return 'Best Before Time';
          default: return key;
        }
      }).join(', ');
      
      toast.error(`Please fill in these required fields: ${missingFields}`);
      return;
    }

    setSubmitting(true);

    try {
      // Format the bestBefore time
      const bestBeforeHours = parseInt(formData.bestBeforeHours) || 0;
      const bestBeforeMinutes = parseInt(formData.bestBeforeMinutes) || 0;
      const totalHours = bestBeforeHours + (bestBeforeMinutes / 60);
      const bestBefore = totalHours.toString();

      // Create payload without image first
      const payload: Partial<CreateFoodDonationRequest> = {
        foodType: formData.foodType,
        servings: formData.servings,
        description: formData.description,
        bestBefore,
        allergens: formData.allergens,
        pickupInstructions: formData.pickupInstructions || undefined,
      };
      
      // Process image if it's changed
      if (formData.image && formData.image !== foodListing?.image) {
        // Check if image is too large (over ~5MB when encoded)
        if (formData.image.length > 7000000) {
          toast.warning('Image is too large and will not be included');
        } else {
          payload.image = formData.image;
        }
      }

      if (!id) throw new Error('Food listing ID is missing');
      
      // Submit the form
      await foodDonationService.update(id, payload);
      
      toast.success('Food listing updated successfully!');
      navigate('/donor/dashboard');
    } catch (error: any) {
      console.error('Error updating food listing:', error);
      let errorMessage = 'Failed to update food listing. Please try again.';
      let errorDetails = '';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
        // Check for validation errors from backend
        if (error.response.data.errors) {
          errorDetails = Object.keys(error.response.data.errors)
            .map(field => `${field}: ${error.response.data.errors[field]}`)
            .join(', ');
        }
      } else if (error.message && error.message.includes('Network Error')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      if (errorDetails) {
        toast.error(`Validation errors: ${errorDetails}`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!foodListing) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Food listing not found</p>
        </div>
        <button 
          onClick={handleCancel}
          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Go Back
        </button>
      </div>
    );
  }

  // List of common allergens
  const allergenOptions = [
    'Dairy', 'Eggs', 'Peanuts', 'Tree Nuts', 'Fish',
    'Shellfish', 'Wheat', 'Soy', 'Sesame', 'Gluten'
  ];

  // Food type options
  const foodTypeOptions = [
    'Prepared Meal', 'Fruits', 'Vegetables', 'Bakery', 
    'Dairy Products', 'Meat', 'Seafood', 'Canned Goods',
    'Dry Goods', 'Beverages', 'Snacks', 'Other'
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Edit Food Listing</h1>
        
        <form onSubmit={handleSubmit}>
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
                <option value="">Select food type</option>
                {foodTypeOptions.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {validationErrors.foodType && (
                <p className="mt-1 text-sm text-red-500">{validationErrors.foodType}</p>
              )}
            </div>
            
            {/* Servings */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Servings <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.servings}
                onChange={(e) => handleInputChange('servings', e.target.value)}
                placeholder="Number of servings"
                className={`w-full px-4 py-3 border ${validationErrors.servings ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50`}
              />
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
                Best Before <span className="text-red-500">*</span>
              </label>
              <div className="flex space-x-3">
                <div className="relative flex-1">
                  <input
                    type="number"
                    min="0"
                    value={formData.bestBeforeHours}
                    onChange={(e) => handleInputChange('bestBeforeHours', e.target.value)}
                    placeholder="0"
                    className={`w-full px-4 py-3 border ${validationErrors.bestBefore ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">hrs</span>
                </div>
                <div className="relative flex-1">
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={formData.bestBeforeMinutes}
                    onChange={(e) => handleInputChange('bestBeforeMinutes', e.target.value)}
                    placeholder="0"
                    className={`w-full px-4 py-3 border ${validationErrors.bestBefore ? 'border-red-500' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">mins</span>
                </div>
              </div>
              {validationErrors.bestBefore ? (
                <p className="text-sm text-red-500 mt-1">{validationErrors.bestBefore}</p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">How many hours until the food should be consumed</p>
              )}
            </div>
            
            {/* Allergens */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Allergens (optional)
              </label>
              <div className="flex flex-wrap gap-2">
                {allergenOptions.map((allergen) => (
                  <button
                    key={allergen}
                    type="button"
                    onClick={() => handleAllergenToggle(allergen)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      formData.allergens.includes(allergen)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {allergen}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">Select all that apply</p>
            </div>
            
            {/* Pickup Instructions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pickup Instructions (optional)
              </label>
              <textarea
                value={formData.pickupInstructions}
                onChange={(e) => handleInputChange('pickupInstructions', e.target.value)}
                placeholder="Add any special instructions for pickup"
                rows={2}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50 resize-none"
              />
            </div>
            
            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </>
                ) : 'Update Food Listing'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditFoodListing;