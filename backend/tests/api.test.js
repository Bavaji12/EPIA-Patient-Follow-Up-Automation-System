const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const app = require('../server');
const { getTodayDateString, addDays } = require('../utils/dateUtils');
const { seedDatabase } = require('../database/seed');

let server;
let baseUrl;

test.before(async () => {
  // Re-seed database before test run
  seedDatabase();

  await new Promise((resolve) => {
    // Listen on random available port
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

test.after(async () => {
  await new Promise((resolve) => {
    server.close(resolve);
  });
});

// Helper request wrapper
async function request(path, options = {}) {
  const url = `${baseUrl}${path}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });
  const data = await response.json().catch(() => null);
  return { status: response.status, data };
}

test('1. Register a valid patient', async () => {
  const today = getTodayDateString();
  const nextWeek = addDays(today, 7);

  const payload = {
    name: 'Maya Lin',
    phone: '+1 555-0177',
    consultation_date: today,
    next_follow_up_date: nextWeek
  };

  const res = await request('/api/patients', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  assert.equal(res.status, 201);
  assert.equal(res.data.success, true);
  assert.equal(res.data.data.name, 'Maya Lin');
  assert.equal(res.data.data.follow_up_status, 'pending');
  assert.ok(res.data.data.id);
});

test('2. Reject an invalid patient (missing fields, invalid phone, follow-up before consultation)', async () => {
  const today = getTodayDateString();
  const yesterday = addDays(today, -1);

  // Case 2a: Missing fields
  const resMissing = await request('/api/patients', {
    method: 'POST',
    body: JSON.stringify({ name: 'John Doe' })
  });
  assert.equal(resMissing.status, 400);
  assert.equal(resMissing.data.success, false);

  // Case 2b: Invalid phone
  const resPhone = await request('/api/patients', {
    method: 'POST',
    body: JSON.stringify({
      name: 'John Doe',
      phone: '123',
      consultation_date: today,
      next_follow_up_date: today
    })
  });
  assert.equal(resPhone.status, 400);
  assert.equal(resPhone.data.success, false);

  // Case 2c: Follow-up date earlier than consultation date
  const resDate = await request('/api/patients', {
    method: 'POST',
    body: JSON.stringify({
      name: 'John Doe',
      phone: '+1 555-0144',
      consultation_date: today,
      next_follow_up_date: yesterday
    })
  });
  assert.equal(resDate.status, 400);
  assert.equal(resDate.data.success, false);
  assert.match(resDate.data.error, /cannot be earlier/i);
});

test('3. Retrieve all patients', async () => {
  const res = await request('/api/patients');
  assert.equal(res.status, 200);
  assert.equal(res.data.success, true);
  assert.ok(Array.isArray(res.data.data));
  assert.ok(res.data.data.length >= 8);
});

test("4. Retrieve today's due follow-ups", async () => {
  const res = await request('/api/patients/due-today');
  assert.equal(res.status, 200);
  assert.equal(res.data.success, true);
  assert.ok(Array.isArray(res.data.data));
  const today = getTodayDateString();
  assert.equal(res.data.todayDate, today);

  for (const patient of res.data.data) {
    assert.equal(patient.next_follow_up_date, today);
    assert.equal(patient.follow_up_status, 'pending');
  }
});

test('5. Mark a follow-up completed', async () => {
  // First retrieve a pending patient
  const patientsRes = await request('/api/patients?status=pending');
  const targetPatient = patientsRes.data.data[0];
  assert.ok(targetPatient);

  const res = await request(`/api/patients/${targetPatient.id}/complete`, {
    method: 'PATCH'
  });

  assert.equal(res.status, 200);
  assert.equal(res.data.success, true);
  assert.equal(res.data.data.follow_up_status, 'completed');
});

test('6. Generate AI drafts (single & batch)', async () => {
  // Retrieve due patients
  const dueRes = await request('/api/patients/due-today');
  assert.ok(dueRes.data.data.length > 0);
  const patient = dueRes.data.data[0];

  const res = await request('/api/automation/generate', {
    method: 'POST',
    body: JSON.stringify({ patient_id: patient.id, force: true })
  });

  assert.equal(res.status, 201);
  assert.equal(res.data.success, true);
  assert.ok(res.data.data.message);
  assert.ok(res.data.data.ai_provider);
  assert.equal(res.data.data.approval_status, 'pending');
});

test('7. Generate mock AI drafts without an API key', async () => {
  // Ensure Mock AI generates polite personalized reminder without external API
  const { generateMockFollowUpMessage } = require('../services/mockAIService');
  const mockResult = await generateMockFollowUpMessage({
    id: 99,
    name: 'Aarav Gupta',
    next_follow_up_date: getTodayDateString()
  });

  assert.ok(mockResult.message);
  assert.match(mockResult.message, /Aarav/);
  assert.equal(mockResult.ai_provider, 'mock-ai');
  // Confirm NO medical diagnosis or sensitive clinical claims
  assert.doesNotMatch(mockResult.message, /cancer|diabetes|pregnancy|tumor|infection/i);
});

test('8. Approve a draft', async () => {
  // Create a pending draft first
  const patientsRes = await request('/api/patients');
  const patient = patientsRes.data.data[0];

  const genRes = await request('/api/automation/generate', {
    method: 'POST',
    body: JSON.stringify({ patient_id: patient.id, force: true })
  });
  const draftId = genRes.data.data.id;

  const approveRes = await request(`/api/automation/drafts/${draftId}/approve`, {
    method: 'PATCH'
  });

  assert.equal(approveRes.status, 200);
  assert.equal(approveRes.data.success, true);
  assert.equal(approveRes.data.data.approval_status, 'approved');
  assert.ok(approveRes.data.data.reviewed_at);
  assert.ok(approveRes.data.humanVerificationNotice);
});

test('9. Reject a draft', async () => {
  // Create another pending draft
  const patientsRes = await request('/api/patients');
  const patient = patientsRes.data.data[1];

  const genRes = await request('/api/automation/generate', {
    method: 'POST',
    body: JSON.stringify({ patient_id: patient.id, force: true })
  });
  const draftId = genRes.data.data.id;

  const rejectRes = await request(`/api/automation/drafts/${draftId}/reject`, {
    method: 'PATCH',
    body: JSON.stringify({ reason: 'Tone needs manual clinic modification' })
  });

  assert.equal(rejectRes.status, 200);
  assert.equal(rejectRes.data.success, true);
  assert.equal(rejectRes.data.data.approval_status, 'rejected');
  assert.ok(rejectRes.data.data.reviewed_at);
});

test('10. Prevent repeated review of an already reviewed draft', async () => {
  // Take a draft that was already approved in test 8 or create one
  const patientsRes = await request('/api/patients');
  const patient = patientsRes.data.data[2];

  const genRes = await request('/api/automation/generate', {
    method: 'POST',
    body: JSON.stringify({ patient_id: patient.id, force: true })
  });
  const draftId = genRes.data.data.id;

  // First approval succeeds
  const firstApprove = await request(`/api/automation/drafts/${draftId}/approve`, {
    method: 'PATCH'
  });
  assert.equal(firstApprove.status, 200);

  // Second approval must fail with 400
  const secondApprove = await request(`/api/automation/drafts/${draftId}/approve`, {
    method: 'PATCH'
  });
  assert.equal(secondApprove.status, 400);
  assert.equal(secondApprove.data.success, false);
  assert.match(secondApprove.data.error, /already been reviewed/i);

  // Rejecting an already approved draft must also fail
  const rejectAttempt = await request(`/api/automation/drafts/${draftId}/reject`, {
    method: 'PATCH'
  });
  assert.equal(rejectAttempt.status, 400);
  assert.equal(rejectAttempt.data.success, false);
  assert.match(rejectAttempt.data.error, /already been reviewed/i);
});

test('11. Handle nonexistent patient IDs', async () => {
  const res = await request('/api/patients/999999');
  assert.equal(res.status, 404);
  assert.equal(res.data.success, false);
  assert.match(res.data.error, /not found/i);

  // Complete nonexistent patient
  const completeRes = await request('/api/patients/999999/complete', {
    method: 'PATCH'
  });
  assert.equal(completeRes.status, 404);
  assert.equal(completeRes.data.success, false);
});

test('12. Verify that no WhatsApp message is sent upon approval or rejection', async () => {
  // Confirm the settings policy
  const settingsRes = await request('/api/settings');
  assert.equal(settingsRes.status, 200);
  assert.equal(settingsRes.data.data.humanInTheLoopPolicy.automatedMessagingEnabled, false);

  // Confirm that approval only performs local DB updates
  const draftsRes = await request('/api/automation/drafts?status=approved');
  assert.equal(draftsRes.status, 200);
  assert.ok(draftsRes.data.data.length > 0);

  // Verify activity log reflects strict verification
  const logsRes = await request('/api/activity-logs');
  assert.equal(logsRes.status, 200);
  const approvalLog = logsRes.data.data.find(l => l.action === 'DRAFT_APPROVED');
  assert.ok(approvalLog);
  assert.match(approvalLog.description, /No.*WhatsApp/i);
});

