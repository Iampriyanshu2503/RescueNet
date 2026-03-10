import React, { useState, useEffect } from 'react';
import { MapPin, Search, Navigation, CheckCircle, AlertCircle, MapPinned, Keyboard } from 'lucide-react';
import { useJsApiLoader, Autocomplete } from '@react-google-maps/api';

const LIBRARIES = ['places'];

const LocationPicker = ({ 
  onLocationSelect = null, 
  initialLocation = null,
  placeholder = "Enter pickup address...",
  showMap = true,
  required = false 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [autocomplete, setAutocomplete] = useState(null);
  const [manualEntry, setManualEntry] = useState(false);
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');
  const [manualAddress, setManualAddress] = useState('');
  const [noGeometryWarn, setNoGeometryWarn] = useState(false);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: "AIzaSyB2QreQwsLYcpZh3pCWq0OTiycTQnJygs4"
,
    libraries: LIBRARIES,
  });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        },
        (error) => console.log('Error getting location:', { code: error.code, message: error.message })
      );
    }
  }, []);

  const onLoad = (autocomplete) => setAutocomplete(autocomplete);

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();

      // Guard: user typed but pressed Enter without picking a suggestion
      // In that case Google returns a place object with no geometry
      if (!place || !place.geometry || !place.geometry.location) {
        setNoGeometryWarn(true);
        setTimeout(() => setNoGeometryWarn(false), 3500);
        return;
      }

      setNoGeometryWarn(false);

      const location = {
        id: place.place_id,
        address: place.formatted_address,
        coordinates: {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        },
        type: 'place'
      };

      setSelectedLocation(location);
      setSearchQuery(place.formatted_address);
      if (onLocationSelect) onLocationSelect(location);
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) { alert('Geolocation is not supported by your browser'); return; }
    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const currentCoords = { lat: position.coords.latitude, lng: position.coords.longitude };
        setUserLocation(currentCoords);
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: currentCoords }, (results, status) => {
          setIsLoading(false);
          const address = (status === 'OK' && results[0]) ? results[0].formatted_address : 'Current Location';
          const currentLocation = { id: 'current', address, coordinates: currentCoords, type: 'gps' };
          setSelectedLocation(currentLocation);
          setSearchQuery(address);
          setManualEntry(false);
          setManualAddress('');
          if (onLocationSelect) onLocationSelect(currentLocation);
        });
      },
      (error) => {
        setIsLoading(false);
        alert(`Error getting your location: ${error.message}. Please check your browser permissions.`);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handleManualLocationSubmit = () => {
    if (manualAddress.trim()) {
      setIsLoading(true);
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: manualAddress }, (results, status) => {
        setIsLoading(false);
        if (status === 'OK' && results[0]) {
          const coordinates = { lat: results[0].geometry.location.lat(), lng: results[0].geometry.location.lng() };
          const formattedAddress = results[0].formatted_address || manualAddress;
          const manualLocation = { id: 'manual', address: formattedAddress, coordinates, type: 'manual' };
          setSelectedLocation(manualLocation);
          setSearchQuery(formattedAddress);
          if (onLocationSelect) onLocationSelect(manualLocation);
        } else {
          alert('Could not find coordinates for this address. Please enter a valid address.');
        }
      });
    } else if (manualLat && manualLng) {
      try {
        const lat = parseFloat(manualLat);
        const lng = parseFloat(manualLng);
        if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
          alert('Please enter valid latitude (-90 to 90) and longitude (-180 to 180) values.');
          return;
        }
        setIsLoading(true);
        const coordinates = { lat, lng };
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: coordinates }, (results, status) => {
          setIsLoading(false);
          const address = (status === 'OK' && results[0]) ? results[0].formatted_address : `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;
          const manualLocation = { id: 'manual-coords', address, coordinates, type: 'manual' };
          setSelectedLocation(manualLocation);
          setSearchQuery(address);
          setManualEntry(false);
          setManualLat('');
          setManualLng('');
          if (onLocationSelect) onLocationSelect(manualLocation);
        });
      } catch (error) {
        console.error('Error processing coordinates:', error);
        alert('Invalid coordinates format. Please check your input.');
      }
    } else {
      alert('Please enter an address or coordinates.');
    }
  };

  if (loadError) {
    const isApiNotActivatedError = loadError.toString().includes('ApiNotActivatedMapError');
    return (
      <div className="w-full p-4 border border-red-300 rounded-lg bg-red-50 text-red-800">
        <h3 className="font-medium mb-2">Error loading Google Maps Places API</h3>
        {isApiNotActivatedError ? (
          <>
            <p className="text-sm mb-2"><strong>ApiNotActivatedMapError</strong>: The Maps JavaScript API is not enabled for your key.</p>
            <ol className="list-decimal pl-5 text-sm mb-3">
              <li>Go to <a href="https://console.cloud.google.com/apis/library/maps-backend.googleapis.com" className="underline" target="_blank" rel="noopener noreferrer">Google Cloud Console</a></li>
              <li>Enable the "Maps JavaScript API"</li>
              <li>Wait 5–10 minutes, then restart your dev server</li>
            </ol>
          </>
        ) : (
          <p className="text-sm">There was a problem loading the location picker. Please check your API key and enabled APIs.</p>
        )}
      </div>
    );
  }

  if (!isLoaded) return (
    <div className="w-full p-4 border border-blue-300 rounded-lg bg-blue-50 text-blue-800">
      Loading location services...
    </div>
  );

  return (
    <div className="w-full">
      {/* Mode toggle */}
      <div className="mb-4 flex space-x-2">
        <button
          onClick={() => { setManualEntry(false); setSearchQuery(''); }}
          className={`flex-1 py-2.5 px-4 rounded-lg flex items-center justify-center text-sm font-medium ${!manualEntry ? 'bg-blue-100 text-blue-700' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
        >
          <Search className="w-4 h-4 mr-2" /> Search Address
        </button>

        <button
          onClick={() => { setManualEntry(false); handleUseCurrentLocation(); }}
          className={`flex-1 py-2.5 px-4 rounded-lg flex items-center justify-center text-sm font-medium ${selectedLocation?.type === 'gps' ? 'bg-blue-100 text-blue-700' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
          disabled={isLoading}
        >
          <Navigation className="w-4 h-4 mr-2" />
          {isLoading ? 'Locating...' : 'Use GPS Location'}
        </button>

        <button
          onClick={() => setManualEntry(m => !m)}
          className={`flex-1 py-2.5 px-4 rounded-lg flex items-center justify-center text-sm font-medium ${manualEntry ? 'bg-blue-100 text-blue-700' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
        >
          <Keyboard className="w-4 h-4 mr-2" /> Manual Entry
        </button>
      </div>

      {/* Search input */}
      {!manualEntry && (
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={placeholder}
                className={`w-full pl-10 pr-12 py-3 border ${required && !selectedLocation ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm`}
              />
            </Autocomplete>
            {userLocation && (
              <button
                onClick={handleUseCurrentLocation}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                title="Use current location"
              >
                <Navigation className="w-4 h-4 text-blue-500" />
              </button>
            )}
          </div>

          {/* Warning when user presses Enter without selecting suggestion */}
          {noGeometryWarn && (
            <div className="mt-2 flex items-center space-x-2 text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm">Please <strong>select a suggestion</strong> from the dropdown — don't just press Enter.</span>
            </div>
          )}
        </div>
      )}

      {/* Manual Entry */}
      {manualEntry && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input
              type="text"
              value={manualAddress}
              onChange={(e) => setManualAddress(e.target.value)}
              placeholder="Enter full address (e.g. 123 Main St, City, Country)"
              className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${required && !selectedLocation ? 'border-red-300' : ''}`}
            />
          </div>

          <div className="text-center text-sm text-gray-500 my-2">- OR -</div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
              <input type="text" value={manualLat} onChange={(e) => setManualLat(e.target.value)}
                placeholder="e.g. 40.7128"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
              <input type="text" value={manualLng} onChange={(e) => setManualLng(e.target.value)}
                placeholder="e.g. -74.0060"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
          </div>

          <button onClick={handleManualLocationSubmit}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center justify-center">
            <MapPinned className="w-4 h-4 mr-2" /> Set Location
          </button>
        </div>
      )}

      {/* Selected location */}
      {selectedLocation && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="font-medium text-green-900">{selectedLocation.address}</div>
              {selectedLocation.coordinates && (
                <div className="text-sm text-green-700 mt-1">
                  Coordinates: {selectedLocation.coordinates.lat.toFixed(6)}, {selectedLocation.coordinates.lng.toFixed(6)}
                </div>
              )}
              <div className="text-sm text-green-600 mt-1 capitalize">Type: {selectedLocation.type}</div>
            </div>
            <button
              onClick={() => { setSelectedLocation(null); setSearchQuery(''); if (onLocationSelect) onLocationSelect(null); }}
              className="text-green-600 hover:text-green-800 text-lg leading-none"
            >×</button>
          </div>
        </div>
      )}

      {/* Validation error */}
      {required && !selectedLocation && (searchQuery || manualEntry) && (
        <div className="mt-2 flex items-center space-x-2 text-red-600">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">Please select a valid location</span>
        </div>
      )}

      {/* Static map preview */}
      {showMap && selectedLocation?.coordinates && (
        <div className="mt-4">
          <div className="bg-gray-100 rounded-lg p-4 text-center">
            <div className="text-sm text-gray-600 mb-2">Location Preview</div>
            <div className="w-full h-32 relative">
              <img
                src={`https://maps.googleapis.com/maps/api/staticmap?center=${selectedLocation.coordinates.lat},${selectedLocation.coordinates.lng}&zoom=15&size=600x200&markers=color:red%7C${selectedLocation.coordinates.lat},${selectedLocation.coordinates.lng}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`}
                alt="Location Map"
                className="w-full h-full object-cover rounded"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Help text */}
      <div className="mt-2 text-sm text-gray-500">
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4" />
          <span>Enter an address, use GPS, or manually input coordinates</span>
        </div>
      </div>
    </div>
  );
};

export default LocationPicker;