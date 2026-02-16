/**
 * CareQueue AI - Staff Model
 * Simple staff authentication (for demo purposes)
 */

const { getDb } = require('../database');

// Fallback for default admin (handles Render ephemeral disk / fresh DB)
const DEFAULT_ADMIN = { username: 'admin', password: 'carequeue123', role: 'admin' };

/**
 * Verify staff credentials
 */
async function verifyStaff(username, password) {
  try {
    const db = await getDb();
    const row = await new Promise((resolve, reject) => {
      db.get(`
        SELECT id, username, role FROM staff
        WHERE username = ? AND password = ?
      `, [username, password], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    if (row) {
      return { id: row.id, username: row.username, role: row.role };
    }
  } catch (err) {
    console.error('DB auth lookup failed, trying fallback:', err.message);
  }
  // Fallback: default admin (for Render ephemeral disk / demo)
  if (username === DEFAULT_ADMIN.username && password === DEFAULT_ADMIN.password) {
    return { id: 1, username: DEFAULT_ADMIN.username, role: DEFAULT_ADMIN.role };
  }
  return null;
}

module.exports = {
  verifyStaff
};
