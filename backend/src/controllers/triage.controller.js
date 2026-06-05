import { v4 as uuidv4 } from 'uuid';
import EmergencySession from '../models/EmergencySession.js';
import Helpline from '../models/Helpline.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { keywordTriage } from '../utils/triageClassifier.js';
import { aiTriage, aiFollowUp } from '../lib/gemini.js';

/**
 * POST /api/triage
 * Main triage endpoint — classifies emergency and returns matched helplines.
 * Works for both guests and authenticated users.
 */
export const triageEmergency = asyncHandler(async (req, res) => {
  const { message, language = 'en', location } = req.body;

  if (!message || typeof message !== 'string' || message.trim().length < 3) {
    return res.status(400).json({
      success: false,
      error: 'Please describe your emergency (minimum 3 characters)',
      code: 400,
    });
  }

  const cleanMessage = message.trim().slice(0, 2000); // Limit input length

  // Step 1: Keyword-based triage
  let triageResult = keywordTriage(cleanMessage);

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

  if (!message || typeof message !== 'string' || message.trim().length < 1) {
    return res.status(400).json({
      success: false,
      error: 'Message is required',
      code: 400,
    });
  }

  const session = await EmergencySession.findById(sessionId);
  if (!session) {
    return res.status(404).json({
      success: false,
      error: 'Session not found',
      code: 404,
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
    responseText = `I understand you need more help with this ${session.category.replace('_', ' ')} situation. Please refer to the helpline directory for verified contact numbers, or use the procedure guide for step-by-step instructions. If you're in immediate danger, call 112.`;
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
