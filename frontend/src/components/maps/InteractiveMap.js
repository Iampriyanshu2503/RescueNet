import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { MapPin, Navigation, Clock, Users, Star, Phone, MessageCircle } from 'lucide-react';

const mapContainerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '12px',
};

const options = {
  disableDefaultUI: false,
  zoomControl: true,
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }]
    },
    {
      featureType: 'transit',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }]
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#e9e9e9' }]
    },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [{ color: '#ffffff' }]
    },
    {
      featureType: 'road',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#d6d6d6' }]
    }
  ],
};

const InteractiveMap = ({ 
  foodListings = [], 
  userLocation = null, 
  onListingClick = null,
  height = '400px',
  showUserLocation = true 
}) => {
  const [selectedListing, setSelectedListing] = useState(null);
  const [center, setCenter] = useState(userLocation || { lat: 40.7128, lng: -74.0060 }); // Default to NYC
  const [distanceText, setDistanceText] = useState(null);
  
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries: ['places'],
    // Add error handling for API loading issues
    onError: (error) => {
      console.error('Google Maps API loading error:', error);
    }
  });

  const [map, setMap] = useState(null);

  const onLoad = useCallback(function callback(map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback(map) {
    setMap(null);
  }, []);

  useEffect(() => {
    if (userLocation) {
      setCenter(userLocation);
    }
  }, [userLocation]);
  
  // Update distance when selected listing changes
  useEffect(() => {
    if (selectedListing && userLocation && selectedListing.location) {
      const fetchDistance = async () => {
        const distance = await getDistance(selectedListing.location.coordinates);
        setDistanceText(distance);
      };
      fetchDistance();
    } else {
      setDistanceText(null);
    }
  }, [selectedListing, userLocation]);

  const getDistance = async (listingLocation) => {
    if (!userLocation || !listingLocation) return null;
    
    try {
      const service = new window.google.maps.DistanceMatrixService();
      const response = await service.getDistanceMatrix({
        origins: [userLocation],
        destinations: [listingLocation],
        travelMode: 'DRIVING',
      });
      
      if (response.rows[0].elements[0].status === 'OK') {
        return response.rows[0].elements[0].distance.text;
      }
      
      // Fallback to simple calculation if API fails
      const latDiff = listingLocation.lat - userLocation.lat;
      const lngDiff = listingLocation.lng - userLocation.lng;
      const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111; // Rough km conversion
      
      return distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`;
    } catch (error) {
      console.error('Error calculating distance:', error);
      
      // Fallback to simple calculation if API fails
      const latDiff = listingLocation.lat - userLocation.lat;
      const lngDiff = listingLocation.lng - userLocation.lng;
      const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111; // Rough km conversion
      
      return distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`;
    }
  };

  const getDirections = (listing) => {
    if (!listing.location || !userLocation) return;
    
    const { lat, lng } = listing.location.coordinates;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    window.open(url, '_blank');
  };

  if (loadError) {
    const isApiNotActivatedError = loadError.toString().includes('ApiNotActivatedMapError');
    
    return (
      <div className="w-full p-4 border border-red-300 rounded-lg bg-red-50 text-red-800">
        <h3 className="font-medium mb-2">Error loading Google Maps</h3>
        {isApiNotActivatedError ? (
          <>
            <p className="text-sm mb-2"><strong>ApiNotActivatedMapError</strong>: The Google Maps JavaScript API is not enabled for your API key.</p>
            <p className="text-sm mb-2">To fix this error:</p>
            <ol className="list-decimal pl-5 text-sm mb-3">
              <li>Go to the <a href="https://console.cloud.google.com/apis/library/maps-backend.googleapis.com" className="underline" target="_blank" rel="noopener noreferrer">Google Cloud Console</a></li>
              <li>Make sure you're signed in with the correct Google account</li>
              <li>Enable the "Maps JavaScript API" for your project</li>
              <li>Wait 5-10 minutes for the changes to propagate</li>
            </ol>
          </>
        ) : (
          <>
            <p className="text-sm mb-2">There was a problem loading the map. This might be due to:</p>
            <ul className="list-disc pl-5 text-sm mb-3">
              <li>Google Maps API not being enabled in the Google Cloud Console</li>
              <li>API key restrictions preventing the map from loading</li>
              <li>Network connectivity issues</li>
            </ul>
          </>
        )}
        <p className="text-sm">Please check the <a href="#" className="underline" onClick={(e) => {
          e.preventDefault();
          window.open('/GOOGLE_MAPS_API_SETUP.md', '_blank');
        }}>Google Maps API Setup Guide</a> for detailed troubleshooting steps.</p>
      </div>
    );
  }
  if (!isLoaded) return <div className="w-full p-4 border border-blue-300 rounded-lg bg-blue-50 text-blue-800">Loading maps...</div>;

  return (
    <div className="w-full">
      {/* Map Container */}
      <div style={{ height }}>
        <GoogleMap
          mapContainerStyle={{
            ...mapContainerStyle,
            height,
          }}
          center={center}
          zoom={13}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={options}
        >
          {/* Food Listing Markers */}
          {foodListings.map((listing, index) => {
            if (listing.location && listing.location.coordinates) {
              // Normalize coordinates to { lat, lng }
              const coords = Array.isArray(listing.location.coordinates)
                ? { lat: Number(listing.location.coordinates[0]), lng: Number(listing.location.coordinates[1]) }
                : listing.location.coordinates;
              const key = listing._id || listing.id || `${listing.title || 'listing'}-${index}`;
              return (
                <Marker
                  key={key}
                  position={coords}
                  icon={{
                    url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><circle cx="20" cy="20" r="15" fill="${listing.status === 'available' ? '%2310B981' : '%236B7280'}" stroke="white" stroke-width="3"/><text x="20" y="25" font-size="16" text-anchor="middle" fill="white">${listing.status === 'available' ? '🍽️' : '⏰'}</text></svg>`,
                    scaledSize: new window.google.maps.Size(40, 40),
                  }}
                  onClick={() => {
                    setSelectedListing(listing);
                    if (onListingClick) {
                      onListingClick(listing);
                    }
                  }}
                />
              );
            }
            return null;
          })}

          {/* User Location Marker */}
          {showUserLocation && userLocation && (
            <Marker
              position={userLocation}
              icon={{
                url: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><circle cx="20" cy="20" r="15" fill="%23EF4444" stroke="white" stroke-width="3"/><text x="20" y="25" font-size="16" text-anchor="middle" fill="white">📍</text></svg>`,
                scaledSize: new window.google.maps.Size(40, 40),
              }}
              onClick={() => setSelectedListing(null)}
            />
          )}

          {/* Info Window for Selected Listing */}
          {selectedListing && (
            <InfoWindow
              position={Array.isArray(selectedListing.location?.coordinates)
                ? { lat: Number(selectedListing.location.coordinates[0]), lng: Number(selectedListing.location.coordinates[1]) }
                : selectedListing.location?.coordinates}
              onCloseClick={() => setSelectedListing(null)}
            >
              <div className="p-2 max-w-xs">
                <h3 className="font-bold text-lg">{selectedListing.title}</h3>
                <p className="text-sm text-gray-600">{selectedListing.description}</p>
                {userLocation && selectedListing.location && (
                  <div className="mt-2 flex items-center text-sm text-blue-600">
                    <MapPin className="w-4 h-4 mr-1" />
                    {distanceText || 'Calculating...'}
                  </div>
                )}
                <button
                  onClick={() => getDirections(selectedListing)}
                  className="mt-2 px-3 py-1 bg-blue-500 text-white rounded-md text-sm flex items-center"
                >
                  <Navigation className="w-3 h-3 mr-1" /> Directions
                </button>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      </div>

      {/* Map Controls */}
      <div className="mt-2 flex justify-end space-x-2">
        <button
          onClick={() => {
            if (userLocation && map) {
              map.panTo(userLocation);
            }
          }}
          className="px-3 py-1 bg-white border border-gray-300 rounded-md text-sm flex items-center hover:bg-gray-50"
          title="Center on my location"
        >
          <Navigation className="w-4 h-4 mr-1 text-gray-600" /> My Location
        </button>
      </div>
    </div>
  );
};

export default InteractiveMap;
