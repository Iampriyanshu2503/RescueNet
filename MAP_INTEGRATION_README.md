# Google Maps API Integration

## Overview
This document outlines the integration of Google Maps API into the application, including the Distance Matrix API for calculating distances between locations.

## Components Integrated

### 1. InteractiveMap.js
- Displays an interactive Google Map with markers for food listings and user location
- Uses the Distance Matrix API for accurate distance calculations
- Includes custom styling for better visual appearance
- Provides directions functionality

### 2. LocationPicker.js
- Integrates Google Places Autocomplete for address search
- Provides geocoding functionality to convert coordinates to addresses
- Includes current location detection
- Displays a static map preview of selected locations

## Environment Configuration
- Google Maps API key is stored in environment variables:
  - Backend: `backend1/.env` as `REACT_APP_GOOGLE_MAPS_API_KEY`
  - Frontend: `frontend/.env` as `REACT_APP_GOOGLE_MAPS_API_KEY`

## APIs Used
1. **Maps JavaScript API** - For rendering the interactive map
2. **Places API** - For location search and autocomplete
3. **Geocoding API** - For converting coordinates to addresses
4. **Distance Matrix API** - For calculating distances between locations
5. **Static Maps API** - For generating map previews

## Testing
A test script (`test-map-integration.js`) has been created to verify the functionality of the map integration. This script uses Puppeteer to test:
- Map loading
- Location search
- Marker display
- Distance calculation

## Implementation Details

### Distance Calculation
The application now uses the Google Maps Distance Matrix API for accurate distance calculations between locations. The implementation includes:
- Asynchronous API calls to the Distance Matrix service
- Fallback to simple calculation if the API call fails
- Display of distance in the UI with appropriate units

### Map Styling
Custom styling has been applied to the map to enhance visual appearance:
- Removed POI (Points of Interest) labels for cleaner display
- Customized road and water colors
- Removed transit labels

## Usage

### InteractiveMap Component
```jsx
<InteractiveMap
  foodListings={listings}
  userLocation={userLocation}
  onListingClick={handleListingClick}
  height="500px"
  showUserLocation={true}
/>
```

### LocationPicker Component
```jsx
<LocationPicker
  onLocationSelect={handleLocationSelect}
  initialLocation={location}
  placeholder="Enter delivery address..."
  showMap={true}
  required={true}
/>
```