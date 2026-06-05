import mongoose from 'mongoose';
import { CATEGORIES } from './Helpline.js';

const procedureSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  titleLocalized: {
    type: Map,
    of: String,
    default: {},
  },
  category: {
    type: String,
    required: true,
    enum: CATEGORIES,
  },
  subcategory: {
    type: String,
    default: '',
  },
  steps: [{
    stepNumber: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    tip: { type: String, default: '' },
  }],
  stepsLocalized: {
    type: Map,
    of: [{
      stepNumber: Number,
      title: String,
      description: String,
      tip: String,
    }],
    default: {},
  },
  requiredDocs: {
    type: [String],
    default: [],
  },
  relatedLinks: [{
    label: { type: String, required: true },
    url: { type: String, required: true },
  }],
  timeEstimate: {
    type: String,
    default: '',
  },
  difficulty: {
    type: String,
    enum: ['easy', 'moderate', 'complex'],
    default: 'moderate',
  },
  lastVerified: {
    type: Date,
    default: Date.now,
  },
  active: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

procedureSchema.index({ category: 1, subcategory: 1 });

const Procedure = mongoose.model('Procedure', procedureSchema);
export default Procedure;
