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

const LOCALIZED_ACTIONS = {
  hi: {
    police: [
      'यदि संभव हो तो सुरक्षित स्थान पर जाएं',
      'अपराधी का सामना न करें',
      'किसी भी सबूत को सुरक्षित रखें — यदि सुरक्षित हो तो तस्वीरें लें'
    ],
    fire: [
      'तुरंत क्षेत्र खाली करें',
      'लिफ्ट का उपयोग न करें',
      'अपने नाक और मुंह को गीले कपड़े से ढकें'
    ],
    ambulance: [
      'मरीज को शांत और स्थिर रखें',
      'मरीज को तब तक न हिलाएं जब तक कि वे तत्काल खतरे में न हों',
      'लक्षण शुरू होने का समय नोट करें'
    ],
    women: [
      'तुरंत सुरक्षित स्थान पर जाएं',
      'आसपास के किसी विश्वसनीय व्यक्ति से संपर्क करें',
      'किसी भी सबूत को सुरक्षित रखें — संदेश सहेजें, स्क्रीनशॉट लें'
    ],
    child: [
      'सुनिश्चित करें कि बच्चा सुरक्षित वातावरण में है',
      'संदिग्ध दुर्व्यवहारकर्ता को सचेत न करें',
      'नुकसान के किसी भी दृश्य लक्षण को दस्तावेज करें'
    ],
    cybercrime: [
      'अब कोई अन्य ओटीपी या व्यक्तिगत विवरण साझा न करें',
      'सभी संदिग्ध संदेशों और लेनदेन के स्क्रीनशॉट लें',
      'संदिग्ध नंबर या ईमेल को तुरंत ब्लॉक करें'
    ],
    disaster: [
      'यदि बाढ़ आ रही हो तो ऊंचाई वाले स्थान पर जाएं',
      'खिड़कियों और बाहरी दीवारों से दूर रहें',
      'आपातकालीन आपूर्ति तैयार रखें'
    ],
    mental_health: [
      'आप अकेले नहीं हैं — मदद अभी उपलब्ध है',
      'सुरक्षित स्थान पर रहें',
      'जब तक हम आपको सहायता से जोड़ते हैं, तब तक किसी विश्वसनीय व्यक्ति से संपर्क करें'
    ],
    missing_person: [
      'अंतिम ज्ञात स्थान और समय नोट करें',
      'गुमशुदा व्यक्ति की हालिया तस्वीर एकत्र करें',
      'मित्रों, रिश्तेदारों और ज्ञात स्थानों से पूछताछ करें'
    ],
    domestic_violence: [
      'यदि आप तत्काल खतरे में हैं, तो परिसर छोड़ने का प्रयास करें',
      'किसी विश्वसनीय पड़ोसी या मित्र से संपर्क करें',
      'सबूत सुरक्षित रखें — तस्वीरें, चिकित्सा रिकॉर्ड'
    ],
    road_accident: [
      'घायल व्यक्तियों को तब तक न हिलाएं जब तक कि तत्काल खतरा न हो',
      'खतरे की बत्तियां चालू करें और चेतावनी संकेत स्थापित करें',
      'शामिल वाहन नंबर नोट करें'
    ],
    senior: [
      'सुनिश्चित करें कि बुजुर्ग व्यक्ति सुरक्षित और आरामदायक है',
      'उनके द्वारा वर्तमान में ली जा रही किसी भी दवा को नोट करें',
      'यदि संभव हो तो पास के परिवार के सदस्यों से संपर्क करें'
    ],
    general: [
      'शांत रहें और अपनी स्थिति का आकलन करें',
      'अपने आपातकाल के बारे में महत्वपूर्ण विवरण नोट करें',
      'अपना फोन चार्ज रखें और सुलभ रखें'
    ]
  },
  kn: {
    police: [
      'ಸಾಧ್ಯವಾದರೆ ಸುರಕ್ಷಿತ ಸ್ಥಳಕ್ಕೆ ತೆರಳಿ',
      'ಅಪರಾಧಿಯನ್ನು ಎದುರಿಸಬೇಡಿ',
      'ಯಾವುದೇ ಪುರಾವೆಗಳನ್ನು ಸಂರಕ್ಷಿಸಿ — ಸುರಕ್ಷಿತವಾಗಿದ್ದರೆ ಫೋಟೋಗಳನ್ನು ತೆಗೆದುಕೊಳ್ಳಿ'
    ],
    fire: [
      'ತಕ್ಷಣ ಆ ಪ್ರದೇಶವನ್ನು ಖಾಲಿ ಮಾಡಿ',
      'ಲಿಫ್ಟ್‌ಗಳನ್ನು ಬಳಸಬೇಡಿ',
      'ನಿಮ್ಮ ಮೂಗು ಮತ್ತು ಬಾಯಿಯನ್ನು ಒದ್ದೆಯಾದ ಬಟ್ಟೆಯಿಂದ ಮುಚ್ಚಿಕೊಳ್ಳಿ'
    ],
    ambulance: [
      'ರೋಗಿಯನ್ನು ಶಾಂತವಾಗಿ ಮತ್ತು ನಿಶ್ಚಲವಾಗಿಡಿ',
      'ರೋಗಿಯು ತಕ್ಷಣದ ಅಪಾಯದಲ್ಲದ ಹೊರತು ಅವರನ್ನು ಸ್ಥಳಾಂತರಿಸಬೇಡಿ',
      'ಲಕ್ಷಣಗಳು ಪ್ರಾರಂಭವಾದ ಸಮಯವನ್ನು ಗುರುತಿಸಿಕೊಳ್ಳಿ'
    ],
    women: [
      'ತಕ್ಷಣ ಸುರಕ್ಷಿತ ಸ್ಥಳಕ್ಕೆ ತೆರಳಿ',
      'ಹತ್ತಿರದ ವಿಶ್ವಾಸಾರ್ಹ ವ್ಯಕ್ತಿಯನ್ನು ಸಂಪರ್ಕಿಸಿ',
      'ಯಾವುದೇ ಪುರಾವೆಗಳನ್ನು ಸಂರಕ್ಷಿಸಿ — ಸಂದೇಶಗಳನ್ನು ಉಳಿಸಿ, ಸ್ಕ್ರೀನ್‌ಶಾಟ್‌ಗಳನ್ನು ತೆಗೆದುಕೊಳ್ಳಿ'
    ],
    child: [
      'ಮಗು ಸುರಕ್ಷಿತ ವಾತಾವರಣದಲ್ಲಿದೆ ಎಂಬುದನ್ನು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ',
      'ಶಂಕಿತ ದುರುಪಯೋಗಪಡಿಸಿಕೊಳ್ಳುವವರನ್ನು ಎಚ್ಚರಿಸಬೇಡಿ',
      'ಹಾನಿಯ ಯಾವುದೇ ಗೋಚರ ಚಿಹ್ನೆಗಳನ್ನು ದಾಖಲಿಸಿ'
    ],
    cybercrime: [
      'ಇನ್ನು ಮುಂದೆ ಯಾವುದೇ ಒಟಿಪಿ ಅಥವಾ ವೈಯಕ್ತಿಕ ವಿವರಗಳನ್ನು ಹಂಚಿಕೊಳ್ಳಬೇಡಿ',
      'ಎಲ್ಲಾ ಶಂಕಿತ ಸಂದೇಶಗಳು ಮತ್ತು ವಹಿವಾಟುಗಳ ಸ್ಕ್ರೀನ್‌ಶಾಟ್‌ಗಳನ್ನು ತೆಗೆದುಕೊಳ್ಳಿ',
      'ಶಂಕಿತ ಸಂಖ್ಯೆ ಅಥವಾ ಇಮೇಲ್ ಅನ್ನು ತಕ್ಷಣವೇ ನಿರ್ಬಂಧಿಸಿ'
    ],
    disaster: [
      'ಪ್ರವಾಹ ಬಂದಲ್ಲಿ ಎತ್ತರದ ಪ್ರದೇಶಕ್ಕೆ ತೆರಳಿ',
      'ಕಿಟಕಿಗಳು ಮತ್ತು ಹೊರಗಿನ ಗೋಡೆಗಳಿಂದ ದೂರವಿರಿ',
      'ತುರ್ತು ಸರಬರಾಜುಗಳನ್ನು ಸಿದ್ಧವಾಗಿಡಿ'
    ],
    mental_health: [
      'ನೀವು ಒಬ್ಬಂಟಿಯಲ್ಲ — ಸಹಾಯ ಈಗಲೇ ಲಭ್ಯವಿದೆ',
      'ಸುರಕ್ಷಿತ ಸ್ಥಳದಲ್ಲಿರಿ',
      'ನಾವು ನಿಮ್ಮನ್ನು ಬೆಂಬಲಕ್ಕೆ ಸಂಪರ್ಕಿಸುವವರೆಗೆ ನೀವು ನಂಬುವ ಯಾರನ್ನಾದರೂ ಸಂಪರ್ಕಿಸಿ'
    ],
    missing_person: [
      'ಕೊನೆಯದಾಗಿ ತಿಳಿದಿರುವ ಸ್ಥಳ ಮತ್ತು ಸಮಯವನ್ನು ಗುರುತಿಸಿಕೊಳ್ಳಿ',
      'ಕಾಣೆಯಾದ ವ್ಯಕ್ತಿಯ ಇತ್ತೀಚಿನ ಛಾಯಾಚಿತ್ರವನ್ನು ಸಂಗ್ರಹಿಸಿ',
      'ಸ್ನೇಹಿತರು, ಸಂಬಂಧಿಕರು ಮತ್ತು ತಿಳಿದಿರುವ ಸ್ಥಳಗಳಲ್ಲಿ ವಿಚಾರಿಸಿ'
    ],
    domestic_violence: [
      'ನೀವು ತಕ್ಷಣದ ಅಪಾಯದಲ್ಲಿದ್ದರೆ, ಆವರಣದಿಂದ ಹೊರಹೋಗಲು ಪ್ರಯತ್ನಿಸಿ',
      'ವಿಶ್ವಾಸಾರ್ಹ ನೆರೆಹೊರೆಯವರು ಅಥವಾ ಸ್ನೇಹಿತರನ್ನು ಸಂಪರ್ಕಿಸಿ',
      'ಪುರಾವೆಗಳನ್ನು ಸಂರಕ್ಷಿಸಿ — ಛಾಯಾಚಿತ್ರಗಳು, ವೈದ್ಯಕೀಯ ದಾಖಲೆಗಳು'
    ],
    road_accident: [
      'ತಕ್ಷಣದ ಅಪಾಯವಿಲ್ಲದ ಹೊರತು ಗಾಯಗೊಂಡ ವ್ಯಕ್ತಿಗಳನ್ನು ಸ್ಥಳಾಂತರಿಸಬೇಡಿ',
      'ಅಪಾಯದ ದೀಪಗಳನ್ನು ಆನ್ ಮಾಡಿ ಮತ್ತು ಎಚ್ಚರಿಕೆ ಸಂಕೇತಗಳನ್ನು ಸ್ಥಾಪಿಸಿ',
      'ಸಂಬಂಧಿತ ವಾಹನ ಸಂಖ್ಯೆಗಳನ್ನು ಗುರುತಿಸಿಕೊಳ್ಳಿ'
    ],
    senior: [
      'ಹಿರಿಯ ವ್ಯಕ್ತಿ ಸುರಕ್ಷಿತವಾಗಿ ಮತ್ತು ಆರಾಮದಾಯಕವಾಗಿರುವುದನ್ನು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ',
      'ಅವರು ಪ್ರಸ್ತುತ ತೆಗೆದುಕೊಳ್ಳುತ್ತಿರುವ ಯಾವುದೇ ಔಷಧಿಗಳನ್ನು ಗುರುತಿಸಿಕೊಳ್ಳಿ',
      'ಸಾಧ್ಯವಾದರೆ ಹತ್ತಿರದ ಕುಟುಂಬ ಸದಸ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ'
    ],
    general: [
      'ಶಾಂತವಾಗಿರಿ ಮತ್ತು ನಿಮ್ಮ ಪರಿಸ್ಥಿತಿಯನ್ನು ನಿರ್ಣಯಿಸಿ',
      'ನಿಮ್ಮ ತುರ್ತು ಪರಿಸ್ಥಿತಿಯ ಬಗ್ಗೆ ಪ್ರಮುಖ ವಿವರಗಳನ್ನು ಗುರುತಿಸಿಕೊಳ್ಳಿ',
      'ನಿಮ್ಮ ಫೋನ್ ಚಾರ್ಜ್ ಆಗಿರುವುದನ್ನು ಮತ್ತು ಲಭ್ಯವಿರುವುದನ್ನು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ'
    ]
  }
};

/**
 * Perform keyword-based triage classification.
 * @param {string} message - User's emergency description
 * @param {string} language - Language code (e.g. 'en', 'hi', 'kn')
 * @returns {{ category: string, severity: string, confidence: number, suggestedActions: string[] }}
 */
export function keywordTriage(message, language = 'en') {
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
  const suggestedActions = getDefaultActions(bestCategory, severity, language);

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
function getDefaultActions(category, severity, language = 'en') {
  const actionsMap = LOCALIZED_ACTIONS[language];
  const generalActions = actionsMap ? actionsMap[category] || actionsMap.general : null;

  const enActions = {
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

  const finalActions = generalActions || enActions[category] || enActions.general;

  if (severity === 'critical') {
    let prefix = 'If you are in immediate danger, call 112 right now';
    if (language === 'hi') {
      prefix = 'यदि आप तत्काल खतरे में हैं, तो अभी 112 पर कॉल करें';
    } else if (language === 'kn') {
      prefix = 'ನೀವು ತಕ್ಷಣದ ಅಪಾಯದಲ್ಲಿದ್ದರೆ, ಈಗಲೇ 112 ಗೆ ಕರೆ ಮಾಡಿ';
    }
    return [prefix, ...finalActions];
  }

  return finalActions;
}
