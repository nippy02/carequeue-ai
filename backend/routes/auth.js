/**
 * Admin authentication routes
 * Note: Uses simple credentials for demo. Use JWT/sessions for production.
 */

const express = require('express');
const router = express.Router();
const Staff = require('../models/Staff');

// Admin login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }
    
    const user = await Staff.verifyStaff(username, password);
    
    if (user) {
      res.json({
        success: true,
        message: 'Login successful',
        user: {
          username: user.username,
          role: user.role || 'staff'
        }
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

module.exports = router;
