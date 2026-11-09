const { db, logActivity } = require('../config/database');
const { getTodayDateString } = require('../utils/dateUtils');

/**
 * Register a new patient
 * POST /api/patients
 */
function registerPatient(req, res, next) {
  try {
    const { name, phone, consultation_date, next_follow_up_date } = req.body;

    const stmt = db.prepare(`
      INSERT INTO patients (name, phone, consultation_date, next_follow_up_date, follow_up_status, created_at, updated_at)
      VALUES (?, ?, ?, ?, 'pending', datetime('now', 'localtime'), datetime('now', 'localtime'))
    `);

    const result = stmt.run(name, phone, consultation_date, next_follow_up_date);
    const newPatientId = result.lastInsertRowid;

    logActivity(
      newPatientId,
      'PATIENT_REGISTERED',
      `Patient "${name}" registered with next follow-up on ${next_follow_up_date}`
    );

    const newPatient = db.prepare('SELECT * FROM patients WHERE id = ?').get(newPatientId);

    res.status(201).json({
      success: true,
      message: 'Patient registered successfully.',
      data: newPatient
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Retrieve all patients with optional search and filters
 * GET /api/patients
 */
function getAllPatients(req, res, next) {
  try {
    const { search, status, dateFilter } = req.query;
    const today = getTodayDateString();

    let query = 'SELECT * FROM patients WHERE 1=1';
    const params = [];

    // Search filter: name or phone
    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      query += ' AND (name LIKE ? OR phone LIKE ?)';
      params.push(term, term);
    }

    // Status filter: pending / completed
    if (status && status !== 'all') {
      query += ' AND follow_up_status = ?';
      params.push(status);
    }

    // Date filter: today / upcoming / past / specific YYYY-MM-DD
    if (dateFilter) {
      if (dateFilter === 'today') {
        query += ' AND next_follow_up_date = ?';
        params.push(today);
      } else if (dateFilter === 'upcoming') {
        query += ' AND next_follow_up_date > ?';
        params.push(today);
      } else if (dateFilter === 'past') {
        query += ' AND next_follow_up_date < ?';
        params.push(today);
      } else if (/^\d{4}-\d{2}-\d{2}$/.test(dateFilter)) {
        query += ' AND next_follow_up_date = ?';
        params.push(dateFilter);
      }
    }

    query += ' ORDER BY next_follow_up_date ASC, id DESC';

    const patients = db.prepare(query).all(...params);

    res.status(200).json({
      success: true,
      count: patients.length,
      data: patients
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Retrieve patients whose follow-up is due today and status is pending
 * GET /api/patients/due-today
 */
function getDueTodayPatients(req, res, next) {
  try {
    const today = getTodayDateString();

    const stmt = db.prepare(`
      SELECT p.*,
        (SELECT COUNT(*) FROM message_drafts WHERE patient_id = p.id AND approval_status = 'pending') as pending_drafts_count,
        (SELECT COUNT(*) FROM message_drafts WHERE patient_id = p.id) as total_drafts_count
      FROM patients p
      WHERE p.next_follow_up_date = ? AND p.follow_up_status = 'pending'
      ORDER BY p.name ASC
    `);

    const duePatients = stmt.all(today);

    res.status(200).json({
      success: true,
      todayDate: today,
      count: duePatients.length,
      data: duePatients
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Retrieve an individual patient by ID
 * GET /api/patients/:id
 */
function getPatientById(req, res, next) {
  try {
    const patientId = Number(req.params.id);
    if (isNaN(patientId) || patientId <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid patient ID supplied.'
      });
    }

    const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(patientId);

    if (!patient) {
      return res.status(404).json({
        success: false,
        error: `Patient with ID ${patientId} not found.`
      });
    }

    // Attach drafts and activity logs for this patient
    const drafts = db.prepare(`
      SELECT * FROM message_drafts WHERE patient_id = ? ORDER BY created_at DESC
    `).all(patientId);

    const logs = db.prepare(`
      SELECT * FROM activity_logs WHERE patient_id = ? ORDER BY created_at DESC
    `).all(patientId);

    res.status(200).json({
      success: true,
      data: {
        ...patient,
        drafts,
        activity_logs: logs
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update patient information
 * PUT /api/patients/:id
 */
function updatePatient(req, res, next) {
  try {
    const patientId = Number(req.params.id);
    if (isNaN(patientId) || patientId <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid patient ID supplied.'
      });
    }

    const existing = db.prepare('SELECT * FROM patients WHERE id = ?').get(patientId);
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: `Patient with ID ${patientId} not found.`
      });
    }

    const { name, phone, consultation_date, next_follow_up_date } = req.body;

    const stmt = db.prepare(`
      UPDATE patients
      SET name = ?, phone = ?, consultation_date = ?, next_follow_up_date = ?, updated_at = datetime('now', 'localtime')
      WHERE id = ?
    `);

    stmt.run(name, phone, consultation_date, next_follow_up_date, patientId);

    logActivity(
      patientId,
      'PATIENT_UPDATED',
      `Patient details updated: ${name}, next follow-up: ${next_follow_up_date}`
    );

    const updated = db.prepare('SELECT * FROM patients WHERE id = ?').get(patientId);

    res.status(200).json({
      success: true,
      message: 'Patient updated successfully.',
      data: updated
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Mark a patient's follow-up as completed
 * PATCH /api/patients/:id/complete
 */
function markFollowUpCompleted(req, res, next) {
  try {
    const patientId = Number(req.params.id);
    if (isNaN(patientId) || patientId <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid patient ID supplied.'
      });
    }

    const existing = db.prepare('SELECT * FROM patients WHERE id = ?').get(patientId);
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: `Patient with ID ${patientId} not found.`
      });
    }

    const stmt = db.prepare(`
      UPDATE patients
      SET follow_up_status = 'completed', updated_at = datetime('now', 'localtime')
      WHERE id = ?
    `);

    stmt.run(patientId);

    logActivity(
      patientId,
      'FOLLOW_UP_COMPLETED',
      `Follow-up marked as completed for patient "${existing.name}"`
    );

    const updated = db.prepare('SELECT * FROM patients WHERE id = ?').get(patientId);

    res.status(200).json({
      success: true,
      message: `Follow-up for ${existing.name} has been marked as completed.`,
      data: updated
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  registerPatient,
  getAllPatients,
  getDueTodayPatients,
  getPatientById,
  updatePatient,
  markFollowUpCompleted
};

