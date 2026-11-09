const { isValidDateString } = require('../utils/dateUtils');

/**
 * Middleware to validate Patient creation and update requests
 */
function validatePatient(req, res, next) {
  const { name, phone, consultation_date, next_follow_up_date } = req.body;
  const errors = [];

  // 1. Patient Name Validation
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push('Patient name is required.');
  } else if (name.trim().length < 2) {
    errors.push('Patient name must be at least 2 characters long.');
  } else if (name.trim().length > 100) {
    errors.push('Patient name cannot exceed 100 characters.');
  } else if (!/^[a-zA-Z\s\.\-']+$/.test(name.trim())) {
    errors.push('Patient name can only contain letters, spaces, hyphens, apostrophes, and periods.');
  }

  // 2. Phone Number Validation
  if (!phone || typeof phone !== 'string' || phone.trim().length === 0) {
    errors.push('Phone number is required.');
  } else {
    const trimmedPhone = phone.trim();
    // Allow international + formats, digits, spaces, parentheses, hyphens (7 to 20 chars)
    const phoneRegex = /^\+?[0-9\s\-()]{7,20}$/;
    const digitsOnly = trimmedPhone.replace(/\D/g, '');
    if (!phoneRegex.test(trimmedPhone) || digitsOnly.length < 7 || digitsOnly.length > 15) {
      errors.push('Please provide a valid phone number (e.g., +91 98765 43210 or 555-0199).');
    }
  }

  // 3. Consultation Date Validation
  if (!consultation_date) {
    errors.push('Consultation date is required.');
  } else if (!isValidDateString(consultation_date)) {
    errors.push('Consultation date must be a valid date in YYYY-MM-DD format.');
  }

  // 4. Next Follow-Up Date Validation
  if (!next_follow_up_date) {
    errors.push('Next follow-up date is required.');
  } else if (!isValidDateString(next_follow_up_date)) {
    errors.push('Next follow-up date must be a valid date in YYYY-MM-DD format.');
  }

  // 5. Follow-up Date cannot be earlier than Consultation Date
  if (consultation_date && next_follow_up_date && isValidDateString(consultation_date) && isValidDateString(next_follow_up_date)) {
    if (next_follow_up_date < consultation_date) {
      errors.push('Next follow-up date cannot be earlier than the consultation date.');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: errors[0],
      details: errors
    });
  }

  // Trim sanitized fields
  req.body.name = name.trim();
  req.body.phone = phone.trim();
  req.body.consultation_date = consultation_date.trim();
  req.body.next_follow_up_date = next_follow_up_date.trim();

  next();
}

module.exports = {
  validatePatient
};

