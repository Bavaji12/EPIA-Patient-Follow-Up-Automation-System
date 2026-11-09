const { db, logActivity } = require('../config/database');
const { getTodayDateString, addDays } = require('../utils/dateUtils');

function seedDatabase() {
  console.log('--- Seeding EPIA Database with Fictional Healthcare Data ---');

  // Clear existing data safely
  db.exec(`
    DELETE FROM activity_logs;
    DELETE FROM message_drafts;
    DELETE FROM patients;
    DELETE FROM sqlite_sequence WHERE name IN ('patients', 'message_drafts', 'activity_logs');
  `);

  const today = getTodayDateString();
  const yesterday = addDays(today, -1);
  const threeDaysAgo = addDays(today, -3);
  const fiveDaysAgo = addDays(today, -5);
  const sevenDaysAgo = addDays(today, -7);
  const tomorrow = addDays(today, 1);
  const threeDaysLater = addDays(today, 3);
  const nextWeek = addDays(today, 7);

  const insertPatient = db.prepare(`
    INSERT INTO patients (name, phone, consultation_date, next_follow_up_date, follow_up_status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, datetime('now', 'localtime'), datetime('now', 'localtime'))
  `);

  // 1. Patient 1: Due Today (Pending follow-up, ready for AI draft generation)
  const p1 = insertPatient.run(
    'Ananya Sharma',
    '+91 98765 43210',
    threeDaysAgo,
    today,
    'pending'
  );
  logActivity(p1.lastInsertRowid, 'PATIENT_REGISTERED', 'Patient Ananya Sharma registered with consultation on ' + threeDaysAgo);

  // 2. Patient 2: Due Today (Pending follow-up, ready for AI draft generation)
  const p2 = insertPatient.run(
    'Rajesh Patel',
    '+91 98123 45678',
    fiveDaysAgo,
    today,
    'pending'
  );
  logActivity(p2.lastInsertRowid, 'PATIENT_REGISTERED', 'Patient Rajesh Patel registered with consultation on ' + fiveDaysAgo);

  // 3. Patient 3: Due Today (Has an existing pending AI draft)
  const p3 = insertPatient.run(
    'Priya Nair',
    '+91 97234 56789',
    sevenDaysAgo,
    today,
    'pending'
  );
  logActivity(p3.lastInsertRowid, 'PATIENT_REGISTERED', 'Patient Priya Nair registered with consultation on ' + sevenDaysAgo);

  // 4. Patient 4: Due Today (Completed follow-up)
  const p4 = insertPatient.run(
    'David Miller',
    '+1 555-0143',
    fiveDaysAgo,
    today,
    'completed'
  );
  logActivity(p4.lastInsertRowid, 'PATIENT_REGISTERED', 'Patient David Miller registered with consultation on ' + fiveDaysAgo);
  logActivity(p4.lastInsertRowid, 'FOLLOW_UP_COMPLETED', 'Follow-up marked completed by clinic coordinator');

  // 5. Patient 5: Upcoming in 1 day
  const p5 = insertPatient.run(
    'Sarah Jenkins',
    '+1 555-0188',
    threeDaysAgo,
    tomorrow,
    'pending'
  );
  logActivity(p5.lastInsertRowid, 'PATIENT_REGISTERED', 'Patient Sarah Jenkins registered with consultation on ' + threeDaysAgo);

  // 6. Patient 6: Upcoming in 3 days
  const p6 = insertPatient.run(
    'Vikram Rao',
    '+91 99887 76655',
    yesterday,
    threeDaysLater,
    'pending'
  );
  logActivity(p6.lastInsertRowid, 'PATIENT_REGISTERED', 'Patient Vikram Rao registered with consultation on ' + yesterday);

  // 7. Patient 7: Past follow-up (Completed)
  const p7 = insertPatient.run(
    'Fatima Khan',
    '+44 7700 900123',
    sevenDaysAgo,
    yesterday,
    'completed'
  );
  logActivity(p7.lastInsertRowid, 'PATIENT_REGISTERED', 'Patient Fatima Khan registered with consultation on ' + sevenDaysAgo);
  logActivity(p7.lastInsertRowid, 'FOLLOW_UP_COMPLETED', 'Follow-up completed following telehealth check');

  // 8. Patient 8: Next week follow-up
  const p8 = insertPatient.run(
    'Carlos Mendez',
    '+1 555-0199',
    yesterday,
    nextWeek,
    'pending'
  );
  logActivity(p8.lastInsertRowid, 'PATIENT_REGISTERED', 'Patient Carlos Mendez registered with consultation on ' + yesterday);

  // Seed sample message drafts
  const insertDraft = db.prepare(`
    INSERT INTO message_drafts (patient_id, message, ai_provider, approval_status, created_at, reviewed_at)
    VALUES (?, ?, ?, ?, datetime('now', 'localtime'), ?)
  `);

  // Draft 1: For Priya Nair (Pending approval)
  const d1 = insertDraft.run(
    p3.lastInsertRowid,
    'Hello Priya, this is a friendly reminder from our care team regarding your scheduled follow-up today. We hope you are doing well. Please reply to this message or contact our clinic if you need any assistance with your appointment. Have a wonderful day!',
    'gemini-1.5-flash',
    'pending',
    null
  );
  logActivity(p3.lastInsertRowid, 'DRAFT_GENERATED', 'AI follow-up draft generated for Priya Nair (Provider: gemini-1.5-flash)');

  // Draft 2: For David Miller (Approved draft)
  const d2 = insertDraft.run(
    p4.lastInsertRowid,
    'Hello David, this is our care team checking in on your scheduled appointment today. If you need any directions or wish to reschedule, our front desk is here to help. Thank you for choosing our clinic!',
    'mock-ai',
    'approved',
    new Date().toISOString()
  );
  logActivity(p4.lastInsertRowid, 'DRAFT_GENERATED', 'AI follow-up draft generated for David Miller (Provider: mock-ai)');
  logActivity(p4.lastInsertRowid, 'DRAFT_APPROVED', 'Message draft #' + d2.lastInsertRowid + ' approved by clinic staff (Note: No WhatsApp sent)');

  // Draft 3: For Fatima Khan (Previously rejected draft)
  const d3 = insertDraft.run(
    p7.lastInsertRowid,
    'Hello Fatima, quick reminder about your visit today. Please let us know if you will make it.',
    'mock-ai',
    'rejected',
    new Date().toISOString()
  );
  logActivity(p7.lastInsertRowid, 'DRAFT_GENERATED', 'AI follow-up draft generated for Fatima Khan (Provider: mock-ai)');
  logActivity(p7.lastInsertRowid, 'DRAFT_REJECTED', 'Message draft #' + d3.lastInsertRowid + ' rejected: Message tone was too brief');

  console.log(`Successfully seeded:
  - 8 Fictional Patients (3 Due Today, 2 Upcoming, 2 Past, 1 Future)
  - 3 Sample AI Message Drafts (1 Pending, 1 Approved, 1 Rejected)
  - Initial Activity Logs`);
}

if (require.main === module) {
  seedDatabase();
  process.exit(0);
}

module.exports = { seedDatabase };

