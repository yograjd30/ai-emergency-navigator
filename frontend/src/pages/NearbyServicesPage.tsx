import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import { MapPin, Navigation, Phone, Loader2, AlertCircle } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../lib/axios';
import { useLanguage } from '../context/LanguageContext';

// Fix leaflet default marker icon broken in Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const SERVICE_TYPES = [
  { id: 'all', label: 'All Services', icon: '📍', color: '#3B82F6' },
  { id: 'hospital', label: 'Hospitals', icon: '🏥', color: '#10B981' },
  { id: 'police_station', label: 'Police Stations', icon: '👮', color: '#3B82F6' },
  { id: 'fire_station', label: 'Fire Stations', icon: '🚒', color: '#EF4444' },
  { id: 'pharmacy', label: 'Pharmacies', icon: '💊', color: '#A855F7' },
  { id: 'blood_bank', label: 'Blood Banks', icon: '🩸', color: '#EF4444' },
];

interface NearbyService {
  id: string;
  name: string;
  type: string;
  address: string;
  phone?: string;
  distance: number;
  lat: number;
  lng: number;
  open?: boolean;
}

// Map recenter component
function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => { map.setView([lat, lng], 14); }, [lat, lng, map]);
  return null;
}

// Custom colored markers
function getMarkerIcon(type: string) {
  const colors: Record<string, string> = {
    hospital: '#10B981',
    police_station: '#3B82F6',
    fire_station: '#EF4444',
    pharmacy: '#A855F7',
    blood_bank: '#EF4444',
    user: '#F59E0B',
  };
  const color = colors[type] || '#3B82F6';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 32" width="24" height="32">
    <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20C24 5.4 18.6 0 12 0z" fill="${color}"/>
    <circle cx="12" cy="12" r="5" fill="white"/>
  </svg>`;
  return L.divIcon({
    html: svg,
    iconSize: [24, 32],
    iconAnchor: [12, 32],
    popupAnchor: [0, -32],
    className: '',
  });
}

export default function NearbyServicesPage() {
  const { t } = useLanguage();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [activeType, setActiveType] = useState('all');
  const [radius, setRadius] = useState(5000); // meters
  const [selectedService, setSelectedService] = useState<NearbyService | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const getLocation = useCallback(() => {
    setIsGettingLocation(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setIsGettingLocation(false);
      },
      () => {
        setLocationError('Could not get your location. Please enable GPS.');
        setIsGettingLocation(false);
        // Fallback to Delhi
        setUserLocation({ lat: 28.6139, lng: 77.2090 });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  useEffect(() => { getLocation(); }, []);

  const { data: services, isLoading } = useQuery({
    queryKey: ['nearby', userLocation?.lat, userLocation?.lng, radius, activeType],
    queryFn: async () => {
      if (!userLocation) return [];
      const res = await api.get('/nearby', {
        params: {
          lat: userLocation.lat,
          lng: userLocation.lng,
          radius,
          type: activeType === 'all' ? undefined : activeType,
        },
      });
      return res.data.data as NearbyService[];
    },
    enabled: !!userLocation,
    staleTime: 2 * 60 * 1000,
  });

  const displayed = services || [];

  return (
    <LazyMotion features={domAnimation}>
      <div className="page-bg pt-16 h-screen flex flex-col overflow-hidden">
        <div className="flex flex-col lg:flex-row flex-1 min-h-0">

          {/* ── LEFT PANEL ── */}
          <div className="w-full lg:w-96 flex flex-col bg-sos-card border-r border-sos-border overflow-hidden">

            {/* Header */}
            <div className="p-5 border-b border-sos-border flex-shrink-0">
              <h1 className="heading-2 text-xl text-sos-primary mb-1">🗺️ {t('nearby.title')}</h1>
              <p className="text-sm text-sos-muted">Emergency services near your location</p>

              {/* Location Status */}
              <div className="mt-3 flex items-center gap-2">
                {isGettingLocation ? (
                  <div className="flex items-center gap-2 text-xs text-sos-muted">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Getting your location...
                  </div>
                ) : userLocation ? (
                  <div className="flex items-center gap-2 text-xs text-green-500 font-semibold">
                    <MapPin className="w-3.5 h-3.5" />
                    Location found
                  </div>
                ) : null}
                {locationError && (
                  <div className="flex items-center gap-2 text-xs text-amber-500">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Using default location (Delhi)
                  </div>
                )}
                <button
                  onClick={getLocation}
                  className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold glass-button-primary min-h-0"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  Refresh
                </button>
              </div>
            </div>

            {/* Type Filter */}
            <div className="p-3 border-b border-sos-border flex gap-2 overflow-x-auto flex-shrink-0">
              {SERVICE_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setActiveType(type.id)}
                  id={`service-type-${type.id}`}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all min-h-0 ${
                    activeType === type.id
                      ? 'text-white'
                      : 'glass-card text-sos-secondary'
                  }`}
                  style={activeType === type.id ? { background: type.color } : {}}
                >
                  <span>{type.icon}</span>
                  <span className="hidden sm:block">{type.label}</span>
                </button>
              ))}
            </div>

            {/* Radius Slider */}
            <div className="p-4 border-b border-sos-border flex-shrink-0">
              <div className="flex justify-between text-xs text-sos-muted mb-2">
                <span>{t('nearby.radius')}</span>
                <span className="font-bold text-sos-primary">{(radius / 1000).toFixed(1)} km</span>
              </div>
              <input
                type="range"
                min={1000}
                max={20000}
                step={500}
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="w-full accent-blue-500"
                aria-label="Search radius"
              />
            </div>

            {/* Services List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {isLoading && (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-sos-accent" />
                </div>
              )}

              {!isLoading && displayed.length === 0 && userLocation && (
                <div className="text-center py-10">
                  <div className="text-4xl mb-3">🔍</div>
                  <p className="text-sm text-sos-secondary">No services found within {(radius / 1000).toFixed(1)} km</p>
                  <button onClick={() => setRadius(r => r + 5000)} className="mt-2 text-xs text-sos-accent hover:underline min-h-0">
                    Increase radius
                  </button>
                </div>
              )}

              {displayed.map((service) => (
                <m.button
                  key={service.id}
                  layout
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => setSelectedService(service)}
                  id={`nearby-${service.id}`}
                  className={`w-full text-left p-4 rounded-xl transition-all min-h-0 glass-card ${
                    selectedService?.id === service.id ? 'border-sos-accent bg-sos-subtle' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{SERVICE_TYPES.find(t => t.id === service.type)?.icon || '📍'}</span>
                        <span className="font-bold text-sm text-sos-primary truncate">{service.name}</span>
                      </div>
                      <p className="text-xs text-sos-muted mt-1 truncate">{service.address}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs font-bold text-sos-accent">
                        {service.distance < 1000
                          ? `${Math.round(service.distance)}m`
                          : `${(service.distance / 1000).toFixed(1)} km`}
                      </div>
                      {service.open !== undefined && (
                        <div className={`text-xs font-semibold ${service.open ? 'text-green-500' : 'text-red-500'}`}>
                          {service.open ? 'Open' : 'Closed'}
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedService?.id === service.id && (
                    <m.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3 pt-3 border-t border-sos-border flex gap-2"
                    >
                      {service.phone && (
                        <a
                          href={`tel:${service.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-white min-h-0"
                          style={{ background: '#10B981' }}
                        >
                          <Phone className="w-3.5 h-3.5" />
                          Call
                        </a>
                      )}
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${service.lat},${service.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold glass-button-primary min-h-0"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        {t('nearby.directions')}
                      </a>
                    </m.div>
                  )}
                </m.button>
              ))}
            </div>
          </div>

          {/* ── MAP ── */}
          <div className="flex-1 min-h-[50vh] lg:min-h-0 relative">
            {userLocation && (
              <MapContainer
                center={[userLocation.lat, userLocation.lng]}
                zoom={13}
                className="w-full h-full"
                style={{ zIndex: 1 }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <RecenterMap lat={userLocation.lat} lng={userLocation.lng} />

                {/* User location */}
                <Marker position={[userLocation.lat, userLocation.lng]} icon={getMarkerIcon('user')}>
                  <Popup>
                    <strong>Your Location</strong>
                  </Popup>
                </Marker>

                {/* Radius circle */}
                <Circle
                  center={[userLocation.lat, userLocation.lng]}
                  radius={radius}
                  pathOptions={{ color: '#3B82F6', fillColor: '#3B82F6', fillOpacity: 0.05, weight: 1.5, dashArray: '6 4' }}
                />

                {/* Service markers */}
                {displayed.map((service) => (
                  <Marker
                    key={service.id}
                    position={[service.lat, service.lng]}
                    icon={getMarkerIcon(service.type)}
                    eventHandlers={{ click: () => setSelectedService(service) }}
                  >
                    <Popup>
                      <div className="min-w-[160px]">
                        <strong className="block text-sm">{service.name}</strong>
                        <p className="text-xs text-gray-500 mt-1">{service.address}</p>
                        {service.phone && (
                          <a href={`tel:${service.phone}`} className="block mt-2 text-xs font-bold text-blue-500">
                            📞 {service.phone}
                          </a>
                        )}
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${service.lat},${service.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block mt-1 text-xs text-blue-400 hover:underline"
                        >
                          Get Directions →
                        </a>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            )}

            {!userLocation && !isGettingLocation && (
              <div className="absolute inset-0 flex items-center justify-center glass-card m-4 rounded-2xl">
                <div className="text-center">
                  <MapPin className="w-12 h-12 text-sos-accent mx-auto mb-3" />
                  <h3 className="font-bold text-sos-primary mb-2">Enable Location</h3>
                  <p className="text-sm text-sos-secondary mb-4 max-w-xs">
                    Allow location access to find emergency services near you.
                  </p>
                  <button
                    onClick={getLocation}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl text-white font-bold mx-auto min-h-0"
                    style={{ background: 'linear-gradient(135deg,#3B82F6,#2563EB)' }}
                  >
                    <Navigation className="w-4 h-4" />
                    Enable Location
                  </button>
                </div>
              </div>
            )}

            {isGettingLocation && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="glass-card p-6 rounded-2xl text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-sos-accent mx-auto mb-2" />
                  <p className="text-sm text-sos-secondary">Getting your location...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </LazyMotion>
  );
}
