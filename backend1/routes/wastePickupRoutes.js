const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const WastePickup = require('../models/wastePickupModel');

// @desc    Create a new waste pickup request
// @route   POST /api/waste-pickups
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { wasteType, estimatedWeight, description, preferredDate, timeSlot, pickupAddress, specialInstructions } = req.body;

    const wastePickup = await WastePickup.create({
      user: req.user._id,
      wasteType,
      estimatedWeight,
      description,
      preferredDate,
      timeSlot,
      pickupAddress,
      specialInstructions,
    });

    res.status(201).json(wastePickup);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get all waste pickup requests
// @route   GET /api/waste-pickups
// @access  Public
router.get('/', async (req, res) => {
  try {
    const wastePickups = await WastePickup.find({}).sort({ createdAt: -1 });
    res.json(wastePickups);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get user's waste pickup requests
// @route   GET /api/waste-pickups/my-pickups
// @access  Private
router.get('/my-pickups', protect, async (req, res) => {
  try {
    const wastePickups = await WastePickup.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(wastePickups);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get a single waste pickup request
// @route   GET /api/waste-pickups/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const wastePickup = await WastePickup.findById(req.params.id);
    
    if (!wastePickup) {
      return res.status(404).json({ message: 'Waste pickup request not found' });
    }
    
    res.json(wastePickup);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Update a waste pickup request
// @route   PUT /api/waste-pickups/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const wastePickup = await WastePickup.findById(req.params.id);
    
    if (!wastePickup) {
      return res.status(404).json({ message: 'Waste pickup request not found' });
    }
    
    // Check if the user owns the waste pickup request
    if (wastePickup.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    const updatedWastePickup = await WastePickup.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    res.json(updatedWastePickup);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Delete a waste pickup request
// @route   DELETE /api/waste-pickups/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const wastePickup = await WastePickup.findById(req.params.id);
    
    if (!wastePickup) {
      return res.status(404).json({ message: 'Waste pickup request not found' });
    }
    
    // Check if the user owns the waste pickup request
    if (wastePickup.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    await WastePickup.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Waste pickup request removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;