import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/common/Header'; // Add this import
import LoginPage from './pages/LoginPage';
import FoodBanquetSelection from './components/auth/RoleSelector';
import DonorDashboard from './components/donor/DonorDashboard';
import DonorAnalytics from './components/donor/DonorAnalytics';
import AddSurplusFood from './components/donor/FoodListingForm';
import ListEventFood from './components/donor/AddEvent';
import WasteToEnergyForm from './components/donor/OrganicWasteForm';
import FoodListingsPage from './components/recepient/RecipientDashboard';
import RequestConfirmationPage from './components/recepient/FoodFeed';
import ProfilePage from './pages/ProfilePage';
import DonorRegisterForm from './components/auth/DonorRegisterForm';
import RecipientRegisterForm from './components/auth/RecipientRegisterForm';
import VolunteerRegisterForm from './components/auth/VolunteerRegisterForm';

import './App.css';

// Create a wrapper component to use useLocation hook
function AppContent() {
  const location = useLocation();

  // Define routes where you DON'T want to show the header
  const hideHeaderRoutes = ['/login', '/select-role', '/donor-register', '/recipient-register', '/volunteer-register', '/donor-analytics'];

  // Check if current route should hide the header
  const shouldHideHeader = hideHeaderRoutes.includes(location.pathname);

  return (
    <div className="App">
      {/* Only show header if current route is not in hideHeaderRoutes */}
      {!shouldHideHeader && <Header />}

      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/select-role" element={<FoodBanquetSelection />} />
        <Route path="/add-surplus-food" element={<AddSurplusFood />} />
        <Route path="/donor-dashboard" element={<DonorDashboard />} />
        <Route path="/donor-analytics" element={<DonorAnalytics />} />
        <Route path="/list-event-food" element={<ListEventFood />} />
        <Route path="/waste-to-energy" element={<WasteToEnergyForm />} />
        <Route path="/recipient-dashboard" element={<FoodListingsPage />} />
        <Route path="/food-listings/:id" element={<RequestConfirmationPage />} />
        <Route path="/donor-register" element={<DonorRegisterForm />} />
        <Route path="/recipient-register" element={<RecipientRegisterForm />} />
        <Route path="/volunteer-register" element={<VolunteerRegisterForm />} />
        <Route path="/profile" element={<ProfilePage />} />

        <Route path="/" element={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">Welcome to Food Banquet</h1>
              <a href="/login" className="text-green-500 hover:underline">
                Go to Login Page
              </a>
            </div>
          </div>
        } />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;