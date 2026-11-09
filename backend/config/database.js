const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../database/epia.db');

// Ensure database directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

// Enable pragmas for data integrity and performance
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

// Initialize schema
function initSchema() {
  const schemaPath = path.join(__dirname, '../database/schema.sql');
  if (fs.existsSync(schemaPath)) {
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    db.exec(schemaSql);
  }
}

initSchema();

/**
 * Helper to record activity history
 * @param {number|null} patientId 
 * @param {string} action 
 * @param {string} description 
 */
function logActivity(patientId, action, description) {
  try {
    const stmt = db.prepare(`
      INSERT INTO activity_logs (patient_id, action, description, created_at)
      VALUES (?, ?, ?, datetime('now', 'localtime'))
    `);
    return stmt.run(patientId, action, description);
  } catch (error) {
    console.error('Failed to log activity:', error.message);
  }
}

module.exports = {
  db,
  logActivity
};

