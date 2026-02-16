/**
 * CareQueue AI - SQLite Database Setup
 * Database schema and initialization
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'data', 'carequeue.db');
const DB_DIR = path.dirname(DB_PATH);

// Ensure data directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

/**
 * Initialize database connection
 */
function getDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Error opening database:', err);
        reject(err);
      } else {
        console.log('Connected to SQLite database');
        resolve(db);
      }
    });
  });
}

/**
 * Initialize database schema
 */
async function initializeDatabase() {
  const db = await getDatabase();
  
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Patients table
      db.run(`
        CREATE TABLE IF NOT EXISTS patients (
          id TEXT PRIMARY KEY,
          queue_number INTEGER NOT NULL,
          name TEXT NOT NULL,
          age INTEGER NOT NULL,
          contact_number TEXT,
          symptoms TEXT NOT NULL,
          temperature REAL,
          is_emergency INTEGER DEFAULT 0,
          priority TEXT NOT NULL,
          priority_reason TEXT,
          status TEXT DEFAULT 'waiting',
          estimated_duration INTEGER,
          consultation_type TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          completed_at DATETIME
        )
      `, (err) => {
        if (err) {
          console.error('Error creating patients table:', err);
          reject(err);
        }
      });

      // Daily visits log table
      db.run(`
        CREATE TABLE IF NOT EXISTS daily_visits (
          id TEXT PRIMARY KEY,
          patient_id TEXT NOT NULL,
          visit_date DATE NOT NULL,
          status TEXT NOT NULL,
          completed_at DATETIME,
          FOREIGN KEY (patient_id) REFERENCES patients(id)
        )
      `, (err) => {
        if (err) {
          console.error('Error creating daily_visits table:', err);
          reject(err);
        }
      });

      // Staff table (simple authentication)
      db.run(`
        CREATE TABLE IF NOT EXISTS staff (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          role TEXT DEFAULT 'staff',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('Error creating staff table:', err);
          reject(err);
        } else {
          // Insert default admin user if not exists
          db.run(`
            INSERT OR IGNORE INTO staff (username, password, role)
            VALUES ('admin', 'carequeue123', 'admin')
          `, (err) => {
            if (err) {
              console.error('Error inserting default admin:', err);
            }
          });
          resolve(db);
        }
      });
    });
  });
}

/**
 * Get database instance (singleton pattern)
 */
let dbInstance = null;

async function getDb() {
  if (!dbInstance) {
    dbInstance = await initializeDatabase();
  }
  return dbInstance;
}

module.exports = {
  getDatabase,
  initializeDatabase,
  getDb,
  DB_PATH
};
