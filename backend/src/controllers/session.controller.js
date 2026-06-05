import EmergencySession from '../models/EmergencySession.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

/**
 * GET /api/sessions — User's session history (paginated)
 */
export const getSessions = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [sessions, total] = await Promise.all([
    EmergencySession.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean()
      .select('category severity userMessage language bookmarked resolved createdAt'),
    EmergencySession.countDocuments({ userId: req.user._id }),
  ]);

  res.json({
    success: true,
    data: {
      sessions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    },
  });
});

/**
 * GET /api/sessions/:id — Full session detail
 */
export const getSessionById = asyncHandler(async (req, res) => {
  const session = await EmergencySession.findOne({
    _id: req.params.id,
    userId: req.user._id,
  })
    .populate('triageResult.matchedHelplines', 'name number category agency hours isEmergency')
    .lean();

  if (!session) {
    return res.status(404).json({ success: false, error: 'Session not found', code: 404 });
  }

  res.json({ success: true, data: session });
});

/**
 * PATCH /api/sessions/:id — Update bookmark/resolved status
 */
export const updateSession = asyncHandler(async (req, res) => {
  const { bookmarked, resolved } = req.body;
  const updates = {};

  if (typeof bookmarked === 'boolean') updates.bookmarked = bookmarked;
  if (typeof resolved === 'boolean') updates.resolved = resolved;

  const session = await EmergencySession.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { $set: updates },
    { new: true }
  ).lean().select('bookmarked resolved');

  if (!session) {
    return res.status(404).json({ success: false, error: 'Session not found', code: 404 });
  }

  res.json({ success: true, data: session });
});

/**
 * DELETE /api/sessions/:id — Delete session
 */
export const deleteSession = asyncHandler(async (req, res) => {
  const result = await EmergencySession.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!result) {
    return res.status(404).json({ success: false, error: 'Session not found', code: 404 });
  }

  res.json({ success: true, data: { message: 'Session deleted' } });
});
