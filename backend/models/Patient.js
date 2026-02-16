/**
 * CareQueue AI - Patient Model
 * Database operations for patients
 */

const { getDb } = require('../database');
const { classifyPatient, estimateVisitDuration } = require('../utils/triageLogic');

/**
 * Generate unique patient ID
 */
function generateId() {
  return 'P' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

/**
 * Get next queue number for today
 */
async function getNextQueueNumber() {
  const db = await getDb();
  const today = new Date().toISOString().split('T')[0];
  
  return new Promise((resolve, reject) => {
    db.get(`
      SELECT MAX(queue_number) as max_queue
      FROM patients
      WHERE DATE(created_at) = ?
    `, [today], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve((row?.max_queue || 0) + 1);
      }
    });
  });
}

/**
 * Add new patient
 */
async function addPatient(patientData) {
  const db = await getDb();
  const id = generateId();
  const queueNumber = await getNextQueueNumber();
  
  // Run triage logic
  const triageResult = classifyPatient({
    symptoms: patientData.symptoms || '',
    temperature: patientData.temperature,
    isEmergency: patientData.isEmergency || false,
    age: patientData.age
  });
  
  // Estimate visit duration
  const visitEstimate = estimateVisitDuration({
    symptoms: patientData.symptoms || '',
    age: patientData.age,
    priority: triageResult.priority
  });
  
  const patient = {
    id,
    queue_number: queueNumber,
    name: patientData.name.trim(),
    age: parseInt(patientData.age) || 0,
    contact_number: patientData.contactNumber || null,
    symptoms: (patientData.symptoms || '').trim(),
    temperature: patientData.temperature ? parseFloat(patientData.temperature) : null,
    is_emergency: patientData.isEmergency ? 1 : 0,
    priority: triageResult.priority,
    priority_reason: triageResult.reason,
    status: 'waiting',
    estimated_duration: visitEstimate.duration,
    consultation_type: visitEstimate.type,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  return new Promise((resolve, reject) => {
    db.run(`
      INSERT INTO patients (
        id, queue_number, name, age, contact_number, symptoms, temperature,
        is_emergency, priority, priority_reason, status, estimated_duration,
        consultation_type, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      patient.id,
      patient.queue_number,
      patient.name,
      patient.age,
      patient.contact_number,
      patient.symptoms,
      patient.temperature,
      patient.is_emergency,
      patient.priority,
      patient.priority_reason,
      patient.status,
      patient.estimated_duration,
      patient.consultation_type,
      patient.created_at,
      patient.updated_at
    ], function(err) {
      if (err) {
        reject(err);
      } else {
        resolve(mapPatientRow(patient));
      }
    });
  });
}

/**
 * Get all patients
 */
async function getAllPatients() {
  const db = await getDb();
  
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT * FROM patients
      ORDER BY created_at DESC
    `, [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows.map(mapPatientRow));
      }
    });
  });
}

/**
 * Get sorted queue (by priority, then arrival time)
 */
async function getSortedQueue() {
  const db = await getDb();
  const priorityOrder = { emergency: 1, urgent: 2, normal: 3 };
  
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT * FROM patients
      WHERE status != 'done'
      ORDER BY 
        CASE priority
          WHEN 'emergency' THEN 1
          WHEN 'urgent' THEN 2
          WHEN 'normal' THEN 3
          ELSE 4
        END,
        created_at ASC
    `, [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows.map(mapPatientRow));
      }
    });
  });
}

/**
 * Get patient by ID
 */
async function getPatientById(id) {
  const db = await getDb();
  
  return new Promise((resolve, reject) => {
    db.get(`
      SELECT * FROM patients WHERE id = ?
    `, [id], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row ? mapPatientRow(row) : null);
      }
    });
  });
}

/**
 * Update patient status
 */
async function updatePatientStatus(id, status) {
  const db = await getDb();
  const now = new Date().toISOString();
  
  return new Promise((resolve, reject) => {
    const updates = {
      status,
      updated_at: now
    };
    
    if (status === 'done') {
      updates.completed_at = now;
    }
    
    db.run(`
      UPDATE patients
      SET status = ?, updated_at = ?, completed_at = ?
      WHERE id = ?
    `, [
      status,
      updates.updated_at,
      updates.completed_at || null,
      id
    ], function(err) {
      if (err) {
        reject(err);
      } else {
        if (this.changes === 0) {
          resolve(null);
        } else {
          getPatientById(id).then(resolve).catch(reject);
        }
      }
    });
  });
}

/**
 * Clear completed patients
 */
async function clearCompletedPatients() {
  const db = await getDb();
  
  return new Promise((resolve, reject) => {
    db.run(`
      DELETE FROM patients WHERE status = 'done'
    `, [], function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ deleted: this.changes });
      }
    });
  });
}

/**
 * Get daily report statistics
 */
async function getDailyReport() {
  const db = await getDb();
  const today = new Date().toISOString().split('T')[0];
  
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN priority = 'emergency' THEN 1 ELSE 0 END) as emergency_count,
        SUM(CASE WHEN priority = 'urgent' THEN 1 ELSE 0 END) as urgent_count,
        SUM(CASE WHEN priority = 'normal' THEN 1 ELSE 0 END) as normal_count,
        SUM(CASE WHEN status = 'waiting' THEN 1 ELSE 0 END) as waiting_count,
        SUM(CASE WHEN status = 'in_consultation' THEN 1 ELSE 0 END) as in_consultation_count,
        SUM(CASE WHEN status = 'done' AND DATE(completed_at) = ? THEN 1 ELSE 0 END) as completed_count
      FROM patients
      WHERE DATE(created_at) = ?
    `, [today, today], (err, row) => {
      if (err) {
        reject(err);
      } else {
        const stats = row[0] || {};
        
        // Get average waiting time
        db.get(`
          SELECT AVG(
            (julianday(completed_at) - julianday(created_at)) * 24 * 60
          ) as avg_wait_minutes
          FROM patients
          WHERE status = 'done' AND DATE(completed_at) = ?
        `, [today], (err, waitRow) => {
          if (err) {
            reject(err);
          } else {
            resolve({
              date: today,
              totalPatients: parseInt(stats.total) || 0,
              emergencyCases: parseInt(stats.emergency_count) || 0,
              urgentCases: parseInt(stats.urgent_count) || 0,
              normalCases: parseInt(stats.normal_count) || 0,
              activeWaiting: parseInt(stats.waiting_count) || 0,
              inConsultation: parseInt(stats.in_consultation_count) || 0,
              completedVisits: parseInt(stats.completed_count) || 0,
              averageWaitTime: Math.round(waitRow?.avg_wait_minutes || 0)
            });
          }
        });
      }
    });
  });
}

/**
 * Get daily patient log
 */
async function getDailyLog() {
  const db = await getDb();
  const today = new Date().toISOString().split('T')[0];
  
  return new Promise((resolve, reject) => {
    db.all(`
      SELECT * FROM patients
      WHERE DATE(created_at) = ? OR DATE(completed_at) = ?
      ORDER BY created_at DESC
    `, [today, today], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows.map(mapPatientRow));
      }
    });
  });
}

/**
 * Map database row to patient object
 */
function mapPatientRow(row) {
  return {
    id: row.id,
    queueNumber: row.queue_number,
    name: row.name,
    age: row.age,
    contactNumber: row.contact_number,
    symptoms: row.symptoms,
    temperature: row.temperature,
    isEmergency: row.is_emergency === 1,
    priority: row.priority,
    priorityReason: row.priority_reason,
    status: row.status,
    estimatedDuration: row.estimated_duration,
    consultationType: row.consultation_type,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    completedAt: row.completed_at
  };
}

module.exports = {
  addPatient,
  getAllPatients,
  getSortedQueue,
  getPatientById,
  updatePatientStatus,
  clearCompletedPatients,
  getDailyReport,
  getDailyLog
};
