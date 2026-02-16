/**
 * CareQueue AI - Staff Model
 * Simple staff authentication (for demo purposes)
 */

const { getDb } = require('../database');

/**
 * Verify staff credentials
 */
async function verifyStaff(username, password) {
  const db = await getDb();
  
  return new Promise((resolve, reject) => {
    db.get(`
      SELECT id, username, role FROM staff
      WHERE username = ? AND password = ?
    `, [username, password], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row ? {
          id: row.id,
          username: row.username,
          role: row.role
        } : null);
      }
    });
  });
}

module.exports = {
  verifyStaff
};
