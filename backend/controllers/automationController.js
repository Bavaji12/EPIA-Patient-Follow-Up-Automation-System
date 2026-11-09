const { db, logActivity } = require('../config/database');
const { generateFollowUpDraft } = require('../services/geminiService');
const { getTodayDateString, maskPhoneNumber } = require('../utils/dateUtils');

/**
 * Generate AI Follow-Up Message Drafts
 * POST /api/automation/generate
 * Body: { patient_id?: number, force?: boolean }
 */
async function generateDrafts(req, res, next) {
  try {
    const { patient_id, force } = req.body;
    const today = getTodayDateString();

    // Case 1: Generate for a single specific patient
    if (patient_id) {
      const patientId = Number(patient_id);
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

      // Check for existing pending draft to avoid duplicate generation unless forced
      if (!force) {
        const existingDraft = db.prepare(`
          SELECT * FROM message_drafts
          WHERE patient_id = ? AND approval_status = 'pending'
        `).get(patientId);

        if (existingDraft) {
          return res.status(409).json({
            success: false,
            error: `A pending message draft already exists for ${patient.name}. Review the existing draft before generating a new one.`,
            existingDraft
          });
        }
      }

      const aiResult = await generateFollowUpDraft(patient);

      const stmt = db.prepare(`
        INSERT INTO message_drafts (patient_id, message, ai_provider, approval_status, created_at)
        VALUES (?, ?, ?, 'pending', datetime('now', 'localtime'))
      `);

      const result = stmt.run(patientId, aiResult.message, aiResult.ai_provider);
      const newDraftId = result.lastInsertRowid;

      logActivity(
        patientId,
        'DRAFT_GENERATED',
        `AI follow-up draft generated for "${patient.name}" using ${aiResult.ai_provider}`
      );

      const createdDraft = db.prepare(`
        SELECT d.*, p.name as patient_name, p.phone as patient_phone, p.next_follow_up_date
        FROM message_drafts d
        JOIN patients p ON d.patient_id = p.id
        WHERE d.id = ?
      `).get(newDraftId);

      return res.status(201).json({
        success: true,
        message: 'AI message draft generated successfully.',
        data: {
          ...createdDraft,
          masked_phone: maskPhoneNumber(createdDraft.patient_phone)
        }
      });
    }

    // Case 2: Batch generation for all patients due today with pending status
    const duePatients = db.prepare(`
      SELECT * FROM patients
      WHERE next_follow_up_date = ? AND follow_up_status = 'pending'
    `).all(today);

    if (duePatients.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No pending patients are scheduled for follow-up today.',
        count: 0,
        data: []
      });
    }

    const generatedDrafts = [];
    let skippedCount = 0;

    for (const patient of duePatients) {
      // Check if pending draft already exists
      const existingPending = db.prepare(`
        SELECT id FROM message_drafts
        WHERE patient_id = ? AND approval_status = 'pending'
      `).get(patient.id);

      if (existingPending && !force) {
        skippedCount++;
        continue;
      }

      const aiResult = await generateFollowUpDraft(patient);

      const stmt = db.prepare(`
        INSERT INTO message_drafts (patient_id, message, ai_provider, approval_status, created_at)
        VALUES (?, ?, ?, 'pending', datetime('now', 'localtime'))
      `);

      const resInsert = stmt.run(patient.id, aiResult.message, aiResult.ai_provider);
      const draftId = resInsert.lastInsertRowid;

      logActivity(
        patient.id,
        'DRAFT_GENERATED',
        `AI follow-up draft generated for "${patient.name}" (${aiResult.ai_provider})`
      );

      const draftRecord = db.prepare(`
        SELECT d.*, p.name as patient_name, p.phone as patient_phone, p.next_follow_up_date
        FROM message_drafts d
        JOIN patients p ON d.patient_id = p.id
        WHERE d.id = ?
      `).get(draftId);

      generatedDrafts.push({
        ...draftRecord,
        masked_phone: maskPhoneNumber(draftRecord.patient_phone)
      });
    }

    return res.status(201).json({
      success: true,
      message: `Batch generation complete. ${generatedDrafts.length} drafts created, ${skippedCount} skipped (already pending).`,
      count: generatedDrafts.length,
      skipped: skippedCount,
      data: generatedDrafts
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Retrieve all message drafts
 * GET /api/automation/drafts
 */
function getAllDrafts(req, res, next) {
  try {
    const { status, patient_id } = req.query;

    let query = `
      SELECT d.*, p.name as patient_name, p.phone as patient_phone, p.next_follow_up_date, p.follow_up_status
      FROM message_drafts d
      JOIN patients p ON d.patient_id = p.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'all') {
      query += ' AND d.approval_status = ?';
      params.push(status);
    }

    if (patient_id) {
      query += ' AND d.patient_id = ?';
      params.push(Number(patient_id));
    }

    query += ' ORDER BY d.created_at DESC';

    const drafts = db.prepare(query).all(...params);

    const formatted = drafts.map(d => ({
      ...d,
      masked_phone: maskPhoneNumber(d.patient_phone)
    }));

    res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Retrieve an individual draft
 * GET /api/automation/drafts/:id
 */
function getDraftById(req, res, next) {
  try {
    const draftId = Number(req.params.id);
    if (isNaN(draftId) || draftId <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid draft ID supplied.'
      });
    }

    const draft = db.prepare(`
      SELECT d.*, p.name as patient_name, p.phone as patient_phone, p.next_follow_up_date
      FROM message_drafts d
      JOIN patients p ON d.patient_id = p.id
      WHERE d.id = ?
    `).get(draftId);

    if (!draft) {
      return res.status(404).json({
        success: false,
        error: `Draft with ID ${draftId} not found.`
      });
    }

    res.status(200).json({
      success: true,
      data: {
        ...draft,
        masked_phone: maskPhoneNumber(draft.patient_phone)
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Edit a draft message
 * PATCH /api/automation/drafts/:id
 * Body: { message: string }
 */
function editDraft(req, res, next) {
  try {
    const draftId = Number(req.params.id);
    const { message } = req.body;

    if (isNaN(draftId) || draftId <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid draft ID supplied.'
      });
    }

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Message content cannot be empty.'
      });
    }

    const draft = db.prepare('SELECT * FROM message_drafts WHERE id = ?').get(draftId);
    if (!draft) {
      return res.status(404).json({
        success: false,
        error: `Draft with ID ${draftId} not found.`
      });
    }

    const stmt = db.prepare(`
      UPDATE message_drafts
      SET message = ?
      WHERE id = ?
    `);

    stmt.run(message.trim(), draftId);

    logActivity(
      draft.patient_id,
      'DRAFT_EDITED',
      `Staff edited message draft #${draftId}`
    );

    const updatedDraft = db.prepare(`
      SELECT d.*, p.name as patient_name, p.phone as patient_phone, p.next_follow_up_date
      FROM message_drafts d
      JOIN patients p ON d.patient_id = p.id
      WHERE d.id = ?
    `).get(draftId);

    res.status(200).json({
      success: true,
      message: 'Draft message updated successfully.',
      data: {
        ...updatedDraft,
        masked_phone: maskPhoneNumber(updatedDraft.patient_phone)
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Approve a draft
 * PATCH /api/automation/drafts/:id/approve
 * STRICT: Human approval only updates approval_status to 'approved'. Never sends WhatsApp.
 */
function approveDraft(req, res, next) {
  try {
    const draftId = Number(req.params.id);
    if (isNaN(draftId) || draftId <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid draft ID supplied.'
      });
    }

    const draft = db.prepare('SELECT * FROM message_drafts WHERE id = ?').get(draftId);
    if (!draft) {
      return res.status(404).json({
        success: false,
        error: `Draft with ID ${draftId} not found.`
      });
    }

    // Prevent repeated review of already reviewed drafts
    if (draft.approval_status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: `Draft #${draftId} has already been reviewed (current status: ${draft.approval_status}). Cannot re-approve.`
      });
    }

    const stmt = db.prepare(`
      UPDATE message_drafts
      SET approval_status = 'approved', reviewed_at = datetime('now', 'localtime')
      WHERE id = ?
    `);

    stmt.run(draftId);

    // Explicit human-in-the-loop guarantee log
    logActivity(
      draft.patient_id,
      'DRAFT_APPROVED',
      `Draft #${draftId} approved by clinic staff. (Verification: No automated WhatsApp message dispatched)`
    );

    const updated = db.prepare(`
      SELECT d.*, p.name as patient_name, p.phone as patient_phone, p.next_follow_up_date
      FROM message_drafts d
      JOIN patients p ON d.patient_id = p.id
      WHERE d.id = ?
    `).get(draftId);

    res.status(200).json({
      success: true,
      message: 'Draft approved successfully.',
      humanVerificationNotice: 'Status updated to approved. In strict compliance with guidelines, no WhatsApp message was sent.',
      data: {
        ...updated,
        masked_phone: maskPhoneNumber(updated.patient_phone)
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Reject a draft
 * PATCH /api/automation/drafts/:id/reject
 * Body: { reason?: string }
 */
function rejectDraft(req, res, next) {
  try {
    const draftId = Number(req.params.id);
    const { reason } = req.body || {};

    if (isNaN(draftId) || draftId <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid draft ID supplied.'
      });
    }

    const draft = db.prepare('SELECT * FROM message_drafts WHERE id = ?').get(draftId);
    if (!draft) {
      return res.status(404).json({
        success: false,
        error: `Draft with ID ${draftId} not found.`
      });
    }

    // Prevent repeated review
    if (draft.approval_status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: `Draft #${draftId} has already been reviewed (current status: ${draft.approval_status}). Cannot re-reject.`
      });
    }

    const stmt = db.prepare(`
      UPDATE message_drafts
      SET approval_status = 'rejected', reviewed_at = datetime('now', 'localtime')
      WHERE id = ?
    `);

    stmt.run(draftId);

    const reasonText = reason ? `: "${reason}"` : '';
    logActivity(
      draft.patient_id,
      'DRAFT_REJECTED',
      `Draft #${draftId} rejected by staff${reasonText}. (No message sent)`
    );

    const updated = db.prepare(`
      SELECT d.*, p.name as patient_name, p.phone as patient_phone, p.next_follow_up_date
      FROM message_drafts d
      JOIN patients p ON d.patient_id = p.id
      WHERE d.id = ?
    `).get(draftId);

    res.status(200).json({
      success: true,
      message: 'Draft rejected successfully.',
      humanVerificationNotice: 'Status updated to rejected. No message was sent.',
      data: {
        ...updated,
        masked_phone: maskPhoneNumber(updated.patient_phone)
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  generateDrafts,
  getAllDrafts,
  getDraftById,
  editDraft,
  approveDraft,
  rejectDraft
};

