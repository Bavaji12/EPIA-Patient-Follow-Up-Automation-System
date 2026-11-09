-- EPIA Patient Follow-Up Automation System Schema
PRAGMA foreign_keys = ON;

-- Patients Table
CREATE TABLE IF NOT EXISTS patients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  consultation_date TEXT NOT NULL,
  next_follow_up_date TEXT NOT NULL,
  follow_up_status TEXT DEFAULT 'pending' CHECK(follow_up_status IN ('pending', 'completed')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Message Drafts Table
CREATE TABLE IF NOT EXISTS message_drafts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER NOT NULL,
  message TEXT NOT NULL,
  ai_provider TEXT DEFAULT 'mock-ai',
  approval_status TEXT DEFAULT 'pending' CHECK(approval_status IN ('pending', 'approved', 'rejected')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  reviewed_at DATETIME,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER,
  action TEXT NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE SET NULL
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_patients_follow_up ON patients(next_follow_up_date, follow_up_status);
CREATE INDEX IF NOT EXISTS idx_drafts_patient ON message_drafts(patient_id);
CREATE INDEX IF NOT EXISTS idx_drafts_status ON message_drafts(approval_status);
CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_logs(created_at DESC);

