// Backend API Route (Node.js/Express example)
// File: routes/donors.js

const express = require('express');
const router = express.Router();
const Donor = require('../models/Donor'); // Your Mongoose model
const auth = require('../middleware/auth'); // Authentication middleware

// GET /api/donors/profile/:id
router.get('/profile/:id', auth, async (req, res) => {
    try {
        const donorId = req.params.id;

        // Optional: Verify the requesting user can access this profile
        // (e.g., only allow users to access their own profile)
        if (req.user.id !== donorId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Find donor by ID and exclude password field
        const donor = await Donor.findById(donorId)
            .select('-password')
            .populate('donations') // If you have related donations
            .lean(); // Convert to plain JS object for better performance

        if (!donor) {
            return res.status(404).json({
                success: false,
                message: 'Donor not found'
            });
        }

        // Calculate dynamic stats (you can also store these in DB)
        const stats = await calculateDonorStats(donorId);

        // Combine donor data with calculated stats
        const profileData = {
            ...donor,
            totalDonations: stats.totalDonations || 0,
            mealsServed: stats.mealsServed || 0,
            impactScore: stats.impactScore || 0,
            status: donor.isVerified ? 'verified' : 'active',
            joinDate: donor.createdAt
        };

        res.json({
            success: true,
            data: profileData
        });

    } catch (error) {
        console.error('Error fetching donor profile:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching profile',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// GET /api/donors/me (Alternative: Get current user's profile)
router.get('/me', auth, async (req, res) => {
    try {
        // req.user is set by auth middleware from JWT token
        const donorId = req.user.id;

        const donor = await Donor.findById(donorId)
            .select('-password')
            .lean();

        if (!donor) {
            return res.status(404).json({
                success: false,
                message: 'Donor profile not found'
            });
        }

        const stats = await calculateDonorStats(donorId);

        const profileData = {
            ...donor,
            totalDonations: stats.totalDonations || 0,
            mealsServed: stats.mealsServed || 0,
            impactScore: stats.impactScore || 0,
            status: donor.isVerified ? 'verified' : 'active',
            joinDate: donor.createdAt
        };

        res.json({
            success: true,
            data: profileData
        });

    } catch (error) {
        console.error('Error fetching current donor profile:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Helper function to calculate donor statistics
async function calculateDonorStats(donorId) {
    try {
        // Assuming you have a Donation model
        const Donation = require('../models/Donation');

        const stats = await Donation.aggregate([
            { $match: { donorId: donorId } },
            {
                $group: {
                    _id: null,
                    totalDonations: { $sum: 1 },
                    totalMeals: { $sum: '$estimatedMeals' }, // Assuming you have this field
                    totalWeight: { $sum: '$weight' }
                }
            }
        ]);

        const result = stats[0] || { totalDonations: 0, totalMeals: 0, totalWeight: 0 };

        // Calculate impact score (example formula)
        const impactScore = Math.min(100, Math.round(
            (result.totalDonations * 2) + (result.totalMeals * 0.5)
        ));

        return {
            totalDonations: result.totalDonations,
            mealsServed: result.totalMeals,
            impactScore: impactScore
        };

    } catch (error) {
        console.error('Error calculating stats:', error);
        return {
            totalDonations: 0,
            mealsServed: 0,
            impactScore: 0
        };
    }
}

module.exports = router;

// =============================================
// Authentication Middleware Example
// File: middleware/auth.js

const jwt = require('jsonwebtoken');
const Donor = require('../models/Donor');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const donor = await Donor.findById(decoded.id);

        if (!donor) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token.'
            });
        }

        req.user = { id: donor._id.toString(), role: donor.role || 'donor' };
        next();

    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid token.'
        });
    }
};

module.exports = auth;

// =============================================
// Alternative Frontend Implementation with React Context
// File: contexts/AuthContext.jsx (if using Context API)

import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load user from localStorage on app start
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('userData');

        if (token && userData) {
            try {
                setUser(JSON.parse(userData));
            } catch (error) {
                console.error('Error parsing user data:', error);
                localStorage.removeItem('authToken');
                localStorage.removeItem('userData');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const response = await fetch('http://localhost:5000/api/donors/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (data.success) {
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userData', JSON.stringify(data.user));
            setUser(data.user);
        }

        return data;
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

// =============================================
// Updated Frontend Component using Context
// (Alternative to the localStorage approach)

/*
// In your DonorProfilePage component, you could use:

import { useAuth } from '../contexts/AuthContext';

export default function DonorProfilePage() {
    const { user } = useAuth(); // Get current user from context
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDonorProfile = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');
            
            // Use /me endpoint instead of /profile/:id
            const response = await fetch('http://localhost:5000/api/donors/me', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch profile');
            }

            const data = await response.json();
            setProfile(data.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchDonorProfile();
        }
    }, [user]);

    // Rest of your component...
}
*/