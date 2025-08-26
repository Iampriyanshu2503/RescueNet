const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const FoodDonation = require('../models/foodDonationModel');

// @desc    Create a new food donation
// @route   POST /api/food-donations
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { foodType, servings, description, bestBefore, allergens, pickupInstructions, image, location } = req.body;

    const foodDonation = await FoodDonation.create({
      user: req.user._id,
      donor: req.user._id, // Add donor field for notifications
      foodType,
      servings,
      description,
      bestBefore,
      allergens,
      pickupInstructions,
      image,
      location,
      status: 'available', // Set initial status
      expiresAt: bestBefore || new Date(Date.now() + 24 * 60 * 60 * 1000) // Default 24 hours
    });

    // Send notification to pre-registered customers
    if (global.socketServer) {
      await global.socketServer.notifyNewFoodDonation(foodDonation);
    }

    res.status(201).json(foodDonation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get all food donations
// @route   GET /api/food-donations
// @access  Public
router.get('/', async (req, res) => {
  try {
    const foodDonations = await FoodDonation.find({}).sort({ createdAt: -1 });
    res.json(foodDonations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get user's food donations
// @route   GET /api/food-donations/my-donations
// @access  Private
router.get('/my-donations', protect, async (req, res) => {
  try {
    const foodDonations = await FoodDonation.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(foodDonations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get a single food donation
// @route   GET /api/food-donations/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const foodDonation = await FoodDonation.findById(req.params.id);
    
    if (!foodDonation) {
      return res.status(404).json({ message: 'Food donation not found' });
    }
    
    res.json(foodDonation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Update a food donation
// @route   PUT /api/food-donations/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const foodDonation = await FoodDonation.findById(req.params.id);
    
    if (!foodDonation) {
      return res.status(404).json({ message: 'Food donation not found' });
    }
    
    // Check if the user owns the food donation
    if (foodDonation.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    const oldStatus = foodDonation.status;
    const updatedFoodDonation = await FoodDonation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    // Send notification if status changed
    if (global.socketServer && oldStatus !== updatedFoodDonation.status) {
      await global.socketServer.notifyDonationUpdate(updatedFoodDonation, updatedFoodDonation.status);
    }
    
    res.json(updatedFoodDonation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Delete a food donation
// @route   DELETE /api/food-donations/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const foodDonation = await FoodDonation.findById(req.params.id);
    
    if (!foodDonation) {
      return res.status(404).json({ message: 'Food donation not found' });
    }
    
    // Check if the user owns the food donation
    if (foodDonation.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    await FoodDonation.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Food donation removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;