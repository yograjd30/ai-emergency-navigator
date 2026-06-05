import Procedure from '../models/Procedure.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { aiAdaptProcedure } from '../lib/gemini.js';

/**
 * GET /api/procedures
 * Query: ?category=cybercrime&lang=en
 */
export const getProcedures = asyncHandler(async (req, res) => {
  const { category, lang } = req.query;
  const filter = { active: true };
  if (category) filter.category = category;

  const procedures = await Procedure.find(filter)
    .sort({ category: 1, title: 1 })
    .lean()
    .select('title titleLocalized category subcategory timeEstimate difficulty requiredDocs');

  const data = procedures.map(p => ({
    ...p,
    localizedTitle: lang && lang !== 'en'
      ? (p.titleLocalized?.get?.(lang) || p.titleLocalized?.[lang] || p.title)
      : p.title,
  }));

  res.json({ success: true, data });
});

/**
 * GET /api/procedures/:id
 * Query: ?lang=hi
 */
export const getProcedureById = asyncHandler(async (req, res) => {
  const { lang } = req.query;
  const procedure = await Procedure.findById(req.params.id).lean();

  if (!procedure || !procedure.active) {
    return res.status(404).json({ success: false, error: 'Procedure not found', code: 404 });
  }

  // Attach localized data if requested
  if (lang && lang !== 'en') {
    procedure.localizedTitle = procedure.titleLocalized?.get?.(lang) || procedure.titleLocalized?.[lang] || procedure.title;
    const localizedSteps = procedure.stepsLocalized?.get?.(lang) || procedure.stepsLocalized?.[lang];
    if (localizedSteps) {
      procedure.localizedSteps = localizedSteps;
    }
  }

  res.json({ success: true, data: procedure });
});

/**
 * POST /api/procedures/:id/adapt
 * Body: { situation: String, language: String }
 * Uses Gemini to adapt a static procedure to the user's specific situation.
 */
export const adaptProcedure = asyncHandler(async (req, res) => {
  const { situation, language = 'en' } = req.body;

  if (!situation || typeof situation !== 'string' || situation.trim().length < 5) {
    return res.status(400).json({
      success: false,
      error: 'Please describe your situation (minimum 5 characters)',
      code: 400,
    });
  }

  const procedure = await Procedure.findById(req.params.id).lean();
  if (!procedure || !procedure.active) {
    return res.status(404).json({ success: false, error: 'Procedure not found', code: 404 });
  }

  // Try AI adaptation
  const adapted = await aiAdaptProcedure(procedure, situation.trim(), language);

  if (!adapted) {
    // Fallback: return original procedure with note
    let message = 'AI assistance temporarily unavailable. Showing standard guidance.';
    if (language === 'hi') {
      message = 'एआई सहायता अस्थायी रूप से अनुपलब्ध है। मानक मार्गदर्शन दिखा रहा है।';
    } else if (language === 'kn') {
      message = 'AI ಸಹಾಯ ತಾತ್ಕಾಲಿಕವಾಗಿ ಲಭ್ಯವಿಲ್ಲ. ಪ್ರಮಾಣಿತ ಮಾರ್ಗದರ್ಶನವನ್ನು ತೋರಿಸಲಾಗುತ್ತಿದೆ.';
    }
    return res.json({
      success: true,
      data: {
        adapted: false,
        message,
        procedure,
      },
    });
  }

  res.json({
    success: true,
    data: {
      adapted: true,
      adaptedContent: adapted,
      originalProcedure: procedure,
    },
  });
});
