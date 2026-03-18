import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// @desc    Register user
// @route   POST /api/auth/register
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        error: 'User already exists'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password
    });

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      data: {
        _id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    res.json({
      success: true,
      token: generateToken(user._id),
      data: {
        _id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update user profile - FIXED VERSION
// @route   PUT /api/auth/update
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    console.log('🔵 Update profile request received');
    console.log('User ID from token:', req.user?.id);
    console.log('Request body:', req.body);
    
    const { name, email, notifications } = req.body;
    
    // Find user by ID from token
    const user = await User.findById(req.user.id);
    
    if (!user) {
      console.log('❌ User not found with ID:', req.user.id);
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    console.log('✅ User found:', user.email);
    
    // Update fields if provided
    if (name) {
      console.log('Updating name from', user.name, 'to', name);
      user.name = name;
    }
    
    if (email) {
      console.log('Updating email from', user.email, 'to', email);
      user.email = email;
    }
    
    if (notifications !== undefined) {
      console.log('Updating notifications from', user.notifications, 'to', notifications);
      user.notifications = notifications;
    }
    
    // Save the updated user
    await user.save();
    console.log('✅ User saved successfully');
    
    // Return updated user (without password)
    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        notifications: user.notifications,
        createdAt: user.createdAt
      }
    });
    
  } catch (error) {
    console.error('❌ Error updating profile:', error);
    console.error('Error stack:', error.stack);
    
    // Send detailed error in development
    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};