const express = require('express');
const UserService = require('../services/userService.js');
const { requireUser } = require('./middleware/auth.js');
const User = require('../models/User.js');
const { generateAccessToken, generateRefreshToken } = require('../utils/auth.js');
const jwt = require('jsonwebtoken');
const { authLimiter } = require('../middleware/security.js');

const router = express.Router();

router.post('/login', authLimiter, async (req, res) => {
  const sendError = msg => res.status(400).json({ message: msg });
  const { email, password } = req.body;

  if (!email || !password) {
    return sendError('Email and password are required');
  }

  try {
    const user = await UserService.authenticateWithPassword(email, password);

    if (user) {
      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      user.refreshToken = refreshToken;
      await user.save();
      return res.json({...user.toObject(), accessToken, refreshToken});
    } else {
      return sendError('Email or password is incorrect');
    }
  } catch (error) {
    console.error('Login error:', error.message);
    
    // Temporary mock response for development when database is not available
    if (process.env.NODE_ENV === 'development' && error.message.includes('Database')) {
      console.log('Using mock authentication for development');
      const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        email: email,
        name: 'Development User',
        createdAt: new Date(),
        lastLoginAt: new Date(),
        isActive: true
      };
      
      const accessToken = generateAccessToken(mockUser);
      const refreshToken = generateRefreshToken(mockUser);
      
      return res.json({
        ...mockUser,
        accessToken,
        refreshToken
      });
    }
    
    return sendError('Authentication service unavailable');
  }
});

router.post('/register', authLimiter, async (req, res, next) => {
  if (req.user) {
    return res.json({ user: req.user });
  }
  try {
    const user = await UserService.create(req.body);
    return res.status(200).json(user);
  } catch (error) {
    console.error(`Error while registering user: ${error.message}`);
    return res.status(400).json({ 
      message: error.message || 'Registration failed',
      success: false 
    });
  }
});

router.post('/logout', async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (user) {
    user.refreshToken = null;
    await user.save();
  }

  res.status(200).json({ message: 'User logged out successfully.' });
});

router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: 'Refresh token is required'
    });
  }

  try {
    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    // Find the user
    const user = await UserService.get(decoded.sub);

    if (!user) {
      return res.status(403).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.refreshToken !== refreshToken) {
      return res.status(403).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // Update user's refresh token in database
    user.refreshToken = newRefreshToken;
    await user.save();

    // Return new tokens
    return res.status(200).json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      }
    });

  } catch (error) {
    console.error(`Token refresh error: ${error.message}`);

    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({
        success: false,
        message: 'Refresh token has expired'
      });
    }

    return res.status(403).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
});

router.get('/me', requireUser, async (req, res) => {
  return res.status(200).json(req.user);
});

module.exports = router;
