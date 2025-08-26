# Google Maps API Setup Guide

## Fixing the ApiNotActivatedMapError

If you're encountering the error `Google Maps JavaScript API error: ApiNotActivatedMapError`, it means that the Google Maps JavaScript API is not enabled for your API key. Follow these steps to fix the issue:

### 1. Go to Google Cloud Console

Visit the [Google Cloud Console](https://console.cloud.google.com/) and sign in with the Google account associated with your API key.

### 2. Select Your Project

Select the project that contains your Google Maps API key from the project dropdown at the top of the page.

### 3. Enable the Required APIs

1. In the left sidebar, navigate to "APIs & Services" > "Library".
2. Search for "Maps JavaScript API" and select it from the results.
   - Make sure you select exactly "Maps JavaScript API" (not Maps SDK for Android/iOS or other variants)
   - If you can't find it by searching, use this direct link: https://console.cloud.google.com/apis/library/maps-backend.googleapis.com
3. Click the "Enable" button to activate this API for your project.
   - If the API is already enabled, you'll see "API Enabled" instead of the Enable button
   - If you see an error about permissions, make sure you're signed in with the correct Google account
4. Repeat this process for any other Google Maps APIs you need:
   - Places API: https://console.cloud.google.com/apis/library/places-backend.googleapis.com
   - Geocoding API: https://console.cloud.google.com/apis/library/geocoding-backend.googleapis.com
   - Distance Matrix API: https://console.cloud.google.com/apis/library/distance-matrix-backend.googleapis.com
   - Static Maps API: https://console.cloud.google.com/apis/library/static-maps-backend.googleapis.com

**Important**: After enabling the APIs, it may take a few minutes for the changes to propagate. If you still see the error after enabling the APIs, wait 5-10 minutes and try again.

### 4. Verify API Key Restrictions

1. In the left sidebar, navigate to "APIs & Services" > "Credentials".
2. Find your API key in the list and click on it to edit.
3. Under "API restrictions", make sure that all the APIs you enabled in step 3 are selected.
4. If you have HTTP referrer restrictions, ensure they are correctly configured to allow your application domains.

### 5. Check Billing

Ensure that billing is enabled for your Google Cloud project. Even if you're within the free usage limits, billing information must be set up.

1. In the left sidebar, navigate to "Billing".
2. Verify that your project is linked to a billing account.
3. Check if there are any billing alerts or issues with your payment method.

### 6. Wait for Changes to Propagate

After enabling the APIs, it may take a few minutes for the changes to propagate through Google's systems. Wait a few minutes and then try your application again.

### 7. Update Your API Key in the Application

Ensure that the correct API key is being used in your application. In this project, the API key is stored in:

- Frontend: `frontend/.env` as `REACT_APP_GOOGLE_MAPS_API_KEY`
- Backend: `backend1/.env` as `REACT_APP_GOOGLE_MAPS_API_KEY`

**Current API Key**: `AIzaSyB2QreQwsLYcpZh3pCWq0OTiycTQnJygs4`

This API key has been updated in both the frontend and backend environment files.

## Troubleshooting

If you're still experiencing issues after following these steps:

1. Check the browser console for more detailed error messages.
2. Verify that your API key doesn't have any typos.
3. Try creating a new API key with the correct restrictions and APIs enabled.
4. Check if you've exceeded your daily quota limits for any of the APIs.

## Additional Resources

- [Google Maps Platform Documentation](https://developers.google.com/maps/documentation)
- [Google Maps JavaScript API Guide](https://developers.google.com/maps/documentation/javascript/overview)
- [Google Cloud Console](https://console.cloud.google.com/)