/**
 * Date and String formatting utility functions
 */

/**
 * Returns today's date formatted as YYYY-MM-DD in local time
 * @returns {string} YYYY-MM-DD
 */
function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Validates whether a string is a valid YYYY-MM-DD date
 * @param {string} dateStr
 * @returns {boolean}
 */
function isValidDateString(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return false;
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return false;
  
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

/**
 * Adds or subtracts days to a YYYY-MM-DD string
 * @param {string} dateStr 
 * @param {number} days 
 * @returns {string} YYYY-MM-DD
 */
function addDays(dateStr, days) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Masks phone number for privacy display (e.g., +91 98765 43210 -> +91 98765 •••••)
 * @param {string} phone 
 * @returns {string}
 */
function maskPhoneNumber(phone) {
  if (!phone) return '';
  const clean = String(phone).trim();
  if (clean.length <= 4) return '••••';
  const visiblePrefixLength = Math.max(2, Math.floor(clean.length / 2));
  const prefix = clean.substring(0, visiblePrefixLength);
  return `${prefix} •••••`;
}

module.exports = {
  getTodayDateString,
  isValidDateString,
  addDays,
  maskPhoneNumber
};

