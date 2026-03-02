const jwt = require('jsonwebtoken');
const User = require('../models/User');
const UserProgress = require('../models/UserProgress');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '7d',
  });
};

// Signup
const signup = async (req, res) => {
  try {
    const { email, password, confirmPassword, firstName = '', lastName = '' } = req.body;

    // Validation
    if (!email || !password || !confirmPassword) {
      return res.status(400).json({ success: false, error: 'Email, password, and confirm password are required.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, error: 'Passwords do not match.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long.' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, error: 'User with this email already exists.' });
    }

    // Create new user
    const user = new User({
      email,
      password,
      firstName,
      lastName,
    });

    await user.save();

    const token = generateToken(user._id);
    const userData = user.toJSON();

    res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      token,
      user: userData,
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ success: false, error: 'Internal server error.' });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);
    const userData = user.toJSON();

    res.status(200).json({
      success: true,
      message: 'User logged in successfully.',
      token,
      user: userData,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Internal server error.' });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const userId = req.userId; // From auth middleware

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    // Get user progress
    const progress = await UserProgress.find({ userId })
      .populate('assignmentId', 'title difficulty topic')
      .sort({ lastAttempt: -1 });

    const completedCount = progress.filter(p => p.isCompleted).length;
    const totalAttempts = progress.reduce((sum, p) => sum + p.attemptCount, 0);
    const userData = user.toJSON();

    res.status(200).json({
      success: true,
      user: userData,
      progress,
      stats: {
        completedCount,
        totalAttempts,
        totalAssignmentsAttempted: progress.length,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, error: 'Internal server error.' });
  }
};

// Delete user account
const deleteAccount = async (req, res) => {
  try {
    const userId = req.userId; // From auth middleware

    await User.findByIdAndDelete(userId);
    await UserProgress.deleteMany({ userId });

    res.status(200).json({
      success: true,
      message: 'User account deleted successfully.',
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ success: false, error: 'Internal server error.' });
  }
};

module.exports = {
  signup,
  login,
  getProfile,
  deleteAccount,
  generateToken,
};
