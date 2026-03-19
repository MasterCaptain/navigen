import React from 'react';
import { Ship, Navigation } from 'lucide-react';

export interface AISVessel {
  mmsi: string;
  name: string;
  type: 'cargo' | 'tanker' | 'passenger' | 'fishing' | 'research' | 'other';
  lat: number;
  lng: number;
  speed: number; // knots
  heading: number; // degrees
  course: number; // degrees
  destination?: string;
  eta?: string;
  flag?: string;
  length?: number;
  beam?: number;
}

// Mock AIS vessels around Svalbard/Longyearbyen area
export const MOCK_AIS_VESSELS: AISVessel[] = [
  {
    mmsi: '257123456',
    name: 'MS NORDSYSSEL',
    type: 'passenger',
    lat: 78.2450,
    lng: 15.5800,
    speed: 12.5,
    heading: 285,
    course: 285,
    destination: 'LONGYEARBYEN',
    eta: '2026-03-09 14:30',
    flag: '🇳🇴',
    length: 105,
    beam: 18
  },
  {
    mmsi: '257234567',
    name: 'POLARSYSSEL',
    type: 'research',
    lat: 78.1980,
    lng: 15.7200,
    speed: 0,
    heading: 42,
    course: 0,
    destination: 'RESEARCH STATION',
    flag: '🇳🇴',
    length: 64,
    beam: 13
  },
  {
    mmsi: '257345678',
    name: 'ARCTIC EXPLORER',
    type: 'passenger',
    lat: 78.2100,
    lng: 15.4500,
    speed: 8.2,
    heading: 95,
    course: 95,
    destination: 'PYRAMIDEN',
    eta: '2026-03-09 18:00',
    flag: '🇳🇴',
    length: 89,
    beam: 15
  },
  {
    mmsi: '257456789',
    name: 'KRONPRINS HAAKON',
    type: 'research',
    lat: 78.2600,
    lng: 15.8000,
    speed: 6.5,
    heading: 180,
    course: 180,
    destination: 'ICE EDGE',
    flag: '🇳🇴',
    length: 100,
    beam: 21
  },
  {
    mmsi: '257567890',
    name: 'SYSSELMANNEN I',
    type: 'other',
    lat: 78.2280,
    lng: 15.6100,
    speed: 14.0,
    heading: 220,
    course: 220,
    destination: 'PATROL',
    flag: '🇳🇴',
    length: 48,
    beam: 11
  },
  {
    mmsi: '257678901',
    name: 'HAVSEL',
    type: 'fishing',
    lat: 78.1800,
    lng: 15.9000,
    speed: 3.2,
    heading: 45,
    course: 45,
    destination: 'FISHING GROUND',
    flag: '🇳🇴',
    length: 42,
    beam: 10
  },
  {
    mmsi: '265789012',
    name: 'ODEN',
    type: 'research',
    lat: 78.3200,
    lng: 15.3000,
    speed: 10.5,
    heading: 135,
    course: 135,
    destination: 'NY-ÅLESUND',
    eta: '2026-03-09 16:45',
    flag: '🇸🇪',
    length: 108,
    beam: 31
  },
  {
    mmsi: '257890123',
    name: 'COASTAL SUPPLY',
    type: 'cargo',
    lat: 78.2350,
    lng: 15.6500,
    speed: 0,
    heading: 180,
    course: 0,
    destination: 'LONGYEARBYEN',
    flag: '🇳🇴',
    length: 75,
    beam: 14
  }
];

interface AISOverlayProps {
  vessels: AISVessel[];
  ownVessel: { lat: number; lng: number; speed: number; heading: number };
  onVesselClick?: (vessel: AISVessel) => void;
  selectedVessel?: string | null;
}

export function AISOverlay({ vessels, ownVessel, onVesselClick, selectedVessel }: AISOverlayProps) {
  const calculateCPA = (vessel: AISVessel) => {
    // Simple CPA calculation (simplified for demo)
    const dx = vessel.lng - ownVessel.lng;
    const dy = vessel.lat - ownVessel.lat;
    const distance = Math.sqrt(dx * dx + dy * dy) * 60; // Convert to nautical miles (rough)
    
    // If vessel is stationary or very slow
    if (vessel.speed < 0.5) {
      return { cpa: distance.toFixed(1), tcpa: '---' };
    }
    
    // Very simplified CPA/TCPA (would need proper vector math in production)
    const relSpeed = Math.abs(ownVessel.speed - vessel.speed);
    const tcpa = relSpeed > 0.1 ? (distance / relSpeed * 60).toFixed(0) : '---'; // minutes
    
    return { cpa: distance.toFixed(1), tcpa };
  };

  const getVesselTypeIcon = (type: string) => {
    switch (type) {
      case 'passenger':
        return '🚢';
      case 'cargo':
        return '📦';
      case 'tanker':
        return '🛢️';
      case 'fishing':
        return '🎣';
      case 'research':
        return '🔬';
      default:
        return '⚓';
    }
  };

  const getVesselTypeColor = (type: string) => {
    switch (type) {
      case 'passenger':
        return 'text-cyan-400';
      case 'cargo':
        return 'text-amber-400';
      case 'tanker':
        return 'text-red-400';
      case 'fishing':
        return 'text-green-400';
      case 'research':
        return 'text-purple-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-3">
      {vessels.map((vessel) => {
        const { cpa, tcpa } = calculateCPA(vessel);
        const isSelected = selectedVessel === vessel.mmsi;
        
        return (
          <div
            key={vessel.mmsi}
            onClick={() => onVesselClick?.(vessel)}
            className={`bg-slate-900/60 backdrop-blur-sm border rounded-lg p-3 cursor-pointer transition-all ${
              isSelected
                ? 'border-cyan-500 bg-cyan-500/10'
                : 'border-slate-700/50 hover:border-cyan-500/50 hover:bg-slate-800/60'
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{getVesselTypeIcon(vessel.type)}</span>
                <div>
                  <div className="text-sm font-bold text-white">{vessel.name}</div>
                  <div className="text-[10px] text-gray-400 uppercase tracking-wide">
                    {vessel.type} {vessel.flag && `• ${vessel.flag}`}
                  </div>
                </div>
              </div>
              {vessel.speed > 0.5 && (
                <div className="flex items-center gap-1 text-green-400">
                  <Navigation className="w-3 h-3" />
                  <span className="text-xs font-mono">{vessel.speed.toFixed(1)} kts</span>
                </div>
              )}
            </div>

            {/* Position & Course */}
            <div className="grid grid-cols-2 gap-2 mb-2 text-[10px]">
              <div>
                <span className="text-gray-500">Position:</span>
                <div className="text-gray-300 font-mono">
                  {vessel.lat.toFixed(4)}°N
                  <br />
                  {vessel.lng.toFixed(4)}°E
                </div>
              </div>
              <div>
                <span className="text-gray-500">HDG/COG:</span>
                <div className="text-gray-300 font-mono">
                  {vessel.heading.toString().padStart(3, '0')}° / {vessel.course.toString().padStart(3, '0')}°
                </div>
              </div>
            </div>

            {/* CPA/TCPA */}
            <div className="flex items-center justify-between py-2 border-t border-slate-700/30">
              <div className="text-[10px]">
                <span className="text-gray-500">CPA:</span>
                <span className={`ml-1 font-mono ${parseFloat(cpa) < 2 ? 'text-amber-400 font-bold' : 'text-gray-300'}`}>
                  {cpa} nm
                </span>
              </div>
              <div className="text-[10px]">
                <span className="text-gray-500">TCPA:</span>
                <span className="ml-1 text-gray-300 font-mono">
                  {tcpa !== '---' ? `${tcpa} min` : '---'}
                </span>
              </div>
              {vessel.destination && (
                <div className="text-[10px]">
                  <span className="text-gray-500">Dest:</span>
                  <span className="ml-1 text-gray-300 uppercase">
                    {vessel.destination.slice(0, 8)}
                  </span>
                </div>
              )}
            </div>

            {/* ETA if available */}
            {vessel.eta && vessel.speed > 0.5 && (
              <div className="text-[9px] text-gray-500 mt-1 pt-1 border-t border-slate-700/20">
                ETA: {vessel.eta}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
