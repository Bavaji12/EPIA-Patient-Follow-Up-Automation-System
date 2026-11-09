const { db } = require('../config/database');
const { getTodayDateString, maskPhoneNumber } = require('../utils/dateUtils');
const { getAIServiceStatus } = require('../services/geminiService');

/**
 * Get comprehensive dashboard statistics
 * GET /api/dashboard/stats
 */
function getDashboardStats(req, res, next) {
  try {
    const today = getTodayDateString();

    // 1. Total Patients
    const totalPatientsRow = db.prepare('SELECT COUNT(*) as count FROM patients').get();
    const totalPatients = totalPatientsRow ? totalPatientsRow.count : 0;

    // 2. Follow-ups Due Today (pending)
    const dueTodayRow = db.prepare(`
      SELECT COUNT(*) as count FROM patients
      WHERE next_follow_up_date = ? AND follow_up_status = 'pending'
    `).get(today);
    const dueToday = dueTodayRow ? dueTodayRow.count : 0;

    // 3. Completed Follow-ups
    const completedRow = db.prepare(`
      SELECT COUNT(*) as count FROM patients
      WHERE follow_up_status = 'completed'
    `).get();
    const completedFollowUps = completedRow ? completedRow.count : 0;

    // 4. Pending AI Draft Approvals
    const pendingDraftsRow = db.prepare(`
      SELECT COUNT(*) as count FROM message_drafts
      WHERE approval_status = 'pending'
    `).get();
    const pendingDrafts = pendingDraftsRow ? pendingDraftsRow.count : 0;

    // 5. Total drafts approved & rejected
    const approvedDraftsRow = db.prepare(`
      SELECT COUNT(*) as count FROM message_drafts WHERE approval_status = 'approved'
    `).get();
    const rejectedDraftsRow = db.prepare(`
      SELECT COUNT(*) as count FROM message_drafts WHERE approval_status = 'rejected'
    `).get();

    // 6. Recent Registrations (latest 5)
    const recentPatients = db.prepare(`
      SELECT id, name, phone, consultation_date, next_follow_up_date, follow_up_status, created_at
      FROM patients
      ORDER BY id DESC
      LIMIT 5
    `).all();

    // 7. Today's Follow-Up Schedule (all patients due today)
    const dueSchedule = db.prepare(`
      SELECT p.*,
        (SELECT approval_status FROM message_drafts WHERE patient_id = p.id ORDER BY id DESC LIMIT 1) as latest_draft_status,
        (SELECT id FROM message_drafts WHERE patient_id = p.id ORDER BY id DESC LIMIT 1) as latest_draft_id
      FROM patients p
      WHERE p.next_follow_up_date = ?
      ORDER BY p.follow_up_status ASC, p.name ASC
    `).all(today);

    // 8. Pending Message Drafts preview (up to 5)
    const pendingDraftsList = db.prepare(`
      SELECT d.*, p.name as patient_name, p.phone as patient_phone, p.next_follow_up_date
      FROM message_drafts d
      JOIN patients p ON d.patient_id = p.id
      WHERE d.approval_status = 'pending'
      ORDER BY d.created_at DESC
      LIMIT 5
    `).all();

    const formattedPendingDrafts = pendingDraftsList.map(d => ({
      ...d,
      masked_phone: maskPhoneNumber(d.patient_phone)
    }));

    // Completion percentage
    const completionRate = totalPatients > 0
      ? Math.round((completedFollowUps / totalPatients) * 100)
      : 0;

    res.status(200).json({
      success: true,
      data: {
        todayDate: today,
        metrics: {
          totalPatients,
          dueToday,
          completedFollowUps,
          pendingDrafts,
          approvedDrafts: approvedDraftsRow ? approvedDraftsRow.count : 0,
          rejectedDrafts: rejectedDraftsRow ? rejectedDraftsRow.count : 0,
          completionRate
        },
        aiStatus: getAIServiceStatus(),
        recentPatients,
        dueSchedule,
        pendingDrafts: formattedPendingDrafts
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Retrieve activity logs in chronological order
 * GET /api/activity-logs
 */
function getActivityLogs(req, res, next) {
  try {
    const limit = Math.min(Number(req.query.limit) || 100, 200);

    const logs = db.prepare(`
      SELECT a.*, p.name as patient_name, p.phone as patient_phone
      FROM activity_logs a
      LEFT JOIN patients p ON a.patient_id = p.id
      ORDER BY a.created_at DESC, a.id DESC
      LIMIT ?
    `).all(limit);

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Retrieve system settings and status
 * GET /api/settings
 */
function getSettings(req, res, next) {
  try {
    const aiStatus = getAIServiceStatus();

    const stats = {
      patientsCount: db.prepare('SELECT COUNT(*) as count FROM patients').get().count,
      draftsCount: db.prepare('SELECT COUNT(*) as count FROM message_drafts').get().count,
      logsCount: db.prepare('SELECT COUNT(*) as count FROM activity_logs').get().count
    };

    res.status(200).json({
      success: true,
      data: {
        clinic: {
          name: 'EPIA Healthcare & Wellness Clinic',
          email: 'care@epia-health.org',
          phone: '+1 (555) 019-EPIA',
          address: '42 Medical Arts Boulevard, Suite 300',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local',
          localDate: getTodayDateString()
        },
        ai: aiStatus,
        database: {
          engine: 'SQLite3 (better-sqlite3)',
          mode: 'WAL (Write-Ahead Logging)',
          stats
        },
        humanInTheLoopPolicy: {
          automatedMessagingEnabled: false,
          approvalAction: 'Updates database approval_status only. No external WhatsApp messages are dispatched.',
          supervisionModel: 'Mandatory Human-in-the-Loop Staff Review'
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDashboardStats,
  getActivityLogs,
  getSettings
};

