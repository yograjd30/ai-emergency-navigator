/**
 * Overpass API query builder for finding nearby emergency services.
 * Uses OpenStreetMap data — free, no API key needed.
 */

const AMENITY_MAP = {
  hospital: 'hospital',
  police: 'police',
  police_station: 'police',
  fire_station: 'fire_station',
  pharmacy: 'pharmacy',
  blood_bank: 'blood_bank', // Also querying blood banks
  shelter: 'shelter',
  government: 'townhall',
};

/**
 * Build an Overpass QL query string.
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} radiusMeters - Search radius in meters
 * @param {string} amenityType - OSM amenity type
 * @returns {string} Overpass QL query
 */
function buildOverpassQuery(lat, lng, radiusMeters, amenityType) {
  return `[out:json][timeout:10];
(
  node["amenity"="${amenityType}"](around:${radiusMeters},${lat},${lng});
  way["amenity"="${amenityType}"](around:${radiusMeters},${lat},${lng});
);
out center;`;
}

/**
 * Fetch nearby emergency services from the Overpass API.
 * @param {number} lat - User's latitude
 * @param {number} lng - User's longitude
 * @param {string[]} types - Array of service types (e.g., ['hospital', 'police'])
 * @param {number} radiusMeters - Search radius (default: 5000m)
 * @returns {object} Map of service type → array of service objects
 */
export async function fetchNearbyServices(lat, lng, types, radiusMeters = 5000) {
  const results = {};

  for (const type of types) {
    const amenityType = AMENITY_MAP[type];
    if (!amenityType) {
      results[type] = [];
      continue;
    }

    try {
      const query = buildOverpassQuery(lat, lng, radiusMeters, amenityType);
      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(query)}`,
      });

      if (!response.ok) {
        console.warn(`Overpass API error for ${type}:`, response.status);
        results[type] = [];
        continue;
      }

      const data = await response.json();
      results[type] = (data.elements || []).map(el => ({
        id: el.id,
        name: el.tags?.name || `Unnamed ${type}`,
        lat: el.lat || el.center?.lat,
        lng: el.lon || el.center?.lon,
        address: el.tags?.['addr:full'] || el.tags?.['addr:street'] || '',
        phone: el.tags?.phone || '',
        website: el.tags?.website || '',
        openingHours: el.tags?.opening_hours || '',
      })).filter(el => el.lat && el.lng); // Only include items with valid coordinates
    } catch (err) {
      console.error(`Overpass query failed for ${type}:`, err.message);
      results[type] = [];
    }
  }

  return results;
}

export { AMENITY_MAP };
