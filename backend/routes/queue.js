/**
 * Queue management routes
 */

const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');

// Get live queue (sorted by priority)
router.get('/', async (req, res) => {
  try {
    const queue = await Patient.getSortedQueue();
    const patients = queue.map((p, index) => ({
      ...p,
      position: index + 1,
      estimatedWait: getEstimatedWaitMinutes(p.priority, index)
    }));
    
    res.json({ success: true, queue: patients });
  } catch (error) {
    console.error('Error fetching queue:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch queue' });
  }
});

// Update patient status (admin only)
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['waiting', 'in_consultation', 'done'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Use: waiting, in_consultation, or done'
      });
    }
    
    const patient = await Patient.updatePatientStatus(id, status);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Status updated',
      patient
    });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ success: false, message: 'Failed to update status' });
  }
});

// Clear completed patients (admin only)
router.delete('/completed', async (req, res) => {
  try {
    const result = await Patient.clearCompletedPatients();
    res.json({
      success: true,
      message: 'Completed patients cleared',
      deleted: result.deleted
    });
  } catch (error) {
    console.error('Error clearing completed:', error);
    res.status(500).json({ success: false, message: 'Failed to clear' });
  }
});

/**
 * Estimate wait time based on priority and position
 */
function getEstimatedWaitMinutes(priority, position) {
  const baseMinutes = { emergency: 5, urgent: 15, normal: 25 };
  const base = baseMinutes[priority] || 25;
  return Math.min(base + (position * 5), 120); // Max 2 hours
}

module.exports = router;
