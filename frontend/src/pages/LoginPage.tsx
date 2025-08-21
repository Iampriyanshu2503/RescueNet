import React, { useState, useContext } from 'react';
import { Mail, Lock, Heart, AlertCircle, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { AuthContext } from '../context/AuthDonorContext';

export default function FoodBanquetLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const authContext = useContext(AuthContext);


    const handleLogin = async () => {
        // Validate form
        if (!email || !password) {
            setError('Please enter both email and password');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // Call login API
            const userData = await authService.login({ email, password });
            
            // Update auth context if available
            if (authContext) {
                authContext.login({
                    id: userData._id,
                    firstName: userData.name.split(' ')[0] || '',
                    lastName: userData.name.split(' ')[1] || '',
                    email: userData.email
                }, userData.token);
            }

            // Redirect to role selection page after successful login
            navigate('/select-role');
        } catch (err: any) {
            // Handle login error
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignUp = () => {
        navigate('/register');
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-2">
            {/* Main Container */}
            <div className="w-full max-w-md">
                {/* Login Card */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <div className="flex items-center justify-center mb-3">
                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-2">
                                <Heart className="w-5 h-5 text-white" />
                            </div>
                            <h1 className="text-xl font-bold text-gray-800">Food Banquet</h1>
                        </div>

                        <p className="text-sm text-gray-600">Together, let's reduce food waste</p>
                    </div>

                    {/* Form */}
                    <div className="space-y-4">
                        {/* Email Field */}
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                                    placeholder="Enter your password"
                                    required
                                />
                            </div>
                        </div>

                        {/* Forgot Password */}
                        <div className="text-right">
                            <button className="text-sm text-green-500 hover:text-green-600 font-medium transition-colors">
                                Forgot Password?
                            </button>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="flex items-center p-3 text-sm text-red-600 bg-red-50 rounded-lg">
                                <AlertCircle className="w-4 h-4 mr-2" />
                                {error}
                            </div>
                        )}

                        {/* Login Button */}
                        <button
                            onClick={handleLogin}
                            disabled={isLoading}
                            className="w-full py-2.5 px-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg shadow-sm transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                                    Logging in...
                                </div>
                            ) : (
                                'LOGIN'
                            )}
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="relative my-5">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-gray-500">or continue with</span>
                        </div>
                    </div>

                    {/* Social Login Buttons */}
                    <div className="space-y-2">
                        <button className="w-full flex items-center justify-center px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200 hover:scale-105">
                            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Continue with Google
                        </button>

                        <button className="w-full flex items-center justify-center px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200 hover:scale-105">
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                            </svg>
                            Continue with Apple
                        </button>
                    </div>

                    {/* Sign Up Link */}
                    <div className="text-center mt-4">
                        <p className="text-gray-600">
                            Don't have an account?{' '}
                            <button
                                onClick={handleSignUp}
                                className="text-green-500 hover:text-green-600 font-medium transition-colors">
                                Sign Up
                            </button>
                        </p>
                    </div>
                </div>

                {/* Bottom Navigation */}
                <div className="bg-white rounded-2xl shadow-lg p-3">
                    <div className="flex items-center justify-center space-x-8">
                        <button className="flex flex-col items-center space-y-1 text-green-500">
                            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                            </div>
                            <span className="text-xs font-medium">Connect</span>
                        </button>

                        <button className="flex flex-col items-center space-y-1 text-gray-400">
                            <Heart className="w-5 h-5" />
                            <span className="text-xs font-medium">Share</span>
                        </button>

                        <button className="flex flex-col items-center space-y-1 text-green-500">
                            <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                            <span className="text-xs font-medium">Impact</span>
                        </button>
                    </div>

                    <div className="text-center mt-3">
                        <p className="text-xs text-gray-500">Join thousands making a difference</p>
                    </div>
                </div>

                {/* Help Button */}
                <button className="fixed bottom-6 right-6 w-12 h-12 bg-gray-800 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-700 transition-colors">
                    <HelpCircle className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
}
