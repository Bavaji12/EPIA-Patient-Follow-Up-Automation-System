const { GoogleGenerativeAI } = require('@google/generative-ai');
const { generateMockFollowUpMessage } = require('./mockAIService');

/**
 * Check whether Gemini API key is configured
 * @returns {boolean}
 */
function isGeminiConfigured() {
  const apiKey = process.env.GEMINI_API_KEY;
  return Boolean(apiKey && apiKey.trim().length > 10 && !apiKey.includes('your_gemini_api_key'));
}

/**
 * Returns current AI service status
 */
function getAIServiceStatus() {
  const configured = isGeminiConfigured();
  return {
    geminiConfigured: configured,
    activeProvider: configured ? 'Google Gemini (gemini-1.5-flash)' : 'Mock AI Engine (Offline Safe)',
    model: configured ? 'gemini-1.5-flash' : 'mock-templates-v1',
    description: configured
      ? 'Live Google Gemini API is active and generating personalized drafts.'
      : 'Using built-in Mock AI Fallback. Add GEMINI_API_KEY in .env to enable live Gemini generation.'
  };
}

/**
 * Generate a follow-up WhatsApp draft for a patient
 * @param {Object} patient - { id, name, consultation_date, next_follow_up_date }
 * @returns {Promise<{ message: string, ai_provider: string }>}
 */
async function generateFollowUpDraft(patient) {
  if (!isGeminiConfigured()) {
    return await generateMockFollowUpMessage(patient);
  }

  const apiKey = process.env.GEMINI_API_KEY.trim();
  const firstName = patient.name ? patient.name.trim().split(' ')[0] : 'Patient';

  const systemInstruction = `
You are an expert, empathetic healthcare communications assistant for a medical clinic.
Generate a polite, concise, professional WhatsApp follow-up reminder message for a patient.

RULES & PRIVACY CONSTRAINTS:
1. Greet the patient by their first name only (${firstName}).
2. Remind them gently about their scheduled follow-up consultation today (${patient.next_follow_up_date}).
3. Ask how they are doing and invite them to reply or contact the clinic if they need any assistance, directions, or appointment rescheduling.
4. STRICT COMPLIANCE: Do NOT mention any medical diagnosis, symptoms, medications, test results, treatments, or sensitive medical topics.
5. Keep the tone warm, welcoming, and reassuring.
6. WhatsApp-ready: 2 to 3 sentences maximum. Keep it concise.
7. Return ONLY the plain text of the WhatsApp message. Do not include markdown formatting, quotes, or conversational preamble.
`.trim();

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 150
      }
    });

    // Timeout promise to guard against slow network calls
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Gemini API call timed out after 8 seconds')), 8000)
    );

    const apiPromise = model.generateContent(systemInstruction);
    const result = await Promise.race([apiPromise, timeoutPromise]);
    const response = await result.response;
    const text = response.text()?.trim();

    if (text && text.length > 10) {
      // Strip any extra leading/trailing quotes if Gemini wrapped the message in quotes
      const cleanedMessage = text.replace(/^["']|["']$/g, '').trim();
      return {
        message: cleanedMessage,
        ai_provider: 'gemini-1.5-flash'
      };
    }

    throw new Error('Empty response received from Gemini API');
  } catch (error) {
    console.warn(`[Gemini Service Warning] Falling back to Mock AI: ${error.message}`);
    const fallback = await generateMockFollowUpMessage(patient);
    return {
      message: fallback.message,
      ai_provider: 'mock-ai (fallback)'
    };
  }
}

module.exports = {
  isGeminiConfigured,
  getAIServiceStatus,
  generateFollowUpDraft
};

