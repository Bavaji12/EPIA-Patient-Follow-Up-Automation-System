/**
 * Mock AI Follow-Up Message Generation Service
 * Provides realistic, polite WhatsApp follow-up message drafts when Gemini API key is absent or offline.
 */

const TEMPLATES = [
  (name) => `Hello ${name}, this is a friendly reminder from our care team regarding your scheduled follow-up today. We hope you are doing well. Please reply to this message or call our clinic if you have any questions or need to adjust your time. Have a wonderful day!`,
  (name) => `Hi ${name}, warm greetings from our healthcare clinic! This is a gentle reminder of your follow-up appointment scheduled for today. If you need any assistance or directions before your visit, our team is readily available to help. Take care!`,
  (name) => `Dear ${name}, our clinical care team is reaching out to remind you of your follow-up scheduled for today. Your wellness is our highest priority. Please contact our reception desk if you need to reschedule or require any support. Looking forward to seeing you!`,
  (name) => `Hello ${name}, this is a courtesy check-in from our medical team about your follow-up appointment today. Please let us know if you need any assistance prior to your visit. Thank you for partnering with us in your care!`
];

/**
 * Generate a personalized WhatsApp follow-up draft using mock AI templates
 * @param {Object} patient - Patient object { name, next_follow_up_date }
 * @returns {Promise<{ message: string, ai_provider: string }>}
 */
async function generateMockFollowUpMessage(patient) {
  // Simulate minimal asynchronous AI inference latency (e.g. 150-300ms)
  await new Promise(resolve => setTimeout(resolve, 200));

  const firstName = patient.name ? patient.name.trim().split(' ')[0] : 'Patient';
  // Select a template deterministically or pseudo-randomly based on patient name length
  const templateIdx = (firstName.length + (patient.id || 0)) % TEMPLATES.length;
  const message = TEMPLATES[templateIdx](firstName);

  return {
    message,
    ai_provider: 'mock-ai'
  };
}

module.exports = {
  generateMockFollowUpMessage
};

