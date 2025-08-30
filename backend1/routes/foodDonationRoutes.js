const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const FoodDonation = require('../models/foodDonationModel');
const User = require('../models/userModel');

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

// @desc    Add a review to a food donation
// @route   POST /api/food-donations/:id/reviews
// @access  Private
router.post('/:id/reviews', protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    if (!rating || !comment) {
      return res.status(400).json({ message: 'Please provide both rating and comment' });
    }
    
    const foodDonation = await FoodDonation.findById(req.params.id);
    
    if (!foodDonation) {
      return res.status(404).json({ message: 'Food donation not found' });
    }
    
    // Check if user has already reviewed this donation
    const alreadyReviewed = foodDonation.reviews.find(
      (review) => review.user.toString() === req.user._id.toString()
    );
    
    if (alreadyReviewed) {
      return res.status(400).json({ message: 'You have already reviewed this donation' });
    }
    
    const review = {
      user: req.user._id,
      rating: Number(rating),
      comment,
    };
    
    foodDonation.reviews.push(review);
    
    await foodDonation.save();
    
    // If there's a socket server, notify the donor about the new review
    if (global.socketServer) {
      await global.socketServer.notifyNewReview(foodDonation, review);
    }
    
    res.status(201).json({ message: 'Review added successfully', review });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get all reviews for a food donation
// @route   GET /api/food-donations/:id/reviews
// @access  Public
router.get('/:id/reviews', async (req, res) => {
  try {
    const foodDonation = await FoodDonation.findById(req.params.id).populate({
      path: 'reviews.user',
      select: 'name avatar'
    });
    
    if (!foodDonation) {
      return res.status(404).json({ message: 'Food donation not found' });
    }
    
    res.json(foodDonation.reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;