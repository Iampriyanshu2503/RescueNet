import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { store } from './store';
import Header from './components/common/Header';
import ProtectedRoute from './components/common/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import FoodBanquetSelection from './components/auth/RoleSelector';
import DonorDashboard from './components/donor/DonorDashboard';
import DonorAnalytics from './components/donor/DonorAnalytics';
import AddSurplusFood from './components/donor/FoodListingForm';
import ListEventFood from './components/donor/AddEvent';
import WasteToEnergyForm from './components/donor/OrganicWasteForm';
import FoodListingsPage from './components/recepient/RecipientDashboard';
import RequestConfirmationPage from './components/recepient/RequestConfirmationPage';
import OrderTrackingPage from './components/recepient/OrderTrackingPage';
import DonorProfilePage from './components/donor/DonorProfile';
import DonorRegisterForm from './components/auth/DonorRegisterForm';
import RecipientRegisterForm from './components/auth/RecipientRegisterForm';
import VolunteerRegisterForm from './components/auth/VolunteerRegisterForm';
import VolunteerDashboard from './components/volunteer/FoodListDashboard';
import RecipientProfile from './components/recepient/RecipientProfile';
import PickupHistory from './components/recepient/PickupHistory';
import SearchResults from './components/recepient/SearchResults';
import RegisterPage from './pages/RegisterPage';
import FoodListingDetails from './pages/FoodListingDetails';
import EditFoodListing from './pages/EditFoodListing';

import './App.css';

// Create a React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Create a wrapper component to use useLocation hook
function AppContent() {
  const location = useLocation();

  // Define routes where you DON'T want to show the header
  const hideHeaderRoutes = ['/', '/login', '/register', '/select-role', '/donor-register', '/recipient-register', '/volunteer-register', '/donor-analytics'];

  // Check if current route should hide the header
  const shouldHideHeader = hideHeaderRoutes.includes(location.pathname);

  return (
    <div className="App">
      {/* Only show header if current route is not in hideHeaderRoutes */}
      {!shouldHideHeader && <Header />}

      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/select-role" element={<FoodBanquetSelection />} />
        <Route path="/add-surplus-food" element={<ProtectedRoute requiredRole="donor"><AddSurplusFood /></ProtectedRoute>} />
        <Route path="/donor-dashboard" element={<ProtectedRoute requiredRole="donor"><DonorDashboard /></ProtectedRoute>} />
        <Route path="/donor-analytics" element={<ProtectedRoute requiredRole="donor"><DonorAnalytics /></ProtectedRoute>} />
        <Route path="/list-event-food" element={<ProtectedRoute requiredRole="donor"><ListEventFood /></ProtectedRoute>} />
        <Route path="/waste-to-energy" element={<ProtectedRoute requiredRole="donor"><WasteToEnergyForm /></ProtectedRoute>} />
        <Route path="/recipient-dashboard" element={<ProtectedRoute requiredRole="recipient"><FoodListingsPage /></ProtectedRoute>} />
        <Route path="/volunteer-dashboard" element={<ProtectedRoute requiredRole="volunteer"><VolunteerDashboard /></ProtectedRoute>} />
        <Route path="/food-listings/:id" element={<ProtectedRoute requiredRole="recipient"><RequestConfirmationPage /></ProtectedRoute>} />
        <Route path="/order-tracking/:id" element={<ProtectedRoute requiredRole="recipient"><OrderTrackingPage /></ProtectedRoute>} />
        <Route path="/donor-register" element={<DonorRegisterForm />} />
        <Route path="/recipient-register" element={<RecipientRegisterForm />} />
        <Route path="/volunteer-register" element={<VolunteerRegisterForm />} />
        <Route path="/donor-profile" element={<ProtectedRoute requiredRole="donor"><DonorProfilePage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><DonorProfilePage /></ProtectedRoute>} />
        <Route path="/recipient-profile" element={<ProtectedRoute requiredRole="recipient"><RecipientProfile /></ProtectedRoute>} />
        <Route path="/pickup-history" element={<ProtectedRoute requiredRole="recipient"><PickupHistory /></ProtectedRoute>} />
        <Route path="/search" element={<ProtectedRoute requiredRole="recipient"><SearchResults /></ProtectedRoute>} />
        <Route path="/food-details/:id" element={<ProtectedRoute><FoodListingDetails /></ProtectedRoute>} />
        <Route path="/edit-listing/:id" element={<ProtectedRoute requiredRole="donor"><EditFoodListing /></ProtectedRoute>} />

        <Route path="/" element={<HomePage />} />
      </Routes>

      {/* Toast notifications */}
      <Toaster position="top-right" />
    </div>
  );
}

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <AppContent />
        </Router>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
