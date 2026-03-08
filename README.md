
```
Smart_surplus_food_redistribution_system
├─ .hintrc
├─ backend1
│  ├─ .env
│  ├─ config
│  │  └─ db.js
│  ├─ controllers
│  │  └─ userController.js
│  ├─ index.js
│  ├─ middleware
│  │  └─ authMiddleware.js
│  ├─ models
│  │  ├─ foodDonationModel.js
│  │  ├─ userModel.js
│  │  └─ wastePickupModel.js
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ routes
│  │  ├─ foodDonationRoutes.js
│  │  ├─ userRoutes.js
│  │  └─ wastePickupRoutes.js
│  └─ socketServer.js
├─ builder.config.json
├─ FIXES_SUMMARY.md
├─ frontend
│  ├─ .env
│  ├─ build
│  │  ├─ asset-manifest.json
│  │  ├─ favicon.ico
│  │  ├─ index.html
│  │  ├─ logo192.png
│  │  ├─ logo512.png
│  │  ├─ manifest.json
│  │  ├─ robots.txt
│  │  └─ static
│  │     ├─ css
│  │     │  ├─ main.95498e75.css
│  │     │  └─ main.95498e75.css.map
│  │     └─ js
│  │        ├─ 453.670e15c7.chunk.js
│  │        ├─ 453.670e15c7.chunk.js.map
│  │        ├─ main.6caff6b3.js
│  │        ├─ main.6caff6b3.js.LICENSE.txt
│  │        └─ main.6caff6b3.js.map
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ postcss.config.js
│  ├─ public
│  │  ├─ favicon.ico
│  │  ├─ index.html
│  │  ├─ logo192.png
│  │  ├─ logo512.png
│  │  ├─ manifest.json
│  │  └─ robots.txt
│  ├─ README.md
│  ├─ src
│  │  ├─ App.css
│  │  ├─ App.test.tsx
│  │  ├─ App.tsx
│  │  ├─ components
│  │  │  ├─ auth
│  │  │  │  ├─ BusinessVerification.tsx
│  │  │  │  ├─ DocumentUpload.tsx
│  │  │  │  ├─ DonorRegisterForm.tsx
│  │  │  │  ├─ EmailVerification.tsx
│  │  │  │  ├─ LoginForm.tsx
│  │  │  │  ├─ RecipientRegisterForm.tsx
│  │  │  │  ├─ RoleSelector.tsx
│  │  │  │  └─ VolunteerRegisterForm.tsx
│  │  │  ├─ common
│  │  │  │  ├─ CountdownTimer.tsx
│  │  │  │  ├─ EnhancedUserProfile.tsx
│  │  │  │  ├─ FoodListingVisibility.tsx
│  │  │  │  ├─ Footer.tsx
│  │  │  │  ├─ Header.tsx
│  │  │  │  ├─ ProfileStats.tsx
│  │  │  │  ├─ ProtectedRoute.tsx
│  │  │  │  └─ Sidebar.tsx
│  │  │  ├─ distribution
│  │  │  │  ├─ DeliveryHistory.js
│  │  │  │  ├─ DeliveryTracker.js
│  │  │  │  ├─ MatchingResults.js
│  │  │  │  └─ RequestForm.js
│  │  │  ├─ donor
│  │  │  │  ├─ AddEvent.tsx
│  │  │  │  ├─ DetailedAnalyticsModal.tsx
│  │  │  │  ├─ DonationHistory.tsx
│  │  │  │  ├─ DonorAnalytics.tsx
│  │  │  │  ├─ DonorDashboard.tsx
│  │  │  │  ├─ DonorProfile.tsx
│  │  │  │  ├─ FoodListingForm.tsx
│  │  │  │  └─ OrganicWasteForm.tsx
│  │  │  ├─ maps
│  │  │  │  ├─ DeliveryRoutes.js
│  │  │  │  ├─ InteractiveMap.js
│  │  │  │  ├─ LocationPicker.js
│  │  │  │  └─ MapMarker.js
│  │  │  ├─ notifications
│  │  │  │  ├─ AlertBanner.js
│  │  │  │  ├─ NotificationCenter.js
│  │  │  │  └─ NotificationItem.js
│  │  │  ├─ recepient
│  │  │  │  ├─ OrderTrackingPage.tsx
│  │  │  │  ├─ PickupHistory.tsx
│  │  │  │  ├─ RecipientDashboard.tsx
│  │  │  │  ├─ RecipientProfile.tsx
│  │  │  │  ├─ RequestConfirmationPage.tsx
│  │  │  │  └─ SearchResults.tsx
│  │  │  ├─ reviews
│  │  │  │  ├─ ReviewDisplay.tsx
│  │  │  │  ├─ ReviewForm.tsx
│  │  │  │  └─ ReviewSummary.tsx
│  │  │  └─ volunteer
│  │  │     ├─ DeliveryHistory.tsx
│  │  │     ├─ FoodListDashboard.tsx
│  │  │     └─ VolunteerProfile.tsx
│  │  ├─ config
│  │  │  └─ constants.ts
│  │  ├─ context
│  │  │  └─ AuthDonorContext.tsx
│  │  ├─ hooks
│  │  │  ├─ index.ts
│  │  │  ├─ useApi.ts
│  │  │  ├─ useAuth.ts
│  │  │  ├─ useFoodDonations.ts
│  │  │  ├─ useLocalStorage.ts
│  │  │  ├─ useSocket.ts
│  │  │  └─ useWastePickups.ts
│  │  ├─ index.css
│  │  ├─ index.tsx
│  │  ├─ output.css
│  │  ├─ pages
│  │  │  ├─ DashboardPage.tsx
│  │  │  ├─ EditFoodListing.tsx
│  │  │  ├─ FoodListingDetails.tsx
│  │  │  ├─ HomePage.tsx
│  │  │  ├─ LoginPage.tsx
│  │  │  ├─ ProfilePage.tsx
│  │  │  └─ RegisterPage.tsx
│  │  ├─ reportWebVitals.ts
│  │  ├─ services
│  │  │  ├─ api.ts
│  │  │  ├─ authService.ts
│  │  │  ├─ foodDonationService.ts
│  │  │  ├─ index.ts
│  │  │  ├─ reviewService.ts
│  │  │  ├─ socketService.ts
│  │  │  └─ wastePickupService.ts
│  │  ├─ setupTests.ts
│  │  ├─ store
│  │  │  ├─ authSlice.ts
│  │  │  ├─ index.ts
│  │  │  ├─ slices
│  │  │  │  └─ authSlice.ts
│  │  │  ├─ store.ts
│  │  │  └─ uiSlice.ts
│  │  ├─ theme
│  │  │  └─ index.ts
│  │  ├─ types
│  │  │  ├─ api.ts
│  │  │  ├─ auth.ts
│  │  │  └─ foodListing.ts
│  │  └─ utils
│  │     ├─ constants.ts
│  │     ├─ expirationUtils.ts
│  │     ├─ helpers.ts
│  │     ├─ listingUtils.ts
│  │     ├─ notificationUtils.ts
│  │     ├─ routeUtils.ts
│  │     └─ validations.ts
│  ├─ tailwind.config.js
│  └─ tsconfig.json
├─ GOOGLE_MAPS_API_SETUP.md
├─ MAP_INTEGRATION_README.md
├─ NOTIFICATIONS_AND_MAPS_SUMMARY.md
├─ package-lock.json
├─ package.json
├─ README-FIXES.md
├─ start-servers.bat
├─ test-backend-simple.js
├─ test-backend-start.js
├─ test-backend.js
├─ test-blank-page-fix.js
├─ test-fixes.js
├─ test-frontend-fixes.js
├─ test-frontend-login.js
├─ test-map-integration.js
├─ test-notifications-and-maps.js
├─ test-order-tracking.js
├─ test-recipient-fixes.js
├─ test-registration.js
└─ WorkFlow.jpg

```