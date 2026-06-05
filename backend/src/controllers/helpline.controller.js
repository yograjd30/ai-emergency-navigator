import Helpline from '../models/Helpline.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

/**
 * GET /api/helplines
 * Query: ?category=police&state=Maharashtra&lang=hi
 */
export const getHelplines = asyncHandler(async (req, res) => {
  const { category, state, lang, emergency } = req.query;
  const filter = { active: true };

  if (category) filter.category = category;
  if (state) {
    filter.$or = [{ state: 'ALL' }, { state }];
  }
  if (emergency === 'true') filter.isEmergency = true;

  const helplines = await Helpline.find(filter)
    .sort({ isEmergency: -1, priority: -1 })
    .lean()
    .select('name nameLocalized number altNumbers category agency description descLocalized hours state isEmergency priority');

  // If language specified, attach localized fields
  const data = helplines.map(h => {
    const localized = {};
    if (lang && lang !== 'en') {
      localized.localizedName = h.nameLocalized?.get?.(lang) || h.nameLocalized?.[lang] || h.name;
      localized.localizedDesc = h.descLocalized?.get?.(lang) || h.descLocalized?.[lang] || h.description;
    }
    return { ...h, ...localized };
  });

  res.json({ success: true, data });
});

/**
 * GET /api/helplines/emergency
 * Returns top emergency numbers only (112, 100, 101, 102, 108)
 */
export const getEmergencyHelplines = asyncHandler(async (req, res) => {
  const helplines = await Helpline.find({ isEmergency: true, active: true })
    .sort({ priority: -1 })
    .lean()
    .select('name nameLocalized number category agency description hours isEmergency');

  res.set('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
  res.json({ success: true, data: helplines });
});
