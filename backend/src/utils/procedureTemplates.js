/**
 * Static procedure template helpers.
 * Provides fallback procedure text when AI is unavailable.
 */

const PROCEDURE_FALLBACKS = {
  police: {
    title: 'How to File an FIR',
    steps: [
      'Visit your nearest police station or use the online FIR portal.',
      'Provide your full name, address, and contact details.',
      'Describe the incident in detail — what happened, when, where, and who was involved.',
      'Provide any evidence you have — photos, receipts, messages.',
      'The officer will write the FIR and read it back to you. Verify all details.',
      'Sign the FIR and get your copy with the FIR number.',
      'Note the FIR number for future reference.',
    ],
  },
  cybercrime: {
    title: 'How to Report Cybercrime',
    steps: [
      'Visit cybercrime.gov.in — the official National Cyber Crime Reporting Portal.',
      'Click "File a Complaint" and select the appropriate category.',
      'Provide your personal details and describe the incident.',
      'Upload screenshots and evidence of the cybercrime.',
      'Submit the complaint and note your complaint number.',
      'You will receive updates via SMS and email.',
      'For financial fraud, also contact your bank immediately to freeze the account.',
    ],
  },
  women: {
    title: 'How to Report Harassment / Violence Against Women',
    steps: [
      'If in immediate danger, call 112 or 181 (Women Helpline).',
      'Move to a safe location.',
      'File a complaint at the nearest police station or Women\'s Cell.',
      'You can also file online at the National Commission for Women website.',
      'Provide details of the incident and any evidence.',
      'Request a female officer if you are more comfortable.',
      'Get a copy of your complaint for your records.',
    ],
  },
  general: {
    title: 'Emergency Assistance Steps',
    steps: [
      'Stay calm and assess your situation.',
      'If in immediate danger, call 112.',
      'Identify the type of emergency and contact the appropriate helpline.',
      'Follow the instructions given by the emergency operator.',
      'Keep important documents and phone numbers handy.',
    ],
  },
};

/**
 * Get a fallback procedure for a given category.
 * @param {string} category - Emergency category
 * @returns {object} Procedure template with title and steps
 */
export function getFallbackProcedure(category) {
  return PROCEDURE_FALLBACKS[category] || PROCEDURE_FALLBACKS.general;
}
