import mongoose from 'mongoose';
import { CATEGORIES } from './Helpline.js';

const SEVERITIES = ['critical', 'urgent', 'standard', 'info'];

const emergencySessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
    default: null,
  },
  sessionToken: {
    type: String,
    unique: true,
    index: true,
    required: true,
  },
  category: {
    type: String,
    enum: CATEGORIES,
    default: 'general',
  },
  severity: {
    type: String,
    enum: SEVERITIES,
    default: 'standard',
  },
  userMessage: {
    type: String,
    default: '',
  },
  language: {
    type: String,
    default: 'en',
  },
  triageResult: {
    category: String,
    severity: String,
    confidence: { type: Number, min: 0, max: 1 },
    suggestedActions: [String],
    matchedHelplines: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Helpline',
    }],
  },
  conversation: [{
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  }],
  location: {
    lat: Number,
    lng: Number,
    city: String,
    state: String,
  },
  resolved: {
    type: Boolean,
    default: false,
  },
  bookmarked: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

emergencySessionSchema.index({ userId: 1, createdAt: -1 });
emergencySessionSchema.index({ sessionToken: 1 });
emergencySessionSchema.index({ category: 1, severity: 1 });

const EmergencySession = mongoose.model('EmergencySession', emergencySessionSchema);
export default EmergencySession;
