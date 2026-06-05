import User from '../models/User.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { isValidLanguage } from '../utils/languageMap.js';

/**
 * GET /api/users/me — Full profile
 */
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).lean();
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found', code: 404 });
  }
  res.json({ success: true, data: user });
});

/**
 * PATCH /api/users/me — Update preferredLang, location, emergencyContacts
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const { preferredLang, location, emergencyContacts } = req.body;
  const updates = {};

  if (preferredLang) {
    if (!isValidLanguage(preferredLang)) {
      return res.status(400).json({ success: false, error: 'Invalid language code', code: 400 });
    }
    updates.preferredLang = preferredLang;
  }

  if (location) {
    updates.location = {
      state: location.state || '',
      city: location.city || '',
    };
  }

  if (emergencyContacts) {
    if (!Array.isArray(emergencyContacts) || emergencyContacts.length > 3) {
      return res.status(400).json({ success: false, error: 'Maximum 3 emergency contacts allowed', code: 400 });
    }
    updates.emergencyContacts = emergencyContacts.map(c => ({
      name: c.name || '',
      phone: c.phone || '',
      relation: c.relation || '',
    }));
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updates },
    { new: true, runValidators: true }
  ).lean().select('-googleId');

  res.json({ success: true, data: user });
});
