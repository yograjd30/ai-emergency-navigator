import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  email: {
    type: String,
    required: true,
  },
  displayName: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    default: '',
  },
  preferredLang: {
    type: String,
    default: 'en',
    enum: ['en', 'hi', 'ta', 'te', 'bn', 'mr', 'kn', 'ml', 'gu', 'pa'],
  },
  location: {
    state: { type: String, default: '' },
    city: { type: String, default: '' },
  },
  emergencyContacts: {
    type: [{
      name: { type: String, required: true },
      phone: { type: String, required: true },
      relation: { type: String, required: true },
    }],
    validate: [v => v.length <= 3, 'Maximum 3 emergency contacts allowed'],
    default: [],
  },
  lastLogin: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

const User = mongoose.model('User', userSchema);
export default User;
