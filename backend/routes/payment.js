const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const Order = require('../models/Order');
const {
  createOrder,
  verifyPaymentSignature,
  getPaymentDetails,
  refundPayment
} = require('../config/razorpay');

// @route   GET /api/payment/test-config
// @desc    Test if Razorpay is configured (for debugging)
// @access  Public
router.get('/test-config', (req, res) => {
  const isConfigured = !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
  
  res.json({
    razorpayConfigured: isConfigured,
    keyId: process.env.RAZORPAY_KEY_ID 
      ? `${process.env.RAZORPAY_KEY_ID.substring(0, 12)}...` 
      : 'NOT SET',
    keySecret: process.env.RAZORPAY_KEY_SECRET ? 'SET (hidden)' : 'NOT SET',
    message: isConfigured 
      ? 'Razorpay is configured correctly' 
      : 'Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env file'
  });
});

// @route   GET /api/payment/test-razorpay
// @desc    Test Razorpay connectivity by creating a test order
// @access  Public (for testing only - remove in production)
router.get('/test-razorpay', async (req, res) => {
  try {
    console.log('Testing Razorpay connectivity...');
    
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({
        success: false,
        message: 'Razorpay credentials not configured'
      });
    }

    // Try to create a test order for ₹1
    const testOrder = await createOrder(1, 'INR', `test_${Date.now()}`);
    
    res.json({
      success: true,
      message: 'Razorpay is working correctly!',
      testOrder: {
        id: testOrder.id,
        amount: testOrder.amount,
        currency: testOrder.currency
      }
    });
  } catch (error) {
    console.error('Razorpay test failed:', error);
    res.status(500).json({
      success: false,
      message: 'Razorpay test failed',
      error: error.message
    });
  }
});

// @route   POST /api/payment/create-order
// @desc    Create Razorpay order
// @access  Private
router.post('/create-order', auth, async (req, res) => {
  try {
    const { amount, orderId } = req.body;

    console.log('=== Payment Create Order Request ===');
    console.log('Amount:', amount);
    console.log('Order ID:', orderId);
    console.log('User ID:', req.user._id);

    if (!amount || !orderId) {
      console.log('Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Amount and order ID are required'
      });
    }

    // Check if Razorpay is configured
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('❌ Razorpay credentials not configured');
      return res.status(500).json({
        success: false,
        message: 'Payment gateway not configured. Please contact support.'
      });
    }

    console.log('✓ Razorpay configured');

    // Verify order exists and belongs to user
    console.log('Finding order...');
    const order = await Order.findById(orderId);
    
    if (!order) {
      console.error('❌ Order not found:', orderId);
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    console.log('✓ Order found:', order.orderNumber);

    // Check authorization
    const customerIdStr = order.customer.toString();
    const userIdStr = req.user._id.toString();
    
    console.log('Customer ID:', customerIdStr);
    console.log('User ID:', userIdStr);

    if (customerIdStr !== userIdStr) {
      console.error('❌ Unauthorized access attempt');
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this order'
      });
    }

    console.log('✓ Authorization passed');

    // Validate amount
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      console.error('❌ Invalid amount:', amount);
      return res.status(400).json({
        success: false,
        message: 'Invalid amount'
      });
    }

    console.log('Creating Razorpay order...');
    console.log('Amount in rupees:', amountNum);

    // Create short receipt ID (max 40 chars for Razorpay)
    // Format: ORD_timestamp_random
    const timestamp = Date.now().toString().slice(-8); // Last 8 digits
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const shortReceipt = `ORD_${timestamp}_${random}`; // e.g., "ORD_83932585_1234"

    console.log('Receipt ID:', shortReceipt, '(length:', shortReceipt.length, ')');

    // Create Razorpay order
    const razorpayOrder = await createOrder(
      amountNum,
      'INR',
      shortReceipt
    );

    console.log('✓ Razorpay order created successfully');
    console.log('Razorpay Order ID:', razorpayOrder.id);
    console.log('Amount (paise):', razorpayOrder.amount);

    // Store Razorpay order ID in our order
    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    console.log('✓ Order updated with Razorpay ID');

    res.json({
      success: true,
      order: razorpayOrder,
      key: process.env.RAZORPAY_KEY_ID
    });

    console.log('=== Payment Order Created Successfully ===\n');
  } catch (error) {
    console.error('=== Payment Create Order Error ===');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    console.error('=====================================\n');
    
    res.status(500).json({
      success: false,
      message: 'Error creating payment order',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// @route   POST /api/payment/verify
// @desc    Verify Razorpay payment
// @access  Private
router.post('/verify', auth, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
      return res.status(400).json({
        success: false,
        message: 'Missing payment verification parameters'
      });
    }

    // Verify signature
    const isValid = verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    // Update order payment status
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;
    order.paymentStatus = 'completed';
    order.status = 'confirmed';
    await order.save();

    res.json({
      success: true,
      message: 'Payment verified successfully',
      order
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying payment',
      error: error.message
    });
  }
});

// @route   POST /api/payment/refund/:orderId
// @desc    Refund payment
// @access  Private (Admin/Restaurant)
router.post('/refund/:orderId', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check authorization
    if (req.user.role !== 'admin' && req.user.role !== 'restaurant') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to process refunds'
      });
    }

    if (!order.razorpayPaymentId) {
      return res.status(400).json({
        success: false,
        message: 'No payment found for this order'
      });
    }

    if (order.paymentStatus === 'refunded') {
      return res.status(400).json({
        success: false,
        message: 'Payment already refunded'
      });
    }

    // Process refund
    const { amount } = req.body; // Optional partial refund amount
    const refund = await refundPayment(order.razorpayPaymentId, amount);

    // Update order
    order.paymentStatus = 'refunded';
    order.razorpayRefundId = refund.id;
    order.status = 'cancelled';
    await order.save();

    res.json({
      success: true,
      message: 'Refund processed successfully',
      refund,
      order
    });
  } catch (error) {
    console.error('Refund error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing refund',
      error: error.message
    });
  }
});

// @route   GET /api/payment/details/:paymentId
// @desc    Get payment details
// @access  Private
router.get('/details/:paymentId', auth, async (req, res) => {
  try {
    const payment = await getPaymentDetails(req.params.paymentId);

    res.json({
      success: true,
      payment
    });
  } catch (error) {
    console.error('Get payment details error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment details',
      error: error.message
    });
  }
});

// @route   GET /api/payment/key
// @desc    Get Razorpay key for frontend
// @access  Public
router.get('/key', (req, res) => {
  res.json({
    success: true,
    key: process.env.RAZORPAY_KEY_ID
  });
});

module.exports = router;