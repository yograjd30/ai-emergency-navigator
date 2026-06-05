import { asyncHandler } from '../middleware/asyncHandler.js';
import { fetchNearbyServices } from '../utils/overpassQuery.js';

/**
 * GET /api/nearby
 * Query: ?lat=19.076&lng=72.877&types=hospital,police&radius=5000
 */
export const getNearbyServices = asyncHandler(async (req, res) => {
  const { lat, lng, types, radius = 5000 } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({
      success: false,
      error: 'Latitude and longitude are required',
      code: 400,
    });
  }

  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);
  const radiusMeters = Math.min(parseInt(radius) || 5000, 10000); // Max 10km

  if (isNaN(latitude) || isNaN(longitude)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid coordinates',
      code: 400,
    });
  }

  const serviceTypes = types
    ? types.split(',').map(t => t.trim()).filter(Boolean)
    : ['hospital', 'police', 'fire_station', 'pharmacy'];

  const results = await fetchNearbyServices(latitude, longitude, serviceTypes, radiusMeters);

  res.json({ success: true, data: results });
});
