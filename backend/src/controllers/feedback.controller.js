import FeedbackReport from '../models/FeedbackReport.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

/**
 * POST /api/feedback
 * Body: { sessionId, type, comment }
 */
export const submitFeedback = asyncHandler(async (req, res) => {
  const { sessionId, type, comment = '' } = req.body;

  if (!sessionId || !type) {
    return res.status(400).json({
      success: false,
      error: 'sessionId and type are required',
      code: 400,
    });
  }

  const validTypes = ['helpful', 'not_helpful', 'wrong_info', 'bug'];
  if (!validTypes.includes(type)) {
    return res.status(400).json({
      success: false,
      error: `type must be one of: ${validTypes.join(', ')}`,
      code: 400,
    });
  }

  const feedback = await FeedbackReport.create({
    sessionId,
    userId: req.user?._id || null,
    type,
    comment: comment.slice(0, 500),
  });

  res.status(201).json({ success: true, data: feedback });
});
