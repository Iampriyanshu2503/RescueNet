// 2. DONOR ROUTES (routes/donors.js)
const express = require('express');
const router = express.Router();
const Donor = require('../models/Donor');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

// Validation middleware
const donorValidation = [
    body('firstName').trim().isLength({ min: 1, max: 50 }).withMessage('First name is required and must be less than 50 characters'),
    body('lastName').trim().isLength({ min: 1, max: 50 }).withMessage('Last name is required and must be less than 50 characters'),
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('phoneNumber').matches(/^\+?[\d\s\-\(\)]{10,}$/).withMessage('Please provide a valid phone number'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Passwords do not match');
        }
        return true;
    }),
    body('address').trim().isLength({ min: 1 }).withMessage('Address is required'),
    body('organization').optional().trim()
];

// POST /api/donors/register - Register new donor
router.post('/register', donorValidation, async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { firstName, lastName, email, phoneNumber, password, address, organization } = req.body;

        // Check if donor already exists
        const existingDonor = await Donor.findOne({ email });
        if (existingDonor) {
            return res.status(409).json({
                success: false,
                message: 'Donor with this email already exists'
            });
        }

        // Create new donor
        const newDonor = new Donor({
            firstName,
            lastName,
            email,
            phoneNumber,
            password,
            address,
            organization: organization || ''
        });

        await newDonor.save();

        // Generate JWT token
        const token = jwt.sign(
            { id: newDonor._id, email: newDonor.email, role: 'donor' },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );

        res.status(201).json({
            success: true,
            message: 'Donor registered successfully',
            data: {
                donor: newDonor,
                token
            }
        });

    } catch (error) {
        console.error('Donor registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// POST /api/donors/login - Donor login
router.post('/login', [
    body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 1 }).withMessage('Password is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { email, password } = req.body;

        // Find donor by email
        const donor = await Donor.findOne({ email }).select('+password');
        if (!donor) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check password
        const isPasswordValid = await donor.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: donor._id, email: donor.email, role: 'donor' },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                donor,
                token
            }
        });

    } catch (error) {
        console.error('Donor login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// GET /api/donors/profile - Get donor profile (protected route)
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const donor = await Donor.findById(req.user.id).populate('donations');
        if (!donor) {
            return res.status(404).json({
                success: false,
                message: 'Donor not found'
            });
        }

        res.status(200).json({
            success: true,
            data: donor
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Access token required'
        });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
        if (err) {
            return res.status(403).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }
        req.user = user;
        next();
    });
}

module.exports = router;