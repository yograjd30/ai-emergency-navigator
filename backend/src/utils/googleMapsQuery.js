/**
 * Google Places API query runner for finding nearby emergency services.
 * Automatically falls back to localized mock services if the API key is not configured.
 */

// Mapping of internal type keys to Google Places API types or search keywords
const GOOGLE_PLACES_MAP = {
  hospital: { type: 'hospital' },
  police: { type: 'police' },
  police_station: { type: 'police' },
  fire_station: { type: 'fire_station' },
  pharmacy: { type: 'pharmacy' },
  blood_bank: { keyword: 'blood bank' },
};

/**
 * Fetch nearby emergency services.
 * @param {number} lat - User's latitude
 * @param {number} lng - User's longitude
 * @param {string[]} types - Array of requested service types
 * @param {number} radiusMeters - Search radius (meters)
 * @returns {Promise<object>} Map of service type -> array of service objects
 */
export async function fetchNearbyServices(lat, lng, types, radiusMeters = 5000) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY || '';
  const isKeyPlaceholder = !apiKey || apiKey === 'your-google-client-id' || apiKey.includes('placeholder') || apiKey.includes('key');

  if (isKeyPlaceholder) {
    console.log(`ℹ️ [Google Places API] Using localized mock data for types: ${types.join(', ')}`);
    return generateMockNearbyServices(lat, lng, types, radiusMeters);
  }

  const results = {};

  for (const type of types) {
    const queryConfig = GOOGLE_PLACES_MAP[type];
    if (!queryConfig) {
      results[type] = [];
      continue;
    }

    try {
      let url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radiusMeters}&key=${apiKey}`;
      
      if (queryConfig.type) {
        url += `&type=${queryConfig.type}`;
      } else if (queryConfig.keyword) {
        url += `&keyword=${encodeURIComponent(queryConfig.keyword)}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        console.warn(`[Google Places API] Error response for type ${type}:`, response.status);
        results[type] = [];
        continue;
      }

      const data = await response.json();
      
      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        console.warn(`[Google Places API] Status error for type ${type}:`, data.status, data.error_message || '');
        results[type] = [];
        continue;
      }

      results[type] = (data.results || []).map(place => ({
        id: place.place_id,
        name: place.name,
        lat: place.geometry?.location?.lat,
        lng: place.geometry?.location?.lng,
        address: place.vicinity || '',
        phone: '', // Detailed phone lookup requires a separate details query, not returned by Nearby Search
        open: place.opening_hours ? place.opening_hours.open_now : undefined,
      })).filter(item => item.lat && item.lng);

    } catch (err) {
      console.error(`[Google Places API] Query failed for type ${type}:`, err.message);
      results[type] = [];
    }
  }

  return results;
}

/**
 * Highly realistic fallback generator for offline / local-only mode
 */
function generateMockNearbyServices(lat, lng, types, radiusMeters) {
  const results = {};
  
  const mockNames = {
    hospital: [
      'Max Super Speciality Hospital',
      'Apollo Hospital',
      'Fortis Healthcare & Trauma Center',
      'Manipal Emergency Hospital',
      'Lifeline General Hospital',
      'Government Civil Hospital'
    ],
    police: [
      'Police Station Sector-12',
      'City Main Police Station',
      'District Police Station',
      'Women Safety Police Station',
      'Traffic Police Control Booth'
    ],
    police_station: [
      'Police Station Sector-12',
      'City Main Police Station',
      'District Police Station',
      'Women Safety Police Station',
      'Traffic Police Control Booth'
    ],
    fire_station: [
      'Municipal Fire Station',
      'Industrial Fire & Rescue Station',
      'Sub-Divisional Fire Headquarters',
      'Central Fire & Hazmat Station'
    ],
    pharmacy: [
      'Apollo Pharmacy 24/7',
      'MedPlus Chemist',
      'Wellness Forever Pharmacy',
      'Guardian Life Care Chemist',
      'New Age Diagnostic & Medicos'
    ],
    blood_bank: [
      'Red Cross Society Blood Bank',
      'Rotary Club Volunteer Blood Bank',
      'City General Hospital Blood Bank',
      'Jeevan Rakshak Blood Center'
    ]
  };

  const addresses = [
    'Main Market Road, Near City Center, Phase 1',
    'Sector 4, Phase 2, Near Central Metro Station',
    'Outer Ring Road, Opp. Municipal Building',
    '12/A Mall Road, Near Police Chowki Crossing',
    'Industrial Layout Road, Block B, Main Street'
  ];

  const phones = [
    '011-23456789',
    '+91 98765 43210',
    '+91 99999 88888',
    '022-45678901',
    '+91 88888 77777'
  ];

  for (const type of types) {
    const list = mockNames[type] || ['General Emergency Service'];
    const count = 3 + Math.floor(Math.random() * 3); // Generate 3 to 5 realistic entries
    results[type] = [];
    
    for (let i = 0; i < count; i++) {
      const name = list[i % list.length];
      
      // Calculate offset within search radius
      const maxOffset = (radiusMeters / 111000) * 0.7; // 1 degree ~ 111km
      const offsetLat = (Math.random() - 0.5) * 2 * maxOffset;
      const offsetLng = (Math.random() - 0.5) * 2 * maxOffset;
      
      results[type].push({
        id: `mock-${type}-${i}-${Math.round((lat + offsetLat) * 1000)}`,
        name: `${name} ${i > 0 ? '#' + (i + 1) : ''}`,
        lat: lat + offsetLat,
        lng: lng + offsetLng,
        address: addresses[Math.floor(Math.random() * addresses.length)],
        phone: phones[Math.floor(Math.random() * phones.length)],
        open: Math.random() > 0.2, // 80% open
      });
    }
  }
  
  return results;
}
