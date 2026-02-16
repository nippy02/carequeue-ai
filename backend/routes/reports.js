/**
 * Daily report and log routes
 */

const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');

// Get daily report summary
router.get('/daily', async (req, res) => {
  try {
    const report = await Patient.getDailyReport();
    res.json({ success: true, report });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ success: false, message: 'Failed to generate report' });
  }
});

// Get daily patient log
router.get('/log', async (req, res) => {
  try {
    const log = await Patient.getDailyLog();
    res.json({ success: true, log });
  } catch (error) {
    console.error('Error fetching log:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch log' });
  }
});

module.exports = router;
