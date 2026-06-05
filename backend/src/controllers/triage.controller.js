import { v4 as uuidv4 } from 'uuid';
import EmergencySession from '../models/EmergencySession.js';
import Helpline from '../models/Helpline.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { keywordTriage } from '../utils/triageClassifier.js';
import { aiTriage, aiFollowUp } from '../lib/gemini.js';

const LOCALIZED_CATEGORIES = {
  hi: {
    police: 'पुलिस',
    fire: 'अग्निशमन',
    ambulance: 'चिकित्सा',
    women: 'महिला सुरक्षा',
    child: 'बाल सुरक्षा',
    cybercrime: 'साइबर अपराध',
    disaster: 'आपदा',
    mental_health: 'मानसिक स्वास्थ्य',
    senior: 'वरिष्ठ नागरिक',
    missing_person: 'गुमशुदा व्यक्ति',
    domestic_violence: 'घरेलू हिंसा',
    road_accident: 'सड़क दुर्घटना',
    general: 'सामान्य'
  },
  kn: {
    police: 'ಪೊಲೀಸ್',
    fire: 'ಅಗ್ನಿಶಾಮಕ',
    ambulance: 'ವೈದ್ಯಕೀಯ',
    women: 'ಮಹಿಳಾ ಸುರಕ್ಷತೆ',
    child: 'ಮಕ್ಕಳ ಸುರಕ್ಷತೆ',
    cybercrime: 'ಸೈಬರ್ ಅಪರಾಧ',
    disaster: 'ವಿಪತ್ತು',
    mental_health: 'ಮಾನಸಿಕ ಆರೋಗ್ಯ',
    senior: 'ಹಿರಿಯ ನಾಗರಿಕರು',
    missing_person: 'ಕಾಣೆಯಾದ ವ್ಯಕ್ತಿ',
    domestic_violence: 'ಗೃಹಹಿಂಸೆ',
    road_accident: 'ರಸ್ತೆ ಅಪಘಾತ',
    general: 'ಸಾಮಾನ್ಯ'
  }
};

/**
 * POST /api/triage
 * Main triage endpoint — classifies emergency and returns matched helplines.
 * Works for both guests and authenticated users.
 */
export const triageEmergency = asyncHandler(async (req, res) => {
  const { message, language = 'en', location } = req.body;

  if (!message || typeof message !== 'string' || message.trim().length < 3) {
    let error = 'Please describe your emergency (minimum 3 characters)';
    if (language === 'hi') {
      error = 'कृपया अपनी आपातकालीन स्थिति का वर्णन करें (न्यूनतम 3 वर्ण)';
    } else if (language === 'kn') {
      error = 'ದಯವಿಟ್ಟು ನಿಮ್ಮ ತುರ್ತು ಪರಿಸ್ಥಿತಿಯನ್ನು ವಿವರಿಸಿ (ಕನಿಷ್ಠ 3 ಅಕ್ಷರಗಳು)';
    }
    return res.status(400).json({
      success: false,
      error,
      code: 400,
    });
  }

  const cleanMessage = message.trim().slice(0, 2000); // Limit input length

  // Step 1: Keyword-based triage
  let triageResult = keywordTriage(cleanMessage, language);

  // Step 2: If low confidence, try Gemini AI
  if (triageResult.confidence < 0.7) {
    const aiResult = await aiTriage(cleanMessage, language);
    if (aiResult && aiResult.confidence > triageResult.confidence) {
      triageResult = aiResult;
    }
  }

  // Step 3: Fetch matching helplines from database
  const helplineQuery = { active: true, category: triageResult.category };
  const userState = location?.state;
  
  const helplines = await Helpline.find({
    ...helplineQuery,
    $or: [
      { state: 'ALL' },
      ...(userState ? [{ state: userState }] : []),
    ],
  })
    .sort({ priority: -1 })
    .limit(10)
    .lean()
    .select('name nameLocalized number altNumbers category agency description descLocalized hours isEmergency priority');

  // Always include top emergency numbers if severity is critical/urgent
  let emergencyHelplines = [];
  if (triageResult.severity === 'critical' || triageResult.severity === 'urgent') {
    emergencyHelplines = await Helpline.find({ isEmergency: true, active: true })
      .sort({ priority: -1 })
      .lean()
      .select('name nameLocalized number category agency description hours isEmergency priority');
  }

  // Combine and deduplicate, prioritizing category-specific helplines first
  const allHelplines = [...helplines, ...emergencyHelplines];
  const uniqueHelplines = allHelplines.filter(
    (h, i, arr) => arr.findIndex(x => x._id.toString() === h._id.toString()) === i
  );

  // Step 4: Create EmergencySession
  const sessionToken = uuidv4();
  const sessionData = {
    userId: req.user?._id || null,
    sessionToken,
    category: triageResult.category,
    severity: triageResult.severity,
    userMessage: cleanMessage,
    language,
    triageResult: {
      category: triageResult.category,
      severity: triageResult.severity,
      confidence: triageResult.confidence,
      suggestedActions: triageResult.suggestedActions || [],
      matchedHelplines: uniqueHelplines.map(h => h._id),
    },
    conversation: [
      { role: 'user', content: cleanMessage },
      {
        role: 'assistant',
        content: `I've identified this as a ${triageResult.category.replace('_', ' ')} situation with ${triageResult.severity} severity. Here are the relevant helplines and recommended actions.`,
      },
    ],
    location: location ? {
      lat: location.lat,
      lng: location.lng,
      city: location.city || '',
      state: location.state || '',
    } : undefined,
  };

  const session = await EmergencySession.create(sessionData);

  // Localize helpline details based on selected language
  const localizedHelplines = uniqueHelplines.map(h => {
    const localized = {};
    if (language && language !== 'en') {
      localized.localizedName = h.nameLocalized?.get?.(language) || h.nameLocalized?.[language] || h.name;
      localized.localizedDesc = h.descLocalized?.get?.(language) || h.descLocalized?.[language] || h.description;
    }
    return { ...h, ...localized };
  });

  // Step 5: Return response
  res.json({
    success: true,
    data: {
      sessionId: session._id,
      sessionToken,
      triageResult: {
        category: triageResult.category,
        severity: triageResult.severity,
        confidence: triageResult.confidence,
        suggestedActions: triageResult.suggestedActions || [],
        reasoning: triageResult.reasoning || '',
      },
      helplines: localizedHelplines,
      immediateActions: triageResult.suggestedActions || [],
    },
  });
});

/**
 * POST /api/triage/:sessionId/followup
 * Follow-up message in an existing emergency conversation.
 */
export const followUp = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const { message } = req.body;

  const session = await EmergencySession.findById(sessionId);
  if (!session) {
    return res.status(404).json({
      success: false,
      error: 'Session not found',
      code: 404,
    });
  }

  if (!message || typeof message !== 'string' || message.trim().length < 1) {
    let error = 'Message is required';
    if (session.language === 'hi') {
      error = 'संदेश आवश्यक है';
    } else if (session.language === 'kn') {
      error = 'ಸಂದೇಶ ಅಗತ್ಯವಿದೆ';
    }
    return res.status(400).json({
      success: false,
      error,
      code: 400,
    });
  }

  const cleanMessage = message.trim().slice(0, 2000);

  // Add user message to conversation
  session.conversation.push({ role: 'user', content: cleanMessage });

  // Try AI follow-up
  let responseText = await aiFollowUp(
    session.conversation,
    { category: session.category, severity: session.severity },
    session.language
  );

  // Fallback if AI fails
  if (!responseText) {
    const cat = (LOCALIZED_CATEGORIES[session.language] || {})[session.category] || session.category.replace('_', ' ');
    if (session.language === 'hi') {
      responseText = `मैं समझता हूँ कि आपको इस ${cat} स्थिति में और मदद की आवश्यकता है। कृपया सत्यापित संपर्क नंबरों के लिए हेल्पलाइन निर्देशिका देखें, या चरण-दर-चरण निर्देशों के लिए प्रक्रिया गाइड का उपयोग करें। यदि आप तत्काल खतरे में हैं, तो 112 पर कॉल करें।`;
    } else if (session.language === 'kn') {
      responseText = `ಈ ${cat} ಪರಿಸ್ಥಿತಿಯಲ್ಲಿ ನಿಮಗೆ ಹೆಚ್ಚಿನ ಸಹಾಯದ ಅಗತ್ಯವಿದೆ ಎಂದು ನಾನು ಅರ್ಥಮಾಡಿಕೊಂಡಿದ್ದೇನೆ. ದಯವಿಟ್ಟು ಪರಿಶೀಲಿಸಿದ ಸಂಪರ್ಕ ಸಂಖ್ಯೆಗಳಿಗಾಗಿ ಹೆಲ್ಪ್‌ಲೈನ್ ಡೈರೆಕ್ಟರಿಯನ್ನು ನೋಡಿ, ಅಥವಾ ಹಂತ-ಹಂತದ ಸೂಚನೆಗಳಿಗಾಗಿ ಕಾರ್ಯವಿಧಾನದ ಮಾರ್ಗದರ್ಶಿಯನ್ನು ಬಳಸಿ. ನೀವು ತಕ್ಷಣದ ಅಪಾಯದಲ್ಲಿದ್ದರೆ, 112 ಗೆ ಕರೆ ಮಾಡಿ.`;
    } else {
      responseText = `I understand you need more help with this ${cat} situation. Please refer to the helpline directory for verified contact numbers, or use the procedure guide for step-by-step instructions. If you're in immediate danger, call 112.`;
    }
  }

  // Add assistant response to conversation
  session.conversation.push({ role: 'assistant', content: responseText });
  await session.save();

  res.json({
    success: true,
    data: {
      response: responseText,
      sessionId: session._id,
      conversationLength: session.conversation.length,
    },
  });
});
