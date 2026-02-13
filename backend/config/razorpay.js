const Razorpay = require('razorpay');
const crypto = require('crypto');

// Validate environment variables
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error('⚠️  WARNING: Razorpay credentials not found in environment variables');
  console.error('Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env file');
}

// Initialize Razorpay instance
let razorpay;
try {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
  console.log('✓ Razorpay initialized with key:', process.env.RAZORPAY_KEY_ID?.substring(0, 15) + '...');
} catch (error) {
  console.error('❌ Failed to initialize Razorpay:', error.message);
}

/**
 * Create Razorpay order
 * @param {number} amount - Amount in rupees
 * @param {string} currency - Currency code (default: INR)
 * @param {string} receipt - Receipt ID
 * @returns {Promise<object>} Razorpay order object
 */
const createOrder = async (amount, currency = 'INR', receipt) => {
  try {
    // Validate inputs
    if (!amount || isNaN(amount) || amount <= 0) {
      throw new Error(`Invalid amount: ${amount}`);
    }

    if (!receipt) {
      throw new Error('Receipt ID is required');
    }

    if (!razorpay) {
      throw new Error('Razorpay not initialized. Check your API credentials.');
    }

    console.log('Creating Razorpay order with:', {
      amount: amount,
      amountInPaise: Math.round(amount * 100),
      currency,
      receipt
    });

    // Razorpay amount is in paise (multiply by 100)
    const options = {
      amount: Math.round(amount * 100), // Ensure it's an integer
      currency: currency,
      receipt: receipt,
      payment_capture: 1 // Auto capture payment
    };

    const order = await razorpay.orders.create(options);
    
    console.log('✓ Razorpay order created:', order.id);
    
    return order;
  } catch (error) {
    console.error('❌ Razorpay order creation failed:');
    console.error('Full error object:', error);
    
    // Razorpay errors have a specific structure
    let errorMessage = 'Error creating Razorpay order';
    
    if (error.statusCode) {
      console.error('Status Code:', error.statusCode);
    }
    
    if (error.error) {
      console.error('Razorpay Error:', error.error);
      
      if (error.error.description) {
        errorMessage = error.error.description;
      } else if (error.error.code) {
        errorMessage = `Razorpay error: ${error.error.code}`;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    // Provide specific error messages based on status code
    if (error.statusCode === 400) {
      if (error.error && error.error.description) {
        throw new Error(`Razorpay validation error: ${error.error.description}`);
      } else {
        throw new Error('Invalid request to Razorpay. Check your parameters.');
      }
    } else if (error.statusCode === 401) {
      throw new Error('Razorpay authentication failed. Please check your API key and secret.');
    } else {
      throw new Error(errorMessage);
    }
  }
};

/**
 * Verify Razorpay payment signature
 * @param {string} orderId - Razorpay order ID
 * @param {string} paymentId - Razorpay payment ID
 * @param {string} signature - Razorpay signature
 * @returns {boolean} True if signature is valid
 */
const verifyPaymentSignature = (orderId, paymentId, signature) => {
  try {
    const text = orderId + '|' + paymentId;
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');
    
    return generated_signature === signature;
  } catch (error) {
    throw new Error('Error verifying payment signature: ' + error.message);
  }
};

/**
 * Get payment details
 * @param {string} paymentId - Razorpay payment ID
 * @returns {Promise<object>} Payment details
 */
const getPaymentDetails = async (paymentId) => {
  try {
    const payment = await razorpay.payments.fetch(paymentId);
    return payment;
  } catch (error) {
    throw new Error('Error fetching payment details: ' + error.message);
  }
};

/**
 * Refund payment
 * @param {string} paymentId - Razorpay payment ID
 * @param {number} amount - Amount to refund (optional, full refund if not provided)
 * @returns {Promise<object>} Refund object
 */
const refundPayment = async (paymentId, amount = null) => {
  try {
    const options = amount ? { amount: amount * 100 } : {};
    const refund = await razorpay.payments.refund(paymentId, options);
    return refund;
  } catch (error) {
    throw new Error('Error processing refund: ' + error.message);
  }
};

module.exports = {
  razorpay,
  createOrder,
  verifyPaymentSignature,
  getPaymentDetails,
  refundPayment
};