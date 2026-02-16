/**
 * CareQueue AI - Backend Server
 * Smart Barangay Clinic Triage & Queue Management
 */

const express = require('express');
const cors = require('cors');
const path = require('path');

// Load environment variables
require('dotenv').config();

// Initialize database
const { initializeDatabase } = require('./database');

const patientRoutes = require('./routes/patients');
const queueRoutes = require('./routes/queue');
const authRoutes = require('./routes/auth');
const reportRoutes = require('./routes/reports');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/patients', patientRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'CareQueue AI API is running' });
});

// Initialize database and start server
async function startServer() {
  try {
    await initializeDatabase();
    console.log('Database initialized successfully');
    
    app.listen(PORT, () => {
      console.log(`
  ╔══════════════════════════════════════════╗
  ║     CareQueue AI - Backend Server        ║
  ║     Running on http://localhost:${PORT}     ║
  ╚══════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
