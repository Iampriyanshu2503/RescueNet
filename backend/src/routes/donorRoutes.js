const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const DonorDetails = require('../models/DonorDetails');
const jwt = require('jsonwebtoken');

console.log('Loading donor routes...');

// Validation middleware with fixed phone regex
const validateDonorRegistration = [
    body('firstName')
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('First name must be between 1 and 50 characters'),
    body('lastName')
        .trim()
        .isLength({ min: 1, max: 50 })
        .withMessage('Last name must be between 1 and 50 characters'),
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    body('phone')
        .matches(/^[+]?[0-9]\d{9,14}$/) // allows 10–15 digits, with optional +
        .withMessage('Please provide a valid phone number'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    body('address')
        .trim()
        .isLength({ min: 1, max: 200 })
        .withMessage('Address must be between 1 and 200 characters'),
    body('organization')
        .isIn(['restaurant', 'cafe', 'bakery', 'canteen', 'hotel', 'catering', 'grocery', 'supermarket', 'food_court', 'individual', 'other'])
        .withMessage('Please select a valid organization type')
];

router.get('/test', (req, res) => {
    res.json({ message: 'Test route working with validation middleware' });
});

// @route   POST /api/donors/register
// @desc    Register a new donor
// @access  Public
router.post('/register', validateDonorRegistration, async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array().reduce((acc, error) => {
                    acc[error.param] = { message: error.msg };
                    return acc;
                }, {})
            });
        }

        const { firstName, lastName, email, phone, password, address, organization } = req.body;

        // Check if donor already exists
        const existingDonor = await DonorDetails.findOne({ email });
        if (existingDonor) {
            return res.status(400).json({
                success: false,
                message: 'Email address is already registered',
                code: 11000
            });
        }

        // Create new donor
        const newDonor = new DonorDetails({
            firstName,
            lastName,
            email,
            phone,
            password,
            address,
            organization
        });

        // Save donor to database
        const savedDonor = await newDonor.save();

        // Generate JWT token
        const payload = {
            donor: {
                id: savedDonor._id,
                email: savedDonor.email,
                organization: savedDonor.organization
            }
        };

        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '30d' }
        );

        res.status(201).json({
            success: true,
            message: 'Donor registered successfully',
            data: {
                donor: {
                    id: savedDonor._id,
                    firstName: savedDonor.firstName,
                    lastName: savedDonor.lastName,
                    email: savedDonor.email,
                    phone: savedDonor.phone,
                    address: savedDonor.address,
                    organization: savedDonor.organization,
                    organizationDisplay: savedDonor.organizationDisplay,
                    fullName: savedDonor.fullName,
                    verificationStatus: savedDonor.verificationStatus,
                    registrationDate: savedDonor.registrationDate
                },
                token
            }
        });

    } catch (error) {
        console.error('Donor registration error:', error);

        // Handle mongoose validation errors
        if (error.name === 'ValidationError') {
            const validationErrors = {};
            Object.keys(error.errors).forEach(key => {
                validationErrors[key] = { message: error.errors[key].message };
            });

            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validationErrors
            });
        }

        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Email address is already registered',
                code: 11000
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error occurred during registration'
        });
    }
});

console.log('Donor routes loaded successfully');

module.exports = router;