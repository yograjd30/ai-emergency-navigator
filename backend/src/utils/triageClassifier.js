/**
 * Two-tier triage classifier: keyword-match first, then AI for ambiguous cases.
 */

const KEYWORD_MAP = {
  police: ['theft', 'robbery', 'assault', 'attack', 'murder', 'kidnap', 'stolen', 'fir', 'crime', 'burglary', 'snatch', 'loot', 'threat', 'extortion'],
  fire: ['fire', 'burning', 'blaze', 'smoke', 'explosion', 'gas leak', 'flames', 'inferno'],
  ambulance: ['accident', 'bleeding', 'heart attack', 'stroke', 'unconscious', 'injury', 'breathing', 'chest pain', 'poison', 'fracture', 'burn', 'choking', 'seizure', 'faint'],
  women: ['harassment', 'stalking', 'dowry', 'molestation', 'eve teasing', 'abuse against women', 'sexual harassment', 'workplace harassment'],
  child: ['child abuse', 'child labour', 'child missing', 'minor', 'pocso', 'child trafficking', 'child marriage'],
  cybercrime: ['hacked', 'phishing', 'online fraud', 'scam', 'upi fraud', 'identity theft', 'ransomware', 'cyber', 'otp fraud', 'online scam', 'bank fraud', 'credit card fraud', 'crypto scam', 'sextortion'],
  disaster: ['flood', 'earthquake', 'cyclone', 'tsunami', 'landslide', 'storm', 'evacuation', 'tornado', 'drought', 'hailstorm'],
  mental_health: ['suicide', 'depression', 'anxiety', 'panic attack', 'self harm', 'mental', 'helpless', 'hopeless', 'suicidal', 'cutting', 'overdose', 'want to die', 'end my life'],
  missing_person: ['missing', 'lost person', 'not come home', 'disappeared', 'can\'t find', 'kidnapped child', 'abducted'],
  domestic_violence: ['beaten', 'husband hitting', 'wife beating', 'domestic', 'violence at home', 'husband abusing', 'in-laws torturing', 'dowry harassment'],
  road_accident: ['road accident', 'car crash', 'hit and run', 'traffic accident', 'vehicle accident', 'bike accident', 'truck accident', 'collision'],
  senior: ['elderly', 'old age', 'senior citizen', 'abandoned parent', 'elder abuse', 'old person'],
  general: ['helpline', 'emergency', 'help', 'government', 'complaint', 'report'],
};

const SEVERITY_KEYWORDS = {
  critical: ['dying', 'unconscious', 'not breathing', 'heavy bleeding', 'suicide', 'heart attack', 'stroke', 'fire spreading', 'trapped', 'collapse', 'want to die', 'end my life', 'self harm', 'child in danger', 'drowning'],
  urgent: ['bleeding', 'attack', 'in danger', 'kidnapped', 'breathing difficulty', 'broken bone', 'severe pain', 'stalking right now', 'following me', 'being beaten'],
  standard: ['theft', 'fraud', 'complaint', 'report', 'missing document', 'scam', 'stolen phone', 'lost wallet'],
  info: ['how to', 'procedure', 'where is', 'number for', 'what to do', 'steps to', 'guide', 'process'],
};

/**
 * Perform keyword-based triage classification.
 * @param {string} message - User's emergency description
 * @returns {{ category: string, severity: string, confidence: number, suggestedActions: string[] }}
 */
export function keywordTriage(message) {
  const lower = message.toLowerCase();
  let bestCategory = 'general';
  let bestScore = 0;
  let severity = 'standard';

  // Find best matching category
  for (const [category, keywords] of Object.entries(KEYWORD_MAP)) {
    let score = 0;
    for (const keyword of keywords) {
      if (lower.includes(keyword)) {
        // Give higher weight to longer keywords
        score += keyword.length;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }

  // Determine severity
  for (const [level, keywords] of Object.entries(SEVERITY_KEYWORDS)) {
    if (keywords.some(k => lower.includes(k))) {
      severity = level;
      break; // Severity levels ordered by priority
    }
  }

  // Generate basic suggested actions based on category
  const suggestedActions = getDefaultActions(bestCategory, severity);

  return {
    category: bestCategory,
    severity,
    confidence: bestScore >= 10 ? 0.9 : bestScore >= 5 ? 0.7 : bestScore >= 1 ? 0.5 : 0.3,
    suggestedActions,
  };
}

/**
 * Get default suggested actions based on category and severity.
 */
function getDefaultActions(category, severity) {
  const actions = {
    police: [
      'Move to a safe location if possible',
      'Do not confront the perpetrator',
      'Preserve any evidence — take photos if safe to do so',
    ],
    fire: [
      'Evacuate the area immediately',
      'Do not use elevators',
      'Cover your nose and mouth with a wet cloth',
    ],
    ambulance: [
      'Keep the patient calm and still',
      'Do not move the patient unless they are in immediate danger',
      'Note the time when symptoms started',
    ],
    women: [
      'Move to a safe location immediately',
      'Contact a trusted person nearby',
      'Preserve any evidence — save messages, take screenshots',
    ],
    child: [
      'Ensure the child is in a safe environment',
      'Do not alert the suspected abuser',
      'Document any visible signs of harm',
    ],
    cybercrime: [
      'Do not share any more OTPs or personal details',
      'Take screenshots of all suspicious messages and transactions',
      'Block the suspicious number or email immediately',
    ],
    disaster: [
      'Move to higher ground if flooding',
      'Stay away from windows and exterior walls',
      'Keep emergency supplies ready',
    ],
    mental_health: [
      'You are not alone — help is available right now',
      'Stay in a safe place',
      'Reach out to someone you trust while we connect you to support',
    ],
    missing_person: [
      'Note the last known location and time',
      'Gather a recent photograph of the missing person',
      'Check with friends, relatives, and known places',
    ],
    domestic_violence: [
      'If you are in immediate danger, try to leave the premises',
      'Contact a trusted neighbor or friend',
      'Preserve evidence — photographs, medical records',
    ],
    road_accident: [
      'Do not move injured persons unless there is immediate danger',
      'Turn on hazard lights and set up warning signals',
      'Note the vehicle numbers involved',
    ],
    senior: [
      'Ensure the elderly person is safe and comfortable',
      'Note any medications they are currently taking',
      'Contact nearby family members if possible',
    ],
    general: [
      'Stay calm and assess your situation',
      'Note important details about your emergency',
      'Keep your phone charged and accessible',
    ],
  };

  if (severity === 'critical') {
    return ['If you are in immediate danger, call 112 right now', ...(actions[category] || actions.general)];
  }

  return actions[category] || actions.general;
}
