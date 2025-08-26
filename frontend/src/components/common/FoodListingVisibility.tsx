import React, { useState } from 'react';
import { Clock, MapPin, AlertCircle, Info, ExternalLink, Edit, ShoppingBag, Map } from 'lucide-react';
import { FoodDonation } from '../../types/foodListing';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { showNotification } from '../../utils/notificationUtils';
import { isListingExpired } from '../../utils/expirationUtils';
import CountdownTimer from './CountdownTimer';
import InteractiveMap from '../maps/InteractiveMap';

interface FoodListingVisibilityProps {
  listing: FoodDonation;
}

const FoodListingVisibility: React.FC<FoodListingVisibilityProps> = ({ listing }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showMap, setShowMap] = useState(false);
  
  const handleViewDetails = () => {
    navigate(`/food-details/${listing._id}`);
  };
  
  const handleRequestFood = () => {
    navigate(`/request-food/${listing._id}`);
    showNotification.success('Request initiated');
  };
  
  const handleEditListing = () => {
    navigate(`/edit-listing/${listing._id}`);
  };
  
  // Format the best before date
  const formatBestBefore = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      {/* Food Image */}
      {listing.image && (
        <div className="h-48 w-full overflow-hidden">
          <img 
            src={listing.image} 
            alt={listing.foodType}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-gray-900">{listing.foodType}</h3>
          <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
            {listing.servings} servings
          </div>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <CountdownTimer expiryDate={new Date(new Date(listing.createdAt).getTime() + parseFloat(listing.bestBefore) * 60 * 60 * 1000)} />
          </div>
          
          <div className="flex items-center text-sm text-gray-600 cursor-pointer" 
               onClick={() => listing.location?.coordinates ? setShowMap(!showMap) : null}>
            <MapPin className="w-4 h-4 mr-2 text-gray-500" />
            {listing.location?.address || 'Location not specified'}
            {listing.location?.coordinates && (
              <Map className="w-4 h-4 ml-2 text-blue-500" />
            )}
          </div>
          
          {/* Map Preview */}
          {showMap && listing.location?.coordinates && listing.location.coordinates.length === 2 && (
            <div className="mt-3 h-48 rounded-lg overflow-hidden border border-gray-200">
              <InteractiveMap 
                locations={[{
                  position: {
                    lat: listing.location.coordinates[0],
                    lng: listing.location.coordinates[1]
                  },
                  title: listing.foodType,
                  info: `${listing.servings} servings`
                }]}
                zoom={14}
                height="100%"
              />
            </div>
          )}
          
          {listing.description && (
            <p className="text-sm text-gray-700 mt-2">{listing.description}</p>
          )}
          
          {listing.allergens && listing.allergens.length > 0 && (
            <div className="flex items-center text-sm text-amber-700 mt-1">
              <AlertCircle className="w-4 h-4 mr-2" />
              Allergens: {listing.allergens.join(', ')}
            </div>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={handleViewDetails}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-sm font-medium flex items-center"
          >
            <Info className="w-4 h-4 mr-2" />
            View Details
          </button>
          
          {user?.role === 'recipient' && listing.status === 'available' && !isListingExpired(listing) && (
            <button
              onClick={handleRequestFood}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center"
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              Request Food
            </button>
          )}
          
          {user?.role === 'recipient' && listing.status === 'expired' && (
            <div className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              Expired
            </div>
          )}
          
          {user?.role === 'donor' && user._id === listing.user && (
            <button
              onClick={handleEditListing}
              className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg text-sm font-medium flex items-center"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Listing
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FoodListingVisibility;