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

// Add this to existing authController.js

// @desc    Get user's custom questions
// @route   GET /api/auth/questions
// @access  Private
export const getUserQuestions = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // If user has custom questions, use them; otherwise use defaults
    if (user.customQuestions && user.customQuestions.length > 0) {
      return res.json({
        success: true,
        questions: user.customQuestions
      });
    }
    
    // Default questions
    const defaultQuestions = [
      {
        id: '1',
        question: "How are you feeling right now?",
        emoji: "😊",
        placeholder: "Describe your current emotional state...",
        isDefault: true
      },
      {
        id: '2',
        question: "What did I do today that actually matters?",
        emoji: "🌟",
        placeholder: "Think about your meaningful actions...",
        isDefault: true
      },
      {
        id: '3',
        question: "What weight am I carrying that I don't need to?",
        emoji: "🎒",
        placeholder: "What worries or burdens can you let go of?",
        isDefault: true
      },
      {
        id: '4',
        question: "If tomorrow never came, would I be proud of how I lived today?",
        emoji: "⏳",
        placeholder: "Reflect on your actions and choices...",
        isDefault: true
      },
      {
        id: '5',
        question: "What was the best part of your day?",
        emoji: "✨",
        placeholder: "Share a highlight, no matter how small...",
        isDefault: true
      },
      {
        id: '6',
        question: "What challenged you today and what did you learn from it?",
        emoji: "💪",
        placeholder: "What was difficult and what wisdom did you gain?",
        isDefault: true
      },
      {
        id: '7',
        question: "What are you grateful for right now?",
        emoji: "🙏",
        placeholder: "Name at least three things, big or small...",
        isDefault: true
      },
      {
        id: '8',
        question: "What intention would you like to set for tomorrow?",
        emoji: "🎯",
        placeholder: "One small, meaningful intention...",
        isDefault: true
      }
    ];
    
    res.json({
      success: true,
      questions: defaultQuestions
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch questions'
    });
  }
};

// @desc    Update user's custom questions
// @route   PUT /api/auth/questions
// @access  Private
export const updateUserQuestions = async (req, res) => {
  try {
    const { questions } = req.body;
    
    const user = await User.findById(req.user.id);
    user.customQuestions = questions;
    await user.save();
    
    res.json({
      success: true,
      questions: user.customQuestions
    });
  } catch (error) {
    console.error('Error updating questions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update questions'
    });
  }
};

// @desc    Add a new custom question
// @route   POST /api/auth/questions
// @access  Private
export const addCustomQuestion = async (req, res) => {
  try {
    const { question, emoji, placeholder } = req.body;
    
    const user = await User.findById(req.user.id);
    
    const newQuestion = {
      id: Date.now().toString(),
      question,
      emoji: emoji || "📝",
      placeholder: placeholder || "Write your answer here...",
      isDefault: false
    };
    
    user.customQuestions.push(newQuestion);
    await user.save();
    
    res.json({
      success: true,
      question: newQuestion
    });
  } catch (error) {
    console.error('Error adding question:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add question'
    });
  }
};

// @desc    Remove a custom question
// @route   DELETE /api/auth/questions/:id
// @access  Private
export const removeCustomQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findById(req.user.id);
    
    // Don't allow removing default questions
    const questionToRemove = user.customQuestions.find(q => q.id === id);
    if (questionToRemove && questionToRemove.isDefault) {
      return res.status(400).json({
        success: false,
        error: 'Cannot remove default questions'
      });
    }
    
    user.customQuestions = user.customQuestions.filter(q => q.id !== id);
    await user.save();
    
    res.json({
      success: true,
      message: 'Question removed successfully'
    });
  } catch (error) {
    console.error('Error removing question:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove question'
    });
  }
};

// @desc    Reset to default questions
// @route   POST /api/auth/questions/reset
// @access  Private
export const resetToDefaultQuestions = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.customQuestions = [];
    await user.save();
    
    res.json({
      success: true,
      message: 'Reset to default questions'
    });
  } catch (error) {
    console.error('Error resetting questions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset questions'
    });
  }
};


// Add these to your existing authController.js

// @desc    Update user's mindset preference
// @route   PUT /api/auth/mindset
// @access  Private
export const updateMindset = async (req, res) => {
  try {
    const { mindset } = req.body;
    
    const user = await User.findById(req.user.id);
    user.mindsetPreference = mindset;
    await user.save();
    
    res.json({
      success: true,
      mindset: user.mindsetPreference
    });
  } catch (error) {
    console.error('Error updating mindset:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update mindset preference'
    });
  }
};

// @desc    Get user's mindset preference
// @route   GET /api/auth/mindset
// @access  Private
export const getMindset = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      success: true,
      mindset: user.mindsetPreference || 'daily'
    });
  } catch (error) {
    console.error('Error fetching mindset:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch mindset preference'
    });
  }
};