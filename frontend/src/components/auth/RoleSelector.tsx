import React, { useState } from 'react';
import { ArrowLeft, Heart, HelpCircle, Link2, Truck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function FoodBanquetSelection() {
    const navigate = useNavigate();
    const [selectedRole, setSelectedRole] = useState<string | null>(null);

    const handleRoleSelect = (role: string) => {
        setSelectedRole(role);
        console.log(`Selected role: ${role}`);
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
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome to Food Banquet</h1>
                        <p className="text-gray-600">Choose your dashboard to get started</p>
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
                                <h3 className="text-lg font-bold text-gray-800 mb-2">I'm a Donor</h3>
                                <p className="text-gray-600 text-sm mb-4">Share surplus food with those in need</p>

                                {/* Progress Indicator */}
                                <div className="flex justify-center items-center space-x-1">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <div className="w-3 h-0.5 bg-gray-300 rounded-full"></div>
                                    <div className="w-3 h-0.5 bg-gray-300 rounded-full"></div>
                                    <Link2 className="w-3 h-3 text-gray-400" />
                                    <div className="w-3 h-0.5 bg-gray-300 rounded-full"></div>
                                    <div className="w-3 h-0.5 bg-gray-300 rounded-full"></div>
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                </div>
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
                                <h3 className="text-lg font-bold text-gray-800 mb-2">I'm a Recipient</h3>
                                <p className="text-gray-600 text-sm mb-4">Find and request available food donations</p>

                                {/* Progress Indicator */}
                                <div className="flex justify-center items-center space-x-1">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <div className="w-3 h-0.5 bg-gray-300 rounded-full"></div>
                                    <div className="w-3 h-0.5 bg-gray-300 rounded-full"></div>
                                    <Heart className="w-3 h-3 text-gray-400" />
                                    <div className="w-3 h-0.5 bg-gray-300 rounded-full"></div>
                                    <div className="w-3 h-0.5 bg-gray-300 rounded-full"></div>
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                </div>
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
                                <h3 className="text-lg font-bold text-gray-800 mb-2">I'm a Volunteer</h3>
                                <p className="text-gray-600 text-sm mb-4">Help deliver food from donors to recipients</p>

                                {/* Progress Indicator */}
                                <div className="flex justify-center items-center space-x-1">
                                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                    <div className="w-3 h-0.5 bg-gray-300 rounded-full"></div>
                                    <div className="w-3 h-0.5 bg-gray-300 rounded-full"></div>
                                    <Truck className="w-3 h-3 text-gray-400" />
                                    <div className="w-3 h-0.5 bg-gray-300 rounded-full"></div>
                                    <div className="w-3 h-0.5 bg-gray-300 rounded-full"></div>
                                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Message */}
                    <div className="text-center">
                        <p className="text-gray-500 text-sm">Building a community where no food goes to waste</p>
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
