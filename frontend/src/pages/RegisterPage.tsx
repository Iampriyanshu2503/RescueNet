import React, { useState } from 'react';
import { ArrowLeft, Heart, HelpCircle, Link2, Truck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function RegisterPage() {
    const navigate = useNavigate();

    const handleRoleSelect = (role: string) => {
        console.log(`Selected role for registration: ${role}`);
        if (role === 'donor') {
            navigate('/donor-register');
        }
        else if (role === 'recipient') {
            navigate('/recipient-register');
        }
        else if (role === 'volunteer') {
            navigate('/volunteer-register');
        }
    };

    const handleBackClick = () => {
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-100 relative">
            {/* Back Button */}
            <button
                onClick={handleBackClick}
                className="absolute top-6 left-6 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-200"
            >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>

            {/* Main Content */}
            <div className="flex items-center justify-center min-h-screen px-4 py-8">
                {/* Main Card Container */}
                <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-4xl">
                    {/* Header */}
                    <div className="text-center mb-8">
                        {/* Logo */}
                        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <Heart className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">Join Food Banquet</h1>
                        <p className="text-gray-600">Choose how you'd like to help reduce food waste</p>
                    </div>

                    {/* Role Selection Cards - Grid Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        {/* Donor Card */}
                        <div
                            onClick={() => handleRoleSelect('donor')}
                            className="bg-gray-50 rounded-xl p-6 cursor-pointer transform hover:scale-105 transition-all duration-200 hover:shadow-lg border-2 border-transparent hover:border-blue-200"
                        >
                            <div className="text-center">
                                {/* Icon */}
                                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Heart className="w-8 h-8 text-white" />
                                </div>

                                {/* Content */}
                                <h3 className="text-lg font-bold text-gray-800 mb-2">Register as Donor</h3>
                                <p className="text-gray-600 text-sm mb-4">Share surplus food with those in need and reduce waste</p>

                                {/* Features List */}
                                <ul className="text-xs text-gray-500 text-left space-y-1">
                                    <li>• List surplus food</li>
                                    <li>• Track donations</li>
                                    <li>• View impact analytics</li>
                                    <li>• Manage pickups</li>
                                </ul>
                            </div>
                        </div>

                        {/* Recipient Card */}
                        <div
                            onClick={() => handleRoleSelect('recipient')}
                            className="bg-gray-50 rounded-xl p-6 cursor-pointer transform hover:scale-105 transition-all duration-200 hover:shadow-lg border-2 border-transparent hover:border-green-200"
                        >
                            <div className="text-center">
                                {/* Icon */}
                                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Link2 className="w-8 h-8 text-white" />
                                </div>

                                {/* Content */}
                                <h3 className="text-lg font-bold text-gray-800 mb-2">Register as Recipient</h3>
                                <p className="text-gray-600 text-sm mb-4">Find and request available food donations</p>

                                {/* Features List */}
                                <ul className="text-xs text-gray-500 text-left space-y-1">
                                    <li>• Browse food listings</li>
                                    <li>• Request donations</li>
                                    <li>• Track pickup history</li>
                                    <li>• Search by location</li>
                                </ul>
                            </div>
                        </div>

                        {/* Volunteer Card */}
                        <div
                            onClick={() => handleRoleSelect('volunteer')}
                            className="bg-gray-50 rounded-xl p-6 cursor-pointer transform hover:scale-105 transition-all duration-200 hover:shadow-lg border-2 border-transparent hover:border-purple-200"
                        >
                            <div className="text-center">
                                {/* Icon */}
                                <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Truck className="w-8 h-8 text-white" />
                                </div>

                                {/* Content */}
                                <h3 className="text-lg font-bold text-gray-800 mb-2">Register as Volunteer</h3>
                                <p className="text-gray-600 text-sm mb-4">Help deliver food from donors to recipients</p>

                                {/* Features List */}
                                <ul className="text-xs text-gray-500 text-left space-y-1">
                                    <li>• Accept delivery tasks</li>
                                    <li>• Coordinate pickups</li>
                                    <li>• Track deliveries</li>
                                    <li>• Build community</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Message */}
                    <div className="text-center">
                        <p className="text-gray-500 text-sm">Start your journey in building a community where no food goes to waste</p>
                        <p className="text-gray-400 text-xs mt-2">Already have an account? <button onClick={() => navigate('/login')} className="text-green-500 hover:text-green-600 font-medium">Sign In</button></p>
                    </div>
                </div>
            </div>

            {/* Help Button */}
            <button className="fixed bottom-6 right-6 w-12 h-12 bg-gray-800 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-700 transition-colors">
                <HelpCircle className="w-6 h-6" />
            </button>
        </div>
    );
}
