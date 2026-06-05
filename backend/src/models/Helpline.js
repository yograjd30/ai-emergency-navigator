import mongoose from 'mongoose';

const CATEGORIES = [
  'police', 'fire', 'ambulance', 'women', 'child', 'cybercrime',
  'disaster', 'mental_health', 'senior', 'poison', 'railway',
  'road_accident', 'missing_person', 'domestic_violence',
  'human_trafficking', 'general',
];

const helplineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  nameLocalized: {
    type: Map,
    of: String,
    default: {},
  },
  number: {
    type: String,
    required: true,
  },
  altNumbers: {
    type: [String],
    default: [],
  },
  category: {
    type: String,
    required: true,
    enum: CATEGORIES,
    index: true,
  },
  agency: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
  descLocalized: {
    type: Map,
    of: String,
    default: {},
  },
  hours: {
    type: String,
    default: '24/7',
  },
  state: {
    type: String,
    default: 'ALL',
  },
  priority: {
    type: Number,
    default: 0,
  },
  isEmergency: {
    type: Boolean,
    default: false,
  },
  active: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

helplineSchema.index({ category: 1, priority: -1 });
helplineSchema.index({ state: 1, category: 1 });

export { CATEGORIES };
const Helpline = mongoose.model('Helpline', helplineSchema);
export default Helpline;
