import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  Bell, 
  Shield, 
  BarChart3, 
  Calendar, 
  Users,
  CheckCircle,
  Leaf,
  Clock,
  Target,
  TrendingUp,
  Handshake,
  UserPlus,
  HeartHandshake
} from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();

  const handleJoinPlatform = () => {
    navigate('/login');
  };

  const handleStartDonating = () => {
    navigate('/login');
  };

  const handleFindFood = () => {
    navigate('/login');
  };

  const handleBecomeVolunteer = () => {
    navigate('/login');
  };

  const handleLearnMore = () => {
    navigate('/login');
  };

  const handleGetStarted = () => {
    navigate('/login');
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F7F7F7' }}>
      {/* Top Header Navigation */}
      <header className="shadow-sm border-b border-gray-200 relative z-50" style={{ backgroundColor: '#F4FDF7' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="rounded-full p-2" style={{ backgroundColor: '#34A853' }}>
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Byte Banquet</span>
            </div>

            {/* Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-6">
              <button
                onClick={() => scrollToSection('features')}
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-gray-100"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-gray-100"
              >
                How It Works
              </button>
              <button
                onClick={() => scrollToSection('impact')}
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors px-3 py-2 rounded-lg hover:bg-gray-100"
              >
                Impact
              </button>
              <button
                onClick={handleGetStarted}
                className="text-white px-6 py-2 rounded-lg font-semibold transition-colors hover:opacity-90 ml-4"
                style={{ backgroundColor: '#34A853' }}
              >
                Get Started
              </button>
            </nav>

            {/* Mobile Navigation */}
            <div className="lg:hidden flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => scrollToSection('features')}
                  className="text-gray-700 hover:text-gray-900 text-sm font-medium transition-colors"
                >
                  Features
                </button>
                <button
                  onClick={() => scrollToSection('impact')}
                  className="text-gray-700 hover:text-gray-900 text-sm font-medium transition-colors"
                >
                  Impact
                </button>
              </div>
              <button
                onClick={handleGetStarted}
                className="text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors hover:opacity-90"
                style={{ backgroundColor: '#34A853' }}
              >
                Join
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url("https://cdn.builder.io/api/v1/image/assets%2F274b8ab83d5a46f8a5dcbaca899f2ff9%2F599ad064c4c84df9b8d76231e3258791?format=webp&width=800")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-60"></div>
        </div>
        

        {/* Hero Content */}
        <div className="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8 max-w-4xl">
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Byte Banquet
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-2xl mx-auto leading-relaxed">
            Join our mission to feed people, not bins.
          </p>
          
          <p className="text-lg mb-10 text-gray-300 max-w-3xl mx-auto">
            Revolutionizing campus food management through smart redistribution. Connect 
            surplus food from cafeterias, retailers, and events with those who need it most.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              onClick={handleStartDonating}
              className="text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:opacity-90"
              style={{ backgroundColor: '#34A853' }}
            >
              🌱 START DONATING
            </button>
            <button 
              onClick={handleFindFood}
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300"
            >
              🔍 FIND FOOD NEARBY
            </button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-2">15,000+</div>
              <div className="text-gray-300 text-sm md:text-base">Meals Saved</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-2">2,500</div>
              <div className="text-gray-300 text-sm md:text-base">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-2">80%</div>
              <div className="text-gray-300 text-sm md:text-base">Waste Reduced</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16" style={{ backgroundColor: '#F4FDF7' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center text-white px-8 py-4 rounded-2xl text-lg font-bold mb-8 shadow-lg transform hover:scale-105 transition-all duration-300" style={{ backgroundColor: '#34A853' }}>
              ✨ Key Features Designed for Impact
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Powerful Tools for <span style={{ color: '#34A853' }}>Zero Waste</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our comprehensive platform provides everything you need to reduce food waste 
              and build stronger communities through smart redistribution technology.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="group p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100" style={{ backgroundColor: '#FFFFFF' }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300" style={{ backgroundColor: '#4285F4' }}>
                <ShoppingCart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Intuitive Listing Platform</h3>
              <p className="text-gray-600 leading-relaxed">
                Easily post available surplus food with details on type, quantity, and pickup time for quick redistribution.
              </p>
            </div>

            <div className="group p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100" style={{ backgroundColor: '#FFFFFF' }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300" style={{ backgroundColor: '#34A853' }}>
                <Bell className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Instant Notifications</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                Receive real-time alerts on new food listings or successful pickups, ensuring timely action and reduced waste.
              </p>
            </div>

            <div className="group p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100" style={{ backgroundColor: '#FFFFFF' }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300" style={{ backgroundColor: '#9C27B0' }}>
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Safety & Compliance</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                Ensure food safety with our rating for allergens, dietary restrictions, and adherence to campus guidelines.
              </p>
            </div>

            <div className="group p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100" style={{ backgroundColor: '#FFFFFF' }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300" style={{ backgroundColor: '#FFB300' }}>
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Impact Analytics</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                Track your contribution with detailed metrics on food saved, environmental impact, and community impact.
              </p>
            </div>

            <div className="group p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100" style={{ backgroundColor: '#FFFFFF' }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300" style={{ backgroundColor: '#F44336' }}>
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Event Integration</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                Seamlessly integrate with campus calendars to manage food distribution for large gatherings.
              </p>
            </div>

            <div className="group p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100" style={{ backgroundColor: '#FFFFFF' }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300" style={{ backgroundColor: '#00BCD4' }}>
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Community Tools</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                Connect with fellow students, staff, and local NGOs, fostering a collaborative zero-waste ecosystem.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section id="how-it-works" className="py-16" style={{ backgroundColor: '#F9FAFB' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Simple Process, Maximum Impact
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our streamlined four-step process ensures that surplus food reaches those who 
              need it most, while providing transparency and tracking for continuous improvement.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="relative mb-12">
                <div className="w-24 h-24 rounded-2xl flex items-center justify-center mx-auto transition-all duration-300 shadow-lg group-hover:shadow-2xl group-hover:scale-105" style={{ backgroundColor: '#34A853' }}>
                  <ShoppingCart className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-10 h-10 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg" style={{ backgroundColor: '#34A853' }}>
                  1
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">List</h3>
              <p className="text-gray-600 leading-relaxed">
                Organizations and retailers easily list their excess food on our platform, including type, quantity, and pickup time.
              </p>
            </div>

            <div className="text-center group">
              <div className="relative mb-12">
                <div className="w-24 h-24 rounded-2xl flex items-center justify-center mx-auto transition-all duration-300 shadow-lg group-hover:shadow-2xl group-hover:scale-105" style={{ backgroundColor: '#FFB300' }}>
                  <Bell className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-10 h-10 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg" style={{ backgroundColor: '#FFB300' }}>
                  2
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Notify</h3>
              <p className="text-gray-600 leading-relaxed">
                Interested students, staff, and NGOs get instant notifications about newly available food, maximizing reach.
              </p>
            </div>

            <div className="text-center group">
              <div className="relative mb-12">
                <div className="w-24 h-24 rounded-2xl flex items-center justify-center mx-auto transition-all duration-300 shadow-lg group-hover:shadow-2xl group-hover:scale-105" style={{ backgroundColor: '#4285F4' }}>
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-10 h-10 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg" style={{ backgroundColor: '#4285F4' }}>
                  3
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Pickup</h3>
              <p className="text-gray-600 leading-relaxed">
                Food is picked up by recipients or volunteers, with real-time coordination by local NGOs.
              </p>
            </div>

            <div className="text-center group">
              <div className="relative mb-12">
                <div className="w-24 h-24 rounded-2xl flex items-center justify-center mx-auto transition-all duration-300 shadow-lg group-hover:shadow-2xl group-hover:scale-105" style={{ backgroundColor: '#9C27B0' }}>
                  <BarChart3 className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-10 h-10 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg" style={{ backgroundColor: '#9C27B0' }}>
                  4
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Track</h3>
              <p className="text-gray-600 leading-relaxed">
                Every transaction is tracked for impact metrics, helping achieve zero-waste goals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-12" style={{ backgroundColor: '#F4FDF7' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mr-4" style={{ backgroundColor: '#34A853' }}>
                  <Leaf className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Vision</h3>
              </div>
              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                A world where no meal is wasted and every person has access to
                nutritious food, creating sustainable communities built on urgency and care.
              </p>
            </div>

            <div>
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mr-4" style={{ backgroundColor: '#4285F4' }}>
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Community</h3>
              </div>
              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                Building stronger communities through shared purpose:
                connecting food donors, recipients, and volunteers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section id="impact" className="py-16 text-white" style={{ background: 'linear-gradient(to right, #34A853, #2E8B57)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Our Impact</h2>
            <p className="text-xl text-green-100 max-w-3xl mx-auto">
              Together, we're making a real difference in fighting food waste and supporting 
              our community. Here's what we've achieved so far.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div className="text-center bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-8">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl md:text-4xl font-bold mb-2">2.5M+</div>
              <div className="text-green-100">Meals Saved</div>
              <div className="text-sm text-green-200 mt-1">from waste</div>
            </div>
            
            <div className="text-center bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-8">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl md:text-4xl font-bold mb-2">1,200</div>
              <div className="text-green-100">Tons CO2 Reduced</div>
              <div className="text-sm text-green-200 mt-1">environmental impact</div>
            </div>
            
            <div className="text-center bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-8">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl md:text-4xl font-bold mb-2">500M+</div>
              <div className="text-green-100">Liters Water Saved</div>
              <div className="text-sm text-green-200 mt-1">water conservation</div>
            </div>
            
            <div className="text-center bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-8">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Handshake className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl md:text-4xl font-bold mb-2">150+</div>
              <div className="text-green-100">Partner Organizations</div>
              <div className="text-sm text-green-200 mt-1">active community partners</div>
            </div>
          </div>
          
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Every Action Counts</h3>
            <p className="text-green-100 max-w-2xl mx-auto">
              These numbers represent real meals reaching real families, environmental protection, and 
              communities coming together to create positive change.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16" style={{ backgroundColor: '#F4FDF7' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Be Part of the Change
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Every action, no matter how small, contributes to our mission. Choose how you'd 
              like to make a difference today.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="text-center rounded-xl p-6 hover:shadow-lg transition-all duration-300 border border-gray-100" style={{ backgroundColor: '#FFFFFF' }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: '#34A853' }}>
                <HeartHandshake className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Donate Food</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Share your surplus food with those who need it most.
              </p>
              <button
                onClick={handleStartDonating}
                className="text-white px-6 py-3 rounded-xl font-semibold transition-colors hover:opacity-90"
                style={{ backgroundColor: '#34A853' }}
              >
                START DONATING
              </button>
            </div>

            <div className="text-center rounded-xl p-6 hover:shadow-lg transition-all duration-300 border border-gray-100" style={{ backgroundColor: '#FFFFFF' }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#FFB300' }}>
                <ShoppingCart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Find Food</h3>
              <p className="text-gray-600 mb-4 leading-relaxed text-sm">
                Discover available food donations in your area.
              </p>
              <button
                onClick={handleFindFood}
                className="text-white px-5 py-2 rounded-lg font-semibold transition-all duration-300 text-sm hover:shadow-md active:scale-95"
                style={{ backgroundColor: '#FFB300' }}
              >
                FIND FOOD
              </button>
            </div>

            <div className="text-center rounded-xl p-6 hover:shadow-lg transition-all duration-300 border border-gray-100" style={{ backgroundColor: '#FFFFFF' }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#4285F4' }}>
                <UserPlus className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Volunteer</h3>
              <p className="text-gray-600 mb-4 leading-relaxed text-sm">
                Join our community of carriers and make direct impact.
              </p>
              <button
                onClick={handleBecomeVolunteer}
                className="text-white px-5 py-2 rounded-lg font-semibold transition-all duration-300 text-sm hover:shadow-md active:scale-95"
                style={{ backgroundColor: '#4285F4' }}
              >
                BECOME A CARRIER
              </button>
            </div>

            <div className="text-center rounded-xl p-6 hover:shadow-lg transition-all duration-300 border border-gray-100" style={{ backgroundColor: '#FFFFFF' }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#34A853' }}>
                <Handshake className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Partner With Us</h3>
              <p className="text-gray-600 mb-4 leading-relaxed text-sm">
                Collaborate with us as an organization or business.
              </p>
              <button
                onClick={handleLearnMore}
                className="text-white px-5 py-2 rounded-lg font-semibold transition-all duration-300 text-sm hover:shadow-md active:scale-95"
                style={{ backgroundColor: '#34A853' }}
              >
                LEARN MORE
              </button>
            </div>
          </div>
          
          <div className="rounded-3xl p-12 text-center text-white" style={{ background: 'linear-gradient(to right, #34A853, #2E8B57)' }}>
            <h3 className="text-3xl md:text-4xl font-bold mb-6">Ready to Make an Impact?</h3>
            <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
              Join thousands of community members who are already rescuing meals and 
              restoring dignity.
            </p>
            <button 
              onClick={handleGetStarted}
              className="bg-white hover:bg-gray-100 px-8 py-4 rounded-xl font-bold text-lg transition-colors inline-flex items-center"
              style={{ color: '#34A853' }}
            >
              GET STARTED TODAY
              <Target className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="rounded-full p-2" style={{ backgroundColor: '#34A853' }}>
                  <Leaf className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold">Byte Banquet</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Join our mission to feed people, not bins. 
                Transforming campus food systems through smart 
                redistribution technology.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer">
                  <span className="text-xl">📧</span>
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer">
                  <span className="text-xl">📞</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-6">Platform</h4>
              <ul className="space-y-4 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Impact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Safety Guidelines</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-6">Community</h4>
              <ul className="space-y-4 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Campus Partners</a></li>
                <li><a href="#" className="hover:text-white transition-colors">NGO Network</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Success Stories</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Resources</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>© 2024 Byte Banquet. All rights reserved. | Feed People, Not Bins</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
