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

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const flattenedResults = Object.entries(results).flatMap(([type, items]) =>
    items.map(item => ({
      id: String(item.id),
      name: item.name,
      type,
      address: item.address || '',
      phone: item.phone || undefined,
      lat: item.lat,
      lng: item.lng,
      distance: Math.round(calculateDistance(latitude, longitude, item.lat, item.lng)),
      open: undefined,
    }))
  ).sort((a, b) => a.distance - b.distance);

  res.json({ success: true, data: flattenedResults });
});
