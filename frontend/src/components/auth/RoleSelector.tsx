import React, { useState } from 'react';
import { ArrowLeft, Heart, HelpCircle, Link2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


export default function FoodBanquetSelection() {
    const navigate = useNavigate();
    const [selectedRole, setSelectedRole] = useState<string | null>(null);

    const handleRoleSelect = (role: string) => {
        setSelectedRole(role);
        console.log(`Selected role: ${role}`);
        if (role === 'donor') {
            navigate('/donor-dashboard');
        }
        else if (role === 'recipient') {
            // You can create a recipient dashboard later
            navigate('/recipient-dashboard');
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
            <div className="flex flex-col items-center justify-center min-h-screen px-4">
                {/* Header */}
                <div className="text-center mb-12">
                    {/* Logo */}
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <Heart className="w-8 h-8 text-white" />
                    </div>

                    <h1 className="text-3xl font-bold text-gray-800 mb-3">Food Banquet</h1>
                    <p className="text-gray-600 text-lg">How would you like to help today?</p>
                </div>

                {/* Role Selection Cards */}
                <div className="w-full max-w-md space-y-4">
                    {/* Donor Card */}
                    <div
                        onClick={() => handleRoleSelect('donor')}
                        className="bg-white rounded-2xl p-6 shadow-lg cursor-pointer transform hover:scale-105 transition-all duration-200 hover:shadow-xl"
                    >
                        <div className="flex items-start space-x-4">
                            {/* Icon */}
                            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Heart className="w-6 h-6 text-white" />
                            </div>

                            {/* Content */}
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-gray-800 mb-1">I'm a Donor</h3>
                                <p className="text-gray-600 text-sm">Share surplus food with those in need</p>

                                {/* Progress Dots */}
                                <div className="flex items-center space-x-2 mt-4">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <div className="w-4 h-0.5 bg-gray-300 rounded-full"></div>
                                    <div className="w-4 h-0.5 bg-gray-300 rounded-full"></div>
                                    <div className="w-4 h-0.5 bg-gray-300 rounded-full"></div>
                                    <Link2 className="w-4 h-4 text-gray-400" />
                                    <div className="w-4 h-0.5 bg-gray-300 rounded-full"></div>
                                    <div className="w-4 h-0.5 bg-gray-300 rounded-full"></div>
                                    <div className="w-4 h-0.5 bg-gray-300 rounded-full"></div>
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recipient Card */}
                    <div
                        onClick={() => handleRoleSelect('recipient')}
                        className="bg-white rounded-2xl p-6 shadow-lg cursor-pointer transform hover:scale-105 transition-all duration-200 hover:shadow-xl"
                    >
                        <div className="flex items-start space-x-4">
                            {/* Icon */}
                            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Link2 className="w-6 h-6 text-white" />
                            </div>

                            {/* Content */}
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-gray-800 mb-1">I'm a Recipient</h3>
                                <p className="text-gray-600 text-sm">Find and request available food donations</p>

                                {/* Progress Dots */}
                                <div className="flex items-center space-x-2 mt-4">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <div className="w-4 h-0.5 bg-gray-300 rounded-full"></div>
                                    <div className="w-4 h-0.5 bg-gray-300 rounded-full"></div>
                                    <div className="w-4 h-0.5 bg-gray-300 rounded-full"></div>
                                    <Heart className="w-4 h-4 text-gray-400" />
                                    <div className="w-4 h-0.5 bg-gray-300 rounded-full"></div>
                                    <div className="w-4 h-0.5 bg-gray-300 rounded-full"></div>
                                    <div className="w-4 h-0.5 bg-gray-300 rounded-full"></div>
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Message */}
                <div className="text-center mt-12">
                    <p className="text-gray-500 text-sm">Building a community where no food goes to waste</p>
                </div>
            </div>

            {/* Help Button */}
            <button className="fixed bottom-6 right-6 w-12 h-12 bg-gray-800 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-700 transition-colors">
                <HelpCircle className="w-6 h-6" />
            </button>
        </div>
    );
}