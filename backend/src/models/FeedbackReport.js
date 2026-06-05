import mongoose from 'mongoose';

const feedbackReportSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EmergencySession',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  type: {
    type: String,
    required: true,
    enum: ['helpful', 'not_helpful', 'wrong_info', 'bug'],
  },
  comment: {
    type: String,
    maxlength: 500,
    default: '',
  },
}, {
  timestamps: true,
});

feedbackReportSchema.index({ sessionId: 1 });

const FeedbackReport = mongoose.model('FeedbackReport', feedbackReportSchema);
export default FeedbackReport;
