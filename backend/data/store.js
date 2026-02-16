/**
 * CareQueue AI - In-Memory Data Store
 * Simple storage for development. Replace with MongoDB for production.
 */

// In-memory storage
let patients = [];
let dailyLog = [];

// Simple admin credentials (for demo - use proper auth in production)
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'carequeue123'
};

/**
 * Generate unique ID
 */
function generateId() {
  return 'P' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

/**
 * Get next queue number for today
 */
function getNextQueueNumber() {
  const today = new Date().toDateString();
  const todayPatients = [...patients, ...dailyLog].filter(
    p => new Date(p.createdAt).toDateString() === today
  );
  const uniqueIds = new Set(todayPatients.map(p => p.id));
  return uniqueIds.size + 1;
}

/**
 * Add new patient
 */
function addPatient(patientData) {
  const patient = {
    id: generateId(),
    queueNumber: getNextQueueNumber(),
    ...patientData,
    status: 'waiting',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  patients.push(patient);
  return patient;
}

/**
 * Get all patients
 */
function getAllPatients() {
  return [...patients];
}

/**
 * Get patients by status
 */
function getPatientsByStatus(status) {
  return patients.filter(p => p.status === status);
}

/**
 * Get sorted queue (by priority, then by arrival time)
 */
function getSortedQueue() {
  const priorityOrder = { emergency: 1, urgent: 2, normal: 3 };
  return [...patients]
    .filter(p => p.status !== 'done')
    .sort((a, b) => {
      const orderA = priorityOrder[a.priority] || 4;
      const orderB = priorityOrder[b.priority] || 4;
      if (orderA !== orderB) return orderA - orderB;
      return new Date(a.createdAt) - new Date(b.createdAt);
    });
}

/**
 * Update patient status
 */
function updatePatientStatus(id, status) {
  const patient = patients.find(p => p.id === id);
  if (!patient) return null;
  
  patient.status = status;
  patient.updatedAt = new Date().toISOString();
  if (status === 'done') {
    patient.completedAt = new Date().toISOString();
    dailyLog.push({ ...patient });
  }
  return patient;
}

/**
 * Get patient by ID
 */
function getPatientById(id) {
  return patients.find(p => p.id === id);
}

/**
 * Clear completed patients
 */
function clearCompletedPatients() {
  patients = patients.filter(p => p.status !== 'done');
  return patients;
}

/**
 * Verify admin credentials
 */
function verifyAdmin(username, password) {
  return username === ADMIN_CREDENTIALS.username && 
         password === ADMIN_CREDENTIALS.password;
}

/**
 * Get daily report
 */
function getDailyReport() {
  const today = new Date().toDateString();
  const todayPatients = [...patients, ...dailyLog].filter(
    p => new Date(p.createdAt).toDateString() === today || 
         (p.completedAt && new Date(p.completedAt).toDateString() === today)
  );
  
  const completedRaw = [...patients.filter(p => p.status === 'done'), ...dailyLog]
    .filter(p => {
      const completedDate = p.completedAt ? new Date(p.completedAt).toDateString() : null;
      return completedDate === today;
    });
  const seen = new Set();
  const completedToday = completedRaw.filter(p => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });
  
  const priorityBreakdown = {
    emergency: completedToday.filter(p => p.priority === 'emergency').length,
    urgent: completedToday.filter(p => p.priority === 'urgent').length,
    normal: completedToday.filter(p => p.priority === 'normal').length
  };
  
  return {
    date: today,
    totalServed: completedToday.length,
    totalWaiting: patients.filter(p => p.status === 'waiting').length,
    inConsultation: patients.filter(p => p.status === 'in_consultation').length,
    priorityBreakdown,
    recentPatients: completedToday.slice(-20).reverse()
  };
}

/**
 * Get daily patient log
 */
function getDailyLog() {
  const today = new Date().toDateString();
  const allPatients = [...patients, ...dailyLog];
  return allPatients
    .filter(p => {
      const created = new Date(p.createdAt).toDateString();
      const completed = p.completedAt ? new Date(p.completedAt).toDateString() : null;
      return created === today || completed === today;
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

module.exports = {
  addPatient,
  getAllPatients,
  getPatientsByStatus,
  getSortedQueue,
  updatePatientStatus,
  getPatientById,
  clearCompletedPatients,
  verifyAdmin,
  getDailyReport,
  getDailyLog
};
