const express = require('express');
const router = express.Router();
const Restaurant = require('../models/Restaurant');
const { auth, authorize } = require('../middlewares/auth');

// @route   GET /api/restaurants
// @desc    Get all restaurants with optional location-based search
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { cuisine, city, search, sortBy, lat, lng, radius } = req.query;
    
    let query = {};

    // Filter by cuisine
    if (cuisine) {
      query.cuisine = { $in: [cuisine] };
    }

    // Filter by city
    if (city) {
      query['address.city'] = new RegExp(city, 'i');
    }

    // Search by name
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { cuisine: { $in: [new RegExp(search, 'i')] } },
        { description: new RegExp(search, 'i') }
      ];
    }

    // Location-based filtering
    if (lat && lng) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);
      const maxDistance = radius ? parseInt(radius) / 1000 : 10; // Convert to km, default 10km

      query['address.coordinates.latitude'] = {
        $gte: latitude - (maxDistance / 111),
        $lte: latitude + (maxDistance / 111)
      };
      query['address.coordinates.longitude'] = {
        $gte: longitude - (maxDistance / (111 * Math.cos(latitude * Math.PI / 180))),
        $lte: longitude + (maxDistance / (111 * Math.cos(latitude * Math.PI / 180)))
      };
    }

    // Build sort option
    let sortOption = {};
    if (sortBy === 'rating') {
      sortOption = { rating: -1 };
    } else if (sortBy === 'deliveryTime') {
      sortOption = { deliveryTime: 1 };
    } else {
      sortOption = { createdAt: -1 };
    }

    let restaurants = await Restaurant.find(query)
      .populate('owner', 'name email phone')
      .sort(sortOption)
      .lean();

    // Calculate distance if location provided
    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      
      restaurants = restaurants.map(restaurant => {
        if (restaurant.address?.coordinates?.latitude && restaurant.address?.coordinates?.longitude) {
          // Haversine formula for distance
          const R = 6371; // Earth's radius in km
          const dLat = (restaurant.address.coordinates.latitude - userLat) * Math.PI / 180;
          const dLon = (restaurant.address.coordinates.longitude - userLng) * Math.PI / 180;
          const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                    Math.cos(userLat * Math.PI / 180) * Math.cos(restaurant.address.coordinates.latitude * Math.PI / 180) *
                    Math.sin(dLon/2) * Math.sin(dLon/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          const distance = R * c;
          restaurant.distance = Math.round(distance * 10) / 10; // km, 1 decimal
        }
        return restaurant;
      });

      // Sort by distance if location provided
      if (!sortBy) {
        restaurants.sort((a, b) => (a.distance || 999) - (b.distance || 999));
      }
    }

    res.json({
      success: true,
      count: restaurants.length,
      restaurants
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

// @route   GET /api/restaurants/:id
// @desc    Get restaurant by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id)
      .populate('owner', 'name email phone');

    if (!restaurant) {
      return res.status(404).json({ 
        success: false,
        message: 'Restaurant not found' 
      });
    }

    res.json({
      success: true,
      restaurant
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

// @route   POST /api/restaurants
// @desc    Create a new restaurant
// @access  Private (Restaurant owner/Admin)
router.post('/', auth, async (req, res) => {
  try {
    const restaurant = new Restaurant({
      ...req.body,
      owner: req.user._id
    });

    await restaurant.save();

    res.status(201).json({
      success: true,
      message: 'Restaurant created successfully',
      restaurant
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: 'Error creating restaurant',
      error: error.message 
    });
  }
});

// @route   PUT /api/restaurants/:id
// @desc    Update restaurant
// @access  Private (Owner only)
router.put('/:id', auth, async (req, res) => {
  try {
    let restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ 
        success: false,
        message: 'Restaurant not found' 
      });
    }

    // Check ownership
    if (restaurant.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to update this restaurant' 
      });
    }

    restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Restaurant updated successfully',
      restaurant
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: 'Error updating restaurant',
      error: error.message 
    });
  }
});

// @route   DELETE /api/restaurants/:id
// @desc    Delete restaurant
// @access  Private (Owner only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ 
        success: false,
        message: 'Restaurant not found' 
      });
    }

    // Check ownership
    if (restaurant.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to delete this restaurant' 
      });
    }

    await restaurant.deleteOne();

    res.json({
      success: true,
      message: 'Restaurant deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

// @route   GET /api/restaurants/featured/list
// @desc    Get featured restaurants
// @access  Public
router.get('/featured/list', async (req, res) => {
  try {
    const restaurants = await Restaurant.find({ isFeatured: true, isOpen: true })
      .limit(10)
      .sort({ rating: -1 });

    res.json({
      success: true,
      count: restaurants.length,
      restaurants
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

module.exports = router;