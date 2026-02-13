const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');
const Restaurant = require('../models/Restaurant');
const { auth } = require('../middlewares/auth');

// @route   GET /api/menu/restaurant/:restaurantId
// @desc    Get all menu items for a restaurant
// @access  Public
router.get('/restaurant/:restaurantId', async (req, res) => {
  try {
    const { category, isVegetarian, maxPrice } = req.query;
    
    let query = { restaurant: req.params.restaurantId, isAvailable: true };

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by vegetarian
    if (isVegetarian === 'true') {
      query.isVegetarian = true;
    }

    // Filter by max price
    if (maxPrice) {
      query.price = { $lte: parseFloat(maxPrice) };
    }

    const menuItems = await MenuItem.find(query)
      .populate('restaurant', 'name')
      .sort({ category: 1, name: 1 });

    res.json({
      success: true,
      count: menuItems.length,
      menuItems
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

// @route   GET /api/menu/:id
// @desc    Get single menu item
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id)
      .populate('restaurant', 'name address phone');

    if (!menuItem) {
      return res.status(404).json({ 
        success: false,
        message: 'Menu item not found' 
      });
    }

    res.json({
      success: true,
      menuItem
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

// @route   POST /api/menu
// @desc    Create a new menu item
// @access  Private (Restaurant owner)
router.post('/', auth, async (req, res) => {
  try {
    const { restaurant, name, description, price, category, image } = req.body;

    // Verify restaurant ownership
    const restaurantDoc = await Restaurant.findById(restaurant);
    
    if (!restaurantDoc) {
      return res.status(404).json({ 
        success: false,
        message: 'Restaurant not found' 
      });
    }

    if (restaurantDoc.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to add menu items to this restaurant' 
      });
    }

    const menuItem = new MenuItem(req.body);
    await menuItem.save();

    res.status(201).json({
      success: true,
      message: 'Menu item created successfully',
      menuItem
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: 'Error creating menu item',
      error: error.message 
    });
  }
});

// @route   PUT /api/menu/:id
// @desc    Update menu item
// @access  Private (Owner only)
router.put('/:id', auth, async (req, res) => {
  try {
    let menuItem = await MenuItem.findById(req.params.id).populate('restaurant');

    if (!menuItem) {
      return res.status(404).json({ 
        success: false,
        message: 'Menu item not found' 
      });
    }

    // Check ownership
    if (menuItem.restaurant.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to update this menu item' 
      });
    }

    menuItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Menu item updated successfully',
      menuItem
    });
  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: 'Error updating menu item',
      error: error.message 
    });
  }
});

// @route   DELETE /api/menu/:id
// @desc    Delete menu item
// @access  Private (Owner only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id).populate('restaurant');

    if (!menuItem) {
      return res.status(404).json({ 
        success: false,
        message: 'Menu item not found' 
      });
    }

    // Check ownership
    if (menuItem.restaurant.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to delete this menu item' 
      });
    }

    await menuItem.deleteOne();

    res.json({
      success: true,
      message: 'Menu item deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message 
    });
  }
});

// @route   PATCH /api/menu/:id/availability
// @desc    Toggle menu item availability
// @access  Private (Owner only)
router.patch('/:id/availability', auth, async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id).populate('restaurant');

    if (!menuItem) {
      return res.status(404).json({ 
        success: false,
        message: 'Menu item not found' 
      });
    }

    // Check ownership
    if (menuItem.restaurant.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized' 
      });
    }

    menuItem.isAvailable = !menuItem.isAvailable;
    await menuItem.save();

    res.json({
      success: true,
      message: `Menu item is now ${menuItem.isAvailable ? 'available' : 'unavailable'}`,
      menuItem
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