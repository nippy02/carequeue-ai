/**
 * Patient registration routes
 */

const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');

// Submit new patient (walk-in registration)
router.post('/', async (req, res) => {
  try {
    const { name, age, contactNumber, symptoms, temperature, isEmergency } = req.body;
    
    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Patient name is required'
      });
    }
    
    if (!age || parseInt(age) < 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid age is required'
      });
    }
    
    if (!symptoms || !symptoms.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Symptoms description is required'
      });
    }
    
    // Validate contact number format (basic)
    if (contactNumber && contactNumber.trim()) {
      const phoneRegex = /^[\d\s\-\+\(\)]+$/;
      if (!phoneRegex.test(contactNumber)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid contact number format'
        });
      }
    }
    
    const patientData = {
      name: name.trim(),
      age: parseInt(age),
      contactNumber: contactNumber ? contactNumber.trim() : null,
      symptoms: symptoms.trim(),
      temperature: temperature ? parseFloat(temperature) : null,
      isEmergency: !!isEmergency
    };
    
    const patient = await Patient.addPatient(patientData);
    
    res.status(201).json({
      success: true,
      message: 'Patient registered successfully',
      patient: {
        id: patient.id,
        queueNumber: patient.queueNumber,
        name: patient.name,
        priority: patient.priority,
        status: patient.status,
        estimatedDuration: patient.estimatedDuration,
        consultationType: patient.consultationType,
        estimatedWait: getEstimatedWait(patient.priority)
      }
    });
  } catch (error) {
    console.error('Error registering patient:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register patient',
      error: error.message
    });
  }
});

// Get all patients (for admin)
router.get('/', async (req, res) => {
  try {
    const patients = await Patient.getAllPatients();
    res.json({ success: true, patients });
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch patients' });
  }
});

/**
 * Estimate wait time in minutes based on queue position and priority
 */
function getEstimatedWait(priority) {
  const baseWait = { emergency: 5, urgent: 15, normal: 30 };
  return baseWait[priority] || 30;
}

module.exports = router;
