import { Phone } from 'lucide-react';

export default function SOSButton() {
  return (
    <a
      href="tel:112"
      className="sos-fab"
      aria-label="Emergency: Call 112"
      title="Call 112 - Emergency"
    >
      <Phone className="w-7 h-7 text-white" fill="white" />
    </a>
  );
}
